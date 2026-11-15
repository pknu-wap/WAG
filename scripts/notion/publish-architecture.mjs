#!/usr/bin/env node
/**
 * Markdown 문서를 Notion 페이지에 블록으로 올립니다. (의존성 없음, Node 18+)
 *
 * 사용법:
 *   NOTION_TOKEN=ntn_xxx node scripts/notion/publish-architecture.mjs \
 *     [--page 3fbdab79b2e380feb82fc6df087d0d28] [--file docs/ARCHITECTURE.md] [--replace] [--dry-run]
 *
 *   --replace   페이지에 이미 있는 블록을 모두 지우고 새로 씁니다 (기본은 맨 아래에 추가)
 *   --dry-run   Notion에 보내지 않고 변환 결과 요약만 출력합니다
 *
 * 준비:
 *   1. https://www.notion.so/my-integrations 에서 내부 통합(Internal integration) 생성 → 토큰 복사
 *   2. 대상 Notion 페이지 우상단 ··· → 연결(Connections) → 방금 만든 통합 추가
 *
 * 변환 규칙:
 *   #/##/### → heading_1/2/3, 문단 → paragraph, - / 1. → list item(들여쓴 하위 블록은 children),
 *   > → quote, | 표 | → table, ``` → code (mermaid 는 language=mermaid 로 올라가 Notion 이 도식으로 그림),
 *   --- → divider, 인라인 **굵게** `코드` [링크](url) 지원.
 */
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const NOTION_VERSION = '2022-06-28';
const DEFAULT_PAGE = '3fbdab79b2e380feb82fc6df087d0d28';
const DEFAULT_FILE = 'docs/ARCHITECTURE.md';
const MAX_TEXT = 2000; // rich_text 한 조각 최대 길이
const MAX_CHILDREN = 100; // 요청당 최대 블록 수

// ---------- 인자 ----------
const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : fallback;
};
const flag = (name) => args.includes(name);

const pageId = opt('--page', DEFAULT_PAGE).replace(/-/g, '');
const file = opt('--file', DEFAULT_FILE);
const replace = flag('--replace');
const dryRun = flag('--dry-run');
const token = process.env.NOTION_TOKEN;

// ---------- 인라인 서식 → rich_text ----------
function chunk(text, size = MAX_TEXT) {
  const out = [];
  for (let i = 0; i < text.length; i += size) out.push(text.slice(i, i + size));
  return out.length ? out : [''];
}

function textItem(content, annotations = {}, link) {
  return chunk(content).map((c) => ({
    type: 'text',
    text: { content: c, ...(link ? { link: { url: link } } : {}) },
    annotations: { bold: false, italic: false, strikethrough: false, underline: false, code: false, color: 'default', ...annotations },
  }));
}

function inline(md) {
  const items = [];
  const re = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
  let last = 0;
  let m;
  while ((m = re.exec(md)) !== null) {
    if (m.index > last) items.push(...textItem(md.slice(last, m.index)));
    const tok = m[0];
    if (tok.startsWith('**')) items.push(...textItem(tok.slice(2, -2), { bold: true }));
    else if (tok.startsWith('`')) items.push(...textItem(tok.slice(1, -1), { code: true }));
    else {
      const [, label, url] = tok.match(/\[([^\]]+)\]\(([^)]+)\)/);
      items.push(...textItem(label, {}, url));
    }
    last = m.index + tok.length;
  }
  if (last < md.length) items.push(...textItem(md.slice(last)));
  return items.filter((i) => i.text.content.length > 0);
}

// ---------- 블록 생성 ----------
const LANG = {
  bash: 'bash', sh: 'shell', zsh: 'shell', shell: 'shell', text: 'plain text', txt: 'plain text',
  properties: 'plain text', ini: 'plain text', env: 'plain text', yml: 'yaml', yaml: 'yaml', json: 'json',
  ts: 'typescript', tsx: 'typescript', typescript: 'typescript', js: 'javascript', mjs: 'javascript',
  javascript: 'javascript', java: 'java', sql: 'sql', mermaid: 'mermaid', html: 'html', css: 'css',
  dockerfile: 'docker', docker: 'docker', md: 'markdown', markdown: 'markdown',
};

const block = {
  heading: (level, text) => {
    const type = `heading_${Math.min(level, 3)}`;
    return { type, [type]: { rich_text: inline(text) } };
  },
  paragraph: (text) => ({ type: 'paragraph', paragraph: { rich_text: inline(text) } }),
  quote: (text) => ({ type: 'quote', quote: { rich_text: inline(text) } }),
  divider: () => ({ type: 'divider', divider: {} }),
  code: (code, lang) => ({
    type: 'code',
    code: { rich_text: textItem(code), language: LANG[(lang || '').toLowerCase()] || 'plain text' },
  }),
  list: (ordered, text, children) => {
    const type = ordered ? 'numbered_list_item' : 'bulleted_list_item';
    return { type, [type]: { rich_text: inline(text), ...(children?.length ? { children } : {}) } };
  },
  table: (rows) => {
    const width = Math.max(...rows.map((r) => r.length));
    return {
      type: 'table',
      table: {
        table_width: width,
        has_column_header: true,
        has_row_header: false,
        children: rows.map((cells) => ({
          type: 'table_row',
          table_row: { cells: Array.from({ length: width }, (_, i) => inline(cells[i] ?? '')) },
        })),
      },
    };
  },
};

// ---------- Markdown → 블록 (재귀: 들여쓴 하위 블록 지원) ----------
function splitTableRow(line) {
  return line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());
}

function parseBlocks(lines) {
  const blocks = [];
  let i = 0;
  const indentOf = (l) => l.match(/^\s*/)[0].length;

  while (i < lines.length) {
    const line = lines[i];
    const t = line.trim();

    if (t === '') { i += 1; continue; }

    // 코드 블록
    if (t.startsWith('```')) {
      const lang = t.slice(3).trim();
      const baseIndent = indentOf(line);
      const buf = [];
      i += 1;
      while (i < lines.length && lines[i].trim() !== '```') {
        buf.push(lines[i].slice(Math.min(baseIndent, indentOf(lines[i]))));
        i += 1;
      }
      i += 1; // closing ```
      blocks.push(block.code(buf.join('\n'), lang));
      continue;
    }

    // 제목
    const h = t.match(/^(#{1,6})\s+(.*)$/);
    if (h) { blocks.push(block.heading(h[1].length, h[2])); i += 1; continue; }

    // 구분선
    if (/^-{3,}$/.test(t)) { blocks.push(block.divider()); i += 1; continue; }

    // 인용
    if (t.startsWith('>')) {
      const buf = [];
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        buf.push(lines[i].trim().replace(/^>\s?/, ''));
        i += 1;
      }
      blocks.push(block.quote(buf.join('\n')));
      continue;
    }

    // 표
    if (t.startsWith('|')) {
      const rows = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        const cells = splitTableRow(lines[i]);
        if (!cells.every((c) => /^:?-{3,}:?$/.test(c))) rows.push(cells);
        i += 1;
      }
      blocks.push(block.table(rows));
      continue;
    }

    // 리스트 (하위 들여쓰기 블록은 children 으로)
    const li = line.match(/^(\s*)([-*]|\d+\.)\s+(.*)$/);
    if (li) {
      const indent = li[1].length;
      const ordered = /\d+\./.test(li[2]);
      const text = li[3];
      i += 1;
      const childLines = [];
      while (i < lines.length) {
        const next = lines[i];
        if (next.trim() === '') {
          // 빈 줄 뒤에 더 들여쓴 내용이 이어지면 같은 항목의 하위 블록
          const look = lines.slice(i + 1).find((l) => l.trim() !== '');
          if (look !== undefined && indentOf(look) > indent) { childLines.push(''); i += 1; continue; }
          break;
        }
        if (indentOf(next) > indent) { childLines.push(next.slice(indent + 2)); i += 1; continue; }
        break;
      }
      blocks.push(block.list(ordered, text, childLines.length ? parseBlocks(childLines) : []));
      continue;
    }

    // 문단: 다음 빈 줄/블록 시작 전까지 합침
    const buf = [t];
    i += 1;
    while (i < lines.length) {
      const n = lines[i];
      const nt = n.trim();
      if (nt === '' || nt.startsWith('```') || /^#{1,6}\s/.test(nt) || nt.startsWith('|') || nt.startsWith('>') || /^(\s*)([-*]|\d+\.)\s+/.test(n) || /^-{3,}$/.test(nt)) break;
      buf.push(nt);
      i += 1;
    }
    blocks.push(block.paragraph(buf.join('\n')));
  }
  return blocks;
}

// ---------- Notion API ----------
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function notion(method, url, body) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const res = await fetch(`https://api.notion.com/v1${url}`, {
      method,
      headers: { Authorization: `Bearer ${token}`, 'Notion-Version': NOTION_VERSION, 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (res.status === 429) {
      const wait = Number(res.headers.get('retry-after') || 1) * 1000;
      await sleep(wait);
      continue;
    }
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(`${method} ${url} → ${res.status} ${json.code || ''}: ${json.message || ''}`);
    return json;
  }
  throw new Error(`${method} ${url}: rate limit 재시도 초과`);
}

async function clearChildren(id) {
  let cursor;
  const ids = [];
  do {
    const q = cursor ? `?start_cursor=${cursor}&page_size=100` : '?page_size=100';
    const res = await notion('GET', `/blocks/${id}/children${q}`);
    ids.push(...res.results.map((b) => b.id));
    cursor = res.has_more ? res.next_cursor : undefined;
  } while (cursor);
  for (const bid of ids) {
    await notion('DELETE', `/blocks/${bid}`);
    await sleep(120);
  }
  return ids.length;
}

function summarize(blocks) {
  const count = {};
  for (const b of blocks) count[b.type] = (count[b.type] || 0) + 1;
  return Object.entries(count).map(([k, v]) => `${k}=${v}`).join(', ');
}

// ---------- 실행 ----------
const md = await readFile(path.resolve(file), 'utf8');
const blocks = parseBlocks(md.split(/\r?\n/));
console.log(`변환 완료: ${blocks.length} blocks (${summarize(blocks)})`);

if (dryRun) {
  const mermaid = blocks.filter((b) => b.type === 'code' && b.code.language === 'mermaid').length;
  console.log(`mermaid 도식 ${mermaid}개. --dry-run 이라 Notion에는 보내지 않았습니다.`);
  process.exit(0);
}

if (!token) {
  console.error('NOTION_TOKEN 환경변수가 없습니다. 통합 토큰을 만들고 페이지에 연결한 뒤 다시 실행하세요.');
  process.exit(1);
}

try {
  const page = await notion('GET', `/pages/${pageId}`);
  const title = page.properties?.title?.title?.map((t) => t.plain_text).join('') || '(제목 없음)';
  console.log(`대상 페이지: "${title}" (${page.url})`);
} catch (e) {
  console.error(`페이지에 접근할 수 없습니다: ${e.message}`);
  console.error('페이지 우상단 ··· → 연결(Connections) 에서 통합을 추가했는지 확인하세요.');
  process.exit(1);
}

if (replace) {
  const n = await clearChildren(pageId);
  console.log(`기존 블록 ${n}개 삭제`);
}

for (let i = 0; i < blocks.length; i += MAX_CHILDREN) {
  const batch = blocks.slice(i, i + MAX_CHILDREN);
  await notion('PATCH', `/blocks/${pageId}/children`, { children: batch });
  console.log(`업로드 ${Math.min(i + MAX_CHILDREN, blocks.length)}/${blocks.length}`);
  await sleep(350);
}
console.log('완료. Notion 페이지를 새로고침하면 도식이 렌더링됩니다.');
