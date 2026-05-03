import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosInstance';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.post('/auth/forgot-password', { email });
            toast.success('Reset link sent to your email!');
            setSent(true);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Something went wrong');
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

            <div className="w-full max-w-md">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="card shadow-2xl border-white/5 p-10"
                >
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-14 h-14 bg-brand-600 rounded-2xl shadow-2xl shadow-brand-600/40 mb-4">
                            <span className="text-2xl">🔑</span>
                        </div>
                        <h1 className="text-3xl font-bold text-slate-100 mb-2">Forgot Password?</h1>
                        <p className="text-slate-400">Enter your email and we'll send you a link to reset your password.</p>
                    </div>

                    {!sent ? (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-300 mb-2">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="input w-full"
                                    placeholder="name@example.com"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary w-full py-3 text-lg font-bold flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    'Send Reset Link'
                                )}
                            </button>
                        </form>
                    ) : (
                        <div className="text-center space-y-6">
                            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto text-3xl">
                                ✓
                            </div>
                            <p className="text-slate-400 font-medium">Check your inbox for the reset link! If you don't see it, check your spam folder.</p>
                        </div>
                    )}

                    <p className="mt-8 text-center text-sm text-slate-400">
                        Remember your password?{' '}
                        <Link to="/login" className="text-brand-400 font-bold hover:text-brand-300">Log In</Link>
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
