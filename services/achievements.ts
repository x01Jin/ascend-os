export interface AchievementDef {
  id: string;
  title: string;
  description: string;
  hint: string;
  requiresIteration?: number;
}

// 24 items. Later entries gate on iteration, exploration, arcade scores,
// and tool unlocks so the checklist itself motivates ascending.
// secrets.zip is granted once the first 23 are earned; opening it earns
// the 24th.
export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'cold_boot',
    title: 'Cold Boot',
    description: 'Power on Ascend OS.',
    hint: 'Just boot the game.',
  },
  {
    id: 'warm_hands',
    title: 'Warm Hands',
    description: 'Mine data for the first time.',
    hint: 'Open Data Miner and harvest.',
  },
  {
    id: 'ten_mb',
    title: 'Ten Megabytes',
    description: 'Mine 10 MB of data in total.',
    hint: 'Keep mining or build the auto-miner.',
  },
  {
    id: 'half_gb',
    title: 'Half Gigabyte',
    description: 'Mine 500 MB of data in total.',
    hint: 'Efficiency upgrades and modules compound.',
  },
  {
    id: 'signal_found',
    title: 'Signal Found',
    description: 'TRACE the winning path once.',
    hint: 'Scans cost more each iteration. Spend wisely.',
  },
  {
    id: 'deep_scan',
    title: 'Deep Scan',
    description: 'TRACE 25 times in total.',
    hint: 'Every iteration needs fresh traces.',
  },
  {
    id: 'supply_run',
    title: 'Supply Run',
    description: 'Decrypt a supply package.',
    hint: 'Orange packages hide off the winning path.',
  },
  {
    id: 'quartermaster',
    title: 'Quartermaster',
    description: 'Decrypt 5 supply packages in total.',
    hint: 'Packages are rare. Check every folder.',
  },
  {
    id: 'new_hardware',
    title: 'New Hardware',
    description: 'Install a hardware module.',
    hint: 'Green modules upgrade the auto-miner.',
  },
  {
    id: 'overclocked',
    title: 'Overclocked',
    description: 'Install 10 hardware modules in total.',
    hint: 'Modules are the rarest drop. The radar helps.',
  },
  {
    id: 'letting_go',
    title: 'Letting Go',
    description: 'Ascend to iteration 2.',
    hint: 'The ferry demands its checklist first.',
  },
  {
    id: 'regular',
    title: 'Regular Passenger',
    description: 'Reach iteration 3.',
    hint: 'Ascend again. The tree grows deeper.',
    requiresIteration: 3,
  },
  {
    id: 'veteran',
    title: 'Veteran of the Ferry',
    description: 'Reach iteration 5.',
    hint: 'The archivist trail ends here. The ferry does not.',
    requiresIteration: 5,
  },
  {
    id: 'beyond_six',
    title: 'Beyond the Map',
    description: 'Reach iteration 7.',
    hint: 'Fuel gets expensive. Mine like it matters.',
    requiresIteration: 7,
  },
  {
    id: 'decade_walker',
    title: 'Decade Walker',
    description: 'Reach iteration 10.',
    hint: 'Only routine and compound interest get you here.',
    requiresIteration: 10,
  },
  {
    id: 'ghost',
    title: 'Ghost in the Machine',
    description: 'Open the locked cache with the ghost password.',
    hint: 'A ghost file broadcasts. A locked file listens.',
  },
  {
    id: 'trail',
    title: "Archivist's Trail",
    description: 'Read all 5 Archivist trail parts in order.',
    hint: 'One part per iteration, hidden off the winning path.',
  },
  {
    id: 'offering',
    title: 'Offering',
    description: 'Rename a folder to archivist, mark it, then TRACE.',
    hint: 'The tracer answers named requests.',
  },
  {
    id: 'egg_hunter',
    title: 'Egg Hunter',
    description: 'Find 3 easter eggs.',
    hint: 'Some files are what you name them. Read paperwork.',
  },
  {
    id: 'arcade_rookie',
    title: 'Arcade Rookie',
    description: 'Beat any arcade cabinet game.',
    hint: 'Minigame .exes are scattered off the winning path.',
  },
  {
    id: 'arcade_master',
    title: 'Arcade Master',
    description: 'Beat all 5 minigames in one iteration.',
    hint: 'Wins reset every iteration. The ferry checks.',
  },
  {
    id: 'cartographer',
    title: 'Cartographer',
    description: 'Unlock the explorer map.',
    hint: 'Sold in System Updates from iteration 2.',
  },
  {
    id: 'radar_op',
    title: 'Radar Operator',
    description: 'Unlock the special-file radar.',
    hint: 'Sold in System Updates from iteration 3.',
  },
  {
    id: 'secrets_zip',
    title: 'secrets.zip',
    description: 'Open secrets.zip and read the instructions.',
    hint: 'Earn the other 23 first. A popup will find you.',
  },
];

export const ACH_TOTAL = ACHIEVEMENTS.length;
export const ACH_FOR_ZIP = ACHIEVEMENTS.filter(a => a.id !== 'secrets_zip').map(a => a.id);
