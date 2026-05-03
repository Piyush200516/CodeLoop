import { motion, AnimatePresence } from 'framer-motion';

const TYPE_ICONS = {
    declaration: '📦',
    assignment: '✏️',
    loop: '🔄',
    branch: '🔀',
    return: '↩️',
    output: '📤',
    general: '▶️',
};

const TYPE_LABELS = {
    declaration: 'Variable Declaration',
    assignment: 'Assignment',
    loop: 'Loop',
    branch: 'Conditional',
    return: 'Return',
    output: 'Console Output',
    general: 'Execution',
};

export default function ExplainMode({ step, currentStep, totalSteps }) {
    if (!step) return null;

    const icon = TYPE_ICONS[step.type] || '▶️';
    const label = TYPE_LABELS[step.type] || 'Execution';

    return (
        <div className="rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] p-4 space-y-3">
            <div className="flex items-center gap-2">
                <span className="text-lg">{icon}</span>
                <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</p>
                    <p className="text-xs text-slate-400">Step {currentStep + 1} of {totalSteps}</p>
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                    className="text-sm font-medium text-slate-200 leading-relaxed bg-brand-500/5 border border-brand-500/10 rounded-lg px-3 py-2"
                >
                    {step.explanation}
                </motion.div>
            </AnimatePresence>

            {step.line > 0 && (
                <p className="text-[10px] text-slate-600">
                    📍 Line {step.line}
                </p>
            )}
        </div>
    );
}
