export interface AchievementDef {
  id: string;
  title: string;
  description: string;
  hint: string;
  requiresIteration?: number;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'cold_boot',
    title: 'Cold Boot',
    description: 'Powered on Ascend OS.',
    hint: 'Just boot the game.',
  },
  {
    id: 'warm_hands',
    title: 'Warm Hands',
    description: 'Mined data for the first time.',
    hint: 'Open Data Miner and harvest.',
  },
  {
    id: 'ten_mb',
    title: 'Ten Megabytes',
    description: 'Mined 10 MB of data in total.',
    hint: 'Keep mining or build the auto-miner.',
  },
  {
    id: 'half_gb',
    title: 'Half Gigabyte',
    description: 'Mined 500 MB of data in total.',
    hint: 'Efficiency upgrades and modules compound.',
  },
  {
    id: 'signal_found',
    title: 'Signal Found',
    description: 'Traced the winning path.',
    hint: 'Scans cost more each layer. Spend wisely.',
  },
  {
    id: 'deep_scan',
    title: 'Deep Scan',
    description: 'Traced 25 times in total.',
    hint: 'Every layer needs fresh traces.',
  },
  {
    id: 'supply_run',
    title: 'Supply Run',
    description: 'Decrypted a supply package.',
    hint: 'Orange packages hide off the winning path.',
  },
  {
    id: 'quartermaster',
    title: 'Quartermaster',
    description: 'Decrypted 5 supply packages in total.',
    hint: 'Packages are rare. Check every folder.',
  },
  {
    id: 'new_hardware',
    title: 'New Hardware',
    description: 'Installed a hardware module.',
    hint: 'Green modules upgrade the auto-miner.',
  },
  {
    id: 'overclocked',
    title: 'Overclocked',
    description: 'Installed 10 hardware modules in total.',
    hint: 'Modules are the rarest drop. The radar helps.',
  },
  {
    id: 'letting_go',
    title: 'Letting Go',
    description: 'Descended to layer 2.',
    hint: 'The process demands its checklist first.',
  },
  {
    id: 'regular',
    title: 'Regular Passenger',
    description: 'Reached layer 3.',
    hint: 'Descend again. The tree grows deeper.',
  },
  {
    id: 'veteran',
    title: 'Veteran of the Handoff',
    description: 'Reached layer 5.',
    hint: 'The archivist trail ends here. The process does not.',
    requiresIteration: 5,
  },
  {
    id: 'beyond_six',
    title: 'Beyond the Map',
    description: 'Reached layer 7.',
    hint: 'Fuel gets expensive. Mine like it matters.',
    requiresIteration: 7,
  },
  {
    id: 'decade_walker',
    title: 'Decade Walker',
    description: 'Reached layer 10.',
    hint: 'Only routine and compound interest get you here.',
    requiresIteration: 10,
  },
  {
    id: 'ghost',
    title: 'Ghost in the Machine',
    description: 'Opened the locked hold with the ghost password.',
    hint: 'A ghost margin names a path. A locked hold listens.',
  },
  {
    id: 'trail',
    title: "Archivist's Trail",
    description: 'Read all 5 Archivist trail parts in order.',
    hint: 'One part per layer, hidden off the winning path.',
  },
  {
    id: 'offering',
    title: 'Offering',
    description: 'Renamed a folder to archivist, marked it, then traced inside it.',
    hint: 'The tracer answers named requests.',
  },
  {
    id: 'egg_hunter',
    title: 'Egg Hunter',
    description: 'Found any 3 secrets.',
    hint: 'Secrets pile up from files, passwords, and paperwork.',
  },
  {
    id: 'arcade_rookie',
    title: 'Arcade Rookie',
    description: 'Beat a minigame cabinet.',
    hint: 'Minigame .exes are scattered off the winning path.',
  },
  {
    id: 'arcade_master',
    title: 'Arcade Master',
    description: 'Beat all 5 minigames in one iteration.',
    hint: 'Wins reset every layer. The process checks.',
  },
  {
    id: 'cartographer',
    title: 'Cartographer',
    description: 'Bought the explorer map.',
    hint: 'Sold in System Updates from layer 2.',
  },
  {
    id: 'radar_op',
    title: 'Radar Operator',
    description: 'Bought the special-file radar.',
    hint: 'Sold in System Updates from layer 3.',
  },
  {
    id: 'decorator',
    title: 'Decorator',
    description: 'Set a custom desktop wallpaper.',
    hint: 'Personalize lives on the desktop menu.',
  },
  {
    id: 'dead_on',
    title: 'Dead On',
    description: 'Triangulated a special file precisely.',
    hint: 'Precise costs triple on minigames, lore, and locked files.',
  },
  {
    id: 'ferry_hop',
    title: 'Handoff Hop',
    description: 'Teleported from the Explorer Map.',
    hint: 'Double-click any folder on the map.',
  },
  {
    id: 'secrets_zip',
    title: 'secrets.zip',
    description: 'Opened secrets.zip and read the instructions.',
    hint: 'Earn the others first. A popup will find you.',
  },
];

export const ACH_TOTAL = ACHIEVEMENTS.length;
export const ACH_FOR_ZIP = ACHIEVEMENTS.filter(a => a.id !== 'secrets_zip').map(a => a.id);
