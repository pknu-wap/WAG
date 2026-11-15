import classNames from 'classnames';
import { FullLayoutProps } from '../../types/common';

/** 페이지 본문 컬럼. PC 는 636px(디자인 기준), 모바일은 좌우 16px 여백 */
function FullLayout({ className, children }: FullLayoutProps) {
  return <div className={classNames('relative z-10 mx-auto w-full max-w-[636px] px-4 sm:px-0 text-center text-light-text dark:text-dark-text', className)}>{children}</div>;
}

export default FullLayout;
