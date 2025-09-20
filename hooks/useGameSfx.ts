// hooks/useGameSfx.ts

import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { playSound } from '../services/soundService';

// A custom hook to manage game-related sound effects based on state changes.
export const useGameSfx = () => {
    const playerLevel = useSelector((state: RootState) => state.game.player.level);
    const eventLog = useSelector((state: RootState) => state.game.eventLog);
    const combatLog = useSelector((state: RootState) => state.game.combatLog);
    const latestCombatTurn = combatLog[0]?.turn;

    const prevLevel = useRef(playerLevel);
    const prevEventLogLength = useRef(eventLog.length);
    const prevCombatLogLength = useRef(combatLog.length);

    // Effect for level up
    useEffect(() => {
        if (playerLevel > prevLevel.current) {
            playSound('level_up');
        }
        prevLevel.current = playerLevel;
    }, [playerLevel]);
    
    // Effect for receiving items
    useEffect(() => {
        if (eventLog.length > 0 && eventLog.length !== prevEventLogLength.current) {
            const hasNewItem = eventLog.some(log => log.message.includes('Menerima:'));
            if (hasNewItem) {
                playSound('item_get');
            }
        }
        prevEventLogLength.current = eventLog.length;
    }, [eventLog]);

    // Effect for combat hits
    useEffect(() => {
        if (combatLog.length > 0 && combatLog.length !== prevCombatLogLength.current) {
            if (latestCombatTurn === 'player') {
                playSound('player_hit');
            } else if (latestCombatTurn === 'enemy') {
                playSound('enemy_hit');
            }
        }
        prevCombatLogLength.current = combatLog.length;
    }, [combatLog, latestCombatTurn]);
};
