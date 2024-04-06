import { ReactNode } from "react";

type Size = "sm" | "md" | "lg";

interface ButtonProps {
  type?: "button" | undefined; // type이 undefined인 경우에는 'button'으로 지정
  size: Size;
  className?: string; // 추가로 적용하고 싶은 className이 있을 경우 사용
  onClick?: () => void;
  children: ReactNode; // children 속성에는 string 뿐만 아니라 <svg> 요소가 포함될 수도 있어서 ReactNode 타입을 사용했다.
}

const IconButton = ({
  type,
  size,
  className,
  onClick,
  children,
}: ButtonProps) => {
  let combinedClassName =
    "p-2 px-3 rounded-full flex justify-center items-center text-light-text dark:text-dark-text bg-transparent shadow-xl hover:shadow-sm dark:shadow-xl dark:bg-transparent"; // 이 변수에 className을 중첩시킨다.

  switch (size) {
    case "sm": {
      combinedClassName += " w-12 h-12 rounded-full text-base";
      break;
    }
    case "md": {
      combinedClassName += " w-14 h-14 rounded-full text-lg";
      break;
    }
    case "lg": {
      combinedClassName += " w-16 h-16 rounded-full text-2xl font-black";
      break;
    }
    default: {
      combinedClassName += " w-14 h-14 rounded-full text-lg";
      break;
    }
  }

  return (
    <button
      type={type ? type : "button"}
      className={`${combinedClassName} ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default IconButton;
