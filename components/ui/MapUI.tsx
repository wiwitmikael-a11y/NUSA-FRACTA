import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';

const MapUI: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const { currentChapterPath, currentLocation } = useSelector((state: RootState) => state.game);
    
    if (!isOpen) return null;

    const pathData = currentChapterPath.map(p => `${p.x},${p.y}`).join(' ');

    return (
        <div className="modal-overlay map-modal" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="close-button">X</button>
                <div className="map-container">
                    {/* SVG for drawing the path */}
                    <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
                        <defs>
                            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                                <feMerge>
                                    <feMergeNode in="coloredBlur" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                        </defs>
                        {/* The dotted line for the path */}
                        <polyline
                            points={pathData}
                            fill="none"
                            stroke="rgba(255, 111, 0, 0.7)"
                            strokeWidth="2"
                            strokeDasharray="4 4"
                            style={{ filter: 'url(#glow)' }}
                        />
                    </svg>

                    {/* Map markers */}
                    {currentChapterPath.map((point, index) => {
                        const isCurrentLocation = index === currentChapterPath.length - 1;
                        const isStartPoint = index === 0;

                        return (
                            <div 
                                key={`${point.location}-${index}`} 
                                className={`map-marker ${isCurrentLocation ? 'current' : ''} ${isStartPoint ? 'start' : ''}`}
                                style={{ top: `${point.y}%`, left: `${point.x}%` }}
                                title={point.location}
                            >
                                <div className="map-marker-label">{point.location}</div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default MapUI;