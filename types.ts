// types.ts

// --- ID Types ---
export type AttributeId = 'kekuatan' | 'ketangkasan' | 'kecerdasan' | 'karisma';
export type FactionId = 'sisa_kemanusiaan' | 'gerombolan_besi' | 'teknokrat' | 'geng_bangsat' | 'pemburu_agraris' | 'republik_merdeka' | 'saudagar_jalanan' | 'sekte_pustaka';
export type ItemId = string;
export type SkillId = string;
export type BackgroundId = string;
export type EnemyId = string;
export type QuestId = string;
export type NodeId = string;
export type ChapterId = string;
export type TimeOfDay = 'pagi' | 'siang' | 'sore' | 'malam';

// --- Player & Character ---
export interface PlayerAttributes {
  kekuatan: number;
  ketangkasan: number;
  kecerdasan: number;
  karisma: number;
}

export interface InventoryItem {
  itemId: ItemId;
  quantity: number;
}

export interface Player {
  name: string;
  hp: number;
  maxHp: number;
  xp: number;
  level: number;
  unspentAttributePoints: number;
  inventory: InventoryItem[];
  reputation: Record<FactionId, number>;
  storyFlags: Record<QuestId, boolean | number>;
  attributes: PlayerAttributes;
  backgroundId: BackgroundId | null;
  skillId: SkillId | null;
  portraitUrl: string | null;
}

// --- Story & Narrative ---
export interface ChapterNodeChoice {
  text: string;
  targetNodeId: NodeId;
  condition?: ChoiceCondition[];
  effects?: ChoiceEffect[];
}

export interface ChoiceCondition {
  type: 'ATTRIBUTE' | 'HAS_ITEM' | 'HAS_SKILL';
  key: AttributeId | ItemId | SkillId;
  value: number;
}

export interface ChoiceEffect {
    type: 'GAIN_ITEM' | 'LOSE_ITEM' | 'GAIN_XP' | 'CHANGE_HP' | 'SET_FLAG' | 'START_COMBAT';
    key: ItemId | QuestId | EnemyId;
    value: number;
    message: string;
}

export interface ChapterNode {
  nodeId: NodeId;
  narrative: string;
  location: string;
  timeOfDay: TimeOfDay;
  choices: ChapterNodeChoice[];
  isChapterEnd?: boolean;
}

export interface Chapter {
  chapterId: ChapterId;
  title: string;
  objective: string;
  nodes: ChapterNode[];
}

// --- Game State ---
export interface GameState {
  player: Player;
  currentChapter: Chapter | null;
  currentNodeId: NodeId | null;
  currentLocation: string;
  currentTimeOfDay: TimeOfDay;
  isLoading: boolean;
  gameStarted: boolean;
  error: string | null;
  eventLog: EventLogMessage[];
  isChapterEndModalOpen: boolean;
  isNarrativeComplete: boolean;
  // Combat State
  isInCombat: boolean;
  currentEnemyId: EnemyId | null;
  enemyCurrentHp: number;
  combatLog: CombatLogMessage[];
}

// --- UI & Events ---
export interface EventLogMessage {
  id: string;
  message: string;
  type: 'reward' | 'info' | 'danger';
}

export interface CombatLogMessage {
  id: string;
  message: string;
  turn: 'player' | 'enemy';
}


// --- Codex Data ---
export interface Codex {
  items: Record<ItemId, Item>;
  skills: Record<SkillId, Skill>;
  backgrounds: Record<BackgroundId, Background>;
  enemies: Record<EnemyId, Enemy>;
  recipes: Record<string, Recipe>;
  quests: Record<QuestId, Quest>;
}

export interface Item {
  name: string;
  description: string;
  type: 'weapon' | 'consumable' | 'key' | 'material' | 'misc';
  effects?: any; // Simplified for now
}

export interface Skill {
  name: string;
  description: string;
  effects: Effect[];
}

export interface Background {
  name: string;
  description: string;
  effects: Effect[];
  portraitUrl: string;
}

export interface Enemy {
  name: string;
  description: string;
  hp: number;
  attack: number;
  defense: number;
  xpValue: number;
  lootTable: { itemId: ItemId; chance: number; quantity: [number, number] }[];
}

export interface Recipe {
    name: string;
    result: { itemId: ItemId; quantity: number };
    ingredients: { itemId: ItemId; quantity: number }[];
}

export interface Quest {
    name: string;
    description: string;
}

export interface Effect {
  type: 'ATTRIBUTE_MOD' | 'SKILL_BONUS';
  key: AttributeId | string;
  value: number;
}