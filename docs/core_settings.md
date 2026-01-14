# Core Settings & Developer Tools

Hidden within the system is the **Core Settings** application, a powerful toolset for developers, speedrunners, and curious users.

## Access

The Core Settings app is not listed in the Start Menu. To access it:

1. Open **System Help**.
2. Type `core` on your keyboard while the window is focused.
3. The "c o r e" text at the bottom will flash, and the Core Settings window will open.

## Features

### Developer Overrides

These toggleable flags modify the game rules. Enabling any override automatically switches the game to **Dev Save Mode**.

- **Infinite Data**: Sets your Data currency to effectively infinite (~1 Petabyte), allowing unrestricted testing of upgrades and mechanics.
- **Root Ascension**: Forces `ascend.exe` to spawn in the Root directory instead of deep within the file system. Useful for quickly testing the Ascension sequence.

### Save Management

Ascend OS utilizes a Dual Save System to protect your legitimate progress while experimenting.

- **Normal Mode**: The standard gameplay state. Saved to `ascend_game_state_v2`.
- **Dev Mode**: A separate sandbox state. Saved to `ascend_dev_state_v1`.

**Actions:**

- **Switch to Normal Save**: If you are in Dev Mode, this button reboots the system and loads your legitimate save file.
- **Reset Session**: Wipes the *current* save slot (Normal or Dev) and reboots to a fresh start. This action requires confirmation.
- **Factory Reset**: Completely wipes **ALL** local storage data (both Normal and Dev saves), clears preferences, and reloads the application as if it were a fresh install. This action requires confirmation.

### Data Portability

You can now backup and restore your progress via JSON files.

- **Export JSON**: Downloads the current session's state as a `.json` file (`ascend_save_[timestamp].json`).
- **Import JSON**: Allows you to upload a valid save file.
  - The system validates the file structure before importing.
  - Importing will **OVERWRITE** your current session.
  - If the imported file has Dev flags enabled, the system will switch to Dev Mode automatically.
  - A system reboot is triggered upon successful import.

### Universe Seed

The procedural generation engine uses a deterministic seed.

- **Seed Injection**: You can manually input a numeric seed.
- **Reconstruct Universe**: Clicking this performs a **Hard Reset**. It wipes all progress, upgrades, and file system modifications, then reboots the OS into a fresh Normal Mode session using the specific seed provided. This effectively allows you to replay specific file system layouts from scratch. This action requires confirmation.
