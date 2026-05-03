import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axiosInstance';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import PremiumPaywall from '../components/PremiumPaywall';

const TOPICS = [
    'Sliding Window', 'Two Pointers', 'Prefix Sum', 'Binary Search', 'DP', 'Recursion', 
    'Backtracking', 'Greedy', 'DFS', 'BFS', 'Union Find', 'Bit Manipulation', 'Hashing', 'Hash Map'
];

const CATEGORIES = [
    'Array', 'String', 'Linked List', 'Tree', 'Graph', 'Heap', 'Stack', 'Queue', 'Trie', 'Hash Map'
];

const defaultForm = {
    title: '',
    leetcodeUrl: '',
    difficulty: 'Medium',
    category: 'Array',
    topics: [],
    notes: '',
    timeComplexity: '',
    keyAlgorithmIdea: '',
    solvedDate: new Date().toISOString().split('T')[0],
};

export default function AddProblem() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);
    const [form, setForm] = useState(defaultForm);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(isEdit);
    const [isPaywallOpen, setIsPaywallOpen] = useState(false);
    const [paywallReason, setPaywallReason] = useState('');
    const [showOtherInput, setShowOtherInput] = useState(false);
    const [otherTopic, setOtherTopic] = useState('');

    useEffect(() => {
        if (isEdit) {
            api.get(`/problems/${id}`)
                .then(({ data }) => {
                    const standardTopics = data.topics.filter(t => TOPICS.includes(t));
                    const custom = data.topics.find(t => !TOPICS.includes(t));

                    setForm({
                        title: data.title,
                        leetcodeUrl: data.leetcodeUrl || '',
                        difficulty: data.difficulty,
                        category: data.category || 'Array',
                        topics: standardTopics,
                        notes: data.notes || '',
                        timeComplexity: data.timeComplexity || '',
                        keyAlgorithmIdea: data.keyAlgorithmIdea || '',
                        solvedDate: new Date(data.solvedDate).toISOString().split('T')[0],
                    });

                    if (custom) {
                        setShowOtherInput(true);
                        setOtherTopic(custom);
                    }
                })
                .catch(() => toast.error('Failed to load problem'))
                .finally(() => setFetching(false));
        }
    }, [id, isEdit]);

    const toggleTopic = (topic) => {
        setForm((prev) => ({
            ...prev,
            topics: prev.topics.includes(topic)
                ? prev.topics.filter((t) => t !== topic)
                : [...prev.topics, topic],
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title.trim()) return toast.error('Title is required');
        
        const finalTopics = [...form.topics];
        if (showOtherInput && otherTopic.trim()) {
            finalTopics.push(otherTopic.trim());
        }

        if (finalTopics.length === 0) return toast.error('Select at least one topic');
        
        setLoading(true);
        try {
            const submissionData = { ...form, topics: finalTopics };
            if (isEdit) {
                await api.put(`/problems/${id}`, submissionData);
                toast.success('Problem updated! ✅');
            } else {
                await api.post('/problems', submissionData);
                toast.success('Problem added! 🎉');
            }
            navigate('/problems');
        } catch (err) {
            if (err.response?.status === 403 && err.response?.data?.requirePremium) {
                setPaywallReason(err.response.data.message);
                setIsPaywallOpen(true);
            } else {
                toast.error(err.response?.data?.message || 'Save failed');
            }
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-brand-600/30 border-t-brand-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 animate-slide-up">
            <PremiumPaywall 
                isOpen={isPaywallOpen} 
                onClose={() => setIsPaywallOpen(false)} 
                featureName="Unlimited Question Tracking"
                description={paywallReason}
            />
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-slate-100">
                    {isEdit ? '✏️ Edit Problem' : '➕ Add Problem'}
                </h1>
                <p className="text-slate-400 mt-1">
                    {isEdit ? 'Update problem details' : 'Track a new solved problem'}
                </p>
            </div>

            <div className="card">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">
                            Problem Title <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            className="input"
                            placeholder="e.g. Two Sum"
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            required
                        />
                    </div>

                    {/* LeetCode URL */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">LeetCode URL</label>
                        <input
                            type="url"
                            className="input"
                            placeholder="https://leetcode.com/problems/two-sum/"
                            value={form.leetcodeUrl}
                            onChange={(e) => setForm({ ...form, leetcodeUrl: e.target.value })}
                        />
                    </div>

                    {/* Difficulty */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">
                            Difficulty <span className="text-red-400">*</span>
                        </label>
                        <div className="flex gap-3">
                            {['Easy', 'Medium', 'Hard'].map((d) => (
                                <button
                                    key={d}
                                    type="button"
                                    onClick={() => setForm({ ...form, difficulty: d })}
                                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-200 ${form.difficulty === d
                                        ? d === 'Easy' ? 'bg-emerald-500/20 text-emerald-600 border-emerald-500/50' :
                                            d === 'Medium' ? 'bg-yellow-500/20 text-yellow-600 border-yellow-500/50' :
                                                'bg-red-500/20 text-red-600 border-red-500/50'
                                        : 'bg-brand-500/5 text-slate-400 border-brand-500/10 hover:border-brand-500/30'
                                        }`}
                                >
                                    {d}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Category */}
                    <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Category <span className="text-red-400">*</span>
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat}
                                    type="button"
                                    onClick={() => setForm({ ...form, category: cat })}
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150 ${form.category === cat
                                        ? 'bg-indigo-600/30 text-indigo-400 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                                        : 'bg-brand-500/5 text-slate-400 border-brand-500/10 hover:border-brand-500/30 hover:text-slate-300'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Topics */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Topics <span className="text-red-400">*</span>
                            <span className="text-slate-500 font-normal ml-1">({form.topics.length} selected)</span>
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {TOPICS.map((topic) => (
                                <button
                                    key={topic}
                                    type="button"
                                    onClick={() => toggleTopic(topic)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150 ${form.topics.includes(topic)
                                        ? 'bg-brand-600/30 text-brand-600 border-brand-500/50'
                                        : 'bg-brand-500/5 text-slate-400 border-brand-500/10 hover:border-brand-500/30 hover:text-slate-300'
                                        }`}
                                >
                                    {form.topics.includes(topic) ? '✓ ' : ''}{topic}
                                </button>
                            ))}
                            <button
                                type="button"
                                onClick={() => setShowOtherInput(!showOtherInput)}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150 ${showOtherInput
                                    ? 'bg-brand-600/30 text-brand-600 border-brand-500/50'
                                    : 'bg-brand-500/5 text-slate-400 border-brand-500/10 hover:border-brand-500/30 hover:text-slate-300'
                                    }`}
                            >
                                {showOtherInput ? '✓ ' : '+ '}Other
                            </button>
                        </div>

                        <AnimatePresence>
                            {showOtherInput && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="pt-3 overflow-hidden"
                                >
                                    <input
                                        type="text"
                                        className="input text-sm h-10"
                                        placeholder="Enter custom topic name..."
                                        value={otherTopic}
                                        onChange={(e) => setOtherTopic(e.target.value)}
                                        autoFocus
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Flashcard Data */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5 text-brand-400/80 uppercase tracking-widest font-black text-[10px]">Time Complexity</label>
                            <input
                                type="text"
                                className="input h-10 text-sm"
                                placeholder="e.g. O(n log n)"
                                value={form.timeComplexity}
                                onChange={(e) => setForm({ ...form, timeComplexity: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5 text-brand-400/80 uppercase tracking-widest font-black text-[10px]">Key Algorithm Idea</label>
                            <input
                                type="text"
                                className="input h-10 text-sm"
                                placeholder="e.g. target - nums[i]"
                                value={form.keyAlgorithmIdea}
                                onChange={(e) => setForm({ ...form, keyAlgorithmIdea: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Solved Date */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Date Solved</label>
                        <input
                            type="date"
                            className="input"
                            value={form.solvedDate}
                            onChange={(e) => setForm({ ...form, solvedDate: e.target.value })}
                        />
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Notes / Approach</label>
                        <textarea
                            className="input min-h-[120px] resize-y"
                            placeholder="Describe your approach, key insights, time/space complexity..."
                            value={form.notes}
                            onChange={(e) => setForm({ ...form, notes: e.target.value })}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
                            {loading ? (
                                <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                isEdit ? 'Update Problem' : 'Add Problem'
                            )}
                        </button>
                        <button type="button" onClick={() => navigate(-1)} className="btn-secondary px-6">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
