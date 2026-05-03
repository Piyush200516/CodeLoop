import { motion, AnimatePresence } from 'framer-motion';

export default function DataStructureVisualizer({ variables, changedVars }) {
    // Filter for visualizable variables (arrays and objects with content)
    const visualizable = Object.entries(variables).filter(([key, val]) => {
        return Array.isArray(val) || (typeof val === 'object' && val !== null && Object.keys(val).length > 0);
    });

    if (visualizable.length === 0) return null;

    return (
        <div className="space-y-6 py-2">
            <AnimatePresence>
                {visualizable.map(([name, value]) => (
                    <motion.div
                        key={name}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--input-bg)]/30 backdrop-blur-sm"
                    >
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                            {name} ({Array.isArray(value) ? 'Array' : 'Object'})
                        </h4>

                        {Array.isArray(value) ? (
                            <div className="flex flex-wrap gap-2 items-end min-h-[60px]">
                                {value.map((item, idx) => {
                                    const isChanged = changedVars.includes(name); // simple heuristic
                                    return (
                                        <motion.div
                                            key={`${name}-${idx}`}
                                            layout
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ 
                                                scale: 1, 
                                                opacity: 1,
                                                backgroundColor: isChanged ? 'rgba(var(--brand-rgb), 0.1)' : 'rgba(255,255,255,0.03)'
                                            }}
                                            className={`min-w-[40px] h-10 rounded-lg border border-[var(--border-color)] flex items-center justify-center font-mono text-sm shadow-sm transition-colors ${
                                                isChanged ? 'border-brand-500/50 text-brand-400' : 'text-slate-300'
                                            }`}
                                        >
                                            {String(item)}
                                        </motion.div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {Object.entries(value).map(([vKey, vVal]) => (
                                    <div key={vKey} className="px-3 py-2 rounded-lg bg-black/20 border border-white/5 flex flex-col gap-0.5">
                                        <span className="text-[9px] text-slate-500 font-bold uppercase">{vKey}</span>
                                        <span className="text-xs text-slate-300 font-mono truncate">{String(vVal)}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
