// ---------- data: constants, characters, rules data ----------
const CELL=96,COLS=5,ROWS=4,FY=84,KEY='cubehold-v4',O='#1a1226',S1='#f0c8a0',S2='#d8a880';
const GAME_FONT='"Tiny5","Pixelify Sans",monospace'; // font for numbers and text drawn on the canvas (the page font is set in style.css)
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
 pray:a=>[[2,10,2,3,a.body],[12,10,2,3,a.bodyD],[3,12,4,2,O,1],[9,12,4,2,O,1],[6,9,4,6,O,1],[4,12,3,1,a.body,1],[9,12,3,1,a.bodyD,1],[7,10,2,4,a.skin,1]], // palms pressed together at the chest, fingers up (outlined so they stand out)
 wave:a=>[[2,10,2,5,a.body],[13,6,2,5,a.bodyD],[2,15,2,1,a.skin],[14,4,2,2,a.skin]],   // right arm raised and tilted out (waving, alternates with up)
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

// ---------- more Fruit Merchant, monkey, big prayer ----------
ODDS.hangout=.15; // plain hangouts are rarer, so arrangement scenes happen more
Object.assign(ODDS,{massPrayer:.05,fruitfall:.5,murder:.005});
PAIRS['priest>merchant']={left:'appleshop',below:'mabove',above:'curse'}; // below = Merchant above the Priest, above = Merchant below
PAIRS['merchant>wizard']={above:'banana',below:'durian',right:'jokes',left:'advertW'};
const MASS_PRAYER_TIME=20,MONKEY_TIME=120,ROT_TIME=60,BOOST_TIME=60,STARFRUIT_GAIN=5,DURIAN_GAIN=10,APOTH_PLACE_COST=20;
// The Apothecary's back door is on the LEFT of its room
EXIT.backdoorL={x:24,y:66,ay:69};TR.apothecary={up:'backdoorL',down:'backdoorL'};
// Monkey: what a spell scroll turns the Fruit Merchant into for MONKEY_TIME seconds
const MK={body:'#7a5030',bodyD:'#5a3a20',pants:'#7a5030',boot:'#5a3a20',belt:'#7a5030',skin:'#d8b088',skinD:'#c09870'};
CH.monkey={name:'Monkey',eye:O,a:arms(MK),p:[...B(MK),[5,2,6,2,'#7a5030'],[3,4,2,3,'#7a5030'],[11,4,2,3,'#7a5030'],[14,10,1,5,'#5a3a20'],[13,15,2,1,'#5a3a20'],[6,7,4,2,'#e8c8a0']]};
const JOKES=[
 [['merchant','Why did the banana see a healer?'],['wizard','Why?'],['merchant','It was not peeling well!']],
 [['wizard','What does a wizard eat for lunch?'],['merchant','Tell me.'],['wizard','A spell-ad sandwich!']],
 [['merchant','I tried a magic apple once.'],['wizard','And?'],['merchant','It made my pockets disappear. Coins too!']]];
Object.assign(NAMES,{massprayer:'Great prayer (4 neighbors, 20 s)',fruitfall:'Fruit thrown down at the Priest',starfruit:'Starfruit for the Priest (+5 coins)',curse:'Cursed fruit rots (1 min, no coins)',
 banana:'A giant banana',durian:'Durian for the Wizard (+10 coins)',jokes:'Jokes and laughter',murder:'A dark turn (0.5%)',advertW:'Wizard advertises (2 coins / 30 s, 1 min)',
 monkey:'Scroll on Fruit Merchant: monkey for 2 min',backwards:'Potion on Fruit Merchant: speaks backwards'});

// ---------- Apothecary (now a woman), Farmer, scene pace ----------
CH.apothecary={name:'Apothecary',eye:O,a:arms(AP),p:[...B(AP),[4,10,8,9,AP.body],[10,10,2,9,AP.bodyD],[4,14,8,1,AP.belt],[4,1,8,2,'#7a3a2a'],[4,3,1,9,'#7a3a2a'],[11,3,1,9,'#7a3a2a'],[5,3,6,1,'#7a3a2a'],[6,9,4,1,'#e8e4d0'],[11,13,3,4,'#8a6a3a'],[12,12,1,1,'#d03050']]};
ODDS.apothecary={trip:.05,tripbreak:.05,abrew:.5,herbs:.4};
ODDS.farm=.03; // Fruit Merchant left of the Apothecary: 3% a temporary Farmer box, else they trade
PAIRS['apothecary>merchant']={left:'apgift'}; // Apothecary left of the Merchant: she gives him a potion
PAIRS['merchant>apothecary']={left:'mtrade'}; // Merchant left of the Apothecary: farm (3%) or trading
// Farmer (Merchant): a temporary box that appears on the nearest empty cell for FARM_TIME seconds, then harvests for FARM_GAIN coins
CLASS.farmer='merchant';TR.farmer={up:'fade',down:'fade'}; // no doors on the farm: people just fade away / appear in the field
EXIT.fade={x:48,y:66,ay:84};
CH.farmerbox=Object.assign({},CH.farmer,{name:'Farmer'});
const FARM_TIME=180,FARM_GAIN=30,AP_POTION_COINS=10;
// Special interaction scenes play at this speed (lower = slower, so they last a few seconds longer)
const SCENE_PACE=.65;
Object.assign(NAMES,{trip:'Clumsy trip',tripbreak:'Clumsy trip, smashed potion',abrew:'Brewing potions',herbs:'Watering and picking herbs',
 apgift:'Apothecary gives the Merchant a potion',mtrade:'Trading wares',farm:'A farm appears (3 min, +30 coins)',apcoins:'Potion on Apothecary: +10 coins',appotion:'Scroll on Apothecary: +1 potion',
 blackwiz:'Easter egg: the black Wizard',bronze:'Easter egg: bronze armor',skulls:'Easter egg: skulls on the bottom row'});
// Compendium tabs: one per character type. Each lists every interaction that involves that character
// (shared scenes appear in both tabs). Easter eggs stay hidden until found but count in the totals.
const EGGS=['blackwiz','bronze','skulls','relic'];
const COMP_TABS=[
 {id:'knight',name:'Knight',pairs:['friend','learn','bolt','chat','spar','zeal','crusade','pray','bless','sermon','tentacle','sleep','dknight','horde','nchat','cleanse'],idle:['prac:shield','prac:spear','prac:glaive','prac:longsword','orc','horse','cat'],items:['glow','flex','bronze']},
 {id:'wizard',name:'Wizard',pairs:['friend','learn','bolt','chat','spar','study','gossip','undead','light','duel','craft','golem','tomes','swap','forge','banana','durian','jokes','murder','advertW'],idle:['read','magic','demon','brew'],items:['fireball','teleport','desk','blackwiz']},
 {id:'priest',name:'Priest',pairs:['study','gossip','undead','light','zeal','crusade','pray','bless','sermon','tentacle','purge','debate','cleanse','apple','slip','feast','fruitfall','starfruit','curse'],idle:['pray1','farmer','tithe','exorcise','massprayer'],items:['banish','wings','relic']},
 {id:'necromancer',name:'Necromancer',pairs:['sleep','dknight','horde','nchat','purge','debate','cleanse','duel','craft','golem','tomes','swap','forge'],idle:['spirits','candles','lightning','raise'],items:['sniff','skulls','relic']},
 {id:'merchant',name:'Fruit Merchant',pairs:['apple','slip','feast','fruitfall','starfruit','curse','banana','durian','jokes','murder','advertW','apgift','mtrade','farm'],idle:['advert','sell','mob'],items:['monkey','backwards']},
 {id:'apothecary',name:'Apothecary',pairs:['apgift','mtrade','farm'],idle:['trip','tripbreak','abrew','herbs'],items:['apoth','apcoins','appotion']}];
const DISCOVER_EVERY=5,DISCOVER_REWARD=10; // every 5 different things discovered = +10 coins
const BOOST_MAX=2; // the Wizard's advertising: 1 coin every 30 s, stacking up to this many (there is no other passive coin gain)
// Commoner customer who comes in to buy from the Fruit Merchant or the Apothecary
const CM={body:'#9a7a5a',bodyD:'#7a5a40',pants:'#5a5a6a',boot:'#3a2a1a',belt:'#5a3a1e'};
CH.commoner={name:'Customer',eye:O,a:arms(CM),p:[...B(CM),[5,2,6,2,'#4a3a2a'],[4,3,1,3,'#4a3a2a']]};
// 15% of their idle time a customer comes in and buys something (customer share added; adverts and brewing reduced to fit)
ODDS.merchant={customer:.15,advert:.55,sell:.29,mob:.01};
ODDS.apothecary={customer:.15,trip:.05,tripbreak:.05,abrew:.35,herbs:.4};
const CUSTOMER_FRUIT=2,CUSTOMER_REMEDY=5;
NAMES.mcust='A customer buys fruit (+2 coins)';NAMES.acust='A customer buys a remedy (+5 coins)';
COMP_TABS.find(t=>t.id==='merchant').idle.push('mcust');COMP_TABS.find(t=>t.id==='apothecary').idle.push('acust');
// Who takes part in each neighbor scene; the Compendium groups a tab's neighbor scenes by the other character
const PAIR_WITH={friend:['knight','wizard'],learn:['knight','wizard'],bolt:['knight','wizard'],chat:['knight','wizard'],spar:['knight','wizard'],
 study:['priest','wizard'],gossip:['priest','wizard'],undead:['priest','wizard'],light:['priest','wizard'],
 zeal:['knight','priest'],crusade:['knight','priest'],pray:['knight','priest'],bless:['knight','priest'],sermon:['knight','priest'],tentacle:['knight','priest'],
 sleep:['knight','necromancer'],dknight:['knight','necromancer'],horde:['knight','necromancer'],nchat:['knight','necromancer'],
 purge:['priest','necromancer'],debate:['priest','necromancer'],cleanse:['priest','necromancer'], // the Knight sees Cleansing under the Priest
 duel:['wizard','necromancer'],craft:['wizard','necromancer'],golem:['wizard','necromancer'],tomes:['wizard','necromancer'],swap:['wizard','necromancer'],forge:['wizard','necromancer'],
 apple:['priest','merchant'],slip:['priest','merchant'],feast:['priest','merchant'],fruitfall:['priest','merchant'],starfruit:['priest','merchant'],curse:['priest','merchant'],
 banana:['wizard','merchant'],durian:['wizard','merchant'],jokes:['wizard','merchant'],murder:['wizard','merchant'],advertW:['wizard','merchant'],
 apgift:['apothecary','merchant'],mtrade:['apothecary','merchant'],farm:['apothecary','merchant']};

// ---------- skin tones, locked board spaces, more scenes ----------
// Skin tones: new Knights, Fruit Merchants and Priests get one of these at random (saved per box). 0 = the original light tone.
const SKINS=[[S1,S2],['#c8885a','#a86c42'],['#8a5a3a','#6c4228']];
const SKIN_CHARS=['knight','merchant','priest'];
// Sprite copies with the skin colors swapped: e.g. CH['priest_f~2']
['knight','knight_steel','knight_bronze','eknight','priest','priest_m','priest_f','merchant'].forEach(b=>{const c=CH[b];
 for(let i=1;i<SKINS.length;i++){const[s,d]=SKINS[i],m=k=>k===S1?s:k===S2?d:k;
  CH[b+'~'+i]=Object.assign({},c,{a:c.a&&Object.assign({},c.a,{skin:m(c.a.skin)}),p:c.p.map(r=>[r[0],r[1],r[2],r[3],m(r[4]),r[5]])})}});
// Board: only the middle 3x3 is open at the start. The side columns and the bottom row are bought with coins:
// the first extra space costs CELL_PRICE, each one after that CELL_PRICE more (10, 20, 30, ...).
const START_CELLS=[];for(let r=0;r<3;r++)for(let c=1;c<4;c++)START_CELLS.push(r+','+c);
const CELL_PRICE=10;
// braver = share of Priest + Fighter visits (any side) where the Priest admits "You're braver than I."
// wave = share of idle activities where a character just waves to a neighbor
Object.assign(ODDS,{braver:.05,wave:.1,farm:.015,bizSlow:.5});
const GOLD_TIME=60; // Apothecary above the Fruit Merchant: his apples shine gold this long
// Apothecary above / below the Fruit Merchant
PAIRS['apothecary>merchant']={left:'apgift',above:'goldapple',below:'business'};
const BIZ_SLOW=[
 [['merchant','Business is slow. Three apples all week.'],['apothecary','Same here. Nobody is sick enough.'],['merchant','We could ask the Necromancer to help with that.'],['apothecary','Do not even joke about it.']],
 [['apothecary','How is trade?'],['merchant','A crow bought one grape and left no tip.'],['apothecary','I sold a single tonic. To myself.'],['merchant','Hard times, friend. Hard times.']]];
const BIZ_WELL=[
 [['apothecary','Business is booming! I sold out of tonics.'],['merchant','My apples fly off the crates!'],['apothecary','The Knight bought twelve healing potions.'],['merchant','He keeps walking into the door.']],
 [['merchant','Best week ever! I had to hire a second crate.'],['apothecary','Everyone wants my sleeping draught.'],['merchant','Is that because of the Necromancer?'],['apothecary','Do not ask. Just count the coins.']]];
Object.assign(NAMES,{braver:'"You\'re braver than I."',goldapple:'Golden apples',business:'Talking business',wave:'Waving to a neighbor',
 apoth:'Coin in the Apothecary\'s room: potion for 30 coins',desk:'Coin in the Wizard\'s room (Merchant + Mage next door): scroll for 50 coins',farm:'A farm appears (3 min, +30 coins)'});
COMP_TABS.forEach(t=>{if(t.id==='knight'||t.id==='priest')t.pairs.push('braver');if(t.id==='merchant'||t.id==='apothecary')t.pairs.push('goldapple','business')});
Object.assign(PAIR_WITH,{braver:['knight','priest'],goldapple:['apothecary','merchant'],business:['apothecary','merchant']});

// ---------- Compendium descriptions (shown when you hover over or tap a tile) ----------
const DESC={
 friend:'Wizard left of the Knight. Old Friends: hearts, cheering, and far too many visits.',
 learn:'Wizard right of the Knight. The Knight reads a spellbook he really should not have, and turns Eldritch. Forever.',
 bolt:'Wizard above the Knight. A lightning bolt "by accident". The Knight does not survive the accident.',
 chat:'Wizard below the Knight. Tales of old adventures, each one more exaggerated than the last.',
 spar:'Knight and Wizard, any side, 2%. Sword versus magic shield. Nobody wins, everybody sweats.',
 study:'Priest right of the Wizard. A holy book and a spellbook, read side by side in respectful silence.',
 gossip:'Priest left of the Wizard. They whisper about the neighbors. Mostly the Knight.',
 undead:'Priest below the Wizard. A skeleton pops up by accident. Teamwork puts it back down.',
 light:'Priest above the Wizard. Holy light so bright the Wizard snuffs it out with pure darkness.',
 zeal:'Priest above the Knight. No scene, just a fired-up Knight who visits 60% more often.',
 crusade:'Priest above the Knight, 2%. They march off for 2 minutes and come back with coins or an artifact.',
 pray:'Priest right of the Knight. Both kneel and pray. Very quietly. Very holy.',
 bless:'Priest below the Knight. A splash of holy water. The Knight glows, mostly from the attention.',
 sermon:'Priest left of the Knight. A short prayer for the Knight, who listens with hands folded.',
 tentacle:'Priest left of the Knight, 10%. Eldritch tentacles smash the Priest\'s window. The Knight sorts it out.',
 braver:'Priest and Knight, any side, 5%. The Priest admits the Knight is braver. The Knight pretends not to blush.',
 sleep:'Necromancer left of the Knight. A sleep spell rolls right along the row. Everyone naps for a minute.',
 dknight:'Necromancer above the Knight. The Knight becomes a Death Knight and follows him everywhere. Awkward.',
 horde:'Necromancer right of the Knight. Three skeletons for target practice. 5% the targets win.',
 nchat:'Necromancer below the Knight. Old war stories. Some of the soldiers in them were already dead.',
 purge:'Necromancer below the Priest. Ghosts or zombies appear; the Priest cleans house with holy light.',
 debate:'Necromancer above the Priest. Holy versus unholy. Nobody changes their mind. Everybody gets cross.',
 cleanse:'Priest and Necromancer, any side, while a Death Knight exists. The Priest turns him back into a Knight.',
 duel:'Necromancer above the Wizard, 50%. Black lightning versus blue lightning. It is all in good fun. Probably.',
 craft:'Necromancer above the Wizard, 50%. Together they craft a spell scroll for 20 coins (or show off if broke).',
 golem:'Necromancer left of the Wizard. A clay golem wakes up, panics and bursts through the back wall.',
 tomes:'Necromancer right of the Wizard. Two dusty tomes, two happy nerds.',
 swap:'Necromancer below the Wizard. A spell swaps their whole rooms. Nobody asked the furniture.',
 forge:'Wizard and Necromancer, any side, 1%. They conjure a free scroll or potion out of thin air.',
 apple:'Priest left of the Fruit Merchant. A dropped apple, sold for 1 coin. 95% of the time, anyway.',
 slip:'Priest left of the Fruit Merchant, rare. The Priest steps on the apple. It does not end well.',
 feast:'Priest left of the Fruit Merchant, 50%. A table of food appears and two nobles invite themselves.',
 fruitfall:'Fruit Merchant above the Priest, 50%. Fruit rains down on the Priest. The Merchant thinks it is hilarious.',
 starfruit:'Fruit Merchant above the Priest, 50%. A starfruit fit for a saint. +5 coins.',
 curse:'Fruit Merchant below the Priest. The Priest curses his fruit; it rots for a minute and earns nothing.',
 banana:'Fruit Merchant above the Wizard. "Can you make it bigger?" The Wizard can. Much bigger.',
 durian:'Fruit Merchant below the Wizard. A durian sale, +10 coins. The Wizard regrets having a nose.',
 jokes:'Fruit Merchant right of the Wizard. Fruit puns. The Wizard laughs to be polite.',
 murder:'Fruit Merchant right of the Wizard, 0.5%. The joke goes very, very wrong. The Wizard dies.',
 advertW:'Fruit Merchant left of the Wizard. Magic-blessed fruit! Coins come faster, up to 4 every 30 seconds.',
 apgift:'Apothecary left of the Fruit Merchant. A free potion for him. He talks backwards until the next one.',
 mtrade:'Fruit Merchant left of the Apothecary. Apples for potions. Everybody thinks they got the better deal.',
 farm:'Fruit Merchant left of the Apothecary, 1.5%. They hire a Farmer who grows a field for 3 minutes, then pays 30 coins.',
 goldapple:'Apothecary above the Fruit Merchant. A bubbling reaction turns all his apples to gold for a minute. Shiny!',
 business:'Apothecary below the Fruit Merchant. Shop talk. Business is either slow or booming (50/50).',
 wave:'10% of idle time, anyone waves to a neighbor. Neighbors who are free wave back.',
 read:'The Wizard reads. Pages turn by themselves, because of course they do.',
 magic:'The Wizard practices spells. Sparkles everywhere, nothing on fire. Usually.',
 demon:'The Wizard summons a demon, 2%. The demon drags him through the floor. He dies.',
 brew:'Next to a Merchant, 1%: the Wizard spends 5 coins to brew a potion.',
 'prac:shield':'Knight with a shield. A squire comes to spar with a wooden sword while the Knight blocks.',
 'prac:spear':'Knight with a spear. Poke, poke, poke. Very serious poking.',
 'prac:glaive':'Knight with a glaive. Big sweeping swings. Stand back.',
 'prac:longsword':'Knight with a longsword. Classic swordplay against an invisible foe.',
 orc:'The Knight spots an orc in a neighbor\'s room and charges over to deal with it.',
 horse:'The Knight feeds hay to his horse (needs an empty space to his right).',
 cat:'Eldritch Knight only, 1%. A black cat strolls through the Wizard\'s room. Spooky.',
 pray1:'The Priest kneels and prays under a warm ceiling light.',
 farmer:'A farmer visits and the Priest blesses him with holy water.',
 tithe:'The Priest prays for fortune. Fortune answers: +5 coins.',
 exorcise:'A possessed farmer shows up. The Priest drives the demon out. The farmer feels much better.',
 massprayer:'A Priest with all four neighbors free, 5%. Everyone squeezes into his room to pray for 20 seconds.',
 spirits:'The Necromancer chats with spirits. They are good listeners.',
 candles:'The Necromancer lights candles and draws a chalk circle. Very atmospheric.',
 lightning:'The Necromancer reads a black book and crackles with red lightning.',
 raise:'The Necromancer, 1%, raises a skeleton in someone\'s room. Fighters and Mages win; Merchants do not.',
 advert:'The Fruit Merchant shouts about his fruit to anyone who will listen.',
 sell:'The Fruit Merchant walks next door and sells apples. +2 coins.',
 mob:'The Fruit Merchant, 1%. An angry farmer mob pelts him with his own fruit.',
 mcust:'A customer walks in and buys some fruit. +2 coins (nothing while the fruit is rotten).',
 trip:'The Apothecary trips over her own robe. She is fine.',
 tripbreak:'The Apothecary trips and smashes a potion. She is fine. The potion is not.',
 abrew:'The Apothecary brews potions just for show. Bubbles!',
 herbs:'The Apothecary waters and picks her herbs.',
 acust:'A customer comes in for a remedy. +5 coins.',
 glow:'Spell scroll on the Knight: golden armor for 30 seconds. Very shiny, very proud.',
 flex:'Potion on the Knight: he drinks it and flexes. Nothing else happens. He feels great.',
 fireball:'Spell scroll on the Wizard: a fireball destroys a random neighboring room, and everyone in it.',
 teleport:'Potion on the Wizard: he teleports to a random character, does a scene with them, then portals home.',
 desk:'With a Merchant and another Mage next to him, the Wizard has a desk. Tap the coin to buy a scroll.',
 banish:'Spell scroll on the Priest: he banishes a ghost. Boo.',
 wings:'Potion on the Priest: angel wings for 30 seconds.',
 relic:'Artifact on the Priest with the Necromancer next door: the Necromancer is destroyed for good.',
 sniff:'Potion on the Necromancer: one sniff and he smashes it against the wall.',
 monkey:'Spell scroll on the Fruit Merchant: he is a monkey for 2 minutes. He does not mind.',
 backwards:'Potion on the Fruit Merchant: everything he says comes out backwards until the next potion.',
 apoth:'Tap the coin in the Apothecary\'s room to buy a potion for 30 coins.',
 apcoins:'Potion on the Apothecary: she buys it back for 10 coins.',
 appotion:'Spell scroll on the Apothecary: she brews it into a potion.',
 blackwiz:'Secret: drag a brand new Wizard onto the top-left space. Black robes, red orb, cheaper scrolls.',
 bronze:'Secret: 1% of Knights come in bronze armor.',
 skulls:'Secret: put the Necromancer on the bottom row and his floor fills with skulls.'};

// ---------- Alchemist, more Knight / Wizard / Necromancer scenes with the Merchants ----------
// Alchemist (Merchant): unlocked 5% of the time the Wizard (right of the Apothecary) brews with her. 50% man / 50% woman.
// No scenes of his/her own yet: only hangouts and wandering.
const ALC={body:'#5a7a9a',bodyD:'#46627e',pants:'#4a3a2a',boot:'#2a1a10',belt:'#3a2a1a'};
const alchemistCH=f=>({name:'Alchemist',eye:O,a:arms(ALC),p:[...B(ALC),[5,11,6,7,'#8a5a2a'],[10,11,1,7,'#6a4420'],[6,12,4,1,'#a8784a'],
 ...(f?[[4,1,8,2,'#2a1a1a'],[4,3,1,8,'#2a1a1a'],[11,3,1,8,'#2a1a1a']]:[[5,1,6,2,'#3a2a1a'],[5,7,6,2,'#5a3a2a'],[6,9,4,1,'#5a3a2a']]),
 [4,2,8,1,'#3a3a3a'],[5,2,2,1,'#7ae0ff'],[9,2,2,1,'#7ae0ff']]}); // leather apron; goggles pushed up on the head; beard (man) or long hair (woman)
CH.alchemist_m=alchemistCH(0);CH.alchemist_f=alchemistCH(1);CH.alchemist=CH.alchemist_m;
CLASS.alchemist='merchant';TR.alchemist={up:'backdoorL',down:'backdoorL'};NAMES.alchemist='Alchemist';
const ALL_CHARS=['knight','wizard','priest','necromancer','merchant','apothecary','alchemist']; // every character that can be on the shelf (for "5/7 unlocked")
// Grizzly bear: what the Knight turns into for BEAR_TIME seconds (Knight above the Apothecary)
const BR={body:'#6a4428',bodyD:'#52341e',pants:'#6a4428',boot:'#3a2414',belt:'#6a4428',skin:'#6a4428',skinD:'#52341e'};
CH.bear={name:'Grizzly Bear',eye:O,a:arms(BR),p:[...B(BR),[3,1,3,3,'#6a4428'],[10,1,3,3,'#52341e'],[4,1,1,1,'#a07850'],[11,1,1,1,'#a07850'],[6,6,4,3,'#a07850'],[7,6,2,1,O],[5,11,6,4,'#8a6040']]};
// Thief who tries to steal from the Fruit Merchant (Knight right of the Merchant)
const TF={body:'#3a3a44',bodyD:'#2a2a32',pants:'#2a2a32',boot:'#1a1a20',belt:'#5a3a1e'};
CH.thief={name:'Thief',eye:O,a:arms(TF),p:[...B(TF),[4,1,8,2,'#2a2a32'],[3,3,2,6,'#2a2a32'],[11,3,2,6,'#2a2a32'],[5,6,6,2,'#2a2a32']]};
// Knight + Fruit Merchant: knight>merchant (Knight relative to Merchant), merchant>knight (Merchant relative to Knight)
PAIRS['knight>merchant']={right:'thief',left:'lemons'};
PAIRS['merchant>knight']={above:'greenapple',below:'rumors'};
// Knight relative to the Apothecary; Wizard relative to the Apothecary; Necromancer above the Apothecary
PAIRS['knight>apothecary']={above:'bear',below:'kgossip',right:'kdate',left:'bees'};
PAIRS['wizard>apothecary']={right:'cobrew',left:'boom',below:'wdate',above:'wabove'}; // wabove = 40% imp blood, 60% purple potion
PAIRS['necromancer>apothecary']={above:'bats'};
// dragon = share of rumors that are about a dragon (else goblins); kdate/wdate = chance the date goes well;
// alchemist = brewing together unlocks the Alchemist (or, once unlocked, makes a potion); boomDeath = the explosion kills both; imp = share of wabove that is the imp
Object.assign(ODDS,{dragon:.1,kdate:.8,wdate:.4,alchemist:.05,boomDeath:.02,imp:.4});
const BEAR_TIME=30,KDATE_TIME=60,WDATE_TIME=30,BEES_TIME=7,REMOVE_COST=10;
const LEMONS=[['knight','Two lemons, please. For polishing my armor.'],['merchant','Lemons? All out, I am afraid.'],['knight','A fruit shop... with no lemons?'],['merchant','Life gave me no lemons. Try next week!']];
const RUMOR_GOBLIN=[['merchant','Psst. Goblins were spotted by the old mill.'],['knight','Goblins? Let them come.'],['merchant','They stole three cabbages already!'],['knight','I will slay any threat that dares come here!']];
const RUMOR_DRAGON=[['merchant','A dragon! A real dragon, seen over the hills!'],['knight','A dragon... truly?'],['merchant','It roasted a whole orchard!'],['knight','Then I shall slay it. No threat comes here while I stand!']];
// Knight below the Apothecary: they gossip about one of the Mages on the board
const KGOSSIP={
 wizard:[['apothecary','Have you noticed the Wizard talks to his hat?'],['knight','He says it answers back.'],['apothecary','It does! I heard it sneeze.'],['knight','Say nothing. Wizards are touchy.']],
 priest:[['knight','The Priest blessed my breakfast again.'],['apothecary','He blessed my herbs. They grew little halos.'],['knight','Halos? On parsley?'],['apothecary','Very holy parsley. Sells well, though.']],
 necromancer:[['apothecary','The Necromancer bought forty candles this week.'],['knight','Forty? What for?'],['apothecary','He said "ambience". Again.'],['knight','I am sleeping with my sword tonight.']],
 none:[['knight','No Mages around here lately.'],['apothecary','So quiet. No sparkles, no explosions.'],['knight','No talking hats.'],['apothecary','Bliss, honestly.']]};
// What the Knight / Wizard says when back from a date with the Apothecary
const DATE_GOOD={knight:['What a wonderful evening!','She laughed at all my jokes!'],wizard:['The stars were perfect tonight.','I made the moon glow. She loved it!']};
const DATE_BAD={knight:['She laughed at my helmet.','I talked about swords for an hour. Too long?'],wizard:['I turned the waiter into a toad. By accident!','She would not stop sniffing my robes.']};
Object.assign(NAMES,{thief:'A thief!',lemons:'Out of lemons',greenapple:'Green apples (+2 coins)',rumors:'Rumors of goblins (or a dragon)',
 bear:'Grizzly bear potion (30 s)',kgossip:'Gossip about a Mage',kdate:'A date (1 min)',bees:'Bee swarm!',
 cobrew:'Brewing together (5%: the Alchemist)',boom:'Brewing gone wrong (2% both die)',wdate:'A date (30 s)',imp:'Imp blood for the Apothecary',purplepot:'A purple potion',
 bats:'Bats!'});
COMP_TABS.forEach(t=>{const add={knight:['thief','lemons','greenapple','rumors','bear','kgossip','kdate','bees'],merchant:['thief','lemons','greenapple','rumors'],
 apothecary:['bear','kgossip','kdate','bees','cobrew','boom','wdate','imp','purplepot','bats'],wizard:['cobrew','boom','wdate','imp','purplepot'],necromancer:['bats']}[t.id];if(add)t.pairs.push(...add)});
Object.assign(PAIR_WITH,{thief:['knight','merchant'],lemons:['knight','merchant'],greenapple:['knight','merchant'],rumors:['knight','merchant'],
 bear:['knight','apothecary'],kgossip:['knight','apothecary'],kdate:['knight','apothecary'],bees:['knight','apothecary'],
 cobrew:['wizard','apothecary'],boom:['wizard','apothecary'],wdate:['wizard','apothecary'],imp:['wizard','apothecary'],purplepot:['wizard','apothecary'],bats:['necromancer','apothecary']});
Object.assign(DESC,{
 thief:'Knight right of the Fruit Merchant. A hooded thief grabs some fruit. The Knight has opinions about that.',
 lemons:'Knight left of the Fruit Merchant. The Knight wants lemons. A fruit shop with no lemons. Tragic.',
 greenapple:'Fruit Merchant above the Knight. Green apples today! Sour, but the Knight pays 2 coins anyway.',
 rumors:'Fruit Merchant below the Knight. Rumors of goblins (90%) or a dragon (10%). The Knight vows to slay them all.',
 bear:'Knight above the Apothecary. One sip of her potion and he is a grizzly bear for 30 seconds. Rawr.',
 kgossip:'Knight below the Apothecary. They gossip about whichever Mage lives nearby.',
 kdate:'Knight right of the Apothecary. They leave for a 1 minute date. 80% it goes well, 20%... less so.',
 bees:'Knight left of the Apothecary. A bee swarm! Both flee to the other room until the bees buzz off.',
 cobrew:'Wizard right of the Apothecary. They brew together. 5% this attracts the Alchemist (after that: a free potion).',
 boom:'Wizard left of the Apothecary. Too much newt: the brew explodes. 2% it takes them both with it.',
 wdate:'Wizard below the Apothecary. A 30 second date. Only 40% go well. Wizards are hard to date.',
 imp:'Wizard above the Apothecary, 40%. He summons an imp, zaps it, and bottles its blood for her.',
 purplepot:'Wizard above the Apothecary, 60%. She mixes a purple potion; he drinks it and tastes colors.',
 bats:'Necromancer above the Apothecary. His bats flap around, and a few swoop down into her shop. She is not pleased.'});

// ---------- Rogue, Alchemist idles and items, Priest / Necromancer with the Merchants ----------
// Rogue (Fighter): unlocked once you have ROGUE_UNLOCK Compendium discoveries. 3 skin tones. No back door: a rope from a
// ceiling hatch (going up) and a trapdoor in the floor (going down).
const RG={body:'#4a3a2a',bodyD:'#3a2c1e',pants:'#2a2a30',boot:'#1a1a1e',belt:'#8a6a3a'};
CH.rogue={name:'Rogue',eye:O,a:arms(RG),p:[...B(RG),[4,1,8,2,'#2e3a2e'],[3,3,2,6,'#2e3a2e'],[11,3,2,6,'#2e3a2e'],[5,7,6,2,'#2e3a2e'],[4,11,1,3,'#8a6a3a'],[11,12,2,1,'#cfd6e0']]};
for(let i=1;i<SKINS.length;i++){const[s,d]=SKINS[i],m=k=>k===S1?s:k===S2?d:k,c=CH.rogue;CH['rogue~'+i]=Object.assign({},c,{a:Object.assign({},c.a,{skin:m(c.a.skin)}),p:c.p.map(r=>[r[0],r[1],r[2],r[3],m(r[4]),r[5]])})}
SKIN_CHARS.push('rogue');ALL_CHARS.push('rogue');CLASS.rogue='fighter';NAMES.rogue='Rogue';
TR.rogue={up:'rope',down:'trapdoor'};EXIT.rope={x:74,y:84,ay:84};EXIT.trapdoor={x:30,y:84,ay:84};
const ROGUE_UNLOCK=50,ROGUE_DISGUISE_TIME=120;
// Rogue idles; assassin = any neighbor visit with the Rogue; rogueArtifact = idle chance to conjure an artifact while he has the Mage tag
// Alchemist idles; ALC_LUCK = how much his potion raises his neighbors' rarest scene chances, for ALC_LUCK_TIME seconds
Object.assign(ODDS,{rogue:{daggers:.5,smokebomb:.2,disguise:.05,count:.25},assassin:.005,rogueArtifact:.002,
 alchemistIdle:{alcbrew:.6,research:.1,smoke:.3},stone:.8,bloodorange:.3,ntradePotion:.2,reveal:.05,healFarm:.02});
const ALC_LUCK=.3,ALC_LUCK_TIME=60,PSLEEP_TIME=30,RITUAL_TIME=15,FUNERAL_TIME=12,BLOODORANGE_GAIN=3;
// Priest relative to the Apothecary; Necromancer relative to the Fruit Merchant / Apothecary
PAIRS['priest>apothecary']={left:'plant',right:'pstudy',above:'psleep',below:'heal'};
PAIRS['necromancer>merchant']={above:'sacrifice',below:'chant',right:'bloodorange',left:'nrot'};
PAIRS['necromancer>apothecary']={above:'bats',left:'ntrade',right:'ntrade',below:'ritual'};
const PSTUDY=[[['priest','This text says lead can become gold.'],['apothecary','And this one says gold can become lead.'],['priest','So... why bother?'],['apothecary','Tax reasons, I think.']],
 [['apothecary','Mercury, salt and sulfur. The three principles.'],['priest','Faith, hope and charity. Also three.'],['apothecary','Coincidence?'],['priest','Nothing is a coincidence.']]];
const NYELL=[['merchant','You dripped blood all over my apples!'],['necromancer','A small price for ultimate power.'],['merchant','Nobody buys apples that are REDDER!'],['necromancer','...Fine. I will use a bucket next time.']];
const NCHANTS=['ZARATHUL! MORGATH! VEXUS!','RISE! RIIIISE! ...no? RISE!','BY THE NINE BONES OF KHAAL!'];
Object.assign(NAMES,{plant:'Carnivorous plant',pstudy:'Studying alchemy (5%: reveals a secret)',psleep:'Sleeping potion (30 s)',heal:'Healing a sick farmer',funeral:'A funeral',
 sacrifice:'Blood from above',chant:'Loud chanting',bloodorange:'A blood orange (30%, +3 coins)',nrot:'Rotten fruit and worms',ntrade:'Undead ingredients for a black potion',ritual:'Dark ritual (15 s)',
 alcbrew:'Brewing at the table',research:'Researching formulas',smoke:'A smoky mistake',alcpotion:'Potion on Alchemist: luck for neighbors',alcscroll:'Scroll on Alchemist: torn up',stone:"Artifact on Alchemist: philosopher's stone",elixir:'Secret: the elixir of life',
 assassin:'Assassin (0.5%)',daggers:'Throwing daggers',smokebomb:'Smoke bomb',disguise:'Disguise (2 min)',count:'Counting the stash',spook:'Potion on Rogue: invisible prank',roguemage:'Scroll on Rogue: the Mage tag'});
EGGS.push('elixir');NAMES.advertW='Wizard advertises (1-2 coins / 30 s, 1 min)';
COMP_TABS.push({id:'alchemist',name:'Alchemist',pairs:[],idle:['alcbrew','research','smoke'],items:['alcpotion','alcscroll','stone','elixir']},
 {id:'rogue',name:'Rogue',pairs:['assassin'],idle:['daggers','smokebomb','disguise','count'],items:['spook','roguemage']});
COMP_TABS.forEach(t=>{const add={priest:['plant','pstudy','psleep','heal'],apothecary:['plant','pstudy','psleep','heal','ntrade','ritual'],
 necromancer:['sacrifice','chant','bloodorange','nrot','ntrade','ritual'],merchant:['sacrifice','chant','bloodorange','nrot']}[t.id];if(add)t.pairs.push(...add);if(t.id==='priest')t.idle.push('funeral')});
Object.assign(PAIR_WITH,{plant:['priest','apothecary'],pstudy:['priest','apothecary'],psleep:['priest','apothecary'],heal:['priest','apothecary'],
 sacrifice:['necromancer','merchant'],chant:['necromancer','merchant'],bloodorange:['necromancer','merchant'],nrot:['necromancer','merchant'],
 ntrade:['necromancer','apothecary'],ritual:['necromancer','apothecary'],assassin:['rogue','anyone']});
Object.assign(DESC,{
 advertW:'Fruit Merchant left of the Wizard. The only way coins trickle in by themselves: 1 coin every 30 seconds, stacking to 2, for a minute.',
 plant:'Priest left of the Apothecary. Her carnivorous plant gets out of hand. The Priest smites it. Repeatedly.',
 pstudy:'Priest right of the Apothecary. They study alchemy texts together. 5% they find a clue that reveals a hidden secret here.',
 psleep:'Priest above the Apothecary. He tries her new tonic and falls asleep for 30 seconds. Snore.',
 heal:'Priest below the Apothecary. A sick farmer comes in; prayer plus medicine fixes him. 2% he sets up a farm next door.',
 funeral:'When a Fighter next to the Priest dies, he holds a funeral and every free neighbor comes to pay respects.',
 sacrifice:'Necromancer above the Fruit Merchant. A sacrifice upstairs drips blood onto the fruit. The Merchant storms up to complain.',
 chant:'Necromancer below the Fruit Merchant. He practices his chants. Loudly. The customer upstairs flees.',
 bloodorange:'Necromancer right of the Fruit Merchant. He wants a blood orange. 30% there is one left (+3 coins).',
 nrot:'Necromancer left of the Fruit Merchant. He rots the fruit for a minute and worms crawl out. Nothing sells meanwhile.',
 ntrade:'Necromancer left or right of the Apothecary. Rare undead ingredients for a black potion. With the Alchemist next to her, 20% you get a potion too.',
 ritual:'Necromancer below the Apothecary. A 15 second dark ritual by candlelight. Spooky, but she had a nice time.',
 alcbrew:'The Alchemist brews at his table. Things bubble. Things change color. Nothing explodes. This time.',
 research:'The Alchemist researches new formulas in a very thick book.',
 smoke:'The Alchemist mixes the wrong things and the whole room fills with smoke. *cough*',
 alcpotion:'Potion on the Alchemist: for 1 minute, his neighbors\' rarest scenes are 30% more likely.',
 alcscroll:'Spell scroll on the Alchemist: he has no idea what it is and tears it up.',
 stone:"Artifact on the Alchemist, 80%: a philosopher's stone turns one board space golden. Coins earned there are doubled.",
 elixir:'Secret: 20% the artifact is the elixir of life. The Alchemist drinks it and retires. He must be unlocked again.',
 assassin:'The Rogue and any neighbor, 0.5%. The Rogue was an assassin all along. The neighbor does not survive.',
 daggers:'The Rogue throws daggers at a target on his wall. Bullseye. Mostly.',
 smokebomb:'The Rogue vanishes in a smoke bomb and pops up somewhere else in his room.',
 disguise:'The Rogue disguises himself as another character for 2 minutes and lives their life: their scenes, their idles, everything.',
 count:'The Rogue counts his stash: your coin total. He seems pleased.',
 spook:'Potion on the Rogue: he turns invisible, sneaks up on someone anywhere and shouts BOO.',
 roguemage:'Spell scroll on the Rogue: he gains the Mage tag. 0.2% of his idle time he conjures an artifact, which uses the tag up.'});
