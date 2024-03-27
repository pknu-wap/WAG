const IconButton = ({ type, className, onClick, children }) => {
    let combinedClassName = 'p-2 px-3 rounded-full bg-transparent shadow-xl hover:shadow-sm dark:shadow-xl dark:bg-transparent'; // 이 변수에 className을 중첩시킨다.

    return (
        <button type={type ? type : 'button'} className={`${combinedClassName} ${className}`} onClick={onClick}>
            {children}
        </button>
    );
}

export default IconButton;