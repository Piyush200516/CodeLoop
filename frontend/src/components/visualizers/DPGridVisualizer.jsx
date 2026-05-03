import { useState } from 'react';
import { motion } from 'framer-motion';
import useAutoplay from '../../hooks/useAutoplay';
import VisualizerControls from './VisualizerControls';

export default function DPGridVisualizer() {
    const rows = 3;
    const cols = 4;
    const [grid, setGrid] = useState(Array(rows).fill(0).map(() => Array(cols).fill(0)));
    const [status, setStatus] = useState('Wait');
    const [currRow, setCurrRow] = useState(0);
    const [currCol, setCurrCol] = useState(0);

    const handleNext = () => {
        if (status === 'Wait') {
            setStatus('Running');
            const newGrid = [...grid];
            newGrid[0][0] = 1;
            setGrid(newGrid);
            setCurrRow(0);
            setCurrCol(1);
            return;
        }

        if (currRow >= rows) {
            setStatus('Over');
            return;
        }

        const newGrid = grid.map(r => [...r]);
        
        // Base cases: first row or first column
        if (currRow === 0 || currCol === 0) {
            newGrid[currRow][currCol] = 1;
        } else {
            // dp[i][j] = dp[i-1][j] + dp[i][j-1]
            newGrid[currRow][currCol] = newGrid[currRow - 1][currCol] + newGrid[currRow][currCol - 1];
        }

        setGrid(newGrid);

        // Move to next cell
        let nextCol = currCol + 1;
        let nextRow = currRow;
        if (nextCol >= cols) {
            nextCol = 0;
            nextRow = currRow + 1;
        }

        setCurrRow(nextRow);
        setCurrCol(nextCol);
        if (nextRow >= rows) setStatus('Over');
    };

    const isFinished = status === 'Over';
    const { isPlaying, togglePlay, resetAutoplay } = useAutoplay(handleNext, isFinished);

    const reset = () => {
        setGrid(Array(rows).fill(0).map(() => Array(cols).fill(0)));
        setStatus('Wait');
        setCurrRow(0);
        setCurrCol(0);
        resetAutoplay();
    };

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-8">
            <div className="text-center space-y-2">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Unique Paths (Grid DP)</p>
                <p className="text-sm text-[var(--text-secondary)]">
                    {status === 'Wait' ? 'Calculate total paths from (0,0) to (2,3)' : 
                     status === 'Over' ? `Total unique paths: ${grid[rows-1][cols-1]}` : 
                     `Filling cell (${currRow}, ${currCol})`}
                </p>
            </div>

            <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
                {grid.map((row, r) => 
                    row.map((val, c) => {
                        const isCurrent = r === currRow && c === currCol;
                        const isFilled = val > 0;
                        const isLast = r === rows-1 && c === cols-1;

                        return (
                            <motion.div
                                key={`${r}-${c}`}
                                animate={{
                                    scale: isCurrent ? 1.1 : 1,
                                    borderColor: isCurrent ? 'var(--viz-highlight-active)' : isLast && status === 'Over' ? 'var(--viz-highlight-success)' : 'var(--viz-border-inactive)',
                                    backgroundColor: isCurrent ? 'var(--viz-highlight-active-bg)' : isFilled ? 'var(--viz-highlight-active-bg)' : 'var(--viz-bg-inactive)'
                                }}
                                className="w-16 h-16 rounded-xl border-2 flex flex-col items-center justify-center font-black text-[var(--text-primary)]"
                            >
                                <span className="text-lg">{val}</span>
                                <span className="text-[8px] text-slate-500">({r},{c})</span>
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
            
            <div className="text-[10px] text-slate-500 max-w-sm text-center">
                DP State: <code className="text-[var(--viz-highlight-active)]">dp[i][j] = dp[i-1][j] + dp[i][j-1]</code>. We sum paths from top and left neighbors.
            </div>
        </div>
    );
}
