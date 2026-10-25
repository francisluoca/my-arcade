# Deep Pocket

A first-person browser mining game with perspective walls, procedural stone textures, branching cracks, embedded mineral veins, and warm headlamp lighting, and a crosshair. Open `index.html` in this folder to play. `game 2.html` also opens the same game.

## Controls

- WASD: move relative to the direction you face. Movement follows the block grid.
- Up/down arrows: move forward/backward. Left/right arrows: turn.
- Drag across the game view to look around.
- Click or Space: mine the block under the crosshair within four blocks. Hard ores take several hits.
- Walking into a block breaks it immediately, if your backpack has space for its ore.
- On-screen arrows: move forward/backward and turn.
- R or Return to surface: return to sell cargo and buy upgrades.

## Goal

Dig to 59 metres and recover the ancient relic for a $1,000 reward. Collect coal, copper, gold, and diamonds along the way. Harder blocks require multiple hits. Progress lasts for the current browser session; reloading starts a new game.

## Ore guide

| Ore | Value | First depth |
| --- | --- | --- |
| Coal | $5 | 1 m |
| Copper | $12 | 1 m |
| Iron | $18 | 5 m |
| Silver | $28 | 10 m |
| Gold | $35 | 13 m |
| Emerald | $65 | 20 m |
| Diamond | $100 | 25 m |
| Ruby | $85 | 35 m |
| Sapphire | $120 | 45 m |

Ore locations are randomized when you start a new mine.

Mining hits spread visible cracks across the targeted block. More damage creates wider, branching fractures until the block breaks. Movement still breaks blocks immediately.
