# Ascension gate

Running `ascend.exe` opens the gate dialog instead of ascending directly. All items must be complete.

## Checklist

1. **Trail**: the lore entry for `archivist_N` is recorded (`lore_archivist_N` seen), with `N = min(iteration, 5)`.
2. **Minigames**: beat the 3 picked cabinets this iteration. The pick rotates deterministically from `runSeed` and iteration.
3. **Fuel**: pay `25 MB * iteration`, once per iteration.

## Passes

Opening the hold vault with the ghost password grants 1 pass. From any minigame window, a pass clears one picked game without playing it. Opening any other locked file only posts a notification and grants nothing.

## Locate

Each unbeaten minigame row sells its terminal location for Data at 5 MB + 2 MB per iteration above the first. Buying it swaps the button to a file holding the terminal's directory id. Bought locations persist for the iteration, including across closing and reopening the gate.

The unread trail row sells its file location at twice the minigame price. Buying it swaps the button to a trail location file that hides the directory id behind three scrambled words; see [Trail unscramble](./trail_unscramble.md). The directory id appears in the file only after all three words are entered correctly. Paid and solved layers persist per iteration.

## Effects

Paying fuel records `fuelPaidIter`. Beating a cabinet records `arcadeWins[gameId] = currentIteration`, so wins reset each iteration for gate purposes. Ascending keeps everything listed in [Core loop](./core_loop.md) and clears marks, consumed ids, and the active boost.
