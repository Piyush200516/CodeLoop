import { motion, AnimatePresence } from 'framer-motion';
import MemoryPanel from './MemoryPanel';
import ExplainMode from './ExplainMode';
import DataStructureVisualizer from './DataStructureVisualizer';

// Line-by-line code mirror with active line highlight
function CodeMirror({ code, activeLine }) {
    const lines = code.split('\n');

    return (
        <div className="rounded-xl border border-[var(--border-color)] bg-black/40 overflow-hidden">
            <div
                className="overflow-y-auto font-mono text-xs leading-5"
                style={{ maxHeight: '220px', scrollbarWidth: 'thin' }}
            >
                {lines.map((line, idx) => {
                    const lineNum = idx + 1;
                    const isActive = lineNum === activeLine;
                    return (
                        <div
                            key={idx}
                            className={`flex items-start gap-3 px-3 py-0.5 transition-all duration-200 ${isActive
                                    ? 'bg-amber-500/20 border-l-2 border-amber-400'
                                    : 'border-l-2 border-transparent'
                                }`}
                        >
                            <span
                                className={`select-none w-5 text-right flex-shrink-0 ${isActive ? 'text-amber-400 font-bold' : 'text-slate-600'
                                    }`}
                            >
                                {lineNum}
                            </span>
                            <span
                                className={`flex-1 whitespace-pre ${isActive ? 'text-amber-100 font-semibold' : 'text-slate-400'
                                    }`}
                            >
                                {line || ' '}
                            </span>
                            {isActive && (
                                <motion.span
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex-shrink-0 text-[10px] text-amber-400 font-black"
                                >
                                    ◀ executing
                                </motion.span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default function VisualizerPanel({
    code,
    step,
    currentStep,
    totalSteps,
    showExplain,
    hasSteps,
    error,
}) {
    if (error) {
        return (
            <div className="flex flex-col h-full p-6 gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-red-500/40 bg-red-500/10 p-5 space-y-2"
                >
                    <div className="flex items-center gap-2">
                        <span className="text-xl">❌</span>
                        <h3 className="text-sm font-black text-red-400 uppercase tracking-wider">Error</h3>
                    </div>
                    <p className="text-sm text-red-300 font-mono leading-relaxed">{error}</p>
                    <p className="text-xs text-slate-500 mt-2">
                        Fix the issue in your code and click <strong className="text-slate-400">Run</strong> again.
                    </p>
                </motion.div>
            </div>
        );
    }

    if (!hasSteps) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-6 p-8 text-center">
                <div className="w-20 h-20 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-4xl">
                    🧪
                </div>
                <div>
                    <h3 className="text-xl font-black text-slate-300 mb-2">Ready to Visualize</h3>
                    <p className="text-sm text-slate-500 max-w-xs leading-relaxed">
                        Write or paste your code on the left, then click{' '}
                        <strong className="text-brand-400">Run</strong> to see it execute step-by-step.
                    </p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-left max-w-xs w-full">
                    {[
                        { icon: '📦', label: 'Variable tracking' },
                        { icon: '🔄', label: 'Loop visualization' },
                        { icon: '🔀', label: 'Branch tracing' },

                    ].map(({ icon, label }) => (
                        <div key={label} className="flex items-center gap-2 text-xs text-slate-500">
                            <span>{icon}</span> {label}
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full gap-4 p-5 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
            {/* Explain Mode */}
            {showExplain && (
                <ExplainMode step={step} currentStep={currentStep} totalSteps={totalSteps} />
            )}

            {/* Code Mirror */}
            <div>
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">
                    💻 Execution Trace
                </h3>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step?.line}
                        initial={{ opacity: 0.7 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.15 }}
                    >
                        <CodeMirror code={code} activeLine={step?.line ?? 0} />
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Dynamic Data Structure visualization */}
            <DataStructureVisualizer
                variables={step?.variables ?? {}}
                changedVars={step?.changedVars ?? []}
            />

            {/* Memory */}
            <div className="grid grid-cols-1 gap-4">
                <MemoryPanel
                    variables={step?.variables ?? {}}
                    changedVars={step?.changedVars ?? []}
                    output={step?.output ?? []}
                />
            </div>
        </div>
    );
}
