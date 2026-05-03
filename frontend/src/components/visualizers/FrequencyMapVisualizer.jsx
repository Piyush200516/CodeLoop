import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useAutoplay from '../../hooks/useAutoplay';
import VisualizerControls from './VisualizerControls';

export default function FrequencyMapVisualizer() {
    const [inputString] = useState("banana");
    const [map, setMap] = useState({});
    const [index, setIndex] = useState(-1);
    const [status, setStatus] = useState('Wait'); // Wait, Running, Over
    const [message, setMessage] = useState('Build a frequency map for the string "banana".');

    const handleNext = () => {
        if (status === 'Over') return;

        if (status === 'Wait') {
            setStatus('Running');
            setIndex(0);
            setMessage(`Starting with character at index 0: '${inputString[0]}'`);
            return;
        }

        const currChar = inputString[index];
        const newMap = { ...map };
        newMap[currChar] = (newMap[currChar] || 0) + 1;
        setMap(newMap);

        if (index < inputString.length - 1) {
            setIndex(index + 1);
            setMessage(`Processed '${currChar}'. Incremented count in map. Next character: '${inputString[index + 1]}'`);
        } else {
            setMessage(`Finished processing. Final frequency map built!`);
            setStatus('Over');
            setIndex(inputString.length); // Out of bounds to hide pointer
        }
    };

    const isFinished = status === 'Over';
    const { isPlaying, togglePlay, resetAutoplay } = useAutoplay(handleNext, isFinished);

    const reset = () => {
        setIndex(-1);
        setMap({});
        setStatus('Wait');
        setMessage('Build a frequency map for the string "banana".');
        resetAutoplay();
    };

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="text-center space-y-2 mb-12">
                <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest">String Algorithms: Frequency Map</p>
                <p className="text-lg font-bold text-[var(--text-primary)] max-w-lg mx-auto min-h-[3rem]">{message}</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-16 items-start justify-center w-full max-w-4xl">
                {/* String Display */}
                <div className="flex flex-col items-center gap-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] opacity-70">Input String</span>
                    <div className="flex gap-2">
                        {inputString.split('').map((char, i) => {
                            const isCurrent = i === index;
                            const isProcessed = i < index;
                            return (
                                <div key={i} className="flex flex-col items-center gap-2">
                                    <motion.div
                                        animate={{
                                            scale: isCurrent ? 1.2 : 1,
                                            borderColor: isCurrent ? 'var(--viz-highlight-active)' : isProcessed ? 'var(--viz-highlight-success)' : 'var(--viz-border-inactive)',
                                            backgroundColor: isCurrent ? 'var(--viz-highlight-active-bg)' : isProcessed ? 'var(--viz-highlight-success-bg)' : 'var(--viz-bg-inactive)'
                                        }}
                                        className="w-12 h-14 rounded-xl border-2 flex items-center justify-center shadow-lg transition-colors"
                                    >
                                        <span className={`text-xl font-black ${isCurrent || isProcessed ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)] opacity-50'}`}>{char}</span>
                                    </motion.div>
                                    <span className="text-[10px] font-bold text-[var(--text-secondary)] opacity-70">{i}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Frequency Map View */}
                <div className="flex flex-col items-center gap-4 min-w-[240px]">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] opacity-70">Frequency Map</span>
                    <div className="w-full bg-[var(--viz-bg-inactive)] rounded-2xl border border-[var(--border-color)] p-4 flex flex-col gap-2 min-h-[200px] shadow-sm">
                        <AnimatePresence>
                            {Object.entries(map).length === 0 && (
                                <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="text-xs text-[var(--text-secondary)] italic text-center py-12">
                                    Map is empty
                                </motion.div>
                            )}
                            {Object.entries(map).sort().map(([char, count]) => (
                                <motion.div
                                    key={char}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="flex justify-between items-center px-4 py-3 rounded-xl text-sm font-bold bg-[var(--card-bg)] border border-[var(--border-color)] text-[var(--text-primary)] shadow-sm"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="w-8 h-8 rounded-lg bg-brand-500/20 flex items-center justify-center text-brand-400 border border-brand-500/20">
                                            {char}
                                        </span>
                                        <span className="text-[var(--text-secondary)] uppercase text-[10px]">Char</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-brand-500 text-lg">{count}</span>
                                        <span className="text-[var(--text-secondary)] text-[10px] uppercase">Times</span>
                                    </div>
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
        </div>
    );
}
