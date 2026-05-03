import { motion, AnimatePresence } from 'framer-motion';

const FRAME_COLORS = [
    'border-brand-500/40 bg-brand-500/10 text-brand-400',
    'border-purple-500/40 bg-purple-500/10 text-purple-400',
    'border-cyan-500/40 bg-cyan-500/10 text-cyan-400',
    'border-amber-500/40 bg-amber-500/10 text-amber-400',
    'border-emerald-500/40 bg-emerald-500/10 text-emerald-400',
];

export default function CallStackPanel({ callStack }) {
    // Render bottom (global) first, top last — like a real stack diagram
    const reversed = [...callStack].reverse();

    return (
        <div>
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">
                📚 Call Stack
            </h3>

            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }}>
                <AnimatePresence mode="popLayout">
                    {reversed.map((frame, idx) => {
                        const colorIdx = (reversed.length - 1 - idx) % FRAME_COLORS.length;
                        const isTop = idx === 0;
                        return (
                            <motion.div
                                key={`${frame}-${idx}`}
                                layout
                                initial={{ opacity: 0, scaleY: 0.6, y: -8 }}
                                animate={{ opacity: 1, scaleY: 1, y: 0 }}
                                exit={{ opacity: 0, scaleY: 0.6, y: -8 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                                className={`flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-mono font-semibold ${FRAME_COLORS[colorIdx]}`}
                            >
                                <span>{frame}()</span>
                                {isTop && (
                                    <motion.span
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-[10px] opacity-70 flex-shrink-0"
                                    >
                                        ← top
                                    </motion.span>
                                )}
                            </motion.div>
                        );
                    })}
                </AnimatePresence>

                {callStack.length === 0 && (
                    <p className="text-xs text-slate-600 italic px-2">Empty stack</p>
                )}
            </div>

            {/* Stack arrow indicator */}
            <div className="flex items-center gap-2 mt-2 px-1">
                <div className="flex-1 h-px bg-gradient-to-r from-brand-500/30 to-transparent" />
                <span className="text-[10px] text-slate-600">LIFO</span>
            </div>
        </div>
    );
}
