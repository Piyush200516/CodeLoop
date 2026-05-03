import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useAutoplay from '../../hooks/useAutoplay';
import VisualizerControls from './VisualizerControls';

export default function HeapVisualizer() {
    const [heap, setHeap] = useState([10, 20, 30, 40, 50, 60, 70]); // Min-Heap
    const [status, setStatus] = useState('Wait');
    const [highlightIndices, setHighlightIndices] = useState([]);
    const [message, setMessage] = useState('Binary Min-Heap Visualization');

    const getParent = (i) => Math.floor((i - 1) / 2);
    const getLeft = (i) => 2 * i + 1;
    const getRight = (i) => 2 * i + 2;

    const handleInsert = async () => {
        const newVal = Math.floor(Math.random() * 90) + 10;
        const newHeap = [...heap, newVal];
        setHeap(newHeap);
        setStatus('BubblingUp');
        setMessage(`Inserted ${newVal}.`);
        setHighlightIndices([newHeap.length - 1]);
    };

    const handleNext = () => {
        if (status === 'Wait') {
            handleInsert();
            return;
        }

        // Just insert random nodes for demo
        handleInsert();
        if (heap.length >= 15) setStatus('Over');
    };

    const isFinished = status === 'Over';
    const { isPlaying, togglePlay, resetAutoplay } = useAutoplay(handleNext, isFinished);

    const reset = () => {
        setHeap([10, 20, 30, 40, 50, 60, 70]);
        setStatus('Wait');
        setHighlightIndices([]);
        setMessage('Binary Min-Heap Visualization');
        resetAutoplay();
    };

    // Helper to calculate node positions for a binary tree
    const renderNodes = () => {
        return heap.map((val, i) => {
            const level = Math.floor(Math.log2(i + 1));
            const posInLevel = i - (Math.pow(2, level) - 1);
            const totalInLevel = Math.pow(2, level);
            const x = (posInLevel + 0.5) * (100 / totalInLevel);
            const y = level * 25 + 10;

            return (
                <motion.div
                    key={i}
                    layout
                    initial={{ scale: 0 }}
                    animate={{ 
                        scale: 1,
                        x: `${x}%`,
                        y: `${y}%`,
                        borderColor: highlightIndices.includes(i) ? 'var(--viz-highlight-active)' : 'var(--viz-border-inactive)',
                        backgroundColor: highlightIndices.includes(i) ? 'var(--viz-highlight-active-bg)' : 'var(--viz-bg-inactive)'
                    }}
                    style={{ position: 'absolute', left: '-25px', top: '0', width: '50px', height: '50px' }}
                    className="rounded-full border-2 flex items-center justify-center font-black text-slate-100 shadow-xl z-20"
                >
                    {val}
                </motion.div>
            );
        });
    };

    const renderEdges = () => {
        const edges = [];
        for (let i = 0; i < heap.length; i++) {
            const left = getLeft(i);
            const right = getRight(i);
            
            if (left < heap.length) edges.push({ from: i, to: left });
            if (right < heap.length) edges.push({ from: i, to: right });
        }

        return edges.map((edge, idx) => {
            const levelF = Math.floor(Math.log2(edge.from + 1));
            const posF = edge.from - (Math.pow(2, levelF) - 1);
            const xF = (posF + 0.5) * (100 / Math.pow(2, levelF));
            const yF = levelF * 25 + 10;

            const levelT = Math.floor(Math.log2(edge.to + 1));
            const posT = edge.to - (Math.pow(2, levelT) - 1);
            const xT = (posT + 0.5) * (100 / Math.pow(2, levelT));
            const yT = levelT * 25 + 10;

            return (
                <svg key={idx} className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                    <motion.line
                        x1={`${xF}%`} y1={`${yF}%`}
                        x2={`${xT}%`} y2={`${yT}%`}
                        stroke="var(--viz-border-inactive)"
                        strokeWidth="2"
                    />
                </svg>
            );
        });
    };

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-12">
            <div className="text-center space-y-2">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Min-Heap Visualization</p>
                <p className="text-xl font-black text-slate-100">{message}</p>
            </div>

            <div className="relative w-full max-w-2xl h-64 bg-slate-900/30 rounded-3xl border border-white/5 overflow-hidden p-8">
                {renderEdges()}
                {renderNodes()}
            </div>

            <VisualizerControls 
                onNext={handleNext} 
                onReset={reset} 
                onTogglePlay={togglePlay}
                isPlaying={isPlaying}
                status={status}
            />
            
            <div className="bg-brand-500/5 p-4 rounded-xl border border-[var(--viz-highlight-active)]/10 text-xs text-[var(--text-secondary)] max-w-md text-center">
                Nodes are arranged in a complete binary tree. Parent of node at index <code className="text-[var(--viz-highlight-active)]">i</code> is at <code className="text-[var(--viz-highlight-active)]">floor((i-1)/2)</code>.
            </div>
        </div>
    );
}
