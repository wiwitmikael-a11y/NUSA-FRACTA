// core/gameRules.ts
import type { Player, Enemy, EquipmentSlot, ItemId } from '../types';
import { codex } from './codex';

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

export const calculatePlayerDamage = (player: Player): { damage: number, isCritical: boolean } => {
    const baseDamage = 5;
    const strengthBonus = player.attributes.kekuatan - 5;
    let totalDamage = Math.max(1, baseDamage + strengthBonus);
    let isCritical = false;

    // Tambahkan bonus dari senjata yang terpasang
    const equippedWeaponId = player.equippedItems.meleeWeapon;
    if (equippedWeaponId) {
        const weapon = codex.items[equippedWeaponId];
        const weaponDamageEffect = weapon?.effects?.find(e => e.key === 'flat_damage_bonus');
        if (weaponDamageEffect) {
            totalDamage += weaponDamageEffect.value;
        }
    }

    // Periksa bonus dari keahlian (biasanya persentase)
    if (player.skillId) {
        const skill = codex.skills[player.skillId];
        const meleeBonusEffect = skill?.effects.find(e => e.type === 'SKILL_BONUS' && e.key === 'melee_damage_bonus');
        if (meleeBonusEffect) {
            totalDamage *= (1 + meleeBonusEffect.value / 100);
        }

        const critChanceEffect = skill?.effects.find(e => e.type === 'SKILL_BONUS' && e.key === 'critical_hit_chance');
        if (critChanceEffect && (Math.random() * 100 < critChanceEffect.value)) {
            isCritical = true;
            totalDamage *= 2; // Kerusakan ganda untuk kritikal
        }
    }
    
    return { damage: Math.round(totalDamage), isCritical };
};

export const calculatePlayerDefense = (player: Player): number => {
    let totalDefense = 0;
    const equippedArmorId = player.equippedItems.armor;
    if (equippedArmorId) {
        const armor = codex.items[equippedArmorId];
        const armorDefenseEffect = armor?.effects?.find(e => e.key === 'damage_resistance');
        if (armorDefenseEffect) {
            totalDefense += armorDefenseEffect.value;
        }
    }
    return totalDefense;
};


export const calculateEnemyDamage = (enemy: Enemy): number => {
    return Math.max(1, enemy.attack);
};