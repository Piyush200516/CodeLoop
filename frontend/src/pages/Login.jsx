import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosInstance';
import toast from 'react-hot-toast';
import { GoogleLogin } from '@react-oauth/google';
import { Eye, EyeOff } from 'lucide-react';

export default function Login() {
    const [form, setForm] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await api.post('/auth/login', form);
            login(data);
            toast.success(`Welcome back, ${data.name}! 👋`);
            const ADMIN_EMAIL = (import.meta.env.VITE_ADMIN_EMAIL || 'coderecallapp@gmail.com').toLowerCase().trim();
            const isAdmin = data.email?.toLowerCase().trim() === ADMIN_EMAIL;
            if (isAdmin || data.isPremium || data.isPaid) {
                navigate('/');
            } else {
                navigate('/demo');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async (credentialResponse) => {
        setLoading(true);
        try {
            const { data } = await api.post('/auth/google', {
                token: credentialResponse.credential,
            });
            login(data);
            toast.success(`Welcome, ${data.name}! 👋`);
            const ADMIN_EMAIL = (import.meta.env.VITE_ADMIN_EMAIL || 'coderecallapp@gmail.com').toLowerCase().trim();
            const isAdmin = data.email?.toLowerCase().trim() === ADMIN_EMAIL;
            if (isAdmin || data.isPremium || data.isPaid) {
                navigate('/');
            } else {
                navigate('/demo');
            }
        } catch (err) {
            toast.error('Google login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12">
            {/* Background glow */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl opacity-50" />
            </div>

            <div className="w-full max-w-md animate-slide-up">
                {/* Logo & Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-brand-600 rounded-2xl shadow-2xl shadow-brand-600/40 mb-4">
                        <span className="text-2xl font-bold text-white">CR</span>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-100 italic tracking-tight">Code<span className="text-brand-400">Recall</span></h1>
                    <p className="text-slate-400 mt-1">Master LeetCode with spaced repetition</p>
                </div>

                <div className="card shadow-2xl border-white/5">
                    <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                className="input"
                                placeholder="you@gmail.com"
                                value={form.email}
                                onChange={handleChange}
                                required
                                autoComplete="off"
                            />
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-1.5">
                                <label className="block text-sm font-medium text-slate-300">Password</label>
                                <Link to="/forgot-password" size="sm" className="text-sm text-brand-400 hover:text-brand-300 font-medium tracking-tight">
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    className="input pr-10"
                                    value={form.password}
                                    onChange={handleChange}
                                    required
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full flex items-center justify-center gap-2 py-2.5"
                        >
                            {loading ? (
                                <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                'Sign In'
                            )}
                        </button>

                        <div className="my-6 flex justify-center text-xs uppercase">
                            <span className="px-2 text-slate-500 font-mono">Or continue with</span>
                        </div>

                        <div className="flex justify-center">
                            <GoogleLogin
                                onSuccess={handleGoogleLogin}
                                onError={() => toast.error('Google login failed')}
                                useOneTap
                                theme="filled_blue"
                                shape="pill"
                                width="100%"
                            />
                        </div>
                    </form>

                    <p className="text-center text-slate-400 text-sm mt-6">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-brand-400 font-medium hover:text-brand-300">
                            Create account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
