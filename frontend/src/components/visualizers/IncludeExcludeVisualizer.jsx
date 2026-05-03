import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useAutoplay from '../../hooks/useAutoplay';
import VisualizerControls from './VisualizerControls';

export default function IncludeExcludeVisualizer() {
    const array = [1, 2, 3];
    const [stepIndex, setStepIndex] = useState(-1);
    const [steps, setSteps] = useState([]);

    // Generate steps for Include-Exclude recursion
    useEffect(() => {
        const tempSteps = [];
        const currentSubset = [];

        function generateSubsets(index) {
            // Base case: we've considered all elements
            if (index === array.length) {
                tempSteps.push({
                    index,
                    currentSubset: [...currentSubset],
                    decision: 'base',
                    element: null,
                    explanation: `Base case reached. Current subset: [${currentSubset.join(', ')}]`,
                    path: [...currentSubset]
                });
                return;
            }

            // Choice 1: Include array[index]
            tempSteps.push({
                index,
                currentSubset: [...currentSubset],
                decision: 'include',
                element: array[index],
                explanation: `Trying to include element ${array[index]} in the subset.`,
                path: [...currentSubset, array[index]]
            });
            currentSubset.push(array[index]);
            generateSubsets(index + 1);

            // Backtrack
            tempSteps.push({
                index,
                currentSubset: [...currentSubset],
                decision: 'backtrack',
                element: array[index],
                explanation: `Backtracking from including ${array[index]}.`,
                path: [...currentSubset]
            });
            currentSubset.pop();

            // Choice 2: Exclude array[index]
            tempSteps.push({
                index,
                currentSubset: [...currentSubset],
                decision: 'exclude',
                element: array[index],
                explanation: `Exploring subsets without element ${array[index]}.`,
                path: [...currentSubset]
            });
            generateSubsets(index + 1);
            
            // Final backtrack for this level
            tempSteps.push({
                index,
                currentSubset: [...currentSubset],
                decision: 'return',
                element: array[index],
                explanation: `Returning from level ${index}.`,
                path: [...currentSubset]
            });
        }

        generateSubsets(0);
        setSteps(tempSteps);
    }, []);

    const handleNext = () => {
        if (stepIndex < steps.length - 1) {
            setStepIndex(prev => prev + 1);
        }
    };

    const currentStep = stepIndex >= 0 ? steps[stepIndex] : null;
    const status = stepIndex === -1 ? 'Wait' : (stepIndex === steps.length - 1 ? 'Found' : 'Running');

    const { isPlaying, togglePlay, resetAutoplay } = useAutoplay(handleNext, status === 'Found');

    const reset = () => {
        setStepIndex(-1);
        resetAutoplay();
    };

    // Simple recursion tree structure for visualization
    // Level 0: []
    // Level 1: [1], []
    // Level 2: [1,2], [1], [2], []
    // Level 3: [1,2,3], [1,2], [1,3], [1], [2,3], [2], [3], []
    
    // For simplicity and visibility, we'll draw the current path and the "stack" logic.
    const activePath = currentStep ? currentStep.path : [];

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-12">
            {/* Input Display */}
            <div className="flex flex-col items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Input Array</span>
                <div className="flex gap-2">
                    {array.map((val, i) => (
                        <div 
                            key={i} 
                            className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold border-2 transition-all ${
                                currentStep && currentStep.index === i 
                                ? 'bg-brand-500/20 border-brand-500 text-brand-400 scale-110 shadow-lg' 
                                : 'bg-slate-800/30 border-slate-700 text-slate-500'
                            }`}
                        >
                            {val}
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Visualization: Recursion Path / Set */}
            <div className="relative flex flex-col items-center gap-6 min-h-[150px]">
                <div className="text-center">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Current Subset / Path</p>
                    <div className="flex gap-3 h-16 items-center justify-center">
                        <AnimatePresence mode="popLayout">
                            <motion.div
                                key="start-brace"
                                layout
                                className="text-3xl font-black text-slate-400"
                            >
                                [
                            </motion.div>
                            
                            {activePath.map((val, i) => (
                                <motion.div
                                    key={`path-${i}-${val}`}
                                    initial={{ opacity: 0, scale: 0, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0, y: -20 }}
                                    className="w-12 h-12 rounded-xl bg-brand-500 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-brand-500/20"
                                >
                                    {val}
                                </motion.div>
                            ))}

                            <motion.div
                                key="end-brace"
                                layout
                                className="text-3xl font-black text-slate-400"
                            >
                                ]
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>

                {/* Explanation text */}
                <div className="bg-brand-500/5 border border-brand-500/10 rounded-2xl p-6 max-w-md w-full text-center shadow-xl backdrop-blur-sm">
                    <p className="text-lg font-bold text-slate-200">
                        {stepIndex === -1 ? 'Click "Start" to visualize subset generation' : currentStep?.explanation}
                    </p>
                    {currentStep && (
                        <div className="mt-4 flex justify-center gap-4 text-[10px] font-black uppercase tracking-widest">
                            <span className={currentStep.decision === 'include' ? 'text-emerald-500' : 'text-slate-600'}>Include</span>
                            <span className={currentStep.decision === 'exclude' ? 'text-red-500' : 'text-slate-600'}>Exclude</span>
                            <span className={currentStep.decision === 'backtrack' ? 'text-amber-500' : 'text-slate-600'}>Backtrack</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full max-w-sm h-1 bg-slate-800 rounded-full overflow-hidden">
                <motion.div 
                    className="h-full bg-brand-500"
                    animate={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }}
                />
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
