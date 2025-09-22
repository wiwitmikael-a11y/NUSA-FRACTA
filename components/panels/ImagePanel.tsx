import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { attack, flee } from '../../store/gameSlice';
import { codex } from '../../core/codex';
import { getImageUrlForLocation } from '../../services/assetService';

interface FloatingText {
    id: number;
    text: string;
    type: 'player-damage' | 'enemy-damage';
    style: React.CSSProperties;
}

const ImagePanel: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const {
        isInCombat,
        currentEnemyId,
        enemyCurrentHp,
        combatLog,
        currentLocation,
        currentTimeOfDay,
    } = useSelector((state: RootState) => state.game);

    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false); // Default to false, loading is an event.
    const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
    const prevCombatLogLength = useRef(combatLog.length);

    // Logic for atmospheric overlay
    const overlayClass = useMemo(() => {
        // Combat has the highest priority
        if (isInCombat) {
            return 'overlay-combat';
        }

        const lowerLocation = currentLocation.toLowerCase();

        // Specific location keywords take precedence over time of day
        if (lowerLocation.includes('bawah tanah') || lowerLocation.includes('terowongan') || lowerLocation.includes('stasiun')) {
            return 'overlay-underground';
        }

        // Time of day based overlays
        switch (currentTimeOfDay) {
            case 'pagi':
                return 'overlay-morning';
            case 'sore':
                return 'overlay-dusk';
            case 'malam':
                return 'overlay-night';
            case 'siang':
            default:
                return ''; // No overlay during the day
        }
    }, [isInCombat, currentLocation, currentTimeOfDay]);

    useEffect(() => {
        const newUrl = getImageUrlForLocation(currentLocation);

        if (newUrl !== imageUrl) {
            setIsLoading(true);
            setImageUrl(newUrl);
        }
    }, [currentLocation, imageUrl]);
    
    // Effect for floating combat text
    useEffect(() => {
        if (combatLog.length > prevCombatLogLength.current) {
            const newLogEntry = combatLog[0]; // latest is at the start
            const damageMatch = newLogEntry.message.match(/memberikan (\d+) kerusakan/);
            const playerDamageMatch = newLogEntry.message.match(/kehilangan (\d+) HP/);

            let newText: Omit<FloatingText, 'id' | 'style'> | null = null;
            
            if (damageMatch) { // Player hit enemy
                newText = { text: `-${damageMatch[1]}`, type: 'enemy-damage' };
            } else if (playerDamageMatch) { // Enemy hit player
                newText = { text: `-${playerDamageMatch[1]}`, type: 'player-damage' };
            }

            if (newText) {
                const id = Date.now() + Math.random();
                const newFloatingText: FloatingText = {
                    ...newText,
                    id,
                    style: {
                        top: `${40 + Math.random() * 20}%`, // Randomize vertical position
                        left: `${40 + Math.random() * 20}%`, // Randomize horizontal position
                    }
                };
                setFloatingTexts(current => [...current, newFloatingText]);

                setTimeout(() => {
                    setFloatingTexts(current => current.filter(t => t.id !== id));
                }, 1900); // Remove after animation ends
            }
        }
        prevCombatLogLength.current = combatLog.length;
    }, [combatLog]);


    const handleImageLoad = () => {
        setIsLoading(false);
    };

    const handleImageError = () => {
        console.error(`Failed to load image for location: "${currentLocation}" at URL: ${imageUrl}`);
        setIsLoading(false); // Stop loading spinner even if image fails.
    };
    
    const handleAttack = () => {
        dispatch(attack());
    }

    const handleFlee = () => {
        dispatch(flee());
    }

    const enemy = currentEnemyId ? codex.enemies[currentEnemyId] : null;
    const enemyHpPercentage = (enemy && enemy.hp > 0) ? (enemyCurrentHp / enemy.hp) * 100 : 0;

    const renderCombatOverlay = () => {
        if (!isInCombat || !enemy) return null;
        return (
            <div className="combat-overlay">
                <div className="enemy-status-overlay">
                    <h4>{enemy.name}</h4>
                    <div className="enemy-hp-bar-container">
                        <div className="enemy-hp-bar" style={{ width: `${enemyHpPercentage}%` }}></div>
                    </div>
                    <small>{enemyCurrentHp} / {enemy.hp} HP</small>
                </div>
                <div className="combat-actions-overlay">
                    <button onClick={handleAttack}>Serang</button>
                    <button onClick={handleFlee}>Kabur</button>
                </div>
            </div>
        );
    };

    if (!imageUrl) {
        return <div className="panel image-panel placeholder">{currentLocation || ''}</div>;
    }

    return (
        <div className="panel image-panel">
            {/* Using key forces a remount on URL change, ensuring onLoad/onError fire reliably */}
            <img
                key={imageUrl}
                src={imageUrl}
                alt={currentLocation || 'Scene image'}
                onLoad={handleImageLoad}
                onError={handleImageError}
                className={isLoading ? 'loading' : 'loaded'}
            />
            {isLoading && <div className="spinner-overlay"><div className="spinner"></div></div>}
            
            <div className={`atmospheric-overlay ${overlayClass} ${overlayClass ? 'visible' : ''}`}></div>

            {renderCombatOverlay()}

            <div className="floating-text-container">
                {floatingTexts.map(ft => (
                    <span key={ft.id} className={`floating-text ${ft.type}`} style={ft.style}>
                        {ft.text}
                    </span>
                ))}
            </div>
        </div>
    );
};

export default ImagePanel;