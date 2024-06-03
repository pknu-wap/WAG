import { FullLayoutProps } from "../../types/common";

function FullLayout({ className, children }: FullLayoutProps) {
  let combinedClassName =
    "m-auto text-center text-light-text dark:text-dark-text ";
  return <div className={`${className} ${combinedClassName}`}>{children}</div>;
}

export default FullLayout;
