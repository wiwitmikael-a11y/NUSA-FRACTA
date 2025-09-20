import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { initialGameState } from '../core/worldState';
import { applyEffects } from '../core/gameRules';
// FIX: Added StoryEffect to the import to correctly type victoryEffects.
import { GameState, ChapterNodeChoice, PlayerAttributes, ItemId, AttributeId, EnemyId, Recipe, SkillId, StoryEffect } from '../types';
import { loadGame as loadGameFromStorage, saveGame as saveGameToStorage } from '../services/storageService';
import { codex } from '../core/codex';
import { chapter1 } from '../core/story';

const PLAYER_ID = 'player1';

// Helper for combat log
let nextCombatLogId = 0;
const addCombatLog = (state: GameState, message: string, turn: 'player' | 'enemy' | 'info') => {
    state.combatLog.unshift({ id: nextCombatLogId++, message, turn });
};

const gameSlice = createSlice({
    name: 'game',
    initialState: initialGameState,
    reducers: {
        setPlayerCharacter: (state, action: PayloadAction<{ name: string; backgroundId: string; skillId: string; }>) => {
            state.player.name = action.payload.name;
            state.player.backgroundId = action.payload.backgroundId;
            state.player.skillId = action.payload.skillId as SkillId;

            state.player.attributes = { kekuatan: 5, ketangkasan: 5, kecerdasan: 5, karisma: 5 };

            const background = codex.backgrounds[action.payload.backgroundId];
            if (background?.effects) {
                background.effects.forEach(effect => {
                    if (effect.type === 'ATTRIBUTE_MOD') {
                        const key = effect.key as keyof PlayerAttributes;
                        state.player.attributes[key] += effect.value;
                    }
                });
            }
        },
        startGame: (state) => {
            state.currentChapter = chapter1;
            state.currentNodeId = chapter1.startNodeId;
            const startNode = chapter1.nodes.find(n => n.nodeId === chapter1.startNodeId);
            if (startNode) {
                state.currentLocation = startNode.location;
            }
            state.gameStarted = true;
            state.isLoading = false;
            state.isNarrativeComplete = false;
            saveGameToStorage(PLAYER_ID, state);
        },
        makeChoice: (state, action: PayloadAction<ChapterNodeChoice>) => {
            if (!state.currentChapter || state.isInCombat) return;
            
            state.isNarrativeComplete = false; // Reset narrative status
            const choice = action.payload;

            // This now returns the new state, so we pass it along.
            const newState = applyEffects({ ...state }, choice.effects);
            Object.assign(state, newState);


            const nextNode = state.currentChapter.nodes.find(n => n.nodeId === choice.targetNodeId);

            if (nextNode) {
                state.currentNodeId = nextNode.nodeId;
                state.currentLocation = nextNode.location;
                if (nextNode.effects) {
                    const finalState = applyEffects({ ...state }, nextNode.effects);
                    Object.assign(state, finalState);
                }
                if (nextNode.isChapterEnd) {
                    state.isChapterEndModalOpen = true;
                }
            } else if (!state.isInCombat) { // Don't error if combat started
                console.error(`Invalid targetNodeId: ${choice.targetNodeId}`);
                state.error = "Alur cerita rusak. Tidak dapat menemukan langkah selanjutnya.";
            }

            saveGameToStorage(PLAYER_ID, state);
        },
        // --- NEW COMBAT REDUCERS ---
        attack: (state) => {
            if (!state.isInCombat || !state.currentEnemyId) return;
            const enemy = codex.enemies[state.currentEnemyId];
            
            // Player attacks enemy
            const playerDamage = Math.max(1, state.player.attributes.kekuatan - enemy.defense);
            state.enemyCurrentHp = Math.max(0, state.enemyCurrentHp - playerDamage);
            addCombatLog(state, `Kamu menyerang ${enemy.name} dan memberikan ${playerDamage} kerusakan.`, 'player');

            if (state.enemyCurrentHp <= 0) {
                // VICTORY
                addCombatLog(state, `${enemy.name} telah dikalahkan!`, 'info');
                state.isInCombat = false;
                state.currentEnemyId = null;
                // apply victory effects
                // FIX: Explicitly typed `victoryEffects` as StoryEffect[] to prevent TypeScript from widening the type of the 'type' property to string.
                const victoryEffects: StoryEffect[] = [{ type: 'ADD_XP', key: 'combat_victory', value: enemy.xp_reward }];
                const newState = applyEffects({ ...state }, victoryEffects);
                Object.assign(state, newState);
            } else {
                // Enemy attacks player
                const enemyDamage = Math.max(1, enemy.attack - Math.floor(state.player.attributes.ketangkasan / 2));
                state.player.hp = Math.max(0, state.player.hp - enemyDamage);
                addCombatLog(state, `${enemy.name} menyerang dan kamu kehilangan ${enemyDamage} HP.`, 'enemy');
                if (state.player.hp <= 0) {
                    // DEFEAT
                    addCombatLog(state, 'Kamu telah dikalahkan...', 'info');
                    state.isInCombat = false;
                    state.currentNodeId = 'akhir_bab_dirampok'; // Generic defeat node
                }
            }
            saveGameToStorage(PLAYER_ID, state);
        },
        flee: (state) => {
            if (!state.isInCombat || !state.currentEnemyId) return;
            const enemy = codex.enemies[state.currentEnemyId];
            const fleeChance = 0.5 + (state.player.attributes.ketangkasan - 5) * 0.05;

            if (Math.random() < fleeChance) {
                addCombatLog(state, 'Kamu berhasil kabur!', 'info');
                state.isInCombat = false;
                state.currentEnemyId = null;
            } else {
                addCombatLog(state, 'Kamu gagal kabur!', 'player');
                // Enemy gets a free hit
                const enemyDamage = Math.max(1, enemy.attack - Math.floor(state.player.attributes.ketangkasan / 2));
                state.player.hp = Math.max(0, state.player.hp - enemyDamage);
                addCombatLog(state, `${enemy.name} menyerang dan kamu kehilangan ${enemyDamage} HP.`, 'enemy');
                 if (state.player.hp <= 0) {
                    addCombatLog(state, 'Kamu telah dikalahkan...', 'info');
                    state.isInCombat = false;
                    state.currentNodeId = 'akhir_bab_dirampok';
                }
            }
            saveGameToStorage(PLAYER_ID, state);
        },
        // --- END COMBAT REDUCERS ---
        useItem: (state, action: PayloadAction<ItemId>) => {
            const itemId = action.payload;
            const itemInCodex = codex.items[itemId];
            if (itemInCodex?.effects) {
                const newState = applyEffects({ ...state }, itemInCodex.effects);
                Object.assign(state, newState);

                const itemInInventory = state.player.inventory.find(i => i.itemId === itemId);
                if (itemInInventory) {
                    itemInInventory.quantity -= 1;
                    if (itemInInventory.quantity <= 0) {
                        state.player.inventory = state.player.inventory.filter(i => i.itemId !== itemId);
                    }
                }
                saveGameToStorage(PLAYER_ID, state);
            }
        },
        craftItem: (state, action: PayloadAction<Recipe>) => {
            const recipe = action.payload;
            // Double check if ingredients are sufficient
            const canCraft = recipe.ingredients.every(ing => {
                const itemInInv = state.player.inventory.find(i => i.itemId === ing.itemId);
                return itemInInv && itemInInv.quantity >= ing.quantity;
            });

            if (canCraft) {
                // Remove ingredients
                recipe.ingredients.forEach(ing => {
                    const itemInInv = state.player.inventory.find(i => i.itemId === ing.itemId)!;
                    itemInInv.quantity -= ing.quantity;
                });
                state.player.inventory = state.player.inventory.filter(i => i.quantity > 0);

                // Add output item
                const outputItem = state.player.inventory.find(i => i.itemId === recipe.output.itemId);
                if (outputItem) {
                    outputItem.quantity += recipe.output.quantity;
                } else {
                    state.player.inventory.push({ ...recipe.output });
                }
                saveGameToStorage(PLAYER_ID, state);
            }
        },
        assignAttributePoint: (state, action: PayloadAction<AttributeId>) => {
            const attributeId = action.payload;
            if (state.player.unspentAttributePoints > 0) {
                state.player.attributes[attributeId]++;
                state.player.unspentAttributePoints--;
                saveGameToStorage(PLAYER_ID, state);
            }
        },
        closeChapterEndModal: (state) => {
            state.isChapterEndModalOpen = false;
        },
        loadGame: (state, action: PayloadAction<GameState>) => {
            return action.payload;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        setNarrativeComplete: (state, action: PayloadAction<boolean>) => {
            state.isNarrativeComplete = action.payload;
        }
    },
});

export const {
    setPlayerCharacter,
    startGame,
    makeChoice,
    attack,
    flee,
    useItem,
    craftItem,
    assignAttributePoint,
    closeChapterEndModal,
    loadGame,
    setLoading,
    setNarrativeComplete
} = gameSlice.actions;

export default gameSlice.reducer;