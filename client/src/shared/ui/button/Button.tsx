import { ButtonProps } from '../../../types/common';
import classNames from 'classnames';
import './ButtonSnow.css';

const Button = ({
  type,
  size,
  className,
  onClick,
  children,
  disabled,
}: ButtonProps) => {
  const baseClassName = 'rounded-xl font-extrabold min-w-44 shadow-xl transform transition-transform duration-100';

  const enabledClassName =
    'bg-light-btn hover:shadow-2xl hover:bg-light-btn_hover active:bg-light-btn dark:hover:bg-dark-btn_hover dark:active:bg-dark-btn dark:bg-dark-btn active:scale-95';
  const disabledClassName = 'bg-light-btn_disabled dark:bg-light-btn_disabled cursor-not-allowed';

  const sizeClassName = {
    xs: 'w-1/5 h-10 text-base',
    sm: 'w-1/5 h-12 text-base',
    md: 'w-1/4 h-12 text-lg',
    lg: 'w-1/3 h-16 text-2xl font-black',
  };

  return (
    <button
      type={type || 'button'}
      className={classNames(
        baseClassName,
        disabled ? disabledClassName : enabledClassName,
        sizeClassName[size || 'md'],
        className,
        'relative overflow-visible' // 눈 표시를 위해
      )}
      onClick={onClick}
      disabled={disabled}
    >
      {/* 위에 한 줄로 쌓인 눈 + 불규칙적으로 흘러내린 눈방울 (왼쪽 크게, 중앙 없음, 끝 작게) */}
      <div className="button-snow-top">
        <div className="button-snow-line" />
        <div className="button-snow-drip d1" />
        <div className="button-snow-drip d2" />
        <div className="button-snow-drip d4" />
        <div className="button-snow-drip d5" />
      </div>
      {children}
    </button>
  );
};

export default Button;

