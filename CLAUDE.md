# Squaredom (repo and folder: Cubedom)

Squaredom (title shows "v1.0", `.ver` in index.html) is a web-based, fantasy-medieval sandbox inspired by the 2000s toy "Cube World". Each character lives in a pixel-art room (a "box"). The player drags boxes onto a 5x4 board. Characters idle inside their box and sometimes visit neighboring boxes. The arrangement of boxes changes what happens.

Live site: https://forests999.github.io/Cubedom/ (GitHub Pages from `main`; pushing to `main` updates it).

## Working style
- Make small changes and test each one. Explain changes in plain language; the owner is a beginner.
- Keep this file up to date as one current reference (not a change log): when something changes, edit the section it belongs in.
- Use git; commit after each working change. Commit as Forests999 with the GitHub noreply email (already set in this repo's git config); never use the owner's real name or email.
- Ask before pushing, since pushing publishes to the public site. Before every push, raise the release number `?v=` in `index.html` (on style.css, data.js, art.js, game.js and audio.js, all five the same) so browsers and phones load the new files.
- Many functions are written on one line: never put a `//` comment in the middle of such a line (it hides the rest of the line). Put comments on their own line or at the very end of a line.
- Testing in the browser pane: the page can be throttled to about one frame every few seconds. Drive the game clock directly instead of waiting (call `step(1/30)` in a loop, advancing `T`), and back up / restore the owner's save (`localStorage` key `cubehold-v4`) around tests.
- Adding or changing an interaction, idle or item effect: add it to `COMP_TABS` (and `PAIR_WITH` for neighbor scenes), write its `NAMES` and `DESC` text, give it a tile (`T` in `buildRef`, drawn by `idleTile` or `pairDiagram` + `PD`), and make sure the game calls `markSeen` for it.

## Tech and constraints
- Plain HTML + CSS + JavaScript with Canvas. No build tools, no frameworks. It must open by double-clicking `index.html`.
- Works on desktop and mobile (touch drag, responsive layout, web app manifest `manifest.webmanifest` + `icon.svg`).
- Pixel art stays crisp: `image-rendering: pixelated` and `imageSmoothingEnabled = false`.
- Names, tags and speech bubbles are HTML over the canvas so they stay sharp. Each name label shrinks its font to fit its square (`fitLabel`). Speech bubbles are one per character (`say`, `.bub`, `bubs`), so several conversations can show at once; a creature can talk too (`talker`).
- Fonts: Tiny5 for the board page (easy-to-read numbers), Pixelify Sans for the "Cubedom" title, a plain system font for the Compendium page and its description bubbles. Canvas text uses `GAME_FONT`.
- Progress saves in `localStorage` (key `cubehold-v4`, kept from the old name so saves survive).
- Game rules and data (characters, interactions, odds) stay separate from drawing code. All odds live in `ODDS`; the game and the Compendium both read them, so change odds only there.

## Files
Plain scripts, no modules, loaded in this order and sharing global variables (the order matters):
- `index.html`: page layout only: item tray `#items` (above the board), board, character shelf `#tray`, Music / Sounds / Reset buttons, `#toast` message, `#modal` purchase popup.
- `style.css`: all styling.
- `data.js`: everything that is data. Characters and sprite pixels (`CH`, poses `POSE`, skin tones `SKINS`), classes and tags (`CLASS`, `EXTRA_CLASS`, `TAG_ICON`, `TAG_NAMES`, `TAG_NOTES`), shelf (`SHELF_CHARS`, `ALL_CHARS`), items (`ITEMS`), room exits (`TR`, `EXIT`), `WEAPONS`, neighbor scenes (`PAIRS`, `ROGUE_SCENES`), `ODDS`, timers and prices (constants such as `SLEEP_TIME`, `APOTH_COST`, `INGOT_COST`), all dialogue arrays, board spaces (`START_CELLS`, `CELL_PRICE`), Compendium data (`NAMES`, `DESC`, `COMP_TABS`, `PAIR_WITH`, `EGGS`), the Monarch's colors and requests (`MPAL`, `REQ_ASK`, `REQ_YES`, `REQ_NO`), helpers (`$`, `pick`, `cl`, `GAME_FONT`, `isFarm`).
- `art.js`: room walls and backgrounds (`WALL`, `bg`; textures, light and doors: `ROOM_STYLE`, `DOOR_STYLE`, `backDoor`, `ROOM_EXTRA`, `paintRoom`; each room is painted once into `ROOMC` and reused by `box`) and every drawing function: sprites (`spr`, `sid`, walking `stepLegs`, blinking `blinkMood`), arm poses per activity (`poseOf`), activity overlays (`drawAct`), weapon swings (`pracAnim`, `weaponOf`), exits (`drawFx`), room details (`drawRoomLife`), item icons (`drawItem`), creatures (`drawMob`, bats, bees, deer, birds, the Druid's bear), effects (rain, glitter, ritual darkness, sparks...), box borders (`box`, `boxFrame`), locked spaces (`drawLocked`), shop coin (`drawShopCoin`).
- `audio.js` (loaded last): sound made with Web Audio, no sound files. Layered chiptune music: one shared tempo and chord loop (`BPM`, `CHORDS`), and every room on the board adds its own part (`LAYERS`: Knight drums, Wizard arpeggio, Priest pad, Necromancer drone, Fruit Merchant bass, Apothecary flute, Alchemist blips, Rogue hi-hats, Druid harp, Blacksmith anvil, Monarch fanfare, Traveling Merchant accordion, Farmer whistle, Well drips, Tavern jig), fading in and out as boxes come and go (`schedule`). Sound effects (`sfx`): soft footsteps (`stepSounds`), a creak when a door opens and a thud when it closes (game.js `step` watches `DOORISH` exits). Music and Sounds buttons under the shelf, saved in `localStorage` 'sq-audio'. Sound starts after the first tap or click (browser rule).
- `game.js`: rules and everything that happens: decisions (`decide`, `startAct`, `acting`), movement (`route`, `run`), neighbor scenes (`talk`), items (`useItem`, `ITEM_FX`, `ITEM_KEY`), shops, the render loop, input, the shelf (`buildShelf`), the Compendium (`buildRef`), saving/loading.

## Board, boxes and saving
- Board: 5 columns x 4 rows, 96px cells. Neighbors are the 4 edge-sharing cells (no diagonals).
- Borders: each box draws a thin 2px frame (`box`); `boxFrame` adds 2px only on sides with no box next to it, so every border is 4px.
- Locked spaces: only the middle 3x3 (rows 1-3, columns 2-4) is open at the start (`START_CELLS`). Locked spaces are dark with a padlock and price; tap one to buy it (asks first): 10 coins, each next one 5 more (`CELL_PRICE`, `CELL_STEP`, `cellPrice`, `buyCell`). Nothing can be put on a locked space. Saved in `S.cells`, `S.bought`. Old saves keep spaces that already had boxes open for free.
- Shelf (under the board): every character in `ALL_CHARS` order, heading "X/Y unlocked". Locked ones are a blank box with a cryptic clue and no name (`SHELF_CLUE`, `.it.locked`). Unlocked ones always show, dimmed while unavailable (on the board, or the Traveling Merchant on the road; `ui`). Drag a box onto the board (or tap it to use the first free space), onto another box to swap. Dragging a box back onto the shelf costs 10 coins (`REMOVE_COST`, `sendToShelf`, asks first); a Farmer can never go on the shelf. Placing costs coins for the Apothecary (20) and for every Monarch after the first of the game (150, `MONARCH_COST`, counted in `S.monarchs`); both ask first.
- Moving a box sends its character home. Removing a box makes the character vanish. Visitors of a moved/removed room go home, and anyone with an exit open in it too (`clearRooms`).
- Death: the box is removed and goes back to the shelf. Exceptions: the Necromancer destroyed by an artifact (removed from the shelf), the Alchemist who drinks the elixir (locked again), the Druid (buried in place, see Druid), and the Monarch (lies in state for the grand funeral first, see Gatherings). A box back on the shelf starts fresh (e.g. may ask the Monarch again).
- Reset game (under the shelf): tap once to arm, again within 4 s. Wipes the save: default board (Knight + Wizard), 0 coins, nothing unlocked, Compendium cleared.
- Saved per box: row, col, weapon, form, color (outfit / gender variant), backwards speech, skin tone, Rogue's Mage tag, buried Druid, reinforced (ingot), Paladin, green mage armor, the Druid's animal, Archdruid, the Monarch's generous / greedy; and at index [15] an object of newer things by name (`EXTRA_KEYS`, `extras`): royal colors `pal`, request made `asked`, `grudge`, "Sir" `sir`, the Monarch's gifts (`helper`, `staff`, `barrel`, `sacks`, `pine`, `minions`), the Traveling Merchant's time left `travelT`. Also saved: unlocks `S.un`, `coins`, coins spent `S.spent`, items `S.inv`, Compendium `S.seen`, rewards paid `S.rewarded`, bought spaces, revealed secrets `S.revealed`, the golden spaces `S.goldCells` (an old single `goldCell` is converted), characters ever unlocked `S.ever`, Compendium tabs completed `S.tabDone`, item rewards paid `S.bigRewarded`, Monarchs placed `S.monarchs`, Traveling Merchant on the road `S.travelRoam`.
- Not saved: monkey, bear and beast-man forms, the Rogue's disguise and tiny size, sickness, the Necromancer's skeleton follower from the betrayal, anyone away (crusade, date, dungeon, adventure, time off), golden apples, the Alchemist's luck, the Druid's weather, Farmers, the grand funeral (a Monarch saved while lying in state is back on the shelf).

## Characters
| Character | Tags | Look and room | How you get it |
|---|---|---|---|
| Knight | Fighter | Steel armor (1% bronze, secret). Room: armor stand, his wall weapon (shield, spear, glaive, longsword or battle axe), back-wall door. Can become a Paladin (secret): shiny armor, golden flame, glowing golden sword, label "Paladin", otherwise a normal Knight (`u.paladin`). | On the shelf |
| Wizard | Mage | Blue / purple / red robes (black with red trim and a red orb = secret). Can wear green metal mage armor from the Blacksmith (`u.armor`, sprites `wizard_<color>_arm`). Room: bookshelves; the second slides aside to a dark opening. | On the shelf |
| Priest | Mage | White robes, gold cross, 50% man / 50% woman. Room: stained glass window, candle, back-wall door. | On the shelf |
| Necromancer | Mage | Dark green hood, pale skin, skull staff. Room: skull shelves, green candles, back-wall door. | 25% whenever a Priest dies (`ODDS.necro`) |
| Fruit Merchant | Merchant | Apron, red cap. Room: striped awning, fruit crates, back-wall door. | Hold 30 coins at once (`MERCHANT_COINS`) |
| Apothecary | Merchant | A woman with long auburn hair, green robe. Room: window with sky, herb planters, potion shelves, back door on the LEFT. Placing her costs 20 coins (asks first). Shop: potions. | Any Merchant next to any Mage |
| Alchemist | Merchant, + Mage while any Mage-tagged neighbor | 50% man (beard) / 50% woman; blue shirt, leather apron, goggles. On the bottom-right space: wild white hair (mad scientist, secret). Room: back door on the LEFT, potion shelves, a table with a bubbling flask. | Wizard right of the Apothecary brewing together, 20% (`ODDS.alchemist`) |
| Rogue | Fighter | Outfit picked when placed (`ODDS.rogueOutfit`, saved in `color`): ninja 40%, bandit 40%, well-dressed con man 20% (doublet, feathered cap, ruff, gold chain). Room: peg rail (mask, cloak, cap), target with ninja stars, locked chest; no back door: a rope from a ceiling hatch (up) and a floor trapdoor (down). | 50 Compendium discoveries (`ROGUE_UNLOCK`) |
| Druid | Mage | Bearded man in green with a leaf crown and a twisted wooden staff. An animal follows him, picked when placed (`u.fam`, `ODDS.familiar`, 1/3 each): a big grizzly bear, a wolf, or an eagle circling above him. Archdruid after an artifact (`u.arch`, sprite `druid_arch`, label "Archdruid"): glowing living staff, golden leaf crown. Room: a forest that depends on his row (`DRUID_WALL`, `bg` with the row): top dark woods with deep shadows, 2nd normal, 3rd autumn colors and brownish-green grass, bottom giant mushrooms. | Every board space bought |
| Monarch | none, ever (an ingot does nothing) | King (50%) or Queen (50%, saved in `color`), ermine collar, crown with a ruby. Royal colors picked when placed (`u.pal`, `MPAL`, sprites like `monarch_f_blue`): red and gold, emerald and cream, blue and silver, black and dark red; the banners, cushion and carpet match. Generous or greedy, 50/50 (`u.trait`): decides requests (see The Monarch); a greedy one never visits. Room: throne on a dais, banners and carpet, a fancy back door (exit `royaldoor`), fancy side doors (`f.fancy`), a jester juggling (`drawJester`). First one free, then 150 coins each. | 10 boxes on the board at once (`MONARCH_UNLOCK`, Farmers don't count) |
| Traveling Merchant | Merchant | 50% man / 50% woman (`color`), wide hat with a red band, cloak, scarf. Room (`bg('traveler')`): meadow and dirt road, a tree, flowers, a covered wagon with a mule (tail swishes), a stand covered in striped cloth with wares; no doors (walks over the edge, fades up/down). Stays 5 min (`TRAVEL_TIME`, `u.travelT`), then leaves for the road (`travelerLeave`, `S.travelRoam`: not on the shelf); while on the road he turns up on a random free space now and then (`ODDS.travelArrive` per second, about every 10 min, `stepTraveler`) for another 5 min. Dies: back to the shelf. No scenes, never visits, nobody visits him. Shop: artifacts. | 4 Merchant-tagged characters in a 2x2 square |
| Blacksmith | Merchant + Fighter (`EXTRA_CLASS`) | 70% man / 30% woman, black apron, soot. Room: furnace with a flickering fire, tool rack, anvil and hammer, back-wall door. Shop: ingots. | Spend 100 coins in total (`S.spent`, counted by `spend()`; the Rogue's theft doesn't count) |
| Farmer | Merchant | Straw hat. Room: sky, fence, a growing field, no doors. Temporary (not on the shelf, can't be sent there, not saved). Up to 3 at once: boxes `farmer`, `farmer2`, `farmer3` (check with `isFarm(id)`; `box` draws them all as `farmer`). | Fruit Merchant left of the Apothecary, 1.5% (or a healed farmer, 2%), or the Druid's granted request (up to 3, `spawnFarm(near, n)`) |

- **Tags:** Fighter, Mage, Merchant, Monstrous, Structure (icons `TAG_ICON`; Structure is a little stack of bricks). Always check with `hasClass(u, tag)` (always false for the Monarch). It counts the Alchemist's Monstrous tag on the bottom-right space (`madSci`), `CLASS`, `EXTRA_CLASS` (Blacksmith's Fighter tag), an ingot's Fighter tag (`u.reinforced`), the Rogue's Mage tag (`u.mageTag`) and the Alchemist's Mage tag while a Mage-tagged character is next to him. The Druid's Decay weather hides the last three on its space. Labels redraw when tags change (`refreshTags`).
- **Skin tones:** new Knights, Fruit Merchants, Priests, Rogues, Druids, Blacksmiths, Monarchs and Traveling Merchants get one of 3 tones (`SKINS`, `SKIN_CHARS`; sprite copies like `priest_f~2`, chosen by `sid`).
- **Forms:** Eldritch Knight (permanent), Death Knight (until cleansed; only follows the Necromancer), Monkey (Fruit Merchant, 2 min), Grizzly Bear (Knight, 30 s), Beast-man (mad-scientist Alchemist, during his attack). Death Knights and the temporary forms (`TEMP_FORM`) take part in nothing and nobody visits them.
- **Conditions:** Sick (poisoned wine, 60 s, `u.sickT`): no neighbor scenes either way, green bubbles, 5% dies when it wears off. Tiny (Rogue, 2 min): 60% size, 70% faster. Skeleton follower: trots after the Necromancer once he has sacrificed the Rogue (`u.pet`); three more from the Monarch's prisoners (`u.minions`, `u.mins`). Grudge (`u.grudge`): the Monarch refused a request (see Secrets). Buried Druid: see Druid.
- **Rogue disguise:** for 2 minutes he looks like, is named as and acts as another character (`u.as`, read through `idOf(u)`): their scenes, idles and discoveries. His own box stays his.
- **Visitors who are not boxes:** commoner customer, thief, imp, demon, bats, bees, carnivorous plant, farmers (sick, possessed, mob), ghost, squire, nobles, orc, skeletons, zombies, golem, fairies, deer, birds, horse, cat, werewolf, prisoners, jester (room decoration), the Blacksmith's apprentice (`u.helper`, `u.appr`, wanders the forge for good).

## How characters decide
- Each idle character rolls about every 5-10 seconds (`decide`): 50% an idle activity, 20% a visit, 30% wander in the room (`DECIDE`). A visit is just hanging out 20% of the time (`HANGOUT`); otherwise one scene is rolled from that visit's list (`visitRoll`, `visitList`, `playScene`).
- **Rarity tiers** (data.js, `RARITY`; never shown to the player): every list of possible events has uncommon 15%, rare 5% and legendary 0.75% entries with fixed chances; the common entries share whatever is left equally (`listChances`, `rollList`). Keep the non-common entries of one list under about 50%. The same tiers are used for outcome chances inside scenes (deaths, special results: `ODDS.slip`, `horde`, `boomDeath`, ... set from `RARITY`). Plain splits are left as they are (date success, blood orange 30%, crusade reward 70/30, dungeon loot, werewolf 30%, looks like outfits and King/Queen).
- **Idle lists** (`IDLES` per character, `IDLE_ANY` for everyone): `[key, tier, condition]`; an entry with a condition (`idleOk`) only joins while it holds (`idleList`, `startAct`, `doIdle`). **Visit lists**: the arrangement's scene from `PAIRS`, or several (`VISIT_EXPAND`), plus any-side scenes (`VISIT_ANY`; `fallback` = only when the pair has no common scene) and the visitor's group scenes (`VISIT_GROUP`: great prayer, four Mages, adventure). The Druid's weather uses `WEATHER_TIERS`.
- Modifiers: the Alchemist's luck makes rare and legendary visit scenes 30% more likely; Blizzard makes the rarest idle tier 30% more likely; Sandstorm makes `DEADLY` events (and death outcomes, `doom`) three times as likely.
- Visit chance changes: Knight or Wizard in Old Friends 45%; Knight with a Priest above x1.6 (Zeal); a Mage next to the Alchemist x1.2; in the Druid's Blizzard x0.7 (taken from wandering).
- The Druid never visits: his visit roll casts weather instead (see Druid), except once to make his request when the Monarch is his neighbor. Others can still visit him.
- A greedy Monarch never visits. The Traveling Merchant never visits and nobody visits him (`nbrs` leaves him out).
- A visit to the Monarch by someone with a request they haven't made yet (`reqOf`, `u.asked`) is always that request.
- Which neighbor: random among free ones (`nbrs`, `freeU`; never one in the Druid's Infest), except a Fighter next to the Alchemist picks Mages 50% more often (haste potions, `pickW`).
- Some scenes always have the same visitor (noted below). The per-scene percentages written in the sections below are older notes on the arrangement; the tiers in `IDLES` / `VISIT_EXPAND` / `VISIT_ANY` / `VISIT_GROUP` are what counts (the Compendium shows the resulting %).
- Scenes play at `SCENE_PACE` (0.65) so they last a little longer. Asleep, away, sick (for visits), Death Knights, temporary forms and the buried Druid don't roll normally.

## Neighbor scenes
"X left of Y" = X's box directly left of Y's. "Cast" = it happens from X's own room. Pairs not listed only have hangouts (e.g. anyone and the Farmer). The rarest chances get +30% near the Alchemist's luck potion (`luck`).

### Knight & Wizard (Wizard relative to Knight)
- Left: **Old Friends** (hearts; they visit each other more). Right: **Eldritch Awakening** (Knight visits, reads the spellbook, becomes the Eldritch Knight). Above: **Thunderstruck** (cast; the Knight dies). Below: **Tales of Old** (`TALK`).
- Any side, 2%: **Friendly Sparring.**

### Priest & Wizard (Priest relative to Wizard)
- Left: **Gossip** (`GOSSIP`). Right: **Reading together.** Above: **Holy light vs darkness.** Below: **Accidental undead** (a skeleton; they destroy it).

### Priest & Knight (Priest relative to Knight)
- Left: **A short prayer** (`PRAYERS`), 10% **Eldritch tentacles** instead (the Knight fights them off). Right: **Praying together.** Below: **Holy water.**
- Above: **Zeal** (no scene, +60% Knight visits); 2% **Holy crusade**: away 2 min, back with 10 coins (70%) or an artifact.
- Priest + any Fighter, any side, 5%: **"You're braver than I."**

### Necromancer & Knight (Necromancer relative to Knight)
- Left: **Sleep spell** (cast; everyone to his right in the row sleeps 60 s; a potion wakes a sleeper). Right: **Undead horde** (5% the Knight dies). Above: **Death Knight.** Below: **Old stories** (`NECRO_TALK`).

### Necromancer & Priest (Necromancer relative to Priest)
- Left or right: they never visit each other. Above: **Holy vs unholy argument** (`DEBATE`). Below: **Purge** (ghosts or zombies, holy light).
- Any side while a Death Knight exists: **Cleansing** (the Death Knight becomes a Knight again).

### Necromancer & Wizard (Necromancer relative to Wizard)
- Left: **Clay golem** (bursts through the back wall). Right: **Reading tomes.** Below: **Room swap** (cast).
- Above: 50/50 **Lightning duel** (they dislike each other: angry faces, insults) or **Crafting a scroll** (20 coins, paid when made; if too poor, one shows off a spell).
- Any side, 1%: **Making an item together** (free scroll or potion).

### Fruit Merchant & Priest (Priest relative to Merchant)
- Priest left: 50/50 **Apple** (+1 coin; 5% the Priest slips and dies) or **Feast** (nobles join).
- Priest below (Merchant above): 50/50 **Fruit thrown down** (cast) or **Starfruit** (+5).
- Priest above (Merchant below): **Cursed fruit** (cast; rots 60 s, no Merchant coins meanwhile).

### Fruit Merchant & Wizard (Merchant relative to Wizard)
- Left: **Wizard advertises**: the only coin gain over time: 1 coin every 30 s for 60 s, a second advert raises it to 2 (`BOOST_MAX`) and restarts the minute.
- Right: **Jokes** (`JOKES`); 0.5% **A dark turn** (the Wizard dies). Above: **A giant banana.** Below: **Durian** (+10).

### Apothecary & Fruit Merchant
- Apothecary left of Merchant: **A gift** (a potion: backwards speech). Merchant left of Apothecary: **Trading wares**; 1.5% **A farm appears** (temporary Farmer box: wheat or apples for 3 minutes, then +30 coins, halved next to the Necromancer).
- Apothecary above Merchant: **Golden apples** (60 s, looks only). Below: **Talking business** (slow or booming, 50/50).

### Knight & Fruit Merchant
- Knight right of Merchant: **A thief!** (Knight visits). Knight left: **Out of lemons** (Knight visits). Merchant above Knight: **Green apples** (+2). Merchant below: **Rumors** of goblins (90%) or a dragon.

### Knight & Apothecary (Knight relative to Apothecary)
- Above: **Grizzly bear** (30 s). Below: **Gossip about a Mage** (`KGOSSIP`). Right: **A date** (away 1 min; goes well 80%; only his own words say how it went). Left: **Bee swarm!** (both flee until the bees leave).

### Wizard & Apothecary (Wizard relative to Apothecary)
- Right: **Brewing together** (20%: unlocks the Alchemist, afterwards a free potion). Left: **Brewing gone wrong** (2% both die). Below: **A date** (30 s, goes well 40%). Above: 40% **Imp blood** or 60% **A purple potion**.

### Necromancer & Apothecary (Necromancer relative to Apothecary)
- Above: **Bats** (cast). Left or right: **Undead ingredients** (with the Alchemist next to her, 20% +1 potion). Below: **Dark ritual** (15 s, the room goes dark).

### Priest & Apothecary (Priest relative to Apothecary)
- Left: **Carnivorous plant.** Right: **Studying alchemy** (5% reveals a hidden secret, `revealSecret`). Above: **Sleeping potion** (sleeps 30 s). Below: **Healing a sick farmer** (2% he starts a farm).

### Necromancer & Fruit Merchant (Necromancer relative to Merchant)
- Above: **Blood from above** (cast; then the Merchant goes up and yells, `NYELL`). Below: **Loud chanting** (cast; scares off a customer). Right: **A blood orange** (Necromancer visits; 30% +3 coins). Left: **Rotten fruit and worms** (cast, 60 s).

### Alchemist, by tag (groups "with a Mage / a Merchant / a Fighter" in the Compendium, `tag:mage` etc. in `PAIR_WITH`)
- Any Mage: **Is magic useful?** (`MAGICTALK`). Passive: Mages next to him visit 20% more.
- Any Merchant (Fruit Merchant, Apothecary): a 10% idle for them, **Alchemy sale** (+5 coins, `PROMO`).
- Any Fighter: **Haste potions** (passive, see How characters decide).

### Rogue & each character (`PAIRS['rogue>X']`; the Rogue always visits)
- Apothecary: right **Nefarious potions** (+5); left **Poisons** (+5); below **Poisoned wine** (+5; back home he gives it to another free neighbor, who is sick for 60 s); above **A clumsy burglary**.
- Fruit Merchant, any side: **Pinching fruit** (the Merchant looks away, `lookAway`).
- Priest: below **A lecture**; above **Vandalism** (paint, then he scrubs it off); right **Confession**; left **A demon's whisper** (5% he kills the Priest).
- Knight: above **Dungeon crawl** (away 3 min, `DUNGEON_TIME`; loot 50 coins 20%, artifact 10%, 2 scrolls 25%, 3 potions 25%, a revealed secret 20%); below **Sparring with ninja stars**; right **Drinks** (`DRINKS`); left **Gossip about the Wizard**.
- Alchemist: above or below **Snatching a potion** (sneaks in by ceiling hatch or trapdoor, `u.sneak`, uses it like the item); right **Volatile potions**; left **A shrinking potion?** (works only with the Mage tag: tiny for 2 minutes, secret).
- Wizard: above **Gossip about the Knight**; below **Lightning and frost** (jealous, or amazed with the Mage tag); right **Dress-up** (`u.dress`; then the Wizard keeps another robe color); left **Light fingers** (you lose 5% of your coins).
- Necromancer: above **Dark ritual together**; below **Betrayal!** (20% the Rogue is sacrificed and the Necromancer gets a skeleton follower); right **Errands and stolen candles**; left **Fairy attack!**
- Any side, 0.5%: **Assassin** (kills the neighbor; not while disguised).

### Blacksmith & each character (any side, `PAIRS['blacksmith>X']`)
- Necromancer: **Armor? How quaint.** (`NSCOFF`). Knight: **Smithing talk** 60% or **A new weapon** 40% (one of his other weapons, saved).
- Wizard: **Magical metal**, refused, unless Mage-tagged characters are on all four sides of the Blacksmith: **Green mage armor** for the Wizard; afterwards they **talk about the armor**.
- Fruit Merchant: **An awkward joke.** Apothecary: **Flirting** (she isn't interested). Alchemist: **Childhood friends.** Rogue: **Daggers and ninja stars.**
- Priest: **Holy fire** offered and declined, unless the Knight is next to the Blacksmith too: the Knight becomes a **Paladin** (secret).
- Druid: **Metal is uncomfortable** (`METALITCH`; the Blacksmith rolls his eyes, mood `roll`).
- **Adventure:** with 2+ Fighter neighbors at home and not in a scene (`recruitable`; idle activities are interrupted, `stopIdle`), 20% of his visit rolls send ALL of them away for 3 minutes (he stays). Each one back: 10% didn't make it; the others bring 3d10 coins if a Fighter, 15% a scroll if a Mage, 5% an artifact if a Merchant. Secret: when the last one is home (`advDone`, `u.advBy`, `u.advLeft`) and a generous Monarch is next to the Blacksmith, +1 artifact (royal patron).

### Necromancer & Druid
- Necromancer on the bottom row, Druid beside him (left or right): 30% of the Necromancer's visits are **Life drain** (black lightning; the Druid dies and is buried).

### The Monarch: requests (`talk` kind `request`, `REQ_ASK`, `grantReq`)
- Each neighbor with a request visits the Monarch once to ask (`reqOf`; `u.asked`, cleared only by dying or going back to the shelf). Every grudge ends when the Monarch leaves the board (`removeUnit`). Generous: granted 80% (`ODDS.reqGenerous`), else an apology. Greedy: granted 10% with a scoff (`ODDS.reqGreedy`), else denied rudely. Denied: the asker holds a grudge (`u.grudge`, see Secrets).
- Paladin: **knighted** (kneels, dubbed, label "Sir Paladin", `u.sir`). Other Knights have no request.
- Blacksmith: **an apprentice** who wanders the forge for good. Wizard: **a new staff** of pointed dark steel with a floating, glowing orb (`u.staff`, sprites `..._st`). Priest: **holy water**, a barrel in the chapel (`u.barrel`). Alchemist: **rare ingredients**, +2 potions. Rogue: **money**, a pile of coin sacks in his room (`u.sacks`, looks only). Fruit Merchant: **exotic fruit**, a crate of pineapples (`u.pine`).
- Apothecary: **time off**: a noble walks in and she is away on a date for 5 min (`awayKind` 'leave', `LEAVE_TIME`).
- Necromancer: **prisoners**: back home three prisoners come in and a ritual turns them into skeletons that follow him (`u.thenPrison`, act `prisoners`, `u.minions`).
- Druid: **land for nature**: up to 3 Farmers on the nearest free spaces (`DRUID_FARMS`).

### Group events (`grp`, `stepGroup`; their own Compendium tab `group`)
- Separate from everyone's own decisions: every 5 minutes (`GROUP_EVERY`) one happens whenever the board allows (`ODDS.group` = 1), picked at random among the shapes on the board (`groupOptions`, `grpReady`: characters at home, free or busy with an idle activity, which is interrupted, except the few in `NO_INTERRUPT`; no Farmers, no structures). It lasts 1 minute (`GROUP_TIME`). Its characters are busy (`st 'grp'`, `stepGrpUnit`): nobody visits them, they stay in their rooms. It ends early (no reward) if one of them is moved, removed or pulled away. Not saved.
- **Market day:** four Merchant-tagged characters in a 2x2 square. The four rooms become one market square (`drawMarketBack`: town, striped tents, wares, cobbles; `drawMarketCrowd`: shoppers strolling); the merchants stroll their stalls and shout (`MARKET_SHOUT`). At the end +2d10 coins.
- **Travelling group events** (`TRAVEL_GRP`, `travelOptions`, `startTravelGroup`, `stepTravelGroup`): the characters walk to a structure, room by room along the row (`routeAlong`), stand at set spots (`st` gather / gathered, the structure's `gather`) and chat for 1 minute, then go home. Both are secrets: Small Talk at the Well (four neighbors, `WEATHER_TALK`) and Classic Adventurers at the Tavern (Priest, Knight, Wizard, Rogue in its row, raising ales, `CLASSIC_TALK`).
- **A grand feast:** any three characters side by side in a row. The rooms become one feast hall (`drawFeastBack`) and they sit behind a long table of food (`drawFeastFront`, drawn after them), chatting and toasting (`FEAST_SAY`).

### Gatherings
- **Great prayer:** a Priest with four free neighbors, 5% of his rolls: all kneel in his room for 20 s.
- **Funeral:** a Fighter next to the Priest dies: 1.5 s later the Priest interrupts any idle activity (or waits up to 30 s if busy) and every free neighbor kneels at a gravestone for 12 s (`u.funeral`, `startGather`).
- **Grand funeral:** the Monarch dies (`royalFuneral`, `rf`, `stepRoyal`): the Monarch lies in a coffin (`drawCoffin`, `u.dead`), and EVERYONE on the board drops whatever they are doing and kneels around it for 1 min (`ROYAL_FUNERAL_TIME`; not anyone away, not the killer). Meanwhile no coins are earned and no items bought or gained (`mourning()`; only Compendium rewards still pay). The box can't be moved; afterwards it goes back to the shelf.

## Idle activities
Tiers: C common, U uncommon (15%), R rare (5%), L legendary (0.75%); commons share the rest. Conditions in brackets.
- **Knight:** weapon practice C (a squire spars with him if he has the shield), orc next door U [a free neighbor], horse R [no box to his right], black cat crossing the Wizard's room L [Eldritch Knight, Wizard on the board].
- **Wizard:** read C, practice magic C, summon a demon L (he dies), brew a potion L [next to a Merchant, 5 coins; -5 coins].
- **Priest:** pray C, bless a farmer C, tithe prayer U (+5), exorcism R.
- **Necromancer:** spirits C, candles and chalk circle C, red lightning C, raise a skeleton in someone's room L (Fighters and Mages win; anyone else dies).
- **Fruit Merchant:** adverts C, sell apples next door C [a free neighbor] (+2), customer U (+2; nothing while rotten), angry fruit mob L, alchemy sale U [next to the Alchemist].
- **Apothecary:** brew C, herbs C, customer U (+5), trip R, trip and smash a potion R, alchemy sale U [next to the Alchemist].
- **Alchemist:** brew C, smoky mistake C, research U, beast-man U [the mad scientist, bottom-right space]: attacks a free neighbor; a Merchant-only neighbor dies, a Fighter or Mage fights him and one of them dies (50/50).
- **Rogue:** daggers C, count his stash C, smoke bomb U, disguise R, conjure an artifact L [the Mage tag; uses it up].
- **Druid:** tend the grove C, deer and bird C, predict the weather U, nature spirit R [all four spaces around him open and empty; a clue].
- **Blacksmith:** hammer C (sparks), smelt armor or a sword C, shovel coal U, pour an ingot mold L (+1 ingot), lead into gold U [next to the Alchemist; +5 coins, secret].
- **Farmer:** hoe C, pitchfork C; harvest when time is up. **Monarch:** holding court C (`COURT`). **Traveling Merchant:** arranging the wares C.
- **Anyone:** a short story C [living in the Druid's Rain; 15% of stories are a clue]; revenge on the Monarch L [refused by a Monarch; from anywhere, secret].

## Structures
- A structure is a box with nobody living in it (`CLASS` 'structure', the Structure tag, `isStruct`). It never decides anything (skipped in `step`, no sprite), is never visited except for its own activities (`freeU` is false), cannot die (`kill` ignores it), sleeps through nothing, does not count for group events or the Monarch's ten boxes, and items do nothing on it (`useItem`). Its Compendium tab says so instead of the Decisions line.
- It gives its neighbors new idle activities: `STRUCT_IDLE` (30%) of their idle rolls (`structIdle`, before their own list), chosen by one of their tags at random. The neighbor visits the structure's room for the scene (`visit` with the structure as host).
- Structures go back to the shelf for free (`sendToShelf`). Each structure's neighbor activities: `STRUCT_ACTS` (by tag).
- **Well** (on the shelf from the start, `SHELF_CHARS`; room `wellRects`: a cobbled town square, a round stone well with a wooden frame and crossbeam, crank, rope and bucket, a lamppost and a flower pot). By tag (`WELL_ACTS`): Mage looks in peacefully (`welllook`) or 10% (`WELL_SPLASH`) a peasant throws well water and they melt into a puddle and reform (`wellsplash`, `u.melt`, `drawPuddle`); Fighter leaps over the well (`welljump`, `u.jy`); Merchant tosses in a coin and makes a silent wish (`wellwish`); Monstrous jumps in and peeks out (`welldive`, `u.dive`, clipped at the rim by `u.diveClip` only while in the well; `clearFx` and a safety check in `step` clear the clip and melt whenever those scenes are not running). Compendium labels: `WELL_PCT`.

- **Well secret, Small Talk** (`grp:wellchat`): a travelling group event when all four spaces around the Well hold characters (see Group events).
- **Tavern** (unlocked when the Priest, Wizard, Knight and Rogue are all on the board; room `tavernRects`: plank walls, a bar with bottles and mugs, a tapped barrel, two tables with stools, back door on the LEFT, `DOOR_STYLE.tavern`). The barkeep mostly stands behind the bar, polishing a mug, and steps to another spot every 7 s (`BARKEEP_SPOTS`); every 40 s a patron walks in from the back door, sits at the far table (the table is redrawn in front of their legs), drinks for about 14 s and leaves (`drawTavernLife`, room life, not characters). Neighbor activities by tag (`STRUCT_ACTS.tavern`, rarer second outcome `STRUCT_SECOND`): Mage a fizzy magic drink (`tvfizz`), 10% the bubbles fill the room and they pop them by magic (`tvbubbles`, `h.bubbles`); Fighter two drinks, a wobbly walk home (`u.drunkHome`) and 15 s asleep (`DRUNK_SLEEP`); Merchant a delivery of crates (`tvdeliver`, `h.cratesUntil`), 20% a bottle of dwarven wine the barkeep pays 20 coins for (`tvwine`); Monstrous: the barkeep grabs an axe, comes round the bar and chases them out (`tvshoo`, `h.bk`). The barkeep speaks through `barkeepOf(h)`.
- **Tavern secret, Classic Adventurers** (`grp:classic`): a travelling group event when the Priest, Knight, Wizard and Rogue are all in the Tavern's row.

## Druid
- No doors: left/right he walks across the edge; up/down he slips into the shadow between two trees (exit `shadow`).
- When he dies he is buried in his space (`bury`): a mound with a sapling, his animal beside it, label dimmed, saved. He does nothing and nobody visits or targets him (`freeU` is false), but his Mage tag and place still count for neighbors. A spell scroll on his space revives him (`revive`); other items do nothing.
- He has no neighbor scenes of his own (others can have scenes with him, e.g. the Blacksmith). When he would visit, he casts **weather** instead (`startWeather`, act `wcast`) on a random open space with no weather, with or without a box: 30 s each (`WEATHER_TIME`), at most 2 of his at once (`WEATHER_MAX`). Not saved. Kept in `weathers`, read with `weatherAt(r,c)` / `wxOf(u)`, drawn by `drawWeather`; everything ends when it does.
  - **Blizzard** U: snow; that space's character visits 30% less, and their rarest idle activity is 30% more likely (`RARE_IDLE`).
  - **Sandstorm** U: sand; every chance of dying for someone living there is tripled (`doom`).
  - **Sunshine** C: warm light; coins a Merchant earns there +20%, a Farmer +50% (`sunBonus`).
  - **Rain** C: a short story joins that character's idle list as a common activity (`STORIES`); 15% of them are a clue.
  - **Overgrowth** C: pink and yellow flowers bloom around the border (looks only).
  - **Moonlight** C: dark with a soft pink glow; when it starts and when it ends, 30% a werewolf kills whoever is in that space (`wolfRoll`).
  - **Decay** C: worms and flies; tags the character was not born with (ingot, Rogue's Mage tag, Alchemist's Mage tag) are gone while it lasts.
  - **Infest** R: a locust swarm; nobody visits that space.
- **Archdruid** (artifact on the Druid, once): glowing staff; never casts Moonlight, Decay or Infest (`ARCH_SKIP`).

## Items, coins and shops
- Items are a counted inventory (`S.inv`): spell scroll, potion, artifact, ingot. Drag one onto a room; it works only if the owner is home and not busy. If nothing happens it isn't used up (grey puff). An effect returning `'keep'` happens but gives the item back.
- **Spell scroll:** Wizard fireball (destroys a neighboring room and everyone in it); Knight golden glow 30 s; Priest banishes a ghost; Necromancer raises a skeleton next door; Fruit Merchant becomes a monkey 2 min; Apothecary brews it into a potion; Alchemist tears it up; Rogue gains the Mage tag; Druid: a rain storm brings everyone who is away home at once with their normal result (dates go well); Blacksmith: the spell goes wrong and he dances uncontrollably for 15 s; buried Druid: revived.
- **Potion:** Wizard teleports to someone for a scene; Knight flexes; Priest angel wings 30 s; Necromancer smashes it; Fruit Merchant speaks backwards (toggles); Apothecary buys it back (+10); Alchemist: luck potion (60 s, his and his neighbors' rarest chances +30%, their squares glitter); Rogue: invisible prank (`rogueSpook`); Druid saves it for a rainy day (used up); Blacksmith hands it back; anyone asleep wakes up.
- **Artifact:** Priest next to the Necromancer destroys him (secret). Alchemist: 80% philosopher's stone (one more space turns golden for good, they add up; coins earned on a golden space are doubled, `S.goldCells`, `inGold`; with every space golden: +50 coins instead), 20% elixir of life (he retires, secret). Druid: becomes the Archdruid.
- **Ingot:** on anyone without the Fighter tag: reinforced, Fighter tag for good (`reinforce`). Unlike scrolls and potions it works even while the character is busy or out of their room (not while away). The Monarch: nothing (kept). The Druid refuses it and hands it back (`dingot`). The Traveling Merchant buys it (+30, no tag).
- **Traveling Merchant:** buys a spell scroll or potion for 15 coins and an ingot for 30 (`tSell`, `TRAVEL_BUY`).
- **Shops:** a small gold coin in the bottom-right corner of a shop room (`drawShopCoin`, `onShopCoin`). Apothecary: potion, 30 coins (with the Alchemist next to her, 20% you get two, secret; with the Druid next to her, 5 coins less, secret, `DRUID_DISCOUNT`). Wizard (while a Merchant and another Mage are next to him): scroll, 50 coins (30 for the black Wizard). Blacksmith: ingot, 100 coins. Traveling Merchant: artifact, 300 coins (`buyArtifact`). No shopping during the grand funeral. Every purchase asks first (`ask`).
- **Coins:** no passive income. Coins come from the Wizard's advertising, scenes and idles (sales, customers, tithe, starfruit, durian, blood orange, crusade, dungeon, adventures, farms, lead into gold) and Compendium rewards (every 5 discoveries pay 10). Compendium item rewards (`checkDiscoveries`): a character's tab fully discovered, secrets included, +1 artifact (once per tab); every 50 discoveries (`BIG_EVERY`) one random item: spell scroll 45%, potion 45%, ingot 10% (`ODDS.bigReward`). They pay even during the grand funeral and are paid on load if already earned. Spending goes through `spend()` (counted in `S.spent`).
- **Where items come from:** scrolls from crafting, joint making, the Wizard's desk, the dungeon, adventures; potions from the Apothecary, the Wizard brewing, joint making, a scroll on the Apothecary, the dungeon; artifacts from the crusade, the dungeon, adventures, the royal patron, the Rogue's conjuring, the Traveling Merchant's shop; ingots from the Blacksmith's shop and his mold pouring.

## Transitions between rooms
- Left/right: the Wizard uses portals; everyone else walks through the side door (it swings out into the next room). Rooms without side doors (`noSideDoor`: farms, forest, the Traveling Merchant's road, the Well, the Rogue's graveyard) are crossed by walking over the edge.
- Up/down use each ROOM's exit (`TR`, `exitsOf`): back-wall door (Knight, Priest, Necromancer, Fruit Merchant, Blacksmith); a fancy one (Monarch, `royaldoor`, which also gives fancy side doors to and from the throne room); the same door on the left (Apothecary, Alchemist); a sliding bookshelf (Wizard); rope and trapdoor (Rogue); fade (Farmer, the Rogue's graveyard); shadow between trees (Druid). Leave by your room's exit, arrive by the other room's.
- Not neighbors (potion teleport): a pair of portals.

## Unlocks and secrets
- Unlocks (last until Reset): Necromancer 25% when a Priest dies; Fruit Merchant hold 30 coins; Apothecary any Merchant next to any Mage; Alchemist 20% of the Wizard's brewing with the Apothecary; Rogue 50 discoveries; Druid every space bought (checked right when the last one is bought); Blacksmith 100 coins spent; Monarch 10 boxes on the board (Farmers don't count); Traveling Merchant 4 Merchant-tagged characters in a 2x2 square.
- Secrets (`EGGS`; hidden in the Compendium until found, but counted): black Wizard (a new Wizard dragged onto the top-left space), bronze Knight (1%), skulls (Necromancer on the bottom row), artifact on the Priest next to the Necromancer, elixir of life; Alchemist: two for one, mad scientist, beast-man, four Mages (with Mages on all four sides, 10% he gives one a potion with its usual effect); Rogue: tiny Rogue, graveyard (next to the Necromancer, both on the bottom row: his room becomes a graveyard with no doors); Druid: nature spirit, herbal discount (next to the Apothecary); Blacksmith: Paladin, lead into gold; Monarch: revenge (a grudge kill, `regicide`), royal patron (`royalpatron`; both listed only in the Monarch tab, the patron also under the Blacksmith).
- **Super Secrets** (own Compendium tab `super`, always shown; `EGGS` keys starting with `ss:`): no hints, never revealed by clues, tied to no character. A golden kingdom (`ss:gold`: every space golden from philosopher's stones), one of everything (`ss:alltags`: one character with Fighter, Mage, Merchant and Monstrous at once, checked in `setLabel`).
- Clues (the Priest and Apothecary's studies, the dungeon, the Druid's nature spirit, a story in his rain; `revealSecret`): 70% an undiscovered interaction, 30% a secret (`ODDS.revealScene`; falls back to the other kind if none is left). It is shown in the Compendium with its image and full text, but without a gold border and not counted as found (`S.revealed`).

## Compendium tab
- Tabs are in alphabetical order. One tab per character ever unlocked (`COMP_TABS`, `compUnl`; it stays even if the character is locked again, e.g. the retired Alchemist, `S.ever`), with found / total (`tabKeys`). A neighbor scene only shows once both characters are unlocked (`PAIR_WITH`; 'anyone' and `tag:...` count as unlocked).
- Under the tabs: the "Discovered" line and a **Tags** line (`TAG_NOTES`) saying the character's tags and what changes them.
- Groups: With neighbors (one sub-section per neighbor, alphabetical: "with the Knight", "with a Mage", "with anyone"), Idle activities, Items and shops, Secrets (at the bottom; "Not found yet" until one is found or revealed).
- A tab's top lines: "Discovered X of Y" (Y = everything in the game, `ALL_KEYS`), **Decisions.** (`decideText`, `DECIDE_NOTE` exceptions), then **Tags** (`TAG_NOTES`).
- Every description (clue or found) starts with the entry's title in bold and a period (`titleOf`: `TITLES` in data.js, short Title Case names, else `NAMES`; no period is added after "?" or "!"; `showTip`).
- Tile chances come from the rarity lists (`pctOf`: `idlePct`, `visitPct`, weather): the % when that kind of action happens, "of his idle activities" or "of their visits" (hangouts included). An idle's common share counts the character's whole list. Percents are rounded DOWN (`fmtPct`) so one list never adds up past 100%. Request tiles show "80% / 10%" (granted by a generous / greedy Monarch).
- A discovered (or revealed) tile's description (`infoText`): "Visit (64% chance): Priest left of the Knight. <story> <outcome note>" (also Idle, Weather, Item; `whereText` from `PAIRS`, `IDLE_COND`, `NOTE`). The story (`flavorOf`: `DESC` without its rules, or `FLAVOR`) is the same as in the clue. Other tiles (shops, special secrets, passives) show their `DESC`.
- The clue of an undiscovered tile (`hintOf`) = the story plus a playful unlock hint (`unlockHint`: hand-written `HINTS`, else made from the rules with compass words: west = left, east = right, north = above, south = below; "A rare sight." / "Once in a blue moon." for rare chances).
- Undiscovered tiles are a blank square with a "?" (`tile unknown`); the sub-heading counts (e.g. 1 / 7) still show how many there are with each character or tag. Hovering one shows a hint (`hintOf`): its description without the leading sentences about placement, items or chances (`HINT_CUT`, `HINT_HEAD`), with "30% more" turned into "more" and any other sentence with a chance dropped. Once discovered or revealed, the tile shows its image, chance and full description.
- Tiles show the chance top right (from `ODDS`), icons bottom left for what a scene gives (`GAINS`), a gold border once it has happened (`markSeen`, `S.seen`); found secrets get a purple dashed outline. Hover or tap a tile for its `DESC` description (`showTip`), written with a little humor.

## Drawing and animation conventions
- Pixel art: 16x22 character grid drawn from rectangles with an automatic dark outline. Fantasy medieval theme. Each sprite then gets hand-placed details (`SPRITE_DETAIL`, matched by the start of the sprite name, drawn over the body and under hands in front, moving with the legs) and automatic shading (`shadeSprite`: light from the top-left, a gentle falloff toward the feet; the face is drawn after it so eyes stay crisp). Keep the top-left of a room (about y < 24) clear for the name label.
- Arms come from `POSE` (none, hold, noR, fwd, up, wave, both, pray, flex, flex2); `poseOf` picks one per activity; short gestures use `gest`. Kneeling uses `pray`.
- Walking: legs step apart in two frames (`stepLegs`, `stepOf`). Moods: ok, happy, mad (real anger and monsters only), hurt, shock (surprise; never red eyes for surprise), sleep, roll (rolling the eyes). Characters blink (`blinkMood`).
- Outdoor rooms (farm, the Druid's forest by row, the Traveling Merchant's road; `OUTDOOR`, `outBack` behind their bg rects: sky gradient, clouds, hills, mountains, far trees, sun shafts; `outFront` in front: grass tufts, bark, ferns, glowing specks, light). The farm has a red barn and hay; the road a covered wagon, mule, crate and barrel (no stand).
- Room look (`paintRoom`, painted once per room and weapon / row / colors, cached in `ROOMC`): wall fill and texture (`ROOM_STYLE` wall: stone, block, brick, plank, plaster), floor texture (flag, plank, dirt), the room's bg rects, extra decor (`ROOM_EXTRA`: the Knight's banner, torch and rug, the Wizard's star chart and rug, the Priest's arch, light beams, pillar and carpet, the Necromancer's cobweb, chain and rune circle, the Fruit Merchant's sign, onions and mat), then soft light (`roomLight`). Outdoor rooms (forest, road, farm) have no style. Change a room's look in these, and the cache picks it up on reload.
- Doors: each room has its own door look (`DOOR_STYLE`: wood, seams, straps, rivets, knob, frame, arch, a decoration such as the Priest's cross, the Necromancer's skull, the Apothecary's wreath, the Alchemist's porthole). The back door rects come from `backDoor(id, left)`; opening doors (`drawFx`) use the style of `f.room` (a side door looks like the room you leave; to or from the throne room it is always royal).
- Rooms have small moving details (`drawRoomLife`): the Knight's torch, the Wizard's candles, candles, a cloud, book sparkles, the Alchemist's flask, the forge fire, falling leaves (glowing spores in the mushroom forest), the jester juggling.
- Visitors stand at least 30px beside their host (`standBy`). Facing only flips when the other is clearly to one side. Weapons are drawn only while used, clipped to the room.
- Extra people in a scene live in `u.crowd`, a single helper in `u.npc`, creatures in `u.mobs`, a follower in `u.pet`.

## Planned
More Monarch scenes, achievements, more characters, customizable dialogue, more interactions, real pixel art assets.

## Editing the Compendium text
- `tools/compendium-export.html` makes a text file of every Compendium entry tab by tab (it is not kept in the project; make it again when needed): `[key]`, Name (`NAMES`), Story (`flavorOf`: `FLAVOR`, else `DESC` without its rules), Hint (`HINTS`, or "(auto)" from `unlockHint`), Note (`NOTE`), and the full text once found (reference only), plus the shelf clues (`SHELF_CLUE`).
- To make it again: run `tools/compendium-export.html` in headless Edge (`msedge --headless=new --allow-file-access-from-files --dump-dom file:///.../tools/compendium-export.html`), take the text of `<pre id="out">` and unescape `&lt; &gt; &quot; &#39; &amp;`.
- When edits come back: a changed Story becomes a `FLAVOR` entry, a changed Hint a `HINTS` entry, Name a `NAMES` entry, Note a `NOTE` entry (all in data.js).
