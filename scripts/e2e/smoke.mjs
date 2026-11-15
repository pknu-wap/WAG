// WAG 스모크 테스트: 헤드리스 Chrome 두 개(PC 방장, 모바일 참가자)로 게임을 끝까지 돌립니다.
//
//   사전 조건: 로컬에 MySQL + Kafka + 백엔드(8080) + 프론트(3000)가 떠 있어야 합니다 (docs/ARCHITECTURE.md 10장).
//   실행:      cd scripts/e2e && npm install && npm run smoke
//   환경변수:  CHROME_PATH (크롬 실행 파일), APP_URL (기본 http://localhost:3000), API_URL (기본 http://localhost:8080)
//   결과:      scripts/e2e/shots/*.png 스크린샷, errors.txt 콘솔 에러
//
//  A. 일반 모드: 방 생성(커스텀 OFF, 카테고리 2개 선택) → 코드 입장 → 채팅 → 레디 → 시작 → 질문/답변 → 경고 → 2라운드 → 정답 모달 → 결과 → 재시작
//  B. 서로 이름 지어주기: 재시작한 방에서 방장 설정으로 커스텀 ON → 시작 → 제시어 입력 모달 → 게임 시작 → 상대 정답어가 내가 적은 값인지 확인
import puppeteer from 'puppeteer-core';
import { writeFile, mkdir } from 'node:fs/promises';

const CHROME = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const APP = process.env.APP_URL || 'http://localhost:3000';
const API = process.env.API_URL || 'http://localhost:8080';
const OUT = new URL('./shots/', import.meta.url).pathname;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);

const errors = [];
function watch(page, name) {
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`[${name}] console.error: ${m.text().split('\n')[0]}`);
  });
  page.on('pageerror', (e) => errors.push(`[${name}] pageerror: ${e.message}`));
}

async function clickByText(page, selector, text, { exact = false } = {}) {
  const ok = await page.evaluate(
    (selector, text, exact) => {
      const els = [...document.querySelectorAll(selector)].filter((e) => !e.disabled && (e.offsetWidth || e.offsetHeight));
      const el = els.find((e) => (exact ? e.textContent.trim() === text : e.textContent.trim().includes(text)));
      if (!el) return false;
      el.click();
      return true;
    },
    selector,
    text,
    exact
  );
  if (!ok) throw new Error(`클릭 대상 없음: ${selector} "${text}"`);
}

async function waitForText(page, text, timeout = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const has = await page.evaluate((t) => document.body.innerText.includes(t), text);
    if (has) return;
    await sleep(250);
  }
  throw new Error(`"${text}" 가 ${timeout}ms 안에 나타나지 않음`);
}
const bodyText = (page) => page.evaluate(() => document.body.innerText);
const shot = (page, name) => page.screenshot({ path: `${OUT}${name}.png`, fullPage: true });

async function typeInto(page, selector, text, enter = true) {
  await page.waitForSelector(selector, { visible: true, timeout: 10000 });
  await page.click(selector, { clickCount: 3 });
  await page.type(selector, text);
  if (enter) await page.keyboard.press('Enter');
}

async function clickSel(page, selector) {
  const ok = await page.evaluate((sel) => { const el = document.querySelector(sel); if (!el) return false; el.click(); return true; }, selector);
  if (!ok) throw new Error(`클릭 대상 없음: ${selector}`);
}

async function showAvatar(page, name) {
  for (let i = 0; i < 6; i += 1) {
    const visible = await page.evaluate((n) => {
      const el = document.querySelector(`button[aria-label="${n}에게 경고 주기"]`);
      return !!el && (el.offsetWidth > 0 || el.offsetHeight > 0);
    }, name);
    if (visible) return;
    const moved = await page.evaluate(() => { const b = document.querySelector('button[aria-label="다음 참가자"]'); if (!b) return false; b.click(); return true; });
    if (!moved) break;
    await sleep(200);
  }
}

async function isAsker(page) {
  return (await page.$('input[placeholder="질문을 시작하세요"]')) !== null;
}

async function waitRound(page, round, timeout = 100000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const t = await bodyText(page);
    const m = t.match(/현재\s*\n?라운드\s*\n?(\d+)/);
    if (m && Number(m[1]) >= round) return;
    await sleep(1000);
  }
  throw new Error(`${round}라운드에 도달하지 못함`);
}

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'] });
try {
  await mkdir(OUT, { recursive: true });

  /* ================= A. 일반 모드 ================= */
  const host = await browser.newPage();
  await host.setViewport({ width: 1440, height: 900 });
  watch(host, 'host');
  await host.goto(APP, { waitUntil: 'networkidle2' });
  await waitForText(host, '방 생성');
  await shot(host, 'A01-main-pc');
  await clickByText(host, 'button', '방 생성');
  await waitForText(host, '방 만들기');
  // 커스텀 OFF → 카테고리 드롭다운에서 2개 선택
  await clickByText(host, 'button[role="switch"]', 'ON');
  await waitForText(host, '복수선택가능');
  await host.click('button[aria-haspopup="listbox"]');
  await clickByText(host, 'li[role="option"]', 'lol', { exact: true });
  await clickByText(host, 'li[role="option"]', '한국위인', { exact: true });
  await shot(host, 'A02-create-room-categories');
  await host.keyboard.press('Escape');
  await host.click('body');
  await typeInto(host, 'input[placeholder="닉네임을 입력해주세요"]', 'host1', false);
  await shot(host, 'A03-create-room-filled');
  await clickByText(host, 'button', '공개방 생성');
  await waitForText(host, '입장코드', 15000);
  await sleep(1500);
  const code = (await bodyText(host)).match(/입장코드\s*\n?\s*(\d{4})/)?.[1];
  if (!code) throw new Error('입장코드를 못 읽음');
  const roomId = await host.evaluate(() => localStorage.getItem('roomId'));
  log('방 생성 완료, 입장코드', code, 'roomId', roomId);
  const info = await (await fetch(`${API}/room/info?roomId=${roomId}`)).json();
  log('서버 방 정보: category =', info.category, '| customMode =', info.customMode);
  if (info.category !== 'lol,한국위인' || info.customMode !== false) throw new Error('방 생성 옵션이 서버에 반영되지 않음');
  await waitForText(host, '카테고리 : lol, 한국위인');
  await shot(host, 'A04-lobby-host-pc');

  const ctx = await browser.createBrowserContext();
  const guest = await ctx.newPage();
  await guest.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  watch(guest, 'guest');
  await guest.goto(APP, { waitUntil: 'networkidle2' });
  await shot(guest, 'A05-main-mobile');
  await clickByText(guest, 'button', '입장코드 입력');
  await waitForText(guest, '입장코드 형식');
  await typeInto(guest, 'input[placeholder="입장코드를 숫자로 입력해주세요"]', code, false);
  await shot(guest, 'A06-code-modal-mobile');
  await clickByText(guest, 'button', '드가자');
  await typeInto(guest, 'input[placeholder="닉네임을 입력해주세요"]', 'guest1', false);
  await clickByText(guest, 'button', '닉네임 확인');
  await waitForText(guest, '사용 가능!');
  await shot(guest, 'A07-join-modal-mobile');
  await clickByText(guest, 'button', '드가자');
  await waitForText(guest, '게임 대기 중');
  await waitForText(host, 'guest1', 10000);
  await waitForText(guest, '2/6', 10000); // 모바일은 아바타를 한 명씩 보여주므로 인원수로 확인
  log('참가자 입장 완료');

  await typeInto(host, 'input[placeholder="채팅 메시지를 입력해주세요"]', '안녕하세요 대기방 채팅');
  await waitForText(guest, '안녕하세요 대기방 채팅');
  log('대기방 채팅 전달 확인');
  await shot(host, 'A08-lobby-chat-pc');
  await shot(guest, 'A09-lobby-chat-mobile');

  await clickByText(guest, 'button', '준비 완료');
  await waitForText(host, '모든 사용자 게임 준비 완료', 10000);
  await clickByText(host, 'button', '게임 시작');
  await waitForText(host, '5초 뒤에 게임이 시작됩니다');
  log('START 수신');
  await sleep(6500);
  const hostAsks = await isAsker(host);
  const asker = hostAsks ? host : guest;
  const answerer = hostAsks ? guest : host;
  const askerName = hostAsks ? 'host1' : 'guest1';
  log('1라운드 질문자:', askerName);
  await shot(host, 'A10-game-pc');
  await shot(guest, 'A11-game-mobile');

  await typeInto(asker, 'input[placeholder="질문을 시작하세요"]', '사람인가요?');
  await waitForText(answerer, '사람인가요?');
  await typeInto(answerer, 'input[placeholder="답변을 시작하세요"]', '네 사람입니다');
  await waitForText(asker, '네 사람입니다');
  log('질문/답변 전달 확인');

  // 경고: 답변자가 질문자 아바타 → 팝오버 → 경고 주기 (모바일은 캐러셀을 넘겨 상대 아바타를 먼저 보이게)
  await showAvatar(answerer, askerName);
  await clickSel(answerer, `button[aria-label="${askerName}에게 경고 주기"]`); // 토스트가 덮고 있어도 되도록 DOM 클릭
  await sleep(400);
  await clickByText(answerer, 'button', '경고 주기');
  await waitForText(asker, '경고를 받았습니다', 5000);
  log('경고 전달 확인');
  await shot(asker, 'A12-penalty');

  // 1라운드에는 정답 버튼이 잠겨 있어야 함
  const lockedText = await bodyText(asker);
  if (!lockedText.includes('2라운드부터 입력 가능!')) throw new Error('1라운드 정답 버튼 안내 문구가 없음');

  log('2라운드까지 대기…');
  await waitRound(host, 2);
  const asker2 = (await isAsker(host)) ? host : guest;
  const asker2Name = asker2 === host ? 'host1' : 'guest1';
  const other2Name = asker2 === host ? 'guest1' : 'host1';
  const list = await (await fetch(`${API}/answer/list?roomId=${roomId}&nickname=${encodeURIComponent(other2Name)}`)).json();
  const answer = list.answerUserDtos.find((a) => a.nickname === asker2Name)?.answer;
  log('2라운드 질문자:', asker2Name, '/ 정답어:', answer);

  await clickByText(asker2, 'button', '정답 맞추기');
  await waitForText(asker2, '정답을 입력해주세요');
  await shot(asker2, 'A13-answer-modal');
  await typeInto(asker2, 'input[placeholder="정답을 입력하세요"]', answer, false);
  await clickByText(asker2, 'button', '정답 확인하기');
  await waitForText(asker2, '정답을 외쳤습니다!', 8000);
  await shot(asker2, 'A14-answer-result');
  log('정답 모달 결과 확인');
  await sleep(6500);
  await waitForText(asker2, '1등', 5000);
  await waitForText(asker2, '재시작하기', 5000);
  await shot(host, 'A15-result-pc');
  await shot(guest, 'A16-result-mobile');
  log('결과 화면 확인');

  await clickByText(host, 'button', '재시작하기');
  await waitForText(host, '게임 대기 중', 8000);
  await clickByText(guest, 'button', '재시작하기');
  await waitForText(guest, '게임 대기 중', 8000);
  log('재시작 → 대기방 복귀');

  /* ================= B. 서로 이름 지어주기 ================= */
  await host.click('button[aria-label="방 설정"]');
  await waitForText(host, '방장 기능');
  await shot(host, 'B01-host-settings');
  await clickByText(host, 'button[role="switch"]', 'OFF');
  await clickByText(host, 'button', '변경', { exact: true });
  await waitForText(host, '서로 이름 지어주기가 켜졌습니다', 8000);
  await waitForText(guest, '서로 이름 지어주기', 8000);
  const info2 = await (await fetch(`${API}/room/info?roomId=${roomId}`)).json();
  if (info2.customMode !== true) throw new Error('customMode 가 서버에 반영되지 않음');
  log('커스텀 모드 ON 반영 확인');
  await shot(host, 'B02-lobby-custom-pc');

  await clickByText(guest, 'button', '준비 완료');
  await waitForText(host, '모든 사용자 게임 준비 완료', 10000);
  await clickByText(host, 'button', '게임 시작');
  await waitForText(host, '님의 제시어를 정해주세요!', 10000);
  await waitForText(guest, '님의 제시어를 정해주세요!', 10000);
  log('NAMING 모달 표시 확인');
  await shot(host, 'B03-naming-modal-pc');
  await shot(guest, 'B04-naming-modal-mobile');
  await typeInto(host, 'input[placeholder="제시어를 입력해주세요"]', '피카츄');
  await waitForText(host, '제시어 입력 완료!');
  await waitForText(guest, '남은 인원 1명', 5000);
  await shot(host, 'B05-naming-submitted');
  await typeInto(guest, 'input[placeholder="제시어를 입력해주세요"]', '이순신');
  await waitForText(host, '5초 뒤에 게임이 시작됩니다', 8000);
  log('전원 입력 → START 수신');
  await sleep(6500);
  const listB = await (await fetch(`${API}/answer/list?roomId=${roomId}&nickname=host1`)).json();
  const guestAnswer = listB.answerUserDtos.find((a) => a.nickname === 'guest1')?.answer;
  log('host 가 보는 guest 의 정답어:', guestAnswer);
  if (guestAnswer !== '피카츄') throw new Error(`host 가 정한 제시어가 guest 에게 배정되지 않음: ${guestAnswer}`);
  const listB2 = await (await fetch(`${API}/answer/list?roomId=${roomId}&nickname=guest1`)).json();
  const hostAnswer = listB2.answerUserDtos.find((a) => a.nickname === 'host1')?.answer;
  if (hostAnswer !== '이순신') throw new Error(`guest 가 정한 제시어가 host 에게 배정되지 않음: ${hostAnswer}`);
  await shot(host, 'B06-custom-game-pc');
  await shot(guest, 'B07-custom-game-mobile');
  log('서로 이름 지어주기 배정 확인');

  await writeFile(`${OUT}errors.txt`, errors.join('\n'));
  log(`끝. 콘솔/페이지 에러 ${errors.length}건`);
  if (errors.length) console.log(errors.join('\n'));
} catch (e) {
  console.error('실패:', e.message);
  try {
    const pages = await browser.pages();
    for (let i = 0; i < pages.length; i += 1) await pages[i].screenshot({ path: `${OUT}fail-${i}.png`, fullPage: true }).catch(() => {});
  } catch {}
  await writeFile(`${OUT}errors.txt`, errors.join('\n'));
  if (errors.length) console.log(errors.join('\n'));
  process.exitCode = 1;
} finally {
  await browser.close();
}
