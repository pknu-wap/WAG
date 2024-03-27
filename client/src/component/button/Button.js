
function Button({ type, color, size, className, onClick, children }) {
    let combinedClassName = ''; // 이 변수에 className을 중첩시킨다.

    switch (color) {
        case 'mint': {
            combinedClassName = 'mr-2 rounded-lg border border-mint bg-mint font-semibold text-white hover:bg-hover-mint focus:ring-ring-mint';
            break;
        }
        case 'white': {
            combinedClassName = 'mr-2 rounded-lg border border-mint bg-transparent font-semibold text-mint  hover:bg-gray-100 focus:ring-gray-300';
            break;
        }
        case 'gray': {
            combinedClassName =
                'inline-flex items-center rounded-lg border border-gray-300 bg-white text-center font-medium text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-gray-200';
            break;
        }
        default: {
            combinedClassName = 'mr-2 rounded-lg border border-mint bg-transparent font-semibold text-mint  hover:bg-gray-100 focus:ring-gray-300';
            break;
        }
    }

    switch (size) {
        case 'sm': {
            combinedClassName += ' py-1.5 px-3 text-sm focus:ring-4';
            break;
        }
        case 'md': {
            combinedClassName += ' py-2 px-4 text-sm focus:ring-2';
            break;
        }
        case 'lg': {
            combinedClassName += ' py-2 px-4 text-base focus:ring-4';
            break;
        }
        default: {
            combinedClassName += ' py-2 px-4 text-sm focus:ring-2';
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