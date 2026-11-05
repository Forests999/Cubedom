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
- `index.html`: page layout only (board, character shelf `#tray`, item tray `#items`, Reset button, `#toast` message, `#modal` purchase popup). File links carry a release number `?v=`.
- `style.css`: all styling.
- `data.js`: constants, characters and sprite pixels (`CH`), arm poses (`POSE`), classes and tag icons (`CLASS`, `TAG_ICON`), wizard outfits (`WIZ_COLORS`), shelf characters (`SHELF_CHARS`), items (`ITEMS`), room exits (`TR`, `EXIT`), `WEAPONS`, the neighbor interaction table (`PAIRS`), potion-teleport scenes (`POTION_KINDS`), all odds (`ODDS`), timers and prices (constants like `SLEEP_TIME`, `APOTH_COST`), dialogue (`TALK`, `GOSSIP`, `PRAYERS`, `NECRO_TALK`, `DEBATE`, `MERCH_ADS`, `JOKES`, `FARM_PRAYER`), display names (`NAMES`), Compendium tabs (`COMP_TABS`, `EGGS`), and small helpers (`$`, `pick`, `cl`).
- `art.js`: room walls and backgrounds (`WALL`, `bg`, `BACKDOOR`, `BACKDOOR_L`, `SHELF2`, `WINDOW`) and all drawing functions (sprites, `poseOf`, rooms, exits, activities, weapon swings `pracAnim`, creatures, effects, item icons `drawItem`).
- `game.js`: rules, decisions (`decide`, `startAct`, `acting`), movement (`route`, `run`), interaction scenes (`talk`), items (`useItem`), shops, the render loop, input, the shelf (`buildShelf`), the Compendium (`buildRef`), and saving/loading.
All odds live in `ODDS`; the game and the Compendium both read from it, so change odds only there.

## Board, boxes and saving
- Board: 5 columns x 4 rows, 96px cells. Neighbors are the 4 edge-sharing cells (no diagonals).
- The shelf under the board holds unplaced boxes. Drag a box onto the board to place it (or tap it to drop it in the first free cell), onto another box to swap, onto the shelf to remove it.
- Moving a box sends its character home to the middle of the box. Removing a box makes the character vanish wherever they are. A visitor goes home if their host's box moves or is removed. Anyone with a doorway, stairs or portal open in a moved/removed room is also sent home (`clearRooms`), so no exit is left behind.
- When a character dies their box is removed and returns to the shelf (except the Necromancer destroyed by an artifact, see Easter eggs).
- Reset game (under the item tray): tap once to arm ("Tap again to reset", red), tap again within 4 s. Wipes the save: default board (Knight + Wizard), 0 coins, no items, nothing unlocked, Compendium cleared. Saving is switched off during the reset.
- Save entry per box: row, col, weapon, form, color, backwards-speech flag. Also saved: unlocks `S.un`, `coins`, item inventory `S.inv`, Compendium record `S.seen`, rewards paid `S.rewarded`. Not saved: monkey form, crusades in progress, the temporary Farmer.

## Characters
| Character | Class | Look and room | How you get it |
|---|---|---|---|
| Knight | Fighter (sword tag) | Steel armor (1% bronze, easter egg). Room: armor stand, his random wall weapon (shield, spear, glaive, longsword), back-wall door. | On the shelf |
| Wizard | Mage (star tag) | Random outfit blue/purple/red (black + red orb = easter egg). Room: big bookshelf, second bookshelf hiding a spiral staircase. | On the shelf |
| Priest | Mage | White robes, gold cross; 50% male / 50% female. Room: stained glass window, candle, back-wall door. | On the shelf |
| Necromancer | Mage | Dark green hood, pale skin, skull staff. Room: skulls, green candles, back-wall door. | 25% chance whenever a Priest dies (`ODDS.necro`) |
| Fruit Merchant | Merchant (coin tag) | Apron and red cap. Room: striped awning, fruit crates, back-wall door. | Hold 30 coins at once (`MERCHANT_COINS`) |
| Apothecary | Merchant | A woman with long auburn hair, green robe. Room: herb planters, potion shelves and counter, back door on the LEFT. Placing her box costs 20 coins (asks first). | Place any Merchant next to any Mage |
| Farmer | Merchant | Straw hat. Room: sky, fence, a growing field. Temporary (not on the shelf, not saved). | Fruit Merchant left of Apothecary, 3% |

Forms that replace a character for a while: Eldritch Knight (permanent, purple armor), Death Knight (permanent until cleansed, skeleton in dark armor; only follows the Necromancer), Monkey (Fruit Merchant, 2 minutes; only hops around and eats bananas). Death Knights and monkeys take no part in interactions, idles or items, and nobody visits them.

Visitors who are not boxes: farmer, possessed farmer, ghost, squire, nobles, farmer mob, orc, skeletons, zombies, demon, golem, horse, cat.

## How characters decide (timing)
- Each idle character rolls about every 5-10 seconds (wait after an idle activity 1.5-4 s, after a visit or wander 2-5 s, plus the activity itself).
- Each roll: 20% visit a neighbor (`ODDS.visit`), 40% an idle activity (`ODDS.idle`), the rest wander in their room.
  - Knight or Wizard in Old Friends: 45% visit. Knight with a Priest directly above: x1.6 (Zeal).
  - No free neighbor = wander. No idle activities = wander. Asleep, away on crusade, Death Knight and monkey never roll normally.
- A visit: Knight/Wizard visits are Friendly Sparring 2% of the time (any arrangement). Then 15% are plain hangouts (`ODDS.hangout`: a wave and a hop). The rest play the pair's arrangement interaction below.
- Interaction scenes play at `SCENE_PACE` (0.65) speed so they last a few seconds longer. Walking and idles are normal speed.

## Arrangement interactions
"X left of Y" means X's box is directly left of Y's (same row). Every pair of character types is listed; pairs not marked with a scene only ever have plain hangouts. Unless it says "cast", the scene happens when one visits the other, in the host's room.

### Knight & Wizard (Wizard relative to Knight)
- Wizard left of Knight: **Old Friends.** Hearts, arms raised; they visit each other more often (45%).
- Wizard right of Knight: **Eldritch Awakening.** Always the Knight who visits. The Wizard hands him a spellbook; reading it turns him into the Eldritch Knight permanently.
- Wizard above Knight: **Thunderstruck** (cast). The Wizard shoots a lightning bolt down from his room; the Knight dies.
- Wizard below Knight: **Tales of Old** (`TALK`). They trade stories.
- Any side, 2%: **Friendly Sparring.** Weapon vs magic; the Wizard's shield blocks the Knight's hit.

### Priest & Wizard (Priest relative to Wizard)
- Priest left: **Gossip** (`GOSSIP`) about the other characters.
- Priest right: **Reading together.** Holy book and spellbook.
- Priest above: **Holy light vs darkness.** Blinding light; the annoyed Wizard snuffs it out with darkness.
- Priest below: **Accidental undead.** A skeleton rises; they destroy it together.

### Priest & Knight (Priest relative to Knight)
- Priest left: 90% **A short prayer** (`PRAYERS`), the Knight listens with hands together. 10% (`ODDS.tentacle`) **Eldritch tentacles**: they smash through the Priest's window; the Priest backs away, the Knight runs over and fights them off.
- Priest right: **Praying together.** Both kneel.
- Priest above: **Zeal.** No scene; the Knight visits 60% more often. 2% of their visit rolls (`ODDS.crusade`): **Holy crusade** - they fade away together for 2 minutes and come back with 10 coins (70%) or an artifact (30%).
- Priest below: **Holy water.** The Priest sprinkles the Knight, who glows.

### Necromancer & Knight (Necromancer relative to Knight)
- Necromancer left: **Sleep spell** (cast). A lavender wave rolls right along his row; everyone in that row to his right sleeps for 60 s (no interactions, no idles; a potion on a sleeper wakes them without its normal effect).
- Necromancer right: **Undead horde.** Three skeletons rise one by one beside the Knight; he cuts them down. 5% he falls and dies.
- Necromancer above: **Death Knight.** The Knight visits and is turned into a Death Knight, who then only follows the Necromancer.
- Necromancer below: **Old friends, old stories** (`NECRO_TALK`).

### Necromancer & Priest (Necromancer relative to Priest)
- Necromancer left or right: **no interaction at all**, they never visit each other.
- Necromancer above: **Holy vs unholy argument** (`DEBATE`), both angry.
- Necromancer below: **Purge.** Three ghosts (70%) or zombies (30%) appear; the Priest destroys them with holy light.
- Any side, while a Death Knight is on the board: any visit roll between them becomes **Cleansing**: the Priest visits the Necromancer and turns the Death Knight back into a Knight.

### Necromancer & Wizard (Necromancer relative to Wizard)
- Necromancer left: **Clay golem.** It charges through the back wall and escapes; the hole repairs itself.
- Necromancer right: **Reading tomes together.**
- Necromancer above: 50/50 **Lightning duel** (black vs blue lightning) or **Crafting a scroll** (20 coins, `SCROLL_COST`, paid when it's made; not enough coins = the Wizard shows off frost or the Necromancer a dark orb).
- Necromancer below: **Room swap** (cast). Their boxes trade places.
- Any side, 1% (`ODDS.forge`): **Making an item together.** A free spell scroll or potion (50/50).

### Fruit Merchant & Priest (Priest relative to Merchant)
- Priest left of Merchant: 50/50 (`ODDS.feast`) **Apple** (the Merchant drops an apple; 95% the Priest buys it, +1 coin; 5% he slips on it and dies) or **Feast** (a table of food, two nobles join, everyone eats).
- Priest right of Merchant: hangouts only.
- Priest below Merchant (Merchant above): 50/50 (`ODDS.fruitfall`) **Fruit thrown down** (cast; the Priest gets angry, the Merchant laughs) or **Starfruit** (+5 coins).
- Priest above Merchant (Merchant below): **Cursed fruit** (cast). The Merchant's fruit rots for 60 s; meanwhile nothing he does earns coins.

### Fruit Merchant & Wizard (Merchant relative to Wizard)
- Merchant left: **Wizard advertises.** For 60 s the coin timer gives 2 coins every 30 s.
- Merchant right: 99.5% **Jokes and laughter** (`JOKES`); 0.5% (`ODDS.murder`) **A dark turn**: the Merchant kills the Wizard.
- Merchant above: **A giant banana.** The Wizard magics it huge.
- Merchant below: **Durian.** +10 coins; the Wizard hates the smell.

### Apothecary & Fruit Merchant
- Apothecary left of Merchant: **A gift.** She gives him a potion; it has its usual effect on him (backwards speech toggles).
- Merchant left of Apothecary: 97% **Trading wares** (apples for potions); 3% (`ODDS.farm`) **A farm appears**: a temporary Farmer box on the nearest empty cell grows wheat (80%) or apples (20%) for 3 minutes, then harvests for +30 coins and disappears.
- Above / below: hangouts only.

### Pairs with only hangouts
Knight & Fruit Merchant, Knight & Apothecary, Wizard & Apothecary, Priest & Apothecary, Necromancer & Fruit Merchant, Necromancer & Apothecary, and anyone & the Farmer.

### Bigger gatherings
- **Great prayer:** a Priest with all four neighbors free, 5% of his rolls (`ODDS.massPrayer`). All four come to his room, everyone kneels for 20 s under a holy glow, then they go home.

## Idle activities
- **Knight:** weapon practice 75% (walks to the middle first; the arm swings with the weapon; with a shield, a squire comes in and spars with a wooden sword while he blocks), fight an orc in a neighbor's room 20%, feed a horse 5% (needs no box to his right). Eldritch Knight only: 1% a black cat walks through the Wizard's room.
- **Wizard:** read 60%, practice magic 38%, summon a demon 2% (it drags him down; he dies). Next to a Merchant with 5 coins: 1% he brews a potion (-5 coins, +1 potion).
- **Priest:** kneel and pray 50% (golden ceiling light), bless a farmer 35%, tithe prayer 10% (+5 coins), exorcism 5%.
- **Necromancer:** commune with spirits 50%, candles and chalk circle 25%, red lightning 24%, raise a skeleton in another character's room 1% (Fighters and Mages beat it; anyone else dies).
- **Fruit Merchant:** call out adverts 70%, sell apples to a neighbor 29% (+2 coins), a mob of farmers pelts him with fruit 1%.
- **Apothecary:** trip 5%, trip and smash a potion 5%, brew potions 50% (just for show), water and pick herbs 40%.
- **Farmer:** tends his field until harvest.

## Items, coins and shops
- Items are a counted inventory (`S.inv`), not infinite: you start with none and earn them in the game. Drag one onto a room; it works only if the owner is home and not busy. If it does nothing it is not used up (grey puff).
- **Spell scroll:** Wizard = fireball destroys a random neighboring room and everyone in it; Knight = golden glow 30 s; Priest = banishes a ghost; Necromancer = raises a skeleton next door; Fruit Merchant = monkey for 2 minutes; Apothecary = +1 potion.
- **Potion:** Wizard = teleports to a random character anywhere, does one of their scenes (`POTION_KINDS`), portals home; Knight = flexes; Priest = angel wings 30 s; Necromancer = sniffs it and smashes it on the wall; Fruit Merchant = speaks backwards until another potion; Apothecary = +10 coins; anyone asleep = wakes up.
- **Artifact:** only the Priest easter egg uses it so far.
- **Coins:** +1 every 30 s while the game is open (2 during the Wizard's advertising). Also from scenes (tithe, sales, starfruit, durian, crusade, farm) and Compendium rewards.
- **Where items come from:** scrolls from Necromancer + Wizard crafting (20 coins), their 1% joint making, or the Wizard's writing desk (50 coins; 30 for the black Wizard); potions from the Apothecary (30 coins), the Wizard brewing next to a Merchant (5 coins), the joint making, or a scroll on the Apothecary; artifacts from the crusade.
- **Shops:** tap the Apothecary's room to buy a potion; tap the Wizard's room while his writing desk shows (a Merchant AND another Mage next to him) to buy a scroll. Shop rooms have a thin silver border. Every purchase asks first in the in-page popup (`ask`; not the browser pop-up).

## Transitions between rooms
- Left/right: the Wizard always uses portals; everyone else walks through the side door (seen edge-on, it swings out into the next room).
- Up/down are set per ROOM in `TR`: Knight, Priest, Necromancer, Fruit Merchant and Farmer rooms = back-wall door with stone stairs; Apothecary = the same door on the left (`backdoorL`); Wizard = a bookshelf that slides aside to a spiral staircase. Leave by your room's exit, arrive by the other room's.
- Not neighbors (potion teleport return): a pair of portals.

## Unlocks and easter eggs
- Necromancer: 25% when a Priest dies. Fruit Merchant: hold 30 coins. Apothecary: any Merchant next to any Mage. Unlocks last until Reset.
- Easter eggs (hidden in the Compendium until found, counted in totals; `EGGS`, `checkEggs`):
  - **Black Wizard:** a Wizard dragged onto the top-left cell on his first placement wears black with a red orb (tapping the shelf never does this).
  - **Bronze Knight:** 1% of Knights get bronze armor.
  - **Skulls:** the Necromancer's floor is littered with skulls while his box is on the bottom row.
  - **Artifact on the Priest** while the Necromancer is his neighbor: the Necromancer is destroyed AND removed from the shelf; he must be unlocked again by a Priest dying.

## Compendium tab
- Tabs per character (`COMP_TABS`): Knight, Wizard, Priest, Necromancer, Fruit Merchant, Apothecary. Each lists everything that character takes part in (shared scenes appear in both tabs), grouped as With neighbors / Idle activities / Items, shops and secrets, with found / total counts (totals include hidden easter eggs).
- Tiles show the chance in the top right (from `ODDS`), icons in the bottom left for anything a scene gives you (`GAINS`), and a gold border once it has happened (`markSeen`, `S.seen`). Found easter eggs get a purple dashed outline.
- Every 5 different discoveries pay 10 coins (`DISCOVER_EVERY`, `DISCOVER_REWARD`, `S.rewarded`).
- Whenever an interaction, idle activity or item effect is added or changed: add it to `COMP_TABS`, give it a tile in `buildRef`/`idleTile`/`pairDiagram`, and make sure the game calls `markSeen` for it.

## Drawing and animation conventions
- Pixel art: 16x22 character grid drawn from rectangles with an automatic dark outline. Rooms have plain walls and floor, a background element for the class, and their up/down exit. Fantasy medieval theme.
- Arms come from poses (`POSE`: none, hold, noR, fwd, up, both, pray, flex, flex2); `poseOf` picks one per activity. Short gestures use `gest`.
- Moods: ok, happy, mad (red eyes; real anger and monsters only), hurt (eyes shut; taking damage), shock (wide eyes; surprise), sleep. Never use red eyes for surprise.
- Visitors stand at least 30px beside their host (`standBy`). Hops start from the ground (`u.hd`). Facing only flips when the other is clearly to one side.
- Knight weapons are only drawn while used, and are clipped to his room.
- Extra people in a scene live in `u.crowd`; a single helper in `u.npc`.
- The class tag after each name comes from `CLASS` / `TAG_ICON`.

## Planned
Achievements and unlockables, more character classes, customizable dialogue, more interactions, buying items with coins, real pixel art assets.

## Working style
- Make small changes and test each one. Explain changes in plain language; the owner is a beginner.
- Keep this file up to date as one current reference (not a change log): when something changes, edit the section it belongs in.
- Use git; commit after each working change. Commit as Forests999 with the GitHub noreply email (already set in this repo's git config); never use the owner's real name or email.
- Ask before pushing, since pushing publishes to the public site.
- Before every push, raise the release number `?v=` in `index.html` (on style.css, data.js, art.js and game.js, all four the same, e.g. 10 -> 11) so browsers and phones load the new files instead of old cached ones.
