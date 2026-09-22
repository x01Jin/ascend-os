import { AppId, GameState } from './types';

export const APP_NAME = 'Ascend OS';
export const SCAN_COST = 10 * 1024;
export const scanCostFor = (iteration: number): number =>
  SCAN_COST + (Math.max(1, iteration) - 1) * (2 * 1024);
export const CLICK_VALUE_BASE = 50;
export const CLICK_UPGRADE_INCREMENT = 5;
export const LOCATE_COST_BASE = 5 * 1024;
export const locateCostFor = (iteration: number): number =>
  LOCATE_COST_BASE + (Math.max(1, iteration) - 1) * (2 * 1024);

export const UPGRADE_COST_BASE = 10 * 1024;
export const UPGRADE_COST_GROWTH = 1.35;
export const BOOST_COST_BASE_PER_SEC = 5 * 1024;
export const AUTOMARK_COST_PER_UNIT = 5 * 1024;
export const MAP_UNLOCK_COST = 100 * 1024;
export const RADAR_UNLOCK_COST = 250 * 1024;

export const AUTOMINER_DEFAULT_INTERVAL = 3000;
export const AUTOMINER_MIN_INTERVAL = 300;
export const OFFLINE_YIELD_RATE = 0.5;
export const OFFLINE_YIELD_CAP_MS = 8 * 3600 * 1000;

export const DESKTOP_GRID = {
  WIDTH: 96,
  HEIGHT: 112,
  MARGIN_TOP: 20,
  MARGIN_LEFT: 20,
};

export const START_MENU_ITEMS = [
  { id: AppId.EXPLORER, label: 'File Explorer', icon: 'Folder' },
  { id: AppId.CLICKER, label: 'Data Miner', icon: 'Cpu' },
  { id: AppId.UPDATES, label: 'System Updates', icon: 'Download' },
  { id: AppId.ACHIEVEMENTS, label: 'Achievements', icon: 'Trophy' },
  { id: AppId.HELP, label: 'System Help', icon: 'HelpCircle' },
];

export const INITIAL_GAME_STATE: GameState = {
  currentIteration: 1,
  highScore: 1,
  dataKB: 0,
  shortcuts: [
    { id: 'sc_explorer', appId: AppId.EXPLORER, label: 'File Explorer', gridX: 0, gridY: 0 },
    { id: 'sc_miner', appId: AppId.CLICKER, label: 'Data Miner', gridX: 0, gridY: 1 },
    { id: 'sc_updates', appId: AppId.UPDATES, label: 'System Updates', gridX: 0, gridY: 2 },
  ],
  wallpaper: undefined,
  efficiencyLevel: 0,
  boostBank: { 2: 0, 3: 0, 4: 0, 5: 0 },
  activeBoostMultiplier: null,
  autoMarkCount: 0,
  isAutoMarkEnabled: false,
  autoMinerData: 0,
  autoMinerInterval: AUTOMINER_DEFAULT_INTERVAL,
  lastTickAt: 0,
  runSeed: 0,
  consumedIds: [],
  modifiedNodes: {},
  isDevModeEnabled: false,
  isAscendRootEnabled: false,
  achievements: {},
  secretsFound: [],
  loreSeen: [],
  stats: {
    totalMinedKB: 0,
    scans: 0,
    ascensions: 0,
    packagesOpened: 0,
    modulesInstalled: 0,
    logoClicks: 0,
  },
  secretsZipSeen: false,
  hasSeenThankYou: false,
  arcadeWins: {},
  passes: 0,
  fuelPaidIter: 0,
  ghostSolvedIter: 0,
  revealedDepths: [0, 1],
  exploredDirIds: [],
  unlockedTools: [],
};
