import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

// ── CONFIG ──────────────────────────────────────────────────────────────────
// Option 1: local video → put demo.mp4 inside frontend/public/
// Option 2: YouTube embed → set YOUTUBE_ID to e.g. "dQw4w9WgXcQ"
const YOUTUBE_ID = ''; // set a YouTube video ID here, or leave empty to use local video
const LOCAL_VIDEO = '/demo.mp4';
// ────────────────────────────────────────────────────────────────────────────

export default function DemoPage() {
    const navigate = useNavigate();
    const videoRef = useRef(null);
    const [unlocked, setUnlocked] = useState(true);
    const [watchedSeconds, setWatchedSeconds] = useState(0);

    const handleTimeUpdate = () => {
        if (!videoRef.current) return;
        const current = Math.floor(videoRef.current.currentTime);
        setWatchedSeconds(current);
    };

    const handleSkip = () => setUnlocked(true);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16 relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-brand-600/10 rounded-full blur-[140px] opacity-40" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-5xl w-full space-y-8 relative z-10"
            >
                {/* Header */}
                <div className="text-center space-y-3">
                    <span className="text-xs font-black uppercase tracking-[0.25em] text-brand-500 opacity-70">
                        Welcome to CodeRecall
                    </span>
                    <h1 className="text-4xl sm:text-5xl font-black text-slate-100 tracking-tight">
                        Watch How This <span className="text-brand-500">App Works</span>
                    </h1>
                    <p className="text-slate-400 text-lg max-w-xl mx-auto">
                        See how CodeRecall helps you master LeetCode with spaced repetition, recall mode, and interactive visualizers.
                    </p>
                </div>

                {/* Video player */}
                <div className="card glass border-brand-500/20 overflow-hidden rounded-2xl shadow-2xl">
                    {YOUTUBE_ID ? (
                        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                            <iframe
                                className="absolute inset-0 w-full h-full"
                                src={`https://www.youtube.com/embed/${YOUTUBE_ID}?rel=0&modestbranding=1&autoplay=1`}
                                title="CodeRecall Demo"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        </div>
                    ) : (
                        <video
                            ref={videoRef}
                            controls
                            autoPlay
                            onTimeUpdate={handleTimeUpdate}
                            onEnded={() => setUnlocked(true)}
                            className="w-full max-h-[560px] object-contain bg-slate-950"
                        >
                            <source src={LOCAL_VIDEO} type="video/mp4" />
                            <p className="text-slate-400 p-8 text-center">
                                Your browser does not support HTML5 video. <a href={LOCAL_VIDEO} className="text-brand-500 hover:text-brand-400 underline">Download the demo</a>.
                            </p>
                        </video>
                    )}
                </div>



                {/* Feature chips */}
                <div className="flex flex-wrap gap-3 justify-center">
                    {['📊 Smart Dashboard', '🧠 Recall Mode', '🔮 45+ Visualizers', '📝 Personal Notes', '📅 Auto-Scheduling', '🔗 LeetCode Links'].map(f => (
                        <span key={f} className="text-xs font-bold text-slate-300 bg-[var(--surface-accent)] border border-[var(--border-muted)] px-3 py-1.5 rounded-full">
                            {f}
                        </span>
                    ))}
                </div>

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <button
                        onClick={() => navigate('/')}
                        className="btn-primary px-12 py-4 text-base font-black uppercase tracking-widest shadow-xl shadow-brand-600/30 transition-all duration-300 opacity-100 scale-100"
                    >
                        🔓 Continue to Dashboard ⚡
                    </button>
                </div>

                <p className="text-center text-xs text-slate-500">
                    Explore core features for free. Upgrade only when you need advanced tools.
                </p>
            </motion.div>
        </div>
    );
}
