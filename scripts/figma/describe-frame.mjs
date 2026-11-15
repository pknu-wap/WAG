#!/usr/bin/env node
/**
 * nodes.json 에서 프레임 하나를 골라 레이아웃 트리를 텍스트로 출력합니다. (이미지 없이 디자인 스펙을 읽는 용도)
 *   node scripts/figma/describe-frame.mjs --nodes design/figma/nodes.json 256:12444 [--depth 6] [--min 8]
 * 각 줄: 들여쓰기 = 깊이, [타입] 이름  x,y w×h (프레임 기준 좌표)  fill:#HEX  r:모서리  "텍스트" font
 */
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const args = process.argv.slice(2);
const opt = (n, f) => { const i = args.indexOf(n); return i >= 0 && args[i + 1] ? args[i + 1] : f; };
const nodesPath = opt('--nodes', 'design/figma/nodes.json');
const maxDepth = Number(opt('--depth', '7'));
const minSize = Number(opt('--min', '6'));
const ids = args.filter((a) => /^\d+[:-]\d+$/.test(a)).map((a) => a.replace('-', ':'));
const data = JSON.parse(await readFile(path.resolve(nodesPath), 'utf8'));

const index = {};
const walk = (n) => { index[n.id] = n; (n.children || []).forEach(walk); };
Object.values(data.nodes).forEach((n) => walk(n.document));

const hex = (c, a) => '#' + [c.r, c.g, c.b].map((v) => Math.round(v * 255).toString(16).padStart(2, '0')).join('').toUpperCase() + (a !== undefined && a < 1 ? `@${Math.round(a * 100)}%` : '');
const fillOf = (n) => (n.fills || []).filter((f) => f.visible !== false).map((f) => f.type === 'SOLID' ? hex(f.color, f.opacity ?? f.color.a) : f.type).join(',');
const strokeOf = (n) => (n.strokes || []).filter((f) => f.visible !== false && f.type === 'SOLID').map((f) => hex(f.color)).join(',');

function describe(n, origin, depth, out) {
  const b = n.absoluteBoundingBox;
  if (!b) return;
  if (depth > 0 && (b.width < minSize || b.height < minSize)) return;
  if (n.visible === false) return;
  const x = Math.round(b.x - origin.x), y = Math.round(b.y - origin.y);
  let line = `${'  '.repeat(depth)}[${n.type}] ${n.name}  ${x},${y} ${Math.round(b.width)}×${Math.round(b.height)}`;
  const f = fillOf(n); if (f) line += `  fill:${f}`;
  const s = strokeOf(n); if (s) line += `  stroke:${s}/${n.strokeWeight ?? ''}`;
  if (typeof n.cornerRadius === 'number' && n.cornerRadius) line += `  r:${n.cornerRadius}`;
  if (n.rectangleCornerRadii) line += `  r:[${n.rectangleCornerRadii.join('/')}]`;
  if (n.layoutMode) line += `  layout:${n.layoutMode} gap:${n.itemSpacing ?? 0} pad:${[n.paddingTop, n.paddingRight, n.paddingBottom, n.paddingLeft].map((v) => v ?? 0).join('/')}`;
  if (n.opacity !== undefined && n.opacity < 1) line += `  opacity:${n.opacity}`;
  if ((n.effects || []).some((e) => e.type === 'DROP_SHADOW' && e.visible !== false)) line += '  shadow';
  if (n.type === 'TEXT') {
    const st = n.style || {};
    line += `  "${(n.characters || '').replace(/\n/g, '⏎')}"  ${st.fontFamily} ${st.fontWeight} ${Math.round(st.fontSize)}px ${st.textAlignHorizontal || ''}`;
  }
  out.push(line);
  if (depth >= maxDepth) return;
  (n.children || []).forEach((c) => describe(c, origin, depth + 1, out));
}

for (const id of ids) {
  const n = index[id];
  if (!n) { console.log(`\n### ${id}: not found`); continue; }
  const out = [];
  describe(n, { x: n.absoluteBoundingBox.x, y: n.absoluteBoundingBox.y }, 0, out);
  console.log(`\n### ${id} ${n.name}\n` + out.join('\n'));
}
