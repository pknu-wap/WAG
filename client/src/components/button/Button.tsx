import { ButtonProps } from "../../types/common";

const Button = ({
  type,
  size,
  className,
  onClick,
  children,
  disabled,
}: ButtonProps) => {
  let combinedClassName = ""; // 이 변수에 className을 중첩시킨다.
  if (disabled === true) {
    combinedClassName =
      "rounded-xl font-extrabold bg-light-btn_disabled min-w-44 shadow-xl dark:bg-light-btn_disabled";
  } else {
    combinedClassName =
      "rounded-xl font-extrabold bg-light-btn min-w-44 shadow-xl hover:shadow-2xl hover:bg-light-btn_hover active:bg-light-btn dark:hover:bg-dark-btn_hover dark:active:bg-dark-btn dark:bg-dark-btn";
  }

  switch (size) {
    case "xs": {
      combinedClassName += " w-1/5 h-10 text-sm sm:text-base";
      break;
    }
    case "sm": {
      combinedClassName += " w-1/5 h-10 sm:h-12 text-sm sm:text-base";
      break;
    }
    case "md": {
      combinedClassName += " w-1/5 sm:w-1/4 h-10 sm:h-12 text-base sm:text-lg";
      break;
    }
    case "lg": {
      combinedClassName += " w-1/3 h-14 sm:h-16 text-lg sm:text-2xl font-black";
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
      className={`${className} ${combinedClassName}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;
