import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import useAutoplay from '../../hooks/useAutoplay';
import VisualizerControls from './VisualizerControls';

export default function MergeSortVisualizer() {
    const defaultArray = [38, 27, 43, 3, 9, 82, 10];
    
    // Instead of complex iterative state, we precalculate all steps
    // Step: { array: [...], comparing: [i, j], replacing: {idx, val}, message: "" }
    const steps = useMemo(() => {
        let history = [];
        let tempArr = [...defaultArray];
        
        history.push({ array: [...tempArr], comparing: [], message: 'Initial Array' });

        const merge = (arr, l, m, r) => {
            let n1 = m - l + 1;
            let n2 = r - m;
            let L = new Array(n1);
            let R = new Array(n2);

            for (let i = 0; i < n1; ++i) L[i] = arr[l + i];
            for (let j = 0; j < n2; ++j) R[j] = arr[m + 1 + j];

            let i = 0, j = 0, k = l;

            history.push({ 
                array: [...arr], 
                comparing: [], 
                activeRange: [l, r],
                message: `Merging subarrays [${L.join(', ')}] and [${R.join(', ')}]` 
            });

            while (i < n1 && j < n2) {
                history.push({ 
                    array: [...arr], 
                    activeRange: [l, r],
                    comparing: [l + i, m + 1 + j], 
                    message: `Comparing L[${i}]=${L[i]} and R[${j}]=${R[j]}` 
                });

                if (L[i] <= R[j]) {
                    arr[k] = L[i];
                    history.push({ array: [...arr], activeRange: [l, r], comparing: [k], message: `Placed ${L[i]} at index ${k}` });
                    i++;
                } else {
                    arr[k] = R[j];
                    history.push({ array: [...arr], activeRange: [l, r], comparing: [k], message: `Placed ${R[j]} at index ${k}` });
                    j++;
                }
                k++;
            }

            while (i < n1) {
                arr[k] = L[i];
                history.push({ array: [...arr], activeRange: [l, r], comparing: [k], message: `Placing remaining ${L[i]} at index ${k}` });
                i++;
                k++;
            }

            while (j < n2) {
                arr[k] = R[j];
                history.push({ array: [...arr], activeRange: [l, r], comparing: [k], message: `Placing remaining ${R[j]} at index ${k}` });
                j++;
                k++;
            }
            
            history.push({ array: [...arr], comparing: [], message: `Merged section: [${arr.slice(l, r+1).join(', ')}]` });
        };

        const mergeSort = (arr, l, r) => {
            if (l >= r) return;
            let m = l + Math.floor((r - l) / 2);
            history.push({ array: [...arr], comparing: [], activeRange: [l, r], message: `Dividing array from index ${l} to ${r}` });
            mergeSort(arr, l, m);
            mergeSort(arr, m + 1, r);
            merge(arr, l, m, r);
        };

        mergeSort(tempArr, 0, tempArr.length - 1);
        history.push({ array: [...tempArr], comparing: [], message: 'Array is fully sorted!' });
        return history;
    }, []);

    const [currentStep, setCurrentStep] = useState(0);
    const [status, setStatus] = useState('Wait');
        
    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1);
            setStatus('Running');
        } else {
            setStatus('Over');
        }
    };

    const isFinished = status === 'Over';
    const { isPlaying, togglePlay, resetAutoplay } = useAutoplay(handleNext, isFinished);

    const reset = () => {
        setCurrentStep(0);
        setStatus('Wait');
        resetAutoplay();
    };

    const stepData = steps[currentStep];
    const array = stepData.array;
    const comparing = stepData.comparing || [];
    const activeRange = stepData.activeRange || [-1, -1];
    const message = stepData.message;

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="text-center space-y-2 mb-12">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Merge Sort</p>
                <p className="text-lg font-bold text-[var(--text-primary)] max-w-lg mx-auto min-h-[3rem]">{message}</p>
                <p className="text-xs text-brand-500">Step: {currentStep + 1} / {steps.length}</p>
            </div>

            <div className="flex items-end justify-center min-h-[250px] gap-2">
                {array.map((val, idx) => {
                    const isFullySorted = currentStep === steps.length - 1;
                    const isComparing = comparing.includes(idx);
                    const isActive = idx >= activeRange[0] && idx <= activeRange[1];
                    
                    return (
                        <div key={idx} className="flex flex-col items-center gap-2">
                            <motion.div
                                animate={{
                                    height: `${(val / 100) * 200}px`,
                                    backgroundColor: isFullySorted ? 'var(--viz-highlight-success-bg)' : 
                                                     isComparing ? 'var(--viz-highlight-compare)' : 
                                                     isActive ? 'var(--viz-highlight-active-bg)' : 'var(--viz-highlight-active-bg)',
                                    borderColor: isFullySorted ? 'var(--viz-highlight-success)' : isComparing ? 'var(--viz-highlight-compare)' : isActive ? 'var(--viz-highlight-active)' : 'var(--viz-highlight-active-bg)'
                                }}
                                className="w-10 rounded-t-lg border-2 border-b-0 transition-colors duration-300"
                            />
                            <motion.div 
                                className={`w-10 h-10 rounded-xl border flex items-center justify-center font-black transition-colors duration-300 ${
                                    isFullySorted ? 'bg-[var(--viz-highlight-success-bg)] border-[var(--viz-highlight-success)] text-[var(--viz-highlight-success)]' : 
                                    isComparing ? 'bg-[var(--viz-highlight-compare-bg)] border-[var(--viz-highlight-compare)] text-[var(--viz-highlight-compare)]' : 
                                    isActive ? 'bg-[var(--viz-highlight-compare-bg)] border-[var(--viz-highlight-active)] text-[var(--viz-highlight-active)]' :
                                    'bg-[var(--viz-bg-inactive)] border-[var(--viz-border-inactive)] text-[var(--text-secondary)]'
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
