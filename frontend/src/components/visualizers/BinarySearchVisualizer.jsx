import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useAutoplay from '../../hooks/useAutoplay';
import VisualizerControls from './VisualizerControls';

export default function BinarySearchVisualizer() {
    const [array] = useState([2, 5, 8, 12, 16, 23, 38, 56, 72, 91]);
    const target = 23;
    const [low, setLow] = useState(0);
    const [high, setHigh] = useState(array.length - 1);
    const [mid, setMid] = useState(null);
    const [status, setStatus] = useState('Wait'); // Wait, PickMid, Compare, Found, Over

    const handleNext = () => {
        if (status === 'Wait') {
            setStatus('PickMid');
            const m = Math.floor((low + high) / 2);
            setMid(m);
            return;
        }

        if (status === 'PickMid') {
            if (array[mid] === target) {
                setStatus('Found');
            } else {
                setStatus('Compare');
            }
            return;
        }

        if (status === 'Compare') {
            if (low >= high) {
                setStatus('Over');
                return;
            }
            if (array[mid] < target) {
                setLow(mid + 1);
            } else {
                setHigh(mid - 1);
            }
            setStatus('Wait'); // Loop back to PickMid logic
        }
    };

    const isFinished = status === 'Found' || status === 'Over';
    const { isPlaying, togglePlay, resetAutoplay } = useAutoplay(handleNext, isFinished);

    const reset = () => {
        setLow(0);
        setHigh(array.length - 1);
        setMid(null);
        setStatus('Wait');
        resetAutoplay();
    };

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-12">
            <div className="text-center space-y-2">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Search Target: {target}</p>
                <p className="text-2xl font-black text-slate-100 min-h-[32px]">
                    {status === 'Wait' && 'Check range...'}
                    {status === 'PickMid' && `Middle index: ${mid}`}
                    {status === 'Compare' && (array[mid] < target ? `${array[mid]} < ${target}, search Right` : `${array[mid]} > ${target}, search Left`)}
                    {status === 'Found' && `🎯 Found! Index: ${mid}`}
                    {status === 'Over' && 'Not in array'}
                </p>
            </div>

            <div className="flex flex-wrap gap-2 justify-center">
                {array.map((val, i) => {
                    const isOutside = i < low || i > high;
                    const isMid = i === mid;
                    return (
                        <motion.div
                            key={i}
                            animate={{
                                opacity: isOutside ? 0.3 : 1,
                                scale: isMid ? 1.2 : 1,
                                borderColor: isMid ? 'var(--viz-highlight-active)' : 'var(--viz-border-inactive)',
                                backgroundColor: isMid ? 'var(--viz-highlight-active-bg)' : 'var(--viz-bg-inactive)'
                            }}
                            className={`w-12 h-12 rounded-xl border flex items-center justify-center font-bold transition-all ${
                                isMid ? 'text-[var(--viz-highlight-active)]' : isOutside ? 'text-slate-700' : 'text-[var(--text-secondary)]'
                            }`}
                        >
                            {val}
                        </motion.div>
                    );
                })}
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
