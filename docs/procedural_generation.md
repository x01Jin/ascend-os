# Procedural Generation

The heart of Ascend is its deterministic procedural generation algorithm located in `services/generator.ts`.

## Seeding

The file system is generated using a pseudo-random number generator seeded by the current iteration number:
`Seed = iteration * 1337`

This ensures that if a player reloads the game on Iteration 5, the directory structure for Iteration 5 remains exactly the same.

### Manual Seeding

Players can manually inject a specific seed via the **Core Settings** application. This allows users to share interesting seeds or replay specific file system layouts. Injecting a seed forces a complete factory reset of the current state to ensure the generation is clean.

## The Winning Path

The generator first creates a guaranteed path to the objective.

1. **Root**: Starts at `root`.
2. **Depth Calculation**: The depth of the winning path is calculated: `5 + ceil(iteration * 0.8)`.
3. **Path Construction**: A chain of directories is created. Each directory is flagged internally with `isWinningPath = true`.
4. **Target**: `ascend.exe` is placed in the final directory of this chain.

## Distractors (Junk)

Once the winning path is built, the generator populates the tree with "noise" to hide the path.

1. **Siblings**: At every node along the winning path, a number of sibling nodes are generated.
   - Count: `randInt(3, 5 + floor(iteration / 2))`
2. **Recursive Structure**: If a sibling is a folder, it recursively generates its own children up to a calculated `junkMaxDepth`.
   - `junkMaxDepth`: `2 + floor(iteration / 5)`
3. **Content**:
   - Folder names are chosen from a list of tech-sounding terms (System, Bin, Void, Matrix, etc.).
   - Files are generated with random extensions and lore-fragment content.

## Supply Drops (Packages)

Occasionally, the generator spawns encrypted **Package** files (`.pkg`) instead of standard files or folders.

- **Spawn Rate**: Approximately 15% chance per slot in junk structures and sibling nodes.
- **Appearance**: Represented by an orange package icon in the Explorer.
- **Loot Table**:
  - **Data Cache (~70%)**: Contains a lump sum of Data (5-10 MB).
  - **Auto-Mark Bundle (~25%)**: Contains 5-10 Auto-Markers.
  - **Overclock Chip (~5%)**: Adds time (1-5s) to a random Overclock Bank (x2 - x5).

## Hardware Modules

Rare components for the Auto-Miner can be found as encrypted **Module** files (`.mod`).

- **Spawn Rate**: Approximately 11.5% chance per slot.
- **Appearance**: Represented by a purple processor icon in the Explorer.
- **Loot Table**:
  - **Speed Module (~70%)**: Reduces mining interval.
  - **Power Module (~30%)**: Increases mining power.

## File Types

- **Directories**: Can contain other files or directories.
- **Text Files (.txt)**: contain procedurally generated log dumps and lore fragments.
- **Packages (.pkg)**: Encrypted supply drops containing resources.
- **Modules (.mod)**: Encrypted hardware upgrades for the Auto-Miner.
- **Executables (.exe)**: Currently only `ascend.exe` triggers system events.
