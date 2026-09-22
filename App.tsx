import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  GameState,
  WindowState,
  AppId,
  FileNode,
  FileExtension,
  DirectoryNode,
  FileType,
  DesktopShortcut,
  AppNotification,
  NotificationType,
  NodeModification,
  TeleportTarget,
} from './types';
import { generateFileSystem } from './services/generator';
import {
  loadGame,
  saveGame,
  getSaveMode,
  setSaveMode,
  resetSave,
  factoryReset,
  SaveMode,
} from './services/storage';
import {
  INITIAL_GAME_STATE,
  DESKTOP_GRID,
  CLICK_VALUE_BASE,
  CLICK_UPGRADE_INCREMENT,
  UPGRADE_COST_BASE,
  BOOST_COST_BASE_PER_SEC,
  AUTOMARK_COST_PER_UNIT,
  AUTOMINER_MIN_INTERVAL,
  MAP_UNLOCK_COST,
  RADAR_UNLOCK_COST,
  UPGRADE_COST_GROWTH,
} from './constants';
import Taskbar from './components/Taskbar';
import WindowFrame from './components/WindowFrame';
import Explorer from './components/apps/Explorer';
import TextViewer from './components/apps/TextViewer';
import Clicker from './components/apps/Clicker';
import Updates from './components/apps/Updates';
import BootSequence from './components/system/BootSequence';
import AscensionSequence from './components/system/AscensionSequence';
import ContextMenu, { ContextMenuItem } from './components/ContextMenu';
import DesktopIcon from './components/DesktopIcon';
import NotificationSystem from './components/NotificationSystem';
import Personalize from './components/apps/Personalize';
import SystemHelp from './components/apps/SystemHelp';
import CoreSettings from './components/apps/CoreSettings';
import Achievements from './components/apps/Achievements';
import EggHunt from './components/apps/EggHunt';
import AscensionGate from './components/apps/AscensionGate';
import Minigames from './components/apps/Minigames';
import Cartographer, { revealCostFor, teleportCostFor } from './components/apps/Cartographer';
import Radar from './components/apps/Radar';
import { MINIGAMES, fuelFeeKB, getGateStatus } from './services/gate';
import ThankYouLetter from './components/system/ThankYouLetter';
import { ACH_FOR_ZIP } from './services/achievements';
import { LORE_FRAGMENTS } from './services/lore';
import { computeProgress, isZipEarned } from './services/progression';
import { Terminal } from 'lucide-react';

import {
  ancestorIds,
  buildSystem,
  findNodeById,
  prepareFileSystem,
  updateNodeRecursively,
} from './services/filesystem';

const handleFactoryReset = () => {
  factoryReset();
  window.location.reload();
};

const instanceKeyOf = (appId: AppId, data?: unknown): string | null => {
  if (appId === AppId.EXPLORER) return null;
  if (appId === AppId.TEXT_VIEWER || appId === AppId.ASCENSION || appId === AppId.EGG) {
    return `${appId}:${(data as FileNode | undefined)?.id ?? 'new'}`;
  }
  if (appId === AppId.MINIGAME) {
    return `${appId}:${(data as { gameId?: string } | undefined)?.gameId ?? 'new'}`;
  }
  return appId;
};

const App: React.FC = () => {
  const [initialSystem] = useState(() => {
    const mode = getSaveMode();
    return { mode, ...buildSystem(mode) };
  });
  const [saveMode, setSaveModeState] = useState<SaveMode>(initialSystem.mode);
  const [gameState, setGameState] = useState<GameState>(initialSystem.loadedState);
  const [fileSystem, setFileSystem] = useState<DirectoryNode | null>(initialSystem.finalFS);
  const offlineYieldRef = useRef(initialSystem.offlineYieldKB);

  const [isBooting, setIsBooting] = useState(true);
  const [isAscending, setIsAscending] = useState(false);

  const [windows, setWindows] = useState<WindowState[]>([]);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const [lastExplorerId, setLastExplorerId] = useState<string | null>(null);
  const [nextZIndex, setNextZIndex] = useState(100);
  const [cascadeCount, setCascadeCount] = useState(0);
  if (windows.length === 0 && cascadeCount > 0) {
    setCascadeCount(0);
  }

  const [contextMenu, setContextMenu] = useState<{
    isOpen: boolean;
    x: number;
    y: number;
    items: ContextMenuItem[];
  }>({ isOpen: false, x: 0, y: 0, items: [] });

  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const dismissZipReward = () => setGameState(prev => ({ ...prev, secretsZipSeen: true }));
  const dismissThankYou = () => setGameState(prev => ({ ...prev, hasSeenThankYou: true }));

  useEffect(() => {
    const tickRate = 100;
    const timer = setInterval(() => {
      setGameState(prev => {
        if (prev.activeBoostMultiplier) {
          const mult = prev.activeBoostMultiplier;
          const currentBank = prev.boostBank[mult] || 0;

          if (currentBank <= 0) {
            return { ...prev, activeBoostMultiplier: null };
          }

          return {
            ...prev,
            boostBank: {
              ...prev.boostBank,
              [mult]: Math.max(0, currentBank - tickRate),
            },
          };
        }
        return prev;
      });
    }, tickRate);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setGameState(prev => {
        let newState = { ...prev };

        if (prev.autoMinerData > 0) {
          newState.dataKB = prev.dataKB + prev.autoMinerData;
          const minedTotal = prev.stats.totalMinedKB + prev.autoMinerData;
          newState.stats = {
            ...prev.stats,
            totalMinedKB: minedTotal,
          };
          const earned: Record<string, number> = {};
          if (minedTotal >= 10240 && prev.achievements['ten_mb'] === undefined) {
            earned['ten_mb'] = Date.now();
          }
          if (minedTotal >= 512000 && prev.achievements['half_gb'] === undefined) {
            earned['half_gb'] = Date.now();
          }
          if (Object.keys(earned).length > 0) {
            newState.achievements = { ...prev.achievements, ...earned };
          }
        }

        if (prev.isDevModeEnabled && newState.dataKB < 999999999) {
          newState.dataKB = 999999999999;
        }

        newState.lastTickAt = Date.now();

        return newState;
      });
    }, gameState.autoMinerInterval);

    return () => clearInterval(intervalId);
  }, [gameState.autoMinerInterval]);

  const initializeSystem = useCallback((mode: SaveMode) => {
    const { loadedState, finalFS } = buildSystem(mode);
    setGameState(loadedState);
    setSaveModeState(mode);
    setFileSystem(finalFS);
  }, []);

  useEffect(() => {
    if (!isBooting && !isAscending) {
      saveGame(gameState, saveMode);
    }
  }, [gameState, isBooting, isAscending, saveMode]);

  const addNotification = useCallback((title: string, message: string, type: NotificationType) => {
    const id = Date.now().toString() + Math.random();
    setNotifications(prev => [...prev, { id, title, message, type }]);

    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  }, []);

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  useEffect(() => {
    if (!isBooting && offlineYieldRef.current > 0) {
      const yieldKB = offlineYieldRef.current;
      offlineYieldRef.current = 0;
      const amount = yieldKB >= 1024 ? `${(yieldKB / 1024).toFixed(1)} MB` : `${yieldKB} KB`;
      addNotification(
        'OFFLINE YIELD',
        `Autominer ran at 50% while away: +${amount}.`,
        NotificationType.SUCCESS
      );
    }
  }, [isBooting, addNotification]);

  const unlockAchievement = useCallback((id: string) => {
    setGameState(prev => {
      if (prev.achievements[id] !== undefined) return prev;
      return { ...prev, achievements: { ...prev.achievements, [id]: Date.now() } };
    });
  }, []);

  const discoverSecret = useCallback(
    (id: string) => {
      let isNew = false;
      setGameState(prev => {
        if (prev.secretsFound.includes(id)) return prev;
        isNew = true;
        return { ...prev, secretsFound: [...prev.secretsFound, id] };
      });
      if (id === 'ghost') unlockAchievement('ghost');
      if (id === 'trail') unlockAchievement('trail');
      if (id === 'offering') unlockAchievement('offering');
      return isNew;
    },
    [unlockAchievement]
  );

  const seeLore = useCallback((id: string) => {
    if (!LORE_FRAGMENTS.some(l => l.id === id)) return;
    setGameState(prev =>
      prev.loreSeen.includes(id) ? prev : { ...prev, loreSeen: [...prev.loreSeen, id] }
    );
  }, []);

  const checkEggHunter = useCallback(() => {
    setGameState(prev => {
      const eggs = ['core', 'idol', 'properties'].filter(e => prev.secretsFound.includes(e));
      if (eggs.length >= 3 && prev.achievements['egg_hunter'] === undefined) {
        return { ...prev, achievements: { ...prev.achievements, egg_hunter: Date.now() } };
      }
      return prev;
    });
  }, []);

  const progress = computeProgress(
    Object.keys(gameState.achievements).length,
    gameState.secretsFound.length,
    gameState.loreSeen.length
  );
  const zipEarned = isZipEarned(gameState.achievements, ACH_FOR_ZIP);

  const showZipReward = zipEarned && !gameState.secretsZipSeen && !isBooting;
  const showThankYou = progress >= 100 && !gameState.hasSeenThankYou && !isBooting;

  const handleContextMenu = useCallback((x: number, y: number, items: ContextMenuItem[]) => {
    setContextMenu({ isOpen: true, x, y, items });
  }, []);

  const closeContextMenu = useCallback(() => {
    setContextMenu(prev => ({ ...prev, isOpen: false }));
  }, []);

  const handleRefreshSystem = () => {
    setWindows([]);
    setCascadeCount(0);
    setIsBooting(true);
  };

  const handleDesktopContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    handleContextMenu(e.clientX, e.clientY, [
      { label: 'Refresh System', action: handleRefreshSystem },
      { separator: true, label: '' },
      { label: 'Personalize', action: () => openWindow(AppId.PERSONALIZE) },
      { label: 'About Ascend OS', action: () => openWindow(AppId.HELP) },
    ]);
  };

  const revealGatePath = (fileId: string, tree: DirectoryNode) => {
    const ids = ancestorIds(tree, fileId);
    const gateMark = { isMarked: true, markKind: 'gate' } as const;
    const markAll = (node: DirectoryNode): DirectoryNode => ({
      ...node,
      ...(ids.has(node.id) ? gateMark : {}),
      children: node.children.map(child =>
        child.type === FileType.FOLDER
          ? markAll(child as DirectoryNode)
          : ids.has(child.id)
            ? { ...child, ...gateMark }
            : child
      ),
    });
    setFileSystem(markAll(tree));
    setGameState(prev => {
      const modifiedNodes = { ...prev.modifiedNodes };
      ids.forEach(id => {
        modifiedNodes[id] = { ...modifiedNodes[id], ...gateMark };
      });
      return { ...prev, modifiedNodes };
    });
  };

  const handleUpdateNode = (id: string, updates: Partial<FileNode | DirectoryNode>) => {
    if (!fileSystem) return;

    if (updates.isScanned) {
      unlockAchievement('signal_found');
      seeLore('lore_penalty');
      if (gameState.stats.scans + 1 >= 25) unlockAchievement('deep_scan');
      setGameState(prev => ({ ...prev, stats: { ...prev.stats, scans: prev.stats.scans + 1 } }));
    }

    const newFileSystem = updateNodeRecursively(fileSystem, id, updates);
    setFileSystem(newFileSystem);

    if (updates.isScanned) {
      const scanned = findNodeById(newFileSystem, id);
      if (scanned?.isWinningPath && scanned.type !== FileType.FOLDER) {
        revealGatePath(id, newFileSystem);
      }
    }

    setGameState(prev => {
      const currentMods = prev.modifiedNodes?.[id] || {};
      const relevantUpdates: NodeModification = {};
      if (updates.name !== undefined) relevantUpdates.name = updates.name;
      if (updates.isMarked !== undefined) relevantUpdates.isMarked = updates.isMarked;
      if (updates.markKind !== undefined) relevantUpdates.markKind = updates.markKind;
      if (updates.isScanned !== undefined) relevantUpdates.isScanned = updates.isScanned;

      if (Object.keys(relevantUpdates).length === 0) return prev;

      return {
        ...prev,
        modifiedNodes: {
          ...prev.modifiedNodes,
          [id]: { ...currentMods, ...relevantUpdates },
        },
      };
    });
  };

  const handleDeleteNode = (id: string) => {
    if (!fileSystem) return;
    const newFileSystem = updateNodeRecursively(fileSystem, id, null);
    setFileSystem(newFileSystem);
  };

  const openWindow = useCallback(
    (appId: AppId, data?: unknown) => {
      const key = instanceKeyOf(appId, data);
      if (key !== null) {
        const existing = windows.find(w => instanceKeyOf(w.appId, w.data) === key);
        if (existing) {
          setWindows(prev =>
            prev.map(w =>
              w.id === existing.id ? { ...w, zIndex: nextZIndex, isMinimized: false } : w
            )
          );
          setActiveWindowId(existing.id);
          setNextZIndex(prev => prev + 1);
          return existing.id;
        }
      }

      const id = `${appId}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      let title = 'Application';

      switch (appId) {
        case AppId.EXPLORER:
          title = 'File Explorer';
          break;
        case AppId.TEXT_VIEWER:
          title = (data as FileNode | undefined)?.name || 'Text Viewer';
          break;
        case AppId.CLICKER:
          title = 'Data Miner';
          break;
        case AppId.UPDATES:
          title = 'System Updates';
          break;
        case AppId.HELP:
          title = 'System Help';
          break;
        case AppId.ASCENSION:
          title = 'System Ascension';
          break;
        case AppId.CARTOGRAPHER:
          title = 'Explorer Map';
          break;
        case AppId.ACHIEVEMENTS:
          title = 'Achievements';
          break;
        case AppId.PERSONALIZE:
          title = 'Personalization';
          break;
        case AppId.CORE_SETTINGS:
          title = 'CORE_SETTINGS';
          break;
      }

      let currentCascadeCount = cascadeCount;
      if (windows.length === 0) {
        currentCascadeCount = 0;
      }

      const cascadeStep = 30;
      const maxCascadeSteps = 10;
      const currentCascade = currentCascadeCount % maxCascadeSteps;
      const cascadeOffset = currentCascade * cascadeStep;

      const winWidth = 600;
      const winHeight = 450;

      const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1024;
      const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 768;

      let startX = viewportWidth / 2 - winWidth / 2 + cascadeOffset;
      let startY = viewportHeight / 2 - winHeight / 2 + cascadeOffset;

      startX = Math.max(10, startX);
      startY = Math.max(10, startY);

      const newWindow: WindowState = {
        id,
        appId,
        title,
        zIndex: nextZIndex,
        isMinimized: false,
        isMaximized: false,
        data,
        position: { x: startX, y: startY },
      };

      setWindows(prev => [...prev, newWindow]);
      setActiveWindowId(id);
      setNextZIndex(prev => prev + 1);
      setCascadeCount(currentCascadeCount + 1);
      if (appId === AppId.EXPLORER) setLastExplorerId(id);
      return id;
    },
    [nextZIndex, cascadeCount, windows]
  );

  const closeWindow = (id: string) => {
    setWindows(prev => prev.filter(w => w.id !== id));
    if (activeWindowId === id) setActiveWindowId(null);
    if (lastExplorerId === id) setLastExplorerId(null);
    setCascadeCount(0);
  };

  const focusWindow = (id: string) => {
    if (windows.some(w => w.id === id && w.appId === AppId.EXPLORER)) {
      setLastExplorerId(id);
    }
    if (activeWindowId === id) {
      const win = windows.find(w => w.id === id);
      if (win?.isMinimized) {
        setWindows(prev =>
          prev.map(w => (w.id === id ? { ...w, isMinimized: false, zIndex: nextZIndex } : w))
        );
        setNextZIndex(prev => prev + 1);
      }
      return;
    }

    setWindows(prev =>
      prev.map(w => (w.id === id ? { ...w, zIndex: nextZIndex, isMinimized: false } : w))
    );
    setActiveWindowId(id);
    setNextZIndex(prev => prev + 1);
  };

  const minimizeWindow = (id: string) => {
    setWindows(prev => prev.map(w => (w.id === id ? { ...w, isMinimized: true } : w)));
    if (activeWindowId === id) setActiveWindowId(null);
  };

  const toggleMaximize = (id: string) => {
    setWindows(prev =>
      prev.map(w =>
        w.id === id
          ? { ...w, isMaximized: !w.isMaximized, isMinimized: false, zIndex: nextZIndex }
          : w
      )
    );
    setActiveWindowId(id);
    setNextZIndex(prev => prev + 1);
  };

  const moveWindow = (id: string, x: number, y: number) => {
    setWindows(prev => prev.map(w => (w.id === id ? { ...w, position: { x, y } } : w)));
    setCascadeCount(0);
  };

  const handleMoveShortcut = (id: string, gridX: number, gridY: number) => {
    setGameState(prev => {
      const isOccupied = prev.shortcuts.some(
        sc => sc.id !== id && sc.gridX === gridX && sc.gridY === gridY
      );

      if (isOccupied) {
        return prev;
      }

      const updatedShortcuts = prev.shortcuts.map(sc =>
        sc.id === id ? { ...sc, gridX, gridY } : sc
      );
      return { ...prev, shortcuts: updatedShortcuts };
    });
  };

  const handleShortcutContextMenu = (e: React.MouseEvent, shortcut: DesktopShortcut) => {
    e.preventDefault();
    e.stopPropagation();
    handleContextMenu(e.clientX, e.clientY, [
      { label: shortcut.label, disabled: true },
      { separator: true, label: '' },
      { label: 'Open', action: () => openWindow(shortcut.appId) },
      {
        label: 'Delete Shortcut',
        action: () => {
          setGameState(prev => ({
            ...prev,
            shortcuts: prev.shortcuts.filter(s => s.id !== shortcut.id),
          }));
        },
        danger: true,
      },
    ]);
  };

  const handlePinToDesktop = (appId: AppId, label: string) => {
    setGameState(prev => {
      let gridX = 0;
      let gridY = 0;
      const maxCols = Math.floor(
        (window.innerWidth - DESKTOP_GRID.MARGIN_LEFT) / DESKTOP_GRID.WIDTH
      );
      const maxRows = Math.floor(
        (window.innerHeight - DESKTOP_GRID.MARGIN_TOP) / DESKTOP_GRID.HEIGHT
      );

      let found = false;
      for (let y = 0; y < maxRows + 5; y++) {
        for (let x = 0; x < maxCols + 5; x++) {
          const occupied = prev.shortcuts.some(s => s.gridX === x && s.gridY === y);
          if (!occupied) {
            gridX = x;
            gridY = y;
            found = true;
            break;
          }
        }
        if (found) break;
      }

      const newShortcut: DesktopShortcut = {
        id: `sc_${Date.now()}`,
        appId,
        label,
        gridX,
        gridY,
      };

      return { ...prev, shortcuts: [...prev.shortcuts, newShortcut] };
    });
  };

  const [teleportTarget, setTeleportTarget] = useState<TeleportTarget | null>(null);
  const [explorerDirId, setExplorerDirId] = useState<string>('root');

  const handleTeleport = (dirId: string) => {
    if (!fileSystem) return;
    const cost = teleportCostFor(fileSystem, explorerDirId, dirId, gameState.exploredDirIds);
    if (gameState.autoMarkCount < cost) {
      addNotification(
        'MARKERS SHORT',
        `Teleport needs ${cost} automarkers.`,
        NotificationType.WARNING
      );
      return;
    }
    if (cost > 0) {
      setGameState(prev => ({ ...prev, autoMarkCount: prev.autoMarkCount - cost }));
    }
    const explorers = windows.filter(w => w.appId === AppId.EXPLORER);
    const target =
      explorers.find(w => w.id === lastExplorerId) ??
      explorers.reduce<WindowState | null>(
        (top, w) => (!top || w.zIndex > top.zIndex ? w : top),
        null
      );
    if (target) {
      focusWindow(target.id);
      setLastExplorerId(target.id);
      setTeleportTarget({ dirId, nonce: Date.now(), windowId: target.id });
    } else {
      openWindow(AppId.EXPLORER);
      setTeleportTarget({ dirId, nonce: Date.now(), windowId: null });
    }
  };

  const handleUnlockTool = (tool: string) => {
    const cost = tool === 'radar' ? RADAR_UNLOCK_COST : MAP_UNLOCK_COST;
    const minIter = tool === 'radar' ? 3 : 2;
    if (
      gameState.unlockedTools.includes(tool) ||
      gameState.currentIteration < minIter ||
      gameState.dataKB < cost
    )
      return;
    setGameState(prev => ({
      ...prev,
      dataKB: prev.dataKB - cost,
      unlockedTools: [...prev.unlockedTools, tool],
    }));
    handlePinToDesktop(
      tool === 'radar' ? AppId.RADAR : AppId.CARTOGRAPHER,
      tool === 'radar' ? 'Radar' : 'Explorer Map'
    );
    unlockAchievement(tool === 'radar' ? 'radar_op' : 'cartographer');
    addNotification('TOOL UNLOCKED', `${tool} installed to desktop.`, NotificationType.SUCCESS);
  };

  const activeBoost = gameState.activeBoostMultiplier || 1;
  const clickValue =
    (CLICK_VALUE_BASE + gameState.efficiencyLevel * CLICK_UPGRADE_INCREMENT) * activeBoost;

  const handleHarvestData = () => {
    unlockAchievement('warm_hands');
    const minedTotal = gameState.stats.totalMinedKB + clickValue;
    if (minedTotal >= 10240) unlockAchievement('ten_mb');
    if (minedTotal >= 512000) unlockAchievement('half_gb');
    setGameState(prev => ({
      ...prev,
      dataKB: prev.dataKB + clickValue,
      stats: { ...prev.stats, totalMinedKB: prev.stats.totalMinedKB + clickValue },
    }));
  };

  const handleSpendData = (amount: number) => {
    setGameState(prev => ({ ...prev, dataKB: Math.max(0, prev.dataKB - amount) }));
  };

  const handlePurchaseUpgrade = () => {
    const cost = Math.floor(
      UPGRADE_COST_BASE * Math.pow(UPGRADE_COST_GROWTH, gameState.efficiencyLevel)
    );
    if (gameState.dataKB >= cost) {
      setGameState(prev => ({
        ...prev,
        dataKB: prev.dataKB - cost,
        efficiencyLevel: prev.efficiencyLevel + 1,
      }));
    }
  };

  const handlePurchaseBoost = (multiplier: number, seconds: number) => {
    const scale = Math.pow(2, multiplier - 2);
    const cost = seconds * BOOST_COST_BASE_PER_SEC * scale;

    if (gameState.dataKB >= cost) {
      setGameState(prev => ({
        ...prev,
        dataKB: prev.dataKB - cost,
        boostBank: {
          ...prev.boostBank,
          [multiplier]: (prev.boostBank[multiplier] || 0) + seconds * 1000,
        },
      }));
    }
  };

  const handlePurchaseAutoMark = (amount: number) => {
    const cost = amount * AUTOMARK_COST_PER_UNIT;
    if (gameState.dataKB >= cost) {
      setGameState(prev => ({
        ...prev,
        dataKB: prev.dataKB - cost,
        autoMarkCount: prev.autoMarkCount + amount,
      }));
    }
  };

  const handleToggleAutoMark = () => {
    setGameState(prev => ({ ...prev, isAutoMarkEnabled: !prev.isAutoMarkEnabled }));
  };

  const handleConsumeAutoMark = () => {
    setGameState(prev => ({ ...prev, autoMarkCount: Math.max(0, prev.autoMarkCount - 1) }));
  };

  const handleRevealLevel = (level: number) => {
    if (!fileSystem || gameState.revealedDepths.includes(level)) return;
    const cost = revealCostFor(fileSystem, level, gameState.exploredDirIds);
    if (gameState.autoMarkCount < cost) return;
    setGameState(prev =>
      prev.revealedDepths.includes(level) || prev.autoMarkCount < cost
        ? prev
        : {
            ...prev,
            autoMarkCount: prev.autoMarkCount - cost,
            revealedDepths: [...prev.revealedDepths, level],
          }
    );
  };

  const handleToggleBoost = (multiplier: number) => {
    setGameState(prev => {
      if (prev.activeBoostMultiplier === multiplier) {
        return { ...prev, activeBoostMultiplier: null };
      } else {
        if ((prev.boostBank[multiplier] || 0) > 0) {
          return { ...prev, activeBoostMultiplier: multiplier };
        }
        return prev;
      }
    });
  };

  const handleSetWallpaper = (dataUrl: string | undefined) => {
    setGameState(prev => ({ ...prev, wallpaper: dataUrl }));
    addNotification(
      'DISPLAY SETTINGS',
      dataUrl ? 'Wallpaper updated successfully.' : 'Wallpaper reset to default.',
      NotificationType.SUCCESS
    );
  };

  const rebootSystem = (targetMode: SaveMode, options?: { skipSave?: boolean }) => {
    if (!options?.skipSave) {
      saveGame(gameState, saveMode);
    }

    setSaveMode(targetMode);
    setSaveModeState(targetMode);

    setWindows([]);
    setCascadeCount(0);
    setIsBooting(true);
    initializeSystem(targetMode);
  };

  const handleUpdateSeed = (newSeed: number) => {
    factoryReset();

    const newState: GameState = {
      ...INITIAL_GAME_STATE,
      runSeed: newSeed,
    };

    setSaveMode('NORMAL');
    setSaveModeState('NORMAL');

    setGameState(newState);

    const rawFS = generateFileSystem(newState.currentIteration, newSeed, false);
    setFileSystem(rawFS);

    saveGame(newState, 'NORMAL');

    setWindows([]);
    setCascadeCount(0);
    setIsBooting(true);
  };

  const handleImportSave = (importedState: GameState) => {
    const targetMode = importedState.isDevModeEnabled ? 'DEV' : 'NORMAL';

    saveGame(importedState, targetMode);

    if (saveMode !== targetMode) {
      setSaveMode(targetMode);
      setSaveModeState(targetMode);
    }

    setGameState(importedState);

    const rawFS = generateFileSystem(
      importedState.currentIteration,
      importedState.runSeed,
      importedState.isAscendRootEnabled
    );
    const finalFS = prepareFileSystem(
      rawFS,
      importedState.consumedIds || [],
      importedState.modifiedNodes || {}
    );
    setFileSystem(finalFS);

    setWindows([]);
    setCascadeCount(0);
    setIsBooting(true);

    addNotification(
      'IMPORT SUCCESSFUL',
      `Loaded save data. Mode: ${targetMode}`,
      NotificationType.SUCCESS
    );
  };

  const handleToggleDevMode = () => {
    if (saveMode === 'NORMAL') {
      let devState = loadGame('DEV');
      if (!devState) {
        devState = { ...gameState, isDevModeEnabled: true };
      } else {
        devState.isDevModeEnabled = true;
      }

      saveGame(devState, 'DEV');
      rebootSystem('DEV');
    } else {
      setGameState(prev => {
        const next = !prev.isDevModeEnabled;
        if (!next && !prev.isAscendRootEnabled) {
          setTimeout(() => rebootSystem('NORMAL'), 100);
          return { ...prev, isDevModeEnabled: false };
        }
        return { ...prev, isDevModeEnabled: next };
      });
    }
  };

  const handleToggleAscendRoot = () => {
    if (saveMode === 'NORMAL') {
      let devState = loadGame('DEV');
      if (!devState) {
        devState = { ...gameState, isAscendRootEnabled: true };
      } else {
        devState.isAscendRootEnabled = true;
      }
      saveGame(devState, 'DEV');
      rebootSystem('DEV');
    } else {
      setGameState(prev => {
        const next = !prev.isAscendRootEnabled;
        if (!next && !prev.isDevModeEnabled) {
          setTimeout(() => rebootSystem('NORMAL'), 100);
          return { ...prev, isAscendRootEnabled: false };
        }

        const rawFS = generateFileSystem(prev.currentIteration, prev.runSeed, next);
        const finalFS = prepareFileSystem(rawFS, prev.consumedIds || [], prev.modifiedNodes || {});
        setFileSystem(finalFS);

        return { ...prev, isAscendRootEnabled: next };
      });
    }
  };

  const handleResetSession = () => {
    resetSave(saveMode);
    rebootSystem(saveMode, { skipSave: true });
    addNotification('SESSION RESET', 'Local state cleared.', NotificationType.WARNING);
  };

  const handleSwitchToNormal = () => {
    rebootSystem('NORMAL');
  };

  const handleAscendStart = () => {
    if (!getGateStatus(gameState).complete) return;
    setWindows([]);
    setCascadeCount(0);
    setIsAscending(true);
  };

  const handlePayFuel = () => {
    const fee = fuelFeeKB(gameState.currentIteration);
    if (gameState.fuelPaidIter === gameState.currentIteration || gameState.dataKB < fee) return;
    setGameState(prev => ({
      ...prev,
      dataKB: prev.dataKB - fee,
      fuelPaidIter: prev.currentIteration,
    }));
    addNotification('FUEL LOADED', 'The ferry accepts your data.', NotificationType.SUCCESS);
  };

  const handleAscendComplete = () => {
    const nextIteration = gameState.currentIteration + 1;
    const newScore = Math.max(gameState.highScore, nextIteration);

    if (nextIteration >= 2) unlockAchievement('letting_go');
    if (nextIteration >= 3) unlockAchievement('regular');
    if (nextIteration >= 5) unlockAchievement('veteran');
    if (nextIteration >= 7) unlockAchievement('beyond_six');
    if (nextIteration >= 10) unlockAchievement('decade_walker');
    if (nextIteration === 2) seeLore('lore_decay');

    setGameState(prev => {
      const nextState = {
        ...prev,
        currentIteration: nextIteration,
        highScore: newScore,
        activeBoostMultiplier: null,
        consumedIds: [],
        modifiedNodes: {},
        revealedDepths: [...INITIAL_GAME_STATE.revealedDepths],
        exploredDirIds: [],
        stats: { ...prev.stats, ascensions: prev.stats.ascensions + 1 },
      };

      const rawFS = generateFileSystem(nextIteration, prev.runSeed, prev.isAscendRootEnabled);
      setFileSystem(rawFS);

      return nextState;
    });

    setExplorerDirId('root');
    setIsAscending(false);
    setIsBooting(true);
  };

  const handleBootComplete = useCallback(() => {
    setIsBooting(false);
    unlockAchievement('cold_boot');
    seeLore('lore_boot');
  }, [unlockAchievement, seeLore]);

  const handleOpenItem = (file: FileNode) => {
    if (!file.packageContent) return;

    const { type, value, multiplier } = file.packageContent;
    let msg = '';

    if (file.type === FileType.MODULE) {
      let effectiveType = type;
      let effectiveValue = value;

      if (type === 'AUTOMINER_SPEED' && gameState.autoMinerInterval <= AUTOMINER_MIN_INTERVAL) {
        effectiveType = 'AUTOMINER_POWER';
        effectiveValue = Math.floor(Math.random() * 3) + 1;
      }

      setGameState(prev => {
        const newState = {
          ...prev,
          consumedIds: [...prev.consumedIds, file.id],
          stats: { ...prev.stats, modulesInstalled: prev.stats.modulesInstalled + 1 },
        };
        if (effectiveType === 'AUTOMINER_POWER') {
          newState.autoMinerData += effectiveValue;
        } else if (effectiveType === 'AUTOMINER_SPEED') {
          newState.autoMinerInterval = Math.max(
            AUTOMINER_MIN_INTERVAL,
            prev.autoMinerInterval - effectiveValue
          );
        }
        return newState;
      });

      if (effectiveType === 'AUTOMINER_POWER') {
        if (type === 'AUTOMINER_SPEED') {
          msg = `MAX SPEED! Converted to +${effectiveValue} KB/tick Power`;
        } else {
          msg = `AutoMiner: +${effectiveValue} KB/tick Power`;
        }
      } else {
        msg = `AutoMiner: -${effectiveValue}ms Interval`;
      }

      addNotification('MODULE INSTALLED', msg, NotificationType.SUCCESS);
      unlockAchievement('new_hardware');
      if (gameState.stats.modulesInstalled + 1 >= 10) unlockAchievement('overclocked');
      seeLore('lore_modules');
    } else {
      setGameState(prev => {
        const newState = {
          ...prev,
          consumedIds: [...prev.consumedIds, file.id],
          stats: { ...prev.stats, packagesOpened: prev.stats.packagesOpened + 1 },
        };
        if (type === 'DATA') {
          newState.dataKB += value;
          msg = `+${(value / 1024).toFixed(1)} MB Data`;
        } else if (type === 'AUTOMARK') {
          newState.autoMarkCount += value;
          msg = `+${value} Auto-Markers`;
        } else if (type === 'BOOST' && multiplier) {
          newState.boostBank = {
            ...prev.boostBank,
            [multiplier]: (prev.boostBank[multiplier] || 0) + value,
          };
          msg = `+${(value / 1000).toFixed(1)}s of x${multiplier} Boost`;
        }
        return newState;
      });
      addNotification('PACKAGE DECRYPTED', msg, NotificationType.INFO);
      unlockAchievement('supply_run');
      if (gameState.stats.packagesOpened + 1 >= 5) unlockAchievement('quartermaster');
      seeLore('lore_packages');
    }

    handleDeleteNode(file.id);
  };

  const handleOpenFile = (file: FileNode) => {
    if (file.type === FileType.PACKAGE || file.type === FileType.MODULE) {
      handleOpenItem(file);
      return;
    }
    if (file.loreId) seeLore(file.loreId);
    const minigameId = ['pong', 'dino', 'tictactoe', 'snake', 'memory'].find(
      id => file.name.toLowerCase() === id || file.content === `EXECUTE_${id.toUpperCase()}`
    );
    if (file.extension === FileExtension.EXE && minigameId) {
      openWindow(AppId.MINIGAME, { gameId: minigameId });
    } else if (
      file.extension === FileExtension.EXE &&
      (file.name.toLowerCase() === 'ascend' || file.content === 'EXECUTE_ASCENSION')
    ) {
      if (fileSystem) revealGatePath(file.id, fileSystem);
      openWindow(AppId.ASCENSION, file);
    } else if (file.extension === FileExtension.TXT && file.name.toLowerCase() === 'egg') {
      openWindow(AppId.EGG, file);
    } else if (file.extension === FileExtension.TXT || file.extension === FileExtension.ZIP) {
      openWindow(AppId.TEXT_VIEWER, file);
    }
  };

  const handleReadFile = useCallback(
    (file: FileNode) => {
      if (file.loreId) seeLore(file.loreId);
    },
    [seeLore]
  );

  const handleUnlockedFile = (file: FileNode) => {
    if (file.secretId) {
      discoverSecret(file.secretId);
      addNotification(
        'SECRET FOUND',
        'The locked cache opens. Ghost frequency resolved.',
        NotificationType.SUCCESS
      );
    }
    if (file.loreId) seeLore(file.loreId);
    setWindows(prev =>
      prev.filter(w => !(w.appId === AppId.TEXT_VIEWER && (w.data as FileNode)?.id === file.id))
    );
    const isVault = file.name.endsWith('.zip') || file.id.startsWith('vault_');
    if (isVault) {
      setGameState(prev => ({
        ...prev,
        passes: prev.passes + 1,
        ghostSolvedIter: prev.currentIteration,
      }));
    }
    addNotification(
      isVault ? 'VAULT DECRYPTED' : 'CACHE DECRYPTED',
      isVault
        ? 'Minigame pass stashed. Redeem it from any minigame window.'
        : 'Takeout recorded in Achievements.',
      NotificationType.INFO
    );
  };

  const handleNavigateDir = (dir: DirectoryNode) => {
    setExplorerDirId(dir.id);
    setGameState(prev =>
      prev.exploredDirIds.includes(dir.id)
        ? prev
        : { ...prev, exploredDirIds: [...prev.exploredDirIds, dir.id] }
    );
    if (!dir.id.startsWith('cache_')) return;
    const seen = gameState.loreSeen;
    const order = [1, 2, 3, 4, 5].map(n => seen.indexOf(`lore_archivist_${n}`));
    if (order.every(i => i !== -1) && order.every((v, i, a) => i === 0 || a[i - 1] < v)) {
      const isNew = discoverSecret('trail');
      if (isNew) {
        seeLore('lore_end');
        addNotification('SECRET FOUND', "Archivist's trail complete.", NotificationType.SUCCESS);
      }
    } else {
      addNotification(
        'SEALED CACHE',
        'The cache stays shut. Read the trail parts in order first.',
        NotificationType.WARNING
      );
    }
  };

  const handleOffering = () => {
    const isNew = discoverSecret('offering');
    if (isNew) {
      seeLore('lore_offering');
      addNotification(
        'SECRET FOUND',
        'The tracer accepts your offering.',
        NotificationType.SUCCESS
      );
    } else {
      addNotification('OFFERING', 'Already accepted.', NotificationType.INFO);
    }
  };

  const handleProperties = (node: { id: string; name: string }) => {
    if (node.name.toLowerCase() === 'ascend' || node.id.startsWith('ascend_exe_')) {
      const isNew = discoverSecret('properties');
      if (isNew) {
        addNotification('SECRET FOUND', 'You read the ferry paperwork.', NotificationType.SUCCESS);
      }
      checkEggHunter();
    }
  };

  const handleOpenCore = () => {
    const isNew = discoverSecret('core');
    if (isNew)
      addNotification('SECRET FOUND', 'Four letters open a door.', NotificationType.SUCCESS);
    checkEggHunter();
    openWindow(AppId.CORE_SETTINGS);
  };

  const handleEggCrack = (rewardKB: number) => {
    setGameState(prev => ({ ...prev, dataKB: prev.dataKB + rewardKB }));
    const isNew = discoverSecret('idol');
    if (isNew)
      addNotification('SECRET FOUND', 'The egg cracks. Yolk is data.', NotificationType.SUCCESS);
    checkEggHunter();
  };

  const handleMinigameWin = (gameId: string) => {
    const iter = gameState.currentIteration;
    if (gameState.arcadeWins[gameId] === iter) return;
    const wins = MINIGAMES.filter(
      g => g.id === gameId || gameState.arcadeWins[g.id] === iter
    ).length;
    setGameState(prev => ({
      ...prev,
      arcadeWins: { ...prev.arcadeWins, [gameId]: prev.currentIteration },
    }));
    if (wins <= 1) unlockAchievement('arcade_rookie');
    if (wins >= MINIGAMES.length) unlockAchievement('arcade_master');
    addNotification(
      'MINIGAME CLEARED',
      'Score recorded for this iteration.',
      NotificationType.SUCCESS
    );
  };

  const handleRedeemPass = (gameId: string) => {
    if (gameState.passes < 1) return;
    if (gameState.arcadeWins[gameId] === gameState.currentIteration) return;
    setGameState(prev => ({ ...prev, passes: prev.passes - 1 }));
    handleMinigameWin(gameId);
  };

  const handleOpenZip = () => {
    unlockAchievement('secrets_zip');
    addNotification(
      'SECRETS.ZIP',
      'Instructions recorded under Secrets.',
      NotificationType.SUCCESS
    );
  };

  const handleCopySummary = () => {
    const summary = `ASCEND OS 100% — iteration ${gameState.currentIteration}, ${Object.keys(gameState.achievements).length} tasks, ${gameState.secretsFound.length} secrets, seed ${gameState.runSeed}`;
    try {
      const pending = navigator.clipboard?.writeText(summary);
      pending?.catch(() => {});
    } catch {}
    addNotification('COPIED', summary, NotificationType.SUCCESS);
  };

  if (isAscending) {
    return (
      <AscensionSequence
        currentIteration={gameState.currentIteration}
        onComplete={handleAscendComplete}
      />
    );
  }

  if (isBooting) {
    return <BootSequence iteration={gameState.currentIteration} onComplete={handleBootComplete} />;
  }

  return (
    <div
      className={`w-full h-screen relative overflow-hidden font-sans text-gray-100 ${gameState.wallpaper ? 'bg-gray-900' : 'bg-animated'}`}
      style={
        gameState.wallpaper
          ? {
              backgroundImage: `url(${gameState.wallpaper})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }
          : undefined
      }
      onContextMenu={handleDesktopContextMenu}
    >
      <div className="absolute top-10 right-10 text-right opacity-30 select-none pointer-events-none z-0">
        <h1 className="text-6xl font-black tracking-tighter text-white drop-shadow-lg">ASCEND</h1>
        <p className="text-xl font-mono mt-2 text-white drop-shadow-md">
          ITERATION: {gameState.currentIteration.toString().padStart(3, '0')}
        </p>
        {saveMode === 'DEV' && (
          <p className="text-xs text-red-500 font-bold tracking-widest mt-1">DEV MODE ACTIVE</p>
        )}
      </div>

      {!gameState.wallpaper && (
        <div
          title="Terminal"
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[1] opacity-5 pointer-events-none"
        >
          <Terminal size={400} />
        </div>
      )}

      <div className="absolute inset-0 z-0">
        {(gameState.shortcuts || []).map(sc => (
          <DesktopIcon
            key={sc.id}
            shortcut={sc}
            onOpen={openWindow}
            onMove={handleMoveShortcut}
            onContextMenu={handleShortcutContextMenu}
          />
        ))}
      </div>

      {windows.map(win => (
        <WindowFrame
          key={win.id}
          windowState={win}
          onClose={closeWindow}
          onMinimize={minimizeWindow}
          onToggleMaximize={toggleMaximize}
          onFocus={focusWindow}
          onMove={moveWindow}
          onContextMenu={handleContextMenu}
        >
          {win.appId === AppId.EXPLORER && fileSystem && (
            <Explorer
              root={fileSystem}
              windowId={win.id}
              onOpenFile={handleOpenFile}
              onContextMenu={handleContextMenu}
              onUpdateNode={handleUpdateNode}
              dataKB={gameState.dataKB}
              onSpendData={handleSpendData}
              isAutoMarkEnabled={gameState.isAutoMarkEnabled}
              autoMarkCount={gameState.autoMarkCount}
              onToggleAutoMark={handleToggleAutoMark}
              onConsumeAutoMark={handleConsumeAutoMark}
              onShowNotification={addNotification}
              onNavigateDir={handleNavigateDir}
              onOffering={handleOffering}
              onProperties={handleProperties}
              teleportTarget={teleportTarget}
              currentIteration={gameState.currentIteration}
            />
          )}
          {win.appId === AppId.TEXT_VIEWER && (
            <TextViewer
              file={win.data as FileNode}
              onUnlocked={handleUnlockedFile}
              onRead={handleReadFile}
            />
          )}
          {win.appId === AppId.EGG && (
            <EggHunt
              alreadyCracked={gameState.secretsFound.includes('idol')}
              onCrack={handleEggCrack}
            />
          )}
          {win.appId === AppId.MINIGAME && (
            <Minigames
              gameId={(win.data as { gameId?: string })?.gameId ?? 'pong'}
              wins={gameState.arcadeWins}
              currentIteration={gameState.currentIteration}
              passes={gameState.passes}
              onWin={handleMinigameWin}
              onRedeem={handleRedeemPass}
            />
          )}
          {win.appId === AppId.CARTOGRAPHER && fileSystem && (
            <Cartographer
              root={fileSystem}
              revealedDepths={gameState.revealedDepths}
              exploredDirIds={gameState.exploredDirIds}
              explorerDirId={explorerDirId}
              autoMarkCount={gameState.autoMarkCount}
              onTeleport={handleTeleport}
              onRevealLevel={handleRevealLevel}
            />
          )}
          {win.appId === AppId.RADAR && fileSystem && (
            <Radar root={fileSystem} onTeleport={handleTeleport} />
          )}
          {win.appId === AppId.CLICKER && (
            <Clicker
              dataKB={gameState.dataKB}
              onIncrement={handleHarvestData}
              clickValue={clickValue}
              activeMultiplier={gameState.activeBoostMultiplier}
              boostBank={gameState.boostBank}
              onToggleBoost={handleToggleBoost}
              autoMinerData={gameState.autoMinerData}
              autoMinerInterval={gameState.autoMinerInterval}
            />
          )}
          {win.appId === AppId.UPDATES && (
            <Updates
              gameState={gameState}
              onPurchaseUpgrade={handlePurchaseUpgrade}
              onPurchaseBoost={handlePurchaseBoost}
              onPurchaseAutoMark={handlePurchaseAutoMark}
              onUnlockTool={handleUnlockTool}
            />
          )}
          {win.appId === AppId.PERSONALIZE && (
            <Personalize
              currentWallpaper={gameState.wallpaper}
              onSetWallpaper={handleSetWallpaper}
            />
          )}
          {win.appId === AppId.HELP && <SystemHelp onOpenCore={handleOpenCore} />}
          {win.appId === AppId.ACHIEVEMENTS && (
            <Achievements
              gameState={gameState}
              progress={progress}
              zipEarned={zipEarned}
              onOpenZip={handleOpenZip}
            />
          )}
          {win.appId === AppId.CORE_SETTINGS && (
            <CoreSettings
              gameState={gameState}
              saveMode={saveMode}
              onUpdateSeed={handleUpdateSeed}
              onToggleDevMode={handleToggleDevMode}
              onToggleAscendRoot={handleToggleAscendRoot}
              onResetSession={handleResetSession}
              onFactoryReset={handleFactoryReset}
              onSwitchToNormal={handleSwitchToNormal}
              onImportSave={handleImportSave}
            />
          )}
          {win.appId === AppId.ASCENSION && (
            <AscensionGate
              gameState={gameState}
              root={fileSystem}
              dataKB={gameState.dataKB}
              onSpendData={handleSpendData}
              onShowLocation={file => openWindow(AppId.TEXT_VIEWER, file)}
              onPayFuel={handlePayFuel}
              onConfirm={handleAscendStart}
              onAbort={() => closeWindow(win.id)}
            />
          )}
        </WindowFrame>
      ))}

      <Taskbar
        windows={windows}
        activeWindowId={activeWindowId}
        onOpenApp={openWindow}
        onFocusWindow={focusWindow}
        onCloseWindow={closeWindow}
        onMinimize={minimizeWindow}
        onToggleMaximize={toggleMaximize}
        onContextMenu={handleContextMenu}
        onPinToDesktop={handlePinToDesktop}
        unlockedTools={gameState.unlockedTools}
        progress={progress}
      />

      {contextMenu.isOpen && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={contextMenu.items}
          onClose={closeContextMenu}
        />
      )}

      <NotificationSystem notifications={notifications} onDismiss={dismissNotification} />

      {showZipReward && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/70">
          <div className="max-w-md w-full bg-gray-900 border border-purple-500/50 rounded-lg p-6 font-mono text-center shadow-[0_0_60px_rgba(168,85,247,0.35)]">
            <p className="text-xs tracking-[0.3em] text-purple-400">ARCHIVIST TRANSMISSION</p>
            <h2 className="text-xl font-bold text-white mt-2">secrets.zip is yours</h2>
            <p className="text-sm text-gray-400 mt-2">
              You finished every task on the checklist. The hidden instructions wait in the
              Achievements app under Secrets.
            </p>
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => {
                  dismissZipReward();
                  openWindow(AppId.ACHIEVEMENTS);
                }}
                className="flex-1 px-4 py-2 rounded bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold"
              >
                OPEN SECRETS
              </button>
              <button
                onClick={() => dismissZipReward()}
                className="flex-1 px-4 py-2 rounded border border-gray-700 text-gray-300 text-sm"
              >
                LATER
              </button>
            </div>
          </div>
        </div>
      )}

      {showThankYou && (
        <ThankYouLetter
          gameState={gameState}
          onClose={() => dismissThankYou()}
          onCopy={handleCopySummary}
        />
      )}

      <div className="scanline"></div>
    </div>
  );
};

export default App;
