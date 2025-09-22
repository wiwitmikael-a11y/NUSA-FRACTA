import React, { useState, useEffect } from 'react';

const loadingMessages = [
    "Menganalisis kemungkinan...",
    "Merangkai narasi...",
    "Menyelaraskan takdir...",
    "Memuat sekuens berikutnya...",
    "Memproses konsekuensi...",
];

const LoadingOverlay: React.FC = () => {
    const [message, setMessage] = useState(loadingMessages[0]);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // Cycle through messages every 2.5 seconds
        const messageInterval = setInterval(() => {
            setMessage(prevMessage => {
                const currentIndex = loadingMessages.indexOf(prevMessage);
                const nextIndex = (currentIndex + 1) % loadingMessages.length;
                return loadingMessages[nextIndex];
            });
        }, 2500);

        // Animate the progress bar
        const progressInterval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    return 100;
                }
                // This simulates a non-linear, more "realistic" loading
                const increment = Math.random() * 5;
                return Math.min(prev + increment, 100);
            });
        }, 100); // Update progress frequently for a smoother look

        return () => {
            clearInterval(messageInterval);
            clearInterval(progressInterval);
        };
    }, []);

    return (
        <div className="loading-overlay">
            <p>{message}</p>
            <div className="progress-bar-container">
                <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
            </div>
        </div>
    );
};

export default LoadingOverlay;