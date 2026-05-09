import { useEffect, useState } from 'react';
import axios from '../api/axiosInstance';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState(null);

  const loadPending = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/admin/payments');
      setPayments(res.data);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || 'Failed to load pending payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPending();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleApprove = async (id) => {
    setSubmittingId(id);
    try {
      await axios.post(`/admin/payments/approve/${id}`);
      toast.success('Approved');
      await loadPending();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || 'Approve failed');
    } finally {
      setSubmittingId(null);
    }
  };

  const handleReject = async (id) => {
    setSubmittingId(id);
    try {
      await axios.post(`/admin/payments/reject/${id}`);
      toast.success('Rejected');
      await loadPending();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || 'Reject failed');
    } finally {
      setSubmittingId(null);
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-slate-100">Loading pending payments...</div>;
  }

  // Admin check is server-side; this is just a UI hint.
  if (!user) {
    return <div className="text-center py-20 text-slate-100">Login required.</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold mb-6 text-slate-100">Pending UPI Payments</h1>

      {payments.length === 0 ? (
        <div className="card glass p-10 text-center text-slate-400">No pending payments.</div>
      ) : (
        <div className="space-y-4">
          {payments.map((p) => (
            <div key={p.id} className="card glass p-5 border border-[var(--border-muted)]">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap gap-x-6 gap-y-2 items-center">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-slate-400 font-black">User</p>
                      <p className="text-sm font-bold text-slate-100">{p.email}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest text-slate-400 font-black">UTR</p>
                      <p className="text-sm font-mono text-slate-100">{p.utr_number}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest text-slate-400 font-black">Amount</p>
                      <p className="text-sm font-bold text-slate-100">₹{p.amount}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest text-slate-400 font-black">Submitted</p>
                      <p className="text-sm text-slate-100">{new Date(p.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleApprove(p.id)}
                    disabled={submittingId === p.id}
                    className="px-4 py-2 bg-emerald-500/20 text-emerald-500 text-sm font-black rounded-lg hover:bg-emerald-500 hover:text-white transition-colors disabled:opacity-50"
                  >
                    {submittingId === p.id ? 'Approving...' : 'Approve'}
                  </button>
                  <button
                    onClick={() => handleReject(p.id)}
                    disabled={submittingId === p.id}
                    className="px-4 py-2 bg-rose-500/20 text-rose-500 text-sm font-black rounded-lg hover:bg-rose-500 hover:text-white transition-colors disabled:opacity-50"
                  >
                    {submittingId === p.id ? 'Rejecting...' : 'Reject'}
                  </button>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-xs uppercase tracking-widest text-slate-400 font-black">Screenshot</p>
                <div className="mt-2">
                  {/* backend returns screenshot_url like /uploads/upi/<file> */}
                  <img
                    src={p.screenshot_url}
                    alt="Payment screenshot"
                    className="max-h-64 rounded-xl border border-[var(--border-muted)] object-contain"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

