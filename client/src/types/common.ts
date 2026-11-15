import { ReactNode } from 'react';

// 테마
export type useDark = [boolean, (text: string) => void];

// FullLayout
export interface FullLayoutProps {
  className?: string;
  children: ReactNode;
}
