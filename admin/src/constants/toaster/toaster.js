import { toast } from 'react-toastify';

const Toaster = () => {
    return {
        position: 'top-center',
        autoClose: 2000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'light',
    };
};
const ErrorToaster = () => {
    return {
        position: 'top-center',
        autoClose: 2000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'light'
    };
}
const ToastHandle = (type, message) => {
    if (type === 'success') {
        toast.success(message, Toaster());
    } else {
        toast.error(message, ErrorToaster());
    }
};
export default ToastHandle;