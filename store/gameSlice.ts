// store/gameSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { initialGameState } from '../core/worldState';
import { generateChapter } from '../services/geminiService';
import { codex } from '../core/codex';
import { calculatePlayerDamage, calculateEnemyDamage, checkLevelUp } from '../core/gameRules';
import type { RootState } from './store';
import type { GameState, Chapter, ChapterNodeChoice, Player, Recipe, PlayerAttributes } from '../types';
import { saveGame } from '../services/storageService';

export const generateAndStartChapter = createAsyncThunk<Chapter, { title: string; objective: string }, { state: RootState }>(
    'game/generateAndStartChapter',
    async (chapterDetails, { getState, rejectWithValue }) => {
        try {
            const currentState = getState().game;
            const chapter = await generateChapter(currentState, chapterDetails);
            return chapter;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

const gameSlice = createSlice({
    name: 'game',
    initialState: initialGameState,
    reducers: {
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        setNarrativeComplete: (state, action: PayloadAction<boolean>) => {
            state.isNarrativeComplete = action.payload;
        },
        startGame: (state) => {
            state.gameStarted = true;
        },
        loadGame: (state, action: PayloadAction<GameState>) => {
            return {
                ...action.payload,
                isLoading: false, // Ensure loading is false when loading a save
            };
        },
        setPlayerCharacter: (state, action: PayloadAction<{ name: string; backgroundId: string; skillId: string; attributes: PlayerAttributes }>) => {
            const { name, backgroundId, skillId, attributes } = action.payload;
            const background = codex.backgrounds[backgroundId];

            state.player = {
                ...initialGameState.player,
                name,
                backgroundId,
                skillId,
                attributes: attributes, // Assign pre-calculated attributes directly
                portraitUrl: background?.portraitUrl || null,
            };
        },
        makeChoice: (state, action: PayloadAction<ChapterNodeChoice>) => {
            const choice = action.payload;
            const nextNode = state.currentChapter?.nodes.find(node => node.nodeId === choice.targetNodeId);

            if (nextNode) {
                state.currentNodeId = nextNode.nodeId;
                state.currentLocation = nextNode.location;
                state.currentTimeOfDay = nextNode.timeOfDay || state.currentTimeOfDay;
                state.isNarrativeComplete = false;

                if (nextNode.isChapterEnd) {
                    state.isChapterEndModalOpen = true;
                }
            } else {
                state.error = `Pilihan salah: Tidak dapat menemukan node tujuan '${choice.targetNodeId}'.`;
            }
             // Auto-save on every choice
            saveGame('player1', state);
        },
        closeChapterEndModal: (state) => {
            state.isChapterEndModalOpen = false;
            // Here you would typically trigger the next chapter generation
        },
        attack: (state) => {
            if (!state.isInCombat || !state.currentEnemyId) return;

            const enemy = codex.enemies[state.currentEnemyId];
            
            // Player attacks
            const playerDamage = calculatePlayerDamage(state.player);
            state.enemyCurrentHp -= playerDamage;
            state.combatLog.unshift({ id: `clog-${Date.now()}`, message: `Kamu menyerang ${enemy.name} dan memberikan ${playerDamage} kerusakan.`, turn: 'player' });

            if (state.enemyCurrentHp <= 0) {
                // Enemy defeated
                state.isInCombat = false;
                state.player.xp += enemy.xpValue;
                state.eventLog.push({ id: `elog-${Date.now()}`, message: `Kamu mengalahkan ${enemy.name} dan mendapatkan ${enemy.xpValue} XP.`, type: 'reward' });
                
                // Check for level up
                const playerAfterLevelCheck = checkLevelUp(state.player);
                if(playerAfterLevelCheck.level > state.player.level) {
                     state.eventLog.push({ id: `elog-${Date.now()}-lvl`, message: `Selamat! Kamu mencapai Level ${playerAfterLevelCheck.level}!`, type: 'reward' });
                }
                state.player = playerAfterLevelCheck;

                state.currentNodeId = null; // Signal end of combat
                return;
            }

            // Enemy attacks
            const enemyDamage = calculateEnemyDamage(enemy);
            state.player.hp -= enemyDamage;
            state.combatLog.unshift({ id: `clog-${Date.now() + 1}`, message: `${enemy.name} menyerang dan kamu kehilangan ${enemyDamage} HP.`, turn: 'enemy' });

            if (state.player.hp <= 0) {
                // Player defeated
                state.error = "Kamu telah dikalahkan...";
                state.isInCombat = false;
                // Game over logic would go here
            }
        },
        flee: (state) => {
            if (!state.isInCombat) return;
             state.isInCombat = false;
             state.eventLog.push({ id: `elog-${Date.now()}`, message: `Kamu berhasil kabur.`, type: 'info' });
             state.combatLog = []; // Clear combat log on flee
             state.currentNodeId = null; // Signal end of combat
        },
        craftItem: (state, action: PayloadAction<Recipe>) => {
            const recipe = action.payload;
            
            // 1. Check if player has ingredients
            const hasIngredients = recipe.ingredients.every(ing => {
                const itemInInv = state.player.inventory.find(i => i.itemId === ing.itemId);
                return itemInInv && itemInInv.quantity >= ing.quantity;
            });

            if(hasIngredients) {
                 // 2. Consume ingredients
                recipe.ingredients.forEach(ing => {
                    const itemInInv = state.player.inventory.find(i => i.itemId === ing.itemId)!;
                    itemInInv.quantity -= ing.quantity;
                });
                // remove items with 0 quantity
                state.player.inventory = state.player.inventory.filter(i => i.quantity > 0);

                // 3. Add result item
                const existingResultItem = state.player.inventory.find(i => i.itemId === recipe.result.itemId);
                if (existingResultItem) {
                    existingResultItem.quantity += recipe.result.quantity;
                } else {
                    state.player.inventory.push({ ...recipe.result });
                }
                state.eventLog.push({ id: `craft-${Date.now()}`, message: `Kamu berhasil membuat ${codex.items[recipe.result.itemId].name}.`, type: 'reward' });
            }
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(generateAndStartChapter.pending, (state) => {
                state.isLoading = true;
                state.error = null;
                state.currentChapter = null;
                state.currentNodeId = null;
            })
            .addCase(generateAndStartChapter.fulfilled, (state, action: PayloadAction<Chapter>) => {
                state.currentChapter = action.payload;
                // Assuming the first node is the starting node
                const startNode = action.payload.nodes.find(node => node.nodeId === 'start') || action.payload.nodes[0];
                if (startNode) {
                    state.currentNodeId = startNode.nodeId;
                    state.currentLocation = startNode.location;
                    state.currentTimeOfDay = startNode.timeOfDay || 'siang';
                }
                state.isLoading = false;
                 // Auto-save on new chapter
                saveGame('player1', state);
            })
            .addCase(generateAndStartChapter.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });
    },
});

export const {
    setLoading,
    setNarrativeComplete,
    startGame,
    loadGame,
    setPlayerCharacter,
    makeChoice,
    closeChapterEndModal,
    attack,
    flee,
    craftItem
} = gameSlice.actions;

export default gameSlice.reducer;