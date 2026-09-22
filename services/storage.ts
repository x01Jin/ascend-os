import { AppId, GameState } from '../types';
import {
  AUTOMINER_DEFAULT_INTERVAL,
  AUTOMINER_MIN_INTERVAL,
  INITIAL_GAME_STATE,
} from '../constants';
import { nowMs } from './clock';

export type SaveMode = 'NORMAL' | 'DEV';

export const KEY_NORMAL = 'ascend_game_state_v2';
export const KEY_DEV = 'ascend_dev_state_v1';
export const KEY_MODE = 'ascend_save_mode';
export const KEY_WALLPAPER = 'ascend_wallpaper_v1';
export const MAX_SAVE_JSON_LENGTH = 6_000_000;
export const MAX_WALLPAPER_LENGTH = 4_000_000;

const slotKey = (mode: SaveMode): string => (mode === 'DEV' ? KEY_DEV : KEY_NORMAL);

const isFiniteNumber = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const isIntIn = (v: unknown, min: number, max: number): v is number =>
  typeof v === 'number' && Number.isInteger(v) && v >= min && v <= max;
const isStringArray = (v: unknown, maxItems: number, maxLen: number): v is string[] =>
  Array.isArray(v) &&
  v.length <= maxItems &&
  v.every(s => typeof s === 'string' && s.length <= maxLen);
const isIntArray = (v: unknown, maxItems: number, min: number, max: number): v is number[] =>
  Array.isArray(v) && v.length <= maxItems && v.every(n => isIntIn(n, min, max));

const validAppIds = new Set(Object.values(AppId));

export const quarantineSave = (key: string, raw: string): void => {
  try {
    const name = `${key}_corrupt_${Date.now()}`;
    localStorage.setItem(name, raw.slice(0, MAX_SAVE_JSON_LENGTH));
    const prefix = `${key}_corrupt_`;
    const corrupt: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith(prefix)) corrupt.push(k);
    }
    while (corrupt.length > 3) {
      let oldest = corrupt[0]!;
      for (const k of corrupt) if (k < oldest) oldest = k;
      localStorage.removeItem(oldest);
      corrupt.splice(corrupt.indexOf(oldest), 1);
    }
  } catch {
    // Quarantine is best-effort; the live slot is left untouched.
  }
};

export const backupSlot = (mode: SaveMode): void => {
  try {
    const key = slotKey(mode);
    const raw = localStorage.getItem(key);
    if (raw) localStorage.setItem(`${key}_backup`, raw);
  } catch {
    // Best-effort backup.
  }
};

export const restoreBackup = (mode: SaveMode): boolean => {
  try {
    const key = slotKey(mode);
    const raw = localStorage.getItem(`${key}_backup`);
    if (!raw) return false;
    localStorage.setItem(key, raw);
    return true;
  } catch {
    return false;
  }
};

type MutableGameState = { [K in keyof GameState]: GameState[K] };

export const sanitizeSave = (input: unknown, now: number = nowMs()): GameState | null => {
  if (typeof input !== 'object' || input === null) return null;
  const p = input as Record<string, unknown>;
  const d = INITIAL_GAME_STATE;

  if (!isIntIn(p['currentIteration'], 1, 1000)) return null;
  const currentIteration = p['currentIteration'] as number;
  if (!isFiniteNumber(p['dataKB'])) return null;
  if (!Array.isArray(p['shortcuts'])) return null;

  const out: MutableGameState = { ...d } as MutableGameState;
  out.currentIteration = currentIteration;
  out.highScore = isIntIn(p['highScore'], 1, 1000)
    ? (p['highScore'] as number)
    : Math.max(1, currentIteration);
  out.dataKB =
    isFiniteNumber(p['dataKB']) && (p['dataKB'] as number) >= 0
      ? Math.min(p['dataKB'] as number, 1e15)
      : 0;

  const shortcuts = p['shortcuts'] as unknown[];
  if (shortcuts.length > 64) return null;
  const cleanShortcuts: GameState['shortcuts'] = [];
  for (const s of shortcuts) {
    if (typeof s !== 'object' || s === null) return null;
    const r = s as Record<string, unknown>;
    if (
      typeof r['id'] !== 'string' ||
      (r['id'] as string).length > 64 ||
      typeof r['appId'] !== 'string' ||
      !validAppIds.has(r['appId'] as AppId) ||
      typeof r['label'] !== 'string' ||
      (r['label'] as string).length > 64 ||
      !isIntIn(r['gridX'], 0, 64) ||
      !isIntIn(r['gridY'], 0, 64)
    )
      return null;
    cleanShortcuts.push({
      id: r['id'] as string,
      appId: r['appId'] as AppId,
      label: r['label'] as string,
      gridX: r['gridX'] as number,
      gridY: r['gridY'] as number,
    });
  }
  out.shortcuts = cleanShortcuts;

  const wallpaper = p['wallpaper'];
  out.wallpaper =
    wallpaper === undefined ||
    (typeof wallpaper === 'string' &&
      wallpaper.length <= MAX_WALLPAPER_LENGTH &&
      /^data:image\/(png|jpeg|webp);base64,/.test(wallpaper))
      ? (wallpaper as string | undefined)
      : undefined;

  out.efficiencyLevel = isIntIn(p['efficiencyLevel'], 0, 1000)
    ? (p['efficiencyLevel'] as number)
    : d.efficiencyLevel;

  const bank = p['boostBank'];
  const cleanBank: GameState['boostBank'] = { 2: 0, 3: 0, 4: 0, 5: 0 };
  if (typeof bank === 'object' && bank !== null) {
    const b = bank as Record<string, unknown>;
    for (const k of [2, 3, 4, 5] as const) {
      const v = b[String(k)];
      cleanBank[k] = isFiniteNumber(v) && v >= 0 ? Math.min(v, 86_400_000) : 0;
    }
  }
  out.boostBank = cleanBank;
  const active = p['activeBoostMultiplier'];
  out.activeBoostMultiplier =
    active === null || active === undefined
      ? null
      : active === 2 || active === 3 || active === 4 || active === 5
        ? active
        : null;
  if (out.activeBoostMultiplier !== null && !(cleanBank[out.activeBoostMultiplier] > 0))
    out.activeBoostMultiplier = null;

  out.autoMarkCount = isIntIn(p['autoMarkCount'], 0, 1e9) ? (p['autoMarkCount'] as number) : 0;
  out.isAutoMarkEnabled =
    typeof p['isAutoMarkEnabled'] === 'boolean' ? p['isAutoMarkEnabled'] : false;
  out.autoMinerData =
    isFiniteNumber(p['autoMinerData']) && (p['autoMinerData'] as number) >= 0
      ? Math.min(p['autoMinerData'] as number, 1e6)
      : 0;
  out.autoMinerInterval =
    isFiniteNumber(p['autoMinerInterval']) &&
    (p['autoMinerInterval'] as number) >= AUTOMINER_MIN_INTERVAL &&
    (p['autoMinerInterval'] as number) <= 3_600_000
      ? (p['autoMinerInterval'] as number)
      : AUTOMINER_DEFAULT_INTERVAL;
  out.lastTickAt =
    isFiniteNumber(p['lastTickAt']) &&
    (p['lastTickAt'] as number) >= 0 &&
    (p['lastTickAt'] as number) <= now + 300_000
      ? (p['lastTickAt'] as number)
      : 0;
  out.runSeed =
    isFiniteNumber(p['runSeed']) && Number.isInteger(p['runSeed']) && p['runSeed'] !== 0
      ? (p['runSeed'] as number)
      : now;

  const consumed = p['consumedIds'];
  out.consumedIds = isStringArray(consumed, 20_000, 128) ? [...new Set(consumed as string[])] : [];

  const mods = p['modifiedNodes'];
  const cleanMods: GameState['modifiedNodes'] = {};
  if (typeof mods === 'object' && mods !== null) {
    const entries = Object.entries(mods as Record<string, unknown>);
    if (entries.length > 20_000) return null;
    for (const [id, v] of entries) {
      if (id.length > 128 || typeof v !== 'object' || v === null) return null;
      const r = v as Record<string, unknown>;
      const clean: GameState['modifiedNodes'][string] = {};
      if (r['name'] !== undefined) {
        if (typeof r['name'] !== 'string' || r['name'].length > 128) return null;
        clean.name = r['name'];
      }
      if (r['isMarked'] !== undefined) {
        if (typeof r['isMarked'] !== 'boolean') return null;
        clean.isMarked = r['isMarked'];
      }
      if (r['markKind'] !== undefined) {
        if (r['markKind'] !== 'manual' && r['markKind'] !== 'auto' && r['markKind'] !== 'gate')
          return null;
        clean.markKind = r['markKind'];
      }
      if (r['isScanned'] !== undefined) {
        if (typeof r['isScanned'] !== 'boolean') return null;
        clean.isScanned = r['isScanned'];
      }
      cleanMods[id] = clean;
    }
  }
  out.modifiedNodes = cleanMods;

  for (const k of [
    'isDevModeEnabled',
    'isAscendRootEnabled',
    'secretsZipSeen',
    'hasSeenThankYou',
  ] as const)
    out[k] = typeof p[k] === 'boolean' ? (p[k] as boolean) : false;

  const achievements = p['achievements'];
  const cleanAch: Record<string, number> = {};
  if (typeof achievements === 'object' && achievements !== null) {
    const entries = Object.entries(achievements as Record<string, unknown>);
    if (entries.length > 500) return null;
    for (const [id, v] of entries) {
      if (id.length > 128 || !isFiniteNumber(v) || v < 0 || v > now + 300_000) return null;
      cleanAch[id] = v;
    }
  }
  out.achievements = cleanAch;

  out.secretsFound = isStringArray(p['secretsFound'], 5000, 128)
    ? [...(p['secretsFound'] as string[])]
    : [];
  out.loreSeen = isStringArray(p['loreSeen'], 5000, 128) ? [...(p['loreSeen'] as string[])] : [];

  const stats = p['stats'];
  const baseStats = { ...d.stats };
  if (typeof stats === 'object' && stats !== null) {
    const s = stats as Record<string, unknown>;
    if (isFiniteNumber(s['totalMinedKB']) && s['totalMinedKB'] >= 0)
      baseStats.totalMinedKB = Math.min(s['totalMinedKB'], 1e15);
    for (const k of [
      'scans',
      'ascensions',
      'packagesOpened',
      'modulesInstalled',
      'logoClicks',
    ] as const)
      if (isIntIn(s[k], 0, 1e9)) baseStats[k] = s[k] as number;
  }
  out.stats = baseStats;

  const arcade = p['arcadeWins'];
  const cleanArcade: Record<string, number> = {};
  if (typeof arcade === 'object' && arcade !== null) {
    const entries = Object.entries(arcade as Record<string, unknown>);
    if (entries.length > 100) return null;
    for (const [id, v] of entries) {
      if (id.length > 128 || !isIntIn(v, 1, 1000)) return null;
      cleanArcade[id] = v;
    }
  }
  out.arcadeWins = cleanArcade;
  out.passes = isIntIn(p['passes'], 0, 1e9) ? (p['passes'] as number) : 0;
  out.fuelPaidIter = isIntIn(p['fuelPaidIter'], 0, 1e9) ? (p['fuelPaidIter'] as number) : 0;

  const unlockedFileIds = p['unlockedFileIds'];
  out.unlockedFileIds = isStringArray(unlockedFileIds, 5000, 128)
    ? [...(unlockedFileIds as string[])]
    : [];

  const proof = p['trailProof'];
  const cleanProof: Record<number, number> = {};
  if (typeof proof === 'object' && proof !== null) {
    const entries = Object.entries(proof as Record<string, unknown>);
    if (entries.length > 1000) return null;
    for (const [k, v] of entries) {
      const iter = Number(k);
      if (!Number.isInteger(iter) || iter < 1 || iter > 1000 || !isIntIn(v, 1, 1000)) return null;
      cleanProof[iter] = v;
    }
  }
  out.trailProof = cleanProof;

  out.unlockedTools = isStringArray(p['unlockedTools'], 5000, 128)
    ? [...(p['unlockedTools'] as string[])]
    : [];
  out.revealedDepths = isIntArray(p['revealedDepths'], 100, 0, 100)
    ? [...(p['revealedDepths'] as number[])]
    : [...d.revealedDepths];
  out.exploredDirIds = isStringArray(p['exploredDirIds'], 5000, 128)
    ? [...(p['exploredDirIds'] as string[])]
    : [];

  const triangulated = p['triangulated'];
  const cleanTri: Record<string, 1 | 2 | 3> = {};
  if (typeof triangulated === 'object' && triangulated !== null) {
    const entries = Object.entries(triangulated as Record<string, unknown>);
    if (entries.length > 10_000) return null;
    for (const [id, v] of entries) {
      if (id.length > 128 || (v !== 1 && v !== 2 && v !== 3)) return null;
      cleanTri[id] = v;
    }
  }
  out.triangulated = cleanTri;

  out.locatedMinigames = isStringArray(p['locatedMinigames'], 5000, 128)
    ? [...(p['locatedMinigames'] as string[])]
    : [];
  out.locatedTrail = isIntArray(p['locatedTrail'], 1000, 1, 1000)
    ? [...(p['locatedTrail'] as number[])]
    : [];
  out.unscrambledTrail = isIntArray(p['unscrambledTrail'], 1000, 1, 1000)
    ? [...(p['unscrambledTrail'] as number[])]
    : [];

  return out;
};

export const getSaveMode = (): SaveMode => {
  try {
    const mode = localStorage.getItem(KEY_MODE);
    return mode === 'DEV' ? 'DEV' : 'NORMAL';
  } catch {
    return 'NORMAL';
  }
};

export const setSaveMode = (mode: SaveMode) => {
  try {
    localStorage.setItem(KEY_MODE, mode);
  } catch (e) {
    console.error('Failed to set save mode', e);
  }
};

const migrateLegacy = (parsed: Record<string, unknown>): void => {
  if (
    parsed['clickerCount'] !== undefined &&
    parsed['dataKB'] === undefined &&
    parsed['storageKB'] === undefined
  ) {
    parsed['dataKB'] = parsed['clickerCount'];
    delete parsed['clickerCount'];
  }
  if (parsed['storageKB'] !== undefined && parsed['dataKB'] === undefined) {
    parsed['dataKB'] = parsed['storageKB'];
    delete parsed['storageKB'];
  }
  if (
    typeof parsed['efficiencyBoostEndTime'] === 'number' &&
    parsed['efficiencyBoostEndTime'] > nowMs()
  ) {
    const remaining = (parsed['efficiencyBoostEndTime'] as number) - nowMs();
    parsed['boostBank'] = { 2: remaining, 3: 0, 4: 0, 5: 0 };
    delete parsed['efficiencyBoostEndTime'];
  }
};

const readWallpaper = (): string | undefined => {
  try {
    const raw = localStorage.getItem(KEY_WALLPAPER);
    if (
      raw &&
      raw.length <= MAX_WALLPAPER_LENGTH &&
      /^data:image\/(png|jpeg|webp);base64,/.test(raw)
    )
      return raw;
  } catch {
    // Ignore wallpaper read failures.
  }
  return undefined;
};

export const loadGame = (mode: SaveMode): GameState | null => {
  try {
    const key = slotKey(mode);
    const stored = localStorage.getItem(key);
    const dataToLoad =
      stored || (mode === 'NORMAL' ? localStorage.getItem('ascend_game_state_v1') : null);
    if (!dataToLoad) return null;
    let parsed: unknown;
    try {
      parsed = JSON.parse(dataToLoad);
    } catch (e) {
      console.error('Failed to load game state', e);
      quarantineSave(key, dataToLoad);
      return null;
    }
    if (typeof parsed !== 'object' || parsed === null) {
      quarantineSave(key, dataToLoad);
      return null;
    }
    migrateLegacy(parsed as Record<string, unknown>);
    const clean = sanitizeSave(parsed);
    if (!clean) {
      quarantineSave(key, dataToLoad);
      return null;
    }
    if (clean.wallpaper === undefined) {
      const wallpaper = readWallpaper();
      if (wallpaper) clean.wallpaper = wallpaper;
    }
    if (mode === 'NORMAL') {
      clean.isDevModeEnabled = false;
      clean.isAscendRootEnabled = false;
    }
    return clean;
  } catch (e) {
    console.error('Failed to load game state', e);
  }
  return null;
};

export const saveGame = (state: GameState, mode: SaveMode): void => {
  const { wallpaper: _omitted, ...rest } = state;
  void _omitted;
  try {
    const key = slotKey(mode);
    localStorage.setItem(key, JSON.stringify(rest));
  } catch (e) {
    console.error('Failed to save game state', e);
  }
  if (state.wallpaper !== undefined) {
    try {
      if (state.wallpaper.length <= MAX_WALLPAPER_LENGTH)
        localStorage.setItem(KEY_WALLPAPER, state.wallpaper);
    } catch (e) {
      console.error('Failed to save wallpaper', e);
    }
  }
};

export const saveWallpaper = (wallpaper: string | undefined): void => {
  try {
    if (wallpaper === undefined) localStorage.removeItem(KEY_WALLPAPER);
    else if (wallpaper.length <= MAX_WALLPAPER_LENGTH)
      localStorage.setItem(KEY_WALLPAPER, wallpaper);
  } catch (e) {
    console.error('Failed to save wallpaper', e);
  }
};

type ScheduleOptions = { delayMs?: number; flushMs?: number };
let pendingTimer: ReturnType<typeof setTimeout> | null = null;
let lastWriteMs = 0;
let lastWrittenJSON = '';
let pendingState: GameState | null = null;
let pendingMode: SaveMode = 'NORMAL';

export const scheduleSave = (
  state: GameState,
  mode: SaveMode,
  options: ScheduleOptions = {}
): void => {
  const { delayMs = 800, flushMs = 5000 } = options;
  pendingState = state;
  pendingMode = mode;
  const now = nowMs();
  if (now - lastWriteMs >= flushMs) {
    flushSave();
    return;
  }
  if (pendingTimer) return;
  pendingTimer = setTimeout(() => {
    pendingTimer = null;
    flushSave();
  }, delayMs);
};

export const flushSave = (): void => {
  if (pendingTimer) {
    clearTimeout(pendingTimer);
    pendingTimer = null;
  }
  if (!pendingState) return;
  const { wallpaper: _omitted, ...rest } = pendingState;
  void _omitted;
  let json = '';
  try {
    json = JSON.stringify(rest);
  } catch {
    pendingState = null;
    return;
  }
  if (json === lastWrittenJSON) {
    pendingState = null;
    return;
  }
  try {
    localStorage.setItem(slotKey(pendingMode), json);
    if (pendingState.wallpaper !== undefined) saveWallpaper(pendingState.wallpaper);
    lastWrittenJSON = json;
    lastWriteMs = nowMs();
  } catch (e) {
    console.error('Failed to save game state', e);
  }
  pendingState = null;
};

export const resetSave = (mode: SaveMode): void => {
  const key = slotKey(mode);
  localStorage.removeItem(key);
};

export const factoryReset = (): void => {
  localStorage.removeItem(KEY_NORMAL);
  localStorage.removeItem(KEY_DEV);
  localStorage.removeItem(KEY_MODE);
  localStorage.removeItem(KEY_WALLPAPER);
  localStorage.removeItem('ascend_game_state_v1');
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const k = localStorage.key(i);
    if (k?.endsWith('_backup') || k?.includes('_corrupt_')) localStorage.removeItem(k);
  }
};

export const exportSave = (state: GameState, includeWallpaper = false): string => {
  if (includeWallpaper) return JSON.stringify(state, null, 2);
  const { wallpaper: _omitted, ...rest } = state;
  void _omitted;
  return JSON.stringify(rest, null, 2);
};

export const validateSave = (json: string): GameState | null => {
  try {
    if (json.length > MAX_SAVE_JSON_LENGTH) return null;
    const parsed: unknown = JSON.parse(json);
    if (typeof parsed !== 'object' || parsed === null) return null;
    migrateLegacy(parsed as Record<string, unknown>);
    return sanitizeSave(parsed);
  } catch {
    return null;
  }
};
