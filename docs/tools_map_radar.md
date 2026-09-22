# Map and radar

Unlockable Explorer tools, bought in System Updates. Unlocking pins the app to the desktop.

## Explorer Map

100 MB, iteration 2+. Unlocking pins Explorer Map to the desktop and adds it to the Start menu. It renders the folder hierarchy as a tree divided by depth levels, with connector lines from each folder to its children. The tree pans by drag and zooms by scroll, with zoom and reset buttons. A layer rail fixed to the left side of the window tracks the rows as the tree pans vertically and resizes with zoom; each fogged depth carries its reveal button there. Clicking a folder selects it; double-clicking jumps the focused Explorer to that directory. The Explorer's current folder renders with a white glow, and the ◎ button pans the tree to it. Hovering a folder shows its name, directory id, full path, and teleport price. Folders whose children sit below the revealed range show how many items they hold directly. Each fogged depth has a reveal button costing Auto-Markers: `ceil(folders at previous depth * 1.1)` minus one per already explored, traced, or marked folder below that depth (minimum 1). Teleporting costs Auto-Markers from the Explorer's current folder: `ceil(tree steps to the target * 1.1)` minus one per already visited folder on the path (minimum 1, free for the current folder). Revealed depths and visited folders reset each ascension.

## Special-File Radar

250 MB, iteration 3+. Lists packages, modules, minigame cabinets, hold vaults, ghost files, trail parts, and lore files without locations, searchable by name or tag and grouped by type. Each contact sells three triangulation tiers for Data: vague names three candidate depths, accurate names the exact depth, precise names the exact directory. Vague costs 5 MB + 1 MB per iteration above the first, accurate 10 MB + 2 MB, precise 20 MB + 4 MB. Minigames, locked files, lore, and trail parts cost double accurate and triple precise; supply drops and hardware modules stay at base prices. Purchased tiers persist for the iteration. Radar reveals information only; travel runs through Explorer Map teleports.

Teleporting jumps the focused Explorer to the target directory, opening one when none exists.
