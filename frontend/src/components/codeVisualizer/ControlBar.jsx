export default function ControlBar({
    onRun,
    onStepForward,
    onStepBackward,
    onTogglePlay,
    onReset,
    isPlaying,
    currentStep,
    totalSteps,
    speed,
    onSpeedChange,
    hasSteps,
    error,
}) {
    const progress = totalSteps > 1 ? ((currentStep) / (totalSteps - 1)) * 100 : 0;

    return (
        <div className="border-t border-[var(--border-color)] bg-[var(--card-bg)] px-4 py-3 space-y-3">
            {/* Progress bar */}
            {hasSteps && (
                <div className="relative h-1.5 bg-dark-700/60 rounded-full overflow-hidden">
                    <div
                        className="absolute left-0 top-0 h-full bg-brand-500 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            )}

            {/* Buttons row */}
            <div className="flex items-center gap-2 flex-wrap">
                {/* Run */}
                <button
                    onClick={onRun}
                    disabled={isPlaying}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold transition-all shadow-lg shadow-brand-600/20 active:scale-95"
                    id="cv-run-btn"
                >
                    <span>▶</span> Run
                </button>

                {/* Step Backward */}
                <button
                    onClick={onStepBackward}
                    disabled={!hasSteps || currentStep === 0 || isPlaying}
                    className="flex items-center gap-1 px-3 py-2 rounded-xl btn-secondary text-sm font-bold disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
                    id="cv-step-back-btn"
                    title="Step Backward"
                >
                    ⏮ Back
                </button>

                {/* Step Forward */}
                <button
                    onClick={onStepForward}
                    disabled={!hasSteps || currentStep >= totalSteps - 1 || isPlaying}
                    className="flex items-center gap-1 px-3 py-2 rounded-xl btn-secondary text-sm font-bold disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
                    id="cv-step-fwd-btn"
                    title="Step Forward"
                >
                    Next ⏭
                </button>

                {/* Play / Pause */}
                <button
                    onClick={onTogglePlay}
                    disabled={!hasSteps || currentStep >= totalSteps - 1}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed ${
                        isPlaying
                            ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/30'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30'
                    }`}
                    id="cv-play-pause-btn"
                >
                    {isPlaying ? '⏸ Pause' : '▷ Auto-Play'}
                </button>

                {/* Reset */}
                <button
                    onClick={onReset}
                    disabled={!hasSteps && !error}
                    className="flex items-center gap-1 px-3 py-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 text-sm font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
                    id="cv-reset-btn"
                >
                    ↺ Reset
                </button>

                {/* Step counter */}
                {hasSteps && (
                    <span className="ml-auto text-xs text-slate-500 font-mono tabular-nums">
                        Step {currentStep + 1} / {totalSteps}
                    </span>
                )}
            </div>

            {/* Speed slider */}
            <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500 whitespace-nowrap">🐢 Slow</span>
                <input
                    type="range"
                    min={100}
                    max={2000}
                    step={100}
                    value={2100 - speed}   // invert so right = fast
                    onChange={(e) => onSpeedChange(2100 - Number(e.target.value))}
                    className="flex-1 accent-brand-500 h-1.5 cursor-pointer"
                    id="cv-speed-slider"
                />
                <span className="text-xs text-slate-500 whitespace-nowrap">⚡ Fast</span>
            </div>
        </div>
    );
}
