# Exploration & Tools

## File Explorer

The File Explorer is the primary navigation tool.

- **Navigation**: Click folders to enter. Use the Up Arrow or Home button to navigate back.
- **Address Bar**: Shows the current path (e.g., `root/System_102/Logs_99`).
- **History**: Maintains a navigation stack for the "Back" button functionality.

## Signal Tracing

Signal Tracing is a mechanic to help find the needle in the haystack.

- **Activation**: Click the "TRACE" button in the Explorer toolbar.
- **Cost**: 10 MB per scan.
- **Effect**:
  - The system analyzes the current directory.
  - It identifies the specific folder that leads to `ascend.exe`.
  - The target folder is visually highlighted (Green text, glowing icon).
  - The folder's internal `isScanned` flag is set to true.
- **Glitch Mechanic (Penalty)**:
  - If you attempt to Trace a directory where the signal has **already been isolated** (i.e., the path is already glowing green), the system glitches.
  - **Penalty**: You lose a random amount of Data (roughly 1MB - 10MB) due to redundant cycle waste.
  - **Visuals**: The Trace button flashes red, "ERROR" appears, and a system notification warns of the penalty.

## Supply Drops

Orange **Package** files (`.pkg`) can be found hidden in directory structures.

- **Interaction**: Double-click a package to decrypt it.
- **Rewards**: The package disappears and grants Data, Auto-Markers, or Boost Time immediately. A system notification displays the decrypted contents.

## Auto-Marker

A utility to map complex directory structures automatically.

- **Toggle**: Click the Eye icon in the Explorer toolbar to enable/disable.
- **Function**:
  - When enabled, entering any folder instantly consumes 1 Auto-Marker from inventory.
  - The entered folder is marked with a **Gold Star**.
- **Utility**: This allows players to visually track which folders they have already investigated without needing to manually context-menu mark them.

## Manual Marking

- Right-click any file or folder and select "Mark" to toggle a star icon manually. This costs nothing.
