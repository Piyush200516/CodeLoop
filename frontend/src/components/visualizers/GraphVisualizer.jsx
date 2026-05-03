import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useAutoplay from '../../hooks/useAutoplay';
import VisualizerControls from './VisualizerControls';

export default function GraphVisualizer({ type }) {
    // Simple 3x3 grid for grid-based BFS/DFS demo
    const size = 3;
    const [visited, setVisited] = useState(new Set());
    const [queue, setQueue] = useState([]); // For BFS
    const [stack, setStack] = useState([]); // For DFS
    const [status, setStatus] = useState('Wait');

    const reset = () => {
        setVisited(new Set());
        setQueue([]);
        setStack([]);
        setStatus('Wait');
        resetAutoplay();
    };

    const getNeighbors = (node) => {
        const [r, c] = node.split(',').map(Number);
        const adj = [];
        if (r < size - 1) adj.push(`${r + 1},${c}`);
        if (c < size - 1) adj.push(`${r},${c + 1}`);
        return adj;
    };

    const handleNext = () => {
        if (status === 'Wait') {
            const start = '0,0';
            setVisited(new Set([start]));
            if (type === 'bfs') setQueue([start]);
            else setStack([start]);
            setStatus('Traversing');
            return;
        }

        if (type === 'bfs') {
            if (queue.length === 0) return setStatus('Over');
            const [curr, ...rest] = queue;
            const neighbors = getNeighbors(curr);
            const nextQueue = [...rest];
            const nextVisited = new Set(visited);

            neighbors.forEach(n => {
                if (!nextVisited.has(n)) {
                    nextVisited.add(n);
                    nextQueue.push(n);
                }
            });

            setQueue(nextQueue);
            setVisited(nextVisited);
            if (nextQueue.length === 0) setStatus('Over');
        } else {
            // DFS
            if (stack.length === 0) return setStatus('Over');
            const [curr, ...rest] = stack;
            const neighbors = getNeighbors(curr);
            const nextStack = [...rest];
            const nextVisited = new Set(visited);

            neighbors.forEach(n => {
                if (!nextVisited.has(n)) {
                    nextVisited.add(n);
                    nextStack.unshift(n); // LIFO
                }
            });

            setStack(nextStack);
            setVisited(nextVisited);
            if (nextStack.length === 0) setStatus('Over');
        }
    };

    const isFinished = status === 'Over';
    const { isPlaying, togglePlay, resetAutoplay } = useAutoplay(handleNext, isFinished);

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 gap-8">
            <div className="text-center">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{type.toUpperCase()} Traversal</p>
                <p className="text-sm font-medium text-[var(--text-secondary)] mt-1">
                    {status === 'Wait' ? 'Start from (0,0)' : 
                     status === 'Over' ? 'All nodes visited' : 
                     type === 'bfs' ? `Queue: [${queue.join(' | ')}]` : `Stack: [${stack.join(' | ')}]`}
                </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
                {[...Array(size)].map((_, r) => 
                    [...Array(size)].map((_, c) => {
                        const key = `${r},${c}`;
                        const isVisited = visited.has(key);
                        const isCurrent = type === 'bfs' ? queue[0] === key : stack[0] === key;
                        return (
                            <motion.div
                                key={key}
                                animate={{
                                    backgroundColor: isCurrent ? 'var(--viz-highlight-active)' : isVisited ? 'var(--viz-highlight-active-bg)' : 'var(--viz-bg-inactive)',
                                    scale: isCurrent ? 1.1 : 1,
                                    borderColor: isCurrent ? 'var(--viz-highlight-active)' : 'var(--viz-border-inactive)'
                                }}
                                className={`w-16 h-16 rounded-xl border-2 flex items-center justify-center text-[10px] font-black text-[var(--text-primary)] transition-colors`}
                            >
                                ({r},{c})
                            </motion.div>
                        );
                    })
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
