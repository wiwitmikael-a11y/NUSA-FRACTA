// core/gameRules.ts
import type { Player, Enemy, EquipmentSlot, ItemId } from '../types';
import { codex } from './codex';

export const calculateXpForNextLevel = (level: number): number => {
    // Kurva XP yang lebih curam untuk progresi jangka panjang
    return Math.floor(100 * Math.pow(level, 1.5));
};

export const checkLevelUp = (player: Player): Player => {
    const newPlayer = { ...player };
    let xpNeeded = calculateXpForNextLevel(newPlayer.level);
    
    // Memungkinkan untuk naik beberapa level sekaligus jika XP cukup
    while (newPlayer.xp >= xpNeeded) {
        newPlayer.level += 1;
        newPlayer.xp -= xpNeeded;
        newPlayer.unspentAttributePoints += 1;
        newPlayer.maxHp += 10;
        newPlayer.hp = newPlayer.maxHp; // Full heal on level up
        xpNeeded = calculateXpForNextLevel(newPlayer.level);
    }
    return newPlayer;
};


export const calculatePlayerDamage = (player: Player): { damage: number, isCritical: boolean } => {
    const baseDamage = 5;
    const strengthBonus = player.attributes.kekuatan - 5;
    let totalDamage = Math.max(1, baseDamage + strengthBonus);
    let isCritical = false;

    // Tambahkan bonus dari senjata yang terpasang (pilih yang terkuat antara melee dan ranged)
    let weaponDamageBonus = 0;
    const equippedMeleeId = player.equippedItems.meleeWeapon;
    if (equippedMeleeId) {
        const weapon = codex.items[equippedMeleeId];
        const effect = weapon?.effects?.find(e => e.key === 'flat_damage_bonus');
        if (effect) weaponDamageBonus = Math.max(weaponDamageBonus, effect.value);
    }
    const equippedRangedId = player.equippedItems.rangedWeapon;
    if (equippedRangedId) {
        const weapon = codex.items[equippedRangedId];
        const effect = weapon?.effects?.find(e => e.key === 'flat_damage_bonus');
        if (effect) weaponDamageBonus = Math.max(weaponDamageBonus, effect.value);
    }
    totalDamage += weaponDamageBonus;


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
    
    // Menambahkan variasi kerusakan (85% - 115%)
    const finalDamage = Math.round(totalDamage * (0.85 + Math.random() * 0.30));
    
    return { damage: Math.max(1, finalDamage), isCritical };
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
    // Menambahkan variasi kerusakan (85% - 115%)
    const finalDamage = Math.round(enemy.attack * (0.85 + Math.random() * 0.30));
    return Math.max(1, finalDamage);
};