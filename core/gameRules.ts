import type { GameState, StoryEffect, EventLogMessage, ItemId, EnemyId } from '../types';
import { codex } from './codex';

const createLogMessage = (effect: StoryEffect, state: GameState): Omit<EventLogMessage, 'id'> | null => {
    switch (effect.type) {
        case 'CHANGE_HP':
            if (effect.value > 0) return { message: `HP pulih +${effect.value}`, type: 'success' };
            if (effect.value < 0) return { message: `HP berkurang ${effect.value}`, type: 'danger' };
            break;
        case 'ADD_ITEM':
            const addedItemName = codex.items[effect.key as ItemId]?.name || effect.key;
            return { message: `Menerima: ${addedItemName} (x${effect.value})`, type: 'success' };
        case 'REMOVE_ITEM':
            const removedItemName = codex.items[effect.key as ItemId]?.name || effect.key;
            return { message: `Kehilangan: ${removedItemName} (x${effect.value})`, type: 'danger' };
        case 'ADD_XP':
            return { message: `Mendapat +${effect.value} XP`, type: 'success' };
        case 'CHANGE_REPUTATION':
            const repChange = effect.value > 0 ? `+${effect.value}` : effect.value;
            return { message: `Reputasi ${effect.key.replace(/_/g, ' ')} berubah ${repChange}`, type: 'neutral' };
        default:
            return null;
    }
    return null;
}


export const applyEffects = (state: GameState, effects: StoryEffect[]): GameState => {
  if (!effects || effects.length === 0) {
    return state;
  }

  // Clear previous log and prepare for new messages
  state.eventLog = [];
  let nextLogId = 0;

  effects.forEach(effect => {
    // Generate log before applying effect
    const logMessage = createLogMessage(effect, state);
    if (logMessage) {
        state.eventLog.push({ ...logMessage, id: nextLogId++ });
    }

    switch (effect.type) {
      case 'CHANGE_HP':
        state.player.hp = Math.max(0, Math.min(state.player.maxHp, state.player.hp + effect.value));
        break;
      
      case 'ADD_ITEM':
        const existingItem = state.player.inventory.find(i => i.itemId === effect.key);
        if (existingItem) {
          existingItem.quantity += effect.value;
        } else {
          state.player.inventory.push({ itemId: effect.key as ItemId, quantity: effect.value });
        }
        break;

      case 'REMOVE_ITEM':
        const itemToRemove = state.player.inventory.find(i => i.itemId === effect.key);
        if (itemToRemove) {
          itemToRemove.quantity -= effect.value;
          if (itemToRemove.quantity <= 0) {
            state.player.inventory = state.player.inventory.filter(i => i.itemId !== effect.key);
          }
        }
        break;

      case 'CHANGE_REPUTATION':
        if (state.player.reputation.hasOwnProperty(effect.key)) {
            state.player.reputation[effect.key] += effect.value;
        }
        break;

      case 'ADD_XP':
        const xpNeeded = state.player.level * 100;
        state.player.xp += effect.value;
        if (state.player.xp >= xpNeeded) {
            state.player.xp -= xpNeeded;
            state.player.level++;
            state.player.unspentAttributePoints++; // Grant attribute point on level up
            state.eventLog.push({ id: nextLogId++, message: `NAIK LEVEL! Anda sekarang Level ${state.player.level}.`, type: 'success' });
        }
        break;
      
      case 'SET_FLAG':
        state.player.storyFlags[effect.key] = effect.value === 1;
        break;

      case 'START_COMBAT':
        const enemyId = effect.key as EnemyId;
        const enemy = codex.enemies[enemyId];
        if (enemy) {
            state.isInCombat = true;
            state.currentEnemyId = enemyId;
            state.enemyCurrentHp = enemy.hp;
            state.combatLog = [{ id: 0, message: `Kamu berhadapan dengan ${enemy.name}!`, turn: 'info'}];
        }
        break;

      default:
        console.warn(`Unknown effect type: ${(effect as any).type}`);
        break;
    }
  });

  return state;
};