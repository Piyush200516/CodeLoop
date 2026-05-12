import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function Pricing() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.is_premium === 1) navigate('/dashboard');
  }, [user, navigate]);

  const isPremium = user?.is_premium === 1 || user?.isPremium === true || user?.isPaid === true;

  const handleGoPaywall = () => {
    if (loading) return;
    setLoading(true);
    toast.message('Redirecting to UPI payment...');
    navigate('/paywall');
    setLoading(false);
  };


  return (
    <div className="max-w-4xl mx-auto px-4 py-20 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <h1 className="text-5xl font-extrabold text-slate-100">
          Upgrade to{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-indigo-400">
            Premium
          </span>
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
          Master algorithms faster with advanced visualizations, personalized recall patterns, and priority insights.
        </p>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
          <div className="card glass p-8 border-brand-500/20 relative">
            <h2 className="text-2xl font-bold text-slate-100">Free Tier</h2>
            <p className="text-slate-400 mt-2">Perfect for getting started</p>
            <ul className="mt-6 space-y-4 text-slate-300">
              <li className="check-row">Track up to 50 problems</li>
              <li className="check-row">Basic Spaced Repetition</li>
              <li className="flex items-center gap-2 text-slate-500"><span className="text-red-500">✗</span> Advanced Visualizers</li>
              <li className="flex items-center gap-2 text-slate-500"><span className="text-red-500">✗</span> Daily Recall Challenges</li>
            </ul>
            <div className="mt-10 text-3xl font-bold text-slate-100">₹0</div>
            <button disabled className="mt-6 w-full btn-secondary opacity-50 cursor-not-allowed">Current Plan</button>
          </div>

          <div className="card glass p-8 border-brand-500 relative overflow-hidden sheen">
            <div className="absolute top-0 right-0 bg-gradient-to-l from-brand-500 to-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-bl-xl uppercase tracking-wider shadow-lg">
              🔥 Most Popular
            </div>
            <div className="absolute -top-10 -right-10 w-20 h-20 bg-brand-500/20 rounded-full blur-xl" />
            <h2 className="text-2xl font-bold text-slate-100">Premium Plan</h2>
            <p className="text-slate-400 mt-2">For the serious LeetCoder</p>
            <ul className="mt-6 space-y-4 text-slate-300">
              <li className="check-row">Unlimited Problem Tracking</li>
              <li className="check-row">All 45+ Algorithm Visualizers</li>
              <li className="check-row">Personalized Recall Sessions</li>
              <li className="check-row">Detailed Progress Analytics</li>
            </ul>

            <div className="mt-10 text-3xl font-bold text-slate-100">₹30</div>
            <p className="text-xs text-slate-500 mt-1">one-time payment • lifetime (admin approval)</p>

            <button
              onClick={handleGoPaywall}
              disabled={loading}
              className="mt-6 w-full btn-primary bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 sheen"
            >
              {loading ? 'Processing...' : 'Pay with UPI'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

