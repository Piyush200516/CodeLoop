import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useAutoplay from '../../hooks/useAutoplay';
import VisualizerControls from './VisualizerControls';

export default function PalindromeExpansionVisualizer() {
    const inputString = "babad";
    const [centerIdx, setCenterIdx] = useState(0); // 0 to 2*n - 2 (to account for gaps)
    const [left, setLeft] = useState(0);
    const [right, setRight] = useState(0);
    const [status, setStatus] = useState('Wait'); // Wait, Expanding, MovingCenter, Over
    const [longest, setLongest] = useState({ s: 0, e: 0 });
    const [message, setMessage] = useState('Find the longest palindromic substring by expanding around centers.');

    const handleNext = () => {
        if (status === 'Over') return;

        if (status === 'Wait') {
            setStatus('Expanding');
            const l = Math.floor(centerIdx / 2);
            const r = centerIdx % 2 === 0 ? l : l + 1;
            setLeft(l);
            setRight(r);
            setMessage(`Center: ${centerIdx % 2 === 0 ? `'${inputString[l]}'` : `Gap between '${inputString[l]}' and '${inputString[r]}'`}. Comparing...`);
            return;
        }

        if (status === 'Expanding') {
            // Check if current pointers match
            if (left >= 0 && right < inputString.length && inputString[left] === inputString[right]) {
                // It's a match, can we expand?
                const currentLen = right - left + 1;
                if (currentLen > (longest.e - longest.s + 1)) {
                    setLongest({ s: left, e: right });
                }

                if (left > 0 && right < inputString.length - 1 && inputString[left - 1] === inputString[right + 1]) {
                    setLeft(left - 1);
                    setRight(right + 1);
                    setMessage(`Matches! Expanding further...`);
                } else {
                    // Cannot expand further
                    setStatus('MovingCenter');
                    setMessage(`Expansion stopped. Potential palindrome: "${inputString.substring(left, right + 1)}"`);
                }
            } else {
                // Initial center mismatch (only possible for even centers if characters differ)
                setStatus('MovingCenter');
                setMessage(`Initial characters do not match. No palindrome here.`);
            }
            return;
        }

        if (status === 'MovingCenter') {
            const nextCenter = centerIdx + 1;
            if (nextCenter <= 2 * inputString.length - 2) {
                setCenterIdx(nextCenter);
                setStatus('Expanding');
                const l = Math.floor(nextCenter / 2);
                const r = nextCenter % 2 === 0 ? l : l + 1;
                setLeft(l);
                setRight(r);
                setMessage(`Moving to center index ${nextCenter}. ${nextCenter % 2 === 0 ? `Center is '${inputString[l]}'` : `Center is gap between '${inputString[l]}' and '${inputString[r]}'`}`);
            } else {
                setStatus('Over');
                setMessage(`Finished checking all centers. Longest found: "${inputString.substring(longest.s, longest.e + 1)}"`);
                setLeft(-1);
                setRight(-1);
            }
        }
    };

    const isFinished = status === 'Over';
    const { isPlaying, togglePlay, resetAutoplay } = useAutoplay(handleNext, isFinished);

    const reset = () => {
        setCenterIdx(0);
        setLeft(0);
        setRight(0);
        setLongest({ s: 0, e: 0 });
        setStatus('Wait');
        setMessage('Find the longest palindromic substring by expanding around centers.');
        resetAutoplay();
    };

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="text-center space-y-2 mb-16">
                <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest">String Algorithms: Palindrome Expansion</p>
                <p className="text-lg font-bold text-[var(--text-primary)] max-w-2xl mx-auto min-h-[3rem]">{message}</p>
            </div>

            <div className="flex flex-col items-center gap-12 w-full max-w-4xl">
                {/* Visual Representation */}
                <div className="flex gap-2 items-end h-32">
                    {inputString.split('').map((char, i) => {
                        const isLeft = i === left;
                        const isRight = i === right;
                        const isInCurrent = i >= left && i <= right && status !== 'Wait' && left !== -1;
                        const isLongest = i >= longest.s && i <= longest.e && status === 'Over';

                        return (
                            <div key={i} className="relative flex flex-col items-center gap-6">
                                {/* Pointers */}
                                <div className="absolute -top-14 h-12 w-full flex items-center justify-center">
                                    <AnimatePresence>
                                        {isLeft && (
                                            <motion.div initial={{y:5, opacity:0}} animate={{y:0, opacity:1}} exit={{y:5, opacity:0}} className="absolute -translate-x-4">
                                                <div className="px-2 py-0.5 bg-brand-500 text-[8px] font-black rounded text-white shadow-lg">LEFT</div>
                                                <div className="w-0.5 h-3 bg-brand-500 mx-auto mt-0.5" />
                                            </motion.div>
                                        )}
                                        {isRight && (
                                            <motion.div initial={{y:5, opacity:0}} animate={{y:0, opacity:1}} exit={{y:5, opacity:0}} className="absolute translate-x-4">
                                                <div className="px-2 py-0.5 bg-indigo-500 text-[8px] font-black rounded text-white shadow-lg">RIGHT</div>
                                                <div className="w-0.5 h-3 bg-indigo-500 mx-auto mt-0.5" />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Character Box */}
                                <motion.div
                                    animate={{
                                        scale: (isLeft || isRight) ? 1.2 : 1,
                                        borderColor: isLongest ? 'var(--viz-highlight-success)' : isInCurrent ? 'var(--viz-highlight-active)' : 'var(--viz-border-inactive)',
                                        backgroundColor: isLongest ? 'var(--viz-highlight-success-bg)' : isInCurrent ? 'var(--viz-highlight-active-bg)' : 'var(--viz-bg-inactive)'
                                    }}
                                    className={`w-14 h-16 rounded-2xl flex items-center justify-center font-black text-2xl border-2 transition-all shadow-xl`}
                                >
                                    <span className={isInCurrent || isLongest ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)] opacity-50'}>{char}</span>
                                </motion.div>
                                <span className="text-[10px] font-bold text-[var(--text-secondary)] opacity-70">IDX {i}</span>
                            </div>
                        );
                    })}
                </div>

                {/* Longest Substring Display */}
                <div className="bg-[var(--viz-bg-inactive)] px-6 py-4 rounded-2xl border border-[var(--border-color)] flex items-center gap-4 shadow-sm">
                    <span className="text-xs font-black uppercase tracking-widest text-[var(--text-secondary)] opacity-70 border-r border-[var(--border-color)] pr-4">Longest Found</span>
                    <span className="text-xl font-black text-brand-500 font-mono tracking-widest">
                        {inputString.substring(longest.s, longest.e + 1)}
                    </span>
                    <span className="text-[10px] font-bold text-[var(--text-secondary)] bg-[var(--viz-bg-inactive)] border border-[var(--border-color)] px-2 py-1 rounded">
                        LEN: {longest.e - longest.s + 1}
                    </span>
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
