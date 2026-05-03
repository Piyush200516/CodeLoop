import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useAutoplay from '../../hooks/useAutoplay';
import VisualizerControls from './VisualizerControls';

export default function RotateArrayVisualizer() {
    const initialArray = [1, 2, 3, 4, 5, 6, 7];
    const [array, setArray] = useState([...initialArray]);
    const [k] = useState(3);
    const [n] = useState(initialArray.length);
    
    // Phase: 'Wait', 'ReverseAll', 'ReverseK', 'ReverseRest', 'Done'
    const [phase, setPhase] = useState('Wait');
    const [left, setLeft] = useState(null);
    const [right, setRight] = useState(null);
    const [swapping, setSwapping] = useState(null); // { i, j }

    const startReverse = (p, l, r) => {
        setPhase(p);
        setLeft(l);
        setRight(r);
    };

    const handleNext = () => {
        if (phase === 'Wait') {
            startReverse('ReverseAll', 0, n - 1);
            return;
        }

        if (phase === 'Done') return;

        if (left < right) {
            // Perform swap
            const newArray = [...array];
            const temp = newArray[left];
            newArray[left] = newArray[right];
            newArray[right] = temp;
            
            setArray(newArray);
            setSwapping({ i: left, j: right });
            
            // Increment for next check
            setLeft(prev => prev + 1);
            setRight(prev => prev - 1);
        } else {
            // Phase complete, move to next
            setSwapping(null);
            if (phase === 'ReverseAll') {
                startReverse('ReverseK', 0, (k % n) - 1);
            } else if (phase === 'ReverseK') {
                startReverse('ReverseRest', k % n, n - 1);
            } else {
                setPhase('Done');
                setLeft(null);
                setRight(null);
            }
        }
    };

    const isFinished = phase === 'Done';
    const { isPlaying, togglePlay, resetAutoplay } = useAutoplay(handleNext, isFinished);

    const reset = () => {
        setArray([...initialArray]);
        setPhase('Wait');
        setLeft(null);
        setRight(null);
        setSwapping(null);
        resetAutoplay();
    };

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-12">
            <div className="text-center space-y-2">
                <p className="text-[10px] font-black text-brand-500 uppercase tracking-[0.2em]">Strategy: Triple Reverse</p>
                <p className="text-2xl font-black text-[var(--text-primary)]">
                    Rotate Right by <span className="text-brand-500">k = {k % n}</span>
                </p>
                <p className="text-sm font-bold text-[var(--text-secondary)]">
                    {phase === 'Wait' && 'Ready to rotate?'}
                    {phase === 'ReverseAll' && 'Phase 1: Reverse entire array'}
                    {phase === 'ReverseK' && 'Phase 2: Reverse first k elements'}
                    {phase === 'ReverseRest' && 'Phase 3: Reverse remaining elements'}
                    {phase === 'Done' && '🎉 Rotation Complete!'}
                </p>
            </div>

            {/* Array State */}
            <div className="flex gap-3 h-24 items-center">
                {array.map((val, i) => {
                    const isLeft = i === left;
                    const isRight = i === right;
                    const isBeingSwapped = swapping && (i === swapping.i || i === swapping.j);
                    const isInCurrentRange = (phase !== 'Wait' && phase !== 'Done') && (i >= (phase === 'ReverseAll' ? 0 : phase === 'ReverseK' ? 0 : k % n) && i <= (phase === 'ReverseAll' ? n - 1 : phase === 'ReverseK' ? (k % n) - 1 : n - 1));

                    return (
                        <div key={i} className="relative flex flex-col items-center">
                            <motion.div
                                layout
                                animate={{
                                    backgroundColor: isBeingSwapped ? 'var(--viz-highlight-active-bg)' : isLeft || isRight ? 'var(--viz-highlight-warning-bg)' : isInCurrentRange ? 'rgba(var(--brand-500-rgb), 0.05)' : 'var(--viz-bg-inactive)',
                                    borderColor: isBeingSwapped ? 'var(--viz-highlight-active)' : isLeft || isRight ? 'var(--viz-highlight-warning)' : isInCurrentRange ? 'var(--brand-500)' : 'var(--viz-border-inactive)',
                                    scale: isBeingSwapped ? 1.15 : 1,
                                    y: isBeingSwapped ? -10 : 0
                                }}
                                className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center font-black text-lg transition-all ${
                                    isBeingSwapped ? 'text-brand-500' : 'text-[var(--text-primary)]'
                                } shadow-sm`}
                            >
                                {val}
                            </motion.div>
                            <span className="text-[8px] font-bold text-[var(--text-secondary)] mt-2 uppercase tracking-widest">IDX {i}</span>
                        </div>
                    );
                })}
            </div>

            {/* Controls */}
            <VisualizerControls 
                onNext={handleNext}
                onReset={reset}
                onTogglePlay={togglePlay}
                isPlaying={isPlaying}
                status={phase}
            />

            <div className="max-w-sm mt-4 p-4 bg-brand-500/5 rounded-xl border border-brand-500/10 text-center">
                <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed uppercase font-bold tracking-wider italic">
                    {phase === 'ReverseAll' && 'Swapping elements at both ends move inward until they meet.'}
                    {phase === 'ReverseK' && 'Now we reverse the first k elements to position them correctly.'}
                    {phase === 'ReverseRest' && 'Finally, we reverse the rest of the array to restore their relative order.'}
                    {phase === 'Done' && 'The array is now perfectly rotated!'}
                    {phase === 'Wait' && 'Click Start to begin the triple-reverse process.'}
                </p>
            </div>
        </div>
    );
}
