import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useAutoplay from '../../hooks/useAutoplay';
import VisualizerControls from './VisualizerControls';

export default function BellmanFordVisualizer() {
    const nodes = [
        { id: 0, x: 20, y: 50 },
        { id: 1, x: 50, y: 20 },
        { id: 2, x: 50, y: 80 },
        { id: 3, x: 80, y: 50 }
    ];

    const edges = [
        { from: 0, to: 1, weight: 6 },
        { from: 0, to: 2, weight: 7 },
        { from: 1, to: 2, weight: 8 },
        { from: 1, to: 3, weight: -4 },
        { from: 2, to: 3, weight: 9 }
    ];

    const generateSteps = () => {
        const steps = [];
        const dists = { 0: 0, 1: Infinity, 2: Infinity, 3: Infinity };
        
        steps.push({ 
            dists: { ...dists }, iteration: 0, currentEdge: null, 
            message: "Bellman-Ford Initialization: All distances set to Infinity except source (0)." 
        });

        // Loop |V| - 1 times
        for (let i = 1; i < nodes.length; i++) {
            steps.push({ dists: { ...dists }, iteration: i, currentEdge: null, message: `Starting Iteration ${i} of ${nodes.length - 1}...` });
            
            for (let j = 0; j < edges.length; j++) {
                const edge = edges[j];
                const u = edge.from;
                const v = edge.to;
                const weight = edge.weight;
                const newDist = dists[u] + weight;

                steps.push({ 
                    dists: { ...dists }, iteration: i, currentEdge: j, 
                    message: `Checking edge ${u} → ${v} (weight ${weight}). Potential: ${dists[u] === Infinity ? '∞' : dists[u]} + ${weight} = ${dists[u] === Infinity ? '∞' : newDist}` 
                });

                if (dists[u] !== Infinity && newDist < dists[v]) {
                    dists[v] = newDist;
                    steps.push({ 
                        dists: { ...dists }, iteration: i, currentEdge: j, 
                        message: `Better path to ${v} found! Updating dist[${v}] to ${newDist}.` 
                    });
                }
            }
        }

        // Final Negative Cycle Check (optional for visualization but good)
        steps.push({ dists, iteration: 'Final', currentEdge: null, message: "Iterations complete. Checking for negative cycles..." });
        
        let hasNegativeCycle = false;
        for (const edge of edges) {
            if (dists[edge.from] !== Infinity && dists[edge.from] + edge.weight < dists[edge.to]) {
                hasNegativeCycle = true;
                break;
            }
        }

        steps.push({ dists, iteration: 'Final', currentEdge: null, message: hasNegativeCycle ? "Negative cycle detected!" : "Algorithm finished. No negative cycles found." });
        
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
                <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest">Graph Algorithms: Bellman-Ford</p>
                <div className="flex justify-center items-center gap-4">
                     <span className="px-3 py-1 bg-brand-500/10 text-brand-500 rounded-full text-[10px] font-black border border-brand-500/20">
                          ITERATION: {stepData.iteration}
                     </span>
                </div>
                <p className="text-lg font-bold text-[var(--text-primary)] max-w-2xl mx-auto min-h-[3rem] mt-2">{stepData.message}</p>
            </div>

            <div className="flex flex-col xl:flex-row items-center justify-center gap-12 w-full max-w-6xl">
                 {/* Graph View */}
                 <div className="relative w-full max-w-lg h-[400px] border border-[var(--border-color)] bg-[var(--viz-bg-inactive)] rounded-3xl p-4 overflow-hidden shadow-2xl">
                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                        <defs>
                            <marker id="bf-arrow" markerWidth="10" markerHeight="7" refX="22" refY="3.5" orientation="auto">
                                <polygon points="0 0, 10 3.5, 0 7" fill="currentColor" className="text-[var(--text-secondary)] opacity-30" />
                            </marker>
                            <marker id="bf-arrow-active" markerWidth="12" markerHeight="10" refX="22" refY="5" orientation="auto">
                                <polygon points="0 0, 12 5, 0 10" fill="var(--brand-500)" />
                            </marker>
                        </defs>
                        {edges.map((edge, i) => {
                            const isCurrentEdge = stepData.currentEdge === i;
                            return (
                                <g key={i}>
                                    <line 
                                        x1={`${nodes[edge.from].x}%`} y1={`${nodes[edge.from].y}%`} 
                                        x2={`${nodes[edge.to].x}%`} y2={`${nodes[edge.to].y}%`} 
                                        stroke={isCurrentEdge ? "var(--brand-500)" : "currentColor"} 
                                        className={!isCurrentEdge ? "text-[var(--text-secondary)] opacity-10" : ""}
                                        strokeWidth={isCurrentEdge ? "4" : "2"} 
                                        markerEnd={`url(#${isCurrentEdge ? 'bf-arrow-active' : 'bf-arrow'})`}
                                    />
                                    <text 
                                        x={`${(nodes[edge.from].x + nodes[edge.to].x) / 2}%`} 
                                        y={`${(nodes[edge.from].y + nodes[edge.to].y) / 2 - 2}%`}
                                        fill={isCurrentEdge ? "var(--brand-500)" : "currentColor"}
                                        className={!isCurrentEdge ? "text-[var(--text-secondary)] opacity-50" : ""}
                                        fontSize="14" fontWeight="900" textAnchor="middle"
                                    >
                                        {edge.weight}
                                    </text>
                                </g>
                            );
                        })}
                    </svg>

                    {nodes.map((node) => {
                        const isCurrentNode = stepData.currentEdge !== null && (edges[stepData.currentEdge].from === node.id || edges[stepData.currentEdge].to === node.id);
                        const dist = stepData.dists[node.id];

                        return (
                            <div key={node.id} className="absolute -ml-10 -mt-10 flex flex-col items-center" style={{ left: `${node.x}%`, top: `${node.y}%` }}>
                                <motion.div
                                    animate={{
                                        scale: isCurrentNode ? 1.2 : 1,
                                        backgroundColor: isCurrentNode ? 'var(--viz-highlight-active-bg)' : 'var(--viz-bg-inactive)',
                                        borderColor: isCurrentNode ? 'var(--viz-highlight-active)' : 'var(--viz-border-inactive)',
                                    }}
                                    className={`w-16 h-16 rounded-2xl border-2 flex items-center justify-center font-black text-xl text-[var(--text-primary)] shadow-xl z-20 transition-colors`}
                                >
                                    {node.id}
                                </motion.div>
                                <div className={`mt-2 px-3 py-1 rounded-full text-[10px] font-black border ${
                                    dist === Infinity ? 'bg-[var(--viz-bg-inactive)] border-[var(--border-color)] text-[var(--text-secondary)] opacity-50' : 'bg-[var(--viz-bg-inactive)] border-[var(--border-color)] text-brand-500 shadow-sm'
                                } shadow-lg`}>
                                   {dist === Infinity ? '∞' : `DIST: ${dist}`}
                                </div>
                            </div>
                        );
                    })}
                 </div>

                 {/* Results List */}
                 <div className="flex flex-col gap-6 w-full max-w-sm">
                     <div className="bg-[var(--viz-bg-inactive)] p-6 rounded-3xl border border-[var(--border-color)] space-y-4 shadow-xl">
                         <span className="text-[10px] font-black uppercase text-[var(--text-secondary)] opacity-70 tracking-widest border-b border-[var(--border-color)] pb-2 block">Distance Table</span>
                         <div className="space-y-2">
                             {nodes.map(node => (
                                 <div key={node.id} className="flex justify-between items-center bg-[var(--card-bg)] p-3 rounded-xl border border-[var(--border-color)] shadow-sm">
                                      <span className="text-sm font-bold text-[var(--text-secondary)] opacity-70">Node {node.id}</span>
                                      <span className={`text-lg font-black ${stepData.dists[node.id] === Infinity ? 'text-[var(--text-secondary)] opacity-30' : 'text-brand-500'}`}>
                                          {stepData.dists[node.id] === Infinity ? '∞' : stepData.dists[node.id]}
                                      </span>
                                 </div>
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
