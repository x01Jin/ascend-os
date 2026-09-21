export enum FileType {
  FILE = 'FILE',
  FOLDER = 'FOLDER',
  PACKAGE = 'PACKAGE',
  MODULE = 'MODULE',
}

export enum FileExtension {
  TXT = 'txt',
  EXE = 'exe',
  PKG = 'pkg',
  MOD = 'mod',
  ZIP = 'zip',
}

export interface PackageContent {
  type: 'DATA' | 'AUTOMARK' | 'BOOST' | 'AUTOMINER_POWER' | 'AUTOMINER_SPEED';
  value: number;
  multiplier?: number;
}

export type MarkKind = 'manual' | 'auto' | 'gate';

export interface FileNode {
  id: string;
  name: string;
  type: FileType.FILE | FileType.PACKAGE | FileType.MODULE;
  extension: FileExtension;
  content: string; // Text content or special instructions for EXE
  packageContent?: PackageContent;
  parentId: string | null;
  isMarked?: boolean;
  markKind?: MarkKind; // gate marks render purple and pulse
  isWinningPath?: boolean; // True if this file is ascend.exe
  isScanned?: boolean; // True if revealed by signal tracer
  password?: string; // Set for locked puzzle files, checked by TextViewer
  secretId?: string; // Secret awarded when this file is solved or read
  loreId?: string; // Lore fragment shown or awarded with this file
  special?: boolean; // Puzzle txt files, rendered with a subtle glow
}

export interface DirectoryNode {
  id: string;
  name: string;
  type: FileType.FOLDER;
  children: (FileNode | DirectoryNode)[];
  parentId: string | null;
  isMarked?: boolean;
  markKind?: MarkKind;
  isWinningPath?: boolean; // True if this folder leads to ascend.exe
  isScanned?: boolean; // True if revealed by signal tracer
}

export type FileSystemNode = FileNode | DirectoryNode;

export enum AppId {
  EXPLORER = 'explorer',
  TEXT_VIEWER = 'text_viewer',
  CLICKER = 'clicker',
  HELP = 'help',
  ASCENSION = 'ascension',
  UPDATES = 'updates',
  PERSONALIZE = 'personalize',
  CORE_SETTINGS = 'core_settings',
  ACHIEVEMENTS = 'achievements',
  ARCADE = 'arcade',
  CARTOGRAPHER = 'cartographer',
  RADAR = 'radar',
  EGG = 'egg',
}

export interface DesktopShortcut {
  id: string;
  appId: AppId;
  label: string;
  gridX: number;
  gridY: number;
}

export interface NodeModification {
  name?: string;
  isMarked?: boolean;
  markKind?: MarkKind;
  isScanned?: boolean;
}

export interface GameStats {
  totalMinedKB: number;
  scans: number;
  ascensions: number;
  packagesOpened: number;
  modulesInstalled: number;
  logoClicks: number;
}

export interface GameState {
  currentIteration: number;
  highScore: number;
  dataKB: number; // Currency in Kilobytes (Renamed from storageKB)
  shortcuts: DesktopShortcut[];
  wallpaper?: string; // Base64 string of the background image

  // Upgrades & Boosts
  efficiencyLevel: number; // +5KB per level

  // New Boost System
  boostBank: Record<number, number>; // Multiplier -> Milliseconds remaining
  activeBoostMultiplier: number | null; // Currently active multiplier

  autoMarkCount: number; // Amount of auto-marks available
  isAutoMarkEnabled: boolean; // Toggle state for Explorer

  // Auto Miner Stats
  autoMinerData: number; // KB per tick
  autoMinerInterval: number; // ms per tick

  // Randomness & Persistence
  runSeed: number; // Random seed for this playthrough to ensure unique start
  consumedIds: string[]; // List of consumed/deleted file IDs to prevent refresh exploits
  modifiedNodes: Record<string, NodeModification>; // Persistence for Renames, Marks, and Scans

  // Core / Dev Settings
  isDevModeEnabled: boolean;
  isAscendRootEnabled: boolean;

  // Progression: achievements, secrets, lore
  achievements: Record<string, number>;
  secretsFound: string[];
  loreSeen: string[];
  stats: GameStats;
  secretsZipSeen: boolean;
  hasSeenThankYou: boolean;

  // Ascension gate + tools
  arcadeWins: Record<string, number>; // game id -> iteration last beaten
  passes: number; // minigame passes held
  fuelPaidIter: number; // iteration the ascend fuel fee was paid for
  unlockedTools: string[]; // 'map' | 'radar'
}

export interface WindowState {
  id: string;
  appId: AppId;
  title: string;
  zIndex: number;
  isMinimized: boolean;
  isMaximized?: boolean;
  data?: any; // For passing file content or path
  position?: { x: number; y: number };
}

export enum NotificationType {
  INFO = 'INFO',
  SUCCESS = 'SUCCESS',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  duration?: number;
}
