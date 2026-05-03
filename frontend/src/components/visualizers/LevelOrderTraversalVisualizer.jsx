import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useAutoplay from '../../hooks/useAutoplay';
import VisualizerControls from './VisualizerControls';

export default function LevelOrderTraversalVisualizer() {
    // Basic Perfect Binary Tree for clear visualization
    const tree = {
        val: 1, x: 50, y: 15,
        left: { val: 2, x: 25, y: 45, left: { val: 4, x: 12, y: 75, left: null, right: null }, right: { val: 5, x: 38, y: 75, left: null, right: null } },
        right: { val: 3, x: 75, y: 45, left: { val: 6, x: 62, y: 75, left: null, right: null }, right: { val: 7, x: 88, y: 75, left: null, right: null } }
    };

    const nodes = [1, 2, 3, 4, 5, 6, 7].map(v => {
        const findNode = (n) => {
            if (!n) return null;
            if (n.val === v) return n;
            return findNode(n.left) || findNode(n.right);
        };
        return findNode(tree);
    });

    const edges = [
        { from: {x:50, y:15}, to: {x:25, y:45} },
        { from: {x:50, y:15}, to: {x:75, y:45} },
        { from: {x:25, y:45}, to: {x:12, y:75} },
        { from: {x:25, y:45}, to: {x:38, y:75} },
        { from: {x:75, y:45}, to: {x:62, y:75} },
        { from: {x:75, y:45}, to: {x:88, y:75} }
    ];

    const generateSteps = () => {
        const steps = [];
        const queue = [tree];
        const visited = [];
        
        steps.push({ queue: [1], current: null, visited: [], message: "Starting Level Order Traversal. Root node 1 is in the queue." });

        while (queue.length > 0) {
            const levelSize = queue.length;
            steps.push({ queue: queue.map(n => n.val), current: null, visited: [...visited], message: `Processing next level of size ${levelSize}.` });

            for (let i = 0; i < levelSize; i++) {
                const node = queue.shift();
                steps.push({ queue: queue.map(n => n.val), current: node.val, visited: [...visited], message: `Dequeued node ${node.val} for processing.` });
                
                visited.push(node.val);
                steps.push({ queue: queue.map(n => n.val), current: node.val, visited: [...visited], message: `Adding node ${node.val} to results.` });

                if (node.left) {
                    queue.push(node.left);
                    steps.push({ queue: queue.map(n => n.val), current: node.val, visited: [...visited], message: `Enqueuing left child: ${node.left.val}` });
                }
                if (node.right) {
                    queue.push(node.right);
                    steps.push({ queue: queue.map(n => n.val), current: node.val, visited: [...visited], message: `Enqueuing right child: ${node.right.val}` });
                }
            }
        }
        steps.push({ queue: [], current: null, visited: [...visited], message: "Traversal complete! All levels processed." });
        return steps;
    };

    const steps = useMemo(generateSteps, []);
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

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 overflow-hidden">
            <div className="text-center space-y-2 mb-8">
                <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest">Tree Algorithms: Level Order Traversal (BFS)</p>
                <p className="text-lg font-bold text-[var(--text-primary)] max-w-lg mx-auto min-h-[3rem]">{stepData.message}</p>
            </div>

            <div className="flex flex-col xl:flex-row items-center justify-center gap-12 w-full max-w-6xl">
                {/* Tree View */}
                <div className="relative w-full max-w-md h-72 border border-[var(--border-color)] bg-[var(--viz-bg-inactive)] rounded-3xl p-4 overflow-hidden shadow-2xl">
                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                        {edges.map((edge, i) => (
                            <line 
                                key={i} x1={`${edge.from.x}%`} y1={`${edge.from.y}%`} x2={`${edge.to.x}%`} y2={`${edge.to.y}%`} 
                                stroke="currentColor" className="text-[var(--text-secondary)] opacity-20" strokeWidth="2" 
                            />
                        ))}
                    </svg>

                    {nodes.map((node) => {
                        const isCurrent = stepData.current === node.val;
                        const isVisited = stepData.visited.includes(node.val);
                        const isInQueue = stepData.queue.includes(node.val);

                        return (
                            <motion.div
                                key={node.val}
                                animate={{
                                    scale: isCurrent ? 1.25 : isInQueue ? 1.1 : 1,
                                    backgroundColor: isCurrent ? 'var(--viz-highlight-warning-bg)' : isVisited ? 'var(--viz-highlight-success-bg)' : isInQueue ? 'var(--viz-highlight-active-bg)' : 'var(--viz-bg-inactive)',
                                    borderColor: isCurrent ? 'var(--viz-highlight-warning)' : isVisited ? 'var(--viz-highlight-success)' : isInQueue ? 'var(--viz-highlight-active)' : 'var(--viz-border-inactive)',
                                }}
                                className={`absolute w-12 h-12 -ml-6 -mt-6 rounded-full border-2 flex items-center justify-center font-black text-[var(--text-primary)] z-10 shadow-lg`}
                                style={{ left: `${node.x}%`, top: `${node.y}%` }}
                            >
                                {node.val}
                            </motion.div>
                        );
                    })}
                </div>

                <div className="flex flex-col gap-8 w-full max-w-md">
                    {/* Queue Visualization */}
                    <div className="flex flex-col gap-4">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-brand-500 shadow-[0_0_8px_rgba(var(--brand-500-rgb),0.5)]"></span>
                            Queue (FIFO)
                        </span>
                        <div className="flex gap-2 p-3 bg-[var(--viz-bg-inactive)] rounded-2xl border border-[var(--border-color)] min-h-[4rem] items-center relative overflow-hidden shadow-sm">
                            <AnimatePresence>
                                {stepData.queue.length === 0 && (
                                    <motion.span initial={{opacity:0}} animate={{opacity:1}} className="text-xs text-[var(--text-secondary)] opacity-50 italic absolute left-1/2 -translate-x-1/2">Queue is empty</motion.span>
                                )}
                                {stepData.queue.map((val, i) => (
                                    <motion.div
                                        key={`${val}-${i}`}
                                        initial={{ opacity: 0, x: -20, scale: 0.8 }}
                                        animate={{ opacity: 1, x: 0, scale: 1 }}
                                        exit={{ opacity: 0, x: 20, scale: 0.8 }}
                                        className="w-10 h-10 bg-brand-500/10 border border-brand-500/30 text-brand-400 rounded-xl flex items-center justify-center font-black shadow-inner"
                                    >
                                        {val}
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Visited / Result */}
                    <div className="flex flex-col gap-4">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] flex items-center gap-2">
                             <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                             Processed (BFS Order)
                        </span>
                        <div className="flex flex-wrap gap-2 p-3 bg-emerald-500/[0.03] rounded-2xl border border-emerald-500/10 min-h-[4rem] items-center">
                            {stepData.visited.map((val, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl flex items-center justify-center font-black"
                                >
                                    {val}
                                </motion.div>
                            ))}
                        </div>
                    </div>
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
