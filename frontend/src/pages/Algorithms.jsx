import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axiosInstance';
import TwoPointerVisualizer from '../components/visualizers/TwoPointerVisualizer';
import SlidingWindowVisualizer from '../components/visualizers/SlidingWindowVisualizer';
import BinarySearchVisualizer from '../components/visualizers/BinarySearchVisualizer';
import GraphVisualizer from '../components/visualizers/GraphVisualizer';
import FastSlowPointerVisualizer from '../components/visualizers/FastSlowPointerVisualizer';
import CyclicSortVisualizer from '../components/visualizers/CyclicSortVisualizer';
import DivideAndConquerVisualizer from '../components/visualizers/DivideAndConquerVisualizer';
import PrefixSumVisualizer from '../components/visualizers/PrefixSumVisualizer';
import MonotonicStackVisualizer from '../components/visualizers/MonotonicStackVisualizer';
import HeapVisualizer from '../components/visualizers/HeapVisualizer';
import KadaneVisualizer from '../components/visualizers/KadaneVisualizer';
import UnionFindVisualizer from '../components/visualizers/UnionFindVisualizer';
import DPGridVisualizer from '../components/visualizers/DPGridVisualizer';
import MergeIntervalsVisualizer from '../components/visualizers/MergeIntervalsVisualizer';
import TopologicalSortVisualizer from '../components/visualizers/TopologicalSortVisualizer';
import TrieVisualizer from '../components/visualizers/TrieVisualizer';
import BitManipulationVisualizer from '../components/visualizers/BitManipulationVisualizer';
import GreedyVisualizer from '../components/visualizers/GreedyVisualizer';
import HashMapVisualizer from '../components/visualizers/HashMapVisualizer';
import HashSetVisualizer from '../components/visualizers/HashSetVisualizer';
import MatrixTraversalVisualizer from '../components/visualizers/MatrixTraversalVisualizer';
import BubbleSortVisualizer from '../components/visualizers/BubbleSortVisualizer';
import SelectionSortVisualizer from '../components/visualizers/SelectionSortVisualizer';
import InsertionSortVisualizer from '../components/visualizers/InsertionSortVisualizer';
import MergeSortVisualizer from '../components/visualizers/MergeSortVisualizer';
import QuickSortVisualizer from '../components/visualizers/QuickSortVisualizer';
import HeapSortVisualizer from '../components/visualizers/HeapSortVisualizer';
import RabinKarpVisualizer from '../components/visualizers/RabinKarpVisualizer';
import KMPVisualizer from '../components/visualizers/KMPVisualizer';
import BinaryTreeTraversalVisualizer from '../components/visualizers/BinaryTreeTraversalVisualizer';
import PairSumVisualizer from '../components/visualizers/PairSumVisualizer';
import RotateArrayVisualizer from '../components/visualizers/RotateArrayVisualizer';
import SegmentTreeVisualizer from '../components/visualizers/SegmentTreeVisualizer';
import RecursionTreeVisualizer from '../components/visualizers/RecursionTreeVisualizer';
import FrequencyMapVisualizer from '../components/visualizers/FrequencyMapVisualizer';
import PalindromeExpansionVisualizer from '../components/visualizers/PalindromeExpansionVisualizer';
import LevelOrderTraversalVisualizer from '../components/visualizers/LevelOrderTraversalVisualizer';
import TreeHeightVisualizer from '../components/visualizers/TreeHeightVisualizer';
import BalancedBinaryTreeVisualizer from '../components/visualizers/BalancedBinaryTreeVisualizer';
import CycleDetectionVisualizer from '../components/visualizers/CycleDetectionVisualizer';
import DijkstraVisualizer from '../components/visualizers/DijkstraVisualizer';
import BellmanFordVisualizer from '../components/visualizers/BellmanFordVisualizer';
import FloydWarshallVisualizer from '../components/visualizers/FloydWarshallVisualizer';
import BacktrackingVisualizer from '../components/visualizers/BacktrackingVisualizer';
import IncludeExcludeVisualizer from '../components/visualizers/IncludeExcludeVisualizer';
import SuggestionForm from '../components/codeVisualizer/SuggestionForm';
import { useAuth } from '../context/AuthContext';
import PremiumPaywall from '../components/PremiumPaywall';

const FREE_ALGS = ['binary-search', 'bubble-sort', 'insertion-sort', 'linear-search', 'stack', 'queue', 'two-pointer', 'monotonic-stack', 'binary-tree-traversal'];

export default function AlgorithmsPage() {
    const { user } = useAuth();
    const [algorithms, setAlgorithms] = useState([]);
    const [selectedAlg, setSelectedAlg] = useState(null);
    const [loading, setLoading] = useState(true);
    const [expandedCategories, setExpandedCategories] = useState({});
    const [isPaywallOpen, setIsPaywallOpen] = useState(false);
    const [paywallFeature, setPaywallFeature] = useState('');

    const ADMIN_EMAIL = (import.meta.env.VITE_ADMIN_EMAIL || 'coderecallapp@gmail.com').toLowerCase().trim();
    const isAdmin = user?.email?.toLowerCase().trim() === ADMIN_EMAIL;
    const isPremium = isAdmin || user?.isPremium || user?.isPaid;

    useEffect(() => {
        api.get('/algorithms')
            .then(({ data }) => {
                setAlgorithms(data);
                if (data.length > 0) setSelectedAlg(data[0]);

                if (data.length > 0) {
                    const allCategories = [...new Set(data.map(a => a.category))];
                    const expanded = {};
                    allCategories.forEach(cat => expanded[cat] = true);
                    setExpandedCategories(expanded);
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const groupedAlgorithms = algorithms.reduce((acc, curr) => {
        const cat = curr.category || 'Other';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(curr);
        return acc;
    }, {});

    const toggleCategory = (cat) => {
        setExpandedCategories(prev => ({ ...prev, [cat]: prev[cat] === undefined ? false : !prev[cat] }));
    };

    const handleSelectAlg = (alg) => {
        const isFree = FREE_ALGS.includes(alg.name);
        if (!isPremium && !isFree) {
            setPaywallFeature(alg.title);
            setIsPaywallOpen(true);
            return;
        }
        setSelectedAlg(alg);
    };

    const renderVisualizer = () => {
        if (!selectedAlg) return null;
        switch (selectedAlg.name) {
            case 'two-pointer': return <TwoPointerVisualizer />;
            case 'sliding-window': return <SlidingWindowVisualizer />;
            case 'binary-search': return <BinarySearchVisualizer />;
            case 'bfs': return <GraphVisualizer type="bfs" />;
            case 'dfs': return <GraphVisualizer type="dfs" />;
            case 'fast-slow-pointers': return <FastSlowPointerVisualizer />;
            case 'cyclic-sort': return <CyclicSortVisualizer />;
            case 'divide-conquer': return <DivideAndConquerVisualizer />;
            case 'prefix-sum': return <PrefixSumVisualizer />;
            case 'monotonic-stack': return <MonotonicStackVisualizer />;
            case 'heap-priority-queue': return <HeapVisualizer />;
            case 'kadanes-algorithm': return <KadaneVisualizer />;
            case 'union-find': return <UnionFindVisualizer />;
            case 'dp-grid': return <DPGridVisualizer />;
            case 'merge-intervals': return <MergeIntervalsVisualizer />;
            case 'topological-sort': return <TopologicalSortVisualizer />;
            case 'trie': return <TrieVisualizer />;
            case 'bit-manipulation': return <BitManipulationVisualizer />;
            case 'greedy': return <GreedyVisualizer />;
            case 'hash-map': return <HashMapVisualizer />;
            case 'hash-set': return <HashSetVisualizer />;
            case 'matrix-traversal': return <MatrixTraversalVisualizer />;
            case 'bubble-sort': return <BubbleSortVisualizer />;
            case 'selection-sort': return <SelectionSortVisualizer />;
            case 'insertion-sort': return <InsertionSortVisualizer />;
            case 'merge-sort': return <MergeSortVisualizer />;
            case 'quick-sort': return <QuickSortVisualizer />;
            case 'heap-sort': return <HeapSortVisualizer />;
            case 'rabin-karp': return <RabinKarpVisualizer />;
            case 'kmp': return <KMPVisualizer />;
            case 'binary-tree-traversal': return <BinaryTreeTraversalVisualizer />;
            case 'level-order-traversal': return <LevelOrderTraversalVisualizer />;
            case 'tree-height': return <TreeHeightVisualizer />;
            case 'balanced-binary-tree': return <BalancedBinaryTreeVisualizer />;
            case 'frequency-map': return <FrequencyMapVisualizer />;
            case 'palindrome-expansion': return <PalindromeExpansionVisualizer />;
            case 'cycle-detection': return <CycleDetectionVisualizer />;
            case 'dijkstra': return <DijkstraVisualizer />;
            case 'bellman-ford': return <BellmanFordVisualizer />;
            case 'floyd-warshall': return <FloydWarshallVisualizer />;
            case 'pair-sum': return <PairSumVisualizer />;
            case 'rotate-array': return <RotateArrayVisualizer />;
            case 'segment-tree': return <SegmentTreeVisualizer />;
            case 'recursion-tree': return <RecursionTreeVisualizer />;
            case 'backtracking': return <BacktrackingVisualizer />;
            case 'include-exclude': return <IncludeExcludeVisualizer />;
            default: return <div className="p-12 text-center text-slate-500 italic">Visualizer for {selectedAlg.title} coming soon...</div>;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-brand-600/20 border-t-brand-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-4rem)] flex flex-col sm:flex-row gap-8 overflow-hidden">
            <PremiumPaywall 
                isOpen={isPaywallOpen} 
                onClose={() => setIsPaywallOpen(false)} 
                featureName={paywallFeature || "Premium Visualizers"}
            />
            
            {/* Sidebar */}
            <div className="w-full sm:w-64 flex-shrink-0 flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-2">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-black text-slate-100 uppercase tracking-tighter">Patterns</h2>
                    <span className="text-[10px] bg-brand-500/10 text-brand-400 px-2 py-1 rounded-full font-black border border-brand-500/20">{algorithms.length} found</span>
                </div>
                <div className="space-y-4">
                    {Object.entries(groupedAlgorithms).map(([category, algs]) => (
                        <div key={category} className="space-y-1">
                            <button
                                onClick={() => toggleCategory(category)}
                                className="w-full flex justify-between items-center text-left px-2 py-2 text-sm font-black text-slate-400 uppercase tracking-widest hover:text-slate-200 transition-colors focus:outline-none"
                            >
                                <span>{category}</span>
                                <span className={`transform transition-transform text-xs ${expandedCategories[category] !== false ? '' : '-rotate-90'}`}>▼</span>
                            </button>
                            <AnimatePresence>
                                {expandedCategories[category] !== false && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="space-y-1 overflow-hidden ml-2 border-l-2 border-slate-800 pl-2"
                                    >
                                        {algs.map((alg) => {
                                            const isFree = FREE_ALGS.includes(alg.name);
                                            const isLocked = !isPremium && !isFree;
                                            return (
                                                <button
                                                    key={alg.name}
                                                    onClick={() => handleSelectAlg(alg)}
                                                    className={`w-full text-left px-4 py-2 text-sm rounded-lg font-bold transition-all border flex items-center justify-between group ${selectedAlg?.name === alg.name
                                                        ? 'bg-brand-600/20 text-brand-400 border-brand-500/40 shadow-lg'
                                                        : 'text-slate-500 border-transparent hover:bg-brand-500/5 hover:text-slate-300'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <span>{alg.title}</span>
                                                        {isFree && !isPremium && (
                                                            <span className="text-[8px] font-black bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full border border-emerald-500/30 whitespace-nowrap">🟢 FREE</span>
                                                        )}
                                                    </div>
                                                    {isLocked && (
                                                        <span className="opacity-40 group-hover:opacity-100 transition-opacity">🔒</span>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-2">
                <AnimatePresence mode="wait">
                    {selectedAlg && (
                        <motion.div
                            key={selectedAlg.name}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                                <div>
                                    <h1 className="text-4xl font-black text-slate-100 tracking-tight">{selectedAlg.title}</h1>
                                    <p className="text-slate-400 mt-2 text-lg max-w-2xl">{selectedAlg.explanation}</p>
                                </div>
                                {selectedAlg.exampleProblem && (
                                    <a
                                        href={selectedAlg.exampleProblem.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="btn-secondary text-sm px-4 py-2 flex items-center gap-2 border-dashed"
                                    >
                                        🚀 Solve: {selectedAlg.exampleProblem.title}
                                    </a>
                                )}
                            </div>

                            {/* Visualizer Container */}
                            <div className="card glass min-h-[400px] flex flex-col border-brand-500/10 relative overflow-hidden bg-brand-500/5">
                                <div className="absolute top-0 left-0 p-4 z-10">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-500 opacity-50">Interactive Sandbox</span>
                                </div>
                                {renderVisualizer()}
                            </div>

                            {/* Steps / Description */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {selectedAlg.steps.map((step, i) => (
                                    <div key={i} className="p-4 bg-brand-500/5 rounded-xl border border-brand-500/10">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="w-6 h-6 rounded-full bg-brand-600 flex items-center justify-center text-[10px] font-black">{i + 1}</span>
                                            <h3 className="font-bold text-slate-200">{step.label}</h3>
                                        </div>
                                        <p className="text-xs text-slate-500 leading-relaxed">{step.description}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Suggestion Box */}
                <SuggestionForm />
            </div>
        </div>
    );
}
