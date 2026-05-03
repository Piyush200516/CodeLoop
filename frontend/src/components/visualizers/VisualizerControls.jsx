import React from 'react';
import { Play, Pause, SkipForward, RotateCcw } from 'lucide-react';

export default function VisualizerControls({
    onNext,
    onReset,
    onTogglePlay,
    isPlaying,
    status
}) {
    const isOver = status === 'Over' || status === 'Found';

    return (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-8 p-4 bg-[var(--viz-bg-inactive)]/30 backdrop-blur-md rounded-2xl border border-white/5">
            {/* Playback Controls */}
            <div className="flex items-center gap-3">
                <button 
                    onClick={onTogglePlay}
                    disabled={isOver}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all duration-300 ${
                        isPlaying 
                        ? 'bg-amber-500/20 text-amber-500 border border-amber-500/50 hover:bg-amber-500/30' 
                        : 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/50 hover:bg-emerald-500/30'
                    } disabled:opacity-30 disabled:cursor-not-allowed shadow-lg`}
                >
                    {isPlaying ? (
                        <>
                            <Pause size={18} fill="currentColor" />
                            <span>Pause</span>
                        </>
                    ) : (
                        <>
                            <Play size={18} fill="currentColor" />
                            <span>Autoplay</span>
                        </>
                    )}
                </button>

                <button 
                    onClick={onNext} 
                    disabled={isOver || isPlaying}
                    className="flex items-center gap-2 bg-brand-600/20 text-brand-400 border border-brand-500/50 px-6 py-2.5 rounded-xl font-bold hover:bg-brand-600/30 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed shadow-lg"
                >
                    <SkipForward size={18} fill="currentColor" />
                    <span>{status === 'Wait' ? 'Start' : 'Next Step'}</span>
                </button>
                
                <button 
                    onClick={onReset} 
                    className="flex items-center gap-2 bg-slate-700/30 text-slate-400 border border-slate-600/50 px-6 py-2.5 rounded-xl font-bold hover:bg-slate-700/50 transition-all duration-300 shadow-lg"
                >
                    <RotateCcw size={18} />
                    <span>Reset</span>
                </button>
            </div>
        </div>
    );
}
