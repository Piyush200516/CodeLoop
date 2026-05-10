import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../api/axiosInstance';
import toast from 'react-hot-toast';

const DEFAULT_UPI_ID = 'piyushmishra21052003@okhdfcbank';

export default function UpiPremiumPopup({ open, onClose, amount = 10, upiId = DEFAULT_UPI_ID }) {
  const [utr, setUtr] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const [statusLoading, setStatusLoading] = useState(false);
  const [myStatus, setMyStatus] = useState(null); // { user, payment }

  const isPending = myStatus?.payment?.status === 'pending';
  const isRejected = myStatus?.payment?.status === 'rejected';

  useEffect(() => {
    if (!open) return;

    const fetchStatus = async () => {
      try {
        setStatusLoading(true);
        const res = await api.get('/payments/my-status');
        setMyStatus(res.data);

        // If already premium, close the popup / unlock
        if (res.data?.user?.is_premium === 1) {
          onClose?.();
        }
      } catch (err) {
        console.error(err);
        toast.error(err?.response?.data?.message || 'Failed to load payment status');
      } finally {
        setStatusLoading(false);
      }
    };

    fetchStatus();
  }, [open]);

  // If status indicates premium, close immediately (in case popup was opened before status returned)
  useEffect(() => {
    if (open && myStatus?.user?.is_premium === 1) {
      onClose?.();
    }
  }, [open, myStatus, onClose]);

  if (!open) return null;

  const upiQrValue = encodeURIComponent(upiId);
  const upiDeepLink = `upi://pay?pa=${upiQrValue}&pn=CodeRecall%20Premium&am=${amount}&cu=INR&tn=CodeLoop%20Premium`;

  const handleSubmit = async () => {

    if (isPending) {
      toast.error('Your payment proof is already submitted. Please wait for admin verification.');
      return;
    }

    if (!utr.trim()) {
      toast.error('Enter UTR / Transaction ID');
      return;
    }
    if (!file) {
      toast.error('Upload payment screenshot');
      return;
    }


    try {
      setLoading(true);
      const form = new FormData();
      // backend expects multipart field name: screenshot
      form.append('amount', String(amount));
      form.append('utr_number', utr.trim());
      form.append('screenshot', file);

      await api.post('/payments/submit', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Payment proof submitted. Admin will verify soon.');
      onClose?.();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || 'Payment submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-sm">
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ type: 'spring', stiffness: 220, damping: 22 }}
        className="relative w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
        style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)' }}
      >
        <div className="p-6 sm:p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-brand-500/20 to-indigo-500/20 border border-brand-500/30 mb-5 shadow-lg shadow-brand-500/10">
            <span className="text-3xl">💸</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black mb-2" style={{ color: 'var(--text-primary)' }}>
            Pay via UPI to unlock Premium
          </h2>
          <p className="text-sm sm:text-base mb-6" style={{ color: 'var(--text-secondary)' }}>
            Amount: <span className="font-black">₹{amount}</span> (Lifetime Premium)
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start mb-6">
            <div className="text-left">
              <p className="text-xs uppercase tracking-widest font-black mb-2" style={{ color: 'var(--text-secondary)', opacity: 0.8 }}>
                UPI ID
              </p>
              <p className="font-mono text-sm sm:text-base break-all text-slate-100">{upiId}</p>

              <a
                className="mt-3 inline-flex items-center justify-center px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-sm font-black transition-colors w-full sm:w-auto"
                href={upiDeepLink}
              >
                Open UPI App
              </a>

              <p className="mt-3 text-[11px] text-slate-400">
                After payment, enter your UTR / Transaction ID below.
              </p>
            </div>

            <div className="flex flex-col items-center">
              <img
                className="rounded-2xl border border-[var(--border-muted)] bg-white/5 p-2"
                width={180}
                height={180}
                alt="UPI QR"
                src={`https://quickchart.io/qr?text=${encodeURIComponent(`upi://pay?pa=${upiId}&am=${amount}&cu=INR`)}&size=180`}
              />
              <p className="mt-2 text-[11px] text-slate-400">Scan QR in any UPI app</p>
            </div>
          </div>

          {(isPending || isRejected) && (
            <div className="mb-6 p-4 rounded-2xl border border-[var(--border-muted)] bg-[var(--surface-accent)] text-left">
              <p className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>
                {isPending
                  ? 'Your payment proof is already submitted. Please wait for admin verification.'
                  : 'Your previous payment was rejected. Please submit correct payment details again.'}
              </p>
            </div>
          )}

          <div className="space-y-4 text-left">
            <label>
              <p className="text-xs uppercase tracking-widest font-black mb-2" style={{ color: 'var(--text-secondary)', opacity: 0.8 }}>
                UTR / Transaction ID
              </p>
              {!isPending ? (
                <input
                  value={utr}
                  onChange={(e) => setUtr(e.target.value)}
                  placeholder="e.g. 1234567890"
                  className="w-full px-4 py-3 rounded-2xl bg-transparent border border-[var(--border-muted)] outline-none text-slate-100"
                />
              ) : (
                <input
                  value={utr}
                  readOnly
                  placeholder="Pending verification"
                  className="w-full px-4 py-3 rounded-2xl bg-transparent border border-[var(--border-muted)] outline-none text-slate-100 opacity-60"
                />
              )}
            </label>

            {!isPending && (
              <label>
                <p className="text-xs uppercase tracking-widest font-black mb-2" style={{ color: 'var(--text-secondary)', opacity: 0.8 }}>
                  Screenshot upload
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="w-full text-slate-200"
                />
                {file && <p className="mt-2 text-[12px] text-slate-400">Selected: {file.name}</p>}
              </label>
            )}
          </div>


          <div className="mt-6 flex flex-col gap-3">
            <button
              onClick={handleSubmit}
              disabled={loading || isPending || statusLoading}
              className="btn-primary w-full h-14 text-lg font-black uppercase tracking-widest shadow-xl shadow-brand-600/30 disabled:opacity-50"
            >
              {loading ? 'Submitting...' : isPending ? 'Pending Verification' : 'Submit Payment'}
            </button>

          {isPending && (
            <p className="mt-3 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
              Your payment proof is already submitted. Please wait for admin verification.
            </p>
          )}

            <button
              onClick={onClose}
              disabled={loading}
              className="w-full bg-transparent hover:bg-black/5 font-bold py-3 px-6 rounded-2xl transition-all text-sm"
              style={{ color: 'var(--text-secondary)' }}
            >
              Cancel
            </button>
          </div>


          <p className="mt-4 text-[10px] uppercase tracking-[0.15em] font-black flex items-center justify-center gap-1.5" style={{ color: 'var(--text-secondary)', opacity: 0.5 }}>
            <span>🔒</span> Uploaded for admin verification
          </p>
        </div>
      </motion.div>
    </div>
  );
}
