import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
    const { user } = useAuth();
    const ADMIN_EMAIL = (import.meta.env.VITE_ADMIN_EMAIL || 'coderecallapp@gmail.com').toLowerCase().trim();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (user.email?.toLowerCase().trim() !== ADMIN_EMAIL) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default AdminRoute;
