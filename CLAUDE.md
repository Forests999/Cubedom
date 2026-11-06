# Cubedom

A web-based, fantasy-medieval sandbox inspired by the 2000s toy "Cube World". Each character lives in a pixel-art room (a "box"). The player drags boxes onto a 5x4 board. Characters idle inside their box and sometimes visit neighboring boxes. The arrangement of boxes changes what happens.

Live site: https://forests999.github.io/Cubedom/ (GitHub Pages from `main`; pushing to `main` updates it).

## Working style
- Make small changes and test each one. Explain changes in plain language; the owner is a beginner.
- Keep this file up to date as one current reference (not a change log): when something changes, edit the section it belongs in.
- Use git; commit after each working change. Commit as Forests999 with the GitHub noreply email (already set in this repo's git config); never use the owner's real name or email.
- Ask before pushing, since pushing publishes to the public site. Before every push, raise the release number `?v=` in `index.html` (on style.css, data.js, art.js and game.js, all four the same) so browsers and phones load the new files.
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
- `index.html`: page layout only: item tray `#items` (above the board), board, character shelf `#tray`, Reset button, `#toast` message, `#modal` purchase popup.
- `style.css`: all styling.
- `data.js`: everything that is data. Characters and sprite pixels (`CH`, poses `POSE`, skin tones `SKINS`), classes and tags (`CLASS`, `EXTRA_CLASS`, `TAG_ICON`, `TAG_NAMES`, `TAG_NOTES`), shelf (`SHELF_CHARS`, `ALL_CHARS`), items (`ITEMS`), room exits (`TR`, `EXIT`), `WEAPONS`, neighbor scenes (`PAIRS`, `ROGUE_SCENES`), `ODDS`, timers and prices (constants such as `SLEEP_TIME`, `APOTH_COST`, `INGOT_COST`), all dialogue arrays, board spaces (`START_CELLS`, `CELL_PRICE`), Compendium data (`NAMES`, `DESC`, `COMP_TABS`, `PAIR_WITH`, `EGGS`), the Monarch's colors and requests (`MPAL`, `REQ_ASK`, `REQ_YES`, `REQ_NO`), helpers (`$`, `pick`, `cl`, `GAME_FONT`, `isFarm`).
- `art.js`: room walls and backgrounds (`WALL`, `bg`) and every drawing function: sprites (`spr`, `sid`, walking `stepLegs`, blinking `blinkMood`), arm poses per activity (`poseOf`), activity overlays (`drawAct`), weapon swings (`pracAnim`, `weaponOf`), exits (`drawFx`), room details (`drawRoomLife`), item icons (`drawItem`), creatures (`drawMob`, bats, bees, deer, birds, the Druid's bear), effects (rain, glitter, ritual darkness, sparks...), box borders (`box`, `boxFrame`), locked spaces (`drawLocked`), shop coin (`drawShopCoin`).
- `game.js`: rules and everything that happens: decisions (`decide`, `startAct`, `acting`), movement (`route`, `run`), neighbor scenes (`talk`), items (`useItem`, `ITEM_FX`, `ITEM_KEY`), shops, the render loop, input, the shelf (`buildShelf`), the Compendium (`buildRef`), saving/loading.

## Board, boxes and saving
- Board: 5 columns x 4 rows, 96px cells. Neighbors are the 4 edge-sharing cells (no diagonals).
- Borders: each box draws a thin 2px frame (`box`); `boxFrame` adds 2px only on sides with no box next to it, so every border is 4px.
- Locked spaces: only the middle 3x3 (rows 1-3, columns 2-4) is open at the start (`START_CELLS`). Locked spaces are dark with a padlock and price; tap one to buy it (asks first): 10 coins, each next one 5 more (`CELL_PRICE`, `CELL_STEP`, `cellPrice`, `buyCell`). Nothing can be put on a locked space. Saved in `S.cells`, `S.bought`. Old saves keep spaces that already had boxes open for free.
- Shelf (under the board): unplaced boxes, heading shows "X/Y unlocked" (`ALL_CHARS`). Drag a box onto the board (or tap it to use the first free space), onto another box to swap. Dragging a box back onto the shelf costs 10 coins (`REMOVE_COST`, `sendToShelf`, asks first); a Farmer can never go on the shelf. Placing costs coins for the Apothecary (20) and for every Monarch after the first of the game (150, `MONARCH_COST`, counted in `S.monarchs`); both ask first.
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

- **Tags:** always check with `hasClass(u, tag)` (always false for the Monarch). It counts `CLASS`, `EXTRA_CLASS` (Blacksmith's Fighter tag), an ingot's Fighter tag (`u.reinforced`), the Rogue's Mage tag (`u.mageTag`) and the Alchemist's Mage tag while a Mage-tagged character is next to him. The Druid's Decay weather hides the last three on its space. Labels redraw when tags change (`refreshTags`).
- **Skin tones:** new Knights, Fruit Merchants, Priests, Rogues, Druids, Blacksmiths, Monarchs and Traveling Merchants get one of 3 tones (`SKINS`, `SKIN_CHARS`; sprite copies like `priest_f~2`, chosen by `sid`).
- **Forms:** Eldritch Knight (permanent), Death Knight (until cleansed; only follows the Necromancer), Monkey (Fruit Merchant, 2 min), Grizzly Bear (Knight, 30 s), Beast-man (mad-scientist Alchemist, during his attack). Death Knights and the temporary forms (`TEMP_FORM`) take part in nothing and nobody visits them.
- **Conditions:** Sick (poisoned wine, 60 s, `u.sickT`): no neighbor scenes either way, green bubbles, 5% dies when it wears off. Tiny (Rogue, 2 min): 60% size, 70% faster. Skeleton follower: trots after the Necromancer once he has sacrificed the Rogue (`u.pet`); three more from the Monarch's prisoners (`u.minions`, `u.mins`). Grudge (`u.grudge`): the Monarch refused a request (see Secrets). Buried Druid: see Druid.
- **Rogue disguise:** for 2 minutes he looks like, is named as and acts as another character (`u.as`, read through `idOf(u)`): their scenes, idles and discoveries. His own box stays his.
- **Visitors who are not boxes:** commoner customer, thief, imp, demon, bats, bees, carnivorous plant, farmers (sick, possessed, mob), ghost, squire, nobles, orc, skeletons, zombies, golem, fairies, deer, birds, horse, cat, werewolf, prisoners, jester (room decoration), the Blacksmith's apprentice (`u.helper`, `u.appr`, wanders the forge for good).

## How characters decide
- Each idle character rolls about every 5-10 seconds: 20% visit a neighbor (`ODDS.visit`), 40% an idle activity (`ODDS.idle`), otherwise wander in the room.
- Visit chance changes: Knight or Wizard in Old Friends 45%; Knight with a Priest above x1.6 (Zeal); a Mage next to the Alchemist x1.2; in the Druid's Blizzard x0.7.
- The Druid never visits: his visit roll casts weather instead (see Druid), except once to make his request when the Monarch is his neighbor. Others can still visit him.
- A greedy Monarch never visits. The Traveling Merchant never visits and nobody visits him (`nbrs` leaves him out).
- A visit to the Monarch by someone with a request they haven't made yet (`reqOf`, `u.asked`) is always that request.
- Which neighbor: random among free ones (`nbrs`, `freeU`; never one in the Druid's Infest), except a Fighter next to the Alchemist picks Mages 50% more often (haste potions, `pickW`).
- A visit: Knight/Wizard visits are Friendly Sparring 2% of the time; then 15% are plain hangouts (a wave and a hop); the rest play the pair's scene. Some scenes always have the same visitor (noted below).
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
- **Adventure:** with 2+ Fighter neighbors at home and not in a scene (`recruitable`; idle activities are interrupted, `stopIdle`), 20% of his visit rolls send ALL of them away for 3 minutes (he stays). Each one back: 10% didn't make it; the others bring 1-10 coins if a Fighter, 20% a scroll if a Mage, 5% an artifact if a Merchant. Secret: when the last one is home (`advDone`, `u.advBy`, `u.advLeft`) and a generous Monarch is next to the Blacksmith, +1 artifact (royal patron).

### Necromancer & Druid
- Necromancer on the bottom row, Druid beside him (left or right): 30% of the Necromancer's visits are **Life drain** (black lightning; the Druid dies and is buried).

### The Monarch: requests (`talk` kind `request`, `REQ_ASK`, `grantReq`)
- Each neighbor with a request visits the Monarch once to ask (`reqOf`; `u.asked`, cleared only by dying or going back to the shelf). Generous: granted 80% (`ODDS.reqGenerous`), else an apology. Greedy: granted 10% with a scoff (`ODDS.reqGreedy`), else denied rudely. Denied: the asker holds a grudge (`u.grudge`, see Secrets).
- Paladin: **knighted** (kneels, dubbed, label "Sir Paladin", `u.sir`). Other Knights have no request.
- Blacksmith: **an apprentice** who wanders the forge for good. Wizard: **a new staff** of pointed dark steel with a floating, glowing orb (`u.staff`, sprites `..._st`). Priest: **holy water**, a barrel in the chapel (`u.barrel`). Alchemist: **rare ingredients**, +2 potions. Rogue: **money**, a pile of coin sacks in his room (`u.sacks`, looks only). Fruit Merchant: **exotic fruit**, a crate of pineapples (`u.pine`).
- Apothecary: **time off**: a noble walks in and she is away on a date for 5 min (`awayKind` 'leave', `LEAVE_TIME`).
- Necromancer: **prisoners**: back home three prisoners come in and a ritual turns them into skeletons that follow him (`u.thenPrison`, act `prisoners`, `u.minions`).
- Druid: **land for nature**: up to 3 Farmers on the nearest free spaces (`DRUID_FARMS`).

### Gatherings
- **Great prayer:** a Priest with four free neighbors, 5% of his rolls: all kneel in his room for 20 s.
- **Funeral:** a Fighter next to the Priest dies: 1.5 s later the Priest interrupts any idle activity (or waits up to 30 s if busy) and every free neighbor kneels at a gravestone for 12 s (`u.funeral`, `startGather`).
- **Grand funeral:** the Monarch dies (`royalFuneral`, `rf`, `stepRoyal`): the Monarch lies in a coffin (`drawCoffin`, `u.dead`), and EVERYONE on the board drops whatever they are doing and kneels around it for 1 min (`ROYAL_FUNERAL_TIME`; not anyone away, not the killer). Meanwhile no coins are earned and no items bought or gained (`mourning()`; only Compendium rewards still pay). The box can't be moved; afterwards it goes back to the shelf.

## Idle activities
- **Anyone:** 10% of idles (rolled first) wave to a neighbor; a free neighbor waves back. Not in the Compendium.
- **Knight:** weapon practice 75% (a squire spars with him if he has the shield), fight an orc next door 20%, feed his horse 5% (needs no box to his right). Eldritch Knight: 1% a black cat crosses the Wizard's room.
- **Wizard:** read 60%, practice magic 38%, summon a demon 2% (he dies). Next to a Merchant with 5 coins: 1% brews a potion (-5 coins).
- **Priest:** pray 50%, bless a farmer 35%, tithe prayer 10% (+5), exorcism 5%.
- **Necromancer:** spirits 50%, candles and chalk circle 25%, red lightning 24%, raise a skeleton in someone's room 1% (Fighters and Mages win; anyone else dies).
- **Fruit Merchant:** customer 15% (+2; nothing while rotten), adverts 55%, sell apples next door 29% (+2), angry fruit mob 1%.
- **Apothecary:** customer 15% (+5), trip 5%, trip and smash a potion 5%, brew 35%, herbs 40%.
- **Fruit Merchant or Apothecary next to the Alchemist:** 10% the alchemy sale, rolled first.
- **Alchemist:** brew 60%, research 10%, smoky mistake 30%. Mad scientist (bottom-right space): 15% (rolled first) he becomes a **beast-man** and attacks a free neighbor: a Merchant-only neighbor dies; a Fighter or Mage fights him and one of them dies (50/50).
- **Rogue:** daggers 50%, smoke bomb 20%, disguise 5%, count his stash 25%. With the Mage tag: 0.2% (rolled first) conjures an artifact, which uses the tag up.
- **Druid:** tend the grove 40%, talk to a deer and a bird 40%, predict the weather 20%. Secret: with all four spaces around him open and empty, 10% (rolled first) a nature spirit reveals a hidden secret.
- **Blacksmith:** hammer at the anvil 40% (sparks), smelt armor or a sword in the furnace 40% (50/50), shovel coal 19%, pour an ingot mold 1% (+1 ingot). Secret: next to the Alchemist, 15% (rolled first) they turn lead into gold (+5 coins).
- **Farmer:** whistle while hoeing 50%, carry a pitchfork 50%; harvest when time is up.
- **Monarch:** holding court on the throne (generous or greedy orders, `COURT`).
- **Traveling Merchant:** arranging the wares on his stand (`wares`); no waving.
- **Anyone with a grudge** against the Monarch: 0.3% (rolled first, `ODDS.regicide`) they go to the throne room from anywhere and kill the Monarch (secret).

## Druid
- No doors: left/right he walks across the edge; up/down he slips into the shadow between two trees (exit `shadow`).
- When he dies he is buried in his space (`bury`): a mound with a sapling, his animal beside it, label dimmed, saved. He does nothing and nobody visits or targets him (`freeU` is false), but his Mage tag and place still count for neighbors. A spell scroll on his space revives him (`revive`); other items do nothing.
- He has no neighbor scenes of his own (others can have scenes with him, e.g. the Blacksmith). When he would visit, he casts **weather** instead (`startWeather`, act `wcast`) on a random open space with no weather, with or without a box: 30 s each (`WEATHER_TIME`), at most 2 of his at once (`WEATHER_MAX`). Not saved. Kept in `weathers`, read with `weatherAt(r,c)` / `wxOf(u)`, drawn by `drawWeather`; everything ends when it does.
  - **Blizzard** 10%: snow; that space's character visits 30% less, and their rarest idle activity is 30% more likely (`RARE_IDLE`).
  - **Sandstorm** 10%: sand; every chance of dying for someone living there is tripled (`doom`).
  - **Sunshine** 15%: warm light; coins a Merchant earns there +20%, a Farmer +50% (`sunBonus`).
  - **Rain** 15%: 80% of that character's idles are a short story (`STORIES`), 10% of them reveal a secret.
  - **Overgrowth** 15%: pink and yellow flowers bloom around the border (looks only).
  - **Moonlight** 15%: dark with a soft pink glow; when it starts and when it ends, 30% a werewolf kills whoever is in that space (`wolfRoll`).
  - **Decay** 15%: worms and flies; tags the character was not born with (ingot, Rogue's Mage tag, Alchemist's Mage tag) are gone while it lasts.
  - **Infest** 5%: a locust swarm; nobody visits that space.
- **Archdruid** (artifact on the Druid, once): glowing staff; never casts Moonlight, Decay or Infest (`ARCH_SKIP`).

## Items, coins and shops
- Items are a counted inventory (`S.inv`): spell scroll, potion, artifact, ingot. Drag one onto a room; it works only if the owner is home and not busy. If nothing happens it isn't used up (grey puff). An effect returning `'keep'` happens but gives the item back.
- **Spell scroll:** Wizard fireball (destroys a neighboring room and everyone in it); Knight golden glow 30 s; Priest banishes a ghost; Necromancer raises a skeleton next door; Fruit Merchant becomes a monkey 2 min; Apothecary brews it into a potion; Alchemist tears it up; Rogue gains the Mage tag; Druid: a rain storm brings everyone who is away home at once with their normal result (dates go well); Blacksmith: the spell goes wrong and he dances uncontrollably for 15 s; buried Druid: revived.
- **Potion:** Wizard teleports to someone for a scene; Knight flexes; Priest angel wings 30 s; Necromancer smashes it; Fruit Merchant speaks backwards (toggles); Apothecary buys it back (+10); Alchemist: luck potion (60 s, his and his neighbors' rarest chances +30%, their squares glitter); Rogue: invisible prank (`rogueSpook`); Druid saves it for a rainy day (used up); Blacksmith hands it back; anyone asleep wakes up.
- **Artifact:** Priest next to the Necromancer destroys him (secret). Alchemist: 80% philosopher's stone (one more space turns golden for good, they add up; coins earned on a golden space are doubled, `S.goldCells`, `inGold`; with every space golden: +50 coins instead), 20% elixir of life (he retires, secret). Druid: becomes the Archdruid.
- **Ingot:** on anyone without the Fighter tag: reinforced, Fighter tag for good (`reinforce`). The Monarch: nothing (kept). The Traveling Merchant buys it (+30, no tag).
- **Traveling Merchant:** buys a spell scroll or potion for 15 coins and an ingot for 30 (`tSell`, `TRAVEL_BUY`).
- **Shops:** a small gold coin in the bottom-right corner of a shop room (`drawShopCoin`, `onShopCoin`). Apothecary: potion, 30 coins (with the Alchemist next to her, 20% you get two, secret; with the Druid next to her, 5 coins less, secret, `DRUID_DISCOUNT`). Wizard (while a Merchant and another Mage are next to him): scroll, 50 coins (30 for the black Wizard). Blacksmith: ingot, 100 coins. Traveling Merchant: artifact, 300 coins (`buyArtifact`). No shopping during the grand funeral. Every purchase asks first (`ask`).
- **Coins:** no passive income. Coins come from the Wizard's advertising, scenes and idles (sales, customers, tithe, starfruit, durian, blood orange, crusade, dungeon, adventures, farms, lead into gold) and Compendium rewards (every 5 discoveries pay 10). Compendium item rewards (`checkDiscoveries`): a character's tab fully discovered, secrets included, +1 artifact (once per tab); every 50 discoveries (`BIG_EVERY`) one random item: spell scroll 45%, potion 45%, ingot 10% (`ODDS.bigReward`). They pay even during the grand funeral and are paid on load if already earned. Spending goes through `spend()` (counted in `S.spent`).
- **Where items come from:** scrolls from crafting, joint making, the Wizard's desk, the dungeon, adventures; potions from the Apothecary, the Wizard brewing, joint making, a scroll on the Apothecary, the dungeon; artifacts from the crusade, the dungeon, adventures, the royal patron, the Rogue's conjuring, the Traveling Merchant's shop; ingots from the Blacksmith's shop and his mold pouring.

## Transitions between rooms
- Left/right: the Wizard uses portals; everyone else walks through the side door (it swings out into the next room). Rooms without side doors (`noSideDoor`: farms, forest, the Traveling Merchant's road, the Rogue's graveyard) are crossed by walking over the edge.
- Up/down use each ROOM's exit (`TR`, `exitsOf`): back-wall door (Knight, Priest, Necromancer, Fruit Merchant, Blacksmith); a fancy one (Monarch, `royaldoor`, which also gives fancy side doors to and from the throne room); the same door on the left (Apothecary, Alchemist); a sliding bookshelf (Wizard); rope and trapdoor (Rogue); fade (Farmer, the Rogue's graveyard); shadow between trees (Druid). Leave by your room's exit, arrive by the other room's.
- Not neighbors (potion teleport): a pair of portals.

## Unlocks and secrets
- Unlocks (last until Reset): Necromancer 25% when a Priest dies; Fruit Merchant hold 30 coins; Apothecary any Merchant next to any Mage; Alchemist 20% of the Wizard's brewing with the Apothecary; Rogue 50 discoveries; Druid every space bought; Blacksmith 100 coins spent; Monarch 10 boxes on the board (Farmers don't count); Traveling Merchant 4 Merchant-tagged characters in a 2x2 square.
- Secrets (`EGGS`; hidden in the Compendium until found, but counted): black Wizard (a new Wizard dragged onto the top-left space), bronze Knight (1%), skulls (Necromancer on the bottom row), artifact on the Priest next to the Necromancer, elixir of life; Alchemist: two for one, mad scientist, beast-man, four Mages (with Mages on all four sides, 10% he gives one a potion with its usual effect); Rogue: tiny Rogue, graveyard (next to the Necromancer, both on the bottom row: his room becomes a graveyard with no doors); Druid: nature spirit, herbal discount (next to the Apothecary); Blacksmith: Paladin, lead into gold; Monarch: revenge (a grudge kill, `regicide`), royal patron (`royalpatron`; both listed only in the Monarch tab, the patron also under the Blacksmith).
- Secrets can be revealed (shown without a gold border, not counted as found) by the Priest and Apothecary's studies, the dungeon, the Druid's nature spirit, or a story in his rain (`revealSecret`, `S.revealed`).

## Compendium tab
- One tab per character ever unlocked (`COMP_TABS`, `compUnl`; it stays even if the character is locked again, e.g. the retired Alchemist, `S.ever`), with found / total (`tabKeys`). A neighbor scene only shows once both characters are unlocked (`PAIR_WITH`; 'anyone' and `tag:...` count as unlocked).
- Under the tabs: the "Discovered" line and a **Tags** line (`TAG_NOTES`) saying the character's tags and what changes them.
- Groups: With neighbors (one sub-section per neighbor, alphabetical: "with the Knight", "with a Mage", "with anyone"), Idle activities, Items and shops, Secrets (at the bottom; "Not found yet" until one is found or revealed).
- Descriptions always say what a chance is a chance OF: "of their visits" (when one visits the other), "of his idle activities", "checked first" (rolled before the normal idle choice), "each time he decides" (every roll, before anything else). Request tiles show "80% / 10%" (granted by a generous / greedy Monarch).
- Tiles show the chance top right (from `ODDS`), icons bottom left for what a scene gives (`GAINS`), a gold border once it has happened (`markSeen`, `S.seen`); found secrets get a purple dashed outline. Hover or tap a tile for its `DESC` description (`showTip`), written with a little humor.

## Drawing and animation conventions
- Pixel art: 16x22 character grid drawn from rectangles with an automatic dark outline. Fantasy medieval theme. Keep the top-left of a room (about y < 24) clear for the name label.
- Arms come from `POSE` (none, hold, noR, fwd, up, wave, both, pray, flex, flex2); `poseOf` picks one per activity; short gestures use `gest`. Kneeling uses `pray`.
- Walking: legs step apart in two frames (`stepLegs`, `stepOf`). Moods: ok, happy, mad (real anger and monsters only), hurt, shock (surprise; never red eyes for surprise), sleep, roll (rolling the eyes). Characters blink (`blinkMood`).
- Rooms have small moving details (`drawRoomLife`): candles, a cloud, book sparkles, the Alchemist's flask, the forge fire, falling leaves (glowing spores in the mushroom forest), the jester juggling.
- Visitors stand at least 30px beside their host (`standBy`). Facing only flips when the other is clearly to one side. Weapons are drawn only while used, clipped to the room.
- Extra people in a scene live in `u.crowd`, a single helper in `u.npc`, creatures in `u.mobs`, a follower in `u.pet`.

## Planned
More Monarch scenes, achievements, more characters, customizable dialogue, more interactions, real pixel art assets.
