import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useAutoplay from '../../hooks/useAutoplay';
import VisualizerControls from './VisualizerControls';

export default function BubbleSortVisualizer() {
    const defaultArray = [64, 34, 25, 12, 22, 11, 90];
    const [array, setArray] = useState([...defaultArray]);
    const [status, setStatus] = useState('Wait'); // Wait, Running, Over
            const [message, setMessage] = useState('Compare adjacent elements and bubble the largest to the end.');
    
    // Bubble Sort State
    const [i, setI] = useState(0);
    const [j, setJ] = useState(0);
    const [comparing, setComparing] = useState([-1, -1]);
    const [swapping, setSwapping] = useState(false);

    const handleNext = () => {
        if (status === 'Over') return;

        if (status === 'Wait') {
            setStatus('Running');
            setI(0);
            setJ(0);
            setComparing([0, 1]);
            setMessage(`Comparing ${array[0]} and ${array[1]}`);
            setSwapping(false);
            return;
        }

        const n = array.length;
        if (i >= n - 1) {
            setStatus('Over');
                        setComparing([-1, -1]);
            setMessage('Array is sorted!');
            return;
        }

        let newArray = [...array];
        let nextI = i;
        let nextJ = j;
        let nextComparing = [-1, -1];
        let nextSwapping = false;

        // If we are currently swapping, we just finish the swap
        if (swapping) {
            setMessage(`Swapped ${newArray[j]} and ${newArray[j+1]}`);
            
            // Move to next comparison
            nextJ = j + 1;
            if (nextJ >= n - i - 1) {
                nextI = i + 1;
                nextJ = 0;
            }
            if (nextI < n - 1) {
                nextComparing = [nextJ, nextJ + 1];
                setMessage(`Comparing ${newArray[nextJ]} and ${newArray[nextJ+1]}`);
            } else {
                setStatus('Over');
                                setMessage('Array is sorted!');
            }
        } 
        // If we are evaluating a comparison
        else {
            if (newArray[j] > newArray[j + 1]) {
                setMessage(`${newArray[j]} > ${newArray[j+1]}, swapping...`);
                // Swap
                let temp = newArray[j];
                newArray[j] = newArray[j + 1];
                newArray[j + 1] = temp;
                nextSwapping = true;
                nextComparing = [j, j + 1]; // Keep highlighted for swap
            } else {
                setMessage(`${newArray[j]} <= ${newArray[j+1]}, no swap.`);
                // Move to next
                nextJ = j + 1;
                if (nextJ >= n - i - 1) {
                    nextI = i + 1;
                    nextJ = 0;
                }
                if (nextI < n - 1) {
                    nextComparing = [nextJ, nextJ + 1];
                } else {
                    setStatus('Over');
                                        setMessage('Array is sorted!');
                }
            }
        }

        setArray(newArray);
        setI(nextI);
        setJ(nextJ);
        setComparing(nextComparing);
        setSwapping(nextSwapping);
    };

    
    const isFinished = status === 'Over';
    const { isPlaying, togglePlay, resetAutoplay } = useAutoplay(handleNext, isFinished);

    const reset = () => {
        setArray([...defaultArray]);
        setI(0);
        setJ(0);
        setComparing([-1, -1]);
        setSwapping(false);
        setStatus('Wait');
        setMessage('Compare adjacent elements and bubble the largest to the end.');
        resetAutoplay();
    };

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="text-center space-y-2 mb-12">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Bubble Sort</p>
                <p className="text-lg font-bold text-[var(--text-primary)] max-w-lg mx-auto min-h-[3rem]">{message}</p>
            </div>

            <div className="flex items-end justify-center min-h-[250px] gap-2">
                {array.map((val, idx) => {
                    const isComparing = comparing.includes(idx);
                    const isSorted = status === 'Over' || (status === 'Running' && idx >= array.length - i);
                    
                    return (
                        <div key={idx} className="flex flex-col items-center gap-2">
                            <motion.div
                                layout
                                animate={{
                                    height: `${(val / 100) * 200}px`,
                                    backgroundColor: isSorted ? 'var(--viz-highlight-success-bg)' : isComparing ? 'var(--viz-highlight-compare)' : 'var(--viz-highlight-active-bg)',
                                    borderColor: isSorted ? 'var(--viz-highlight-success)' : isComparing ? 'var(--viz-highlight-compare)' : 'var(--viz-highlight-active)'
                                }}
                                className="w-10 rounded-t-lg border-2 border-b-0"
                            />
                            <motion.div 
                                layout
                                className={`w-10 h-10 rounded-xl border flex items-center justify-center font-black ${
                                    isSorted ? 'bg-[var(--viz-highlight-success-bg)] border-[var(--viz-highlight-success)] text-[var(--viz-highlight-success)]' : 
                                    isComparing ? 'bg-[var(--viz-highlight-compare-bg)] border-[var(--viz-highlight-compare)] text-[var(--viz-highlight-compare)]' : 
                                    'bg-[var(--viz-bg-inactive)] border-[var(--viz-border-inactive)] text-[var(--text-primary)]'
                                }`}
                            >
                                {val}
                            </motion.div>
                        </div>
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
        </div>
    );
}
