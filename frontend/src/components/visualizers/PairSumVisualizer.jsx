import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useAutoplay from '../../hooks/useAutoplay';
import VisualizerControls from './VisualizerControls';

export default function PairSumVisualizer() {
    const [array] = useState([1, 2, 4, 6, 8, 10, 13]);
    const [target] = useState(14);
    const [left, setLeft] = useState(0);
    const [right, setRight] = useState(array.length - 1);
    const [status, setStatus] = useState('Wait'); // Wait, Comparing, Found, NotFound, Over
    const [currentSum, setCurrentSum] = useState(null);
    const [history, setHistory] = useState([]);

    const handleNext = () => {
        if (status === 'Wait') {
            setStatus('Comparing');
            setCurrentSum(array[left] + array[right]);
            return;
        }

        if (status === 'Found' || status === 'Over' || status === 'NotFound') return;

        const sum = array[left] + array[right];
        
        if (sum === target) {
            setStatus('Found');
        } else if (left >= right) {
            setStatus('NotFound');
        } else if (sum < target) {
            setHistory([...history, { left, right, sum, action: 'left++' }]);
            setLeft(prev => prev + 1);
            setStatus('Comparing');
            setCurrentSum(array[left + 1] + array[right]);
        } else {
            setHistory([...history, { left, right, sum, action: 'right--' }]);
            setRight(prev => prev - 1);
            setStatus('Comparing');
            setCurrentSum(array[left] + array[right - 1]);
        }
    };

    const isFinished = status === 'Found' || status === 'NotFound' || status === 'Over';
    const { isPlaying, togglePlay, resetAutoplay } = useAutoplay(handleNext, isFinished);

    const reset = () => {
        setLeft(0);
        setRight(array.length - 1);
        setStatus('Wait');
        setCurrentSum(null);
        setHistory([]);
        resetAutoplay();
    };

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-12">
            <div className="text-center space-y-2">
                <p className="text-[10px] font-black text-brand-500 uppercase tracking-[0.2em]">Pattern: Two Pointers (Sorted)</p>
                <div className="flex flex-col items-center">
                    <p className="text-2xl font-black text-[var(--text-primary)]">
                        Target Sum: <span className="text-brand-500">{target}</span>
                    </p>
                    {currentSum !== null && (
                        <p className={`text-sm font-bold mt-1 ${status === 'Found' ? 'text-emerald-500' : 'text-[var(--text-secondary)]'}`}>
                            Current Sum: {array[left]} + {array[right]} = <span className={currentSum === target ? 'text-emerald-500' : currentSum < target ? 'text-blue-500' : 'text-orange-500'}>{currentSum}</span>
                        </p>
                    )}
                </div>
            </div>

            {/* Array Visualization */}
            <div className="flex gap-4 items-end h-32">
                {array.map((val, i) => {
                    const isLeft = i === left;
                    const isRight = i === right;
                    const isSelected = isLeft || isRight;
                    const isResult = status === 'Found' && isSelected;

                    return (
                        <div key={i} className="relative flex flex-col items-center">
                            {/* Pointers */}
                            <div className="absolute -top-10 flex flex-col items-center gap-1 h-10">
                                <AnimatePresence>
                                    {isLeft && (
                                        <motion.div
                                            initial={{ y: -5, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            exit={{ y: -5, opacity: 0 }}
                                            className="px-2 py-0.5 bg-blue-500 text-[8px] font-black rounded text-white shadow-lg z-20"
                                        >
                                            LEFT
                                        </motion.div>
                                    )}
                                    {isRight && (
                                        <motion.div
                                            initial={{ y: -5, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            exit={{ y: -5, opacity: 0 }}
                                            className="px-2 py-0.5 bg-orange-500 text-[8px] font-black rounded text-white shadow-lg z-20"
                                        >
                                            RIGHT
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <motion.div
                                animate={{
                                    backgroundColor: isResult ? 'var(--viz-highlight-success-bg)' : isSelected ? 'var(--viz-highlight-active-bg)' : 'var(--viz-bg-inactive)',
                                    borderColor: isResult ? 'var(--viz-highlight-success)' : isSelected ? 'var(--viz-highlight-active)' : 'var(--viz-border-inactive)',
                                    scale: isSelected ? 1.1 : 1,
                                    y: isSelected ? -5 : 0
                                }}
                                className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center font-black text-lg transition-colors ${
                                    isSelected ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)] opacity-50'
                                } shadow-sm`}
                            >
                                {val}
                            </motion.div>
                            <span className="text-[8px] font-bold text-[var(--text-secondary)] mt-2 uppercase tracking-widest">idx {i}</span>
                        </div>
                    );
                })}
            </div>

            {/* Status Message */}
            <div className="h-6">
                <AnimatePresence mode="wait">
                    {status === 'Found' && (
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-emerald-500 font-bold">
                            🎉 Pair Found: {array[left]} and {array[right]}
                        </motion.p>
                    )}
                    {status === 'NotFound' && (
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 font-bold">
                            ❌ No pair found.
                        </motion.p>
                    )}
                    {status === 'Comparing' && currentSum !== null && (
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[var(--text-secondary)] text-sm italic">
                            {currentSum < target ? 'Sum too small, moving left pointer right.' : 'Sum too large, moving right pointer left.'}
                        </motion.p>
                    )}
                </AnimatePresence>
            </div>

            {/* Controls */}
            <VisualizerControls 
                onNext={handleNext}
                onReset={reset}
                onTogglePlay={togglePlay}
                isPlaying={isPlaying}
                status={status}
            />
        </div>
    );
}
