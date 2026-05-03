import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useAutoplay from '../../hooks/useAutoplay';
import VisualizerControls from './VisualizerControls';

export default function BacktrackingVisualizer() {
    const N = 4;
    const [stepIndex, setStepIndex] = useState(-1);
    const [steps, setSteps] = useState([]);
    
    // Generate steps for N-Queens
    useEffect(() => {
        const tempSteps = [];
        const board = Array(N).fill(null).map(() => Array(N).fill(0)); // 0: empty, 1: queen

        const isSafe = (board, row, col) => {
            tempSteps.push({
                board: board.map(r => [...r]),
                row,
                col,
                action: 'check',
                explanation: `Checking if position (${row}, ${col}) is safe.`
            });

            // Check this row on left side
            for (let i = 0; i < col; i++) {
                if (board[row][i] === 1) {
                    tempSteps.push({
                        board: board.map(r => [...r]),
                        row,
                        col,
                        conflict: { r: row, c: i },
                        action: 'error',
                        explanation: `Conflict detected with queen at (${row}, ${i}).`
                    });
                    return false;
                }
            }

            // Check upper diagonal on left side
            for (let i = row, j = col; i >= 0 && j >= 0; i--, j--) {
                if (board[i][j] === 1) {
                    tempSteps.push({
                        board: board.map(r => [...r]),
                        row,
                        col,
                        conflict: { r: i, c: j },
                        action: 'error',
                        explanation: `Conflict detected on upper diagonal at (${i}, ${j}).`
                    });
                    return false;
                }
            }

            // Check lower diagonal on left side
            for (let i = row, j = col; j >= 0 && i < N; i++, j--) {
                if (board[i][j] === 1) {
                    tempSteps.push({
                        board: board.map(r => [...r]),
                        row,
                        col,
                        conflict: { r: i, c: j },
                        action: 'error',
                        explanation: `Conflict detected on lower diagonal at (${i}, ${j}).`
                    });
                    return false;
                }
            }

            return true;
        };

        const solveNQ = (board, col) => {
            if (col >= N) {
                tempSteps.push({
                    board: board.map(r => [...r]),
                    action: 'success',
                    explanation: "Solution found! All queens placed."
                });
                return true;
            }

            for (let i = 0; i < N; i++) {
                if (isSafe(board, i, col)) {
                    board[i][col] = 1;
                    tempSteps.push({
                        board: board.map(r => [...r]),
                        row: i,
                        col,
                        action: 'place',
                        explanation: `Safe! Placing queen at (${i}, ${col}).`
                    });

                    if (solveNQ(board, col + 1)) return true;

                    // Backtrack
                    board[i][col] = 0;
                    tempSteps.push({
                        board: board.map(r => [...r]),
                        row: i,
                        col,
                        action: 'remove',
                        explanation: `Backtracking from (${i}, ${col}). Removing queen.`
                    });
                }
            }
            return false;
        };

        solveNQ(board, 0);
        setSteps(tempSteps);
    }, []);

    const handleNext = () => {
        if (stepIndex < steps.length - 1) {
            setStepIndex(prev => prev + 1);
        }
    };

    const currentStep = stepIndex >= 0 ? steps[stepIndex] : null;
    const board = currentStep ? currentStep.board : Array(N).fill(null).map(() => Array(N).fill(0));
    const status = stepIndex === -1 ? 'Wait' : (stepIndex === steps.length - 1 ? 'Found' : 'Running');

    const isFinished = status === 'Found';
    const { isPlaying, togglePlay, resetAutoplay } = useAutoplay(handleNext, isFinished);

    const reset = () => {
        setStepIndex(-1);
        resetAutoplay();
    };

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-8">
            {/* Status & Explanation */}
            <div className="text-center space-y-2 max-w-md">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                    Step {stepIndex + 1} of {steps.length}
                </p>
                <p className="text-xl font-black text-slate-100 min-h-[3rem] flex items-center justify-center">
                    {stepIndex === -1 ? "Click 'Start' to visualize N-Queens (4x4)" : (currentStep?.explanation || "")}
                </p>
            </div>

            {/* Chessboard */}
            <div 
                className="grid gap-2 p-4 rounded-xl bg-[var(--viz-bg-inactive)]/30 border border-white/5 shadow-2xl"
                style={{ gridTemplateColumns: `repeat(${N}, 1fr)` }}
            >
                {board.map((row, rIdx) => (
                    row.map((cell, cIdx) => {
                        const isCurrent = currentStep?.row === rIdx && currentStep?.col === cIdx;
                        const isConflict = currentStep?.conflict?.r === rIdx && currentStep?.conflict?.c === cIdx;
                        const action = currentStep?.action;
                        
                        let bgColor = 'var(--viz-bg-inactive)';
                        let borderColor = 'var(--viz-border-inactive)';
                        let textColor = 'text-slate-500';

                        if (isCurrent) {
                            if (action === 'check') {
                                bgColor = 'var(--viz-highlight-active-bg)';
                                borderColor = 'var(--viz-highlight-active)';
                                textColor = 'var(--viz-highlight-active)';
                            } else if (action === 'place') {
                                bgColor = 'var(--viz-highlight-success-bg)';
                                borderColor = 'var(--viz-highlight-success)';
                                textColor = 'var(--viz-highlight-success)';
                            } else if (action === 'error') {
                                bgColor = 'var(--viz-highlight-error-bg)';
                                borderColor = 'var(--viz-highlight-error)';
                                textColor = 'var(--viz-highlight-error)';
                            } else if (action === 'remove') {
                                bgColor = 'var(--viz-highlight-warning-bg)';
                                borderColor = 'var(--viz-highlight-warning)';
                                textColor = 'var(--viz-highlight-warning)';
                            }
                        } else if (isConflict) {
                            bgColor = 'var(--viz-highlight-compare-bg)';
                            borderColor = 'var(--viz-highlight-compare)';
                            textColor = 'var(--viz-highlight-compare)';
                        }

                        return (
                            <motion.div
                                key={`${rIdx}-${cIdx}`}
                                initial={false}
                                animate={{
                                    backgroundColor: bgColor,
                                    borderColor: borderColor,
                                    scale: isCurrent ? 1.05 : 1,
                                }}
                                className={`w-14 h-14 sm:w-16 sm:h-16 border-2 rounded-xl flex items-center justify-center text-3xl transition-colors`}
                            >
                                <AnimatePresence mode="wait">
                                    {cell === 1 && (
                                        <motion.span
                                            key="queen"
                                            initial={{ scale: 0, rotate: -45 }}
                                            animate={{ scale: 1, rotate: 0 }}
                                            exit={{ scale: 0, rotate: 45 }}
                                            className={isCurrent && action === 'remove' ? 'text-orange-500' : 'text-slate-100'}
                                        >
                                            ♛
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                                {isCurrent && stepIndex >= 0 && (
                                    <div className={`absolute top-0 right-0 p-1`}>
                                        <div className={`w-2 h-2 rounded-full animate-pulse`} style={{ backgroundColor: borderColor }} />
                                    </div>
                                )}
                            </motion.div>
                        );
                    })
                ))}
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
