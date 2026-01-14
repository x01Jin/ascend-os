# Core Loop & Ascension

## The Objective

The primary goal of **Ascend OS** is to locate and execute the `ascend.exe` file. This file is hidden deep within a procedurally generated file system.

## The Game Loop

1. **Boot Sequence**:
   - Every iteration begins with a BIOS-style boot sequence.
   - This hides the loading of the initial file system generation.

2. **Resource Gathering**:
   - The player starts with 0 KB of Data (initially).
   - They must use the **Data Miner** to generate "Data" (Currency).

3. **Investigation**:
   - The player navigates the **File Explorer**.
   - **Supply Drops**: Players look for orange `.pkg` files for quick resource boosts.
   - **Signal Tracing**: Players use Tracing (costing Data) to identify the correct path amidst the "Junk" folders.

4. **Preparation**:
   - As difficulty increases, the player must upgrade their mining efficiency in **System Updates** to keep up with the rising costs of tracing.

5. **Ascension**:
   - Upon finding `ascend.exe`, the player executes it.
   - A warning is displayed. Confirming it triggers the **Ascension Sequence**.
   - The system "uploads" consciousness, resets the local file system, and increments the `currentIteration` counter.

## Difficulty Scaling

With each Ascension (Iteration + 1):

- **Path Depth**: The target file is placed deeper in the folder hierarchy.
  - Formula: `5 + ceil(iteration * 0.8)`
- **Clutter Density**: The number of fake folders and files increases.
- **Junk Depth**: Distractor paths become deeper and more complex.

## Persistence

The following data persists across Ascensions:

- **Data**: Your collected KB/MB/GB remains available.
- **Efficiency Level**: Mining power upgrades.
- **Auto-Mark Inventory**: Unused auto-markers.
- **Overclock Banks**: Accumulated boost time.
- **High Score**: Highest iteration reached.

The following data is **RESET**:

- **File System**: A new seed is generated based on the new iteration.
