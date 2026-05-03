import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Filler,
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import api from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import StatCard from '../components/StatCard';
import PremiumPaywall from '../components/PremiumPaywall';

// Register ChartJS components
ChartJS.register(
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Filler
);

export default function Dashboard() {
    const { user } = useAuth();
    const { theme } = useTheme();
    const [stats, setStats] = useState(null);
    const [weeklyStats, setWeeklyStats] = useState(null);
    const [reminders, setReminders] = useState({ count: 0, reminders: [] });
    const [loading, setLoading] = useState(true);
    const [isPaywallOpen, setIsPaywallOpen] = useState(false);
    const [paywallFeature, setPaywallFeature] = useState('');

    const ADMIN_EMAIL = (import.meta.env.VITE_ADMIN_EMAIL || 'coderecallapp@gmail.com').toLowerCase().trim();
    const isPremium = user?.isPremium || user?.isPaid || user?.email?.toLowerCase().trim() === ADMIN_EMAIL;
    const isDark = theme === 'dark';

    const triggerPaywall = (feature) => {
        setPaywallFeature(feature);
        setIsPaywallOpen(true);
    };

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [dashboardRes, weeklyRes, reminderRes] = await Promise.all([
                    api.get('/dashboard'),
                    api.get('/analytics/weekly'),
                    api.get('/problems/reminders')
                ]);
                setStats(dashboardRes.data);
                setWeeklyStats(weeklyRes.data);
                setReminders(reminderRes.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-brand-600/20 border-t-brand-500 rounded-full animate-spin" />
            </div>
        );
    }

    const topicLabels = Object.keys(stats?.topicDistribution || {});
    const topicDataValues = Object.values(stats?.topicDistribution || {});

    const topicData = {
        labels: topicLabels,
        datasets: [
            {
                label: '# of Problems',
                data: topicDataValues,
                backgroundColor: [
                    'rgba(14, 165, 233, 0.6)',
                    'rgba(139, 92, 246, 0.6)',
                    'rgba(16, 185, 129, 0.6)',
                    'rgba(245, 158, 11, 0.6)',
                    'rgba(239, 68, 68, 0.6)',
                    'rgba(99, 102, 241, 0.6)',
                    'rgba(236, 72, 153, 0.6)',
                ],
                borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                borderWidth: 2,
                hoverOffset: 15,
            },
        ],
    };

    const difficultyData = {
        labels: ['Easy', 'Medium', 'Hard'],
        datasets: [
            {
                label: 'Count',
                data: [
                    stats?.difficultyDistribution?.Easy || 0,
                    stats?.difficultyDistribution?.Medium || 0,
                    stats?.difficultyDistribution?.Hard || 0,
                ],
                backgroundColor: [
                    'rgba(16, 185, 129, 0.4)',
                    'rgba(245, 158, 11, 0.4)',
                    'rgba(239, 68, 68, 0.4)',
                ],
                borderColor: [
                    '#10b981',
                    '#f59e0b',
                    '#ef4444',
                ],
                borderWidth: 2,
                borderRadius: 8,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    color: isDark ? '#94a3b8' : '#334155',
                    font: { size: 12, family: 'Inter' },
                    padding: 20,
                    usePointStyle: true,
                },
            },
            tooltip: {
                backgroundColor: isDark ? '#1e293b' : '#ffffff',
                titleColor: isDark ? '#f1f5f9' : '#020617',
                bodyColor: isDark ? '#94a3b8' : '#334155',
                borderColor: isDark ? '#334155' : '#e2e8f0',
                borderWidth: 1,
                padding: 12,
                cornerRadius: 10,
                displayColors: false,
            },
        },
    };

    const barOptions = {
        ...chartOptions,
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: isDark ? 'rgba(51, 65, 85, 0.3)' : 'rgba(226, 232, 240, 0.8)' },
                ticks: { color: isDark ? '#64748b' : '#475569', stepSize: 1 },
            },
            x: {
                grid: { display: false },
                ticks: { color: isDark ? '#64748b' : '#475569' },
            },
        },
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 },
        },
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 },
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8"
        >
            <PremiumPaywall 
                isOpen={isPaywallOpen} 
                onClose={() => setIsPaywallOpen(false)} 
                featureName={paywallFeature}
            />

            {/* Greeting */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold text-slate-100 tracking-tight">
                        Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-indigo-400">{user?.name?.split(' ')[0]}</span>
                    </h1>
                    <p className="text-slate-400 mt-2 text-lg">Here's your coding progress at a glance.</p>
                </div>
                {!isPremium && (
                    <button 
                        onClick={() => triggerPaywall('Advanced Insights')}
                        className="bg-brand-600/10 text-brand-400 border border-brand-500/20 px-4 py-2 rounded-xl text-sm font-black hover:bg-brand-600/20 transition-all flex items-center gap-2"
                    >
                        <span>💎</span> Upgrade to Premium
                    </button>
                )}
            </motion.div>

            {/* Stats Summary */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="relative group h-full">
                    <StatCard
                        icon="🚀"
                        label="Total Solved"
                        value={stats?.totalSolved || 0}
                        color="text-brand-400"
                        bg="bg-brand-500/10"
                        border="border-brand-500/20"
                    />
                    <span className="absolute top-2 right-2 text-[10px] font-black bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">🟢 FREE</span>
                </div>
                <div className="relative group h-full">
                    <StatCard
                        icon="🔥"
                        label="Due Today"
                        value={stats?.dueToday || 0}
                        color="text-yellow-400"
                        bg="bg-yellow-500/10"
                        border="border-yellow-500/20"
                        extra={stats?.dueToday > 0 && (
                            <Link to="/review" className="text-xs font-bold text-brand-400 hover:text-brand-300 mt-2 inline-block">
                                REVIEW NOW →
                            </Link>
                        )}
                    />
                    <span className="absolute top-2 right-2 text-[10px] font-black bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">🟢 FREE</span>
                </div>
                <div className="relative group overflow-hidden cursor-pointer h-full" onClick={() => !isPremium && triggerPaywall('Mastery Analytics')}>
                    <StatCard
                        icon="🧠"
                        label="Topics"
                        value={topicLabels.length}
                        color="text-purple-400"
                        bg="bg-purple-500/10"
                        border="border-purple-500/20"
                    />
                    {!isPremium && (
                        <div className="absolute inset-0 bg-dark-900/60 backdrop-blur-md flex flex-col items-center justify-center z-10">
                            <span className="text-2xl">🔒</span>
                            <p className="text-[10px] font-bold text-slate-400 mt-1">PREMIUM</p>
                        </div>
                    )}
                    <span className={`absolute top-2 right-2 text-[10px] font-black px-2 py-0.5 rounded-full border ${isPremium ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' : 'bg-slate-500/20 text-slate-400 border-slate-500/30'}`}>
                        {isPremium ? '💎 PREMIUM' : '🔒 PREMIUM'}
                    </span>
                </div>
                <div className="card glass flex flex-col justify-center items-center text-center p-6 border-dashed border-dark-600 h-full">
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">New Challenge</p>
                    <Link to="/manage" className="btn-primary w-full py-2 shadow-lg shadow-brand-600/20">
                        Add Problem
                    </Link>
                </div>
            </motion.div>

            {/* Daily Revisions Section */}
            <motion.div variants={itemVariants} className="card glass relative overflow-hidden bg-brand-500/5 group">
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                    <span className="text-6xl">⏰</span>
                </div>
                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <h2 className="text-lg font-bold text-slate-100 uppercase tracking-tight flex items-center gap-2">
                                <span className="text-brand-400">📅</span> Daily Revisions
                            </h2>
                            <span className="text-[10px] font-black bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">🟢 FREE</span>
                        </div>
                        <span className={`text-xs font-black px-3 py-1 rounded-full border ${reminders.count > 0 ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' : 'bg-brand-500/10 text-slate-500 border-brand-500/10'}`}>
                            {reminders.count} Tasks Today
                        </span>
                    </div>

                    {reminders.count > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {reminders.reminders.slice(0, 6).map((p) => (
                                <div 
                                    key={p._id}
                                    className="p-3 bg-brand-500/10 rounded-xl border border-brand-500/10 hover:border-brand-400/30 transition-all flex items-center justify-between group/item"
                                >
                                    <div className="min-w-0 pr-2">
                                        <a 
                                            href={p.leetcodeUrl} 
                                            target="_blank" 
                                            rel="noreferrer" 
                                            className="text-sm font-bold text-slate-200 truncate hover:text-brand-400 transition-colors block"
                                            title="Open on LeetCode"
                                        >
                                            {p.title}
                                        </a>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{p.difficulty}</p>
                                    </div>
                                    <Link 
                                        to="/review" 
                                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-brand-500/10 hover:bg-brand-500/30 text-brand-400 transition-all border border-brand-500/20"
                                        title="Revise now"
                                    >
                                        🔄
                                    </Link>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-6 text-center">
                            <p className="text-slate-400 italic text-sm">All caught up! No major revisions due for today. ✨</p>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Weekly Spotlight - Premium Required Overlay */}
            <motion.div 
                variants={itemVariants} 
                className={`card glass relative overflow-hidden group transition-all ${!isPremium ? 'cursor-pointer' : ''}`}
                onClick={() => !isPremium && triggerPaywall('Progress Analytics')}
            >
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-brand-400 to-indigo-500"></div>
                <div className="flex items-center justify-between mb-4 pl-4">
                    <div className="flex items-center gap-3">
                        <h2 className="text-lg font-bold text-slate-100 uppercase tracking-tight flex items-center gap-2">
                            <span className="text-brand-400">⚡</span> Weekly Spotlight
                        </h2>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${isPremium ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' : 'bg-slate-500/20 text-slate-400 border-slate-500/30'}`}>
                            {isPremium ? '💎 PREMIUM' : '🔒 PREMIUM'}
                        </span>
                    </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pl-4 relative">
                    {!isPremium && (
                        <div className="absolute inset-0 bg-dark-950/70 backdrop-blur-md z-20 flex flex-col items-center justify-center">
                            <span className="text-3xl mb-2">🔒</span>
                            <p className="text-brand-400 font-black text-sm tracking-widest uppercase">Unlock with Premium</p>
                        </div>
                    )}
                    <div className="bg-brand-500/5 p-4 rounded-xl border border-brand-500/10">
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Solved</p>
                        <p className="text-2xl font-black text-brand-500">{weeklyStats?.solved || 0}</p>
                    </div>
                    <div className="bg-brand-500/5 p-4 rounded-xl border border-brand-500/10">
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Revisions</p>
                        <p className="text-2xl font-black text-emerald-500">{weeklyStats?.revisions || 0}</p>
                    </div>
                    <div className="bg-brand-500/5 p-4 rounded-xl border border-brand-500/10">
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Strongest</p>
                        <p className="text-lg font-bold text-indigo-400 truncate" title={weeklyStats?.strongestTopic || 'N/A'}>
                            {weeklyStats?.strongestTopic || 'N/A'}
                        </p>
                    </div>
                    <div className="bg-brand-500/5 p-4 rounded-xl border border-brand-500/10">
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Weakest</p>
                        <p className="text-lg font-bold text-orange-400 truncate" title={weeklyStats?.weakestTopic || 'N/A'}>
                            {weeklyStats?.weakestTopic || 'N/A'}
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Topic Distribution */}
                <motion.div 
                    variants={itemVariants} 
                    className="lg:col-span-1 card glass space-y-6 relative group"
                    onClick={() => !isPremium && triggerPaywall('Topic Mastery Charts')}
                >
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                            <span className="text-brand-400 text-xl">📊</span> Topic Mastery
                        </h2>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${isPremium ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' : 'bg-slate-500/20 text-slate-400 border-slate-500/30'}`}>
                            {isPremium ? '💎 PREMIUM' : '🔒 PREMIUM'}
                        </span>
                    </div>
                    <div className="h-[300px] relative">
                         {!isPremium && (
                            <div className="absolute inset-0 bg-dark-950/70 backdrop-blur-md z-20 flex flex-col items-center justify-center">
                                <span className="text-3xl mb-2">🔒</span>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Upgrade for Topic Mastery</p>
                            </div>
                        )}
                        {topicDataValues.every(v => v === 0) ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                                <p className="text-sm italic">Add problems to see distribution</p>
                            </div>
                        ) : (
                            <Doughnut data={topicData} options={chartOptions} />
                        )}
                    </div>
                </motion.div>

                {/* Difficulty Breakdown */}
                <motion.div 
                    variants={itemVariants} 
                    className="lg:col-span-2 card glass space-y-6 relative group"
                    onClick={() => !isPremium && triggerPaywall('Difficulty Analytics')}
                >
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                            <span className="text-emerald-400 text-xl">📈</span> Difficulty Distribution
                        </h2>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${isPremium ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' : 'bg-slate-500/20 text-slate-400 border-slate-500/30'}`}>
                            {isPremium ? '💎 PREMIUM' : '🔒 PREMIUM'}
                        </span>
                    </div>
                    <div className="h-[300px] relative">
                        {!isPremium && (
                            <div className="absolute inset-0 bg-dark-950/70 backdrop-blur-md z-20 flex flex-col items-center justify-center">
                                <span className="text-3xl mb-2">🔒</span>
                                <p className="text-brand-400 font-black text-sm">Upgrade for Difficulty Analytics</p>
                            </div>
                        )}
                        <Bar data={difficultyData} options={barOptions} />
                    </div>
                </motion.div>
            </div>

            {/* Recently Added Table/List */}
            <motion.div variants={itemVariants} className="card glass overflow-hidden">
                <div className="flex items-center justify-between mb-6 p-2">
                    <div className="flex items-center gap-3">
                        <h2 className="text-lg font-bold text-slate-200 uppercase tracking-tight">Recently Added Problems</h2>
                        <span className="text-[10px] font-black bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">🟢 FREE</span>
                    </div>
                    <Link to="/manage" className="text-brand-400 text-sm font-bold hover:text-brand-300">
                        View All →
                    </Link>
                </div>
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-brand-500/10 text-slate-500 text-xs uppercase tracking-widest">
                                <th className="pb-4 px-4 font-bold">Problem</th>
                                <th className="pb-4 px-4 font-bold">Difficulty</th>
                                <th className="pb-4 px-4 font-bold">Topics</th>
                                <th className="pb-4 px-4 font-bold">Next Review</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-500/5">
                            {stats?.recentProblems?.length > 0 ? (
                                stats.recentProblems.map((p) => (
                                    <tr key={p._id} className="group hover:bg-brand-500/5 transition-colors">
                                        <td className="py-4 px-4 text-slate-100 font-medium">
                                            <a href={p.leetcodeUrl} target="_blank" rel="noreferrer" className="hover:text-brand-400 transition-colors">
                                                {p.title}
                                            </a>
                                        </td>
                                        <td className="py-4 px-4 text-slate-100 font-medium">
                                            <span className={
                                                p.difficulty === 'Easy' ? 'badge-easy' :
                                                p.difficulty === 'Medium' ? 'badge-medium' : 'badge-hard'
                                            }>{p.difficulty}</span>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="flex flex-wrap gap-1.5">
                                                {p.topics.slice(0, 2).map((t) => (
                                                    <span key={t} className="topic-tag text-[10px]">{t}</span>
                                                ))}
                                                {p.topics.length > 2 && <span className="text-slate-500 text-[10px]">+{p.topics.length - 2}</span>}
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 text-slate-400 text-sm">
                                            {new Date(p.nextRevisionDate).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="py-12 text-center text-slate-500 italic">
                                        No problems solved yet. Start adding!
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </motion.div>
    );
}

function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
}
