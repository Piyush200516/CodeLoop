import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useAutoplay from '../../hooks/useAutoplay';
import VisualizerControls from './VisualizerControls';

export default function MergeIntervalsVisualizer() {
    const [intervals, setIntervals] = useState([
        { start: 1, end: 3, id: 1 },
        { start: 2, end: 6, id: 2 },
        { start: 8, end: 10, id: 3 },
        { start: 15, end: 18, id: 4 }
    ]);
    const [merged, setMerged] = useState([]);
    const [status, setStatus] = useState('Wait');
    const [currentIndex, setCurrentIndex] = useState(0);

    const handleNext = () => {
        if (status === 'Wait') {
            setStatus('Running');
            setMerged([intervals[0]]);
            setCurrentIndex(1);
            return;
        }

        if (currentIndex >= intervals.length) {
            setStatus('Over');
            return;
        }

        const current = intervals[currentIndex];
        const lastMerged = merged[merged.length - 1];

        const nextMerged = [...merged];
        if (current.start <= lastMerged.end) {
            // Overlap, update end of the last merged interval
            nextMerged[nextMerged.length - 1] = {
                ...lastMerged,
                end: Math.max(lastMerged.end, current.end)
            };
        } else {
            // No overlap, add new interval
            nextMerged.push(current);
        }

        setMerged(nextMerged);
        setCurrentIndex(currentIndex + 1);
        if (currentIndex + 1 >= intervals.length) setStatus('Over');
    };

    const isFinished = status === 'Over';
    const { isPlaying, togglePlay, resetAutoplay } = useAutoplay(handleNext, isFinished);

    const reset = () => {
        setMerged([]);
        setStatus('Wait');
        setCurrentIndex(0);
        resetAutoplay();
    };

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-12">
            <div className="text-center space-y-2">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Merge Overlapping Intervals</p>
                <p className="text-sm font-medium text-[var(--text-secondary)]">
                    {status === 'Wait' ? 'Sort by start time and merge overlaps' : 
                     status === 'Over' ? 'All intervals processed' : 
                     `Comparing interval [${intervals[currentIndex].start}, ${intervals[currentIndex].end}]`}
                </p>
            </div>

            <div className="w-full max-w-xl space-y-8">
                {/* Input Intervals */}
                <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase text-slate-600">Initial Intervals</span>
                    <div className="relative h-12 bg-[var(--viz-bg-inactive)]/20 rounded-xl overflow-hidden border border-white/5">
                        {intervals.map((interval, i) => (
                            <motion.div
                                key={interval.id}
                                animate={{
                                    backgroundColor: i === currentIndex ? 'var(--viz-highlight-active)' : 'var(--viz-highlight-active-bg)',
                                    opacity: i < currentIndex ? 0.3 : 1
                                }}
                                className="absolute h-6 top-3 rounded-md flex items-center justify-center text-[10px] font-bold text-white shadow-lg"
                                style={{
                                    left: `${(interval.start / 20) * 100}%`,
                                    width: `${((interval.end - interval.start) / 20) * 100}%`
                                }}
                            >
                                [{interval.start},{interval.end}]
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Merged Outcome */}
                <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase text-slate-600">Merged Intervals</span>
                    <div className="relative h-12 bg-[var(--viz-bg-inactive)]/20 rounded-xl overflow-hidden border border-white/5">
                        <AnimatePresence>
                            {merged.map((interval, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="absolute h-6 top-3 bg-brand-500 rounded-md flex items-center justify-center text-[10px] font-bold text-white shadow-xl"
                                    style={{
                                        left: `${(interval.start / 20) * 100}%`,
                                        width: `${((interval.end - interval.start) / 20) * 100}%`
                                    }}
                                >
                                    [{interval.start},{interval.end}]
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
