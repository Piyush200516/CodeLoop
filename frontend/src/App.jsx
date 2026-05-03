import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Problems from './pages/Problems';
import AddProblem from './pages/AddProblem';
import Review from './pages/Review';
import ProblemManager from './pages/ProblemManager';
import CalendarPage from './pages/Calendar';
import AlgorithmsPage from './pages/Algorithms';
import RecallPage from './pages/Recall';
import RecallSessionPage from './pages/RecallSession';
import AdminDashboard from './pages/AdminDashboard';
import AdminRoute from './components/AdminRoute';



import Paywall from './pages/Paywall';
import DemoPage from './pages/DemoPage';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyOTP from './pages/VerifyOTP';
import CodeVisualizer from './pages/CodeVisualizer';

const PrivateRoute = ({ children }) => {
    const { user } = useAuth();
    return user ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
    const { user } = useAuth();
    return !user ? children : <Navigate to="/" replace />;
};

// Authenticated user (can be free or premium)
const UserRoute = ({ children }) => {
    const { user } = useAuth();
    if (!user) return <Navigate to="/login" replace />;
    return children;
};

export default function App() {
    const { user } = useAuth();

    return (
        <div className="min-h-screen">
            {user && <Navbar />}
            <main className={user ? 'pt-16' : ''}>
                <Routes>
                    <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                    <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
                    <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
                    <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />
                    <Route path="/verify-otp" element={<PublicRoute><VerifyOTP /></PublicRoute>} />
                    <Route path="/paywall" element={<UserRoute><Paywall /></UserRoute>} />
                    <Route path="/demo" element={<DemoPage />} />
                    <Route path="/" element={<UserRoute><Dashboard /></UserRoute>} />
                    <Route path="/problems" element={<UserRoute><Problems /></UserRoute>} />
                    <Route path="/manage" element={<UserRoute><ProblemManager /></UserRoute>} />
                    <Route path="/calendar" element={<UserRoute><CalendarPage /></UserRoute>} />
                    <Route path="/algorithms" element={<UserRoute><AlgorithmsPage /></UserRoute>} />
                    <Route path="/add" element={<UserRoute><AddProblem /></UserRoute>} />
                    <Route path="/edit/:id" element={<UserRoute><AddProblem /></UserRoute>} />
                    <Route path="/review" element={<UserRoute><Review /></UserRoute>} />
                    <Route path="/recall" element={<UserRoute><RecallPage /></UserRoute>} />
                    <Route path="/recall/:id" element={<UserRoute><RecallSessionPage /></UserRoute>} />
                    <Route path="/code-visualizer" element={<UserRoute><CodeVisualizer /></UserRoute>} />
                    <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </main>
        </div>
    );
}
