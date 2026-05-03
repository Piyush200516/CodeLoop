import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axiosInstance';
import toast from 'react-hot-toast';
import NotesModal from '../components/NotesModal';

export default function Review() {
    const [dueProblems, setDueProblems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [current, setCurrent] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [sessionDone, setSessionDone] = useState(false);
    const [reviewed, setReviewed] = useState(0);
    const [editingNotes, setEditingNotes] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDue = async () => {
            try {
                const { data } = await api.get('/problems/due');
                setDueProblems(data);
            } catch {
                toast.error('Failed to load revision queue');
            } finally {
                setLoading(false);
            }
        };
        fetchDue();
    }, []);

    const handleComplete = async () => {
        const problem = dueProblems[current];
        setSubmitting(true);
        try {
            await api.post(`/problems/${problem._id}/revise`);
            setReviewed((r) => r + 1);
            toast.success('Revision logged! next session scheduled.');
            if (current + 1 >= dueProblems.length) {
                setSessionDone(true);
            } else {
                setCurrent((c) => c + 1);
                setShowAnswer(false);
            }
        } catch {
            toast.error('Failed to log revision');
        } finally {
            setSubmitting(false);
        }
    };

    const handleNotesSave = (updatedProblem) => {
        setDueProblems((prev) => 
            prev.map((p, idx) => idx === current ? updatedProblem : p)
        );
        setEditingNotes(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-brand-600/30 border-t-brand-500 rounded-full animate-spin" />
            </div>
        );
    }

    if (dueProblems.length === 0) {
        return (
            <div className="max-w-xl mx-auto px-4 py-16 text-center animate-fade-in">
                <div className="card border-brand-500/20 shadow-2xl shadow-brand-500/10">
                    <div className="text-6xl mb-6">🎉</div>
                    <h2 className="text-2xl font-bold text-slate-100 mb-2">All Caught Up!</h2>
                    <p className="text-slate-400 mb-8">Your revision queue is empty. You're doing great!</p>
                    <Link to="/" className="btn-primary inline-flex items-center gap-2">
                        Back to Dashboard 🏠
                    </Link>
                </div>
            </div>
        );
    }

    if (sessionDone) {
        return (
            <div className="max-w-xl mx-auto px-4 py-16 text-center animate-slide-up">
                <div className="card border-brand-500/30 shadow-2xl shadow-brand-500/10">
                    <div className="text-6xl mb-6">🏆</div>
                    <h2 className="text-3xl font-bold text-slate-100 mb-2">Session Complete!</h2>
                    <p className="text-slate-400 text-lg mb-4">You just mastered <span className="text-brand-400 font-bold">{reviewed}</span> problems.</p>
                    <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                        Consistency is key. These problems will resurface exactly when your memory needs them most.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link to="/" className="btn-primary px-8">Return to Dashboard</Link>
                        <Link to="/problems" className="btn-secondary">View My Library</Link>
                    </div>
                </div>
            </div>
        );
    }

    const problem = dueProblems[current];
    const progress = ((current) / dueProblems.length) * 100;

    return (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <button
                    onClick={() => navigate('/')}
                    className="text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1.5 text-sm font-medium"
                >
                    ✕ Quit Session
                </button>
                <div className="text-right">
                    <span className="text-brand-400 text-sm font-bold tracking-wider uppercase">
                        Revision {current + 1} / {dueProblems.length}
                    </span>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
                <div className="h-3 bg-brand-500/10 rounded-full overflow-hidden shadow-inner border border-brand-500/10">
                    <div
                        className="h-full bg-gradient-to-r from-brand-600 to-indigo-500 rounded-full transition-all duration-700 ease-out shadow-lg shadow-brand-500/40"
                        style={{ width: `${progress || 5}%` }}
                    />
                </div>
            </div>

            {/* Problem Card */}
            <div className="card mb-6 border-brand-500/10 shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                    <span className={
                        problem.difficulty === 'Easy' ? 'badge-easy' :
                            problem.difficulty === 'Medium' ? 'badge-medium' : 'badge-hard'
                    }>
                        {problem.difficulty}
                    </span>
                    <div className="flex gap-1.5 flex-wrap">
                        {problem.topics.map((t) => <span key={t} className="topic-tag">{t}</span>)}
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-slate-100 mb-4 leading-tight">
                    <a href={problem.leetcodeUrl} target="_blank" rel="noreferrer" className="hover:text-brand-400 transition-colors">
                        {problem.title}
                    </a>
                </h2>

                {problem.leetcodeUrl && (
                    <a href={problem.leetcodeUrl} target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-2 text-brand-400 hover:text-brand-300 text-sm font-semibold mb-6 group">
                        Open on LeetCode
                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </a>
                )}

                <div className="flex items-center gap-2 text-xs text-slate-500 bg-brand-500/5 w-fit px-3 py-1.5 rounded-lg border border-brand-500/10">
                    <span>🔁 Total Reviews:</span>
                    <span className="text-brand-400 font-bold">{problem.revisionCount}</span>
                </div>
            </div>

            {/* Interaction Area */}
            {!showAnswer ? (
                <button
                    onClick={() => setShowAnswer(true)}
                    className="btn-primary w-full py-5 text-xl shadow-brand-600/20 hover:shadow-brand-600/40 active:scale-95 transition-all"
                >
                    Show My Solution / Notes 🔍
                </button>
            ) : (
                <div className="space-y-6 animate-slide-up">
                    <div className="card bg-brand-500/5 border-brand-500/10 backdrop-blur-sm relative group/card">
                        <button 
                            onClick={() => setEditingNotes(true)}
                            className="absolute top-4 right-4 bg-brand-500/10 p-2 rounded-lg opacity-0 group-hover/card:opacity-100 transition-opacity"
                            title="Edit Notes"
                        >
                            📝
                        </button>

                        <div className="space-y-4">
                            <div>
                                <p className="text-xs font-bold text-orange-400 uppercase tracking-widest mb-1">🐢 Brute Force</p>
                                <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">
                                    {problem.bruteForce || problem.approach || 'Not documented.'}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-1">🚀 Optimized Approach</p>
                                <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">
                                    {problem.optimizedApproach || problem.optimizedSolution ||'Not documented.'}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-red-400 uppercase tracking-widest mb-1">🛑 Mistakes</p>
                                <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">
                                    {problem.mistakes || 'No mistakes logged.'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-2">
                        <button
                            onClick={handleComplete}
                            disabled={submitting}
                            className="btn-primary w-full py-5 text-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 border-none shadow-emerald-900/40"
                        >
                            {submitting ? 'Updating...' : 'Got it! Next Problem →'}
                        </button>
                        <p className="text-center text-slate-500 text-xs mt-4 italic">
                            Marking this as complete will schedule your next review based on the 1, 3, 7, 14, 30 day sequence.
                        </p>
                    </div>
                </div>
            )}

            <AnimatePresence>
                {editingNotes && (
                    <NotesModal 
                        problem={problem}
                        onClose={() => setEditingNotes(false)}
                        onSave={handleNotesSave}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
