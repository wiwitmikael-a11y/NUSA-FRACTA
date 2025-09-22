import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { attack, flee } from '../../store/gameSlice';
import { codex } from '../../core/codex';
import { getImageUrlForLocation, getEnemyImageUrl } from '../../services/assetService';

interface FloatingText {
    id: number;
    text: string;
    type: 'player-damage' | 'enemy-damage' | 'critical' | 'dodge';
    style: React.CSSProperties;
}

const ImagePanel: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const {
        player,
        isInCombat,
        currentEnemyId,
        enemyCurrentHp,
        combatLog,
        currentLocation,
        currentTimeOfDay,
    } = useSelector((state: RootState) => state.game);

    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
    const prevCombatLogLength = useRef(combatLog.length);

    const overlayClass = useMemo(() => {
        if (isInCombat) {
            return 'overlay-combat';
        }

        const lowerLocation = currentLocation.toLowerCase();

        if (lowerLocation.includes('bawah tanah') || lowerLocation.includes('terowongan') || lowerLocation.includes('stasiun')) {
            return 'overlay-underground';
        }

        switch (currentTimeOfDay) {
            case 'pagi':
                return 'overlay-morning';
            case 'sore':
                return 'overlay-dusk';
            case 'malam':
                return 'overlay-night';
            case 'siang':
            default:
                return '';
        }
    }, [isInCombat, currentLocation, currentTimeOfDay]);

    useEffect(() => {
        const newUrl = getImageUrlForLocation(currentLocation);
        if (newUrl !== imageUrl) {
            setIsLoading(true);
            setImageUrl(newUrl);
        }
    }, [currentLocation, imageUrl]);
    
    useEffect(() => {
        if (combatLog.length > prevCombatLogLength.current) {
            const newLogEntry = combatLog[0];
            let newText: Omit<FloatingText, 'id' | 'style'> | null = null;
            
            switch(newLogEntry.type) {
                case 'critical':
                    const critDamageMatch = newLogEntry.message.match(/memberikan (\d+) kerusakan/);
                    if(critDamageMatch) newText = { text: `KRITIS! -${critDamageMatch[1]}`, type: 'critical' };
                    break;
                case 'damage':
                    const damageMatch = newLogEntry.message.match(/memberikan (\d+) kerusakan/);
                    const playerDamageMatch = newLogEntry.message.match(/kehilangan (\d+) HP/);
                    if (damageMatch) {
                        newText = { text: `-${damageMatch[1]}`, type: 'enemy-damage' };
                    } else if (playerDamageMatch) {
                        newText = { text: `-${playerDamageMatch[1]}`, type: 'player-damage' };
                    }
                    break;
                case 'dodge':
                    newText = { text: 'Hindaran!', type: 'dodge' };
                    break;
            }

            if (newText) {
                const id = Date.now() + Math.random();
                const newFloatingText: FloatingText = {
                    ...newText,
                    id,
                    style: {
                        top: `${40 + Math.random() * 20}%`,
                        left: `${40 + Math.random() * 20}%`,
                    }
                };
                setFloatingTexts(current => [...current, newFloatingText]);

                setTimeout(() => {
                    setFloatingTexts(current => current.filter(t => t.id !== id));
                }, 1900);
            }
        }
        prevCombatLogLength.current = combatLog.length;
    }, [combatLog]);


    const handleImageLoad = () => {
        setIsLoading(false);
    };

    const handleImageError = () => {
        console.error(`Failed to load image for location: "${currentLocation}" at URL: ${imageUrl}`);
        setIsLoading(false);
    };
    
    const handleAttack = () => {
        dispatch(attack());
    }

    const handleFlee = () => {
        dispatch(flee());
    }

    const enemy = currentEnemyId ? codex.enemies[currentEnemyId] : null;
    const enemyHpPercentage = (enemy && enemy.hp > 0) ? (enemyCurrentHp / enemy.hp) * 100 : 0;
    const playerHpPercentage = (player.maxHp > 0) ? (player.hp / player.maxHp) * 100 : 0;
    const enemyImageUrl = currentEnemyId ? getEnemyImageUrl(currentEnemyId) : null;


    return (
        <div className="panel image-panel">
            {imageUrl && (
                <img
                    key={imageUrl}
                    src={imageUrl}
                    alt={currentLocation || 'Scene image'}
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                    className={isLoading ? 'loading' : 'loaded'}
                />
            )}
            
            {!isInCombat && currentLocation && (
                <div className="location-display">{currentLocation}</div>
            )}

            {isLoading && <div className="spinner-overlay"><div className="spinner"></div></div>}
            
            <div className={`atmospheric-overlay ${overlayClass} ${overlayClass ? 'visible' : ''}`}></div>

            {isInCombat && enemy && (
                <div className="combat-view-container">
                    {/* Player Info */}
                    <div className="combatant-info player-combatant">
                         <div className="combatant-visual">
                            {player.portraitUrl && <img src={player.portraitUrl} alt="Player" className="combatant-portrait player" />}
                             <div className="combatant-hp-bar-container">
                                <div className="combatant-hp-bar player" style={{ width: `${playerHpPercentage}%` }}></div>
                                <div className="combatant-hp-text">{player.hp} / {player.maxHp}</div>
                             </div>
                         </div>
                         <h4>{player.name}</h4>
                    </div>

                    {/* Combat Actions */}
                    <div className="combat-actions-center">
                        <button onClick={handleAttack}>Serang</button>
                        <button onClick={handleFlee}>Kabur</button>
                    </div>

                    {/* Enemy Info */}
                    <div className="combatant-info enemy-combatant">
                        <div className="combatant-visual">
                            {enemyImageUrl && <img src={enemyImageUrl} alt={enemy.name} className="combatant-portrait enemy" />}
                             <div className="combatant-hp-bar-container">
                                <div className="combatant-hp-bar enemy" style={{ width: `${enemyHpPercentage}%` }}></div>
                                <div className="combatant-hp-text">{enemyCurrentHp} / {enemy.hp}</div>
                             </div>
                        </div>
                        <h4>{enemy.name}</h4>
                    </div>
                </div>
            )}


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