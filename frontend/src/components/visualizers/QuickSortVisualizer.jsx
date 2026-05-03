import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import useAutoplay from '../../hooks/useAutoplay';
import VisualizerControls from './VisualizerControls';

export default function QuickSortVisualizer() {
    const defaultArray = [64, 34, 25, 12, 22, 11, 90];
    
    // Precalculate all steps for QuickSort
    const steps = useMemo(() => {
        let history = [];
        let tempArr = [...defaultArray];
        
        history.push({ array: [...tempArr], comparing: [], message: 'Initial Array' });

        const partition = (arr, low, high) => {
            let pivot = arr[high]; // Pivot element
            history.push({ 
                array: [...arr], 
                pivotIndex: high,
                activeRange: [low, high],
                message: `Selected pivot ${pivot} at index ${high}` 
            });

            let i = low - 1; // Index of smaller element

            for (let j = low; j < high; j++) {
                history.push({ 
                    array: [...arr], 
                    activeRange: [low, high],
                    pivotIndex: high,
                    comparing: [j],
                    message: `Comparing ${arr[j]} with pivot ${pivot}` 
                });

                if (arr[j] < pivot) {
                    i++;
                    let temp = arr[i];
                    arr[i] = arr[j];
                    arr[j] = temp;
                    history.push({ 
                        array: [...arr], 
                        activeRange: [low, high],
                        pivotIndex: high,
                        swapping: [i, j],
                        message: `Swapping ${arr[i]} and ${arr[j]}` 
                    });
                }
            }
            
            // Swap pivot into correct position
            let temp = arr[i + 1];
            arr[i + 1] = arr[high];
            arr[high] = temp;
            
            history.push({ 
                array: [...arr], 
                activeRange: [low, high],
                pivotPlaced: i + 1,
                swapping: [i + 1, high],
                message: `Placing pivot ${pivot} at correct sorted position ${i + 1}` 
            });

            return i + 1;
        };

        const quickSort = (arr, low, high) => {
            if (low < high) {
                let pi = partition(arr, low, high);
                quickSort(arr, low, pi - 1);
                quickSort(arr, pi + 1, high);
            }
        };

        quickSort(tempArr, 0, tempArr.length - 1);
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
    const swapping = stepData.swapping || [];
    const activeRange = stepData.activeRange || [-1, -1];
    const pivotIndex = stepData.pivotIndex;
    const pivotPlaced = stepData.pivotPlaced;
    const message = stepData.message;

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="text-center space-y-2 mb-12">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Quick Sort</p>
                <p className="text-lg font-bold text-[var(--text-primary)] max-w-lg mx-auto min-h-[3rem]">{message}</p>
                <p className="text-xs text-brand-500">Step: {currentStep + 1} / {steps.length}</p>
            </div>

            <div className="flex items-end justify-center min-h-[250px] gap-2">
                {array.map((val, idx) => {
                    const isFullySorted = currentStep === steps.length - 1;
                    const isComparing = comparing.includes(idx);
                    const isSwapping = swapping.includes(idx);
                    const isPivot = idx === pivotIndex;
                    const isPlaced = idx === pivotPlaced || (isFullySorted);
                    const isActive = idx >= activeRange[0] && idx <= activeRange[1];
                    
                    return (
                        <div key={idx} className="flex flex-col items-center gap-2">
                            <motion.div
                                animate={{
                                    height: `${(val / 100) * 200}px`,
                                    backgroundColor: isPlaced ? 'var(--viz-highlight-success)' : 
                                                     isPivot ? 'var(--viz-highlight-warning)' :
                                                     isSwapping ? 'var(--viz-highlight-compare)' :
                                                     isComparing ? 'var(--viz-highlight-compare)' : 
                                                     isActive ? 'var(--viz-highlight-active-bg)' : 'var(--viz-highlight-active-bg)',
                                    borderColor: isPlaced ? 'var(--viz-highlight-success)' : isPivot ? 'var(--viz-highlight-warning)' : isSwapping ? 'var(--viz-highlight-compare)' : isComparing ? 'var(--viz-highlight-compare)' : isActive ? 'var(--viz-highlight-active)' : 'var(--viz-highlight-active-bg)'
                                }}
                                className="w-10 rounded-t-lg border-2 border-b-0 transition-colors duration-300"
                            />
                            <motion.div 
                                className={`w-10 h-10 rounded-xl border flex items-center justify-center font-black transition-colors duration-300 ${
                                    isPlaced ? 'bg-[var(--viz-highlight-success-bg)] border-[var(--viz-highlight-success)] text-[var(--viz-highlight-success)]' : 
                                    isPivot ? 'bg-yellow-500/20 border-yellow-500 text-yellow-500' :
                                    isSwapping ? 'bg-orange-500/20 border-orange-500 text-orange-400' :
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
