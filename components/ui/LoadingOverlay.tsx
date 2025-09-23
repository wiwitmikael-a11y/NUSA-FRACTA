import React, { useState, useEffect } from 'react';

const loadingMessages = [
    "Menganalisis kemungkinan...",
    "Merangkai narasi...",
    "Menyelaraskan takdir...",
    "Memuat sekuens berikutnya...",
    "Memproses konsekuensi...",
    "Menghitung probabilitas kuantum...",
    "Membangun reruntuhan...",
    "Menyebarkan anomali...",
    "Menghubungi Atharrazka Core...",
    "Mengkalibrasi ulang realitas...",
];

const LoadingOverlay: React.FC = () => {
    const [message, setMessage] = useState(loadingMessages[0]);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // Cycle through messages every 4 seconds for longer loads
        const messageInterval = setInterval(() => {
            setMessage(prevMessage => {
                const currentIndex = loadingMessages.indexOf(prevMessage);
                const nextIndex = (currentIndex + 1) % loadingMessages.length;
                return loadingMessages[nextIndex];
            });
        }, 4000);

        // Animate the progress bar over a simulated 2-minute duration
        const totalDuration = 120 * 1000; // 2 minutes in ms
        const intervalDuration = 200; // update every 200ms
        const totalSteps = totalDuration / intervalDuration;
        
        const progressInterval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(progressInterval);
                    return 100;
                }
                // This simulates a non-linear, more "realistic" loading
                // Increment is smaller for a longer duration
                const increment = (Math.random() * 2) * (100 / totalSteps);
                return Math.min(prev + increment, 100);
            });
        }, intervalDuration);

        return () => {
            clearInterval(messageInterval);
            clearInterval(progressInterval);
        };
    }, []);

    return (
        <div className="loading-overlay">
            <h3>Atharrazka Core sedang...</h3>
            <p>{message}</p>
            <div className="progress-bar-container">
                <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
            </div>
            <div className="loading-disclaimer">
                Proses ini mungkin memakan waktu beberapa saat, tergantung pada kondisi jaringan. Mohon jangan tutup jendela ini.
            </div>
        </div>
    );
};

export default LoadingOverlay;