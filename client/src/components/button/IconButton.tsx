import { ButtonProps } from "../../types/common";

const IconButton = ({
  type,
  size,
  className,
  disabled,
  onClick,
  children,
  isInput,
}: ButtonProps) => {
  let combinedClassName =
    isInput ? "p-2 px-3 rounded-full flex justify-center items-center text-light-text dark:text-dark-text bg-transparent shadow-none hover:shadow-none dark:shadow-none dark:bg-transparent" 
    : "p-2 px-3 rounded-full flex justify-center items-center text-light-text dark:text-dark-text bg-transparent shadow-xl hover:shadow-sm dark:shadow-xl dark:bg-transparent"; // 이 변수에 className을 중첩시킨다.

  switch (size) {
    case "sm": {
      combinedClassName += " sm:w-12 sm:h-12 sm:text-base w-10 h-10 text-[13px] rounded-full";
      break;
    }
    case "md": {
      combinedClassName += " sm:w-14 sm:h-14 sm:text-base w-12 h-12 text-sm rounded-full";
      break;
    }
    case "lg": {
      combinedClassName += " lg:w-16 lg:h-16 lg:text-xl sm:w-14 sm:h-14 sm:text-lg w-12 h-12 text-base rounded-full font-black";
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
      className={`${className} ${combinedClassName}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default IconButton;
