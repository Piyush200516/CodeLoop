import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef } from 'react';

const TYPE_COLORS = {
    declaration: 'text-blue-400',
    assignment: 'text-amber-400',
    loop: 'text-purple-400',
    branch: 'text-cyan-400',
    return: 'text-rose-400',
    output: 'text-emerald-400',
    general: 'text-slate-400',
};

const TYPE_ICONS = {
    declaration: '📦',
    assignment: '✏️',
    loop: '🔄',
    branch: '🔀',
    return: '↩️',
    output: '📤',
    general: '▶️',
};

export default function MemoryPanel({ variables, changedVars, output }) {
    const entries = Object.entries(variables);
    const prevRef = useRef({});

    useEffect(() => {
        prevRef.current = variables;
    });

    function getValueColor(val) {
        if (val === null || val === undefined) return 'text-slate-500';
        if (typeof val === 'boolean') return val ? 'text-emerald-400' : 'text-rose-400';
        if (typeof val === 'number') return 'text-amber-400';
        if (typeof val === 'string') {
            if (val.startsWith('[Function')) return 'text-purple-400';
            return 'text-emerald-400';
        }
        if (Array.isArray(val)) return 'text-cyan-400';
        return 'text-slate-300';
    }

    function formatDisplay(val) {
        if (val === undefined) return 'undefined';
        if (val === null) return 'null';
        if (typeof val === 'string' && val.startsWith('[Function')) return val;
        if (typeof val === 'string') return `"${val}"`;
        if (Array.isArray(val)) return `[${val.join(', ')}]`;
        if (typeof val === 'object') return JSON.stringify(val);
        return String(val);
    }

    return (
        <div className="flex flex-col gap-4">
            {/* Variables */}
            <div>
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">
                    🧠 Memory / Variables
                </h3>
                <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }}>
                    {entries.length === 0 && (
                        <p className="text-xs text-slate-600 italic px-2">No variables yet...</p>
                    )}
                    <AnimatePresence mode="popLayout">
                        {entries.map(([name, val]) => {
                            const isChanged = changedVars.includes(name);
                            return (
                                <motion.div
                                    key={name}
                                    layout
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{
                                        opacity: 1,
                                        x: 0,
                                        backgroundColor: isChanged
                                            ? 'rgba(16, 185, 129, 0.15)'
                                            : 'rgba(15, 23, 42, 0.4)',
                                    }}
                                    exit={{ opacity: 0, x: 10 }}
                                    transition={{ duration: 0.3 }}
                                    className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg border text-xs font-mono"
                                    style={{
                                        borderColor: isChanged
                                            ? 'rgba(16, 185, 129, 0.4)'
                                            : 'var(--border-color)',
                                    }}
                                >
                                    <span className="text-slate-300 font-semibold">{name}</span>
                                    <span className={`truncate max-w-[120px] font-bold ${getValueColor(val)}`}>
                                        {formatDisplay(val)}
                                    </span>
                                    {isChanged && (
                                        <motion.span
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="text-emerald-400 text-[10px] flex-shrink-0"
                                        >
                                            ✦ changed
                                        </motion.span>
                                    )}
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            </div>

            {/* Output console */}
            {output && output.length > 0 && (
                <div>
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">
                        📤 Console Output
                    </h3>
                    <div
                        className="rounded-xl border border-[var(--border-color)] bg-black/30 p-3 space-y-1 max-h-32 overflow-y-auto font-mono text-xs"
                        style={{ scrollbarWidth: 'thin' }}
                    >
                        <AnimatePresence mode="popLayout">
                            {output.map((line, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-emerald-400"
                                >
                                    <span className="text-slate-600 mr-2">&gt;</span>
                                    {line}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            )}
        </div>
    );
}
