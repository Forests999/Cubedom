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
 durian:'Fruit Merchant below the Wizard. A durian sale, +10 coins. The Wizard regrets having a nose.',
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
Object.assign(ODDS,{dragon:.1,kdate:.8,wdate:.4,alchemist:.2,boomDeath:.02,imp:.4});
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
 kdate:'Knight right of the Apothecary. They leave for a 1 minute date. 80% it goes well, 20%... less so.',
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
Object.assign(ODDS,{alcMage:.2,promo:.1,haste:.5,twopot:.2,beast:.15,fourMage:.1,tempt:.05,betray:.2,sickDeath:.05,
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
// Tags (Compendium): what each character's tags are and what changes them. {mage} etc. become the tag icons.
const TAG_NOTES={knight:'{fighter} Fighter.',wizard:'{mage} Mage.',priest:'{mage} Mage.',necromancer:'{mage} Mage.',merchant:'{merchant} Merchant.',apothecary:'{merchant} Merchant.',
 alchemist:'{merchant} Merchant. He also gets the {mage} Mage tag while a Mage is next to him (both tags show). His neighbor effects go by tag: Mages, Merchants and Fighters next to him each get something.',
 rogue:'{fighter} Fighter. He gets the {mage} Mage tag when you use a spell scroll on him (conjuring an artifact uses it up). While disguised he shows the tags of whoever he copies.'};
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
Object.assign(ODDS,{druid:{grove:.4,animals:.4,weather:.2},spirit:.2,adventure:.2,adventureDeath:.1,advScroll:.2,advArtifact:.05,smithtalk:.6,rogueOutfit:{ninja:.4,bandit:.4,con:.2}});
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
Object.assign(NAMES,{grove:'Tending the grove',animals:'Talking to animals',weather:'Predicting the weather',spirit:'Secret: a nature spirit',dpotion:'Potion on Druid: saved for a rainy day',dscroll:'Scroll on Druid: rain storm',drevive:'Scroll on a buried Druid: revived',dburied:'A buried Druid',
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
TAG_NOTES.druid='{mage} Mage. Even buried, he still counts as a Mage for his neighbors.';
TAG_NOTES.blacksmith='{merchant} Merchant and {fighter} Fighter.';
Object.assign(DESC,{
 'prac:axe':'Knight with a battle axe. Big, heavy chops. Firewood for a week.',
 grove:'The Druid tends his grove of trees. They seem to like him.',
 animals:'Deer and birds come out of the trees to chat with the Druid. He understands every word.',
 weather:'The Druid casts green nature magic to predict the weather. Leaves blow everywhere. Results vary.',
 dburied:'When the Druid dies he does not go back to the shelf: he is buried in his space and a sapling grows. Nobody visits him until he is revived.',
 dpotion:'Potion on the Druid: he tucks it away for a rainy day. (It is used up.)',
 dscroll:'Spell scroll on the Druid: a rain storm. Everyone away (dates, crusades, dungeons, adventures) comes home at once, as if the whole time had passed.',
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
// The Druid never visits neighbors. When he would, he casts a weather effect on a random open space (with or without a box)
// that lasts WEATHER_TIME seconds; at most WEATHER_MAX of his effects are on the board at once. An Archdruid never casts ARCH_SKIP.
const WEATHER_TIME=30,WEATHER_MAX=2,ARCH_SKIP=['moonlight','decay','infest'];
// weather = how likely each effect is; blizzVisit = fewer visits in a blizzard; blizzRare = rarest idle +30%; sandDeath = death chances x3;
// sunMerchant / sunFarmer = more coins in sunshine; rainStory = idle chance of reading a story in the rain, storySecret = it reveals a secret;
// werewolf = chance a werewolf kills the one in the moonlight, when it starts and when it ends; familiar = the Druid's animal
Object.assign(ODDS,{weather:{blizzard:.1,sandstorm:.1,sunshine:.15,rain:.15,overgrowth:.15,moonlight:.15,decay:.15,infest:.05},
 blizzVisit:.3,blizzRare:.3,sandDeath:3,sunMerchant:.2,sunFarmer:.5,rainStory:.8,storySecret:.1,werewolf:.3,familiar:{bear:1/3,eagle:1/3,wolf:1/3}});
const DRUID_DISCOUNT=5; // secret: coins off an Apothecary potion while the Druid is next to her
const WX_NAMES={blizzard:'Blizzard',sandstorm:'Sandstorm',sunshine:'Sunshine',rain:'Rain',overgrowth:'Overgrowth',moonlight:'Moonlight',decay:'Decay',infest:'Infest'};
const WX_SAY={blizzard:'Winds of the north, come!',sandstorm:'Sands of the far desert, rise!',sunshine:'Let the sun shine warm!',rain:'Clouds, gather and pour!',
 overgrowth:'Grow, little seeds, grow!',moonlight:'Moon, show your face.',decay:'All things return to the earth...',infest:'Little hungry ones, swarm!'};
// short stories read in the Druid's rain
const STORIES=['Once a frog wished to be a king. Now he is a very damp king.','A lonely cloud cried so much it made a lake. The fish were grateful.',
 'The old oak remembered every squirrel that ever lived in it. Even Gerald.','A knight lost a duel to a puddle. He never spoke of it again.',
 'The moon once fell into a well. The miller fished it out with a bucket.','Two snails raced for a hundred years. It was a tie.'];
// Archdruid: the Druid after an artifact. A living staff with a glowing orb, a golden leaf crown.
CH.druid_arch=Object.assign({},CH.druid,{name:'Archdruid',p:[...CH.druid.p,[4,0,2,1,'#f2c84a'],[7,0,2,1,'#f2c84a'],[10,0,2,1,'#f2c84a'],[0,0,3,3,'#9affb0'],[1,1,1,1,'#ffffff'],[3,1,1,2,'#5aba4a'],[0,4,1,1,'#5aba4a'],[2,8,1,1,'#5aba4a']]});
// Blacksmith and Druid (any side): metal is SO uncomfortable. The Blacksmith rolls his eyes.
PAIRS['blacksmith>druid']=SIDES('metalitch');
const METALITCH=[['druid','How do you wear metal all day?'],['druid','It is cold. It pinches. It clanks!'],['druid','Bark and leaves breathe, you know.'],['blacksmith','...Bark. Right.']];
// Werewolf (moonlight)
const WWC={body:'#5a5a66',bodyD:'#46464f',pants:'#3a3040',boot:'#2a2a30',belt:'#3a3040',skin:'#6a6a76',skinD:'#55555f'};
CH.werewolf={name:'Werewolf',eye:'#ff3030',a:arms(WWC),p:[...B(WWC),[4,1,2,3,'#46464f'],[10,1,2,3,'#46464f'],[9,6,4,3,'#7a7a86'],[12,6,1,1,O],[6,9,1,1,'#f0ead0'],[10,9,1,1,'#f0ead0'],[5,10,6,2,'#7a7a86']]};
Object.assign(NAMES,{metalitch:'Metal is uncomfortable',archdruid:'Artifact on Druid: the Archdruid',ddiscount:'Secret: herbal discount',story:'A story in the rain',wolfkill:'A werewolf in the moonlight'});
for(const k in WX_NAMES)NAMES['wx:'+k]='Weather: '+WX_NAMES[k];
EGGS.push('ddiscount');
{const dt=COMP_TABS.find(t=>t.id==='druid');dt.pairs.push('metalitch');dt.idle.push(...Object.keys(WX_NAMES).map(k=>'wx:'+k),'story','wolfkill');dt.items.splice(3,0,'archdruid');dt.items.push('ddiscount');
 COMP_TABS.find(t=>t.id==='blacksmith').pairs.push('metalitch')}
PAIR_WITH.metalitch=['blacksmith','druid'];
TAG_NOTES.druid='{mage} Mage. Even buried, he still counts as a Mage for his neighbors.';
Object.assign(DESC,{metalitch:'Blacksmith and Druid, any side. The Druid explains how uncomfortable metal is to wear. The Blacksmith rolls his eyes.',
 archdruid:'Artifact on the Druid: he becomes the Archdruid, with a glowing living staff. He never casts Moonlight, Decay or Infest again.',
 ddiscount:'Secret: with the Druid next to the Apothecary, her potions cost 5 coins less (herbs from his grove).',
 wolfkill:'Moonlight: when it starts and when it ends, 30% a werewolf leaps out and kills whoever is in that space.',
 'wx:blizzard':'The Druid\'s weather instead of a visit, 10%. 30 s of snow on a random space: its character visits 30% less, but their rarest idle activity is 30% more likely.',
 'wx:sandstorm':'The Druid\'s weather instead of a visit, 10%. 30 s of sand on a random space: every chance of dying there is tripled.',
 'wx:sunshine':'The Druid\'s weather instead of a visit, 15%. 30 s of sun on a random space: a Merchant there earns 20% more coins, a Farmer 50% more.',
 'wx:rain':'The Druid\'s weather instead of a visit, 15%. 30 s of rain on a random space: whoever lives there reads short stories (10% reveal a secret).',
 'wx:overgrowth':'The Druid\'s weather instead of a visit, 15%. For 30 s, leaves and flowers grow all around the border of a random space. Lovely.',
 'wx:moonlight':'The Druid\'s weather instead of a visit, 15%. 30 s of darkness and soft pink moonlight. When it starts and ends, 30% a werewolf attacks.',
 'wx:decay':'The Druid\'s weather instead of a visit, 15%. 30 s of worms and flies on a random space: tags its character was not born with are gone while it lasts (an ingot\'s Fighter tag, the Rogue\'s Mage tag).',
 'wx:infest':'The Druid\'s weather instead of a visit, 5%. 30 s of locusts on a random space: nobody visits it.'});

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
TAG_NOTES.monarch='No tags. Each Monarch is a King or a Queen, and generous or greedy (50/50 each).';
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
TAG_NOTES.monarch='None, and a Monarch can never gain one (an ingot does nothing). Each Monarch is a King or a Queen, generous or greedy (50/50 each), in red and gold, emerald and cream, blue and silver, or black and dark red.';
TAG_NOTES.traveler='{merchant} Merchant.';
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
 tithe:'The Priest: 10% of his idle activities. He prays for fortune. Fortune answers: +5 coins.',
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
 story:'Anyone living on a space with the Druid\'s Rain: 80% of their idle activities are a short story. 10% of the stories reveal a hidden secret.',
 'wx:blizzard':'The Druid never visits: each time he would, he casts weather on a random open space instead (30 s, at most 2 at once). 10% of his casts: a Blizzard. Whoever lives there visits 30% less, but their rarest idle activity is 30% more likely.',
 'wx:sandstorm':'10% of the Druid\'s weather casts (he casts instead of visiting): a Sandstorm for 30 s. Every chance of dying for whoever lives there is tripled.',
 'wx:sunshine':'15% of the Druid\'s weather casts (he casts instead of visiting): Sunshine for 30 s. A Merchant living there earns 20% more coins, a Farmer 50% more.',
 'wx:rain':'15% of the Druid\'s weather casts (he casts instead of visiting): Rain for 30 s. Whoever lives there spends 80% of their idle activities reading short stories (10% reveal a secret).',
 'wx:overgrowth':'15% of the Druid\'s weather casts (he casts instead of visiting): Overgrowth for 30 s. Pink and yellow flowers bloom all around the border of the space. Lovely.',
 'wx:moonlight':'15% of the Druid\'s weather casts (he casts instead of visiting): Moonlight for 30 s, dark with a soft pink glow. When it starts and when it ends, 30% a werewolf kills whoever is there.',
 'wx:decay':'15% of the Druid\'s weather casts (he casts instead of visiting): Decay for 30 s, worms and flies. Tags its character was not born with (an ingot\'s Fighter tag, the Rogue\'s or Alchemist\'s Mage tag) are gone while it lasts.',
 'wx:infest':'5% of the Druid\'s weather casts (he casts instead of visiting): Infest for 30 s, a locust swarm. Nobody visits that space.',
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
const TIER_NAME={c:'common',u:'uncommon',r:'rare',l:'legendary'};
// Idle activities per character: [key, tier, condition]. A condition (checked in game.js, idleOk) must hold or the activity is left out.
// Conditions: nbr = a free neighbor; noRight = no box to his right; eknight = Eldritch Knight with a Wizard on the board; brew = next to a Merchant
// with 5 coins; target = someone free to haunt; alc = next to the Alchemist; madsci = mad scientist with a free neighbor; others = someone to copy;
// mageTag = the Rogue's Mage tag; spirit = all four spaces around him open and empty; rain = his space in the Druid's Rain; grudge = refused by a Monarch
const IDLES={knight:[['prac','c'],['orc','u','nbr'],['horse','r','noRight'],['cat','l','eknight']],
 wizard:[['read','c'],['magic','c'],['demon','l'],['brew','l','brew']],
 priest:[['pray1','c'],['farmer','c'],['tithe','u'],['exorcise','r']],
 necromancer:[['spirits','c'],['candles','c'],['lightning','c'],['raise','l','target']],
 merchant:[['advert','c'],['sell','c','nbr'],['mcust','u'],['mob','l'],['promo','u','alc']],
 apothecary:[['abrew','c'],['herbs','c'],['acust','u'],['trip','r'],['tripbreak','r'],['promo','u','alc']],
 alchemist:[['alcbrew','c'],['smoke','c'],['research','u'],['beast','u','madsci']],
 rogue:[['daggers','c'],['count','c'],['smokebomb','u'],['disguise','r','others'],['conjure','l','mageTag']],
 druid:[['grove','c'],['animals','c'],['weather','u'],['spirit','r','spirit']],
 blacksmith:[['forgework','c'],['smelt','c'],['coal','u'],['pour','l'],['leadgold','u','alc']],
 farmer:[['hoe','c'],['fork','c']],monarch:[['court','c']],traveler:[['wares','c']]};
const IDLE_ANY=[['story','c','rain'],['regicide','l','grudge']]; // added to anyone's list while the condition holds
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
const WEATHER_TIERS={blizzard:'u',sandstorm:'u',sunshine:'c',rain:'c',overgrowth:'c',moonlight:'c',decay:'c',infest:'r'};
// Outcome chances inside a scene, set to the same tiers (deaths and special results)
Object.assign(ODDS,{slip:RARITY.r,horde:RARITY.r,boomDeath:RARITY.l,alchemist:RARITY.u,reveal:RARITY.r,healFarm:RARITY.r,ntradePotion:RARITY.u,
 tempt:RARITY.r,betray:RARITY.u,sickDeath:RARITY.r,twopot:RARITY.u,stone:1-RARITY.u,adventureDeath:RARITY.u,advScroll:RARITY.u,advArtifact:RARITY.r,
 storySecret:RARITY.u,dragon:RARITY.u,bronze:RARITY.l});
// Deadly events: three times as likely for someone living in a Sandstorm
const DEADLY={demon:1,murder:1,assassin:1,drain:1};
// Extra rule text shown in a discovered tile's description (results that are not the scene's own chance)
const NOTE={horde:'The Knight dies 5% of the time.',apple:'The Priest slips and dies 5% of the time.',boom:'It kills them both 0.75% of the time.',
 cobrew:'15%: the Alchemist is unlocked (once he is, a free potion instead).',pstudy:'5%: a clue (an undiscovered interaction or a secret is revealed).',
 heal:'5%: the farmer stays and sets up a farm nearby.',ntrade:'With the Alchemist next to her, 15%: +1 potion.',bloodorange:'30%: there is one left (+3 coins).',
 tempt:'5%: he does it, and the Priest dies.',betray:'15%: the Rogue is sacrificed and the Necromancer gets a skeleton follower.',kdate:'It goes well 80% of the time.',
 wdate:'It goes well 40% of the time.',crusade:'They come back with 10 coins (70%) or an artifact (30%).',rumors:'15%: rumors of a dragon instead of goblins.',
 adventure:'Each one back: 15% did not make it; 1-10 coins per Fighter, 15% a scroll per Mage, 5% an artifact per Merchant.',
 dungeon:'Loot: 50 coins 20%, an artifact 10%, 2 scrolls 25%, 3 potions 25%, a clue 20%.',wine:'Sick for 1 minute; 5% fatal.',
 stone:'85% a philosopher\'s stone, 15% the elixir of life (secret).',elixir:'15% of artifacts on the Alchemist.',story:'15%: a clue.',wolfkill:'30% when Moonlight starts, 30% when it ends.',
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
 story:'A short story read in the rain.',wolfkill:'A werewolf leaps out of the moonlight.',orc:'He spots an orc in a neighbor\'s room and charges over.',
 massprayer:'Everyone squeezes into his room to pray together for 20 seconds.',fourmage:'He hands one of his Mage neighbors a potion. It works as if you used it.',
 'wx:blizzard':'Snow! Whoever lives there visits less, but their rarest idle activity is more likely.','wx:rain':'Rain: whoever lives there reads short stories.',
 'wx:moonlight':'Darkness and soft pink moonlight. Beware the werewolf.','wx:sunshine':'Warm sun: a Merchant there earns more coins, a Farmer even more.',
 'wx:decay':'Worms and flies. Tags its character was not born with are gone while it lasts.','wx:infest':'A locust swarm. Nobody visits that space.',
 'wx:sandstorm':'Sand everywhere. Every chance of dying there is tripled.','wx:overgrowth':'Pink and yellow flowers bloom all around the border.',
 royalfuneral:'EVERYONE drops what they are doing and kneels at the coffin for 1 minute. No coins or items meanwhile.',
 spar:'Sword versus magic shield. Nobody wins, everybody sweats.',braver:'The Priest admits the Fighter is braver. The Fighter pretends not to blush.',
 forge:'They conjure a free scroll or potion out of thin air.',drain:'Black lightning drains the Druid\'s life, and he dies.',
 regicide:'Someone the Monarch refused comes for revenge, from anywhere on the board.',royalpatron:'The generous ruler rewards the adventurers with an artifact.'};
