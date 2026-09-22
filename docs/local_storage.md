# Local storage and persistence

`localStorage` holds the game state as one JSON object per save slot, plus a separate wallpaper key.

## Dual saves

- **Normal**: `ascend_game_state_v2`. Standard play.
- **Dev**: `ascend_dev_state_v1`. Any developer override switches here.
- Mode flag: `ascend_save_mode`. Switching reboots into the other slot.
- Wallpaper: `ascend_wallpaper_v1`. Stored apart from the main slot so large images cannot crowd out progress; export omits it.
- Backups: `<slot>_backup` before imports and seed changes; `<slot>_corrupt_<timestamp>` quarantine copies of rejected saves (max 3).

Legacy `ascend_game_state_v1` loads as a fallback for the Normal slot and is left in place; only Factory Reset removes it.

## Stored fields

Core: `currentIteration`, `highScore`, `dataKB`, `runSeed`, `shortcuts`.

Upgrades and inventory: `efficiencyLevel`, `autoMinerData`, `autoMinerInterval` (clamped to 300 ms minimum), `lastTickAt` (ms timestamp for 50% offline yield, capped at 8h), `autoMarkCount`, `isAutoMarkEnabled`, `boostBank` (ms per x2-x5 multiplier), `activeBoostMultiplier`.

File system: `consumedIds` (opened packages and modules, blocks reload farming), `modifiedNodes` (renames, marks, traces).

Progression: `achievements`, `secretsFound`, `loreSeen`, `secretsZipSeen`, `hasSeenThankYou`, `stats`, `arcadeWins`, `passes` (cap 3), `fuelPaidIter`, `unlockedFileIds` (vault and locked files already decrypted, one grant each), `trailProof` (layers whose archivist file was opened this iteration), `unlockedTools`, `revealedDepths` (map fog-of-war), `exploredDirIds` (visited folders, discounts map reveals), `triangulated` (radar tiers bought per file, cleared each ascension), `locatedMinigames` (gate minigame locations bought per iteration, cleared each ascension), `locatedTrail` (gate trail locations bought, keyed by layer), `unscrambledTrail` (trail word puzzles solved, keyed by layer).

Flags: `isDevModeEnabled`, `isAscendRootEnabled`. Normal-mode loads force both off.

## Save behavior

Writes are debounced (~800 ms) with a 5 s maximum flush, skipped when nothing changed, and flushed on tab hide, page hide, reboot, ascension, import, and seed change. Imports and foreign saves pass strict schema validation (finite numbers, ranges, array caps); rejected payloads are quarantined beside the slot instead of overwriting it. Offline yield pays only for non-negative elapsed time within the 8 h cap and only when the miner interval is valid.

## Ascension reset

Keeps currency, upgrades, inventory, desktop, seed, and progression (including `arcadeWins`, `passes`, `fuelPaidIter`, and tool unlocks). Clears `modifiedNodes` and `consumedIds`, resets map `revealedDepths` to root + depth 1 and clears `exploredDirIds`, nulls `activeBoostMultiplier` while banked time stays. The fuel-paid flag and cabinet wins apply per iteration, so a fresh iteration starts unpaid and unwon.
