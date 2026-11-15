import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { history } from '../../../shared';

/**
 * 게임방을 실수로 떠나지 않도록 새로고침/닫기 확인창을 띄우고, 뒤로가기를 막습니다.
 * @param active 방에 들어온 뒤(입장코드를 받은 뒤)에만 뒤로가기를 막음
 */
export function useLeaveGuard(active: boolean) {
  useEffect(() => {
    const preventClose = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', preventClose);
    return () => window.removeEventListener('beforeunload', preventClose);
  }, []);

  const { pathname } = useLocation();
  useEffect(() => {
    if (!active) return;
    return history.listen(({ action }) => {
      if (action === 'POP') history.push(pathname);
    });
  }, [active, pathname]);
}
