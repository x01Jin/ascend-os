# Core settings and developer tools

Hidden toolset for testing, speedruns, and save surgery.

## Access

Open System Help and type `core`. The Core Settings window opens.

## Developer overrides

Any override switches the game to the Dev save slot:

- **Infinite Data**: sets Data to ~1 PB.
- **Root Ascension**: spawns `ascend.exe` in root.

## Save management

Normal (`ascend_game_state_v2`) and Dev (`ascend_dev_state_v1`) slots.

- **Switch to Normal**: reboot into the legitimate save.
- **Reset Session**: wipe the current slot, reboot. Confirms first.
- **Factory Reset**: wipe all slots and preferences, reload fresh. Confirms first.

## Data portability

- **Export JSON**: downloads the session as `ascend_save_[timestamp].json`.
- **Import JSON**: parses the file, requires a numeric `currentIteration`, a numeric `dataKB`, and a `shortcuts` array, then overwrites the session, switches to Dev mode if dev flags are set, reboots.

## Universe seed

Numeric input plus Reconstruct Universe: wipes everything and reboots a fresh Normal-mode run on that seed. Confirms first.
