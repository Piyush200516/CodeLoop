import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useAutoplay from '../../hooks/useAutoplay';
import VisualizerControls from './VisualizerControls';

export default function KadaneVisualizer() {
    const [array] = useState([-2, 1, -3, 4, -1, 2, 1, -5, 4]);
    const [index, setIndex] = useState(-1);
    const [currentSum, setCurrentSum] = useState(0);
    const [maxSum, setMaxSum] = useState(-Infinity);
    const [status, setStatus] = useState('Wait');
    const [bestRange, setBestRange] = useState([-1, -1]);
    const [currentRange, setCurrentRange] = useState([-1, -1]);

    const handleNext = () => {
        if (status === 'Wait') {
            setStatus('Running');
            setIndex(0);
            setCurrentSum(array[0]);
            setMaxSum(array[0]);
            setBestRange([0, 0]);
            setCurrentRange([0, 0]);
            return;
        }

        if (index >= array.length - 1) {
            setStatus('Over');
            return;
        }

        const nextIdx = index + 1;
        const nextVal = array[nextIdx];
        
        // Kadane Logic: currentSum = max(nextVal, currentSum + nextVal)
        let newCurrentSum;
        let newCurrentRange;

        if (currentSum + nextVal < nextVal) {
            newCurrentSum = nextVal;
            newCurrentRange = [nextIdx, nextIdx];
        } else {
            newCurrentSum = currentSum + nextVal;
            newCurrentRange = [currentRange[0], nextIdx];
        }

        let newMaxSum = maxSum;
        let newBestRange = bestRange;
        if (newCurrentSum > maxSum) {
            newMaxSum = newCurrentSum;
            newBestRange = newCurrentRange;
        }

        setIndex(nextIdx);
        setCurrentSum(newCurrentSum);
        setMaxSum(newMaxSum);
        setCurrentRange(newCurrentRange);
        setBestRange(newBestRange);
    };

    const isFinished = status === 'Over';
    const { isPlaying, togglePlay, resetAutoplay } = useAutoplay(handleNext, isFinished);

    const reset = () => {
        setIndex(-1);
        setCurrentSum(0);
        setMaxSum(-Infinity);
        setStatus('Wait');
        setBestRange([-1, -1]);
        setCurrentRange([-1, -1]);
        resetAutoplay();
    };

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-12">
            <div className="text-center space-y-2">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Maximum Subarray Sum Visualization</p>
                <div className="flex gap-8 justify-center mt-4">
                    <div className="text-center">
                        <span className="text-[10px] uppercase font-black text-slate-500 block">Current Sum</span>
                        <span className="text-3xl font-black text-[var(--viz-highlight-active)]">{status === 'Wait' ? '-' : currentSum}</span>
                    </div>
                    <div className="text-center">
                        <span className="text-[10px] uppercase font-black text-slate-500 block">Global Max</span>
                        <span className="text-3xl font-black text-indigo-400">{status === 'Wait' ? '-' : maxSum}</span>
                    </div>
                </div>
            </div>

            <div className="flex gap-2 flex-wrap justify-center">
                {array.map((val, i) => {
                    const isInCurrent = i >= currentRange[0] && i <= currentRange[1];
                    const isInBest = i >= bestRange[0] && i <= bestRange[1];
                    const isProcessing = i === index;

                    return (
                        <motion.div
                            key={i}
                            animate={{
                                scale: isProcessing ? 1.1 : 1,
                                borderColor: isProcessing ? 'var(--viz-highlight-active)' : isInBest ? 'var(--viz-highlight-active)' : 'var(--viz-border-inactive)',
                                backgroundColor: isProcessing ? 'var(--viz-highlight-active-bg)' : isInCurrent ? 'rgba(99, 102, 241, 0.2)' : 'var(--viz-bg-inactive)'
                            }}
                            className="w-12 h-12 rounded-xl border-2 flex items-center justify-center font-bold text-[var(--text-primary)] relative overflow-hidden"
                        >
                            {val}
                            {isInBest && status === 'Over' && (
                                <div className="absolute inset-0 bg-brand-500/10 border border-[var(--viz-highlight-active)]/50" />
                            )}
                        </motion.div>
                    );
                })}
            </div>

            <VisualizerControls 
                onNext={handleNext} 
                onReset={reset} 
                onTogglePlay={togglePlay}
                isPlaying={isPlaying}
                status={status}
            />
            
            <div className="text-xs text-slate-500 italic max-w-sm text-center">
                Blue highlight shows the current running subarray. Purple outline shows the best subarray found so far.
            </div>
        </div>
    );
}
