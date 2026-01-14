import { AppId, GameState } from './types';

export const APP_NAME = "Ascend OS";
export const STORAGE_KEY = "ascend_game_state_v2"; // Incremented version
export const SCAN_COST = 10240; // 10 MB in KB
export const CLICK_VALUE_BASE = 50; // 50 KB base
export const CLICK_UPGRADE_INCREMENT = 5; // +5 KB per level

// Costs
export const UPGRADE_COST_BASE = 10240; // 10 MB start
export const BOOST_COST_BASE_PER_SEC = 5120; // 5 MB per second base
export const AUTOMARK_COST_PER_UNIT = 5120; // 5 MB per mark

// Auto Miner Defaults
export const AUTOMINER_DEFAULT_INTERVAL = 3000; // 3 seconds
export const AUTOMINER_MIN_INTERVAL = 300; // 0.3 seconds cap

export const DESKTOP_GRID = {
  WIDTH: 96,
  HEIGHT: 112,
  MARGIN_TOP: 20,
  MARGIN_LEFT: 20
};

export const START_MENU_ITEMS = [
  { id: AppId.EXPLORER, label: 'File Explorer', icon: 'Folder' },
  { id: AppId.CLICKER, label: 'Data Miner', icon: 'Cpu' },
  { id: AppId.UPDATES, label: 'System Updates', icon: 'Download' },
  { id: AppId.HELP, label: 'System Help', icon: 'HelpCircle' },
];

export const INITIAL_GAME_STATE: GameState = {
  currentIteration: 1,
  highScore: 1,
  dataKB: 0,
  shortcuts: [
    { id: 'sc_explorer', appId: AppId.EXPLORER, label: 'File Explorer', gridX: 0, gridY: 0 },
    { id: 'sc_miner', appId: AppId.CLICKER, label: 'Data Miner', gridX: 0, gridY: 1 },
    { id: 'sc_updates', appId: AppId.UPDATES, label: 'System Updates', gridX: 0, gridY: 2 }
  ],
  wallpaper: undefined,
  efficiencyLevel: 0,
  boostBank: { 2: 0, 3: 0, 4: 0, 5: 0 },
  activeBoostMultiplier: null,
  autoMarkCount: 0,
  isAutoMarkEnabled: false,
  autoMinerData: 0,
  autoMinerInterval: AUTOMINER_DEFAULT_INTERVAL,
  runSeed: 0, // 0 indicates uninitialized, will be replaced by storage loader or init
  consumedIds: [],
  modifiedNodes: {},
  isDevModeEnabled: false,
  isAscendRootEnabled: false
};