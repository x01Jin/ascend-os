import { GameState } from '../types';

/**
 * DEVELOPER MODE CONFIGURATION
 * Change the value below to toggle features.
 * 1 = Enabled
 * 0 = Disabled
 */
// Explicitly type as number to avoid "no overlap" error when checking against 1 if value is 0
export const ENABLE_DEV_MODE: number = 0;

const INFINITE_DATA_AMOUNT = 999_999_999_999; // ~1 Petabyte

export const processDevMode = (state: GameState): GameState => {
  if (ENABLE_DEV_MODE === 1) {
    console.warn("%c[DEV MODE] Infinite Data Enabled", "background: #f00; color: #fff; padding: 4px; font-weight: bold;");
    return {
      ...state,
      dataKB: INFINITE_DATA_AMOUNT
    };
  }
  return state;
};