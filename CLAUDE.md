# Cubedom

A web-based, fantasy-medieval sandbox inspired by the 2000s toy "Cube World". Each character lives in a pixel-art room (a "box"). The player drags boxes onto a 5x4 board. Characters idle inside their box and sometimes visit neighboring boxes. The arrangement of boxes changes what happens.

## Tech and constraints
- Plain HTML + CSS + JavaScript with Canvas. No build tools, no frameworks. It must open by double-clicking `index.html`.
- Works on desktop and mobile (touch drag, responsive layout, web app manifest `manifest.webmanifest` + `icon.svg`).
- Hosted on GitHub Pages from `main`: https://forests999.github.io/Cubedom/ (pushing to `main` updates the live site).
- Pixel art must stay crisp: `image-rendering: pixelated` and `imageSmoothingEnabled = false`.
- Speech bubbles are HTML too, one per character (`say`, `.bub`, `bubs`), so several conversations can show at the same time.
- Text labels (names) are regular HTML over the canvas so they stay sharp. Each name label shrinks its font to fit inside its square (`fitLabel`, on load, resize and returning to the Board tab), so names never overlap on phones.
- Font: Tiny5 (Google Fonts) for the board page, chosen because its numbers are easy to read; the big "Cubedom" title keeps Pixelify Sans. The Compendium page and its description bubbles use a plain system font (easier to read). Text drawn on canvases uses `GAME_FONT` (data.js).
- Progress saves in `localStorage` (key `cubehold-v4`, kept from the old name so saves survive).
- Keep game rules and data (characters, interactions, odds) separate from drawing code.

## Files
Plain script files with no modules, so double-clicking `index.html` still works. They load in this order and share global variables, so the order matters:
- `index.html`: page layout only (item tray `#items` above the board, board, character shelf `#tray`, Reset button, `#toast` message, `#modal` purchase popup). File links carry a release number `?v=`.
- `style.css`: all styling.
- `data.js`: constants, characters and sprite pixels (`CH`), arm poses (`POSE`), classes and tag icons (`CLASS`, `TAG_ICON`), wizard outfits (`WIZ_COLORS`), shelf characters (`SHELF_CHARS`), items (`ITEMS`), room exits (`TR`, `EXIT`), `WEAPONS`, the neighbor interaction table (`PAIRS`), potion-teleport scenes (`POTION_KINDS`), all odds (`ODDS`), timers and prices (constants like `SLEEP_TIME`, `APOTH_COST`), dialogue (`TALK`, `GOSSIP`, `PRAYERS`, `NECRO_TALK`, `DEBATE`, `MERCH_ADS`, `JOKES`, `FARM_PRAYER`), display names (`NAMES`), Compendium tabs and tile descriptions (`COMP_TABS`, `EGGS`, `PAIR_WITH`, `DESC`), skin tones (`SKINS`, `SKIN_CHARS`), board spaces (`START_CELLS`, `CELL_PRICE`), business talk (`BIZ_SLOW`, `BIZ_WELL`), Knight / Apothecary dialogue (`LEMONS`, `RUMOR_GOBLIN`, `RUMOR_DRAGON`, `KGOSSIP`, `DATE_GOOD`, `DATE_BAD`), every shelf character (`ALL_CHARS`), Priest / Necromancer dialogue (`PSTUDY`, `NYELL`, `NCHANTS`), Alchemist and Rogue scenes (`ROGUE_SCENES`, `MAGICTALK`, `PROMO`, `WGOSSIP`, `RGOSSIP`, `LECTURE`, `CONFESS`, `DRINKS`), tag-based pairs (`TAG_NAMES`: `tag:mage` etc.), the Compendium's tag notes (`TAG_NOTES`), the canvas font (`GAME_FONT`), and small helpers (`$`, `pick`, `cl`).
- `art.js`: room walls and backgrounds (`WALL`, `bg`, `BACKDOOR`, `BACKDOOR_L`, `SHELF2`, `WINDOW`) and all drawing functions (sprites with walking legs `stepLegs` and blinking `blinkMood`, `poseOf`, rooms, room life `drawRoomLife`, exits, activities, weapon swings `pracAnim`, tools `stick`, creatures, effects, item icons `drawItem`, locked spaces `drawLocked`, shop coin button `drawShopCoin`, box borders `boxFrame`, bats `drawBat`, bees `drawBees`, the Alchemist's flask `drawAlembic`, the carnivorous plant `drawPlant`, funeral gravestone `drawGrave`, dark ritual `drawRitualRoom`, golden space `drawGoldCell`, luck glitter `drawGlitter`, the Rogue's graveyard `drawGraveyard`, fairies `fairyPos`/`drawMob`).
- `game.js`: rules, decisions (`decide`, `startAct`, `acting`), movement (`route`, `run`), interaction scenes (`talk`), items (`useItem`), shops, the render loop, input, the shelf (`buildShelf`), the Compendium (`buildRef`), and saving/loading.
All odds live in `ODDS`; the game and the Compendium both read from it, so change odds only there.

## Board, boxes and saving
- Board: 5 columns x 4 rows, 96px cells. Neighbors are the 4 edge-sharing cells (no diagonals).
- Box borders: each box draws a thin 2px frame (`box`), and `boxFrame` adds 2px more only on sides with no box next to it. So every border on the board is 4px: two boxes side by side don't make a doubled, thicker line.
- Locked spaces: only the middle 3x3 (rows 1-3 from the top, columns 2-4) is open at the start (`START_CELLS`). The left and right columns and the bottom row are locked: dark, with a padlock and the price. Tap one to buy it (asks first): the first costs 10 coins, each next one 10 more (`CELL_PRICE`, `cellPrice`, `buyCell`). Boxes can't be dropped on locked spaces; tapping a shelf box, the Farmer and everything else only use open spaces. Bought spaces are saved (`S.cells`, `S.bought`). An older save that already had boxes on now-locked spaces keeps those spaces open for free.
- The shelf under the board holds unplaced boxes. Its heading shows how many characters are unlocked out of all of them (e.g. 5/8, `ALL_CHARS`). Drag a box onto the board to place it (or tap it to drop it in the first free cell), onto another box to swap. Dragging a box back onto the shelf costs 10 coins (`REMOVE_COST`, `sendToShelf`; asks first, not enough coins = a message).
- Moving a box sends its character home to the middle of the box. Removing a box makes the character vanish wherever they are. A visitor goes home if their host's box moves or is removed. Anyone with a doorway, stairs or portal open in a moved/removed room is also sent home (`clearRooms`), so no exit is left behind.
- When a character dies their box is removed and returns to the shelf (except the Necromancer destroyed by an artifact, see Easter eggs).
- Reset game (under the shelf; the item tray is above the board): tap once to arm ("Tap again to reset", red), tap again within 4 s. Wipes the save: default board (Knight + Wizard), 0 coins, no items, nothing unlocked, Compendium cleared. Saving is switched off during the reset.
- Save entry per box: row, col, weapon, form, color, backwards-speech flag, skin tone, Rogue's Mage tag. Also saved: unlocks `S.un`, `coins`, item inventory `S.inv`, Compendium record `S.seen`, rewards paid `S.rewarded`, bought spaces `S.cells` and how many were bought `S.bought`, secrets revealed by study `S.revealed`, the golden space `S.goldCell`. Not saved: monkey, bear and beast-man forms, the Rogue's disguise and tiny size, sickness, the Necromancer's skeleton follower, crusades, dates and dungeon trips in progress, golden apples, the Alchemist's luck, the temporary Farmer.

## Characters
| Character | Class | Look and room | How you get it |
|---|---|---|---|
| Knight | Fighter (sword tag) | Steel armor (1% bronze, easter egg). Room: armor stand, his random wall weapon (shield, spear, glaive, longsword; kept short so it stays below the name label), back-wall door. | On the shelf |
| Wizard | Mage (star tag) | Random outfit blue/purple/red (black with red trim + red orb = easter egg). Room: big bookshelf (set lower so the name label does not cover it), second bookshelf that slides aside to a dark opening. | On the shelf |
| Priest | Mage | White robes, gold cross; 50% male / 50% female. Room: stained glass window (set lower, below the name label), candle, back-wall door. | On the shelf |
| Necromancer | Mage | Dark green hood, pale skin, skull staff. Room: skull shelves (set lower, below the name label), green candles, back-wall door. | 25% chance whenever a Priest dies (`ODDS.necro`) |
| Fruit Merchant | Merchant (coin tag) | Apron and red cap. Room: red and white striped awning (just below the name label), fruit crates, back-wall door. | Hold 30 coins at once (`MERCHANT_COINS`) |
| Apothecary | Merchant | A woman with long auburn hair, green robe. Room: a window with blue sky, herb planters, potion shelves and counter, back door on the LEFT. Placing her box costs 20 coins (asks first). | Place any Merchant next to any Mage |
| Alchemist | Merchant, plus Mage while any Mage (by tag, so also a tagged Rogue) is next to him (both tags show) | 50% man (beard) / 50% woman (long hair); blue shirt, leather apron, goggles on the head. On the bottom-right space: wild white hair (mad scientist, secret). Room: back door on the LEFT, potions on two shelves, a long table with a bubbling flask over a flame, a glass tube and a bottle. His neighbor effects go by tag (see Arrangement interactions). | Wizard right of the Apothecary brewing together, 5% (`ODDS.alchemist`) |
| Rogue | Fighter | 3 skin tones; dark leather, green hood and face scarf. Room: a wall of disguises on pegs (wizard hat, helmet, red cap, mask, cloak), ninja stars stuck in the wall, a dagger target. No back door: a rope drops from a ceiling hatch (going up: he climbs it) and a trapdoor in the floor (going down: he drops through). | 50 Compendium discoveries (`ROGUE_UNLOCK`) |
| Farmer | Merchant | Straw hat. Room: sky and a fence, no doors at all (people walk straight across its side edges and simply fade out / in for up and down, exit type `fade`); a growing field. Temporary (not on the shelf, not saved). | Fruit Merchant left of Apothecary, 1.5% |

Classes come from `CLASS`, but always check them with `hasClass(u, cls)`: it also counts the Alchemist as a Mage while a Mage is next to him, and the Rogue's Mage tag. Name labels redraw their tags when this changes (`refreshTags`).

Skin tones: every new Knight, Fruit Merchant, Priest and Rogue gets one of 3 skin tones at random when placed (`SKINS`, `SKIN_CHARS`; sprite copies named like `priest_f~2`, picked by `sid`). It is saved with the box. Boxes from older saves keep the original light tone.

Forms that replace a character for a while: Eldritch Knight (permanent, purple armor), Death Knight (permanent until cleansed, skeleton in dark armor; only follows the Necromancer), Monkey (Fruit Merchant, 2 minutes; only hops around and eats bananas), Grizzly Bear (Knight, 30 s, `BEAR_TIME`; only runs around his room), Beast-man (mad-scientist Alchemist, only during his attack; `beastT` turns him back). Death Knights, monkeys, bears and beast-men (`TEMP_FORM`) take no part in other interactions, idles or items, and nobody visits them.

Other conditions: **Sick** (poisoned wine, 60 s, `SICK_TIME`, `u.sickT`): no neighbor scenes either way (`freeU` is false), green bubbles; when it wears off 5% (`ODDS.sickDeath`) the character dies. **Tiny** (Rogue, 2 minutes, `TINY_TIME`, `u.tinyT`): drawn at 60% size and walks 70% faster. **Skeleton follower** (`u.pet`): a small skeleton that trots behind the Necromancer after he sacrifices the Rogue.

Rogue disguise: for 2 minutes (`ROGUE_DISGUISE_TIME`) the Rogue looks like, is named as and acts as another character on the board (`u.as`, read through `idOf(u)`): their scenes, idles and Compendium discoveries. His own box and room stay his. It wears off when he is free (`undisguise`).

Visitors who are not boxes: commoner customer, thief, imp, bats, bees, carnivorous plant, sick farmer, farmer, possessed farmer, ghost, squire, nobles, farmer mob, orc, skeletons, zombies, demon, golem, horse, cat.

## How characters decide (timing)
- Each idle character rolls about every 5-10 seconds (wait after an idle activity 1.5-4 s, after a visit or wander 2-5 s, plus the activity itself).
- Each roll: 20% visit a neighbor (`ODDS.visit`), 40% an idle activity (`ODDS.idle`), the rest wander in their room.
  - Knight or Wizard in Old Friends: 45% visit. Knight with a Priest directly above: x1.6 (Zeal). A Mage next to the Alchemist: x1.2 (`ODDS.alcMage`).
  - Which neighbor: picked at random, except a Fighter next to the Alchemist picks Mage neighbors 50% more often (haste potions, `ODDS.haste`, `pickW`).
  - No free neighbor = wander. No idle activities = wander. Asleep, away on crusade, Death Knight and monkey never roll normally. Sick characters don't visit.
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
- Any side, 5% of their visits (`ODDS.braver`; works for any Fighter): **"You're braver than I."** The Priest says it; the Knight flexes and answers modestly.

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
- Necromancer above: 50/50 **Lightning duel** (black vs blue lightning; they dislike each other: angry faces and insults, no cheering) or **Crafting a scroll** (20 coins, `SCROLL_COST`, paid when it's made; not enough coins = the Wizard shows off frost or the Necromancer a dark orb).
- Necromancer below: **Room swap** (cast). Their boxes trade places.
- Any side, 1% (`ODDS.forge`): **Making an item together.** A free spell scroll or potion (50/50).

### Fruit Merchant & Priest (Priest relative to Merchant)
- Priest left of Merchant: 50/50 (`ODDS.feast`) **Apple** (the Merchant drops an apple; 95% the Priest buys it, +1 coin; 5% he slips on it and dies) or **Feast** (a table of food, two nobles join, everyone eats).
- Priest right of Merchant: hangouts only.
- Priest below Merchant (Merchant above): 50/50 (`ODDS.fruitfall`) **Fruit thrown down** (cast; the Priest gets angry, the Merchant laughs) or **Starfruit** (+5 coins).
- Priest above Merchant (Merchant below): **Cursed fruit** (cast). The Merchant's fruit rots for 60 s; meanwhile nothing he does earns coins.

### Fruit Merchant & Wizard (Merchant relative to Wizard)
- Merchant left: **Wizard advertises.** This is the only coin gain over time: for the next 60 s the coin timer pays 1 coin every 30 s; another advert in that time raises it to 2 (`BOOST_MAX`) and restarts the 60 s. When it runs out, it drops back to nothing.
- Merchant right: 99.5% **Jokes and laughter** (`JOKES`); 0.5% (`ODDS.murder`) **A dark turn**: the Merchant kills the Wizard.
- Merchant above: **A giant banana.** The Wizard magics it huge.
- Merchant below: **Durian.** +10 coins; the Wizard hates the smell.

### Apothecary & Fruit Merchant
- Apothecary left of Merchant: **A gift.** She gives him a potion; it has its usual effect on him (backwards speech toggles).
- Merchant left of Apothecary: 98.5% **Trading wares** (apples for potions); 1.5% (`ODDS.farm`) **A farm appears**: a temporary Farmer box on the nearest empty open cell grows wheat (80%) or apples (20%) for 3 minutes, then harvests for +30 coins (halved to 15 if the Necromancer is next to the Farmer on any side) and disappears.
- Apothecary above Merchant: **Golden apples.** She mixes a bubbling reaction; the apples on his crates turn gold for 60 s (`GOLD_TIME`, `drawGold`; looks only, not saved).
- Apothecary below Merchant: **Talking business** (`BIZ_SLOW`, `BIZ_WELL`). Business is slow (50%, `ODDS.bizSlow`; they end glum) or going well (they end happy).

### Knight & Fruit Merchant
- Knight right of Merchant: **A thief!** Always the Knight who visits. A hooded thief runs in from the side and grabs an apple; the Merchant shouts, the Knight strikes, the thief drops it and flees. The Merchant thanks him.
- Knight left of Merchant: **Out of lemons** (`LEMONS`). Always the Knight who visits. He wants lemons; there are none. He is sad.
- Merchant above Knight: **Green apples.** Sour green apples today; the Knight buys one (+2 coins, `SELL_GAIN`; nothing while the fruit is rotten), makes a sour face, likes it.
- Merchant below Knight: **Rumors** of goblins (90%, `RUMOR_GOBLIN`) or a dragon (10%, `ODDS.dragon`, `RUMOR_DRAGON`). The Knight vows to slay any threat that comes here.

### Knight & Apothecary (Knight relative to Apothecary)
- Knight above: **Grizzly bear.** She gives him a strength tonic; he turns into a bear for 30 s (`BEAR_TIME`): no interactions, idles or items, he just runs around his room. Then he turns back ("Why am I so hairy?").
- Knight below: **Gossip about a Mage** (`KGOSSIP`): about a random Wizard, Priest or Necromancer on the board (or about the lack of Mages).
- Knight right: **A date.** They fade away together for 1 minute (`KDATE_TIME`); back home it went well 80% (`ODDS.kdate`; hearts, happy) or badly (glum). Only a line from the Knight (speech bubble) tells you which; no message at the top.
- Knight left: **Bee swarm!** Bees fill the host's room for 7 s (`BEES_TIME`, `swarms`). The visitor runs home; the host runs to the visitor's room, waits until the bees leave, then walks home.

### Wizard & Apothecary (Wizard relative to Apothecary)
- Wizard right: **Brewing together.** 5% (`ODDS.alchemist`) this unlocks the Alchemist (message, shelf box); once the Alchemist is unlocked, that 5% gives a free potion instead.
- Wizard left: **Brewing gone wrong.** The brew explodes (flash, smoke). 2% (`ODDS.boomDeath`) it kills them both.
- Wizard below: **A date** for 30 s (`WDATE_TIME`); it goes well only 40% (`ODDS.wdate`).
- Wizard above: 40% (`ODDS.imp`) **Imp blood**: he summons a small imp, zaps it and gives her a vial of its blood; 60% **A purple potion**: she brews one, he drinks it and "tastes colors".

### Necromancer & Apothecary (Necromancer relative to Apothecary)
- Necromancer above: **Bats** (cast from his room). Bats flutter around his room; three swoop down into her shop and she shouts at them.
- Necromancer left or right: **Undead ingredients** for a black potion. If the Alchemist is next to the Apothecary, 20% (`ODDS.ntradePotion`) you also get 1 potion.
- Necromancer below: **Dark ritual.** The host's room goes dark, lit by a ring of candles, for 15 s (`RITUAL_TIME`); she kneels, he chants.

### Priest & Apothecary (Priest relative to Apothecary)
- Priest left: **Carnivorous plant.** Her flytrap grows out of control; the Priest smites it three times.
- Priest right: **Studying alchemy** (`PSTUDY`). They read and discuss; 5% (`ODDS.reveal`) they find a clue that shows one hidden easter egg in the Compendium (`revealSecret`, `S.revealed`: shown, but no gold border and not counted as found).
- Priest above: **Sleeping potion.** He drinks her calming tonic and sleeps for 30 s (`PSLEEP_TIME`, like the sleep spell).
- Priest below: **Healing a sick farmer.** A sick farmer comes in through the host's door; holy light plus a potion heal him. 2% (`ODDS.healFarm`) he then sets up a Farmer box nearby.

### Necromancer & Fruit Merchant (Necromancer relative to Merchant)
- Necromancer above: **Blood from above** (cast). A sacrifice in his room drips blood down onto the fruit; the Merchant then goes up and yells at him (`NYELL`).
- Necromancer below: **Loud chanting** (cast). A customer comes into the shop above; the Necromancer's chants (`NCHANTS`) scare them off and the Merchant complains.
- Necromancer right: **A blood orange.** Always the Necromancer who visits. 30% (`ODDS.bloodorange`) there is one (+3 coins, `BLOODORANGE_GAIN`); otherwise sold out.
- Necromancer left: **Rotten fruit** (cast). The fruit rots for 60 s like the Priest's curse (no coins) and worms crawl out (`u.worms`).

### Alchemist & neighbors, by tag (`hasClass`, `alcNext`; Compendium groups them "with a Mage / a Merchant / a Fighter", `tag:mage` etc. in `PAIR_WITH`)
- Any Mage, any side: **Is magic useful?** (`MAGICTALK`, kind `magictalk`; the Mage says the 'mage' lines). Passive: Mages next to him visit 20% more (`ODDS.alcMage`).
- Any Merchant (Fruit Merchant, Apothecary), any side: a new idle, 10% (`ODDS.promo`): **Alchemy sale** - a customer comes in and buys one of the Alchemist's potions instead of the usual wares (+5 coins, `PROMO`).
- Any Fighter, any side: **Haste potions** (passive) - he picks Mage neighbors 50% more often than other neighbors (`ODDS.haste`); a cyan puff and the Compendium tile when it matters.
- Secrets (Alchemist tab): **Two for one** - with him next to the Apothecary, 20% (`ODDS.twopot`) of bought potions come as two. **Mad scientist** - on the bottom-right space he has wild white hair (`alchemist_mad`, `madSci`), and 15% of his idles (`ODDS.beast`) he becomes a **beast-man** and attacks a free neighbor (`beastOut`, kind `beast`): a Merchant-only neighbor dies; a Fighter or Mage fights him and one of them dies (50/50; if he dies his box goes back to the shelf). **Four Mages** - with Mages on all four sides, 10% (`ODDS.fourMage`) he gives one a potion with its usual item effect (kind `fourmage`).

### Rogue & each character (`PAIRS['rogue>X']`, `ROGUE_SCENES`; the Rogue always visits)
- Apothecary: Rogue right = **Nefarious potions** (+5, `ROGUE_BUY`); left = **Poisons** (+5); below = **Poisoned wine** (+5; back home he gives the wine to another free neighbor, `u.thenVisit` -> kind `winegift`: sick 60 s); above = **A clumsy burglary** (he trips and smashes her potions; she is furious).
- Fruit Merchant, any side: **Pinching fruit** (the Merchant turns his back, `lookAway`, and an apple vanishes).
- Priest: Rogue below = **A lecture on morals** (`LECTURE`); above = **Vandalism** (paint splats on the chapel wall, `u.paint`; caught, he scrubs it off); right = **Confession** (`CONFESS`); left = **A demon's whisper** (a small demon tells him to kill the Priest; 5% `ODDS.tempt` he does, else he refuses).
- Knight: Rogue above = **Dungeon crawl** - they leave for 5 minutes (`DUNGEON_TIME`, awayKind 'dungeon') and the Rogue brings back 50 coins 20%, an artifact 10%, 2 scrolls 25%, 3 potions 25% or a revealed secret 20% (`ODDS.dungeon`, `dungeonLoot`; no secret left = 50 coins); below = **Sparring** (sword vs ninja stars); right = **Drinks and laughs** (`DRINKS`); left = **Gossip about the Wizard** (`WGOSSIP`).
- Alchemist: Rogue above or below = **Snatching a potion** (he sneaks in through a ceiling hatch or floor trapdoor, `u.sneak`, grabs a potion and uses it like the item: invisible prank); right = **Volatile potions** (he throws them; explosions); left = **A shrinking potion?** - the Alchemist can't make it, unless the Rogue has the Mage tag: then he is **tiny** for 2 minutes (secret `tiny`).
- Wizard: Rogue above = **Gossip about the Knight** (`RGOSSIP`); below = **Lightning and frost** (the Rogue is jealous, or amazed if he has the Mage tag); right = **Dress-up** (they swap looks, `u.dress`; then the Wizard keeps one of the other two normal robe colors); left = **Light fingers** (you lose 5% of your coins, rounded up, `STEAL_SHARE`).
- Necromancer: Rogue above = **Dark ritual together**; below = **Betrayal!** (80% he escapes in smoke; 20% `ODDS.betray` he is sacrificed and the Necromancer gets a little skeleton follower); right = **Errands and stolen candles** (the Necromancer fades out, the Rogue pockets candles and a skull); left = **Fairy attack!** (good fairies; ninja stars and dark lightning).
- Any side, 0.5% of visit rolls (`ODDS.assassin`): **Assassin.** The Rogue sneaks over half-invisible and kills the neighbor (not while disguised).
- As a Fighter he also gets "You're braver than I." with the Priest, haste potions next to the Alchemist, beats raised skeletons, and gets a funeral.
- Secret: **Graveyard** - the Rogue next to the Necromancer with both on the bottom row: his room is drawn as a graveyard (`graveyardOn`).

### Pairs with only hangouts
Anyone & the Farmer; the Alchemist with a neighbor that has no matching tag scene.

### Rare-chance luck
- Potion on the Alchemist: for 60 s (`ALC_LUCK_TIME`) the rarest scene chances (spar, forge, crusade, tentacles, farm, braver, murder, dragon, Alchemist unlock, reveal, blood orange, assassin, demon's whisper, ...) are 30% higher (`ALC_LUCK`) for him and his neighbors (`luck(p,u,h)`, `lucky`). Meanwhile his square and every box next to it glitter (`drawGlitter`).

### Bigger gatherings
- **Great prayer:** a Priest with all four neighbors free, 5% of his rolls (`ODDS.massPrayer`). All four come to his room, everyone kneels for 20 s under a holy glow, then they go home.
- **Funeral:** when a Fighter next to the Priest dies, 1.5 s later (if he is free and home) the Priest holds a funeral: every free neighbor comes, a gravestone stands in his room, everyone kneels, sad, for 12 s (`FUNERAL_TIME`; same gathering code as the great prayer, `startGather(P, list, 'funeral')`).

## Idle activities
- **Anyone:** 10% of idle activities (`ODDS.wave`, rolled first) the character waves to a neighbor (any side); a free neighbor waves back. The percentages below share the other 90%. (Not shown in the Compendium.)
- **Alchemist** (`ODDS.alchemistIdle`): brew at his table 60% (walks over, colored bubbles), research formulas 10% (reads a thick book), a solution goes wrong and smoke fills the room 30%. Mad scientist only (bottom-right space): 15% the beast-man attack, rolled first.
- **Rogue** (`ODDS.rogue`): throw daggers at his target 50%, smoke bomb 20% (vanishes, reappears elsewhere in the room), disguise 5% (see Characters), count his stash 25% (says your coin total). With the Mage tag: 0.2% (`ODDS.rogueArtifact`, rolled first) he conjures an artifact, which uses up the tag.
- **Knight:** weapon practice 75% (walks to the middle first; the arm swings with the weapon; with a shield, a squire comes in and spars with a wooden sword while he blocks), fight an orc in a neighbor's room 20%, feed a horse 5% (needs no box to his right). Eldritch Knight only: 1% a black cat walks through the Wizard's room.
- **Wizard:** read 60%, practice magic 38%, summon a demon 2% (it drags him down; he dies). Next to a Merchant with 5 coins: 1% he brews a potion (-5 coins, +1 potion).
- **Priest:** kneel and pray 50% (golden ceiling light), bless a farmer 35%, tithe prayer 10% (+5 coins), exorcism 5%. Also the funeral (see Bigger gatherings).
- **Necromancer:** commune with spirits 50%, candles and chalk circle 25%, red lightning 24%, raise a skeleton in another character's room 1% (Fighters and Mages beat it; anyone else dies).
- **Fruit Merchant and Apothecary next to the Alchemist:** 10% the Alchemy sale (see Alchemist & neighbors), rolled before their own idles.
- **Fruit Merchant:** a customer comes in 15% (a commoner walks in through his back door and buys fruit, +2 coins `CUSTOMER_FRUIT`; nothing while his fruit is rotten), call out adverts 55%, sell apples to a neighbor 29% (+2 coins), a mob of farmers pelts him with fruit 1%.
- **Apothecary:** a customer comes in 15% (a commoner walks in through her left door and buys a remedy, +5 coins `CUSTOMER_REMEDY`), trip 5%, trip and smash a potion 5%, brew potions 35% (just for show), water and pick herbs 40%.
- **Farmer:** until harvest, 50% he whistles (music notes) while hoeing, 50% he carries a pitchfork across his field. (The Farmer has no Compendium tab, so these have no tiles.)

## Items, coins and shops
- Items are a counted inventory (`S.inv`), not infinite: you start with none and earn them in the game. Drag one onto a room; it works only if the owner is home and not busy. If it does nothing it is not used up (grey puff).
- **Spell scroll:** Wizard = fireball destroys a random neighboring room and everyone in it; Knight = golden glow 30 s; Priest = banishes a ghost; Necromancer = raises a skeleton next door (its own Compendium tile `nscroll`, separate from his 1% idle); Fruit Merchant = monkey for 2 minutes; Apothecary = +1 potion; Alchemist = has no idea what it is and tears it up (used up); Rogue = gains the Mage tag (saved; does nothing if he already has it).
- **Potion:** Wizard = teleports to a random character anywhere, does one of their scenes (`POTION_KINDS`), portals home; Knight = flexes; Priest = angel wings 30 s; Necromancer = sniffs it and smashes it on the wall; Fruit Merchant = speaks backwards until another potion; Apothecary = +10 coins; Alchemist = rare-chance luck for 1 minute (see Arrangement interactions); Rogue = turns invisible, slips (no portal) to a random free character anywhere, shouts BOO, slips home (`rogueSpook`); anyone asleep = wakes up.
- **Artifact:** Priest easter egg (see below). Alchemist: 80% (`ODDS.stone`) a philosopher's stone turns a random open board space golden (`S.goldCell`, saved, gold tint): coins earned there are doubled (`inGold`, in `addCoins`); 20% it is the elixir of life: he drinks it and retires (box removed, Alchemist locked again) and you find a secret (`elixir`).
- **Coins:** no passive gain any more. Coins come only from the Wizard's advertising (1-2 every 30 s for a minute), scenes (tithe, sales, customers, alchemy sale, the Rogue's purchases, starfruit, durian, blood orange, crusade, dungeon, farm) and Compendium rewards. The Rogue's light fingers take 5% away.
- **Where items come from:** scrolls from Necromancer + Wizard crafting (20 coins), their 1% joint making, the Wizard's writing desk (50 coins; 30 for the black Wizard), or the dungeon; potions from the Apothecary (30 coins; sometimes two, see the Alchemist), the Wizard brewing next to a Merchant (5 coins), the joint making, a scroll on the Apothecary, or the dungeon; artifacts from the crusade, the dungeon, or the Rogue's conjuring.
- **Shops:** a shop room shows a small, still gold coin button tucked into its bottom-right corner, just inside the black border (`drawShopCoin`, drawn on top of everything; `onShopCoin` checks taps in the corner). Tap it in the Apothecary's room to buy a potion; in the Wizard's room while his writing desk shows (a Merchant AND another Mage next to him) to buy a scroll. It works any time: if the Wizard is busy or away, the scroll is ready straight away instead of him writing it. Tapping elsewhere in the room just makes the character hop. Every purchase asks first in the in-page popup (`ask`; not the browser pop-up); not enough coins shows a message.
- **Board spaces** are also bought with coins (see Board, boxes and saving).

## Transitions between rooms
- Left/right: the Wizard always uses portals; everyone else walks through the side door (seen edge-on, it swings out into the next room).
- The farm has no doors: left/right into or out of the Farmer's room is a plain walk across the edge, and up/down is a fade (`fade`).
- Up/down are set per ROOM in `TR`: Knight, Priest, Necromancer and Fruit Merchant rooms = back-wall door (opens onto plain black, no stairs drawn); Apothecary and Alchemist = the same door on the left (`backdoorL`); Wizard = a bookshelf that slides aside to a black opening; Rogue = up by a rope from a ceiling hatch (`rope`, he climbs as he fades), down through a floor trapdoor (`trapdoor`, he drops as he fades); Farmer = fade. Leave by your room's exit, arrive by the other room's.
- Not neighbors (potion teleport return): a pair of portals.

## Unlocks and easter eggs
- Necromancer: 25% when a Priest dies. Fruit Merchant: hold 30 coins. Apothecary: any Merchant next to any Mage. Alchemist: 5% of the Wizard's brewing with the Apothecary (Wizard right of her). Rogue: 50 Compendium discoveries. Unlocks last until Reset.
- Easter eggs (hidden in the Compendium until found, counted in totals; `EGGS`, `checkEggs`):
  - **Black Wizard:** a Wizard dragged onto the top-left cell on his first placement wears black with a red orb (tapping the shelf never does this). That cell starts locked, so it has to be bought first.
  - **Bronze Knight:** 1% of Knights get bronze armor.
  - **Skulls:** the Necromancer's floor is littered with skulls while his box is on the bottom row.
  - **Artifact on the Priest** while the Necromancer is his neighbor: the Necromancer is destroyed AND removed from the shelf; he must be unlocked again by a Priest dying.
  - **Elixir of life:** 20% of artifacts used on the Alchemist (see Items).
  - Alchemist: **Two for one**, **Mad scientist**, **Beast-man**, **Four Mages** (see Alchemist & neighbors). Rogue: **Tiny Rogue** (shrinking potion with the Mage tag) and **Graveyard**.
  - Secrets can also be revealed (shown, not found) by the Priest and Apothecary's studies or the Rogue's dungeon loot.

## Compendium tab
- Tabs per character (`COMP_TABS`): Knight, Wizard, Priest, Necromancer, Fruit Merchant, Apothecary, Alchemist (his tag scenes are grouped "with a Mage / a Merchant / a Fighter": `PAIR_WITH` uses `tag:mage` etc.), Rogue (the assassin is grouped "with anyone": `PAIR_WITH` uses 'anyone').
- Under the tabs, a **Tags** line (`TAG_NOTES`) says the character's class tags and what changes them (the Alchemist next to a Mage, the Rogue's spell scroll and disguise). Only unlocked characters get a tab, and a neighbor scene only shows once both of its characters are unlocked (`PAIR_WITH`), so locked characters stay a surprise; the "Discovered" line counts only what is shown. Each lists everything that character takes part in (shared scenes appear in both tabs), grouped as With neighbors / Idle activities / Items and shops / Secrets, with found / total counts (totals include hidden easter eggs).
- With neighbors is split into one sub-section per neighbor ("with the Knight", ...), in alphabetical order. Who takes part in each neighbor scene comes from `PAIR_WITH` (data.js); add new pair scenes there too.
- Secrets (easter eggs) are their own group at the bottom of a tab: hidden until found ("Not found yet" until then) or revealed by the Priest and Apothecary's studies (`S.revealed`: shown without a gold border), but always counted.
- 50 discoveries (`ROGUE_UNLOCK`, counted over every Compendium entry) unlock the Rogue.
- Tiles show the chance in the top right (from `ODDS`), icons in the bottom left for anything a scene gives you (`GAINS`), and a gold border once it has happened (`markSeen`, `S.seen`). Found easter eggs get a purple dashed outline.
- Hover over a tile (mouse) or tap it (phones) for a short description from `DESC` (data.js) in a bubble (`showTip`); tap again or anywhere else to close. Descriptions say where the boxes go and what happens, with a little humor.
- Every 5 different discoveries pay 10 coins (`DISCOVER_EVERY`, `DISCOVER_REWARD`, `S.rewarded`).
- Whenever an interaction, idle activity or item effect is added or changed: add it to `COMP_TABS` (and `PAIR_WITH` for neighbor scenes), write its `DESC` text, give it a tile in `buildRef`/`idleTile`/`pairDiagram`, and make sure the game calls `markSeen` for it.

## Drawing and animation conventions
- Pixel art: 16x22 character grid drawn from rectangles with an automatic dark outline. Rooms have plain walls and floor, a background element for the class, and their up/down exit. Fantasy medieval theme.
- Arms come from poses (`POSE`: none, hold, noR, fwd, up, wave, both, pray, flex, flex2); `poseOf` picks one per activity. Short gestures use `gest`. Anyone kneeling uses `pray`: palms pressed together in front of the chest, outlined so they stand out.
- Walking: legs and boots step apart in two frames (`stepLegs`, `stepOf`; the last argument of `spr`). Used for characters, visiting farmers, crowds and walking Compendium tiles.
- Moods: ok, happy, mad (red eyes; real anger and monsters only), hurt (eyes shut; taking damage), shock (wide eyes; surprise), sleep. Never use red eyes for surprise. Characters blink now and then (`blinkMood` briefly shows the sleep face).
- Rooms have small moving details (`drawRoomLife`): flickering candle flames (Priest, Necromancer), a cloud drifting past the Apothecary's window, a sparkle on the Wizard's books.
- Visitors stand at least 30px beside their host (`standBy`). Hops start from the ground (`u.hd`). Facing only flips when the other is clearly to one side.
- Knight weapons are only drawn while used, and are clipped to his room.
- Extra people in a scene live in `u.crowd`; a single helper in `u.npc`.
- The class tag after each name comes from `CLASS` / `TAG_ICON`.

## Planned
Achievements and unlockables, more character classes, customizable dialogue, more interactions, buying items with coins, real pixel art assets.

## Working style
- Make small changes and test each one. Explain changes in plain language; the owner is a beginner.
- Many functions are written on one line: never put a `//` comment in the middle of such a line (it hides the rest of the line). Put comments on their own line or at the very end.
- Keep this file up to date as one current reference (not a change log): when something changes, edit the section it belongs in.
- Use git; commit after each working change. Commit as Forests999 with the GitHub noreply email (already set in this repo's git config); never use the owner's real name or email.
- Ask before pushing, since pushing publishes to the public site.
- Before every push, raise the release number `?v=` in `index.html` (on style.css, data.js, art.js and game.js, all four the same, e.g. 10 -> 11) so browsers and phones load the new files instead of old cached ones.
