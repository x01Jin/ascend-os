import { DirectoryNode, FileSystemNode, FileType, NodeModification } from '../types';
import { generateFileSystem } from './generator';
import { loadGame, SaveMode } from './storage';
import { processDevMode } from './devMode';
import { INITIAL_GAME_STATE, OFFLINE_YIELD_CAP_MS, OFFLINE_YIELD_RATE } from '../constants';

export const findNodeById = (node: DirectoryNode, id: string): FileSystemNode | null => {
  if (node.id === id) return node;
  for (const child of node.children) {
    if (child.id === id) return child;
    if (child.type === FileType.FOLDER) {
      const found = findNodeById(child as DirectoryNode, id);
      if (found) return found;
    }
  }
  return null;
};

export const ancestorIds = (tree: DirectoryNode, id: string): Set<string> => {
  const ids = new Set<string>();
  const walk = (node: DirectoryNode, trail: string[]): boolean => {
    if (node.id === id) {
      trail.forEach(t => ids.add(t));
      ids.add(node.id);
      return true;
    }
    for (const child of node.children) {
      if (child.id === id) {
        trail.forEach(t => ids.add(t));
        ids.add(node.id);
        ids.add(child.id);
        return true;
      }
      if (child.type === FileType.FOLDER && walk(child as DirectoryNode, [...trail, node.id])) {
        return true;
      }
    }
    return false;
  };
  walk(tree, []);
  return ids;
};

export const prepareFileSystem = (
  root: DirectoryNode,
  consumedIds: string[],
  modifications: Record<string, NodeModification>
): DirectoryNode => {
  const consumed = new Set(consumedIds);
  const apply = (node: DirectoryNode): DirectoryNode => {
    const mods = modifications[node.id];
    const next: DirectoryNode = {
      ...node,
      ...(mods?.name !== undefined ? { name: mods.name } : {}),
      ...(mods?.isMarked !== undefined ? { isMarked: mods.isMarked } : {}),
      ...(mods?.markKind !== undefined ? { markKind: mods.markKind } : {}),
      ...(mods?.isScanned !== undefined ? { isScanned: mods.isScanned } : {}),
    };
    next.children = next.children
      .filter(child => !consumed.has(child.id))
      .map(child => {
        if (child.type === FileType.FOLDER) return apply(child as DirectoryNode);
        const fileMods = modifications[child.id];
        return fileMods ? { ...child, ...fileMods } : child;
      });
    return next;
  };
  if (consumed.size === 0 && Object.keys(modifications).length === 0) return root;
  return apply(root);
};

export const updateNodeRecursively = (
  node: DirectoryNode,
  targetId: string,
  updates: NodeModification | null
): DirectoryNode => {
  if (node.id === targetId && updates) {
    return { ...node, ...updates };
  }

  if (node.children.some(c => c.id === targetId && updates === null)) {
    return {
      ...node,
      children: node.children.filter(c => c.id !== targetId),
    };
  }

  const newChildren = node.children.map(child => {
    if (child.id === targetId && updates) {
      return { ...child, ...updates };
    }
    if (child.type === FileType.FOLDER) {
      return updateNodeRecursively(child as DirectoryNode, targetId, updates);
    }
    return child;
  });

  return { ...node, children: newChildren };
};

export const buildSystem = (mode: SaveMode) => {
  let loadedState = loadGame(mode);

  if (!loadedState) {
    loadedState = { ...INITIAL_GAME_STATE };
    loadedState.runSeed = Date.now();
  }

  if (!loadedState.shortcuts) {
    loadedState.shortcuts = INITIAL_GAME_STATE.shortcuts;
  }

  loadedState = processDevMode(loadedState);

  let offlineYieldKB = 0;
  if (loadedState.lastTickAt > 0 && loadedState.autoMinerData > 0) {
    const elapsed = Math.min(Date.now() - loadedState.lastTickAt, OFFLINE_YIELD_CAP_MS);
    const ticks = Math.floor(elapsed / Math.max(1, loadedState.autoMinerInterval));
    if (ticks > 0) {
      offlineYieldKB = Math.floor(ticks * loadedState.autoMinerData * OFFLINE_YIELD_RATE);
      loadedState = {
        ...loadedState,
        dataKB: loadedState.dataKB + offlineYieldKB,
        stats: {
          ...loadedState.stats,
          totalMinedKB: loadedState.stats.totalMinedKB + offlineYieldKB,
        },
      };
    }
  }
  loadedState = { ...loadedState, lastTickAt: Date.now() };

  const rawFS = generateFileSystem(
    loadedState.currentIteration,
    loadedState.runSeed,
    loadedState.isAscendRootEnabled
  );
  const finalFS = prepareFileSystem(
    rawFS,
    loadedState.consumedIds || [],
    loadedState.modifiedNodes || {}
  );

  return { loadedState, finalFS, offlineYieldKB };
};
