# Trail unscramble

The trail location file bought from the ascension gate never lists the directory id directly. It shows three scrambled words and accepts one answer per numbered word.

## Word pool

The three words come from a fixed pool of 40 sets, picked deterministically from the run seed and layer. The letter order is shuffled with the same seed, so every run of a layer shows the same scramble.

## Solving

Each answer matches its numbered word, ignoring case and surrounding spaces. A wrong set keeps the file sealed with a hint. Solving all three reveals the `DIRECTORY` line naming the folder that holds the layer's `archivist_N` file, plus the usual teleport hint.

## Persistence

Payment records the layer in `locatedTrail`; solving records it in `unscrambledTrail`. Both are keyed by layer and persist across closing the gate and across ascensions.
