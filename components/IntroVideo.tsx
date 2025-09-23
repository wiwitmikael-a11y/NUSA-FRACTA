import React, { useState, useRef, useEffect, useCallback } from 'react';
import soundService from '../services/soundService';

interface IntroVideoProps {
    onFinished: () => void;
}

const IntroVideo: React.FC<IntroVideoProps> = ({ onFinished }) => {
    const [isFadingOut, setIsFadingOut] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    const handleVideoEnd = useCallback(() => {
        if (isFadingOut) return; // Prevent multiple triggers
        soundService.initialize(); // Initialize sound
        setIsFadingOut(true);
        setTimeout(() => {
            onFinished();
        }, 1000); // Match CSS transition duration
    }, [onFinished, isFadingOut]);

    const handleSkip = useCallback(() => {
        handleVideoEnd();
    }, [handleVideoEnd]);

    useEffect(() => {
        const videoElement = videoRef.current;
        if (videoElement) {
            videoElement.play().catch(error => {
                console.warn("Autoplay was prevented. User must interact to start.", error);
                // If autoplay fails, we wait for a click via handleSkip.
            });
            
            videoElement.addEventListener('ended', handleVideoEnd);

            return () => {
                videoElement.removeEventListener('ended', handleVideoEnd);
            };
        }
    }, [handleVideoEnd]);

    return (
        <div 
            className={`intro-container ${isFadingOut ? 'fade-out' : ''}`}
            onClick={handleSkip}
        >
            <video
                ref={videoRef}
                src="https://raw.githubusercontent.com/wiwitmikael-a11y/nusa-FRACTA-assets/main/intro_nusafracta.mp4"
                muted
                playsInline
                preload="auto"
            />
        </div>
    );
};

export default IntroVideo;