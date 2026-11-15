#!/usr/bin/env node
/**
 * Figma 파일의 특정 노드 아래 화면(프레임)들을 PNG로 내보내고, 텍스트·색상·폰트·크기 요약을 만듭니다.
 * 디자인을 코드로 옮기기 전에 참고 자료를 뽑는 용도입니다. (의존성 없음, Node 18+)
 *
 * 사용법:
 *   FIGMA_TOKEN=figd_xxx node scripts/figma/export-frames.mjs \
 *     [--file QEY1wT6crNHdbZ7CUydKuw] [--node 253-396] [--out design/figma] [--scale 2]
 *
 * 토큰: Figma → Settings → Security → Personal access tokens (scope: File content → Read)
 *
 * 결과:
 *   <out>/NN-<프레임이름>.png   화면 이미지
 *   <out>/frames.json           프레임별 크기, 텍스트, 색상, 폰트 (기계용)
 *   <out>/README.md             같은 내용 요약 (사람용)
 *   <out>/nodes.json            Figma API 원본 응답 (상세 값 확인용)
 */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : fallback;
};

const fileKey = opt('--file', 'QEY1wT6crNHdbZ7CUydKuw');
const nodeId = opt('--node', '253-396').replace('-', ':');
const outDir = path.resolve(opt('--out', 'design/figma'));
const scale = Number(opt('--scale', '2'));
const token = process.env.FIGMA_TOKEN;

if (!token) {
  console.error('FIGMA_TOKEN 환경변수가 없습니다. Figma 개인 액세스 토큰을 발급해 넣어 주세요.');
  process.exit(1);
}

async function figma(url) {
  const res = await fetch(`https://api.figma.com/v1${url}`, { headers: { 'X-Figma-Token': token } });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`GET ${url} → ${res.status}: ${json.err || json.message || ''}`);
  return json;
}

const toHex = (c) =>
  '#' + [c.r, c.g, c.b].map((v) => Math.round(v * 255).toString(16).padStart(2, '0')).join('').toUpperCase();

// 서브트리를 돌며 텍스트/색상/폰트/모서리 수집
function collect(node, acc) {
  if (node.type === 'TEXT' && node.characters) {
    acc.texts.push(node.characters.replace(/\s+/g, ' ').trim());
    const s = node.style || {};
    if (s.fontFamily) {
      const key = `${s.fontFamily} ${s.fontWeight || ''} ${s.fontSize ? Math.round(s.fontSize) + 'px' : ''}`.trim();
      acc.fonts[key] = (acc.fonts[key] || 0) + 1;
    }
  }
  for (const fill of node.fills || []) {
    if (fill.type === 'SOLID' && fill.visible !== false && fill.color) {
      const hex = toHex(fill.color);
      acc.colors[hex] = (acc.colors[hex] || 0) + 1;
    }
  }
  if (typeof node.cornerRadius === 'number' && node.cornerRadius > 0) {
    acc.radii[node.cornerRadius] = (acc.radii[node.cornerRadius] || 0) + 1;
  }
  for (const child of node.children || []) collect(child, acc);
}

const top = (obj, n = 12) => Object.entries(obj).sort((a, b) => b[1] - a[1]).slice(0, n).map(([k, v]) => `${k} (${v})`);
const safe = (s) => s.replace(/[^\w가-힣.-]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 60) || 'frame';

await mkdir(outDir, { recursive: true });

console.log(`노드 트리 가져오는 중: file=${fileKey} node=${nodeId}`);
const nodesRes = await figma(`/files/${fileKey}/nodes?ids=${encodeURIComponent(nodeId)}`);
await writeFile(path.join(outDir, 'nodes.json'), JSON.stringify(nodesRes, null, 2));

const root = nodesRes.nodes[nodeId]?.document;
if (!root) {
  console.error(`노드 ${nodeId} 를 찾지 못했습니다. URL 의 node-id 값을 확인하세요.`);
  process.exit(1);
}
console.log(`루트: ${root.name} (${root.type}), 파일명: ${nodesRes.name}`);

// 루트가 페이지/섹션이면 그 아래 프레임들을, 프레임이면 자기 자신을 화면으로 본다
const containerTypes = new Set(['CANVAS', 'SECTION', 'GROUP']);
const screenTypes = new Set(['FRAME', 'COMPONENT', 'COMPONENT_SET', 'INSTANCE', 'SECTION']);
let screens = containerTypes.has(root.type) || (root.type === 'FRAME' && (root.children || []).every((c) => screenTypes.has(c.type)) && root.children?.length > 1)
  ? (root.children || []).filter((c) => screenTypes.has(c.type))
  : [root];
if (screens.length === 0) screens = [root];

const frames = screens.map((s, idx) => {
  const acc = { texts: [], colors: {}, fonts: {}, radii: {} };
  collect(s, acc);
  const box = s.absoluteBoundingBox || {};
  return {
    index: idx + 1,
    id: s.id,
    name: s.name,
    type: s.type,
    width: Math.round(box.width || 0),
    height: Math.round(box.height || 0),
    layoutMode: s.layoutMode || null,
    texts: [...new Set(acc.texts)],
    colors: top(acc.colors),
    fonts: top(acc.fonts),
    radii: top(acc.radii, 6),
    file: `${String(idx + 1).padStart(2, '0')}-${safe(s.name)}.png`,
  };
});

console.log(`화면 ${frames.length}개 발견:`);
for (const f of frames) console.log(`  ${f.index}. ${f.name} ${f.width}×${f.height}`);

// PNG 내보내기 (10개씩)
for (let i = 0; i < frames.length; i += 10) {
  const batch = frames.slice(i, i + 10);
  const ids = batch.map((f) => f.id).join(',');
  const img = await figma(`/images/${fileKey}?ids=${encodeURIComponent(ids)}&format=png&scale=${scale}`);
  for (const f of batch) {
    const url = img.images?.[f.id];
    if (!url) { console.warn(`  렌더 실패: ${f.name}`); continue; }
    const res = await fetch(url);
    const buf = Buffer.from(await res.arrayBuffer());
    await writeFile(path.join(outDir, f.file), buf);
    console.log(`  저장: ${f.file} (${Math.round(buf.length / 1024)} KB)`);
  }
}

await writeFile(path.join(outDir, 'frames.json'), JSON.stringify({ file: nodesRes.name, root: { id: root.id, name: root.name, type: root.type }, frames }, null, 2));

const md = [
  `# Figma 내보내기: ${nodesRes.name}`,
  '',
  `루트 노드: ${root.name} (${root.type}, ${root.id})`,
  '',
  '| # | 화면 | 크기 | 파일 |',
  '| --- | --- | --- | --- |',
  ...frames.map((f) => `| ${f.index} | ${f.name} | ${f.width}×${f.height} | ${f.file} |`),
  '',
  ...frames.flatMap((f) => [
    `## ${f.index}. ${f.name} (${f.width}×${f.height})`,
    '',
    `- 색상: ${f.colors.join(', ') || '-'}`,
    `- 폰트: ${f.fonts.join(', ') || '-'}`,
    `- 모서리: ${f.radii.join(', ') || '-'}`,
    `- 텍스트: ${f.texts.map((t) => `"${t}"`).join(' · ') || '-'}`,
    '',
  ]),
].join('\n');
await writeFile(path.join(outDir, 'README.md'), md);
console.log(`완료: ${outDir}`);
