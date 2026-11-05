# Cubehold

A web-based, fantasy-medieval sandbox inspired by the 2000s toy "Cube World". Each character lives in a pixel-art room (a "box"). The player drags boxes onto a 5x4 board. Characters idle inside their box and sometimes visit neighboring boxes. The arrangement of boxes changes what happens.

## Tech and constraints
- Plain HTML + CSS + JavaScript with Canvas. No build tools, no frameworks. It must open by double-clicking `index.html`.
- Pixel art must stay crisp: `image-rendering: pixelated` and `imageSmoothingEnabled = false`.
- Text labels (names) are regular HTML over the canvas so they stay sharp.
- Progress saves in `localStorage` (key `cubehold-v4`).
- Keep game rules and data (characters, interactions, odds) separate from drawing code so it can be split into files later.

## Current state
The prototype (originally `cubehold_v4.html`) is split into plain script files with no modules, so double-clicking `index.html` still works. They load in this order and share global variables, so the order matters:
- `index.html`: page layout only.
- `style.css`: all styling.
- `data.js`: constants (board size, save key), characters and sprite pixels (`CH`), transitions (`TR`), `WEAPONS`, Tales of Old dialogue (`TALK`), display names (`NAMES`), and small helpers (`$`, `pick`, `cl`).
- `art.js`: room walls and backgrounds (`WALL`, `bg`) and all drawing functions (sprites, rooms, doors/portals/stairs, activities, demon).
- `game.js`: game rules, movement and visits, the render loop, drag-and-drop input, the Compendium, and saving/loading.
The visit and idle-activity odds are still written inline in `game.js` (`decide`, `startAct`).

## Game rules
- Board: 5 columns x 4 rows, 96px cells. Neighbors are the 4 edge-sharing cells (no diagonals).
- Shelf under the board holds unplaced boxes. Drag a box onto the board to place it, onto another box to swap, onto the shelf to delete.
- Moving a box sends its character home to the middle of the box. Deleting a box makes the character vanish wherever they are. A visitor goes home if their host's box moves or is deleted.
- Characters: Knight and Wizard so far. The Knight's room gets a random wall weapon when created (shield, spear, glaive, longsword).

## Transitions between rooms (set per class in `TR`)
- Knight: door left/right, stone staircase up, trap door down.
- Wizard: portal left/right, spiral staircase up and down.
- Doors sit on the line between two cells, are invisible when closed, and swing open toward the viewer while a character walks through.

## Visits (decided every few seconds per idle character)
- About 20% chance to visit a neighbor (45% when the Wizard is left of the Knight).
- 25% of visits are plain hangouts with no special event. Otherwise the arrangement's interaction plays.

## Arrangement interactions (Wizard position relative to Knight)
- Left: Old Friends. Hearts, and they visit more often.
- Right: Eldritch Awakening. Wizard teaches, Knight becomes the Eldritch Knight permanently (purple, magic sword). Wizard survives.
- Above: Thunderstruck. Wizard stays in his own room and shoots a lightning bolt down; the Knight dies and his box returns to the shelf.
- Below: Tales of Old. They trade a few lines about past adventures.

## Idle activities
- Wizard: read a book 60%, practice magic (swirling blue) 38%, summon a demon that kills him 2%.
- Knight: weapon practice with his room's weapon 80%, walk to a neighbor and fight an orc 20% (falls back to practice if no free neighbor).

## Compendium tab
Shows every interaction from the start (for development tracking), with no descriptive text: arrangement diagrams and looping animations of each idle activity. Whenever an interaction or idle activity is added or changed, update the Compendium to match.

## Art style
Pixel art, 16x22 character grid drawn from rectangles with an automatic dark outline. Each room has plain walls and floor plus one background element representing its class. Fantasy medieval theme.

## Planned
Achievements and unlockables, more character classes, customizable dialogue, more interactions, real pixel art assets.

## Working style
- Make small changes and test each one. Explain changes in plain language; the owner is a beginner.
- Use git; commit after each working change.
