# Arcade

Five cabinets exist as `.exe` files, one per game, scattered off-path. Opening one from the Explorer launches its game. Wins record per iteration in `arcadeWins`.

## Games

- **Pong** (gamepad icon): first to 5 against the machine. The machine tracks sluggishly and misreads the ball, sharpening a little every time you score. If the machine reaches 5 first, both scores reset.
- **Dino Run** (egg icon): survive 20 seconds across accelerating dunes. Dodge cactus clusters and low flyers appearing in the second half.
- **Tic-Tac-Toe** (grid icon): win a best-of-five series, first to 3 rounds. The machine plays randomly in round one and sharpens every round after. Losing the series resets both scores.
- **Snake** (worm icon): eat 10 pellets with the arrow keys. Hitting a wall or yourself resets the run.
- **Memory** (brain icon): clear all 6 pairs.

Each cabinet shows its own icon on the Explorer tile, in its window header, and in the Ascension gate checklist. Other executables keep the generic chip icon.

## Gate and achievements

Three cabinets per iteration count toward the [Ascension gate](./ascension_gate.md). A hold pass clears one picked game from its window. First win earns `arcade_rookie`; beating all five in one iteration earns `arcade_master`.
