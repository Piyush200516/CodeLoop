import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import useAutoplay from '../../hooks/useAutoplay';
import VisualizerControls from './VisualizerControls';

export default function MatrixTraversalVisualizer() {
    const rows = 4;
    const cols = 4;
    const [matrix] = useState(
        Array.from({ length: rows }, (_, r) => 
            Array.from({ length: cols }, (_, c) => r * cols + c + 1)
        )
    );
    
    const [path, setPath] = useState([]);
    const [status, setStatus] = useState('Wait'); // Wait, Running, Over
            const [message, setMessage] = useState('Standard row-by-row traversal of a 2D grid.');
    const [index, setIndex] = useState(-1);

    const handleNext = () => {
        if (status === 'Over') return;

        if (status === 'Wait') {
            setStatus('Running');
            setIndex(0);
            setPath([[0, 0]]);
            setMessage(`Visiting [0, 0]: ${matrix[0][0]}`);
            return;
        }

        const nextIndex = index + 1;
        if (nextIndex >= rows * cols) {
            setStatus('Over');
                        setMessage('Traversal Complete.');
            return;
        }

        const r = Math.floor(nextIndex / cols);
        const c = nextIndex % cols;
        const newPath = [...path, [r, c]];

        setIndex(nextIndex);
        setPath(newPath);
        setMessage(`Visiting [${r}, ${c}]: ${matrix[r][c]}`);
    };

    
    const isFinished = status === 'Over';
    const { isPlaying, togglePlay, resetAutoplay } = useAutoplay(handleNext, isFinished);

    const reset = () => {
        setIndex(-1);
        setPath([]);
        setStatus('Wait');
        setMessage('Standard row-by-row traversal of a 2D grid.');
        resetAutoplay();
    };

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="text-center space-y-2 mb-12">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Matrix Traversal</p>
                <p className="text-lg font-bold text-[var(--text-primary)] max-w-lg mx-auto min-h-[3rem]">{message}</p>
            </div>

            <div className="grid gap-2 mb-8" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
                {matrix.map((rowArr, r) => 
                    rowArr.map((val, c) => {
                        const isVisited = path.some(p => p[0] === r && p[1] === c);
                        const isCurrent = path.length > 0 && path[path.length - 1][0] === r && path[path.length - 1][1] === c;
                        
                        return (
                            <motion.div
                                key={`${r}-${c}`}
                                animate={{
                                    scale: isCurrent ? 1.15 : 1,
                                    borderColor: isCurrent ? 'var(--viz-highlight-active)' : isVisited ? 'var(--viz-highlight-active-bg)' : 'var(--viz-border-inactive)',
                                    backgroundColor: isCurrent ? 'var(--viz-highlight-active-bg)' : isVisited ? 'var(--viz-highlight-active-bg)' : 'var(--viz-bg-inactive)'
                                }}
                                className="w-16 h-16 rounded-2xl border-2 flex flex-col items-center justify-center font-black text-[var(--text-primary)] transition-colors"
                            >
                                <span className="text-xl">{val}</span>
                                <span className="text-[8px] text-slate-500 font-mono opacity-60">[{r},{c}]</span>
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
