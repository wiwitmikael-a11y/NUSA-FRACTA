import React, { useState, useRef, useEffect } from 'react';

interface IntroVideoProps {
    onFinished: () => void;
}

const IntroVideo: React.FC<IntroVideoProps> = ({ onFinished }) => {
    const [isFadingOut, setIsFadingOut] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    // Dibuat sebagai useCallback untuk stabilitas referensi
    const handleVideoEnd = React.useCallback(() => {
        setIsFadingOut(true);
        // Tunggu animasi fade-out selesai sebelum memanggil onFinished
        setTimeout(() => {
            onFinished();
        }, 1000); // Durasi ini harus cocok dengan durasi transisi CSS
    }, [onFinished]);

    useEffect(() => {
        const videoElement = videoRef.current;
        if (videoElement) {
            // Coba putar video
            videoElement.play().catch(error => {
                console.warn("Autoplay dicegah. Interaksi pengguna mungkin diperlukan.", error);
                // Jika autoplay gagal, langsung akhiri saja.
                // Di banyak lingkungan modern, video yang dibisukan akan berputar otomatis.
                handleVideoEnd();
            });
            
            videoElement.addEventListener('ended', handleVideoEnd);

            return () => {
                videoElement.removeEventListener('ended', handleVideoEnd);
            };
        }
    }, [handleVideoEnd]);

    return (
        <div className={`intro-container ${isFadingOut ? 'fade-out' : ''}`}>
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
