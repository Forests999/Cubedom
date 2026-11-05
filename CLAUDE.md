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
- `index.html`: page layout only (board, character shelf `#tray`, item tray `#items`, `#toast` message).
- `style.css`: all styling.
- `data.js`: constants (board size, save key), characters and sprite pixels (`CH`), arm poses (`POSE`), wizard outfits (`WIZ_COLORS`), shelf characters (`SHELF_CHARS`), items (`ITEMS`), room transitions (`TR`, `EXIT`), `WEAPONS`, neighbor interaction table (`PAIRS`), potion interaction list (`POTION_KINDS`), all odds (`ODDS`), dialogue (`TALK`, `GOSSIP`, `PRAYERS`), display names (`NAMES`), and small helpers (`$`, `pick`, `cl`).
- `art.js`: room walls and backgrounds (`WALL`, `bg`, `BACKDOOR`, `SHELF2`, `WINDOW`) and all drawing functions (sprites, poses (`poseOf`), rooms, doors/portals/exits, activities, weapon swings (`pracAnim`), horse, cat, demon, tentacles, holy light, darkness, fireball, golden glow, item icons).
- `game.js`: game rules, movement and visits, interactions (`talk`), items (`useItem`), the render loop, drag-and-drop input, the shelf (`buildShelf`), the Compendium, and saving/loading.
All odds live in `ODDS`; the game (`decide`, `startAct`) and the Compendium both read from it, so change odds only there.

## Game rules
- Board: 5 columns x 4 rows, 96px cells. Neighbors are the 4 edge-sharing cells (no diagonals).
- Shelf under the board holds unplaced boxes. Drag a box onto the board to place it, onto another box to swap, onto the shelf to delete.
- Moving a box sends its character home to the middle of the box. Deleting a box makes the character vanish wherever they are. A visitor goes home if their host's box moves or is deleted.
- When a character dies (Thunderstruck, demon, fireball) their box is removed and returns to the shelf.
- Characters: Knight, Wizard, Priest, and the unlockable Necromancer. The Knight's room gets a random wall weapon when created (shield, spear, glaive, longsword).
- A Wizard gets a random outfit color when placed (blue, purple or red, equal chances). Saved with the board (save entry: row, col, weapon, form, color).
- Hidden easter egg (not shown in the Compendium): a Wizard whose first placement is a drag onto the top-left cell wears a black outfit with a red staff orb (and a red glow when practicing magic). Tapping the shelf to auto-place never triggers it.
- The Knight (and Eldritch Knight) holds no weapon by default. A weapon is drawn only while he uses it: weapon practice, the orc fight, tentacles and sparring (his room's weapon; the Eldritch Knight uses a magic sword). Weapon drawings are clipped to the room he stands in.
- Characters always move a little during interactions: arm gestures (`gest`), hops, cheers.
- Moods: ok, happy, mad (red eyes; only real anger and monsters), hurt (eyes squeezed shut; taking damage), shock (wide white eyes and open mouth; surprise). Never use red eyes for surprise.
- Class tags: a small pixel symbol after every name (labels and shelf), from `CLASS` and `TAG_ICON`: Fighter = sword, Mage = magic star, Merchant = coin. Knight = Fighter; Wizard, Priest, Necromancer = Mage.
- Spacing: visitors stand beside their host, at least 30px apart (`standBy`), never on top of them. If needed the host steps aside (orc fight) or backs away (tentacles).
- Hops: `u.hop` is remembered with its starting length (`u.hd`), so short hops are small nods that start from the ground (no popping). Facing only flips when the other character is clearly to one side (no flip-flopping).

## Characters
- Priest: white robes, gold rope belt, gold cross necklace. Room: stained glass window, candle, back-wall door with stone stairs.
- Necromancer: dark green hooded robe, pale skin, skull staff. Room: skulls and green candles on shelves, back-wall door. Unlock: when a Priest dies there is a 25% chance (`ODDS.necro`) the Necromancer box appears on the shelf (saved in `S.un.necromancer`; the Priest box stays too). The unlock is a real 25% roll on every Priest death, including fireball deaths (tested: about 25% over thousands of deaths).

## Items (consumables)
- An item tray under the shelf with a counted inventory (`S.inv`, saved). Items are NOT infinite: each use takes one, and you start with none. Items are only gained through the game: scrolls from Necromancer + Wizard crafting (20 coins) or their 1% joint making; potions from the Wizard brewing next to a Merchant (5 coins), that 1% joint making, or buying from the Apothecary (30 coins); scrolls also from the Wizard's writing desk (50 coins); artifacts from the crusade. An item you have none of is greyed out and can't be dragged. If the item does nothing, it is not used up. Drag one onto a room: it works only if the room's owner is at home (not visiting, not hosting, not in the middle of a big activity such as demon, fireball, flex, horse, raising, banishing, sniffing, or a farmer visit). Otherwise, or if the item does nothing for that character, a grey puff.
- Spell scroll on Wizard: fireball. He charges his staff and throws a fireball at a random neighboring room that has a box (or an empty neighboring cell if none). That room is destroyed and everyone inside dies, including visitors (whose own boxes are destroyed too).
- Spell scroll on Knight: his armor shines with a golden glow for 30 seconds.
- Potion on Wizard: he drinks, teleports to a random free character anywhere on the board, does a random interaction with them (`POTION_KINDS`: Knight = Old Friends/Eldritch Awakening/Tales of Old/Sparring; Priest = his four; Necromancer = duel, craft, golem, tomes; others = hangout), then portals back home. With nobody free, he just sparkles.
- Potion on Knight: he drinks and flexes his muscles.
- Spell scroll on Priest: a ghost floats in; he raises his arms and drives it off with a beam of holy light; it fades away.
- Potion on Priest: he drinks it and glowing angel wings appear on his back for 30 seconds (`u.wings`).
- Spell scroll on Necromancer: he raises a skeleton in another character's room (same as his 1% idle). Nobody free: grey puff.
- Potion on Necromancer: he sniffs it, makes a face, and throws it at the back wall, where it smashes (glass and a red splat that fades).
- Gold coins: shown in the item tray (not draggable). Spent on crafting scrolls. +1 every `COIN_EVERY` (30) seconds while the game is open, +5 (`TITHE`) from the Priest's tithe prayer. Saved as `coins`. Will be used to buy items later.

## Transitions between rooms
- Left/right: the Wizard always uses his portals (one in each room); everyone else walks through the side door, whichever room they're in.
- Up/down are set per ROOM in `TR`: Knight, Priest and Necromancer rooms = back-wall door (stone stairs behind it) for both up and down; Wizard room = a second bookshelf that slides aside to reveal a spiral staircase, for both. No trapdoor.
- Up/down: leave by your room's exit, arrive by the other room's exit (e.g. the Wizard going down: through his bookshelf, then out of the Knight's back door).
- Not neighbors (potion teleport return): a pair of portals.
- Side doors sit in the wall line between two cells and are seen from the side: invisible when closed, and while a character walks through they swing out toward the viewer into the next room as a narrow side-on panel.
- The back door and the bookshelf are always part of the room; they open, then close again after use. Portals appear at full size (fading in).

## Visits (decided every few seconds per idle character)
- 20% chance to visit a neighbor (45% for Knight/Wizard when the Wizard is left of the Knight; x1.6 for a Knight with a Priest directly above him).
- 2% of Knight/Wizard visits are Friendly Sparring, in any arrangement, in whichever room the visit goes to.
- 15% of the other visits are plain hangouts (a wave and a hop). Otherwise the pair's arrangement interaction plays (`PAIRS`, `pairKind`). Pairs with no table entry (e.g. anyone + Necromancer) only hang out.

## Arrangement interactions
Wizard position relative to Knight:
- Left: Old Friends. Hearts, arms raised, and they visit more often.
- Right: Eldritch Awakening. Always the Knight who visits the Wizard's room. The Wizard hands him a spellbook, the Knight reads the glowing purple tome (`tome` activity) and becomes the Eldritch Knight permanently (purple armor, horns), then cheers. Wizard survives.
- Above: Thunderstruck. Wizard stays in his own room, raises his arm and shoots a lightning bolt down; the Knight dies and his box returns to the shelf.
- Below: Tales of Old. They trade a few lines about past adventures, gesturing as they speak.
- Any: Friendly Sparring. Knight swings his weapon, Wizard casts magic and raises a magic shield bubble around himself (`drawWard`); the Wizard's spell lands a light hit on the Knight, the Knight's hit is blocked by the shield (it flashes), then they cheer.

Priest position relative to Wizard:
- Right: Reading together. Priest reads a white holy book with a gold cross, Wizard his spellbook.
- Left: Gossip. They trade lines about the other characters (`GOSSIP`).
- Below: Accidental undead. A green circle, a skeleton rises; Wizard fires magic, Priest gold holy power; it crumbles and they cheer.
- Above: Holy light vs darkness. The Priest raises his arms and floods the room with blinding light; the annoyed Wizard casts a spreading darkness cloud that snuffs it out (smug Wizard, sulky Priest).

Priest position relative to Knight:
- Above: Zeal. No scene; the Knight's visit chance goes up 60% (`ODDS.zeal`). Their visits are plain hangouts.
- Right: Praying together. Both kneel, hands together, gold sparkles.
- Below: Holy water. The Priest shakes a flask and drops sprinkle onto the Knight, who glows and cheers.
- Left: 90% A short prayer (`PRAYERS`): the Priest speaks, the Knight listens with hands together, nodding. 10% (`ODDS.tentacle`) Eldritch tentacles: tentacles smash through the Priest's stained glass window, the Priest scurries to the far side, the Knight glares, runs over, stands between them and fights them off; the window is repaired.


Necromancer position relative to Knight:
- Left: Sleep spell. Cast from his own room: a lavender wave rolls right along his row and everyone in that row to his right falls asleep for `SLEEP_TIME` (60) seconds (closed eyes, floating Z's, gentle breathing). Asleep = no interactions, no idles, nobody visits them; any visit they were in ends. A potion dropped on a sleeper's room wakes them early (uses the potion, no normal potion effect). Waking up in someone else's room, they walk home.
- Above: Death Knight. The Knight visits the Necromancer's room, green power swirls, and he becomes a Death Knight (form `dknight`: a skeleton in dark armor with red eyes, saved). The Death Knight loses all normal interactions, idles and item effects, nobody interacts with him, and he only follows the Necromancer: he walks to the Necromancer's current room (any room, even far away) and stands on his free side. No Necromancer on the board: he just stands still.
- Right: Undead horde. Three skeletons rise one after another beside the Knight and he cuts each down. 5% of the time the Knight falls to the last one and dies (box back to the shelf); otherwise he cheers.
- Below: Old friends (`NECRO_TALK`): they trade stories of past adventures.

Necromancer position relative to Priest:
- Left / Right: no interaction at all (`none`): they never visit each other.
- Below: Purge. The Necromancer raises three ghosts (70%) or three zombies (30%), spread across the free floor; the Priest destroys them one by one with beams of holy light.
- Above: Holy vs unholy argument (`DEBATE`): they visit each other and argue, both getting angry (red eyes are fine for real anger), with gold and green power flaring.

Necromancer position relative to Wizard:
- Above: 50/50 between a Lightning duel (black lightning from the Necromancer, blue from the Wizard, two shots each, then friendly cheers) and Crafting a scroll. Crafting: if you have `SCROLL_COST` (20) coins they make a spell scroll (+1 scroll; the 20 coins are taken at the moment it is made, so an interrupted craft costs nothing). Not enough coins: 50% the Wizard shows off a frost spell (snow, ice sparkles), 50% the Necromancer shows off a dark energy orb. (The owner listed "above" twice; this 50/50 is the chosen reading.)
- Left: Clay golem. They summon a big clay golem that charges into the back wall and smashes through it, escaping; the hole is repaired over a few seconds.
- Right: Reading tomes together (Wizard's purple spellbook, Necromancer's black book).
- Below: Room swap. Both cast from their own rooms, a purple flash, and their boxes trade places on the board.
## Idle activities
- Wizard: read a book 60% (holds it up open toward himself; we see the covers and pages turning), practice magic (swirling blue, arm waving) 38%, summon a demon 2% (arms raised; the demon rises, grabs him and drags him down through the floor; he dies).
- Knight: weapon practice 75%, fight an orc 20% (falls back to practice if no free neighbor), feed a horse 5% (needs open space to his right, meaning no box in the next cell, in any column or at the board edge; otherwise falls back to practice).
  - Practice: he first walks to the middle of his room, then practices. His right arm is drawn separately and swings with the weapon (`pracAnim`): sword and glaive wind up overhead and strike down, spear thrusts, shield bashes; his body leans into it.
  - Orc: the orc appears first on the far side of the neighbor's room, the Knight glares, then walks over and stands between the orc and his host to fight.
  - Horse: a horse's head and neck lean in from the right edge of his room; he walks over and holds out hay, the horse eats it, he hops happily, the horse leaves.
- Eldritch Knight only: 1% extra chance (`eknightCat`) that a small black cat walks across the back of the Wizard's room (needs a Wizard on the board).
- Priest (`ODDS.priest`): kneel and pray 50% (soft golden light across the ceiling); bless a farmer 35% (a farmer comes out of the back door, the Priest says a prayer and sprinkles holy water, the farmer cheers and leaves); tithe prayer 10% (+5 coins, shown as a floating "+5"); exorcism 5% (a possessed farmer with red eyes comes in, shakes as the Priest prays with golden power, a demon rises out of him and fades, the farmer is saved and leaves).
- Necromancer (`ODDS.necromancer`): commune with spirits 50% (blue wisps swirl around the room); candles and chalk circle 25% (draws a chalk circle and pentagram around himself, then five candles light one by one); red lightning 24% (reads a black book with red runes while red lightning crackles around him); raise a skeleton 1% (green power; a skeleton rises beside a random free character in their own room; a Fighter or Mage fights it off and lives, anyone else dies). Falls back to spirits if nobody is free.
- Visiting non-box characters (farmer, ghost) are drawn from `CH` but are not on the board or shelf.
- Arm poses (`POSE` in data.js): none, hold, noR (right arm drawn by the weapon swing), fwd, up, both, pray (hands together, drawn in front of the body), flex, flex2. `poseOf` in art.js picks one from the activity.

## Compendium tab
Shows every interaction from the start (for development tracking), with no descriptive text: arrangement diagrams and looping animations of each idle activity and item effect. Each tile shows its % chance in the top right corner, computed from `ODDS` (one decimal for small values), or a short label:
- Arrangements: chance per idle check that a character starts that interaction. Wizard & Knight: visit x not sparring x not a hangout (33% Old Friends, 15% the others), Friendly Sparring 0.4%. Priest pairs: visit x not a hangout (15%); Priest left of Knight splits into prayer 14% / tentacles 1.5%; Zeal shows "+60%".
- Idle activities: how the activity is picked (Wizard 60/38/2, Knight 75/20/5, black cat 1%, Priest 50/35/10/5, Necromancer 50/25/24/1).
- Necromancer pairs: 15% each per idle check, except above the Wizard where the duel and crafting are 7.5% each. Necromancer left/right of the Priest is listed as no interaction.
- Items: labelled "scroll" or "potion" (one tile per character effect). The hidden black Wizard is not shown.
Whenever an interaction, idle activity or item effect is added or changed, update the Compendium to match.


## Reset, unlocks, variants and easter eggs
- Reset game button (under the item tray): tap once to arm it ("Tap again to reset", red), tap again within 4 seconds to confirm. No browser pop-up (some browsers and phone apps block them). Saving is switched off during the reset so nothing writes the old game back. It wipes the save and starts fresh: default board (Knight + Wizard), 0 coins, no items, nothing unlocked, Compendium record cleared.
- Fruit Merchant (class Merchant, coin tag): unlocked by holding `MERCHANT_COINS` (30) coins at once (`checkUnlocks`, saved in `S.un.merchant`, lasts until reset). Room: striped awning and fruit crates, back-wall door. No idles or special interactions yet (wanders and hangs out).
- Knight armor: steel normally, bronze 1% of the time when placed (easter egg, `ODDS.bronze`, stored in the unit's color: 'steel'/'bronze').
- Priest: 50% male (short hair) / 50% female (long hair) when placed (color 'm'/'f').
- Easter egg: while the Necromancer's box is on the bottom row, skulls and bones litter his floor.
- Easter egg: Artifact on the Priest while the Necromancer is his neighbor: he raises it, a beam of light destroys the Necromancer, and the Necromancer box is removed from the shelf too (`S.un.necromancer` false); it must be unlocked again the normal way (a Priest dying). Otherwise the artifact does nothing (kept).
- Priest and Necromancer neighbors (any side, even left/right) while a Death Knight is on the board: any visit roll between them becomes the Priest visiting the Necromancer to cleanse the Death Knight with holy light; he becomes a normal Knight again (keeps his armor color) and walks home.
- Wizard idle: 1% (`ODDS.wizBrew`) if a Merchant is his neighbor and you have `BREW_COST` (5) coins: he brews a potion in a little cauldron (-5 coins, +1 potion).
- Wizard + Necromancer, any side: 1% (`ODDS.forge`) of their visits they make a spell scroll (50%) or a potion (50%) together, free.
- Priest above the Knight: 2% (`ODDS.crusade`) of their visit rolls they go on a holy crusade: the Knight joins the Priest, "To the crusade!", both fade away and are off the board for `CRUSADE_TIME` (120) seconds (labels dimmed, nobody can interact with them). They come back home with 10 coins (70%) or an artifact (30%), with a message. Moving their boxes brings them back early with nothing.
- Artifacts are a new item (inventory `S.inv.artifact`); for now only the Priest easter egg uses them.
- Compendium: tiles get a thin gold border once that interaction/idle/item effect has happened (`markSeen`, saved in `S.seen`). Hidden easter eggs (black Wizard, bronze Knight, skulls) are not shown.

## Merchants, shops and Compendium rewards
- No Clear board button any more (only Reset game).
- Knight shield training: a squire comes in through the back door and spars with a wooden sword while the Knight blocks with his shield held close to his body (each hit pushes him back a little). Shield practice lasts longer (7 s). The squire leaves the same way.
- Fruit Merchant idles (`ODDS.merchant`): calls out adverts 70% (`MERCH_ADS`); sells apples to a neighbor 29% (+`SELL_GAIN` 2 coins; no free neighbor = advert); a mob of farmers 1% (they storm in from the side away from him, pelt him with apples and oranges, then leave).
- Priest left of the Fruit Merchant (= Merchant right of the Priest, the same arrangement): 50/50 (`ODDS.feast`) between:
  - Apple: the Merchant drops an apple; 95% the Priest buys it (+`APPLE_GAIN` 1 coin), 5% (`ODDS.slip`) he slips on it and dies.
  - Feast: the Merchant sets up a table of food at the front of the room, two nobles come in through the back door, everyone eats and cheers, then the nobles leave.
- Apothecary (class Merchant): unlocked when any Merchant box sits next to any Mage (`checkUnlocks`, on place/move). Tap its room to buy a potion for `APOTH_COST` (30) coins. No idles yet.
- Writing desk: while the Wizard has a Merchant neighbor AND another Mage neighbor, a desk appears in his room. Tap his room (while he's home and free) to write a spell scroll for `DESK_COST` (50) coins, or `DESK_COST_BLACK` (30) for the black-robed Wizard.
- Crowds: extra people in a scene (squire, nobles, farmer mob) live in `u.crowd` and are stepped and drawn with the characters.
- Compendium tiles that give you something show small item icons in the bottom-left (`GAINS`). (The old per-section reward was replaced, see below.)

## Shops, more Fruit Merchant, great prayer
- Hangout share is now 15% (`ODDS.hangout`), so arrangement scenes play more often (about 17% per idle check for a normal pair).
- Buying with coins always goes through the in-page popup (`ask`, the `#modal` box with Buy / Cancel; not the browser pop-up). Rooms you can tap to buy from get a thin silver border: the Apothecary always, the Wizard while his desk is showing.
- Placing the Apothecary box costs `APOTH_PLACE_COST` (20) coins (asks first; not enough coins = a message, no box).
- Apothecary room: herbs growing in planters, potions on display shelves and a counter; its back door is on the LEFT (`EXIT.backdoorL`, `BACKDOOR_L`).
- Great prayer: when a Priest with all four neighbors free decides what to do, 5% (`ODDS.massPrayer`) he calls them in. They walk to spots in his room (`GATHER_SPOTS`), wait until all have arrived (12 s max), then everyone kneels for `MASS_PRAYER_TIME` (20) seconds under a soft holy glow, then all go home.
- Fruit Merchant + Priest (in addition to the apple/feast arrangement):
  - Merchant above the Priest: 50% (`ODDS.fruitfall`) he throws fruit down from his room; the Priest gets angry and shouts, the Merchant laughs. 50% he sells the Priest a starfruit (+`STARFRUIT_GAIN` 5 coins).
  - Merchant below the Priest: the Priest curses him from his room; all his fruit rots for `ROT_TIME` (60) seconds (brown fruit, flies). While rotten, nothing the Merchant does earns coins (`merchantGain`: sales, apple, starfruit, durian, the advertising boost).
- Fruit Merchant + Wizard (Merchant relative to the Wizard):
  - Above: the Wizard magics a banana until it is giant.
  - Below: the Merchant sells him a durian (+`DURIAN_GAIN` 10 coins); the Wizard is horrified by the smell.
  - Right: 99.5% they tell a joke and laugh (`JOKES`); 0.5% (`ODDS.murder`) the Merchant kills the Wizard (a quick red flash, no gore).
  - Left: the Wizard helps advertise; for `BOOST_TIME` (60) seconds the coin timer gives 2 coins every 30 seconds instead of 1 (`boostT`).
- Spell scroll on the Fruit Merchant: he becomes a monkey (`form` 'monkey') for `MONKEY_TIME` (120) seconds: no interactions or idles, nobody visits him, he hops around his room and eats bananas. (Not saved: a reload ends it.)
- Potion on the Fruit Merchant: everything he says comes out backwards until another potion is used on him (saved).
- Bug fix: Wizard idle activities now mark the Compendium (they started without `beginAct`).

## Apothecary, Farmer, Compendium tabs
- Apothecary is a woman (long auburn hair). Idles (`ODDS.apothecary`): trips 5%, trips and smashes a potion 5%, brews potions 50% (just for show, no item), waters and picks herbs 40% (walks to her planters with a watering can).
- Spell scroll on the Apothecary: +1 potion. Potion on the Apothecary: +`AP_POTION_COINS` (10) coins.
- Apothecary left of the Fruit Merchant: she gives him a potion; its usual effect on him applies (backwards speech toggles).
- Fruit Merchant left of the Apothecary: 97% they trade wares (apples for potions); 3% (`ODDS.farm`) they hire a Farmer:
  - A temporary Farmer box (class Merchant, not on the shelf, not saved) appears on the nearest empty cell for `FARM_TIME` (180) seconds. His room is open sky, a fence and a field of wheat (80%) or apple trees (20%) that grows over the 3 minutes. Then he harvests (+`FARM_GAIN` 30 coins, message) and the box disappears.
- All special interaction scenes play at `SCENE_PACE` (0.65) speed, so they last a few seconds longer (walking and idles are unchanged).
- Moving or removing a box sends home anyone with a doorway, stairs or portal open in those rooms (`clearRooms`), and `toHome` drops every exit a character had open, so nothing is left behind.
- `pairKind` now checks both directions of the pair table, so pairs listed in both directions (Apothecary/Merchant) work.
- Compendium is tabbed by character (`COMP_TABS`): Knight, Wizard, Priest, Necromancer, Fruit Merchant, Apothecary. Each tab lists every interaction involving that character (shared scenes appear in both tabs) in three groups: With neighbors, Idle activities, Items, shops and secrets. Each tab and group shows found / total.
- Easter eggs (`EGGS`: black Wizard, bronze Knight, bottom-row skulls, artifact on the Priest) are hidden until found (then shown with a purple dashed outline) but always count in the totals. They're marked automatically (`checkEggs`).
- Rewards: every `DISCOVER_EVERY` (5) different things discovered, anywhere, pays `DISCOVER_REWARD` (10) coins (`S.rewarded`, saved). This replaces the old per-section reward.
## Art style
Pixel art, 16x22 character grid drawn from rectangles with an automatic dark outline. Each room has plain walls and floor, one background element representing its class, and its up/down exit (Knight/Priest/Necromancer: back-wall door; Wizard: second bookshelf). Fantasy medieval theme.

## Planned
Achievements and unlockables, more character classes, customizable dialogue, more interactions, real pixel art assets.

## Working style
- Make small changes and test each one. Explain changes in plain language; the owner is a beginner.
- Use git; commit after each working change. Commit as Forests999 with the GitHub noreply email (already set in this repo's git config); never use the owner's real name or email.
- Ask before pushing, since pushing publishes to the public site.
- Before every push, raise the release number `?v=` in `index.html` (on style.css, data.js, art.js and game.js, all four the same, e.g. 10 -> 11) so browsers and phones load the new files instead of old cached ones.
