import { useState, useEffect, useRef } from 'react';
import { playSound, stopSound } from '../services/soundService';

export const useTypewriter = (text: string, speed: number = 20, onComplete?: () => void) => {
    const [displayText, setDisplayText] = useState('');
    // Use ref to hold the latest onComplete callback without re-triggering the effect.
    const onCompleteRef = useRef(onComplete);
    onCompleteRef.current = onComplete;

    useEffect(() => {
        // Reset only when the main source text changes.
        setDisplayText('');

        if (text) {
            // Start the typewriter sound loop
            playSound('typewriter_loop', true);

            const intervalId = setInterval(() => {
                // Use functional update to get the latest state and avoid race conditions.
                setDisplayText(current => {
                    // Stop if we've reached the end.
                    if (current.length === text.length) {
                        clearInterval(intervalId);
                        stopSound('typewriter_loop'); // Stop sound on complete
                        // Call callback from ref.
                        if (onCompleteRef.current) {
                            onCompleteRef.current();
                        }
                        return current;
                    }
                    // Add the next character using substring for reliability.
                    return text.substring(0, current.length + 1);
                });
            }, speed);

            // Cleanup function to clear the interval.
            return () => {
                clearInterval(intervalId);
                stopSound('typewriter_loop'); // Also stop sound on cleanup
            };
        } else {
             // If text is empty from the start, call onComplete immediately.
            if (onCompleteRef.current) {
                onCompleteRef.current();
            }
        }
    // This effect now only depends on text and speed, which are stable during the typing.
    }, [text, speed]);

    return displayText;
};
