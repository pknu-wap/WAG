import { ReactNode } from "react";

interface ButtonProps {
    type?: 'button' | undefined; // type이 undefined인 경우에는 'button'으로 지정
    className?: string; // 추가로 적용하고 싶은 className이 있을 경우 사용
    onClick?: () => void;
    children: ReactNode; // children 속성에는 string 뿐만 아니라 <svg> 요소가 포함될 수도 있어서 ReactNode 타입을 사용했다.
}

const IconButton = ({ type, className, onClick, children }: ButtonProps) => {
    let combinedClassName = 'p-2 px-3 rounded-full bg-transparent shadow-xl hover:shadow-sm dark:shadow-xl dark:bg-transparent'; // 이 변수에 className을 중첩시킨다.

    return (
        <button type={type ? type : 'button'} className={`${combinedClassName} ${className}`} onClick={onClick}>
            {children}
        </button>
    );
}

export default IconButton;