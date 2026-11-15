import { InputHTMLAttributes, forwardRef } from 'react';
import classNames from 'classnames';

export interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  /** 모서리: 닉네임/코드 입력(4px) · 채팅 입력(15px) · 정답 입력(5px) */
  rounded?: 'sm' | 'md' | 'lg';
  /** 외곽선 표시 (채팅 입력) */
  outlined?: boolean;
}

/** 흰 배경 입력창. 테마와 상관없이 글씨는 검정입니다. */
const TextField = forwardRef<HTMLInputElement, TextFieldProps>(({ rounded = 'sm', outlined, className, ...rest }, ref) => (
  <input
    ref={ref}
    className={classNames(
      'block w-full bg-wag-field text-black placeholder:text-wag-placeholder px-4 text-base sm:text-sm shadow-soft focus:outline-none focus:ring-2 focus:ring-light-btn dark:focus:ring-dark-btn',
      rounded === 'sm' && 'rounded-[4px]',
      rounded === 'md' && 'rounded-[5px]',
      rounded === 'lg' && 'rounded-[15px]',
      outlined ? 'border border-wag-fieldLine' : 'border-0',
      className
    )}
    {...rest}
  />
));

TextField.displayName = 'TextField';

export default TextField;
