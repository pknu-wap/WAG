import { useCallback, useEffect, useRef, useState } from 'react';
import { useRecoilState } from 'recoil';
import { ingameTimerCount } from '../../recoil/recoil';

export interface TimerHookProps {
  time: number;
  startTimer: () => void;
  stopTimer: () => void;
  resetTimer: () => void;
}
//export const INITIAL_TIME = 30;
export const ONE_SECOND = 1000; // ms

function useTimer(): TimerHookProps {
  
  const [ingameTimerCountState] = useRecoilState(ingameTimerCount);
  const initialTimeRef = useRef(ingameTimerCountState); // initialTimeRef를 사용하여 초기값 저장
  const [time, setTime] = useState<number>(initialTimeRef.current);
  const intervalRef: { current: NodeJS.Timeout | null } = useRef(null);
  useEffect(() => {
    initialTimeRef.current = ingameTimerCountState;
    setTime(initialTimeRef.current);
  }, [ingameTimerCountState]);


  //타이머 시작하는 함수
  const startTimer = useCallback(() => {  
    if (intervalRef.current !== null) return;

    intervalRef.current = setInterval(() => {
      setTime(time => time - 1);
    }, ONE_SECOND);
  }, []);

  //타이머 멈추는 함수
  const stopTimer = useCallback(() => {
    if (intervalRef.current === null) return;

    clearInterval(intervalRef.current);
    intervalRef.current = null;
  }, []);
  
  //타이머 재시작하는 함수
  const resetTimer = useCallback(() => {
    setTime(initialTimeRef.current);
  }, []);
  
  return { time, startTimer, stopTimer, resetTimer };
}

export default useTimer;