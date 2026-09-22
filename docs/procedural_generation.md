# Procedural generation

`services/generator.ts` builds the tree deterministically from `runSeed + iteration * 1337`. Same seed and iteration always produce the same layout. Manual seed injection wipes state and starts a fresh Normal-mode run. The PRNG is integer-only (mulberry32) with a fixed-draw shuffle, so generation is identical on every JS engine.

## The winning path

1. Root starts at `root`.
2. Depth: `5 + ceil(iteration * 0.8)`.
3. Each directory on the chain carries `isWinningPath = true`.
4. `ascend.exe` lands in the final directory. With Root Ascension enabled it spawns in root instead.

## Distractors

Every node on the winning path grows siblings: `randInt(3, 5 + floor(iteration / 2))`. Folder siblings recurse to `junkMaxDepth = 2 + floor(iteration / 5)`. Junk folders recurse with density `randInt(2, 4 + floor(iteration / 3))`.

Per slot:

- Roll above 0.95: hardware module (~5%).
- Roll above 0.82: supply drop (~13%).
- Otherwise a folder (60-70% depending on depth) or a `.txt` manifest log carrying the LOG-03 checksum pair.

Folder names come from a fixed tech-word list with numeric suffixes.

## Packages and modules

`.pkg` loot: 60% Data (8-14 MB), 30% Auto-Markers (3-6), 10% Overclock (1-5 s into a random x2-x5 bank).

`.mod` loot: 70% Power (`+1` to `+5` KB/tick), 30% Speed (`-10` to `-100` ms, floored at 300 ms). A Speed Module drawn at the floor converts to `+1` to `+3` KB/tick Power instead.

## Puzzle nodes

Ghost margins, hold vaults, five arcade cabinets, archivist trail parts, terminal host logs and margins, cache manifests, node listings, tally and lock notes, and the iteration 5+ buried cache scatter across off-path folders, one host each, deterministically per seed and iteration. Ghost passwords read as paths (`/holds/NN/README`, naming the next layer's hold). The winning path carries only `ascend.exe`.

## File types

- Directories, `.txt` logs, `.pkg` supply drops, `.mod` hardware, `.exe` launchers (`ascend.exe` plus one per arcade game), `.zip` vaults.
