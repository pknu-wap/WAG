#!/usr/bin/env node
/**
 * Figma 노드 ID 목록을 개별 PNG 로 내보냅니다. (의존성 없음, Node 18+)
 *
 *   FIGMA_TOKEN=figd_xxx node scripts/figma/export-nodes.mjs --file QEY1wT6crNHdbZ7CUydKuw \
 *     --out design/figma/frames --scale 1 --nodes design/figma/nodes.json  253:2748 253:2709 ...
 *
 * --nodes 에 export-frames.mjs 가 만든 nodes.json 을 주면 파일 이름에 프레임 이름을 붙입니다.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : fallback;
};
const fileKey = opt('--file', 'QEY1wT6crNHdbZ7CUydKuw');
const outDir = path.resolve(opt('--out', 'design/figma/frames'));
const scale = Number(opt('--scale', '1'));
const nodesPath = opt('--nodes', '');
const token = process.env.FIGMA_TOKEN;
const ids = args.filter((a, i) => /^\d+[:-]\d+$/.test(a) && !['--file', '--out', '--scale', '--nodes'].includes(args[i - 1])).map((a) => a.replace('-', ':'));

if (!token) { console.error('FIGMA_TOKEN 환경변수가 없습니다.'); process.exit(1); }
if (!ids.length) { console.error('내보낼 노드 ID 를 하나 이상 지정하세요. 예: 253:2748'); process.exit(1); }

const names = {};
if (nodesPath) {
  const data = JSON.parse(await readFile(path.resolve(nodesPath), 'utf8'));
  const walk = (n, section) => {
    if (n.type === 'SECTION') section = n.name;
    names[n.id] = { name: n.name, section: section || '' };
    (n.children || []).forEach((c) => walk(c, section));
  };
  Object.values(data.nodes).forEach((n) => walk(n.document, ''));
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function figma(url) {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const res = await fetch(`https://api.figma.com/v1${url}`, { headers: { 'X-Figma-Token': token } });
    if (res.status === 429) {
      const wait = Math.max(Number(res.headers.get('retry-after') || 0), 20 * (attempt + 1)) * 1000;
      console.log(`rate limit, ${wait / 1000}s 대기…`);
      await sleep(wait);
      continue;
    }
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(`GET ${url} → ${res.status}: ${json.err || json.message || ''}`);
    return json;
  }
  throw new Error(`GET ${url}: rate limit 재시도 초과`);
}
const safe = (s) => s.replace(/[^\w가-힣.-]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 70) || 'node';

await mkdir(outDir, { recursive: true });
let n = 0;
for (let i = 0; i < ids.length; i += 10) {
  const batch = ids.slice(i, i + 10);
  if (i > 0) await sleep(4000);
  const img = await figma(`/images/${fileKey}?ids=${encodeURIComponent(batch.join(','))}&format=png&scale=${scale}`);
  for (const id of batch) {
    const url = img.images?.[id];
    if (!url) { console.warn(`렌더 실패: ${id}`); continue; }
    const buf = Buffer.from(await (await fetch(url)).arrayBuffer());
    const meta = names[id] || { name: id, section: '' };
    const file = `${safe(meta.section)}__${safe(meta.name)}__${id.replace(':', '-')}.png`;
    await writeFile(path.join(outDir, file), buf);
    n += 1;
    console.log(`저장: ${file} (${Math.round(buf.length / 1024)} KB)`);
  }
}
console.log(`완료: ${n}/${ids.length} → ${outDir}`);
