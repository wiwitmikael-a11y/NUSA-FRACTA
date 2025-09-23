import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { attack, flee } from '../../store/gameSlice';
import { codex } from '../../core/codex';
import { getImageUrlForLocation, getEnemyImageUrl } from '../../services/assetService';

interface FloatingText {
    id: number;
    text: string;
    type: 'player-damage' | 'enemy-damage' | 'critical' | 'dodge' | 'reward' | 'info' | 'danger' | 'companion-damage';
    category: 'combat' | 'narrative';
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
        eventLog,
    } = useSelector((state: RootState) => state.game);

    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
    const prevCombatLogLength = useRef(combatLog.length);
    const prevEventLogLength = useRef(eventLog.length);

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
            let newText: Omit<FloatingText, 'id' | 'style' | 'category'> | null = null;
            
            switch(newLogEntry.source) {
                case 'player':
                    if (newLogEntry.type === 'critical') {
                        const critDamageMatch = newLogEntry.message.match(/memberikan (\d+) kerusakan/);
                        if(critDamageMatch) newText = { text: `KRITIS! -${critDamageMatch[1]}`, type: 'critical' };
                    } else if (newLogEntry.type === 'damage') {
                        const damageMatch = newLogEntry.message.match(/memberikan (\d+) kerusakan/);
                        if (damageMatch) newText = { text: `-${damageMatch[1]}`, type: 'enemy-damage' };
                    }
                    break;
                case 'enemy':
                     if (newLogEntry.type === 'damage') {
                        const playerDamageMatch = newLogEntry.message.match(/kehilangan (\d+) HP/);
                        if (playerDamageMatch) newText = { text: `-${playerDamageMatch[1]}`, type: 'player-damage' };
                    }
                    break;
                case 'companion':
                    if (newLogEntry.type === 'damage') {
                        const damageMatch = newLogEntry.message.match(/memberikan (\d+) kerusakan/);
                        if (damageMatch) newText = { text: `-${damageMatch[1]}`, type: 'companion-damage' };
                    }
                    break;
                case 'system':
                    if (newLogEntry.type === 'dodge') {
                        newText = { text: 'Hindaran!', type: 'dodge' };
                    }
                    break;
            }


            if (newText) {
                const id = Date.now() + Math.random();
                const newFloatingText: FloatingText = {
                    ...(newText as any), // Cast to any to satisfy TS for the spread
                    id,
                    category: 'combat',
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

    useEffect(() => {
        if (eventLog.length > prevEventLogLength.current) {
            const newLogEntries = eventLog.slice(prevEventLogLength.current);

            newLogEntries.forEach((logEntry, index) => {
                const lowerMessage = logEntry.message.toLowerCase();
                 if (lowerMessage.includes('muncul!') || lowerMessage.includes('dikalahkan') || lowerMessage.includes('kabur')) {
                    return;
                }
                
                // Tunda kemunculan setiap pesan baru agar tidak tumpang tindih
                setTimeout(() => {
                    const id = Date.now() + Math.random();
                    const newFloatingText: FloatingText = {
                        id,
                        text: logEntry.message,
                        type: logEntry.type,
                        category: 'narrative',
                        style: {
                            top: '70%',
                            left: '50%',
                            transform: 'translateX(-50%)',
                        }
                    };
                    setFloatingTexts(current => [...current, newFloatingText]);

                    setTimeout(() => {
                        setFloatingTexts(current => current.filter(t => t.id !== id));
                    }, 3900);
                }, index * 1200); // Tunda 1200ms (sebelumnya 400ms) antar pesan
            });
        }
        prevEventLogLength.current = eventLog.length;
    }, [eventLog]);


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
    
    const enemyImageUrl = useMemo(() => {
        return currentEnemyId ? getEnemyImageUrl(currentEnemyId) : null;
    }, [currentEnemyId]);


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
                <>
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
                    
                    <div className="combat-action-bar">
                        <div className="combat-actions-center">
                            <button onClick={handleAttack}>Serang</button>
                            <button onClick={handleFlee}>Kabur</button>
                        </div>
                    </div>
                </>
            )}


            <div className="floating-text-container">
                {floatingTexts.map(ft => (
                    <span key={ft.id} className={`floating-text ${ft.category} ${ft.type}`} style={ft.style}>
                        {ft.text}
                    </span>
                ))}
            </div>
        </div>
    );
};

export default ImagePanel;