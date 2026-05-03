import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useAutoplay from '../../hooks/useAutoplay';
import VisualizerControls from './VisualizerControls';

export default function BalancedBinaryTreeVisualizer() {
    // Imbalanced Tree for visualization
    const tree = {
        val: 1, x: 50, y: 15,
        left: { 
            val: 2, x: 25, y: 45, 
            left: { 
                val: 4, x: 12, y: 75, 
                left: { val: 8, x: 6, y: 95, left: null, right: null }, 
                right: null 
            }, 
            right: null 
        },
        right: { val: 3, x: 75, y: 45, left: null, right: null }
    };

    const nodes = [1, 2, 3, 4, 8].map(v => {
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
        { from: {x:12, y:75}, to: {x:6, y:95} },
    ];

    const generateSteps = () => {
        const steps = [];
        const heights = {};
        const balanced = {};

        const checkBalance = (node) => {
            if (!node) return 0;

            steps.push({ current: node.val, heights: { ...heights }, balanced: { ...balanced }, message: `Node ${node.val}: Checking subtrees...` });

            const leftH = checkBalance(node.left);
            const rightH = checkBalance(node.right);

            const isBal = Math.abs(leftH - rightH) <= 1;
            const h = Math.max(leftH, rightH) + 1;
            
            heights[node.val] = h;
            balanced[node.val] = isBal;

            steps.push({ 
                current: node.val, 
                heights: { ...heights }, 
                balanced: { ...balanced }, 
                message: `Node ${node.val}: |${leftH} - ${rightH}| = ${Math.abs(leftH - rightH)}. ${isBal ? "Balanced! ✅" : "IMBALANCED! ❌"}` 
            });

            return h;
        };

        steps.push({ current: null, heights: {}, balanced: {}, message: "Let's check if this tree is height-balanced." });
        checkBalance(tree);
        const isOverallBalanced = Object.values(balanced).every(v => v);
        steps.push({ current: null, heights, balanced, message: `Final Result: Tree is ${isOverallBalanced ? "Balanced" : "NOT Balanced"}.` });
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
                <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest">Tree Algorithms: Balanced Binary Tree</p>
                <p className="text-lg font-bold text-[var(--text-primary)] max-w-xl mx-auto min-h-[3rem]">{stepData.message}</p>
            </div>

            <div className="flex flex-col items-center justify-center gap-12 w-full max-w-4xl">
                {/* Tree View */}
                <div className="relative w-full max-w-lg h-[400px] border border-[var(--border-color)] bg-[var(--viz-bg-inactive)] rounded-3xl p-4 overflow-hidden shadow-2xl">
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
                        const height = stepData.heights[node.val];
                        const isBalanced = stepData.balanced[node.val];
                        const hasChecked = stepData.balanced[node.val] !== undefined;

                        return (
                            <div key={node.val} className="absolute -ml-8 -mt-8 flex flex-col items-center" style={{ left: `${node.x}%`, top: `${node.y}%` }}>
                                <motion.div
                                    animate={{
                                        scale: isCurrent ? 1.2 : 1,
                                        backgroundColor: isCurrent ? 'var(--viz-highlight-active-bg)' : 
                                                       (hasChecked && !isBalanced) ? 'var(--viz-highlight-error-bg)' :
                                                       hasChecked ? 'var(--viz-highlight-success-bg)' : 'var(--viz-bg-inactive)',
                                        borderColor: isCurrent ? 'var(--viz-highlight-active)' : 
                                                   (hasChecked && !isBalanced) ? 'var(--viz-highlight-error)' :
                                                   hasChecked ? 'var(--viz-highlight-success)' : 'var(--viz-border-inactive)',
                                    }}
                                    className={`w-14 h-14 rounded-full border-2 flex items-center justify-center font-black text-[var(--text-primary)] shadow-xl z-20`}
                                >
                                    {node.val}
                                </motion.div>
                                
                                <AnimatePresence>
                                    {height !== undefined && (
                                        <motion.div
                                            initial={{ scale: 0, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            className={`absolute -top-4 -right-4 w-10 h-6 rounded-lg ${isBalanced === false ? 'bg-red-500' : 'bg-brand-500'} border-2 border-[var(--card-bg)] flex items-center justify-center text-[10px] font-black text-white shadow-lg z-30`}
                                        >
                                            H={height}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </div>

                <div className="flex gap-4">
                    <div className={`flex flex-col items-center p-4 rounded-2xl border min-w-[160px] ${status === 'Over' && !Object.values(stepData.balanced).every(v=>v) ? 'bg-red-500/10 border-red-500/30' : 'bg-[var(--viz-bg-inactive)] border-[var(--border-color)] shadow-sm'}`}>
                        <span className="text-[10px] font-black uppercase text-[var(--text-secondary)] mb-1 opacity-70">Result</span>
                        <span className={`text-xl font-black ${status === 'Over' && !Object.values(stepData.balanced).every(v=>v) ? 'text-red-500' : 'text-emerald-500'}`}>
                            {status === 'Over' 
                                ? (Object.values(stepData.balanced).every(v => v) ? "BALANCED" : "IMBALANCED")
                                : "CHECKING..."
                            }
                        </span>
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
