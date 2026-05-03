import { useState } from 'react';
import { motion } from 'framer-motion';
import useAutoplay from '../../hooks/useAutoplay';
import VisualizerControls from './VisualizerControls';

export default function TwoPointerVisualizer() {
    const [array] = useState([1, 2, 4, 7, 11, 15]);
    const target = 15;
    const [left, setLeft] = useState(0);
    const [right, setRight] = useState(array.length - 1);
    const [status, setStatus] = useState('Wait'); // Wait, Running, Found, Over

    const sum = array[left] + array[right];

    const handleNext = () => {
        if (status === 'Wait') return setStatus('Running');
        if (sum === target) return setStatus('Found');
        if (left >= right) return setStatus('Over');

        if (sum < target) {
            setLeft(prev => prev + 1);
        } else {
            setRight(prev => prev - 1);
        }
    };

    const isFinished = status === 'Found' || status === 'Over';
    const { isPlaying, togglePlay, resetAutoplay } = useAutoplay(handleNext, isFinished);

    const reset = () => {
        setLeft(0);
        setRight(array.length - 1);
        setStatus('Wait');
        resetAutoplay();
    };

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-12">
            {/* Status Info */}
            <div className="text-center space-y-2">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Target Sum: {target}</p>
                <p className="text-2xl font-black text-slate-100">
                    {status === 'Wait' && 'Click Start to begin'}
                    {status === 'Running' && `Current Sum: ${array[left]} + ${array[right]} = ${sum}`}
                    {status === 'Found' && `🎉 Found! Indices ${left} and ${right}`}
                    {status === 'Over' && 'No solution found'}
                </p>
            </div>

            {/* Array Visualization */}
            <div className="flex gap-3 h-24 items-end">
                {array.map((val, i) => {
                    const isLeft = i === left;
                    const isRight = i === right;
                    return (
                        <div key={i} className="relative flex flex-col items-center gap-4">
                            {/* Pointers */}
                            <div className="absolute -top-12 h-10 w-full flex items-center justify-center">
                                {isLeft && (
                                    <motion.div layoutId="left-ptr" className="absolute">
                                        <div className="px-2 py-1 bg-brand-500 text-[10px] font-black rounded-lg text-white shadow-lg">L</div>
                                        <div className="w-0.5 h-4 bg-brand-500 mx-auto mt-1" />
                                    </motion.div>
                                )}
                                {isRight && (
                                    <motion.div layoutId="right-ptr" className="absolute">
                                        <div className="px-2 py-1 bg-indigo-500 text-[10px] font-black rounded-lg text-white shadow-lg">R</div>
                                        <div className="w-0.5 h-4 bg-indigo-500 mx-auto mt-1" />
                                    </motion.div>
                                )}
                            </div>

                            {/* Element */}
                            <motion.div
                                animate={{
                                    scale: (isLeft || isRight) ? 1.1 : 1,
                                    borderColor: status === 'Found' && (isLeft || isRight) ? 'var(--viz-highlight-success)' : 
                                               (isLeft || isRight) ? 'var(--viz-highlight-active)' : 'var(--viz-border-inactive)'
                                }}
                                className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl border-2 transition-colors ${
                                    (isLeft || isRight) ? 'bg-[var(--viz-highlight-active-bg)] text-[var(--viz-highlight-active)]' : 'bg-[var(--viz-bg-inactive)]/50 text-slate-500'
                                }`}
                            >
                                {val}
                            </motion.div>
                            <span className="text-[10px] font-bold text-slate-600">{i}</span>
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
                status={status}
            />
        </div>
    );
}
