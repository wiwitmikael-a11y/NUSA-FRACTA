// core/gameRules.ts
import type { Player, Enemy } from '../types';

export const calculateXpForNextLevel = (level: number): number => {
    return level * 100;
};

export const checkLevelUp = (player: Player): Player => {
    const newPlayer = { ...player };
    const xpNeeded = calculateXpForNextLevel(newPlayer.level);
    if (newPlayer.xp >= xpNeeded) {
        newPlayer.level += 1;
        newPlayer.xp -= xpNeeded;
        newPlayer.unspentAttributePoints += 1;
        newPlayer.maxHp += 10;
        newPlayer.hp = newPlayer.maxHp; // Full heal on level up
    }
    return newPlayer;
};

export const calculatePlayerDamage = (player: Player): number => {
    // Basic damage: 5 base + strength modifier
    const baseDamage = 5;
    const strengthBonus = player.attributes.kekuatan - 5;
    // In the future, this will check for equipped weapon
    return Math.max(1, baseDamage + strengthBonus);
};

export const calculateEnemyDamage = (enemy: Enemy): number => {
    return Math.max(1, enemy.attack);
};
