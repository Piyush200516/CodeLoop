import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useAutoplay from '../../hooks/useAutoplay';
import VisualizerControls from './VisualizerControls';

export default function CyclicSortVisualizer() {
    const [array, setArray] = useState([3, 1, 5, 4, 2]);
    const [i, setI] = useState(0);
    const [status, setStatus] = useState('Wait'); // Wait, Sorting, Swapping, Done
    const [swapIndices, setSwapIndices] = useState([]);

    const handleNext = () => {
        if (status === 'Wait') {
            setStatus('Sorting');
            return;
        }

        if (i >= array.length) {
            setStatus('Done');
            return;
        }

        if (status === 'Swapping') {
            const newArr = [...array];
            const correctIdx = swapIndices[1];
            [newArr[i], newArr[correctIdx]] = [newArr[correctIdx], newArr[i]];
            setArray(newArr);
            setSwapIndices([]);
            setStatus('Sorting');
            return;
        }

        const correctIdx = array[i] - 1;

        if (array[i] !== array[correctIdx]) {
            // Need to swap
            setSwapIndices([i, correctIdx]);
            setStatus('Swapping');
        } else {
            // Already correct, move to next
            setI(prev => prev + 1);
            if (i + 1 >= array.length) setStatus('Done');
        }
    };

    const isFinished = status === 'Done';
    const { isPlaying, togglePlay, resetAutoplay } = useAutoplay(handleNext, isFinished);

    const reset = () => {
        setArray([3, 1, 5, 4, 2]);
        setI(0);
        setStatus('Wait');
        setSwapIndices([]);
        resetAutoplay();
    };

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-12">
            <div className="text-center space-y-2">
                <p className="text-[10px] font-black text-brand-500 uppercase tracking-[0.2em]">Pattern: Cyclic Sort</p>
                <h2 className="text-2xl font-black text-slate-100">
                    {status === 'Wait' && 'Sort numbers 1-N in O(N)'}
                    {status === 'Sorting' && (i < array.length ? `Checking if ${array[i]} is at index ${array[i]-1}` : 'Array is sorted!')}
                    {status === 'Swapping' && `Swapping ${array[swapIndices[0]]} and ${array[swapIndices[1]]}`}
                    {status === 'Done' && '🎉 All numbers in correct positions!'}
                </h2>
            </div>

            {/* Array Visualization */}
            <div className="flex gap-4">
                {array.map((val, idx) => {
                    const isCurrent = idx === i;
                    const isSwapping = swapIndices.includes(idx);
                    const isCorrect = val === idx + 1;

                    return (
                        <div key={idx} className="flex flex-col items-center gap-3">
                            <motion.div
                                layout
                                initial={false}
                                animate={{
                                    scale: isSwapping ? 1.2 : isCurrent ? 1.1 : 1,
                                    borderColor: isSwapping ? 'var(--viz-highlight-compare)' : isCorrect ? 'var(--viz-highlight-success)' : isCurrent ? 'var(--viz-highlight-active)' : 'var(--viz-border-inactive)',
                                    backgroundColor: isSwapping ? 'rgba(239, 68, 68, 0.1)' : isCurrent ? 'var(--viz-highlight-active-bg)' : 'var(--viz-bg-inactive)'
                                }}
                                className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black border-2 transition-colors duration-300 ${
                                    isCorrect ? 'text-emerald-500' : isCurrent ? 'text-[var(--viz-highlight-active)]' : 'text-slate-600'
                                }`}
                            >
                                {val}
                            </motion.div>
                            <span className="text-[10px] font-bold text-slate-600">IDX {idx}</span>
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
                status={status === 'Done' ? 'Over' : status}
            />

            <div className="text-xs text-slate-500 flex gap-8">
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[var(--viz-highlight-active-bg)] border border-[var(--viz-highlight-active)]" /> Current Pointer</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[var(--viz-highlight-success-bg)] border border-[var(--viz-highlight-success)]" /> Correct Position</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500" /> Swapping</div>
            </div>
        </div>
    );
}
