import { useEffect, useState } from 'react';

/** 이 너비 이하는 모바일 레이아웃 (참가자 슬라이더, 버튼 순서 등) */
export const MOBILE_MAX_WIDTH = 639; // Tailwind `sm` 브레이크포인트(640px) 와 맞춤

/** 현재 뷰포트 너비. resize 에 따라 갱신됩니다. */
export function useViewportWidth(): number {
  const [width, setWidth] = useState(() => window.innerWidth);

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return width;
}
