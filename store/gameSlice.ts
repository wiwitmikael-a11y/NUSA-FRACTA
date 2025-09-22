// store/gameSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { initialGameState } from '../core/worldState';
import { generateChapter } from '../services/geminiService';
import { codex } from '../core/codex';
import { randomEvents } from '../core/events';
import { calculatePlayerDamage, calculateEnemyDamage, checkLevelUp, calculatePlayerDefense, calculateXpForNextLevel } from '../core/gameRules';
import { getFactionImageUrl, getNpcImageUrl } from '../services/assetService';
import type { RootState } from './store';
import type { GameState, Chapter, ChapterNodeChoice, Player, Recipe, PlayerAttributes, ItemId, RandomEventChoice, RandomEvent, FactionId, EquipmentSlot, AttributeId, EnemyId, ChoiceEffect, InventoryItem } from '../types';
import { saveGame } from '../services/storageService';

// Helper function to trigger a random event
const triggerRandomEvent = (state: GameState): void => {
    // 25% chance to trigger an event
    if (Math.random() > 0.25) {
        state.currentRandomEvent = null;
        state.activeNpc = null;
        return;
    }
    
    const possibleEvents = randomEvents.filter(event => 
        event.triggerCondition ? event.triggerCondition(state) : true
    );

    if (possibleEvents.length > 0) {
        const event = possibleEvents[Math.floor(Math.random() * possibleEvents.length)];
        state.currentRandomEvent = event;

        if (event.npc.name !== 'Sistem') {
             let portraitUrl: string | null = null;
            if (event.npc.faction) {
                portraitUrl = getFactionImageUrl(event.npc.faction as any); // cast to any to match keys
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
    }
};

const applyEffects = (state: GameState, effects: ChoiceEffect[]) => {
     effects.forEach(effect => {
        let message = effect.message;
        
        switch(effect.type) {
            case 'GAIN_ITEM':
                if (effect.key && typeof effect.value === 'number') {
                    const existingItem = state.player.inventory.find(i => i.itemId === effect.key);
                    if (existingItem) {
                        existingItem.quantity += effect.value;
                    } else {
                        state.player.inventory.push({ itemId: effect.key as ItemId, quantity: effect.value });
                    }
                    state.eventLog.push({ id: `elog-${Date.now()}`, message, type: 'reward' });
                }
                break;
            case 'LOSE_ITEM':
                if (effect.key && typeof effect.value === 'number') {
                    const itemInInv = state.player.inventory.find(i => i.itemId === effect.key);
                    if (itemInInv) {
                        itemInInv.quantity -= effect.value;
                        state.player.inventory = state.player.inventory.filter(i => i.quantity > 0);
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
                        state.combatLog = [{ id: `clog-${Date.now()}`, message: `${enemy.name} muncul!`, turn: 'system' }];
                        state.eventLog.push({ id: `elog-${Date.now()}`, message: effect.message, type: 'danger' });
                    }
                }
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

        // Create a summary of player state for the next chapter objective
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

// Helper function for defeat
const handleDefeat = (state: GameState) => {
    const skripLost = Math.floor(state.player.skrip * 0.20);
    state.player.skrip = Math.max(0, state.player.skrip - skripLost);
    state.player.hp = 1; // Bangkit dengan 1 HP

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
    state.isNarrativeComplete = true; // Kembali ke narasi
    state.error = null; // Hapus error state
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
            const skill = codex.skills[skillId];

            state.player = {
                ...initialGameState.player,
                name,
                backgroundId,
                skillId,
                attributes: attributes, // Assign pre-calculated attributes directly
                portraitUrl: background?.portraitUrl || null,
            };

            // Berikan starter pack berdasarkan Latar Belakang (DITINGKATKAN)
            const starterInventory: InventoryItem[] = [];
            state.player.skrip = 75; // Skrip dasar ditingkatkan

            switch (backgroundId) {
                case 'pemulung':
                    starterInventory.push({ itemId: 'pipa_besi', quantity: 1 }, { itemId: 'kain_bekas', quantity: 5 }, { itemId: 'komponen_elektronik', quantity: 3 }, { itemId: 'selotip', quantity: 1 });
                    break;
                case 'mantan_tentara':
                    starterInventory.push({ itemId: 'golok', quantity: 1 }, { itemId: 'jaket_kulit_usang', quantity: 1 }, { itemId: 'perban', quantity: 3 }, { itemId: 'makanan_kaleng', quantity: 1 });
                    break;
                case 'teknisi_jalanan':
                    starterInventory.push({ itemId: 'kunci_inggris', quantity: 1 }, { itemId: 'komponen_elektronik', quantity: 5 }, { itemId: 'selotip', quantity: 2 }, { itemId: 'baterai_bekas', quantity: 2 });
                    break;
                case 'negosiator_pasar_gelap':
                    starterInventory.push({ itemId: 'pisau_dapur', quantity: 1 }, { itemId: 'air_kemasan', quantity: 2 }, { itemId: 'kopi_instan', quantity: 3 });
                    state.player.skrip += 75;
                    break;
                case 'kurir_cepat':
                    starterInventory.push({ itemId: 'pisau_dapur', quantity: 1 }, { itemId: 'air_kemasan', quantity: 3 }, { itemId: 'keripik_basi', quantity: 2 }, { itemId: 'kopi_instan', quantity: 2 });
                    break;
                 case 'pustakawan_kiamat':
                    starterInventory.push({ itemId: 'pipa_besi', quantity: 1 }, { itemId: 'data_chip', quantity: 1 }, { itemId: 'perban', quantity: 2 }, { itemId: 'kopi_instan', quantity: 2 });
                    break;
                case 'seniman_grafiti':
                    starterInventory.push({ itemId: 'pisau_dapur', quantity: 1 }, { itemId: 'keripik_basi', quantity: 3 }, { itemId: 'kain_bekas', quantity: 2 }, { itemId: 'air_kemasan', quantity: 1 });
                    break;
                case 'pengawal_pribadi':
                    starterInventory.push({ itemId: 'bat_baseball', quantity: 1 }, { itemId: 'jaket_kulit_usang', quantity: 1 }, { itemId: 'perban', quantity: 2 }, { itemId: 'stimulan', quantity: 1 });
                    break;
                case 'petani_hidroponik':
                    starterInventory.push({ itemId: 'pipa_besi', quantity: 1 }, { itemId: 'air_kemasan', quantity: 3 }, { itemId: 'makanan_kaleng', quantity: 2 }, { itemId: 'perban', quantity: 1 });
                    break;
                case 'kultis_puing':
                    starterInventory.push({ itemId: 'pipa_besi', quantity: 1 }, { itemId: 'artefak_aneh', quantity: 1 }, { itemId: 'keripik_basi', quantity: 2 }, { itemId: 'kain_bekas', quantity: 2 });
                    break;
                default:
                    starterInventory.push({ itemId: 'pipa_besi', quantity: 1 }, { itemId: 'perban', quantity: 2 }, { itemId: 'keripik_basi', quantity: 1 });
                    break;
            }
            state.player.inventory = starterInventory;


            // Terapkan bonus HP dasar dari keahlian (sebagai persentase)
            if (skill) {
                const hpBonusEffect = skill.effects.find(e => e.type === 'SKILL_BONUS' && e.key === 'base_hp_bonus');
                if (hpBonusEffect) {
                    const baseHp = initialGameState.player.maxHp;
                    state.player.maxHp = Math.round(baseHp * (1 + hpBonusEffect.value / 100));
                    state.player.hp = state.player.maxHp; // Mulai dengan HP penuh
                }
            }
        },
        makeChoice: (state, action: PayloadAction<ChapterNodeChoice>) => {
            // Clear previous event state
            state.currentRandomEvent = null;
            state.activeNpc = null;

            const choice = action.payload;

             // Terapkan efek dari pilihan
            if (choice.effects) {
                applyEffects(state, choice.effects);
            }

            // Jika pilihan memulai pertarungan, jangan lanjutkan ke node berikutnya
            if (state.isInCombat) {
                state.isNarrativeComplete = true;
                saveGame('player1', state);
                return;
            }

            const nextNode = state.currentChapter?.nodes.find(node => node.nodeId === choice.targetNodeId);

            if (nextNode) {
                state.currentNodeId = nextNode.nodeId;
                state.currentLocation = nextNode.location;
                state.currentTimeOfDay = nextNode.timeOfDay || state.currentTimeOfDay;
                state.isNarrativeComplete = false;

                if (nextNode.isChapterEnd) {
                    state.isChapterEndModalOpen = true;
                } else {
                    // Check for random event after a successful choice
                    triggerRandomEvent(state);
                }
            } else {
                state.error = `Pilihan salah: Tidak dapat menemukan node tujuan '${choice.targetNodeId}'.`;
            }
             // Auto-save on every choice
            saveGame('player1', state);
        },
        resolveEventChoice: (state, action: PayloadAction<RandomEventChoice>) => {
            const choice = action.payload;
            let combatStarted = false;
            
            // Apply effects
            choice.effects.forEach(effect => {
                let message = effect.message;
                
                switch(effect.type) {
                    case 'GAIN_ITEM':
                        if (effect.key && typeof effect.value === 'number') {
                            const existingItem = state.player.inventory.find(i => i.itemId === effect.key);
                            if (existingItem) {
                                existingItem.quantity += effect.value;
                            } else {
                                state.player.inventory.push({ itemId: effect.key as ItemId, quantity: effect.value });
                            }
                            state.eventLog.push({ id: `elog-${Date.now()}`, message, type: 'reward' });
                        }
                        break;
                    case 'LOSE_ITEM':
                        if (effect.key && typeof effect.value === 'number') {
                            const itemInInv = state.player.inventory.find(i => i.itemId === effect.key);
                            if (itemInInv) {
                                itemInInv.quantity -= effect.value;
                                state.player.inventory = state.player.inventory.filter(i => i.quantity > 0);
                                state.eventLog.push({ id: `elog-${Date.now()}`, message, type: 'info' });
                            }
                        }
                        break;
                    case 'CHANGE_SKRIP':
                        if (typeof effect.value === 'number') {
                            state.player.skrip += effect.value;
                            state.eventLog.push({ id: `elog-${Date.now()}`, message, type: 'info' });
                        }
                        break;
                    case 'CHANGE_REPUTATION':
                         if (effect.key && typeof effect.value === 'number') {
                             const factionId = effect.key as FactionId;
                             let repChange = effect.value;

                             // Bonus Reputasi dari Karisma untuk gain positif
                             if (repChange > 0) {
                                const charismaBonus = Math.floor((state.player.attributes.karisma - 5) / 2);
                                repChange += charismaBonus;
                                repChange = Math.max(1, repChange); // Pastikan minimal dapat 1
                             }
                             state.player.reputation[factionId] += repChange;
                             
                             // Terapkan bonus reputasi dari keahlian
                            if (effect.value > 0 && state.player.skillId) {
                                const skill = codex.skills[state.player.skillId];
                                const repBonusEffect = skill?.effects.find(e => e.type === 'SKILL_BONUS' && e.key === 'reputation_gain_bonus');
                                if (repBonusEffect) {
                                     const bonusRep = Math.ceil(effect.value * (repBonusEffect.value / 100));
                                     state.player.reputation[factionId] += bonusRep;
                                }
                            }
                             
                             state.eventLog.push({ id: `elog-${Date.now()}`, message, type: 'info' });
                         }
                        break;
                    case 'START_COMBAT':
                         if (effect.key) {
                            const enemyId = effect.key as EnemyId;
                            const enemy = codex.enemies[enemyId];
                            if (enemy) {
                                combatStarted = true;
                                state.isInCombat = true;
                                state.currentEnemyId = enemyId;
                                state.enemyCurrentHp = enemy.hp;
                                state.combatLog = [{ id: `clog-${Date.now()}`, message: `${enemy.name} muncul!`, turn: 'system' }];
                                state.eventLog.push({ id: `elog-${Date.now()}`, message: effect.message, type: 'danger' });
                            }
                        }
                        break;
                }
            });

            // Jika pertarungan dimulai, jangan selesaikan event. Biarkan state combat mengambil alih.
            // Event akan diselesaikan setelah combat berakhir.
            if (!combatStarted) {
                state.currentRandomEvent = null;
                state.activeNpc = null;
                state.isNarrativeComplete = true; // Allow main story choices to appear again
            }
        },
        closeChapterEndModal: (state) => {
            state.isChapterEndModalOpen = false;
        },
        attack: (state) => {
            if (!state.isInCombat || !state.currentEnemyId) return;

            const enemy = codex.enemies[state.currentEnemyId];
            
            // Player attacks
            const { damage: playerDamage, isCritical } = calculatePlayerDamage(state.player);
            state.enemyCurrentHp = Math.max(0, state.enemyCurrentHp - playerDamage);
            
            if (isCritical) {
                 state.combatLog.unshift({ id: `clog-${Date.now()}`, message: `Serangan Kritikal! Kamu menyerang ${enemy.name} dan memberikan ${playerDamage} kerusakan.`, turn: 'player', type: 'critical' });
            } else {
                 state.combatLog.unshift({ id: `clog-${Date.now()}`, message: `Kamu menyerang ${enemy.name} dan memberikan ${playerDamage} kerusakan.`, turn: 'player', type: 'damage' });
            }

            if (state.enemyCurrentHp <= 0) {
                // Enemy defeated
                state.isInCombat = false;
                
                let xpGained = enemy.xpValue;
                 // Periksa bonus XP dari keahlian
                if (state.player.skillId) {
                    const skill = codex.skills[state.player.skillId];
                    const xpBonusEffect = skill?.effects.find(e => e.type === 'SKILL_BONUS' && e.key === 'xp_gain_bonus');
                    if (xpBonusEffect) {
                        xpGained *= (1 + xpBonusEffect.value / 100);
                    }
                }
                xpGained = Math.round(xpGained);
                state.player.xp += xpGained;
                state.eventLog.push({ id: `elog-${Date.now()}`, message: `Kamu mengalahkan ${enemy.name} dan mendapatkan ${xpGained} XP.`, type: 'reward' });
                
                // Skrip Drop
                const skripGained = Math.floor(Math.random() * (enemy.skripDrop[1] - enemy.skripDrop[0] + 1)) + enemy.skripDrop[0];
                if (skripGained > 0) {
                    state.player.skrip += skripGained;
                    state.eventLog.push({ id: `skrip-${Date.now()}`, message: `Kamu mendapatkan ${skripGained} Skrip.`, type: 'reward' });
                }

                // Loot system
                enemy.lootTable.forEach(loot => {
                    if (Math.random() < loot.chance) {
                        const quantity = Math.floor(Math.random() * (loot.quantity[1] - loot.quantity[0] + 1)) + loot.quantity[0];
                        const existingItem = state.player.inventory.find(i => i.itemId === loot.itemId);
                        if (existingItem) {
                            existingItem.quantity += quantity;
                        } else {
                            state.player.inventory.push({ itemId: loot.itemId, quantity: quantity });
                        }
                        state.eventLog.push({ id: `loot-${Date.now()}-${loot.itemId}`, message: `Kamu mendapatkan: ${codex.items[loot.itemId].name} (x${quantity}).`, type: 'reward' });
                    }
                });

                // Periksa bonus loot tambahan dari keahlian
                if (state.player.skillId) {
                    const skill = codex.skills[state.player.skillId];
                    const lootBonusEffect = skill?.effects.find(e => e.type === 'SKILL_BONUS' && e.key === 'loot_find_bonus');
                    if (lootBonusEffect && (Math.random() * 100 < lootBonusEffect.value)) {
                        if (enemy.lootTable.length > 0) {
                             const extraLoot = enemy.lootTable[Math.floor(Math.random() * enemy.lootTable.length)];
                             const quantity = Math.floor(Math.random() * (extraLoot.quantity[1] - extraLoot.quantity[0] + 1)) + extraLoot.quantity[0];
                             const existingItem = state.player.inventory.find(i => i.itemId === extraLoot.itemId);
                             if (existingItem) {
                                 existingItem.quantity += quantity;
                             } else {
                                 state.player.inventory.push({ itemId: extraLoot.itemId, quantity });
                             }
                             state.eventLog.push({ id: `loot-${Date.now()}`, message: `(Keahlian) Kamu menemukan item tambahan: ${codex.items[extraLoot.itemId].name} (x${quantity}).`, type: 'reward' });
                        }
                    }
                }

                const playerBeforeLevel = state.player.level;
                const playerAfterLevelCheck = checkLevelUp(state.player);
                if(playerAfterLevelCheck.level > playerBeforeLevel) {
                     state.eventLog.push({ id: `elog-${Date.now()}-lvl`, message: `Selamat! Kamu mencapai Level ${playerAfterLevelCheck.level}!`, type: 'reward' });
                }
                state.player = playerAfterLevelCheck;

                // Jika combat berasal dari random event, selesaikan eventnya.
                if (state.currentRandomEvent) {
                    state.currentRandomEvent = null;
                    state.activeNpc = null;
                }

                // Kembali ke mode narasi normal
                state.currentEnemyId = null;
                state.isNarrativeComplete = true; 
                state.combatLog = []; // Bersihkan log pertarungan setelah menang

                saveGame('player1', state);
                return;
            }

            // Enemy attacks
            // Cek dodge
            let dodgeChance = 0;
             if (state.player.skillId) {
                const skill = codex.skills[state.player.skillId];
                const dodgeBonusEffect = skill?.effects.find(e => e.type === 'SKILL_BONUS' && e.key === 'dodge_chance');
                if (dodgeBonusEffect) {
                    dodgeChance = dodgeBonusEffect.value;
                }
            }
            if (Math.random() * 100 < dodgeChance) {
                 state.combatLog.unshift({ id: `clog-${Date.now() + 1}`, message: `Kamu berhasil menghindari serangan ${enemy.name}!`, turn: 'system', type: 'dodge' });
                 return;
            }

            const enemyDamage = calculateEnemyDamage(enemy);
            const playerDefense = calculatePlayerDefense(state.player);
            const finalDamage = Math.max(0, enemyDamage - playerDefense);

            state.player.hp -= finalDamage;
            state.combatLog.unshift({ id: `clog-${Date.now() + 1}`, message: `${enemy.name} menyerang dan kamu kehilangan ${finalDamage} HP.`, turn: 'enemy', type: 'damage' });

            if (state.player.hp <= 0) {
                handleDefeat(state);
            }
        },
        flee: (state) => {
            if (!state.isInCombat) return;
            
            let fleeChance = 75;
            if (state.player.skillId) {
                const skill = codex.skills[state.player.skillId];
                const fleeBonusEffect = skill?.effects.find(e => e.type === 'SKILL_BONUS' && e.key === 'flee_chance_bonus');
                if (fleeBonusEffect) {
                    fleeChance += fleeBonusEffect.value;
                }
            }

            if (Math.random() * 100 < fleeChance) {
                state.isInCombat = false;
                state.eventLog.push({ id: `elog-${Date.now()}`, message: `Kamu berhasil kabur.`, type: 'info' });
                state.combatLog = [];
                state.currentEnemyId = null;
                
                // Jika kabur dari random event, selesaikan eventnya.
                if (state.currentRandomEvent) {
                    state.currentRandomEvent = null;
                    state.activeNpc = null;
                }
                state.isNarrativeComplete = true; 
            } else {
                if (!state.currentEnemyId) return;
                const enemy = codex.enemies[state.currentEnemyId];
                state.eventLog.push({ id: `elog-${Date.now()}`, message: `Gagal kabur!`, type: 'danger' });
                
                const enemyDamage = calculateEnemyDamage(enemy);
                const playerDefense = calculatePlayerDefense(state.player);
                const finalDamage = Math.max(0, enemyDamage - playerDefense);

                state.player.hp -= finalDamage;
                state.combatLog.unshift({ id: `clog-${Date.now() + 1}`, message: `${enemy.name} menyerang saat kamu mencoba kabur, kamu kehilangan ${finalDamage} HP.`, turn: 'enemy' });

                if (state.player.hp <= 0) {
                    handleDefeat(state);
                }
            }
        },
        craftItem: (state, action: PayloadAction<Recipe>) => {
            const recipe = action.payload;
            
            const hasIngredients = recipe.ingredients.every(ing => {
                const itemInInv = state.player.inventory.find(i => i.itemId === ing.itemId);
                return itemInInv && itemInInv.quantity >= ing.quantity;
            });

            if(hasIngredients) {
                // Cek penghematan material dari keahlian
                let resourcesSaved = false;
                if (state.player.skillId) {
                    const skill = codex.skills[state.player.skillId];
                    const saverEffect = skill?.effects.find(e => e.type === 'SKILL_BONUS' && e.key === 'crafting_resource_saver_chance');
                    if (saverEffect && (Math.random() * 100 < saverEffect.value)) {
                        resourcesSaved = true;
                    }
                }
                
                if (!resourcesSaved) {
                    recipe.ingredients.forEach(ing => {
                        const itemInInv = state.player.inventory.find(i => i.itemId === ing.itemId);
                        if (itemInInv) {
                            itemInInv.quantity -= ing.quantity;
                        }
                    });
                    state.player.inventory = state.player.inventory.filter(i => i.quantity > 0);
                }
                
                const existingResultItem = state.player.inventory.find(i => i.itemId === recipe.result.itemId);
                if (existingResultItem) {
                    existingResultItem.quantity += recipe.result.quantity;
                } else {
                    state.player.inventory.push({ ...recipe.result });
                }

                let successMessage = `Kamu berhasil meracik ${codex.items[recipe.result.itemId].name}.`;
                if(resourcesSaved) successMessage += " (Keahlian) Kamu tidak menggunakan material apapun!";
                state.eventLog.push({ id: `craft-${Date.now()}`, message: successMessage, type: 'reward' });
            }
        },
        useItem: (state, action: PayloadAction<ItemId>) => {
            const itemId = action.payload;
            const itemInInventory = state.player.inventory.find(i => i.itemId === itemId);
            const itemData = codex.items[itemId];

            if (!itemInInventory || !itemData || itemData.type !== 'consumable') return;

            const healEffect = itemData.effects?.find(e => e.key === 'healing_effectiveness');
            if (healEffect) {
                let healAmount = healEffect.value;

                if (state.player.skillId) {
                    const skill = codex.skills[state.player.skillId];
                    const healBonusEffect = skill?.effects.find(e => e.type === 'SKILL_BONUS' && e.key === 'healing_effectiveness');
                    if (healBonusEffect) {
                        healAmount *= (1 + healBonusEffect.value / 100);
                    }
                }
                
                healAmount = Math.round(healAmount);
                state.player.hp = Math.min(state.player.maxHp, state.player.hp + healAmount);
                
                state.eventLog.push({ 
                    id: `use-${Date.now()}`, 
                    message: `Kamu menggunakan ${itemData.name} dan memulihkan ${healAmount} HP.`, 
                    type: 'reward' 
                });
            }

            itemInInventory.quantity -= 1;
            if (itemInInventory.quantity <= 0) {
                state.player.inventory = state.player.inventory.filter(i => i.itemId !== itemId);
            }
        },
        increaseAttribute: (state, action: PayloadAction<AttributeId>) => {
            if (state.player.unspentAttributePoints > 0) {
                state.player.attributes[action.payload]++;
                state.player.unspentAttributePoints--;
            }
        },
        equipItem: (state, action: PayloadAction<ItemId>) => {
            const itemId = action.payload;
            const itemData = codex.items[itemId];
            if (!itemData.equipmentSlot) return;

            const slot = itemData.equipmentSlot;
            const itemInInventory = state.player.inventory.find(i => i.itemId === itemId);
            if (!itemInInventory) return;

            // Unequip item in the same slot if any
            const currentlyEquipped = state.player.equippedItems[slot];
            if (currentlyEquipped) {
                const oldItem = state.player.inventory.find(i => i.itemId === currentlyEquipped);
                if (oldItem) {
                    oldItem.quantity++;
                } else {
                    state.player.inventory.push({ itemId: currentlyEquipped, quantity: 1 });
                }
            }

            // Equip the new item
            itemInInventory.quantity--;
            state.player.equippedItems[slot] = itemId;
            state.player.inventory = state.player.inventory.filter(i => i.quantity > 0);
        },
        unequipItem: (state, action: PayloadAction<EquipmentSlot>) => {
            const slot = action.payload;
            const equippedItemId = state.player.equippedItems[slot];
            if (!equippedItemId) return;

            // Add back to inventory
            const existingItem = state.player.inventory.find(i => i.itemId === equippedItemId);
            if (existingItem) {
                existingItem.quantity++;
            } else {
                state.player.inventory.push({ itemId: equippedItemId, quantity: 1 });
            }
            
            delete state.player.equippedItems[slot];
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(generateAndStartChapter.pending, (state) => {
                state.isLoading = true;
                state.error = null;
                state.currentChapter = null;
                state.currentNodeId = null;
                state.eventLog = []; // Kosongkan log untuk bab baru
            })
            .addCase(generateAndStartChapter.fulfilled, (state, action: PayloadAction<Chapter>) => {
                state.currentChapter = action.payload;
                const startNode = action.payload.nodes.find(node => node.nodeId === 'start') || action.payload.nodes[0];
                if (startNode) {
                    state.currentNodeId = startNode.nodeId;
                    state.currentLocation = startNode.location;
                    state.currentTimeOfDay = startNode.timeOfDay || 'siang';
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
    resolveEventChoice,
    closeChapterEndModal,
    attack,
    flee,
    craftItem,
    useItem,
    increaseAttribute,
    equipItem,
    unequipItem,
} = gameSlice.actions;

export default gameSlice.reducer;