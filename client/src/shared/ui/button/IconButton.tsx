import { ButtonHTMLAttributes, ReactNode } from 'react';
import classNames from 'classnames';

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** 헤더 아이콘(45px 원) / 작은 원(18px, 캐러셀 화살표) / 배경 없는 아이콘 */
  look?: 'header' | 'arrow' | 'plain';
  label: string;
  children: ReactNode;
}

/** 원형 아이콘 버튼. `label` 은 스크린리더용 이름입니다. */
const IconButton = ({ look = 'header', label, className, children, type = 'button', ...rest }: IconButtonProps) => {
  const base = 'inline-flex items-center justify-center shrink-0 text-light-text dark:text-dark-text transition-transform active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wag-askerText';
  const looks = {
    header: 'w-[45px] h-[45px] rounded-full bg-light-icon dark:bg-dark-icon shadow-wag',
    arrow: 'w-[18px] h-[18px] rounded-full bg-wag-arrow !text-black shadow-soft',
    plain: 'w-9 h-9 rounded-full bg-transparent',
  };

  return (
    <button type={type} aria-label={label} title={label} className={classNames(base, looks[look], className)} {...rest}>
      {children}
    </button>
  );
};

export default IconButton;
