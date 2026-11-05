// ---------- data: constants, characters, rules data ----------
const CELL=96,COLS=5,ROWS=4,FY=84,KEY='cubehold-v4',O='#1a1226',S1='#f0c8a0',S2='#d8a880';
// Body without arms. Arms come from POSE so they can move.
const B=o=>[[4,19,3,2,o.boot||'#3a2a1a'],[9,19,3,2,o.boot||'#3a2a1a'],[5,16,2,3,o.pants||'#4a4a5a'],[9,16,2,3,o.pants||'#4a4a5a'],[4,10,8,6,o.body],[10,10,2,6,o.bodyD],[4,14,8,1,o.belt||'#5a3a1e'],[5,3,6,6,o.skin||S1],[9,3,2,6,o.skinD||S2]];
// Arm poses on the 16x22 grid (facing right). a = colors {body, bodyD, skin}.
// A 6th value of 1 means "in front of the body" (drawn after it), e.g. hands pressed together.
const POSE={
 none:a=>[[2,10,2,5,a.body],[12,10,2,5,a.bodyD],[2,15,2,1,a.skin],[12,15,2,1,a.skin]],
 hold:a=>[[2,10,2,3,a.body],[12,10,2,3,a.bodyD],[3,12,1,2,a.skin],[12,12,1,2,a.skin]], // both hands at the chest (book)
 noR:a=>[[2,10,2,5,a.body],[2,15,2,1,a.skin]],                                          // right arm drawn separately (swinging a weapon)
 fwd:a=>[[2,10,2,5,a.body],[12,10,3,2,a.bodyD],[2,15,2,1,a.skin],[15,10,1,2,a.skin]],  // right arm straight out
 up:a=>[[2,10,2,5,a.body],[12,6,2,5,a.bodyD],[2,15,2,1,a.skin],[12,5,2,1,a.skin]],     // right arm raised
 both:a=>[[2,6,2,5,a.body],[12,6,2,5,a.bodyD],[2,5,2,1,a.skin],[12,5,2,1,a.skin]],     // both arms raised
 pray:a=>[[2,10,2,3,a.body],[12,10,2,3,a.bodyD],[4,12,3,1,a.body,1],[9,12,3,1,a.bodyD,1],[7,11,2,2,a.skin,1]], // hands together
 flex:a=>[[0,10,3,2,a.body],[0,7,2,3,a.body],[0,6,2,1,a.skin],[13,10,3,2,a.bodyD],[14,7,2,3,a.bodyD],[14,6,2,1,a.skin]],          // showing muscles
 flex2:a=>[[0,10,3,2,a.body],[0,7,2,3,a.body],[1,8,2,2,a.body],[0,6,2,1,a.skin],[13,10,3,2,a.bodyD],[14,7,2,3,a.bodyD],[13,8,2,2,a.bodyD],[14,6,2,1,a.skin]] // bigger bulge
};
const KC={body:'#8a94a8',bodyD:'#667088',pants:'#4a5470',boot:'#2a2a3a',belt:'#a0782a'},
 EC={body:'#3a2f66',bodyD:'#2a2150',pants:'#2a2150',boot:'#1a1430',belt:'#6a4cc2'},
 OC={body:'#5a4a3a',bodyD:'#42362a',skin:'#6a9a3a',skinD:'#4a7a2a',pants:'#3a2a1a',boot:'#2a1a10',belt:'#2a1a10'},
 PC={body:'#ececf4',bodyD:'#c4c4d4',pants:'#c4c4d4',boot:'#5a4a3a',belt:'#d8b860'},
 NC={body:'#2a3a2a',bodyD:'#1a2a1a',pants:'#1a2a1a',boot:'#101810',belt:'#6a8a4a',skin:'#c8d0b8',skinD:'#a8b098'};
const arms=o=>({body:o.body,bodyD:o.bodyD,skin:o.skin||S1});
// Wizard outfits. A new wizard gets one of WIZ_RANDOM at random (equal chances).
// Hidden easter egg: a wizard whose very first placement is the top-left cell wears black with a red orb.
const WIZ_COLORS={
 blue:{body:'#2f5fb8',bodyD:'#244a90',hat:'#3f7ad8'},
 purple:{body:'#5a3ca8',bodyD:'#46308a',hat:'#6a4cc2'},
 red:{body:'#b03838',bodyD:'#8a2a2a',hat:'#cc4a4a'},
 black:{body:'#26242e',bodyD:'#18161e',hat:'#34313e',orb:'#ff3030'}};
const WIZ_RANDOM=['blue','purple','red'];
function wizardCH(col){const P=WIZ_COLORS[col],C={body:P.body,bodyD:P.bodyD};
 return {name:'Wizard',eye:O,a:arms(C),p:[...B(C),[4,10,8,9,P.body],[10,10,2,9,P.bodyD],[4,14,8,1,'#f2c84a'],[6,9,4,3,'#e8e8f0'],[3,3,10,2,P.hat],[5,1,6,2,P.hat],[7,0,3,1,P.hat],[5,3,6,1,'#f2c84a'],[1,5,1,15,'#8a5a2a'],[0,3,3,3,P.orb||'#7ff0ff']]}}
// Knights hold no weapon here; weapons are drawn only while practicing or fighting (drawAct in art.js).
const CH={
 knight:{name:'Knight',eye:O,a:arms(KC),p:[...B(KC),[4,1,8,3,'#aab4c8'],[4,4,1,4,'#8a94a8'],[11,4,1,4,'#667088'],[7,0,2,2,'#c03030']]},
 eknight:{name:'Eldritch Knight',eye:'#c890ff',a:arms(EC),p:[...B(EC),[4,1,8,3,'#4a3f7a'],[4,4,1,4,'#3a2f66'],[11,4,1,4,'#2a2150'],[3,0,2,3,'#8a5ae0'],[11,0,2,3,'#8a5ae0'],[1,9,3,2,'#6a4cc2'],[12,9,3,2,'#6a4cc2']]},
 wizard:wizardCH('purple'),
 // Priest: white robes, gold rope belt, gold cross necklace
 priest:{name:'Priest',eye:O,a:arms(PC),p:[...B(PC),[4,10,8,9,PC.body],[10,10,2,9,PC.bodyD],[4,14,8,1,PC.belt],[5,1,6,2,'#7a5a3a'],[5,3,1,2,'#7a5a3a'],[10,3,1,2,'#7a5a3a'],[6,10,1,1,'#f2c84a'],[9,10,1,1,'#f2c84a'],[7,11,2,4,'#f2c84a'],[6,12,4,1,'#f2c84a']]},
 // Necromancer: dark green hooded robe, pale skin, skull staff
 necromancer:{name:'Necromancer',eye:'#7aff7a',a:arms(NC),p:[...B(NC),[4,10,8,9,NC.body],[10,10,2,9,NC.bodyD],[4,14,8,1,NC.belt],[4,1,8,2,NC.bodyD],[3,3,2,6,NC.bodyD],[11,3,2,6,NC.bodyD],[5,3,6,1,NC.bodyD],[1,6,1,14,'#4a3a2a'],[0,2,3,4,'#e8e4d0'],[0,3,1,1,O],[2,3,1,1,O]]},
 orc:{name:'Orc',eye:'#ffd34e',a:arms(OC),p:[...B(OC),[4,2,8,3,'#3a3a2a'],[5,8,1,2,'#f0ead0'],[10,8,1,2,'#f0ead0'],[13,3,2,13,'#6a4420'],[12,1,4,5,'#7a5a30']]},
 skeleton:{name:'Skeleton',eye:'#7aff7a',p:[[5,15,2,5,'#e8e4d0'],[9,15,2,5,'#e8e4d0'],[4,19,3,1,'#e8e4d0'],[9,19,3,1,'#e8e4d0'],[5,13,6,2,'#d8d4c0'],[7,9,2,5,'#d8d4c0'],[5,9,6,1,'#e8e4d0'],[5,11,6,1,'#e8e4d0'],[2,9,2,6,'#e8e4d0'],[12,9,2,6,'#e8e4d0'],[5,2,6,6,'#e8e4d0'],[6,7,4,1,'#c8c4b0']]},
 demon:{name:'Demon',eye:'#ffd34e',p:[[0,5,3,9,'#6a1a1a'],[13,5,3,9,'#6a1a1a'],[4,17,3,3,'#8a2020'],[9,17,3,3,'#8a2020'],[4,10,8,8,'#b82a2a'],[6,12,4,5,'#d86a4a'],[2,10,2,6,'#b82a2a'],[12,10,2,6,'#b82a2a'],[4,3,8,7,'#d03a3a'],[3,0,2,4,'#2a1a1a'],[11,0,2,4,'#2a1a1a'],[14,15,1,6,'#2a1a1a']]}
};
for(const c in WIZ_COLORS)CH['wizard_'+c]=wizardCH(c);
// Visitors who aren't boxes: a common farmer (Priest idles) and a ghost (scroll on the Priest)
const FC={body:'#8a6a44',bodyD:'#6a5034',pants:'#4a6a9a',boot:'#3a2a1a',belt:'#4a6a9a'};
CH.farmer={name:'Farmer',eye:O,a:arms(FC),p:[...B(FC),[5,10,1,4,'#4a6a9a'],[10,10,1,4,'#4a6a9a'],[3,2,10,2,'#d8b860'],[5,0,6,2,'#d8b860'],[5,2,6,1,'#a8883a']]};
CH.ghost={name:'Ghost',eye:O,p:[[3,2,10,14,'#e8eef8'],[2,6,12,10,'#e8eef8'],[2,16,3,3,'#e8eef8'],[6,16,3,2,'#e8eef8'],[10,16,3,3,'#e8eef8'],[11,3,2,12,'#c8d0e0']]};
// Undead and magic creatures summoned in interactions
const ZC={body:'#5a6a4a',bodyD:'#46553a',pants:'#3a3a4a',boot:'#2a2a2a',belt:'#3a2a1a',skin:'#8aaa6a',skinD:'#6a8a4a'};
CH.zombie={name:'Zombie',eye:'#d0ff60',a:arms(ZC),p:[...B(ZC),[6,12,2,2,'#2a2a2a'],[5,2,6,1,'#3a3a2a'],[9,15,2,1,'#2a2a2a']]};
CH.golem={name:'Clay golem',eye:'#ffd060',p:[[2,8,12,10,'#a8744a'],[10,8,4,10,'#8a5a34'],[4,2,8,7,'#a8744a'],[9,2,3,7,'#8a5a34'],[0,9,3,8,'#a8744a'],[13,9,3,8,'#8a5a34'],[3,18,4,3,'#8a5a34'],[9,18,4,3,'#8a5a34'],[6,11,4,1,'#6a4424'],[5,14,2,2,'#c89468']]};
// Death Knight: a skeleton in dark armor (a Knight changed by the Necromancer). Follows the Necromancer around.
const DC={body:'#3a3a46',bodyD:'#2a2a34',pants:'#2a2a34',boot:'#1a1a22',belt:'#6a1a1a',skin:'#e8e4d0',skinD:'#c8c4b0'};
CH.dknight={name:'Death Knight',eye:'#ff3030',a:arms(DC),p:[...B(DC),[4,1,8,2,'#4a4a56'],[3,0,1,3,'#2a2a34'],[12,0,1,3,'#2a2a34'],[1,9,3,2,'#4a4a56'],[12,9,3,2,'#4a4a56'],[5,11,6,1,'#e8e4d0'],[5,13,6,1,'#c8c4b0'],[7,7,2,1,O]]};

// Class tags shown as a small symbol next to each name. Merchants: coin, Fighters: sword, Mages: magic star.
const CLASS={knight:'fighter',wizard:'mage',priest:'mage',necromancer:'mage',merchant:'merchant'};
const TAG_ICON={ // 7x7 pixel icons: [x,y,w,h,color]
 merchant:[[2,0,3,1,'#f2c84a'],[1,1,5,5,'#f2c84a'],[2,6,3,1,'#f2c84a'],[0,2,1,3,'#f2c84a'],[6,2,1,3,'#f2c84a'],[3,2,1,3,'#b8862a']],
 fighter:[[3,0,1,5,'#e0e6f0'],[1,4,5,1,'#d8b040'],[3,5,1,2,'#8a5a2a']],
 mage:[[3,0,1,7,'#c890ff'],[0,3,7,1,'#c890ff'],[2,2,3,3,'#f0e0ff'],[1,1,1,1,'#c890ff'],[5,1,1,1,'#c890ff'],[1,5,1,1,'#c890ff'],[5,5,1,1,'#c890ff']]};
// Character boxes on the shelf. The Necromancer only appears once unlocked (see ODDS.necro).
const SHELF_CHARS=['knight','wizard','priest'];
const ITEMS=['scroll','potion','artifact']; // consumables: a counted inventory, earned in the game (artifacts are used later; for now only the Priest easter egg)

// Left/right: the Wizard always uses his portals; everyone else walks through the side door.
// Up/down: each ROOM's own stairs. Leave by your room's exit and arrive by the other room's exit.
const TR={merchant:{up:'backdoor',down:'backdoor'},knight:{up:'backdoor',down:'backdoor'},wizard:{up:'shelf',down:'shelf'},priest:{up:'backdoor',down:'backdoor'},necromancer:{up:'backdoor',down:'backdoor'}};
// Where those up/down exits sit in a room: x across, y = their base, ay = where a character stands to use them.
const EXIT={backdoor:{x:72,y:66,ay:69},shelf:{x:68,y:66,ay:69}};
const WEAPONS=['shield','spear','glaive','longsword'];

// Neighbor interactions. Key 'a>b' = character a's position relative to b (left/right/above/below) -> interaction.
const PAIRS={
 'wizard>knight':{left:'friend',right:'learn',above:'bolt',below:'chat'},
 'priest>wizard':{right:'study',left:'gossip',below:'undead',above:'light'},
 'priest>knight':{above:'zeal',right:'pray',below:'bless',left:'sermon'},
 // 'none' = these two never visit each other. 'aboveW' = 50/50 lightning duel or crafting a scroll.
 'necromancer>knight':{left:'sleep',above:'dknight',right:'horde',below:'nchat'},
 'necromancer>priest':{left:'none',right:'none',below:'purge',above:'debate'},
 'necromancer>wizard':{above:'aboveW',left:'golem',right:'tomes',below:'swap'}};
// Potion on the Wizard: he teleports to a random character and does one of these with them
const POTION_KINDS={knight:['friend','learn','chat','spar'],priest:['study','gossip','undead','light'],necromancer:['duel','craft','golem','tomes']};
// Items are collected through the game (not infinite). Crafting a scroll costs SCROLL_COST coins.
const SCROLL_COST=20,SLEEP_TIME=60;

// Odds. Every few seconds each idle character rolls once:
// visit a neighbor (visit, or visitFriend when Old Friends), else an idle activity (idle), else wander.
// spar = share of Knight/Wizard visits that become friendly sparring (any arrangement).
// hangout = share of the remaining visits that are plain hangouts with no special event.
// zeal = extra visit chance for a Knight with a Priest directly above him (+60%).
// tentacle = share of 'sermon' visits (Priest left of Knight) that are an eldritch tentacle attack instead.
// necro = chance a dying Priest unlocks the Necromancer box on the shelf.
// wizard/knight = how the idle activity is picked. horse needs no box to the Knight's right.
// eknightCat = extra chance the Eldritch Knight's idle activity is the black cat (needs a Wizard on the board).
// priest/necromancer = how their idle activity is picked.
const ODDS={visit:.2,visitFriend:.45,spar:.02,hangout:.25,idle:.4,zeal:.6,tentacle:.1,necro:.25,
 wizard:{read:.6,magic:.38,demon:.02},
 knight:{prac:.75,orc:.2,horse:.05},
 priest:{pray:.5,farmer:.35,tithe:.1,exorcise:.05},
 necromancer:{spirits:.5,candles:.25,lightning:.24,raise:.01},
 eknightCat:.01};
// Coins: +1 every COIN_EVERY seconds while the game is open; the Priest's tithe prayer gives TITHE.
const COIN_EVERY=30,TITHE=5;
// Wizard brewing next to a Merchant costs BREW_COST coins; a crusade lasts CRUSADE_TIME seconds; holding MERCHANT_COINS coins at once unlocks the Fruit Merchant.
const BREW_COST=5,CRUSADE_TIME=120,CRUSADE_GOLD=10,MERCHANT_COINS=30;
Object.assign(ODDS,{wizBrew:.01,forge:.01,crusade:.02,crusadeGold:.7,bronze:.01});
const $=s=>document.querySelector(s),pick=a=>a[Math.floor(Math.random()*a.length)],cl=(v,a,b)=>Math.min(b,Math.max(a,v));

const TALK=[
 [['knight','Remember the dragon at Ashfell?'],['wizard','My beard still smells of smoke.'],['knight','You froze that bridge in a heartbeat.'],['wizard','And you held it alone until dawn.']],
 [['wizard','The Barrow Downs were your idea.'],['knight','And you woke the dead.'],['wizard','A small miscalculation!'],['knight','We still won the day, old friend.']]];
const GOSSIP=[
 [['priest','Have you seen the Knight polish his helmet?'],['wizard','Three times a day! He thinks nobody notices.'],['priest','I saw him wink at his own reflection.'],['wizard','Say nothing. It is his only joy.']],
 [['wizard','The Knight fed my spell herbs to his horse.'],['priest','The horse did seem rather enlightened.'],['wizard','It sneezed sparks all evening.'],['priest','I shall pray for that horse.']],
 [['priest','Someone keeps borrowing my candles.'],['wizard','The Necromancer, surely. Black wax!'],['priest','He says it is for ambience.'],['wizard','Ambience. Of course it is.']]];
const PRAYERS=[
 ['May your blade stay sharp','and your heart stay kind.','Go in peace, brave knight.'],
 ['Light guard your steps','through dark halls and long nights.','Amen.'],
 ['Bless this armor','and the one who wears it.','Now go eat something.']];
const NAMES={friend:'Old Friends',learn:'Eldritch Awakening',bolt:'Thunderstruck',chat:'Tales of Old',spar:'Friendly sparring',
 study:'Reading together',gossip:'Gossip',undead:'Accidental undead',light:'Holy light vs darkness',
 zeal:'Zeal: Knight visits 60% more',pray:'Praying together',bless:'Holy water blessing',sermon:'A short prayer',tentacle:'Eldritch tentacles',
 read:'Reading',magic:'Practicing magic',demon:'Summoning a demon',prac:'Weapon practice',orc:'Fighting an orc',horse:'Feeding the horse',cat:'Black cat',
 fireball:'Scroll on Wizard: fireball',glow:'Scroll on Knight: golden glow',teleport:'Potion on Wizard: teleport visit',flex:'Potion on Knight: flex',
 banish:'Scroll on Priest: banish a ghost',wings:'Potion on Priest: angel wings',nscroll:'Scroll on Necromancer: raise a skeleton',sniff:'Potion on Necromancer: smashed in disgust',
 pray1:'Praying',farmer:'Blessing a farmer',tithe:'Prayer for coins',exorcise:'Exorcism',
 spirits:'Communing with spirits',candles:'Candles and chalk circle',lightning:'Red lightning spell',raise:'Raising a skeleton next door',
 scroll:'Spell scroll',potion:'Potion',coin:'Gold coins'};
const NECRO_TALK=[
 [['necromancer','Remember the siege of Grimhollow?'],['knight','You raised the fallen to hold the gate.'],['necromancer','And you held it with them till dawn.'],['knight','Strange allies. Good friends.']],
 [['knight','The bone dragon of Saltmarsh...'],['necromancer','Technically, I only borrowed it.'],['knight','It ate my best horse.'],['necromancer','It said the horse was delicious.']]];
const DEBATE=[
 [['priest','Holy light guides every soul!'],['necromancer','Every soul ends in the dark.'],['priest','The dark is only light forgotten!'],['necromancer','Then I remember it fondly.']],
 [['necromancer','Death is the only true power.'],['priest','Life is the greater miracle!'],['necromancer','Life is just death warming up.'],['priest','I will pray for you. Loudly.']]];
NAMES.sleep='Sleep spell (everyone to his right, 1 min)';NAMES.dknight='Death Knight';NAMES.horde='Undead horde (5% the Knight dies)';NAMES.nchat='Old friends, old stories';
NAMES.purge='Ghosts or zombies to purge';NAMES.debate='Holy vs unholy argument';NAMES.duel='Lightning duel';NAMES.craft='Crafting a scroll (20 coins)';NAMES.golem='Clay golem escapes';NAMES.tomes='Reading tomes together';NAMES.swap='Swapping rooms';
// The Priest's blessing for a visiting farmer
const FARM_PRAYER=['Bless your fields and your flock.','May your harvest be plenty.'];

// ---------- variants and the Fruit Merchant ----------
// Knight armor: steel normally, bronze 1% of the time (easter egg). Stored in the unit's color.
const BC={body:'#b07a3a',bodyD:'#8a5a2a',pants:'#6a4a2a',boot:'#3a2a1a',belt:'#d8b860'};
CH.knight_steel=CH.knight;
CH.knight_bronze={name:'Knight',eye:O,a:arms(BC),p:[...B(BC),[4,1,8,3,'#c89050'],[4,4,1,4,'#b07a3a'],[11,4,1,4,'#8a5a2a'],[7,0,2,2,'#2a6ac0']]};
// Priest: 50% male (short hair), 50% female (long hair)
CH.priest_m=CH.priest;
CH.priest_f={name:'Priest',eye:O,a:CH.priest.a,p:[...CH.priest.p.filter(r=>r[4]!=='#7a5a3a'),[4,1,8,2,'#8a5a32'],[4,3,1,8,'#8a5a32'],[11,3,1,8,'#8a5a32'],[5,3,6,1,'#8a5a32']]};
// Fruit Merchant: a Merchant. Unlocked by holding MERCHANT_COINS coins at once. No special mechanics yet.
const MC={body:'#d8c8a0',bodyD:'#b8a880',pants:'#5a4a3a',boot:'#3a2a1a',belt:'#4a8a3a'};
CH.merchant={name:'Fruit Merchant',eye:O,a:arms(MC),p:[...B(MC),[5,11,6,6,'#4a8a3a'],[6,12,4,1,'#6aaa5a'],[4,1,8,2,'#c04040'],[3,2,10,1,'#a02a2a'],[6,8,4,1,'#5a3a2a']]};
NAMES.brew='Brewing a potion (next to a Merchant, 5 coins)';NAMES.forge='Making a scroll or potion';NAMES.crusade='Holy crusade (2 min)';NAMES.cleanse='Cleansing the Death Knight';
NAMES.relic='Artifact on Priest: destroy the Necromancer';NAMES.artifact='Artifact';NAMES.merchant='Fruit Merchant';

// ---------- Squire, nobles, Apothecary ----------
// Squire: sparring partner who comes in while the Knight trains with his shield
const SQ={body:'#6a8ac0',bodyD:'#4a6a9a',pants:'#5a4a3a',boot:'#3a2a1a',belt:'#8a6a3a'};
CH.squire={name:'Squire',eye:O,a:arms(SQ),p:[...B(SQ),[5,2,6,2,'#c89050'],[5,4,1,2,'#c89050']]};
// Nobles who join the Priest's feast
const NB1={body:'#8a2a5a',bodyD:'#6a1a44',pants:'#3a2a4a',boot:'#2a1a2a',belt:'#f2c84a'},NB2={body:'#2a5a8a',bodyD:'#1a446a',pants:'#3a3a4a',boot:'#2a2a2a',belt:'#f2c84a'};
CH.noble1={name:'Noble',eye:O,a:arms(NB1),p:[...B(NB1),[5,1,6,2,'#f2c84a'],[5,0,1,1,'#f2c84a'],[7,0,2,1,'#f2c84a'],[10,0,1,1,'#f2c84a'],[4,3,1,5,'#5a3a2a'],[11,3,1,5,'#5a3a2a']]};
CH.noble2={name:'Noble',eye:O,a:arms(NB2),p:[...B(NB2),[4,1,8,2,'#2a2a3a'],[3,3,10,1,'#2a2a3a'],[6,8,4,1,'#6a4a2a']]};
// Apothecary (Merchant): tap its room to buy a potion. Unlocked when any Merchant is placed next to a Mage.
const AP={body:'#4a7a5a',bodyD:'#3a5a44',pants:'#4a3a2a',boot:'#2a1a10',belt:'#8a6a3a'};
CH.apothecary={name:'Apothecary',eye:O,a:arms(AP),p:[...B(AP),[4,10,8,9,AP.body],[10,10,2,9,AP.bodyD],[4,14,8,1,AP.belt],[4,1,8,2,'#6a5a3a'],[5,3,1,3,'#b8b8b0'],[10,3,1,3,'#b8b8b0'],[11,13,3,4,'#8a6a3a'],[12,12,1,1,'#d03050']]};
CLASS.apothecary='merchant';TR.apothecary={up:'backdoor',down:'backdoor'};
// Priest left of the Fruit Merchant (= Merchant right of the Priest): 50% apple scene, 50% feast.
PAIRS['priest>merchant']={left:'appleshop'};
Object.assign(ODDS,{merchant:{advert:.7,sell:.29,mob:.01},slip:.05,feast:.5});
const APOTH_COST=30,DESK_COST=50,DESK_COST_BLACK=30,SELL_GAIN=2,APPLE_GAIN=1,SECTION_REWARD=10;
const MERCH_ADS=['Fresh apples! Crisp and sweet!','Oranges from the south! Two for a coin!','Bananas! Ripe bananas!','Fruit! Get your fruit here!'];
Object.assign(NAMES,{apothecary:'Apothecary',advert:'Calling out to customers',sell:'Selling apples next door (+2 coins)',mob:'An angry fruit mob',
 apple:'Priest buys an apple (+1 coin)',slip:'Priest slips on an apple',feast:'A feast with the nobles',apoth:'Tap the Apothecary: potion for 30 coins',desk:'Writing desk (Merchant + Mage next to the Wizard): scroll for 50 coins'});
