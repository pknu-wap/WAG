export const ALL_CATEGORY = '전체';

/** 서버 카테고리 문자열("전체" | "lol,한국위인") → 선택 목록 (전체면 빈 배열) */
export function parseCategories(category: string | undefined | null): string[] {
  if (!category || category.trim() === ALL_CATEGORY) return [];
  return category
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s !== '' && s !== ALL_CATEGORY);
}

/** 선택 목록 → 서버 카테고리 문자열 */
export function joinCategories(selected: string[]): string {
  return selected.length === 0 ? ALL_CATEGORY : selected.join(',');
}

/** 화면 표시용: "전체" 또는 "lol, 한국위인" */
export function formatCategories(category: string | undefined | null): string {
  const list = parseCategories(category);
  return list.length === 0 ? ALL_CATEGORY : list.join(', ');
}

/** 서버 응답 목록이 비어 있을 때 쓰는 기본 카테고리 */
export const FALLBACK_CATEGORIES = ['lol', '한국위인', '유명인', '애니메이션 캐릭터'];
