import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useAutoplay from '../../hooks/useAutoplay';
import VisualizerControls from './VisualizerControls';

export default function CycleDetectionVisualizer() {
    // Directed graph with a cycle: 0 -> 1 -> 2 -> 0
    const nodes = [
        { id: 0, x: 50, y: 20 },
        { id: 1, x: 80, y: 70 },
        { id: 2, x: 20, y: 70 },
        { id: 3, x: 50, y: 50 }
    ];

    const edges = [
        { from: 0, to: 1 },
        { from: 1, to: 2 },
        { from: 2, to: 0 },
        { from: 0, to: 3 }
    ];

    const generateSteps = () => {
        const steps = [];
        const visited = new Set();
        const recStack = new Set();
        let cycleFound = false;

        const dfs = (u) => {
            if (cycleFound) return;

            visited.add(u);
            recStack.add(u);
            steps.push({ 
                current: u, 
                visited: new Set(visited), 
                recStack: new Set(recStack), 
                message: `Visiting Node ${u}. Adding to recursion stack.`,
                cycle: false
            });

            const neighbors = edges.filter(e => e.from === u).map(e => e.to);
            for (const v of neighbors) {
                if (recStack.has(v)) {
                    cycleFound = true;
                    steps.push({ 
                        current: v, 
                        visited: new Set(visited), 
                        recStack: new Set(recStack), 
                        message: `Node ${v} is already in the recursion stack! CYCLE DETECTED! 🔄`,
                        cycle: true,
                        cycleEdge: { from: u, to: v }
                    });
                    return;
                }
                if (!visited.has(v)) {
                    dfs(v);
                }
                if (cycleFound) return;
            }

            recStack.delete(u);
            steps.push({ 
                current: u, 
                visited: new Set(visited), 
                recStack: new Set(recStack), 
                message: `Finished exploring Node ${u}. Removing from recursion stack.`,
                cycle: false
            });
        };

        steps.push({ current: null, visited: new Set(), recStack: new Set(), message: "Starting Cycle Detection using DFS and Recursion Stack." });
        for (let i = 0; i < nodes.length; i++) {
            if (!visited.has(i) && !cycleFound) {
                dfs(i);
            }
        }
        steps.push({ 
            current: null, 
            visited: new Set(visited), 
            recStack: new Set(), 
            message: cycleFound ? "Process stopped because a cycle was found." : "All nodes explored. No cycle found.",
            cycle: cycleFound
        });
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
        <div className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="text-center space-y-2 mb-8">
                <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest">Graph Algorithms: Cycle Detection (DFS)</p>
                <p className="text-lg font-bold text-[var(--text-primary)] max-w-xl mx-auto min-h-[3rem]">{stepData.message}</p>
            </div>

            <div className="flex flex-col xl:flex-row items-center justify-center gap-12 w-full max-w-6xl">
                {/* Graph View */}
                <div className="relative w-full max-w-lg h-96 border border-[var(--border-color)] bg-[var(--viz-bg-inactive)] rounded-3xl p-4 overflow-hidden shadow-2xl">
                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                        <defs>
                            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="15" refY="3.5" orientation="auto">
                                <polygon points="0 0, 10 3.5, 0 7" fill="currentColor" className="text-[var(--text-secondary)] opacity-30" />
                            </marker>
                            <marker id="arrowhead-active" markerWidth="10" markerHeight="7" refX="15" refY="3.5" orientation="auto">
                                <polygon points="0 0, 10 3.5, 0 7" fill="var(--brand-500)" />
                            </marker>
                            <marker id="arrowhead-error" markerWidth="10" markerHeight="7" refX="15" refY="3.5" orientation="auto">
                                <polygon points="0 0, 10 3.5, 0 7" fill="var(--viz-highlight-error)" />
                            </marker>
                        </defs>
                        {edges.map((edge, i) => {
                            const isCycleEdge = stepData.cycle && stepData.cycleEdge?.from === edge.from && stepData.cycleEdge?.to === edge.to;
                            const isTraversed = stepData.visited.has(edge.from) && stepData.visited.has(edge.to);
                            return (
                                <line 
                                    key={i} 
                                    x1={`${nodes[edge.from].x}%`} y1={`${nodes[edge.from].y}%`} 
                                    x2={`${nodes[edge.to].x}%`} y2={`${nodes[edge.to].y}%`} 
                                    stroke={isCycleEdge ? "var(--viz-highlight-error)" : isTraversed ? "var(--brand-500)" : "currentColor"} 
                                    className={!isCycleEdge && !isTraversed ? "text-[var(--text-secondary)] opacity-10" : ""}
                                    strokeWidth={isCycleEdge ? "4" : "2"} 
                                    markerEnd={`url(#${isCycleEdge ? 'arrowhead-error' : isTraversed ? 'arrowhead-active' : 'arrowhead'})`}
                                />
                            );
                        })}
                    </svg>

                    {nodes.map((node) => {
                        const isCurrent = stepData.current === node.id;
                        const isVisited = stepData.visited.has(node.id);
                        const isInStack = stepData.recStack.has(node.id);
                        const isCycleNode = stepData.cycle && isCurrent;

                        return (
                            <motion.div
                                key={node.id}
                                animate={{
                                    scale: isCurrent ? 1.3 : 1,
                                    backgroundColor: isCycleNode ? 'var(--viz-highlight-error-bg)' : 
                                                     isCurrent ? 'var(--viz-highlight-warning-bg)' : 
                                                     isInStack ? 'var(--viz-highlight-active-bg)' : 
                                                     isVisited ? 'rgba(var(--brand-500-rgb), 0.1)' : 'var(--viz-bg-inactive)',
                                    borderColor: isCycleNode ? 'var(--viz-highlight-error)' : 
                                               isCurrent ? 'var(--viz-highlight-warning)' : 
                                               isInStack ? 'var(--viz-highlight-active)' : 
                                               isVisited ? 'var(--brand-500)' : 'var(--viz-border-inactive)',
                                }}
                                className={`absolute w-12 h-12 -ml-6 -mt-6 rounded-xl border-2 flex items-center justify-center font-black text-[var(--text-primary)] z-10 shadow-lg`}
                                style={{ left: `${node.x}%`, top: `${node.y}%` }}
                            >
                                {node.id}
                            </motion.div>
                        );
                    })}
                </div>

                {/* State Info */}
                <div className="flex flex-col gap-6 w-full max-w-sm">
                    <div className="bg-[var(--viz-bg-inactive)] p-6 rounded-2xl border border-[var(--border-color)] space-y-4 shadow-xl">
                        <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-2">
                             <span className="text-[10px] font-black uppercase text-[var(--text-secondary)] opacity-70 tracking-tighter">Recursion Stack</span>
                             <span className="text-[10px] font-bold text-[var(--text-secondary)] opacity-50">LIFO</span>
                        </div>
                        <div className="flex flex-wrap gap-2 min-h-[3rem]">
                            <AnimatePresence>
                                {[...stepData.recStack].map((nodeId) => (
                                    <motion.div
                                        key={nodeId}
                                        initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                                        className="w-10 h-10 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 rounded-lg flex items-center justify-center font-black"
                                    >
                                        {nodeId}
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>

                    <div className="flex gap-4">
                         <div className={`flex-1 p-4 rounded-2xl border flex flex-col items-center ${stepData.cycle ? 'bg-red-500/10 border-red-500/30' : 'bg-[var(--viz-bg-inactive)] border-[var(--border-color)] shadow-sm'}`}>
                              <span className="text-[10px] font-black uppercase text-[var(--text-secondary)] opacity-70 mb-1">Cycle?</span>
                              <span className={`text-xl font-black ${stepData.cycle ? 'text-red-500' : 'text-[var(--text-secondary)] opacity-30'}`}>
                                   {stepData.cycle ? 'YES' : 'NO'}
                              </span>
                         </div>
                         <div className="flex-1 bg-[var(--viz-bg-inactive)] p-4 rounded-2xl border border-[var(--border-color)] flex flex-col items-center shadow-sm">
                              <span className="text-[10px] font-black uppercase text-[var(--text-secondary)] opacity-70 mb-1">Visited</span>
                              <span className="text-xl font-black text-[var(--text-primary)]">
                                   {stepData.visited.size} / {nodes.length}
                              </span>
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
