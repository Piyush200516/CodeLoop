import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function Pricing() {
    const { user, updateUserData } = useAuth();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handlePayment = async () => {
        if (user?.isPaid || user?.isPremium) {
            toast.success('You already have Premium access! 🚀');
            return;
        }

        setLoading(true);
        try {
            // 1. Create order on backend
            const { data: order } = await api.post('/payment/create-order', {
                amount: 499 // Example price in INR
            });

            // 2. Initialize Razorpay options
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_live_SX2d403j71KuAK',
                amount: order.amount,
                currency: order.currency,
                name: 'CodeRecall Premium',
                description: 'Unlock all visualization and recall features',
                order_id: order.id,
                handler: async function (response) {
                    try {
                        // 3. Verify payment on backend
                        const { data: verification } = await api.post('/payment/verify', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                        });

                        if (verification.success) {
                            toast.success('Payment Successful! Welcome to Premium. 🎉');
                            updateUserData({ isPaid: true, isPremium: true });
                            navigate('/dashboard');
                        } else {
                            toast.error('Payment verification failed.');
                        }
                    } catch (err) {
                        console.error(err);
                        toast.error('Error verifying payment.');
                    }
                },
                prefill: {
                    name: user?.name,
                    email: user?.email,
                },
                theme: {
                    color: '#0ea5e9',
                },
            };

            const rzp = new window.Razorpay(options);

            rzp.on('payment.failed', function (response) {
                toast.error('Payment Failed: ' + response.error.description);
            });

            rzp.open();
        } catch (err) {
            console.error(err);
            toast.error('Failed to initiate payment.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
            >
                <h1 className="text-5xl font-extrabold text-slate-100">
                    Upgrade to <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-indigo-400">Premium</span>
                </h1>
                <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                    Master algorithms faster with advanced visualizations, personalized recall patterns, and priority insights.
                </p>

                <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                    <div className="card glass p-8 border-brand-500/20">
                        <h2 className="text-2xl font-bold text-slate-100">Free Tier</h2>
                        <p className="text-slate-400 mt-2">Perfect for getting started</p>
                        <ul className="mt-6 space-y-4 text-slate-300">
                            <li className="flex items-center gap-2">✅ Track up to 50 problems</li>
                            <li className="flex items-center gap-2">✅ Basic Spaced Repetition</li>
                            <li className="flex items-center gap-2">❌ Advanced Visualizers</li>
                            <li className="flex items-center gap-2">❌ Daily Recall Challenges</li>
                        </ul>
                        <div className="mt-10 text-3xl font-bold text-slate-100">₹0 <span className="text-sm font-normal text-slate-500">/ forever</span></div>
                        <button disabled className="mt-6 w-full btn-secondary opacity-50 cursor-not-allowed">Current Plan</button>
                    </div>

                    <div className="card glass p-8 border-brand-500 relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-brand-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">Most Popular</div>
                        <h2 className="text-2xl font-bold text-slate-100">Premium Plan</h2>
                        <p className="text-slate-400 mt-2">For the serious LeetCoder</p>
                        <ul className="mt-6 space-y-4 text-slate-300">
                            <li className="flex items-center gap-2">✅ Unlimited Problem Tracking</li>
                            <li className="flex items-center gap-2">✅ All 45+ Algorithm Visualizers</li>
                            <li className="flex items-center gap-2">✅ Personalized Recall Sessions</li>
                            <li className="flex items-center gap-2">✅ Detailed Progress Analytics</li>
                        </ul>
                        <div className="mt-10 text-3xl font-bold text-slate-100">₹499 <span className="text-sm font-normal text-slate-500">/ one-time</span></div>
                        <button
                            onClick={handlePayment}
                            disabled={loading || user?.isPaid || user?.isPremium}
                            className="mt-6 w-full btn-primary bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500"
                        >
                            {loading ? 'Processing...' : (user?.isPaid || user?.isPremium) ? 'Already Premium' : 'Buy Now'}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
