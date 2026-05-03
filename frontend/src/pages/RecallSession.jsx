import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axiosInstance';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function RecallSessionPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [problem, setProblem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentCard, setCurrentCard] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [results, setResults] = useState({ remembered: 0, forgot: 0 });
    const [sessionDone, setSessionDone] = useState(false);

    useEffect(() => {
        fetchProblem();
    }, [id]);

    const fetchProblem = async () => {
        try {
            const { data } = await api.get(`/problems/${id}`);
            setProblem(data);
        } catch (error) {
            toast.error('Failed to load problem');
            navigate('/recall');
        } finally {
            setLoading(false);
        }
    };

    const cards = problem ? [
        { 
            q: "Which data structure is used?", 
            a: problem.category || "Not specified" 
        },
        { 
            q: "What is the Time Complexity?", 
            a: problem.timeComplexity || "Not specified" 
        },
        { 
            q: "What is the Key Logic / Algorithm Idea?", 
            a: problem.keyAlgorithmIdea || problem.optimizedApproach || "Not specified" 
        },
        { 
            q: "What Pattern does this problem belong to?", 
            a: problem.topics?.filter(t => ![
                'Array', 'Arrays', 'String', 'Strings', 'Linked List', 
                'Tree', 'Trees', 'Graph', 'Graphs', 'Heap', 'Stack', 'Queue', 'Trie'
            ].includes(t)).join(', ') || problem.topics?.join(', ') || "Not specified"
        }
    ] : [];

    const handleRating = (remembered) => {
        if (remembered) {
            setResults(prev => ({ ...prev, remembered: prev.remembered + 1 }));
        } else {
            setResults(prev => ({ ...prev, forgot: prev.forgot + 1 }));
        }

        if (currentCard < cards.length - 1) {
            nextCard();
        } else {
            setSessionDone(true);
        }
    };

    const nextCard = () => {
        setIsFlipped(false);
        setTimeout(() => {
            setCurrentCard(prev => prev + 1);
        }, 600); // Wait for flip-back animation (500ms)
    };

    const prevCard = () => {
        if (currentCard > 0) {
            setIsFlipped(false);
            setTimeout(() => {
                setCurrentCard(prev => prev - 1);
            }, 600);
        }
    };

    const saveResultAndExit = async () => {
        try {
            await api.post('/revision/recall-result', {
                problemId: id,
                rememberedCount: results.remembered,
                forgotCount: results.forgot
            });
            toast.success('Recall session saved!');
            navigate('/recall');
        } catch (error) {
            toast.error('Failed to save session');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-brand-600/20 border-t-brand-500 rounded-full animate-spin" />
            </div>
        );
    }

    if (sessionDone) {
        return (
            <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-8">
                <div className="card glass p-10 space-y-6 border-brand-500/20">
                    <div className="text-6xl">🏁</div>
                    <h2 className="text-3xl font-black text-slate-100 uppercase tracking-tighter">Session Complete!</h2>
                    <div className="flex justify-center gap-10">
                        <div className="text-center">
                            <p className="text-emerald-500 text-3xl font-black">{results.remembered}</p>
                            <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mt-1">Remembered</p>
                        </div>
                        <div className="text-center">
                            <p className="text-red-500 text-3xl font-black">{results.forgot}</p>
                            <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mt-1">Forgot</p>
                        </div>
                    </div>
                </div>
                <button 
                    onClick={saveResultAndExit}
                    className="btn-primary w-full shadow-brand-500/20"
                >
                    Save & Return to Recall Decks
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto px-4 py-10 flex flex-col items-center gap-12">
            <header className="text-center space-y-2">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-500 opacity-60">Recalling Pattern</span>
                <h1 className="text-3xl font-black text-slate-100 tracking-tight uppercase">{problem?.title}</h1>
                <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">
                    Card {currentCard + 1} of {cards.length}
                </p>
            </header>

            {/* Flashcard */}
            <div className="w-full max-w-md perspective-1000">
                <motion.div
                    key={currentCard}
                    className={`relative w-full aspect-[4/3] preserve-3d cursor-pointer`}
                    onClick={() => setIsFlipped(!isFlipped)}
                    initial={false}
                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                    transition={{ 
                        type: "spring", 
                        stiffness: 120, 
                        damping: 20,
                        mass: 1
                    }}
                >
                    {/* Front side */}
                    <div className="absolute inset-0 backface-hidden card glass flex items-center justify-center p-8 border-brand-500/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
                        <div className="text-center space-y-6">
                            <p className="text-xs font-black text-brand-500 uppercase tracking-widest opacity-60">Question</p>
                            <h2 className="text-2xl font-bold text-slate-100 leading-tight">
                                {cards[currentCard].q}
                            </h2>
                            <p className="text-[10px] text-slate-500 italic mt-8 font-bold uppercase tracking-widest">
                                Click card to reveal answer
                            </p>
                        </div>
                    </div>

                    {/* Back side */}
                    <div className="absolute inset-0 backface-hidden rotate-y-180 card glass border-emerald-500/20 flex flex-col items-center justify-center p-8 shadow-[0_20px_50px_rgba(16,185,129,0.1)]">
                         <p className="text-xs font-black text-emerald-500 uppercase tracking-widest opacity-60 mb-6 font-bold uppercase tracking-widest">Answer</p>
                         <h2 className="text-2xl font-black text-slate-100 text-center leading-relaxed">
                            {cards[currentCard].a}
                         </h2>
                    </div>
                </motion.div>
            </div>

            {/* Controls */}
            <div className="w-full max-w-md space-y-6">
                <AnimatePresence mode="wait">
                    {isFlipped ? (
                        <motion.div 
                            key="rating"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="bg-brand-500/5 p-4 rounded-2xl border border-white/5 flex flex-col gap-4"
                        >
                            <p className="text-[10px] font-black text-slate-500 text-center uppercase tracking-widest">How well did you remember?</p>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRating(false);
                                    }}
                                    className="px-4 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-500 rounded-xl font-bold transition-all text-sm uppercase tracking-tight flex items-center justify-center gap-2"
                                >
                                    ❌ I Forgot
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRating(true);
                                    }}
                                    className="px-4 py-3 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-500 rounded-xl font-bold transition-all text-sm uppercase tracking-tight flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10"
                                >
                                    ✅ I Remembered
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="flex justify-between items-center px-4">
                            <button 
                                onClick={prevCard}
                                disabled={currentCard === 0}
                                className="text-slate-500 hover:text-slate-300 disabled:opacity-30 flex items-center gap-2 font-bold text-xs uppercase tracking-widest transition-colors"
                            >
                                ← Previous
                            </button>
                            <div className="h-1 flex-1 mx-8 bg-slate-800 rounded-full overflow-hidden">
                                <motion.div 
                                    className="h-full bg-brand-500"
                                    animate={{ width: `${((currentCard + 1) / cards.length) * 100}%` }}
                                />
                            </div>
                            <button 
                                onClick={() => setIsFlipped(true)}
                                className="text-brand-400 hover:text-brand-300 flex items-center gap-2 font-black text-xs uppercase tracking-widest transition-colors"
                            >
                                Reveal →
                            </button>
                        </div>
                    )}
                </AnimatePresence>
            </div>

            <style>{`
                .perspective-1000 {
                    perspective: 1000px;
                }
                .preserve-3d {
                    transform-style: preserve-3d;
                }
                .backface-hidden {
                    backface-visibility: hidden;
                    -webkit-backface-visibility: hidden;
                }
                .rotate-y-180 {
                    transform: rotateY(180deg);
                }
            `}</style>
        </div>
    );
}
