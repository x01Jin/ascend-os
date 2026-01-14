export enum FileType {
  FILE = 'FILE',
  FOLDER = 'FOLDER',
  PACKAGE = 'PACKAGE',
  MODULE = 'MODULE'
}

export enum FileExtension {
  TXT = 'txt',
  EXE = 'exe',
  PKG = 'pkg',
  MOD = 'mod'
}

export interface PackageContent {
  type: 'DATA' | 'AUTOMARK' | 'BOOST' | 'AUTOMINER_POWER' | 'AUTOMINER_SPEED';
  value: number;
  multiplier?: number;
}

export interface FileNode {
  id: string;
  name: string;
  type: FileType.FILE | FileType.PACKAGE | FileType.MODULE;
  extension: FileExtension;
  content: string; // Text content or special instructions for EXE
  packageContent?: PackageContent;
  parentId: string | null;
  isMarked?: boolean;
  isWinningPath?: boolean; // True if this file is ascend.exe
  isScanned?: boolean;     // True if revealed by signal tracer
}

export interface DirectoryNode {
  id: string;
  name: string;
  type: FileType.FOLDER;
  children: (FileNode | DirectoryNode)[];
  parentId: string | null;
  isMarked?: boolean;
  isWinningPath?: boolean; // True if this folder leads to ascend.exe
  isScanned?: boolean;     // True if revealed by signal tracer
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
  CORE_SETTINGS = 'core_settings'
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
  isScanned?: boolean;
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
}

export interface WindowState {
  id: string;
  appId: AppId;
  title: string;
  zIndex: number;
  isMinimized: boolean;
  data?: any; // For passing file content or path
  position?: { x: number; y: number };
}

export enum NotificationType {
  INFO = 'INFO',
  SUCCESS = 'SUCCESS',
  WARNING = 'WARNING',
  ERROR = 'ERROR'
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  duration?: number;
}