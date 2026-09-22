# Exploration and tools

## File Explorer

Single-click selects, double-click opens. Back and Home buttons walk the history stack. The address bar shows the path, the status bar the object count and directory id.

Icons: folders (green when traced), orange bouncing packages, green pulsing modules, purple `ascend.exe` (green pulsing when traced). Gate-marked path nodes render purple and pulse.

## Signal tracing

TRACE scans the current directory for the folder leading to `ascend.exe` and flags it `isScanned`, highlighted green.

- Cost: `scanCostFor(iteration)` = 10 MB plus 2 MB per iteration above the first.
- Redundant traces glitch: tracing a directory whose signal is already isolated burns 1000-9999 KB, flashes the button red, and posts a notification.
- Offering: pressing TRACE inside a marked folder named `archivist` spends nothing and offers it instead of scanning.

## Supply Drops

Double-click a `.pkg` to decrypt it. Rewards land immediately with a notification. See [Economy and upgrades](./economy_and_upgrades.md) for the loot table.

## Auto-Marker

Eye icon toggle. Entering a folder while enabled spends 1 Auto-Marker and stars the folder gold. Opening files spends nothing.

## Manual marking

Right-click, Mark. Free. Gate marks render purple; manual marks render as stars.
