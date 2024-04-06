import { ReactNode } from "react";

type Size = "sm" | "md" | "lg";

interface ButtonProps {
  type?: "button" | undefined; // type이 undefined인 경우에는 'button'으로 지정
  size: Size;
  className?: string; // 추가로 적용하고 싶은 className이 있을 경우 사용
  onClick?: () => void;
  children: ReactNode; // children 속성에는 string 뿐만 아니라 <svg> 요소가 포함될 수도 있어서 ReactNode 타입을 사용했다.
}

const Button = ({ type, size, className, onClick, children }: ButtonProps) => {
  let combinedClassName =
    "rounded-xl font-extrabold bg-light-btn min-w-44 shadow-xl hover:shadow-2xl hover:bg-light-btn_hover active:bg-light-btn dark:hover:bg-dark-btn_hover dark:active:bg-dark-btn dark:bg-dark-btn"; // 이 변수에 className을 중첩시킨다.

  switch (size) {
    case "sm": {
      combinedClassName += " w-1/5 h-12 text-base";
      break;
    }
    case "md": {
      combinedClassName += " w-1/4 h-12 text-lg";
      break;
    }
    case "lg": {
      combinedClassName += " w-1/3 h-16 text-2xl font-black";
      break;
    }
    default: {
      combinedClassName += " w-1/4 h-12 text-lg";
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

export default Button;
