import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useAutoplay from '../../hooks/useAutoplay';
import VisualizerControls from './VisualizerControls';

export default function GreedyVisualizer() {
    const [capacity] = useState(50);
    const [items] = useState([
        { weight: 10, value: 60, id: 1 },
        { weight: 20, value: 100, id: 2 },
        { weight: 30, value: 120, id: 3 },
    ]);
    const [greedyItems, setGreedyItems] = useState([
        { weight: 30, value: 120, ratio: 4, id: 3 },
        { weight: 10, value: 60, ratio: 6, id: 1 },
        { weight: 20, value: 100, ratio: 5, id: 2 },
    ].sort((a, b) => b.ratio - a.ratio));

    const [bag, setBag] = useState([]);
    const [currentWeight, setCurrentWeight] = useState(0);
    const [totalValue, setTotalValue] = useState(0);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [status, setStatus] = useState('Wait');

    const handleNext = () => {
        if (status === 'Wait') {
            setStatus('Running');
            setCurrentIndex(0);
            return;
        }

        if (currentIndex >= greedyItems.length || currentWeight >= capacity) {
            setStatus('Over');
            return;
        }

        const item = greedyItems[currentIndex];
        const remaining = capacity - currentWeight;

        if (remaining <= 0) {
            setStatus('Over');
            return;
        }

        let weightToAdd, valueToAdd, fraction;
        if (item.weight <= remaining) {
            weightToAdd = item.weight;
            valueToAdd = item.value;
            fraction = 1;
        } else {
            weightToAdd = remaining;
            fraction = remaining / item.weight;
            valueToAdd = item.value * fraction;
        }

        setBag([...bag, { ...item, addedWeight: weightToAdd, addedValue: valueToAdd, fraction }]);
        setCurrentWeight(prev => prev + weightToAdd);
        setTotalValue(prev => prev + valueToAdd);
        setCurrentIndex(prev => prev + 1);

        if (currentIndex + 1 >= greedyItems.length || currentWeight + weightToAdd >= capacity) {
            setStatus('Over');
        }
    };

    const isFinished = status === 'Over';
    const { isPlaying, togglePlay, resetAutoplay } = useAutoplay(handleNext, isFinished);

    const reset = () => {
        setBag([]);
        setCurrentWeight(0);
        setTotalValue(0);
        setCurrentIndex(0);
        setStatus('Wait');
        resetAutoplay();
    };

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-12">
            <div className="text-center space-y-2">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Fractional Knapsack (Greedy)</p>
                <div className="flex gap-8 justify-center mt-4">
                    <div className="text-center">
                        <span className="text-[10px] uppercase font-black text-slate-500 block">Weight</span>
                        <span className="text-2xl font-black text-[var(--viz-highlight-active)]">{currentWeight} / {capacity}</span>
                    </div>
                    <div className="text-center">
                        <span className="text-[10px] uppercase font-black text-slate-500 block">Value</span>
                        <span className="text-2xl font-black text-[var(--viz-highlight-success)]">${totalValue.toFixed(1)}</span>
                    </div>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-12 items-end w-full justify-center">
                {/* Available Items */}
                <div className="flex flex-col items-center gap-4">
                    <span className="text-[10px] font-black uppercase text-slate-600">Items (Sorted by Value/Weight)</span>
                    <div className="flex gap-4">
                        {greedyItems.map((item, i) => {
                            const isCurrent = i === currentIndex && status === 'Running';
                            const isAdded = i < currentIndex;
                            return (
                                <motion.div
                                    key={item.id}
                                    animate={{
                                        scale: isCurrent ? 1.1 : 1,
                                        opacity: isAdded ? 0.4 : 1,
                                        borderColor: isCurrent ? 'var(--viz-highlight-active)' : 'var(--viz-border-inactive)',
                                    }}
                                    className="p-3 rounded-xl border-2 bg-[var(--viz-bg-inactive)]/50 flex flex-col items-center gap-1"
                                >
                                    <span className="text-xs font-black text-[var(--text-primary)]">${item.value}</span>
                                    <span className="text-[10px] text-slate-500">{item.weight}kg</span>
                                    <div className="w-full h-1 bg-[var(--viz-highlight-active-bg)] rounded-full mt-1 overflow-hidden">
                                        <div className="h-full bg-brand-500" style={{ width: `${(item.ratio / 6) * 100}%` }} />
                                    </div>
                                    <span className="text-[8px] font-bold text-[var(--viz-highlight-active)]">Ratio: {item.ratio}</span>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* Knapsack */}
                <div className="flex flex-col items-center gap-4">
                    <span className="text-[10px] font-black uppercase text-slate-600">Knapsack</span>
                    <div className="w-32 h-48 border-x-4 border-b-4 border-[var(--viz-border-inactive)]/50 rounded-b-2xl flex flex-col-reverse bg-[var(--viz-bg-inactive)]/20 overflow-hidden relative">
                        <AnimatePresence>
                            {bag.map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ height: 0 }}
                                    animate={{ height: `${(item.addedWeight / capacity) * 100}%` }}
                                    className="w-full bg-emerald-500/60 border-t border-emerald-400/50 flex items-center justify-center text-[8px] font-black text-white"
                                >
                                    Item {item.id} ({Math.round(item.fraction * 100)}%)
                                </motion.div>
                            ))}
                        </AnimatePresence>
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
            
            <div className="text-[10px] text-slate-500 italic max-w-sm text-center">
                Greedy Strategy: Always pick the item with the highest <code className="text-[var(--viz-highlight-active)]">Value / Weight</code> ratio first.
            </div>
        </div>
    );
}
