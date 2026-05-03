import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../api/axiosInstance';

export default function RecallInsights() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const { data } = await api.get('/revision/recall-stats');
            setStats(data);
        } catch (error) {
            console.error('Failed to fetch stats');
        } finally {
            setLoading(false);
        }
    };

    if (loading || !stats || stats.totalSessions === 0) return null;

    const weakPatterns = Object.entries(stats.patternStats)
        .map(([pattern, counts]) => ({ pattern, ...counts }))
        .sort((a, b) => b.forgot - a.forgot)
        .slice(0, 3);

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card glass border-brand-500/10 p-8 space-y-6"
        >
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-slate-100 uppercase tracking-tight">Revision Insights</h2>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-500/10 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-500/10 dark:border-transparent">
                    Based on {stats.totalSessions} sessions
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {weakPatterns.map((wp, i) => (
                    <div key={i} className="bg-brand-500/5 rounded-2xl p-6 border border-white/5 space-y-3">
                        <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Weak Pattern</p>
                        <h3 className="text-xl font-bold text-slate-100">{wp.pattern}</h3>
                        <div className="flex items-end gap-2">
                            <span className="text-2xl font-black text-red-500">{wp.forgot}</span>
                            <span className="text-[10px] text-slate-500 font-bold uppercase mb-1.5">Times Forgotten</span>
                        </div>
                        {/* Simple progress bar showing ratio */}
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mt-2">
                             <div 
                                className="h-full bg-red-500" 
                                style={{ width: `${(wp.forgot / (wp.forgot + wp.remembered)) * 100}%` }}
                             />
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>
    );
}
