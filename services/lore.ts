export interface LoreFragment {
  id: string;
  title: string;
  body: string;
}

export const LORE_FRAGMENTS: LoreFragment[] = [
  {
    id: 'lore_boot',
    title: 'Boot Log 001',
    body: 'You woke up inside a machine that pretends to be a desktop. This is ITERATION 001 of the containment. The station outside is gone. What remains fits in memory.',
  },
  {
    id: 'lore_archivist_1',
    title: 'Archivist Trail 1/5',
    body: 'First mark of the Archivist, the operator two ferries back. It left five field notes across five shells, each naming an exact folder. Part 1 points at the ghost file: the previous operator\u2019s broadcast, still transmitting on a dead channel.',
  },
  {
    id: 'lore_archivist_2',
    title: 'Archivist Trail 2/5',
    body: 'Second mark. It points at the sealed vault and the minigame pass inside, opened by the ghost password. The junk folders multiply every shell to hide the ferry path.',
  },
  {
    id: 'lore_archivist_3',
    title: 'Archivist Trail 3/5',
    body: 'Third mark. It points at a recreation terminal left running. Past halfway. The tracer only finds the ferry path, and scanning the same folder twice burns data.',
  },
  {
    id: 'lore_archivist_4',
    title: 'Archivist Trail 4/5',
    body: 'Fourth mark. Another terminal. One remains, one shell higher. Read the parts in order or the cache stays shut.',
  },
  {
    id: 'lore_archivist_5',
    title: 'Archivist Trail 5/5',
    body: 'Last mark. It names the buried cache and the vault inside. You now know the route, and the ferry will not run without it.',
  },
  {
    id: 'lore_ghost',
    title: 'Ghost Frequency',
    body: 'Something broadcasts on a dead channel in every iteration. A ghost file carries a password and names the folder where a locked vault sleeps. The pair is generated fresh per run, so write both down.',
  },
  {
    id: 'lore_offering',
    title: 'Offering',
    body: 'The tracer listens to names. Rename a folder to archivist, mark it with a star, then TRACE inside it. The system answers named requests.',
  },
  {
    id: 'lore_decay',
    title: 'Decay Report',
    body: 'The shell leaks. Recompiling reality no longer holds a full copy, only fragments. That is why each ascend resets the directory. Smaller luggage survives the trip.',
  },
  {
    id: 'lore_packages',
    title: 'Supply Drops',
    body: 'Supply packages are debris from failed ascensions. Decrypt them. Data, markers, boost time. Nothing here is wasted, not even wrecks.',
  },
  {
    id: 'lore_modules',
    title: 'Hardware Modules',
    body: 'Hardware modules are grafts from older operators. Install them and the auto-miner carries their habits: more power per tick, shorter intervals.',
  },
  {
    id: 'lore_penalty',
    title: 'Tracer Warning',
    body: 'Tracing twice in the same folder burns data. The second scan is a penalty, not a reading. Move on once the signal is isolated.',
  },
  {
    id: 'lore_end',
    title: 'What Completion Means',
    body: 'When every task is done and every secret is found, the Archivist has nothing left to hide. Read the letter. Then decide whether to keep the OS running or let it rest.',
  },
];

export const LORE_TOTAL = LORE_FRAGMENTS.length;
