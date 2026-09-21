# Economy & Upgrades

## Currency: Data

The primary currency in Ascend OS is **Data**, measured in Kilobytes (KB), Megabytes (MB), and Gigabytes (GB).

- **Format**: 1024 KB = 1 MB.

## Data Miner (Clicker)

The **Data Miner** application is the source of income.

- **Action**: Clicking the "MINE DATA" button.
- **Click Value**: `(50 + efficiencyLevel * 5) * activeBoost` KB per click.
- **Base Rate**: 50 KB per click at level 0 with no boost active.
- **Visuals**:
  - Floating text indicators (`^Rate`) drift and fade around the button.
  - A real-time data stream visualizer runs at the bottom of the window, reacting to mining speed.

## Auto-Miner

A background module that automatically mines data over time. It can be monitored on the left side of the Data Miner window.

- **Initial State**: 0 KB/tick at 3.00s interval (Offline).
- **Mechanics**: Once a Power Module is installed, the Auto-Miner comes online and generates data every interval tick.

### Hardware Modules (.mod)

Hardware Modules are rare items found in the File Explorer. They appear as **green upload icons** and grant permanent upgrades to the Auto-Miner.

- **Spawn Rate**: ~11.5% in junk folders.

1. **Power Module (70%)**:
   - Increases the Auto-Miner's output.
   - Effect: **+1 to +5 KB** per tick.

2. **Speed Module (30%)**:
   - Reduces the time between Auto-Miner ticks.
   - Effect: **-10ms to -100ms** per module.
   - Limit: Minimum interval is 0.3s (300ms).
   - Max-speed conversion: a Speed Module collected while already at 300ms converts to **+1 to +3 KB/tick** Power instead.

## Supply Drops (.pkg)

Supply Drops (Packages) are common items found in the File Explorer. They appear as **Orange Packages**.

- **Spawn Rate**: ~15% in junk folders.
- **Loot Table**:
  - **Data Cache**: Contains a lump sum of Data (5-10 MB).
  - **AutoMark Bundle**: Contains 5-10 Auto-Markers.
  - **Overclock Chip**: Adds time (1-5s) to a random Overclock Bank (x2 - x5).

## System Updates

The **System Updates** application allows the player to spend Data to improve manual efficiency.

### 1. Miner Efficiency

- **Type**: Permanent Upgrade.
- **Effect**: Increases base click value by **+5 KB** per level.
- **Cost Scaling**: Exponential.
  - Formula: `10240 * (1.15 ^ Level)`

### 2. Overclock Banks (Boost)

- **Type**: Banked Consumable.
- **System**: Unlike traditional duration-based boosts, Ascend uses a **Bank System**. You purchase "Time" (seconds) for specific multipliers.
- **Banks**:
  - **x2**: Standard boost. Cheapest to maintain. Purchasable in System Updates.
  - **x3**: Advanced boost. Purchasable in System Updates.
  - **x4**: Super boost. Purchasable in System Updates.
  - **x5**: Rare boost. Found in Supply Drops; toggled from the Data Miner when banked time exists.
- **Cost formula**: `seconds * 5120 * 2^(multiplier - 2)` KB (x2: 5120, x3: 10240, x4: 20480 KB per second).
- **Purchase bundles**: +5 or +10 seconds per purchase in System Updates.
- **Mechanics**:
  - Toggle a multiplier ON in the Data Miner.
  - Time is consumed from that specific bank only while the boost is active.
  - You can switch between multipliers or turn them off to save time.
- **Visuals**: The Data Miner pulses red and the liquid data stream becomes agitated.

### 3. Auto-Marker Bundle

- **Type**: Inventory Consumable.
- **Effect**: Purchases Auto-Markers.
- **Cost**: 5 MB (5120 KB) per unit.
- **Bundle size**: Adjustable quantity from 1 to 100 units.
- **Usage**: See [Exploration & Tools](./exploration_and_tools.md).
