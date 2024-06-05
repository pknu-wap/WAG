import { ButtonProps } from "../../types/common";
import classNames from "classnames";

const Button = ({
  type,
  size,
  className,
  onClick,
  children,
  disabled,
}: ButtonProps) => {
  const baseClassName = "rounded-xl font-extrabold min-w-44 shadow-xl transform transition-transform duration-100";


  const enabledClassName = "bg-light-btn hover:shadow-2xl hover:bg-light-btn_hover active:bg-light-btn dark:hover:bg-dark-btn_hover dark:active:bg-dark-btn dark:bg-dark-btn active:scale-95";
  const disabledClassName = "bg-light-btn_disabled dark:bg-light-btn_disabled cursor-not-allowed";

  const sizeClassName = {
    xs: "w-1/5 h-10 text-base",
    sm: "w-1/5 h-12 text-base",
    md: "w-1/4 h-12 text-lg",
    lg: "w-1/3 h-16 text-2xl font-black",
  };



  return (
    <button
      type={type || "button"}
      className={classNames(
        baseClassName,
        disabled ? disabledClassName : enabledClassName,
        sizeClassName[size || "md"],
        className
      )}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;
