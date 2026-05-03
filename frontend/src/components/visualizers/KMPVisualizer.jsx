import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import useAutoplay from '../../hooks/useAutoplay';
import VisualizerControls from './VisualizerControls';

export default function KMPVisualizer() {
    const text = "ONIONSIONS";
    const pattern = "ONIONS";

    // Precalculate KMP steps
    const steps = useMemo(() => {
        let history = [];
        let M = pattern.length;
        let N = text.length;

        // Phase 1: Compute LPS array
        let lps = new Array(M).fill(0);
        history.push({ 
            phase: 'lps', lps: [...lps], pIdx: 0, tIdx: -1, 
            message: 'Phase 1: Building Longest Prefix Suffix (LPS) array.' 
        });

        let len = 0;
        let p = 1;

        while (p < M) {
            history.push({ 
                phase: 'lps', lps: [...lps], currLen: len, pIdx: p, tIdx: -1, 
                message: `Comparing pattern[${p}]='${pattern[p]}' with pattern[${len}]='${pattern[len]}'` 
            });

            if (pattern[p] === pattern[len]) {
                len++;
                lps[p] = len;
                history.push({ 
                    phase: 'lps', lps: [...lps], currLen: len, pIdx: p, tIdx: -1, 
                    match: true,
                    message: `Match! lps[${p}] becomes ${len}. Moving to next char.` 
                });
                p++;
            } else {
                if (len !== 0) {
                    history.push({ 
                        phase: 'lps', lps: [...lps], currLen: len, pIdx: p, tIdx: -1, 
                        match: false,
                        message: `Mismatch! Falling back len from ${len} to lps[${len-1}]=${lps[len-1]}` 
                    });
                    len = lps[len - 1];
                } else {
                    lps[p] = 0;
                    history.push({ 
                        phase: 'lps', lps: [...lps], currLen: 0, pIdx: p, tIdx: -1, 
                        match: false,
                        message: `Mismatch & len is 0. lps[${p}] = 0. Moving to next char.` 
                    });
                    p++;
                }
            }
        }

        history.push({ 
            phase: 'search', lps: [...lps], pIdx: 0, tIdx: 0, 
            message: 'Phase 2: Searching text using LPS array to skip redundant comparisons.' 
        });

        // Phase 2: Search text
        let i = 0; // Text index
        let j = 0; // Pattern index
        let matches = [];

        while (i < N) {
            history.push({ 
                phase: 'search', lps: [...lps], pIdx: j, tIdx: i, matches: [...matches], windowStart: i - j,
                message: `Comparing text[${i}]='${text[i]}' with pattern[${j}]='${pattern[j]}'` 
            });

            if (pattern[j] === text[i]) {
                j++;
                i++;
                history.push({ 
                    phase: 'search', lps: [...lps], pIdx: j, tIdx: i, matches: [...matches], windowStart: i - j, 
                    match: true,
                    message: `Match! Both indices incremented.` 
                });
            }

            if (j === M) {
                matches.push(i - j);
                history.push({ 
                    phase: 'search', lps: [...lps], pIdx: j, tIdx: i, matches: [...matches], windowStart: i - j, 
                    found: true,
                    message: `Pattern found at index ${i - j}! Resetting pattern index to lps[${j-1}]=${lps[j-1]}` 
                });
                j = lps[j - 1];
            } else if (i < N && pattern[j] !== text[i]) {
                if (j !== 0) {
                    history.push({ 
                        phase: 'search', lps: [...lps], pIdx: j, tIdx: i, matches: [...matches], windowStart: i - j, 
                        match: false,
                        message: `Mismatch! Pattern shifts. New pattern index is lps[${j-1}]=${lps[j-1]}` 
                    });
                    j = lps[j - 1];
                } else {
                    history.push({ 
                        phase: 'search', lps: [...lps], pIdx: j, tIdx: i, matches: [...matches], windowStart: i - j, 
                        match: false,
                        message: `Mismatch at start of pattern. Incrementing text index.` 
                    });
                    i++;
                }
            }
        }

        history.push({ 
            phase: 'done', lps: [...lps], pIdx: -1, tIdx: -1, matches: [...matches], 
            message: 'Search complete!' 
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

    const stepData = steps[currentStep];
    const lps = stepData.lps;
    const phase = stepData.phase;
    const pIdx = stepData.pIdx;
    const tIdx = stepData.tIdx;
    const isMatch = stepData.match;
    const windowStart = stepData.windowStart !== undefined ? stepData.windowStart : -1;
    const matches = stepData.matches || [];
    const message = stepData.message;

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 overflow-hidden">
            <div className="text-center space-y-2 mb-12">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">KMP Algorithm</p>
                <p className="text-lg font-bold text-[var(--text-primary)] max-w-lg mx-auto min-h-[3rem]">{message}</p>
                <p className="text-xs text-brand-500">Step: {currentStep + 1} / {steps.length}</p>
            </div>

            <div className="flex flex-col items-center gap-12 max-w-4xl w-full">
                {/* Text Array */}
                <div className="w-full flex flex-col gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Text Array</span>
                    <div className="flex gap-1 overflow-x-auto pb-4 custom-scrollbar">
                        {text.split('').map((char, idx) => {
                            const isSearchPhase = phase === 'search';
                            const isCurrentText = isSearchPhase && idx === tIdx;
                            const isFound = matches.some(m => idx >= m && idx < m + pattern.length);
                            
                            return (
                                <motion.div
                                    key={idx}
                                    animate={{
                                        scale: isCurrentText ? 1.1 : 1,
                                        backgroundColor: isFound ? 'var(--viz-highlight-success-bg)' : 
                                                         isCurrentText ? (isMatch === true ? 'var(--viz-highlight-success-bg)' : isMatch === false ? 'var(--viz-highlight-compare-bg)' : 'var(--viz-highlight-active)') : 
                                                         !isSearchPhase ? 'rgba(31, 41, 55, 0.2)' : 'var(--viz-bg-inactive)',
                                        borderColor: isFound ? 'var(--viz-highlight-success)' : isCurrentText ? 'var(--viz-highlight-active)' : 'var(--viz-border-inactive)'
                                    }}
                                    className="min-w-10 min-h-10 border-2 rounded flex items-center justify-center font-bold text-lg text-[var(--text-primary)]"
                                >
                                    {char}
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* Pattern Array & LPS */}
                <div className="w-full flex flex-col gap-2 relative">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">
                        {phase === 'lps' ? 'Pattern & Computing LPS Array' : 'Pattern sliding under Text'}
                    </span>
                    
                    <motion.div 
                        className="flex gap-1"
                        animate={{ x: phase === 'search' && windowStart >= 0 ? windowStart * 44 : 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    >
                        {pattern.split('').map((char, idx) => {
                            const isCurrentPattern = idx === pIdx;
                            const lpsVal = lps[idx];
                            
                            return (
                                <div key={idx} className="flex flex-col gap-1 w-10">
                                    <motion.div
                                        animate={{
                                            backgroundColor: isCurrentPattern ? 'var(--viz-highlight-warning-bg)' : 'rgba(139, 92, 246, 0.2)',
                                            borderColor: isCurrentPattern ? 'var(--viz-highlight-warning)' : 'rgba(139, 92, 246, 0.5)'
                                        }}
                                        className="h-10 border-2 rounded flex items-center justify-center font-bold text-lg text-[var(--text-primary)]"
                                    >
                                        {char}
                                    </motion.div>
                                    <div className="h-6 bg-[var(--viz-bg-inactive)]/80 rounded border border-white/5 flex items-center justify-center text-xs font-mono text-[var(--text-secondary)]">
                                        {lpsVal}
                                    </div>
                                    <span className="text-[8px] text-center text-slate-600 font-bold">LPS[{idx}]</span>
                                </div>
                            );
                        })}
                    </motion.div>
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
