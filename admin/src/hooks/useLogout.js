import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { logoutUser } from '../redux/actions';

export const useLogout = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { logout: authLogout } = useAuth();

    const logout = async () => {
        try {
            await localStorage.clear();
            await navigate('/account/login', { replace: true });
        } catch (error) {
            console.error('Logout error:', error);
            navigate('/account/login', { replace: true });
        }
    };

    return logout;
};