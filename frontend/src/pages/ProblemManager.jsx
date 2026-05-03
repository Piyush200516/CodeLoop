import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axiosInstance';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import NotesModal from '../components/NotesModal';

const TOPICS = ['Arrays', 'Strings', 'Linked List', 'Trees', 'Graphs', 'DP', 'Binary Search',
    'Sliding Window', 'Two Pointers', 'Stack', 'Queue', 'Heap', 'Trie', 'Recursion', 'Backtracking'];

const defaultForm = {
    title: '',
    leetcodeUrl: '',
    difficulty: 'Medium',
    topics: [],
    notes: '',
    solvedDate: new Date().toISOString().split('T')[0],
};

export default function ProblemManager() {
    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ topic: '', difficulty: '', search: '' });
    const [showAddForm, setShowAddForm] = useState(false);
    const [form, setForm] = useState(defaultForm);
    const [submitting, setSubmitting] = useState(false);
    const [deleting, setDeleting] = useState(null);
    const [editingNotesProblem, setEditingNotesProblem] = useState(null);
    const [showOtherInput, setShowOtherInput] = useState(false);
    const [otherTopic, setOtherTopic] = useState('');

    const handleNotesSave = (updatedProblem) => {
        setProblems((prev) => 
            prev.map(p => p._id === updatedProblem._id ? updatedProblem : p)
        );
        setEditingNotesProblem(null);
    };

    const fetchProblems = async () => {
        try {
            const params = {};
            if (filters.topic) params.topic = filters.topic;
            if (filters.difficulty) params.difficulty = filters.difficulty;
            if (filters.search) params.search = filters.search;
            const { data } = await api.get('/problems', { params });
            setProblems(data);
        } catch (err) {
            toast.error('Failed to fetch problems');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(fetchProblems, 300);
        return () => clearTimeout(timer);
    }, [filters]);

    const toggleTopic = (topic) => {
        setForm((prev) => ({
            ...prev,
            topics: prev.topics.includes(topic)
                ? prev.topics.filter((t) => t !== topic)
                : [...prev.topics, topic],
        }));
    };

    const handleAddProblem = async (e) => {
        e.preventDefault();
        if (!form.title.trim()) return toast.error('Title is required');
        
        const finalTopics = [...form.topics];
        if (showOtherInput && otherTopic.trim()) {
            finalTopics.push(otherTopic.trim());
        }

        if (finalTopics.length === 0) return toast.error('Select at least one topic');

        setSubmitting(true);
        try {
            await api.post('/problems', { ...form, topics: finalTopics });
            toast.success('Problem added! 🎉');
            setForm(defaultForm);
            setShowOtherInput(false);
            setOtherTopic('');
            setShowAddForm(false);
            fetchProblems();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Save failed');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this problem?')) return;
        setDeleting(id);
        try {
            await api.delete(`/problems/${id}`);
            setProblems((prev) => prev.filter((p) => p._id !== id));
            toast.success('Problem deleted');
        } catch {
            toast.error('Delete failed');
        } finally {
            setDeleting(null);
        }
    };


    const getDueStatus = (nextRevisionDate) => {
        const now = new Date();
        const due = new Date(nextRevisionDate);
        const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
        if (diffDays <= 0) return { label: 'Due today', cls: 'text-yellow-400' };
        if (diffDays === 1) return { label: 'Due tomorrow', cls: 'text-orange-400' };
        return { label: `Due in ${diffDays}d`, cls: 'text-slate-500' };
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
                <div>
                    <h1 className="text-4xl font-extrabold text-slate-100 tracking-tight">
                        Problem <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-indigo-400">Manager</span>
                    </h1>
                    <p className="text-slate-400 mt-2">Add, track, and master your LeetCode goals.</p>
                </div>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="btn-primary flex items-center justify-center gap-2 py-3 px-6 shadow-brand-600/20"
                >
                    {showAddForm ? '✕ Close Form' : '➕ Add New Problem'}
                </button>
            </div>

            {/* Add Problem Form Section */}
            <AnimatePresence>
                {showAddForm && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="card border-brand-500/20 glass shadow-2xl">
                            <form onSubmit={handleAddProblem} className="grid grid-cols-1 md:grid-cols-2 gap-6 p-2">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Problem Title</label>
                                        <input
                                            type="text"
                                            className="input"
                                            placeholder="e.g. Spiral Matrix"
                                            value={form.title}
                                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1.5">LeetCode URL</label>
                                        <input
                                            type="url"
                                            className="input"
                                            placeholder="https://leetcode.com/..."
                                            value={form.leetcodeUrl}
                                            onChange={(e) => setForm({ ...form, leetcodeUrl: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Difficulty</label>
                                        <div className="flex gap-2">
                                            {['Easy', 'Medium', 'Hard'].map((d) => (
                                                <button
                                                    key={d}
                                                    type="button"
                                                    onClick={() => setForm({ ...form, difficulty: d })}
                                                    className={`flex-1 py-2 rounded-lg text-sm font-bold border transition-all ${form.difficulty === d
                                                        ? 'bg-brand-500/20 text-brand-400 border-brand-500/50 shadow-inner'
                                                        : 'bg-brand-500/5 text-slate-500 border-brand-500/10 hover:border-brand-500/30'
                                                        }`}
                                                >
                                                    {d}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 text-center sm:text-left">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Topics</label>
                                        <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                                            {TOPICS.map((topic) => (
                                                <button
                                                    key={topic}
                                                    type="button"
                                                    onClick={() => toggleTopic(topic)}
                                                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all ${form.topics.includes(topic)
                                                        ? 'bg-brand-500/40 text-white border-brand-400'
                                                        : 'bg-brand-500/10 text-slate-500 border-brand-500/10 hover:border-brand-500/30'
                                                        }`}
                                                >
                                                    {topic}
                                                </button>
                                            ))}
                                            <button
                                                type="button"
                                                onClick={() => setShowOtherInput(!showOtherInput)}
                                                className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all ${showOtherInput
                                                    ? 'bg-brand-500/40 text-white border-brand-400'
                                                    : 'bg-brand-500/10 text-slate-500 border-brand-500/10 hover:border-brand-500/30'
                                                    }`}
                                            >
                                                {showOtherInput ? '✓ ' : '+ '}Other
                                            </button>
                                        </div>
                                        {showOtherInput && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="mt-2 overflow-hidden"
                                            >
                                                <input
                                                    type="text"
                                                    className="input text-[11px] py-1.5 h-8"
                                                    placeholder="Custom topic..."
                                                    value={otherTopic}
                                                    onChange={(e) => setOtherTopic(e.target.value)}
                                                    autoFocus
                                                />
                                            </motion.div>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Quick Notes</label>
                                        <textarea
                                            className="input min-h-[80px] text-sm"
                                            placeholder="Key insights..."
                                            value={form.notes}
                                            onChange={(e) => setForm({ ...form, notes: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="md:col-span-2 flex justify-end gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddForm(false)}
                                        className="btn-secondary px-6"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="btn-primary px-10 relative overflow-hidden group"
                                    >
                                        <span className={submitting ? 'opacity-0' : 'opacity-100'}>Save Problem</span>
                                        {submitting && (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            </div>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* sidebar Filters */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="card glass sticky top-24">
                        <h2 className="text-sm font-bold text-brand-400 uppercase tracking-widest mb-4">Filters</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-slate-500 mb-1 block">Search Title</label>
                                <input
                                    type="text"
                                    className="input py-2 text-sm"
                                    placeholder="Keywords..."
                                    value={filters.search}
                                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 mb-1 block">Difficulty</label>
                                <select
                                    className="input py-2 text-sm"
                                    value={filters.difficulty}
                                    onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
                                >
                                    <option value="">All Levels</option>
                                    <option value="Easy">Easy</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Hard">Hard</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 mb-1 block">Main Topic</label>
                                <select
                                    className="input py-2 text-sm"
                                    value={filters.topic}
                                    onChange={(e) => setFilters({ ...filters, topic: e.target.value })}
                                >
                                    <option value="">All Topics</option>
                                    {TOPICS.map((t) => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <button
                                onClick={() => setFilters({ topic: '', difficulty: '', search: '' })}
                                className="w-full text-xs text-slate-500 hover:text-brand-400 transition-colors pt-2"
                            >
                                Reset Filters
                            </button>
                        </div>
                    </div>
                </div>

                {/* Problems List Area */}
                <div className="lg:col-span-3 space-y-4">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <div className="w-12 h-12 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin" />
                            <p className="text-slate-500 animate-pulse">Loading problems...</p>
                        </div>
                    ) : problems.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="card text-center py-24 glass border-dashed"
                        >
                            <div className="text-5xl mb-4">🔍</div>
                            <h3 className="text-xl font-bold text-slate-300">No problems found</h3>
                            <p className="text-slate-500 mt-1">Try a different search or add a new problem above.</p>
                        </motion.div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            <AnimatePresence mode="popLayout">
                                {problems.map((p) => {
                                    const due = getDueStatus(p.nextRevisionDate);
                                    return (
                                        <motion.div
                                            key={p._id}
                                            layout
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className="card glass hover:border-brand-500/40 hover:shadow-brand-500/5 group"
                                        >
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className={
                                                            p.difficulty === 'Easy' ? 'badge-easy' :
                                                                p.difficulty === 'Medium' ? 'badge-medium' : 'badge-hard'
                                                        }>
                                                            {p.difficulty}
                                                        </span>
                                                        <span className="text-xs text-slate-500">#{p.revisionCount} reviews</span>
                                                    </div>
                                                    <h3 className="text-lg font-bold text-slate-100 group-hover:text-brand-400 transition-colors truncate">
                                                        <a href={p.leetcodeUrl} target="_blank" rel="noreferrer" className="hover:underline">
                                                            {p.title}
                                                        </a>
                                                    </h3>
                                                    <div className="flex flex-wrap gap-2 mt-3">
                                                        {p.topics.map(t => <span key={t} className="topic-tag">{t}</span>)}
                                                    </div>
                                                    
                                                    {(p.notes || p.bruteForce || p.optimizedApproach || p.mistakes) && (
                                                        <div className="mt-4 pt-3 border-t border-white/5 space-y-2">
                                                            {p.mistakes && (
                                                                <p className="text-[10px] text-red-500/80 font-bold uppercase tracking-tight">Mistakes: <span className="text-slate-400 normal-case font-medium line-clamp-1">{p.mistakes}</span></p>
                                                            )}
                                                            {(p.notes || p.bruteForce || p.optimizedApproach) && (
                                                                <p className="text-[11px] text-slate-500 line-clamp-2 italic leading-relaxed">
                                                                    {p.notes || p.optimizedApproach || p.bruteForce}
                                                                </p>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex flex-col sm:items-end gap-3 shrink-0">
                                                    <div className={`text-xs font-bold tracking-tight ${due.cls} bg-brand-500/5 px-2 py-1 rounded border border-brand-500/10`}>
                                                        {due.label}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => setEditingNotesProblem(p)}
                                                            className="btn-secondary p-2 group-hover:bg-brand-500/10"
                                                            title="Deep Dive Notes"
                                                        >
                                                            📝
                                                        </button>
                                                        <Link to={`/edit/${p._id}`} className="btn-secondary p-2 group-hover:bg-brand-500/10">
                                                            ✏️
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(p._id)}
                                                            title="Delete"
                                                            className="btn-danger p-2 border-none bg-red-500/10 hover:bg-red-500/20 text-red-500"
                                                        >
                                                            🗑️
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                            {p.leetcodeUrl && (
                                                <a
                                                    href={p.leetcodeUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-[10px] text-slate-500 mt-4 inline-block hover:text-brand-400"
                                                >
                                                    LC LINK: {p.leetcodeUrl} ↗
                                                </a>
                                            )}
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </div>

            <AnimatePresence>
                {editingNotesProblem && (
                    <NotesModal
                        problem={editingNotesProblem}
                        onClose={() => setEditingNotesProblem(null)}
                        onSave={handleNotesSave}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
