// store/gameSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { initialGameState } from '../core/worldState';
import { generateChapter, generateRandomEvent as generateRandomEventFromGemini } from '../services/geminiService';
import { codex } from '../core/codex';
import { randomEvents } from '../core/events';
import { calculatePlayerDamage, calculateEnemyDamage, checkLevelUp, calculatePlayerDefense } from '../core/gameRules';
import { getFactionImageUrl, getNpcImageUrl } from '../services/assetService';
import type { RootState } from './store';
import type { GameState, Chapter, ChapterNodeChoice, Player, Recipe, PlayerAttributes, ItemId, RandomEventChoice, RandomEvent, EquipmentSlot, AttributeId, EnemyId, ChoiceEffect, InventoryItem, CompanionId, FactionId } from '../types';
import { saveGame } from '../services/storageService';

export const generateRandomEvent = createAsyncThunk<RandomEvent, void, { state: RootState }>(
    'game/generateRandomEvent',
    async (_, { getState, rejectWithValue }) => {
        try {
            const currentState = getState().game;
            const event = await generateRandomEventFromGemini(currentState);
            return event;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

const applyEffects = (state: GameState, effects: (ChoiceEffect | RandomEventChoice['effects'][0])[]) => {
     effects.forEach(effect => {
        let message = effect.message;
        
        switch(effect.type) {
            case 'GAIN_ITEM':
                if (effect.key && typeof effect.value === 'number') {
                    const itemIndex = state.player.inventory.findIndex(i => i.itemId === effect.key);
                    if (itemIndex > -1) {
                        state.player.inventory[itemIndex].quantity += effect.value;
                    } else {
                        state.player.inventory.push({ itemId: effect.key as ItemId, quantity: effect.value });
                    }
                    state.eventLog.push({ id: `elog-${Date.now()}`, message, type: 'reward' });
                }
                break;
            case 'LOSE_ITEM':
                if (effect.key && typeof effect.value === 'number') {
                    const itemIndex = state.player.inventory.findIndex(i => i.itemId === effect.key);
                    if (itemIndex > -1) {
                        state.player.inventory[itemIndex].quantity -= effect.value;
                        if (state.player.inventory[itemIndex].quantity <= 0) {
                            state.player.inventory.splice(itemIndex, 1);
                        }
                        state.eventLog.push({ id: `elog-${Date.now()}`, message, type: 'info' });
                    }
                }
                break;
            case 'CHANGE_HP':
                 if (typeof effect.value === 'number') {
                    state.player.hp = Math.max(0, Math.min(state.player.maxHp, state.player.hp + effect.value));
                    state.eventLog.push({ id: `elog-${Date.now()}`, message, type: effect.value < 0 ? 'danger' : 'reward' });
                 }
                break;
            case 'GAIN_XP':
                 if (typeof effect.value === 'number') {
                    state.player.xp += effect.value;
                     const playerAfterLevelCheck = checkLevelUp(state.player);
                     if(playerAfterLevelCheck.level > state.player.level) {
                          state.eventLog.push({ id: `elog-${Date.now()}-lvl`, message: `Selamat! Kamu mencapai Level ${playerAfterLevelCheck.level}!`, type: 'reward' });
                     }
                     state.player = playerAfterLevelCheck;
                    state.eventLog.push({ id: `elog-${Date.now()}`, message, type: 'reward' });
                 }
                break;
            case 'SET_FLAG':
                 if (effect.key && typeof effect.value !== 'undefined') {
                    state.player.storyFlags[effect.key] = effect.value;
                    state.eventLog.push({ id: `elog-${Date.now()}`, message, type: 'info' });
                 }
                break;
            case 'START_COMBAT':
                if (effect.key) {
                    const enemyId = effect.key as EnemyId;
                    const enemy = codex.enemies[enemyId];
                    if (enemy) {
                        state.isInCombat = true;
                        state.currentEnemyId = enemyId;
                        state.enemyCurrentHp = enemy.hp;
                        state.combatLog = [{ id: `clog-${Date.now()}`, message: `${enemy.name} muncul!`, source: 'system' }];
                        state.eventLog.push({ id: `elog-${Date.now()}`, message: effect.message, type: 'danger' });
                    }
                }
                break;
            case 'RECRUIT_COMPANION':
                if (effect.key) {
                    const companionId = effect.key as CompanionId;
                    if (!state.player.companions.includes(companionId)) {
                        state.player.companions.push(companionId);
                        state.player.activeCompanion = companionId; // Automatically activate
                        state.eventLog.push({ id: `elog-${Date.now()}`, message, type: 'reward' });
                    }
                }
                break;
            case 'CHANGE_SKRIP':
                if (typeof effect.value === 'number') {
                    state.player.skrip += effect.value;
                    state.eventLog.push({ id: `elog-${Date.now()}`, message, type: effect.value > 0 ? 'reward' : 'info' });
                }
                break;
            case 'CHANGE_REPUTATION':
                if (effect.key && typeof effect.value === 'number') {
                    const factionId = effect.key as FactionId;
                    // FIX: Ensure faction reputation is initialized before changing it.
                    if (state.player.reputation[factionId] === undefined) {
                        state.player.reputation[factionId] = 0;
                    }
                    state.player.reputation[factionId] += effect.value;
                    state.eventLog.push({ id: `elog-${Date.now()}`, message, type: 'info' });
                }
                break;
             case 'NOTHING':
                state.eventLog.push({ id: `elog-${Date.now()}`, message, type: 'info' });
                break;
        }
    });
}


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

const nextChapterPool = [
      { title: "Gema dari Bawah Tanah", objective: "Sebuah sinyal aneh terdeteksi dari stasiun MRT bawah tanah. Cari tahu sumbernya, tapi waspadalah terhadap apa yang mungkin bersembunyi di kegelapan." },
      { title: "Tawaran Saudagar", objective: "Seorang Saudagar Jalanan yang berpengaruh menawarkan kesepakatan yang terlalu bagus untuk menjadi kenyataan. Selidiki motif mereka dan putuskan apakah akan mempercayai mereka atau tidak." },
      { title: "Genggaman Geng Bangsat", objective: "Geng Bangsat telah mengambil alih sebuah pabrik tua, mengancam pemukiman terdekat. Infiltrasi markas mereka dan sabotase operasi mereka." },
      { title: "Bisikan Sang Pustakawan", objective: "Seorang anggota Sekte Pustaka mendekatimu dengan sebuah permintaan misterius: menemukan sebuah terminal data kuno yang tersembunyi di dalam gedung perkantoran yang runtuh." },
      { title: "Perburuan di Taman Kota", objective: "Pemburu Agraria melaporkan adanya anomali berbahaya yang bersarang di Taman Kota yang dulunya indah. Buru dan musnahkan ancaman tersebut." }
];

export const startNextChapter = createAsyncThunk<void, void, { state: RootState }>(
    'game/startNextChapter',
    async (_, { getState, dispatch }) => {
        const state = getState().game;

        const objectiveContext = `Setelah menyelesaikan bab "${state.currentChapter?.title}", ${state.player.name} (Level ${state.player.level}) kini berada di ${state.currentLocation}.`;
        
        const randomNextChapter = nextChapterPool[Math.floor(Math.random() * nextChapterPool.length)];
        const newObjective = `${objectiveContext} ${randomNextChapter.objective}`;

        dispatch(closeChapterEndModal());
        dispatch(generateAndStartChapter({
            title: randomNextChapter.title,
            objective: newObjective
        }));
    }
);

const handleDefeat = (state: GameState) => {
    const skripLost = Math.floor(state.player.skrip * 0.20);
    state.player.skrip = Math.max(0, state.player.skrip - skripLost);
    state.player.hp = 1;

    state.eventLog.push({ 
        id: `defeat-${Date.now()}`, 
        message: `Kamu dikalahkan! Kamu kehilangan ${skripLost} Skrip dan nyaris tidak selamat.`, 
        type: 'danger' 
    });

    state.isInCombat = false;
    state.currentEnemyId = null;
    state.combatLog = [];
    if (state.currentRandomEvent) {
        state.currentRandomEvent = null;
        state.activeNpc = null;
    }
    state.isNarrativeComplete = true;
    state.error = null;
};


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
            if (!state.player.visitedLocations.includes(state.currentLocation)) {
                state.player.visitedLocations.push(state.currentLocation);
            }
        },
        resetGame: (state) => {
            Object.assign(state, initialGameState);
        },
        loadGame: (state, action: PayloadAction<GameState>) => {
            return {
                ...action.payload,
                isLoading: false,
                gameStarted: true,
            };
        },
        addInfoLog: (state, action: PayloadAction<string>) => {
            state.eventLog.push({ id: `elog-${Date.now()}`, message: action.payload, type: 'info' });
        },
        _setStaticRandomEvent: (state, action: PayloadAction<RandomEvent>) => {
            const event = action.payload;
            state.currentRandomEvent = event;

            if (event.npc.name !== 'Sistem') {
                let portraitUrl: string | null = null;
                if (event.npc.faction) {
                    portraitUrl = getFactionImageUrl(event.npc.faction as any);
                } else {
                    portraitUrl = getNpcImageUrl();
                }
                
                if (portraitUrl) {
                    state.activeNpc = { name: event.npc.name, portraitUrl };
                } else {
                     state.activeNpc = { name: event.npc.name, portraitUrl: '' }; // fallback
                }
            } else {
                state.activeNpc = null;
            }
        
            state.isNarrativeComplete = false; // Reset for event narrative
        },
        setPlayerCharacter: (state, action: PayloadAction<{ name: string; backgroundId: string; skillId: string; attributes: PlayerAttributes }>) => {
            const { name, backgroundId, skillId, attributes } = action.payload;
            const background = codex.backgrounds[backgroundId];
            const skill = codex.skills[skillId];

            state.player = {
                ...initialGameState.player,
                name,
                backgroundId,
                skillId,
                attributes: attributes,
                portraitUrl: background?.portraitUrl || null,
                inventory: [],
                equippedItems: {},
            };
            
            state.player.skrip = 75;

            // Atur perlengkapan awal berdasarkan balancing baru
            switch (backgroundId) {
                case 'mantan_tentara': // +2 Str -> Strong melee, weak armor
                    state.player.equippedItems.meleeWeapon = 'golok';
                    state.player.equippedItems.armor = 'jaket_kulit_usang';
                    state.player.inventory.push({ itemId: 'perban', quantity: 3 }, { itemId: 'stimulan', quantity: 1 });
                    break;
                case 'kurir_cepat': // +2 Dex -> Strong ranged, weak armor
                    state.player.equippedItems.rangedWeapon = 'busur_rakitan';
                    state.player.equippedItems.armor = 'jaket_kulit_usang';
                    state.player.inventory.push({ itemId: 'air_kemasan', quantity: 3 }, { itemId: 'kopi_instan', quantity: 2 });
                    break;
                case 'teknisi_jalanan': // +2 Int -> Medium ranged, medium armor
                    state.player.equippedItems.rangedWeapon = 'pistol_rakitan';
                    state.player.equippedItems.armor = 'rompi_improvisasi';
                    state.player.inventory.push({ itemId: 'komponen_elektronik', quantity: 5 }, { itemId: 'baterai_bekas', quantity: 3 });
                    break;
                case 'negosiator_pasar_gelap': // +2 Cha -> Weak melee, strong armor
                    state.player.equippedItems.meleeWeapon = 'pisau_dapur';
                    state.player.equippedItems.armor = 'rompi_balistik_rusak';
                    state.player.inventory.push({ itemId: 'air_kemasan', quantity: 2 }, { itemId: 'kopi_instan', quantity: 3 });
                    state.player.skrip += 100;
                    break;
                
                // Mixed backgrounds
                case 'pengawal_pribadi': // +1 Str, +1 Dex -> Strong melee, weak armor
                    state.player.equippedItems.meleeWeapon = 'bat_baseball';
                    state.player.equippedItems.armor = 'jaket_kulit_usang';
                    state.player.inventory.push({ itemId: 'perban', quantity: 2 }, { itemId: 'stimulan', quantity: 1 });
                    break;
                case 'petani_hidroponik': // +1 Int, +1 Str -> Balanced melee & armor
                    state.player.equippedItems.meleeWeapon = 'kunci_inggris';
                    state.player.equippedItems.armor = 'rompi_improvisasi';
                    state.player.inventory.push({ itemId: 'air_kemasan', quantity: 3 }, { itemId: 'makanan_kaleng', quantity: 2 });
                    break;
                case 'pemulung': // +1 Int, +1 Dex -> Balanced ranged & armor
                    state.player.equippedItems.rangedWeapon = 'senapan_angin';
                    state.player.equippedItems.armor = 'rompi_improvisasi';
                    state.player.inventory.push({ itemId: 'kain_bekas', quantity: 5 }, { itemId: 'komponen_elektronik', quantity: 3 });
                    break;
                case 'seniman_grafiti': // +1 Dex, +1 Cha -> Weak ranged, medium armor
                    state.player.equippedItems.rangedWeapon = 'senapan_angin';
                    state.player.equippedItems.armor = 'rompi_improvisasi';
                    state.player.inventory.push({ itemId: 'keripik_basi', quantity: 3 }, { itemId: 'selotip', quantity: 2 });
                    break;
                case 'pustakawan_kiamat': // +1 Int, +1 Cha -> Weak melee, medium armor
                    state.player.equippedItems.meleeWeapon = 'kunci_inggris';
                    state.player.equippedItems.armor = 'rompi_improvisasi';
                    state.player.inventory.push({ itemId: 'data_chip', quantity: 1 }, { itemId: 'perban', quantity: 2 });
                    break;
                case 'kultis_puing': // +1 Cha, +1 Int -> Weak melee, medium armor
                    state.player.equippedItems.meleeWeapon = 'pisau_dapur';
                    state.player.equippedItems.armor = 'rompi_improvisasi';
                    state.player.inventory.push({ itemId: 'artefak_aneh', quantity: 1 }, { itemId: 'kain_bekas', quantity: 2 });
                    break;

                default: // Fallback
                    state.player.equippedItems.meleeWeapon = 'pipa_besi';
                    state.player.inventory.push({ itemId: 'perban', quantity: 2 }, { itemId: 'keripik_basi', quantity: 1 });
                    break;
            }

            if (skill) {
                const hpBonusEffect = skill.effects.find(e => e.type === 'SKILL_BONUS' && e.key === 'base_hp_bonus');
                if (hpBonusEffect) {
                    const baseHp = initialGameState.player.maxHp;
                    state.player.maxHp = Math.round(baseHp * (1 + hpBonusEffect.value / 100));
                    state.player.hp = state.player.maxHp;
                }
            }
        },
        closeChapterEndModal: (state) => {
            state.isChapterEndModalOpen = false;
        },
        setActiveCompanion: (state, action: PayloadAction<CompanionId | null>) => {
            state.player.activeCompanion = action.payload;
        },
        resolveEventChoice: (state, action: PayloadAction<RandomEventChoice>) => {
            applyEffects(state, action.payload.effects);
            state.currentRandomEvent = null;
            state.activeNpc = null;
            state.isNarrativeComplete = true;
        },
        increaseAttribute: (state, action: PayloadAction<AttributeId>) => {
            if (state.player.unspentAttributePoints > 0) {
                state.player.attributes[action.payload]++;
                state.player.unspentAttributePoints--;
            }
        },
        useItem: (state, action: PayloadAction<ItemId>) => {
            const itemId = action.payload;
            const itemIndex = state.player.inventory.findIndex(i => i.itemId === itemId);
            const itemDetails = codex.items[itemId];

            if (itemIndex > -1 && itemDetails?.type === 'consumable' && itemDetails.effects) {
                itemDetails.effects.forEach(effect => {
                    if (effect.key === 'healing_effectiveness') {
                        const healAmount = effect.value;
                        state.player.hp = Math.min(state.player.maxHp, state.player.hp + healAmount);
                        state.eventLog.unshift({ id: `elog-${Date.now()}`, message: `Kamu menggunakan ${itemDetails.name}, memulihkan ${healAmount} HP.`, type: 'reward'});
                    }
                });

                state.player.inventory[itemIndex].quantity--;
                if (state.player.inventory[itemIndex].quantity <= 0) {
                    state.player.inventory.splice(itemIndex, 1);
                }
            }
        },
        equipItem: (state, action: PayloadAction<ItemId>) => {
            const itemDetails = codex.items[action.payload];
            if (itemDetails?.equipmentSlot) {
                const { equipmentSlot } = itemDetails;
                const currentItem = state.player.equippedItems[equipmentSlot];
                
                // Unequip current item if one exists
                if (currentItem) {
                    const itemIndex = state.player.inventory.findIndex(i => i.itemId === currentItem);
                    if (itemIndex > -1) {
                        state.player.inventory[itemIndex].quantity++;
                    } else {
                        state.player.inventory.push({ itemId: currentItem, quantity: 1 });
                    }
                }
                
                state.player.equippedItems[equipmentSlot] = action.payload;
            }
        },
        unequipItem: (state, action: PayloadAction<EquipmentSlot>) => {
            const slot = action.payload;
            const itemId = state.player.equippedItems[slot];
            if (itemId) {
                delete state.player.equippedItems[slot];
                const itemIndex = state.player.inventory.findIndex(i => i.itemId === itemId);
                if (itemIndex > -1) {
                    state.player.inventory[itemIndex].quantity++;
                } else {
                    state.player.inventory.push({ itemId, quantity: 1 });
                }
            }
        },
        craftItem: (state, action: PayloadAction<Recipe>) => {
            const { recipe } = { recipe: action.payload };
            const canCraft = recipe.ingredients.every(ing => 
                state.player.inventory.find(i => i.itemId === ing.itemId && i.quantity >= ing.quantity)
            );

            if (canCraft) {
                // Consume ingredients
                recipe.ingredients.forEach(ing => {
                    const itemIndex = state.player.inventory.findIndex(i => i.itemId === ing.itemId)!;
                    state.player.inventory[itemIndex].quantity -= ing.quantity;
                });
                
                // Add crafted item
                const resultItemIndex = state.player.inventory.findIndex(i => i.itemId === recipe.result.itemId);
                if (resultItemIndex > -1) {
                    state.player.inventory[resultItemIndex].quantity += recipe.result.quantity;
                } else {
                    state.player.inventory.push({ ...recipe.result });
                }

                // Clean up inventory from zero-quantity items
                state.player.inventory = state.player.inventory.filter(i => i.quantity > 0);

                state.eventLog.unshift({ id: `elog-${Date.now()}`, message: `Berhasil membuat ${codex.items[recipe.result.itemId].name}.`, type: 'reward'});
            }
        },
        flee: (state) => {
            if (!state.isInCombat) return;
            const fleeChance = 50 + (state.player.attributes.ketangkasan * 2);
            if (Math.random() * 100 < fleeChance) {
                state.isInCombat = false;
                state.eventLog.unshift({ id: `elog-${Date.now()}`, message: "Kamu berhasil kabur!", type: 'info' });
            } else {
                state.combatLog.unshift({ id: `clog-${Date.now()}`, message: "Gagal kabur!", source: 'system' });
                const enemy = codex.enemies[state.currentEnemyId!];
                const enemyDamage = Math.max(1, calculateEnemyDamage(enemy) - calculatePlayerDefense(state.player));
                state.player.hp -= enemyDamage;
                state.combatLog.unshift({ id: `clog-${Date.now() + 1}`, message: `${enemy.name} menyerang saat kamu kabur, kamu kehilangan ${enemyDamage} HP.`, source: 'enemy', type: 'damage' });
                if (state.player.hp <= 0) handleDefeat(state);
            }
        },
        attack: (state) => {
            if (!state.isInCombat || !state.currentEnemyId) return;
            const enemy = codex.enemies[state.currentEnemyId];
            const playerDefense = calculatePlayerDefense(state.player);

            // --- Player attacks ---
            const { damage: playerDamage, isCritical } = calculatePlayerDamage(state.player);
            const finalPlayerDamage = Math.max(1, playerDamage - enemy.defense);
            state.enemyCurrentHp -= finalPlayerDamage;
            state.combatLog.unshift({ id: `clog-${Date.now()}`, message: `${state.player.name} ${isCritical ? 'melancarkan serangan KRITIS dan' : ''} memberikan ${finalPlayerDamage} kerusakan.`, source: 'player', type: isCritical ? 'critical' : 'damage' });

            // --- Check for victory after player attack ---
            if (state.enemyCurrentHp <= 0) {
                const { xpValue, skripDrop, lootTable } = enemy;
                state.player.xp += xpValue;
                const skripGain = Math.floor(Math.random() * (skripDrop[1] - skripDrop[0] + 1)) + skripDrop[0];
                state.player.skrip += skripGain;
                state.eventLog.unshift({ id: `elog-${Date.now()}`, message: `Kamu mengalahkan ${enemy.name}! Mendapatkan ${xpValue} XP & ${skripGain} Skrip.`, type: 'reward' });
                lootTable.forEach(loot => {
                    if (Math.random() < loot.chance) {
                        const quantity = Math.floor(Math.random() * (loot.quantity[1] - loot.quantity[0] + 1)) + loot.quantity[0];
                        const itemIndex = state.player.inventory.findIndex(i => i.itemId === loot.itemId);
                        if (itemIndex > -1) {
                            state.player.inventory[itemIndex].quantity += quantity;
                        } else {
                            state.player.inventory.push({ itemId: loot.itemId, quantity });
                        }
                        state.eventLog.unshift({ id: `elog-${Date.now() + 1}`, message: `Mendapatkan ${quantity} ${codex.items[loot.itemId].name}.`, type: 'reward' });
                    }
                });
                state.player = checkLevelUp(state.player);
                state.isInCombat = false;
                return; // End combat turn
            }
            
            // --- Companion attacks ---
            if (state.player.activeCompanion === 'davina') {
                const companion = codex.companions.davina;
                const companionDamage = Math.max(1, companion.bonusValue - enemy.defense);
                state.enemyCurrentHp -= companionDamage;
                state.combatLog.unshift({ id: `clog-${Date.now() + 0.5}`, message: `${companion.name} membantu, memberikan ${companionDamage} kerusakan.`, source: 'companion', type: 'damage' });
                
                // --- Check for victory after companion attack ---
                if (state.enemyCurrentHp <= 0) {
                     const { xpValue, skripDrop, lootTable } = enemy;
                    state.player.xp += xpValue;
                    const skripGain = Math.floor(Math.random() * (skripDrop[1] - skripDrop[0] + 1)) + skripDrop[0];
                    state.player.skrip += skripGain;
                    state.eventLog.unshift({ id: `elog-${Date.now()}`, message: `Kamu mengalahkan ${enemy.name}! Mendapatkan ${xpValue} XP & ${skripGain} Skrip.`, type: 'reward' });
                    lootTable.forEach(loot => {
                        if (Math.random() < loot.chance) {
                            const quantity = Math.floor(Math.random() * (loot.quantity[1] - loot.quantity[0] + 1)) + loot.quantity[0];
                            const itemIndex = state.player.inventory.findIndex(i => i.itemId === loot.itemId);
                            if (itemIndex > -1) {
                                state.player.inventory[itemIndex].quantity += quantity;
                            } else {
                                state.player.inventory.push({ itemId: loot.itemId, quantity });
                            }
                            state.eventLog.unshift({ id: `elog-${Date.now() + 1}`, message: `Mendapatkan ${quantity} ${codex.items[loot.itemId].name}.`, type: 'reward' });
                        }
                    });
                    state.player = checkLevelUp(state.player);
                    state.isInCombat = false;
                    return; // End combat turn
                }
            }

            // --- Enemy attacks ---
            const dodgeChance = (state.player.attributes.ketangkasan - 5) * 2 + (codex.skills[state.player.skillId!]?.effects.find(e => e.key === 'dodge_chance')?.value || 0);
            if (Math.random() * 100 < dodgeChance) {
                 state.combatLog.unshift({ id: `clog-${Date.now() + 1}`, message: "Kamu berhasil menghindar!", source: 'system', type: 'dodge' });
            } else {
                const enemyDamage = Math.max(1, calculateEnemyDamage(enemy) - playerDefense);
                state.player.hp -= enemyDamage;
                state.combatLog.unshift({ id: `clog-${Date.now() + 1}`, message: `${enemy.name} menyerang, kamu kehilangan ${enemyDamage} HP.`, source: 'enemy', type: 'damage' });
                if (state.player.hp <= 0) handleDefeat(state);
            }
        },
        internal_makeChoice: (state, action: PayloadAction<ChapterNodeChoice>) => {
            state.currentRandomEvent = null;
            state.activeNpc = null;
            const choice = action.payload;

            if (choice.check) {
                const { attribute, difficulty } = choice.check;
                const attributeValue = state.player.attributes[attribute];
                let modifier = Math.floor((attributeValue - 5) / 2);
                let companionBonus = 0;
                let companionName = '';

                if (state.player.activeCompanion) {
                    const companion = codex.companions[state.player.activeCompanion];
                    if (companion.bonusType === 'SKILL_CHECK' && companion.bonusKey === attribute) {
                        companionBonus = companion.bonusValue;
                        companionName = companion.name;
                    }
                }

                const roll = Math.floor(Math.random() * 20) + 1;
                const total = roll + modifier + companionBonus;
                
                const bonusText = companionBonus > 0 ? ` + ${companionBonus} (${companionName})` : '';
                const baseLog = `(Cek ${attribute}: ${roll} + ${modifier}${bonusText} = ${total}, Butuh: ${difficulty})`;

                if (total >= difficulty) {
                    state.eventLog.push({ id: `elog-${Date.now()}`, message: `(Berhasil) ${baseLog}`, type: 'reward' });
                    if (choice.effects) applyEffects(state, choice.effects);
                    
                     const nextNode = state.currentChapter?.nodes.find(node => node.nodeId === choice.targetNodeId);
                     if (nextNode) {
                        state.currentNodeId = nextNode.nodeId;
                        state.currentLocation = nextNode.location;
                        state.currentTimeOfDay = nextNode.timeOfDay || state.currentTimeOfDay;
                        if (!state.player.visitedLocations.includes(nextNode.location)) {
                            state.player.visitedLocations.push(nextNode.location);
                        }
                        state.isNarrativeComplete = false;
                        if (nextNode.isChapterEnd) {
                            state.isChapterEndModalOpen = true;
                        }
                    }
                } else {
                    state.eventLog.push({ id: `elog-${Date.now()}`, message: `(Gagal) ${baseLog}`, type: 'danger' });
                    if (choice.failureEffects) applyEffects(state, choice.failureEffects);
                    state.isNarrativeComplete = true; 
                }
            } else {
                if (choice.effects) applyEffects(state, choice.effects);
                const nextNode = state.currentChapter?.nodes.find(node => node.nodeId === choice.targetNodeId);
                if (nextNode) {
                    state.currentNodeId = nextNode.nodeId;
                    state.currentLocation = nextNode.location;
                    state.currentTimeOfDay = nextNode.timeOfDay || state.currentTimeOfDay;
                     if (!state.player.visitedLocations.includes(nextNode.location)) {
                        state.player.visitedLocations.push(nextNode.location);
                    }
                    state.isNarrativeComplete = false;
                    if (nextNode.isChapterEnd) {
                        state.isChapterEndModalOpen = true;
                    }
                } else {
                    state.error = `Pilihan salah: Tidak dapat menemukan node tujuan '${choice.targetNodeId}'.`;
                }
            }

            if (state.isInCombat) {
                state.isNarrativeComplete = true;
            }
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(generateAndStartChapter.pending, (state) => {
                state.isLoading = true;
                state.error = null;
                state.currentChapter = null;
                state.currentNodeId = null;
                state.eventLog = []; 
            })
            .addCase(generateAndStartChapter.fulfilled, (state, action: PayloadAction<Chapter>) => {
                state.currentChapter = action.payload;
                const startNode = action.payload.nodes.find(node => node.nodeId === 'start') || action.payload.nodes[0];
                if (startNode) {
                    state.currentNodeId = startNode.nodeId;
                    state.currentLocation = startNode.location;
                    state.currentTimeOfDay = startNode.timeOfDay || 'siang';
                    if (!state.player.visitedLocations.includes(startNode.location)) {
                        state.player.visitedLocations.push(startNode.location);
                    }
                }
                state.isLoading = false;
                saveGame('player1', state);
            })
            .addCase(generateAndStartChapter.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(startNextChapter.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(generateRandomEvent.pending, (state) => {
                // Optional: add a subtle loading indicator for the event itself
            })
            .addCase(generateRandomEvent.fulfilled, (state, action: PayloadAction<RandomEvent>) => {
                const event = action.payload;
                state.currentRandomEvent = event;
                if (event.npc.name !== 'Sistem') {
                    const portraitUrl = event.npc.faction ? getFactionImageUrl(event.npc.faction) : getNpcImageUrl();
                    if (portraitUrl) {
                        state.activeNpc = { name: event.npc.name, portraitUrl };
                    }
                }
                state.isNarrativeComplete = false;
            })
            .addCase(generateRandomEvent.rejected, (state, action) => {
                console.warn("Gagal membuat event dinamis, fallback ke tidak ada event.", action.payload);
                state.currentRandomEvent = null;
                state.activeNpc = null;
                state.isNarrativeComplete = true; // prevent getting stuck
            });
    },
});

export const makeChoice = (choice: ChapterNodeChoice) => (dispatch: any, getState: () => RootState) => {
    dispatch(gameSlice.actions.internal_makeChoice(choice));
    
    // Logic for triggering random events is now here, preventing mutation of readonly state
    const postChoiceState = getState().game;
    
    if (postChoiceState.currentNodeId && !postChoiceState.isInCombat && !postChoiceState.currentChapter?.nodes.find(n => n.nodeId === postChoiceState.currentNodeId)?.isChapterEnd) {
        // 25% chance to trigger any event
        if (Math.random() <= 0.25) {
            // Of that 25%, 50% chance to be a dynamic Gemini event
            if (Math.random() < 0.50) {
                dispatch(generateRandomEvent());
            } else {
                // Trigger a static event
                const possibleEvents = randomEvents.filter(event => 
                    event.triggerCondition ? event.triggerCondition(postChoiceState) : true
                );

                if (possibleEvents.length > 0) {
                    const event = possibleEvents[Math.floor(Math.random() * possibleEvents.length)];
                    dispatch(gameSlice.actions._setStaticRandomEvent(event));
                }
            }
        }
    }
    
    saveGame('player1', getState().game);
};

export const {
    setLoading,
    setNarrativeComplete,
    startGame,
    loadGame,
    resetGame,
    addInfoLog,
    setPlayerCharacter,
    closeChapterEndModal,
    setActiveCompanion,
    attack, 
    flee, 
    craftItem, 
    useItem, 
    increaseAttribute, 
    equipItem, 
    unequipItem, 
    resolveEventChoice,
    _setStaticRandomEvent
} = gameSlice.actions;

export default gameSlice.reducer;