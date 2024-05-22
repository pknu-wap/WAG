import { useCallback, useRef, useState } from 'react';

export interface TimerHookProps {
  time: number;
  startTimer: () => void;
  stopTimer: () => void;
  resetTimer: () => void;
}

export const INITIAL_TIME = 10;
export const ONE_SECOND = 1000; // ms

function useTimer(): TimerHookProps {
  const [time, setTime] = useState<number>(INITIAL_TIME);
  const intervalRef: { current: NodeJS.Timeout | null } = useRef(null);


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
    setTime(INITIAL_TIME);
  }, []);
  
  return { time, startTimer, stopTimer, resetTimer };
}

export default useTimer;