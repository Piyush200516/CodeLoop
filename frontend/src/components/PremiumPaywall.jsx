import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';
import { useTheme } from '../context/ThemeContext';

const PremiumPaywall = ({ isOpen, onClose, featureName, description }) => {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    useEffect(() => {
        if (isOpen && featureName) {
            // Track paywall hit
            api.post('/analytics/track-interaction', {
                featureName,
                interactionType: 'paywall_view'
            }).catch(console.error);
        }
    }, [isOpen, featureName]);

    // Prevent scrolling on body when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    if (!isOpen) return null;

    const modalContent = (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 cursor-pointer"
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl transition-colors duration-300 my-auto"
                style={{
                    backgroundColor: 'var(--card-bg)',
                    border: '1px solid var(--border-color)',
                    maxHeight: 'calc(100vh - 2rem)'
                }}
            >
                {/* Decorative background Elements */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-500 to-transparent" />
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-500/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl" />

                <div className="p-6 sm:p-10 text-center relative z-10 overflow-y-auto max-h-[calc(100vh-2rem)] custom-scrollbar">
                    {/* Animated icon */}
                    <motion.div
                        initial={{ scale: 0.5, rotate: -10 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 200 }}
                        className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-brand-500/20 to-indigo-500/20 border border-brand-500/30 mb-4 sm:mb-6 shadow-lg shadow-brand-500/10"
                    >
                        <span className="text-3xl sm:text-4xl">💎</span>
                    </motion.div>

                    {/* Emotional progress headline */}
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-sm sm:text-base font-bold mb-2 tracking-wide"
                        style={{ color: 'var(--brand-color, #0ea5e9)' }}
                    >
                        You're making great progress 🚀 Don't let limits slow you down.
                    </motion.p>

                    <h2 className="text-2xl sm:text-3xl font-black mb-2 tracking-tight" style={{ color: 'var(--text-primary)' }}>
                        Go <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-indigo-400 to-purple-400">Premium</span> ✨
                    </h2>

                    <p className="text-sm sm:text-base mb-6 sm:mb-8 leading-relaxed max-w-md mx-auto" style={{ color: 'var(--text-secondary)' }}>
                        {featureName ? (
                            <>Unlock <span className="font-black text-brand-400">{featureName}</span> and supercharge your interview prep. Top candidates don't just practice — they practice <em>smarter</em>.</>
                        ) : (
                            description || "Top candidates don't just practice — they practice smarter. Get the tools that make the difference."
                        )}
                    </p>

                    {/* Feature cards */}
                    <div className="grid grid-cols-1 gap-2.5 sm:gap-3 mb-6 sm:mb-8 text-left">
                        {[
                            {
                                icon: '🧠',
                                title: '45+ Algorithm Visualizers',
                                desc: 'DFS, BFS, Dijkstra, DP, Backtracking & more — see every step in action'
                            },
                            {
                                icon: '⚡',
                                title: 'Unlimited Code Execution',
                                desc: 'Paste any code, watch it execute line-by-line with call stack & memory view'
                            },
                            {
                                icon: '📊',
                                title: 'Progress Analytics & Insights',
                                desc: 'Track your weak topics, difficulty breakdown & weekly progress like a pro'
                            },
                            {
                                icon: '🔁',
                                title: 'Smart Spaced Revision',
                                desc: 'Never forget a pattern again — science-backed revision scheduling'
                            },
                            {
                                icon: '🏆',
                                title: 'Priority Feature Requests',
                                desc: 'Suggest new visualizers and get them built first'
                            },
                        ].map((item, i) => (
                            <motion.div
                                initial={{ opacity: 0, x: -15 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.08 * i + 0.15 }}
                                key={i}
                                className="flex items-start gap-3 p-3 sm:p-3.5 rounded-xl transition-all border group hover:border-brand-500/30"
                                style={{
                                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.015)',
                                    borderColor: 'var(--border-color)'
                                }}
                            >
                                <span className="text-lg sm:text-xl mt-0.5 group-hover:scale-110 transition-transform">{item.icon}</span>
                                <div>
                                    <span className="text-xs sm:text-sm font-black block" style={{ color: 'var(--text-primary)' }}>{item.title}</span>
                                    <span className="text-[10px] sm:text-xs leading-tight block mt-0.5" style={{ color: 'var(--text-secondary)', opacity: 0.7 }}>{item.desc}</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>



                    {/* CTA Buttons */}
                    <div className="flex flex-col gap-3">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                                api.post('/analytics/track-interaction', {
                                    featureName: featureName || 'general',
                                    interactionType: 'click_locked'
                                }).catch(console.error);
                                onClose();
                                navigate('/paywall');
                            }}
                            className="btn-primary w-full py-4 text-base sm:text-lg font-black tracking-wide shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2"
                        >
                            🚀 Unlock Premium Now
                        </motion.button>
                        <button
                            onClick={onClose}
                            className="w-full bg-transparent hover:bg-black/5 dark:hover:bg-white/5 font-bold py-3 px-6 rounded-2xl transition-all text-sm"
                            style={{ color: 'var(--text-secondary)' }}
                        >
                            I'll upgrade later
                        </button>
                    </div>

                    <p className="mt-5 sm:mt-6 text-[10px] uppercase tracking-[0.15em] font-black flex items-center justify-center gap-1.5" style={{ color: 'var(--text-secondary)', opacity: 0.5 }}>
                        <span>🔒</span> Secure payment • Instant access
                    </p>
                </div>
            </motion.div>
        </div>
    );

    return createPortal(modalContent, document.body);
};

export default PremiumPaywall;
