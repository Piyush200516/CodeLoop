import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import useAutoplay from '../../hooks/useAutoplay';
import VisualizerControls from './VisualizerControls';

export default function RecursionTreeVisualizer() {
    // Generate the steps for Fib(4)
    const steps = useMemo(() => {
        let history = [];
        let callIDCounter = 0;
        
        history.push({ 
            phase: 'init', activeNodes: [], returnValues: {}, message: 'Visualizing Recursion Tree for Fibonacci(4)' 
        });

        const fib = (n, parentId = null) => {
            const id = callIDCounter++;
            let currentActive = history[history.length - 1]?.activeNodes || [];
            let currentReturns = history[history.length - 1]?.returnValues || {};
            
            history.push({ 
                phase: 'call', 
                activeNodes: [...currentActive, { id, n, parentId }], 
                returnValues: { ...currentReturns },
                currNode: id,
                message: `Calling Fib(${n})` 
            });

            if (n <= 1) {
                let ans = n;
                history.push({ 
                    phase: 'base_case', 
                    activeNodes: [...currentActive, { id, n, parentId }], 
                    returnValues: { ...currentReturns, [id]: ans },
                    currNode: id,
                    message: `Base case reached! Fib(${n}) returns ${ans}` 
                });
                return { ans, id };
            }

            // Left call
            const left = fib(n - 1, id);
            
            // Right call
            currentActive = history[history.length - 1]?.activeNodes || [];
            currentReturns = history[history.length - 1]?.returnValues || {};
            history.push({ 
                phase: 'resume', 
                activeNodes: [...currentActive], 
                returnValues: { ...currentReturns },
                currNode: id,
                message: `Resuming Fib(${n}), now calling Fib(${n - 2})` 
            });
            const right = fib(n - 2, id);

            // Return
            const ans = left.ans + right.ans;
            currentActive = history[history.length - 1]?.activeNodes || [];
            currentReturns = history[history.length - 1]?.returnValues || {};
            history.push({ 
                phase: 'return', 
                activeNodes: [...currentActive], 
                returnValues: { ...currentReturns, [id]: ans },
                currNode: id,
                message: `Fib(${n}) computes ${left.ans} + ${right.ans} and returns ${ans}` 
            });

            return { ans, id };
        };

        fib(4);
        
        let finalReturns = history[history.length - 1]?.returnValues;
        history.push({ 
            phase: 'done', 
            activeNodes: history[history.length - 1].activeNodes, 
            returnValues: finalReturns, 
            currNode: 0,
            message: `Execution complete! Fib(4) = ${finalReturns[0]}` 
        });

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

    const stepData = steps[currentStep] || steps[0];
    const activeNodes = stepData.activeNodes || [];
    const returnValues = stepData.returnValues || {};
    const currNode = stepData.currNode;
    const message = stepData.message;

    // Build hierarchical tree for rendering
    const renderNode = (id) => {
        const node = activeNodes.find(n => n.id === id);
        if (!node) return null;

        const children = activeNodes.filter(n => n.parentId === id);
        const hasReturned = returnValues[id] !== undefined;
        const isCurrent = currNode === id;
        
        return (
            <div key={id} className="flex flex-col items-center gap-6 relative">
                <motion.div
                    initial={{ opacity: 0, scale: 0.5, y: -20 }}
                    animate={{ 
                        opacity: 1, scale: isCurrent ? 1.1 : 1, y: 0,
                        backgroundColor: isCurrent ? 'var(--viz-highlight-warning-bg)' : hasReturned ? 'var(--viz-highlight-success-bg)' : 'var(--viz-highlight-active-bg)',
                        borderColor: isCurrent ? 'var(--viz-highlight-warning)' : hasReturned ? 'var(--viz-highlight-success)' : 'var(--viz-highlight-active)'
                    }}
                    className="w-20 h-20 rounded-2xl border-2 flex items-center justify-center font-black text-lg text-[var(--text-primary)] shadow-xl relative z-10"
                >
                    <div className="flex flex-col items-center">
                        <span className="text-[10px] text-[var(--text-secondary)]">Fib({node.n})</span>
                        {hasReturned && <span className="text-xl text-[var(--viz-highlight-success)]">{returnValues[id]}</span>}
                    </div>
                </motion.div>
                
                {children.length > 0 && (
                    <div className="flex gap-8 sm:gap-16 pt-4 relative border-t-2 border-[var(--viz-border-inactive)]/50 mt-4 px-4 w-full justify-center">
                        {/* Lines connecting parent to children */}
                        {children.map(child => renderNode(child.id))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 overflow-hidden">
            <div className="text-center space-y-2 mb-8">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Recursion Tree (Fibonacci)</p>
                <p className="text-lg font-bold text-[var(--text-primary)] max-w-lg mx-auto min-h-[3rem]">{message}</p>
                <p className="text-xs text-brand-500">Step: {currentStep + 1} / {steps.length}</p>
            </div>

            <div className="flex flex-col items-center justify-start w-full max-w-5xl min-h-[400px] overflow-auto custom-scrollbar p-4">
                {activeNodes.length > 0 ? renderNode(0) : (
                    <div className="text-slate-500 italic mt-20">Click Start to begin visualization</div>
                )}
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
