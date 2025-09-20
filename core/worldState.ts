import type { GameState } from '../types';

export const initialGameState: GameState = {
  player: {
    name: 'Penyintas',
    hp: 100,
    maxHp: 100,
    xp: 0,
    level: 1,
    unspentAttributePoints: 1, // Start with 1 point
    inventory: [{ itemId: 'pipa_besi', quantity: 1 }, { itemId: 'perban', quantity: 2}],
    reputation: {
      'sisa_kemanusiaan': 0,
      'gerombolan_besi': 0,
      'teknokrat': 0,
    },
    storyFlags: {},
    attributes: {
      kekuatan: 5,
      ketangkasan: 5,
      kecerdasan: 5,
      karisma: 5,
    },
    backgroundId: null,
    skillId: null,
  },
  currentChapter: null,
  currentNodeId: null,
  currentLocation: 'Titik Awal',
  isLoading: false,
  gameStarted: false,
  error: null,
  eventLog: [],
  isChapterEndModalOpen: false,
  isNarrativeComplete: false,
  // Combat State
  isInCombat: false,
  currentEnemyId: null,
  enemyCurrentHp: 0,
  combatLog: [],
};