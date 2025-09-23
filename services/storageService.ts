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

export const checkSaveExists = (playerId: string): boolean => {
    try {
        return localStorage.getItem(SAVE_GAME_KEY) !== null;
    } catch (error) {
        console.error("Failed to check for save game:", error);
        return false;
    }
};

export const deleteSave = (playerId: string): void => {
    try {
        localStorage.removeItem(SAVE_GAME_KEY);
    } catch (error) {
        console.error("Failed to delete save game:", error);
    }
};