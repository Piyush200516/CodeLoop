import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook to manage autoplay functionality for visualizers.
 * 
 * @param {Function} handleNext - The function to call for each step.
 * @param {boolean} isFinished - Boolean indicating if the algorithm has finished.
 * @returns {Object} Autoplay state and controls.
 */
export default function useAutoplay(handleNext, isFinished) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [speed, setSpeed] = useState(1500);

    const togglePlay = useCallback(() => {
        if (!isFinished) {
            setIsPlaying(prev => !prev);
        }
    }, [isFinished]);

    const pause = useCallback(() => {
        setIsPlaying(false);
    }, []);

    const resetAutoplay = useCallback(() => {
        setIsPlaying(false);
    }, []);

    useEffect(() => {
        let interval;
        if (isPlaying && !isFinished) {
            interval = setInterval(() => {
                handleNext();
            }, speed);
        } else {
            setIsPlaying(false);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isPlaying, isFinished, speed, handleNext]);

    return {
        isPlaying,
        speed,
        setSpeed,
        togglePlay,
        pause,
        resetAutoplay
    };
}
