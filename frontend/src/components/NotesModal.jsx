import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../api/axiosInstance';
import toast from 'react-hot-toast';

export default function NotesModal({ problem, onClose, onSave }) {
    const [formData, setFormData] = useState({
        notes: '',
        approach: '',
        mistakes: '',
        optimizedSolution: '',
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (problem) {
            setFormData({
                notes: problem.notes || '',
                bruteForce: problem.bruteForce || problem.approach || '',
                optimizedApproach: problem.optimizedApproach || problem.optimizedSolution || '',
                mistakes: problem.mistakes || '',
            });
        }
    }, [problem]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const { data } = await api.post(`/problems/${problem._id}/notes`, formData);
            toast.success('Notes saved! 📝');
            onSave(data);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save notes');
        } finally {
            setSaving(false);
        }
    };

    if (!problem) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-3xl max-h-[90vh] flex flex-col glass border-brand-500/20 shadow-2xl rounded-2xl overflow-hidden"
            >
                {/* Header */}
                <div className="p-6 border-b border-brand-500/10 flex items-center justify-between bg-brand-500/5">
                    <div>
                        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                            📝 Deep Dive: <span className="text-brand-400">{problem.title}</span>
                        </h2>
                        <p className="text-sm text-slate-400 mt-1">Reflect on your problem-solving journey.</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-500 hover:text-red-400 transition-colors bg-brand-500/10 hover:bg-brand-500/20 p-2 rounded-lg"
                    >
                        ✕
                    </button>
                </div>

                {/* Body / Scrollable Form Area */}
                <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-transparent">
                    <form id="notes-form" onSubmit={handleSubmit} className="space-y-6">
                        {/* Brute Force */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-bold text-orange-400 uppercase tracking-widest">
                                🐢 Brute Force Approach
                            </label>
                            <textarea
                                className="input min-h-[100px] text-sm font-mono border-orange-500/20 focus:border-orange-500/50"
                                placeholder="What was the initial, simple solution?"
                                value={formData.bruteForce}
                                onChange={(e) => setFormData({ ...formData, bruteForce: e.target.value })}
                            />
                        </div>

                        {/* Optimized Approach */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-bold text-emerald-400 uppercase tracking-widest">
                                🚀 Optimized Approach
                            </label>
                            <textarea
                                className="input min-h-[120px] text-sm font-mono border-emerald-500/20 focus:border-emerald-500/50"
                                placeholder="The efficient algorithm (Time/Space complexity optimized)..."
                                value={formData.optimizedApproach}
                                onChange={(e) => setFormData({ ...formData, optimizedApproach: e.target.value })}
                            />
                        </div>

                        {/* Mistakes */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-bold text-red-400 uppercase tracking-widest">
                                🛑 Mistakes I Made
                            </label>
                            <textarea
                                className="input min-h-[100px] text-sm font-mono border-red-500/20 focus:border-red-500/50"
                                placeholder="Logical errors, edge cases missed, or syntax blockers..."
                                value={formData.mistakes}
                                onChange={(e) => setFormData({ ...formData, mistakes: e.target.value })}
                            />
                        </div>

                        {/* General Notes */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-400 uppercase tracking-widest">
                                📌 Additional Notes
                            </label>
                            <textarea
                                className="input min-h-[80px] text-sm font-mono"
                                placeholder="Links, related problems, or more context..."
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            />
                        </div>
                    </form>
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-brand-500/10 bg-brand-500/5 flex items-center justify-end gap-4 shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="btn-secondary px-6"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="notes-form"
                        disabled={saving}
                        className="btn-primary px-8 flex items-center gap-2 shadow-brand-600/20"
                    >
                        {saving ? (
                            <>
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Saving...
                            </>
                        ) : 'Save Notes'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
