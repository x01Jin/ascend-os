import { GameState } from '../types';
import { INITIAL_GAME_STATE, AUTOMINER_DEFAULT_INTERVAL } from '../constants';

export type SaveMode = 'NORMAL' | 'DEV';

export const KEY_NORMAL = "ascend_game_state_v2";
export const KEY_DEV = "ascend_dev_state_v1";
export const KEY_MODE = "ascend_save_mode";

export const getSaveMode = (): SaveMode => {
    try {
        const mode = localStorage.getItem(KEY_MODE);
        return (mode === 'DEV') ? 'DEV' : 'NORMAL';
    } catch {
        return 'NORMAL';
    }
};

export const setSaveMode = (mode: SaveMode) => {
    try {
        localStorage.setItem(KEY_MODE, mode);
    } catch (e) {
        console.error("Failed to set save mode", e);
    }
};

export const loadGame = (mode: SaveMode): GameState | null => {
  try {
    const key = mode === 'DEV' ? KEY_DEV : KEY_NORMAL;
    const stored = localStorage.getItem(key);
    
    // Fallback for Normal mode to older keys if v2 not found
    const dataToLoad = stored || (mode === 'NORMAL' ? (localStorage.getItem("ascend_game_state_v2") || localStorage.getItem("ascend_game_state_v1")) : null);

    if (dataToLoad) {
      const parsed = JSON.parse(dataToLoad);
      
      // Migration: clickerCount -> dataKB (old v1)
      if (parsed.clickerCount !== undefined && parsed.dataKB === undefined && parsed.storageKB === undefined) {
        parsed.dataKB = parsed.clickerCount;
        delete parsed.clickerCount;
      }

      // Migration: storageKB -> dataKB (previous v2)
      if (parsed.storageKB !== undefined && parsed.dataKB === undefined) {
          parsed.dataKB = parsed.storageKB;
          delete parsed.storageKB;
      }

      // Migration: efficiencyBoostEndTime -> boostBank[2]
      if (parsed.efficiencyBoostEndTime && parsed.efficiencyBoostEndTime > Date.now()) {
          const remaining = parsed.efficiencyBoostEndTime - Date.now();
          parsed.boostBank = { 2: remaining, 3: 0, 4: 0, 5: 0 };
          delete parsed.efficiencyBoostEndTime;
      }

      // Ensure boostBank structure exists
      if (!parsed.boostBank) {
          parsed.boostBank = { 2: 0, 3: 0, 4: 0, 5: 0 };
      }

      // Migration: Auto Miner fields
      if (parsed.autoMinerData === undefined) {
          parsed.autoMinerData = 0;
      }
      if (parsed.autoMinerInterval === undefined) {
          parsed.autoMinerInterval = AUTOMINER_DEFAULT_INTERVAL;
      }

      // Ensure wallpaper field exists
      if (parsed.wallpaper === undefined) {
          parsed.wallpaper = undefined;
      }
      
      // Migration: Run Seed
      if (!parsed.runSeed) {
          parsed.runSeed = Date.now();
      }
      
      // Migration: Consumed IDs
      if (!parsed.consumedIds) {
          parsed.consumedIds = [];
      }
      
      // Migration: Modified Nodes
      if (!parsed.modifiedNodes) {
          parsed.modifiedNodes = {};
      }

      // Migration: Core Settings
      if (parsed.isDevModeEnabled === undefined) {
        parsed.isDevModeEnabled = false;
      }
      if (parsed.isAscendRootEnabled === undefined) {
        parsed.isAscendRootEnabled = false;
      }

      // Force Dev flags off if loading Normal save (safety check)
      if (mode === 'NORMAL') {
          parsed.isDevModeEnabled = false;
          parsed.isAscendRootEnabled = false;
      }

      // Merge with initial to ensure new fields exist if added later
      return { ...INITIAL_GAME_STATE, ...parsed };
    }
  } catch (e) {
    console.error("Failed to load game state", e);
  }
  return null;
};

export const saveGame = (state: GameState, mode: SaveMode): void => {
  try {
    const key = mode === 'DEV' ? KEY_DEV : KEY_NORMAL;
    localStorage.setItem(key, JSON.stringify(state));
  } catch (e) {
    console.error("Failed to save game state", e);
    if (state.wallpaper) {
        try {
            console.warn("Attempting to save without wallpaper due to storage error");
            const safeState = { ...state, wallpaper: undefined };
            const key = mode === 'DEV' ? KEY_DEV : KEY_NORMAL;
            localStorage.setItem(key, JSON.stringify(safeState));
        } catch (retryError) {
            console.error("Critical save failure", retryError);
        }
    }
  }
};

export const resetSave = (mode: SaveMode): void => {
    const key = mode === 'DEV' ? KEY_DEV : KEY_NORMAL;
    localStorage.removeItem(key);
};

export const factoryReset = (): void => {
    localStorage.removeItem(KEY_NORMAL);
    localStorage.removeItem(KEY_DEV);
    localStorage.removeItem(KEY_MODE);
    localStorage.removeItem("ascend_game_state_v1"); // Cleanup old v1
};

export const exportSave = (state: GameState): string => {
    return JSON.stringify(state, null, 2);
};

export const validateSave = (json: string): GameState | null => {
    try {
        const parsed = JSON.parse(json);
        // Basic schema check: ensure essential fields exist
        if (
            typeof parsed.currentIteration !== 'number' || 
            typeof parsed.dataKB !== 'number' ||
            !Array.isArray(parsed.shortcuts)
        ) {
            return null;
        }
        return parsed as GameState;
    } catch (e) {
        return null;
    }
};