import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axiosInstance';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            return toast.error("Passwords don't match");
        }

        setLoading(true);

        try {
            const { data } = await api.post('/auth/reset-password', { token, password });
            toast.success(data.message);
            navigate('/login');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <div className="max-w-md w-full card glass p-10 text-center">
                    <h1 className="text-2xl font-bold text-slate-100 mb-4">Invalid Link</h1>
                    <p className="text-slate-400 mb-8">This password reset link is invalid or has expired.</p>
                    <Link to="/forgot-password" className="btn-primary block w-full py-3">
                        Request New Link
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full card glass p-10"
            >
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-100 mb-2">Reset Password</h1>
                    <p className="text-slate-400">Set a new, strong password for your account.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-2">New Password</label>
                        <input
                            type="password"
                            required
                            minlength="6"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="input w-full py-3"
                            placeholder="••••••••"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-2">Confirm New Password</label>
                        <input
                            type="password"
                            required
                            minlength="6"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="input w-full py-3"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full py-4 text-lg font-bold flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            'Update Password'
                        )}
                    </button>
                </form>
            </motion.div>
        </div>
    );
}
