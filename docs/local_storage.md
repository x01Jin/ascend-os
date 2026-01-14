# Local Storage & Persistence

Ascend OS uses the browser's `localStorage` to maintain game state between sessions. This ensures that progress is saved if the user closes the tab or refreshes the page.

## Dual Save System

To allow for experimentation and development without corrupting legitimate gameplay, Ascend OS uses two distinct save slots:

1. **Normal Mode**:
   - Key: `ascend_game_state_v2`
   - Description: The standard gameplay state. Achievements, high scores, and standard progression are tracked here.

2. **Developer Mode**:
   - Key: `ascend_dev_state_v1`
   - Description: A sandbox state. Activated automatically when any Developer Override (e.g., Infinite Data) is enabled.

The system tracks which mode is active via `ascend_save_mode`. Switching modes causes a system reboot to load the appropriate state.

## Persisted Data Structure

The entire game state is serialized into a single JSON object. Below is a breakdown of what is stored:

### Core Progression

- `currentIteration`: The current level/depth of the system.
- `highScore`: The highest iteration reached.
- `dataKB`: Current currency (Data).
- `runSeed`: A unique seed generated at the start of a save file. This ensures that if you refresh the page on Iteration 5, the file system generates exactly the same way every time.

### Upgrades & Inventory

- `efficiencyLevel`: Current level of the manual mining upgrade.
- `autoMinerData`: Power level of the Auto-Miner (KB/tick).
- `autoMinerInterval`: Speed of the Auto-Miner (ms).
- `autoMarkCount`: Number of Auto-Markers currently in inventory.
- `boostBank`: An object storing remaining milliseconds for each Overclock multiplier (x2, x3, x4, x5).

### Desktop State

- `shortcuts`: The positions and existence of desktop icons.
- `wallpaper`: A Base64 string of the user's custom wallpaper (if set).
- `isAutoMarkEnabled`: The toggle state of the Auto-Marker tool in Explorer.

### File System State (Anti-Exploit & UX)

- `consumedIds`: A list of unique IDs for Packages and Modules that have been opened. This prevents players from finding a high-value package, saving, looting it, reloading the page, and looting it again.
- `modifiedNodes`: A record of all renames, manual marks, and signal traces performed by the player. This ensures the file system looks exactly how you left it after a refresh.

## The Ascension Reset

When the player successfully executes `ascend.exe`, the system "Ascends" to the next iteration. This triggers a specific cleanup process to balance progression with a fresh gameplay loop.

### What is KEPT (Persisted)

- **Currency**: `dataKB` carries over.
- **Upgrades**: All mining upgrades (`efficiencyLevel`, `autoMinerData`, `autoMinerInterval`) are kept.
- **Inventory**: `autoMarkCount` and `boostBank` times are preserved.
- **Desktop**: Wallpaper and icon positions remain.
- **Seed**: The `runSeed` remains the same (maintaining the identity of the playthrough).

### What is WIPED (Reset)

- **Modifications**: `modifiedNodes` is cleared. The new directory structure is fresh; no folders are marked or renamed yet.
- **Consumed Items**: `consumedIds` is cleared. The new iteration generates fresh loot (Packages and Modules) that can be collected.
- **Active Boost**: `activeBoostMultiplier` is set to null. Any active overclock is paused to prevent wasting time during the transition animation.

## Wallpaper Limitations

Because `localStorage` typically has a quota (usually around 5MB), the custom wallpaper feature limits image uploads to approximately 3MB. If saving the wallpaper would exceed the browser's storage quota, the game will attempt to save the game state *without* the wallpaper to prevent progress loss.
