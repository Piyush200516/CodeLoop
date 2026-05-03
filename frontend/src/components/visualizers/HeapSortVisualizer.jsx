import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import useAutoplay from '../../hooks/useAutoplay';
import VisualizerControls from './VisualizerControls';

export default function HeapSortVisualizer() {
    const defaultArray = [64, 34, 25, 12, 22, 11, 90];
    
    // Precalculate all steps for Heap Sort
    const steps = useMemo(() => {
        let history = [];
        let tempArr = [...defaultArray];
        let n = tempArr.length;
        
        history.push({ array: [...tempArr], message: 'Initial Array' });

        const heapify = (arr, n, i) => {
            let largest = i;
            let left = 2 * i + 1;
            let right = 2 * i + 2;

            if (left < n && arr[left] > arr[largest]) {
                largest = left;
            }

            if (right < n && arr[right] > arr[largest]) {
                largest = right;
            }

            history.push({ 
                array: [...arr], 
                heapifying: [i, left < n ? left : -1, right < n ? right : -1],
                largest: largest,
                heapBoundary: n,
                message: `Heapify at index ${i}. Largest is at index ${largest}` 
            });

            if (largest !== i) {
                let temp = arr[i];
                arr[i] = arr[largest];
                arr[largest] = temp;
                
                history.push({ 
                    array: [...arr], 
                    swapping: [i, largest],
                    heapBoundary: n,
                    message: `Swapped ${arr[largest]} and ${arr[i]} to maintain max heap` 
                });

                heapify(arr, n, largest);
            }
        };

        // Build max heap
        history.push({ array: [...tempArr], message: 'Phase 1: Build Max Heap from bottom-up' });
        for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
            heapify(tempArr, n, i);
        }
        history.push({ array: [...tempArr], heapBoundary: n, message: 'Max Heap built successfully!' });

        // Extract elements one by one
        history.push({ array: [...tempArr], heapBoundary: n, message: 'Phase 2: Extract max elements one by one' });
        for (let i = n - 1; i > 0; i--) {
            // Swap root with the last element
            let temp = tempArr[0];
            tempArr[0] = tempArr[i];
            tempArr[i] = temp;
            
            history.push({ 
                array: [...tempArr], 
                swapping: [0, i],
                heapBoundary: i + 1,
                message: `Extract max ${tempArr[i]} and place at the end (index ${i})` 
            });

            // Call max heapify on the reduced heap
            heapify(tempArr, i, 0);
        }

        history.push({ array: [...tempArr], heapBoundary: 0, message: 'Array is fully sorted!' });
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
    const heapifying = stepData.heapifying || [];
    const largest = stepData.largest;
    const swapping = stepData.swapping || [];
    const heapBoundary = stepData.heapBoundary !== undefined ? stepData.heapBoundary : array.length;
    const message = stepData.message;

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="text-center space-y-2 mb-12">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Heap Sort</p>
                <p className="text-lg font-bold text-[var(--text-primary)] max-w-lg mx-auto min-h-[3rem]">{message}</p>
                <p className="text-xs text-brand-500">Step: {currentStep + 1} / {steps.length}</p>
            </div>

            <div className="flex items-end justify-center min-h-[250px] gap-2">
                {array.map((val, idx) => {
                    const isFullySorted = currentStep === steps.length - 1;
                    const isSorted = idx >= heapBoundary;
                    const isHeapifying = heapifying.includes(idx);
                    const isLargest = idx === largest;
                    const isSwapping = swapping.includes(idx);
                    
                    return (
                        <div key={idx} className="flex flex-col items-center gap-2">
                            <motion.div
                                animate={{
                                    height: `${(val / 100) * 200}px`,
                                    backgroundColor: isFullySorted || isSorted ? 'var(--viz-highlight-success-bg)' : 
                                                     isSwapping ? 'var(--viz-highlight-compare)' :
                                                     isLargest ? 'var(--viz-highlight-warning)' :
                                                     isHeapifying ? 'rgba(239, 68, 68, 0.6)' : 'var(--viz-highlight-active-bg)',
                                    borderColor: isFullySorted || isSorted ? 'var(--viz-highlight-success)' : isSwapping ? 'var(--viz-highlight-compare)' : isLargest ? 'var(--viz-highlight-warning)' : isHeapifying ? 'var(--viz-highlight-compare)' : 'var(--viz-highlight-active)'
                                }}
                                className="w-10 rounded-t-lg border-2 border-b-0 transition-colors duration-300"
                            />
                            <motion.div 
                                className={`w-10 h-10 rounded-xl border flex items-center justify-center font-black transition-colors duration-300 ${
                                    isFullySorted || isSorted ? 'bg-[var(--viz-highlight-success-bg)] border-[var(--viz-highlight-success)] text-[var(--viz-highlight-success)]' : 
                                    isSwapping ? 'bg-orange-500/20 border-orange-500 text-orange-400' :
                                    isLargest ? 'bg-yellow-500/20 border-yellow-500 text-yellow-500' :
                                    isHeapifying ? 'bg-[var(--viz-highlight-compare-bg)] border-[var(--viz-highlight-compare)] text-[var(--viz-highlight-compare)]' : 
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
