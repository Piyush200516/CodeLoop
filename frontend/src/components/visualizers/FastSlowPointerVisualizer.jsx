import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useAutoplay from '../../hooks/useAutoplay';
import VisualizerControls from './VisualizerControls';

export default function FastSlowPointerVisualizer() {
    // A linked list represented as an array of objects to simulate pointers
    // 0 -> 1 -> 2 -> 3 -> 4 -> 5 -> 2 (Cycle back to 2)
    const [nodes] = useState([
        { val: 10, next: 1 },
        { val: 20, next: 2 },
        { val: 30, next: 3 },
        { val: 40, next: 4 },
        { val: 50, next: 5 },
        { val: 60, next: 2 } // Cycle!
    ]);

    const [slow, setSlow] = useState(0);
    const [fast, setFast] = useState(0);
    const [status, setStatus] = useState('Wait'); // Wait, Running, Detected, Over
    const [stepCount, setStepCount] = useState(0);

    const handleNext = () => {
        if (status === 'Wait') {
            setStatus('Running');
            return;
        }

        if (status === 'Detected' || status === 'Over') return;

        const nextSlow = nodes[slow].next;
        const nextFast1 = nodes[fast].next;
        const nextFast2 = nextFast1 !== null ? nodes[nextFast1].next : null;

        if (nextFast2 === null || nextFast1 === null) {
            setStatus('Over');
            return;
        }

        setSlow(nextSlow);
        setFast(nextFast2);
        setStepCount(prev => prev + 1);

        if (nextSlow === nextFast2) {
            setStatus('Detected');
        }
    };

    const isFinished = status === 'Detected' || status === 'Over';
    const { isPlaying, togglePlay, resetAutoplay } = useAutoplay(handleNext, isFinished);

    const reset = () => {
        setSlow(0);
        setFast(0);
        setStatus('Wait');
        setStepCount(0);
        resetAutoplay();
    };

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-12">
            <div className="text-center space-y-2">
                <p className="text-[10px] font-black text-brand-500 uppercase tracking-[0.2em]">Pattern: Tortoise & Hare</p>
                <p className="text-2xl font-black text-slate-100">
                    {status === 'Wait' && 'Ready to detect cycle?'}
                    {status === 'Running' && `Step ${stepCount}: Fast moves 2x faster`}
                    {status === 'Detected' && `🎉 Cycle Detected at Node Index ${slow}!`}
                    {status === 'Over' && 'No cycle found (Reached end)'}
                </p>
            </div>

            {/* Nodes Visualization */}
            <div className="relative flex items-center justify-center gap-12 flex-wrap">
                {nodes.map((node, i) => {
                    const isSlow = i === slow;
                    const isFast = i === fast;
                    const isCycleOrigin = i === 2; // Fixed for this example

                    return (
                        <div key={i} className="relative group">
                            {/* Pointers Container */}
                            <div className="absolute -top-16 left-0 right-0 flex flex-col items-center gap-1 h-16 pointer-events-none">
                                <AnimatePresence>
                                    {isFast && (
                                        <motion.div
                                            initial={{ y: -10, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            exit={{ y: -10, opacity: 0 }}
                                            className="px-2 py-0.5 bg-indigo-500 text-[8px] font-black rounded text-white shadow-lg whitespace-nowrap"
                                        >
                                            FAST
                                        </motion.div>
                                    )}
                                    {isSlow && (
                                        <motion.div
                                            initial={{ y: -10, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            exit={{ y: -10, opacity: 0 }}
                                            className="px-2 py-0.5 bg-brand-500 text-[8px] font-black rounded text-white shadow-lg whitespace-nowrap"
                                        >
                                            SLOW
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Node Bubble */}
                            <motion.div
                                animate={{
                                    scale: (isSlow || isFast) ? 1.15 : 1,
                                    boxShadow: (isSlow && isFast) 
                                        ? '0 0 20px rgba(139, 92, 246, 0.4)' 
                                        : isSlow 
                                        ? '0 0 15px rgba(14, 165, 233, 0.3)' 
                                        : isFast 
                                        ? '0 0 15px rgba(99, 102, 241, 0.3)' 
                                        : 'none',
                                    borderColor: (isSlow && isFast) ? 'var(--viz-highlight-active)' : isSlow ? 'var(--viz-highlight-active)' : isFast ? 'var(--viz-highlight-active)' : 'var(--viz-border-inactive)'
                                }}
                                className={`w-14 h-14 rounded-full flex items-center justify-center font-black text-lg border-2 transition-all ${
                                    (isSlow || isFast) ? 'bg-[var(--viz-bg-inactive)] text-slate-100' : 'bg-brand-500/5 text-slate-600'
                                }`}
                            >
                                {node.val}
                            </motion.div>

                            {/* Arrow to Next */}
                            {i < nodes.length - 1 && (
                                <div className="absolute top-1/2 -right-10 w-8 h-0.5 bg-[var(--viz-bg-inactive)]">
                                    <div className="absolute -right-1 -top-1 w-2 h-2 border-t-2 border-r-2 border-slate-800 rotate-45" />
                                </div>
                            )}

                            {/* Cycle Arrow (Specific to this example) */}
                            {i === nodes.length - 1 && (
                                <svg className="absolute -bottom-12 -left-20 w-40 h-10 pointer-events-none opacity-30">
                                    <path 
                                        d="M 140 0 Q 70 40 0 0" 
                                        fill="none" 
                                        stroke="currentColor" 
                                        strokeWidth="2" 
                                        className="text-brand-500"
                                        strokeDasharray="4 2"
                                    />
                                    <polygon points="0,0 -5,5 5,5" fill="currentColor" className="text-brand-500" transform="translate(0,0) rotate(-135)" />
                                </svg>
                            )}
                            <span className="absolute -bottom-6 w-full text-center text-[8px] font-bold text-slate-700">INDEX {i}</span>
                        </div>
                    );
                })}
            </div>

            {/* Controls */}
            <VisualizerControls 
                onNext={handleNext}
                onReset={reset}
                onTogglePlay={togglePlay}
                isPlaying={isPlaying}
                status={isFinished ? 'Over' : status}
            />
            
            <p className="text-xs text-slate-500 max-w-md text-center italic">
                In this example, the last node (Index 5) points back to Node 2, creating a cycle.
            </p>
        </div>
    );
}
