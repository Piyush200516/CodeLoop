import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function Paywall() {
    const { user, updateUserData } = useAuth();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // If user is already paid/premium, get them out of here
    if (user?.isPaid || user?.isPremium) {
        navigate('/');
        return null;
    }

    const handlePayment = async () => {
        setLoading(true);
        try {
            const { data: order } = await api.post('/payment/create-order', { amount: 50 });

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_live_SX2d403j71KuAK',
                amount: order.amount,
                currency: order.currency,
                name: 'CodeRecall Full Access',
                description: 'Unlock lifetime access to all features',
                order_id: order.id,
                handler: async function (response) {
                    try {
                        const { data: verification } = await api.post('/payment/verify', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                        });

                        if (verification.success) {
                            toast.success('Payment Successful! Welcome to CodeRecall. 🎉');
                            updateUserData({ isPaid: true, isPremium: true });
                            navigate('/');
                        } else {
                            toast.error('Payment verification failed.');
                        }
                    } catch (err) {
                        console.error(err);
                        toast.error('Error verifying payment.');
                    }
                },
                prefill: { name: user?.name, email: user?.email },
                theme: { color: '#0ea5e9' },
                modal: { ondismiss: () => setLoading(false) }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response) {
                toast.error('Payment Failed: ' + response.error.description);
                setLoading(false);
            });
            rzp.open();
        } catch (err) {
            console.error(err);
            toast.error('Failed to initiate payment.');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-20 overflow-hidden relative">
            {/* Background glow */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-600/10 rounded-full blur-[120px] opacity-50" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-xl w-full card glass p-10 text-center border-brand-500/20 relative z-10 shadow-xl"
            >
                {/* Header */}
                <div className="mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-brand-600 rounded-3xl shadow-2xl shadow-brand-600/40 mb-6">
                        <span className="text-4xl">🔐</span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-100 uppercase tracking-tighter mb-4">
                        Unlock <span className="text-brand-500">Full Access</span>
                    </h1>
                    <p className="text-slate-400 text-lg">
                        Master LeetCode patterns with our advanced spaced-repetition system and algorithm visualizers.
                    </p>
                </div>

                {/* Feature list */}
                <div className="space-y-4 mb-10">
                    {[
                        { icon: '📊', title: 'Personalized Dashboard', desc: 'Track progress with detailed analytics' },
                        { icon: '🧠', title: 'Memory Recall Mode', desc: 'Master patterns with active recall decks' },
                        { icon: '🔮', title: 'Interactive Visualizers', desc: '45+ algorithms with step-by-step playback' },
                        { icon: '📝', title: 'Personal Notes', desc: 'Write and save your own notes for every problem' },
                        { icon: '📅', title: 'Auto-Scheduled Revisions', desc: 'Problems are automatically scheduled using spaced repetition when you add them' },
                        { icon: '🔗', title: 'Direct LeetCode Links', desc: 'Jump straight to any problem on LeetCode with one click for instant revision' },
                    ].map(({ icon, title, desc }) => (
                        <div key={title} className="flex items-center gap-3 text-left p-4 bg-[var(--surface-accent)] rounded-2xl border border-[var(--border-muted)]">
                            <span className="text-xl">{icon}</span>
                            <div>
                                <p className="text-sm font-bold text-slate-200">{title}</p>
                                <p className="text-xs text-slate-400">{desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pricing + CTA */}
                <div className="space-y-6">
                    <div className="p-6 bg-yellow-50 dark:bg-yellow-950/30 rounded-2xl border border-yellow-300 dark:border-yellow-500/30 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-yellow-100 dark:bg-yellow-500/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                        <p className="text-xs font-black text-yellow-600 dark:text-yellow-400 uppercase tracking-widest mb-1 relative z-10">LIFETIME ACCESS</p>
                        <p className="text-4xl font-black text-slate-900 dark:text-white relative z-10">
                            ₹50 <span className="text-sm font-normal text-slate-500 dark:text-slate-400 italic block mt-1">one-time payment</span>
                        </p>
                    </div>

                    <button
                        onClick={handlePayment}
                        disabled={loading}
                        className="w-full btn-primary h-16 text-lg font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-brand-600/30"
                    >
                        {loading ? (
                            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>Pay ₹50 & Continue <span className="text-xl">⚡</span></>
                        )}
                    </button>

                    <p className="text-xs text-slate-400">
                        Payment secured by Razorpay. Immediate access after verification.
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
