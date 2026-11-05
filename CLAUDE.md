# Cubedom

A web-based, fantasy-medieval sandbox inspired by the 2000s toy "Cube World". Each character lives in a pixel-art room (a "box"). The player drags boxes onto a 5x4 board. Characters idle inside their box and sometimes visit neighboring boxes. The arrangement of boxes changes what happens.

## Tech and constraints
- Plain HTML + CSS + JavaScript with Canvas. No build tools, no frameworks. It must open by double-clicking `index.html`.
- Works on desktop and mobile (touch drag, responsive layout, web app manifest `manifest.webmanifest` + `icon.svg`).
- Hosted on GitHub Pages from `main`: https://forests999.github.io/Cubedom/ (pushing to `main` updates the live site).
- Pixel art must stay crisp: `image-rendering: pixelated` and `imageSmoothingEnabled = false`.
- Text labels (names) are regular HTML over the canvas so they stay sharp.
- Progress saves in `localStorage` (key `cubehold-v4`, kept from the old name so saves survive).
- Keep game rules and data (characters, interactions, odds) separate from drawing code.

## Files
Plain script files with no modules, so double-clicking `index.html` still works. They load in this order and share global variables, so the order matters:
- `index.html`: page layout only.
- `style.css`: all styling.
- `data.js`: constants (board size, save key), characters and sprite pixels (`CH`), arm poses (`POSE`), wizard outfits (`WIZ_COLORS`), room transitions (`TR`, `EXIT`), `WEAPONS`, all odds (`ODDS`), Tales of Old dialogue (`TALK`), display names (`NAMES`), and small helpers (`$`, `pick`, `cl`).
- `art.js`: room walls and backgrounds (`WALL`, `bg`, `BACKDOOR`, `SHELF2`) and all drawing functions (sprites, poses (`poseOf`), rooms, doors/portals/exits, activities, weapon swings (`pracAnim`), horse, cat, demon).
- `game.js`: game rules, movement and visits, the render loop, drag-and-drop input, the Compendium, and saving/loading.
All odds live in `ODDS`; the game (`decide`, `startAct`) and the Compendium both read from it, so change odds only there.

## Game rules
- Board: 5 columns x 4 rows, 96px cells. Neighbors are the 4 edge-sharing cells (no diagonals).
- Shelf under the board holds unplaced boxes. Drag a box onto the board to place it, onto another box to swap, onto the shelf to delete.
- Moving a box sends its character home to the middle of the box. Deleting a box makes the character vanish wherever they are. A visitor goes home if their host's box moves or is deleted.
- Characters: Knight and Wizard so far. The Knight's room gets a random wall weapon when created (shield, spear, glaive, longsword).
- A Wizard gets a random outfit color when placed (blue, purple or red, equal chances). Saved with the board (save entry: row, col, weapon, form, color).
- Hidden easter egg (not shown in the Compendium): a Wizard whose first placement is a drag onto the top-left cell wears a black outfit with a red staff orb (and a red glow when practicing magic). Tapping the shelf to auto-place never triggers it.
- The Knight (and Eldritch Knight) holds no weapon by default. A weapon is drawn only while he uses it: weapon practice, the orc fight and sparring (his room's weapon; the Eldritch Knight uses a magic sword).
- Characters always move a little during interactions: arm gestures (`gest`), hops, cheers.
- Taking damage shows a "hurt" face (eyes squeezed shut, no red eyes). Red eyes ("mad") are only for anger (the orc, the Knight glaring at it).

## Transitions between rooms
- Left/right: the Wizard always uses his portals (one in each room); everyone else walks through the side door, whichever room they're in.
- Up/down are set per ROOM in `TR`: Knight room = back-wall door (stone stairs behind it) for both up and down; Wizard room = a second bookshelf that slides aside to reveal a spiral staircase, for both. No trapdoor.
- Up/down: leave by your room's exit, arrive by the other room's exit (e.g. the Wizard going down: through his bookshelf, then out of the Knight's back door).
- Side doors sit in the wall line between two cells and are seen from the side: invisible when closed, and while a character walks through they swing out toward the viewer into the next room as a narrow side-on panel.
- The back door and the bookshelf are always part of the room; they open, then close again after use. Portals appear at full size (fading in).

## Visits (decided every few seconds per idle character)
- 20% chance to visit a neighbor (45% when the Wizard is left of the Knight).
- 2% of Knight/Wizard visits are Friendly Sparring, in any arrangement, in whichever room the visit goes to.
- 25% of the other visits are plain hangouts (a wave and a hop). Otherwise the arrangement's interaction plays.

## Arrangement interactions (Wizard position relative to Knight)
- Left: Old Friends. Hearts, arms raised, and they visit more often.
- Right: Eldritch Awakening. Always the Knight who visits the Wizard's room. The Wizard hands him a spellbook, the Knight reads the glowing purple tome (`tome` activity) and becomes the Eldritch Knight permanently (purple armor, horns), then cheers. Wizard survives.
- Above: Thunderstruck. Wizard stays in his own room, raises his arm and shoots a lightning bolt down; the Knight dies and his box returns to the shelf.
- Below: Tales of Old. They trade a few lines about past adventures, gesturing as they speak.
- Any: Friendly Sparring. Knight swings his weapon, Wizard casts magic and raises a magic shield bubble around himself (`drawWard`); the Wizard's spell lands a light hit on the Knight, the Knight's hit is blocked by the shield (it flashes), then they cheer.

## Idle activities
- Wizard: read a book 60% (holds it up open toward himself; we see the covers and pages turning), practice magic (swirling blue, arm waving) 38%, summon a demon 2% (arms raised; the demon rises, grabs him and drags him down through the floor; he dies).
- Knight: weapon practice 75%, fight an orc 20% (falls back to practice if no free neighbor), feed a horse 5% (needs open space to his right, meaning no box in the next cell, in any column or at the board edge; otherwise falls back to practice).
  - Practice: his right arm is drawn separately and swings with the weapon (`pracAnim`): sword and glaive wind up overhead and strike down, spear thrusts, shield bashes; his body leans into it.
  - Orc: the orc appears first on the far side of the neighbor's room, the Knight glares, then walks over and stands between the orc and his host to fight.
  - Horse: a horse's head and neck lean in from the right edge of his room; he walks over and holds out hay, the horse eats it, he hops happily, the horse leaves.
- Eldritch Knight only: 1% extra chance (`eknightCat`) that a small black cat walks across the back of the Wizard's room (needs a Wizard on the board).
- Arm poses (`POSE` in data.js): none, hold, noR (right arm drawn by the weapon swing), fwd, up, both. `poseOf` in art.js picks one from the activity.

## Compendium tab
Shows every interaction from the start (for development tracking), with no descriptive text: arrangement diagrams and looping animations of each idle activity. Each tile shows its % chance in the top right corner, computed from `ODDS` (one decimal below 1%):
- Arrangements: chance per idle check that a character starts that interaction (visit x not sparring x not a hangout): 33% Old Friends, 15% the others; Friendly Sparring 0.4%.
- Idle activities: how the activity is picked (Wizard 60/38/2, Knight 75/20/5, black cat 1%).
Whenever an interaction or idle activity is added or changed, update the Compendium to match.

## Art style
Pixel art, 16x22 character grid drawn from rectangles with an automatic dark outline. Each room has plain walls and floor, one background element representing its class, and its up/down exit (Knight: back-wall door; Wizard: second bookshelf). Fantasy medieval theme.

## Planned
Achievements and unlockables, more character classes, customizable dialogue, more interactions, real pixel art assets.

## Working style
- Make small changes and test each one. Explain changes in plain language; the owner is a beginner.
- Use git; commit after each working change. Commit as Forests999 with the GitHub noreply email (already set in this repo's git config); never use the owner's real name or email.
- Ask before pushing, since pushing publishes to the public site.
