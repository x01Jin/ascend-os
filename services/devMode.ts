import { GameState } from '../types';

export const ENABLE_DEV_MODE = false;

const INFINITE_DATA_AMOUNT = 999_999_999_999;

export const processDevMode = (state: GameState): GameState => {
  if (ENABLE_DEV_MODE) {
    console.warn(
      '%c[DEV MODE] Infinite Data Enabled',
      'background: #f00; color: #fff; padding: 4px; font-weight: bold;'
    );
    return {
      ...state,
      dataKB: INFINITE_DATA_AMOUNT,
    };
  }
  return state;
};
