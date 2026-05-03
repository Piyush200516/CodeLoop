import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useAutoplay from '../../hooks/useAutoplay';
import VisualizerControls from './VisualizerControls';

export default function DijkstraVisualizer() {
    // Weighted Directed Graph
    const nodes = [
        { id: 0, x: 20, y: 50 },
        { id: 1, x: 50, y: 20 },
        { id: 2, x: 50, y: 80 },
        { id: 3, x: 80, y: 50 }
    ];

    const edges = [
        { from: 0, to: 1, weight: 4 },
        { from: 0, to: 2, weight: 2 },
        { from: 1, to: 2, weight: 5 },
        { from: 1, to: 3, weight: 10 },
        { from: 2, to: 3, weight: 3 }
    ];

    const generateSteps = () => {
        const steps = [];
        const dists = { 0: 0, 1: Infinity, 2: Infinity, 3: Infinity };
        const visited = new Set();
        const pq = [{ node: 0, dist: 0 }];

        steps.push({ 
            pq: [...pq], dists: { ...dists }, visited: new Set(visited), current: null, 
            message: "Dijkstra Initialized: Start node 0 distance set to 0, all others to Infinity." 
        });

        while (pq.length > 0) {
            pq.sort((a, b) => a.dist - b.dist);
            const { node: u, dist: d } = pq.shift();

            steps.push({ 
                pq: [...pq], dists: { ...dists }, visited: new Set(visited), current: u, 
                message: `Extracting node ${u} with smallest distance ${d} from Priority Queue.` 
            });

            if (visited.has(u)) continue;
            visited.add(u);

            steps.push({ 
                pq: [...pq], dists: { ...dists }, visited: new Set(visited), current: u, 
                message: `Marking node ${u} as visited. Relaxing its outgoing edges...` 
            });

            const outgoingEdges = edges.filter(e => e.from === u);
            for (const edge of outgoingEdges) {
                const v = edge.to;
                const newDist = dists[u] + edge.weight;

                steps.push({ 
                    pq: [...pq], dists: { ...dists }, visited: new Set(visited), current: u, target: v,
                    message: `Checking edge ${u} → ${v} (weight ${edge.weight}). Potential distance: ${dists[u]} + ${edge.weight} = ${newDist}` 
                });

                if (newDist < dists[v]) {
                    dists[v] = newDist;
                    pq.push({ node: v, dist: newDist });
                    steps.push({ 
                        pq: [...pq], dists: { ...dists }, visited: new Set(visited), current: u, target: v,
                        message: `New shorter path found to ${v}! Updating distance to ${newDist} and adding to Priority Queue.` 
                    });
                } else {
                    steps.push({ 
                        pq: [...pq], dists: { ...dists }, visited: new Set(visited), current: u, target: v,
                        message: `Current path to ${v} (${dists[v]}) is already shorter or equal. No update.` 
                    });
                }
            }
        }

        steps.push({ 
            pq: [], dists, visited, current: null, 
            message: "Shortest paths from source (0) have been calculated for all reachable nodes." 
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
        <div className="flex-1 flex flex-col items-center justify-center p-8 overflow-hidden">
            <div className="text-center space-y-2 mb-8">
                <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest">Graph Algorithms: Dijkstra's Shortest Path</p>
                <p className="text-lg font-bold text-[var(--text-primary)] max-w-2xl mx-auto min-h-[3rem]">{stepData.message}</p>
            </div>

            <div className="flex flex-col xl:flex-row items-center justify-center gap-12 w-full max-w-7xl">
                {/* Graph View */}
                <div className="relative w-full max-w-xl h-[400px] border border-[var(--border-color)] bg-[var(--viz-bg-inactive)] rounded-3xl p-4 overflow-hidden shadow-2xl">
                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                        <defs>
                            <marker id="dijkstra-arrow" markerWidth="10" markerHeight="7" refX="22" refY="3.5" orientation="auto">
                                <polygon points="0 0, 10 3.5, 0 7" fill="currentColor" className="text-[var(--text-secondary)] opacity-30" />
                            </marker>
                            <marker id="dijkstra-arrow-active" markerWidth="12" markerHeight="10" refX="22" refY="5" orientation="auto">
                                <polygon points="0 0, 12 5, 0 10" fill="var(--brand-500)" />
                            </marker>
                        </defs>
                        {edges.map((edge, i) => {
                            const isCurrentEdge = stepData.current === edge.from && stepData.target === edge.to;
                            const isShortestEdge = stepData.visited.has(edge.to) && stepData.dists[edge.to] === stepData.dists[edge.from] + edge.weight;
                            
                            return (
                                <g key={i}>
                                    <line 
                                        x1={`${nodes[edge.from].x}%`} y1={`${nodes[edge.from].y}%`} 
                                        x2={`${nodes[edge.to].x}%`} y2={`${nodes[edge.to].y}%`} 
                                        stroke={isCurrentEdge ? "var(--brand-500)" : isShortestEdge ? "var(--brand-500)" : "currentColor"} 
                                        className={!isCurrentEdge && !isShortestEdge ? "text-[var(--text-secondary)] opacity-10 transition-all" : "transition-all"}
                                        strokeWidth={isCurrentEdge ? "4" : "2"} 
                                        markerEnd={`url(#${isCurrentEdge ? 'dijkstra-arrow-active' : 'dijkstra-arrow'})`}
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
                        const isCurrent = stepData.current === node.id;
                        const isTarget = stepData.target === node.id;
                        const isVisited = stepData.visited.has(node.id);
                        const dist = stepData.dists[node.id];

                        return (
                            <div key={node.id} className="absolute -ml-10 -mt-10 flex flex-col items-center" style={{ left: `${node.x}%`, top: `${node.y}%` }}>
                                <motion.div
                                    animate={{
                                        scale: isCurrent ? 1.4 : isTarget ? 1.2 : 1,
                                        backgroundColor: isCurrent ? 'var(--viz-highlight-warning-bg)' : 
                                                       isTarget ? 'rgba(var(--brand-500-rgb), 0.15)' :
                                                       isVisited ? 'var(--viz-highlight-success-bg)' : 'var(--viz-bg-inactive)',
                                        borderColor: isCurrent ? 'var(--viz-highlight-warning)' : 
                                                   isTarget ? 'var(--brand-500)' :
                                                   isVisited ? 'var(--viz-highlight-success)' : 'var(--viz-border-inactive)',
                                    }}
                                    className={`w-16 h-16 rounded-2xl border-2 flex items-center justify-center font-black text-xl text-[var(--text-primary)] shadow-xl z-20 transition-colors`}
                                >
                                    {node.id}
                                </motion.div>
                                
                                <div className={`mt-2 px-3 py-1 rounded-full text-[10px] font-black border ${
                                    dist === Infinity ? 'bg-[var(--viz-bg-inactive)] border-[var(--border-color)] text-[var(--text-secondary)] opacity-50' : 
                                    isCurrent ? 'bg-amber-500 border-amber-600 text-white shadow-md' : 
                                    'bg-[var(--viz-bg-inactive)] border-[var(--border-color)] text-brand-500 shadow-sm'
                                }`}>
                                   {dist === Infinity ? '∞' : `DIST: ${dist}`}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* PQ View */}
                <div className="flex flex-col gap-6 w-full max-w-sm">
                    <div className="bg-[var(--viz-bg-inactive)] p-6 rounded-3xl border border-[var(--border-color)] space-y-4 shadow-xl">
                        <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-2">
                             <span className="text-[10px] font-black uppercase text-[var(--text-secondary)] opacity-70 tracking-widest">Min-Priority Queue</span>
                             <span className="text-[10px] font-bold text-[var(--text-secondary)] opacity-50">Sorted by Distance</span>
                        </div>
                        <div className="flex flex-col gap-2 min-h-[12rem]">
                            <AnimatePresence>
                                {stepData.pq.length === 0 && (
                                    <motion.div initial={{opacity:0}} animate={{opacity:1}} className="text-xs text-slate-600 italic py-8 text-center uppercase font-black">PQ is Empty</motion.div>
                                )}
                                {stepData.pq.map((item, i) => (
                                    <motion.div
                                        key={`${item.node}-${item.dist}`}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="flex justify-between items-center bg-[var(--card-bg)] border border-[var(--border-color)] p-3 rounded-xl shadow-sm"
                                    >
                                        <div className="flex items-center gap-3">
                                             <span className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center font-black text-indigo-400">
                                                  {item.node}
                                             </span>
                                             <span className="text-[10px] font-black uppercase text-slate-500">Node</span>
                                        </div>
                                        <div className="flex flex-col items-end">
                                             <span className="text-xs font-black text-brand-400">{item.dist}</span>
                                             <span className="text-[8px] font-black uppercase text-slate-600">Weight</span>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
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
