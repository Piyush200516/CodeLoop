import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useAutoplay from '../../hooks/useAutoplay';
import VisualizerControls from './VisualizerControls';

export default function HashSetVisualizer() {
    const [array] = useState([1, 2, 3, 1, 4]);
    const [set, setSet] = useState(new Set());
    const [index, setIndex] = useState(-1);
    const [status, setStatus] = useState('Wait'); // Wait, Running, Over
            const [message, setMessage] = useState('Check if array contains any duplicates.');
    const [duplicateValue, setDuplicateValue] = useState(null);

    const handleNext = () => {
        if (status === 'Over') return;
        
        if (status === 'Wait') {
            setStatus('Running');
            setIndex(0);
            setMessage(`Checking element 0: ${array[0]}`);
            return;
        }

        const currIndex = index;
        const currentVal = array[currIndex];

        if (set.has(currentVal)) {
            setDuplicateValue(currentVal);
            setMessage(`Found duplicate value: ${currentVal} at index ${currIndex}!`);
            setStatus('Over');
                        return;
        }

        // Not found, add to set
        const nextSet = new Set(set);
        nextSet.add(currentVal);
        setSet(nextSet);

        if (currIndex < array.length - 1) {
            setIndex(currIndex + 1);
            setMessage(`${currentVal} not in set. Added it. Moving to next element.`);
        } else {
            setMessage('Array has no duplicates.');
            setStatus('Over');
                    }
    };

    
    const isFinished = status === 'Over';
    const { isPlaying, togglePlay, resetAutoplay } = useAutoplay(handleNext, isFinished);

    const reset = () => {
        setIndex(-1);
        setSet(new Set());
        setStatus('Wait');
        setDuplicateValue(null);
        setMessage('Check if array contains any duplicates.');
        resetAutoplay();
    };

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="text-center space-y-2 mb-12">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Hash Set (Contains Duplicate)</p>
                <p className="text-lg font-bold text-[var(--text-primary)] max-w-lg mx-auto min-h-[3rem]">{message}</p>
            </div>

            <div className="flex flex-col md:flex-row gap-16 items-start justify-center w-full max-w-4xl">
                {/* Array */}
                <div className="flex flex-col items-center gap-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Input Array</span>
                    <div className="flex gap-2">
                        {array.map((val, i) => {
                            const isCurrent = i === index;
                            const isDuplicate = val === duplicateValue;
                            return (
                                <div key={i} className="flex flex-col items-center gap-2">
                                    <motion.div
                                        animate={{
                                            scale: isCurrent || (isDuplicate && i <= index) ? 1.1 : 1,
                                            borderColor: isDuplicate && i <= index ? 'var(--viz-highlight-compare)' : isCurrent ? 'var(--viz-highlight-active)' : 'var(--viz-border-inactive)',
                                            backgroundColor: isDuplicate && i <= index ? 'var(--viz-highlight-compare-bg)' : isCurrent ? 'var(--viz-highlight-active-bg)' : 'var(--viz-bg-inactive)'
                                        }}
                                        className="w-14 h-14 rounded-2xl border-2 flex flex-col items-center justify-center shadow-lg"
                                    >
                                        <span className="text-lg font-black text-[var(--text-primary)]">{val}</span>
                                    </motion.div>
                                    <span className="text-[10px] font-bold text-slate-500">Idx: {i}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Hash Set View */}
                <div className="flex flex-col items-center gap-4 min-w-[200px]">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Hash Set (Uniques)</span>
                    <div className="w-full bg-[var(--viz-bg-inactive)]/30 rounded-2xl border border-white/5 p-4 flex flex-wrap gap-2 justify-center min-h-[150px]">
                        <AnimatePresence>
                            {set.size === 0 && (
                                <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="text-xs text-slate-500 italic text-center w-full py-8">
                                    Set is empty
                                </motion.div>
                            )}
                            {Array.from(set).map((val) => (
                                <motion.div
                                    key={val}
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-black border-2 shadow-lg ${
                                        val === duplicateValue 
                                        ? 'bg-[var(--viz-highlight-compare-bg)] border-[var(--viz-highlight-compare)] text-[var(--viz-highlight-compare)]' 
                                        : 'bg-indigo-500/20 border-indigo-500/50 text-indigo-400'
                                    }`}
                                >
                                    {val}
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
