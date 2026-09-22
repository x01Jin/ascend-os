# Core loop and ascension

## The objective

Find `ascend.exe` in the generated file system and run it. Ascending increments `currentIteration` and regenerates the tree.

## The loop

1. **Boot**: each iteration opens with a BIOS-style boot sequence while the file system generates.
2. **Mine**: the Data Miner turns clicks into Data, the currency. The Auto-Miner adds background income once Modules are installed.
3. **Investigate**: walk the File Explorer. Open `.pkg` supply drops for Data, Auto-Markers, or Overclock time. Spend Data on signal traces to mark the folder that leads to `ascend.exe`.
4. **Upgrade**: rising trace costs force spending in System Updates (efficiency, Overclock banks, Auto-Markers) and unlocking the map and radar tools.
5. **Gate**: from the first ascend attempt on, the Ascension Gate checklist blocks the upload. See [Ascension gate](./ascension_gate.md).
6. **Ascend**: run `ascend.exe`, confirm, pay the fuel fee. The Ascension Sequence plays and the next iteration generates from the same `runSeed`.

## Difficulty scaling

Each iteration:

- **Path depth**: `5 + ceil(iteration * 0.8)`.
- **Clutter density**: more sibling folders and files per node.
- **Junk depth**: distractor subtrees grow deeper.
- **Trace cost**: `10 MB + 2 MB` per iteration above the first.
- **Fuel fee**: `25 MB` per iteration number.

## What persists

Data, efficiency level, Auto-Miner power and interval, Auto-Marker inventory and toggle, Overclock bank balances, desktop shortcuts and wallpaper, `runSeed`, high score, achievements, secrets, lore, tool unlocks, and passes carry over.

## What resets

The file system regenerates. `modifiedNodes` and `consumedIds` clear. The active boost multiplier clears; banked time stays. The fuel-paid flag applies per iteration.
