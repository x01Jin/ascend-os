# Local storage and persistence

`localStorage` holds the game state as one JSON object per save slot.

## Dual saves

- **Normal**: `ascend_game_state_v2`. Standard play.
- **Dev**: `ascend_dev_state_v1`. Any developer override switches here.
- Mode flag: `ascend_save_mode`. Switching reboots into the other slot.

Legacy `ascend_game_state_v1` loads as a fallback for the Normal slot and is left in place; only Factory Reset removes it.

## Stored fields

Core: `currentIteration`, `highScore`, `dataKB`, `runSeed`, `shortcuts`, `wallpaper` (Base64, ~3 MB cap; oversized saves retry without it).

Upgrades and inventory: `efficiencyLevel`, `autoMinerData`, `autoMinerInterval`, `lastTickAt` (ms timestamp for 50% offline yield, capped at 8h), `autoMarkCount`, `isAutoMarkEnabled`, `boostBank` (ms per x2-x5 multiplier), `activeBoostMultiplier`.

File system: `consumedIds` (opened packages and modules, blocks reload farming), `modifiedNodes` (renames, marks, traces).

Progression: `achievements`, `secretsFound`, `loreSeen`, `secretsZipSeen`, `hasSeenThankYou`, `stats`, `arcadeWins`, `passes`, `fuelPaidIter`, `ghostSolvedIter`, `unlockedTools`, `revealedDepths` (map fog-of-war), `exploredDirIds` (visited folders, discounts map reveals).

Flags: `isDevModeEnabled`, `isAscendRootEnabled`. Normal-mode loads force both off.

## Ascension reset

Keeps currency, upgrades, inventory, desktop, seed, and progression (including `arcadeWins`, `passes`, `fuelPaidIter`, `ghostSolvedIter`, and tool unlocks). Clears `modifiedNodes` and `consumedIds`, resets map `revealedDepths` to root + depth 1 and clears `exploredDirIds`, nulls `activeBoostMultiplier` while banked time stays. The fuel-paid flag and cabinet wins apply per iteration, so a fresh iteration starts unpaid and unwon.
