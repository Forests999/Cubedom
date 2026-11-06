const cv=$('#cv'),g=cv.getContext('2d'),W=COLS*CELL,H=ROWS*CELL,tray=$('#tray'),itemsEl=$('#items'),bub=$('#bub');cv.width=W;cv.height=H;g.imageSmoothingEnabled=false;
let swarms=[]; // bee swarms: {r,c,t} (Knight left of the Apothecary)
let rains=[]; // rain storms in a room: {r,c,t} (spell scroll on the Druid)
let weathers=[]; // the Druid's weather on board spaces: {r,c,k,t,by,wolf} (k = blizzard, sandstorm, ...; lasts WEATHER_TIME)
const TEMP_FORM={monkey:1,bear:1,beast:1}; // forms that take no part in anything for a while (not saved)
let boostT=0,boostAmt=0; // Wizard advertising fruit: +boostAmt extra coins per tick (stacks up to BOOST_MAX total) while boostT counts down
const U={};let S={un:{},coins:0,inv:{scroll:0,potion:0,artifact:0,ingot:0},seen:{},rewarded:0,cells:[],bought:0,revealed:{},goldCell:null},drag=null,td=null,hover=null,parts=[],bolts=[],demons=[],cats=[],fbs=[],flashes=[],thrown=[],splats=[],zaps=[],waves=[],holes=[],coinT=0,bubU=null,T=0;

// ---------- units ----------
const at=(r,c)=>Object.keys(U).find(i=>U[i].r===r&&U[i].c===c);
// Board spaces: the middle 3x3 is open from the start, the rest are bought (S.cells). The first costs CELL_PRICE, each next one CELL_STEP more.
const isOpen=(r,c)=>START_CELLS.includes(r+','+c)||S.cells.includes(r+','+c);
const cellPrice=()=>CELL_PRICE+CELL_STEP*(S.bought||0);
function buyCell(r,c){if(isOpen(r,c))return;const p=cellPrice();
 if((S.coins||0)<p){toast('This space costs '+p+' coins. You have '+(S.coins||0)+'.');return}
 ask('Open this space for '+p+' coins?','Buy',()=>{if(isOpen(r,c)||S.coins<p)return;spend(p);S.cells.push(r+','+c);S.bought=(S.bought||0)+1;showCoins();save();
  poof(c*CELL+48,r*CELL+48,'#f2c84a');parts.push({k:'txt',s:'-'+p,x:c*CELL+44,y:r*CELL+40,t:0,life:1.4,icon:'coin'})})}
const show=f=>{f.vis=true},hide=f=>{f.vis=false;f.keep=false};
const cellX=u=>Math.floor(u.x/CELL),cellY=u=>Math.floor((u.y-1)/CELL); // the room a character is standing in right now
// Where a is relative to b (by their home rooms): left, right, above, below, or null if not neighbors
function rel(a,b){if(a.r===b.r&&a.c===b.c-1)return 'left';if(a.r===b.r&&a.c===b.c+1)return 'right';if(a.c===b.c&&a.r===b.r-1)return 'above';if(a.c===b.c&&a.r===b.r+1)return 'below';return null}
// Which neighbor interaction two characters have, from PAIRS in data.js
function pairKind(a,b){if(!a||!b||a.form==='dknight'||b.form==='dknight'||TEMP_FORM[a.form]||TEMP_FORM[b.form])return null;
 let t=PAIRS[idOf(a)+'>'+idOf(b)],r;if(t&&(r=rel(a,b))&&t[r])return t[r];
 t=PAIRS[idOf(b)+'>'+idOf(a)];if(t&&(r=rel(b,a))&&t[r])return t[r];return null} // checks both directions
// Name label text plus the small class symbol (sword = Fighter, star = Mage, coin = Merchant)
const tagOf=c=>'<img class="tag" src="'+tagURL(c)+'" alt="'+c+'">';
const tagImg=id=>CLASS[id]?tagOf(CLASS[id]):'';
// Which character a unit acts as (a disguised Rogue acts as the character he copies)
const idOf=u=>u.as||u.id;
// A unit's classes: its own (CLASS), plus Mage for an Alchemist next to a Mage, or a Rogue who read a spell scroll (mageTag)
// (also: a second built-in tag, EXTRA_CLASS, e.g. the Blacksmith's Fighter tag; and Fighter for anyone reinforced with an ingot)
// (the Druid's Decay weather hides every tag a character was not born with, while it lasts)
function hasClass(u,c){if(!u)return false;const id=idOf(u);if(CLASS[id]===c)return true;if(EXTRA_CLASS[id]&&EXTRA_CLASS[id].includes(c))return true;const dec=wxOf(u)==='decay';if(c==='fighter'&&u.reinforced&&!dec)return true;if(c!=='mage'||dec)return false;if(u.mageTag)return true;
 return id==='alchemist'&&Object.values(U).some(v=>v!==u&&idOf(v)!=='alchemist'&&hasClass(v,'mage')&&rel(v,u))} // any Mage by tag (a Rogue with the Mage tag counts too)
const classesOf=u=>{const b=CLASS[idOf(u)];return[b,...['fighter','mage','merchant'].filter(c=>c!==b&&hasClass(u,c))].filter(Boolean)};
function setLabel(u){u.lb.innerHTML='';u.lb.append(u.paladin&&!u.form&&idOf(u)==='knight'?'Paladin':u.arch&&!u.form&&idOf(u)==='druid'?'Archdruid':CH[u.form||idOf(u)].name);const cs=classesOf(u);u.tagKey=cs.join();u.lb.insertAdjacentHTML('beforeend',cs.map(tagOf).join(''));fitLabel(u)}
// Re-draw a label when its class tags change (e.g. the Alchemist moves next to a Mage)
const refreshTags=()=>Object.values(U).forEach(u=>{if(classesOf(u).join()!==u.tagKey)setLabel(u)});
// Shrink a name label until it fits inside its square (squares are small on phones)
function fitLabel(u){const lb=u.lb,cw=cv.getBoundingClientRect().width/COLS;if(!cw)return;const max=cw*84/96;lb.style.maxWidth=max+'px';
 let fs=cl(cw/7.5,7,13);lb.style.fontSize=fs+'px';while(lb.scrollWidth>max+.5&&fs>6){fs-=.5;lb.style.fontSize=fs+'px'}}
const fitLabels=()=>Object.values(U).forEach(fitLabel);
addEventListener('resize',fitLabels);if(document.fonts)document.fonts.ready.then(fitLabels);
// A spot beside character h, at least d pixels away, inside h's room (prefers side s, switches if there's no room)
function standBy(h,d,s){const hx=h.c*CELL,lo=hx+14,hi=hx+82;s=s||(h.x-hx<48?1:-1);let x=h.x+s*d;if(x<lo||x>hi){s=-s;x=h.x+s*d}return cl(x,lo,hi)}
function label(u){u.lb.style.left=(u.c*CELL+6)/W*100+'%';u.lb.style.top=(u.r*CELL+6)/H*100+'%'}
// A new Rogue's outfit (ODDS.rogueOutfit: ninja 40%, bandit 40%, con man 20%)
const rogueOutfit=()=>{const o=ODDS.rogueOutfit;return pickW(Object.keys(o),k=>o[k])};
// Spending coins (counted in S.spent: spending SMITH_UNLOCK coins in total unlocks the Blacksmith)
function spend(n){S.coins-=n;S.spent=(S.spent||0)+n;checkUnlocks()}
function addUnit(id,r,c,quiet,weapon,form,color,skin){
 const lb=document.createElement('div');lb.className='lb';$('#labels').appendChild(lb);
 U[id]={id,r,c,lb,skin:skin!=null?skin:SKIN_CHARS.includes(id)?Math.floor(Math.random()*SKINS.length):0, // skin tone (new Knights, Merchants, Priests: random)
weapon:id==='knight'?(weapon||pick(WEAPONS)):null,form:form||null,color:color||(id==='wizard'?(r===0&&c===0?'black':pick(WIZ_RANDOM)):id==='knight'?(Math.random()<ODDS.bronze?'bronze':'steel'):id==='priest'||id==='alchemist'||id==='monarch'?pick(['m','f']):id==='blacksmith'?(Math.random()<.7?'m':'f'):id==='rogue'?rogueOutfit():null), // rogue: ninja / bandit / con man, blacksmith 70% man, // knight 1% bronze armor, priest 50/50 female/male, // dragged to the top-left on first placement = hidden black outfit (tapping the shelf picks a normal color)
  act:null,at:0,orc:null,dur:0,x:c*CELL+48,y:r*CELL+FY,face:1,st:'idle',wait:1.5+Math.random()*2,path:[],fxs:[],al:1,sk:1,hop:0,blink:0,mood:'ok',mt:0,gp:null,gt:0,mv:false,glow:0,drink:0,kneel:false,tp:false,after:null,hosting:null,target:null,t:0,tt:0,ev:{}};
 if(id==='druid')U[id].fam=pickW(Object.keys(ODDS.familiar),k=>ODDS.familiar[k]); // his animal: a grizzly bear, an eagle or a wolf
 if(id==='monarch')U[id].trait=Math.random()<.5?'generous':'greedy'; // will change how the Monarch treats others
 setLabel(U[id]);label(U[id]);if(!quiet){poof(c*CELL+48,r*CELL+FY-16);save();checkUnlocks();if(id==='monarch')toast('A '+U[id].trait+' '+(U[id].color==='f'?'Queen':'King')+' takes the throne.')}ui();
}
// Clear everything an interaction leaves on a character (but not the teleport flag)
function clearFx(u){u.dress=null;u.paint=null;u.show2=null;u.big=null;u.gather=null;u.gatherOf=null;u.crowd=null;u.table=null;u.show=null;u.feastHost=null;u.fall=false;u.act=null;u.orc=null;u.tent=null;u.und=null;u.lite=null;u.dark=null;u.ward=null;u.kneel=false;u.after=null;u.mv=false;u.npc=null;u.def=null;u.ghost=null;u.spirit=null;u.mobs=null;u.made=null;u.swapWith=null}
function toHome(u){u.fxs=[];u.npcDoor=null; // drop every doorway/stairs this character had open
 clearFx(u);u.tp=false;u.inv=false;u.sneak=false;u.thenVisit=null;for(let i=demons.length-1;i>=0;i--)if(demons[i].owner===u.id)demons.splice(i,1);u.x=u.c*CELL+48;u.y=u.r*CELL+FY;u.path=[];u.st=u.dead?'dead':'idle';u.wait=1;u.al=1;u.sk=1;u.mood='ok';u.mt=0;u.gt=0;label(u)}
function freeHost(h){h.hosting=null;h.st='idle';h.wait=2;h.act=null;h.kneel=false;h.ward=null;h.dress=null;h.lookAway=false;h.al=1;h.fall=false}
function detach(u){
 if(u.target){const h=U[u.target];if(h&&h.hosting===u.id)freeHost(h);u.target=null}
 if(u.hosting){const v=U[u.hosting];if(v){v.target=null;toHome(v)}u.hosting=null}
}
// Anyone with a doorway, stairs or portal open in these rooms is sent home (so nothing is left behind when a box moves)
function clearRooms(cells,except){Object.values(U).forEach(v=>{if(except.includes(v))return;if(v.fxs.some(f=>cells.some(q=>{const fc=Math.floor(f.x/CELL),fr=Math.floor((f.y-1)/CELL);return fr===q[0]&&(fc===q[1]||(f.type==='door'&&fc-1===q[1]))})))toHome(v)})}
function relocate(id,r,c){
 const u=U[id],oid=at(r,c);detach(u);
 if(oid){const o=U[oid];detach(o);o.r=u.r;o.c=u.c;toHome(o)}
 const cells=[[u.r,u.c],[r,c]];u.r=r;u.c=c;toHome(u);clearRooms(cells,[u,oid&&U[oid]].filter(Boolean));checkUnlocks();
}
function removeUnit(id,quiet){const u=U[id];detach(u);clearRooms([[u.r,u.c]],[u]);for(let i=demons.length-1;i>=0;i--)if(demons[i].owner===id)demons.splice(i,1);if(!quiet)poof(u.c*CELL+48,u.r*CELL+48);dropBub(u);u.lb.remove();delete U[id];ui()}
function poof(x,y,c){parts.push({x,y,t:0,life:.5,c:c||'#eadcb4'})}
function hearts(u){parts.push({x:u.x,y:u.y-44,t:0,life:1.3,k:'h'})}
// Speech bubbles: each character has their own, so several conversations can show at the same time
const bubs=new Set();
function say(u,t){if(u.backwards)t=t.split('').reverse().join('');
 if(!u.bubEl){u.bubEl=document.createElement('div');u.bubEl.className='bub';$('#wrap').append(u.bubEl)}
 u.bubEl.textContent=t;u.bubEl.style.display='block';u.bubT=2.1;bubs.add(u);placeBub(u)}
function placeBub(u){u.bubEl.style.left=cl(u.x/W*100,14,86)+'%';u.bubEl.style.top=(u.y-50)/H*100+'%'}
function dropBub(u){if(u.bubEl){u.bubEl.remove();u.bubEl=null}bubs.delete(u)}
let toastT=0;function toast(m){const e=$('#toast');e.textContent=m;e.style.display='block';clearTimeout(toastT);toastT=setTimeout(()=>e.style.display='none',4000)}
// A short arm gesture (pose from POSE) for d seconds, used to liven up interactions
function gest(u,p,d){if(u){u.gp=p;u.gt=d}}
const home=u=>({x:u.c*CELL+16+Math.random()*64,y:u.r*CELL+FY});
// A character dies: their box is gone (back on the shelf). Anyone they were with goes home.
function kill(v){
 if(v.dead)return; // a buried Druid can't die again
 poof(v.x,v.y-20);
 if(v.target){const h=U[v.target];if(h&&h.hosting===v.id)freeHost(h)}
 if(v.hosting){const w=U[v.hosting];if(w&&w.target===v.id){const inRoom=w.st==='talk';clearFx(w);w.target=null;
  if(inRoom){w.st='back';w.path=route(w,v.r,v.c,w.r,w.c,home(w))}else toHome(w)}}
 for(let i=demons.length-1;i>=0;i--)if(demons[i].owner===v.id)demons.splice(i,1);
 // a Fighter dies next to the Priest: he holds a funeral shortly after
 const P=U.priest;if(P&&P!==v&&!P.dead&&hasClass(v,'fighter')&&rel(v,P))P.funeral=1.5;
 // the Druid does not go back to the shelf: he is buried in his space (a mound with a sapling) until a spell scroll revives him
 if(v.id==='druid'){bury(v);ui();save();return}
 dropBub(v);v.lb.remove();delete U[v.id];
 // a fallen Priest may unlock the Necromancer (once)
 if(v.id==='priest'&&!S.un.necromancer&&Math.random()<ODDS.necro){S.un.necromancer=true;buildShelf();toast('Something dark stirs... a Necromancer box has appeared on the shelf.')}
 ui();save();
}
// The Druid dies: buried in his own space. He keeps his box, tags and place, but does nothing and nobody visits him.
function bury(v){clearFx(v);v.target=null;v.hosting=null;v.fxs=[];v.npcDoor=null;v.sickT=0;v.tinyT=0;v.dead=true;toHome(v);v.al=1;dropBub(v);v.lb.style.opacity=.6;
 poof(v.c*CELL+48,v.r*CELL+70,'#6a5030');toast('The Druid has died and is buried in his grove. A spell scroll on his space could bring him back.')}
function revive(v){v.dead=false;v.st='idle';v.wait=2;v.lb.style.opacity=1;v.mood='happy';v.mt=2;v.hop=.5;poof(v.x,v.y-20,'#6aba4a');poof(v.x,v.y-6,'#f2d870');say(v,'The grove gives me back my life!');save()}
function mkBolt(s,t){const sx=s.x,sy=s.y-40,ex=t.x,ey=t.y-26,n=Math.max(3,Math.round((ey-sy)/10)),p=[[sx,sy]];
 for(let i=1;i<n;i++)p.push([sx+(ex-sx)*i/n+Math.random()*14-7,sy+(ey-sy)*i/n]);p.push([ex,ey]);
 return{p,t:0,cells:[[s.c*CELL,s.r*CELL],[t.c*CELL,t.r*CELL]]}}
const freeU=x=>x&&!x.dead&&!x.hosting&&!x.target&&x.form!=='dknight'&&!TEMP_FORM[x.form]&&!(x.sickT>0)&&(x.st==='idle'||x.st==='walk'); // free to start something (not busy, asleep, sick, or a Death Knight)
// The Alchemist (in his normal form) is a neighbor of u
const alcNext=u=>Object.values(U).some(v=>v!==u&&idOf(v)==='alchemist'&&!v.form&&rel(v,u));
// Pick from a list with weights (w(item) = how likely)
const pickW=(a,w)=>{const ws=a.map(w);let r=Math.random()*ws.reduce((s,x)=>s+x,0);for(let i=0;i<a.length;i++)if((r-=ws[i])<0)return a[i];return a[a.length-1]};
// What a character does when fighting something (beast-man)
const fightAct=v=>{const i=idOf(v);return i==='knight'?'prac':i==='priest'?'smite':i==='necromancer'?'raise':i==='rogue'?'rthrow':'magic'};
// Secrets that depend on where boxes are: the mad scientist (Alchemist bottom-right) and the Rogue's graveyard
const madSci=u=>!!u&&u.id==='alchemist'&&u.r===ROWS-1&&u.c===COLS-1;
const graveyardOn=u=>!!u&&u.id==='rogue'&&u.r===ROWS-1&&!!U.necromancer&&U.necromancer.r===ROWS-1&&!!rel(U.necromancer,u);
// Potion on the Alchemist: for ALC_LUCK_TIME his neighbors' rarest scene chances are 30% higher (ALC_LUCK)
const lucky=u=>!!u&&Object.values(U).some(a=>idOf(a)==='alchemist'&&a.luckT>0&&(a===u||rel(a,u)));
const luck=(p,u,h)=>Math.random()<p*(lucky(u)||lucky(h)?1+ALC_LUCK:1);
const nbrs=u=>[[0,1],[0,-1],[1,0],[-1,0]].map(d=>U[at(u.r+d[0],u.c+d[1])]).filter(h=>freeU(h)&&!(weatherAt(h.r,h.c)==='infest'));
// ---------- the Druid's weather on board spaces ----------
// Which weather is on a space right now (or null); wxOf(u) = the weather on u's own space
const weatherAt=(r,c)=>{const w=weathers.find(q=>q.r===r&&q.c===c&&q.t<WEATHER_TIME);return w?w.k:null};
const wxOf=u=>u?weatherAt(u.r,u.c):null;
// A chance of dying, tripled (ODDS.sandDeath) if any of these characters lives in a Sandstorm
const doom=(p,...us)=>p*(us.some(v=>v&&wxOf(v)==='sandstorm')?ODDS.sandDeath:1);
// Instead of visiting a neighbor, the Druid casts weather on a random open space without weather (at most WEATHER_MAX of his at once)
function startWeather(u){if(weathers.filter(w=>w.by===u.id).length>=WEATHER_MAX)return false;
 const open=[];for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++)if(isOpen(r,c)&&!weathers.some(w=>w.r===r&&w.c===c))open.push([r,c]);if(!open.length)return false;
 const o=ODDS.weather,ks=Object.keys(o).filter(k=>!(u.arch&&ARCH_SKIP.includes(k))),q=pick(open); // an Archdruid never casts Moonlight, Decay or Infest
 beginAct(u,'wcast',true);u.dur=3;u.wx={k:pickW(ks,k=>o[k]),r:q[0],c:q[1]};return true}
function addWeather(r,c,k,by){const w={r,c,k,t:0,by};weathers.push(w);markSeen('wx:'+k);poof(c*CELL+48,r*CELL+48,'#c8f0c0');
 if(k==='moonlight')wolfRoll(w);refreshTags();return w}
// Moonlight, when it starts and when it ends: 30% a werewolf leaps out and kills whoever lives in that space (if they are there)
function wolfRoll(w){const v=U[at(w.r,w.c)];if(!v||v.dead||v.st==='away'||v.st==='sleep'||cellX(v)!==v.c||cellY(v)!==v.r||Math.random()>=ODDS.werewolf)return;
 const left=v.x-v.c*CELL>48;w.wolf={t:0,v:v.id,x:v.c*CELL+(left?10:86),face:left?1:-1};if(freeU(v)){v.path=[];v.st='idle';v.wait=3}}
function stepWeather(dt){weathers.forEach(w=>{const was=w.t;w.t+=dt;
  if(was<WEATHER_TIME&&w.t>=WEATHER_TIME){if(w.k==='moonlight')wolfRoll(w);refreshTags()}
  const f=w.wolf;if(!f)return;f.t+=dt;const v=U[f.v];
  if(v&&!f.hit){const d=v.x-f.face*14-f.x;f.x+=Math.sign(d)*Math.min(Math.abs(d),90*dt)} // the werewolf runs at its victim
  if(f.t>=.5&&!f.howl){f.howl=1;if(v){v.mood='shock';v.mt=1.5}}
  if(f.t>=1.1&&!f.hit){f.hit=1;if(v&&U[v.id]&&!v.dead&&v.st!=='away'){flashes.push({x:v.c*CELL,y:v.r*CELL,t:0,col:'200,40,40'});v.blink=.6;v.mood='hurt';v.mt=2}}
  if(f.t>=1.6&&!f.done){f.done=1;if(v&&U[v.id]&&!v.dead&&v.st!=='away'){const nm=CH[idOf(v)].name;kill(v);markSeen('wolfkill');toast('A werewolf leapt out of the moonlight! The '+nm+' is dead.')}}
  if(f.t>=2.6)w.wolf=null});
 weathers=weathers.filter(w=>w.t<WEATHER_TIME+1||w.wolf)}
// The rarest idle activity of each character, as the part of the 0..1 roll that picks it (the Blizzard makes it 30% more likely)
const RARE_IDLE={wizard:()=>{const W=ODDS.wizard;return[W.read+W.magic,1]},priest:()=>{const P=ODDS.priest;return[P.pray+P.farmer+P.tithe,1]},necromancer:()=>{const N=ODDS.necromancer;return[N.spirits+N.candles+N.lightning,1]},
 merchant:()=>{const M=ODDS.merchant;return[M.customer+M.advert+M.sell,1]},apothecary:()=>{const A=ODDS.apothecary;return[A.customer,A.customer+A.trip]},alchemist:()=>{const A=ODDS.alchemistIdle;return[A.alcbrew,A.alcbrew+A.research]},
 rogue:()=>{const R=ODDS.rogue;return[R.daggers+R.smokebomb,R.daggers+R.smokebomb+R.disguise]},druid:()=>{const D=ODDS.druid;return[D.grove+D.animals,1]},blacksmith:()=>{const M=ODDS.smith;return[M.forgework+M.smelt+M.coal,1]},knight:()=>{const K=ODDS.knight;return[K.prac+K.orc,1]}};
// Stop a character's idle activity (and send away its visitors) so they can join something else
function stopIdle(v){if(v.st!=='act')return;if(v.npc)npcLeave(v);if(v.crowd)crowdLeave(v);v.act=null;v.kneel=false;v.show=null;v.ghost=null;v.spirit=null;v.st='idle';v.path=[]}
// The Blacksmith's adventure takes EVERY Fighter neighbor who is at home and not in a scene (an idle activity is interrupted)
const recruitable=b=>[[0,1],[0,-1],[1,0],[-1,0]].map(d=>U[at(b.r+d[0],b.c+d[1])]).filter(v=>v&&hasClass(v,'fighter')&&!v.dead&&!v.hosting&&!v.target&&v.form!=='dknight'&&!TEMP_FORM[v.form]&&!(v.sickT>0)&&cellX(v)===v.c&&cellY(v)===v.r&&(v.st==='idle'||v.st==='walk'||(v.st==='act'&&v.act!=='recruit')));

// ---------- idle activities (odds in ODDS, data.js) ----------
// quiet = don't mark it in the Compendium (e.g. the scroll's skeleton marks its own tile)
function beginAct(u,a,quiet){if(!quiet)markSeen(a==='prac'?'prac:'+u.weapon:a);u.st='act';u.act=a;u.at=0;u.ev={};u.path=[];u.dur=a==='prac'?3.5+Math.random()*1.5:3;if(a==='prac'&&weaponOf(u)==='shield'&&u.id==='knight'){u.dur=7;squireEnter(u)}}
function startAct(u){
 let r=Math.random();const id=idOf(u),wx=wxOf(u),home=cellX(u)===u.c&&cellY(u)===u.r;u.path=[];
 // the Druid's Rain on this space: 80% of idle time, a short story (10% of them reveal a secret)
 if(wx==='rain'&&home&&id!=='farmer'&&Math.random()<ODDS.rainStory){beginAct(u,'story');u.dur=5;return true}
 // the Druid's Blizzard on this space: the rarest idle activity is 30% more likely
 if(wx==='blizzard'&&RARE_IDLE[id]){const q=RARE_IDLE[id]();if(Math.random()<ODDS.blizzRare*(q[1]-q[0]))r=q[0]+Math.random()*(q[1]-q[0])}
 // Monarch: holding court on the throne
 if(id==='monarch'){beginAct(u,'court');u.dur=5;u.hx=u.c*CELL+34;return true}
 // 10% of idle time: just wave to a neighbor (any side)
 if(Math.random()<ODDS.wave){const o=[[0,1],[0,-1],[1,0],[-1,0]].map(d=>U[at(u.r+d[0],u.c+d[1])]).filter(v=>v&&!v.dead);
  if(o.length&&cellX(u)===u.c&&cellY(u)===u.r){const h=pick(o);if(h.c!==u.c)u.face=h.c>u.c?1:-1;beginAct(u,'wave');u.dur=2.2;u.waveTo=h.id;return true}}
 if(id==='farmer'){const a=Math.random()<.5?'hoe':'fork';beginAct(u,a);u.dur=a==='hoe'?4.5:5;
  if(a==='fork'){const bx=u.c*CELL;u.hx=u.x-bx<48?bx+76:bx+20}return true} // fork: carries it across the field
 // Alchemist: brew at the table 60%, research formulas 10%, a solution goes wrong and fills the room with smoke 30%
 // Secret: the mad scientist (bottom-right space), 15%: turns into a beast-man and attacks a free neighbor
 if(madSci(u)&&!u.as&&Math.random()<ODDS.beast&&cellX(u)===u.c&&cellY(u)===u.r){const o=nbrs(u).filter(v=>v.id!=='farmer');if(o.length){beastOut(u,pick(o));return true}}
 // A Merchant next to the Alchemist, 10%: a promotional sale of the Alchemist's potions (a customer comes in)
 if((id==='merchant'||id==='apothecary')&&alcNext(u)&&Math.random()<ODDS.promo){beginAct(u,'promo');u.dur=7;customerEnter(u);return true}
 // Druid: tend the grove 40%, talk to deer and birds 40%, predict the weather 20%.
 // Secret: all four spaces around him open and empty, 20%: he communes with a nature spirit and learns a secret.
 if(id==='druid'){const sp=[[0,1],[0,-1],[1,0],[-1,0]].every(d=>{const rr=u.r+d[0],cc=u.c+d[1];return rr>=0&&rr<ROWS&&cc>=0&&cc<COLS&&isOpen(rr,cc)&&!at(rr,cc)});
  if(sp&&Math.random()<ODDS.spirit){beginAct(u,'spirit');u.dur=6;return true}
  const D=ODDS.druid,a=r<D.grove?'grove':r<D.grove+D.animals?'animals':'weather';beginAct(u,a);u.dur={grove:5,animals:6,weather:5}[a];u.hx=u.c*CELL+30;return true}
 // Blacksmith: hammering 40%, smelting armor or a sword 40%, coal 19%, pouring an ingot mold 1% (ODDS.smith).
 // Secret: next to the Alchemist, 15% (rolled first) they turn lead into gold.
 if(id==='blacksmith'){const bx=u.c*CELL;
  if(alcNext(u)&&Math.random()<ODDS.leadgold){beginAct(u,'leadgold');u.dur=5;u.hx=bx+52;return true}
  const Sm=ODDS.smith,a=r<Sm.forgework?'forgework':r<Sm.forgework+Sm.smelt?'smelt':r<Sm.forgework+Sm.smelt+Sm.coal?'coal':'pour';
  beginAct(u,a);u.dur={forgework:5,smelt:6,coal:4.5,pour:5}[a];u.hx=a==='forgework'||a==='pour'?bx+52:bx+44;if(a==='smelt')u.smeltWhat=Math.random()<.5?'armor':'sword';return true}
 if(id==='alchemist'){const A=ODDS.alchemistIdle,a=r<A.alcbrew?'alcbrew':r<A.alcbrew+A.research?'research':'smoke';
  beginAct(u,a);u.dur={alcbrew:4.6,research:5,smoke:5}[a];if(a==='alcbrew')u.hx=u.c*CELL+46;return true}
 // Rogue: daggers at a target 50%, smoke bomb 20%, disguise 5%, counting coins 25%. With the Mage tag: 0.2% he conjures an artifact.
 if(u.id==='rogue'&&!u.as){
  if(u.mageTag&&Math.random()<ODDS.rogueArtifact){beginAct(u,'conjure');u.dur=3;return true}
  const R=ODDS.rogue,a=r<R.daggers?'daggers':r<R.daggers+R.smokebomb?'smokebomb':r<R.daggers+R.smokebomb+R.disguise?'disguise':'count';
  if(a==='disguise'){const o=Object.values(U).filter(v=>v!==u&&!v.dead&&v.id!=='farmer'&&v.id!=='rogue'&&!v.form);if(!o.length)return false;disguise(u,pick(o));return true}
  beginAct(u,a);u.dur={daggers:5,smokebomb:4,count:4}[a];if(a==='daggers'){u.hx=u.c*CELL+30;}return true}
 if(id==='wizard'){
  // next to a Merchant, 1% chance he spends BREW_COST coins brewing a potion
  if(S.coins>=BREW_COST&&Object.values(U).some(v=>hasClass(v,'merchant')&&rel(v,u))&&Math.random()<ODDS.wizBrew){beginAct(u,'brew');u.dur=4.2;return true}
  const W=ODDS.wizard;let a=r<W.read?'read':r<W.read+W.magic?'magic':'demon';
  if(a!=='demon'&&wx==='sandstorm'&&Math.random()<W.demon*(ODDS.sandDeath-1))a='demon'; // Sandstorm: three times the chance of the deadly demon summoning
  markSeen(a);u.st='act';u.act=a;u.at=0;u.ev={};u.dur=a==='read'?4+Math.random()*2:a==='magic'?3.5+Math.random()*1.5:3;
  if(a==='demon'){const rc=u.c*CELL,dx=cl(u.x+(u.x<rc+48?30:-30),rc+16,rc+80);u.face=dx>u.x?1:-1;demons.push({x:dx,y:u.y,t:0,dir:dx>u.x?-1:1,owner:u.id})}
  return true}
 if(id==='priest'){const P=ODDS.priest,a=r<P.pray?'pray1':r<P.pray+P.farmer?'farmer':r<P.pray+P.farmer+P.tithe?'tithe':'exorcise';
  beginAct(u,a);u.dur={pray1:5,farmer:7.8,tithe:3,exorcise:8}[a];if(a==='farmer'||a==='exorcise')npcEnter(u,a==='exorcise');return true}
 if(id==='necromancer'){const N=ODDS.necromancer,a=r<N.spirits?'spirits':r<N.spirits+N.candles?'candles':r<N.spirits+N.candles+N.lightning?'lightning':'raise';
  if(a==='raise'&&startRaise(u))return true;
  const b=a==='raise'?'spirits':a;beginAct(u,b);u.dur={spirits:5,candles:5.5,lightning:4.5}[b];return true}
 if((id==='merchant'||id==='apothecary')&&r<ODDS[id].customer){beginAct(u,'customer');u.dur=7;customerEnter(u);return true} // 15%: a customer comes in
 if(id==='merchant'){const M=ODDS.merchant,o=nbrs(u),r2=r-M.customer;
  if(r2>=M.advert&&r2<M.advert+M.sell&&o.length){visit(u,pick(o),'sell');return true}
  if(r2>=M.advert+M.sell){beginAct(u,'mob');u.dur=7;mobEnter(u);return true}
  beginAct(u,'advert');u.dur=4.5;return true}
 if(id==='apothecary'){const A=ODDS.apothecary,q=r-A.customer,a=q<A.trip?'trip':q<A.trip+A.tripbreak?'tripbreak':q<A.trip+A.tripbreak+A.abrew?'abrew':'herbs';
  beginAct(u,a);u.dur={trip:3,tripbreak:3.4,abrew:4.4,herbs:5}[a];u.hx=u.c*CELL+64;return true}
 if(id!=='knight')return false;
 // Eldritch Knight only: a black cat wanders across the back of the Wizard's room
 if(u.form==='eknight'&&U.wizard&&Math.random()<ODDS.eknightCat){cats.push({t:0,dir:pick([1,-1])});markSeen('cat');u.st='idle';u.wait=3;return true}
 const K=ODDS.knight;
 if(r>=K.prac&&r<K.prac+K.orc){const o=nbrs(u);if(o.length){visit(u,pick(o),'orc');return true}}
 // Horse: needs open space to the right (no box in the next cell)
 if(r>=K.prac+K.orc&&!at(u.r,u.c+1)){markSeen('horse');u.st='act';u.act='horse';u.at=0;u.ev={};u.dur=6.3;u.hx=u.c*CELL+46;return true}
 // Weapon practice: first walk to the middle of the room so the swings stay inside it
 const mid=u.c*CELL+48;
 if(Math.abs(u.x-mid)>1){u.st='walk';u.path=[{k:'walk',x:mid,y:u.r*CELL+FY}];u.after='prac';return true}
 beginAct(u,'prac');return true;
}
function acting(u,dt){
 if(u.act==='demon'){
  if(u.at>=1.6&&!u.ev.b){u.ev.b=1;u.blink=.5;u.mood='hurt';u.mt=2}
  if(u.at>=2.9){kill(u);return}}
 if(u.act==='horse'){
  u.mv=false;
  if(u.at<1.2&&Math.abs(u.hx-u.x)>.5){const d=u.hx-u.x,s=30*dt;u.face=d>0?1:-1;u.x+=Math.abs(d)<s?d:Math.sign(d)*s;u.mv=true;u.t+=dt}
  else if(u.at>=1)u.face=1;
  if(u.at>=4.6&&!u.ev.p){u.ev.p=1;u.hop=.5;u.mood='happy';u.mt=1.5;gest(u,'up',.6)}}
 if(u.act==='fireball'&&u.at>=.7&&!u.ev.f){u.ev.f=1;const q=u.fb;fbs.push({sx:u.x-u.face*14,sy:u.y-38,ex:q.c*CELL+48,ey:q.r*CELL+52,t:0,r:q.r,c:q.c,owner:u.id})}
 if(u.act==='sip'&&u.at>=.8&&!u.ev.s){u.ev.s=1;poof(u.x,u.y-24,u.id==='priest'?'#f2d870':'#c890ff');u.hop=.5;if(u.id==='priest'){u.wings=30;u.mood='happy';u.mt=2}}
 const once=(n,t,f)=>{if(!u.ev[n]&&u.at>=t){u.ev[n]=1;f()}},n=u.npc;
 if(n&&Math.abs(n.x-u.x)>2)u.face=n.x>u.x?1:-1;
 // ---- Priest idles ----
 if(u.act==='pray1'){once('k',.3,()=>{u.kneel=true});once('u',4.6,()=>{u.kneel=false})}
 if(u.act==='farmer'||u.act==='exorcise'){const ex=u.act==='exorcise';
  once('d',2,()=>npcDoor(u,0));
  if(!ex){once('p1',2.2,()=>say(u,FARM_PRAYER[0]));once('p2',3.3,()=>say(u,FARM_PRAYER[1]));
   for(let i=0;i<6;i++)once('w'+i,4.5+i*.18,()=>{if(n)parts.push({k:'drop',x:u.x+u.face*14,y:u.y-34,vx:(n.x-u.x)*1.6+(Math.random()-.5)*30,vy:-80-Math.random()*30,t:0,life:.8})})}
  else{once('s1',2.4,()=>{if(n)n.shake=true});once('s2',3.2,()=>{if(n)u.spirit={x:n.x,y:n.y,t:0}});
   once('s3',4.6,()=>{if(n){n.shake=false;n.mood='happy';n.hop=.5;poof(n.x,n.y-30,'#f2d870')}})}
  once('h',5.8,()=>{if(n){n.mood='happy';n.hop=.5}});
  once('l',6.3,()=>{if(n)npcLeave(u)})}
 if(u.act==='tithe'){once('p',.3,()=>say(u,'Bless this house with fortune.'));once('c',1.8,()=>{addCoins(TITHE,u.x,u.y-50);poof(u.x,u.y-40,'#f2d870')})}
 // ---- items on the Priest ----
 if(u.act==='banish'){once('h',2,()=>{});once('b',3.2,()=>{if(u.ghost)poof(u.ghost.x,u.ghost.y-30,'#e8eef8')});once('e',3.6,()=>{u.ghost=null;u.mood='happy';u.mt=1.2;u.hop=.5})}
 // ---- items on the Necromancer ----
 // ---- Necromancer casts ----
 if(u.act==='sleepc')once('w',.7,()=>{waves.push({r:cellY(u),c:cellX(u),x0:u.x,t:0,hit:{},by:u.id})});
 if(u.act==='swapc'&&u.swapWith){const o=U[u.swapWith];
  once('f',1.3,()=>{flashes.push({x:u.c*CELL,y:u.r*CELL,t:0,col:'200,140,255'});if(o)flashes.push({x:o.c*CELL,y:o.r*CELL,t:0,col:'200,140,255'})});
  once('s',1.6,()=>{if(o&&U[o.id]){const r=o.r,c=o.c;relocate(u.id,r,c);poof(u.x,u.y-24,'#7aff7a');poof(o.x,o.y-24,'#c890ff');save()}})}
 // ---- great prayer: wait for all four to arrive, then everyone kneels for MASS_PRAYER_TIME seconds under a holy glow ----
 // (also the funeral: same gathering, a gravestone, quiet and sad instead of a holy glow, FUNERAL_TIME long)
 if((u.act==='massprayer'||u.act==='funeral')&&u.gather){const G=u.gather,mid=u.c*CELL+48,fun=u.act==='funeral',len=fun?FUNERAL_TIME:MASS_PRAYER_TIME;u.mv=false;
  if(Math.abs(u.x-mid)>.5){const d=mid-u.x,s=30*dt;u.x+=Math.abs(d)<s?d:Math.sign(d)*s;u.face=d>0?1:-1;u.mv=true;u.t+=dt}
  const guests=G.ids.map(i=>U[i]).filter(v=>v&&v.gatherOf===u.id);
  if(G.phase==='coming'&&(guests.every(v=>v.st==='gathered')||u.at>12)){G.phase='pray';G.pt=0;u.kneel=true;guests.forEach(v=>{if(v.st==='gathered'){v.kneel=true;if(fun){v.mood='hurt';v.mt=len}}});
   say(u,fun?'We are gathered here to honor a brave Fighter.':'Let us pray, all of us together.');if(fun){u.mood='hurt';u.mt=len}markSeen(u.act)}
  if(G.phase==='pray'){G.pt+=dt;u.face=1;if(!fun&&Math.floor(G.pt/2)!==Math.floor((G.pt-dt)/2))poof(u.c*CELL+20+Math.random()*56,u.r*CELL+30,'#f2d870');
   if(fun&&G.pt>len/2&&!u.ev.f2){u.ev.f2=1;say(u,'Rest well. Your watch is over.')}
   if(G.pt>=len){u.kneel=false;u.mood=fun?'ok':'happy';u.mt=2;u.hop=fun?0:.5;guests.forEach(v=>{v.kneel=false;v.mood=fun?'ok':'happy';v.mt=2;v.hop=fun?0:.5;v.gatherOf=null;goHome(v)});u.gather=null;u.dur=u.at}}}
 // ---- Merchant above the Priest: he drops fruit on the Priest's head and laughs ----
 if(u.act==='fruitdrop'){const P=U.priest;
  for(let i=0;i<3;i++)once('f'+i,.6+i*.5,()=>{if(P)thrown.push({sx:u.x+u.face*8,sy:u.y-30,ex:P.x,ey:P.y-36,t:0,icon:pick(['apple','orange','banana']),fruit:1})});
  for(let i=0;i<3;i++)once('h'+i,.95+i*.5,()=>{if(P){P.blink=.3;P.mood='mad';P.mt=2.5}});
  once('a',2,()=>{if(P){say(P,'Hey! Stop that this instant!');gest(P,'up',1)}});
  once('l',2.9,()=>{say(u,'Ha ha ha! Special delivery!');u.hop=.4;u.mood='happy';u.mt=2});once('l2',3.4,()=>{u.hop=.4})}
 // ---- Priest above the Merchant: a curse rots all his fruit for ROT_TIME seconds ----
 if(u.act==='curse'){const M=U.merchant;
  once('a',.3,()=>say(u,'May your fruit wither on the vine!'));
  once('b',1.2,()=>{if(M){u.beam={x:M.x,y:M.y-24,t:0,col:'140,220,90'};flashes.push({x:M.c*CELL,y:M.r*CELL,t:0,col:'120,160,60'})}});
  once('c',1.7,()=>{if(M){M.rotT=ROT_TIME;M.mood='hurt';M.mt=2;say(M,'My beautiful fruit! Rotten!');markSeen('curse')}})}
 // ---- Apothecary idles ----
 if(u.act==='trip'||u.act==='tripbreak'){
  once('h',.3,()=>{u.hop=.3;u.mood='shock';u.mt=.4});once('f',.6,()=>{u.fall=true;u.mood='hurt';u.mt=1.8});
  if(u.act==='tripbreak')once('b',.7,()=>thrown.push({sx:u.x+u.face*8,sy:u.y-24,ex:u.x+u.face*22,ey:u.y-3,t:0}));
  once('u',2.2,()=>{u.fall=false;u.mood='ok';u.hop=.3})}
 if(u.act==='herbs'){u.mv=false;if(u.at<1.2&&Math.abs(u.hx-u.x)>.5){const d=u.hx-u.x,s=30*dt;u.face=d>0?1:-1;u.x+=Math.abs(d)<s?d:Math.sign(d)*s;u.mv=true;u.t+=dt}else if(u.at>=1.2)u.face=-1;
  once('p',3.4,()=>poof(u.x-12,u.y-20,'#6aba4a'))}
 // ---- Alchemist idles and items ----
 const walkTo=(x,sp)=>{u.mv=false;if(Math.abs(x-u.x)>.5){const d=x-u.x,s=(sp||30)*dt;u.face=d>0?1:-1;u.x+=Math.abs(d)<s?d:Math.sign(d)*s;u.mv=true;u.t+=dt;return false}return true};
 if(u.act==='alcbrew'){if(walkTo(u.hx)&&u.at>=1.2)u.face=1;once('p',3.2,()=>poof(u.c*CELL+56,u.r*CELL+36,pick(['#7aff7a','#c890ff','#f2c84a'])))}
 if(u.act==='research'){once('s',.4,()=>say(u,pick(['Hmm... add moonlight, remove onions.','If lead plus luck equals gold...','Note to self: never lick the mercury.'])))}
 if(u.act==='smoke'){once('a',.3,()=>say(u,'Now just a drop of this...'));once('b',1,()=>{poof(u.x,u.y-30,'#9a9aa8');u.mood='shock';u.mt=1.5;u.hop=.4});once('c',2.6,()=>{say(u,'*cough* *cough*');u.mood='hurt';u.mt=2})}
 if(u.act==='retire'){once('g',1,()=>{u.mood='happy';u.mt=3});
  once('x',2.8,()=>{poof(u.x,u.y-24,'#f2d870');poof(u.x,u.y-8,'#ffffff');markSeen('elixir');S.un.alchemist=false;removeUnit(u.id,true);buildShelf();save();toast('The Alchemist drank the elixir of life and retired. A secret is found!')});if(!U[u.id])return}
 // ---- Druid idles and items ----
 if(u.act==='grove'){if(walkTo(u.hx)&&u.at>=1.2)u.face=-1;once('p',2.4,()=>poof(u.c*CELL+24,u.r*CELL+54,'#6aba4a'));once('s',3.4,()=>say(u,pick(['Grow strong, little ones.','This oak is three hundred years old.','Who has been picking my mushrooms?'])))}
 if(u.act==='animals'){once('s',1.6,()=>say(u,pick(['Hello, little friends.','The deer say the river is high this year.','The birds have gossip about the Rogue.'])));once('h',3.6,()=>{u.mood='happy';u.mt=1.5;u.hop=.3})}
 if(u.act==='weather'){once('s',2.6,()=>say(u,pick(['Rain by evening. Or sun. Possibly snow.','The leaves say... wind. Lots of wind.','A storm is coming. Or a light drizzle.'])))}
 if(u.act==='spirit'){once('s',1,()=>say(u,'Spirit of the wood... speak to me.'));once('r',4,()=>{revealSecret('A nature spirit whispered a secret to the Druid! It is now shown in the Compendium.');u.mood='happy';u.mt=1.5})}
 if(u.act==='stash'){once('s',.3,()=>say(u,'I will save this for a rainy day.'))}
 // the Druid casts weather on a space (instead of visiting a neighbor)
 if(u.act==='wcast'){once('s',.3,()=>say(u,WX_SAY[u.wx.k]));once('w',1.6,()=>{addWeather(u.wx.r,u.wx.c,u.wx.k,u.id);u.mood='happy';u.mt=1.2})}
 // a short story in the Druid's rain (10%: it reveals a secret)
 if(u.act==='story'){once('s',1,()=>say(u,pick(STORIES)));once('r',3.6,()=>{if(Math.random()<ODDS.storySecret&&revealSecret('A story in the rain held a hidden secret! It is now shown in the Compendium.')){u.mood='happy';u.mt=1.5}})}
 // artifact on the Druid: he becomes the Archdruid
 if(u.act==='ascend'){once('a',.2,()=>{say(u,'This artifact... the forest is calling me.');u.glow=2.6});once('b',1.6,()=>{u.arch=true;setLabel(u);poof(u.x,u.y-30,'#9affb0');poof(u.x,u.y-10,'#f2d870');u.mood='happy';u.mt=2;save()});once('c',2.2,()=>say(u,'I am the Archdruid now.'))}
 // the Monarch holds court on the throne (generous or greedy orders)
 if(u.act==='court'){if(walkTo(u.hx)&&u.at>=1)u.face=1;once('s',1.8,()=>{say(u,pick(COURT[u.trait]||COURT.generous));gest(u,'up',1.2)})}
 if(u.act==='storm'){once('r',.6,()=>{rains.push({r:u.r,c:u.c,t:0});say(u,'Let the rain call everyone home!')});
  // everyone who is away (dates, crusades, dungeons, adventures) comes home now, as if the whole time had passed; dates go well
  once('h',2,()=>Object.values(U).forEach(v=>{if(v.st==='away'){v.awayT=0;if(v.awayKind==='date')v.dateOk=true}}))}
 // ---- Blacksmith ----
 if(u.act==='forgework'||u.act==='smelt'||u.act==='coal'||u.act==='pour'||u.act==='leadgold'){if(walkTo(u.hx)&&u.at>=1)u.face=-1}
 if(u.act==='smelt'){once('s',1.6,()=>say(u,u.smeltWhat==='armor'?'A fine breastplate, almost ready...':'This blade will be my best yet.'))}
 if(u.act==='coal'){once('f',2.6,()=>poof(u.c*CELL+20,u.r*CELL+46,'#ff8020'))}
 if(u.act==='pour'){once('i',3.4,()=>{addItem('ingot',1,u.x,u.y-50);u.mood='happy';u.mt=1.5;say(u,'A perfect ingot. On the house!')})}
 if(u.act==='leadgold'){once('s',.6,()=>say(u,'The Alchemist says lead can become gold...'));once('g',3,()=>{poof(u.x+u.face*14,u.y-30,'#f2c84a');addCoins(LEADGOLD_GAIN,u.x,u.y-50);u.mood='happy';u.mt=1.5;say(u,'It worked! Gold!')})}
 if(u.act==='dance'){if(Math.floor(u.at*2.5)!==Math.floor((u.at-dt)*2.5)){u.face=-u.face;u.hop=.3}once('s',.4,()=>say(u,'My feet! They will not stop!'));once('t',7,()=>say(u,'Somebody make it stop!'));once('e',14.6,()=>{u.mood='hurt';u.mt=1.5;say(u,'Phew. Never again.')})}
 if(u.act==='recruit'){once('a',.3,()=>{say(u,'Adventure awaits! Who is brave enough?');gest(u,'both',1)});
  once('b',1.4,()=>(u.recruits||[]).forEach(i=>{const v=U[i];if(v){v.hop=.4;v.mood='happy';v.mt=1.5;say(v,pick(['Me!','Count me in!','For glory!']))}}));
  once('c',2.6,()=>{const ok=recruitable(u).map(v=>v.id),g=(u.recruits||[]).filter(i=>ok.includes(i)).map(i=>U[i]);g.forEach(stopIdle);if(g.length){goAway(g,'adventure',ADVENTURE_TIME);markSeen('adventure')}u.recruits=null})}
 // ---- Rogue idles ----
 if(u.act==='daggers'){if(walkTo(u.hx)&&u.at>=.8)u.face=1;once('h',4.4,()=>{u.mood='happy';u.mt=1;say(u,'Bullseye.')})}
 if(u.act==='smokebomb'){once('a',.4,()=>{poof(u.x,u.y-20,'#8a8a96');poof(u.x,u.y-8,'#5a5a64');u.al=.08});
  once('m',1.6,()=>{u.x=u.c*CELL+16+Math.random()*64});once('b',2.8,()=>{poof(u.x,u.y-20,'#8a8a96');u.al=1;u.mood='happy';u.mt=1;u.hop=.3})}
 if(u.act==='count'){once('a',.3,()=>say(u,'One, two, three...'));once('b',2.4,()=>{const n=S.coins||0;say(u,n+' coin'+(n===1?'':'s')+'. '+(n>99?'Not bad at all.':n>20?'A modest stash.':'...I need a bigger job.'))})}
 if(u.act==='conjure'){once('a',2,()=>{addItem('artifact',1,u.x,u.y-50);u.mageTag=false;setLabel(u);save();u.mood='happy';u.mt=1.5;say(u,'An artifact! And my magic is gone. Worth it.')})}
 // ---- Necromancer casts at the Fruit Merchant ----
 if(u.act==='sacrifice'){const M=U.merchant;// blood drips down from his floor onto the fruit below; the Merchant goes up to yell at him
  once('a',.3,()=>say(u,'Blood for the old gods!'));
  for(let i=0;i<8;i++)once('d'+i,1.1+i*.15,()=>{if(M)parts.push({k:'drop',col:'#a01828',x:u.c*CELL+14+Math.random()*30,y:u.r*CELL+96,vx:0,vy:30,t:0,life:.7})});
  once('m',2.4,()=>{if(M){M.mood='mad';M.mt=2;M.hop=.4;say(M,'Blood?! On my apples?!')}});
  once('v',3.6,()=>{if(M&&freeU(M)){u.st='idle';u.act=null;visit(M,u,'yell')}})}
 if(u.act==='chant'){const M=U.merchant,cu=M&&M.crowd&&M.crowd[0];// he practices loudly; the customer upstairs runs away
  once('a',1.6,()=>{say(u,pick(NCHANTS));u.hop=.3});
  once('b',2.4,()=>{if(cu){cu.mood='shock';cu.hop=.5;crowdLeave(M)}});
  once('c',3.2,()=>{if(M){M.mood='mad';M.mt=2.5;say(M,'Keep it down! You scared off my customer!')}});
  once('d',4.8,()=>{say(u,'Sorry. Practice makes perfect.')})}
 if(u.act==='nrot'){const M=U.merchant;// rots the fruit next door; worms crawl out
  once('a',.3,()=>say(u,'Decay comes for all things. Even fruit.'));
  once('b',1.4,()=>{if(M){M.rotT=ROT_TIME;M.worms=true;flashes.push({x:M.c*CELL,y:M.r*CELL,t:0,col:'90,120,40'});M.mood='hurt';M.mt=2;say(M,'Worms! WORMS in my fruit!');markSeen('nrot')}})}
 // ---- Necromancer's bats (Necromancer above the Apothecary) ----
 if(u.act==='bats'){const A=U[u.batTo];once('s',.2,()=>{say(u,'Fly, my pretties!');gest(u,'both',1.2)});
  once('a',2.3,()=>{if(A){A.mood='mad';A.mt=2.5;A.hop=.3;say(A,'Shoo! Get out of my herbs!');gest(A,'both',1.4)}});once('z',4,()=>{u.mood='happy';u.mt=1.2})}
 // ---- waving to a neighbor (any character); a free neighbor waves back ----
 if(u.act==='wave'){once('m',.2,()=>{u.mood='happy';u.mt=2});
  once('b',.8,()=>{const h=U[u.waveTo];if(h&&freeU(h)&&h.st==='idle'){if(h.c!==u.c)h.face=u.c>h.c?1:-1;gest(h,'up',1.2);h.hop=.3;h.mood='happy';h.mt=1.4}})}
 // ---- Farmer idles: whistling while he hoes, or carrying a pitchfork across the field ----
 if(u.act==='hoe')for(let i=0;i<4;i++)once('n'+i,.4+i*1,()=>parts.push({k:'note',x:u.x+u.face*6,y:u.y-46,t:0,life:1.4}));
 if(u.act==='fork'){u.mv=false;if(Math.abs(u.hx-u.x)>.5){const d=u.hx-u.x,s=18*dt;u.face=d>0?1:-1;u.x+=Math.abs(d)<s?d:Math.sign(d)*s;u.mv=true;u.t+=dt}}
 // ---- Farmer: harvest time ----
 if(u.act==='harvest'){once('c',2.2,()=>{u.harvested=true;
   const gloom=U.necromancer&&rel(U.necromancer,u),gain=gloom?Math.floor(FARM_GAIN/2):FARM_GAIN; // next to the Necromancer: half the harvest
   addCoins(gain,u.x,u.y-50);toast('Harvest time! The '+(u.crop==='wheat'?'wheat field':'apple orchard')+' brings in '+gain+' coins'+(gloom?" (halved by the Necromancer's gloom).":'.'))});
  if(u.at>=u.dur){removeUnit(u.id);return}}
 // ---- Wizard brewing next to a Merchant ----
 if(u.act==='brew')once('p',3,()=>{if(S.coins>=BREW_COST){spend(BREW_COST);showCoins();save();parts.push({k:'txt',s:'-'+BREW_COST,x:u.x-14,y:u.y-56,t:0,life:1.4,icon:'coin'});addItem('potion',1,u.x+u.face*18,u.y-34);u.mood='happy';u.mt=1.5}});
 // ---- Priest using an artifact on the Necromancer ----
 if(u.act==='relic'){const N=U.necromancer;
  once('b',1.2,()=>{if(N){u.beam={x:N.x,y:N.y-24,t:0};flashes.push({x:N.c*CELL,y:N.r*CELL,t:0,col:'255,236,150'});N.mood='shock';N.mt=2;N.blink=1}});
  once('k',2,()=>{const M=U.necromancer;if(M){poof(M.x,M.y-24,'#f2d870');poof(M.x,M.y-10,'#ffffff');kill(M);S.un.necromancer=false;buildShelf();save();toast('The Necromancer is destroyed. He must be summoned again the old way...')}u.mood='happy';u.mt=2})}
 if(u.act==='sniff'){once('y',1,()=>{u.mood='hurt';u.mt=1.6});
  once('t',1.3,()=>{const bx=u.c*CELL,by=u.r*CELL;thrown.push({sx:u.x+u.face*10,sy:u.y-30,ex:bx+(u.face>0?80:16),ey:by+38,t:0})})}
 // ---- Knight shield training: the squire spars with a wooden sword while he blocks ----
 if(u.act==='prac'&&u.crowd&&u.crowd[0]&&u.crowd[0].id==='squire'){const s=u.crowd[0];
  once('sq1',1.4,()=>{s.act='prac';s.t=0});once('sq2',u.dur-1.4,()=>{s.act=null;s.mood='happy';s.hop=.5});once('sq3',u.dur-1,()=>crowdLeave(u))}
 // ---- a customer comes in to buy (Fruit Merchant: fruit, Apothecary: a remedy) ----
 // (promo = a Merchant next to the Alchemist sells one of the Alchemist's potions instead)
 if(u.act==='customer'||u.act==='promo'){const pr=u.act==='promo',fruit=u.id==='merchant'&&!pr,cu=u.crowd&&u.crowd[0];
  once('a',2.2,()=>{say(u,pr?pick(PROMO):fruit?'Fresh fruit, just for you!':'This tonic will cure what ails you.');gest(u,'fwd',1.2);u.show={icon:fruit?pick(['apple','orange','banana']):'potion',x:u.x+u.face*14,y:u.y-26}});
  once('b',3.2,()=>{if(u.show&&cu){u.show.x=cu.x+(u.x>cu.x?8:-8)}if(cu){cu.mood='happy';cu.hop=.4}});
  once('c',3.8,()=>{u.show=null;if(fruit)merchantGain(CUSTOMER_FRUIT,u.x,u.y-50);else addCoins(CUSTOMER_REMEDY,u.x,u.y-50);markSeen(pr?'promo':fruit?'mcust':'acust')});
  once('l',4.6,()=>crowdLeave(u))}
 // ---- Fruit Merchant idles ----
 if(u.act==='write')once('w',2,()=>{const cost=u.cost||DESK_COST;if(S.coins>=cost){spend(cost);showCoins();save();parts.push({k:'txt',s:'-'+cost,x:u.x-14,y:u.y-56,t:0,life:1.4,icon:'coin'});addItem('scroll',1,u.x+14,u.y-40);markSeen('desk');u.mood='happy';u.mt=1.2}});
 if(u.act==='advert'){once('a',.3,()=>say(u,pick(MERCH_ADS)));once('b',2.4,()=>{u.hop=.3})}
 if(u.act==='mob'){// farmers storm in from the side and pelt him with fruit
  for(let i=0;i<6;i++)once('f'+i,1.6+i*.5,()=>{const c=u.crowd&&u.crowd[i%3];if(c)thrown.push({sx:c.x,sy:c.y-30,ex:u.x+(Math.random()*10-5),ey:u.y-26,t:0,icon:pick(['apple','orange']),fruit:1})});
  for(let i=0;i<6;i++)once('h'+i,1.95+i*.5,()=>{u.blink=.3;u.mood='hurt';u.mt=.4});
  once('s',1.2,()=>{u.mood='shock';u.mt=.6});once('l',5,()=>crowdLeave(u));once('e',6.2,()=>{u.mood='hurt';u.mt=1})}
 if(u.at>=u.dur){if(u.npcDoor)npcDoor(u,0);u.crowd=null;u.show=null;u.act=null;u.npc=null;u.kneel=false;u.ghost=null;u.spirit=null;u.st='idle';u.mv=false;u.wait=1.5+Math.random()*2.5}
}
// ---- farmer visiting the Priest: comes out of the back door, stands beside him, leaves the same way ----
// Which back door a room has (the Apothecary's is on the left)
const doorOf=u=>TR[u.id]&&TR[u.id].up==='backdoorL'?'backdoorL':'backdoor';
function npcDoor(u,open){let f=u.npcDoor;
 if(open){if(!f||!u.fxs.includes(f)){const ex=doorOf(u);f={type:ex,x:u.c*CELL+EXIT[ex].x,y:u.r*CELL+EXIT[ex].y,open:0,want:1,a:1,vis:true,keep:true};u.fxs.push(f);u.npcDoor=f}f.want=1;f.closing=false;f.keep=true}
 else if(f){f.want=0;f.closing=true}}
function npcEnter(u,possessed){
 const by=u.r*CELL,door=u.c*CELL+EXIT.backdoor.x;npcDoor(u,1);
 u.npc={id:'farmer',x:door,y:by+EXIT.backdoor.ay,face:1,al:0,mood:possessed?'mad':'ok',path:[{x:door,y:by+FY},{x:standBy(u,30),y:by+FY}],t:0,hop:0,shake:false};
}
function npcLeave(u){const n=u.npc,by=u.r*CELL,door=u.c*CELL+EXIT.backdoor.x;npcDoor(u,1);n.path=[{x:door,y:by+FY},{x:door,y:by+EXIT.backdoor.ay}];n.leaving=true}
function stepNpc(u,dt){const n=u.npc;if(!n)return;n.t+=dt;if(n.hop>0)n.hop-=dt;
 const s=n.path[0];
 if(s){const dx=s.x-n.x,dy=s.y-n.y,d=Math.hypot(dx,dy),sp=30*dt;n.walk=true;if(Math.abs(dx)>.5)n.face=dx>0?1:-1;if(d<=sp){n.x=s.x;n.y=s.y;n.path.shift()}else{n.x+=dx/d*sp;n.y+=dy/d*sp}}
 else{n.walk=false;if(Math.abs(u.x-n.x)>2)n.face=u.x>n.x?1:-1}
 if(!n.leaving)n.al=Math.min(1,n.al+dt*2.5);else if(!n.path.length){n.al-=dt*2.5;if(n.al<=0){u.npc=null;npcDoor(u,0)}}
}
// ---- crowds: extra people who walk in for a scene (squire, nobles, farmer mob) ----
// Each is {id, x, y, face, al, path:[{x,y}], act, t, hop, mood, leaving, exit:'door'|'edge'}
function crowdPerson(id,x,y,path,mood,exit){return{id,x,y,face:1,al:0,path,act:null,t:0,hop:0,mood:mood||'ok',leaving:false,exit:exit||'door',home:{x,y}}}
function customerEnter(u){const by=u.r*CELL,ex=EXIT[doorOf(u)],door=u.c*CELL+ex.x;npcDoor(u,1);
 u.crowd=[crowdPerson('commoner',door,by+ex.ay,[{x:door,y:by+FY},{x:standBy(u,30),y:by+FY}])]}
function squireEnter(u){const by=u.r*CELL,door=u.c*CELL+EXIT.backdoor.x;npcDoor(u,1);
 u.crowd=[crowdPerson('squire',door,by+EXIT.backdoor.ay,[{x:door,y:by+FY},{x:standBy(u,30),y:by+FY}])]}
function mobEnter(u){const by=u.r*CELL,bx=u.c*CELL,side=u.x-bx<48?1:-1,edge=side>0?bx+92:bx+4; // they come in from the side away from him
 u.crowd=[0,1,2].map(i=>{const p=crowdPerson('farmer',edge,by+FY-i*5,[{x:cl(u.x+side*(28+i*14),bx+12,bx+84),y:by+FY-i*5}],'mad','edge');p.al=1;return p})}
function feastEnter(u,h){const by=h.r*CELL,bx=h.c*CELL,door=bx+EXIT.backdoor.x;npcDoor(h,1);
 u.crowd=[['noble1',bx+30],['noble2',bx+66]].map(q=>crowdPerson(q[0],door,by+EXIT.backdoor.ay,[{x:door,y:by+72},{x:q[1],y:by+72}],'happy'))}
function crowdLeave(u){const owner=u.crowd&&u.crowd[0]&&u.crowd[0].exit==='door'?(u.feastHost?U[u.feastHost]:u):u;
 (u.crowd||[]).forEach(p=>{p.act=null;p.leaving=true;if(p.exit==='door'&&owner){const by=owner.r*CELL,ex=EXIT[doorOf(owner)],door=owner.c*CELL+ex.x;npcDoor(owner,1);p.path=[{x:door,y:by+(p.y<by+80?72:FY)},{x:door,y:by+ex.ay}]}else p.path=[{x:p.home.x,y:p.y}]})}
function stepCrowd(u,dt){if(!u.crowd)return;if(u.crowd.some(p=>p.ttl&&p.t>p.ttl&&!p.leaving))crowdLeave(u); // ttl: leave on their own after a while (in case the scene was interrupted)
 u.crowd.forEach(p=>{p.t+=dt;if(p.hop>0)p.hop-=dt;const s=p.path[0];
 if(s){const dx=s.x-p.x,dy=s.y-p.y,d=Math.hypot(dx,dy),sp=(p.leaving&&p.exit==='edge'?44:30)*dt;p.walk=true;if(Math.abs(dx)>.5)p.face=dx>0?1:-1;if(d<=sp){p.x=s.x;p.y=s.y;p.path.shift()}else{p.x+=dx/d*sp;p.y+=dy/d*sp}}
 else{p.walk=false;const tgt=p.id==='squire'||p.id==='farmer'||p.id==='commoner'?u:null;if(tgt&&Math.abs(tgt.x-p.x)>2)p.face=tgt.x>p.x?1:-1}
 if(!p.leaving)p.al=Math.min(1,p.al+dt*2.5);else if(!p.path.length)p.al-=dt*2.5});
 u.crowd=u.crowd.filter(p=>p.al>0||!p.leaving);if(!u.crowd.length){u.crowd=null;const o=u.feastHost?U[u.feastHost]:u;if(o&&o.npcDoor)npcDoor(o,0)}}
// ---- Apothecary and the Wizard's writing desk (tap their room) ----
const nextTo=(u,cls,not)=>Object.values(U).some(v=>v!==u&&v!==not&&hasClass(v,cls)&&rel(v,u));
const deskOn=w=>w&&w.id==='wizard'&&nextTo(w,'merchant')&&nextTo(w,'mage');
// secret: with the Druid (alive) next to her, potions cost DRUID_DISCOUNT coins less
const druidNext=a=>!!U.druid&&!U.druid.dead&&!!rel(U.druid,a);
function buyPotion(a){const cost=APOTH_COST-(druidNext(a)?DRUID_DISCOUNT:0);if((S.coins||0)<cost){toast('A potion is '+cost+' coins. You have '+(S.coins||0)+'.');return}
 ask('Buy a potion from the Apothecary for '+cost+' coins?','Buy',()=>{if(!U[a.id]||S.coins<cost)return;
 // secret: with the Alchemist next to her, 20% of potions come as two
 const two=U.alchemist&&!U.alchemist.form&&rel(U.alchemist,a)&&Math.random()<ODDS.twopot;
 spend(cost);showCoins();save();parts.push({k:'txt',s:'-'+cost,x:a.x-14,y:a.y-56,t:0,life:1.4,icon:'coin'});addItem('potion',two?2:1,a.x+14,a.y-40);a.hop=.5;a.mood='happy';a.mt=1.2;gest(a,'fwd',.8);markSeen('apoth');
 if(cost<APOTH_COST){markSeen('ddiscount');if(!two)say(a,'Herbs from the Druid\'s grove. A little cheaper today!')}
 if(two){markSeen('twopot');say(a,'The Alchemist brewed a spare. Two for one!')}})}
// The coin works any time: if the Wizard is home and free he writes it at his desk, otherwise the scroll is ready straight away
function writeScroll(w){const cost=w.color==='black'?DESK_COST_BLACK:DESK_COST;
 if((S.coins||0)<cost){toast('A spell scroll costs '+cost+' coins. You have '+(S.coins||0)+'.');return}
 ask('Have the Wizard write a spell scroll for '+cost+' coins?','Write',()=>{if(!U[w.id]||S.coins<cost)return;
  if(freeU(w)&&cellX(w)===w.c&&cellY(w)===w.r){beginAct(w,'write');w.dur=2.6;w.cost=cost;return}
  const x=w.c*CELL+70,y=w.r*CELL+50;spend(cost);showCoins();save();parts.push({k:'txt',s:'-'+cost,x:x-14,y:y-6,t:0,life:1.4,icon:'coin'});addItem('scroll',1,x+14,y+14);markSeen('desk')})}
// ---- items on the Apothecary ----
function apScroll(u){addItem('potion',1,u.x,u.y-50);poof(u.x,u.y-24,'#c890ff');u.hop=.4;u.mood='happy';u.mt=1.2;say(u,'A scroll? I can brew with this!')}
function apPotion(u){addCoins(AP_POTION_COINS,u.x,u.y-50);u.hop=.4;u.mood='happy';u.mt=1.2;say(u,'Fine work! I will buy it.')}
// ---- temporary Farmer box: appears on the nearest empty cell, grows a field for FARM_TIME seconds, then harvests ----
function spawnFarm(near){if(U.farmer)return false;const seen={},q=[[near.r,near.c]];seen[near.r+','+near.c]=1;
 while(q.length){const[r,c]=q.shift();if(isOpen(r,c)&&!at(r,c)){addUnit('farmer',r,c,false);const fm=U.farmer;fm.farmT=FARM_TIME;fm.crop=Math.random()<.8?'wheat':'apple';fm.wait=2;
   toast('A Farmer has set up a field next door! Harvest in '+Math.round(FARM_TIME/60)+' minutes.');return true}
  [[0,1],[0,-1],[1,0],[-1,0]].forEach(d=>{const k=(r+d[0])+','+(c+d[1]);if(r+d[0]>=0&&r+d[0]<ROWS&&c+d[1]>=0&&c+d[1]<COLS&&!seen[k]){seen[k]=1;q.push([r+d[0],c+d[1]])}})}
 return false}
// ---- purchase popup (in the page; browser pop-ups can be blocked) ----
function ask(text,yes,onYes){const m=$('#modal');m.querySelector('p').textContent=text;const y=$('#mYes'),n=$('#mNo');y.textContent=yes||'Yes';
 m.hidden=false;const close=()=>{m.hidden=true;y.onclick=n.onclick=null};y.onclick=()=>{close();onYes()};n.onclick=close;y.focus()}
// ---- Fruit Merchant money: nothing he does earns coins while his fruit is rotten ----
function merchantGain(n,x,y){const M=U.merchant;if(M&&M.rotT>0){parts.push({k:'txt',s:'rotten!',x,y,t:0,life:1.4,icon:'apple'});return false}addCoins(n,x,y);return true}
// ---- Fruit Merchant as a monkey: hops around his room eating bananas ----
function monkeyAbout(u){const bx=u.c*CELL;
 if(cellX(u)!==u.c||cellY(u)!==u.r){goHome(u);return}
 if(Math.random()<.35){beginAct(u,'eatbanana');u.dur=2.4;u.mood='happy';u.mt=2.4;return}
 u.st='walk';u.hop=.5;u.path=[{k:'walk',x:bx+16+Math.random()*64,y:u.r*CELL+FY,sp:44}];u.wait=.2}
function monkeyfy(u){u.form='monkey';u.monkeyT=MONKEY_TIME;setLabel(u);poof(u.x,u.y-24,'#7a5030');poof(u.x,u.y-10,'#f2d040');u.mood='shock';u.mt=1.2;u.wait=.5}
function backwards(u){u.backwards=!u.backwards;poof(u.x,u.y-30,'#c890ff');say(u,u.backwards?'What happened to my voice?':'Ah, my words are back!');save()}
// ---- great prayer: a Priest with four free neighbors (5%) calls them all in to pray together ----
const GATHER_SPOTS=[[16,74],[33,78],[63,78],[80,74]];
function startGather(P,list,kind){beginAct(P,kind||'massprayer');P.dur=999;P.gather={ids:list.map(v=>v.id),phase:'coming'};P.path=[{k:'walk',x:P.c*CELL+48,y:P.r*CELL+FY}];P.st='act';
 list.sort((a,b)=>a.c-b.c||a.r-b.r).forEach((v,i)=>{const s=GATHER_SPOTS[i];v.gatherOf=P.id;v.st='gather';v.path=route(v,v.r,v.c,P.r,P.c,{x:P.c*CELL+s[0],y:P.r*CELL+s[1]})})}
// ---- coins ----
// Coins earned on the golden space (philosopher's stone) are doubled; (x,y) is where the coins pop up (usually above a character)
const inGold=(x,y)=>S.goldCell&&x!=null&&Math.floor(x/CELL)===S.goldCell[1]&&cl(Math.floor((y+44)/CELL),0,ROWS-1)===S.goldCell[0];
// The Druid's Sunshine on the space where the coins pop up: a Merchant there earns 20% more, a Farmer 50% more
function sunBonus(n,x,y){if(x==null)return n;const c=Math.floor(x/CELL),r=cl(Math.floor((y+44)/CELL),0,ROWS-1);if(weatherAt(r,c)!=='sunshine')return n;const v=U[at(r,c)];
 return v&&v.id==='farmer'?Math.ceil(n*(1+ODDS.sunFarmer)):v&&hasClass(v,'merchant')?Math.ceil(n*(1+ODDS.sunMerchant)):n}
function addCoins(n,x,y){n=sunBonus(n,x,y);if(inGold(x,y))n*=2;S.coins=(S.coins||0)+n;showCoins();checkUnlocks();save();if(x!=null)parts.push({k:'txt',s:'+'+n,x,y,t:0,life:1.4})}
// ---- unlocks that depend on what you hold ----
function checkUnlocks(){checkEggs();
 // the Druid: every board space bought; the Blacksmith: SMITH_UNLOCK coins spent in total
 if(!S.un.druid&&S.cells&&Array.from({length:ROWS*COLS},(_,i)=>isOpen(Math.floor(i/COLS),i%COLS)).every(Boolean)){S.un.druid=true;buildShelf();save();toast('Every space is open... a Druid steps out of the woods. A Druid box has appeared on the shelf!')}
 if(!S.un.monarch&&Object.values(U).filter(v=>v.id!=='farmer').length>=MONARCH_UNLOCK){S.un.monarch=true;buildShelf();save();toast('Ten boxes on the board... a kingdom! A Monarch box has appeared on the shelf.')} // the Monarch: MONARCH_UNLOCK boxes on the board
 if(!S.un.blacksmith&&(S.spent||0)>=SMITH_UNLOCK){S.un.blacksmith=true;buildShelf();save();toast('All that spending caught the eye of a Blacksmith. A Blacksmith box has appeared on the shelf!')}if(!S.un.merchant&&(S.coins||0)>=MERCHANT_COINS){S.un.merchant=true;buildShelf();toast('Business is booming! A Fruit Merchant box has appeared on the shelf.')}
 if(!S.un.apothecary&&Object.values(U).some(m=>CLASS[m.id]==='merchant'&&Object.values(U).some(v=>v!==m&&CLASS[v.id]==='mage'&&rel(v,m)))){S.un.apothecary=true;buildShelf();save();toast('Word of trade reaches the mages... an Apothecary box has appeared on the shelf.')}}
// ---- Compendium: remember every interaction/idle/item effect that has happened (gold border) ----
const SEEN_ALIAS={sleepc:'sleep',swapc:'swap',fruitdrop:'fruitfall',winegift:'wine'};
function markSeen(k){k=SEEN_ALIAS[k]||k;if(!k||S.seen[k])return;S.seen[k]=1;save();
 document.querySelectorAll('.tile[data-k="'+k+'"]').forEach(t=>t.classList.add('seen'));checkDiscoveries();
 if(!tabRef.hidden&&(EGGS.includes(k)||ALL_KEYS.includes(k)))buildRef(compTab)} // refresh the open Compendium (counts, newly found easter eggs)
// Every DISCOVER_EVERY different things discovered (easter eggs included) pays DISCOVER_REWARD coins
const ALL_KEYS=[...new Set(COMP_TABS.flatMap(t=>[...t.pairs,...t.idle,...t.items]))];
const foundCount=()=>ALL_KEYS.filter(k=>S.seen[k]).length;
function checkDiscoveries(){const n=foundCount(),due=Math.floor(n/DISCOVER_EVERY);
 while((S.rewarded||0)<due){S.rewarded=(S.rewarded||0)+1;addCoins(DISCOVER_REWARD);toast(n+' things discovered! +'+DISCOVER_REWARD+' coins')}
 // ROGUE_UNLOCK discoveries: the Rogue
 if(!S.un.rogue&&n>=ROGUE_UNLOCK){S.un.rogue=true;buildShelf();save();setTimeout(()=>toast(n+' discoveries! A shadowy Rogue box has appeared on the shelf.'),1500)}}
// Easter eggs that are noticed just by being on the board
function checkEggs(){const N=U.necromancer;if(N&&N.r===ROWS-1)markSeen('skulls');if(madSci(U.alchemist))markSeen('madsci');if(graveyardOn(U.rogue))markSeen('graveyard');if(U.wizard&&U.wizard.color==='black')markSeen('blackwiz');if(U.knight&&U.knight.color==='bronze')markSeen('bronze')}
// ---- walk back to your own room from wherever you are ----
function goHome(v){const r=cellY(v),c=cellX(v);v.st='back';v.path=r===v.r&&c===v.c?[{k:'walk',x:v.c*CELL+48,y:v.r*CELL+FY}]:route(v,r,c,v.r,v.c,home(v))}
// ---- holy crusade: Priest and Knight leave the board for CRUSADE_TIME seconds, then come back with a reward ----
// Also used for dates (kind 'date'): both leave the board for `time` seconds; ok = whether the date went well
function goCrusade(a,b,kind,time,ok){goAway([a,b],kind,time,ok)}
// Several characters leave the board together for `time` seconds (also the Blacksmith's adventure)
function goAway(list,kind,time,ok){list.forEach((v,i)=>{clearFx(v);v.target=null;v.hosting=null;v.path=[];v.st='away';v.awayT=time||CRUSADE_TIME;v.awayKind=kind||'crusade';v.dateOk=ok;v.dateLead=v.id!=='apothecary';v.al=0;poof(v.x,v.y-24,kind==='date'?'#f080a0':kind==='dungeon'?'#8a8a96':'#f2d870')})}
function stepAway(v,dt){v.awayT-=dt;if(v.awayT>0)return;toHome(v);v.al=1;
 if(v.awayKind==='date'){v.awayKind=null;poof(v.x,v.y-24,v.dateOk?'#f080a0':'#8a8a9a');v.mood=v.dateOk?'happy':'hurt';v.mt=3;
  if(v.dateOk){hearts(v);v.hop=.5}
  if(v.dateLead){const who=v.id==='wizard'?'wizard':'knight',lines=(v.dateOk?DATE_GOOD:DATE_BAD)[who]||DATE_GOOD.knight;say(v,pick(lines));markSeen(v.id==='wizard'?'wdate':'kdate')}return} // only his own words say how it went
 // back from the Blacksmith's adventure: 10% did not make it; the others bring loot by their tags
 if(v.awayKind==='adventure'){v.awayKind=null;if(Math.random()<doom(ODDS.adventureDeath,v)){const nm=CH[idOf(v)].name;kill(v);toast('The '+nm+' did not come back from the adventure.');return}
  poof(v.x,v.y-24,'#f2d870');v.mood='happy';v.mt=2;v.hop=.5;const got=[];
  if(hasClass(v,'fighter')){const n=1+Math.floor(Math.random()*10);addCoins(n,v.x,v.y-50);got.push(n+' coins')}
  if(hasClass(v,'mage')&&Math.random()<ODDS.advScroll){addItem('scroll',1,v.x+14,v.y-60);got.push('a scroll')}
  if(hasClass(v,'merchant')&&Math.random()<ODDS.advArtifact){addItem('artifact',1,v.x-14,v.y-60);got.push('an artifact')}
  say(v,'Back from the adventure!'+(got.length?' I found '+got.join(' and ')+'.':''));return}
 if(v.awayKind==='dungeon'){v.awayKind=null;poof(v.x,v.y-24,'#f2d870');v.mood='happy';v.mt=2;v.hop=.5;if(v.id==='rogue')dungeonLoot(v);else say(v,'What a dungeon! I need a bath.');return}
 poof(v.x,v.y-24,'#f2d870');v.mood='happy';v.mt=2;v.hop=.5;
 if(v.id==='priest'){if(Math.random()<ODDS.crusadeGold){addCoins(CRUSADE_GOLD,v.x,v.y-50);toast('The crusade returns victorious with '+CRUSADE_GOLD+' coins!')}else{addItem('artifact',1,v.x,v.y-50);toast('The crusade returns with a mysterious artifact!')}}}
// ---- Artifact on the Priest (easter egg): if the Necromancer is his neighbor, the Priest destroys him for good ----
// The Necromancer box does NOT go back to the shelf; it must be unlocked again the normal way (a Priest dying).
function relic(u){const N=U.necromancer;if(!N||!rel(u,N))return false;beginAct(u,'relic');u.dur=3.4;u.face=N.c>u.c?1:N.c<u.c?-1:u.face;return true}
// ---- Necromancer raises a skeleton in another character's room. Fighters and Mages beat it; anyone else dies. ----
function startRaise(u,quiet){
 const tg=Object.values(U).filter(v=>v!==u&&freeU(v)&&cellX(v)===v.c&&cellY(v)===v.r);
 if(!tg.length)return false;
 const v=pick(tg);beginAct(u,'raise',quiet);u.dur=3.6;
 v.st='def';v.path=[];v.act=null;v.ev={};v.def={t:0,skel:{x:standBy(v,30),y:v.r*CELL+FY,blink:0},win:hasClass(v,'fighter')||hasClass(v,'mage')}; // Merchants can't fight it off
 return true;
}
function defending(v,dt){
 const d=v.def;if(!d){v.st='idle';return}d.t+=dt;const s=d.skel;if(s){if(s.blink>0)s.blink-=dt;if(Math.abs(s.x-v.x)>2)v.face=s.x>v.x?1:-1}
 const once=(n,t,f)=>{if(!v.ev[n]&&d.t>=t){v.ev[n]=1;f()}};
 once('a',.9,()=>{v.mood='shock';v.mt=.7;v.hop=.4});
 if(d.win){
  once('f',1.4,()=>{v.act=v.id==='knight'?'prac':v.id==='priest'?'smite':'magic';v.at=0});
  once('h1',2.2,()=>{if(s){s.blink=.4;poof(s.x,s.y-22,'#cfd6e0')}});
  once('h2',3,()=>{if(s){s.blink=.4;poof(s.x,s.y-22,'#cfd6e0')}});
  once('k',3.6,()=>{if(s){poof(s.x,s.y-20,'#e8e4d0');poof(s.x,s.y-8,'#e8e4d0')}d.skel=null;v.act=null;v.mood='happy';v.mt=1.5;v.hop=.5;gest(v,'both',.8)});
  once('e',4.2,()=>{v.def=null;v.st='idle';v.wait=2})}
 else{once('x',1.6,()=>{v.blink=.6;v.mood='hurt';v.mt=1});once('z',2.4,()=>kill(v))}
}
// ---- items on the Priest and Necromancer ----
function banish(u){beginAct(u,'banish');u.dur=4;u.ghost={x:standBy(u,32),y:u.y}}
function wings(u){beginAct(u,'sip');u.dur=1.3}
function nscroll(u){return startRaise(u,1)} // false = nobody to target (the scroll is kept); marks its own Compendium tile (nscroll)
function sniff(u){beginAct(u,'sniff');u.dur=2.6}
// ---- Death Knight: stands beside the Necromancer and follows him from room to room ----
function followNecro(u){
 const N=U.necromancer;u.wait=.6;if(!N)return; // no Necromancer: he just stands there
 const nr=cellY(N),nc=cellX(N),ur=cellY(u),uc=cellX(u);
 if(nr===ur&&nc===uc){// stand on the Necromancer's free side (away from whoever he is with)
  const o=N.target?U[N.target]:N.hosting?U[N.hosting]:null,lo=nc*CELL+14,hi=nc*CELL+82;let s=o?(o.x>N.x?-1:1):(u.x<N.x?-1:1),want=N.x+s*30;
  if(want<lo||want>hi){s=-s;want=N.x+s*30}want=cl(want,lo,hi);
  if(Math.abs(u.x-want)>6||Math.abs(u.y-(nr*CELL+FY))>2){u.st='walk';u.path=[{k:'walk',x:want,y:nr*CELL+FY,sp:30}]}return}
 u.st='walk';u.path=route(u,ur,uc,nr,nc,{x:cl(N.x-30,nc*CELL+14,nc*CELL+82),y:nr*CELL+FY});
}
// ---- sleep spell: no interactions or idles for SLEEP_TIME seconds; a potion wakes them early ----
function sleepUnit(v,time){
 if(v.target){const h=U[v.target];if(h&&h.hosting===v.id)freeHost(h);v.target=null}
 if(v.hosting){const w=U[v.hosting];if(w){w.target=null;toHome(w)}v.hosting=null}
 clearFx(v);v.path=[];v.tp=false;v.st='sleep';v.sleepT=time||SLEEP_TIME;v.mood='sleep';v.mt=0;v.gt=0;v.zT=0;v.al=1;v.sk=1;
}
function wakeUnit(v){v.st='idle';v.mood='happy';v.mt=1;v.hop=.4;v.wait=1.5;
 if(cellX(v)!==v.c||cellY(v)!==v.r){v.st='back';v.path=route(v,cellY(v),cellX(v),v.r,v.c,home(v))}} // asleep in someone else's room: walk home
function stepSleep(v,dt){v.sleepT-=dt;v.zT+=dt;if(v.zT>1.1){v.zT=0;parts.push({k:'z',x:v.x+v.face*8,y:v.y-46,t:0,life:1.6})}if(v.sleepT<=0)wakeUnit(v)}
function cast(w,k){markSeen('bolt');w.st='cast';w.tt=0;w.ev={};w.path=[];k.path=[];k.st='idle';k.wait=8;w.face=k.x>w.x?1:-1}
function casting(w,dt){
 const k=U.knight;if(!k||pairKind(w,k)!=='bolt'){w.st='idle';w.wait=1;return}
 w.tt+=dt*SCENE_PACE;const once=(n,t,f)=>{if(!w.ev[n]&&w.tt>=t){w.ev[n]=1;f()}};
 once('c',.4,()=>{w.hop=.5;w.mood='happy';w.mt=2});
 once('x',1,()=>{bolts.push(mkBolt(w,k));k.blink=.8;k.mood='hurt';k.mt=2});
 once('y',1.7,()=>{kill(k);w.st='idle';w.wait=3});
}

// ---------- items (drag from the item tray onto a room; the room's owner must be home) ----------
const ITEM_FX={scroll:{wizard:fireball,knight:goldGlow,priest:banish,necromancer:nscroll,merchant:monkeyfy,apothecary:apScroll,alchemist:alcScroll,rogue:rogueMage},
 potion:{wizard:potionTeleport,knight:flex,priest:wings,necromancer:sniff,merchant:backwards,apothecary:apPotion,alchemist:alcLuck,rogue:rogueSpook},artifact:{priest:relic,alchemist:alcArtifact,druid:(u)=>archdruid(u)},ingot:{}};
// (functions declared further down; filled in here once they exist)
Object.assign(ITEM_FX.scroll,{druid:(u)=>dScroll(u),blacksmith:(u)=>bScroll(u)});Object.assign(ITEM_FX.potion,{druid:(u)=>dPotion(u),blacksmith:(u)=>bPotion(u)});ITEM_FX.ingot['*']=(u)=>reinforce(u);
// Which Compendium tile each item effect lights up (the artifact on the Alchemist marks its own: stone or elixir)
const ITEM_KEY={scroll:{wizard:'fireball',knight:'glow',priest:'banish',necromancer:'nscroll',merchant:'monkey',apothecary:'appotion',alchemist:'alcscroll',rogue:'roguemage'},
 potion:{wizard:'teleport',knight:'flex',priest:'wings',necromancer:'sniff',merchant:'backwards',apothecary:'apcoins',alchemist:'alcpotion',rogue:'spook',druid:'dpotion'},artifact:{priest:'relic',alchemist:null},ingot:{'*':'reinforce'}};
ITEM_KEY.scroll.druid='dscroll';ITEM_KEY.artifact.druid='archdruid';ITEM_KEY.scroll.blacksmith='bscroll';ITEM_KEY.potion.blacksmith='bpotion';
// ---- items on the Alchemist ----
function alcLuck(u){u.luckT=ALC_LUCK_TIME;poof(u.x,u.y-24,'#f2c84a');u.hop=.5;u.mood='happy';u.mt=1.5;say(u,'Luck for my neighbors! For one minute.')}
function alcScroll(u){beginAct(u,'tear');u.dur=2.2;u.mood='shock';u.mt=.8;say(u,'What is this gibberish? *rip*')}
function alcArtifact(u){if(Math.random()<ODDS.stone){ // philosopher's stone: a random open space turns golden (coins there are doubled)
  const open=[];for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++)if(isOpen(r,c))open.push([r,c]);S.goldCell=pick(open);save();markSeen('stone');
  flashes.push({x:S.goldCell[1]*CELL,y:S.goldCell[0]*CELL,t:0,col:'255,210,60'});u.hop=.5;u.mood='happy';u.mt=2;say(u,"The philosopher's stone!");toast("A philosopher's stone! One space on the board is now golden: coins earned there are doubled.");return}
 beginAct(u,'retire');u.dur=3;say(u,'The elixir of life! I think... I shall retire.')} // 20%: elixir of life (secret)
// ---- items on the Rogue ----
function rogueMage(u){if(u.mageTag)return false;u.mageTag=true;setLabel(u);poof(u.x,u.y-24,'#c890ff');u.mood='happy';u.mt=1.5;say(u,'Ooh. Magic. I could get used to this.');save()}
function rogueSpook(u){const tg=Object.values(U).filter(v=>v!==u&&freeU(v));if(!tg.length)return false;
 const h=pick(tg);u.inv=true;u.tp=true;u.vk='spook';u.st='out';u.target=h.id;h.hosting=u.id;h.path=[];h.st='idle';h.act=null;
 u.path=[{k:'pause',w:.8},{k:'tele',x:standBy(h,30),y:h.r*CELL+FY,quiet:1}];poof(u.x,u.y-20,'#5a5a64')}
// Items are a counted inventory (S.inv). Using one takes it away; they are earned in the game (e.g. crafting).
function addItem(kind,n,x,y){S.inv[kind]=(S.inv[kind]||0)+n;showItems();save();if(x!=null)parts.push({k:'txt',s:'+'+n,x,y,t:0,life:1.6,icon:kind})}
function useItem(kind,r,c){
 if(!(S.inv[kind]>0))return;
 const u=U[at(r,c)],busy=['ascend','wcast','dance','storm','recruit','spirit','demon','fireball','flex','sip','horse','raise','banish','sniff','farmer','exorcise','sleepc','swapc'];
 const no=()=>poof(c*CELL+48,r*CELL+48,'#8a8a9a'); // nothing happens (and the item is kept)
 // A potion wakes anyone asleep from the Necromancer's spell, wherever they are (without its normal effect)
 if(kind==='potion'){const z=Object.values(U).find(v=>v.st==='sleep'&&cellX(v)===c&&cellY(v)===r);if(z){S.inv.potion--;showItems();save();poof(z.x,z.y-24,'#c890ff');wakeUnit(z);return}}
 const home=u&&u.form!=='dknight'&&u.form!=='bear'&&!u.target&&!u.hosting&&cellX(u)===u.c&&cellY(u)===u.r&&(u.st==='idle'||u.st==='walk'||(u.st==='act'&&!busy.includes(u.act)));
 // A spell scroll on the buried Druid's space revives him; nothing else works on him while he is buried
 if(u&&u.dead){if(kind!=='scroll'){no();return}S.inv.scroll--;showItems();revive(u);markSeen('drevive');save();return}
 const fx=u&&(ITEM_FX[kind][u.id]||ITEM_FX[kind]['*']); // '*' = works on anyone (the ingot)
 if(!home||!fx){no();return}
 u.act=null;u.path=[];u.after=null;u.mv=false;u.st='idle';u.wait=2;
 const res=fx(u);if(res===false){no();return}
 if(res!=='keep')S.inv[kind]--; // 'keep' = it happened, but you get the item back (the Blacksmith hands the potion back)
 showItems();markSeen(ITEM_KEY[kind][u.id]||ITEM_KEY[kind]['*']);save();
}
// ---- items on the Druid; the ingot on anyone ----
function dPotion(u){beginAct(u,'stash',1);u.dur=2.4}
function dScroll(u){beginAct(u,'storm',1);u.dur=5;gest(u,'both',2)}
function archdruid(u){if(u.arch)return false;beginAct(u,'ascend',1);u.dur=3} // artifact on the Druid: he becomes the Archdruid (once)
// ---- items on the Blacksmith: he hands a potion back; a spell scroll makes him dance for DANCE_TIME seconds ----
function bPotion(u){u.mood='mad';u.mt=1.2;gest(u,'fwd',1);say(u,'I do not drink that stuff. Here, have it back.');return 'keep'}
function bScroll(u){beginAct(u,'dance',1);u.dur=DANCE_TIME;u.mood='shock';u.mt=DANCE_TIME;poof(u.x,u.y-24,'#c890ff')}
function reinforce(u){if(hasClass(u,'fighter'))return false;u.reinforced=true;setLabel(u);poof(u.x,u.y-24,'#cfd6e0');poof(u.x,u.y-10,'#a8b0c0');u.mood='happy';u.mt=1.5;u.hop=.4;say(u,'Reinforced! I feel ready for a fight.');save()}
// The Blacksmith's shop: a steel ingot for INGOT_COST coins
function buyIngot(b){if((S.coins||0)<INGOT_COST){toast('An ingot is '+INGOT_COST+' coins. You have '+(S.coins||0)+'.');return}
 ask('Buy a steel ingot from the Blacksmith for '+INGOT_COST+' coins?','Buy',()=>{if(!U[b.id]||S.coins<INGOT_COST)return;spend(INGOT_COST);showCoins();save();
  parts.push({k:'txt',s:'-'+INGOT_COST,x:b.x-14,y:b.y-56,t:0,life:1.4,icon:'coin'});addItem('ingot',1,b.x+14,b.y-40);b.hop=.5;b.mood='happy';b.mt=1.2;gest(b,'fwd',.8);markSeen('ingotshop')})}
// Jagged lightning from caster a to target b (blk = the Necromancer's black lightning)
function mkZap(a,b,blk){const sx=a.x+a.face*14,sy=a.y-28,ex=b.x,ey=b.y-24,p=[[sx,sy]];for(let i=1;i<6;i++)p.push([lerp(sx,ex,i/6),lerp(sy,ey,i/6)+Math.random()*12-6]);p.push([ex,ey]);return{p,t:0,blk}}
// Scroll on the Wizard: a fireball destroys a random neighboring room and everyone in it
function fireball(u){
 const dirs=[[0,1],[0,-1],[1,0],[-1,0]].map(d=>[u.r+d[0],u.c+d[1]]).filter(q=>q[0]>=0&&q[0]<ROWS&&q[1]>=0&&q[1]<COLS);
 const occ=dirs.filter(q=>at(q[0],q[1])),q=pick(occ.length?occ:dirs);
 u.fb={r:q[0],c:q[1]};if(q[1]!==u.c)u.face=q[1]>u.c?1:-1;
 beginAct(u,'fireball');u.dur=1.8;u.mood='mad';u.mt=1.2;
}
function explode(f){
 flashes.push({x:f.c*CELL,y:f.r*CELL,t:0});
 ['#ff8020','#ffd040','#c03020','#ff6020'].forEach((col,i)=>poof(f.ex+(i%2?-12:12),f.ey+(i<2?-10:10),col));
 const owner=f.owner,inside=Object.values(U).filter(v=>v.id!==owner&&((v.r===f.r&&v.c===f.c)||(cellX(v)===f.c&&cellY(v)===f.r)));
 inside.sort((a,b)=>(a.r===f.r&&a.c===f.c)-(b.r===f.r&&b.c===f.c)); // visitors first, the room's owner last
 inside.forEach(v=>{if(U[v.id])kill(v)});
}
// Scroll on the Knight: his armor shines gold for 30 seconds
function goldGlow(u){u.glow=30;poof(u.x,u.y-22,'#f2d870');u.hop=.5;u.mood='happy';u.mt=1.5}
// Potion on the Knight: he drinks it and flexes
function flex(u){beginAct(u,'flex');u.dur=3.4;u.mood='happy';u.mt=3.4}
// Potion on the Wizard: drink, teleport to a random character anywhere, do an interaction, portal home
function potionTeleport(u){ // (uses up the potion even if nobody is free: he just sparkles)
 const tg=Object.values(U).filter(v=>v!==u&&freeU(v));
 if(!tg.length){beginAct(u,'sip');u.dur=1.3;return} // nobody to visit: just sparkles
 const h=pick(tg),dest=standBy(h,30);
 u.vk=pick(POTION_KINDS[h.id]||[null]);u.tp=true;u.drink=.8;gest(u,'up',.8);
 u.st='out';u.target=h.id;h.hosting=u.id;h.path=[];h.st='idle';h.act=null;
 u.path=[{k:'pause',w:.8},{k:'tele',x:dest,y:h.r*CELL+FY}];
}

// ---------- moving between rooms ----------
// Left/right: the Wizard uses a portal, everyone else the side door.
// Up/down: the ROOMS decide (TR in data.js): leave by this room's stairs, arrive by the other room's.
// Not next door (potion teleport): a pair of portals.
// Rooms without side doors, and a room's up/down exits (the Rogue's graveyard just fades)
const noSideDoor=id=>id==='farmer'||id==='druid'||(id==='rogue'&&graveyardOn(U.rogue));
const exitsOf=id=>id==='rogue'&&graveyardOn(U.rogue)?{up:'fade',down:'fade'}:TR[id];
function route(u,r1,c1,r2,c2,fin){
 const ra=at(r1,c1)||u.id,rb=at(r2,c2)||u.id,dc=c2-c1,dr=r2-r1;
 const F=(type,x,y)=>{const f={type,x,y,open:0,want:0,a:0,vis:false,keep:true};u.fxs.push(f);return f};
 if(u.tp||Math.abs(dc)+Math.abs(dr)!==1){
  const ax=cl(u.x+(u.x-c1*CELL<48?22:-22),c1*CELL+20,c1*CELL+76),ay=r1*CELL+FY,bx=c2*CELL+24,by=r2*CELL+FY,f1=F('portal',ax,ay),f2=F('portal',bx,by);
  return [{k:'walk',x:ax,y:ay,on:f1},{k:'vanish',f:f1,m:'portal'},{k:'appear',x:bx,y:by,f:f2,m:'portal'},{k:'walk',x:fin.x,y:fin.y,close:f2,off:f2}];
 }
 if(dc){const ty=u.id==='wizard'?'portal':'door';
  // The farm, the Druid's forest and the Rogue's graveyard have no side doors: just walk straight across the edge
  if(ty==='door'&&(noSideDoor(ra)||noSideDoor(rb))){const ex=(dc>0?c1+1:c1)*CELL,yy=r1*CELL+FY;return [{k:'walk',x:ex,y:yy},{k:'walk',x:ex+dc*20,y:yy},{k:'walk',x:fin.x,y:fin.y}]}
  if(ty==='door'){
   const ex=(dc>0?c1+1:c1)*CELL,yy=r1*CELL+FY,f=F('door',ex,yy);f.dir=dc;f.fancy=ra==='monarch'||rb==='monarch'; // the throne room has fancy doors
  
   return [{k:'walk',x:ex-dc*28,y:yy,on:f},{k:'wait',f,w:.5},{k:'walk',x:ex+dc*28,y:yy,sp:40},{k:'walk',x:fin.x,y:fin.y,close:f}];
  }
  const A={x:c1*CELL+(dc>0?CELL-24:24),y:r1*CELL+FY},Bp={x:c2*CELL+(dc>0?24:CELL-24),y:r2*CELL+FY},f1=F(ty,A.x,A.y),f2=F(ty,Bp.x,Bp.y);
  return [{k:'walk',x:A.x,y:A.y,on:f1},{k:'vanish',f:f1,m:ty},{k:'appear',x:Bp.x,y:Bp.y,f:f2,m:ty},{k:'walk',x:fin.x,y:fin.y,close:f2,off:f2}];
 }
 // sneak = the Rogue snatching a potion: he uses a ceiling hatch and rope or a floor trapdoor in both rooms
 const up=dr<0,out=u.sneak?(up?'rope':'trapdoor'):exitsOf(ra)[up?'up':'down'],inn=u.sneak?(up?'trapdoor':'rope'):exitsOf(rb)[up?'down':'up'],A=EXIT[out],Bx=EXIT[inn];
 const X1=c1*CELL+A.x,X2=c2*CELL+Bx.x,y1=r1*CELL,y2=r2*CELL,f1=F(out,X1,y1+A.y),f2=F(inn,X2,y2+Bx.y);
 return [{k:'walk',x:X1,y:y1+FY,on:f1},{k:'walk',x:X1,y:y1+A.ay,open:f1},{k:'vanish',f:f1,m:out},
  {k:'appear',x:X2,y:y2+Bx.ay,f:f2,m:inn},{k:'walk',x:X2,y:y2+FY,sp:34,close:f2},{k:'walk',x:fin.x,y:fin.y,off:f2}];
}
const isPair=(a,b)=>(a.id==='knight'&&b.id==='wizard')||(a.id==='wizard'&&b.id==='knight');
function decide(u){
 if(u.form==='dknight'){followNecro(u);return} // the Death Knight only follows the Necromancer
 if(u.form==='monkey'){monkeyAbout(u);return} // a monkey just monkeys around
 if(u.form==='bear'){if(cellX(u)!==u.c||cellY(u)!==u.r){goHome(u);return}u.st='walk';u.path=[{k:'walk',x:u.c*CELL+14+Math.random()*68,y:u.r*CELL+FY,sp:52}];u.wait=.15;return} // a bear runs around his room
 // Priest with four free neighbors: 5% he calls them all to a great prayer
 if(idOf(u)==='priest'&&Math.random()<ODDS.massPrayer){const n4=[[0,1],[0,-1],[1,0],[-1,0]].map(d=>U[at(u.r+d[0],u.c+d[1])]);if(n4.every(v=>v&&freeU(v))){startGather(u,n4);return}}
 // Secret: the Alchemist surrounded by four Mages, 10%: he gives one of them a potion (its usual effect)
 if(idOf(u)==='alchemist'&&!u.as&&!u.form&&Math.random()<ODDS.fourMage){const n4=[[0,1],[0,-1],[1,0],[-1,0]].map(d=>U[at(u.r+d[0],u.c+d[1])]);
  if(n4.every(v=>v&&hasClass(v,'mage'))){const f=n4.filter(v=>freeU(v)&&!v.as&&ITEM_FX.potion[v.id]);if(f.length){visit(u,pick(f),'fourmage');return}}}
 let P=(u.id==='knight'||u.id==='wizard')&&pairKind(U.wizard,U.knight)==='friend'?ODDS.visitFriend:ODDS.visit;
 if(idOf(u)==='knight'&&pairKind(U.priest,u)==='zeal')P*=1+ODDS.zeal; // Priest above the Knight: he visits 60% more
 if(idOf(u)!=='alchemist'&&hasClass(u,'mage')&&alcNext(u))P*=1+ODDS.alcMage; // a Mage next to the Alchemist visits 20% more
 if(wxOf(u)==='blizzard')P*=1-ODDS.blizzVisit; // the Druid's Blizzard: 30% fewer visits
 const rr=Math.random();
 if(rr>=P&&rr<P+ODDS.idle&&startAct(u))return;
 // The Druid never visits: he casts weather on a random space instead (when he can)
 if(rr<P&&idOf(u)==='druid'){if(!u.as&&startWeather(u))return;u.st='walk';u.path=[{k:'walk',x:u.c*CELL+16+Math.random()*64,y:u.r*CELL+FY}];return}
 if(rr<P&&!(u.sickT>0)){ // sick (poisoned wine): no neighbor scenes
  // Blacksmith with two or more free Fighter neighbors: 20% of his visits become an adventure (they leave for ADVENTURE_TIME)
  if(idOf(u)==='blacksmith'){const fs=recruitable(u);if(fs.length>=2&&Math.random()<ODDS.adventure){beginAct(u,'recruit');u.dur=3.4;u.recruits=fs.map(v=>v.id);fs.forEach(v=>{stopIdle(v);v.path=[];v.st='idle';v.wait=6});return}}
  // Priest and Necromancer are neighbors (any side) while a Death Knight exists: the Priest goes to cleanse him
  const DK=Object.values(U).find(v=>v.form==='dknight');
  if(DK&&(u.id==='priest'||u.id==='necromancer')&&U.priest&&U.necromancer&&rel(U.priest,U.necromancer)&&freeU(U.priest)&&freeU(U.necromancer)){visit(U.priest,U.necromancer,'cleanse');return}
  const opts=nbrs(u).filter(h=>pairKind(u,h)!=='none'); // 'none' pairs never visit each other
  if(opts.length){
   // Haste potions: a Fighter next to the Alchemist picks Mage neighbors 50% more often
   const hasted=hasClass(u,'fighter')&&alcNext(u),h=hasted?pickW(opts,v=>hasClass(v,'mage')?1+ODDS.haste:1):pick(opts);let kd=pairKind(u,h);
   if(hasted&&hasClass(h,'mage')){markSeen('haste');poof(u.x,u.y-34,'#7ae0ff')}
   // The Alchemist and any Mage (by tag): they talk about whether magic is useful
   if(!kd){const al=idOf(u)==='alchemist'?u:idOf(h)==='alchemist'?h:null,o=al===u?h:u;if(al&&!al.form&&hasClass(o,'mage'))kd='magictalk'}
   // Rogue + anyone, any side: 0.5% the Rogue turns assassin and kills them (not while disguised)
   const rg=u.id==='rogue'&&!u.as?u:h.id==='rogue'&&!h.as?h:null;
   if(rg&&luck(doom(ODDS.assassin,rg===u?h:u),u,h)){visit(rg,rg===u?h:u,'assassin');return}
   // Wizard + Necromancer, any side: 1% they make a scroll or a potion together
   if(((idOf(u)==='wizard'&&idOf(h)==='necromancer')||(idOf(u)==='necromancer'&&idOf(h)==='wizard'))&&luck(ODDS.forge,u,h)){visit(u,h,'forge');return}
   // Priest + a Fighter, any side: 5% the Priest tells him "You're braver than I."
   if(((idOf(u)==='priest'&&hasClass(h,'fighter'))||(idOf(h)==='priest'&&hasClass(u,'fighter')))&&luck(ODDS.braver,u,h)){visit(u,h,'braver');return}
   // Priest above the Knight: 2% they go on a holy crusade
   if(kd==='zeal'&&luck(ODDS.crusade,u,h)){visit(U.knight,U.priest,'crusade');return}
   const N=U.necromancer,special=Math.random()>=ODDS.hangout;
   // Necromancer left of the Knight: puts everyone to his right to sleep (cast from his own room)
   if(kd==='sleep'&&special){if(freeU(N)){beginAct(N,'sleepc');N.dur=2.4}else u.wait=1;return}
   // Necromancer below the Wizard: they swap rooms by magic
   if(kd==='swap'&&special){if(freeU(N)&&freeU(U.wizard)){beginAct(N,'swapc');N.dur=2;N.swapWith='wizard';beginAct(U.wizard,'swapc');U.wizard.dur=2}else u.wait=1;return}
   // Necromancer above the Knight: the Knight goes to him and becomes a Death Knight
   if(kd==='dknight'&&special){if(freeU(N)&&freeU(U.knight))visit(U.knight,N,'dknight');else u.wait=1;return}
   if(kd==='sleep'||kd==='swap'||kd==='dknight')kd=null; // the hangout case
   if(kd==='aboveW')kd=Math.random()<.5?'duel':'craft'; // Necromancer above the Wizard: 50/50
   if(kd==='appleshop')kd=Math.random()<ODDS.feast?'feast':'apple'; // Priest left of the Fruit Merchant: feast or apple (5% slip)
   // Merchant above the Priest: 50% he throws fruit down (from his own room), 50% sells him starfruit
   if(kd==='mabove'&&special){if(Math.random()<ODDS.fruitfall){const M=U.merchant,P=U.priest;if(freeU(M)&&freeU(P)){beginAct(M,'fruitdrop');M.dur=4;P.path=[];P.st='idle';P.wait=5}else u.wait=1;return}visit(u,h,'starfruit');return}
   // Merchant below the Priest: the Priest curses his fruit (from his own room)
   if(kd==='curse'&&special){const M=U.merchant,P=U.priest;if(freeU(M)&&freeU(P)&&!(M.rotT>0)){beginAct(P,'curse');P.dur=3;M.path=[];M.st='idle';M.wait=4}else u.wait=1;return}
   if(kd==='mabove'||kd==='curse')kd=null;
   // Necromancer above the Apothecary: his bats swarm out, some down into her shop (cast from his own room)
   if(kd==='bats'&&special){const A=U.apothecary;if(freeU(N)&&freeU(A)){beginAct(N,'bats');N.dur=5;N.batTo='apothecary';A.path=[];A.st='idle';A.wait=6}else u.wait=1;return}
   if(kd==='bats')kd=null;
   // Necromancer above / below / left of the Fruit Merchant: blood sacrifice, loud chanting, rotten fruit (cast from his own room)
   if((kd==='sacrifice'||kd==='chant'||kd==='nrot')&&special){const M=U.merchant;
    if(freeU(N)&&freeU(M)&&!(kd==='nrot'&&M.rotT>0)&&!(kd==='chant'&&M.crowd)){
     if(kd==='chant'){customerEnter(M);if(M.crowd)M.crowd[0].ttl=7}beginAct(N,kd);N.dur={sacrifice:4.2,chant:6,nrot:3}[kd];M.path=[];M.st='idle';M.wait=kd==='chant'?7:5}else u.wait=1;return}
   if(kd==='sacrifice'||kd==='chant'||kd==='nrot')kd=null;
   // Blacksmith scenes that depend on who is around
   if(kd==='smithk'&&Math.random()>=ODDS.smithtalk)kd='reforge'; // 40%: a new weapon for the Knight
   if(kd==='metal'){const Wz=idOf(u)==='wizard'?u:h,Bs=Wz===u?h:u,all4=[[0,1],[0,-1],[1,0],[-1,0]].every(d=>{const v=U[at(Bs.r+d[0],Bs.c+d[1])];return v&&hasClass(v,'mage')});kd=Wz.armor?'metaltalk':all4?'greenarmor':'metal'}
   if(kd==='holyfire'){const Bs=idOf(u)==='blacksmith'?u:h,K=U.knight;if(K&&!K.paladin&&!K.form&&!K.as&&rel(K,Bs))kd='paladin'} // secret: the Knight next to the Blacksmith too
   if(kd==='wabove')kd=Math.random()<ODDS.imp?'imp':'purplepot'; // Wizard above the Apothecary: 40% imp blood, 60% purple potion
   if(kd==='mtrade'&&luck(ODDS.farm,u,h))kd='farm'; // Merchant left of the Apothecary: 1.5% a farm appears
   if(kd==='zeal')markSeen('zeal');
   if(isPair(u,h)&&luck(ODDS.spar,u,h)){visit(u,h,'spar');return} // any arrangement
   const hang=Math.random()<ODDS.hangout;
   if(!hang&&kd&&kd!=='zeal'){
    if(kd==='bolt'){if(freeU(U.wizard)&&freeU(U.knight))cast(U.wizard,U.knight);else u.wait=1;return}
    // Eldritch Awakening: always the Knight who goes to the Wizard's room to read
    if(kd==='learn'){if(freeU(U.wizard)&&freeU(U.knight))visit(U.knight,U.wizard,'learn');else u.wait=1;return}
    // Out of lemons / a thief: always in the Fruit Merchant's shop, so the Knight is the one who visits
    if(kd==='lemons'||kd==='thief'){if(freeU(U.merchant)&&freeU(U.knight))visit(U.knight,U.merchant,kd);else u.wait=1;return}
    // Rogue scenes: the Rogue is always the one who visits (snatching a potion, he sneaks in through the ceiling or floor)
    if(ROGUE_SCENES.includes(kd)){const R=idOf(u)==='rogue'?u:h,o=R===u?h:u;if(freeU(R)&&freeU(o)){if(kd==='snatch')R.sneak=true;visit(R,o,kd)}else u.wait=1;return}
    // A blood orange: always the Necromancer who goes shopping
    if(kd==='bloodorange'){if(freeU(U.merchant)&&freeU(U.necromancer))visit(U.necromancer,U.merchant,kd);else u.wait=1;return}
    // Priest left of Knight: sometimes tentacles attack the Priest and the Knight comes to help
    if(kd==='sermon'&&luck(ODDS.tentacle,u,h)){if(freeU(U.priest)&&freeU(U.knight))visit(U.knight,U.priest,'tentacle');else u.wait=1;return}
    visit(u,h,kd);return}
   visit(u,h,null);return;
  }
 }
 u.st='walk';u.path=[{k:'walk',x:u.c*CELL+16+Math.random()*64,y:u.r*CELL+FY}];
}
function visit(u,h,vk){
 const hx=h.c*CELL,hy=h.r*CELL,dc=h.c-u.c;let dest=standBy(h,30,dc!==0?-dc:pick([-1,1])),ox=0; // beside the host, never on top of them
 // Orc fight: the orc appears on the far side of the room from the host; the knight stands between them
 if(vk==='orc'){const left=h.x<hx+48;ox=left?hx+84:hx+12;dest=ox+(left?-26:26);
  if(Math.abs(h.x-dest)<30)h.mvTo=left?hx+22:hx+74} // host steps aside so the Knight isn't on top of them
 if(vk==='spar')dest=standBy(h,36,dc!==0?-dc:pick([-1,1])); // a little more room to swing
 if(vk==='tentacle')dest=hx+46; // between the broken window and the Priest
 u.vk=vk;u.path=route(u,u.r,u.c,h.r,h.c,{x:dest,y:hy+FY});u.st='out';u.target=h.id;h.hosting=u.id;h.path=[];h.st='idle';h.act=null;
 if(h.mvTo){h.path=[{k:'walk',x:h.mvTo,y:hy+FY,sp:30}];h.mvTo=null}
 if(vk==='orc'){// the orc shows up first; the knight notices, then heads over
  u.orc={x:ox,y:hy+FY,blink:0};poof(ox,u.orc.y-20,'#6a9a3a');
  u.mood='shock';u.mt=.8;u.face=h.c>u.c?1:h.c<u.c?-1:u.face;u.path.unshift({k:'pause',w:.9})}
 if(vk==='tentacle'){// tentacles smash through the Priest's window; the Knight glares, then runs over
  u.tent={bx:hx,by:hy,t:0,blink:0,out:null};['#c04040','#3a6ad0','#d0b030','#c890ff'].forEach((col,i)=>poof(hx+WIN_C.x+(i%2?-8:8),hy+WIN_C.y+(i<2?-8:8),col));
  h.mood='shock';h.mt=2.5;h.hop=.5;h.path=[{k:'walk',x:hx+80,y:hy+FY,sp:44}]; // the Priest scurries away from the window
  u.mood='shock';u.mt=.8;u.face=h.c>u.c?1:-1;u.path.unshift({k:'pause',w:.9})}
}
// ---- Rogue disguise: for ROGUE_DISGUISE_TIME he looks, acts and is treated as another character (his own box stays his) ----
function disguise(u,t){u.as=t.id;u.asSprite=sid(t);u.asWeapon=u.weapon;u.weapon=t.weapon||null;u.disguiseT=ROGUE_DISGUISE_TIME;markSeen('disguise');
 poof(u.x,u.y-24,'#8a8a9a');poof(u.x,u.y-10,'#5a5a64');setLabel(u);u.st='idle';u.wait=1}
function undisguise(u){if(!u.as)return;u.as=null;u.asSprite=null;u.weapon=u.asWeapon||null;u.form=null;u.disguiseT=0;poof(u.x,u.y-24,'#8a8a9a');setLabel(u);say(u,'Did you miss me?')}
// Priest + Apothecary studying: show one hidden easter egg in the Compendium (not counted as found: no gold border)
function revealSecret(msg){const hid=EGGS.filter(k=>!S.seen[k]&&!S.revealed[k]);if(!hid.length)return false;S.revealed[pick(hid)]=1;save();toast(msg||'Their studies uncovered a clue! A secret is now shown in the Compendium.');return true}
// Secret: the mad scientist turns into a beast-man and goes after neighbor h (talk 'beast')
function beastOut(u,h){u.form='beast';u.beastT=30;setLabel(u);poof(u.x,u.y-24,'#7aff7a');poof(u.x,u.y-10,'#6a5a4a');u.mood='mad';u.mt=3;say(u,'The formula... it is WORKING!');
 visit(u,h,'beast');u.path.unshift({k:'pause',w:1})}
// Back from the dungeon (Rogue above the Knight): coins, an artifact, scrolls, potions, or a secret shown in the Compendium
function dungeonLoot(v){const r=Math.random(),D=ODDS.dungeon;let s;
 if(r<D.coins){addCoins(DUNGEON_GOLD,v.x,v.y-50);s='Fifty gold coins!'}
 else if(r<D.coins+D.artifact){addItem('artifact',1,v.x,v.y-50);s='An artifact!'}
 else if(r<D.coins+D.artifact+D.scrolls){addItem('scroll',2,v.x,v.y-50);s='Two spell scrolls!'}
 else if(r<D.coins+D.artifact+D.scrolls+D.potions){addItem('potion',3,v.x,v.y-50);s='Three potions!'}
 else if(revealSecret('An old map from the dungeon! A secret is now shown in the Compendium.'))s='An old map... with a secret on it!';
 else{addCoins(DUNGEON_GOLD,v.x,v.y-50);s='Fifty gold coins!'}
 say(v,'Back from the dungeon! '+s)}
function arrive(u){u.inv=false;
 if(u.st==='out'){u.st='talk';u.tt=0;u.ev={};u.kind=u.vk;u.sc2=null;u.doom=null;u.ritEnd=null;markSeen(u.vk);return}
 if(u.st==='gather'){u.st='gathered';return} // arrived for the great prayer
 u.tp=false;u.sneak=false;
 // Home from buying poison: he gives the poisoned wine to another free neighbor
 if(u.thenVisit){const q=u.thenVisit;u.thenVisit=null;const o=nbrs(u).filter(v=>v.id!==q.not);if(o.length){visit(u,pick(o),q.kind);return}say(u,'Nobody to share my wine with. Pity.')}
 if(u.after){const a=u.after;u.after=null;beginAct(u,a);return}
 u.st='idle';u.wait=u.form==='dknight'?.3:2+Math.random()*3;
}
const fin=u=>{u.path.shift();if(!u.path.length)arrive(u)};
const FIXED={backdoor:1,backdoorL:1,royaldoor:1,shelf:1,rope:1,trapdoor:1}; // exits that are part of the room: they close instead of disappearing
function run(u,dt){
 const s=u.path[0];
 if(!s.b){s.b=1;s.t=0;s.y0=u.y;if(s.on)show(s.on);if(s.open)s.open.want=1;if(s.close){s.close.want=0;s.close.closing=true}if(s.k==='wait'){show(s.f);s.f.want=1}
  if(s.k==='vanish')s.f.want=1;
  if(s.k==='appear'){u.x=s.x;u.y=s.y;u.al=0;show(s.f);s.f.want=1}
  if(s.k==='tele'){if(!s.quiet)poof(u.x,u.y-20,'#c890ff');u.x=s.x;u.y=s.y;if(!s.quiet)poof(u.x,u.y-20,'#c890ff')}} // quiet = the invisible Rogue: no puff
 if(s.k==='tele')fin(u);
 else if(s.k==='wait'||s.k==='pause'){s.t+=dt;if(s.t>=s.w)fin(u)}
 else if(s.k==='vanish'){s.t+=dt;const p=cl((s.t-.25)/.35,0,1);u.al=1-p;u.sk=1-.4*p;
  if(s.m==='rope'){u.y=s.y0-p*26;u.sk=1}if(s.m==='trapdoor'){u.y=s.y0+p*14;u.sk=1} // climb up the rope / drop through the trapdoor
  if(s.t>=.65){u.al=0;s.f.want=0;if(FIXED[s.f.type])s.f.closing=true;else hide(s.f);fin(u)}}
 else if(s.k==='appear'){s.t+=dt;const p=cl((s.t-.25)/.35,0,1);u.al=p;u.sk=.6+.4*p;
  if(s.m==='rope'){u.y=s.y-(1-p)*26;u.sk=1}if(s.m==='trapdoor'){u.y=s.y+(1-p)*14;u.sk=1}if(s.t>=.65){u.al=1;u.sk=1;fin(u)}}
 else{const dx=s.x-u.x,dy=s.y-u.y,d=Math.hypot(dx,dy),sp=(s.sp||(u.st==='walk'?20:34))*dt*(u.tinyT>0?1.7:1); // the tiny Rogue is fast
  if(Math.abs(dx)>.5)u.face=dx>0?1:-1;u.t+=dt;
  if(d<=sp){u.x=s.x;u.y=s.y;if(s.dust)poof(u.x,u.y-3);if(s.off)hide(s.off);fin(u)}else{u.x+=dx/d*sp;u.y+=dy/d*sp}}
}

// ---------- interactions (the visitor u runs the show in the host h's room) ----------
function talk(u,dt){
 const h=U[u.target];if(!h){toHome(u);return}
 u.tt+=dt*SCENE_PACE;if(Math.abs(h.x-u.x)>2)u.face=h.x>u.x?1:-1; // only turn when clearly to one side (stops flip-flopping)
 const pp={[idOf(u)]:u,[idOf(h)]:h},K=pp.knight,Wz=pp.wizard,Pr=pp.priest,N=pp.necromancer,Fi=hasClass(u,'fighter')?u:hasClass(h,'fighter')?h:null;
 const need={friend:K&&Wz,learn:K&&Wz,chat:K&&Wz,spar:K&&Wz,study:Pr&&Wz,gossip:Pr&&Wz,undead:Pr&&Wz,light:Pr&&Wz,pray:Pr&&K,bless:Pr&&K,sermon:Pr&&K,tentacle:Pr&&K,
  dknight:N&&K,horde:N&&K,nchat:N&&K,purge:N&&Pr,debate:N&&Pr,duel:N&&Wz,craft:N&&Wz,golem:N&&Wz,tomes:N&&Wz,forge:N&&Wz,crusade:Pr&&K,cleanse:Pr&&N,apple:Pr&&pp.merchant,feast:Pr&&pp.merchant,
  starfruit:Pr&&pp.merchant,banana:Wz&&pp.merchant,durian:Wz&&pp.merchant,jokes:Wz&&pp.merchant,advertW:Wz&&pp.merchant,
  apgift:pp.apothecary&&pp.merchant,mtrade:pp.apothecary&&pp.merchant,farm:pp.apothecary&&pp.merchant,
  braver:Pr&&Fi,goldapple:pp.apothecary&&pp.merchant,business:pp.apothecary&&pp.merchant,
  thief:K&&pp.merchant,lemons:K&&pp.merchant,greenapple:K&&pp.merchant,rumors:K&&pp.merchant,
  bear:K&&pp.apothecary,kgossip:K&&pp.apothecary,kdate:K&&pp.apothecary,bees:K&&pp.apothecary,
  cobrew:Wz&&pp.apothecary,boom:Wz&&pp.apothecary,wdate:Wz&&pp.apothecary,imp:Wz&&pp.apothecary,purplepot:Wz&&pp.apothecary,
  plant:Pr&&pp.apothecary,pstudy:Pr&&pp.apothecary,psleep:Pr&&pp.apothecary,heal:Pr&&pp.apothecary,
  yell:N&&pp.merchant,bloodorange:N&&pp.merchant,ntrade:N&&pp.apothecary,ritual:N&&pp.apothecary};
 const k=u.kind in need?(need[u.kind]?u.kind:null):u.kind,once=(n,t,f)=>{if(!u.ev[n]&&u.tt>=t){u.ev[n]=1;f()}};let end=3.4;
 // speakers: who (one speaker for every line), else the character in this scene with that id (pp, e.g. pp.mage), else that character on the board
 const lines=(sc,who)=>{end=sc.length*2.3+.8;sc.forEach((l,i)=>once('l'+i,.6+i*2.3,()=>{const s=who||pp[l[0]]||U[l[0]];if(s){say(s,who?l:l[1]);gest(s,'fwd',1.2)}}))};
 const R=pp.rogue,Al=pp.alchemist,Ap=pp.apothecary,Mr=pp.merchant,hx=h.c*CELL,hy=h.r*CELL;
 if(k==='friend'){
  once('a',.4,()=>{u.mood=h.mood='happy';u.mt=h.mt=3;hearts(u);hearts(h);gest(u,'both',.8);gest(h,'both',.8)});
  once('b',1.5,()=>{hearts(u);hearts(h);gest(u,'up',.5);gest(h,'up',.5)})}
 else if(k==='chat')lines(u.sc2||(u.sc2=pick(TALK)));
 else if(k==='learn'){end=4.6;// the Wizard hands over a spellbook; reading it turns the Knight eldritch
  once('a',.3,()=>{Wz.hop=.5;Wz.mood='happy';Wz.mt=2;gest(Wz,'fwd',.9)});
  once('b',.9,()=>{K.act='tome';K.at=0});
  once('z',2.8,()=>{K.form='eknight';setLabel(K);K.mood='happy';K.mt=2;poof(K.x,K.y-20,'#c890ff');gest(Wz,'both',.8);save()});
  once('y',3.4,()=>{K.act=null;K.hop=.5;gest(K,'both',.8)})}
 else if(k==='spar'){end=4.6;// friendly sparring: weapon vs magic; the Wizard raises a magic shield that blocks the Knight's hit
  once('s1',.3,()=>{K.act='prac';K.at=0;Wz.act='magic';Wz.at=0;Wz.ward=0});
  once('s2',1.5,()=>{poof(K.x,K.y-22,'#4fb0ff');K.blink=.4});
  once('s3',2.6,()=>{poof(Wz.x+(K.x>Wz.x?16:-16),Wz.y-24,'#bfe8ff');Wz.wardHit=.4});
  once('s4',3.6,()=>{K.act=Wz.act=null;Wz.ward=null;K.mood=Wz.mood='happy';K.mt=Wz.mt=1.5;K.hop=Wz.hop=.5;gest(K,'both',.8);gest(Wz,'both',.8)})}
 else if(k==='orc'){end=4.6;if(u.orc)u.face=u.orc.x>u.x?1:-1;
  once('o2',.5,()=>{u.act='prac';u.at=0});
  once('o3',1.2,()=>{if(u.orc)u.orc.blink=.5});
  once('o4',2,()=>{u.blink=.5;u.mood='hurt';u.mt=.7});
  once('o5',2.6,()=>{if(u.orc)u.orc.blink=.5});
  once('o6',3.5,()=>{if(u.orc){poof(u.orc.x,u.y-20,'#6a9a3a');u.orc=null}u.act=null;u.mood='happy';u.mt=1.5;h.hop=.5;h.mood='happy';h.mt=1.5;gest(u,'both',.9);gest(h,'both',.9)})}
 else if(k==='study'){end=5.4;// Priest reads his holy book, Wizard his spellbook, side by side
  once('s1',.3,()=>{Pr.act='holy';Pr.at=0;Wz.act='read';Wz.at=0});
  once('s2',2.6,()=>{Wz.hop=.3;Pr.hop=.3});
  once('s3',4.4,()=>{Pr.act=Wz.act=null;Pr.mood=Wz.mood='happy';Pr.mt=Wz.mt=1.5})}
 else if(k==='gossip'){lines(u.sc2||(u.sc2=pick(GOSSIP)));
  once('g',end-.6,()=>{u.hop=h.hop=.4;u.mood=h.mood='happy';u.mt=h.mt=1.2})}
 else if(k==='undead'){end=5.4;// they summon a skeleton by accident, then destroy it together
  if(u.und&&u.tt>1.8)u.face=u.und.x>u.x?1:-1;
  once('u1',.3,()=>{gest(Wz,'fwd',1.2);gest(Pr,'fwd',1.2)});
  once('u2',.8,()=>{const hx=h.c*CELL,mid=(u.x+h.x)/2-hx;u.und={x:hx+(mid<48?80:16),y:h.r*CELL+FY,t:0,blink:0};poof(u.und.x,u.und.y-6,'#7aff7a')});
  once('u3',1.8,()=>{Wz.hop=Pr.hop=.5;Wz.mood=Pr.mood='shock';Wz.mt=Pr.mt=.8;Wz.act='magic';Wz.at=0;Pr.act='smite';Pr.at=0});
  once('u4',2.6,()=>{if(u.und){u.und.blink=.4;poof(u.und.x,u.und.y-22,'#4fb0ff')}});
  once('u5',3.3,()=>{if(u.und){u.und.blink=.4;poof(u.und.x,u.und.y-22,'#f2d870')}});
  once('u6',4,()=>{if(u.und){poof(u.und.x,u.und.y-20,'#e8e4d0');poof(u.und.x,u.und.y-8,'#e8e4d0');u.und=null}Wz.act=Pr.act=null;Wz.mood=Pr.mood='happy';Wz.mt=Pr.mt=1.5;gest(Wz,'both',.8);gest(Pr,'both',.8)})}
 else if(k==='light'){end=5.2;// holy light so bright the Wizard snuffs it with darkness
  once('l1',.3,()=>{gest(Pr,'both',2.6);u.lite=0});
  once('l2',1.3,()=>{Wz.mood='mad';Wz.mt=2.4});
  once('l3',1.9,()=>{gest(Wz,'up',1.6);u.dark=0});
  once('l4',3.6,()=>{Wz.mood='happy';Wz.mt=1.5;Pr.mood='hurt';Pr.mt=1});
  once('l5',4.2,()=>{u.lite=u.dark=null})}
 else if(k==='pray'){end=5;// both kneel and pray
  once('p1',.4,()=>{u.kneel=h.kneel=true});
  once('p2',1.3,()=>poof(u.x,u.y-40,'#f2d870'));once('p3',2.3,()=>poof(h.x,h.y-40,'#f2d870'));once('p4',3.2,()=>{poof(u.x,u.y-40,'#f2d870');poof(h.x,h.y-40,'#f2d870')});
  once('p5',3.9,()=>{u.kneel=h.kneel=false;u.mood=h.mood='happy';u.mt=h.mt=1.5;u.hop=h.hop=.5})}
 else if(k==='bless'){end=4.6;// the Priest sprinkles holy water on the Knight
  once('b1',.3,()=>{Pr.act='sprinkle';Pr.at=0});
  for(let i=0;i<9;i++)once('d'+i,.7+i*.2,()=>{for(let j=0;j<2;j++)parts.push({k:'drop',x:Pr.x+Pr.face*14,y:Pr.y-34,vx:(K.x-Pr.x)*1.6+(Math.random()-.5)*30,vy:-80-Math.random()*30,t:0,life:.8})});
  once('b2',2.7,()=>{poof(K.x,K.y-24,'#f2d870');K.mood='happy';K.mt=1.5;K.hop=.5;gest(K,'both',.8)});
  once('b3',3.3,()=>{Pr.act=null;Pr.mood='happy';Pr.mt=1.2})}
 else if(k==='sermon'){const pr=u.sc2||(u.sc2=pick(PRAYERS));lines(pr,Pr);end+=.4;// a short prayer; the Knight listens, hands together, nodding
  once('k0',.2,()=>gest(K,'pray',end-.8));
  pr.forEach((l,i)=>once('n'+i,1.9+i*2.3,()=>{K.hop=.25}));
  once('e',end-.7,()=>{K.mood=Pr.mood='happy';K.mt=Pr.mt=1.2})}
 else if(k==='tentacle'){end=4.8;if(u.tent)u.face=u.tent.bx+WIN_C.x>u.x?1:-1;// the Knight fights off the tentacles
  once('t2',.4,()=>{u.act='prac';u.at=0});
  once('t3',1.2,()=>{if(u.tent)u.tent.blink=.5});
  once('t4',2,()=>{u.blink=.5;u.mood='hurt';u.mt=.7});
  once('t5',2.6,()=>{if(u.tent)u.tent.blink=.5});
  once('t6',3.4,()=>{if(u.tent)u.tent.out=0;u.act=null});
  once('t7',4,()=>{if(u.tent){poof(u.tent.bx+WIN_C.x,u.tent.by+WIN_C.y,'#c890ff');poof(u.tent.bx+WIN_C.x,u.tent.by+WIN_C.y,'#d0b030')}u.tent=null;u.mood=h.mood='happy';u.mt=h.mt=1.5;gest(u,'both',.9);gest(h,'both',.9);h.hop=.5})}
 // ---------- Necromancer + Knight ----------
 else if(k==='dknight'){end=4.2;// the Knight is turned into a Death Knight; he then stays with the Necromancer
  once('a',.3,()=>{N.act='raise';N.at=0;gest(N,'both',1.8)});
  once('b',1,()=>{K.mood='shock';K.mt=1.2});
  once('c',1.8,()=>{K.blink=.6;poof(K.x,K.y-24,'#7aff7a')});
  once('d',2.4,()=>{K.form='dknight';K.glow=0;setLabel(K);poof(K.x,K.y-20,'#3ac85a');poof(K.x,K.y-34,'#1a1a22');N.act=null;N.mood='happy';N.mt=1.5;save()})}
 else if(k==='horde'){end=6.6;let dead=false;// waves of skeletons; 5% the Knight falls
  const mob=u.mobs&&u.mobs[0];if(mob&&K&&Math.abs(mob.x-K.x)>2)K.face=mob.x>K.x?1:-1;
  once('r',.3,()=>{N.act='raise';N.at=0;u.mobs=[];u.doom=Math.random()<doom(.05,K)});
  for(let i=0;i<3;i++){const b=.6+i*1.7;
   once('m'+i,b,()=>{const s=K.x>N.x?1:-1,hx=h.c*CELL;let x=K.x+s*28;if(x<hx+14||x>hx+82)x=K.x-s*28;x=cl(x,hx+14,hx+82);u.mobs.push({id:'skeleton',x,y:h.r*CELL+FY,t:0,blink:0,face:x>K.x?-1:1})});
   once('f'+i,b+.5,()=>{K.act='prac';K.at=0});
   once('x'+i,b+1,()=>{const m=u.mobs&&u.mobs[0];if(m){m.blink=.4;poof(m.x,m.y-22,'#cfd6e0')}});
   if(i===2&&u.doom){once('dd',b+1.2,()=>{K.act=null;K.blink=.6;K.mood='hurt';K.mt=2});once('dk',b+1.7,()=>{dead=true})}
   else once('k'+i,b+1.4,()=>{const m=u.mobs&&u.mobs.shift();if(m){poof(m.x,m.y-20,'#e8e4d0');poof(m.x,m.y-8,'#e8e4d0')}})}
  once('e',5.8,()=>{N.act=null;K.act=null;K.mood='happy';K.mt=1.5;K.hop=.5;gest(K,'both',.9)});
  if(dead){N.act=null;u.mobs=null;kill(K);return}}
 else if(k==='nchat')lines(u.sc2||(u.sc2=pick(NECRO_TALK)));
 // ---------- Necromancer + Priest ----------
 else if(k==='purge'){end=6.2;// the Necromancer raises ghosts or zombies; the Priest destroys them with holy light
  once('r',.3,()=>{N.act='raise';N.at=0;u.mobs=[];u.ptype=Math.random()<.7?'ghost':'zombie'});
  once('sp',.6,()=>{// spread the three spots over the free floor (away from both characters)
   const hx=h.c*CELL,free=[];for(let x=hx+12;x<=hx+84;x+=6)if(Math.abs(x-Pr.x)>=20&&Math.abs(x-N.x)>=20)free.push(x);
   u.spots=free.length>=3?[free[0],free[Math.floor(free.length/2)],free[free.length-1]]:[hx+14,hx+48,hx+82]});
  for(let i=0;i<3;i++)once('m'+i,.7+i*.2,()=>{const x=u.spots[i];u.mobs.push({id:u.ptype,x,y:h.r*CELL+FY-(u.ptype==='ghost'?i*6:0),t:0,blink:0,face:x>Pr.x?-1:1})});
  once('a',1.6,()=>{Pr.mood='shock';Pr.mt=.6;N.act=null});
  once('s',1.9,()=>{Pr.act='smite';Pr.at=0});
  for(let i=0;i<3;i++){once('b'+i,2.1+i*1.1,()=>{const m=u.mobs[i];if(m){u.beam={x:m.x,y:m.y-24,t:0};m.blink=.5;gest(Pr,'up',.8)}});
   once('c'+i,2.7+i*1.1,()=>{const m=u.mobs[i];if(m){m.gone=true;poof(m.x,m.y-20,'#f2d870')}})}
  once('e',5.5,()=>{Pr.act=null;u.mobs=null;Pr.mood=N.mood='happy';Pr.mt=N.mt=1.5;gest(Pr,'both',.8)})}
 else if(k==='debate'){lines(u.sc2||(u.sc2=pick(DEBATE)));// they argue holy vs unholy, getting cross
  once('m',.4,()=>{Pr.mood=N.mood='mad';Pr.mt=N.mt=end});
  once('p',1,()=>{Pr.act='smite';Pr.at=0});once('n',3.3,()=>{Pr.act=null;N.act='raise';N.at=0});once('q',end-1,()=>{N.act=null})}
 // ---------- Necromancer + Wizard ----------
 else if(k==='duel'){end=6;// black lightning vs blue lightning; they really dislike each other
  once('m',.3,()=>{N.mood=Wz.mood='mad';N.mt=Wz.mt=5.6});
  [[1,N,Wz,1],[1.8,Wz,N,0],[2.6,N,Wz,1],[3.4,Wz,N,0]].forEach((q,i)=>once('z'+i,q[0],()=>{gest(q[1],'fwd',.5);zaps.push(mkZap(q[1],q[2],q[3]));q[2].blink=.3;poof(q[2].x,q[2].y-24,q[3]?'#a070e0':'#4fb0ff')}));
  once('e',4,()=>say(N,pick(['Your lightning is pathetic.','Is that all? My grandmother zaps harder.','Blue lightning. How childish.'])));
  once('f',4.9,()=>say(Wz,pick(['At least mine is visible in the dark!','Black lightning is just lightning with no talent.','Hmph. Get out of my sight.'])))}
 else if(k==='craft'){end=5.2;// spend SCROLL_COST coins for a spell scroll; too poor = show off a spell instead
  once('0',.2,()=>{u.cok=(S.coins||0)>=SCROLL_COST;if(!u.cok)u.alt=Math.random()<.5?'frost':'darkorb'});
  if(u.cok){once('a',.5,()=>{gest(Wz,'fwd',2.4);gest(N,'fwd',2.4);u.made={x:(u.x+h.x)/2,y:u.y-40,t:0}});
   // coins are only spent at the moment the scroll is made (so an interrupted craft costs nothing)
   once('b',3.2,()=>{if(u.made&&S.coins>=SCROLL_COST){spend(SCROLL_COST);showCoins();parts.push({k:'txt',s:'-'+SCROLL_COST,x:u.made.x-14,y:u.made.y-30,t:0,life:1.4,icon:'coin'});addItem('scroll',1,u.made.x+14,u.made.y-10)}
    u.made=null;Wz.mood=N.mood='happy';Wz.mt=N.mt=1.5;Wz.hop=N.hop=.5})}
  else if(u.alt==='frost'){once('s',.5,()=>say(Wz,'No gold for a scroll... but watch this!'));once('f',1.6,()=>{Wz.act='frost';Wz.at=0});once('g',2.4,()=>{N.mood='shock';N.mt=1});once('h',4.2,()=>{Wz.act=null;N.mood='happy';N.mt=1.2;N.hop=.4})}
  else if(u.alt==='darkorb'){once('s',.5,()=>say(N,'Too poor for scrolls. Behold!'));once('f',1.6,()=>{N.act='darkorb';N.at=0});once('g',2.4,()=>{Wz.mood='shock';Wz.mt=1});once('h',4.2,()=>{N.act=null;Wz.mood='happy';Wz.mt=1.2;Wz.hop=.4})}}
 else if(k==='golem'){end=5.6;// a clay golem rises, charges through the back wall and escapes
  once('a',.4,()=>{gest(Wz,'fwd',1.2);gest(N,'fwd',1.2)});
  once('b',.9,()=>{const hx=h.c*CELL,mx=cl((u.x+h.x)/2,hx+20,hx+76);u.mobs=[{id:'golem',x:mx,sx:mx,y:h.r*CELL+FY,t:0,blink:0,face:1,sc:1.35}];poof(mx,h.r*CELL+FY-10,'#a8744a')});
  once('c',1.9,()=>{u.mood=h.mood='shock';u.mt=h.mt=1.6});
  if(u.mobs&&u.mobs[0]&&u.tt>2.4&&u.tt<3){const m=u.mobs[0],q=(u.tt-2.4)/.6,by=h.r*CELL;m.x=lerp(m.sx,h.c*CELL+48,q);m.y=lerp(by+FY,by+68,q);m.sc=1.35*(1-.35*q);m.face=-1}
  once('d',3,()=>{const hx=h.c*CELL,by=h.r*CELL;holes.push({x:hx+48,y:by+44,t:0});['#a8744a','#8a5a34','#3a3a4a'].forEach((col,i)=>poof(hx+48+(i-1)*10,by+44,col));u.mobs=null});
  once('e',4.2,()=>{u.mood=h.mood='happy';u.mt=h.mt=1})}
 else if(k==='tomes'){end=5.4;// reading their tomes side by side
  once('a',.3,()=>{Wz.act='tome';Wz.at=0;N.act='nread';N.at=0});
  once('b',4.4,()=>{Wz.act=N.act=null;Wz.mood=N.mood='happy';Wz.mt=N.mt=1.2})}
 // ---------- Fruit Merchant ----------
 else if(k==='sell'){end=3.6;const Mr=pp.merchant||u;// he brings apples next door and sells them
  once('a',.4,()=>{gest(Mr,'fwd',1.2);u.show={icon:'apple',x:Mr.x+Mr.face*14,y:Mr.y-26}});
  once('b',1.3,()=>{if(u.show){u.show.x=h.x+(Mr.x>h.x?8:-8);u.show.y=h.y-26}h.hop=.4;h.mood='happy';h.mt=1.5;gest(h,'fwd',.6)});
  once('c',1.8,()=>{u.show=null;merchantGain(SELL_GAIN,Mr.x,Mr.y-50)})}
 else if(k==='apple'){end=4.4;const Mr=pp.merchant;let dead=false;// he drops an apple: the Priest buys it (95%) or slips on it (5%)
  once('0',.1,()=>{u.slip=Math.random()<doom(ODDS.slip,Pr)});
  once('a',.3,()=>say(Mr,'Fresh apple? Only one coin!'));
  once('b',1,()=>{u.show={icon:'apple',x:Pr.x+(Mr.x>Pr.x?9:-9),y:Pr.y-3};gest(Mr,'fwd',.5)});
  if(u.slip){once('s1',1.7,()=>{Pr.hop=.35;Pr.mood='shock';Pr.mt=1});once('s2',2.1,()=>{Pr.fall=true;Pr.mood='hurt';Pr.mt=3;Mr.mood='shock';Mr.mt=2;u.show=null;markSeen('slip')});once('s3',2.9,()=>{dead=true})}
  else{once('p1',1.8,()=>{u.show=null;gest(Pr,'fwd',.8);Pr.mood='happy';Pr.mt=1.5});once('p2',2.4,()=>{merchantGain(APPLE_GAIN,Mr.x,Mr.y-50);Mr.hop=.4})}
  if(dead){Pr.fall=false;kill(Pr);return}}
 else if(k==='feast'){end=8;const Mr=pp.merchant;// the Merchant sets up a feast; nobles come to join
  once('a',.3,()=>{u.feastHost=h.id;say(Mr,'A feast for the house of light!');gest(Mr,'both',.8)});
  once('t',.7,()=>{u.table={x:h.c*CELL+48,y:h.r*CELL+93,t:0};poof(h.c*CELL+48,h.r*CELL+66,'#f2d870')});
  once('n',1.1,()=>feastEnter(u,h));
  for(let i=0;i<5;i++)once('e'+i,2.4+i*.7,()=>{const all=[Pr,Mr,...(u.crowd||[])],p=all[i%all.length];if(p){p.hop=.35;p.mood='happy';if(p.mt!=null)p.mt=1}});
  once('l',5.8,()=>crowdLeave(u));
  once('x',7.2,()=>{u.table=null})}
 else if(k==='starfruit'){end=4;const Mr=pp.merchant;// Merchant above the Priest: he sells the cleric a starfruit
  once('a',.3,()=>{say(Mr,'A starfruit, fit for a saint!');gest(Mr,'fwd',1.4);u.show={icon:'starfruit',x:Mr.x+Mr.face*14,y:Mr.y-26}});
  once('b',1.6,()=>{if(u.show){u.show.x=Pr.x+(Mr.x>Pr.x?8:-8)}Pr.mood='happy';Pr.mt=1.5;Pr.hop=.4});
  once('c',2.2,()=>{u.show=null;merchantGain(STARFRUIT_GAIN,Mr.x,Mr.y-50)})}
 // ---------- Fruit Merchant + Wizard ----------
 else if(k==='banana'){end=5.4;const Mr=pp.merchant;// Merchant above the Wizard: the Wizard magics a banana into a giant one
  once('a',.3,()=>{say(Mr,'Can you make it... bigger?');u.big={x:(u.x+h.x)/2,y:h.r*CELL+FY,s:1,t:0}});
  once('b',1.1,()=>{Wz.act='growb';Wz.at=0});
  if(u.big&&u.tt>1.2&&u.tt<3.4)u.big.s=1+ (u.tt-1.2)/2.2*6;
  once('c',3.4,()=>{u.mood=h.mood='shock';u.mt=h.mt=1.4;Wz.act=null;poof(u.big?u.big.x:u.x,h.r*CELL+FY-20,'#f2d040')});
  once('d',4.4,()=>{u.big=null;u.mood=h.mood='happy';u.mt=h.mt=1.2;u.hop=h.hop=.4})}
 else if(k==='durian'){end=4.4;const Mr=pp.merchant;// Merchant below the Wizard: sells him a (smelly) durian
  once('a',.3,()=>{say(Mr,'Durian! The king of fruits!');gest(Mr,'fwd',1.4);u.show={icon:'durian',x:Mr.x+Mr.face*14,y:Mr.y-26}});
  once('b',1.6,()=>{if(u.show)u.show.x=Wz.x+(Mr.x>Wz.x?8:-8)});
  once('c',2,()=>{u.show=null;merchantGain(DURIAN_GAIN,Mr.x,Mr.y-50)});
  once('d',2.4,()=>{Wz.mood='hurt';Wz.mt=1.6;say(Wz,'By the stars, what is that smell?!');for(let i=0;i<3;i++)poof(Wz.x-8+i*8,Wz.y-46,'#8aba5a')})}
 else if(k==='jokes'){const Mr=pp.merchant;let dead=false;// Merchant right of the Wizard: jokes and laughter (0.5%: a dark turn)
  once('0',.1,()=>{u.dark2=luck(doom(ODDS.murder,Wz),u,h)});
  if(u.dark2){end=3.6;once('m1',.6,()=>{gest(Mr,'fwd',.6);flashes.push({x:h.c*CELL,y:h.r*CELL,t:0,col:'200,40,40'})});
   once('m2',.9,()=>{Wz.blink=.6;Wz.mood='hurt';Wz.mt=2;markSeen('murder')});once('m3',1.6,()=>{dead=true})}
  else{lines(u.sc2||(u.sc2=pick(JOKES)));once('ha',end-.9,()=>{say(Mr,'Ha ha ha ha!');Mr.hop=Wz.hop=.4;Mr.mood=Wz.mood='happy';Mr.mt=Wz.mt=1.5});once('hb',end-.5,()=>{Mr.hop=Wz.hop=.3})}
  if(dead){kill(Wz);return}}
 else if(k==='advertW'){end=5.2;const Mr=pp.merchant;// Merchant left of the Wizard: the Wizard helps advertise; coins come 2 at a time for a minute
  once('a',.3,()=>{say(Mr,'Fresh fruit! Magic-blessed fruit!');gest(Mr,'both',1.2)});
  once('b',1.9,()=>{say(Wz,'Enchanted apples! One bite, pure wonder!');gest(Wz,'both',1.4);Wz.act='magic';Wz.at=0});
  once('c',3.4,()=>{Wz.act=null;if(Mr.rotT>0){parts.push({k:'txt',s:'rotten!',x:Mr.x,y:Mr.y-50,t:0,life:1.4,icon:'apple'})}else{boostAmt=Math.min(BOOST_MAX,boostAmt+1);boostT=BOOST_TIME;toast('Business is booming: '+boostAmt+' coin'+(boostAmt>1?'s':'')+' every 30 seconds for the next minute!')}Mr.hop=Wz.hop=.4})}
 // ---------- Apothecary + Fruit Merchant ----------
 else if(k==='apgift'){end=4.6;const Ap=pp.apothecary,Mr=pp.merchant;// Apothecary left of the Merchant: she gives him a potion (its usual effect: backwards speech)
  once('a',.3,()=>{say(Ap,'Try my newest tonic, it is on the house!');gest(Ap,'fwd',1.4);u.show={icon:'potion',x:Ap.x+Ap.face*14,y:Ap.y-26}});
  once('b',1.6,()=>{if(u.show){u.show.x=Mr.x+Mr.face*9;u.show.y=Mr.y-38}gest(Mr,'up',1)});
  once('c',2.6,()=>{u.show=null;backwards(Mr);Mr.mood='shock';Mr.mt=1.2})}
 else if(k==='mtrade'){end=4.6;const Ap=pp.apothecary,Mr=pp.merchant;// they swap wares: fruit for potions
  once('a',.3,()=>{say(Mr,'Two apples for one of your tonics?');gest(Mr,'fwd',1.6);gest(Ap,'fwd',1.6);u.show={icon:'apple',x:Mr.x+Mr.face*14,y:Mr.y-26};u.show2={icon:'potion',x:Ap.x+Ap.face*14,y:Ap.y-26}});
  once('b',1.8,()=>{if(u.show){u.show.x=Ap.x+Ap.face*14}if(u.show2){u.show2.x=Mr.x+Mr.face*14}});
  once('c',2.8,()=>{u.show=u.show2=null;say(Ap,'A fair trade!');Mr.hop=Ap.hop=.4;Mr.mood=Ap.mood='happy';Mr.mt=Ap.mt=1.4})}
 else if(k==='farm'){end=4.4;const Ap=pp.apothecary,Mr=pp.merchant;// 3%: they hire a farmer, who sets up a field nearby
  once('a',.3,()=>{say(Mr,'We need more crops. Let us hire a farmer!');gest(Mr,'both',1);gest(Ap,'up',1)});
  once('b',2.4,()=>{spawnFarm(h);Mr.hop=Ap.hop=.4;Mr.mood=Ap.mood='happy';Mr.mt=Ap.mt=1.4})}
 else if(k==='goldapple'){end=5.2;const Ap=pp.apothecary,Mr=pp.merchant;// Apothecary above the Merchant: a reaction turns his apples gold
  once('a',.3,()=>{say(Ap,'A drop of this on your apples...');Ap.act='goldmix';Ap.at=0;u.show={icon:'apple',x:(Ap.x+Mr.x)/2,y:Mr.y-34}});
  once('b',1.6,()=>{Mr.mood='shock';Mr.mt=1;poof(u.show?u.show.x:Mr.x,Mr.y-34,'#f2c84a')});
  once('c',2,()=>{if(u.show)u.show.icon='goldapple';Ap.act=null;Mr.goldT=GOLD_TIME;poof(Mr.c*CELL+18,Mr.r*CELL+42,'#f2c84a')});
  once('d',2.6,()=>{say(Mr,'Gold! My apples are pure gold!');Mr.hop=Ap.hop=.5;Mr.mood=Ap.mood='happy';Mr.mt=Ap.mt=2;gest(Mr,'both',1)});
  once('e',4.2,()=>{u.show=null})}
 else if(k==='business'){// Apothecary below the Merchant: how is business? Slow or booming (50/50)
  if(!u.sc2){u.biz=Math.random()<ODDS.bizSlow?'slow':'well';u.sc2=pick(u.biz==='slow'?BIZ_SLOW:BIZ_WELL)}lines(u.sc2);
  once('m',end-.8,()=>{const ok=u.biz==='well';u.mood=h.mood=ok?'happy':'hurt';u.mt=h.mt=1.6;if(ok){u.hop=h.hop=.4}})}
 else if(k==='braver'){end=4.6;// Priest + Fighter (5%): the Priest admits the Fighter is the brave one
  once('a',.3,()=>{say(Pr,"You're braver than I.");gest(Pr,'fwd',1.2)});
  once('b',2.2,()=>{Fi.mood='happy';Fi.mt=2;Fi.hop=.4;say(Fi,pick(['Aw, shucks.','Someone has to fight the tentacles.','I am. But thank you.']));gest(Fi,'flex',1.2)});
  once('c',3.8,()=>{Pr.mood='happy';Pr.mt=1.2})}
 // ---------- Knight + Fruit Merchant ----------
 else if(k==='thief'){end=5.8;const Mr=pp.merchant;let th=u.crowd&&u.crowd[0];// a thief grabs fruit; the Knight stops him
  once('a',.3,()=>{const hx=h.c*CELL,side=K.x-hx<48?1:-1,edge=side>0?hx+92:hx+4,p=crowdPerson('thief',edge,h.r*CELL+FY,[{x:cl(Mr.x+side*26,hx+12,hx+84),y:h.r*CELL+FY}],'ok','edge');p.al=1;u.crowd=[p]});
  once('b',1.7,()=>{if(th){th.carry='apple';th.mood='happy'}Mr.mood='shock';Mr.mt=1.5;say(Mr,'Hey! Stop, thief!')});
  once('c',2.3,()=>{if(th)K.face=th.x>K.x?1:-1;K.act='prac';K.at=0;K.mood='mad';K.mt=1.6});
  once('d',3.1,()=>{if(th){th.mood='hurt';th.hop=.4;th.carry=null;th.blinkT=.4;poof(th.x,th.y-20,'#cfd6e0');u.show={icon:'apple',x:th.x,y:th.y-4}}});
  once('e',3.5,()=>{crowdLeave(u);K.act=null});
  once('f',4.3,()=>{u.show=null;K.mood=Mr.mood='happy';K.mt=Mr.mt=1.5;say(Mr,'My hero! Have an apple, on the house.');gest(K,'both',.8);K.hop=.4})}
 else if(k==='lemons'){const Mr=pp.merchant;lines(LEMONS);// the Knight wants lemons; there are none
  once('s',end-1.2,()=>{K.mood='hurt';K.mt=1.6;Mr.mood='happy';Mr.mt=1.2})}
 else if(k==='greenapple'){end=4.8;const Mr=pp.merchant;// Merchant above the Knight: green apples today
  once('a',.3,()=>{say(Mr,'Green apples today! Sour and crisp.');gest(Mr,'fwd',1.4);u.show={icon:'greenapple',x:Mr.x+Mr.face*14,y:Mr.y-26}});
  once('b',1.6,()=>{if(u.show)u.show.x=K.x+(Mr.x>K.x?8:-8)});
  once('c',2.2,()=>{u.show=null;merchantGain(SELL_GAIN,Mr.x,Mr.y-50);K.mood='hurt';K.mt=1;say(K,'Sour! ...Delicious, actually.')});
  once('d',3.4,()=>{K.mood=Mr.mood='happy';K.mt=Mr.mt=1.2;K.hop=.4})}
 else if(k==='rumors'){const Mr=pp.merchant;// Merchant below the Knight: goblins (90%) or a dragon (10%); the Knight vows to slay them
  if(!u.sc2)u.sc2=luck(ODDS.dragon,u,h)?RUMOR_DRAGON:RUMOR_GOBLIN;lines(u.sc2);
  once('m',.7,()=>{Mr.mood='shock';Mr.mt=1.6});once('k',.6+3*2.3+.1,()=>{gest(K,'up',1.4);K.mood='happy';K.mt=1.6;K.hop=.4})}
 // ---------- Knight + Apothecary ----------
 else if(k==='bear'){end=4.6;const Ap=pp.apothecary;// Knight above the Apothecary: a strength tonic turns him into a grizzly bear
  once('a',.3,()=>{say(Ap,'Try my new strength tonic!');gest(Ap,'fwd',1.2);u.show={icon:'potion',x:Ap.x+Ap.face*14,y:Ap.y-26}});
  once('b',1.4,()=>{u.show=null;K.drink=.9;gest(K,'up',.9)});
  once('c',2.4,()=>{K.form='bear';K.bearT=BEAR_TIME;K.glow=0;setLabel(K);poof(K.x,K.y-24,'#a07850');poof(K.x,K.y-10,'#6a4428');K.mood='mad';K.mt=1.4;say(K,'ROOOAAAR!');Ap.mood='shock';Ap.mt=2;Ap.hop=.4});
  once('d',3.6,()=>say(Ap,'Hmm. Too much bear root.'))}
 else if(k==='kgossip'){// Knight below the Apothecary: gossip about a Mage on the board
  if(!u.sc2){const m=['wizard','priest','necromancer'].filter(i=>U[i]);u.sc2=KGOSSIP[m.length?pick(m):'none']}lines(u.sc2);
  once('g',end-.6,()=>{u.hop=h.hop=.4;u.mood=h.mood='happy';u.mt=h.mt=1.2})}
 else if(k==='kdate'||k==='wdate'){const Ap=pp.apothecary,M=K||Wz,wz=k==='wdate';end=99;// they go on a date and leave the board for a while
  once('a',.3,()=>{say(M,wz?'Care to see the stars with me?':'Would you join me for a walk?');gest(M,'fwd',1)});
  once('b',1.2,()=>{say(Ap,'I would love to.');hearts(M);hearts(Ap);M.mood=Ap.mood='happy';M.mt=Ap.mt=2});
  if(u.tt>2){const q=cl(1-(u.tt-2)/.6,0,1);u.al=h.al=q}
  if(u.tt>=2.6){goCrusade(u,h,'date',wz?WDATE_TIME:KDATE_TIME,Math.random()<(wz?ODDS.wdate:ODDS.kdate));return}}
 else if(k==='bees'){end=1.8;// Knight left of the Apothecary: a bee swarm; both flee to the other room
  once('a',.2,()=>{swarms.push({r:h.r,c:h.c,t:0});u.mood=h.mood='shock';u.mt=h.mt=3;u.hop=h.hop=.4});
  once('b',.8,()=>say(h,'Bees! Run!'))}
 // ---------- Wizard + Apothecary ----------
 else if(k==='cobrew'){end=5.4;const Ap=pp.apothecary;// Wizard right of the Apothecary: brewing together (5%: the Alchemist shows up)
  once('a',.3,()=>{Ap.act='cobrew';Ap.at=0;Wz.act='magic';Wz.at=0;say(Ap,'A pinch of stardust...')});
  once('b',3.4,()=>{Ap.act=Wz.act=null;poof(Ap.x+Ap.face*18,Ap.y-14,'#c890ff');Ap.mood=Wz.mood='happy';Ap.mt=Wz.mt=1.5;Ap.hop=Wz.hop=.4;
   if(luck(ODDS.alchemist,u,h)){if(!S.un.alchemist){S.un.alchemist=true;buildShelf();save();toast('The bubbling draws a traveling Alchemist... an Alchemist box has appeared on the shelf!')}
    else addItem('potion',1,Ap.x+Ap.face*18,Ap.y-34)}})}
 else if(k==='boom'){end=5;const Ap=pp.apothecary;let dead=false;// Wizard left of the Apothecary: the brew explodes (2% kills them both)
  once('0',.1,()=>{u.doom=Math.random()<doom(ODDS.boomDeath,u,h)});
  once('a',.3,()=>{Ap.act='cobrew';Ap.at=0;Wz.act='magic';Wz.at=0;say(Wz,'Now add the newt. All of it.')});
  once('b',2.2,()=>{Ap.act=Wz.act=null;flashes.push({x:h.c*CELL,y:h.r*CELL,t:0});['#ff8020','#ffd040','#7aff7a','#c890ff'].forEach((col,i)=>poof(Ap.x+Ap.face*18+(i%2?-10:10),Ap.y-14+(i<2?-8:8),col));
   Ap.blink=Wz.blink=.6;Ap.mood=Wz.mood='hurt';Ap.mt=Wz.mt=2;Ap.hop=Wz.hop=.5});
  if(u.doom)once('k',3,()=>{dead=true});
  else{once('c',3,()=>{say(Ap,'*cough* Too much newt!');poof(Ap.x,Ap.y-40,'#5a5a64');poof(Wz.x,Wz.y-40,'#5a5a64')});once('d',4.2,()=>{Ap.mood=Wz.mood='ok'})}
  if(dead){markSeen('boom');kill(h);if(U[u.id])kill(u);toast('The brew exploded... nobody survived.');return}}
 else if(k==='imp'){end=5.8;const Ap=pp.apothecary;// Wizard above the Apothecary (40%): he summons an imp, zaps it, and bottles its blood for her
  once('a',.3,()=>{say(Wz,'Hold still, little imp!');gest(Wz,'both',1)});
  once('b',.8,()=>{const hx=h.c*CELL,x=cl((u.x+h.x)/2,hx+16,hx+80);u.mobs=[{id:'imp',x,y:h.r*CELL+FY,t:0,blink:0,face:x>Wz.x?-1:1}];poof(x,h.r*CELL+FY-10,'#d03a3a')});
  once('c',1.9,()=>{const m=u.mobs&&u.mobs[0];if(m){gest(Wz,'fwd',.6);zaps.push(mkZap(Wz,{x:m.x,y:m.y+10},0));m.blink=.4}});
  once('d',2.6,()=>{const m=u.mobs&&u.mobs[0];if(m){m.gone=true;poof(m.x,m.y-12,'#d03a3a');u.show={icon:'blood',x:m.x,y:m.y-6}}});
  once('e',3.6,()=>{if(u.show){u.show.x=Ap.x+Ap.face*10;u.show.y=Ap.y-28}gest(Ap,'fwd',.8)});
  once('f',4.3,()=>{u.show=null;Ap.mood=Wz.mood='happy';Ap.mt=Wz.mt=1.5;Ap.hop=.4;say(Ap,'Fresh imp blood! Perfect for my tonics.')})}
 else if(k==='purplepot'){end=5;const Ap=pp.apothecary;// Wizard above the Apothecary (60%): she mixes him a purple potion
  once('a',.3,()=>{Ap.act='cobrew';Ap.at=0;say(Ap,'Try my new purple potion!')});
  once('b',1.8,()=>{Ap.act=null;u.show={icon:'purplepotion',x:Ap.x+Ap.face*14,y:Ap.y-26};gest(Ap,'fwd',1)});
  once('c',2.6,()=>{u.show=null;Wz.drink=.9;gest(Wz,'up',.9)});
  once('d',3.4,()=>{poof(Wz.x,Wz.y-24,'#a050e0');Wz.mood='happy';Wz.mt=1.6;Wz.hop=.5;say(Wz,'Whoa. I can taste colors!')})}
 // ---------- Priest + Apothecary ----------
 else if(k==='plant'){end=5.8;const Ap=pp.apothecary,m=u.mobs&&u.mobs[0];// Priest left of the Apothecary: her carnivorous plant gets out of hand
  once('a',.3,()=>{const hx=h.c*CELL,x=cl((u.x+h.x)/2,hx+18,hx+78);u.mobs=[{id:'plant',x,y:h.r*CELL+FY,t:0,blink:0}];say(Ap,'My flytrap! It got out of hand!');Ap.mood='shock';Ap.mt=2;Ap.hop=.4});
  once('s',1.5,()=>{Pr.act='smite';Pr.at=0;Pr.mood='mad';Pr.mt=2.6});
  for(let i=0;i<3;i++)once('b'+i,1.9+i*.9,()=>{if(m){u.beam={x:m.x,y:m.y-30,t:0};m.blink=.4;gest(Pr,'up',.6)}});
  once('k',4.5,()=>{if(m){m.gone=true;poof(m.x,m.y-24,'#4aaa3a');poof(m.x,m.y-10,'#8a5a2a')}Pr.act=null;Pr.mood=Ap.mood='happy';Pr.mt=Ap.mt=1.5;say(Pr,'Begone, foul weed!')})}
 else if(k==='pstudy'){const Ap=pp.apothecary;// Priest right of the Apothecary: studying alchemy (5%: a secret is revealed)
  if(!u.sc2)u.sc2=pick(PSTUDY);lines(u.sc2);
  once('r',.2,()=>{Pr.act='holy';Pr.at=0;Ap.act='research';Ap.at=0});
  once('z',end-.8,()=>{Pr.act=Ap.act=null;Pr.mood=Ap.mood='happy';Pr.mt=Ap.mt=1.2;if(luck(ODDS.reveal,u,h))revealSecret()})}
 else if(k==='psleep'){end=3.8;const Ap=pp.apothecary;// Priest above the Apothecary: her tonic puts him to sleep for PSLEEP_TIME
  once('a',.3,()=>{say(Ap,'Try my new calming tonic.');gest(Ap,'fwd',1);u.show={icon:'potion',x:Ap.x+Ap.face*14,y:Ap.y-26}});
  once('b',1.4,()=>{u.show=null;Pr.drink=.9;gest(Pr,'up',.9)});
  once('c',2.5,()=>{say(Pr,'So... calm... zzz');Pr.mood='sleep'})}
 else if(k==='heal'){end=7;const Ap=pp.apothecary,cu=u.crowd&&u.crowd[0];// Priest below the Apothecary: a sick farmer is healed (2%: he starts a farm)
  once('a',.3,()=>{u.feastHost=h.id;const by=h.r*CELL,ex=EXIT[doorOf(h)],door=h.c*CELL+ex.x;npcDoor(h,1);
   u.crowd=[crowdPerson('farmer',door,by+ex.ay,[{x:door,y:by+FY},{x:cl((u.x+h.x)/2,h.c*CELL+20,h.c*CELL+76),y:by+FY}],'hurt')]});
  once('s',1.6,()=>{say(Ap,'This farmer is terribly ill!');Ap.mood='shock';Ap.mt=1.2});
  once('p',2.6,()=>{if(cu){Pr.act='smite';Pr.at=0;u.beam={x:cu.x,y:cu.y-24,t:0}}});
  once('m',3.6,()=>{Pr.act=null;if(cu)u.show={icon:'potion',x:cu.x+(Ap.x>cu.x?8:-8),y:cu.y-30};gest(Ap,'fwd',.8)});
  once('h',4.4,()=>{u.show=null;if(cu){cu.mood='happy';cu.hop=.5;poof(cu.x,cu.y-24,'#f2d870')}say(Pr,'Healed, by faith and medicine!');Pr.mood=Ap.mood='happy';Pr.mt=Ap.mt=1.5});
  once('l',5.4,()=>{crowdLeave(u);if(luck(ODDS.healFarm,u,h))spawnFarm(h)})}
 // ---------- Necromancer + Fruit Merchant / Apothecary ----------
 else if(k==='yell'){const Mr=pp.merchant;lines(NYELL);// after the blood sacrifice: the Merchant comes up to complain
  once('m',.3,()=>{Mr.mood='mad';Mr.mt=end})}
 else if(k==='bloodorange'){end=4.6;const Mr=pp.merchant;// Necromancer right of the Merchant: 30% there is a blood orange (+3 coins)
  once('a',.3,()=>say(N,'One blood orange, please. The redder the better.'));
  once('b',1.6,()=>{u.bo=luck(ODDS.bloodorange,u,h);if(u.bo){say(Mr,'You are in luck: my last one!');u.show={icon:'bloodorange',x:Mr.x+Mr.face*14,y:Mr.y-26};gest(Mr,'fwd',1)}
   else{say(Mr,'Sold out of blood oranges, sorry.');N.mood='hurt';N.mt=1.6}});
  once('c',2.8,()=>{if(u.bo){u.show=null;merchantGain(BLOODORANGE_GAIN,Mr.x,Mr.y-50);N.mood='happy';N.mt=1.4;N.hop=.3}})}
 else if(k==='ntrade'){end=5;const Ap=pp.apothecary;// Necromancer next to the Apothecary: undead ingredients for a black potion
  once('a',.3,()=>{say(N,'Grave dust and a wraith tooth. Very fresh.');gest(N,'fwd',1.2);u.show={icon:'bone',x:N.x+N.face*14,y:N.y-26}});
  once('b',1.6,()=>{if(u.show)u.show.x=Ap.x+Ap.face*14;say(Ap,'Lovely! A black potion for you.');u.show2={icon:'blackpotion',x:Ap.x+Ap.face*14,y:Ap.y-30};gest(Ap,'fwd',1.2)});
  once('c',2.8,()=>{u.show=null;if(u.show2)u.show2.x=N.x+N.face*14});
  once('d',3.6,()=>{u.show2=null;N.mood=Ap.mood='happy';N.mt=Ap.mt=1.4;
   if(U.alchemist&&rel(U.alchemist,Ap)&&luck(ODDS.ntradePotion,u,h)){addItem('potion',1,Ap.x,Ap.y-50);say(Ap,'The Alchemist helped me brew a spare!')}})}
 else if(k==='ritual'){end=RITUAL_TIME*SCENE_PACE;const Ap=pp.apothecary;// Necromancer below the Apothecary: 15 s of dark ritual by candlelight
  once('a',.3,()=>say(N,'Join me. The candles are already lit.'));
  once('b',1,()=>{Ap.kneel=true;N.act='raise';N.at=0});
  once('c',3.2,()=>say(Ap,'...This is actually quite relaxing.'));
  once('d',6,()=>say(N,'The spirits like you.'));
  once('e',end-1,()=>{N.act=null;Ap.kneel=false;N.mood=Ap.mood='happy';N.mt=Ap.mt=1.4})}
 // ---------- Rogue ----------
 else if(k==='assassin'){end=99;let dead=false;// 0.5%: the Rogue was an assassin all along
  once('a',.2,()=>{u.inv=true});
  once('b',1.2,()=>{u.inv=false;gest(u,'fwd',.6);flashes.push({x:h.c*CELL,y:h.r*CELL,t:0,col:'200,40,40'});h.blink=.6;h.mood='hurt';h.mt=2});
  once('c',1.8,()=>{dead=true});
  if(dead){const nm=CH[idOf(h)].name;kill(h);toast('The Rogue was an assassin all along! The '+nm+' is dead.');return}}
 else if(k==='spook'){end=3.2;// potion on the Rogue: he sneaks up invisible and shouts BOO
  once('a',.2,()=>{u.inv=false;say(u,'BOO!');h.mood='shock';h.mt=1.6;h.hop=.6});
  once('b',.9,()=>say(h,'AAAAH!'));once('c',1.8,()=>{u.mood='happy';u.mt=1.2;say(u,'Heh heh heh.')})}
 // ---------- Alchemist (by tags) ----------
 else if(k==='magictalk'){const o=u===Al?h:u;pp.mage=o;if(!u.sc2)u.sc2=pick(MAGICTALK);lines(u.sc2);// the Alchemist and a Mage: is magic actually useful?
  once('m',end-.6,()=>{u.mood=h.mood='happy';u.mt=h.mt=1.2;u.hop=h.hop=.3})}
 else if(k==='fourmage'){end=3.6;// secret: four Mages around him; he gives one a potion (its effect starts when the scene ends)
  once('a',.3,()=>{say(u,'For you, friend. My finest potion!');gest(u,'fwd',1.2);u.show={icon:'potion',x:u.x+u.face*14,y:u.y-26}});
  once('b',1.6,()=>{if(u.show)u.show.x=h.x+(u.x>h.x?8:-8);h.mood='happy';h.mt=1.4});once('c',2.4,()=>{u.show=null;h.hop=.4})}
 else if(k==='beast'){end=99;let dead=null;const weak=!hasClass(h,'fighter')&&!hasClass(h,'mage');// secret: the beast-man attacks; Merchants lose, Fighters and Mages fight (one dies)
  once('0',.1,()=>{u.loser=weak?'h':Math.random()<.5?'u':'h'});
  once('a',.3,()=>{say(u,'RRRAAAGH!');u.mood='mad';u.mt=6;h.mood='shock';h.mt=1.5;h.hop=.5;gest(u,'both',.8)});
  if(weak){once('b',1.4,()=>{gest(u,'fwd',.6);flashes.push({x:hx,y:hy,t:0,col:'200,40,40'});h.blink=.6;h.mood='hurt';h.mt=2});once('c',2.2,()=>{dead='h'})}
  else{once('f',1.1,()=>{h.act=fightAct(h);h.at=0;h.mood='mad';h.mt=3;say(h,'Back, foul creature!')});
   [1.8,2.6,3.4].forEach((t,i)=>once('x'+i,t,()=>{const v=i%2?h:u;v.blink=.4;poof(v.x,v.y-24,i%2?'#a07850':'#cfd6e0');gest(u,'fwd',.4)}));
   once('d',4.2,()=>{h.act=null;const L=u.loser==='u'?u:h;L.blink=.6;L.mood='hurt';L.mt=2});once('e',4.8,()=>{dead=u.loser})}
  if(dead==='h'){const nm=CH[idOf(h)].name;u.beastT=2.5;kill(h);toast('The beast-man mauled the '+nm+'!');return}
  if(dead==='u'){const nm=CH[idOf(h)].name;kill(u);toast('The '+nm+' slew the beast-man. The Alchemist is gone.');return}}
 // ---------- Rogue + Apothecary ----------
 else if(k==='nefarious'||k==='poisons'){end=4.8;const nf=k==='nefarious';// he buys something shady from under the counter
  once('a',.3,()=>{say(R,nf?'Something... nefarious, please. You know the kind.':'Poison, please. For rats.');gest(R,'fwd',1)});
  once('b',1.6,()=>{say(Ap,nf?'Shh! Under the counter.':'Rats? ...Very large rats, I assume.');gest(Ap,'fwd',1.2);u.show={icon:nf?'blackpotion':'poison',x:Ap.x+Ap.face*14,y:Ap.y-26}});
  once('c',2.8,()=>{if(u.show)u.show.x=R.x+R.face*10;addCoins(ROGUE_BUY,Ap.x,Ap.y-50)});
  once('d',3.6,()=>{u.show=null;R.mood='happy';R.mt=1.2;say(R,nf?'Pleasure doing business.':'Very large rats. Yes.')})}
 else if(k==='wine'){end=5.6;// poison in a wine bottle; once home he gives it to another neighbor
  once('a',.3,()=>{say(R,'Your strongest poison. And a bottle of wine.');gest(R,'fwd',1)});
  once('b',1.5,()=>{Ap.mood='shock';Ap.mt=1.2;say(Ap,'I do not want to know.');u.show={icon:'poison',x:Ap.x+Ap.face*14,y:Ap.y-26}});
  once('c',2.6,()=>{if(u.show)u.show.x=R.x+R.face*10;addCoins(ROGUE_BUY,Ap.x,Ap.y-50)});
  once('d',3.4,()=>{u.show={icon:'wine',x:R.x+R.face*10,y:R.y-26};poof(R.x+R.face*10,R.y-30,'#5ad040');say(R,'A little gift... for a friend.')});
  once('e',4.6,()=>{u.show=null;R.mood='happy';R.mt=1.2;u.thenVisit={kind:'winegift',not:h.id}})}
 else if(k==='winegift'){end=4.8;// the neighbor drinks the poisoned wine: sick for SICK_TIME (5% fatal when it wears off)
  once('a',.3,()=>{say(u,'A fine wine! On the house.');gest(u,'fwd',1);u.show={icon:'wine',x:u.x+u.face*12,y:u.y-26}});
  once('b',1.4,()=>{u.show=null;h.drink=.9;h.drinkIcon='wine';gest(h,'up',.9)});
  once('c',2.6,()=>{h.sickT=SICK_TIME;h.mood='hurt';h.mt=2;poof(h.x,h.y-30,'#5ad040');say(h,'Ugh... I do not feel so good.')});
  once('d',3.6,()=>{say(u,'Must have been the cheese.');u.mood='happy';u.mt=1.2})}
 else if(k==='rtrip'){end=5.6;// he sneaks in to steal, trips and smashes her potions
  once('a',.2,()=>{u.inv=true});once('b',1,()=>say(R,'*tiptoe* *tiptoe*'));
  once('c',2,()=>{u.inv=false;R.fall=true;R.mood='hurt';R.mt=2;for(let i=0;i<3;i++)thrown.push({sx:hx+64+i*8,sy:hy+40,ex:hx+56+i*12,ey:hy+88,t:0})});
  once('d',2.5,()=>{Ap.mood='mad';Ap.mt=3;Ap.hop=.4;say(Ap,'MY POTIONS! Get out of my shop!');gest(Ap,'both',1.2)});
  once('e',3.9,()=>{R.fall=false;R.mood='shock';R.mt=1.2;say(R,'I was... dusting?')})}
 // ---------- Rogue + Fruit Merchant ----------
 else if(k==='pinch'){end=5;// while the Merchant looks away, an apple disappears
  once('a',.2,()=>{h.lookAway=true;u.inv=true;say(Mr,pick(MERCH_ADS))});
  once('b',1.4,()=>{u.show={icon:'apple',x:u.x+u.face*10,y:u.y-26};poof(u.x+u.face*10,u.y-26,'#8a8a96')});
  once('c',2.4,()=>{h.lookAway=false;u.inv=false;u.show=null;say(Mr,'Hm? Did I have five apples, or four?')});
  once('d',3.4,()=>{say(R,'Four. Definitely four.');R.mood='happy';R.mt=1.2})}
 // ---------- Rogue + Priest ----------
 else if(k==='lecture'){const P2=pp.priest;lines(LECTURE);once('m',.4,()=>{P2.mood='mad';P2.mt=end-1});once('s',end-.8,()=>{R.mood='hurt';R.mt=1.6})}
 else if(k==='confess'){const P2=pp.priest;if(!u.sc2)u.sc2=pick(CONFESS);lines(u.sc2);
  once('k',.2,()=>{R.kneel=true});once('u',end-.6,()=>{R.kneel=false;R.mood=P2.mood='happy';R.mt=P2.mt=1.4;R.hop=.3})}
 else if(k==='vandal'){end=7.6;const P2=pp.priest;// paint on the chapel walls; caught and made to scrub it off
  once('a',.2,()=>{u.inv=true;u.paint=[]});
  for(let i=0;i<3;i++)once('p'+i,1+i*.4,()=>{if(u.paint){const p={x:hx+20+i*26,y:hy+30+(i%2)*10,col:['#d03050','#3a8ad0','#f2c84a'][i]};u.paint.push(p);poof(p.x,p.y,p.col)}});
  once('c',2.4,()=>{u.inv=false;P2.mood='mad';P2.mt=4;P2.hop=.4;say(P2,'Vandal! What have you done to my chapel?!')});
  once('d',3.6,()=>{say(P2,'You will scrub every last drop.');gest(P2,'fwd',1)});
  once('e',4.4,()=>{R.act='scrub';R.at=0;R.mood='hurt';R.mt=2.5});
  if(u.paint&&u.tt>4.6)u.paintA=cl(1-(u.tt-4.6)/2,0,1);
  once('g',6.8,()=>{R.act=null;u.paint=null;u.paintA=null;say(R,'Spotless. Happy now?');P2.mood='happy';P2.mt=1.2})}
 else if(k==='tempt'){const P2=pp.priest;let dead=false;end=u.doom?99:6.8;// a demon whispers: kill the Priest (5% he does)
  once('0',.1,()=>{u.doom=luck(doom(ODDS.tempt,P2),u,h)});
  once('a',.4,()=>{const x=cl(u.x+(u.x<h.x?-20:20),hx+12,hx+84);u.mobs=[{id:'imp',x,y:hy+FY,t:0,blink:0,face:x<u.x?1:-1,noLook:1,talker:1}];poof(x,hy+FY-20,'#d03a3a');R.mood='shock';R.mt=1});
  once('b',1.2,()=>{const m=u.mobs&&u.mobs[0];if(m)say(m,'Psst. Kill the Priest. Do it. DO IT.')});
  once('c',3,()=>say(R,u.doom?'...As you wish.':'No. I steal, but I do not kill priests.'));
  if(u.doom){once('d',3.8,()=>{u.mobs=null;gest(R,'fwd',.6);flashes.push({x:hx,y:hy,t:0,col:'200,40,40'});P2.blink=.6;P2.mood='hurt';P2.mt=2});once('e',4.4,()=>{dead=true})}
  else{once('d',4,()=>{const m=u.mobs&&u.mobs[0];if(m){m.gone=true;poof(m.x,m.y-12,'#d03a3a')}});once('e',4.8,()=>say(P2,'Did you say something?'));once('f',5.8,()=>{say(R,'Nothing! Lovely weather.');R.mood='happy';R.mt=1.2})}
  if(dead){kill(P2);toast('The demon got its way. The Priest is dead.');return}}
 // ---------- Rogue + Knight ----------
 else if(k==='dungeon'){// they go dungeon crawling for DUNGEON_TIME and come back with loot
  once('a',.3,()=>{say(R,'I know a dungeon. Full of loot.');gest(R,'fwd',1)});
  once('b',1.4,()=>{say(K,'And full of monsters, I hope!');gest(K,'up',1);K.mood=R.mood='happy';K.mt=R.mt=1.5});
  if(u.tt>2.2){const q=cl(1-(u.tt-2.2)/.6,0,1);u.al=h.al=q}
  if(u.tt>=2.8){goCrusade(u,h,'dungeon',DUNGEON_TIME);return}}
 else if(k==='rspar'){end=5.4;// sword against ninja stars
  once('a',.3,()=>{K.act='prac';K.at=0;R.act='rthrow';R.at=0});
  for(let i=0;i<3;i++){once('s'+i,1+i*.8,()=>thrown.push({sx:R.x+R.face*10,sy:R.y-30,ex:K.x,ey:K.y-30,t:0,icon:'star',star:1}));once('k'+i,1.4+i*.8,()=>{K.blink=.2})}
  once('e',3.8,()=>{K.act=R.act=null;K.mood=R.mood='happy';K.mt=R.mt=1.4;K.hop=R.hop=.4;say(K,'Not bad, for a pickpocket!')})}
 else if(k==='drinks'){lines(DRINKS);// a few drinks and a lot of laughing
  once('a',.2,()=>{u.show={icon:'ale',x:u.x+u.face*10,y:u.y-28};u.show2={icon:'ale',x:h.x+h.face*10,y:h.y-28}});
  for(let i=0;i<3;i++)once('h'+i,2.6+i*2.3,()=>{K.hop=R.hop=.3;K.mood=R.mood='happy';K.mt=R.mt=1.5});
  once('z',end-.4,()=>{u.show=u.show2=null})}
 else if(k==='wgossip'||k==='rgossip'){if(!u.sc2)u.sc2=pick(k==='wgossip'?WGOSSIP:RGOSSIP);lines(u.sc2);
  once('g',end-.6,()=>{u.hop=h.hop=.4;u.mood=h.mood='happy';u.mt=h.mt=1.2})}
 // ---------- Rogue + Alchemist ----------
 else if(k==='snatch'){end=4.2;// in through the ceiling or floor; he grabs a potion and uses it himself (its usual effect: an invisible prank)
  once('a',.1,()=>{u.inv=true});
  once('b',1,()=>{u.show={icon:'potion',x:hx+70,y:hy+40};poof(hx+70,hy+40,'#8a8a96')});
  once('c',1.6,()=>{if(u.show){u.show.x=R.x+R.face*10;u.show.y=R.y-28}Al.mood='shock';Al.mt=1.2;say(Al,'Hey! That one is not tested!')});
  once('d',2.6,()=>{u.show=null;u.inv=false;R.drink=.9;gest(R,'up',.9);say(R,'Too late!')})}
 else if(k==='volatile'){end=6.4;// volatile potions; the Rogue practices throwing them
  once('a',.3,()=>{say(Al,'Careful. These are... volatile.');gest(Al,'fwd',1);u.show={icon:'potion',x:Al.x+Al.face*14,y:Al.y-26}});
  once('b',1.6,()=>{u.show=null;say(R,'Perfect. Watch this!');R.act='rthrow';R.at=0});
  for(let i=0;i<3;i++)once('t'+i,2.2+i*.8,()=>{const tx=R.x<hx+48?hx+80-i*6:hx+16+i*6;thrown.push({sx:R.x+R.face*10,sy:R.y-30,ex:tx,ey:hy+60+i*6,t:0,boom:1})});
  once('d',4.8,()=>{R.act=null;Al.mood='shock';Al.mt=1.4;say(Al,'My eyebrows!');R.mood='happy';R.mt=1.4;R.hop=.4})}
 else if(k==='shrink'){const can=!!R.mageTag;end=can?6.4:5;// small and fast: only with the Mage tag
  once('a',.3,()=>{say(R,'Can you make me smaller? And faster?');gest(R,'fwd',1)});
  if(!can){once('b',2,()=>say(Al,'Smaller AND faster? That is beyond my science.'));once('c',3.6,()=>{R.mood='hurt';R.mt=1.4;say(R,'Fine. I will just eat less.')})}
  else{once('b',2,()=>{say(Al,'With your magic... yes! Hold still.');Al.act='cobrew';Al.at=0});
   once('c',3.2,()=>{Al.act=null;u.show={icon:'purplepotion',x:Al.x+Al.face*14,y:Al.y-26}});
   once('d',4,()=>{u.show=null;R.drink=.9;gest(R,'up',.9)});
   once('e',4.8,()=>{R.tinyT=TINY_TIME;poof(R.x,R.y-20,'#c890ff');markSeen('tiny');say(R,'Small! And FAST!');R.mood='happy';R.mt=1.5;R.hop=.4})}}
 // ---------- Rogue + Wizard ----------
 else if(k==='spell'){end=6;const mg=!!R.mageTag;// lightning and frost; jealous Rogue (amazed if he has the Mage tag)
  once('a',.3,()=>{say(Wz,'Behold: lightning AND frost!');Wz.act='frost';Wz.at=0});
  for(let i=0;i<3;i++)once('z'+i,1.2+i*.8,()=>zaps.push(mkZap(Wz,{x:hx+20+Math.random()*56,y:hy+30},0)));
  once('c',3.6,()=>{Wz.act=null;if(mg){R.mood='happy';R.mt=1.6;R.hop=.5;say(R,'Amazing! Teach me that!')}else{R.mood='hurt';R.mt=1.6;say(R,'Show-off. I could do that. Probably.')}});
  once('d',4.8,()=>{Wz.mood='happy';Wz.mt=1.2})}
 else if(k==='dressup'){end=6.4;// they try on disguises; afterwards the Wizard keeps a new robe color
  once('a',.3,()=>{say(R,'Want to try on some disguises?');u.newCol=pick(WIZ_RANDOM.filter(c=>c!==Wz.color))});
  once('b',1.2,()=>{poof(R.x,R.y-24,'#8a8a96');poof(Wz.x,Wz.y-24,'#8a8a96');const rs=sid(R);R.dress='wizard_'+u.newCol;Wz.dress=rs});
  once('c',2,()=>{say(Wz,'Ha! I look terribly sneaky.');R.hop=Wz.hop=.4;R.mood=Wz.mood='happy';R.mt=Wz.mt=1.4});
  once('d',3.4,()=>{poof(R.x,R.y-24,'#8a8a96');poof(Wz.x,Wz.y-24,'#c890ff');R.dress=Wz.dress=null;Wz.color=u.newCol;save();say(Wz,'I am keeping this color. It suits me!')});
  once('e',4.6,()=>{R.mood='happy';R.mt=1.2})}
 else if(k==='rsteal'){end=4.8;// light fingers: STEAL_SHARE of your coins
  once('a',.2,()=>{u.inv=true});
  once('b',1.4,()=>{const n=Math.ceil((S.coins||0)*STEAL_SHARE);u.stole=n;if(n>0){S.coins-=n;showCoins();save();parts.push({k:'txt',s:'-'+n,x:R.x-4,y:R.y-50,t:0,life:1.4,icon:'coin'})}});
  once('c',2.2,()=>{u.inv=false;say(Wz,u.stole?'Has anyone seen my coin purse?':'Why are my pockets inside out?')});
  once('d',3.2,()=>{say(R,u.stole?'Nope. Never seen it.':'Empty pockets? A wizard? Tragic.');R.mood='happy';R.mt=1.2})}
 // ---------- Rogue + Necromancer ----------
 else if(k==='rritual'){end=6.5;u.ritEnd=end;// he joins a dark ritual
  once('a',.3,()=>say(N,'Welcome, brother of shadows.'));
  once('b',1,()=>{R.kneel=true;N.act='raise';N.at=0});
  once('c',2.6,()=>say(R,'Do we get snacks afterwards?'));once('d',4,()=>say(N,'...No.'));
  once('e',end-1,()=>{N.act=null;R.kneel=false;N.mood=R.mood='happy';N.mt=R.mt=1.4})}
 else if(k==='betray'){let dead=false;if(u.doom==null)u.doom=Math.random()<doom(ODDS.betray,u,h);end=u.doom?99:4.6;u.ritEnd=4.6;// a ritual invite... it is a trap
  once('a',.3,()=>say(N,'Come, join my ritual. Kneel here.'));
  once('b',1.2,()=>{R.kneel=true;N.act='raise';N.at=0});
  once('c',2.4,()=>{say(N,'...as my SACRIFICE!');N.mood='mad';N.mt=2;R.mood='shock';R.mt=1;R.kneel=false});
  if(!u.doom)once('d',3.2,()=>{poof(R.x,R.y-20,'#8a8a96');poof(R.x,R.y-8,'#5a5a64');N.act=null;say(R,'Nice try!')});
  else{once('d',3.2,()=>{flashes.push({x:hx,y:hy,t:0,col:'200,40,40'});R.blink=.6;R.mood='hurt';R.mt=2});once('e',3.8,()=>{dead=true})}
  if(dead){const N2=h;N2.act=null;kill(u);if(U[N2.id]){N2.pet={x:N2.x-N2.face*16,y:N2.y,face:N2.face};poof(N2.pet.x,N2.y-10,'#7aff7a');N2.mood='happy';N2.mt=2;say(N2,'Rise, my little friend.')}
   toast('The Necromancer sacrificed the Rogue! A little skeleton now follows him around.');return}}
 else if(k==='rcandles'){end=7;// the Necromancer runs errands; the Rogue pockets black candles and a skull
  once('a',.3,()=>say(N,'Off to run some errands. Touch nothing.'));
  if(u.tt>1&&u.tt<1.6)h.al=1-(u.tt-1)/.6;once('g1',1.6,()=>{h.al=0});
  once('b',2,()=>{say(R,'Black candles... and a skull. Do not mind if I do.');u.show={icon:'candle',x:hx+20,y:hy+40}});
  once('c',2.8,()=>{if(u.show){u.show.x=R.x+R.face*10;u.show.y=R.y-28}u.show2={icon:'skull',x:hx+32,y:hy+34}});
  once('d',3.6,()=>{if(u.show2){u.show2.x=R.x+R.face*10;u.show2.y=R.y-34}});
  once('e',4.2,()=>{u.show=u.show2=null;R.mood='happy';R.mt=1.4;R.hop=.4});
  if(u.tt>4.6&&u.tt<5.2)h.al=(u.tt-4.6)/.6;once('g2',5.2,()=>{h.al=1;say(N,'Why do I have fewer skulls?')});
  once('f',6.2,()=>say(R,'No idea! Bye!'))}
 else if(k==='fairies'){end=6.4;// good fairies attack; ninja stars and dark magic send them packing
  once('a',.3,()=>{u.mobs=[0,1,2].map(i=>{const x=hx+20+i*28;poof(x,hy+46,'#ff90d0');return{id:'fairy',x,y:hy+FY-(i%2)*12,t:0,blink:0}});say(N,'Fairies! Good ones! Disgusting!');R.mood=N.mood='shock';R.mt=N.mt=1});
  once('b',1.2,()=>{R.act='rthrow';R.at=0;N.act='raise';N.at=0});
  for(let i=0;i<3;i++){once('h'+i,1.6+i*.9,()=>{const m=u.mobs&&u.mobs[i];if(!m)return;const p=fairyPos(m);if(i%2)zaps.push(mkZap(N,{x:p.x,y:p.y+24},1));else thrown.push({sx:R.x+R.face*10,sy:R.y-30,ex:p.x,ey:p.y,t:0,icon:'star',star:1});m.blink=.4});
   once('g'+i,2+i*.9,()=>{const m=u.mobs&&u.mobs[i];if(m){m.gone=true;const p=fairyPos(m);poof(p.x,p.y,'#ff90d0')}})}
  once('d',4.6,()=>{R.act=N.act=null;R.mood=N.mood='happy';R.mt=N.mt=1.4;R.hop=.3;say(R,'Too much sparkle.');u.mobs=null})}
 // ---------- Blacksmith ----------
 else if(k==='nscoff'){const Bs=pp.blacksmith;lines(NSCOFF);once('m',end-.8,()=>{N.mood='happy';N.mt=1.4;Bs.mood='hurt';Bs.mt=1.4})}
 else if(k==='smithk'){if(!u.sc2)u.sc2=pick(SMITHTALK);lines(u.sc2);once('m',end-.6,()=>{u.mood=h.mood='happy';u.mt=h.mt=1.2;u.hop=h.hop=.3})}
 else if(k==='reforge'){end=6;const Bs=pp.blacksmith;// a new weapon for the Knight (one of his other options)
  once('a',.3,()=>{say(Bs,'That old thing? Let me forge you something better.');Bs.act='forgework';Bs.at=1});
  once('b',2.6,()=>{Bs.act=null;u.newW=pick(WEAPONS.filter(w=>w!==K.weapon));K.weapon=u.newW;save();poof(K.x,K.y-24,'#cfd6e0');say(Bs,'Here: a fine new '+({shield:'shield',spear:'spear',glaive:'glaive',longsword:'longsword',axe:'battle axe'}[u.newW])+'!')});
  once('c',3.4,()=>{K.act='prac';K.at=0;K.mood='happy';K.mt=2});once('d',5,()=>{K.act=null;say(K,'It is perfect!');K.hop=.4})}
 else if(k==='metal'||k==='greenarmor'){end=k==='metal'?5.4:7;const Bs=pp.blacksmith;// magical metal: only workable with Mages on all four sides of the Blacksmith
  once('a',.3,()=>{say(Wz,'Can you work this magical metal?');gest(Wz,'fwd',1);u.show={icon:'greenmetal',x:Wz.x+Wz.face*12,y:Wz.y-26}});
  if(k==='metal'){once('b',2.2,()=>say(Bs,'Magic metal? Not a chance. It would melt my anvil.'));once('c',3.8,()=>{u.show=null;Wz.mood='hurt';Wz.mt=1.4})}
  else{once('b',2,()=>{say(Bs,'With all this magic around me... yes, I can!');u.show=null;Bs.act='forgework';Bs.at=1});
   once('c',4.4,()=>{Bs.act=null;Wz.armor=true;setLabel(Wz);save();poof(Wz.x,Wz.y-24,'#4ac87a');poof(Wz.x,Wz.y-10,'#8af0b0');Wz.mood='happy';Wz.mt=2;Wz.hop=.5;say(Wz,'Green mage armor! It hums with power!')})}}
 else if(k==='metaltalk'){lines(METALTALK);once('m',end-.6,()=>{u.mood=h.mood='happy';u.mt=h.mt=1.2})}
 else if(k==='awkjoke'){lines(AWKJOKE);once('m',2.4*2.3,()=>{Mr.mood='hurt';Mr.mt=2})} // the "..." is the awkward silence
 else if(k==='metalitch'){const Bs=pp.blacksmith,Dr=pp.druid;lines(METALITCH);once('m',.6+3*2.3+.3,()=>{Bs.mood='roll';Bs.mt=2});once('d',.6+2*2.3,()=>{if(Dr){Dr.mood='hurt';Dr.mt=1}})} // the Druid complains about metal; the Blacksmith rolls his eyes
 else if(k==='flirt'){const Bs=pp.blacksmith;lines(FLIRT);once('h',.8,()=>hearts(Bs));once('m',3*2.3,()=>{Bs.mood='hurt';Bs.mt=2})}
 else if(k==='childhood'){if(!u.sc2)u.sc2=pick(CHILDHOOD);lines(u.sc2);once('m',end-.6,()=>{u.mood=h.mood='happy';u.mt=h.mt=1.4;u.hop=h.hop=.4})}
 else if(k==='holyfire'||k==='paladin'){const Bs=pp.blacksmith,P2=pp.priest;end=k==='paladin'?7:5;// holy fire for the forge: declined, unless the Knight is next to the Blacksmith too (secret: the Paladin)
  once('a',.3,()=>{say(P2,'Let my holy fire bless your forge!');P2.act='smite';P2.at=0});
  if(k==='holyfire'){once('b',2.2,()=>{P2.act=null;say(Bs,'Kind of you, but my fire is hot enough.')});once('c',3.6,()=>{P2.mood='hurt';P2.mt=1.4})}
  else{once('b',2.2,()=>{P2.act=null;say(Bs,'With the Knight right next door... yes! Let us forge a Paladin!');Bs.act='forgework';Bs.at=1});
   once('c',4.2,()=>{const K2=U.knight;Bs.act=null;if(K2&&!K2.form){K2.paladin=true;setLabel(K2);save();flashes.push({x:K2.c*CELL,y:K2.r*CELL,t:0,col:'255,220,100'});poof(K2.x,K2.y-24,'#f2c84a');poof(K2.x,K2.y-8,'#ffffff');K2.mood='happy';K2.mt=2;K2.hop=.5;say(K2,'I am... a Paladin!')}});
   once('d',5.4,()=>{P2.mood=Bs.mood='happy';P2.mt=Bs.mt=1.4})}}
 else if(k==='rbuy'){lines(RBUY);once('s',.4,()=>{u.show={icon:'star',x:(u.x+h.x)/2,y:u.y-30}});once('m',end-.6,()=>{u.show=null;R.mood='happy';R.mt=1.2})}
 else if(k==='forge'){end=4.6;// Wizard + Necromancer (any side, 1%): together they make a scroll or a potion
  once('a',.4,()=>{gest(Wz,'fwd',2.4);gest(N,'fwd',2.4);u.made={x:(u.x+h.x)/2,y:u.y-40,t:0,icon:Math.random()<.5?'scroll':'potion'}});
  once('b',3.2,()=>{if(u.made)addItem(u.made.icon,1,u.made.x,u.made.y-10);u.made=null;Wz.mood=N.mood='happy';Wz.mt=N.mt=1.5;Wz.hop=N.hop=.5})}
 else if(k==='crusade'){// Priest above Knight (2%): they set off on a holy crusade together
  once('a',.3,()=>{say(Pr,'To the crusade!');gest(Pr,'both',1);gest(K,'up',1);K.mood=Pr.mood='happy';K.mt=Pr.mt=1.5});
  if(u.tt>1.6){const q=cl(1-(u.tt-1.6)/.6,0,1);u.al=h.al=q} // they fade away on their journey
  if(u.tt>=2.2){goCrusade(u,h);return}}
 else if(k==='cleanse'){end=4.6;// the Priest frees the Death Knight with holy light; he becomes a Knight again
  const D=Object.values(U).find(v=>v.form==='dknight');
  once('a',.3,()=>{Pr.act='smite';Pr.at=0;gest(Pr,'both',2);N.mood='shock';N.mt=2.5});
  once('b',1.1,()=>{if(D){u.beam={x:D.x,y:D.y-24,t:0};D.blink=.8;flashes.push({x:cellX(D)*CELL,y:cellY(D)*CELL,t:0,col:'255,236,150'})}});
  once('c',1.9,()=>{if(D){D.form=null;setLabel(D);poof(D.x,D.y-24,'#f2d870');poof(D.x,D.y-10,'#ffffff');D.mood='happy';D.mt=2;D.hop=.5;save();goHome(D)}});
  once('d',2.6,()=>{Pr.act=null;Pr.mood='happy';Pr.mt=1.5})}
 else{once('h1',.6,()=>{u.hop=.5;gest(u,'up',.6)});once('h2',1.4,()=>{h.hop=.5;gest(h,'up',.6)})}
 // Sleeping potion: the scene ends normally, then the Priest sleeps for PSLEEP_TIME wherever he is
 if(k==='psleep'&&u.tt>end){const P=Pr;clearFx(u);h.act=null;h.hosting=null;h.st='idle';h.wait=2;u.target=null;u.st='back';u.path=route(u,h.r,h.c,u.r,u.c,home(u));if(P&&U[P.id])sleepUnit(P,PSLEEP_TIME);return}
 // The invisible Rogue slips home without a portal
 if(k==='spook'&&u.tt>end){clearFx(u);freeHost(h);h.hosting=null;u.target=null;u.inv=true;u.st='back';u.path=[{k:'pause',w:.6},{k:'tele',x:u.c*CELL+48,y:u.r*CELL+FY,quiet:1}];return}
 // Bees: the visitor runs home; the host runs to the visitor's room, waits there until the bees leave, then walks home
 if(k==='bees'&&u.tt>end){clearFx(u);h.act=null;h.hosting=null;u.target=null;
  h.st='back';h.path=[...route(h,h.r,h.c,u.r,u.c,{x:u.c*CELL+30+Math.random()*36,y:u.r*CELL+FY}),{k:'pause',w:BEES_TIME-2.5},...route(h,u.r,u.c,h.r,h.c,home(h))];
  u.st='back';u.path=route(u,h.r,h.c,u.r,u.c,home(u));return}
 if(k==='dknight'&&u.tt>end){clearFx(u);freeHost(h);u.target=null;u.st='idle';u.wait=.5;return} // the new Death Knight stays with the Necromancer
 // Four Mages: the potion takes effect on the Mage once the Alchemist heads home
 if(k==='fourmage'&&u.tt>end){clearFx(u);freeHost(h);u.target=null;u.st='back';u.path=route(u,h.r,h.c,u.r,u.c,home(u));const fx=ITEM_FX.potion[h.id];if(fx&&U[h.id]&&fx(h)!==false)markSeen(ITEM_KEY.potion[h.id]);return}
 // Snatched potion: the Rogue uses it right away (invisible prank), or sneaks home if there is nobody to prank
 if(k==='snatch'&&u.tt>end){clearFx(u);freeHost(h);u.target=null;u.st='idle';u.path=[];if(rogueSpook(u)===false){u.st='back';u.path=route(u,h.r,h.c,u.r,u.c,home(u))}else markSeen('spook');return}
 if(u.tt>end){clearFx(u);freeHost(h);u.inv=false;u.target=null;u.st='back';u.path=route(u,h.r,h.c,u.r,u.c,home(u))}
}
function step(dt){
 for(const u of Object.values(U))u.fxs=u.fxs.filter(f=>{f.open+=(f.want-f.open)*Math.min(1,dt*8);if(f.closing&&f.open<.05){f.vis=false;f.keep=false}f.a=f.type==='door'?(f.vis?1:0):f.a+((f.vis?1:0)-f.a)*Math.min(1,dt*9);return f.keep||f.vis||f.a>.03||(FIXED[f.type]&&f.open>.03)});
 parts.forEach(p=>{p.t+=dt;if(p.k==='drop'){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=260*dt}});parts=parts.filter(p=>p.t<p.life);
 bolts.forEach(b=>b.t+=dt);bolts=bolts.filter(b=>b.t<.5);
 demons.forEach(d=>d.t+=dt);demons=demons.filter(d=>d.t<3.7);
 cats.forEach(k=>k.t+=dt);cats=cats.filter(k=>k.t<5.6&&U.wizard);
 fbs.forEach(f=>{f.t+=dt;if(f.t>=.55&&!f.done){f.done=1;explode(f)}});fbs=fbs.filter(f=>!f.done);
 flashes.forEach(f=>f.t+=dt);flashes=flashes.filter(f=>f.t<.6);
 thrown.forEach(p=>{p.t+=dt;if(p.t>=.35&&!p.done){p.done=1;if(p.fruit){poof(p.ex,p.ey,p.icon==='apple'?'#d83030':'#f08a20')}else if(p.star)poof(p.ex,p.ey,'#cfd6e0');else if(p.boom){['#ff8020','#ffd040','#c03020'].forEach((col,i)=>poof(p.ex+(i-1)*8,p.ey-(i%2)*6,col))}else{poof(p.ex,p.ey,'#cfe8f0');poof(p.ex,p.ey,'#d03050');splats.push({x:p.ex,y:p.ey,t:0})}}});thrown=thrown.filter(p=>!p.done);
 splats.forEach(s=>s.t+=dt);splats=splats.filter(s=>s.t<3);
 zaps.forEach(z=>z.t+=dt);zaps=zaps.filter(z=>z.t<.35);
 holes.forEach(q=>q.t+=dt);holes=holes.filter(q=>q.t<7);
 swarms.forEach(s=>s.t+=dt);swarms=swarms.filter(s=>s.t<BEES_TIME);
 // sleep wave rolls right along the row; anyone it passes (right of the Necromancer) falls asleep
 waves.forEach(w=>{w.t+=dt;const fx=w.x0+w.t*240;Object.values(U).forEach(v=>{if(v.id!==w.by&&!v.dead&&!w.hit[v.id]&&cellY(v)===w.r&&cellX(v)>w.c&&v.x<=fx){w.hit[v.id]=1;sleepUnit(v)}})});waves=waves.filter(w=>w.x0+w.t*240<W+40);
 // No coins just for having the game open: only the Wizard's advertising pays boostAmt coins every COIN_EVERY seconds while boostT runs
 coinT+=dt;if(coinT>=COIN_EVERY){coinT-=COIN_EVERY;if(boostT>0&&boostAmt>0){const M=U.merchant;addCoins(boostAmt,M?M.x:null,M?M.y-50:null)}}if(boostT>0&&(boostT-=dt)<=0)boostAmt=0;
 bubs.forEach(u=>{if((!u.talker&&(!U[u.id]||U[u.id]!==u))||(u.bubT-=dt)<=0)dropBub(u)}); // talker = a creature that speaks (the demon whispering to the Rogue)
 refreshTags();
 rains.forEach(q=>q.t+=dt);rains=rains.filter(q=>q.t<6);
 stepWeather(dt);
 for(const id in U){const u=U[id];
  if(u.dead)continue; // a buried Druid does nothing at all
  if(u.id==='druid'&&!u.pet)u.pet={kind:u.fam||'bear',x:u.x,y:u.y,face:1}; // his animal: grizzly bear, eagle or wolf
  if(u.mt>0&&(u.mt-=dt)<=0)u.mood='ok';
  if(u.hop>(u.hp||0)+1e-4)u.hd=u.hop;if(u.hop>0)u.hop-=dt;u.hp=u.hop;if(u.blink>0)u.blink-=dt;if(u.gt>0)u.gt-=dt;if(u.ward!=null)u.ward+=dt;if(u.wardHit>0)u.wardHit-=dt;
  if(u.glow>0)u.glow-=dt;if(u.drink>0&&(u.drink-=dt)<=0)u.drinkIcon=null;
  // the Necromancer's little skeleton follower (after the Rogue's betrayal) trots along behind him
  if(u.pet){const p=u.pet,bx=cellX(u)*CELL,tx=cl(u.x-u.face*(p.kind==='bear'?32:p.kind==='wolf'?26:16),bx+(p.kind==='bear'?20:12),bx+(p.kind==='bear'?76:84));if(Math.abs(tx-p.x)>60||Math.abs(u.y-p.y)>3){p.x=tx;p.y=u.y;p.walk=false}else{const d=tx-p.x;p.walk=Math.abs(d)>1;if(p.walk){p.face=d>0?1:-1;p.x+=Math.sign(d)*Math.min(Math.abs(d),40*dt);p.t=(p.t||0)+dt}else p.face=u.face}}
  // poisoned wine: sick for SICK_TIME (no neighbor scenes); 5% it is fatal when it wears off
  if(u.sickT>0){if(Math.random()<dt*1.5)parts.push({k:'sick',x:u.x+Math.random()*12-6,y:u.y-40,t:0,life:1});
   if((u.sickT-=dt)<=0){if(Math.random()<doom(ODDS.sickDeath,u)){const nm=CH[idOf(u)].name;kill(u);toast('The poisoned wine was too much. The '+nm+' has died.');continue}u.mood='happy';u.mt=1.5;say(u,'Phew. I feel better now.')}}
  if(u.tinyT>0&&(u.tinyT-=dt)<=0){poof(u.x,u.y-14,'#c890ff');say(u,'Back to normal size. Shame.')}
  if(u.beastT>0&&(u.beastT-=dt)<=0&&u.form==='beast'){u.form=null;setLabel(u);poof(u.x,u.y-24,'#7aff7a');u.mood='shock';u.mt=1.2;say(u,'Ugh... what happened? Why is there fur everywhere?')}if(u.lite!=null)u.lite+=dt;if(u.dark!=null)u.dark+=dt;
  if(u.und){u.und.t+=dt;if(u.und.blink>0)u.und.blink-=dt}
  if(u.tent){u.tent.t+=dt;if(u.tent.blink>0)u.tent.blink-=dt;if(u.tent.out!=null)u.tent.out+=dt}
  if(u.wings>0)u.wings-=dt;if(u.spirit){u.spirit.t+=dt;if(u.spirit.t>1.8)u.spirit=null}
  if(u.mobs){u.mobs.forEach(m=>{m.t+=dt;if(m.blink>0)m.blink-=dt;if(m.gone)m.al=(m.al==null?1:m.al)-dt*3});u.mobs=u.mobs.filter(m=>!(m.gone&&m.al<=0))}
  if(u.made)u.made.t+=dt;if(u.beam){u.beam.t+=dt;if(u.beam.t>.5)u.beam=null}
  if(u.st==='sleep'){stepSleep(u,dt);continue}
  if(u.st==='away'){stepAway(u,dt);continue} // on crusade
  if(u.disguiseT>0)u.disguiseT-=dt;if(u.as&&u.disguiseT<=0&&!u.target&&!u.hosting&&(u.st==='idle'||u.st==='walk'))undisguise(u); // the Rogue's disguise wears off
  if(u.luckT>0)u.luckT-=dt;
  // a Fighter neighbor died: after 1.5 s the Priest holds a funeral. An idle activity is interrupted; if he is busy otherwise he waits (up to 30 s).
  if(u.funeral){u.funeral-=dt;if(u.funeral<=0){const home=cellX(u)===u.c&&cellY(u)===u.r;
   if(u.st==='act'&&home&&!u.target&&!u.hosting&&u.act!=='massprayer'&&u.act!=='funeral'){if(u.npc)npcLeave(u);if(u.crowd)crowdLeave(u);u.act=null;u.kneel=false;u.show=null;u.ghost=null;u.spirit=null;u.st='idle';u.path=[]}
   if(freeU(u)&&home){u.funeral=0;startGather(u,nbrs(u),'funeral')}else if(u.funeral<-30)u.funeral=0}}
  if(u.bearT>0&&(u.bearT-=dt)<=0){u.form=null;setLabel(u);poof(u.x,u.y-24,'#a07850');u.mood='shock';u.mt=1.5;say(u,'What happened? Why am I so hairy?')}
  if(u.monkeyT>0&&(u.monkeyT-=dt)<=0){u.form=null;setLabel(u);poof(u.x,u.y-24,'#f2d040');u.mood='shock';u.mt=1.5;u.st='idle';u.path=[];u.act=null;u.wait=2}
  if(u.farmT>0)u.farmT-=dt;if(u.id==='farmer'&&u.farmT<=0&&u.act!=='harvest'&&(u.st==='idle'||u.st==='walk'||u.st==='act')){u.path=[];beginAct(u,'harvest');u.dur=3.4}
  if(u.goldT>0)u.goldT-=dt;
  if(u.rotT>0&&(u.rotT-=dt)<=0){u.worms=false;poof(u.c*CELL+30,u.r*CELL+46,'#f08a20');say(u,'My fruit is fresh again!')}
  if(u.st==='gathered'){const P=U[u.gatherOf];if(!P||!P.gather){u.gatherOf=null;goHome(u)}else if(Math.abs(P.x-u.x)>2)u.face=P.x>u.x?1:-1;continue}
  stepNpc(u,dt);stepCrowd(u,dt);
  if(u.act)u.at+=dt;if(u.orc&&u.orc.blink>0)u.orc.blink-=dt;
  if(u.st==='def'){defending(u,dt);continue}
  if(u.st==='talk'){talk(u,dt);continue}
  if(u.st==='cast'){casting(u,dt);continue}
  if(u.st==='act'){acting(u,dt);continue}
  if(u.hosting&&u.path.length){run(u,dt);continue} // a host can still be moved (e.g. the Priest backing away)
  if(u.hosting){const v=U[u.hosting];if(v){const tg=(v.mobs&&v.mobs[0]&&v.mobs[0].id!=='golem'&&!v.mobs[0].noLook)?v.mobs[0]:v.und&&v.st==='talk'&&v.tt>1.8?v.und:v;if(u.lookAway)u.face=tg.x>u.x?-1:1;else if(Math.abs(tg.x-u.x)>2)u.face=tg.x>u.x?1:-1}continue} // lookAway: the Merchant turns his back while the Rogue pinches fruit
  if(u.path.length){run(u,dt);continue}
  if(u.st==='idle'&&(u.wait-=dt)<=0)decide(u);
 }
}

// ---------- render ----------
const scl=u=>{const ry=((u.y%CELL)+CELL)%CELL;return(ry>=66?1-.3*cl((84-ry)/14,0,1):1)*u.sk};
const poseNow=u=>u.kneel?'pray':u.gt>0?u.gp:poseOf(u.st==='cast'?'cast':u.act,u.st==='cast'?u.tt:u.at);
function render(){
 g.clearRect(0,0,W,H);
 const price=cellPrice();
 for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){if(!isOpen(r,c)){drawLocked(g,c*CELL,r*CELL,price,(S.coins||0)>=price);continue}g.fillStyle=(r+c)%2?'#25214a':'#2a2650';g.fillRect(c*CELL,r*CELL,CELL,CELL)}
 const dm=drag&&drag.moved?drag.id:null,live=Object.values(U).filter(u=>u.id!==dm);
 for(const id in U){const u=U[id],x=u.c*CELL,y=u.r*CELL;
  if(id===dm){g.strokeStyle='#5a5590';g.lineWidth=2;g.setLineDash([4,4]);g.strokeRect(x+4,y+4,CELL-8,CELL-8);g.setLineDash([])}
  else{box(g,id,x,y,id==='druid'?u.r:u.weapon);const nb=(r2,c2)=>{const o=at(r2,c2);return o&&o!==dm};boxFrame(g,x,y,{t:!nb(u.r-1,u.c),b:!nb(u.r+1,u.c),l:!nb(u.r,u.c-1),r:!nb(u.r,u.c+1)})} // shared edges stay as thin as outer ones
  u.lb.style.opacity=id===dm?0:u.st==='away'?.45:u.dead?.6:1;
  if(id==='necromancer'&&id!==dm&&u.r===ROWS-1)drawSkulls(g,x,y); // easter egg: skulls on the bottom row
  if(id==='wizard'&&id!==dm&&deskOn(u))drawDesk(g,x,y); // writing desk (Merchant + Mage next door)
  if(id==='merchant'&&u.rotT>0&&id!==dm)drawRot(g,x,y,T,u.worms); // cursed: rotten fruit (and worms, from the Necromancer)
  if(id==='farmer'&&id!==dm)drawField(g,x,y,u.crop||'wheat',u.harvested?.05:cl(1-u.farmT/FARM_TIME,0,1),T); // the growing field
  if(id==='merchant'&&u.goldT>0&&id!==dm&&!(u.rotT>0))drawGold(g,x,y,T); // golden apples
  if(id==='rogue'&&id!==dm&&graveyardOn(u))drawGraveyard(g,x,y,T); // secret: next to the Necromancer on the bottom row
  if(id!==dm)drawRoomLife(g,id,x,y,T)} // candle flames, clouds
 if(S.goldCell&&isOpen(S.goldCell[0],S.goldCell[1]))drawGoldCell(g,S.goldCell[1]*CELL,S.goldCell[0]*CELL,T); // philosopher's stone
 Object.values(U).forEach(u=>u.fxs.forEach(f=>drawFx(f)));
 live.forEach(u=>{if(u.act==='funeral')drawGrave(g,u.c*CELL,u.r*CELL)}); // the Priest's funeral
 // background details behind the characters: horse, cat, tentacles through the Priest's window
 live.forEach(u=>{if(u.act==='horse')drawHorse(g,(u.c+1)*CELL,u.r*CELL+FY,u.at)});
 if(U.wizard&&dm!=='wizard')cats.forEach(k=>drawCat(g,U.wizard.c*CELL,U.wizard.r*CELL,k.t,k.dir));
 live.forEach(u=>{if(u.tent){const q=u.tent;drawTentacles(g,q.bx,q.by,cl(q.t/1,0,1)*(q.out!=null?1-cl(q.out/.6,0,1):1),T,q.blink)}});
 splats.forEach(s=>drawSplat(g,s.x,s.y,cl((3-s.t)/1,0,1)));
 holes.forEach(q=>drawHole(g,q.x,q.y,cl((7-q.t)/1.5,0,1)));
 live.forEach(u=>{if(u.act)drawActBack(g,u)}); // ceiling light, chalk circle
 live.forEach(u=>{if(u.act==='massprayer'&&u.gather&&u.gather.phase==='pray')drawRoomGlow(g,u.c*CELL,u.r*CELL,cl(u.gather.pt/1,0,1)*cl((MASS_PRAYER_TIME-u.gather.pt)/1,0,1),T)}); // great prayer
 // characters and visiting farmers, back to front
 const people=[...live,...live.filter(u=>u.npc).map(u=>({npcOf:u,y:u.npc.y})),...live.flatMap(u=>(u.crowd||[]).map(p=>({crowdP:p,y:p.y}))),...live.filter(u=>u.table).map(u=>({tableOf:u,y:u.table.y}))].sort((a,b)=>a.y-b.y);
 people.forEach(u=>{
  if(u.tableOf){const q=u.tableOf.table;drawTable(g,q.x,q.y,1);return}
  if(u.crowdP){const p=u.crowdP,ph=p.hop>0?-Math.sin((1-p.hop/.5)*Math.PI)*8:0,sc=scl({y:p.y,sk:1});spr(g,p.id,blinkMood(p.mood,p.home.x,T),p.x,p.y,p.face,(p.walk?Math.sin(p.t*14)*1:0)+ph,p.al,sc,p.act==='prac'?'noR':'none',p.walk?stepOf(p.t):0);
   if(p.carry)drawItem(g,p.carry,Math.round(p.x+p.face*9),Math.round(p.y-26),1);
   if(p.act==='prac'){g.save();g.beginPath();g.rect(cellX(p)*CELL+4,cellY(p)*CELL,CELL-8,CELL);g.clip();drawAct(g,{act:'prac',at:p.t,x:p.x,y:p.y,face:p.face,weapon:'wood',form:'squire'});g.restore()}return}
  if(u.npcOf){const n=u.npcOf.npc,nh=n.hop>0?-Math.sin((1-n.hop/.5)*Math.PI)*8:0;
   spr(g,n.id,blinkMood(n.mood,7,T),n.x+(n.shake?Math.round(Math.sin(T*40)):0),n.y,n.face,(n.walk?Math.sin(n.t*14)*1:0)+nh,n.al,scl({y:n.y,sk:1}),'none',n.walk?stepOf(n.t):0);return}
  if(u.dead){const bx=u.c*CELL,by=u.r*CELL,k=u.fam||'bear';drawMound(g,bx,by,T);if(k==='bear')drawBearPet(g,bx+70,by+FY,-1,0,false);else if(k==='wolf')drawWolfPet(g,bx+74,by+FY,-1,0,false);else drawEagle(g,bx+66,by+FY-4,-1,T,true);return} // buried Druid: a mound with a sapling, his animal keeping watch
  if(u.arch&&!u.form&&!u.dress&&!u.asSprite){const ox=u.x-u.face*13,oy=u.y-41;g.fillStyle='rgba(150,255,170,'+(.22+.1*Math.sin(T*3))+')';g.beginPath();g.arc(ox,oy,7,0,Math.PI*2);g.fill()} // the Archdruid's staff glows
  const walking=(u.path.length&&u.path[0].k==='walk')||u.mv,hd=Math.max(u.hd||0,u.hop),hop=u.hop>0?-Math.sin((1-u.hop/hd)*Math.PI)*10*Math.min(1,hd/.5):0,bl=u.blink>0&&Math.floor(u.blink*14)%2?.2:1;
  const sink=u.act==='demon'?sinkOf(u.at):0,low=sink*46+(u.kneel?6:0)+(u.fall?12:0)+(u.st==='sleep'?Math.round(Math.sin(T*2)):0);
  if(u.glow>0)drawGlow(g,u.x,u.y,T);
  if(u.wings>0)drawWings(g,u.x,u.y+low+hop,T);
  if(u.pet&&u.pet.kind==='bear')drawBearPet(g,u.pet.x,u.pet.y,u.pet.face,u.pet.t||0,u.pet.walk,u.al); // the Druid's grizzly bear
  else if(u.pet&&u.pet.kind==='wolf')drawWolfPet(g,u.pet.x,u.pet.y,u.pet.face,u.pet.t||0,u.pet.walk,u.al); // his wolf
  else if(u.pet&&u.pet.kind==='eagle'){const bx=cellX(u)*CELL;drawEagle(g,cl(u.x+Math.sin(T*1.3)*22,bx+12,bx+84),u.y-58+Math.sin(T*2.6)*4,Math.cos(T*1.3)>0?1:-1,T,false,u.al)} // his eagle circles above him
  else if(u.pet)spr(g,'skeleton','ok',u.pet.x,u.pet.y,u.pet.face,0,u.al,.55*scl(u),'none',u.pet.walk?stepOf(u.pet.t):0); // the Necromancer's little skeleton
  if(low>0){g.save();g.beginPath();g.rect(u.x-30,u.y-70,60,70);g.clip()} // sinking through the floor, or kneeling
  const args=[sid(u),u.st==='sleep'?u.mood:blinkMood(u.mood,seedOf(u.id),T),u.x+actDx(u),u.y+low,u.face,(walking?Math.sin(u.t*14)*1:0)+hop,u.al*bl*(u.inv?.25:1),scl(u)*(u.tinyT>0?.6:1),poseNow(u),walking&&!u.kneel?stepOf(u.t):0];
  spr(g,...args);
  if(u.glow>0){g.globalCompositeOperation='lighter';args[6]=u.al*bl*(.25+.15*Math.sin(T*4));spr(g,...args);g.globalCompositeOperation='source-over';glowSparkles(g,u.x,u.y,T)}
  if(low>0)g.restore()});
 live.forEach(u=>{
  if(u.orc){const o=u.orc,hit=o.blink>0,ob=hit&&Math.floor(o.blink*14)%2?.2:1;spr(g,'orc',hit?'hurt':'mad',o.x,o.y,u.x>o.x?1:-1,0,ob,1)}
  if(u.und){const d=u.und,rise=cl(d.t/.9,0,1),hit=d.blink>0;if(d.t<1.4)drawGreenCircle(g,d.x,d.y,cl(d.t/.4,0,1),T);
   g.save();g.beginPath();g.rect(d.x-24,d.y-60,48,60);g.clip();spr(g,'skeleton',hit?'hurt':'mad',d.x,d.y+(1-rise)*44,u.x>d.x?1:-1,0,hit&&Math.floor(d.blink*14)%2?.2:1,1);g.restore()}
  if(u.def&&u.def.skel){const d=u.def,s=d.skel,rise=cl((d.t-.2)/.9,0,1),hit=s.blink>0;if(d.t<1.4)drawGreenCircle(g,s.x,s.y,cl(d.t/.4,0,1),T);
   g.save();g.beginPath();g.rect(s.x-24,s.y-60,48,60);g.clip();spr(g,'skeleton',hit?'hurt':'mad',s.x,s.y+(1-rise)*44,u.x>s.x?1:-1,0,hit&&Math.floor(s.blink*14)%2?.2:1,1);g.restore()}
  if(u.mobs)u.mobs.forEach(m=>drawMob(g,m));
  if(u.show)drawItem(g,u.show.icon,Math.round(u.show.x),Math.round(u.show.y),1);
  if(u.show2)drawItem(g,u.show2.icon,Math.round(u.show2.x),Math.round(u.show2.y),1);
  if(u.big){const q=u.big;drawItem(g,'banana',Math.round(q.x),Math.round(q.y-6-q.s*4),Math.max(1,Math.round(q.s)))}
  if(u.beam){const Pr=U.priest;if(Pr){g.save();g.globalAlpha=cl(1-u.beam.t/.5,0,1);g.strokeStyle='rgba('+(u.beam.col||'255,236,150')+',.95)';g.lineWidth=5;g.beginPath();g.moveTo(Pr.x+Pr.face*8,Pr.y-36);g.lineTo(u.beam.x,u.beam.y);g.stroke();g.restore()}}
  if(u.made){const m=u.made;swirl(g,m.x,m.y+24,T,1,1);swirl(g,m.x,m.y+24,T+1,2,.6);if(m.t>2)drawItem(g,m.icon||'scroll',Math.round(m.x),Math.round(m.y-(m.t-2)*10),1)}
  if(u.spirit){const p=u.spirit;spr(g,'demon','mad',p.x,p.y-8-p.t*22,1,0,.65*cl(1-(p.t-.8)/1,0,1)*cl(p.t/.3,0,1),1)} // demon driven out of the farmer
  if(u.act){g.save();g.beginPath();g.rect(cellX(u)*CELL+4,cellY(u)*CELL,CELL-8,CELL);g.clip();drawAct(g,u);g.restore()} // weapons stay inside the room
  if(u.drink>0)drawItem(g,u.drinkIcon||'potion',Math.round(u.x+u.face*9),Math.round(u.y-38),1);
  if(u.paint)u.paint.forEach(p=>drawSplat(g,p.x,p.y,u.paintA==null?1:u.paintA,p.col)); // the Rogue's paint on the chapel walls
  if(u.ward!=null)drawWard(g,u.x,u.y,u.ward,u.wardHit>0)});
 // dark ritual (Necromancer below the Apothecary): the host's room goes dark, lit by candles
 live.forEach(u=>{if(u.st==='talk'&&(u.kind==='ritual'||u.kind==='rritual'||u.kind==='betray')){const h=U[u.target];if(h){const e=u.ritEnd||RITUAL_TIME*SCENE_PACE;drawRitualRoom(g,h.c*CELL,h.r*CELL,T,cl((u.tt-.6)/.8,0,1)*cl((e-.3-u.tt)/.6,0,1))}}});
 // holy light vs darkness (fills the host's room)
 live.forEach(u=>{if(u.lite==null)return;const h=U[u.target],Pr=U.priest,Wz=U.wizard;if(!h||!Pr||!Wz)return;
  const bx=h.c*CELL,by=h.r*CELL,la=cl(u.lite/.8,0,1)*(u.dark!=null?1-cl(u.dark/1.2,0,1):1);
  drawHolyLight(g,bx,by,Pr.x,Pr.y-40,la,T);
  if(u.dark!=null)drawDarkness(g,bx,by,Wz.x,Wz.y-30,8+40*cl(u.dark/1,0,1),cl(u.dark/.6,0,1)*(1-cl((u.dark-1.6)/.6,0,1)),T)});
 demons.forEach(d=>drawDemon(g,d));
 // the Alchemist's luck potion: his square and the boxes next to it glitter while it works
 live.forEach(u=>{if(idOf(u)==='alchemist'&&u.luckT>0)[[0,0],[0,1],[0,-1],[1,0],[-1,0]].forEach(d=>{const r=u.r+d[0],c=u.c+d[1];if(r>=0&&r<ROWS&&c>=0&&c<COLS&&(!d[0]&&!d[1]||at(r,c)))drawGlitter(g,c*CELL,r*CELL,T)})});
 fbs.forEach(f=>drawFireball(g,f.sx,f.sy,f.ex,f.ey,cl(f.t/.55,0,1)));
 thrown.forEach(p=>{const k=cl(p.t/.35,0,1);drawItem(g,p.icon||'potion',Math.round(lerp(p.sx,p.ex,k)),Math.round(lerp(p.sy,p.ey,k)-Math.sin(k*Math.PI)*12),1)});
 flashes.forEach(f=>{g.fillStyle='rgba('+(f.col||'255,140,40')+','+(.8*(1-f.t/.6))+')';g.fillRect(f.x,f.y,CELL,CELL)});
 zaps.forEach(z=>drawZap(g,z));
 waves.forEach(w=>drawSleepWave(g,w));
 parts.forEach(p=>{if(p.k==='h')heart(g,p.x,p.y-p.t*26);else if(p.k==='drop'){g.fillStyle=p.col||'#8fd0ff';g.fillRect(Math.round(p.x),Math.round(p.y),2,3)}
  else if(p.k==='note')drawNote(g,Math.round(p.x+Math.sin(p.t*5)*4),Math.round(p.y-p.t*16),cl((p.life-p.t)/.5,0,1));
  else if(p.k==='sick'){g.globalAlpha=cl((p.life-p.t)/.4,0,1);g.fillStyle='#7ad040';g.fillRect(Math.round(p.x),Math.round(p.y-p.t*14),2,2);g.globalAlpha=1} // sick bubbles
  else if(p.k==='z')drawZ(g,Math.round(p.x+Math.sin(p.t*3)*4),Math.round(p.y-p.t*16),cl((p.life-p.t)/.5,0,1));
  else if(p.k==='txt'){g.save();g.globalAlpha=cl((p.life-p.t)/.4,0,1);const y=Math.round(p.y-p.t*18);drawItem(g,p.icon||'coin',Math.round(p.x-12),y-4,1);g.font='bold 13px '+GAME_FONT;g.lineWidth=3;g.strokeStyle=O;g.strokeText(p.s,Math.round(p.x-4),y);g.fillStyle='#f2c84a';g.fillText(p.s,Math.round(p.x-4),y);g.restore()}
  else{const k=p.t/p.life,s=Math.max(1,7*(1-k));g.fillStyle=p.c;for(let i=0;i<8;i++){const a=i*Math.PI/4;g.fillRect(p.x+Math.cos(a)*k*28-s/2,p.y+Math.sin(a)*k*28-s/2,s,s)}}});
 bolts.forEach(b=>{const a=1-b.t/.5;g.fillStyle='rgba(255,255,255,'+(a*.6)+')';b.cells.forEach(q=>g.fillRect(q[0],q[1],CELL,CELL));
  [['rgba(140,210,255,'+a+')',6],['#fff',2]].forEach(s=>{g.strokeStyle=s[0];g.lineWidth=s[1];g.beginPath();b.p.forEach((q,i)=>i?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1]));g.stroke()})});
 // coin buttons on shop rooms (drawn on top so characters never hide them): tap to buy
 for(const id in U){const u=U[id];if(id!==dm&&(id==='apothecary'||id==='blacksmith'||deskOn(u)))drawShopCoin(g,u.c*CELL,u.r*CELL)}
 // bats and bee swarms fly on top of everything
 // the Druid's weather on board spaces (fades in and out), and a werewolf leaping out of the moonlight
 weathers.forEach(w=>{if(isOpen(w.r,w.c))drawWeather(g,w.c*CELL,w.r*CELL,w.k,w.t,cl(w.t/1,0,1)*cl((WEATHER_TIME+1-w.t)/1,0,1));const f=w.wolf;if(f){const a=cl(f.t/.3,0,1)*cl((2.6-f.t)/.4,0,1),lunge=f.t>=.9&&f.t<1.4;
  spr(g,'werewolf',lunge?'mad':'ok',f.x,w.r*CELL+FY-(lunge?4:0),f.face,0,a,1,lunge?'fwd':f.t<.6?'both':'none',f.t<.9?stepOf(f.t):0)}});
 rains.forEach(q=>drawRain(g,q.c*CELL,q.r*CELL,q.t,cl(q.t/.5,0,1)*cl((6-q.t)/.8,0,1))); // the Druid's rain storm
 swarms.forEach(s=>drawBees(g,s.c*CELL,s.r*CELL,s.t,cl(s.t/.5,0,1)*cl((BEES_TIME-s.t)/.8,0,1)));
 live.forEach(u=>{if(u.act==='bats'&&u.batTo){const A=U[u.batTo],t=u.at,bx=u.c*CELL,by=u.r*CELL;
  for(let i=0;i<6;i++){const k=cl((t-.3-i*.08)/.5,0,1);if(k<=0||t>4.8)continue;let x=bx+48+Math.sin(t*2.6+i*1.1)*32,y=by+40+Math.cos(t*3.3+i*1.9)*18;
   if(i<3&&A&&t>1.4){const d=cl((t-1.4)/.8,0,1),ax=A.c*CELL+48+Math.sin(t*3+i*2)*26,ay=A.r*CELL+36+Math.cos(t*4+i)*14;x=lerp(x,ax,d);y=lerp(y,ay,d)}
   g.save();g.globalAlpha=k*cl((4.8-t)/.5,0,1);drawBat(g,x,y,t+i*.13);g.restore()}}});
 if(hover){g.strokeStyle='#f2a93b';g.lineWidth=3;g.strokeRect(hover[1]*CELL+3,hover[0]*CELL+3,CELL-6,CELL-6)}
 if(dm){const u=U[dm],x=drag.p.x-48,y=drag.p.y-48;g.globalAlpha=.9;box(g,dm,x,y,dm==='druid'?u.r:u.weapon);boxFrame(g,x,y,{t:1,b:1,l:1,r:1});spr(g,sid(u),'ok',x+48,y+FY,1,0);g.globalAlpha=1}
 bubs.forEach(placeBub);
}
let last=0;
// One frame: update, then draw. The next frame is requested first, so a rare error can't freeze the game.
function frame(ts){requestAnimationFrame(frame);const dt=Math.min(.05,(ts-last)/1000||0);last=ts;T=ts/1000;
 try{step(dt);render();if(!tabRef.hidden)anim.forEach(f=>{try{f(T)}catch(e){console.error(e)}})}catch(e){console.error(e)}}

// ---------- input ----------
const inRect=(el,e)=>{const R=el.getBoundingClientRect();return e.clientX>=R.left&&e.clientX<=R.right&&e.clientY>=R.top&&e.clientY<=R.bottom};
function pt(e){const R=cv.getBoundingClientRect(),s=W/R.width;return{x:(e.clientX-R.left)*s,y:(e.clientY-R.top)*s,inb:inRect(cv,e)}}
const cellOf=p=>[cl(Math.floor(p.y/CELL),0,ROWS-1),cl(Math.floor(p.x/CELL),0,COLS-1)];
let lockTap=null; // a tap on a locked space (buy it on release)
cv.onpointerdown=e=>{const p=pt(e),[r,c]=cellOf(p),id=at(r,c);lockTap=null;if(!id){if(!isOpen(r,c))lockTap=[r,c];return}drag={id,sx:e.clientX,sy:e.clientY,moved:false,p};cv.setPointerCapture(e.pointerId)};
// Shop coin button in the bottom-right of a room
const onShopCoin=(u,p)=>p.x>=u.c*CELL+64&&p.x<u.c*CELL+CELL&&p.y>=u.r*CELL+64&&p.y<u.r*CELL+CELL;
cv.onpointermove=e=>{if(!drag)return;const p=pt(e);drag.p=p;
 if(Math.hypot(e.clientX-drag.sx,e.clientY-drag.sy)>8)drag.moved=true;
 hover=drag.moved&&p.inb?cellOf(p):null;tray.classList.toggle('over',drag.moved&&inRect(tray,e))};
cv.onpointerup=e=>{if(!drag){const p=pt(e);if(lockTap&&p.inb){const[r,c]=cellOf(p);if(r===lockTap[0]&&c===lockTap[1])buyCell(r,c)}lockTap=null;return}
 const d=drag,p=pt(e);drag=null;hover=null;tray.classList.remove('over');
 if(!d.moved){const u=U[d.id];
  // the coin in the bottom-right of a shop room: the Apothecary sells a potion; the Wizard writes a scroll (while his desk is there)
  if(u&&u.id==='apothecary'&&onShopCoin(u,p)){buyPotion(u);return}
  if(u&&u.id==='blacksmith'&&onShopCoin(u,p)){buyIngot(u);return}
  if(u&&deskOn(u)&&onShopCoin(u,p)){writeScroll(u);return}
  if(u&&Math.hypot(p.x-u.x,p.y-(u.y-22))<30){u.hop=.5;u.mood='happy';u.mt=1;gest(u,'up',.6)}return}
 if(inRect(tray,e))sendToShelf(d.id);
 else if(p.inb){const[r,c]=cellOf(p),u=U[d.id];if(!isOpen(r,c))toast('That space is locked. Tap it to buy it.');else if(r!==u.r||c!==u.c)relocate(d.id,r,c)}
 save()};
// Dragging a box back onto the shelf costs REMOVE_COST coins (asks first)
function sendToShelf(id){const u=U[id];if(!u)return;
 if((S.coins||0)<REMOVE_COST){toast('Moving a box back to the shelf costs '+REMOVE_COST+' coins. You have '+(S.coins||0)+'.');return}
 ask('Move the '+CH[u.id].name+' back to the shelf for '+REMOVE_COST+' coins?','Pay '+REMOVE_COST,()=>{if(!U[id]||S.coins<REMOVE_COST)return;spend(REMOVE_COST);showCoins();removeUnit(id);save()})}
cv.onpointercancel=()=>{drag=null;hover=null;tray.classList.remove('over')};
const gh=$('#ghost'),gx=gh.getContext('2d');
function firstFree(){for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++)if(isOpen(r,c)&&!at(r,c))return[r,c]}
// Shared drag behaviour for shelf buttons. onDrop(r,c) runs when dropped on a board cell; onTap when just tapped.
function draggable(b,canStart,onDrop,onTap){
 b.onpointerdown=e=>{if(!canStart())return;b.setPointerCapture(e.pointerId);td={sx:e.clientX,sy:e.clientY,moved:false}};
 b.onpointermove=e=>{if(!td)return;
  if(!td.moved&&Math.hypot(e.clientX-td.sx,e.clientY-td.sy)>8){td.moved=true;gx.clearRect(0,0,96,96);gx.drawImage(b.firstChild,0,0);gh.style.display='block'}
  if(td.moved){gh.style.left=e.clientX-42+'px';gh.style.top=e.clientY-42+'px';const p=pt(e);hover=p.inb?cellOf(p):null}};
 b.onpointerup=e=>{if(!td)return;const k=td;td=null;gh.style.display='none';hover=null;
  if(!k.moved){if(onTap)onTap()}else{const p=pt(e);if(p.inb){const[r,c]=cellOf(p);onDrop(r,c)}}};
 b.onpointercancel=()=>{td=null;gh.style.display='none';hover=null};
}
// Character boxes on the shelf (the Necromancer only once unlocked)
function buildShelf(){
 tray.querySelectorAll('.it').forEach(b=>b.remove());
 const have=ALL_CHARS.filter(id=>SHELF_CHARS.includes(id)||S.un[id]);
 tray.querySelector('.lbl').textContent='Shelf: drag a box up to the board ('+have.length+'/'+ALL_CHARS.length+' unlocked)';
 have.forEach(id=>{
  const b=document.createElement('button');b.className='it';b.dataset.id=id;b.innerHTML='<canvas width="96" height="96"></canvas>'+CH[id].name+tagImg(id);
  const t=b.firstChild.getContext('2d');t.imageSmoothingEnabled=false;box(t,id,0,0,'longsword');spr(t,id,'ok',48,FY,1,0);
  const place=(r,c,col)=>{if(id!=='apothecary'){addUnit(id,r,c,false,null,null,col);return}
   if((S.coins||0)<APOTH_PLACE_COST){toast('Setting up the Apothecary costs '+APOTH_PLACE_COST+' coins.');return}
   ask('Set up the Apothecary for '+APOTH_PLACE_COST+' coins?','Pay '+APOTH_PLACE_COST,()=>{if(at(r,c)||U[id]||S.coins<APOTH_PLACE_COST)return;spend(APOTH_PLACE_COST);showCoins();addUnit(id,r,c,false);parts.push({k:'txt',s:'-'+APOTH_PLACE_COST,x:c*CELL+48,y:r*CELL+30,t:0,life:1.4,icon:'coin'})})};
  const tap=()=>{const f=firstFree();if(f)place(f[0],f[1],id==='wizard'?pick(WIZ_RANDOM):null);else toast('No free space. Tap a locked space to buy more room.')};
  draggable(b,()=>!U[id],(r,c)=>{if(!isOpen(r,c))toast('That space is locked. Tap it to buy it.');else if(!at(r,c))place(r,c)},tap);
  b.onkeydown=e=>{if((e.key==='Enter'||e.key===' ')&&!U[id]){e.preventDefault();tap()}};
  tray.appendChild(b);
 });
 ui();
}
// Consumables: infinite use for now. Drag onto a room; its owner must be at home.
ITEMS.forEach(kind=>{
 const b=document.createElement('button');b.className='it item';b.dataset.item=kind;b.innerHTML='<canvas width="96" height="96"></canvas><span></span>';
 const t=b.firstChild.getContext('2d');t.imageSmoothingEnabled=false;t.fillStyle='#221e3c';t.fillRect(0,0,96,96);drawItem(t,kind,48,48,5);
 draggable(b,()=>S.inv[kind]>0,(r,c)=>useItem(kind,r,c)); // only draggable while you have one
 itemsEl.appendChild(b);
});
// Gold coins: shown in the item tray, they add up over time (to buy items in a later version)
const coinBox=document.createElement('div');coinBox.className='it coins';coinBox.innerHTML='<canvas width="96" height="96"></canvas><span></span>';
{const t=coinBox.firstChild.getContext('2d');t.imageSmoothingEnabled=false;t.fillStyle='#221e3c';t.fillRect(0,0,96,96);drawItem(t,'coin',48,48,6)}
itemsEl.appendChild(coinBox);
function showCoins(){coinBox.lastChild.textContent=(S.coins||0)+' coins'}
// Item counts on the tray buttons; an item you have none of is greyed out
function showItems(){itemsEl.querySelectorAll('.item').forEach(b=>{const k=b.dataset.item,n=S.inv[k]||0;b.lastChild.textContent=NAMES[k]+' x'+n;b.classList.toggle('used',n<=0)})}
// Reset: wipe the save and start a brand new game (default board, 0 coins, no items, nothing unlocked, Compendium cleared)
// Reset: tap once to arm (the button asks you to tap again), tap again within 4 seconds to wipe everything.
// No browser pop-up (some browsers and phone apps block them). Saving is switched off first so nothing can write the old game back.
let resetArm=0,resetting=false;
$('#reset').onclick=()=>{const b=$('#reset');
 if(Date.now()-resetArm>4000){resetArm=Date.now();b.textContent='Tap again to reset';b.classList.add('arm');setTimeout(()=>{if(Date.now()-resetArm>=4000){b.textContent='Reset game';b.classList.remove('arm')}},4100);return}
 resetting=true;try{localStorage.removeItem(KEY)}catch(e){}b.textContent='Resetting...';location.reload()};

// ---------- compendium ----------
const anim=[],tabRef=$('#tab-ref');
// Description bubble for Compendium tiles: hover with a mouse, or tap (phones). Tap again or anywhere else to close.
const tipEl=document.createElement('div');tipEl.id='tip';tipEl.hidden=true;document.body.append(tipEl);let tipOn=null;
function showTip(tile,k){tipEl.textContent=DESC[k]||NAMES[k]||'';tipEl.hidden=false;tipOn=tile;
 const R=tile.getBoundingClientRect(),w=Math.min(260,innerWidth-16);tipEl.style.width=w+'px';
 tipEl.style.left=cl(R.left+R.width/2-w/2,8,innerWidth-w-8)+scrollX+'px';tipEl.style.top=R.bottom+scrollY+6+'px'}
function hideTip(){tipEl.hidden=true;tipOn=null}
document.addEventListener('click',hideTip);addEventListener('resize',hideTip);
function mkc(w,h,title){const c=document.createElement('canvas');c.width=w;c.height=h;c.style.width=w*1.5+'px';c.setAttribute('role','img');c.setAttribute('aria-label',title);const x=c.getContext('2d');x.imageSmoothingEnabled=false;return[c,x]}
function diagram(k){
 const v=k==='bolt'||k==='chat',[c,x]=mkc(v?96:192,v?192:96,NAMES[k]);
 const [w,n]={friend:[[0,0],[96,0]],learn:[[96,0],[0,0]],bolt:[[0,0],[0,96]],chat:[[0,96],[0,0]]}[k];
 box(x,'wizard',w[0],w[1]);box(x,'knight',n[0],n[1],'longsword');
 if(k==='learn'){// the Knight has walked over and reads the Wizard's spellbook
  spr(x,'wizard','ok',w[0]+66,w[1]+FY,-1,0,1,1,'fwd');spr(x,'eknight','happy',w[0]+30,w[1]+FY,1,0,1,1,'hold');drawAct(x,{act:'tome',at:2,x:w[0]+30,y:w[1]+FY,face:1});
  return c}
 spr(x,'wizard','ok',w[0]+48,w[1]+FY,1,0);spr(x,'knight','ok',n[0]+48,n[1]+FY,1,0);
 if(k==='friend'){heart(x,96,30);heart(x,84,20)}
 if(k==='bolt'){x.strokeStyle='#fff';x.lineWidth=2;x.beginPath();x.moveTo(52,44);[[44,64],[56,84],[46,106],[48,128]].forEach(q=>x.lineTo(q[0],q[1]));x.stroke()}
 if(k==='chat'){x.fillStyle='#eadcb4';[[40,40],[48,40],[56,40]].forEach(q=>x.fillRect(n[0]+q[0],n[1]+q[1],4,4))}
 return c}
// Priest arrangements: [priest, other, where the priest is]
// Pair diagrams: [other, where the first character is, first character (default Priest)]
const PD={study:['wizard','right'],gossip:['wizard','left'],undead:['wizard','below'],light:['wizard','above'],zeal:['knight','above'],pray:['knight','right'],bless:['knight','below'],sermon:['knight','left'],tentacle:['knight','left'],
 crusade:['knight','above'],cleanse:['necromancer','left'],apple:['merchant','left'],slip:['merchant','left'],feast:['merchant','left'],
 fruitfall:['merchant','below'],starfruit:['merchant','below'],curse:['merchant','above'],
 apgift:['merchant','left','apothecary'],mtrade:['apothecary','left','merchant'],goldapple:['merchant','above','apothecary'],business:['merchant','below','apothecary'],
 thief:['merchant','right','knight'],lemons:['merchant','left','knight'],greenapple:['knight','above','merchant'],rumors:['knight','below','merchant'],
 bear:['apothecary','above','knight'],kgossip:['apothecary','below','knight'],kdate:['apothecary','right','knight'],bees:['apothecary','left','knight'],
 cobrew:['apothecary','right','wizard'],boom:['apothecary','left','wizard'],wdate:['apothecary','below','wizard'],imp:['apothecary','above','wizard'],purplepot:['apothecary','above','wizard'],
 bats:['apothecary','above','necromancer'],
 plant:['apothecary','left'],pstudy:['apothecary','right'],psleep:['apothecary','above'],heal:['apothecary','below'],
 sacrifice:['merchant','above','necromancer'],chant:['merchant','below','necromancer'],bloodorange:['merchant','right','necromancer'],nrot:['merchant','left','necromancer'],
 ntrade:['apothecary','left','necromancer'],ritual:['apothecary','below','necromancer'],
 banana:['wizard','above','merchant'],durian:['wizard','below','merchant'],jokes:['wizard','right','merchant'],murder:['wizard','right','merchant'],advertW:['wizard','left','merchant'],
 sleep:['knight','left','necromancer'],dknight:['knight','above','necromancer'],horde:['knight','right','necromancer'],nchat:['knight','below','necromancer'],
 purge:['priest','below','necromancer'],debate:['priest','above','necromancer'],
 duel:['wizard','above','necromancer'],craft:['wizard','above','necromancer'],golem:['wizard','left','necromancer'],tomes:['wizard','right','necromancer'],swap:['wizard','below','necromancer'],
 magictalk:['wizard','left','alchemist'],haste:['knight','left','alchemist'],
 nefarious:['apothecary','right','rogue'],poisons:['apothecary','left','rogue'],wine:['apothecary','below','rogue'],rtrip:['apothecary','above','rogue'],pinch:['merchant','left','rogue'],
 lecture:['priest','below','rogue'],vandal:['priest','above','rogue'],confess:['priest','right','rogue'],tempt:['priest','left','rogue'],
 dungeon:['knight','above','rogue'],rspar:['knight','below','rogue'],drinks:['knight','right','rogue'],wgossip:['knight','left','rogue'],
 snatch:['alchemist','above','rogue'],volatile:['alchemist','right','rogue'],shrink:['alchemist','left','rogue'],
 rgossip:['wizard','above','rogue'],spell:['wizard','below','rogue'],dressup:['wizard','right','rogue'],rsteal:['wizard','left','rogue'],
 rritual:['necromancer','above','rogue'],betray:['necromancer','below','rogue'],rcandles:['necromancer','right','rogue'],fairies:['necromancer','left','rogue'],
 nscoff:['necromancer','left','blacksmith'],smithk:['knight','left','blacksmith'],reforge:['knight','left','blacksmith'],metal:['wizard','left','blacksmith'],greenarmor:['wizard','left','blacksmith'],metaltalk:['wizard','left','blacksmith'],
 awkjoke:['merchant','left','blacksmith'],flirt:['apothecary','left','blacksmith'],childhood:['alchemist','left','blacksmith'],holyfire:['priest','left','blacksmith'],rbuy:['rogue','left','blacksmith'],metalitch:['druid','left','blacksmith']};
function pairDiagram(k){
 const[o,rl,a0]=PD[k],a=a0||'priest',v=rl==='above'||rl==='below',[c,x]=mkc(v?96:192,v?192:96,NAMES[k]);let od=o,ad=a; // od/ad = sprites drawn (can differ from the room)
 const P={left:[[0,0],[96,0]],right:[[96,0],[0,0]],above:[[0,0],[0,96]],below:[[0,96],[0,0]]}[rl],p=P[0],q=P[1],pf=v?1:(p[0]<q[0]?1:-1);
 box(x,a,p[0],p[1]);box(x,o,q[0],q[1],'longsword');
 const dots=(dx,dy)=>{x.fillStyle='#eadcb4';[0,8,16].forEach(i=>x.fillRect(dx+i,dy,4,4))};
 let pp='none',op='none',pm='ok',om='ok',low=0;
 if(k==='study'){pp='hold';op='hold'}
 if(k==='gossip'){pp='fwd';op='fwd';dots(p[0]+36,p[1]+34);dots(q[0]+36,q[1]+34)}
 if(k==='undead'){op='fwd';pp='both';spr(x,'skeleton','mad',q[0]+76,q[1]+FY,-1,0,1,1);drawGreenCircle(x,q[0]+76,q[1]+FY,1,0)}
 if(k==='light'){pp='both';op='up';om='mad'}
 if(k==='pray'){pp=op='pray';low=6}
 if(k==='bless'){pp='fwd'}
 if(k==='sermon'){pp='fwd';op='pray';dots(p[0]+36,p[1]+34)}
 if(k==='tentacle'){pm='shock';om='shock';drawTentacles(x,p[0],p[1],1,1.2,0)}
 if(k==='zeal'){om='happy'}
 // Necromancer pairs
 if(k==='sleep'){pp='both';om='sleep';x.fillStyle='rgba(200,170,255,.35)';x.fillRect(q[0]+4,q[1]+8,88,84);drawZ(x,q[0]+60,q[1]+22,1);drawZ(x,q[0]+70,q[1]+12,.7)}
 if(k==='dknight'){pp='both';od='dknight'}
 if(k==='horde'){pp='both';op='noR';om='shock';[18,80].forEach(dx=>spr(x,'skeleton','mad',q[0]+dx,q[1]+FY,dx<48?1:-1,0,1,1))}
 if(k==='nchat'){pp=op='fwd';dots(p[0]+36,p[1]+34);dots(q[0]+36,q[1]+34)}
 if(k==='purge'){pp='both';op='both';spr(x,'ghost','ok',q[0]+18,q[1]+FY-10,1,0,.75,1);spr(x,'zombie','mad',q[0]+80,q[1]+FY,-1,0,1,1,'fwd')}
 if(k==='debate'){pm=om='mad';pp=op='fwd';dots(p[0]+36,p[1]+34);dots(q[0]+36,q[1]+34)}
 if(k==='duel'){pp=op='fwd';pm=om='mad';drawZap(x,{p:[[60,50],[52,70],[62,90],[50,110],[56,134]],t:0,blk:1});drawZap(x,{p:[[36,134],[44,112],[34,90],[44,70],[38,50]],t:0,blk:0})}
 if(k==='craft'){pp=op='fwd';drawItem(x,'scroll',48,96,2);drawItem(x,'coin',70,96,2)}
 if(k==='golem'){spr(x,'golem','ok',q[0]+76,q[1]+FY,-1,0,1,1.2);pm=om='shock'}
 if(k==='tomes'){pp=op='hold'}
 if(k==='swap'){pp=op='both'}
 if(k==='crusade'){pp='both';op='up';pm=om='happy'}
 if(k==='cleanse'){pp='both';om='shock'}
 if(k==='apple'){op='fwd';pm='happy'}
 if(k==='slip'){pm='hurt';om='shock';low=0}
 if(k==='feast'){pm=om='happy';op='both'}
 if(k==='apgift'){pp='fwd';om='shock'}
 if(k==='mtrade'){pp=op='fwd';pm=om='happy'}
 if(k==='goldapple'){pp='fwd';om='happy';op='both';drawGold(x,q[0],q[1],0)}
 if(k==='business'){pp=op='fwd';dots(p[0]+36,p[1]+34);dots(q[0]+36,q[1]+34)}
 // Knight + Merchant, Knight / Wizard / Necromancer + Apothecary (p = first character's room, q = the other's)
 if(k==='thief'){pp='noR';pm='mad';om='shock';op='up';spr(x,'thief','hurt',q[0]+20,q[1]+FY,-1,0,1,1);drawItem(x,'apple',q[0]+12,q[1]+FY-26,1)}
 if(k==='lemons'){pp='fwd';pm='hurt';op='both';dots(p[0]+36,p[1]+34)}
 if(k==='greenapple'){pp='fwd';om='hurt'}
 if(k==='rumors'){pp='fwd';om='happy';op='up';dots(p[0]+36,p[1]+34)}
 if(k==='bear'){pp='fwd';od='bear';om='mad';pm='shock'}
 if(k==='kgossip'){pp=op='fwd';dots(p[0]+36,p[1]+34);dots(q[0]+36,q[1]+34)}
 if(k==='kdate'||k==='wdate'){pm=om='happy';heart(x,96,30);heart(x,v?48:96,v?96:20)}
 if(k==='bees'){pm=om='shock';drawBees(x,q[0],q[1],1.3,1)}
 if(k==='cobrew'||k==='boom'){pp='fwd';op='up';drawCauldron(x,q[0]+(rl==='right'?66:30),q[1]+FY,1);if(k==='boom'){pm=om='hurt';x.fillStyle='rgba(255,140,40,.45)';x.fillRect(q[0]+4,q[1]+4,88,88)}}
 if(k==='imp'){pp='fwd';spr(x,'demon','hurt',q[0]+74,q[1]+FY,-1,0,1,.6);drawItem(x,'blood',48,96,2)}
 if(k==='purplepot'){pp='up';pm='happy';drawItem(x,'purplepotion',48,96,2)}
 // Priest + Apothecary, Necromancer + Merchant / Apothecary
 if(k==='plant'){pp='both';om='shock';drawPlant(x,q[0]+30,q[1]+FY,2,0);x.strokeStyle='rgba(255,236,150,.9)';x.lineWidth=4;x.beginPath();x.moveTo(p[0]+56,p[1]+FY-36);x.lineTo(q[0]+30,q[1]+FY-40);x.stroke()}
 if(k==='pstudy'){pp=op='hold';dots(p[0]+36,p[1]+30)}
 if(k==='psleep'){pm='sleep';op='fwd';drawZ(x,p[0]+60,p[1]+30,1);drawZ(x,p[0]+70,p[1]+20,.7);drawItem(x,'potion',48,96,2)}
 if(k==='heal'){pp='both';op='fwd';spr(x,'farmer','happy',q[0]+26,q[1]+FY,1,0,1,1);poofTile(x,q[0]+26,q[1]+FY-24,.6,'#f2d870')}
 if(k==='sacrifice'){pp='both';om='mad';x.fillStyle='#a01828';[[20,92],[30,100],[26,112],[36,124],[22,134]].forEach(d=>x.fillRect(d[0],d[1],2,4))}
 if(k==='chant'){pp='both';om='mad';spr(x,'commoner','shock',q[0]+20,q[1]+FY,-1,-4,1,1)}
 if(k==='bloodorange'){pp='fwd';om='happy';drawItem(x,'bloodorange',96,48,2)}
 if(k==='nrot'){pp='both';om='hurt';drawRot(x,q[0],q[1],1,true)}
 if(k==='ntrade'){pp=op='fwd';drawItem(x,'bone',84,48,2);drawItem(x,'blackpotion',110,48,2)}
 if(k==='ritual'){drawRitualRoom(x,q[0],q[1],1,1);op='pray';low=0}
 if(k==='bats'){pp='both';om='mad';[[20,30],[60,20],[76,44],[30,120],[66,136]].forEach((b,i)=>drawBat(x,b[0],b[1],i*.1))}
 // Alchemist (by tags) and the Rogue (p = the first character's room, q = the other's, M = the middle between them)
 const M=v?[48,96]:[96,48],it=(i,dx)=>drawItem(x,i,M[0]+(dx||0),M[1],2);
 if(k==='magictalk'){pp=op='fwd';dots(p[0]+36,p[1]+34);dots(q[0]+36,q[1]+34)}
 if(k==='haste'){pp='fwd';om='happy';it('potion');x.fillStyle='#7ae0ff';[[30,40],[26,52],[30,64]].forEach(d=>x.fillRect(q[0]+d[0]-8,q[1]+d[1],8,2))}
 if(k==='nefarious'||k==='poisons'){pp=op='fwd';pm='happy';it(k==='nefarious'?'blackpotion':'poison')}
 if(k==='wine'){pp='fwd';om='shock';it('poison',-12);it('wine',12)}
 if(k==='rtrip'){pm='hurt';om='mad';op='both';drawSplat(x,q[0]+60,q[1]+82,1);drawSplat(x,q[0]+30,q[1]+86,1,'#7aff7a')}
 if(k==='pinch'){pm='happy';op='both';it('apple')}
 if(k==='lecture'){op='fwd';om='mad';pm='hurt';dots(q[0]+36,q[1]+34)}
 if(k==='vandal'){pm='hurt';om='mad';op='fwd';[['#d03050',20,34],['#3a8ad0',46,44],['#f2c84a',72,34]].forEach(s=>drawSplat(x,q[0]+s[1],q[1]+s[2],1,s[0]))}
 if(k==='confess'){pp='pray';dots(p[0]+36,p[1]+34);om='happy'}
 if(k==='tempt'){pm='shock';spr(x,'demon','mad',p[0]+20,p[1]+FY,1,0,1,.6)}
 if(k==='dungeon'){pm=om='happy';pp=op='up';it('coin',-24);it('artifact',-8);it('scroll',8);it('potion',24)}
 if(k==='rspar'){op='noR';pp='up';pm=om='happy';it('star')}
 if(k==='drinks'){pm=om='happy';pp=op='fwd';it('ale',-10);it('ale',10)}
 if(k==='wgossip'||k==='rgossip'){pp=op='fwd';dots(p[0]+36,p[1]+34);dots(q[0]+36,q[1]+34)}
 if(k==='snatch'){pm='happy';om='shock';it('potion');x.fillStyle='#000';x.fillRect(q[0]+65,q[1]+4,18,4)}
 if(k==='volatile'){pp='up';om='shock';['#ff8020','#ffd040','#c03020'].forEach((col,i)=>poofTile(x,q[0]+60+i*8,q[1]+60,.6,col))}
 if(k==='shrink'){pp='fwd';om='shock';it('purplepotion')}
 if(k==='spell'){op='up';pm='hurt';drawSnow(x,q[0],q[1],1);drawZap(x,{p:[[q[0]+40,q[1]+20],[q[0]+30,q[1]+34],[q[0]+42,q[1]+46]],t:0,blk:0})}
 if(k==='dressup'){pm=om='happy';od='rogue';ad='wizard_red'} // swapped looks
 if(k==='rsteal'){pm='happy';om='shock';it('coin')}
 if(k==='rritual'){drawRitualRoom(x,q[0],q[1],1,1);pp='pray'}
 if(k==='betray'){drawRitualRoom(x,q[0],q[1],1,1);om='mad';pm='shock';op='both'}
 if(k==='rcandles'){pm='happy';it('candle',-8);it('skull',8)}
 if(k==='fairies'){pp='up';op='both';pm=om='shock';[[30,40],[52,30],[72,44]].forEach((f,i)=>drawMob(x,{id:'fairy',x:q[0]+f[0],y:q[1]+f[1]+34,t:1+i,blink:0}))}
 // Blacksmith (first room) with each character
 if(k==='nscoff'){op='fwd';om='happy';pm='hurt';dots(q[0]+36,q[1]+34)}
 if(k==='smithk'||k==='metaltalk'||k==='childhood'){pp=op='fwd';pm=om='happy';dots(p[0]+36,p[1]+34);dots(q[0]+36,q[1]+34);if(k==='metaltalk')od='wizard_blue_arm'}
 if(k==='reforge'){pp='fwd';om='happy';op='noR';it('ingot')}
 if(k==='metal'){op='fwd';om='hurt';it('greenmetal')}
 if(k==='greenarmor'){pp='up';om='happy';od='wizard_blue_arm';it('greenmetal')}
 if(k==='awkjoke'){op='fwd';pm='shock';x.fillStyle='#eadcb4';[[40,30],[48,30],[56,30]].forEach(d=>x.fillRect(d[0],d[1],4,4))}
 if(k==='flirt'){pp='fwd';pm='happy';om='mad';heart(x,96,26)}
 if(k==='holyfire'){op='both';pm='shock';x.fillStyle='rgba(255,200,80,.35)';x.fillRect(p[0]+4,p[1]+4,88,88)}
 if(k==='rbuy'){op='fwd';pm='happy';it('star',-8);it('star',8)}
 if(k==='metalitch'){op='fwd';pm='roll';dots(q[0]+36,q[1]+34)}
 if(k==='fruitfall'){pm='mad';om='happy';op='up'}
 if(k==='starfruit'){pm=om='happy';op='fwd'}
 if(k==='curse'){pp='both';om='hurt'}
 if(k==='banana'){op='both';pp='fwd'}
 if(k==='durian'){om='hurt';pp='fwd'}
 if(k==='jokes'){pm=om='happy'}
 if(k==='murder'){om='hurt';pp='fwd'}
 if(k==='advertW'){pp=op='both';pm=om='happy'}
 const one=(id,pt,pose,m,face)=>{x.save();x.beginPath();x.rect(pt[0],pt[1],96,FY);x.clip();spr(x,id,m,pt[0]+48,pt[1]+FY+low,face,0,1,1,pose);x.restore()};
 one(ad,p,pp,pm,pf);one(od,q,op,om,-pf);
 if(k==='tomes'){drawAct(x,{act:'nread',at:.5,x:p[0]+48,y:p[1]+FY,face:pf});drawAct(x,{act:'tome',at:2,x:q[0]+48,y:q[1]+FY,face:-pf})}
 if(k==='swap'){swirl(x,p[0]+48,p[1]+FY,1,3,1);swirl(x,q[0]+48,q[1]+FY,1,1,1)}
 if(k==='dknight'||k==='horde'||k==='purge')swirl(x,p[0]+48,p[1]+FY,1,3,1);
 if(k==='crusade'){drawItem(x,'coin',70,100,2);drawItem(x,'artifact',26,100,2)}
 if(k==='apple')drawItem(x,'apple',p[0]+62,p[1]+FY-26,2);
 if(k==='slip'){drawItem(x,'apple',p[0]+58,p[1]+FY-3,1);x.fillStyle='rgba(26,18,38,.5)';x.fillRect(p[0]+30,p[1]+FY-2,36,3)}
 if(k==='fruitfall'){[[40,70],[56,80],[48,104]].forEach((q,i)=>drawItem(x,['apple','orange','banana'][i],q[0],q[1],1))}
 if(k==='starfruit')drawItem(x,'starfruit',62,96,2);
 if(k==='apgift')drawItem(x,'potion',96,52,2);
 if(k==='mtrade'){drawItem(x,'apple',84,48,2);drawItem(x,'potion',108,48,2)}
 if(k==='goldapple'){swirl(x,p[0]+48,p[1]+FY,1,2,1);drawItem(x,'goldapple',62,96,2)}
 if(k==='business'){drawItem(x,'coin',48,96,2)}
 if(k==='curse'){drawRot(x,q[0],q[1],1);x.strokeStyle='rgba(140,220,90,.9)';x.lineWidth=4;x.beginPath();x.moveTo(52,52);x.lineTo(50,150);x.stroke()}
 if(k==='banana')drawItem(x,'banana',48,120,5);
 if(k==='durian'){drawItem(x,'durian',48,150,2);[[40,124],[50,118],[60,124]].forEach(d=>{x.fillStyle='#8aba5a';x.fillRect(d[0],d[1],2,6)})}
 if(k==='jokes'){x.fillStyle='#f2c84a';[[64,24],[72,18],[118,24],[126,18]].forEach(d=>x.fillRect(d[0],d[1],4,4))}
 if(k==='murder'){x.fillStyle='rgba(200,40,40,.35)';x.fillRect(q[0]+4,q[1]+4,88,88)}
 if(k==='advertW'){x.fillStyle='#eadcb4';[[30,22],[126,22]].forEach(d=>x.fillRect(d[0],d[1],28,10));drawItem(x,'coin',96,30,2)}
 if(k==='feast'){spr(x,'noble1','happy',q[0]+24,q[1]+72,1,0,1,.8);spr(x,'noble2','happy',q[0]+72,q[1]+72,-1,0,1,.8);drawTable(x,q[0]+48,q[1]+82,1)}
 if(k==='cleanse'){spr(x,'dknight','shock',q[0]+78,q[1]+FY,-1,0,1,1);x.strokeStyle='rgba(255,236,150,.9)';x.lineWidth=4;x.beginPath();x.moveTo(p[0]+56,p[1]+FY-36);x.lineTo(q[0]+78,q[1]+FY-26);x.stroke()}
 if(k==='study'){drawAct(x,{act:'holy',at:.5,x:p[0]+48,y:p[1]+FY,face:pf});drawAct(x,{act:'read',at:.5,x:q[0]+48,y:q[1]+FY,face:-pf})}
 if(k==='light')drawHolyLight(x,p[0],p[1],p[0]+48,p[1]+FY-40,.7,0);
 if(k==='bless'){drawAct(x,{act:'sprinkle',at:0,x:p[0]+48,y:p[1]+FY,face:1});x.fillStyle='#8fd0ff';[[60,96],[54,90],[66,86],[58,80]].forEach(d=>x.fillRect(p[0]+d[0]-16,d[1]-40,2,3))}
 if(k==='zeal'){x.fillStyle='#f2d870';[[30,120],[66,128],[40,150],[60,110]].forEach(d=>x.fillRect(d[0],d[1],3,3))}
 return c}
// A puff of smoke for Compendium tiles (k goes 0 to 1)
function poofTile(c,x,y,k,col){const s=Math.max(1,7*(1-k));c.fillStyle=col||'#6a9a3a';for(let i=0;i<8;i++){const a=i*Math.PI/4;c.fillRect(x+Math.cos(a)*k*28-s/2,y+Math.sin(a)*k*28-s/2,s,s)}}
const flash=(on,tt)=>on&&Math.floor(tt*14)%2?.2:1;
function idleTile(kind,wp){
 const wide=kind==='fireball'||kind==='raise'||kind==='nscroll'||kind==='wave'||kind==='alcpotion',[c,x]=mkc(wide?192:96,96,NAMES[kind]+(wp?' ('+wp+')':''));
 anim.push(t=>{x.clearRect(0,0,wide?192:96,96);
  if(kind==='read'||kind==='magic'){box(x,'wizard',0,0);spr(x,'wizard','ok',48,FY,1,0,1,1,poseOf(kind,t));drawAct(x,{act:kind,at:t,x:48,y:FY,face:1})}
  else if(kind==='demon'){const tt=t%4.6,sk=sinkOf(tt);box(x,'wizard',0,0);
   if(tt<2.9){x.save();x.beginPath();x.rect(0,0,96,FY);x.clip();spr(x,'wizard',tt>1.6?'hurt':'ok',32,FY+sk*46,1,0,flash(tt>1.6&&tt<2.1,tt),1,poseOf('demon',tt));x.restore()}
   drawDemon(x,{x:62,y:FY,t:tt,dir:-1})}
  else if(kind==='prac'){const u={act:'prac',at:t,x:48,y:FY,face:1,weapon:wp};box(x,'knight',0,0,wp);
   if(wp==='shield'){u.x=36;spr(x,'squire','ok',70,FY,-1,0,1,1,'noR');drawAct(x,{act:'prac',at:t+.5,x:70,y:FY,face:-1,weapon:'wood',form:'squire'});spr(x,'knight','ok',36+actDx(u),FY,1,0,1,1,'noR');drawAct(x,u);return}spr(x,'knight','ok',48+actDx(u),FY,1,0,1,1,'noR');x.save();x.beginPath();x.rect(4,0,88,96);x.clip();drawAct(x,u);x.restore()}
  else if(kind==='orc'){// orc appears first, then the knight walks in from the left and fights
   const tt=t%5.4,fight=tt>1.3&&tt<3.9,kx=tt<.8?null:Math.min(30,4+(tt-.8)*52),hurt=tt>2.4&&tt<2.9,u={act:'prac',at:tt-1.3,x:30,y:FY,face:1,weapon:'longsword'};box(x,'knight',0,0,'longsword');
   if(tt<3.9){const b=(tt>1.6&&tt<2.1)||(tt>3&&tt<3.5);spr(x,'orc',b?'hurt':'mad',68,FY,-1,0,flash(b,tt))}
   if(tt<.4)poofTile(x,68,FY-20,tt/.4);
   if(kx!=null)spr(x,'knight',hurt?'hurt':'ok',kx+(fight?actDx(u):0),FY,1,fight||kx>=30?0:Math.sin(tt*14)*1,flash(hurt,tt),1,fight?'noR':'none',fight||kx>=30?0:stepOf(tt));
   if(fight)drawAct(x,u)}
  else if(kind==='horse'){const tt=t%7.2,on=tt<6.3,kx=on?lerp(30,46,cl(tt/1.2,0,1)):30,hop=tt>4.6&&tt<5.1?-Math.abs(Math.sin((tt-4.6)/.5*Math.PI))*8:0;
   box(x,'knight',0,0,'spear');if(on)drawHorse(x,96,FY,tt);
   spr(x,'knight',hop?'happy':'ok',kx,FY,1,(tt<1.2?Math.sin(tt*14)*1:0)+hop,1,1,on?poseOf('horse',tt):'none',tt<1.2?stepOf(tt):0);
   if(on)drawAct(x,{act:'horse',at:tt,x:kx,y:FY,face:1})}
  else if(kind==='cat'){const tt=t%6.4;box(x,'wizard',0,0);if(tt<5.6)drawCat(x,0,0,tt,1);spr(x,'wizard','ok',30,FY,1,0)}
  else if(kind==='spar'){// friendly sparring in the knight's room
   const tt=t%4.8,on=tt>.3&&tt<3.6,cheer=tt>3.6&&tt<4.4,hop=cheer?-Math.abs(Math.sin((tt-3.6)/.5*Math.PI))*8:0,u={act:'prac',at:tt-.3,x:64,y:FY,face:-1,weapon:'longsword'};
   box(x,'knight',0,0,'longsword');
   spr(x,'wizard',cheer?'happy':'ok',28,FY,1,hop,1,1,cheer?'both':on?poseOf('magic',tt):'none');
   spr(x,'knight',cheer?'happy':'ok',64+(on?actDx(u):0),FY,-1,hop,flash(tt>1.5&&tt<1.9,tt),1,cheer?'both':on?'noR':'none');
   if(on){drawAct(x,{act:'magic',at:tt,x:28,y:FY,face:1});drawAct(x,u);drawWard(x,28,FY,tt-.3,tt>2.6&&tt<3)}
   if(tt>1.5&&tt<2)poofTile(x,64,FY-22,(tt-1.5)/.5,'#4fb0ff');if(tt>2.6&&tt<3.1)poofTile(x,44,FY-24,(tt-2.6)/.5,'#bfe8ff')}
  else if(kind==='fireball'){// scroll on the Wizard: the fireball destroys the room next door
   const tt=t%3.6,hit=tt>1.25;box(x,'wizard',0,0);
   spr(x,'wizard',tt<1.3?'mad':'ok',36,FY,1,0,1,1,poseOf('fireball',tt));drawAct(x,{act:'fireball',at:tt,x:36,y:FY,face:1});
   if(!hit){box(x,'knight',96,0,'longsword');spr(x,'knight','ok',144,FY,-1,0)}else{x.fillStyle='#1a1428';x.fillRect(96,0,96,96)}
   if(tt>.7&&tt<1.25)drawFireball(x,50,46,144,52,(tt-.7)/.55);
   if(hit&&tt<1.85){x.fillStyle='rgba(255,140,40,'+(.8*(1-(tt-1.25)/.6))+')';x.fillRect(96,0,96,96);['#ff8020','#ffd040','#c03020'].forEach((col,i)=>poofTile(x,144+(i-1)*10,52,(tt-1.25)/.6,col))}}
  else if(kind==='glow'){box(x,'knight',0,0,'longsword');drawGlow(x,48,FY,t);spr(x,'knight','happy',48,FY,1,0);x.globalCompositeOperation='lighter';spr(x,'knight','happy',48,FY,1,0,.25+.15*Math.sin(t*4));x.globalCompositeOperation='source-over';glowSparkles(x,48,FY,t)}
  else if(kind==='teleport'){// potion on the Wizard: drink, vanish, later portal back home
   const tt=t%4.4;box(x,'wizard',0,0);
   if(tt<1){spr(x,'wizard','ok',48,FY,1,0,1,1,tt<.8?'up':'none');if(tt<.8)drawItem(x,'potion',57,FY-38,1);if(tt>.8)poofTile(x,48,FY-20,(tt-.8)/.2,'#c890ff')}
   else if(tt>2.2){const pa=tt<3.6?1:cl(1-(tt-3.6)/.4,0,1);x.globalAlpha=pa;x.fillStyle='#6a4cc2';x.fillRect(6,FY-58,36,58);x.fillStyle=Math.floor(t*8)%2?'#8fe0ff':'#c890ff';x.fillRect(8,FY-56,32,54);x.globalAlpha=1;
    const k=cl((tt-2.4)/.4,0,1),wx=tt<3?24:lerp(24,48,cl((tt-3)/.6,0,1));if(tt>2.4)spr(x,'wizard','happy',wx,FY,1,tt>3&&tt<3.6?Math.sin(tt*14)*1.5:0,k)}}
  else if(kind==='flex'){const tt=t%4;box(x,'knight',0,0,'longsword');const u={act:'flex',at:tt,x:48,y:FY,face:1};spr(x,'knight','happy',48,FY,1,0,1,1,tt<3.4?poseOf('flex',tt):'none');if(tt<3.4)drawAct(x,u)}
  // ---- Priest idles ----
  else if(kind==='pray1'){const tt=t%5.6,on=tt>.3&&tt<4.6;box(x,'priest',0,0);drawCeilingLight(x,0,0,cl((tt-.3)/1,0,1)*cl((5-tt)/.8,0,1),t);
   x.save();x.beginPath();x.rect(0,0,96,FY);x.clip();spr(x,'priest','ok',48,FY+(on?6:0),1,0,1,1,on?'pray':'none');x.restore()}
  else if(kind==='farmer'||kind==='exorcise'){const ex=kind==='exorcise',tt=t%8,fa=tt<.5?tt/.5:tt>7?cl(1-(tt-7)/.5,0,1):1,saved=ex?tt>4.6:true,sh=ex&&tt>2.4&&tt<4.6;
   box(x,'priest',0,0);spr(x,'farmer',ex&&!saved?'mad':tt>5.8&&tt<7?'happy':'ok',26+(sh?Math.round(Math.sin(t*40)):0),FY,1,0,fa,1);
   spr(x,'priest','ok',62,FY,-1,0,1,1,poseOf(kind,tt));drawAct(x,{act:kind,at:tt,x:62,y:FY,face:-1});
   if(!ex&&tt>4.5&&tt<5.8){x.fillStyle='#8fd0ff';for(let i=0;i<4;i++){const k=((tt*2+i*.25)%1);x.fillRect(Math.round(50-k*24),Math.round(FY-34+Math.sin(k*Math.PI)*-10+k*14),2,3)}}
   if(ex&&tt>3.2&&tt<5){const k=tt-3.2;spr(x,'demon','mad',26,FY-8-k*22,1,0,.65*cl(1-(k-.8)/1,0,1)*cl(k/.3,0,1),1)}}
  else if(kind==='tithe'){const tt=t%3.4;box(x,'priest',0,0);spr(x,'priest',tt>1.8?'happy':'ok',48,FY,1,0,1,1,tt<3?'both':'none');if(tt<3)drawAct(x,{act:'tithe',at:tt,x:48,y:FY,face:1});
   if(tt>1.8){const k=tt-1.8;x.globalAlpha=cl((1.4-k)/.4,0,1);drawItem(x,'coin',38,Math.round(28-k*12),1);x.font='bold 13px '+GAME_FONT;x.lineWidth=3;x.strokeStyle=O;x.strokeText('+'+TITHE,46,Math.round(32-k*12));x.fillStyle='#f2c84a';x.fillText('+'+TITHE,46,Math.round(32-k*12));x.globalAlpha=1}}
  // ---- Necromancer idles ----
  else if(kind==='spirits'){const tt=t%5.6;box(x,'necromancer',0,0);spr(x,'necromancer','ok',48,FY,1,0,1,1,tt<5?'both':'none');if(tt<5)drawAct(x,{act:'spirits',at:tt,x:48,y:FY,face:1})}
  else if(kind==='candles'){const tt=t%6;box(x,'necromancer',0,0);if(tt<5.5)drawActBack(x,{act:'candles',at:tt,x:48,y:FY});spr(x,'necromancer','ok',48,FY,1,0,1,1,poseOf('candles',tt))}
  else if(kind==='lightning'){const tt=t%5;box(x,'necromancer',0,0);spr(x,'necromancer','ok',48,FY,1,0,1,1,tt<4.5?'hold':'none');if(tt<4.5)drawAct(x,{act:'lightning',at:tt,x:48,y:FY,face:1})}
  else if(kind==='raise'||kind==='nscroll'){// Necromancer raises a skeleton next door; the Knight (a Fighter) beats it (also the spell scroll on him)
   const tt=t%5.2,d=tt-.4,u={act:'prac',at:d-1.4,x:144-22,y:FY,face:1,weapon:'longsword'},fight=d>1.4&&d<3.6;
   box(x,'necromancer',0,0);box(x,'knight',96,0,'longsword');spr(x,'necromancer','ok',48,FY,1,0,1,1,tt<3.6?'both':'none');if(tt<3.6)drawAct(x,{act:'raise',at:tt,x:48,y:FY,face:1});
   if(d>0&&d<3.6){const sx=166,rise=cl((d-.2)/.9,0,1),hit=(d>2.2&&d<2.6)||(d>3&&d<3.4);if(d<1.4)drawGreenCircle(x,sx,FY,cl(d/.4,0,1),t);x.save();x.beginPath();x.rect(sx-24,FY-60,48,60);x.clip();spr(x,'skeleton',hit?'hurt':'mad',sx,FY+(1-rise)*44,-1,0,flash(hit,tt),1);x.restore()}
   spr(x,'knight',d>.9&&d<1.6?'shock':d>3.6&&d<4.4?'happy':'ok',u.x+(fight?actDx(u):0),FY,1,0,1,1,fight?'noR':'none');if(fight){x.save();x.beginPath();x.rect(100,0,88,96);x.clip();drawAct(x,u);x.restore()}
   if(d>3.6&&d<4.1)poofTile(x,166,FY-14,(d-3.6)/.5,'#e8e4d0')}
  // ---- items on the Priest and Necromancer ----
  else if(kind==='banish'){const tt=t%4.4;box(x,'priest',0,0);spr(x,'priest',tt>3.6?'happy':'ok',58,FY,-1,0,1,1,poseOf('banish',tt));if(tt<3.6)drawAct(x,{act:'banish',at:tt,x:58,y:FY,face:-1,ghost:{x:24,y:FY}})}
  else if(kind==='wings'){const tt=t%6;box(x,'priest',0,0);if(tt>.8)drawWings(x,48,FY,t);spr(x,'priest',tt>.8?'happy':'ok',48,FY,1,0,1,1,tt<.8?'up':'none');if(tt<.8)drawItem(x,'potion',57,FY-38,1);if(tt>.8&&tt<1.3)poofTile(x,48,FY-24,(tt-.8)/.5,'#f2d870')}
  // ---- Fruit Merchant idles ----
  else if(kind==='advert'){const tt=t%4.5;box(x,'merchant',0,0);spr(x,'merchant','happy',48,FY,1,tt<.3||tt>3.6?0:-Math.abs(Math.sin(tt*3))*3,1,1,poseOf('advert',tt));
   if(tt>.3&&tt<3){x.fillStyle='#eadcb4';x.fillRect(56,14,34,14);x.fillStyle='#1a1733';x.fillRect(59,18,4,4);x.fillRect(65,18,4,4);x.fillRect(71,18,4,4);x.fillStyle='#eadcb4';x.fillRect(58,28,4,3)}}
  else if(kind==='sell'){const tt=t%4.4;box(x,'knight',0,0,'spear');spr(x,'knight',tt>1.3&&tt<3?'happy':'ok',66,FY,-1,0);spr(x,'merchant','happy',34,FY,1,0,1,1,tt>.4&&tt<1.6?'fwd':'none');
   if(tt>.4&&tt<1.8)drawItem(x,'apple',tt<1.3?48:58,FY-26,1);
   if(tt>1.8&&tt<3.2){const k=tt-1.8;x.globalAlpha=cl((1.4-k)/.4,0,1);drawItem(x,'coin',26,Math.round(30-k*12),1);x.font='bold 13px '+GAME_FONT;x.lineWidth=3;x.strokeStyle=O;x.strokeText('+'+SELL_GAIN,34,Math.round(34-k*12));x.fillStyle='#f2c84a';x.fillText('+'+SELL_GAIN,34,Math.round(34-k*12));x.globalAlpha=1}}
  else if(kind==='mob'){const tt=t%6;box(x,'merchant',0,0);const hit=tt>1.9&&tt<4.4&&Math.floor(tt*6)%3===0;
   spr(x,'merchant',hit?'hurt':tt>1.2?'shock':'ok',30,FY,1,0,flash(hit,tt));
   [0,1,2].forEach(i=>{const fx=tt<1.2?lerp(96,58+i*12,tt/1.2):tt>4.8?lerp(58+i*12,100,(tt-4.8)/1):58+i*12;spr(x,'farmer','mad',Math.round(fx),FY-i*5,-1,0,1,1,tt>1.5&&tt<4.6?'both':'none')});
   if(tt>1.6&&tt<4.6){const k=((tt-1.6)*2)%1;drawItem(x,Math.floor(tt*2)%2?'apple':'orange',Math.round(lerp(66,32,k)),Math.round(FY-30-Math.sin(k*Math.PI)*10),1)}}
  // ---- shops ----
  else if(kind==='apoth'){const tt=t%4;box(x,'apothecary',0,0);spr(x,'apothecary',tt>1&&tt<2.4?'happy':'ok',48,FY,1,tt>1&&tt<1.5?-Math.sin((tt-1)/.5*Math.PI)*6:0,1,1,tt>.8&&tt<2?'fwd':'none');
   if(tt>1&&tt<2.6)drawItem(x,'potion',62,Math.round(FY-40-(tt-1)*8),1);if(tt>.6&&tt<1.4){x.fillStyle='rgba(255,255,255,.6)';x.fillRect(40,10,16,16)}}
  else if(kind==='desk'){const tt=t%4;box(x,'wizard',0,0);drawDesk(x,0,0);spr(x,'wizard','ok',56,FY,-1,0,1,1,tt<2.6?'fwd':'none');
   if(tt<2.6){x.fillStyle='#ffffff';x.fillRect(Math.round(30+Math.sin(tt*8)*3),50,1,6)}if(tt>2&&tt<3.6)drawItem(x,'scroll',36,Math.round(40-(tt-2)*10),1)}
  // ---- Apothecary ----
  else if(kind==='trip'||kind==='tripbreak'){const tt=t%3.6,down=tt>.6&&tt<2.2;box(x,'apothecary',0,0);
   if(kind==='tripbreak'&&tt>.7){const k=cl((tt-.7)/.35,0,1);if(k<1)drawItem(x,'potion',Math.round(lerp(56,70,k)),Math.round(lerp(60,80,k)),1);else drawSplat(x,70,82,cl((3.4-tt)/1,0,1))}
   x.save();x.beginPath();x.rect(0,0,96,FY);x.clip();spr(x,'apothecary',down?'hurt':tt<.6&&tt>.3?'shock':'ok',48,FY+(down?12:0),1,tt>.3&&tt<.6?-4:0);x.restore()}
  else if(kind==='abrew'){const tt=t%5;box(x,'apothecary',0,0);spr(x,'apothecary','ok',60,FY,-1,0,1,1,poseOf('abrew',tt));drawAct(x,{act:'abrew',at:tt,x:60,y:FY,face:-1})}
  else if(kind==='herbs'){const tt=t%5.4,a=Math.min(tt,5);box(x,'apothecary',0,0);spr(x,'apothecary','ok',64,FY,-1,0,1,1,poseOf('herbs',a));drawAct(x,{act:'herbs',at:a,x:64,y:FY,face:-1})}
  else if(kind==='apcoins'||kind==='appotion'){const tt=t%3.4,it=kind==='apcoins'?'potion':'scroll',gain=kind==='apcoins'?'coin':'potion';box(x,'apothecary',0,0);spr(x,'apothecary',tt>1?'happy':'ok',48,FY,1,tt>1&&tt<1.5?-Math.sin((tt-1)/.5*Math.PI)*6:0);
   if(tt<1)drawItem(x,it,48,Math.round(10+tt*30),2);else if(tt<2.4)drawItem(x,gain,62,Math.round(40-(tt-1)*10),2)}
  else if(kind==='farm'){const tt=t%9,g=cl(tt/7,0,1),hv=tt>7;box(x,'farmer',0,0);drawField(x,0,0,Math.floor(t/9)%5===4?'apple':'wheat',hv?.05:g,t);spr(x,'farmer',hv?'happy':'ok',40,FY,1,hv?-Math.abs(Math.sin(tt*6))*5:0,1,1,hv?poseOf('harvest',tt):poseOf('tend',tt))}
  // ---- Priest tells the Knight he is braver; anyone waving to a neighbor ----
  else if(kind==='braver'){const tt=t%5;box(x,'knight',0,0,'longsword');spr(x,'priest',tt>3.4?'happy':'ok',30,FY,1,0,1,1,tt>.3&&tt<1.6?'fwd':'none');
   spr(x,'knight',tt>1.8?'happy':'ok',66,FY,-1,tt>1.8&&tt<2.2?-4:0,1,1,tt>1.8&&tt<3.4?(Math.floor(tt*2.5)%2?'flex2':'flex'):'none');
   if(tt>.3&&tt<1.8){x.fillStyle='#eadcb4';x.fillRect(8,12,62,13);x.font='bold 9px '+GAME_FONT;x.fillStyle='#1a1733';x.fillText('Braver than I.',11,21)}}
  else if(kind==='wave'){const tt=t%3.6,on=tt<2.4;box(x,'knight',0,0,'shield');box(x,'priest',96,0);
   spr(x,'knight',on?'happy':'ok',48,FY,1,0,1,1,on?poseOf('wave',tt):'none');spr(x,'priest',tt>.8&&tt<2.2?'happy':'ok',144,FY,-1,tt>.8&&tt<1.1?-4:0,1,1,tt>.8&&tt<2.2?'up':'none')}
  // ---- funeral, Alchemist, Rogue ----
  else if(kind==='funeral'){box(x,'priest',0,0);drawGrave(x,0,0);x.save();x.beginPath();x.rect(0,0,96,FY);x.clip();
   [['wizard_blue',18,80],['merchant',78,80]].forEach(q=>spr(x,q[0],'hurt',q[1],q[2]+6,q[1]<48?1:-1,0,1,.8,'pray'));spr(x,'priest','hurt',40,FY+6,1,0,1,1,'pray');x.restore()}
  else if(kind==='alcbrew'||kind==='research'||kind==='smoke'){const tt=t%5.4,a=kind,u={act:a,at:Math.min(tt,5),x:a==='alcbrew'?46:52,y:FY,face:a==='alcbrew'?1:-1};box(x,'alchemist',0,0);drawAlembic(x,0,0,t);
   spr(x,'alchemist_f',a==='smoke'&&tt>2.6?'hurt':a==='smoke'&&tt>1?'shock':'ok',u.x,FY,u.face,0,1,1,poseOf(a,u.at));x.save();x.beginPath();x.rect(4,0,88,96);x.clip();drawAct(x,u);x.restore()}
  else if(kind==='alcpotion'){const tt=t%4;box(x,'alchemist',0,0);box(x,'knight',96,0,'spear');spr(x,'alchemist_m','happy',48,FY,1,0,1,1,tt<.8?'up':'none');spr(x,'knight','happy',144,FY,-1,0);
   if(tt<.8)drawItem(x,'potion',57,FY-38,1);else{x.fillStyle='rgba(242,200,74,'+(.18+.08*Math.sin(t*4))+')';x.fillRect(0,0,192,96);glowSparkles(x,144,FY,t)}}
  else if(kind==='alcscroll'){const tt=t%3;box(x,'alchemist',0,0);spr(x,'alchemist_m',tt<.7?'shock':'mad',48,FY,1,0,1,1,'both');drawAct(x,{act:'tear',at:tt,x:48,y:FY,face:1})}
  else if(kind==='stone'){box(x,'merchant',0,0);drawGoldCell(x,0,0,t);spr(x,'merchant','happy',48,FY,1,0);drawItem(x,'artifact',30,40,2);drawItem(x,'coin',66,40,2)}
  else if(kind==='elixir'){const tt=t%4;box(x,'alchemist',0,0);spr(x,'alchemist_m','happy',48,FY,1,tt>2.4?-(tt-2.4)*6:0,tt>2.4?cl(1-(tt-2.4)/1.2,0,1):1,1,poseOf('retire',tt));drawAct(x,{act:'retire',at:tt,x:48,y:FY,face:1})}
  else if(kind==='assassin'){const tt=t%4,hit=tt>1.6&&tt<2.4;box(x,'knight',0,0,'spear');spr(x,'rogue',tt>2.4?'happy':'ok',28+Math.min(tt,1.2)*10,FY,1,0,tt<1.2?.3:1,1,tt>1.2&&tt<2?'fwd':'none',tt<1.2?stepOf(tt):0);
   if(tt<2.6)spr(x,'knight',hit?'hurt':'ok',66,FY,-1,0,flash(hit,tt),1);else poofTile(x,66,FY-20,cl((tt-2.6)/.5,0,1),'#c03030');if(hit){x.fillStyle='rgba(200,40,40,.3)';x.fillRect(0,0,96,96)}}
  else if(kind==='daggers'){box(x,'rogue',0,0);spr(x,'rogue','ok',30,FY,1,0,1,1,poseOf('daggers',1+t%2));drawAct(x,{act:'daggers',at:1+t%3,x:30,y:FY,face:1})}
  else if(kind==='smokebomb'){const tt=t%4,gone=tt>.4&&tt<2.8,px=tt<1.6?30:66;box(x,'rogue',0,0);if(!gone)spr(x,'rogue','happy',px,FY,1,0);
   if(tt>.4&&tt<1)poofTile(x,30,FY-20,(tt-.4)/.6,'#8a8a96');if(tt>2.8&&tt<3.4)poofTile(x,66,FY-20,(tt-2.8)/.6,'#8a8a96')}
  else if(kind==='disguise'){const tt=t%4;box(x,'rogue',0,0);if(tt<1.6)spr(x,'rogue','ok',48,FY,1,0);else spr(x,'wizard_blue','happy',48,FY,1,0);if(tt>1.4&&tt<2)poofTile(x,48,FY-20,(tt-1.4)/.6,'#8a8a96')}
  else if(kind==='count'){box(x,'rogue',0,0);spr(x,'rogue','happy',40,FY,1,0,1,1,poseOf('count',t));drawAct(x,{act:'count',at:t,x:40,y:FY,face:1})}
  else if(kind==='spook'){const tt=t%4;box(x,'wizard',0,0);spr(x,'wizard',tt>1.4&&tt<3?'shock':'ok',60,FY,-1,tt>1.4&&tt<1.8?-6:0);spr(x,'rogue',tt>1.4?'happy':'ok',28,FY,1,0,tt<1.4?.25:1,1,tt>1.4&&tt<2.4?'both':'none');
   if(tt>1.4&&tt<2.6){x.fillStyle='#eadcb4';x.fillRect(10,14,30,13);x.font='bold 10px '+GAME_FONT;x.fillStyle='#1a1733';x.fillText('BOO!',13,24)}}
  else if(kind==='roguemage'){const tt=t%4;box(x,'rogue',0,0);spr(x,'rogue','happy',48,FY,1,0,1,1,tt<.8?'up':'both');if(tt<.8)drawItem(x,'scroll',57,FY-38,1);else{swirl(x,48,FY,t,1,1);if(tt>2)drawItem(x,'artifact',58,Math.round(FY-40-(tt-2)*8),1)}}
  // ---- a customer comes in to buy ----
  else if(kind==='mcust'||kind==='acust'||kind==='promo'){const tt=t%6,f=kind==='mcust',who=kind==='acust'?'apothecary':'merchant',cx=tt<1.4?lerp(-8,30,tt/1.4):tt>4.4?lerp(30,-10,cl((tt-4.4)/1.2,0,1)):30;box(x,who,0,0);
   x.save();x.beginPath();x.rect(0,0,96,FY);x.clip();spr(x,'commoner',tt>2.8&&tt<4.4?'happy':'ok',Math.round(cx),FY,tt>4.4?-1:1,tt>2.8&&tt<3.2?-4:0,1,1,'none',tt<1.4||tt>4.4?stepOf(tt):0);
   spr(x,who,tt>2.8?'happy':'ok',64,FY,-1,0,1,1,tt>1.6&&tt<2.8?'fwd':'none');x.restore();
   const it=f?'apple':'potion';if(tt>1.6&&tt<2.6)drawItem(x,it,52,FY-30,1);else if(tt>=2.6&&tt<4.4)drawItem(x,it,Math.round(cx+8),FY-30,1);if(tt>2.8&&tt<3.8)drawItem(x,'coin',58,Math.round(FY-44-(tt-2.8)*8),1)}
  // ---- Alchemist and Rogue secrets ----
  else if(kind==='twopot'){const tt=t%3.4;box(x,'apothecary',0,0);spr(x,'apothecary',tt>1?'happy':'ok',40,FY,1,tt>1&&tt<1.5?-Math.sin((tt-1)/.5*Math.PI)*6:0,1,1,tt>.6&&tt<1.6?'fwd':'none');if(tt>1&&tt<2.8){drawItem(x,'potion',58,Math.round(FY-40-(tt-1)*8),2);drawItem(x,'potion',76,Math.round(FY-34-(tt-1)*8),2)}}
  else if(kind==='madsci'){box(x,'alchemist',0,0);drawAlembic(x,0,0,t);spr(x,'alchemist_mad',Math.floor(t)%3===2?'happy':'ok',40,FY,1,0,1,1,poseOf('alcbrew',2+t))}
  else if(kind==='beast'){const tt=t%5,on=tt>.6,hit=tt>1.6&&tt<2.2;box(x,'merchant',0,0);
   spr(x,on?'beast':'alchemist_mad',on?'mad':'ok',30,FY,1,0,1,1,tt>1.4&&tt<2?'fwd':on?'both':'none');if(tt>.4&&tt<.9)poofTile(x,30,FY-20,(tt-.4)/.5,'#7aff7a');
   if(tt<2.4)spr(x,'merchant',hit?'hurt':on?'shock':'ok',68,FY,-1,0,flash(hit,tt),1);else if(tt<2.9)poofTile(x,68,FY-20,(tt-2.4)/.5,'#c03030');if(hit){x.fillStyle='rgba(200,40,40,.3)';x.fillRect(0,0,96,96)}}
  else if(kind==='fourmage'){const tt=t%4;box(x,'alchemist',0,0);spr(x,'alchemist_m','happy',34,FY,1,0,1,1,tt<1.6?'fwd':'none');spr(x,'wizard_blue',tt>1.6?'happy':'ok',68,FY,-1,tt>1.6&&tt<2?-4:0);
   if(tt<1.6)drawItem(x,'potion',Math.round(lerp(48,60,tt/1.6)),FY-26,1);[[4,28],[78,28],[44,24],[44,82]].forEach(q=>TAG_ICON.mage.forEach(r=>{x.fillStyle=r[4];x.fillRect(q[0]+r[0]*2,q[1]+r[1]*2,r[2]*2,r[3]*2)}))} // four Mage stars around him
  else if(kind==='tiny'){const hx=48+Math.sin(t*2.6)*30;box(x,'rogue',0,0);spr(x,'rogue','happy',Math.round(hx),FY,Math.cos(t*2.6)>0?1:-1,0,1,.6,'none',stepOf(t))}
  else if(kind==='graveyard'){box(x,'rogue',0,0);drawGraveyard(x,0,0,t);spr(x,'rogue','ok',62,FY,-1,0)}
  // ---- Druid ----
  else if(kind==='grove'||kind==='animals'||kind==='weather'||kind==='spirit'){const tt=t%6,u={act:kind,at:Math.min(tt,5.6),x:kind==='grove'?30:48,y:FY,face:kind==='grove'?-1:1};box(x,'druid',0,0);drawBearPet(x,80,FY,-1,t,false);
   spr(x,'druid',kind==='spirit'&&tt>1?'happy':'ok',u.x,FY,u.face,0,1,1,poseOf(kind,Math.max(1.3,u.at)));x.save();x.beginPath();x.rect(4,0,88,96);x.clip();drawAct(x,u);x.restore()}
  else if(kind==='dburied'){box(x,'druid',0,0);drawMound(x,0,0,t);drawBearPet(x,80,FY,-1,0,false)}
  else if(kind==='drevive'){const tt=t%4;box(x,'druid',0,0);if(tt<1.6){drawMound(x,0,0,t);if(tt<1)drawItem(x,'scroll',48,Math.round(20+tt*30),2);else poofTile(x,48,70,(tt-1)/.6,'#6aba4a')}else spr(x,'druid','happy',48,FY,1,tt<2.1?-Math.sin((tt-1.6)/.5*Math.PI)*6:0)}
  else if(kind==='dpotion'||kind==='dscroll'){const tt=t%5,a=kind==='dpotion'?'stash':'storm';box(x,'druid',0,0);if(a==='storm'&&tt>.6)drawRain(x,0,0,t,cl((tt-.6)/.5,0,1)*cl((5-tt)/.6,0,1));
   spr(x,'druid','happy',40,FY,1,0,1,1,poseOf(a,Math.min(tt,2.3)));drawAct(x,{act:a,at:Math.min(tt,2.3),x:40,y:FY,face:1})}
  // the Druid's weather: a room with that weather on it
  else if(kind.startsWith('wx:')){const k=kind.slice(3),R={blizzard:['knight','knight'],sandstorm:['wizard','wizard_blue'],sunshine:['merchant','merchant'],rain:['priest','priest_m'],overgrowth:['apothecary','apothecary'],moonlight:['necromancer','necromancer'],decay:['rogue','rogue_bandit'],infest:['alchemist','alchemist_m']}[k];
   box(x,R[0],0,0,'longsword');spr(x,R[1],k==='decay'||k==='infest'?'hurt':k==='sunshine'?'happy':'ok',48,FY,1,0);drawWeather(x,0,0,k,k==='overgrowth'?t%6:t,1)}
  else if(kind==='story'){box(x,'priest',0,0);drawWeather(x,0,0,'rain',t,.7);spr(x,'priest_f','ok',48,FY,1,0,1,1,'hold');drawAct(x,{act:'story',at:t,x:48,y:FY,face:1})}
  else if(kind==='wolfkill'){const tt=t%4,f=tt<1.1?-1:0;box(x,'knight',0,0,'longsword');drawWeather(x,0,0,'moonlight',t,1);if(tt<1.6)spr(x,'knight',tt>.5?'shock':'ok',62,FY,-1,0,tt>1.1?(Math.floor(tt*14)%2?.2:1):1);else poofTile(x,62,FY-20,cl((tt-1.6)/.6,0,1),'#a02020');
   spr(x,'werewolf',tt>.9&&tt<1.4?'mad':'ok',Math.round(lerp(10,46,cl(tt/.9,0,1))),FY,1,f,1,1,tt>.9&&tt<1.4?'fwd':'both',tt<.9?stepOf(tt):0)}
  else if(kind==='archdruid'){const tt=t%4;box(x,'druid',0,0);if(tt<1)drawItem(x,'artifact',48,Math.round(10+tt*30),2);if(tt>1.4){x.fillStyle='rgba(150,255,170,'+(.25+.1*Math.sin(t*3))+')';x.beginPath();x.arc(48+13,FY-41,7,0,Math.PI*2);x.fill()}
   spr(x,tt>1.4?'druid_arch':'druid',tt>1.4?'happy':'ok',48,FY,-1,0,1,1,tt>1&&tt<2.2?'both':'none');if(tt>1&&tt<1.6)poofTile(x,48,FY-30,(tt-1)/.6,'#9affb0')}
  else if(kind==='ddiscount'){const tt=t%4;box(x,'apothecary',0,0);spr(x,'apothecary','happy',40,FY,1,0,1,1,tt>.8&&tt<2?'fwd':'none');drawEagle(x,74,FY-8,-1,t,true);if(tt>1&&tt<2.6)drawItem(x,'potion',56,Math.round(FY-40-(tt-1)*8),2);drawShopCoin(x,0,0)}
  else if(kind==='court'){const tt=t%5;box(x,'monarch',0,0);drawRoomLife(x,'monarch',0,0,t);spr(x,Math.floor(t/5)%2?'monarch_f':'monarch_m','ok',36,FY,1,0,1,1,poseOf('court',tt))}
  // ---- Blacksmith ----
  else if(kind==='forgework'||kind==='smelt'||kind==='coal'||kind==='pour'||kind==='leadgold'){const tt=t%5,hx=kind==='smelt'||kind==='coal'?44:52,u={act:kind,at:1+tt*.9,x:hx,y:FY,face:-1,smeltWhat:Math.floor(t/5)%2?'sword':'armor'};box(x,'blacksmith',0,0);drawRoomLife(x,'blacksmith',0,0,t);
   spr(x,kind==='smelt'?'blacksmith_f':'blacksmith_m',(kind==='pour'||kind==='leadgold')&&u.at>3.4?'happy':'ok',hx,FY,-1,0,1,1,poseOf(kind,u.at));drawAct(x,u)}
  else if(kind==='bpotion'){const tt=t%4;box(x,'blacksmith',0,0);spr(x,'blacksmith_m',tt>.8&&tt<2.8?'mad':'ok',48,FY,1,0,1,1,tt>.8&&tt<2.4?'fwd':'none');drawItem(x,'potion',tt<.8?48:Math.round(lerp(60,60,1)),tt<.8?Math.round(10+tt*30):Math.round(FY-28-cl((tt-1.6)/.8,0,1)*50),2)}
  else if(kind==='bscroll'){const tt=t%5;box(x,'blacksmith',0,0);if(tt<.8){spr(x,'blacksmith_m','ok',48,FY,1,0);drawItem(x,'scroll',48,Math.round(10+tt*30),2)}
   else spr(x,'blacksmith_m','shock',48,FY,Math.floor(tt*2.5)%2?1:-1,-Math.abs(Math.sin(tt*7.5))*5,1,1,poseOf('dance',tt))}
  else if(kind==='ingotshop'){const tt=t%4;box(x,'blacksmith',0,0);drawRoomLife(x,'blacksmith',0,0,t);spr(x,'blacksmith_f',tt>1&&tt<2.4?'happy':'ok',60,FY,-1,0,1,1,tt>.8&&tt<2?'fwd':'none');if(tt>1&&tt<2.6)drawItem(x,'ingot',44,Math.round(FY-40-(tt-1)*8),2);drawShopCoin(x,0,0)}
  else if(kind==='reinforce'){const tt=t%4;box(x,'apothecary',0,0);spr(x,'apothecary',tt>1?'happy':'ok',48,FY,1,tt>1&&tt<1.5?-4:0);if(tt<1)drawItem(x,'ingot',48,Math.round(10+tt*30),2);else if(tt<1.6)poofTile(x,48,FY-24,(tt-1)/.6,'#cfd6e0');
   if(tt>1.2){TAG_ICON.fighter.forEach(r=>{x.fillStyle=r[4];x.fillRect(64+r[0]*2,30+r[1]*2,r[2]*2,r[3]*2)})}}
  else if(kind==='paladin'){const tt=t%3.4,u={act:'prac',at:tt,x:48,y:FY,face:1,paladin:true};box(x,'knight',0,0,'longsword');spr(x,'paladin','ok',48+actDx(u),FY,1,0,1,1,'noR');x.save();x.beginPath();x.rect(4,0,88,96);x.clip();drawAct(x,u);x.restore()}
  else if(kind==='adventure'){const tt=t%5,a=tt<1.6?1:cl(1-(tt-1.6)/.6,0,1);box(x,'blacksmith',0,0);spr(x,'blacksmith_m','happy',30,FY,1,0,1,1,tt<1.6?'both':'none');
   spr(x,'knight','happy',58,FY,-1,0,a,.8);spr(x,'rogue_ninja','happy',78,FY,-1,0,a,.8);if(tt>2.8){drawItem(x,'coin',60,40,2);if(tt>3.4)drawItem(x,'scroll',78,40,2)}}
  // ---- easter eggs (only shown once found) ----
  else if(kind==='blackwiz'){box(x,'wizard',0,0);spr(x,'wizard_black','ok',48,FY,1,0)}
  else if(kind==='bronze'){box(x,'knight',0,0,'longsword');spr(x,'knight_bronze','ok',48,FY,1,0)}
  else if(kind==='skulls'){box(x,'necromancer',0,0);drawSkulls(x,0,0);spr(x,'necromancer','ok',48,FY,1,0)}
  else if(kind==='massprayer'){const tt=t%6,on=tt>.6&&tt<5.4;box(x,'priest',0,0);if(on)drawRoomGlow(x,0,0,cl((tt-.6)/.6,0,1)*cl((5.4-tt)/.6,0,1),t);
   x.save();x.beginPath();x.rect(0,0,96,FY);x.clip();
   [['knight',16,74],['wizard_blue',33,78],['necromancer',63,78],['merchant',80,74]].forEach(q=>spr(x,q[0],'ok',q[1],q[2]+(on?6:0),q[1]<48?1:-1,0,1,.8,on?'pray':'none'));
   spr(x,'priest','ok',48,FY+(on?6:0),1,0,1,1,on?'pray':'none');x.restore()}
  else if(kind==='monkey'){const tt=t%3,hx=48+Math.sin(t*1.7)*24,j=-Math.abs(Math.sin(t*5))*8;box(x,'merchant',0,0);spr(x,'monkey','happy',Math.round(hx),FY,Math.cos(t*1.7)>0?1:-1,j,1,1,tt>1.8?'up':'none');if(tt>1.8)drawItem(x,'banana',Math.round(hx+9),Math.round(FY-38+j),1)}
  else if(kind==='backwards'){const tt=t%4;box(x,'merchant',0,0);spr(x,'merchant',tt<.8?'shock':'ok',48,FY,1,0,1,1,tt>.8?'fwd':'none');if(tt<.8){drawItem(x,'potion',57,FY-38,1)}
   else{x.fillStyle='#eadcb4';x.fillRect(8,12,80,14);x.font='bold 9px '+GAME_FONT;x.fillStyle='#1a1733';x.fillText('!tiurf hserF',16,22)}}
  else if(kind==='brew'){const tt=t%5;box(x,'wizard',0,0);spr(x,'wizard',tt>3?'happy':'ok',36,FY,1,0,1,1,tt<4.2?poseOf('brew',tt):'none');if(tt<4.2)drawAct(x,{act:'brew',at:tt,x:36,y:FY,face:1})}
  else if(kind==='forge'){const tt=t%5,mx=48;box(x,'necromancer',0,0);spr(x,'wizard',tt>3.2?'happy':'ok',20,FY,1,0,1,1,tt>.4&&tt<2.8?'fwd':'none');spr(x,'necromancer',tt>3.2?'happy':'ok',76,FY,-1,0,1,1,tt>.4&&tt<2.8?'fwd':'none');
   if(tt>.4&&tt<3.4){swirl(x,mx,FY-16,t,1,1);swirl(x,mx,FY-16,t+1,2,.6);if(tt>2.4)drawItem(x,Math.floor(t/5)%2?'potion':'scroll',mx,Math.round(FY-40-(tt-2.4)*10),1)}}
  else if(kind==='relic'){const tt=t%4.4;box(x,'priest',0,0);spr(x,'priest',tt>2.4?'happy':'ok',30,FY,1,0,1,1,poseOf('relic',tt));drawAct(x,{act:'relic',at:tt,x:30,y:FY,face:1});
   if(tt<2){spr(x,'necromancer',tt>1.2?'shock':'ok',74,FY,-1,0,flash(tt>1.2,tt),1)}else if(tt<2.5)poofTile(x,74,FY-24,(tt-2)/.5,'#f2d870');
   if(tt>1.2&&tt<2){x.strokeStyle='rgba(255,236,150,.9)';x.lineWidth=4;x.beginPath();x.moveTo(40,FY-40);x.lineTo(74,FY-24);x.stroke()}}
  else if(kind==='sniff'){const tt=t%4,k=cl((tt-1.3)/.35,0,1);box(x,'necromancer',0,0);if(tt>1.65)drawSplat(x,80,38,cl((3.8-tt)/1,0,1));
   spr(x,'necromancer',tt>1&&tt<2.6?'hurt':'ok',40,FY,1,0,1,1,poseOf('sniff',tt));if(tt<1.1)drawItem(x,'potion',48,FY-36,1);else if(tt>1.3&&tt<1.65)drawItem(x,'potion',Math.round(lerp(50,80,k)),Math.round(lerp(54,38,k)-Math.sin(k*Math.PI)*12),1)}
 });
 return c}
// Things a scene gives you, shown as small icons in the bottom-left of its Compendium tile
const GAINS={pour:['ingot'],leadgold:['coin'],adventure:['coin','scroll','artifact'],ingotshop:['ingot'],nefarious:['coin'],poisons:['coin'],wine:['coin'],promo:['coin'],twopot:['potion'],dungeon:['coin','artifact','scroll','potion'],bloodorange:['coin'],ntrade:['potion'],heal:['coin'],roguemage:['artifact'],stone:['coin'],greenapple:['coin'],cobrew:['potion'],mcust:['coin'],acust:['coin'],farm:['coin'],apcoins:['coin'],appotion:['potion'],starfruit:['coin'],durian:['coin'],advertW:['coin'],tithe:['coin'],crusade:['coin','artifact'],craft:['scroll'],forge:['scroll','potion'],brew:['potion'],sell:['coin'],apple:['coin'],apoth:['potion'],desk:['scroll']};
const ICONURL={};function iconURL(k){if(!ICONURL[k]){const c=document.createElement('canvas');c.width=16;c.height=16;const x=c.getContext('2d');drawItem(x,k,8,9,1);ICONURL[k]=c.toDataURL()}return ICONURL[k]}
const ITEMLBL={archdruid:'artifact',bpotion:'potion',bscroll:'scroll',dpotion:'potion',dscroll:'scroll',drevive:'scroll',reinforce:'ingot',nscroll:'scroll',alcpotion:'potion',alcscroll:'scroll',stone:'artifact 80%',elixir:'artifact 20%',spook:'potion',roguemage:'scroll',apcoins:'potion',appotion:'scroll',monkey:'scroll',backwards:'potion',fireball:'scroll',glow:'scroll',banish:'scroll',raise:'scroll',teleport:'potion',flex:'potion',wings:'potion',sniff:'potion',relic:'artifact'};
function buildRef(t){if(t)compTab=t;anim.length=0;hideTip();
 const b=$('#refs');b.innerHTML='';
 // % chance (or a short label) in the top right corner
 const fmt=p=>{if(typeof p==='string')return p;const v=p*100;return(v<10&&Math.abs(v-Math.round(v))>.05?v.toFixed(1):Math.round(v))+'%'};
 const ev=(1-ODDS.spar)*(1-ODDS.hangout),arr=k=>(k==='friend'?ODDS.visitFriend:ODDS.visit)*ev,pv=ODDS.visit*(1-ODDS.hangout);
 const W=ODDS.wizard,K=ODDS.knight,PR=ODDS.priest,NE=ODDS.necromancer,MR=ODDS.merchant,AP=ODDS.apothecary;
 // How to draw each tile, and its chance. D = Wizard/Knight diagram, P = other pair diagram, I = animated tile
 const D=k=>()=>diagram(k),P=k=>()=>pairDiagram(k),I=(k,w)=>()=>idleTile(k,w);
 const T={friend:[D('friend'),arr('friend')],learn:[D('learn'),arr('learn')],bolt:[D('bolt'),arr('bolt')],chat:[D('chat'),arr('chat')],spar:[I('spar'),ODDS.visit*ODDS.spar],
  study:[P('study'),pv],gossip:[P('gossip'),pv],undead:[P('undead'),pv],light:[P('light'),pv],
  zeal:[P('zeal'),'+60%'],crusade:[P('crusade'),'2%'],pray:[P('pray'),pv],bless:[P('bless'),pv],sermon:[P('sermon'),pv*(1-ODDS.tentacle)],tentacle:[P('tentacle'),pv*ODDS.tentacle],
  sleep:[P('sleep'),pv],dknight:[P('dknight'),pv],horde:[P('horde'),pv],nchat:[P('nchat'),pv],
  purge:[P('purge'),pv],debate:[P('debate'),pv],cleanse:[P('cleanse'),'Death Knight'],
  duel:[P('duel'),pv/2],craft:[P('craft'),pv/2],golem:[P('golem'),pv],tomes:[P('tomes'),pv],swap:[P('swap'),pv],forge:[I('forge'),'1% any side'],
  apple:[P('apple'),pv*ODDS.feast*(1-ODDS.slip)],slip:[P('slip'),pv*ODDS.feast*ODDS.slip],feast:[P('feast'),pv*ODDS.feast],
  read:[I('read'),W.read],magic:[I('magic'),W.magic],demon:[I('demon'),W.demon],brew:[I('brew'),'1% Merchant'],
  orc:[I('orc'),K.orc],horse:[I('horse'),K.horse],cat:[I('cat'),ODDS.eknightCat],
  pray1:[I('pray1'),PR.pray],farmer:[I('farmer'),PR.farmer],tithe:[I('tithe'),PR.tithe],exorcise:[I('exorcise'),PR.exorcise],
  spirits:[I('spirits'),NE.spirits],candles:[I('candles'),NE.candles],lightning:[I('lightning'),NE.lightning],raise:[I('raise'),NE.raise],
  mcust:[I('mcust'),MR.customer],acust:[I('acust'),AP.customer],
  braver:[I('braver'),'5% any side'],goldapple:[P('goldapple'),pv],business:[P('business'),pv],wave:[I('wave'),ODDS.wave],
  thief:[P('thief'),pv],lemons:[P('lemons'),pv],greenapple:[P('greenapple'),pv],rumors:[P('rumors'),pv],
  bear:[P('bear'),pv],kgossip:[P('kgossip'),pv],kdate:[P('kdate'),pv],bees:[P('bees'),pv],
  plant:[P('plant'),pv],pstudy:[P('pstudy'),pv],psleep:[P('psleep'),pv],heal:[P('heal'),pv],funeral:[I('funeral'),'Fighter dies'],
  sacrifice:[P('sacrifice'),pv],chant:[P('chant'),pv],bloodorange:[P('bloodorange'),pv*ODDS.bloodorange],nrot:[P('nrot'),pv],ntrade:[P('ntrade'),pv],ritual:[P('ritual'),pv],
  alcbrew:[I('alcbrew'),ODDS.alchemistIdle.alcbrew],research:[I('research'),ODDS.alchemistIdle.research],smoke:[I('smoke'),ODDS.alchemistIdle.smoke],
  alcpotion:[I('alcpotion')],alcscroll:[I('alcscroll')],stone:[I('stone')],elixir:[I('elixir'),'secret'],
  assassin:[I('assassin'),'0.5% any side'],daggers:[I('daggers'),ODDS.rogue.daggers],smokebomb:[I('smokebomb'),ODDS.rogue.smokebomb],disguise:[I('disguise'),ODDS.rogue.disguise],count:[I('count'),ODDS.rogue.count],
  spook:[I('spook')],roguemage:[I('roguemage')],
  cobrew:[P('cobrew'),pv],boom:[P('boom'),pv],wdate:[P('wdate'),pv],imp:[P('imp'),pv*ODDS.imp],purplepot:[P('purplepot'),pv*(1-ODDS.imp)],bats:[P('bats'),pv],
  advert:[I('advert'),MR.advert],sell:[I('sell'),MR.sell],mob:[I('mob'),MR.mob],
  fireball:[I('fireball')],glow:[I('glow')],banish:[I('banish')],teleport:[I('teleport')],flex:[I('flex')],wings:[I('wings')],sniff:[I('sniff')],relic:[I('relic')],
  apoth:[I('apoth'),APOTH_COST+' coins'],desk:[I('desk'),DESK_COST+' coins'],
  fruitfall:[P('fruitfall'),pv*ODDS.fruitfall],starfruit:[P('starfruit'),pv*(1-ODDS.fruitfall)],curse:[P('curse'),pv],
  banana:[P('banana'),pv],durian:[P('durian'),pv],jokes:[P('jokes'),pv*(1-ODDS.murder)],murder:[P('murder'),pv*ODDS.murder],advertW:[P('advertW'),pv],
  massprayer:[I('massprayer'),'5% (4 neighbors)'],monkey:[I('monkey')],backwards:[I('backwards')],
  trip:[I('trip'),AP.trip],tripbreak:[I('tripbreak'),AP.tripbreak],abrew:[I('abrew'),AP.abrew],herbs:[I('herbs'),AP.herbs],
  apgift:[P('apgift'),pv],mtrade:[P('mtrade'),pv*(1-ODDS.farm)],farm:[I('farm'),pv*ODDS.farm],apcoins:[I('apcoins')],appotion:[I('appotion')],
  blackwiz:[I('blackwiz'),'secret'],bronze:[I('bronze'),'secret'],skulls:[I('skulls'),'secret'],
  // Alchemist by tags, his secrets, the scroll on the Necromancer, the Rogue's neighbor scenes and secrets
  magictalk:[P('magictalk'),pv],promo:[I('promo'),ODDS.promo],haste:[P('haste'),'+50%'],nscroll:[I('nscroll')],
  twopot:[I('twopot'),'secret'],madsci:[I('madsci'),'secret'],beast:[I('beast'),'secret'],fourmage:[I('fourmage'),'secret'],tiny:[I('tiny'),'secret'],graveyard:[I('graveyard'),'secret'],
  tempt:[P('tempt'),pv],betray:[P('betray'),pv],
  // Druid and Blacksmith
  grove:[I('grove'),ODDS.druid.grove],animals:[I('animals'),ODDS.druid.animals],weather:[I('weather'),ODDS.druid.weather],dburied:[I('dburied'),'on death'],
  dpotion:[I('dpotion')],dscroll:[I('dscroll')],drevive:[I('drevive')],spirit:[I('spirit'),'secret'],
  forgework:[I('forgework'),ODDS.smith.forgework],smelt:[I('smelt'),ODDS.smith.smelt],coal:[I('coal'),ODDS.smith.coal],pour:[I('pour'),ODDS.smith.pour],bpotion:[I('bpotion')],bscroll:[I('bscroll')],leadgold:[I('leadgold'),'secret'],ingotshop:[I('ingotshop'),INGOT_COST+' coins'],reinforce:[I('reinforce')],paladin:[I('paladin'),'secret'],adventure:[I('adventure'),'20% (2+ Fighters)'],
  nscoff:[P('nscoff'),pv],smithk:[P('smithk'),pv*ODDS.smithtalk],reforge:[P('reforge'),pv*(1-ODDS.smithtalk)],metal:[P('metal'),pv],greenarmor:[P('greenarmor'),'4 Mages'],metaltalk:[P('metaltalk'),'armor'],
  awkjoke:[P('awkjoke'),pv],flirt:[P('flirt'),pv],childhood:[P('childhood'),pv],holyfire:[P('holyfire'),pv],rbuy:[P('rbuy'),pv],
  // Druid weather, familiars, Archdruid; the Monarch
  metalitch:[P('metalitch'),pv],story:[I('story'),Math.round(ODDS.rainStory*100)+'% in rain'],wolfkill:[I('wolfkill'),ODDS.werewolf],archdruid:[I('archdruid')],ddiscount:[I('ddiscount'),'secret'],court:[I('court'),'100%']};
 for(const k in WX_NAMES)T['wx:'+k]=[I('wx:'+k),ODDS.visit*ODDS.weather[k]];
 ROGUE_SCENES.forEach(k=>{if(!T[k])T[k]=[P(k),pv]});
 WEAPONS.forEach(w=>T['prac:'+w]=[I('prac',w),K.prac]);
 // Tabs, one per character type, with "found / total" (hidden easter eggs count in the total)
 // Only characters you have unlocked get a tab, and neighbor scenes only show once both characters are unlocked
 const unl=id=>id==='anyone'||!!TAG_NAMES[id]||SHELF_CHARS.includes(id)||!!S.un[id],pairsOf=t=>t.pairs.filter(k=>(PAIR_WITH[k]||[]).every(unl)),allOf=t=>[...pairsOf(t),...t.idle,...t.items];
 const tabs=COMP_TABS.filter(t=>unl(t.id)),tab=tabs.find(t=>t.id===compTab)||tabs[0],pairs=pairsOf(tab),bar=document.createElement('div');bar.className='ctabs';
 tabs.forEach(t=>{const all=allOf(t),btn=document.createElement('button');btn.className='ctab'+(t===tab?' on':'');
  btn.innerHTML=t.name+tagImg(t.id)+' <small>'+all.filter(k=>S.seen[k]).length+'/'+all.length+'</small>';btn.onclick=()=>buildRef(t.id);bar.append(btn)});
 const vis=[...new Set(tabs.flatMap(allOf))],n=foundCount(),left=DISCOVER_EVERY-n%DISCOVER_EVERY,info=document.createElement('p');info.className='cinfo';
 info.textContent='Discovered '+vis.filter(k=>S.seen[k]).length+' of '+vis.length+' so far (more appear as you unlock characters). Every '+DISCOVER_EVERY+' discoveries pay '+DISCOVER_REWARD+' coins ('+left+' more to the next reward).';
 // Tags: what this character's class tags are and what changes them
 const tn=document.createElement('p');tn.className='cinfo';tn.innerHTML='<b>Tags:</b> '+(TAG_NOTES[tab.id]||'').replace(/\{(\w+)\}/g,(m,c)=>tagOf(c));
 b.append(bar,info,tn);
 // A grid of tiles (easter eggs only once found)
 const grid=(keys,items)=>{const d=document.createElement('div');d.className='cg';
  // easter eggs show once found, or once revealed by the Priest's studies
  keys.filter(k=>!EGGS.includes(k)||S.seen[k]||S.revealed[k]).forEach(k=>{const[make,p]=T[k],tile=document.createElement('div'),s=document.createElement('span');
   tile.className='tile'+(S.seen[k]?' seen':'')+(EGGS.includes(k)?' egg':'');tile.dataset.k=k;
   tile.onpointerenter=e=>{if(e.pointerType==='mouse')showTip(tile,k)};tile.onpointerleave=e=>{if(e.pointerType==='mouse')hideTip()};
   tile.onclick=e=>{e.stopPropagation();if(tipOn===tile&&e.pointerType!=='mouse')hideTip();else showTip(tile,k)};s.className='pct';s.textContent=fmt(ITEMLBL[k]&&items?ITEMLBL[k]:p);tile.append(make(),s);
   if(GAINS[k]){const gn=document.createElement('span');gn.className='gain';GAINS[k].forEach(i=>{const im=document.createElement('img');im.src=iconURL(i);im.alt=i;gn.append(im)});tile.append(gn)}
   d.append(tile)});return d};
 const count=keys=>keys.filter(k=>S.seen[k]).length+' / '+keys.length;
 const head=(text,keys)=>{const h=document.createElement('h2');h.className='sec';h.textContent=text+'  '+count(keys);return h};
 // With neighbors: one sub-section per neighbor, in alphabetical order
 if(pairs.length)b.append(head('With neighbors',pairs));
 // (tag:mage etc. = "with a Mage": scenes that go by tag, not by character)
 const other=k=>{const w=PAIR_WITH[k]||[];return w.find(c=>c!==tab.id)||w[0]},nameOf=id=>id==='anyone'?'anyone':TAG_NAMES[id]?TAG_NAMES[id].slice(2):(COMP_TABS.find(t=>t.id===id)||{name:id}).name;
 [...new Set(pairs.map(other))].sort((a,c)=>nameOf(a).localeCompare(nameOf(c))).forEach(id=>{const keys=pairs.filter(k=>other(k)===id),h=document.createElement('h3');
  h.className='sub';h.innerHTML='with '+(id==='anyone'?'anyone':TAG_NAMES[id]?TAG_NAMES[id]+tagOf(id.slice(4)):'the '+nameOf(id)+tagImg(id))+' <small>'+count(keys)+'</small>';b.append(h,grid(keys))});
 const items=tab.items.filter(k=>!EGGS.includes(k)),eggs=tab.items.filter(k=>EGGS.includes(k));
 b.append(head('Idle activities',tab.idle),grid(tab.idle),head('Items and shops',items),grid(items,1));
 // Secrets: their own group at the bottom; hidden until found but counted
 if(eggs.length){b.append(head('Secrets',eggs));if(eggs.some(k=>S.seen[k]||S.revealed[k]))b.append(grid(eggs,1));
  else{const q=document.createElement('p');q.className='cinfo';q.textContent='Not found yet. Keep exploring!';b.append(q)}}
}
let compTab='knight';
document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>{
 document.querySelectorAll('.tab').forEach(x=>x.classList.toggle('on',x===b));
 $('#tab-board').hidden=b.dataset.t!=='board';tabRef.hidden=b.dataset.t!=='ref';
 if(b.dataset.t==='ref')buildRef(compTab);else{hideTip();fitLabels()}});

// ---------- state ----------
function ui(){document.querySelectorAll('.it[data-id]').forEach(b=>b.classList.toggle('used',!!U[b.dataset.id]))}
function save(){if(resetting)return;try{const b={};for(const i in U)if(i!=='farmer')b[i]=[U[i].r,U[i].c,U[i].weapon,TEMP_FORM[U[i].form]?null:U[i].form,U[i].color,U[i].backwards?1:0,U[i].skin||0,U[i].mageTag?1:0,U[i].dead?1:0,U[i].reinforced?1:0,U[i].paladin?1:0,U[i].armor?1:0,U[i].fam||0,U[i].arch?1:0,U[i].trait||0];localStorage.setItem(KEY,JSON.stringify({boxes:b,un:S.un,coins:S.coins||0,spent:S.spent||0,inv:S.inv,seen:S.seen,rewarded:S.rewarded||0,cells:S.cells,bought:S.bought||0,revealed:S.revealed,goldCell:S.goldCell}))}catch(e){}}
function load(){let d=null;try{d=JSON.parse(localStorage.getItem(KEY))}catch(e){}
 if(d){S.un=d.un||{};S.coins=d.coins||0;S.inv=Object.assign({scroll:0,potion:0,artifact:0,ingot:0},d.inv);S.spent=d.spent||0;S.seen=d.seen||{};S.rewarded=d.rewarded!=null?d.rewarded:Math.floor(ALL_KEYS.filter(k=>S.seen[k]).length/DISCOVER_EVERY)}
 // Bought board spaces. An older save made before spaces were locked: any space that already holds a box stays open, free.
 S.cells=(d&&d.cells)||[];S.bought=(d&&d.bought)||0;S.revealed=(d&&d.revealed)||{};S.goldCell=(d&&d.goldCell)||null;
 if(d&&d.boxes&&!d.cells)for(const i in d.boxes){const q=d.boxes[i],k=q[0]+','+q[1];if(!isOpen(q[0],q[1]))S.cells.push(k)}
 showCoins();showItems();checkUnlocks();
 buildShelf();
 if(d&&d.boxes){for(const i in d.boxes)if(CH[i]){const q=d.boxes[i];addUnit(i,q[0],q[1],true,q[2],q[3],q[4],q[6]!=null?q[6]:0);const v=U[i];if(q[5])v.backwards=true;if(q[7])v.mageTag=true;if(q[9])v.reinforced=true;if(q[10])v.paladin=true;if(q[11])v.armor=true;if(i==='druid')v.fam=q[12]||'bear';if(q[13])v.arch=true;if(q[14])v.trait=q[14];if(q[8]){v.dead=true;v.st='dead'}setLabel(v)}} // [8] buried Druid, [9] ingot, [10] Paladin, [11] green mage armor, [12] Druid's animal, [13] Archdruid, [14] generous / greedy Monarch
 else{addUnit('knight',1,1,true);addUnit('wizard',1,3,true)}
 save();ui()}
load();requestAnimationFrame(frame);
