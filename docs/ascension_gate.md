# Ascension gate

Running `ascend.exe` opens the gate dialog instead of ascending directly. All items must be complete.

## Checklist

1. **Trail**: the lore fragment for `archivist_N` is recorded (`lore_archivist_N` seen), with `N = min(iteration, 5)`.
2. **Ghost**: solve the ghost frequency (once ever, any iteration).
3. **Minigames**: beat the 3 picked cabinets this iteration. The pick rotates deterministically from `runSeed` and iteration.
4. **Fuel**: pay `25 MB * iteration`, once per iteration.

## Passes

Opening the dead-drop vault with the ghost password grants 1 pass. From any minigame window, a pass clears one picked game without playing it. Opening any other locked file only posts a notification and grants nothing.

## Effects

Paying fuel records `fuelPaidIter`. Beating a cabinet records `arcadeWins[gameId] = currentIteration`, so wins reset each iteration for gate purposes. Ascending keeps everything listed in [Core loop](./core_loop.md) and clears marks, consumed ids, and the active boost.
