import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import useAutoplay from '../../hooks/useAutoplay';
import VisualizerControls from './VisualizerControls';

export default function SegmentTreeVisualizer() {
    const input = [2, 4, 5, 7]; // Length 4 -> perfect binary tree of size 7 (1 to 7)
    
    const steps = useMemo(() => {
        let history = [];
        let n = input.length;
        let tree = new Array(2 * n).fill(0);
        
        history.push({ 
            phase: 'init', tree: [...tree], currNode: -1, childNodes: [],
            message: `Initialize Segment Tree array of size ${2 * n}` 
        });

        // Phase 1: Build leaves
        history.push({ 
            phase: 'build_leaves', tree: [...tree], currNode: -1, childNodes: [],
            message: 'Phase 1: Insert original array elements as leaf nodes (indices N to 2N-1)' 
        });
        
        for (let i = 0; i < n; i++) {
            tree[n + i] = input[i];
            history.push({ 
                phase: 'build_leaves', tree: [...tree], currNode: n + i, childNodes: [],
                message: `Inserted input[${i}] = ${input[i]} at tree index ${n + i}` 
            });
        }

        // Phase 2: Build internal nodes
        history.push({ 
            phase: 'build_internal', tree: [...tree], currNode: -1, childNodes: [],
            message: 'Phase 2: Build internal nodes from bottom up: tree[i] = tree[2*i] + tree[2*i + 1]' 
        });

        for (let i = n - 1; i > 0; i--) {
            history.push({ 
                phase: 'build_internal', tree: [...tree], currNode: i, childNodes: [2 * i, 2 * i + 1],
                message: `Computing Node ${i} = Node ${2 * i} (${tree[2 * i]}) + Node ${2 * i + 1} (${tree[2 * i + 1]})` 
            });
            tree[i] = tree[2 * i] + tree[2 * i + 1];
            history.push({ 
                phase: 'build_internal', tree: [...tree], currNode: i, childNodes: [2 * i, 2 * i + 1], built: true,
                message: `Node ${i} is now ${tree[i]}` 
            });
        }

        // Phase 3: Range Query (say sum from idx 1 to 3 -> values 4, 5, 7 -> 16)
        let l = 1, r = 3;
        let originalL = l, originalR = r;
        history.push({ 
            phase: 'query_start', tree: [...tree], currNode: -1, childNodes: [], queryRange: [l, r],
            message: `Phase 3: Range Query Sum. Querying indices [${l}, ${r}] (Values: 4, 5, 7)` 
        });

        l += n;
        r += n;
        let sum = 0;
        let processedNodes = [];

        while (l <= r) {
            history.push({ 
                phase: 'querying', tree: [...tree], queryState: { l, r, sum, processedNodes: [...processedNodes] },
                message: `Current pointers at leaf level: L=${l}, R=${r}` 
            });

            if (l % 2 === 1) { // L is right child
                sum += tree[l];
                processedNodes.push(l);
                history.push({ 
                    phase: 'querying', tree: [...tree], currNode: l, queryState: { l, r, sum, processedNodes: [...processedNodes] },
                    message: `L (${l}) is a right child. Adding ${tree[l]} to sum. New Sum = ${sum}. Increment L.` 
                });
                l++;
            }
            if (r % 2 === 0) { // R is left child
                sum += tree[r];
                processedNodes.push(r);
                history.push({ 
                    phase: 'querying', tree: [...tree], currNode: r, queryState: { l, r, sum, processedNodes: [...processedNodes] },
                    message: `R (${r}) is a left child. Adding ${tree[r]} to sum. New Sum = ${sum}. Decrement R.` 
                });
                r--;
            }
            l = Math.floor(l / 2);
            r = Math.floor(r / 2);
            history.push({ 
                phase: 'querying', tree: [...tree], queryState: { l, r, sum, processedNodes: [...processedNodes] },
                message: `Move up a level: L = Math.floor(L/2) = ${l}, R = Math.floor(R/2) = ${r}` 
            });
        }

        history.push({ 
            phase: 'done', tree: [...tree], queryState: { l, r, sum, processedNodes: [...processedNodes] },
            message: `Query [${originalL}, ${originalR}] Complete! Total Sum = ${sum}` 
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
    const tree = stepData.tree;
    const currNode = stepData.currNode;
    const childNodes = stepData.childNodes || [];
    const isBuilt = stepData.built;
    const queryState = stepData.queryState;
    const message = stepData.message;

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 overflow-hidden">
            <div className="text-center space-y-2 mb-8">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Segment Tree (Sum Query)</p>
                <p className="text-lg font-bold text-[var(--text-primary)] max-w-lg mx-auto min-h-[3rem]">{message}</p>
                <p className="text-xs text-brand-500">Step: {currentStep + 1} / {steps.length}</p>
            </div>

            <div className="flex flex-col items-center gap-12 max-w-4xl w-full">
                {/* Input Array */}
                <div className="w-full flex flex-col gap-2 items-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Input Array</span>
                    <div className="flex gap-2">
                        {input.map((val, idx) => (
                            <div key={idx} className="w-12 h-12 border bg-[var(--viz-bg-inactive)] border-white/10 rounded flex items-center justify-center font-bold text-xl text-[var(--text-primary)]">
                                {val}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tree Array visualization as a Pyramid/Levels */}
                <div className="w-full flex flex-col gap-6 items-center bg-[var(--viz-bg-inactive)]/20 p-6 border border-white/5 rounded-2xl">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Segment Tree Array (Indices 1 to {tree.length - 1})</span>
                    
                    {/* Level 1: Root (index 1) */}
                    <div className="flex justify-center w-full">
                        <Node idx={1} val={tree[1]} currNode={currNode} childNodes={childNodes} isBuilt={isBuilt} queryState={queryState} />
                    </div>
                    {/* Level 2: Children of root (indices 2, 3) */}
                    <div className="flex justify-center w-full gap-16">
                        <Node idx={2} val={tree[2]} currNode={currNode} childNodes={childNodes} isBuilt={isBuilt} queryState={queryState} />
                        <Node idx={3} val={tree[3]} currNode={currNode} childNodes={childNodes} isBuilt={isBuilt} queryState={queryState} />
                    </div>
                    {/* Level 3: Leaves (indices 4, 5, 6, 7) */}
                    <div className="flex justify-center w-full gap-4">
                        <Node idx={4} val={tree[4]} currNode={currNode} childNodes={childNodes} isBuilt={isBuilt} queryState={queryState} />
                        <Node idx={5} val={tree[5]} currNode={currNode} childNodes={childNodes} isBuilt={isBuilt} queryState={queryState} />
                        <Node idx={6} val={tree[6]} currNode={currNode} childNodes={childNodes} isBuilt={isBuilt} queryState={queryState} />
                        <Node idx={7} val={tree[7]} currNode={currNode} childNodes={childNodes} isBuilt={isBuilt} queryState={queryState} />
                    </div>
                </div>

                {queryState && (
                    <div className="text-center p-4 bg-emerald-500/10 border border-[var(--viz-highlight-success)]/20 rounded-xl">
                        <span className="text-[var(--viz-highlight-success)] font-bold uppercase tracking-widest text-xs">Accumulated Sum: {queryState.sum}</span>
                    </div>
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

function Node({ idx, val, currNode, childNodes, isBuilt, queryState }) {
    const isCurrent = currNode === idx;
    const isChild = childNodes.includes(idx);
    const isProcessedInQuery = queryState?.processedNodes?.includes(idx);
    const isPointerL = queryState?.l === idx;
    const isPointerR = queryState?.r === idx;

    let bgColor = 'var(--viz-bg-inactive)';
    let borderColor = 'var(--viz-border-inactive)';
    
    if (isProcessedInQuery) {
        bgColor = 'var(--viz-highlight-success-bg)';
        borderColor = 'var(--viz-highlight-success)';
    } else if (isPointerL || isPointerR) {
        bgColor = 'var(--viz-highlight-warning-bg)';
        borderColor = 'var(--viz-highlight-warning)';
    } else if (isCurrent) {
        bgColor = isBuilt ? 'var(--viz-highlight-active)' : 'var(--viz-highlight-compare-bg)';
        borderColor = isBuilt ? 'var(--viz-highlight-active)' : 'var(--viz-highlight-compare)';
    } else if (isChild) {
        bgColor = 'var(--viz-highlight-active-bg)';
        borderColor = 'var(--viz-highlight-active)';
    }

    return (
        <div className="flex flex-col items-center gap-1">
            <motion.div
                animate={{
                    scale: isCurrent || isProcessedInQuery ? 1.1 : 1,
                    backgroundColor: bgColor,
                    borderColor: borderColor
                }}
                className="w-14 h-14 border-2 rounded-xl flex items-center justify-center font-black text-xl text-[var(--text-primary)] transition-colors shadow-lg"
            >
                {val === 0 && !isCurrent ? (
                    <span className="opacity-20 text-sm">Empty</span>
                ) : val}
            </motion.div>
            <span className="text-[10px] font-bold text-slate-500">Idx: {idx}</span>
            {isPointerL && <span className="text-[10px] font-bold text-yellow-500 uppercase">L</span>}
            {isPointerR && <span className="text-[10px] font-bold text-yellow-500 uppercase">R</span>}
        </div>
    );
}
