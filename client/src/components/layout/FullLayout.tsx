import { ReactNode } from "react";

interface FullLayoutProps {
  className?: string;
  children: ReactNode;
}

function FullLayout({ className, children }: FullLayoutProps) {
  let combinedClassName = "text-center text-light-text dark:text-dark-text";
  return <div className={`${combinedClassName} ${className}`}>{children}</div>;
}

export default FullLayout;
