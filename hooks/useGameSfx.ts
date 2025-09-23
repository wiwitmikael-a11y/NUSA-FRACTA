// hooks/useGameSfx.ts
import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import soundService from '../services/soundService';

export const useGameSfx = () => {
    const { 
        isInCombat, 
        combatLog, 
        eventLog, 
        player, 
    } = useSelector((state: RootState) => state.game);

    const prevIsInCombat = useRef(isInCombat);
    const prevCombatLogLength = useRef(combatLog.length);
    const prevEventLogLength = useRef(eventLog.length);
    const prevLevel = useRef(player.level);

    useEffect(() => {
        if (prevIsInCombat.current !== isInCombat) {
            soundService.playBgm(isInCombat ? 'combat' : 'explore');
        }
        prevIsInCombat.current = isInCombat;

        if (player.level > prevLevel.current) {
            soundService.playSfx('levelUp');
        }
        prevLevel.current = player.level;

        if (combatLog.length > prevCombatLogLength.current) {
            const newLog = combatLog[0];
            if (newLog.source === 'player') {
                if (newLog.type === 'critical') soundService.playSfx('critical');
                else soundService.playSfx('attack');
            } else if (newLog.source === 'enemy') {
                soundService.playSfx('hurt');
            } else if (newLog.source === 'companion') {
                soundService.playSfx('attack'); // Use the same sound as player attack for now
            }
        }
        prevCombatLogLength.current = combatLog.length;

        if (eventLog.length > prevEventLogLength.current) {
            const newLogs = eventLog.slice(prevEventLogLength.current);
            newLogs.forEach(log => {
                if (log.message.toLowerCase().includes('mengalahkan')) {
                    soundService.playSfx('win');
                } else if (log.type === 'reward') {
                    soundService.playSfx('reward');
                } else if (log.type === 'danger') {
                    soundService.playSfx('danger');
                }
            });
        }
        prevEventLogLength.current = eventLog.length;

    }, [isInCombat, combatLog, eventLog, player.level]);
};
