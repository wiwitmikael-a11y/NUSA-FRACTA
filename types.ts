// types.ts

// --- ID Types ---
export type AttributeId = 'kekuatan' | 'ketangkasan' | 'kecerdasan' | 'karisma';
export type FactionId = 'sisa_kemanusiaan' | 'gerombolan_besi' | 'teknokrat' | 'geng_bangsat' | 'pemburu_agraria' | 'republik_merdeka' | 'saudagar_jalanan' | 'sekte_pustaka';
export type ItemId = string;
export type SkillId = string;
export type BackgroundId = string;
export type EnemyId = string;
export type QuestId = string;
export type NodeId = string;
export type ChapterId = string;
export type TimeOfDay = 'pagi' | 'siang' | 'sore' | 'malam';
export type EquipmentSlot = 'meleeWeapon' | 'armor';

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
  equippedItems: Partial<Record<EquipmentSlot, ItemId>>;
  reputation: Record<FactionId, number>;
  storyFlags: Record<QuestId, boolean | number>;
  attributes: PlayerAttributes;
  backgroundId: BackgroundId | null;
  skillId: SkillId | null;
  portraitUrl: string | null;
  skrip: number;
}

// --- Story & Narrative ---
export interface ChapterNodeChoice {
  text: string;
  targetNodeId: NodeId;
  condition?: ChoiceCondition[];
  effects?: ChoiceEffect[];
}

export interface ChoiceCondition {
  type: 'ATTRIBUTE' | 'HAS_ITEM' | 'HAS_SKILL' | 'HAS_SKRIP';
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

// --- Random Events ---
export interface RandomEventEffect {
    type: 'GAIN_ITEM' | 'LOSE_ITEM' | 'GAIN_XP' | 'CHANGE_HP' | 'CHANGE_REPUTATION' | 'START_COMBAT' | 'SET_FLAG' | 'NOTHING' | 'CHANGE_SKRIP';
    key?: ItemId | FactionId | EnemyId | QuestId;
    value?: number;
    message: string;
}

export interface RandomEventChoice {
  text: string;
  condition?: ChoiceCondition[];
  effects: RandomEventEffect[];
}

export interface RandomEvent {
  id: string;
  type: 'dialogue' | 'trade' | 'discovery' | 'threat';
  triggerCondition?: (state: GameState) => boolean;
  npc: {
      name: string;
      portraitKey: string;
      faction?: FactionId;
  };
  narrative: string;
  choices: RandomEventChoice[];
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
  // Random Event State
  currentRandomEvent: RandomEvent | null;
  activeNpc: { name: string; portraitUrl: string } | null;
}

// --- UI & Events ---
export interface EventLogMessage {
  id: string;
  message: string;
  type: 'reward' | 'info' | 'danger';
}

export interface CombatLogMessage {
  id:string;
  message: string;
  turn: 'player' | 'enemy' | 'system'; // System for things like dodge/crit
  type?: 'damage' | 'dodge' | 'critical';
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
  type: 'weapon' | 'consumable' | 'key' | 'material' | 'misc' | 'armor';
  equipmentSlot?: EquipmentSlot;
  effects?: Effect[];
  value: number;
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
  skripDrop: [number, number];
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
  key: AttributeId | 'melee_damage_bonus' | 'healing_effectiveness' | 'flee_chance_bonus' | 'xp_gain_bonus' | 'loot_find_bonus' | 'base_hp_bonus' | 'damage_resistance' | 'dodge_chance' | 'critical_hit_chance' | 'better_prices_bonus' | 'reputation_gain_bonus' | 'crafting_resource_saver_chance' | 'status_effect_resistance' | 'flat_damage_bonus';
  value: number;
}