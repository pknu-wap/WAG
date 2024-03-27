
const Button = ({ type, size, className, onClick, children }) => {
    let combinedClassName = 'rounded-xl font-extrabold bg-light-btn min-w-44 shadow-xl hover:shadow-2xl hover:bg-light-btn_hover active:bg-light-btn dark:hover:bg-dark-btn_hover dark:active:bg-dark-btn dark:bg-dark-btn'; // 이 변수에 className을 중첩시킨다.


    switch (size) {
        case 'sm': {
            combinedClassName += ' w-1/5 h-12 text-base';
            break;
        }
        case 'md': {
            combinedClassName += ' w-1/4 h-12 text-lg';
            break;
        }
        case 'lg': {
            combinedClassName += ' w-1/3 h-16 text-2xl font-black';
            break;
        }
        default: {
            combinedClassName += ' w-1/4 h-12 text-lg';
            break;
        }
    }



    return (
        <button type={type ? type : 'button'} className={`${combinedClassName} ${className}`} onClick={onClick}>
            {children}
        </button>
    );
}

export default Button;