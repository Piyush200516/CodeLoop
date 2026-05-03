import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import CodeEditor from '../components/codeVisualizer/CodeEditor';
import ControlBar from '../components/codeVisualizer/ControlBar';
import VisualizerPanel from '../components/codeVisualizer/VisualizerPanel';
import { generateSteps } from '../components/codeVisualizer/ExecutionEngine';
import { useAuth } from '../context/AuthContext';
import PremiumPaywall from '../components/PremiumPaywall';
import api from '../api/axiosInstance';

const DEFAULT_CODE = ``;

export default function CodeVisualizerPage() {
    // ── Editor state ──
    const [code, setCode] = useState(DEFAULT_CODE);

    // ── Execution state ──
    const [steps, setSteps] = useState([]);
    const [currentStep, setCurrentStep] = useState(0);
    const [error, setError] = useState(null);
    const [hasRun, setHasRun] = useState(false);

    // ── Playback state ──
    const [isPlaying, setIsPlaying] = useState(false);
    const [speed, setSpeed] = useState(600); // ms per step
    const timerRef = useRef(null);

    // ── UI state ──
    const [language, setLanguage] = useState('javascript');

    const { user } = useAuth();
    const [isPaywallOpen, setIsPaywallOpen] = useState(false);
    const [paywallReason, setPaywallReason] = useState('');

    // ─── Autoplay ───────────────────────────────────────────────────────────
    const stopPlay = useCallback(() => {
        setIsPlaying(false);
        if (timerRef.current) clearInterval(timerRef.current);
    }, []);

    useEffect(() => {
        if (!isPlaying) return;

        timerRef.current = setInterval(() => {
            setCurrentStep((prev) => {
                if (prev >= steps.length - 1) {
                    stopPlay();
                    return prev;
                }
                return prev + 1;
            });
        }, speed);

        return () => clearInterval(timerRef.current);
    }, [isPlaying, speed, steps.length, stopPlay]);

    // ─── Controls ────────────────────────────────────────────────────────────
    const handleRun = async () => {
        stopPlay();
        setError(null);

        try {
            // Check usage limit on backend
            const { data } = await api.post('/usage/code-execution');
            
            // If backend allows (success: true), proceed with local generation
            const result = generateSteps(code, language);
            if (result.error) {
                setError(result.error);
                setSteps([]);
                setCurrentStep(0);
                setHasRun(false);
                return;
            }
            setSteps(result.steps);
            setCurrentStep(0);
            setHasRun(true);
        } catch (err) {
            if (err.response?.status === 403) {
                setPaywallReason('You\'ve reached your daily limit of 1 execution. Upgrade to Premium for unlimited step-by-step tracing.');
                setIsPaywallOpen(true);
            } else {
                setError('Failed to verify usage limits. Please try again.');
            }
        }
    };

    const handleStepForward = () => {
        if (currentStep < steps.length - 1) setCurrentStep((p) => p + 1);
    };

    const handleStepBackward = () => {
        if (currentStep > 0) setCurrentStep((p) => p - 1);
    };

    const handleTogglePlay = () => {
        if (isPlaying) {
            stopPlay();
        } else {
            if (currentStep >= steps.length - 1) setCurrentStep(0);
            setIsPlaying(true);
        }
    };

    const handleReset = () => {
        stopPlay();
        setCurrentStep(0);
        setSteps([]);
        setError(null);
        setHasRun(false);
    };


    const currentStepData = steps[currentStep] ?? null;
    const hasSteps = hasRun && steps.length > 0;

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden bg-[var(--bg-primary)]">
            <PremiumPaywall 
                isOpen={isPaywallOpen} 
                onClose={() => setIsPaywallOpen(false)} 
                featureName="Unlimited Code Visualization"
                description={paywallReason}
            />
            {/* ── Page Header ── */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-[var(--border-color)] bg-[var(--card-bg)] flex-shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center text-xl">
                        🧪
                    </div>
                    <div>
                        <h1 className="text-lg font-black text-slate-100 tracking-tight leading-none">
                            Code <span className="text-brand-400">Visualizer</span>
                        </h1>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                            Step-by-step execution · Sandboxed · No eval
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Language Selector */}
                    <div className="flex items-center gap-2">
                        <select
                            value={language}
                            onChange={(e) => {
                                setLanguage(e.target.value);
                                handleReset();
                            }}
                            className="bg-[var(--input-bg)] text-slate-300 text-xs font-bold px-3 py-1.5 rounded-lg border border-[var(--border-color)] outline-none focus:border-brand-500/50 transition-all cursor-pointer"
                        >
                            <option value="javascript">JavaScript</option>
                            <option value="python">Python</option>
                            <option value="cpp">C++</option>
                            <option value="c">C</option>
                            <option value="java">Java</option>
                        </select>
                        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] text-xs font-bold text-slate-400">
                            <span className={`w-2 h-2 rounded-full inline-block ${
                                language === 'javascript' ? 'bg-amber-400' : 
                                language === 'python' ? 'bg-blue-400' : 
                                'bg-slate-400'}`} />
                            {language.toUpperCase()}
                        </div>
                    </div>

                </div>
            </div>

            {/* ── Main Split Layout ── */}
            <div className="flex flex-1 min-h-0 overflow-hidden">
                {/* ──── Left Panel: Editor ──── */}
                <div className="flex flex-col w-full lg:w-1/2 xl:w-[55%] border-r border-[var(--border-color)] min-h-0">
                    {/* Editor takes all remaining space above controls */}
                    <div className="flex-1 min-h-0">
                        <CodeEditor
                            code={code}
                            onChange={setCode}
                            language={language}
                        />
                    </div>

                    {/* Control bar pinned to bottom of left panel */}
                    <div className="flex-shrink-0">
                        <ControlBar
                            onRun={handleRun}
                            onStepForward={handleStepForward}
                            onStepBackward={handleStepBackward}
                            onTogglePlay={handleTogglePlay}
                            onReset={handleReset}
                            isPlaying={isPlaying}
                            currentStep={currentStep}
                            totalSteps={steps.length}
                            speed={speed}
                            onSpeedChange={setSpeed}
                            hasSteps={hasSteps}
                            error={error}
                        />
                    </div>
                </div>

                {/* ──── Right Panel: Visualization ──── */}
                <div className="hidden lg:flex flex-col flex-1 min-h-0 overflow-hidden relative">
                    {/* Panel header */}
                    <div className="flex items-center gap-2 px-5 py-2 border-b border-[var(--border-color)] bg-[var(--card-bg)] flex-shrink-0">
                        <span className="text-[10px] font-black text-brand-500 uppercase tracking-[0.25em] opacity-70">
                            Interactive Sandbox
                        </span>
                        {hasSteps && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="ml-auto flex items-center gap-1.5"
                            >
                                <span
                                    className={`w-2 h-2 rounded-full ${
                                        isPlaying ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                                    }`}
                                />
                                <span className="text-[10px] text-slate-500 font-mono">
                                    {isPlaying ? 'Playing...' : 'Paused'}
                                </span>
                            </motion.div>
                        )}
                    </div>

                    {/* Visualization content */}
                    <div className="flex-1 min-h-0 overflow-auto" style={{ scrollbarWidth: 'thin' }}>
                        <VisualizerPanel
                            code={code}
                            step={currentStepData}
                            currentStep={currentStep}
                            totalSteps={steps.length}
                            showExplain={true}
                            hasSteps={hasSteps}
                            error={error}
                        />
                    </div>
                </div>
            </div>

            {/* ── Mobile: Visualization below editor (lg hidden above) ── */}
            <div className="lg:hidden flex-shrink-0 border-t border-[var(--border-color)] max-h-64 overflow-y-auto bg-[var(--card-bg)]" style={{ scrollbarWidth: 'thin' }}>
                <div className="px-4 py-2 border-b border-[var(--border-color)]">
                    <span className="text-[10px] font-black text-brand-500 uppercase tracking-widest opacity-70">Visualization</span>
                </div>
                <VisualizerPanel
                    code={code}
                    step={currentStepData}
                    currentStep={currentStep}
                    totalSteps={steps.length}
                    showExplain={true}
                    hasSteps={hasSteps}
                    error={error}
                />
            </div>
        </div>
    );
}
