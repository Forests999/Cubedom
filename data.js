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
 black:{body:'#26242e',bodyD:'#18161e',hat:'#34313e',orb:'#ff3030',trim:'#c03030'}}; // trim = belt and hat band (gold, red on the black Wizard)
const WIZ_RANDOM=['blue','purple','red'];
function wizardCH(col){const P=WIZ_COLORS[col],C={body:P.body,bodyD:P.bodyD},tr=P.trim||'#f2c84a';
 return {name:'Wizard',eye:O,a:arms(C),p:[...B(C),[4,10,8,9,P.body],[10,10,2,9,P.bodyD],[4,14,8,1,tr],[6,9,4,3,'#e8e8f0'],[3,3,10,2,P.hat],[5,1,6,2,P.hat],[7,0,3,1,P.hat],[5,3,6,1,tr],[1,5,1,15,'#8a5a2a'],[0,3,3,3,P.orb||'#7ff0ff']]}}
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
const ODDS={visit:.2,visitFriend:.45,spar:.02,hangout:.25,idle:.4,zeal:.6,tentacle:.1,necro:.5,
 wizard:{read:.6,magic:.38,demon:.02},
 knight:{prac:.75,orc:.2,horse:.05},
 priest:{pray:.5,farmer:.35,tithe:.1,exorcise:.05},
 necromancer:{spirits:.5,candles:.25,lightning:.24,raise:.01},
 eknightCat:.01};
// Coins: +1 every COIN_EVERY seconds while the game is open; the Priest's tithe prayer gives TITHE.
const COIN_EVERY=30,TITHE=3;
// Wizard brewing next to a Merchant costs BREW_COST coins; a crusade lasts CRUSADE_TIME seconds; holding MERCHANT_COINS coins at once unlocks the Fruit Merchant.
const BREW_COST=5,CRUSADE_TIME=120,CRUSADE_GOLD=10,MERCHANT_COINS=50;
Object.assign(ODDS,{wizBrew:.01,forge:.01,crusade:.02,crusadeGold:.7});
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
 apple:'Priest buys an apple (+1 coin)',slip:'Priest slips on an apple',feast:'A feast with the nobles'});

// ---------- more Fruit Merchant, monkey, big prayer ----------
ODDS.hangout=.15; // plain hangouts are rarer, so arrangement scenes happen more
Object.assign(ODDS,{massPrayer:.05,fruitfall:.5,murder:.005});
PAIRS['priest>merchant']={left:'appleshop',below:'mabove',above:'curse'}; // below = Merchant above the Priest, above = Merchant below
PAIRS['merchant>wizard']={above:'banana',below:'durian',right:'jokes',left:'advertW'};
const MASS_PRAYER_TIME=20,MONKEY_TIME=120,ROT_TIME=60,BOOST_TIME=60,STARFRUIT_GAIN=5,DURIAN_GAIN=5,APOTH_PLACE_COST=20;
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
 banana:'A giant banana',durian:'Durian for the Wizard (+5 coins)',jokes:'Jokes and laughter',murder:'A dark turn (0.5%)',advertW:'Wizard advertises (2 coins / 30 s, 1 min)',
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
// the first extra space costs CELL_PRICE, each one after that CELL_STEP more (10, 15, 20, ...).
const START_CELLS=[];for(let r=0;r<3;r++)for(let c=1;c<4;c++)START_CELLS.push(r+','+c);
const CELL_PRICE=10,CELL_STEP=5;
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
 study:'Priest right of the Wizard. A holy book and a spellbook, read side by side in respectful silence.',
 gossip:'Priest left of the Wizard. They whisper about the neighbors. Mostly the Knight.',
 undead:'Priest below the Wizard. A skeleton pops up by accident. Teamwork puts it back down.',
 light:'Priest above the Wizard. Holy light so bright the Wizard snuffs it out with pure darkness.',
 pray:'Priest right of the Knight. Both kneel and pray. Very quietly. Very holy.',
 bless:'Priest below the Knight. A splash of holy water. The Knight glows, mostly from the attention.',
 sermon:'Priest left of the Knight. A short prayer for the Knight, who listens with hands folded.',
 sleep:'Necromancer left of the Knight. A sleep spell rolls right along the row. Everyone naps for a minute.',
 dknight:'Necromancer above the Knight. The Knight becomes a Death Knight and follows him everywhere. Awkward.',
 nchat:'Necromancer below the Knight. Old war stories. Some of the soldiers in them were already dead.',
 purge:'Necromancer below the Priest. Ghosts or zombies appear; the Priest cleans house with holy light.',
 debate:'Necromancer above the Priest. Holy versus unholy. Nobody changes their mind. Everybody gets cross.',
 golem:'Necromancer left of the Wizard. A clay golem wakes up, panics and bursts through the back wall.',
 tomes:'Necromancer right of the Wizard. Two dusty tomes, two happy nerds.',
 swap:'Necromancer below the Wizard. A spell swaps their whole rooms. Nobody asked the furniture.',
 curse:'Fruit Merchant below the Priest. The Priest curses his fruit; it rots for a minute and earns nothing.',
 banana:'Fruit Merchant above the Wizard. "Can you make it bigger?" The Wizard can. Much bigger.',
 durian:'Fruit Merchant below the Wizard. A durian sale, +5 coins. The Wizard regrets having a nose.',
 jokes:'Fruit Merchant right of the Wizard. Fruit puns. The Wizard laughs to be polite.',
 mtrade:'Fruit Merchant left of the Apothecary. Apples for potions. Everybody thinks they got the better deal.',
 goldapple:'Apothecary above the Fruit Merchant. A bubbling reaction turns all his apples to gold for a minute. Shiny!',
 business:'Apothecary below the Fruit Merchant. Shop talk. Business is either slow or booming (50/50).',
 read:'The Wizard reads. Pages turn by themselves, because of course they do.',
 magic:'The Wizard practices spells. Sparkles everywhere, nothing on fire. Usually.',
 'prac:shield':'Knight with a shield. A squire comes to spar with a wooden sword while the Knight blocks.',
 'prac:spear':'Knight with a spear. Poke, poke, poke. Very serious poking.',
 'prac:glaive':'Knight with a glaive. Big sweeping swings. Stand back.',
 'prac:longsword':'Knight with a longsword. Classic swordplay against an invisible foe.',
 pray1:'The Priest kneels and prays under a warm ceiling light.',
 farmer:'A farmer visits and the Priest blesses him with holy water.',
 exorcise:'A possessed farmer shows up. The Priest drives the demon out. The farmer feels much better.',
 spirits:'The Necromancer chats with spirits. They are good listeners.',
 candles:'The Necromancer lights candles and draws a chalk circle. Very atmospheric.',
 lightning:'The Necromancer reads a black book and crackles with red lightning.',
 advert:'The Fruit Merchant shouts about his fruit to anyone who will listen.',
 sell:'The Fruit Merchant walks next door and sells apples. +2 coins.',
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
 bronze:'Secret: 0.75% of Knights come in bronze armor.',
 skulls:'Secret: put the Necromancer on the bottom row and his floor fills with skulls.'};

// ---------- Alchemist, more Knight / Wizard / Necromancer scenes with the Merchants ----------
// Alchemist (Merchant): unlocked 5% of the time the Wizard (right of the Apothecary) brews with her. 50% man / 50% woman.
// No scenes of his/her own yet: only hangouts and wandering.
const ALC={body:'#5a7a9a',bodyD:'#46627e',pants:'#4a3a2a',boot:'#2a1a10',belt:'#3a2a1a'};
const alchemistCH=f=>({name:'Alchemist',eye:O,a:arms(ALC),p:[...B(ALC),[5,11,6,7,'#8a5a2a'],[10,11,1,7,'#6a4420'],[6,12,4,1,'#a8784a'],
 ...(f===2?[[3,0,3,3,'#f0f0f8'],[7,0,3,2,'#f0f0f8'],[11,0,3,3,'#f0f0f8'],[2,3,3,4,'#f0f0f8'],[11,3,3,4,'#f0f0f8'],[5,1,6,1,'#d8d8e4']]: // f 2 = mad scientist: wild white hair
  f?[[4,1,8,2,'#2a1a1a'],[4,3,1,8,'#2a1a1a'],[11,3,1,8,'#2a1a1a']]:[[5,1,6,2,'#3a2a1a'],[5,7,6,2,'#5a3a2a'],[6,9,4,1,'#5a3a2a']]),
 [4,2,8,1,'#3a3a3a'],[5,2,2,1,'#7ae0ff'],[9,2,2,1,'#7ae0ff']]}); // leather apron; goggles pushed up on the head; beard (man) or long hair (woman)
CH.alchemist_m=alchemistCH(0);CH.alchemist_f=alchemistCH(1);CH.alchemist=CH.alchemist_m;CH.alchemist_mad=alchemistCH(2);
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
Object.assign(ODDS,{kdate:.8,wdate:.4,imp:.4});
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
 cobrew:'Brewing together (15%: the Alchemist)',boom:'Brewing gone wrong',wdate:'A date (30 s)',imp:'Imp blood for the Apothecary',purplepot:'A purple potion',
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
 
 bees:'Knight left of the Apothecary. A bee swarm! Both flee to the other room until the bees buzz off.',
 wdate:'Wizard below the Apothecary. A 30 second date. Only 40% go well. Wizards are hard to date.',
 bats:'Necromancer above the Apothecary. His bats flap around, and a few swoop down into her shop. She is not pleased.'});

// ---------- Rogue, Alchemist idles and items, Priest / Necromancer with the Merchants ----------
// Rogue (Fighter): unlocked once you have ROGUE_UNLOCK Compendium discoveries. 3 skin tones. No back door: a rope from a
// ceiling hatch (going up) and a trapdoor in the floor (going down).
const RG={body:'#4a3a2a',bodyD:'#3a2c1e',pants:'#2a2a30',boot:'#1a1a1e',belt:'#8a6a3a'};
CH.rogue={name:'Rogue',eye:O,a:arms(RG),p:[...B(RG),[4,1,8,2,'#2e3a2e'],[3,3,2,6,'#2e3a2e'],[11,3,2,6,'#2e3a2e'],[5,7,6,2,'#2e3a2e'],[4,11,1,3,'#8a6a3a'],[11,12,2,1,'#cfd6e0']]};
for(let i=1;i<SKINS.length;i++){const[s,d]=SKINS[i],m=k=>k===S1?s:k===S2?d:k,c=CH.rogue;CH['rogue~'+i]=Object.assign({},c,{a:Object.assign({},c.a,{skin:m(c.a.skin)}),p:c.p.map(r=>[r[0],r[1],r[2],r[3],m(r[4]),r[5]])})}
SKIN_CHARS.push('rogue');ALL_CHARS.push('rogue');CLASS.rogue='fighter';NAMES.rogue='Rogue';
TR.rogue={up:'rope',down:'trapdoor'};EXIT.rope={x:74,y:84,ay:84};EXIT.trapdoor={x:30,y:84,ay:84};
const ROGUE_UNLOCK=75,ROGUE_DISGUISE_TIME=120;
// Rogue idles; assassin = any neighbor visit with the Rogue; rogueArtifact = idle chance to conjure an artifact while he has the Mage tag
// Alchemist idles; ALC_LUCK = how much his potion raises his neighbors' rarest scene chances, for ALC_LUCK_TIME seconds
Object.assign(ODDS,{rogue:{daggers:.5,smokebomb:.2,disguise:.05,count:.25},assassin:.005,rogueArtifact:.002,
 alchemistIdle:{alcbrew:.6,research:.1,smoke:.3},bloodorange:.3,reveal:.05});
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
 plant:'Priest left of the Apothecary. Her carnivorous plant gets out of hand. The Priest smites it. Repeatedly.',
 psleep:'Priest above the Apothecary. He tries her new tonic and falls asleep for 30 seconds. Snore.',
 sacrifice:'Necromancer above the Fruit Merchant. A sacrifice upstairs drips blood onto the fruit. The Merchant storms up to complain.',
 chant:'Necromancer below the Fruit Merchant. He practices his chants. Loudly. The customer upstairs flees.',
 nrot:'Necromancer left of the Fruit Merchant. He rots the fruit for a minute and worms crawl out. Nothing sells meanwhile.',
 ritual:'Necromancer below the Apothecary. A 15 second dark ritual by candlelight. Spooky, but she had a nice time.',
 alcbrew:'The Alchemist brews at his table. Things bubble. Things change color. Nothing explodes. This time.',
 research:'The Alchemist researches new formulas in a very thick book.',
 smoke:'The Alchemist mixes the wrong things and the whole room fills with smoke. *cough*',
 alcscroll:'Spell scroll on the Alchemist: he has no idea what it is and tears it up.',
 stone:"Artifact on the Alchemist: a philosopher's stone turns one more board space golden, for good. Coins earned on a golden space are doubled.",
 elixir:'Secret: 15% the artifact is the elixir of life. The Alchemist drinks it and retires. He must be unlocked again.',
 daggers:'The Rogue throws daggers at a target on his wall. Bullseye. Mostly.',
 smokebomb:'The Rogue vanishes in a smoke bomb and pops up somewhere else in his room.',
 disguise:'The Rogue disguises himself as another character for 2 minutes and lives their life: their scenes, their idles, everything.',
 count:'The Rogue counts his stash: your coin total. He seems pleased.',
 spook:'Potion on the Rogue: he turns invisible, sneaks up on someone anywhere and shouts BOO.',
 roguemage:'Spell scroll on the Rogue: he gains the Mage tag. 0.2% of his idle time he conjures an artifact, which uses the tag up.'});

// ---------- Alchemist by tags, Rogue neighbor scenes, more secrets ----------
// Beast-man: what the mad-scientist Alchemist turns into for a moment (secret, bottom-right space)
const BM={body:'#6a5a4a',bodyD:'#52463a',skin:'#8a7a5a',skinD:'#6a5a44',pants:'#4a3a2a',boot:'#3a2a1a',belt:'#8a5a2a'};
CH.beast={name:'Beast-man',eye:'#ffd34e',a:arms(BM),p:[...B(BM),[3,9,10,8,BM.body],[10,9,3,8,BM.bodyD],[5,11,6,6,'#8a5a2a'],[3,0,3,3,'#f0f0f8'],[7,0,3,2,'#f0f0f8'],[11,0,3,3,'#f0f0f8'],[4,2,8,1,'#3a3a3a'],[5,2,2,1,'#7ae0ff'],[9,2,2,1,'#7ae0ff'],[6,8,1,2,'#f0ead0'],[9,8,1,2,'#f0ead0'],[4,4,1,3,BM.bodyD],[11,4,1,3,BM.bodyD]]};
// Who takes part in tag-based scenes: 'tag:mage' etc. means "any character with that tag"
const TAG_NAMES={'tag:mage':'a Mage','tag:merchant':'a Merchant','tag:fighter':'a Fighter'};
// alcMage = extra visit chance for a Mage next to the Alchemist; promo = Merchant idle share next to him; haste = how much more a Fighter
// next to him picks Mage neighbors; twopot = buying a potion next to him gives two; beast = mad scientist idle; fourMage = gift a potion
// tempt = the demon talks the Rogue into it; betray = the Necromancer's sacrifice works; sickDeath = poisoned wine kills when it wears off
Object.assign(ODDS,{alcMage:.2,promo:.1,haste:.5,beast:.15,fourMage:.1,tempt:.05,sickDeath:.05,
 dungeon:{coins:.2,artifact:.1,scrolls:.25,potions:.25,secret:.2}});
const SICK_TIME=60,TINY_TIME=120,DUNGEON_TIME=180,DUNGEON_GOLD=50,ROGUE_BUY=5,STEAL_SHARE=.05;
// Rogue relative to each character. The Rogue is always the one who visits.
PAIRS['rogue>apothecary']={right:'nefarious',left:'poisons',below:'wine',above:'rtrip'};
PAIRS['rogue>merchant']={left:'pinch',right:'pinch',above:'pinch',below:'pinch'};
PAIRS['rogue>priest']={below:'lecture',above:'vandal',right:'confess',left:'tempt'};
PAIRS['rogue>knight']={above:'dungeon',below:'rspar',right:'drinks',left:'wgossip'};
PAIRS['rogue>alchemist']={above:'snatch',below:'snatch',right:'volatile',left:'shrink'};
PAIRS['rogue>wizard']={above:'rgossip',below:'spell',right:'dressup',left:'rsteal'};
PAIRS['rogue>necromancer']={above:'rritual',below:'betray',right:'rcandles',left:'fairies'};
const ROGUE_SCENES=['nefarious','poisons','wine','rtrip','pinch','lecture','vandal','confess','tempt','dungeon','rspar','drinks','wgossip','snatch','volatile','shrink','rgossip','spell','dressup','rsteal','rritual','betray','rcandles','fairies'];
// 'mage' lines are said by whichever Mage is next to the Alchemist
const MAGICTALK=[[['alchemist','Tell me honestly: is magic actually useful?'],['mage','I lit my pipe with a fireball this morning.'],['alchemist','I can do that with a match.'],['mage','Yes, but mine was dramatic.']],
 [['mage','Alchemy is just magic with extra steps.'],['alchemist','Magic is just alchemy without safety goggles.'],['mage','...Fair point.'],['alchemist','Science and sorcery. A fine team.']]];
const PROMO=['Potions from the Alchemist next door! Today only!','Alchemy sale! One potion, five coins!','Feeling poorly? The Alchemist has just the thing!'];
const WGOSSIP=[[['rogue','Your Wizard friend talks in his sleep.'],['knight','How would you know that?'],['rogue','...Lucky guess.'],['knight','I am counting my coins tonight.']],
 [['knight','The Wizard says his hat is enchanted.'],['rogue','I tried it on. It just smells of cheese.'],['knight','You tried on his hat?!'],['rogue','I try on everybody\'s hats.']]];
const RGOSSIP=[[['rogue','The Knight sleeps in his armor.'],['wizard','He says it is "for readiness".'],['rogue','He clanks when he snores.'],['wizard','I cast a silence spell on him once. Bliss.']],
 [['wizard','Have you seen the Knight practice?'],['rogue','He fights the air like it owes him money.'],['wizard','I think the air is winning.'],['rogue','Do not tell him.']]];
const LECTURE=[['priest','Stealing is a sin, my son.'],['rogue','I prefer "creative borrowing".'],['priest','The gods see everything you do.'],['rogue','...Even last Tuesday?'],['priest','ESPECIALLY last Tuesday.']];
const CONFESS=[[['rogue','Forgive me, Father, for I have stolen.'],['priest','What did you take?'],['rogue','Forty purses, a goat and the Knight\'s left boot.'],['priest','Return the boot. We will work on the rest.']],
 [['rogue','I have a confession. A big one.'],['priest','Go on. I am listening.'],['rogue','It was me who ate the feast pie.'],['priest','I knew it! ...You are forgiven.']]];
const DRINKS=[['knight','To old battles!'],['rogue','To full purses!'],['knight','Ha ha! This ale is strong!'],['rogue','Ha! You are wearing my boot.']];
Object.assign(NAMES,{magictalk:'Is magic useful?',promo:'Alchemy sale (+5 coins)',haste:'Haste potions',twopot:'Secret: two for one',madsci:'Secret: the mad scientist',beast:'Secret: the beast-man',fourmage:'Secret: four Mages',
 nscroll:'Scroll on Necromancer: raise a skeleton',
 nefarious:'Nefarious potions (+5 coins)',poisons:'Buying poisons (+5 coins)',wine:'Poisoned wine',rtrip:'A clumsy burglary',pinch:'Pinching fruit',
 lecture:'A lecture on morals',vandal:'Vandalism!',confess:'Confession',tempt:'A demon\'s whisper',
 dungeon:'Dungeon crawl (5 min)',rspar:'Sparring with ninja stars',drinks:'Drinks and laughs',wgossip:'Gossip about the Wizard',
 snatch:'Snatching a potion',volatile:'Volatile potions',shrink:'A shrinking potion?',
 rgossip:'Gossip about the Knight',spell:'Lightning and frost',dressup:'Dress-up',rsteal:'Light fingers (-5% coins)',
 rritual:'Dark ritual together',betray:'Betrayal!',rcandles:'Errands and stolen candles',fairies:'Fairy attack!',
 tiny:'Secret: tiny Rogue',graveyard:'Secret: the graveyard'});
EGGS.push('twopot','madsci','beast','fourmage','tiny','graveyard');
COMP_TABS.forEach(t=>{const add={knight:['dungeon','rspar','drinks','wgossip','haste'],wizard:['rgossip','spell','dressup','rsteal','magictalk'],priest:['lecture','vandal','confess','tempt','magictalk'],
 necromancer:['rritual','betray','rcandles','fairies','magictalk'],merchant:['pinch','promo'],apothecary:['nefarious','poisons','wine','rtrip','promo'],
 alchemist:['magictalk','promo','haste','snatch','volatile','shrink'],rogue:[...ROGUE_SCENES,'haste']}[t.id];if(add)t.pairs.push(...add);
 if(t.id==='necromancer')t.items.unshift('nscroll');if(t.id==='alchemist')t.items.push('twopot','madsci','beast','fourmage');if(t.id==='rogue')t.items.push('tiny','graveyard')});
Object.assign(PAIR_WITH,{magictalk:['alchemist','tag:mage'],promo:['alchemist','tag:merchant'],haste:['alchemist','tag:fighter']});
ROGUE_SCENES.forEach(k=>{for(const p in PAIRS)if(p.startsWith('rogue>')&&Object.values(PAIRS[p]).includes(k))PAIR_WITH[k]=['rogue',p.slice(6)]});
Object.assign(DESC,{
 kdate:'Knight right of the Apothecary. They leave for a 1 minute date. 80% it goes well, 20%... less so. He tells you how it went.',
 nscroll:'Spell scroll on the Necromancer: he raises a skeleton in a room next door. Fighters and Mages beat it; Merchants do not.',
 magictalk:'The Alchemist and any Mage next to him debate whether magic is actually useful. Passive: Mages next to him visit their neighbors 20% more often.',
 haste:'A Fighter next to the Alchemist drinks his haste potions: he picks Mage neighbors to visit 50% more often than other neighbors.',
 twopot:'Secret: with the Alchemist next to the Apothecary, 15% of the potions you buy from her come as two.',
 madsci:'Secret: put the Alchemist on the bottom-right space and his hair goes wild and white. Mad scientist!',
 nefarious:'Rogue right of the Apothecary. He buys some "nefarious" potions from under the counter. +5 coins.',
 poisons:'Rogue left of the Apothecary. Poison, for "very large rats". +5 coins.',
 wine:'Rogue below the Apothecary. Poison plus wine, gifted to another neighbor: sick for a minute (no neighbor scenes), 5% fatal.',
 rtrip:'Rogue above the Apothecary. He tries to steal, trips, and smashes a shelf of potions. She is furious.',
 pinch:'Rogue on any side of the Fruit Merchant. While the Merchant looks away, an apple quietly disappears.',
 lecture:'Rogue below the Priest. A long lecture about morals. The Rogue sulks.',
 vandal:'Rogue above the Priest. He splatters paint on the chapel walls, gets caught, and has to scrub it all off.',
 confess:'Rogue right of the Priest. He confesses his crimes, hoping for redemption. Some of them, anyway.',
 dungeon:'Rogue above the Knight. They go dungeon crawling for 5 minutes and come back with coins, an artifact, scrolls, potions or a secret.',
 rspar:'Rogue below the Knight. Sparring: sword against ninja stars.',
 drinks:'Rogue right of the Knight. A few drinks and a lot of laughing.',
 wgossip:'Rogue left of the Knight. They gossip about the Wizard.',
 snatch:'Rogue above or below the Alchemist. He drops in through the ceiling or the floor, snatches a potion and uses it himself.',
 volatile:'Rogue right of the Alchemist. They brew volatile potions and the Rogue practices throwing them. Boom!',
 shrink:'Rogue left of the Alchemist. He wants a potion to make him small and fast. The Alchemist cannot make it... without magic.',
 rgossip:'Rogue above the Wizard. They gossip about the Knight.',
 spell:'Rogue below the Wizard. Lightning and frost! The Rogue is jealous, unless he has the Mage tag: then he is amazed.',
 dressup:'Rogue right of the Wizard. They try on disguises; afterwards the Wizard keeps a new robe color.',
 rsteal:'Rogue left of the Wizard. He steals from the Wizard: you lose 5% of your coins.',
 rritual:'Rogue above the Necromancer. He joins a dark ritual by candlelight.',
 betray:'Rogue below the Necromancer. A ritual invite... it is a trap! 80% he escapes; 20% he is sacrificed and the Necromancer gets a little skeleton follower.',
 rcandles:'Rogue right of the Necromancer. While the Necromancer runs errands, the Rogue pockets black candles and a skull.',
 fairies:'Rogue left of the Necromancer. Good fairies attack! Ninja stars and dark magic send them packing.',
 tiny:'Secret: the shrinking potion works if the Rogue has the Mage tag. Tiny and fast for 2 minutes.',
 graveyard:'Secret: put the Rogue next to the Necromancer with both on the bottom row. His room becomes a graveyard.'});

// ---------- Rogue outfits, Druid, Blacksmith, ingots, paladin ----------
// Rogue outfits: a new Rogue is a ninja, a bandit or a well-dressed con man (ODDS.rogueOutfit); saved in the box's color
const NJ={body:'#26262e',bodyD:'#1a1a22',pants:'#1a1a22',boot:'#121216',belt:'#8a1a1a'},
 BD={body:'#6a4a2a',bodyD:'#52381e',pants:'#3a3028',boot:'#2a1a10',belt:'#3a2414'},
 CN={body:'#7a2a44',bodyD:'#5e1e34',pants:'#3a2a3a',boot:'#2a1a10',belt:'#d8b860'};
CH.rogue_ninja={name:'Rogue',eye:O,a:arms(NJ),p:[...B(NJ),[4,1,8,2,'#26262e'],[3,3,2,6,'#26262e'],[11,3,2,6,'#26262e'],[5,7,6,2,'#26262e'],[4,3,8,1,'#26262e'],[12,1,2,3,'#8a1a1a'],[11,12,2,1,'#cfd6e0'],[12,11,1,3,'#cfd6e0']]}; // wrapped head and mask, red sash, a ninja star
CH.rogue_bandit={name:'Rogue',eye:O,a:arms(BD),p:[...B(BD),[4,1,8,2,'#4a3a24'],[3,3,2,5,'#4a3a24'],[11,3,2,5,'#4a3a24'],[5,7,6,2,'#a02a2a'],[11,8,2,2,'#a02a2a'],[5,12,2,2,'#8a6a3a'],[11,12,2,1,'#cfd6e0'],[4,10,1,4,'#3a2414']]}; // brown hood, red bandana, pouch, dagger
CH.rogue_con={name:'Rogue',eye:O,a:arms(CN),p:[...B(CN),[3,10,1,9,'#2a4a3a'],[4,1,8,2,'#2a4a3a'],[3,3,10,1,'#2a4a3a'],[10,0,4,1,'#f0f0f0'],[12,1,2,1,'#f0f0f0'],[5,9,6,1,'#f0e8d8'],[5,11,6,1,'#f2c84a'],[7,12,2,1,'#f2c84a'],[6,8,4,1,'#3a2a1a']]}; // feathered cap, ruff collar, gold chain, cape, mustache
// Druid (Mage): a forest room, a brown bear companion, a twisted wooden staff
const DR={body:'#5a6a3a',bodyD:'#46542c',pants:'#4a3a24',boot:'#3a2a1a',belt:'#8a5a2a'};
CH.druid={name:'Druid',eye:O,a:arms(DR),p:[...B(DR),[4,10,8,9,DR.body],[10,10,2,9,DR.bodyD],[4,14,8,1,DR.belt],[4,1,8,2,'#7a5a3a'],[4,3,1,4,'#7a5a3a'],[11,3,1,4,'#7a5a3a'],[5,7,6,3,'#8a6a48'],[6,10,4,1,'#8a6a48'],
 [4,0,2,1,'#4a9a3a'],[7,0,2,1,'#5aba4a'],[10,0,2,1,'#4a9a3a'],[1,6,1,14,'#6a4420'],[0,3,1,4,'#7a5430'],[1,2,3,1,'#7a5430'],[3,3,1,2,'#7a5430'],[2,4,1,1,'#5aba4a']]};
CLASS.druid='mage';TR.druid={up:'shadow',down:'shadow'};EXIT.shadow={x:68,y:66,ay:70}; // no doors: he slips into the shadow between two trees
// Blacksmith (Merchant and Fighter): 70% man / 30% woman, black apron, soot
const BSM={body:'#a08070',bodyD:'#806050',pants:'#4a3a30',boot:'#2a1a10',belt:'#3a2a1a'};
const smithCH=f=>({name:'Blacksmith',eye:O,a:arms(BSM),p:[...B(BSM),[5,11,6,8,'#24222a'],[5,10,1,1,'#24222a'],[10,10,1,1,'#24222a'],
 ...(f?[[4,1,8,2,'#3a2418'],[4,3,1,6,'#3a2418'],[11,3,1,6,'#3a2418'],[7,0,3,1,'#3a2418']]:[[5,1,6,2,'#2a1a10'],[5,7,6,2,'#3a2a20']]),[6,5,1,1,'#6a5a50'],[9,7,1,1,'#6a5a50'],[3,12,1,1,'#5a4a40'],[12,11,1,1,'#5a4a40']]});
CH.blacksmith_m=smithCH(0);CH.blacksmith_f=smithCH(1);CH.blacksmith=CH.blacksmith_m;
CLASS.blacksmith='merchant';TR.blacksmith={up:'backdoor',down:'backdoor'};
const EXTRA_CLASS={blacksmith:['fighter']}; // characters with a second built-in tag
// Paladin: a Knight blessed with holy fire at the forge (Priest + Knight next to the Blacksmith). Shiny armor, golden flame, glowing golden sword.
const PLC={body:'#c8d0e0',bodyD:'#a0a8c0',pants:'#8890a8',boot:'#4a4a5a',belt:'#f2c84a'};
CH.paladin={name:'Paladin',eye:O,a:arms(PLC),p:[...B(PLC),[4,1,8,3,'#e8eef8'],[4,4,1,4,'#f2c84a'],[11,4,1,4,'#f2c84a'],[7,0,2,1,'#f2c84a'],[7,11,2,3,'#f2a030'],[6,12,1,2,'#f2c84a'],[9,12,1,2,'#f2c84a'],[7,10,1,1,'#ffe080']]};
['paladin','blacksmith_m','blacksmith_f','druid'].forEach(b=>{const c=CH[b];for(let i=1;i<SKINS.length;i++){const[s,d]=SKINS[i],m=k=>k===S1?s:k===S2?d:k;CH[b+'~'+i]=Object.assign({},c,{a:Object.assign({},c.a,{skin:m(c.a.skin)}),p:c.p.map(r=>[r[0],r[1],r[2],r[3],m(r[4]),r[5]])})}});
['rogue_ninja','rogue_bandit','rogue_con'].forEach(b=>{const c=CH[b];for(let i=1;i<SKINS.length;i++){const[s,d]=SKINS[i],m=k=>k===S1?s:k===S2?d:k;CH[b+'~'+i]=Object.assign({},c,{a:Object.assign({},c.a,{skin:m(c.a.skin)}),p:c.p.map(r=>[r[0],r[1],r[2],r[3],m(r[4]),r[5]])})}});
SKIN_CHARS.push('blacksmith','druid');
// Green metal mage armor the Blacksmith forges for a Wizard (sprite copies like wizard_blue_arm)
for(const c in WIZ_COLORS)CH['wizard_'+c+'_arm']=Object.assign({},CH['wizard_'+c],{p:[...CH['wizard_'+c].p,[3,9,3,2,'#3aa86a'],[10,9,3,2,'#2a8a54'],[5,11,6,3,'#4ac87a'],[5,11,6,1,'#8af0b0'],[7,12,2,1,'#2a8a54']]});
ALL_CHARS.push('druid','blacksmith');NAMES.druid='Druid';NAMES.blacksmith='Blacksmith';NAMES.ingot='Ingot';
// A fifth Knight weapon: the battle axe
WEAPONS.push('axe');
// Ingot: sold by the Blacksmith for INGOT_COST coins; on any character it adds the Fighter tag (reinforced)
ITEMS.push('ingot');
const INGOT_COST=100,SMITH_UNLOCK=100,ADVENTURE_TIME=180;
// druid = his idle activities; spirit = idle chance to commune with a nature spirit (all 4 spaces around him open and empty)
// adventure = the Blacksmith recruits his Fighter neighbors (needs 2+); adventureDeath = each one's risk; smithtalk = share of Knight visits about smithing (else reforging)
Object.assign(ODDS,{druid:{grove:.4,animals:.4,weather:.2},spirit:.2,adventure:.2,advArtifact:.05,smithtalk:.6,rogueOutfit:{ninja:.4,bandit:.4,con:.2}});
// Blacksmith relative to each character (any side = the same scene)
const SIDES=k=>({left:k,right:k,above:k,below:k});
PAIRS['blacksmith>necromancer']=SIDES('nscoff');PAIRS['blacksmith>knight']=SIDES('smithk');PAIRS['blacksmith>wizard']=SIDES('metal');PAIRS['blacksmith>merchant']=SIDES('awkjoke');
PAIRS['blacksmith>apothecary']=SIDES('flirt');PAIRS['blacksmith>alchemist']=SIDES('childhood');PAIRS['blacksmith>priest']=SIDES('holyfire');PAIRS['blacksmith>rogue']=SIDES('rbuy');
const NSCOFF=[['necromancer','Armor? How quaint.'],['blacksmith','Best steel in the land, friend.'],['necromancer','Steel rusts. Bones are forever.'],['blacksmith','...Bones break, too.'],['necromancer','Death is only the beginning.']];
const SMITHTALK=[[['blacksmith','I am folding the steel twelve times now.'],['knight','Twelve! My old sword was folded twice.'],['blacksmith','And quenched in oil, not water.'],['knight','Fascinating. Truly the age of wonders.']],
 [['knight','Have you tried the new fluted plate?'],['blacksmith','Lighter and stronger. Lovely work.'],['knight','I could dance in it!'],['blacksmith','Please do not dance in it.']]];
const AWKJOKE=[['merchant','Why did the apple go to the forge?'],['blacksmith','...Why?'],['merchant','To get a little... tart-ened!'],['blacksmith','...'],['merchant','...Tempered? Tart? No?']];
const FLIRT=[['blacksmith','I forged this ring. Matches your eyes.'],['apothecary','It is a horseshoe.'],['blacksmith','A very romantic horseshoe.'],['apothecary','I have potions to brew. Goodbye.']];
const CHILDHOOD=[[['alchemist','Remember when we blew up the mill?'],['blacksmith','YOU blew up the mill. I just held the bucket.'],['alchemist','We were nine!'],['blacksmith','Best friends since. Even after the mill.']],
 [['blacksmith','You still owe me for that "gold" you made.'],['alchemist','It was gold! For an hour.'],['blacksmith','My mother wore it to church.'],['alchemist','And it turned her finger green. Good times.']]];
const RBUY=[['rogue','Twenty daggers and fifty ninja stars, please.'],['blacksmith','Twenty? You bought twenty last week!'],['rogue','I keep... leaving them in people.'],['blacksmith','Ha! Business is business.']];
const METALTALK=[['wizard','The armor hums at night, you know.'],['blacksmith','Moonsteel does that. It likes you.'],['wizard','A fireball bounced right off it!'],['blacksmith','Told you. Finest work of my life.']];
Object.assign(NAMES,{grove:'Tending the grove',animals:'Talking to animals',weather:'Predicting the weather',spirit:'Secret: a nature spirit',dpotion:'Potion on Druid: saved for a rainy day',dscroll:'Scroll on Druid: the weather changes',drevive:'Scroll on a buried Druid: revived',dburied:'A buried Druid',
 ingotshop:'Coin in the Blacksmith\'s room: ingot for 100 coins',reinforce:'Ingot on anyone: reinforced (Fighter tag)',adventure:'Adventure (3 min)',
 nscoff:'Armor? How quaint.',smithk:'Smithing talk',reforge:'A new weapon for the Knight',metal:'Magical metal',greenarmor:'Green mage armor',metaltalk:'Talking about the armor',awkjoke:'An awkward joke',flirt:'Flirting (badly)',childhood:'Childhood friends',holyfire:'Holy fire',paladin:'Secret: the Paladin',rbuy:'Daggers and ninja stars','prac:axe':'Weapon practice: axe'});
EGGS.push('spirit','paladin');
COMP_TABS.find(t=>t.id==='knight').idle.splice(4,0,'prac:axe');
COMP_TABS.push({id:'druid',name:'Druid',pairs:[],idle:['grove','animals','weather','dburied'],items:['dpotion','dscroll','drevive','spirit']},
 {id:'blacksmith',name:'Blacksmith',pairs:['nscoff','smithk','reforge','metal','greenarmor','metaltalk','awkjoke','flirt','childhood','holyfire','rbuy','adventure'],idle:['forgework','smelt','coal','pour'],items:['ingotshop','reinforce','bpotion','bscroll','paladin','leadgold']});
// Blacksmith idles: hammering 40%, smelting armor or a sword 40%, stocking the furnace with coal 19%, pouring an ingot mold 1% (+1 ingot).
// Secret: next to the Alchemist, 15% (rolled first) they turn lead into gold: +5 coins.
Object.assign(ODDS,{smith:{forgework:.4,smelt:.4,coal:.19,pour:.01},leadgold:.15});
const LEADGOLD_GAIN=5,DANCE_TIME=15;
Object.assign(NAMES,{forgework:'Hammering at the anvil',smelt:'Smelting armor or a sword',coal:'Stocking the furnace',pour:'Pouring an ingot mold',bpotion:'Potion on Blacksmith: handed back',bscroll:'Scroll on Blacksmith: uncontrollable dancing',leadgold:'Secret: lead into gold'});
EGGS.push('leadgold');
Object.assign(DESC,{forgework:'The Blacksmith hammers at the anvil. Sparks fly everywhere. So does soot.',
 smelt:'The Blacksmith smelts a piece of armor or a sword (50/50) in the roaring furnace.',
 coal:'The Blacksmith shovels coal into the furnace. The fire roars.',
 bpotion:'Potion on the Blacksmith: "I do not drink that stuff." You get it back.',
 bscroll:'Spell scroll on the Blacksmith: the spell goes wrong and he dances uncontrollably for 15 seconds.',
 leadgold:'Secret: with the Alchemist next to the Blacksmith, 15% of his idle time they turn lead into gold. +5 coins.'});
COMP_TABS.forEach(t=>{const add={necromancer:['nscoff'],knight:['smithk','reforge','adventure'],wizard:['metal','greenarmor','metaltalk'],merchant:['awkjoke'],apothecary:['flirt'],alchemist:['childhood'],priest:['holyfire'],rogue:['rbuy','adventure']}[t.id];if(add)t.pairs.push(...add);
 if(t.id==='knight')t.items.push('paladin')});
Object.assign(PAIR_WITH,{nscoff:['blacksmith','necromancer'],smithk:['blacksmith','knight'],reforge:['blacksmith','knight'],metal:['blacksmith','wizard'],greenarmor:['blacksmith','wizard'],metaltalk:['blacksmith','wizard'],
 awkjoke:['blacksmith','merchant'],flirt:['blacksmith','apothecary'],childhood:['blacksmith','alchemist'],holyfire:['blacksmith','priest'],rbuy:['blacksmith','rogue'],adventure:['blacksmith','tag:fighter']});
Object.assign(DESC,{
 'prac:axe':'Knight with a battle axe. Big, heavy chops. Firewood for a week.',
 grove:'The Druid tends his grove of trees. They seem to like him.',
 animals:'Deer and birds come out of the trees to chat with the Druid. He understands every word.',
 weather:'The Druid casts green nature magic to predict the weather. Leaves blow everywhere. Results vary.',
 dburied:'When the Druid dies he does not go back to the shelf: he is buried in his space and a sapling grows. Nobody visits him until he is revived.',
 dpotion:'Potion on the Druid: he tucks it away for a rainy day. (It is used up.)',
 dscroll:'Spell scroll on the Druid: he reads it to the sky and the weather over the whole board changes to another one, picked at random.',
 drevive:'Spell scroll on the buried Druid\'s space: the sapling glows and the Druid climbs back out.',
 ingotshop:'Tap the coin in the Blacksmith\'s room to buy a steel ingot for 100 coins.',
 reinforce:'Ingot on any character: reinforced! They gain the Fighter tag for good.',
 nscoff:'Blacksmith and Necromancer, any side. The Necromancer scoffs at armor. Death is only the beginning, apparently.',
 metal:'Blacksmith and Wizard, any side. The Wizard brings a magical metal. "Can you work this?" Usually: no.',
 metaltalk:'Blacksmith and a Wizard in green armor: they talk about how powerful its magic is.',
 awkjoke:'Blacksmith and Fruit Merchant, any side. A joke the Blacksmith does not get. Awkward silence.',
 flirt:'Blacksmith and Apothecary, any side. He flirts. She is not interested. At all.',
 childhood:'Blacksmith and Alchemist, any side. They grew up together and share old stories.',
 holyfire:'Blacksmith and Priest, any side. The Priest offers holy fire for the forge. The Blacksmith politely declines.',
 paladin:'Secret: Priest and Knight both next to the Blacksmith. Holy fire is accepted and the Knight is forged into a Paladin.',
 rbuy:'Blacksmith and Rogue, any side. The Rogue needs more daggers and ninja stars. Again.'});
DESC.dungeon='Rogue above the Knight. They go dungeon crawling for 3 minutes and come back with coins, an artifact, scrolls, potions or a secret.';
NAMES.dungeon='Dungeon crawl (3 min)';

// ---------- Druid: weather on the board, familiars, Archdruid; Blacksmith next to the Druid ----------
// The Druid never visits neighbors. When he would, he casts instead (WEATHER_TIERS): Overgrowth (common) on a random open space
// (with or without a box) for WEATHER_TIME seconds, at most WEATHER_MAX at once; or (rare) he changes the board's weather (BOARD_WX).
const WEATHER_TIME=30,WEATHER_MAX=2;
Object.assign(ODDS,{familiar:{bear:1/3,eagle:1/3,wolf:1/3}}); // the Druid's animal
const DRUID_DISCOUNT=5; // secret: coins off an Apothecary potion while the Druid is next to her
const WX_NAMES={overgrowth:'Overgrowth',messenger:'Animal Messenger',heal:'Healing Word',fertile:'Fertile Land',blessing:"Nature's Blessing",tree:'Conjure Tree',unicorn:'Mythic Spotting',shift:'Winds of Change'};
const WX_SAY={overgrowth:'Grow, little seeds, grow!',messenger:'Go, old friend. Take this to them.',heal:'Be well again. Rise and be whole.',fertile:'Soil, wake up and give!',blessing:'Earth, send us a tiller of fields!',tree:'Ancient roots, rise from the deep!',unicorn:'Hush... something rare is near.',shift:'Winds of change, turn the sky!'};
// ---------- the board's weather (one for the whole board; changes every WX_EVERY seconds of play, saved) ----------
// Tiers as everywhere else (RARITY). Effects: sunny = visits +WX_SUN_VISIT (taken from wandering); rainy = idle +WX_RAIN_IDLE (taken from visits);
// fae wind = the rarest idle and visit scenes in each list x WX_FAE (taken from the common ones). Partly cloudy: nothing.
const BOARD_WX={cloudy:{name:'Partly Cloudy',tier:'c',info:'No special effects.'},sunny:{name:'Sunny',tier:'u',info:'Everyone visits their neighbors more (+10%, less wandering).'},
 rainy:{name:'Rainy',tier:'u',info:'Everyone stays in more: idle activities +15% (fewer visits).'},fae:{name:'Fae Wind',tier:'l',info:'Magic is in the air: the rarest idle activities and visit scenes are four times as likely.'}};
const WX_EVERY=600,WX_SUN_VISIT=.1,WX_RAIN_IDLE=.15,WX_FAE=4;
const WX_CHANGE_SAY={cloudy:'A few clouds roll in.',sunny:'The sun comes out!',rainy:'It starts to rain.',fae:'A strange pink wind sweeps over the land...'};
// Archdruid: the Druid after an artifact. A living staff with a glowing orb, a golden leaf crown.
CH.druid_arch=Object.assign({},CH.druid,{name:'Archdruid',p:[...CH.druid.p,[4,0,2,1,'#f2c84a'],[7,0,2,1,'#f2c84a'],[10,0,2,1,'#f2c84a'],[0,0,3,3,'#9affb0'],[1,1,1,1,'#ffffff'],[3,1,1,2,'#5aba4a'],[0,4,1,1,'#5aba4a'],[2,8,1,1,'#5aba4a']]});
// Blacksmith and Druid (any side): metal is SO uncomfortable. The Blacksmith rolls his eyes.
PAIRS['blacksmith>druid']=SIDES('metalitch');
const METALITCH=[['druid','How do you wear metal all day?'],['druid','It is cold. It pinches. It clanks!'],['druid','Bark and leaves breathe, you know.'],['blacksmith','...Bark. Right.']];
// Werewolf (a sprite; no longer used by the Druid's weather)
const WWC={body:'#5a5a66',bodyD:'#46464f',pants:'#3a3040',boot:'#2a2a30',belt:'#3a3040',skin:'#6a6a76',skinD:'#55555f'};
CH.werewolf={name:'Werewolf',eye:'#ff3030',a:arms(WWC),p:[...B(WWC),[4,1,2,3,'#46464f'],[10,1,2,3,'#46464f'],[9,6,4,3,'#7a7a86'],[12,6,1,1,O],[6,9,1,1,'#f0ead0'],[10,9,1,1,'#f0ead0'],[5,10,6,2,'#7a7a86']]};
Object.assign(NAMES,{metalitch:'Metal is uncomfortable',archdruid:'Artifact on Druid: the Archdruid',ddiscount:'Secret: herbal discount','wx:overgrowth':'Overgrowth','wx:shift':'Changing the weather'});
EGGS.push('ddiscount');
{const dt=COMP_TABS.find(t=>t.id==='druid');dt.pairs.push('metalitch');dt.idle.push(...Object.keys(WX_NAMES).map(k=>'wx:'+k));dt.items.splice(3,0,'archdruid');dt.items.push('ddiscount');
 COMP_TABS.find(t=>t.id==='blacksmith').pairs.push('metalitch')}
PAIR_WITH.metalitch=['blacksmith','druid'];
Object.assign(DESC,{metalitch:'Blacksmith and Druid, any side. The Druid explains how uncomfortable metal is to wear. The Blacksmith rolls his eyes.',
 archdruid:'Artifact on the Druid: he becomes the Archdruid, with a glowing living staff and a golden leaf crown.',
 ddiscount:'Secret: with the Druid next to the Apothecary, her potions cost 5 coins less (herbs from his grove).',
 'wx:shift':'Instead of a visit, the Druid sometimes calls the winds and changes the weather over the whole board (Sunny, Rainy, Partly Cloudy or, very rarely... something else).'});

// ---------- the Monarch (no tags) ----------
// A King (50%) or a Queen (50%), saved in the box's color ('m' / 'f'). Generous (50%) or greedy (50%), saved; later it will change how they treat others.
// Unlocked by having MONARCH_UNLOCK boxes on the board. Room: a throne, a fancy back door and fancy side doors, a juggling jester.
const MONARCH_UNLOCK=10;
// Royal colors, one picked when a Monarch is placed (saved): robe, trim (belt, banners' edges), crown; main / dark = the throne room's banners and carpet
const MPAL={red:{body:'#8a1a3a',bodyD:'#6a1028',pants:'#5a1020',trim:'#f2c84a',crown:'#f2c84a',main:'#a01a3a',dark:'#8a1030'},
 emerald:{body:'#1e7a4a',bodyD:'#145a36',pants:'#104a2c',trim:'#f4ecd0',crown:'#f2c84a',main:'#1e8a52',dark:'#146a3e'},
 blue:{body:'#2a4a9a',bodyD:'#1e3672',pants:'#1a2c5a',trim:'#d0d8e4',crown:'#d8dee8',main:'#2a52a8',dark:'#1e3c80'},
 black:{body:'#24202a',bodyD:'#16141a',pants:'#121014',trim:'#8a1a2a',crown:'#f2c84a',main:'#2a2430',dark:'#7a1424'}};
const monarchCH=(f,P)=>{P=P||MPAL.red;const M={body:P.body,bodyD:P.bodyD,pants:P.pants,boot:'#3a1a1a',belt:P.trim};return{name:'Monarch',eye:O,a:arms(M),p:[...B(M),[4,10,8,9,M.body],[10,10,2,9,M.bodyD],[4,14,8,1,M.belt],[4,9,8,2,'#f4f0e8'],[5,10,1,1,O],[8,9,1,1,O],[10,10,1,1,O],
 ...(f?[[4,2,1,8,'#d8a040'],[11,2,1,8,'#d8a040'],[5,2,6,1,'#d8a040']]:[[5,7,6,2,'#8a5a2a'],[6,9,4,1,'#8a5a2a'],[5,2,6,1,'#8a5a2a']]),
 [5,1,6,1,P.crown],[5,0,1,1,P.crown],[7,0,2,1,P.crown],[10,0,1,1,P.crown],[7,1,2,1,'#d03050']]}}; // ermine collar, crown with a ruby; beard (King) or long hair (Queen)
// Sprites: monarch_m / monarch_f in red, monarch_m_emerald, monarch_f_blue, ...
for(const k in MPAL){const s=k==='red'?'':'_'+k;CH['monarch_m'+s]=monarchCH(0,MPAL[k]);CH['monarch_f'+s]=monarchCH(1,MPAL[k])}
CH.monarch=CH.monarch_m;
TR.monarch={up:'royaldoor',down:'royaldoor'};EXIT.royaldoor=EXIT.backdoor; // a fancy back door (same place as the plain one)
// The jester juggling in the throne room (drawn as room life)
const JK={body:'#c03030',bodyD:'#e8c030',pants:'#e8c030',boot:'#3a1a3a',belt:'#3a1a3a'};
CH.joker={name:'Jester',eye:O,a:arms(JK),p:[...B(JK),[5,10,1,4,'#e8c030'],[10,10,1,4,'#c03030'],[3,2,4,2,'#c03030'],[9,2,4,2,'#e8c030'],[2,0,2,3,'#c03030'],[12,0,2,3,'#e8c030'],[1,2,1,1,'#f2c84a'],[14,2,1,1,'#f2c84a'],[5,4,6,1,'#c03030']]};
[...Object.keys(CH).filter(b=>b.startsWith('monarch_')),'druid_arch'].forEach(b=>{const c=CH[b];for(let i=1;i<SKINS.length;i++){const[s,d]=SKINS[i],m=k=>k===S1?s:k===S2?d:k;CH[b+'~'+i]=Object.assign({},c,{a:Object.assign({},c.a,{skin:m(c.a.skin)}),p:c.p.map(r=>[r[0],r[1],r[2],r[3],m(r[4]),r[5]])})}});
SKIN_CHARS.push('monarch');ALL_CHARS.push('monarch');NAMES.monarch='Monarch';
// Monarch idle: holding court on the throne (what they say depends on generous / greedy)
const COURT={generous:['Bread and honey for everyone!','Lower the taxes. Again!','Is anyone hungry? Feast tonight!','My treasury is your treasury.'],
 greedy:['More gold for the vault!','Raise the taxes. Again!','Who touched my crown?','The jester costs too much.']};
NAMES.court='Holding court';
DESC.court='The Monarch sits on the throne and gives royal orders. A generous ruler gives things away; a greedy one wants more gold. (Each Monarch is one or the other, 50/50.)';
COMP_TABS.push({id:'monarch',name:'Monarch',pairs:[],idle:['court'],items:[]});

// ---------- Monarch requests, the grand funeral; the Traveling Merchant; more Farmers ----------
// Requests: a neighbor visits the Monarch once to ask for something (again only after dying or going back to the shelf).
// reqGenerous / reqGreedy = chance the request is granted; regicide = idle chance (rolled first) that someone who was denied
// kills the Monarch, from anywhere on the board; drain = Necromancer on the bottom row visiting the Druid beside him kills him;
// travelArrive = chance per second that the Traveling Merchant, while on the road, shows up on a free space
Object.assign(ODDS,{reqGenerous:.8,reqGreedy:.1,regicide:.003,drain:.3,travelArrive:1/600});
ODDS.spirit=.1; // the Druid's nature spirit (all four spaces around him open and empty)
const ROYAL_FUNERAL_TIME=60,MONARCH_COST=150,LEAVE_TIME=300,TRAVEL_TIME=300,TRAVEL_ARTIFACT=300,TRAVEL_BUY={scroll:15,potion:15,ingot:30},PRISONERS=3,DRUID_FARMS=3;
// What each character asks the Monarch for (paladin = a Knight who is a Paladin; other Knights have nothing to ask)
const REQ_ASK={paladin:'Your Majesty, would you knight me officially?',blacksmith:'Your Majesty, I could use an assistant at the forge.',wizard:'Your Majesty, I humbly request a new staff.',
 priest:'Your Majesty, the chapel needs holy water.',alchemist:'Your Majesty, I need rare ingredients for my research.',rogue:'Your Majesty, I... need money. For reasons.',
 merchant:'Your Majesty, may I sell exotic fruit from the south?',apothecary:'Your Majesty, may I have some time off? I have a date.',necromancer:'Your Majesty, might I have a few prisoners? For... research.',
 druid:'Your Majesty, please give some land back to nature.'};
const REQ_YES={generous:['Granted, with pleasure!','Of course! Anything for my people.'],greedy:['*scoff* Fine. Take it and go.','Ugh. Granted. Now stop asking.']};
const REQ_NO={generous:['I am truly sorry. I cannot grant that.','Forgive me, my friend. Not this time.'],greedy:['Denied! Now leave.','Absolutely not. Guards!']};
const REQ_ICON={paladin:'star',blacksmith:'ingot',wizard:'staff',priest:'barrel',alchemist:'potion',rogue:'sack',merchant:'pineapple',apothecary:'wine',necromancer:'skull',druid:'wheat'};
// Prisoners (the Necromancer's request) and the Blacksmith's apprentice
const PRC={body:'#8a8478',bodyD:'#6e695f',pants:'#6e695f',boot:'#4a4440',belt:'#4a4440'};
CH.prisoner={name:'Prisoner',eye:O,a:arms(PRC),p:[...B(PRC),[5,1,6,2,'#5a4a3a'],[3,14,2,1,'#5a5a64'],[11,14,2,1,'#5a5a64'],[5,12,2,1,'#5a5a64']]};
const APC={body:'#7a6a5a',bodyD:'#5e5044',pants:'#4a3a30',boot:'#2a1a10',belt:'#3a2a1a'};
CH.apprentice={name:'Apprentice',eye:O,a:arms(APC),p:[...B(APC),[5,11,6,7,'#24222a'],[5,1,6,2,'#8a5a2a'],[4,2,1,3,'#8a5a2a'],[7,6,1,1,'#6a5a50']]};
// The Wizard's new staff from the Monarch: pointed dark steel with an orb floating above it (sprite copies like wizard_blue_st, wizard_blue_arm_st)
Object.keys(CH).filter(b=>b.startsWith('wizard_')).forEach(b=>{const c=CH[b];CH[b+'_st']=Object.assign({},c,{p:[...c.p.filter(r=>!(r[0]===1&&r[1]===5&&r[3]===15)&&!(r[0]===0&&r[1]===3&&r[2]===3)),[1,4,1,16,'#4a4e5e'],[1,3,1,1,'#aab0c0'],[0,0,3,2,c.p.find(r=>r[0]===0&&r[1]===3)[4]]]})});
// More Farmers at once (the Druid's request): extra Farmer boxes 'farmer2' and 'farmer3' work like the first
const isFarm=id=>id==='farmer'||id==='farmer2'||id==='farmer3';
['farmer2','farmer3'].forEach(k=>{CH[k]=CH.farmer;CLASS[k]='merchant';TR[k]=TR.farmer});
// Traveling Merchant (Merchant): a man or a woman with a mule-drawn covered wagon. Unlocked by 4 Merchants in a 2x2 square on the board.
// Stays TRAVEL_TIME seconds, then hits the road (not back to the shelf) and now and then turns up on a free space for another TRAVEL_TIME.
const TVC={body:'#6a5a3a',bodyD:'#52462c',pants:'#4a3a2a',boot:'#3a2a1a',belt:'#a0782a'};
const travelerCH=f=>({name:'Traveling Merchant',eye:O,a:arms(TVC),p:[...B(TVC),[3,10,1,9,'#4a5a3a'],[12,10,1,9,'#3a4a2c'],[5,9,6,1,'#c04040'],
 ...(f?[[4,3,1,7,'#b8742a'],[11,3,1,7,'#b8742a']]:[[5,7,6,2,'#6a4a2a'],[6,9,4,1,'#6a4a2a']]),[2,2,12,1,'#5a3a22'],[5,0,6,2,'#5a3a22'],[5,1,6,1,'#c04040']]}); // wide hat with a red band, scarf, cloak
CH.traveler_m=travelerCH(0);CH.traveler_f=travelerCH(1);CH.traveler=CH.traveler_m;
['traveler_m','traveler_f'].forEach(b=>{const c=CH[b];for(let i=1;i<SKINS.length;i++){const[s,d]=SKINS[i],m=k=>k===S1?s:k===S2?d:k;CH[b+'~'+i]=Object.assign({},c,{a:Object.assign({},c.a,{skin:m(c.a.skin)}),p:c.p.map(r=>[r[0],r[1],r[2],r[3],m(r[4]),r[5]])})}});
CLASS.traveler='merchant';TR.traveler={up:'fade',down:'fade'};SKIN_CHARS.push('traveler');ALL_CHARS.push('traveler');NAMES.traveler='Traveling Merchant';
// ---- Compendium ----
const REQS=Object.keys(REQ_ASK);
Object.assign(NAMES,{'rq:paladin':'Request: knighted','rq:blacksmith':'Request: an apprentice','rq:wizard':'Request: a new staff','rq:priest':'Request: holy water','rq:alchemist':'Request: rare ingredients',
 'rq:rogue':'Request: money','rq:merchant':'Request: exotic fruit','rq:apothecary':'Request: time off for a date','rq:necromancer':'Request: prisoners','rq:druid':'Request: land for nature',
 rqdeny:'A request denied',royalfuneral:'The grand funeral',regicide:'Secret: revenge',royalpatron:'Secret: royal patron',drain:'Life drain',
 wares:'Arranging the wares',troad:'On the road',tshop:'Coin in the Traveling Merchant\'s room: artifact for 300 coins',tscroll:'Scroll on Traveling Merchant: sold (+15 coins)',tpotion:'Potion on Traveling Merchant: sold (+15 coins)',tingot:'Ingot on Traveling Merchant: sold (+30 coins)'});
EGGS.push('regicide','royalpatron');
{const mt=COMP_TABS.find(t=>t.id==='monarch');mt.pairs.push(...REQS.map(k=>'rq:'+k),'rqdeny');mt.idle.push('royalfuneral');mt.items.push('regicide','royalpatron');
 REQS.forEach(k=>{const id=k==='paladin'?'knight':k;COMP_TABS.find(t=>t.id===id).pairs.push('rq:'+k);PAIR_WITH['rq:'+k]=['monarch',id]});PAIR_WITH.rqdeny=['monarch','anyone'];
 COMP_TABS.find(t=>t.id==='blacksmith').items.push('royalpatron');
 COMP_TABS.find(t=>t.id==='necromancer').pairs.push('drain');COMP_TABS.find(t=>t.id==='druid').pairs.push('drain');PAIR_WITH.drain=['necromancer','druid']}
COMP_TABS.push({id:'traveler',name:'Traveling Merchant',pairs:[],idle:['wares','troad'],items:['tshop','tscroll','tpotion','tingot']});
// ---------- Compendium descriptions: every chance says what it is a chance OF ----------
// "of their visits" = when one of the two visits the other; "of his idle activities" = when he picks something to do at home;
// "checked first" = rolled before his normal idle choices; "each time he decides" = every few seconds, before anything else.
const REQ_ODDS=' A generous Monarch grants 80% of requests, a greedy one 10%. Each character asks only once (again only after dying or going back to the shelf).';
Object.assign(DESC,{
 spar:'Knight and Wizard, any side: 2% of their visits to each other. Sword versus magic shield. Nobody wins, everybody sweats.',
 zeal:'Priest above the Knight. No scene of its own: the fired-up Knight visits his neighbors 60% more often.',
 crusade:'Priest above the Knight: 2% of their visits to each other. They march off for 2 minutes and come back with 10 coins (70%) or an artifact (30%).',
 tentacle:'Priest left of the Knight: 10% of their visits (instead of the short prayer). Eldritch tentacles smash the Priest\'s window. The Knight sorts it out.',
 braver:'Priest and any Fighter, any side: 5% of their visits to each other. The Priest admits the Fighter is braver. The Fighter pretends not to blush.',
 horde:'Necromancer right of the Knight. Three skeletons for target practice. In 5% of these visits the skeletons win and the Knight dies.',
 cleanse:'Priest and Necromancer, any side, while a Death Knight is on the board: whenever either of them would visit, the Priest turns the Death Knight back into a Knight instead.',
 duel:'Necromancer above the Wizard: half of their visits. Black lightning versus blue lightning. They really do not like each other.',
 craft:'Necromancer above the Wizard: the other half of their visits. Together they craft a spell scroll for 20 coins (with fewer coins, one of them just shows off a spell).',
 forge:'Wizard and Necromancer, any side: 1% of their visits to each other. They conjure a free scroll or potion out of thin air.',
 apple:'Priest left of the Fruit Merchant: half of their visits. The Priest buys a dropped apple for 1 coin (unless he slips on it).',
 slip:'Priest left of the Fruit Merchant: 5% of the apple visits. The Priest steps on the apple, falls and dies. It does not end well.',
 feast:'Priest left of the Fruit Merchant: the other half of their visits. A table of food appears and two nobles invite themselves.',
 fruitfall:'Fruit Merchant above the Priest: half of their visits. From his own room he drops fruit on the Priest\'s head. He thinks it is hilarious.',
 starfruit:'Fruit Merchant above the Priest: the other half of their visits. A starfruit fit for a saint. +5 coins.',
 murder:'Fruit Merchant right of the Wizard: 0.5% of their visits (instead of jokes). The joke goes very, very wrong. The Wizard dies.',
 advertW:'Fruit Merchant left of the Wizard. The Wizard advertises the fruit: 1 coin every 30 seconds for a minute (a second advert makes it 2 and restarts the minute). The only coins that trickle in by themselves.',
 farm:'Fruit Merchant left of the Apothecary: 1.5% of their visits. They hire a Farmer, whose field grows for 3 minutes and then pays 30 coins.',
 apgift:'Apothecary left of the Fruit Merchant. A free potion for him: he speaks backwards until he gets another one.',
 cobrew:'Wizard right of the Apothecary. They brew together. 20% of these visits: before the Alchemist is unlocked, he shows up (unlocked!); after that, they brew you a free potion.',
 boom:'Wizard left of the Apothecary. Too much newt: the brew explodes. In 2% of these visits it kills them both.',
 imp:'Wizard above the Apothecary: 40% of their visits. He summons an imp, zaps it, and bottles its blood for her.',
 purplepot:'Wizard above the Apothecary: 60% of their visits. She mixes a purple potion; he drinks it and tastes colors.',
 pstudy:'Priest right of the Apothecary. They study alchemy texts together. In 5% of these visits they find a clue: a hidden secret is shown in the Compendium.',
 heal:'Priest below the Apothecary. A sick farmer comes in; prayer plus medicine fixes him. In 2% of these visits he stays and sets up a farm nearby.',
 bloodorange:'Necromancer right of the Fruit Merchant: he goes shopping for a blood orange. 30% of the time there is one left (+3 coins).',
 ntrade:'Necromancer left or right of the Apothecary. Rare undead ingredients for a black potion. With the Alchemist next to her, 20% of these trades also give you a potion.',
 wave:'Anyone: 10% of their idle activities (checked first). They wave to a neighbor, and a neighbor who is free waves back.',
 demon:'The Wizard: 2% of his idle activities. He summons a demon, which drags him through the floor. He dies.',
 brew:'The Wizard next to a Merchant, while you have 5 coins: 1% of his idle activities (checked first). He spends 5 coins to brew a potion.',
 cat:'The Eldritch Knight, while a Wizard is on the board: 1% of his idle activities. A black cat strolls through the Wizard\'s room. Spooky.',
 orc:'The Knight: 20% of his idle activities. He spots an orc in a neighbor\'s room and charges over to deal with it.',
 horse:'The Knight: 5% of his idle activities, if the space to his right has no box. He feeds hay to his horse.',
 tithe:'The Priest: 10% of his idle activities. He prays for fortune. Fortune answers: +3 coins.',
 massprayer:'A Priest whose four neighbors are all free: 5% each time he decides what to do. Everyone squeezes into his room to pray for 20 seconds.',
 funeral:'A Fighter next to the Priest dies: 1.5 seconds later the Priest holds a 12 second funeral, and every free neighbor comes to pay respects.',
 raise:'The Necromancer: 1% of his idle activities. He raises a skeleton in a random free character\'s room. Fighters and Mages beat it; anyone else dies.',
 mob:'The Fruit Merchant: 1% of his idle activities. An angry farmer mob pelts him with his own fruit.',
 alcpotion:'Potion on the Alchemist: for 1 minute, the rarest scene chances of him and his neighbors are 30% higher (their spaces glitter).',
 assassin:'The Rogue and any neighbor (whoever visits whom): 0.5% of their visits. The Rogue was an assassin all along. The neighbor does not survive. (Not while he is disguised.)',
 promo:'A Fruit Merchant or Apothecary next to the Alchemist: 10% of their idle activities (checked first). A customer buys one of the Alchemist\'s potions. +5 coins.',
 beast:'Secret: the mad scientist, 15% of his idle activities (checked first): he turns into a beast-man and attacks a free neighbor. A neighbor who is only a Merchant dies; a Fighter or Mage fights back and one of the two dies (50/50).',
 fourmage:'Secret: with Mages on all four sides of the Alchemist, 10% each time he decides what to do: he visits one of them and hands over a potion, which works just as if you had used it on them.',
 tempt:'Rogue left of the Priest. A demon whispers: kill the Priest. In 95% of these visits he says no. In 5%... he does not.',
 roguemage:'Spell scroll on the Rogue: he gains the Mage tag. While he has it, 0.2% of his idle activities (checked first) he conjures an artifact, which uses the tag up.',
 spirit:'Secret: with all four spaces around the Druid open and empty, 10% of his idle activities (checked first): he communes with a nature spirit, and a hidden secret is shown in the Compendium.',
 pour:'The Blacksmith: 1% of his idle activities. He pours molten metal into a mold: a free ingot!',
 leadgold:'Secret: with the Alchemist next to the Blacksmith, 15% of the Blacksmith\'s idle activities (checked first): they turn lead into gold. +5 coins.',
 adventure:'The Blacksmith with 2 or more Fighter neighbors at home: 20% of his visits become an adventure. ALL his Fighter neighbors leave for 3 minutes (he stays). Each one has a 10% risk of not coming back. Loot per adventurer: 1-10 coins if a Fighter, 20% a scroll if a Mage, 5% an artifact if a Merchant.',
 smithk:'Blacksmith and Knight, any side: 60% of their visits. They nerd out about the newest smithing tricks.',
 reforge:'Blacksmith and Knight, any side: 40% of their visits. The Blacksmith forges the Knight a different weapon (it stays).',
 greenarmor:'Blacksmith and Wizard, while Mages are on all four sides of the Blacksmith: instead of refusing, he CAN work the magical metal. Green metal mage armor!',
 desk:'With a Merchant and another Mage next to him, the Wizard gets a writing desk: tap the coin in his room to buy a spell scroll (50 coins, 30 for the black Wizard).',
  'wx:overgrowth':'Instead of a visit, the Druid makes flowers grow on a random open space for 30 s (at most 2 at once). Pink and yellow flowers bloom all around its border. Lovely, and nothing more.',
 // the Monarch
 court:'The Monarch\'s idle activity: holding court on the throne. A generous Monarch hands things out, a greedy one wants more gold, and a greedy Monarch never visits anyone. The first Monarch of a game is free; each one after that costs 150 coins to place.',
 'rq:paladin':'A Paladin next to the Monarch, the first time he visits: he asks to be knighted. Granted: he kneels in the throne room, is dubbed, and becomes "Sir Paladin".'+REQ_ODDS,
 'rq:blacksmith':'The Blacksmith next to the Monarch, the first time he visits: he asks for an assistant. Granted: an apprentice moves into the forge for good and potters about.'+REQ_ODDS,
 'rq:wizard':'The Wizard next to the Monarch, the first time he visits: he asks for a new staff. Granted: a pointed dark steel staff with an orb floating above it, for good.'+REQ_ODDS,
 'rq:priest':'The Priest next to the Monarch, the first time he visits: he asks for holy water. Granted: a barrel of holy water stands in his chapel for good.'+REQ_ODDS,
 'rq:alchemist':'The Alchemist next to the Monarch, the first time he visits: he asks for rare ingredients. Granted: you get 2 potions.'+REQ_ODDS,
 'rq:rogue':'The Rogue next to the Monarch, the first time he visits: he asks for money. Granted: a pile of coin sacks appears in his room (they are his, not yours).'+REQ_ODDS,
 'rq:merchant':'The Fruit Merchant next to the Monarch, the first time he visits: he asks for exotic fruit. Granted: a crate of pineapples appears in his shop for good.'+REQ_ODDS,
 'rq:apothecary':'The Apothecary next to the Monarch, the first time she visits: she asks for time off. Granted: a noble picks her up and she is away on a date for 5 minutes.'+REQ_ODDS,
 'rq:necromancer':'The Necromancer next to the Monarch, the first time he visits: he asks for prisoners. Granted: three prisoners come to his room, and a ritual turns them into skeletons that follow him everywhere.'+REQ_ODDS,
 'rq:druid':'The Druid next to the Monarch, the first time his visit roll comes up (the only visit he ever makes): he asks for land for nature. Granted: up to 3 Farmers set up fields on the nearest free spaces.'+REQ_ODDS,
 rqdeny:'A generous Monarch turns down 20% of requests (with an apology), a greedy one 90% (rudely). The one refused leaves angry, and does not forget.',
 royalfuneral:'When the Monarch dies, EVERYONE on the board drops what they are doing and kneels at the coffin in the throne room for 1 minute (except anyone away). Meanwhile no coins are earned and no items can be bought or gained. Then the Monarch\'s box goes back to the shelf.',
 regicide:'Secret: anyone whose request was refused gets a new idle activity, 0.3% (checked first): from anywhere on the board they go to the throne room and kill the Monarch. They skip the funeral.',
 royalpatron:'Secret: a generous Monarch next to the Blacksmith. When the last adventurer of one of his adventures is home, the crown rewards the company with an artifact.',
 drain:'Necromancer on the bottom row with the Druid right beside him: 30% of his visits to the Druid. Black lightning drains the Druid\'s life and he dies (buried in his grove).',
 // the Traveling Merchant
 wares:'The Traveling Merchant\'s only idle activity: he tidies the wares on his stand and calls out to passers-by. He has no neighbor scenes, and nobody visits him.',
 troad:'The Traveling Merchant stays 5 minutes, then packs up the wagon and leaves (not to the shelf). Now and then (about every 10 minutes) he turns up again on a free space for another 5 minutes. If he dies, his box goes back to the shelf.',
 tshop:'Tap the coin in the Traveling Merchant\'s room to buy an artifact for 300 coins.',
 tscroll:'Spell scroll on the Traveling Merchant: he buys it for 15 coins.',
 tpotion:'Potion on the Traveling Merchant: he buys it for 15 coins.',
 tingot:'Ingot on the Traveling Merchant: he buys it for 30 coins (he does not get the Fighter tag).'});
// ---------- bigger Compendium rewards ----------
// A character's tab fully discovered (secrets included): +1 artifact. Every BIG_EVERY discoveries: one random item (ODDS.bigReward).
const BIG_EVERY=50;ODDS.bigReward={scroll:.45,potion:.45,ingot:.1};
ODDS.revealScene=.7; // a clue reveals an undiscovered interaction 70%, a secret 30%

// ---------- RARITY: how every chance in the game is decided ----------
// Each idle character decides every 5-10 s: DECIDE.idle = an idle activity, DECIDE.visit = a visit to a neighbor, the rest = wandering.
// A visit is just hanging out HANGOUT of the time; otherwise one scene is rolled from that visit's list.
// Lists use rarity tiers: uncommon / rare / legendary are fixed chances (RARITY); the common ones share whatever is left equally.
// (The player never sees the tier names; the Compendium shows the resulting percentages.)
const DECIDE={idle:.5,visit:.2},HANGOUT=.2;
const RARITY={u:.15,r:.05,l:.0075};
// Idle activities per character: [key, tier, condition]. A condition (checked in game.js, idleOk) must hold or the activity is left out.
// Conditions: nbr = a free neighbor; noRight = no box to his right; eknight = Eldritch Knight with a Wizard on the board; brew = next to a Merchant
// with 5 coins; target = someone free to haunt; alc = next to the Alchemist; madsci = mad scientist with a free neighbor; others = someone to copy;
// mageTag = the Rogue's Mage tag; spirit = all four spaces around him open and empty; rain = his space in the Druid's Rain; grudge = refused by a Monarch
const IDLES={knight:[['prac','c'],['orc','u','nbr'],['horse','r','noRight'],['cat','l','eknight']],
 wizard:[['read','c'],['magic','c'],['demon','l'],['brew','l','brew']],
 priest:[['pray1','c'],['farmer','c'],['tithe','u'],['exorcise','r']],
 necromancer:[['spirits','c'],['candles','c'],['lightning','c'],['raise','l','target']],
 merchant:[['advert','c'],['sell','c','nbr'],['mcust','u'],['mob','l'],['promo','u','alc']],
 apothecary:[['abrew','c'],['herbs','c'],['acust','u'],['trip','r'],['tripbreak','r'],['promo','u','alc'],['aretire','l']],
 alchemist:[['alcbrew','c'],['smoke','c'],['research','u'],['beast','u','madsci']],
 rogue:[['daggers','c'],['count','c'],['smokebomb','u'],['disguise','r','others'],['conjure','l','mageTag']],
 druid:[['grove','c'],['animals','c'],['weather','u'],['spirit','r','spirit']],
 blacksmith:[['forgework','c'],['smelt','c'],['coal','u'],['pour','l'],['leadgold','u','alc']],
 farmer:[['hoe','c'],['fork','c']],monarch:[['court','c']],traveler:[['wares','c']]};
const IDLE_ANY=[['regicide','l','grudge']]; // added to anyone's list while the condition holds
// Visit scenes. Each arrangement in PAIRS gives one scene, or a list (VISIT_EXPAND). Anything not listed here is one common scene.
const VISIT_EXPAND={aboveW:[['duel','c'],['craft','c']],appleshop:[['apple','c'],['feast','c']],mabove:[['fruitfall','c'],['starfruit','c']],wabove:[['imp','c'],['purplepot','c']],
 smithk:[['smithk','c'],['reforge','c']],mtrade:[['mtrade','c'],['farm','r']],sermon:[['sermon','c'],['tentacle','u']],zeal:[['crusade','r']],jokes:[['jokes','c'],['murder','l']]};
// Scenes two characters can have on any side: [first, second ('tag:fighter' = anyone with that tag, 'anyone'), key, tier, fallback]
// (fallback = only when the pair has no common scene of its own)
const VISIT_ANY=[['knight','wizard','spar','r'],['priest','tag:fighter','braver','r'],['wizard','necromancer','forge','l'],['rogue','anyone','assassin','l'],
 ['necromancer','druid','drain','u'],['alchemist','tag:mage','magictalk','c',1]];
// Group scenes in the visitor's own list (whoever the neighbor is): [visitor, key, tier]
const VISIT_GROUP=[['priest','massprayer','r'],['alchemist','fourmage','u'],['blacksmith','adventure','u']];
// The Druid's weather (instead of his visits)
const WEATHER_TIERS={overgrowth:'c',messenger:'c',heal:'c',fertile:'u',blessing:'r',tree:'r',unicorn:'l',shift:'l'}; // the Druid's casts (instead of a visit); one that can't happen right now is left out (castOk)
// Outcome chances inside a scene, set to the same tiers (deaths and special results)
Object.assign(ODDS,{slip:RARITY.r,horde:RARITY.r,boomDeath:RARITY.l,alchemist:RARITY.u,reveal:RARITY.r,healFarm:RARITY.r,ntradePotion:RARITY.u,
 tempt:RARITY.r,betray:RARITY.u,sickDeath:RARITY.r,twopot:RARITY.u,stone:1-RARITY.u,adventureDeath:RARITY.u,advScroll:RARITY.u,advArtifact:RARITY.r,
 storySecret:RARITY.u,dragon:RARITY.u,bronze:RARITY.l});
// Extra rule text shown in a discovered tile's description (results that are not the scene's own chance)
const NOTE={horde:'The Knight dies 5% of the time.',apple:'The Priest slips and dies 5% of the time.',boom:'It kills them both 0.75% of the time.',
 cobrew:'15%: the Alchemist is unlocked (once he is, a free potion instead).',pstudy:'5%: a clue (an undiscovered interaction or a secret is revealed).',
 heal:'5%: the farmer stays and sets up a farm nearby.',ntrade:'With the Alchemist next to her, 15%: +1 potion.',bloodorange:'30%: there is one left (+3 coins).',
 tempt:'5%: he does it, and the Priest dies.',betray:'15%: the Rogue is sacrificed and the Necromancer gets a skeleton follower.',kdate:'It goes well 80% of the time.',
 wdate:'It goes well 40% of the time.',crusade:'They come back with 10 coins (70%) or an artifact (30%).',rumors:'15%: rumors of a dragon instead of goblins.',
 adventure:'Each one back: 15% did not make it; 1-10 coins per Fighter, 15% a scroll per Mage, 5% an artifact per Merchant.',
 dungeon:'Loot: 50 coins 20%, an artifact 10%, 2 scrolls 25%, 3 potions 25%, a clue 20%.',wine:'Sick for 1 minute; 5% fatal.',
 stone:'85% a philosopher\'s stone, 15% the elixir of life (secret).',elixir:'15% of artifacts on the Alchemist.',
 twopot:'15% of the potions you buy from her.',raise:'Fighters and Mages beat it; anyone else dies.',beast:'A neighbor who is only a Merchant dies; a Fighter or Mage fights back and one of the two dies.',
 farm:'The field grows for 3 minutes, then pays 30 coins.',craft:'Costs 20 coins.',assassin:'Not while he is disguised.',
 spirit:'A clue: an undiscovered interaction or a secret is revealed.',regicide:'They skip the funeral.',
 roguemage:'While he has it, 0.75% of his idle activities he conjures an artifact, which uses the tag up.'};
// Hint text for tiles whose description is all rules (used for the clue before discovery and the story part after)
const FLAVOR={zeal:'The Knight is so fired up he visits everyone more often.',crusade:'They march off together on a holy crusade.',
 cleanse:'Holy light frees the Death Knight. He is a Knight again.',haste:'Haste potions! He keeps dashing off to visit Mages.',
 adventure:'Adventure awaits! Off they go, all of them.',rsteal:'He steals from the Wizard. Your coins get a little lighter.',
 magictalk:'Is magic actually useful? A heated debate.',wine:'Poison plus wine, gifted to a neighbor. Cheers!',
 funeral:'A fallen Fighter is honored at a gravestone.',alcpotion:'Luck for his neighbors: their rarest scenes get more likely. Their spaces glitter.',
 orc:'He spots an orc in a neighbor\'s room and charges over.',
 massprayer:'Everyone squeezes into his room to pray together for 20 seconds.',fourmage:'He hands one of his Mage neighbors a potion. It works as if you used it.',
 'wx:shift':'He raises his staff, the wind turns, and the sky over the whole land changes.','wx:overgrowth':'Pink and yellow flowers bloom all around the border.',
 royalfuneral:'EVERYONE drops what they are doing and kneels at the coffin for 1 minute. No coins or items meanwhile.',
 spar:'Sword versus magic shield. Nobody wins, everybody sweats.',braver:'The Priest admits the Fighter is braver. The Fighter pretends not to blush.',
 forge:'They conjure a free scroll or potion out of thin air.',drain:'Black lightning drains the Druid\'s life, and he dies.',
 regicide:'Someone the Monarch refused comes for revenge, from anywhere on the board.',royalpatron:'The generous ruler rewards the adventurers with an artifact.'};
// The Druid refuses an ingot (you keep it)
NAMES.dingot='Ingot on Druid: refused';DESC.dingot='Ingot on the Druid: he refuses to wear metal and hands it straight back. You keep the ingot.';FLAVOR.dingot='He refuses to wear metal and hands it straight back.';
COMP_TABS.find(t=>t.id==='druid').items.splice(3,0,'dingot');
// ---------- clues ----------
// Shelf: a locked character shows a blank box with this cryptic clue (no name)
const SHELF_CLUE={}; // (the clues are filled in further down)
// Compendium: unlock hints written by hand (the rest are made from the rules, unlockHint in game.js)
const HINTS={};
Object.assign(HINTS,{cleanse:'A Death Knight on the board, and a Priest beside the Necromancer, might set things right.',
 haste:'Fighters living beside the Alchemist seem to be in an awful hurry.',adventure:'The Blacksmith with two or more Fighters for neighbors gets restless.',
 greenarmor:'A Blacksmith surrounded by magic on every side can work wonders for a Wizard.',metaltalk:'Once the Wizard wears the green armor, he will not stop talking about it.',
 desk:'A Wizard with a shopkeeper and a fellow spellcaster next door sets up a desk.',slip:'Apples on the floor of the Fruit Merchant\'s shop, a Priest to the west... watch your step.',
 massprayer:'A Priest with all four neighbors at home might call them in.',funeral:'When a Fighter beside the Priest falls, he will honor them.',
 apoth:'Look for a gold coin in a certain shop.',ingotshop:'The forge has a gold coin in the corner too.',tshop:'The wagon\'s stand takes coins as well.',
 stone:'Hand the Alchemist something truly ancient.',elixir:'Not every ancient thing the Alchemist touches becomes gold...',
 twopot:'Buying potions with the Alchemist next door to the Apothecary can be a bargain.',fourmage:'Surround the Alchemist with magic on all four sides.',
 madsci:'The Alchemist in the far south-east corner gets... ideas.',tiny:'A Rogue with a little magic of his own might fit a shrinking potion.',
 graveyard:'A Rogue beside the Necromancer, both down on the bottom row.',dburied:'Even Druids are not forever.',drevive:'A buried Druid\'s sapling answers to a spell scroll.',
 ddiscount:'The Druid\'s herbs make the Apothecary\'s prices friendlier, side by side.',
 bronze:'Some Knights simply shine differently. Keep placing them.',
 paladin:'Holy fire at the forge, with the Knight right next door.',blackwiz:'A brand new Wizard in the far north-west corner dresses darker.',
 skulls:'The Necromancer feels at home deep down, on the bottom row.',royalpatron:'A generous ruler beside the forge rewards brave adventurers.',
 royalfuneral:'Kings and Queens fall too.',regicide:'A refused request is never forgotten.',rqdeny:'Not every ruler says yes.',
 troad:'Wait for the Traveling Merchant to move on, and he will be back someday.'});
['paladin','blacksmith','wizard','priest','alchemist','rogue','merchant','apothecary','necromancer','druid'].forEach(q=>{HINTS['rq:'+q]=(q==='paladin'?'A Paladin':'The '+(NAMES[q]||q[0].toUpperCase()+q.slice(1)))+' living next to the Monarch may ask for a favor.'});
Object.assign(FLAVOR,{beast:'The formula works! He turns into a beast-man and goes after a neighbor.',spirit:'He communes with a nature spirit, who whispers him a secret.',
 'prac:shield':'A squire comes to spar with a wooden sword while the Knight blocks.','prac:spear':'Poke, poke, poke. Very serious poking.','prac:glaive':'Big sweeping swings. Stand back.',
 'prac:longsword':'Classic swordplay against an invisible foe.','prac:axe':'Big, heavy chops. Firewood for a week.'});
HINTS.promo='A shopkeeper with the Alchemist next door sometimes sells his potions.';
// ---------- two more tags: Monstrous and Structure (Structure has no members yet) ----------
TAG_ICON.monstrous=[0,1,2].flatMap(k=>[[k*2,0,1,2,'#e04848'],[k*2+1,2,1,3,'#e04848'],[k*2+2,5,1,2,'#e04848']]); // three claw slashes
TAG_ICON.structure=[[3,0,1,1,'#c8c0b8'],[2,1,3,1,'#c8c0b8'],[1,2,5,1,'#c8c0b8'],[0,3,7,1,'#c8c0b8'],[1,4,5,3,'#8a8494'],[3,5,1,2,'#3a2a1a']]; // a little house
Object.assign(TAG_NAMES,{'tag:monstrous':'a Monstrous one','tag:structure':'a Structure'});
// ---------- Super Secrets: their own Compendium tab; no hints, no clues, tied to no character ----------
COMP_TABS.push({id:'super',name:'Super Secrets',pairs:[],idle:[],items:['ss:gold','ss:alltags']});EGGS.push('ss:gold','ss:alltags');
Object.assign(NAMES,{'ss:gold':'Super secret: a golden kingdom','ss:alltags':'Super secret: one of everything'});
Object.assign(DESC,{'ss:gold':'Super secret: every space on the board turned golden by philosopher\'s stones. A kingdom of gold!',
 'ss:alltags':'Super secret: one character with every tag at once: Fighter, Mage, Merchant and Monstrous.'});
// Shelf clues, as the owner wrote them
Object.assign(SHELF_CLUE,{necromancer:'When death befalls a holy follower, a new worshipper may arrive.',blacksmith:'When the economy is booming, a new business arrives.',
 apothecary:'When commerce has access to magic...',rogue:'After 75 tales, he sneaks in...',druid:'Explore every mile of land.',merchant:'The sound of a heavy purse draws him in.',
 monarch:'A large kingdom needs a leader.',traveler:'A market square brings new wares.',alchemist:'A maker of potions: wizardry and ingredients, side by side.'});
// ---------- group events: checked every GROUP_EVERY seconds, ODDS.group chance one happens (if the board allows), lasting GROUP_TIME ----------
// market = four Merchant-tagged characters in a 2x2 square (2d10 coins at the end); feast = any three characters side by side in a row
const GROUP_EVERY=300,GROUP_TIME=60;ODDS.group=.2;
const MARKET_SHOUT=['Fresh goods! Best prices in the square!','Step right up, step right up!','Two for one! Today only!','Finest wares in the kingdom!','Haggling welcome! Mostly.'];
const FEAST_SAY=['Pass the roast, please!','A toast! To good neighbors!','Is there more pie?','Mmm. Delicious.','I could get used to this.','Who made the gravy? Marvelous!'];
COMP_TABS.push({id:'group',name:'Group Events',pairs:[],idle:['grp:market','grp:feast'],items:[]});
Object.assign(NAMES,{'grp:market':'Market day','grp:feast':'A grand feast'});
Object.assign(DESC,{'grp:market':'Four Merchants in a 2x2 square put up big tents for a market day. A crowd comes to buy for 1 minute (nobody else visits them), then you get 2d10 coins.',
 'grp:feast':'Three characters side by side in a row: their rooms become one feast hall and they dine together at a long table for 1 minute. Nobody else joins.'});
Object.assign(FLAVOR,{'grp:market':'Tents go up, a crowd pours in, and the merchants shout about their wares. The coins roll in at closing time.',
 'grp:feast':'Three rooms become one great hall, and three neighbors share a long table piled with food.'});
Object.assign(HINTS,{'grp:market':'Four shopkeepers in a tidy square might throw a market day.','grp:feast':'Three neighbors in a row might share one long table.'});
NOTE['grp:market']='2d10 coins at the end.';
// ---------- Compendium titles: short, professional names shown in bold (TITLES wins over NAMES) ----------
const TITLES={friend:'Old Friends',learn:'Eldritch Awakening',bolt:'Thunderstruck',chat:'Tales of Old',spar:'Friendly Sparring',zeal:'Zeal',crusade:'Holy Crusade',
 pray:'Shared Prayer',bless:'Holy Water',sermon:'A Short Blessing',tentacle:'Eldritch Tentacles',sleep:'Sleep Spell',dknight:'The Death Knight',horde:'Undead Horde',nchat:'War Stories',
 cleanse:'Cleansing',braver:'Braver Than I',thief:'Stop, Thief!',lemons:'Out of Lemons',greenapple:'Green Apples',rumors:'Rumors',bear:'Grizzly Brew',kgossip:'Mage Gossip',
 kdate:"A Knight's Date",bees:'Bee Swarm',dungeon:'Dungeon Crawl',rspar:'Star Sparring',drinks:'Drinks and Laughs',wgossip:'Wizard Gossip',haste:'Haste Potions',
 smithk:'Smithing Talk',reforge:'A New Weapon',adventure:'Adventure',
 'prac:shield':'Shield Training','prac:spear':'Spear Drills','prac:glaive':'Glaive Drills','prac:longsword':'Swordplay','prac:axe':'Axe Drills',
 orc:'Orc Hunt',horse:'Feeding the Horse',cat:'The Black Cat',glow:'Golden Glow',flex:'Flexing',bronze:'Bronze Armor',paladin:'The Paladin',
 study:'Quiet Study',gossip:'Gossip',undead:'Accidental Undead',light:'Light and Shadow',duel:'Lightning Duel',craft:'Scroll Crafting',golem:'Clay Golem',
 tomes:'Dusty Tomes',swap:'Room Swap',forge:'Joint Conjuring',banana:'The Giant Banana',durian:'The Durian',jokes:'Fruit Puns',murder:'A Dark Turn',advertW:'Enchanted Advertising',
 cobrew:'Brewing Together',boom:'Brew Gone Wrong',wdate:"A Wizard's Date",imp:'Imp Blood',purplepot:'The Purple Potion',rgossip:'Knight Gossip',spell:'Frost and Lightning',
 dressup:'Dress-Up',rsteal:'Light Fingers',magictalk:'Is Magic Useful?',metal:'Magical Metal',greenarmor:'Green Mage Armor',metaltalk:'Armor Talk',
 read:'Reading',magic:'Spell Practice',demon:'Demon Summoning',brew:'Potion Brewing',fireball:'Fireball',teleport:'Teleport Visit',desk:'The Writing Desk',blackwiz:'The Black Wizard',
 purge:'The Purge',debate:'Holy Debate',apple:'An Apple a Day',slip:'Slippery Apple',feast:'Feast with the Nobles',fruitfall:'Fruit from Above',starfruit:'Starfruit',curse:'Cursed Fruit',
 plant:'Carnivorous Plant',pstudy:'Alchemical Studies',psleep:'Sleeping Draught',heal:'Healing a Farmer',lecture:'A Lecture on Morals',vandal:'Vandalism',confess:'Confession',
 tempt:"A Demon's Whisper",holyfire:'Holy Fire',pray1:'Prayer',farmer:"Farmer's Blessing",tithe:'Tithe Prayer',exorcise:'Exorcism',massprayer:'The Great Prayer',funeral:"A Fighter's Funeral",
 banish:'Banishment',wings:'Angel Wings',relic:'Holy Relic',bats:'Bat Swarm',sacrifice:'Blood from Above',chant:'Loud Chanting',bloodorange:'Blood Orange',nrot:'Rot and Worms',
 ntrade:'Undead Ingredients',ritual:'Dark Ritual',rritual:'Ritual Partners',betray:'Betrayal',rcandles:'Stolen Candles',fairies:'Fairy Attack',nscoff:'Armor? How Quaint',
 drain:'Life Drain',spirits:'Speaking with Spirits',candles:'Chalk and Candles',lightning:'Red Lightning',raise:'Raise the Dead',nscroll:'Skeleton Summons',sniff:'Not Thirsty',
 skulls:'Bone Floor',apgift:'A Gift',mtrade:'Trading Wares',farm:'A New Farm',goldapple:'Golden Apples',business:'Talking Business',pinch:'Pinched Fruit',promo:'Alchemy Sale',
 awkjoke:'An Awkward Joke',advert:'Calling Out',sell:'Door-to-Door Apples',mob:'Angry Mob',mcust:'Fruit Customer',monkey:'Monkey Business',backwards:'Backwards Talk',
 nefarious:'Nefarious Potions',poisons:'Poison Shopping',wine:'Poisoned Wine',rtrip:'Clumsy Burglary',flirt:'Flirting',trip:'Clumsy Trip',tripbreak:'Broken Bottle',
 abrew:'Potion Making',herbs:'Herb Garden',acust:'Remedy Customer',apoth:'Potion Shop',apcoins:'Buy-Back',appotion:'Scroll to Potion',snatch:'Potion Snatching',
 volatile:'Volatile Potions',shrink:'Shrinking Potion',childhood:'Childhood Friends',alcbrew:'Bubbling Brews',research:'Research',smoke:'Smoky Mistake',alcpotion:'Lucky Neighbors',
 alcscroll:'Torn Scroll',stone:"Philosopher's Stone",elixir:'Elixir of Life',twopot:'Two for One',madsci:'The Mad Scientist',beast:'The Beast-Man',fourmage:'Four Mages',
 assassin:'The Assassin',rbuy:'Blades for Sale',daggers:'Dagger Throwing',smokebomb:'Smoke Bomb',disguise:'Disguise',count:'Counting the Stash',spook:'Invisible Prank',
 roguemage:'Rogue Magic',tiny:'Tiny Rogue',graveyard:'The Graveyard',metalitch:'Metal Itch',grove:'Tending the Grove',animals:'Animal Friends',weather:'Weather Reading',
 dburied:'Buried in the Grove','wx:overgrowth':'Overgrowth',
 'wx:shift':'Winds of Change',dpotion:'Saved for Later',dscroll:'Turning the Sky',drevive:'Return from the Grove',
 dingot:'No Metal, Please',archdruid:'The Archdruid',spirit:'The Nature Spirit',ddiscount:'Herbal Discount',forgework:'Anvil Work',smelt:'Smelting',coal:'Stoking the Furnace',
 pour:'Ingot Casting',ingotshop:'Ingot Shop',reinforce:'Reinforced',bpotion:'No Thanks',bscroll:'Uncontrollable Dance',leadgold:'Lead into Gold',
 'rq:paladin':'Knighthood','rq:blacksmith':'An Apprentice','rq:wizard':'A New Staff','rq:priest':'Holy Water Barrel','rq:alchemist':'Rare Ingredients','rq:rogue':'Royal Funds',
 'rq:merchant':'Exotic Fruit','rq:apothecary':'Time Off','rq:necromancer':'Prisoners','rq:druid':'Land for Nature',rqdeny:'Request Denied',court:'Holding Court',
 royalfuneral:'The Grand Funeral',regicide:'Revenge',royalpatron:'Royal Patron',wares:'Arranging the Wares',troad:'On the Road',tshop:'Artifact Shop',tscroll:'Scroll Sale',
 tpotion:'Potion Sale',tingot:'Ingot Sale','ss:gold':'A Golden Kingdom','ss:alltags':'One of Everything','grp:market':'Market Day','grp:feast':'The Grand Feast'};

// ---------- Structures: boxes with nobody living in them (the Structure tag) ----------
// A structure never decides anything, is never visited except for its own activities, does not count for group events
// and cannot be killed; items do nothing on it. It gives its neighbors new idle activities: STRUCT_IDLE of their idle rolls,
// picked by one of the neighbor's tags (at random if they have several).
const isStruct=u=>!!u&&CLASS[u.id]==='structure';
const STRUCT_IDLE=.2; // (structure activities are listed only in the structure's own Compendium tab, not under each character)
// The Well (on the shelf from the start). Its activities by the neighbor's tag; a Mage is splashed 10% of the time (WELL_SPLASH), else looks in.
CH.well={name:'Well',eye:O,p:[]};CLASS.well='structure';TR.well={up:'fade',down:'fade'};SHELF_CHARS.push('well');ALL_CHARS.push('well');NAMES.well='Well';
const WELL_ACTS={mage:['welllook','wellsplash'],fighter:['welljump'],merchant:['wellwish'],monstrous:['welldive']},WELL_SPLASH=.1;
COMP_TABS.push({id:'well',name:'Well',pairs:['welllook','wellsplash','welljump','wellwish','welldive'],idle:[],items:[]});
Object.assign(PAIR_WITH,{welllook:['well','tag:mage'],wellsplash:['well','tag:mage'],welljump:['well','tag:fighter'],wellwish:['well','tag:merchant'],welldive:['well','tag:monstrous']});
Object.assign(NAMES,{welllook:'Looking into the well',wellsplash:'Splashed at the well',welljump:'Jumping the well',wellwish:'A wish in the well',welldive:'Into the well'});
Object.assign(TITLES,{welllook:'Wishing Well Gaze',wellsplash:'I\'m Melting!',welljump:'Well Vault',wellwish:'Silent Wish',welldive:'Down the Well'});
Object.assign(DESC,{welllook:'A Mage next to the Well peers into it peacefully.',wellsplash:'A Mage next to the Well gets a bucket of well water thrown at them by a peasant. They melt into a puddle, the peasant runs, and they slowly reform.',
 welljump:'A Fighter next to the Well runs at it and leaps right over, showing off.',wellwish:'A Merchant next to the Well tosses a coin down it and makes a silent wish.',
 welldive:'A Monstrous character next to the Well jumps in, peeks out with just the top of their head, then climbs back out.'});
Object.assign(FLAVOR,{welllook:'They peer into the dark water and wonder how deep it goes.',wellsplash:'A peasant flings a bucket of well water. They melt into a puddle, the peasant runs, and they slowly pull themselves back together.',
 welljump:'A running start and a mighty leap right over the well. Show-off.',wellwish:'A coin plinks into the water. The wish stays a secret.',
 welldive:'In they go! Then two eyes peek over the rim before they climb back out.'});
Object.assign(HINTS,{welllook:'Mages love a quiet well next door.',wellsplash:'Mages and water do not always mix... rarely, anyway.',welljump:'Fighters living by the well like to show off.',
 wellwish:'Shopkeepers by the well are a superstitious lot.',welldive:'Something monstrous living by the well might take a dip.'});
// Compendium labels: the share of a neighbor's idle activities (STRUCT_IDLE x the outcome's share for that tag; with several tags it is shared)
const structPct=f=>Math.floor(STRUCT_IDLE*f*100+1e-9)+'%';
const WELL_PCT={welllook:structPct(1-WELL_SPLASH),wellsplash:structPct(WELL_SPLASH),welljump:structPct(1),wellwish:structPct(1),welldive:structPct(1)};
TAG_ICON.structure=[[2,1,3,2,'#c0603a'],[2,1,3,1,'#e08a5a'],[0,4,3,2,'#c0603a'],[0,4,3,1,'#e08a5a'],[4,4,3,2,'#a84e2e'],[4,4,3,1,'#d07a4a']]; // a little stack of bricks: two below, one on top

// ---------- travelling group events: everyone walks to a structure (a secret each) ----------
// wellchat = all four spaces around the Well hold characters: they meet at the well for small talk about the weather
// classic = Priest, Knight, Wizard and Rogue in the same row as the Tavern: they go drink and reminisce (Classic Adventurers)
const WEATHER_TALK=['Looks like rain later.','Lovely weather we are having.','Bit chilly this morning, eh?','My knee says a storm is coming.','Is it just me, or is it windy?','Nice day for it.','Did you see that cloud? Shaped like a sheep.'];
const CLASSIC_TALK=['Remember the dragon in the Ashfell caves?','To the old party!','You still owe me for that potion.','I miss the dungeon smell. Sort of.','Another round! On the Rogue!','Who lost the map that time?','We should do one more quest. A small one.'];
// The Tavern (structure): a bar with a barkeep, a few tables, a back door on the left; now and then a patron drops in for a drink
CH.tavern={name:'Tavern',eye:O,p:[]};CLASS.tavern='structure';TR.tavern={up:'backdoorL',down:'backdoorL'};ALL_CHARS.push('tavern');NAMES.tavern='Tavern';
const BKC={body:'#e8dcc0',bodyD:'#c8bca0',pants:'#4a3a2a',boot:'#2a1a10',belt:'#8a5a2a'};
CH.barkeep={name:'Barkeep',eye:O,a:arms(BKC),p:[...B(BKC),[5,11,6,7,'#6a4a2a'],[5,7,6,2,'#6a4a2a'],[5,1,6,2,'#3a2a1a'],[6,9,4,1,'#8a2a2a']]}; // apron, mustache
SHELF_CLUE.tavern='When the old party is back together, they will need a drink.';
COMP_TABS.push({id:'tavern',name:'Tavern',pairs:[],idle:[],items:['grp:classic']});
COMP_TABS.find(t=>t.id==='well').items.push('grp:wellchat');COMP_TABS.find(t=>t.id==='group').items.push('grp:wellchat','grp:classic');EGGS.push('grp:wellchat','grp:classic');
Object.assign(NAMES,{'grp:wellchat':'Small talk at the well','grp:classic':'Classic Adventurers'});
Object.assign(TITLES,{'grp:wellchat':'Small Talk','grp:classic':'Classic Adventurers'});
Object.assign(DESC,{'grp:wellchat':'Secret group event: with characters on all four sides of the Well, they meet at the well for 1 minute and make small talk about the weather.',
 'grp:classic':'Secret group event: the Priest, Knight, Wizard and Rogue all in the same row as the Tavern head over for 1 minute of drinks and old adventure stories.'});
Object.assign(FLAVOR,{'grp:wellchat':'The neighbors meet at the well and talk about the only thing everyone agrees on: the weather.',
 'grp:classic':'The old party, together again: drinks all round and stories that get taller with every telling.'});
const STRUCT_ACTS={well:WELL_ACTS}; // each structure's activities for its neighbors, by tag (the Tavern has none yet)
ODDS.group=1; // group events: every check (GROUP_EVERY) one happens whenever the board allows

// ---------- the Tavern's activities for its neighbors (by tag) ----------
// Mage: a fizzy magic drink (10%: the bubbles fill the room and they pop them by magic); Fighter: two drinks, then home to sleep it off (DRUNK_SLEEP);
// Merchant: a delivery of crates (20%: a bottle of dwarven wine, the barkeep pays TAVERN_WINE coins); Monstrous: the barkeep chases them out with an axe
STRUCT_ACTS.tavern={mage:['tvfizz','tvbubbles'],fighter:['tvdrink'],merchant:['tvdeliver','tvwine'],monstrous:['tvshoo']};
const STRUCT_SECOND={wellsplash:WELL_SPLASH,tvbubbles:.1,tvwine:.2}; // the chance of the second, rarer activity of a tag
const DRUNK_SLEEP=15,TAVERN_WINE=20;
COMP_TABS.find(t=>t.id==='tavern').pairs.push('tvfizz','tvbubbles','tvdrink','tvdeliver','tvwine','tvshoo');
Object.assign(PAIR_WITH,{tvfizz:['tavern','tag:mage'],tvbubbles:['tavern','tag:mage'],tvdrink:['tavern','tag:fighter'],tvdeliver:['tavern','tag:merchant'],tvwine:['tavern','tag:merchant'],tvshoo:['tavern','tag:monstrous']});
Object.assign(NAMES,{tvfizz:'A fizzy magic drink',tvbubbles:'Too many bubbles',tvdrink:'One more round',tvdeliver:'A delivery for the tavern',tvwine:'Dwarven wine',tvshoo:'Thrown out of the tavern'});
Object.assign(TITLES,{tvfizz:'Fizzy Magic Drink',tvbubbles:'Bubble Trouble',tvdrink:'One More Round',tvdeliver:'Special Delivery',tvwine:'Dwarven Wine',tvshoo:'No Monsters Allowed'});
Object.assign(DESC,{tvfizz:'A Mage next to the Tavern orders a fizzy magic drink. It bubbles.',tvbubbles:'A Mage next to the Tavern orders a fizzy magic drink, and the bubbles fill the whole room. The Mage pops them all with magic.',
 tvdrink:'A Fighter next to the Tavern gulps down a drink, orders another, stumbles home and sleeps it off for 15 seconds.',tvdeliver:'A Merchant next to the Tavern delivers crates of drink.',
 tvwine:'A Merchant next to the Tavern brings an expensive bottle of dwarven wine. The barkeep pays 20 coins for it.',tvshoo:'A Monstrous character comes into the Tavern. The barkeep grabs an axe from behind the counter and chases them out.'});
Object.assign(FLAVOR,{tvfizz:'One fizzy enchanted ale! It bubbles, it sparkles, it tickles the nose.',tvbubbles:'The drink fizzes over and the whole tavern fills with bubbles. Pop, pop, pop goes the magic.',
 tvdrink:'One ale, gulped. Another, gulped. Then a wobbly walk home and a long nap.',tvdeliver:'Crates of the good stuff, delivered right to the bar.',
 tvwine:'A dusty bottle of dwarven wine, aged under a mountain. The barkeep pays handsomely.',tvshoo:'The barkeep pulls an axe from under the counter. "OUT! No monsters in my tavern!"'});
Object.assign(HINTS,{tvfizz:'Mages next to the tavern like their drinks with sparkle.',tvbubbles:'Sometimes a magic drink gets a little... out of hand.',tvdrink:'Fighters next to the tavern rarely stop at one.',
 tvdeliver:'Shopkeepers next door keep the tavern stocked.',tvwine:'A rare bottle could fetch a good price at the bar.',tvshoo:'Something monstrous next door might not be welcome at the bar.'});
Object.assign(WELL_PCT,{tvfizz:structPct(1-STRUCT_SECOND.tvbubbles),tvbubbles:structPct(STRUCT_SECOND.tvbubbles),tvdrink:structPct(1),tvdeliver:structPct(1-STRUCT_SECOND.tvwine),tvwine:structPct(STRUCT_SECOND.tvwine),tvshoo:structPct(1)}); // share of a neighbor's idle activities (all structures)
NOTE.tvwine='+20 coins.';NOTE.tvdrink='Asleep for 15 seconds once home.';
// Story quests (QUESTS): shown once available (show), paid once. Daily quests (DAILY_QUESTS): DAILY_COUNT of them picked each real-world day
// among the ones that can happen with what you have unlocked (avail); their counters start over each day (S.daily).
const QUESTS=[];
const DAILY_COUNT=3,DAILY_QUESTS=[
 {id:'prosperity',name:'Prosperity',text:'Have a feast 3 times.',stat:'feasts',goal:3,reward:{coins:50},avail:()=>unlockedChars().length>=3},
 {id:'kingfeast',name:'Feast Fit for a King',text:'Have a feast that includes the Monarch.',stat:'royalFeasts',goal:1,reward:{artifact:1},avail:()=>unlockedChars().includes('monarch')},
 {id:'costdisc',name:'Cost of Discovery',text:'Have the Wizard die 5 times.',stat:'wizDeaths',goal:5,reward:{scroll:5},avail:()=>unlockedChars().includes('wizard')},
 {id:'bigspender',name:'Big Spender',text:'Spend 50 coins buying from characters (their shops).',stat:'spent',goal:50,reward:{renown:1},avail:()=>true},
 {id:'blink',name:'Blink and You\'ll Miss It',text:'Have a rare event happen (a chance of 5% or less).',stat:'rare',goal:1,reward:{coins:15},avail:()=>true},
 {id:'missed',name:'They Will Be Missed',text:'Have a character die.',stat:'deaths',goal:1,reward:{coins:5},avail:()=>true},
 {id:'lore',name:'Lore Gatherer',text:'Discover 10 new interactions in the Compendium.',stat:'discover',goal:10,reward:{reveal:1},avail:()=>undiscoveredScenes().length>=10},
 {id:'marketday',name:'Market Day',text:'Have a market day.',stat:'markets',goal:1,reward:{coins:30},avail:()=>unlockedChars().filter(id=>hasClass({id},'merchant')).length>=4}];
const ITEM_WORD={scroll:['spell scroll','spell scrolls'],potion:['potion','potions'],artifact:['artifact','artifacts'],ingot:['ingot','ingots']}; // for quest rewards (one, several)

// ---------- the Druid's casts (instead of a visit; WEATHER_TIERS above, castOk / castFx in game.js) ----------
// messenger: his animal runs a note or a coin (+MESSENGER_COIN, MESSENGER_GIFT of the time) to someone at home; heal: wakes a sleeper or cures the sick;
// fertile: FERTILE_TIME seconds, coins earned in the spaces around him +FERTILE_BONUS; blessing: a Farmer on the nearest open space;
// tree: a Massive Tree (a structure) on a random open space for TREE_TIME seconds; unicorn: one walks through another room's background (UNICORN_TIME)
const MESSENGER_COIN=1,MESSENGER_GIFT=.5,FERTILE_TIME=30,FERTILE_BONUS=.5,TREE_TIME=60,UNICORN_TIME=5;
for(const k in WX_NAMES)NAMES['wx:'+k]=WX_NAMES[k];NAMES['wx:shift']='Changing the weather';
Object.assign(TITLES,{'wx:messenger':'Animal Messenger','wx:heal':'Healing Word','wx:fertile':'Fertile Land','wx:blessing':"Nature's Blessing",'wx:tree':'Conjure Tree','wx:unicorn':'Mythic Spotting'});
{const dt=COMP_TABS.find(t=>t.id==='druid');Object.keys(WX_NAMES).forEach(k=>{if(!dt.idle.includes('wx:'+k))dt.idle.push('wx:'+k)})}
Object.assign(DESC,{'wx:messenger':'The Druid sends his animal companion to someone at home on the board. It brings them a note, or a coin for you (+1 coin).',
 'wx:heal':'Only while someone is asleep or poisoned. The Druid speaks a healing word: a sleeper wakes up, or a sick character is cured.',
 'wx:fertile':'For 30 seconds the land around the Druid turns rich and green: coins earned in the spaces next to him are worth 50% more.',
 'wx:blessing':'A Farmer appears on the open space nearest the Druid and starts a field (up to 3 Farmers at once).',
 'wx:tree':'A Massive Tree bursts out of a random open space and stands there for 1 minute. It cannot be moved. Its neighbors climb it, nap under it, pick its fruit or admire it.',
 'wx:unicorn':'A unicorn trots through the background of another room for a moment. Blink and you miss it.'});
Object.assign(FLAVOR,{'wx:messenger':'His animal friend trots off with something for a neighbor. Sometimes a note, sometimes a shiny coin.',
 'wx:heal':'A soft green word, and the sleepy wake and the sick feel fine.','wx:fertile':'The soil sighs, the grass leans in, and business is suddenly booming next door.',
 'wx:blessing':'The earth sends a farmer, hoe already in hand.','wx:tree':'Roots crack the ground and a tree older than kingdoms rises in a heartbeat.',
 'wx:unicorn':'For a moment, something white with a golden horn wanders past a window. Then it is gone.'});
Object.assign(HINTS,{'wx:messenger':'The Druid\'s animal friend runs errands.','wx:heal':'Someone sleepy or sick might get a helping word from the grove.',
 'wx:fertile':'Business blooms in the Druid\'s neighborhood, now and then.','wx:blessing':'The grove sometimes sends help for the fields.',
 'wx:tree':'Something very big and very old might grow from an empty space.','wx:unicorn':'Keep your eyes on the background. Once in a blue moon...'});
NOTE['wx:messenger']='Half the time a note, half the time +1 coin.';NOTE['wx:fertile']='+50% coins next to him for 30 s.';
// ---------- the Massive Tree: a structure the Druid conjures (not on the shelf, never saved, can't be moved; gone after TREE_TIME) ----------
CH.tree={name:'Massive Tree',eye:O,p:[]};CLASS.tree='structure';TR.tree={up:'fade',down:'fade'};NAMES.tree='Massive Tree';
const TREE_ACTS=['treeclimb','treenap','treefruit','treeadmire']; // any neighbor, 25% each (the Fruit Merchant picks a whole basketful instead of one fruit)
STRUCT_ACTS.tree={any:TREE_ACTS};
COMP_TABS.push({id:'tree',name:'Massive Tree',pairs:[...TREE_ACTS,'treebasket'],idle:[],items:[]});
Object.assign(PAIR_WITH,{treeclimb:['tree','anyone'],treenap:['tree','anyone'],treefruit:['tree','anyone'],treeadmire:['tree','anyone'],treebasket:['tree','merchant']});
Object.assign(NAMES,{treeclimb:'Climbing the tree',treenap:'A nap under the tree',treefruit:'Fruit from the tree',treeadmire:'Admiring the tree',treebasket:'A basket overflowing'});
Object.assign(TITLES,{treeclimb:'Up the Trunk',treenap:'Shady Nap',treefruit:'Fresh From the Branch',treeadmire:'A Thousand Rings',treebasket:'Overflowing Basket'});
Object.assign(DESC,{treeclimb:'A neighbor of the Massive Tree climbs up into its branches, enjoys the view and climbs back down.',treenap:'A neighbor of the Massive Tree lies down in its shade for a short nap.',
 treefruit:'A neighbor of the Massive Tree picks a fruit and eats it.',treeadmire:'A neighbor of the Massive Tree stands and admires it.',
 treebasket:'The Fruit Merchant next to the Massive Tree gets very excited and picks far too much fruit. His basket overflows.'});
Object.assign(FLAVOR,{treeclimb:'Up, up, up the giant trunk, for the best view in the land.',treenap:'Cool shade, rustling leaves. Five minutes. Just five.',
 treefruit:'A fruit as big as a fist, sweet as honey.',treeadmire:'They stare up and up and up. It must be a thousand years old.',
 treebasket:'So. Much. Fruit. He keeps picking long after the basket is full.'});
Object.assign(HINTS,{treeclimb:'Anyone next to a giant tree might want a better view.',treenap:'Shade is the best place for a nap.',treefruit:'A tree that big must have fruit.',
 treeadmire:'Some just like to look.',treebasket:'A fruit seller next to a fruit tree? He might get carried away.'});
// ---------- Rogue at the Well, Traveling Merchant at the Tavern ----------
// wellsteal: the Rogue fishes out a coin someone wished on (only after a Merchant tossed one in, h.wcoins); uncommon (RARITY.u) of his Well activities
// tvelven: the Traveling Merchant's Tavern activity (instead of the usual Merchant delivery): a scroll of the ancient elves, kept by the barkeep
COMP_TABS.find(t=>t.id==='well').pairs.push('wellsteal');COMP_TABS.find(t=>t.id==='tavern').pairs.push('tvelven');
Object.assign(PAIR_WITH,{wellsteal:['well','rogue'],tvelven:['tavern','traveler']});
Object.assign(NAMES,{wellsteal:'A wish stolen',tvelven:'A scroll of the ancient elves'});
Object.assign(TITLES,{wellsteal:'Finders Keepers',tvelven:'The Elven Scroll'});
Object.assign(DESC,{wellsteal:'The Rogue next to the Well fishes out a coin someone wished on. +1 coin. Only after a Merchant has tossed one in.',
 tvelven:'The Traveling Merchant next to the Tavern delivers a spell scroll of the ancient elves. The barkeep keeps it safe for the right adventurer to come along.'});
Object.assign(FLAVOR,{wellsteal:'A hook, a string, and someone\'s wish comes up dripping. Finders keepers.',tvelven:'An old scroll in flowing elven script. "Keep it behind the bar," says the merchant. "The right hero will ask for it."'});
Object.assign(HINTS,{wellsteal:'Wishes in a well are not always safe from light fingers.',tvelven:'A merchant from far away might bring the tavern something special.'});
NOTE.wellsteal='+1 coin.';
Object.assign(WELL_PCT,{treeclimb:structPct(.25),treenap:structPct(.25),treefruit:structPct(.25),treeadmire:structPct(.25),treebasket:structPct(.25),wellsteal:structPct(RARITY.u),tvelven:structPct(1)});
// who does each of these (shown in the tile's description instead of a tag)
const STRUCT_WHO={treeclimb:'anyone',treenap:'anyone',treefruit:'anyone',treeadmire:'anyone',treebasket:'the Fruit Merchant',wellsteal:'the Rogue',tvelven:'the Traveling Merchant'};
// ---------- the Apothecary retires (legendary idle): her box goes back to the shelf ----------
NAMES.aretire='The Apothecary retires';TITLES.aretire='Well-Earned Rest';
COMP_TABS.find(t=>t.id==='apothecary').idle.push('aretire');
DESC.aretire='The Apothecary decides she has brewed enough for one lifetime. She retires, and her box goes back to the shelf.';
FLAVOR.aretire='She hangs up her apron. "Enough potions for one lifetime. I am off to grow tomatoes."';
HINTS.aretire='Even the busiest shopkeeper dreams of a quiet garden.';
// what someone says when the Druid's animal brings a note, when a healing word reaches them, when a unicorn passes their room
const MSG_NOTES=['A note from the Druid: "The oaks say hello."','A note! "Water your plants. -D"','"The mushrooms are watching. In a nice way." Hm.','A pressed flower and a note. How sweet!'];
const HEAL_SAY=['I feel wonderful!','Huh? I feel much better.','What a lovely green light.','Thank you, Druid!'];
const UNICORN_SAY=['Was that... a unicorn?!','Did anyone else see that?','A unicorn! Nobody will believe me.'];
NOTE['wx:tree']='It stands for 1 minute and cannot be moved.';NOTE['wx:heal']='Only while someone is asleep or poisoned.';NOTE['wx:blessing']='Only while there is room for another Farmer.';

// ---------- the Bard (no tags of its own): an elf, ancient and magical, of the fae. Unlocked by the quest An Old Friend (the Wizard's whole Compendium page) ----------
// A man or a woman (50/50, saved in color). Instrument picked when placed (BARD_INST tiers, saved in u.inst). Room: a peaceful wood with birds now and then.
// Tags it can gain: Merchant (the Fruit Merchant's dragon fruit, u.merchTag), Fighter (a book of martial combat in the Library, u.fightTag),
// Mage (while BARD_MAGE_AT Compendium discoveries are found), Monstrous (after dying, 50% when it next comes back, BARD_MONSTER; u.monTag). Lost when it goes back to the shelf.
const BDC={body:'#3a8a6a',bodyD:'#2a6a50',pants:'#5a4a30',boot:'#4a3020',belt:'#8a6a2a',skin:'#f6dcc4',skinD:'#e2c2a2'};
const bardCH=f=>({name:'Bard',eye:'#1a6a4a',a:arms(BDC),p:[...B(BDC),
 ...(f?[[4,1,8,2,'#f0d880'],[4,3,1,8,'#f0d880'],[11,3,1,8,'#e0c060'],[5,3,6,1,'#f0d880']]:[[5,1,6,2,'#f0d880'],[5,3,6,1,'#f0d880'],[10,3,1,2,'#e0c060']]), // long or short golden hair
 [3,5,2,1,BDC.skin],[3,4,1,1,BDC.skin],[11,5,2,1,BDC.skinD],[12,4,1,1,BDC.skinD], // pointed elven ears
 [7,10,2,4,'#e8e0b0'],[3,10,1,7,'#7a3a6a'],[12,10,1,7,'#5a2a4a'],[5,2,1,1,'#9ae0c0'],[10,2,1,1,'#9ae0c0']]}); // laced tunic, a short purple cape, a silver-green circlet
CH.bard_m=bardCH(0);CH.bard_f=bardCH(1);CH.bard=CH.bard_m;TR.bard={up:'fade',down:'fade'};ALL_CHARS.push('bard');NAMES.bard='Bard';
const BARD_INST={lute:'c',harp:'c',banjo:'u',bagpipes:'u',triangle:'r'},INST_NAMES={lute:'lute',harp:'harp',banjo:'banjo',bagpipes:'bagpipes',triangle:'triangle'};
const BARD_MAGE_AT=200,BARD_MONSTER=.5,LIB_ECON_TIME=300,LIB_ECON_EVERY=30;
IDLES.bard=[['bplay','c'],['bhum','c'],['bspell','r']];
// neighbor scenes: whoever has the tag comes to the Bard (BARD_HOSTED: the Bard is always the host)
VISIT_ANY.push(['bard','tag:mage','bwisdom','c'],['bard','tag:fighter','blisten','c'],['bard','tag:merchant','bstory','c'],['bard','tag:monstrous','bsoothe','c'],['bard','wizard','bdragon','r'],['bard','merchant','bfruit','u']);
const BARD_HOSTED={bwisdom:1,blisten:1,bstory:1,bsoothe:1,bdragon:1,bfruit:1};
COMP_TABS.push({id:'bard',name:'Bard',pairs:['bwisdom','blisten','bstory','bsoothe','bdragon','bfruit'],idle:['bplay','bhum','bspell'],items:[]});
Object.assign(PAIR_WITH,{bwisdom:['bard','tag:mage'],blisten:['bard','tag:fighter'],bstory:['bard','tag:merchant'],bsoothe:['bard','tag:monstrous'],bdragon:['bard','wizard'],bfruit:['bard','merchant']});
Object.assign(NAMES,{bplay:'Playing a tune',bhum:'Humming a magic tune',bspell:'A spell of song',bwisdom:'Seeking elven wisdom',blisten:'Listening to the music',bstory:'Tales of the road',bsoothe:'Soothed by music',bdragon:'The dragon of Mount Ember',bfruit:'A dragon fruit for the Bard'});
Object.assign(TITLES,{bplay:'A Merry Tune',bhum:'Humming Magic',bspell:'Song of the Fae',bwisdom:'Elven Wisdom',blisten:'Music Most Fair',bstory:'Tales of the Road',bsoothe:'Music Soothes the Beast',bdragon:'Old Friends, Old Dragon',bfruit:'Dragon Fruit'});
Object.assign(DESC,{bplay:'The Bard plays their instrument. Notes float through the woods.',bhum:'The Bard hums an old elven tune, and soft magic swirls around them.',
 bspell:'The Bard casts a spell with their instrument: butterflies appear and pink magic swirls through the room.',
 bwisdom:'A Mage next to the Bard comes to learn elven magic. The Bard shows it gladly, but no mortal can learn it.',
 blisten:'A Fighter next to the Bard sits down and listens, awed by the magical music.',bstory:'A Merchant next to the Bard asks about their travels, and the elf tells one of three short stories.',
 bsoothe:'Something Monstrous next to the Bard storms in, hostile. The music calms it: it goes home and sleeps for 1 minute.',
 bdragon:'The Wizard next to the Bard (any side), a rare visit. They remember a legendary fight against a dragon and how they barely escaped.',
 bfruit:'The Fruit Merchant next to the Bard gives them a dragon fruit. The Bard gains the Merchant tag (until it goes back to the shelf).'});
Object.assign(FLAVOR,{bplay:'A bright tune drifts between the trees. Even the birds stop to listen.',bhum:'An old, old tune, and the air begins to shimmer.',
 bspell:'One chord, and the air fills with butterflies and pink magic.',bwisdom:'"Teach me!" The elf shows them. The spell will not come. Elven magic is older than words.',
 blisten:'They sit, they listen, and for once they forget about swords.',bstory:'"Tell me of the road!" The elf smiles and begins a tale.',
 bsoothe:'It came in snarling. It leaves yawning.',bdragon:'"Remember Mount Ember?" "How could I forget? Your beard caught fire."',
 bfruit:'A dragon fruit, bright pink and very rare. "For your travels, friend!"'});
Object.assign(HINTS,{bplay:'An elf with an instrument rarely sits in silence.',bhum:'Elves hum, and the air listens.',bspell:'Sometimes the music itself becomes a spell.',
 bwisdom:'Magic folk next door will want to learn the elf\'s secrets.',blisten:'Warriors next door have soft hearts for good music.',bstory:'Traders next door love a good travel story.',
 bsoothe:'Even a monster next door can be calmed by a song.',bdragon:'Two old friends who once faced a dragon together.',bfruit:'A fruit seller next door might share something exotic.'});
NOTE.bsoothe='It goes home and sleeps for 1 minute.';NOTE.bfruit='The Bard gains the Merchant tag.';
const BARD_STORIES=[['I once crossed a desert of glass. Every step sang a different note.','I wrote a song with the desert. It was very crunchy.'],
 ['In the north, I played for a giant who could not sleep.','He snores now. The mountains shake every night. You are welcome.'],
 ['I traded a song to a river spirit for safe passage.','She still hums it. Listen to any river, you will hear it.']];
const BARD_DRAGON=[['wizard','Remember the red dragon of Mount Ember?'],['bard','How could I forget? Your beard caught fire.'],['wizard','We barely made it out alive!'],['bard','I still have scorch marks on my instrument.']];
const BARD_SOOTHE=['Grrr! RAAAH!','...grr?','So... sleepy...'];
// the Bard at the Tavern: if the Traveling Merchant left the elven scroll there (S.elvenScroll), the elf collects it: super secret, a golden border around the board for good (S.goldBorder)
COMP_TABS.find(t=>t.id==='super').items.push('ss:elven');EGGS.push('ss:elven');
NAMES['ss:elven']='Super secret: the elven scroll returns';TITLES['ss:elven']='The Right Adventurer';
DESC['ss:elven']='Super secret: a Bard next to the Tavern, after the Traveling Merchant left the elven scroll there, collects it and thanks the barkeep. The whole board gets a golden border for good.';
FLAVOR['ss:elven']='"I believe you have been keeping something for me." The scroll goes home at last, and the land shines gold.';
SHELF_CLUE.bard='An old friend remembers every page of their story.';
// ---------- the Library (a structure). Unlocked by finding a super secret. ----------
CH.library={name:'Library',eye:O,p:[]};CLASS.library='structure';TR.library={up:'backdoorL',down:'backdoorL'};ALL_CHARS.push('library');NAMES.library='Library';
SHELF_CLUE.library='A place of knowledge, found only by those that know the greatest secrets.';
STRUCT_ACTS.library={mage:['libread'],merchant:['libyawn','libecon'],fighter:['libbrowse','libbooks'],monstrous:['libfire']};
Object.assign(STRUCT_SECOND,{libecon:RARITY.r,libbooks:RARITY.r});
COMP_TABS.push({id:'library',name:'Library',pairs:['libread','libyawn','libecon','libbrowse','libbooks','libfire','libmartial'],idle:[],items:[]});
Object.assign(PAIR_WITH,{libread:['library','tag:mage'],libyawn:['library','tag:merchant'],libecon:['library','tag:merchant'],libbrowse:['library','tag:fighter'],libbooks:['library','tag:fighter'],libfire:['library','tag:monstrous'],libmartial:['library','bard']});
Object.assign(NAMES,{libread:'Reading in the library',libyawn:'A boring library',libecon:'Studying economics',libbrowse:'Nothing to read',libbooks:'Attack of the books',libfire:'The library burns',libmartial:'A book of martial combat'});
Object.assign(TITLES,{libread:'Quiet Study',libyawn:'Snooze Fest',libecon:'Economics 101',libbrowse:'Nothing About Swords',libbooks:'Hostile Literature',libfire:'Burning Knowledge',libmartial:'The Art of the Blade'});
Object.assign(DESC,{libread:'A Mage next to the Library goes in and reads for a while.',libyawn:'A Merchant next to the Library browses, yawns from boredom and leaves.',
 libecon:'A Merchant next to the Library studies economics. For the next 5 minutes you get 1 coin every 30 seconds.',libbrowse:'A Fighter next to the Library browses the shelves, finds nothing of interest and leaves.',
 libbooks:'A Fighter next to the Library is attacked by animated books and fights them off.',libfire:'Something Monstrous next to the Library smashes the shelves and sets the place on fire. The Library is destroyed and goes back to the shelf.',
 libmartial:'The Bard next to the Library finds a book of martial combat and gains the Fighter tag (until it goes back to the shelf).'});
Object.assign(FLAVOR,{libread:'Old pages, a candle, and a long quiet afternoon.',libyawn:'"Seven hundred pages on moss? I... *yawn*... see."',libecon:'Supply, demand, and suddenly the coins add up.',
 libbrowse:'"Poetry. Herbs. More poetry. Nothing about swords." Out they go.',libbooks:'The books fly off the shelves, flapping and snapping. Chop chop!',
 libfire:'Smash, crash, and then... fire. So much fire.',libmartial:'"The Art of the Blade, by Someone Very Stabby." The elf reads it twice.'});
Object.assign(HINTS,{libread:'Mages love a library next door.',libyawn:'Not every shopkeeper is a reader.',libecon:'A rare shopkeeper might actually learn something useful.',
 libbrowse:'Warriors next door may not find much to read.',libbooks:'Some books do not like to be disturbed.',libfire:'Keep monsters away from old paper.',libmartial:'An elf might find more than poetry on those shelves.'});
NOTE.libecon='+1 coin every 30 s for 5 minutes.';NOTE.libfire='The Library goes back to the shelf.';
Object.assign(WELL_PCT,{libread:structPct(1),libyawn:structPct(1-RARITY.r),libecon:structPct(RARITY.r),libbrowse:structPct(1-RARITY.r),libbooks:structPct(RARITY.r),libfire:structPct(1),libmartial:structPct(RARITY.u)});
STRUCT_WHO.libmartial='the Bard';
// ---------- quest: An Old Friend (every entry on the Wizard's Compendium page, secrets too) unlocks the Bard ----------
QUESTS.push({id:'oldfriend',name:'An Old Friend',text:'Discover everything on the Wizard\'s page of the Compendium (secrets too).',tab:'wizard',reward:{unlock:'bard'},show:()=>wizardAllShown()}); // (shown once every entry of the Wizard's page can show: every partner unlocked)

// ---------- the Goblin (Monstrous): a little green thief in a cave camp. Unlocked by the quest The Rumors are True. ----------
// Smaller than everyone (GOBLIN_SCALE). Neighbors visit him far less (GOBLIN_SHY: his share when they pick whom to visit). He always visits for his scenes (GOBLIN_VISITS).
// His cave stash grows by 1 coin every GOBLIN_HOARD_EVERY seconds (5 minutes) (u.hoard, saved); when he dies, you get it all.
const GBC={body:'#6a5a3a',bodyD:'#52462c',pants:'#4a4030',boot:'#3a2a1a',belt:'#3a2a1a',skin:'#6aaa3a',skinD:'#4e8a2a'};
const goblinP=[...B(GBC),[2,5,3,2,GBC.skin],[1,4,1,2,GBC.skin],[11,5,3,2,GBC.skinD],[14,4,1,2,GBC.skinD], // big pointy ears
 [4,2,8,1,'#5a4a30'],[5,1,6,1,'#5a4a30'],[4,10,1,6,'#5a4a30'],[11,10,1,5,'#3a3020'],[6,12,1,1,'#3a3020'],[9,13,1,1,'#3a3020']]; // a ragged hood and a patched tunic
CH.goblin={name:'Goblin',eye:'#f2d040',a:arms(GBC),p:goblinP};
CH.goblin_helm=Object.assign({},CH.goblin,{p:[...goblinP,[4,1,4,2,'#a8acb8'],[8,0,4,2,'#a8acb8'],[4,1,4,1,'#d0d4e0'],[8,0,4,1,'#d0d4e0'],[11,2,2,1,'#8a8e98']]}); // a Knight's helmet, sitting crooked
CLASS.goblin='monstrous';TR.goblin={up:'fade',down:'fade'};ALL_CHARS.push('goblin');NAMES.goblin='Goblin';
SHELF_CLUE.goblin="You've been warned about the goblins coming.";
const GOBLIN_SCALE=.78,GOBLIN_SHY=.25,GOBLIN_HOARD_EVERY=300,GOBLIN_NAP=10;
IDLES.goblin=[['grummage','c'],['gdagger','c'],['gnap','c'],['gsteal','r','nbr']];
// his scenes with each neighbor (any side; the Goblin always visits)
VISIT_ANY.push(['goblin','alchemist','galch','c'],['goblin','apothecary','gherbs','c'],['goblin','apothecary','gherbcoin','r'],['goblin','bard','ginst','c'],['goblin','blacksmith','gsword','c'],
 ['goblin','druid','gwild','c'],['goblin','merchant','gapples','c'],['goblin','knight','gknight','c'],['goblin','knight','gknightdie','r'],['goblin','knight','gmob','l'],
 ['goblin','monarch','groyal','c'],['goblin','necromancer','gskulls','c'],['goblin','priest','gpriest','c'],['goblin','priest','gbite','r'],['goblin','wizard','gtrinket','c']);
const GOBLIN_WITH={galch:'alchemist',gherbs:'apothecary',gherbcoin:'apothecary',ginst:'bard',gsword:'blacksmith',gwild:'druid',gapples:'merchant',gknight:'knight',gknightdie:'knight',gmob:'knight',
 groyal:'monarch',gskulls:'necromancer',gpriest:'priest',gbite:'priest',gtrinket:'wizard'},GOBLIN_VISITS=GOBLIN_WITH;
COMP_TABS.push({id:'goblin',name:'Goblin',pairs:Object.keys(GOBLIN_WITH),idle:['grummage','gdagger','gnap','gsteal'],items:['ghoard']});
for(const k in GOBLIN_WITH){PAIR_WITH[k]=['goblin',GOBLIN_WITH[k]];const t=COMP_TABS.find(x=>x.id===GOBLIN_WITH[k]);if(t)t.pairs.push(k)} // (also on each partner's page)
Object.assign(NAMES,{grummage:'Rummaging through junk',gdagger:'Spinning a dagger',gnap:'A nap in the bedroll',gsteal:'Sneaking off with something',ghoard:'The goblin\'s stash',
 galch:'Chaos in the lab',gherbs:'Stolen herbs',gherbcoin:'Stolen coins',ginst:'A borrowed instrument',gsword:'Swiping a sword',gwild:'Watching the wildlife',gapples:'Apple heist',
 gknight:'Goblin versus Knight',gknightdie:'A goblin falls',gmob:'The goblin mob',groyal:'Laughing through the throne room',gskulls:'The skull collection',gpriest:'Driven off by holy light',gbite:'A sneaky bite',gtrinket:'A magical trinket'});
Object.assign(TITLES,{grummage:'One Goblin\'s Trash',gdagger:'Stabby Spin',gnap:'Dirty Bedroll',gsteal:'Sticky Fingers',ghoard:'Goblin Gold',galch:'Bull in a Potion Shop',gherbs:'Herb Thief',gherbcoin:'Jackpot',
 ginst:'Borrowed Tune',gsword:'Swiped Sword',gwild:'Pretty Birdie',gapples:'Apple Heist',gknight:'Goblin Brawl',gknightdie:'Last Stand',gmob:'Goblin Horde',groyal:'Royal Pest',gskulls:'Bone Appreciation',
 gpriest:'Hiss!',gbite:'Ankle Biter',gtrinket:'Return to Sender'});
Object.assign(DESC,{grummage:'The Goblin rummages through his pile of stolen goods and trash.',gdagger:'The Goblin plays with his dagger, spinning it around in his hand.',
 gnap:'The Goblin curls up in his dirty bedroll for a 10 second nap.',gsteal:'The Goblin sneaks into a neighbor\'s room and steals something (+2 coins to his stash).',
 ghoard:'The Goblin\'s cave stash grows by 1 coin every 5 minutes (the count is in the corner of his room). When he dies, you get every coin in it.',
 galch:'The Goblin and the Alchemist, any side. The Goblin runs around the lab smashing potions while the Alchemist tries to shoo him out.',
 gherbs:'The Goblin and the Apothecary, any side. While she is out picking herbs, the Goblin sneaks in and steals some.',
 gherbcoin:'The Goblin and the Apothecary, any side, rare. While she is out, the Goblin finds 5 coins and adds them to his stash.',
 ginst:'The Goblin and the Bard, any side. The Goblin tries to steal an instrument; the Bard calmly talks him into giving it back.',
 gsword:'The Goblin and the Blacksmith, any side. The Goblin steals a sword and picks a fight. The Blacksmith disarms him in a second and he flees.',
 gwild:'The Goblin and the Druid, any side. The Goblin gets distracted by the wildlife and just sits and watches.',
 gapples:'The Goblin and the Fruit Merchant, any side. The Goblin steals a few apples and drops a couple as he runs.',
 gknight:'The Goblin and the Knight, any side. The Goblin picks a fight with the Knight, gets swatted and runs.',
 gknightdie:'The Goblin and the Knight, any side, rare. The Goblin picks a fight with the Knight and does not survive it.',
 gmob:'The Goblin and the Knight, any side, legendary. The Goblin whistles up a mob of goblins that overwhelms the Knight. The Knight is slain, and the Goblin wears his helmet, crooked, from then on.',
 groyal:'The Goblin and the Monarch, any side. The Goblin runs through the throne room laughing, then flees.',
 gskulls:'The Goblin and the Necromancer, any side. The Necromancer shows off his skull collection; the Goblin holds one and examines it closely.',
 gpriest:'The Goblin and the Priest, any side. The Goblin creeps closer; the Priest calls down divine light, and the Goblin hisses and flees.',
 gbite:'The Goblin and the Priest, any side, rare. The Goblin sneaks up and bites the Priest.',
 gtrinket:'The Goblin and the Wizard, any side. The Goblin steals a magical trinket; when the Wizard spots him, it goes off and teleports the Goblin home.'});
Object.assign(FLAVOR,{grummage:'A spoon, a boot, half a sandwich. Treasures, all of them.',gdagger:'Spin, spin, spin, catch. Spin, spin, oops, catch.',gnap:'The bedroll smells of old cheese. He loves it.',
 gsteal:'Tiptoe in, grab something shiny, tiptoe out. Hehehe.',ghoard:'Coin by coin, the pile in the cave grows.',galch:'"Shiny bottles!" CRASH. "Not the blue one!" CRASH.',
 gherbs:'She steps out for herbs. He steps in for hers.',gherbcoin:'Under the herb pot: five shiny coins. Into the sack they go.',ginst:'"That lute will not sing for you, friend. Give it back and I will play you a song."',
 gsword:'One wild swing, one quick twist from the smith, and the goblin is running.',gwild:'A deer, a bird... the goblin forgets to steal anything at all.',gapples:'An armful of apples, and a trail of the ones that fell.',
 gknight:'Bite, scratch, CLANG. The goblin learns about armor the hard way.',gknightdie:'The goblin fought bravely. Briefly.',gmob:'One whistle, and the goblins pour in from everywhere.',
 groyal:'Through the throne room, cackling all the way. "Guards!"',gskulls:'"This one has nice teeth." The Necromancer is touched.',gpriest:'A flash of holy light. "HSSSS!"',
 gbite:'Chomp. "It BIT me!"',gtrinket:'Grab, zap, poof. Back home, very confused.'});
Object.assign(HINTS,{grummage:'A goblin and his junk are never parted.',gdagger:'Goblins love a pointy toy.',gnap:'Even thieves need sleep.',gsteal:'Rarely, he goes shopping without paying.',
 ghoard:'His cave hides more than junk.',galch:'Goblins and fragile glass do not mix.',gherbs:'When the herbalist steps out, someone steps in.',gherbcoin:'Sometimes the herb pot hides more than herbs.',
 ginst:'A goblin might fancy an instrument. Music might change his mind.',gsword:'A forge full of swords is very tempting to a goblin.',gwild:'Nature can calm even a goblin.',
 gapples:'Fruit next door is not safe with a goblin around.',gknight:'Goblins and knights do not get along.',gknightdie:'A goblin should pick his fights more carefully.',
 gmob:'Where there is one goblin, there may be many more. Once in a blue moon.',groyal:'A goblin next to royalty cannot resist a prank.',gskulls:'A goblin and a skull collector might bond.',
 gpriest:'Holy light and goblins do not get along.',gbite:'Never turn your back on a goblin.',gtrinket:'Magic trinkets are tempting, and unpredictable.'});
NOTE.gherbcoin='+5 coins to his stash.';NOTE.gknightdie='The Goblin dies.';NOTE.gmob='The Knight dies; the Goblin keeps the helmet.';NOTE.gsteal='+2 coins to his stash.';
QUESTS.push({id:'rumorstrue',name:'The Rumors are True',text:'Hear the Fruit Merchant tell the Knight about goblins 5 times.',stat:'goblinRumors',goal:5,reward:{unlock:'goblin'},show:()=>compUnl('merchant')}); // (shown once the Fruit Merchant is unlocked)
// ---------- the Bard's Resonance: for each tag the Bard has ----------
// neighbors' chances of dying -RES_DEATH; their legendary idle activities +RES_LEGEND; +1 coin every 5 minutes from passers-by (RES_COIN_EVERY)
const RES_DEATH=.1,RES_LEGEND=.1,RES_COIN_EVERY=300;
COMP_TABS.find(t=>t.id==='bard').items.push('bresonance');NAMES.bresonance='Resonance';TITLES.bresonance='Resonance';
DESC.bresonance='Passive, for each tag the Bard has: neighbors\' chances of dying are 10% lower, their legendary idle activities 10% more likely, and passers-by toss the Bard 1 coin every 5 minutes.';
FLAVOR.bresonance='The more the elf has lived, the richer the music. The neighbors feel it too.';HINTS.bresonance='A Bard who has picked up a tag or two plays with real power.';
// Deadly events (a death in the roll itself): the Bard's Resonance makes them less likely for neighbors
const DEADLY={demon:1,murder:1,assassin:1,drain:1,gknightdie:1,gmob:1};
// Passive abilities: shown in their own group at the top of a character's Compendium tab (not under Items and shops)
const PASSIVES=['ghoard','bresonance'];

// ---------- the Dragon: unlock the battle, win the battle, then it joins you as a 2-space character (Monstrous) ----------
// 1) The dragon can attack once you have heard the Fruit Merchant's dragon rumor (S.dragonRumor), seen the Wizard and Bard's dragon story (bdragon)
//    and held DRAGON_COINS coins at once: S.dragonReady, for good (no quest: the clues are in the Compendium). The battle dragon is drawn DRAGON_SCALE times bigger.
// 2) The battle, a group event: 3 Fighters, 2 Mages and 1 Merchant anywhere on the board, 6 different characters (each fills one role, DRAGON_ROLES).
//    Everyone on the board is interrupted. The dragon has DRAGON_HP hit points (S.dragonHP, kept between battles); each attack does 1d6.
//    A battle lasts DRAGON_FIGHT seconds, then its fire breath kills whoever is on one random open space and it flies off (an attack every DRAGON_HIT_EVERY seconds, taking turns), or until the dragon falls.
// 3) At 0 hit points it is beaten: a Dragon box appears on the shelf. On the board it is one wide box over 2 spaces side by side.
const DRAGON_COINS=300,DRAGON_HP=100,DRAGON_FIGHT=30,DRAGON_SCALE=3,DRAGON_HIT_EVERY=2.2,DRAGON_ROLES=['fighter','fighter','fighter','mage','mage','merchant'];
CH.dragon={name:'Dragon',eye:O,p:[]};CLASS.dragon='monstrous';ALL_CHARS.push('dragon');NAMES.dragon='Dragon';TR.dragon={up:'fade',down:'fade'};
SHELF_CLUE.dragon='A great beast is rumored nearby. Only a kingdom united can bring it down.';
COMP_TABS.find(t=>t.id==='group').idle.push('grp:dragon');COMP_TABS.push({id:'dragon',name:'Dragon',pairs:[],idle:['grp:dragon'],items:[]});
NAMES['grp:dragon']='The dragon attacks!';TITLES['grp:dragon']='Dragon Attack!';
DESC['grp:dragon']='Once the dragon has been heard of (the Fruit Merchant\'s rumor and the Wizard and Bard\'s story) and you have held 300 coins: with 3 Fighters, 2 Mages and a Merchant on the board (6 different characters), the dragon can swoop down. Everyone stops what they are doing and those six attack it, 1d6 damage each. After 30 seconds it breathes fire on a random space, killing whoever is there, and flies off. It has 100 hit points, and its wounds carry over to its next attack. When it is beaten, a Dragon box appears on the shelf.';
FLAVOR['grp:dragon']='A shadow falls over the whole kingdom. Then a roar. Swords up, spells ready!';
HINTS['grp:dragon']='A merchant\'s rumor, an old friends\' tale and a heavy purse... something huge may come looking. It takes a kingdom united to bring it down.';
const DRAGON_SAY={fighter:['For the kingdom!','Have at you!','Take that, overgrown lizard!'],mage:['Feel my power!','Lightning, strike!','Arcane bolt!'],merchant:['Here, have some fruit! HARD fruit!','Catch this!','No refunds!'],other:['Run!','Hide!','A DRAGON?!','Eek!']};

// ---------- the Goblin and items: a potion is poured out, a spell scroll ends up on his junk pile (both used up) ----------
COMP_TABS.find(t=>t.id==='goblin').items.push('gpotion','gscroll');
Object.assign(NAMES,{gpotion:'Potion on Goblin: poured out',gscroll:'Scroll on Goblin: onto the junk pile'});Object.assign(TITLES,{gpotion:'Not Thirsty',gscroll:'Can\'t Read'});
Object.assign(DESC,{gpotion:'Potion on the Goblin: he sniffs it, shakes it, looks very confused and pours it all out on the floor.',gscroll:'Spell scroll on the Goblin: he tries to read it, can\'t, and tosses it onto his junk pile.'});
Object.assign(FLAVOR,{gpotion:'Sniff. Shake. Squint. Splash. "Bad juice."',gscroll:'He holds it upside down, then sideways, then gives up. "Pretty paper. Junk pile."'});
Object.assign(HINTS,{gpotion:'A goblin might not know what to do with a potion.',gscroll:'Can goblins read? Give him something to find out.'});
// ---------- Renown: your kingdom's score (renownOf in game.js): 1 per Compendium discovery, RENOWN_CHAR per character unlocked for the first time, plus quest rewards (S.renownBonus) ----------
const RENOWN_CHAR=10;
// ---------- Time away (awayReport in game.js): when you come back after AWAY_MIN seconds or more, up to AWAY_MAX seconds count ----------
// Coins are halved (AWAY_COIN); nothing is unlocked and no scenes or events play; each hour away has AWAY_REVEAL chance to reveal an undiscovered interaction.
const AWAY_MIN=300,AWAY_MAX=8*3600,AWAY_COIN=.5,AWAY_REVEAL=.02,AWAY_PLAY_MIN=300; // (AWAY_PLAY_MIN: seconds of real play needed between two away reports, so moving the clock forward again and again does not pay)
// What each character did meanwhile ({n} = about how many times; one line each for up to AWAY_LINES_MAX of them)
const AWAY_LINES_MAX=4,AWAY_LINES={knight:'The Knight practiced with his weapon about {n} times.',wizard:'The Wizard read about {n} books. Some twice.',
 priest:'The Priest said about {n} prayers for the kingdom.',necromancer:'The Necromancer chatted with about {n} spirits.',merchant:'The Fruit Merchant shouted about his apples about {n} times.',
 apothecary:'The Apothecary brewed about {n} remedies.',alchemist:'The Alchemist set off about {n} small explosions. Small ones.',rogue:'The Rogue counted his stash about {n} times. It never adds up.',
 druid:'The Druid tended his grove and talked to about {n} animals.',blacksmith:'The Blacksmith struck his anvil about {n} times.',monarch:'The Monarch held court about {n} times.',
 traveler:'The Traveling Merchant rearranged the wares about {n} times.',bard:'The Bard played about {n} songs for nobody in particular.',goblin:'The Goblin rummaged through his junk about {n} times.',
 dragon:'The Dragon snored about {n} times. The cave shook.',farmer:'The Farmer hoed about {n} rows.',well:'Someone tossed a coin in the Well and made a wish.',tavern:'The Tavern served about {n} ales.',library:'The Library gathered a little more dust.'};
const AWAY_IDLE=['Nobody noticed you were gone. Mostly.','The kingdom carried on without you, a little bored.','A cat wandered across the whole board and left again.'];
