import { DirectoryNode, FileNode, FileType, FileExtension, PackageContent } from '../types';
import { ARCADE_GAMES } from './gate';

let seedCounter = 1;
const random = () => {
  const x = Math.sin(seedCounter++) * 10000;
  return x - Math.floor(x);
};

const setSeed = (s: number) => {
  seedCounter = s;
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
  'Shadow',
  'Nexus',
  'Void',
  'Sector',
  'Grid',
  'Matrix',
  'Root',
];

const FILE_PREFIXES = ['sys', 'log', 'err', 'data', 'dump', 'net', 'cfg', 'run', 'batch', 'proc'];
const FILE_SUFFIXES = ['_bak', '_old', '_v1', '_final', '_tmp', '_01', '_hex'];

const LORE_FRAGMENTS = [
  'The system is expanding.',
  'Iteration cycles are stabilizing.',
  "Don't look too deep into the void.",
  'Memory leak detected in sector 7.',
  'The user is watching.',
  'Packet loss at 99%.',
  'Ascension is the only way out.',
  'Recompiling reality...',
  'Error: Success.',
  'Null pointer exception in soul.exe.',
];

const generateFileName = () => {
  return `${randChoice(FILE_PREFIXES)}${random() > 0.5 ? randChoice(FILE_SUFFIXES) : ''}_${randInt(100, 999)}`;
};

const generateFileContent = (iteration: number) => {
  const lines = randInt(2, 5);
  let content = `// FILE DUMP - ITERATION ${iteration}\n\n`;
  for (let i = 0; i < lines; i++) {
    content += `> ${randChoice(LORE_FRAGMENTS)}\n`;
    content += `> [HEX: ${randInt(100000, 999999)}]\n`;
  }
  return content;
};

const generatePackageContent = (): PackageContent => {
  const roll = random();

  if (roll > 0.9) {
    const multiplier = randInt(2, 5);
    const duration = randInt(1, 5);
    return { type: 'BOOST', value: duration * 1000, multiplier };
  } else if (roll > 0.6) {
    return { type: 'AUTOMARK', value: randInt(2, 4) };
  } else {
    const mb = randInt(5, 10);
    return { type: 'DATA', value: mb * 1024 };
  }
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
        content: generateFileContent(iteration),
        parentId: parent.id,
        isWinningPath: false,
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
        content: 'ENCRYPTED HARDWARE MODULE',
        packageContent: generateModuleContent(),
        parentId: parent.id,
        isWinningPath: false,
      };
      parent.children.push(file);
      continue;
    }

    if (roll > 0.88) {
      const file: FileNode = {
        id: `pkg_${parent.id}_${i}`,
        name: `supply_${randInt(100, 999)}`,
        type: FileType.PACKAGE,
        extension: FileExtension.PKG,
        content: 'ENCRYPTED SUPPLY DROP',
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
        content: generateFileContent(iteration),
        parentId: parent.id,
        isWinningPath: false,
      };
      parent.children.push(file);
    }
  }
};

const GHOST_WORDS = ['void', 'nexus', 'sector', 'grid', 'matrix', 'shadow'];

export const ghostWordFor = (runSeed: number): string => {
  const idx = Math.abs(Math.floor(runSeed)) % GHOST_WORDS.length;
  return GHOST_WORDS[idx];
};

export const ghostPasswordFor = (runSeed: number, iteration: number): string => {
  const n = (Math.abs(Math.floor(runSeed)) + iteration * 137) % 65535;
  return n.toString(16).toUpperCase().padStart(4, '0');
};

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

  if (forceRoot) {
  } else {
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

  const ghostWord = ghostWordFor(runSeed);
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
          content: 'ENCRYPTED HARDWARE MODULE',
          packageContent: generateModuleContent(),
          parentId: node.id,
          isWinningPath: false,
        };
        node.children.push(file);
        continue;
      }

      if (roll > 0.88) {
        const file: FileNode = {
          id: `pkg_root_${node.id}_${i}`,
          name: `supply_${randInt(100, 999)}`,
          type: FileType.PACKAGE,
          extension: FileExtension.PKG,
          content: 'ENCRYPTED SUPPLY DROP',
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
          content: generateFileContent(iteration),
          parentId: node.id,
          isWinningPath: false,
        };
        node.children.push(junkFile);
      }
    }

    node.children.sort(() => random() - 0.5);
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
  const vaultParentName = vaultHost.name;
  const ghostHost = pickHost();
  placeFile(ghostHost, {
    id: `ghost_${iteration}`,
    name: `ghost_${ghostWord}`,
    type: FileType.FILE,
    extension: FileExtension.TXT,
    content: `// GHOST FREQUENCY - ITERATION ${iteration}\n\n> static ... signal found ...\n> PASSWORD: ${ghostPassword}\n> CACHE SLEEPS IN ${vaultParentName}\n> A locked vault in that folder listens for the password.\n> [ARCHIVIST NOTE: write it down, it changes per iteration]`,
    parentId: ghostHost.id,
    isWinningPath: false,
    loreId: 'lore_ghost',
    special: true,
  });

  placeFile(vaultHost, {
    id: `vault_${iteration}`,
    name: 'dead_drop',
    type: FileType.FILE,
    extension: FileExtension.ZIP,
    content: 'LOCKED. The ghost password opens more than one door. A minigame pass is inside.',
    parentId: vaultHost.id,
    isWinningPath: false,
    password: ghostPassword,
    secretId: 'ghost',
    loreId: 'lore_ghost',
    special: true,
  });

  const exeHosts: string[] = [];
  for (const game of ARCADE_GAMES) {
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
    exeHosts.push(host.name);
  }

  if (iteration === 1) {
    root.children.push({
      id: `archivist_1_${iteration}`,
      name: 'archivist_1',
      type: FileType.FILE,
      extension: FileExtension.TXT,
      content: `// ARCHIVIST TRAIL 1/5\n\nFirst mark, left in the shell I crossed two ferries back. I left four more parts, one per shell above this one.\nThe ghost file sleeps in ${ghostHost.name}. It is the automated broadcast of the operator before me, still transmitting on a dead channel: a password, and the folder where its sealed vault sleeps. Copy the password down, it changes every shell.\nAscend.`,
      parentId: root.id,
      isWinningPath: false,
      loreId: 'lore_archivist_1',
      special: true,
    } as FileNode);
  }

  const trailBodies: Record<number, string> = {
    2: `// ARCHIVIST TRAIL 2/5\n\nSecond mark. The vault waits in ${vaultParentName}. I sealed a minigame pass inside it for whoever follows; the ghost password opens it.\nThree parts remain, each one shell higher.`,
    3: `// ARCHIVIST TRAIL 3/5\n\nThird mark. A recreation terminal still runs in ${exeHosts[0] ?? ''}. Play it and the ferry counts the win.\nPast halfway. Read us in order or the cache stays shut.`,
    4: `// ARCHIVIST TRAIL 4/5\n\nFourth mark. Another terminal runs in ${exeHosts[1] ?? exeHosts[0] ?? ''}.\nOne part remains, one shell higher.`,
  };
  if (iteration >= 2 && iteration <= 4) {
    const host = pickHost();
    placeFile(host, {
      id: `archivist_${iteration}_${iteration}`,
      name: `archivist_${iteration}`,
      type: FileType.FILE,
      extension: FileExtension.TXT,
      content: trailBodies[iteration],
      parentId: host.id,
      isWinningPath: false,
      loreId: `lore_archivist_${iteration}`,
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
      content: `// ARCHIVIST TRAIL 5/5\n\nLast mark. I buried a cache as ${cacheName}. Open that folder and take the vault inside.\nYou now know my route, and the ferry needs it.`,
      parentId: host.id,
      isWinningPath: false,
      loreId: 'lore_archivist_5',
      special: true,
    });
  }

  return root;
};
