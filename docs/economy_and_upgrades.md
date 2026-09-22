# Economy and upgrades

## Currency: Data

Data is measured in KB. Displays convert at 1024 KB = 1 MB and 1024 MB = 1 GB.

## Data Miner

Clicking MINE DATA pays `(50 + efficiencyLevel * 5) * activeBoost` KB per click.

The window shows a data stream visual, floating rate text, Overclock toggle buttons for each banked multiplier, and the Auto-Miner readout.

## Auto-Miner

Background income. Starts at 0 KB per tick on a 3000 ms interval (offline). Each tick adds `autoMinerData` KB.

### Hardware Modules (.mod)

Green upload icons in the Explorer. Spawn in about 5% of junk slots. Each installs permanently:

1. **Power Module (70%)**: `+1` to `+5` KB per tick.
2. **Speed Module (30%)**: `-10` to `-100` ms per tick, floored at 300 ms. A Speed Module drawn at the floor converts to `+1` to `+3` KB per tick instead.

## Supply Drops (.pkg)

Orange package icons. Spawn in about 7% of junk slots. Opening one consumes it and pays immediately:

- **Data Cache (60%)**: 5-10 MB.
- **Auto-Mark Bundle (30%)**: 2-4 Auto-Markers.
- **Overclock Chip (10%)**: 1-5 seconds into a random bank (x2-x5).

## System Updates

### Miner efficiency

Permanent `+5` KB per click level. Cost: `floor(10240 * 1.35^level)` KB.

### Overclock banks

Banked seconds per multiplier. Buying adds time; toggling a multiplier on in the Data Miner drains its bank in real time. Switching or turning off preserves the remainder.

- Banks: x2, x3, x4 purchasable. x5 comes only from supply drops; toggle it from the Data Miner once banked.
- Cost: `seconds * 5120 * 2^(multiplier - 2)` KB.
- Bundles: +5 or +10 seconds per purchase.

### Auto-Marker bundle

5120 KB per unit. Quantity selector runs 1-100, default 5. See [Exploration and tools](./exploration_and_tools.md).

### Unlockable tools

Explorer Map (100 MB, iteration 2+) and Special-File Radar (250 MB, iteration 3+). See [Map and radar](./tools_map_radar.md).
