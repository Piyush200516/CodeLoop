import { useState, useEffect } from 'react';
import axios from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [payments, setPayments] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('users');
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
        const fetchAdminData = async () => {
            try {
                const [usersRes, paymentsRes, statsRes, suggestionsRes] = await Promise.all([
                    axios.get('/admin/users'),
                    axios.get('/admin/payments'),
                    axios.get('/admin/stats'),
                    axios.get('/suggestions')
                ]);
                setUsers(usersRes.data);
                setPayments(paymentsRes.data);
                setStats(statsRes.data);
                setSuggestions(suggestionsRes.data);
            } catch (error) {
                console.error('Error fetching admin data:', error);
            } finally {
                setLoading(loading => false);
            }
        };

        fetchAdminData();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        
        try {
            await axios.delete(`/admin/user/${id}`);
            // Remove user from local state to avoid refetching everything
            setUsers(users.filter(user => user._id !== id));
            // toast could be added here if hot-toast is imported
        } catch (error) {
            console.error('Failed to delete user:', error);
            alert("Failed to delete user");
        }
    };

    const handleDeletePayment = async (id) => {
        if (!window.confirm("Are you sure you want to delete this payment?")) return;
        
        try {
            await axios.delete(`/admin/payment/${id}`);
            setPayments(payments.filter(payment => payment._id !== id));
        } catch (error) {
            console.error('Failed to delete payment:', error);
            alert("Failed to delete payment");
        }
    };

    const filteredPayments = payments.filter(p => {
        if (filterStatus === 'paid') return p.status === 'paid';
        if (filterStatus === 'not-paid') return p.status !== 'paid';
        return true;
    });

    const handleDeleteSuggestion = async (id) => {
        if (!window.confirm("Delete this suggestion?")) return;
        try {
            await axios.delete(`/suggestions/${id}`);
            setSuggestions(suggestions.filter(s => s._id !== id));
        } catch (error) {
            console.error('Failed to delete suggestion:', error);
            alert("Failed to delete suggestion");
        }
    };

    if (loading) return <div className="text-center py-20 text-slate-100 italic">Loading Admin Dashboard...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <h1 className="text-3xl font-bold mb-8 text-slate-100">Admin Dashboard</h1>

            {/* Stats Overview */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="card glass !p-6">
                        <p className="text-sm text-slate-400">Total Users</p>
                        <p className="text-2xl font-bold text-slate-100">{stats.totalUsers}</p>
                    </div>
                    <div className="card glass !p-6">
                        <p className="text-sm text-slate-400">Total Transactions</p>
                        <p className="text-2xl font-bold text-slate-100">{stats.totalTransactions}</p>
                    </div>
                    <div className="card glass !p-6">
                        <p className="text-sm text-slate-400">Total Revenue</p>
                        <p className="text-2xl font-bold text-slate-100">₹{stats.totalRevenue}</p>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="flex space-x-4 mb-6">
                <button
                    onClick={() => setActiveTab('users')}
                    className={`px-4 py-2 rounded-lg transition-colors border ${activeTab === 'users' ? 'bg-brand-600 text-white border-brand-600' : 'text-slate-300'}`}
                    style={activeTab !== 'users' ? { backgroundColor: 'var(--surface-accent)', borderColor: 'var(--border-muted)' } : {}}
                >
                    Users
                </button>
                <button
                    onClick={() => setActiveTab('payments')}
                    className={`px-4 py-2 rounded-lg transition-colors border ${activeTab === 'payments' ? 'bg-brand-600 text-white border-brand-600' : 'text-slate-300'}`}
                    style={activeTab !== 'payments' ? { backgroundColor: 'var(--surface-accent)', borderColor: 'var(--border-muted)' } : {}}
                >
                    Payments
                </button>
                <button
                    onClick={() => setActiveTab('suggestions')}
                    className={`px-4 py-2 rounded-lg transition-colors border ${activeTab === 'suggestions' ? 'bg-brand-600 text-white border-brand-600' : 'text-slate-300'}`}
                    style={activeTab !== 'suggestions' ? { backgroundColor: 'var(--surface-accent)', borderColor: 'var(--border-muted)' } : {}}
                >
                    Suggestions
                </button>
            </div>

            {/* Content */}
            <div className="card glass !p-0 overflow-hidden">
                {activeTab === 'users' && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="text-sm" style={{ backgroundColor: 'var(--surface-accent)' }}>
                                <tr className="text-slate-100" style={{ borderBottom: '1px solid var(--border-muted)' }}>
                                    <th className="px-6 py-4">Name</th>
                                    <th className="px-6 py-4">Email</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Joined</th>
                                    <th className="px-6 py-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y" style={{ borderColor: 'var(--border-muted)' }}>
                                {users.map(user => (
                                    <tr key={user._id} className="hover:bg-slate-500/5 transition-colors">
                                        <td className="px-6 py-4">{user.name}</td>
                                        <td className="px-6 py-4">{user.email}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${(user.isPaid || user.isPremium) ? 'bg-emerald-500/20 text-emerald-500' : 'bg-rose-500/20 text-rose-500'}`}>
                                                {(user.isPaid || user.isPremium) ? "Premium" : "Free"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">{new Date(user.createdAt).toLocaleDateString()}</td>
                                        <td className="px-6 py-4">
                                            <button 
                                                onClick={() => handleDelete(user._id)}
                                                className="px-3 py-1 bg-rose-500/20 text-rose-500 text-xs font-medium rounded-lg hover:bg-rose-500 hover:text-white transition-colors"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'payments' && (
                    <div className="overflow-x-auto">
                        <div className="flex space-x-2 mb-4 px-6 pt-6">
                            <button onClick={() => setFilterStatus('all')} className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors border ${filterStatus === 'all' ? 'bg-brand-600 text-white border-brand-600' : 'bg-transparent text-slate-400 border-slate-700 hover:text-slate-300'}`}>All</button>
                            <button onClick={() => setFilterStatus('paid')} className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors border ${filterStatus === 'paid' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-transparent text-slate-400 border-slate-700 hover:text-slate-300'}`}>Show Paid</button>
                            <button onClick={() => setFilterStatus('not-paid')} className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors border ${filterStatus === 'not-paid' ? 'bg-yellow-600 text-white border-yellow-600' : 'bg-transparent text-slate-400 border-slate-700 hover:text-slate-300'}`}>Show Unpaid</button>
                        </div>
                        <table className="w-full text-left">
                            <thead className="text-sm" style={{ backgroundColor: 'var(--surface-accent)' }}>
                                <tr className="text-slate-100" style={{ borderBottom: '1px solid var(--border-muted)' }}>
                                    <th className="px-6 py-4">User</th>
                                    <th className="px-6 py-4">Amount</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Order ID</th>
                                    <th className="px-6 py-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y" style={{ borderColor: 'var(--border-muted)' }}>
                                {filteredPayments.map(payment => (
                                    <tr key={payment._id} className="hover:bg-slate-500/5 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="font-medium">{payment.userId?.name}</p>
                                            <p className="text-xs text-slate-400">{payment.userId?.email}</p>
                                        </td>
                                        <td className="px-6 py-4">{payment.status === 'paid' ? `₹${payment.amount}` : '-'}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${payment.status === 'paid' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-yellow-500/20 text-yellow-500'}`}>
                                                {payment.status === 'paid' ? 'Paid' : 'Not Paid'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">{new Date(payment.createdAt).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 text-xs font-mono w-48 truncate max-w-[12rem]">{payment.orderId}</td>
                                        <td className="px-6 py-4">
                                            <button 
                                                onClick={() => handleDeletePayment(payment._id)}
                                                className="px-3 py-1 bg-rose-500/20 text-rose-500 text-xs font-medium rounded-lg hover:bg-rose-500 hover:text-white transition-colors"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'suggestions' && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="text-sm" style={{ backgroundColor: 'var(--surface-accent)' }}>
                                <tr className="text-slate-100" style={{ borderBottom: '1px solid var(--border-muted)' }}>
                                    <th className="px-6 py-4">Suggested Algorithm</th>
                                    <th className="px-6 py-4">Suggested By</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y" style={{ borderColor: 'var(--border-muted)' }}>
                                {suggestions.length > 0 ? suggestions.map(suggestion => (
                                    <tr key={suggestion._id} className="hover:bg-slate-500/5 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-slate-100 leading-none">{suggestion.title}</p>
                                            <p className="text-xs text-slate-400 mt-1.5 max-w-md italic">{suggestion.description || "No description provided."}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-medium">{suggestion.userName}</p>
                                            <p className="text-[10px] text-slate-500 font-mono tracking-tight">{suggestion.userEmail}</p>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-slate-400">
                                            {new Date(suggestion.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button 
                                                onClick={() => handleDeleteSuggestion(suggestion._id)}
                                                className="px-3 py-1 bg-rose-500/10 text-rose-500 text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-rose-500 hover:text-white transition-all"
                                            >
                                                Dismiss
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-12 text-center text-slate-500 italic">No suggestions found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
