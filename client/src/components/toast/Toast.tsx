import { toast, ToastContainer, ToastOptions  } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface ToastProps {
    message: string;
    type: 'success' | 'error' | 'warn' | 'info' | 'default';
}

const toastOptions: ToastOptions = {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "light",
  };

  function Toast({message, type} : ToastProps) {
    switch (type) {
        case 'success':
            toast.success(message, toastOptions);
            break;
        case 'error':
            toast.error(message, toastOptions);
            break;
        case 'warn':
            toast.warn(message, toastOptions);
            break;
        case 'info':                
            toast.info(message, toastOptions);
            break;
        default:
            toast(message, toastOptions);
    }
  }

export default Toast;