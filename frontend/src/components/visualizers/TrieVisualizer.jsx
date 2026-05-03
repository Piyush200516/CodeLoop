import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useAutoplay from '../../hooks/useAutoplay';
import VisualizerControls from './VisualizerControls';

export default function TrieVisualizer() {
    const [words] = useState(['CAT', 'CAR', 'DOG']);
    const [trie, setTrie] = useState({ nodes: { root: { children: {}, isEnd: false } } });
    const [status, setStatus] = useState('Wait');
    const [currentWordIdx, setCurrentWordIdx] = useState(0);
    const [currentCharIdx, setCurrentCharIdx] = useState(0);
    const [message, setMessage] = useState('Build a Trie with words: CAT, CAR, DOG');

    const handleNext = () => {
        if (status === 'Wait') {
            setStatus('Inserting');
            setCurrentWordIdx(0);
            setCurrentCharIdx(0);
            return;
        }

        if (status === 'Over') return;

        const word = words[currentWordIdx];
        const char = word[currentCharIdx];

        // Insert char into trie (simplified state updates)
        const newTrie = JSON.parse(JSON.stringify(trie));
        let curr = newTrie.nodes.root;

        // Traverse to current insertion point
        for (let i = 0; i < currentCharIdx; i++) {
            curr = curr.children[word[i]];
        }

        if (!curr.children[char]) {
            curr.children[char] = { children: {}, isEnd: false };
        }

        if (currentCharIdx === word.length - 1) {
            curr.children[char].isEnd = true;
            if (currentWordIdx === words.length - 1) {
                setStatus('Over');
                setMessage('Trie building complete!');
            } else {
                setCurrentWordIdx(prev => prev + 1);
                setCurrentCharIdx(0);
                setMessage(`Inserting word: ${words[currentWordIdx + 1]}`);
            }
        } else {
            setCurrentCharIdx(prev => prev + 1);
            setMessage(`Inserting character '${char}' for word: ${word}`);
        }

        setTrie(newTrie);
    };

    const isFinished = status === 'Over';
    const { isPlaying, togglePlay, resetAutoplay } = useAutoplay(handleNext, isFinished);

    const reset = () => {
        setTrie({ nodes: { root: { children: {}, isEnd: false } } });
        setStatus('Wait');
        setCurrentWordIdx(0);
        setCurrentCharIdx(0);
        setMessage('Build a Trie with words: CAT, CAR, DOG');
        resetAutoplay();
    };

    // Recursive helper to render Trie nodes
    const renderNode = (node, char = 'root', depth = 0) => {
        return (
            <div className="flex flex-col items-center">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold shadow-md ${
                        node.isEnd ? 'bg-brand-500 border-brand-400 text-white' : 'bg-[var(--viz-bg-inactive)] border-[var(--viz-border-inactive)] text-[var(--text-primary)]'
                    }`}
                >
                    {char}
                </motion.div>
                <div className="flex gap-4 mt-4">
                    {Object.entries(node.children).map(([c, child]) => (
                        <div key={c} className="flex flex-col items-center">
                            <div className="w-px h-4 bg-slate-700 mb-1" />
                            {renderNode(child, c, depth + 1)}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-12 overflow-auto custom-scrollbar">
            <div className="text-center space-y-2">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Prefix Tree Visualization</p>
                <p className="text-sm font-medium text-[var(--text-secondary)]">{message}</p>
            </div>

            <div className="min-h-[250px] flex items-start justify-center p-4">
                {renderNode(trie.nodes.root)}
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
