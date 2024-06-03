import { ReactNode } from "react";

// 테마
export type useDark = [boolean, (text: string) => void];

// FullLayout
export interface FullLayoutProps {
  className?: string;
  children: ReactNode;
}

// button
type Size = "xs" | "sm" | "md" | "lg";

export interface ButtonProps {
  type?: "button" | undefined; // type이 undefined인 경우에는 'button'으로 지정
  size: Size;
  className?: string; // 추가로 적용하고 싶은 className이 있을 경우 사용
  onClick?: () => void;
  children: ReactNode; // children 속성에는 string 뿐만 아니라 <svg> 요소가 포함될 수도 있어서 ReactNode 타입을 사용했다.
  disabled?: boolean | undefined;
  isInput?: boolean; // input 옆 스타일 지정을 위해 만들었음
}

//Timer
export interface TimerProps {
  time: number;
}


//ReadyStartButoon
export interface ReadyStartButtonProps {
  myState: {
    isHost: boolean;
    isReady: boolean;
  };
  allReady: boolean;
  handleStart: () => void;
  handleReady: () => void;
}

export interface ProgressTimerProps {
  time: number;
  fulltime: number;
}

