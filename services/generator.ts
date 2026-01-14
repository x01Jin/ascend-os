import { DirectoryNode, FileNode, FileType, FileExtension, FileSystemNode, PackageContent } from '../types';

// Deterministic-ish randomness helpers
let _seed = 1;
const random = () => {
  const x = Math.sin(_seed++) * 10000;
  return x - Math.floor(x);
};

const setSeed = (s: number) => {
  _seed = s;
};

const randInt = (min: number, max: number) => Math.floor(random() * (max - min + 1)) + min;
const randChoice = <T>(arr: T[]): T => arr[randInt(0, arr.length - 1)];

// Word Lists
const FOLDER_NAMES = [
  "System", "Bin", "Users", "Local", "Cache", "Temp", "Logs", "Core", 
  "Network", "Config", "Driver", "Kernel", "Boot", "Recovery", "Shadow", 
  "Nexus", "Void", "Sector", "Grid", "Matrix", "Root"
];

const FILE_PREFIXES = ["sys", "log", "err", "data", "dump", "net", "cfg", "run", "batch", "proc"];
const FILE_SUFFIXES = ["_bak", "_old", "_v1", "_final", "_tmp", "_01", "_hex"];

const LORE_FRAGMENTS = [
  "The system is expanding.",
  "Iteration cycles are stabilizing.",
  "Don't look too deep into the void.",
  "Memory leak detected in sector 7.",
  "The user is watching.",
  "Packet loss at 99%.",
  "Ascension is the only way out.",
  "Recompiling reality...",
  "Error: Success.",
  "Null pointer exception in soul.exe."
];

// Content Generators
const generateFileName = () => {
  // Use seeded random() instead of Math.random() for consistency
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

// Generates Consumables (Data, AutoMark, Boost)
const generatePackageContent = (iteration: number): PackageContent => {
    const roll = random();
    
    // Package Loot Table:
    // 0.90 - 1.00: Boost (Rare)
    // 0.60 - 0.90: AutoMark (Uncommon)
    // 0.00 - 0.60: Data (Common)

    if (roll > 0.90) {
        // Boost
        const multiplier = randInt(2, 5);
        const duration = randInt(1, 5);
        return { type: 'BOOST', value: duration * 1000, multiplier };
    } else if (roll > 0.60) {
        // AutoMark
        return { type: 'AUTOMARK', value: randInt(5, 10) };
    } else {
        // Data
        const mb = randInt(5, 10);
        return { type: 'DATA', value: mb * 1024 }; // Convert to KB
    }
};

// Generates Persistent Upgrades (Power, Speed)
const generateModuleContent = (iteration: number): PackageContent => {
    const roll = random();
    
    // Module Loot Table:
    // 0.70 - 1.00: Speed Module
    // 0.00 - 0.70: Power Module

    if (roll > 0.70) {
        // Speed Module (-10ms to -100ms)
        const reduction = randInt(10, 100); 
        return { type: 'AUTOMINER_SPEED', value: reduction };
    } else {
        // Power Module (+1 to +5 KB)
        const power = randInt(1, 5);
        return { type: 'AUTOMINER_POWER', value: power };
    }
};

// Recursive Junk Generator
const generateJunkStructure = (parent: DirectoryNode, currentDepth: number, maxDepth: number, iteration: number) => {
    // If we reached max depth, populate with a few files so it's not empty, then stop.
    if (currentDepth >= maxDepth) {
        const leafFileCount = randInt(1, 3);
        for(let i=0; i<leafFileCount; i++) {
             const fname = generateFileName();
             const file: FileNode = {
                 id: `junk_file_leaf_${parent.id}_${i}`,
                 name: fname,
                 type: FileType.FILE,
                 extension: FileExtension.TXT,
                 content: generateFileContent(iteration),
                 parentId: parent.id,
                 isWinningPath: false
             };
             parent.children.push(file);
        }
        return;
    }

    // Density scales with iteration
    const density = randInt(2, 4 + Math.floor(iteration / 3));

    for (let i = 0; i < density; i++) {
        const roll = random();

        // Spawn Logic:
        // > 0.885 : Module (11.5%)
        // > 0.735 : Package (15.0%)
        // > 0.400 : Folder
        // Else    : File

        if (roll > 0.885) {
             const file: FileNode = {
                 id: `mod_${parent.id}_${i}`,
                 name: `hw_mod_${randInt(100, 999)}`,
                 type: FileType.MODULE,
                 extension: FileExtension.MOD,
                 content: "ENCRYPTED HARDWARE MODULE",
                 packageContent: generateModuleContent(iteration),
                 parentId: parent.id,
                 isWinningPath: false
             };
             parent.children.push(file);
             continue;
        }

        if (roll > 0.735) {
             const file: FileNode = {
                 id: `pkg_${parent.id}_${i}`,
                 name: `supply_${randInt(100, 999)}`,
                 type: FileType.PACKAGE,
                 extension: FileExtension.PKG,
                 content: "ENCRYPTED SUPPLY DROP",
                 packageContent: generatePackageContent(iteration),
                 parentId: parent.id,
                 isWinningPath: false
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
                 isWinningPath: false
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
                 isWinningPath: false
             };
             parent.children.push(file);
        }
    }
}

// Tree Generator
export const generateFileSystem = (iteration: number, runSeed: number, forceRoot: boolean = false): DirectoryNode => {
  // Use runSeed combined with iteration to ensure unique runs but deterministic reloading
  setSeed(runSeed + (iteration * 1337));

  const rootId = 'root';
  const root: DirectoryNode = {
    id: rootId,
    name: 'Root',
    type: FileType.FOLDER,
    children: [],
    parentId: null,
    isWinningPath: true
  };

  const targetDepth = 5 + Math.ceil(iteration * 0.8);
  const junkMaxDepth = 2 + Math.floor(iteration / 5);
  
  let currentDir = root;
  const path: DirectoryNode[] = [root];

  if (forceRoot) {
      // DEV MODE: Ascend.exe at root
      // We still generate "path" distractors to populate the root, but don't create deep folders for the win condition
      // Actually, standard distractors are generated *around* the path. 
      // So we just generate distractors at root.
  } else {
      // Build the "Winning" path
      for (let d = 0; d < targetDepth; d++) {
        const nextDirName = `${randChoice(FOLDER_NAMES)}_${randInt(1, 99)}`;
        const nextDir: DirectoryNode = {
          id: `dir_${d}_${iteration}`,
          name: nextDirName,
          type: FileType.FOLDER,
          children: [],
          parentId: currentDir.id,
          isWinningPath: true 
        };
        currentDir.children.push(nextDir);
        currentDir = nextDir;
        path.push(nextDir);
      }
  }

  // Place ascend.exe
  const ascendFile: FileNode = {
    id: `ascend_exe_${iteration}`,
    name: 'ascend',
    type: FileType.FILE,
    extension: FileExtension.EXE,
    content: 'EXECUTE_ASCENSION',
    parentId: currentDir.id,
    isWinningPath: true
  };
  currentDir.children.push(ascendFile);

  // Populate Distractors
  path.forEach((node) => {
    const siblingCount = randInt(3, 5 + Math.floor(iteration / 2));

    for (let i = 0; i < siblingCount; i++) {
      const roll = random();
      
      // Spawn Logic:
      // > 0.885 : Module (11.5%)
      // > 0.735 : Package (15.0%)
      
      if (roll > 0.885) {
           const file: FileNode = {
               id: `mod_root_${node.id}_${i}`,
               name: `hw_mod_${randInt(100, 999)}`,
               type: FileType.MODULE,
               extension: FileExtension.MOD,
               content: "ENCRYPTED HARDWARE MODULE",
               packageContent: generateModuleContent(iteration),
               parentId: node.id,
               isWinningPath: false
           };
           node.children.push(file);
           continue;
      }
      
      if (roll > 0.735) {
           const file: FileNode = {
               id: `pkg_root_${node.id}_${i}`,
               name: `supply_${randInt(100, 999)}`,
               type: FileType.PACKAGE,
               extension: FileExtension.PKG,
               content: "ENCRYPTED SUPPLY DROP",
               packageContent: generatePackageContent(iteration),
               parentId: node.id,
               isWinningPath: false
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
          isWinningPath: false
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
          isWinningPath: false
        };
        node.children.push(junkFile);
      }
    }
    
    node.children.sort(() => random() - 0.5);
  });

  return root;
};