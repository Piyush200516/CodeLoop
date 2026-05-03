import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useAutoplay from '../../hooks/useAutoplay';
import VisualizerControls from './VisualizerControls';

export default function MonotonicStackVisualizer() {
    const [array] = useState([5, 3, 1, 2, 4]);
    const [index, setIndex] = useState(-1);
    const [stack, setStack] = useState([]);
    const [result, setResult] = useState(new Array(array.length).fill(null));
    const [status, setStatus] = useState('Wait');

    const handleNext = () => {
        if (status === 'Wait') {
            setStatus('Running');
            setIndex(0);
            return;
        }

        if (index >= array.length) {
            setStatus('Over');
            return;
        }

        const currValue = array[index];
        const lastInStackIdx = stack[stack.length - 1];

        if (stack.length > 0 && array[lastInStackIdx] < currValue) {
            // Pop logic
            const poppedIdx = stack[stack.length - 1];
            const newStack = [...stack];
            newStack.pop();
            const newResult = [...result];
            newResult[poppedIdx] = currValue;
            
            setResult(newResult);
            setStack(newStack);
            // Don't increment index yet, keep processing the stack for the same element
        } else {
            // Push logic
            setStack([...stack, index]);
            setIndex(index + 1);
        }
    };

    const isFinished = status === 'Over';
    const { isPlaying, togglePlay, resetAutoplay } = useAutoplay(handleNext, isFinished);

    const reset = () => {
        setIndex(-1);
        setStack([]);
        setResult(new Array(array.length).fill(null));
        setStatus('Wait');
        resetAutoplay();
    };

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-12">
            <div className="text-center space-y-2">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Monotonic Increasing Stack Demo</p>
                <p className="text-xl font-black text-slate-100">
                    {status === 'Wait' && 'Find Next Greater Element'}
                    {status === 'Running' && (index < array.length ? `Processing element at index ${index}` : 'Finalizing...')}
                    {status === 'Over' && 'Next Greater Elements Found!'}
                </p>
            </div>

            <div className="flex flex-col md:flex-row gap-12 items-center w-full justify-center">
                {/* Array */}
                <div className="flex flex-col items-center gap-4">
                    <span className="text-[10px] font-black uppercase text-slate-600">Input Array</span>
                    <div className="flex gap-2">
                        {array.map((val, i) => (
                            <div key={i} className="flex flex-col items-center gap-2">
                                <motion.div
                                    animate={{
                                        borderColor: i === index ? 'var(--viz-highlight-active)' : 'var(--viz-border-inactive)',
                                        scale: i === index ? 1.1 : 1,
                                        backgroundColor: i === index ? 'var(--viz-highlight-active-bg)' : 'var(--viz-bg-inactive)'
                                    }}
                                    className="w-12 h-12 rounded-xl border-2 flex items-center justify-center font-bold text-[var(--text-primary)]"
                                >
                                    {val}
                                </motion.div>
                                <div className="text-[10px] text-slate-500 font-mono">
                                    NGE: <span className="text-[var(--viz-highlight-active)] font-bold">{result[i] ?? '-'}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Stack */}
                <div className="flex flex-col items-center gap-4">
                    <span className="text-[10px] font-black uppercase text-slate-600">Monotonic Stack</span>
                    <div className="w-24 h-48 border-x-4 border-b-4 border-[var(--viz-border-inactive)]/50 rounded-b-2xl flex flex-col-reverse p-2 gap-2 bg-[var(--viz-bg-inactive)]/20">
                        <AnimatePresence>
                            {stack.map((idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: -20, scale: 0.8 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, x: 20, scale: 0.8 }}
                                    className="w-full h-8 bg-brand-500/80 rounded-lg flex items-center justify-center text-xs font-black text-white shadow-lg"
                                >
                                    {array[idx]}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

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
