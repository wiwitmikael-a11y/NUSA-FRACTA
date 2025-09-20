import type { GameState } from '../types';

const SAVE_GAME_KEY = 'nusa-fracta-save';

export const saveGame = (playerId: string, worldState: GameState): void => {
  try {
    const stateToSave = JSON.stringify(worldState);
    localStorage.setItem(SAVE_GAME_KEY, stateToSave);
  } catch (error) {
    console.error("Failed to save game:", error);
  }
};

export const loadGame = (playerId: string): GameState | null => {
  try {
    const savedData = localStorage.getItem(SAVE_GAME_KEY);
    if (savedData) {
      return JSON.parse(savedData) as GameState;
    }
    return null;
  } catch (error) {
    console.error("Failed to load game:", error);
    return null;
  }
};