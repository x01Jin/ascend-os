# Map and radar

Unlockable Explorer tools, bought in System Updates. Unlocking pins the app to the desktop.

## Explorer Map

100 MB, iteration 2+. Renders the folder hierarchy as a tree divided by depth levels, with connector lines from each folder to its children. The tree pans by drag and zooms by scroll, with zoom and reset buttons. Clicking a folder selects it; double-clicking jumps the focused Explorer to that directory. Hovering a folder shows its name, directory id, and full path. Depths beyond the revealed range collapse into hidden-folder counts. Each fogged depth has a reveal button costing Auto-Markers: `ceil(folders at previous depth * 1.1)` minus one per already explored, traced, or marked folder below that depth (minimum 1). Revealed depths and visited folders reset each ascension.

## Special-File Radar

250 MB, iteration 3+. Lists packages, modules, minigame cabinets, locked vaults, ghost files, trail parts, and lore files with teleport per entry.

Teleporting jumps the focused Explorer to the target directory, opening one when none exists.
