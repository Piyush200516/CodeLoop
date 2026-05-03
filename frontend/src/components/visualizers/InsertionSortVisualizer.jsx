import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useAutoplay from '../../hooks/useAutoplay';
import VisualizerControls from './VisualizerControls';

export default function InsertionSortVisualizer() {
    const defaultArray = [64, 34, 25, 12, 22, 11, 90];
    const [array, setArray] = useState([...defaultArray]);
    const [status, setStatus] = useState('Wait');
            const [message, setMessage] = useState('Pick each element and insert it into its correct position in the sorted part.');
    
    // Insertion Sort State
    const [i, setI] = useState(1); // Current unsorted element index
    const [j, setJ] = useState(-1); // Backward scanning index
    const [key, setKey] = useState(null); // The element being inserted
    const [phase, setPhase] = useState('pick'); // pick, compare, shift, insert

    const handleNext = () => {
        if (status === 'Over') return;

        if (status === 'Wait') {
            setStatus('Running');
            setI(1);
            setJ(0);
            setKey(array[1]);
            setPhase('pick');
            setMessage(`Picking element at index 1: ${array[1]}`);
            return;
        }

        const n = array.length;
        if (i >= n) {
            setStatus('Over');
                        setJ(-1);
            setKey(null);
            setMessage('Array is fully sorted!');
            return;
        }

        let newArray = [...array];
        let nextI = i;
        let nextJ = j;
        let nextKey = key;
        let nextPhase = phase;

        if (phase === 'pick') {
            setMessage(`Comparing picked key ${key} with ${newArray[j]} at idx ${j}`);
            nextPhase = 'compare';
        } 
        else if (phase === 'compare') {
            if (j >= 0 && newArray[j] > key) {
                setMessage(`${newArray[j]} is > ${key}. Shifting ${newArray[j]} to the right.`);
                nextPhase = 'shift';
            } else {
                setMessage(`Found correct spot. Inserting ${key} at idx ${j + 1}`);
                nextPhase = 'insert';
            }
        } 
        else if (phase === 'shift') {
            newArray[j + 1] = newArray[j];
            newArray[j] = null; // Visually empty slot
            setMessage(`Shifted. Moving to previous element.`);
            nextJ = j - 1;
            nextPhase = 'compare';
            
            if (nextJ < 0) {
                 setMessage(`Reached start of array. Inserting ${key} at idx 0`);
                 nextPhase = 'insert';
            }
        } 
        else if (phase === 'insert') {
            newArray[j + 1] = key;
            nextI = i + 1;
            
            if (nextI < n) {
                nextJ = nextI - 1;
                nextKey = newArray[nextI];
                nextPhase = 'pick';
                setMessage(`Inserted. Now picking index ${nextI}: ${newArray[nextI]}`);
            } else {
                setStatus('Over');
                                setJ(-1);
                setKey(null);
                setMessage('Array is fully sorted!');
            }
        }

        setArray(newArray);
        setI(nextI);
        setJ(nextJ);
        setKey(nextKey);
        setPhase(nextPhase);
    };

    
    const isFinished = status === 'Over';
    const { isPlaying, togglePlay, resetAutoplay } = useAutoplay(handleNext, isFinished);

    const reset = () => {
        setArray([...defaultArray]);
        setI(1);
        setJ(-1);
        setKey(null);
        setPhase('pick');
        setStatus('Wait');
        setMessage('Pick each element and insert it into its correct position in the sorted part.');
        resetAutoplay();
    };

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="text-center space-y-2 mb-12">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Insertion Sort</p>
                <p className="text-lg font-bold text-[var(--text-primary)] max-w-lg mx-auto min-h-[3rem]">{message}</p>
            </div>

            <div className="flex flex-col items-center gap-8">
                {/* Picked Key Display */}
                <div className="flex flex-col items-center h-20">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-2">Current Key</span>
                    <AnimatePresence mode="popLayout">
                        {key !== null && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.5, y: -20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.5, y: -20 }}
                                className="w-12 h-12 rounded-xl border-2 border-[var(--viz-highlight-active)] bg-[var(--viz-highlight-active-bg)] text-[var(--viz-highlight-active)] flex items-center justify-center font-black text-xl shadow-lg shadow-brand-500/20"
                            >
                                {key}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Array */}
                <div className="flex items-end justify-center min-h-[250px] gap-2">
                    {array.map((val, idx) => {
                        const isSortedArea = idx < i && status !== 'Wait';
                        const isComparing = phase === 'compare' && idx === j;
                        const isEmpty = val === null;
                        const isFullySorted = status === 'Over';
                        const isNextPick = phase === 'pick' && idx === i;
                        
                        return (
                            <div key={idx} className="flex flex-col items-center gap-2">
                                <motion.div
                                    layout
                                    animate={{
                                        height: isEmpty ? '20px' : `${(val / 100) * 200}px`,
                                        opacity: isEmpty ? 0.2 : 1,
                                        backgroundColor: isFullySorted ? 'var(--viz-highlight-success-bg)' : 
                                                         isNextPick ? 'var(--viz-highlight-warning)' : 
                                                         isComparing ? 'var(--viz-highlight-compare)' : 
                                                         isSortedArea ? 'rgba(16, 185, 129, 0.3)' : 'var(--viz-highlight-active-bg)',
                                        borderColor: isFullySorted ? 'var(--viz-highlight-success)' : isNextPick ? 'var(--viz-highlight-warning)' : isComparing ? 'var(--viz-highlight-compare)' : isSortedArea ? 'var(--viz-highlight-success)' : 'var(--viz-highlight-active)'
                                    }}
                                    className="w-10 rounded-t-lg border-2 border-b-0"
                                />
                                <motion.div 
                                    layout
                                    className={`w-10 h-10 rounded-xl border flex items-center justify-center font-black ${
                                        isEmpty ? 'bg-transparent border-dashed border-[var(--viz-border-inactive)]' :
                                        isFullySorted ? 'bg-[var(--viz-highlight-success-bg)] border-[var(--viz-highlight-success)] text-[var(--viz-highlight-success)]' : 
                                        isNextPick ? 'bg-yellow-500/20 border-yellow-500 text-yellow-500' :
                                        isComparing ? 'bg-[var(--viz-highlight-compare-bg)] border-[var(--viz-highlight-compare)] text-[var(--viz-highlight-compare)]' : 
                                        isSortedArea ? 'bg-emerald-500/10 border-[var(--viz-highlight-success)]/50 text-emerald-300' :
                                        'bg-[var(--viz-bg-inactive)] border-[var(--viz-border-inactive)] text-[var(--text-primary)]'
                                    }`}
                                >
                                    {val !== null ? val : ''}
                                </motion.div>
                            </div>
                        );
                    })}
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
