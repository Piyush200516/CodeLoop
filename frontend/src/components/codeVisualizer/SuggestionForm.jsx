import { useState } from 'react';
import api from '../../api/axiosInstance';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

const SuggestionForm = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post('/suggestions', { title, description });
            toast.success('Thanks! Your suggestion has been recorded.');
            setTitle('');
            setDescription('');
        } catch (error) {
            console.error('Failed to submit suggestion:', error);
            toast.error('Failed to submit suggestion. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 rounded-3xl bg-brand-500/5 border border-brand-500/10 backdrop-blur-sm mt-12 mb-8"
        >
            <div className="max-w-xl mx-auto text-center space-y-4">
                <div className="inline-flex p-3 rounded-2xl bg-brand-600/10 text-brand-400 mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A4.5 4.5 0 0 0 13.5 3.5c-1.3 0-2.6.5-3.5 1.5-.8.8-1.5 1.5-2.5 1.5C6.2 6.5 5 7.7 5 9c0 1.3.5 2.6 1.5 3.5.8.8 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>
                </div>
                <h2 className="text-2xl font-black text-slate-100 uppercase tracking-tighter">Suggest a Visualizer</h2>
                <p className="text-slate-400 text-sm">Missing a specific algorithm pattern? Let us know and we'll prioritize building it for you!</p>
                
                <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-left">
                    <div className="space-y-1">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Algorithm Name</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            placeholder="e.g. Dijkstra's Algorithm, Bellman-Ford..."
                            className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-brand-500/50 transition-all font-bold"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Any Specific Details? (Optional)</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Tell us what you'd like to see visualized..."
                            rows="3"
                            className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-brand-500/50 transition-all font-bold resize-none"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full btn-brand py-4 rounded-xl font-black uppercase tracking-widest shadow-lg shadow-brand-600/20 active:scale-95 disabled:opacity-50"
                    >
                        {submitting ? 'Sending...' : 'Submit Suggestion'}
                    </button>
                </form>
            </div>
        </motion.div>
    );
};

export default SuggestionForm;
