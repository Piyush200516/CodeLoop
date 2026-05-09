import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import UpiPremiumPopup from './UpiPremiumPopup';

export default function Paywall() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [openUpi, setOpenUpi] = useState(false);

  useEffect(() => {
    if (user?.is_premium === 1 || user?.isPremium === true || user?.isPaid === true) {
      navigate('/');
    }
  }, [user, navigate]);

  if (user?.is_premium === 1 || user?.isPremium === true || user?.isPaid === true) return null;


  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20 overflow-hidden relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-600/10 rounded-full blur-[120px] opacity-50" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full card glass p-8 text-center border-brand-500/20 relative z-10 shadow-xl"
      >
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-brand-600 rounded-3xl shadow-2xl shadow-brand-600/40 mb-4">
            <span className="text-4xl">🔐</span>
          </div>
          <h1 className="text-4xl font-black text-slate-100 uppercase tracking-tighter mb-2">
            Unlock <span className="text-brand-500">Premium</span>
          </h1>
          <p className="text-slate-400 text-lg">
            Pay via UPI and submit your UTR + screenshot for admin verification.
          </p>
        </div>

        <div className="space-y-6">
          <div className="p-6 rounded-2xl border border-[var(--border-muted)] bg-[var(--surface-accent)] text-left">
            <p className="text-xs uppercase tracking-widest text-slate-400 font-black mb-2">How it works</p>
            <div className="space-y-2 text-slate-200 text-sm">
              <p>1) Pay ₹30 using any UPI app</p>
              <p>2) Copy your UTR / Transaction ID</p>
              <p>3) Upload screenshot and submit</p>
              <p>4) Admin approves → Premium unlocked</p>
            </div>
          </div>

          <button
            onClick={() => setOpenUpi(true)}
            className="w-full btn-primary h-16 text-lg font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-brand-600/30"
          >
            Continue with UPI ₹30 <span className="text-xl">⚡</span>
          </button>

          <p className="text-xs text-slate-400">Premium access is unlocked after admin approval.</p>
        </div>
      </motion.div>

      <UpiPremiumPopup
        open={openUpi}
        onClose={() => setOpenUpi(false)}
        amount={30}
        upiId={'piyushmishra21052003@okhdfcbank'}
      />

    </div>
  );
}

