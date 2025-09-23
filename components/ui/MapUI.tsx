import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { mapCoordinates } from '../../core/mapCoordinates';

const MapUI: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const visitedLocations = useSelector((state: RootState) => state.game.player.visitedLocations);
    
    if (!isOpen) return null;

    return (
        <div className="modal-overlay map-modal" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="close-button">X</button>
                <div className="map-container">
                    {visitedLocations.map(locationName => {
                        const coords = mapCoordinates[locationName];
                        if (!coords) {
                            console.warn(`No coordinates found for location: ${locationName}`);
                            return null;
                        }
                        return (
                            <div 
                                key={locationName} 
                                className="map-marker"
                                style={{ top: `${coords.y}%`, left: `${coords.x}%` }}
                                title={locationName}
                            >
                                <div className="map-marker-label">{locationName}</div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default MapUI;