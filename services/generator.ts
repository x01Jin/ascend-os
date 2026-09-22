import {
  DirectoryNode,
  FileNode,
  FileType,
  FileExtension,
  PackageContent,
  BoostMultiplier,
} from '../types';
import { MINIGAMES } from './gate';

let rngState = 1;
const random = () => {
  rngState = (rngState + 0x6d2b79f5) | 0;
  let t = Math.imul(rngState ^ (rngState >>> 15), 1 | rngState);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const setSeed = (s: number) => {
  rngState = s | 0;
};

const randInt = (min: number, max: number) => Math.floor(random() * (max - min + 1)) + min;
const randChoice = <T>(arr: T[]): T => arr[randInt(0, arr.length - 1)];

const placeFile = (host: DirectoryNode, file: FileNode) => {
  file.parentId = host.id;
  host.children.push(file);
};

const FOLDER_NAMES = [
  'System',
  'Bin',
  'Users',
  'Local',
  'Cache',
  'Temp',
  'Logs',
  'Core',
  'Network',
  'Config',
  'Driver',
  'Kernel',
  'Boot',
  'Recovery',
  'Root',
];

const MODULE_CONTENT = 'sealed hardware module. install feeds the auto-miner.';

const FILE_PREFIXES = ['sys', 'log', 'err', 'data', 'dump', 'net', 'cfg', 'run', 'batch', 'proc'];
const FILE_SUFFIXES = ['_bak', '_old', '_v1', '_final', '_tmp', '_01', '_hex'];

const generateFileName = () => {
  return `${randChoice(FILE_PREFIXES)}${random() > 0.5 ? randChoice(FILE_SUFFIXES) : ''}_${randInt(100, 999)}`;
};

const generateFileContent = (parentId: string, _iteration: number) => {
  return `[MANIFEST LOG-03] 03:13 COPY CHECKSUM OK. 03:14 COPY MISMATCH. ${parentId} SEALED 03:12.`;
};

const generatePackageContent = (): PackageContent => {
  const roll = random();

  if (roll > 0.9) {
    const multiplier = randInt(2, 5) as BoostMultiplier;
    const duration = randInt(1, 5);
    return { type: 'BOOST', value: duration * 1000, multiplier };
  } else if (roll > 0.6) {
    return { type: 'AUTOMARK', value: randInt(3, 6) };
  } else {
    const mb = randInt(8, 14);
    return { type: 'DATA', value: mb * 1024 };
  }
};

const supplyLabel = (name: string, iteration: number) => {
  const layer = String(Math.max(1, iteration - 1)).padStart(2, '0');
  return `[SUPPLY OPR-04] ${name} from layer ${layer} unpack. seal torn 2038-01-20. contents listed inside.`;
};

const generateModuleContent = (): PackageContent => {
  const roll = random();

  if (roll > 0.7) {
    const reduction = randInt(10, 100);
    return { type: 'AUTOMINER_SPEED', value: reduction };
  } else {
    const power = randInt(1, 5);
    return { type: 'AUTOMINER_POWER', value: power };
  }
};

const generateJunkStructure = (
  parent: DirectoryNode,
  currentDepth: number,
  maxDepth: number,
  iteration: number
) => {
  if (currentDepth >= maxDepth) {
    const leafFileCount = randInt(1, 3);
    for (let i = 0; i < leafFileCount; i++) {
      const fname = generateFileName();
      const file: FileNode = {
        id: `junk_file_leaf_${parent.id}_${i}`,
        name: fname,
        type: FileType.FILE,
        extension: FileExtension.TXT,
        content: generateFileContent(parent.id, iteration),
        parentId: parent.id,
        isWinningPath: false,
        loreId: 'lore_manifest',
      };
      parent.children.push(file);
    }
    return;
  }

  const density = randInt(2, 4 + Math.floor(iteration / 3));

  for (let i = 0; i < density; i++) {
    const roll = random();

    if (roll > 0.95) {
      const file: FileNode = {
        id: `mod_${parent.id}_${i}`,
        name: `hw_mod_${randInt(100, 999)}`,
        type: FileType.MODULE,
        extension: FileExtension.MOD,
        content: MODULE_CONTENT,
        packageContent: generateModuleContent(),
        parentId: parent.id,
        isWinningPath: false,
      };
      parent.children.push(file);
      continue;
    }

    if (roll > 0.82) {
      const supplyName = `supply_${randInt(100, 999)}`;
      const file: FileNode = {
        id: `pkg_${parent.id}_${i}`,
        name: supplyName,
        type: FileType.PACKAGE,
        extension: FileExtension.PKG,
        content: supplyLabel(supplyName, iteration),
        packageContent: generatePackageContent(),
        parentId: parent.id,
        isWinningPath: false,
      };
      parent.children.push(file);
      continue;
    }

    const isFolder = random() > 0.4;

    if (isFolder) {
      const folderName = `${randChoice(FOLDER_NAMES)}_${randInt(100, 999)}`;
      const folder: DirectoryNode = {
        id: `junk_dir_${parent.id}_${i}`,
        name: folderName,
        type: FileType.FOLDER,
        children: [],
        parentId: parent.id,
        isWinningPath: false,
      };
      parent.children.push(folder);
      generateJunkStructure(folder, currentDepth + 1, maxDepth, iteration);
    } else {
      const fname = generateFileName();
      const file: FileNode = {
        id: `junk_file_${parent.id}_${i}`,
        name: fname,
        type: FileType.FILE,
        extension: FileExtension.TXT,
        content: generateFileContent(parent.id, iteration),
        parentId: parent.id,
        isWinningPath: false,
        loreId: 'lore_manifest',
      };
      parent.children.push(file);
    }
  }
};

const GHOST_WORDS_BY_LAYER: Record<number, string[]> = {
  1: ['vane-02'],
  2: ['vane-02', 'okafor-02'],
  3: ['ibarra-03', 'pell-03'],
  4: ['layer-04', 'orphan-04'],
  5: ['handoff-05', 'archive-05'],
};
const GHOST_WORDS_DEEP = ['node-06', 'carry-06'];

export const ghostWordFor = (runSeed: number, iteration: number): string => {
  const layer = Math.max(1, Math.floor(iteration));
  const pool = layer >= 6 ? GHOST_WORDS_DEEP : GHOST_WORDS_BY_LAYER[layer];
  const names = pool ?? GHOST_WORDS_DEEP;
  return names[Math.abs(Math.floor(runSeed)) % names.length];
};

export const ghostPasswordFor = (_runSeed: number, iteration: number): string =>
  `/holds/${String(iteration + 1).padStart(2, '0')}/README`;

export const generateFileSystem = (
  iteration: number,
  runSeed: number,
  forceRoot: boolean = false
): DirectoryNode => {
  setSeed(runSeed + iteration * 1337);

  const rootId = 'root';
  const root: DirectoryNode = {
    id: rootId,
    name: 'Root',
    type: FileType.FOLDER,
    children: [],
    parentId: null,
    isWinningPath: true,
  };

  const targetDepth = 5 + Math.ceil(iteration * 0.8);
  const junkMaxDepth = 2 + Math.floor(iteration / 5);

  let currentDir = root;
  const path: DirectoryNode[] = [root];

  if (!forceRoot) {
    for (let d = 0; d < targetDepth; d++) {
      const nextDirName = `${randChoice(FOLDER_NAMES)}_${randInt(1, 99)}`;
      const nextDir: DirectoryNode = {
        id: `dir_${d}_${iteration}`,
        name: nextDirName,
        type: FileType.FOLDER,
        children: [],
        parentId: currentDir.id,
        isWinningPath: true,
      };
      currentDir.children.push(nextDir);
      currentDir = nextDir;
      path.push(nextDir);
    }
  }

  const ascendFile: FileNode = {
    id: `ascend_exe_${iteration}`,
    name: 'ascend',
    type: FileType.FILE,
    extension: FileExtension.EXE,
    content: 'EXECUTE_ASCENSION',
    parentId: currentDir.id,
    isWinningPath: true,
  };
  currentDir.children.push(ascendFile);

  const ghostWord = ghostWordFor(runSeed, iteration);
  const ghostPassword = ghostPasswordFor(runSeed, iteration);

  path.forEach(node => {
    const siblingCount = randInt(3, 5 + Math.floor(iteration / 2));

    for (let i = 0; i < siblingCount; i++) {
      const roll = random();

      if (roll > 0.95) {
        const file: FileNode = {
          id: `mod_root_${node.id}_${i}`,
          name: `hw_mod_${randInt(100, 999)}`,
          type: FileType.MODULE,
          extension: FileExtension.MOD,
          content: MODULE_CONTENT,
          packageContent: generateModuleContent(),
          parentId: node.id,
          isWinningPath: false,
        };
        node.children.push(file);
        continue;
      }

      if (roll > 0.82) {
        const supplyName = `supply_${randInt(100, 999)}`;
        const file: FileNode = {
          id: `pkg_root_${node.id}_${i}`,
          name: supplyName,
          type: FileType.PACKAGE,
          extension: FileExtension.PKG,
          content: supplyLabel(supplyName, iteration),
          packageContent: generatePackageContent(),
          parentId: node.id,
          isWinningPath: false,
        };
        node.children.push(file);
        continue;
      }

      const isFolder = random() > 0.3;

      if (isFolder) {
        const folderName = `${randChoice(FOLDER_NAMES)}_${randInt(100, 999)}`;
        const junkFolder: DirectoryNode = {
          id: `junk_path_sib_${node.id}_${i}`,
          name: folderName,
          type: FileType.FOLDER,
          children: [],
          parentId: node.id,
          isWinningPath: false,
        };

        node.children.push(junkFolder);
        generateJunkStructure(junkFolder, 0, junkMaxDepth, iteration);
      } else {
        const fname = generateFileName();
        const junkFile: FileNode = {
          id: `junk_path_sib_${node.id}_${i}`,
          name: fname,
          type: FileType.FILE,
          extension: FileExtension.TXT,
          content: generateFileContent(node.id, iteration),
          parentId: node.id,
          isWinningPath: false,
          loreId: 'lore_manifest',
        };
        node.children.push(junkFile);
      }
    }

    for (let i = node.children.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [node.children[i], node.children[j]] = [node.children[j], node.children[i]];
    }
  });

  const offPath: DirectoryNode[] = [];
  const collectOffPath = (node: DirectoryNode) => {
    if (!node.isWinningPath) offPath.push(node);
    for (const child of node.children) {
      if (child.type === FileType.FOLDER) collectOffPath(child as DirectoryNode);
    }
  };
  collectOffPath(root);
  const usedHosts = new Set<string>();
  const pickHost = (): DirectoryNode => {
    const free = offPath.filter(f => !usedHosts.has(f.id));
    const host = (free.length > 0 ? randChoice(free) : randChoice(offPath)) ?? root;
    usedHosts.add(host.id);
    return host;
  };

  let cacheName = '';
  let cache: DirectoryNode | null = null;
  if (iteration >= 5) {
    const cacheHost = pickHost();
    cacheName = `${randChoice(FOLDER_NAMES)}_${randInt(100, 999)}`;
    cache = {
      id: `cache_${iteration}`,
      name: cacheName,
      type: FileType.FOLDER,
      children: [],
      parentId: cacheHost.id,
      isWinningPath: false,
    };
    cacheHost.children.push(cache);
  }

  const vaultHost = cache ?? pickHost();
  const ghostHost = pickHost();
  placeFile(ghostHost, {
    id: `ghost_${iteration}`,
    name: `ghost_${ghostWord}`,
    type: FileType.FILE,
    extension: FileExtension.TXT,
    content: `[GHOST OPR-09] margin: password reads ${ghostPassword}. seen after hold_${iteration} opens. ghost ${ghostWord}.`,
    parentId: ghostHost.id,
    isWinningPath: false,
    loreId: 'lore_ghost',
    special: true,
  });

  const layerPad = String(Math.max(1, iteration)).padStart(2, '0');
  const vaultLines = [
    `[HOLD VLT-07] Nothing in this node is load-bearing. I checked twice. M.I. layer ${layerPad}.`,
    `[HOLD VLT-12] nothing load-bearing. checked twice. checked again because I didn't believe it.`,
  ];
  if (iteration === 3) {
    vaultLines.unshift(
      '[HOLD VLT-05] hold_3 sealed 03:10:00 UTC 2038-01-19. checked twice. M.I. layer 03.'
    );
  }
  placeFile(vaultHost, {
    id: `vault_${iteration}`,
    name: 'hold',
    type: FileType.FILE,
    extension: FileExtension.ZIP,
    content: vaultLines.join('\n'),
    parentId: vaultHost.id,
    isWinningPath: false,
    password: ghostPassword,
    secretId: 'ghost',
    loreId: 'lore_hold_seal',
    loreExtra: iteration === 3 ? ['lore_hold_recheck', 'lore_hold3'] : ['lore_hold_recheck'],
    special: true,
  });

  const exeHosts: string[] = [];
  const exeHostNodes: DirectoryNode[] = [];
  for (const game of MINIGAMES) {
    const host = pickHost();
    placeFile(host, {
      id: `${game.id}_${iteration}`,
      name: game.id,
      type: FileType.FILE,
      extension: FileExtension.EXE,
      content: `EXECUTE_${game.id.toUpperCase()}`,
      parentId: host.id,
      isWinningPath: false,
    });
    exeHosts.push(host.id);
    exeHostNodes.push(host);
  }

  const termHost0 = exeHostNodes[0] ?? pickHost();
  placeFile(termHost0, {
    id: `log_host_${iteration}`,
    name: 'host_log',
    type: FileType.FILE,
    extension: FileExtension.TXT,
    content: `[HOST LOG-07] tictactoe_${iteration} ran on the first host. logged 2038-01-17.`,
    parentId: termHost0.id,
    isWinningPath: false,
    loreId: 'lore_hostlog',
    special: true,
  });

  const termHost1 = exeHostNodes[1] ?? termHost0;
  placeFile(termHost1, {
    id: `margin_second_${iteration}`,
    name: 'margin',
    type: FileType.FILE,
    extension: FileExtension.TXT,
    content: `[MARGIN OPR-13] tictactoe_${iteration} on the second host.`,
    parentId: termHost1.id,
    isWinningPath: false,
    loreId: 'lore_second_host',
    special: true,
  });

  const termHost2 = exeHostNodes[2] ?? termHost0;
  placeFile(termHost2, {
    id: `margin_term_${iteration}`,
    name: 'margin',
    type: FileType.FILE,
    extension: FileExtension.TXT,
    content: `[MARGIN OPR-12] cabinet 3 still takes coins, uptime 44d.`,
    parentId: termHost2.id,
    isWinningPath: false,
    loreId: 'lore_cabinet',
    special: true,
  });

  if (iteration === 1) {
    root.children.push({
      id: `archivist_1_${iteration}`,
      name: 'archivist_1',
      type: FileType.FILE,
      extension: FileExtension.TXT,
      content: `[TRAIL TRC-1] 1/5. descend or the tree stops listing you. ghost ${ghostWord} sits in ${ghostHost.id}. 1 of 5 found. V. 2038-01-12`,
      parentId: root.id,
      isWinningPath: false,
      loreId: 'lore_archivist_1',
      special: true,
    } as FileNode);
  }

  const trailBodies: Record<number, string> = {
    2: `[TRAIL TRC-2] 2/5. hold_3 sits on cache_3 host. ghost okafor-02 names it. 2 of 5 found.`,
    3: `[TRAIL TRC-3] 3/5. tictactoe_${iteration} ran on ${exeHosts[0] ?? ''}. logged 2038-01-17. 3 of 5 found. V.`,
    4: `[TRAIL TRC-4] 4/5. ${exeHosts[1] ?? exeHosts[0] ?? ''} runs the next cabinet. ascend carries the operator one layer deeper. 4 of 5 found. V.`,
  };
  if (iteration >= 2 && iteration <= 4) {
    const host = pickHost();
    const body =
      iteration === 2
        ? `${trailBodies[iteration]}\n[COUNT OPR-02] 11 listed, 3 unlisted. count dated 2038-01-18. V.`
        : trailBodies[iteration];
    placeFile(host, {
      id: `archivist_${iteration}_${iteration}`,
      name: `archivist_${iteration}`,
      type: FileType.FILE,
      extension: FileExtension.TXT,
      content: body,
      parentId: host.id,
      isWinningPath: false,
      loreId: `lore_archivist_${iteration}`,
      loreExtra: iteration === 2 ? ['lore_orphan_count'] : undefined,
      special: true,
    });
  }

  if (iteration === 2) {
    placeFile(pickHost(), {
      id: `note_vane02_${iteration}`,
      name: 'index_note',
      type: FileType.FILE,
      extension: FileExtension.TXT,
      content: '[INDEX OPR-10] vane-02 sits on root. 2 of 5 counted. V. 2038-01-14.',
      parentId: null,
      isWinningPath: false,
      loreId: 'lore_vane_root',
      special: true,
    });
  }

  if (iteration >= 5) {
    const host = pickHost();
    placeFile(host, {
      id: `archivist_5_${iteration}`,
      name: 'archivist_5',
      type: FileType.FILE,
      extension: FileExtension.TXT,
      content: `[TRAIL TRC-5] 5/5. cache buried as ${cache?.id ?? cacheName}. hold_${iteration} sits inside. 5 of 5 found. V.`,
      parentId: host.id,
      isWinningPath: false,
      loreId: 'lore_archivist_5',
      special: true,
    });
  }

  placeFile(pickHost(), {
    id: `note_opr03_${iteration}`,
    name: 'manifest_03',
    type: FileType.FILE,
    extension: FileExtension.TXT,
    content: `[NOTE OPR-03] hold_${iteration} sits on dir_2_${iteration}. dated 2038-01-21.`,
    parentId: null,
    isWinningPath: false,
    loreId: 'lore_hold_claim',
    special: true,
  });

  placeFile(pickHost(), {
    id: `log_manifest_${iteration}`,
    name: 'manifest_19',
    type: FileType.FILE,
    extension: FileExtension.TXT,
    content: `[MANIFEST LOG-03] 03:13 COPY CHECKSUM OK. 03:14 COPY MISMATCH. dir_2_${iteration} SEALED 03:12.\n[SEAL LOG-04] 03:14 COPY 412 BYTES. CHECKSUM MISMATCH HELD FOR REVIEW.`,
    parentId: null,
    isWinningPath: false,
    loreId: 'lore_manifest',
    special: true,
  });

  if (iteration >= 5 && cache) {
    placeFile(cache, {
      id: `log_cache_${iteration}`,
      name: 'cache_manifest',
      type: FileType.FILE,
      extension: FileExtension.TXT,
      content: `[CACHE LOG-06] cache_${iteration} capacity 256 MB. seal time matches the hold_${iteration} seal.`,
      parentId: null,
      isWinningPath: false,
      loreId: 'lore_cache',
      special: true,
    });
  }

  if (iteration >= 5) {
    placeFile(pickHost(), {
      id: `note_cachecap_${iteration}`,
      name: 'capacity_note',
      type: FileType.FILE,
      extension: FileExtension.TXT,
      content: `[SEAL OPR-11] cache_${iteration} capacity 512 MB. checked twice. M.I. layer ${layerPad}.`,
      parentId: null,
      isWinningPath: false,
      loreId: 'lore_cache_claim',
      special: true,
    });
  }

  if (iteration >= 4) {
    placeFile(pickHost(), {
      id: `log_nodes_${iteration}`,
      name: 'node_list',
      type: FileType.FILE,
      extension: FileExtension.TXT,
      content: `[NODES LOG-05] three inodes present with no parent since 2038-01-18.`,
      parentId: null,
      isWinningPath: false,
      loreId: 'lore_nodes',
      special: true,
    });
    placeFile(pickHost(), {
      id: `note_tally_${iteration}`,
      name: 'tally',
      type: FileType.FILE,
      extension: FileExtension.TXT,
      content: `[TALLY OPR-02] 11 listed, 3 unlisted. count dated 2038-01-18.`,
      parentId: null,
      isWinningPath: false,
      loreId: 'lore_tally',
      special: true,
    });
  }

  if (iteration >= 6) {
    placeFile(pickHost(), {
      id: `note_carry_${iteration}`,
      name: 'carry_lock',
      type: FileType.FILE,
      extension: FileExtension.TXT,
      content: `[LOCK OPR-07] lock held. older than the seal it guards.`,
      parentId: null,
      isWinningPath: false,
      loreId: 'lore_lock',
      special: true,
    });
  }

  placeFile(pickHost(), {
    id: `margin_map_${iteration}`,
    name: 'margin',
    type: FileType.FILE,
    extension: FileExtension.TXT,
    content: `[MARGIN OPR-08] down is up because the map is upside down.`,
    parentId: null,
    isWinningPath: false,
    loreId: 'lore_map_margin',
    special: true,
  });

  return root;
};
