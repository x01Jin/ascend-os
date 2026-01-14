import React, { useState, useEffect, useCallback } from 'react';
import { GameState, WindowState, AppId, FileNode, FileExtension, DirectoryNode, FileType, DesktopShortcut, AppNotification, NotificationType, NodeModification } from './types';
import { generateFileSystem } from './services/generator';
import { loadGame, saveGame, getSaveMode, setSaveMode, resetSave, factoryReset, SaveMode } from './services/storage';
import { processDevMode } from './services/devMode';
import {
  INITIAL_GAME_STATE,
  DESKTOP_GRID,
  CLICK_VALUE_BASE,
  CLICK_UPGRADE_INCREMENT,
  UPGRADE_COST_BASE,
  BOOST_COST_BASE_PER_SEC,
  AUTOMARK_COST_PER_UNIT,
  AUTOMINER_MIN_INTERVAL
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
import { Terminal, AlertTriangle } from 'lucide-react';

// Helper to remove already consumed packages/modules from the generated tree
const filterConsumedNodes = (node: DirectoryNode, consumedIds: string[]): DirectoryNode => {
  if (consumedIds.length === 0) return node;

  // Filter out children that are in the consumed list
  const validChildren = node.children.filter(child => !consumedIds.includes(child.id));

  // Recursively filter subfolders
  const processedChildren = validChildren.map(child => {
    if (child.type === FileType.FOLDER) {
      return filterConsumedNodes(child as DirectoryNode, consumedIds);
    }
    return child;
  });

  return { ...node, children: processedChildren };
};

// Helper to apply persistent modifications (Renames, Marks, Scanned) to the generated tree
const applyModifications = (node: DirectoryNode, modifications: Record<string, NodeModification>): DirectoryNode => {
  let newNode = { ...node };

  // Apply modification to current node if exists
  if (modifications[node.id]) {
    const mods = modifications[node.id];
    if (mods.name !== undefined) newNode.name = mods.name;
    if (mods.isMarked !== undefined) newNode.isMarked = mods.isMarked;
    if (mods.isScanned !== undefined) newNode.isScanned = mods.isScanned;
  }

  // Recurse for children
  newNode.children = newNode.children.map(child => {
    if (child.type === FileType.FOLDER) {
      return applyModifications(child as DirectoryNode, modifications);
    } else {
      // Apply mods to files too
      if (modifications[child.id]) {
        const mods = modifications[child.id];
        // Type casting needed because modifications can contain any property, safe here
        return { ...child, ...mods } as FileNode;
      }
      return child;
    }
  });

  return newNode;
};

const App: React.FC = () => {
  // Game State
  const [saveMode, setSaveModeState] = useState<SaveMode>('NORMAL');
  const [gameState, setGameState] = useState<GameState>(INITIAL_GAME_STATE);
  const [fileSystem, setFileSystem] = useState<DirectoryNode | null>(null);

  // System Phases
  const [isBooting, setIsBooting] = useState(true);
  const [isAscending, setIsAscending] = useState(false);

  // Window Manager State
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const [nextZIndex, setNextZIndex] = useState(100);
  const [cascadeCount, setCascadeCount] = useState(0);

  // Context Menu State
  const [contextMenu, setContextMenu] = useState<{
    isOpen: boolean;
    x: number;
    y: number;
    items: ContextMenuItem[];
  }>({ isOpen: false, x: 0, y: 0, items: [] });

  // Notifications
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // Update Loop for Timers (Boost Consumption)
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
              [mult]: Math.max(0, currentBank - tickRate)
            }
          };
        }
        return prev;
      });
    }, tickRate);
    return () => clearInterval(timer);
  }, []);

  // --- Auto Miner Loop & Infinite Data Check ---
  useEffect(() => {
    const intervalId = setInterval(() => {
      setGameState(prev => {
        let newState = { ...prev };

        // Apply Auto Miner if powered
        if (prev.autoMinerData > 0) {
          newState.dataKB = prev.dataKB + prev.autoMinerData;
        }

        // Apply Dev Mode Infinite Data
        if (prev.isDevModeEnabled && newState.dataKB < 999999999) {
          newState.dataKB = 999999999999;
        }

        return newState;
      });
    }, gameState.autoMinerInterval);

    return () => clearInterval(intervalId);
  }, [gameState.autoMinerData, gameState.autoMinerInterval, gameState.isDevModeEnabled]);


  // --- Initialization ---
  const initializeSystem = useCallback((mode: SaveMode) => {
    let loadedState = loadGame(mode);

    if (!loadedState) {
      loadedState = { ...INITIAL_GAME_STATE };
      loadedState.runSeed = Date.now();
    }

    if (!loadedState.shortcuts) {
      loadedState.shortcuts = INITIAL_GAME_STATE.shortcuts;
    }

    loadedState = processDevMode(loadedState);

    setGameState(loadedState);
    setSaveModeState(mode);

    const rawFS = generateFileSystem(loadedState.currentIteration, loadedState.runSeed, loadedState.isAscendRootEnabled);
    const filteredFS = filterConsumedNodes(rawFS, loadedState.consumedIds || []);
    const finalFS = applyModifications(filteredFS, loadedState.modifiedNodes || {});

    setFileSystem(finalFS);
  }, []);

  useEffect(() => {
    const currentMode = getSaveMode();
    initializeSystem(currentMode);
  }, [initializeSystem]);

  // Save on change
  useEffect(() => {
    if (!isBooting && !isAscending) {
      saveGame(gameState, saveMode);
    }
  }, [gameState, isBooting, isAscending, saveMode]);

  // --- Notification Manager ---
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

  // --- Context Menu Handler ---
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
      { label: 'About Ascend OS', action: () => openWindow(AppId.HELP) }
    ]);
  };

  // --- File System Management ---

  const updateNodeRecursively = (node: DirectoryNode, targetId: string, updates: Partial<FileNode | DirectoryNode> | null): DirectoryNode => {
    if (node.id === targetId && updates) {
      return { ...node, ...updates } as DirectoryNode;
    }

    if (node.children.some(c => c.id === targetId && updates === null)) {
      return {
        ...node,
        children: node.children.filter(c => c.id !== targetId)
      };
    }

    const newChildren = node.children.map(child => {
      if (child.id === targetId && updates) {
        return { ...child, ...updates } as any;
      }
      if (child.type === FileType.FOLDER) {
        return updateNodeRecursively(child as DirectoryNode, targetId, updates);
      }
      return child;
    });

    return { ...node, children: newChildren };
  };

  const handleUpdateNode = (id: string, updates: Partial<FileNode | DirectoryNode>) => {
    if (!fileSystem) return;

    const newFileSystem = updateNodeRecursively(fileSystem, id, updates);
    setFileSystem(newFileSystem);

    setGameState(prev => {
      const currentMods = prev.modifiedNodes?.[id] || {};
      const relevantUpdates: any = {};
      if (updates.name !== undefined) relevantUpdates.name = updates.name;
      if (updates.isMarked !== undefined) relevantUpdates.isMarked = updates.isMarked;
      if (updates.isScanned !== undefined) relevantUpdates.isScanned = updates.isScanned;

      if (Object.keys(relevantUpdates).length === 0) return prev;

      return {
        ...prev,
        modifiedNodes: {
          ...prev.modifiedNodes,
          [id]: { ...currentMods, ...relevantUpdates }
        }
      };
    });
  };

  const handleDeleteNode = (id: string) => {
    if (!fileSystem) return;
    const newFileSystem = updateNodeRecursively(fileSystem, id, null);
    setFileSystem(newFileSystem);
  };

  // --- Window Management ---

  useEffect(() => {
    if (windows.length === 0 && cascadeCount > 0) {
      setCascadeCount(0);
    }
  }, [windows.length, cascadeCount]);

  const openWindow = useCallback((appId: AppId, data?: any) => {
    // Only a subset of apps should be single-instance (do not open duplicates)
    const singleInstanceApps = new Set<AppId>([AppId.CORE_SETTINGS, AppId.HELP, AppId.PERSONALIZE]);
    if (singleInstanceApps.has(appId)) {
      const existing = windows.find(w => w.appId === appId);
      if (existing) {
        setWindows(prev => prev.map(w => w.id === existing.id ? { ...w, zIndex: nextZIndex, isMinimized: false } : w));
        setActiveWindowId(existing.id);
        setNextZIndex(prev => prev + 1);
        return existing.id;
      }
    }

    const id = `${appId}_${Date.now()}`;
    let title = 'Application';

    switch (appId) {
      case AppId.EXPLORER: title = 'File Explorer'; break;
      case AppId.TEXT_VIEWER: title = data?.name || 'Text Viewer'; break;
      case AppId.CLICKER: title = 'Data Miner'; break;
      case AppId.UPDATES: title = 'System Updates'; break;
      case AppId.HELP: title = 'System Help'; break;
      case AppId.ASCENSION: title = 'System Ascension'; break;
      case AppId.PERSONALIZE: title = 'Personalization'; break;
      case AppId.CORE_SETTINGS: title = 'CORE_SETTINGS'; break;
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

    let startX = (viewportWidth / 2) - (winWidth / 2) + cascadeOffset;
    let startY = (viewportHeight / 2) - (winHeight / 2) + cascadeOffset;

    startX = Math.max(10, startX);
    startY = Math.max(10, startY);

    const newWindow: WindowState = {
      id,
      appId,
      title,
      zIndex: nextZIndex,
      isMinimized: false,
      data,
      position: { x: startX, y: startY }
    };

    setWindows(prev => [...prev, newWindow]);
    setActiveWindowId(id);
    setNextZIndex(prev => prev + 1);
    setCascadeCount(currentCascadeCount + 1);
  }, [nextZIndex, cascadeCount, windows]);

  const closeWindow = (id: string) => {
    setWindows(prev => prev.filter(w => w.id !== id));
    if (activeWindowId === id) setActiveWindowId(null);
    setCascadeCount(0);
  };

  const focusWindow = (id: string) => {
    if (activeWindowId === id) {
      const win = windows.find(w => w.id === id);
      if (win?.isMinimized) {
        setWindows(prev => prev.map(w => w.id === id ? { ...w, isMinimized: false, zIndex: nextZIndex } : w));
        setNextZIndex(prev => prev + 1);
      }
      return;
    }

    setWindows(prev => prev.map(w => w.id === id ? { ...w, zIndex: nextZIndex, isMinimized: false } : w));
    setActiveWindowId(id);
    setNextZIndex(prev => prev + 1);
  };

  const minimizeWindow = (id: string) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, isMinimized: true } : w));
    if (activeWindowId === id) setActiveWindowId(null);
  };

  const moveWindow = (id: string, x: number, y: number) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, position: { x, y } } : w));
    setCascadeCount(0);
  };

  // --- Desktop Shortcuts ---

  const handleMoveShortcut = (id: string, gridX: number, gridY: number) => {
    setGameState(prev => {
      const isOccupied = prev.shortcuts.some(sc => sc.id !== id && sc.gridX === gridX && sc.gridY === gridY);

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
        label: 'Delete Shortcut', action: () => {
          setGameState(prev => ({
            ...prev,
            shortcuts: prev.shortcuts.filter(s => s.id !== shortcut.id)
          }));
        }, danger: true
      }
    ]);
  };

  const handlePinToDesktop = (appId: AppId, label: string) => {
    setGameState(prev => {
      let gridX = 0;
      let gridY = 0;
      const maxCols = Math.floor((window.innerWidth - DESKTOP_GRID.MARGIN_LEFT) / DESKTOP_GRID.WIDTH);
      const maxRows = Math.floor((window.innerHeight - DESKTOP_GRID.MARGIN_TOP) / DESKTOP_GRID.HEIGHT);

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
        gridY
      };

      return { ...prev, shortcuts: [...prev.shortcuts, newShortcut] };
    });
  };

  // --- Game Logic ---

  const activeBoost = gameState.activeBoostMultiplier || 1;
  const clickValue = (CLICK_VALUE_BASE + (gameState.efficiencyLevel * CLICK_UPGRADE_INCREMENT)) * activeBoost;

  const handleHarvestData = () => {
    setGameState(prev => ({ ...prev, dataKB: prev.dataKB + clickValue }));
  };

  const handleSpendData = (amount: number) => {
    setGameState(prev => ({ ...prev, dataKB: Math.max(0, prev.dataKB - amount) }));
  };

  const handlePurchaseUpgrade = () => {
    const cost = Math.floor(UPGRADE_COST_BASE * Math.pow(1.15, gameState.efficiencyLevel));
    if (gameState.dataKB >= cost) {
      setGameState(prev => ({
        ...prev,
        dataKB: prev.dataKB - cost,
        efficiencyLevel: prev.efficiencyLevel + 1
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
          [multiplier]: (prev.boostBank[multiplier] || 0) + (seconds * 1000)
        }
      }));
    }
  };

  const handlePurchaseAutoMark = (amount: number) => {
    const cost = amount * AUTOMARK_COST_PER_UNIT;
    if (gameState.dataKB >= cost) {
      setGameState(prev => ({
        ...prev,
        dataKB: prev.dataKB - cost,
        autoMarkCount: prev.autoMarkCount + amount
      }));
    }
  };

  const handleToggleAutoMark = () => {
    setGameState(prev => ({ ...prev, isAutoMarkEnabled: !prev.isAutoMarkEnabled }));
  };

  const handleConsumeAutoMark = () => {
    setGameState(prev => ({ ...prev, autoMarkCount: Math.max(0, prev.autoMarkCount - 1) }));
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
      "DISPLAY SETTINGS",
      dataUrl ? "Wallpaper updated successfully." : "Wallpaper reset to default.",
      NotificationType.SUCCESS
    );
  };

  // --- CORE SETTINGS & SAVE HANDLING ---

  const rebootSystem = (targetMode: SaveMode) => {
    // Save Current State before switching
    saveGame(gameState, saveMode);

    // Switch Mode
    setSaveMode(targetMode);
    setSaveModeState(targetMode);

    // Initialize New State
    setWindows([]);
    setCascadeCount(0);
    setIsBooting(true);
    initializeSystem(targetMode);
  };

  const handleUpdateSeed = (newSeed: number) => {
    // "Reset everything beyond factory" -> Wipe all storage
    factoryReset();

    // Re-initialize with new seed but default everything else (NORMAL mode behavior)
    const newState: GameState = {
      ...INITIAL_GAME_STATE,
      runSeed: newSeed,
    };

    // Force Normal Mode since we wiped Dev state
    setSaveMode('NORMAL');
    setSaveModeState('NORMAL');

    setGameState(newState);

    // Regenerate standard FS (Root false)
    const rawFS = generateFileSystem(newState.currentIteration, newSeed, false);
    setFileSystem(rawFS);

    // Save immediately to NORMAL slot
    saveGame(newState, 'NORMAL');

    // Trigger Reboot
    setWindows([]);
    setCascadeCount(0);
    setIsBooting(true);
  };

  const handleImportSave = (importedState: GameState) => {
    const targetMode = importedState.isDevModeEnabled ? 'DEV' : 'NORMAL';

    // Save imported state to disk immediately
    saveGame(importedState, targetMode);

    // Force switch to target mode if different
    if (saveMode !== targetMode) {
      setSaveMode(targetMode);
      setSaveModeState(targetMode);
    }

    // Load state into memory
    setGameState(importedState);

    // Regenerate world
    const rawFS = generateFileSystem(importedState.currentIteration, importedState.runSeed, importedState.isAscendRootEnabled);
    const filteredFS = filterConsumedNodes(rawFS, importedState.consumedIds || []);
    const finalFS = applyModifications(filteredFS, importedState.modifiedNodes || {});
    setFileSystem(finalFS);

    // Reboot
    setWindows([]);
    setCascadeCount(0);
    setIsBooting(true);

    addNotification("IMPORT SUCCESSFUL", `Loaded save data. Mode: ${targetMode}`, NotificationType.SUCCESS);
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
        const filteredFS = filterConsumedNodes(rawFS, prev.consumedIds || []);
        const finalFS = applyModifications(filteredFS, prev.modifiedNodes || {});
        setFileSystem(finalFS);

        return { ...prev, isAscendRootEnabled: next };
      });
    }
  };

  const handleResetSession = () => {
    resetSave(saveMode);
    rebootSystem(saveMode);
    addNotification("SESSION RESET", "Local state cleared.", NotificationType.WARNING);
  };

  const handleFactoryReset = () => {
    factoryReset();
    window.location.reload();
  };

  const handleSwitchToNormal = () => {
    rebootSystem('NORMAL');
  };

  // ---

  const handleAscendStart = () => {
    setWindows([]);
    setCascadeCount(0);
    setIsAscending(true);
  };

  const handleAscendComplete = () => {
    const nextIteration = gameState.currentIteration + 1;
    const newScore = Math.max(gameState.highScore, nextIteration);

    setGameState(prev => {
      const nextState = {
        ...prev,
        currentIteration: nextIteration,
        highScore: newScore,
        activeBoostMultiplier: null, // Reset active boost on ascend
        consumedIds: [], // Reset consumed list for new iteration
        modifiedNodes: {} // Reset modifications for new iteration
      };

      const rawFS = generateFileSystem(nextIteration, prev.runSeed, prev.isAscendRootEnabled);
      setFileSystem(rawFS);

      return nextState;
    });

    setIsAscending(false);
    setIsBooting(true);
  };

  const handleBootComplete = useCallback(() => {
    setIsBooting(false);
  }, []);

  const handleOpenItem = (file: FileNode) => {
    if (!file.packageContent) return;

    const { type, value, multiplier } = file.packageContent;
    let msg = "";

    if (file.type === FileType.MODULE) {

      let effectiveType = type;
      let effectiveValue = value;

      if (type === 'AUTOMINER_SPEED' && gameState.autoMinerInterval <= AUTOMINER_MIN_INTERVAL) {
        effectiveType = 'AUTOMINER_POWER';
        effectiveValue = Math.floor(Math.random() * 3) + 1; // 1-3
      }

      setGameState(prev => {
        const newState = {
          ...prev,
          consumedIds: [...prev.consumedIds, file.id]
        };
        if (effectiveType === 'AUTOMINER_POWER') {
          newState.autoMinerData += effectiveValue;
        } else if (effectiveType === 'AUTOMINER_SPEED') {
          newState.autoMinerInterval = Math.max(AUTOMINER_MIN_INTERVAL, prev.autoMinerInterval - effectiveValue);
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

      addNotification("MODULE INSTALLED", msg, NotificationType.SUCCESS);

    } else {
      setGameState(prev => {
        const newState = {
          ...prev,
          consumedIds: [...prev.consumedIds, file.id]
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
            [multiplier]: (prev.boostBank[multiplier] || 0) + value
          };
          msg = `+${(value / 1000).toFixed(1)}s of x${multiplier} Boost`;
        }
        return newState;
      });
      addNotification("PACKAGE DECRYPTED", msg, NotificationType.INFO);
    }

    handleDeleteNode(file.id);
  };

  const handleOpenFile = (file: FileNode) => {
    if (file.type === FileType.PACKAGE || file.type === FileType.MODULE) {
      handleOpenItem(file);
      return;
    }
    if (file.extension === FileExtension.EXE && (file.name.toLowerCase() === 'ascend' || file.content === 'EXECUTE_ASCENSION')) {
      openWindow(AppId.ASCENSION, file);
    } else if (file.extension === FileExtension.TXT) {
      openWindow(AppId.TEXT_VIEWER, file);
    }
  };

  // --- Render Phases ---

  if (isAscending) {
    return <AscensionSequence currentIteration={gameState.currentIteration} onComplete={handleAscendComplete} />;
  }

  if (isBooting) {
    return <BootSequence iteration={gameState.currentIteration} onComplete={handleBootComplete} />;
  }

  return (
    <div
      className={`w-full h-screen relative overflow-hidden font-sans text-gray-100 ${gameState.wallpaper ? 'bg-gray-900' : 'bg-animated'}`}
      style={gameState.wallpaper ? {
        backgroundImage: `url(${gameState.wallpaper})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      } : undefined}
      onContextMenu={handleDesktopContextMenu}
    >

      {/* HUD Elements: Title & Iteration (Always visible, Top Right) */}
      <div className="absolute top-10 right-10 text-right opacity-30 select-none pointer-events-none z-0">
        <h1 className="text-6xl font-black tracking-tighter text-white drop-shadow-lg">ASCEND</h1>
        <p className="text-xl font-mono mt-2 text-white drop-shadow-md">ITERATION: {gameState.currentIteration.toString().padStart(3, '0')}</p>
        {saveMode === 'DEV' && <p className="text-xs text-red-500 font-bold tracking-widest mt-1">DEV MODE ACTIVE</p>}
      </div>

      {/* Default Wallpaper Elements (Center Logo) */}
      {!gameState.wallpaper && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
          <Terminal size={400} />
        </div>
      )}

      {/* Desktop Icons */}
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

      {/* Windows Layer */}
      {windows.map(win => (
        <WindowFrame
          key={win.id}
          windowState={win}
          onClose={closeWindow}
          onMinimize={minimizeWindow}
          onFocus={focusWindow}
          onMove={moveWindow}
          onContextMenu={handleContextMenu}
        >
          {win.appId === AppId.EXPLORER && fileSystem && (
            <Explorer
              root={fileSystem}
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
            />
          )}
          {win.appId === AppId.TEXT_VIEWER && (
            <TextViewer file={win.data} />
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
            />
          )}
          {win.appId === AppId.PERSONALIZE && (
            <Personalize
              currentWallpaper={gameState.wallpaper}
              onSetWallpaper={handleSetWallpaper}
            />
          )}
          {win.appId === AppId.HELP && (
            <SystemHelp onOpenCore={() => openWindow(AppId.CORE_SETTINGS)} />
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
            <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-gray-950 select-none">
              <AlertTriangle className="w-20 h-20 text-red-500 mb-6 animate-pulse" />
              <h2 className="text-2xl font-bold text-red-500 mb-4 tracking-wider">SYSTEM WARNING</h2>
              <div className="bg-red-900/10 border border-red-900/30 p-4 rounded-lg mb-8 max-w-md">
                <p className="text-red-200 font-mono text-sm leading-relaxed">
                  ASCENSION PROTOCOL DETECTED.<br />
                  EXECUTING WILL RESET LOCAL DIRECTORY STRUCTURE.<br />
                  SYSTEM COMPLEXITY WILL INCREASE.
                </p>
              </div>
              <div className="flex gap-6">
                <button
                  onClick={() => closeWindow(win.id)}
                  className="px-6 py-3 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 font-mono text-sm transition-colors border border-gray-700"
                >
                  ABORT
                </button>
                <button
                  onClick={() => handleAscendStart()}
                  className="px-6 py-3 rounded bg-red-600 hover:bg-red-500 text-white font-mono font-bold text-sm transition-all shadow-lg shadow-red-900/50 border border-red-400"
                >
                  CONFIRM UPLOAD
                </button>
              </div>
            </div>
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
        onContextMenu={handleContextMenu}
        onPinToDesktop={handlePinToDesktop}
      />

      {/* Global Context Menu */}
      {contextMenu.isOpen && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={contextMenu.items}
          onClose={closeContextMenu}
        />
      )}

      {/* Notification Layer */}
      <NotificationSystem notifications={notifications} onDismiss={dismissNotification} />

      {/* Scanline Overlay */}
      <div className="scanline"></div>
    </div>
  );
};

export default App;