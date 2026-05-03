import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useAutoplay from '../../hooks/useAutoplay';
import VisualizerControls from './VisualizerControls';

export default function FloydWarshallVisualizer() {
    const nodes = [0, 1, 2, 3];
    const initialMatrix = [
        [0, 5, Infinity, 10],
        [Infinity, 0, 3, Infinity],
        [Infinity, Infinity, 0, 1],
        [Infinity, Infinity, Infinity, 0]
    ];

    const generateSteps = () => {
        const steps = [];
        let matrix = initialMatrix.map(row => [...row]);

        steps.push({ 
            matrix: matrix.map(row => [...row]), k: null, i: null, j: null, 
            message: "Floyd-Warshall Initialization: Distance matrix set from adjacency weights. Infinity where no direct edge exists." 
        });

        for (let k = 0; k < nodes.length; k++) {
            steps.push({ 
                matrix: matrix.map(row => [...row]), k, i: null, j: null, 
                message: `Considering Node ${k} as intermediate vertex.` 
            });

            for (let i = 0; i < nodes.length; i++) {
                for (let j = 0; j < nodes.length; j++) {
                    const currentVal = matrix[i][j];
                    const ik = matrix[i][k];
                    const kj = matrix[k][j];
                    const throughK = ik + kj;

                    steps.push({ 
                        matrix: matrix.map(row => [...row]), k, i, j, 
                        message: `Checking if path ${i} → ${k} → ${j} is shorter than ${i} → ${j}.` 
                    });

                    if (ik !== Infinity && kj !== Infinity && throughK < currentVal) {
                        matrix[i][j] = throughK;
                        steps.push({ 
                            matrix: matrix.map(row => [...row]), k, i, j, 
                            message: `New shortest path! dist[${i}][${j}] updated: ${currentVal === Infinity ? '∞' : currentVal} → ${throughK}` 
                        });
                    }
                }
            }
        }

        steps.push({ 
            matrix: matrix.map(row => [...row]), k: null, i: null, j: null, 
            message: "All-pairs shortest paths computed for all node combinations." 
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
                <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest">Graph Algorithms: Floyd-Warshall (All-Pairs Shortest Path)</p>
                <div className="flex justify-center items-center gap-3">
                     <span className={`px-2 py-0.5 rounded text-[10px] font-black border ${stepData.k !== null ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-500' : 'bg-[var(--viz-bg-inactive)] text-[var(--text-secondary)] opacity-30 border-transparent'}`}>
                          K: {stepData.k ?? '-'}
                     </span>
                     <span className={`px-2 py-0.5 rounded text-[10px] font-black border ${stepData.i !== null ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' : 'bg-[var(--viz-bg-inactive)] text-[var(--text-secondary)] opacity-30 border-transparent'}`}>
                          I: {stepData.i ?? '-'}
                     </span>
                     <span className={`px-2 py-0.5 rounded text-[10px] font-black border ${stepData.j !== null ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : 'bg-[var(--viz-bg-inactive)] text-[var(--text-secondary)] opacity-30 border-transparent'}`}>
                          J: {stepData.j ?? '-'}
                     </span>
                </div>
                <p className="text-lg font-bold text-[var(--text-primary)] max-w-2xl mx-auto min-h-[3rem] mt-2">{stepData.message}</p>
            </div>

            <div className="flex flex-col xl:flex-row items-center justify-center gap-12 w-full max-w-6xl">
                 {/* Matrix View */}
                 <div className="bg-[var(--viz-bg-inactive)] p-8 rounded-[2.5rem] border border-[var(--border-color)] shadow-2xl relative">
                    {/* Intermediate K Line Visuals (Conceptually) */}
                    <div className="grid grid-cols-5 gap-2">
                        {/* Header */}
                        <div className="w-16 h-16 flex items-center justify-center text-[10px] font-black text-[var(--text-secondary)] opacity-50 uppercase tracking-widest">I \ J</div>
                        {nodes.map(n => (
                            <div key={n} className={`w-16 h-16 flex items-center justify-center text-sm font-black rounded-xl transition-colors ${stepData.j === n ? 'text-emerald-500 bg-emerald-500/10 shadow-sm border border-emerald-500/20' : stepData.k === n ? 'text-indigo-500 bg-indigo-500/10' : 'text-[var(--text-secondary)] opacity-50'}`}>
                                {n}
                            </div>
                        ))}

                        {/* Rows */}
                        {stepData.matrix.map((row, i) => (
                            <div key={i} className="contents">
                                <div className={`w-16 h-16 flex items-center justify-center text-sm font-black rounded-xl transition-colors ${stepData.i === i ? 'text-amber-500 bg-amber-500/10 shadow-sm border border-amber-500/20' : stepData.k === i ? 'text-indigo-500 bg-indigo-500/10' : 'text-[var(--text-secondary)] opacity-50'}`}>
                                    {i}
                                </div>
                                {row.map((val, j) => {
                                    const isK = stepData.k === i || stepData.k === j;
                                    const isTarget = stepData.i === i && stepData.j === j;
                                    const isIK = stepData.i === i && stepData.k === j;
                                    const isKJ = stepData.k === i && stepData.j === j;

                                    return (
                                        <motion.div
                                            key={`${i}-${j}`}
                                            animate={{
                                                scale: isTarget ? 1.15 : (isIK || isKJ) ? 1.05 : 1,
                                                borderColor: isTarget ? 'var(--brand-500)' : (isIK || isKJ) ? 'var(--viz-highlight-warning)' : 'var(--viz-border-inactive)',
                                                backgroundColor: isTarget ? 'var(--viz-highlight-active-bg)' : (isIK || isKJ) ? 'var(--viz-highlight-warning-bg)' : 'var(--card-bg)',
                                            }}
                                            className="w-16 h-16 rounded-xl border-2 flex items-center justify-center font-black text-lg shadow-sm overflow-hidden relative"
                                        >
                                            <span className={val === Infinity ? 'text-[var(--text-secondary)] opacity-20' : isTarget ? 'text-brand-500' : 'text-[var(--text-primary)]'}>
                                                {val === Infinity ? '∞' : val}
                                            </span>
                                            {isTarget && <span className="absolute bottom-1 right-1 text-[8px] font-bold text-brand-500 opacity-50">dist[i][j]</span>}
                                        </motion.div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>

                    {/* Labels for I, J, K */}
                    <div className="mt-8 flex justify-center gap-8 border-t border-[var(--border-color)] pt-6">
                         <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded bg-amber-500"></div>
                              <span className="text-[10px] font-black text-[var(--text-secondary)] opacity-70 uppercase">Row (I)</span>
                         </div>
                         <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded bg-emerald-500"></div>
                              <span className="text-[10px] font-black text-[var(--text-secondary)] opacity-70 uppercase">Column (J)</span>
                         </div>
                         <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded bg-indigo-500"></div>
                              <span className="text-[10px] font-black text-[var(--text-secondary)] opacity-70 uppercase">Intermediate (K)</span>
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
