// types.ts
import { codex } from './core/codex';

export type ItemId = keyof typeof codex.items;
export type SkillId = keyof typeof codex.skills;
export type EnemyId = keyof typeof codex.enemies;
export type FactionId = 'sisa_kemanusiaan' | 'gerombolan_besi' | 'teknokrat';
export type AttributeId = 'kekuatan' | 'ketangkasan' | 'kecerdasan' | 'karisma';
export type StoryEffectType = 'CHANGE_HP' | 'ADD_ITEM' | 'REMOVE_ITEM' | 'CHANGE_REPUTATION' | 'ADD_XP' | 'SET_FLAG' | 'START_COMBAT';
export type ConditionType = 'ATTRIBUTE' | 'HAS_ITEM' | 'HAS_SKILL';


export interface Item {
  itemId: ItemId;
  quantity: number;
}

export interface Reputation {
  [factionId: string]: number;
}

export interface StoryFlags {
  [flag: string]: boolean;
}

export interface PlayerAttributes {
  kekuatan: number;
  ketangkasan: number;
  kecerdasan: number;
  karisma: number;
}

export interface Player {
  name: string;
  hp: number;
  maxHp: number;
  xp: number;
  level: number;
  unspentAttributePoints: number; 
  inventory: Item[];
  reputation: Reputation;
  storyFlags: StoryFlags;
  attributes: PlayerAttributes;
  backgroundId: string | null;
  skillId: SkillId | null;
}

export interface ChoiceCondition {
    type: ConditionType;
    key: AttributeId | ItemId | SkillId;
    value: number; // For attributes: min value. For items: min quantity. For skills: ignored.
}

export interface StoryEffect {
  type: StoryEffectType;
  key: string; // e.g., ItemId, FactionId, EnemyId etc.
  value: number;
}

export interface ChapterNodeChoice {
  text: string;
  targetNodeId: string;
  condition?: ChoiceCondition[]; 
  effects: StoryEffect[];
}

export interface ChapterNode {
  nodeId: string;
  narrative: string;
  isChapterEnd?: boolean;
  choices: ChapterNodeChoice[];
  location: string;
  effects?: StoryEffect[];
}

export interface Chapter {
  chapterId: string;
  nodes: ChapterNode[];
  startNodeId: string;
}

export interface EventLogMessage {
    id: number;
    message: string;
    type: 'success' | 'danger' | 'neutral';
}

// NEW: For combat
export interface Enemy {
    name: string;
    hp: number;
    attack: number;
    defense: number;
    xp_reward: number;
}

// NEW: for combat log
export interface CombatLogEntry {
    id: number;
    message: string;
    turn: 'player' | 'enemy' | 'info';
}

export interface GameState {
  player: Player;
  currentChapter: Chapter | null;
  currentNodeId: string | null;
  currentLocation: string;
  isLoading: boolean;
  gameStarted: boolean;
  error: string | null;
  eventLog: EventLogMessage[];
  isChapterEndModalOpen: boolean;
  isNarrativeComplete: boolean;
  // NEW: Combat State
  isInCombat: boolean;
  currentEnemyId: EnemyId | null;
  enemyCurrentHp: number;
  combatLog: CombatLogEntry[];
}

// NEW: for crafting & quests
export interface Recipe {
    name: string;
    ingredients: { itemId: ItemId; quantity: number }[];
    output: { itemId: ItemId; quantity: number };
}
export interface Quest {
    name: string;
    description: string;
}