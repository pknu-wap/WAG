import { ButtonHTMLAttributes, ReactNode } from 'react';
import classNames from 'classnames';

export type ButtonVariant = 'primary' | 'ghost';

/** Figma 프레임의 버튼 크기. 앞이 모바일, `sm:` 이 PC */
export type ButtonSize = 'menu' | 'room' | 'wide' | 'modal' | 'result' | 'chip' | 'setting';

const SIZE: Record<ButtonSize, string> = {
  // 메인 화면 4개 버튼
  menu: 'w-[178px] h-16 text-[25px] rounded-[13px] sm:w-[283px] sm:h-[54px] sm:text-xl',
  // 대기방/게임 화면 하단 버튼 (게임 나가기, 준비 완료, 정답 맞추기)
  room: 'w-[173px] h-[50px] text-lg rounded-[13px] sm:w-[145px] sm:h-[39px] sm:text-[15px] sm:rounded-[10px]',
  // 방 만들기 제출
  wide: 'w-[183px] h-[60px] text-xl rounded-[10px] sm:w-[273px] sm:h-[53px]',
  // 모달 안 버튼 (닉네임 확인, 드가자, 정답 확인하기)
  modal: 'w-[228px] h-[61px] text-xl rounded-[13px] sm:w-[146px] sm:h-[41px] sm:text-sm sm:rounded-[9px]',
  // 결과 화면
  result: 'w-[176px] h-[47px] text-base rounded-[13px] sm:w-[170px] sm:h-10 sm:text-sm sm:rounded-[10px]',
  // 경고 주기 팝오버
  chip: 'h-[38px] px-6 text-[13px] rounded-[10px]',
  // 방장 설정 모달
  setting: 'w-[273px] h-[58px] text-xl rounded-2xl sm:h-[48px] sm:text-base',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: ButtonSize;
  variant?: ButtonVariant;
  children: ReactNode;
}

/**
 * 기본 버튼. disabled 면 회색(#4D5562)으로 바뀝니다.
 * 라이트: 보라 배경 + 검정 글씨, 다크: 핑크 배경 + 흰 글씨.
 */
const Button = ({ size = 'room', variant = 'primary', className, disabled, children, type = 'button', ...rest }: ButtonProps) => {
  const base = 'inline-flex items-center justify-center font-bold select-none transition-transform duration-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wag-askerText';
  const look =
    variant === 'ghost'
      ? 'bg-transparent font-medium text-light-text dark:text-dark-text hover:underline'
      : disabled
      ? 'bg-wag-disabled text-light-text dark:text-dark-text shadow-wag cursor-not-allowed'
      : 'bg-light-btn text-light-text dark:bg-dark-btn dark:text-dark-text shadow-wag hover:bg-light-btn_hover dark:hover:bg-dark-btn_hover active:scale-95';

  return (
    <button type={type} className={classNames(base, variant === 'ghost' ? '' : SIZE[size], look, className)} disabled={disabled} {...rest}>
      {children}
    </button>
  );
};

export default Button;
