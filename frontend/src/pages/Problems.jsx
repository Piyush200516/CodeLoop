import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import api from '../api/axiosInstance';
import toast from 'react-hot-toast';
import ProblemCard from '../components/ProblemCard';
import NotesModal from '../components/NotesModal';

const TOPICS = ['Arrays', 'Strings', 'Linked List', 'Trees', 'Graphs', 'DP', 'Binary Search',
    'Sliding Window', 'Two Pointers', 'Stack', 'Queue', 'Heap', 'Trie', 'Recursion', 'Backtracking'];

export default function Problems() {
    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ topic: '', difficulty: '', search: '' });
    const [deleting, setDeleting] = useState(null);
    const [editingNotesProblem, setEditingNotesProblem] = useState(null);

    const handleNotesSave = (updatedProblem) => {
        setProblems((prev) => 
            prev.map(p => p._id === updatedProblem._id ? updatedProblem : p)
        );
        setEditingNotesProblem(null);
    };

    const fetchProblems = async () => {
        setLoading(true);
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 animate-fade-in">
                <div>
                    <h1 className="text-3xl font-bold text-slate-100">Problems Library</h1>
                    <p className="text-slate-400 mt-1">{problems.length} problems tracked</p>
                </div>
                <Link to="/add" className="btn-primary">
                    ＋ Add New Problem
                </Link>
            </div>

            {/* Filters */}
            <div className="card mb-6 animate-slide-up shadow-lg">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm italic">Search</span>
                        <input
                            type="text"
                            className="input pl-16"
                            placeholder="Two Sum, DP..."
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        />
                    </div>
                    <select
                        className="input"
                        value={filters.difficulty}
                        onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
                    >
                        <option value="">All Difficulties</option>
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                    </select>
                    <select
                        className="input"
                        value={filters.topic}
                        onChange={(e) => setFilters({ ...filters, topic: e.target.value })}
                    >
                        <option value="">All Topics</option>
                        {TOPICS.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
            </div>

            {/* Problems List */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="w-10 h-10 border-4 border-brand-600/30 border-t-brand-500 rounded-full animate-spin" />
                </div>
            ) : problems.length === 0 ? (
                <div className="card text-center py-16 text-slate-500 border-dashed border-2 border-brand-500/20">
                    <div className="text-6xl mb-4 opacity-50">📭</div>
                    <p className="text-xl font-medium text-slate-400">No problems found</p>
                    <p className="text-sm mt-1">Try adjusting your filters or add a new problem</p>
                    <Link to="/add" className="btn-primary inline-block mt-4">Add Problem</Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 animate-slide-up">
                    {problems.map((problem) => (
                        <ProblemCard
                            key={problem._id}
                            problem={problem}
                            onDelete={handleDelete}
                            onNotesClick={() => setEditingNotesProblem(problem)}
                            deleting={deleting}
                            getDueStatus={getDueStatus}
                        />
                    ))}
                </div>
            )}

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
