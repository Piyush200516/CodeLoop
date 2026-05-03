import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import useAutoplay from '../../hooks/useAutoplay';
import VisualizerControls from './VisualizerControls';

export default function RabinKarpVisualizer() {
    const text = "AABAACAADAABAABA";
    const pattern = "AABA";
    const d = 256;      // Number of characters in alphabet
    const q = 101;      // A prime number for modulo

    const [status, setStatus] = useState('Wait');
            const [message, setMessage] = useState('Rabin-Karp String Matching');

    const [i, setI] = useState(0);             // Sliding window start
    const [pHash, setPHash] = useState(0);     // Pattern hash
    const [tHash, setTHash] = useState(0);     // Window hash
    const [h, setH] = useState(1);             // Hash multiplier for MSB
    const [matches, setMatches] = useState([]);
    const [phase, setPhase] = useState('init'); // init, comp_hash, match_chars, slide

    const initializeAlgorithm = () => {
        let patternHash = 0;
        let windowHash = 0;
        let multiplier = 1;

        // Calculate h = pow(d, M-1) % q
        for (let idx = 0; idx < pattern.length - 1; idx++) {
            multiplier = (multiplier * d) % q;
        }

        // Calculate initial hash value for pattern and first window of text
        for (let idx = 0; idx < pattern.length; idx++) {
            patternHash = (d * patternHash + pattern.charCodeAt(idx)) % q;
            windowHash = (d * windowHash + text.charCodeAt(idx)) % q;
        }

        setMessage(`Initial Pattern Hash: ${patternHash}, Window Hash: ${windowHash}`);
        
        return { patternHash, windowHash, multiplier };
    };

    const handleNext = () => {
        if (status === 'Over') return;

        if (status === 'Wait') {
            const { patternHash, windowHash, multiplier } = initializeAlgorithm();
            setPHash(patternHash);
            setTHash(windowHash);
            setH(multiplier);
            setI(0);
            setStatus('Running');
            setPhase('comp_hash');
            setMessage(`Initial Hashes Computed. Pattern Hash = ${patternHash}, Window [0...${pattern.length-1}] Hash = ${windowHash}`);
            return;
        }

        const M = pattern.length;
        const N = text.length;

        if (phase === 'comp_hash') {
            if (pHash === tHash) {
                setMessage(`Hashes match (${pHash} == ${tHash}). Checking characters one by one...`);
                setPhase('match_chars');
            } else {
                setMessage(`Hashes mismatch (${pHash} != ${tHash}). Sliding window...`);
                setPhase('slide');
            }
        } 
        else if (phase === 'match_chars') {
            // In a real algorithm we'd iterate, but visually we can just check substring
            if (text.substring(i, i + M) === pattern) {
                setMatches(prev => [...prev, i]);
                setMessage(`Characters match! Found pattern at index ${i}`);
            } else {
                setMessage(`Spurious hit! Hashes matched but characters didn't.`);
            }
            setPhase('slide');
        } 
        else if (phase === 'slide') {
            if (i < N - M) {
                let nextTHash = (d * (tHash - text.charCodeAt(i) * h) + text.charCodeAt(i + M)) % q;
                
                // We might get negative value of t, converting it to positive
                if (nextTHash < 0) {
                    nextTHash = (nextTHash + q);
                }

                setTHash(nextTHash);
                setI(i + 1);
                setPhase('comp_hash');
                setMessage(`Sliding window to index ${i + 1}. Rolling Hash updated to ${nextTHash}`);
            } else {
                setStatus('Over');
                                setMessage('Reached end of text. Search complete!');
            }
        }
    };

    
    const isFinished = status === 'Over';
    const { isPlaying, togglePlay, resetAutoplay } = useAutoplay(handleNext, isFinished);

    const reset = () => {
        setStatus('Wait');
        setI(0);
        setPHash(0);
        setTHash(0);
        setH(1);
        setMatches([]);
        setPhase('init');
        setMessage('Rabin-Karp String Matching');
        resetAutoplay();
    };

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 overflow-hidden">
            <div className="text-center space-y-2 mb-12">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Rabin-Karp Algorithm</p>
                <p className="text-lg font-bold text-[var(--text-primary)] max-w-lg mx-auto min-h-[3rem]">{message}</p>
            </div>

            <div className="flex flex-col items-start gap-12 max-w-4xl w-full">
                {/* Stats Panel */}
                <div className="flex w-full justify-around bg-[var(--viz-bg-inactive)]/50 p-4 rounded-xl border border-white/5">
                    <div className="flex flex-col items-center">
                        <span className="text-xs text-slate-500 tracking-wider">PATTERN HASH</span>
                        <span className="text-2xl font-black text-[var(--viz-highlight-active)]">{status === 'Wait' ? '--' : pHash}</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-xs text-slate-500 tracking-wider">WINDOW HASH</span>
                        <span className="text-2xl font-black text-[var(--viz-highlight-success)]">{status === 'Wait' ? '--' : tHash}</span>
                    </div>
                </div>

                {/* Text Array */}
                <div className="w-full flex flex-col gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Text Array</span>
                    <div className="flex flex-wrap gap-1">
                        {text.split('').map((char, idx) => {
                            const isPatternLength = idx >= i && idx < i + pattern.length;
                            const isWindow = status !== 'Wait' && isPatternLength;
                            const isMatch = matches.some(m => idx >= m && idx < m + pattern.length);
                            
                            return (
                                <motion.div
                                    key={idx}
                                    animate={{
                                        y: isWindow ? -5 : 0,
                                        backgroundColor: isMatch ? 'var(--viz-highlight-success-bg)' : 
                                                         isWindow ? 'var(--viz-highlight-active-bg)' : 'var(--viz-bg-inactive)',
                                        borderColor: isMatch ? 'var(--viz-highlight-success)' : isWindow ? 'var(--viz-highlight-active)' : 'transparent'
                                    }}
                                    className="w-10 h-10 sm:w-12 sm:h-12 border rounded flex items-center justify-center font-bold text-lg sm:text-xl text-[var(--text-primary)]"
                                >
                                    {char}
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* Pattern Array */}
                <div className="w-full flex flex-col gap-2 mt-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Pattern (Length: {pattern.length})</span>
                    <div className="flex gap-1 relative" style={{ left: status !== 'Wait' ? `${i * (window.innerWidth < 640 ? 44 : 52)}px` : '0' }}>
                        {pattern.split('').map((char, idx) => (
                            <div
                                key={idx}
                                className="w-10 h-10 sm:w-12 sm:h-12 border-2 border-[var(--viz-highlight-active)] bg-[var(--viz-highlight-active-bg)] rounded flex items-center justify-center font-bold text-lg sm:text-xl text-[var(--viz-highlight-active)] shadow-lg shadow-brand-500/20"
                            >
                                {char}
                            </div>
                        ))}
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
