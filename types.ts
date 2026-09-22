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
  multiplier?: BoostMultiplier;
}

export type BoostMultiplier = 2 | 3 | 4 | 5;

export type MarkKind = 'manual' | 'auto' | 'gate';

export interface FileNode {
  id: string;
  name: string;
  type: FileType.FILE | FileType.PACKAGE | FileType.MODULE;
  extension: FileExtension;
  content: string;
  packageContent?: PackageContent;
  parentId: string | null;
  isMarked?: boolean;
  markKind?: MarkKind;
  isWinningPath?: boolean;
  isScanned?: boolean;
  password?: string;
  secretId?: string;
  loreId?: string;
  special?: boolean;
}

export interface DirectoryNode {
  id: string;
  name: string;
  type: FileType.FOLDER;
  children: (FileNode | DirectoryNode)[];
  parentId: string | null;
  isMarked?: boolean;
  markKind?: MarkKind;
  isWinningPath?: boolean;
  isScanned?: boolean;
}

export type FileSystemNode = FileNode | DirectoryNode;

export interface TeleportTarget {
  dirId: string;
  nonce: number;
  windowId: string | null;
}

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
  MINIGAME = 'arcade',
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
  dataKB: number;
  shortcuts: DesktopShortcut[];
  wallpaper?: string;

  efficiencyLevel: number;

  boostBank: Record<BoostMultiplier, number>;
  activeBoostMultiplier: BoostMultiplier | null;

  autoMarkCount: number;
  isAutoMarkEnabled: boolean;

  autoMinerData: number;
  autoMinerInterval: number;
  lastTickAt: number;

  runSeed: number;
  consumedIds: string[];
  modifiedNodes: Record<string, NodeModification>;

  isDevModeEnabled: boolean;
  isAscendRootEnabled: boolean;

  achievements: Record<string, number>;
  secretsFound: string[];
  loreSeen: string[];
  stats: GameStats;
  secretsZipSeen: boolean;
  hasSeenThankYou: boolean;

  arcadeWins: Record<string, number>;
  passes: number;
  fuelPaidIter: number;
  revealedDepths: number[];
  exploredDirIds: string[];
  triangulated: Record<string, 1 | 2 | 3>;
  locatedMinigames: string[];
  unlockedTools: string[];
}

export interface WindowState {
  id: string;
  appId: AppId;
  title: string;
  zIndex: number;
  isMinimized: boolean;
  isMaximized?: boolean;
  data?: unknown;
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
