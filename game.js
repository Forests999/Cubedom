const cv=$('#cv'),g=cv.getContext('2d'),W=COLS*CELL,H=ROWS*CELL,tray=$('#tray'),itemsEl=$('#items'),bub=$('#bub');cv.width=W;cv.height=H;g.imageSmoothingEnabled=false;
const U={};let S={un:{},coins:0},drag=null,td=null,hover=null,parts=[],bolts=[],demons=[],cats=[],fbs=[],flashes=[],thrown=[],splats=[],coinT=0,bubU=null,T=0;

// ---------- units ----------
const at=(r,c)=>Object.keys(U).find(i=>U[i].r===r&&U[i].c===c);
const show=f=>{f.vis=true},hide=f=>{f.vis=false;f.keep=false};
const cellX=u=>Math.floor(u.x/CELL),cellY=u=>Math.floor((u.y-1)/CELL); // the room a character is standing in right now
// Where a is relative to b (by their home rooms): left, right, above, below, or null if not neighbors
function rel(a,b){if(a.r===b.r&&a.c===b.c-1)return 'left';if(a.r===b.r&&a.c===b.c+1)return 'right';if(a.c===b.c&&a.r===b.r-1)return 'above';if(a.c===b.c&&a.r===b.r+1)return 'below';return null}
// Which neighbor interaction two characters have, from PAIRS in data.js
function pairKind(a,b){if(!a||!b)return null;let t=PAIRS[a.id+'>'+b.id];if(t){const r=rel(a,b);return r?t[r]:null}t=PAIRS[b.id+'>'+a.id];if(t){const r=rel(b,a);return r?t[r]:null}return null}
// Name label text plus the small class symbol (sword = Fighter, star = Mage, coin = Merchant)
const tagImg=id=>CLASS[id]?'<img class="tag" src="'+tagURL(CLASS[id])+'" alt="'+CLASS[id]+'">':'';
function setLabel(u){u.lb.innerHTML='';u.lb.append(u.form==='eknight'?'Eldritch Knight':CH[u.id].name);u.lb.insertAdjacentHTML('beforeend',tagImg(u.id))}
// A spot beside character h, at least d pixels away, inside h's room (prefers side s, switches if there's no room)
function standBy(h,d,s){const hx=h.c*CELL,lo=hx+14,hi=hx+82;s=s||(h.x-hx<48?1:-1);let x=h.x+s*d;if(x<lo||x>hi){s=-s;x=h.x+s*d}return cl(x,lo,hi)}
function label(u){u.lb.style.left=(u.c*CELL+6)/W*100+'%';u.lb.style.top=(u.r*CELL+6)/H*100+'%'}
function addUnit(id,r,c,quiet,weapon,form,color){
 const lb=document.createElement('div');lb.className='lb';$('#labels').appendChild(lb);
 U[id]={id,r,c,lb,weapon:id==='knight'?(weapon||pick(WEAPONS)):null,form:form||null,color:id==='wizard'?(color||(r===0&&c===0?'black':pick(WIZ_RANDOM))):null, // dragged to the top-left on first placement = hidden black outfit (tapping the shelf picks a normal color)
  act:null,at:0,orc:null,dur:0,x:c*CELL+48,y:r*CELL+FY,face:1,st:'idle',wait:1.5+Math.random()*2,path:[],fxs:[],al:1,sk:1,hop:0,blink:0,mood:'ok',mt:0,gp:null,gt:0,mv:false,glow:0,drink:0,kneel:false,tp:false,after:null,hosting:null,target:null,t:0,tt:0,ev:{}};
 setLabel(U[id]);label(U[id]);if(!quiet){poof(c*CELL+48,r*CELL+FY-16);save()}ui();
}
// Clear everything an interaction leaves on a character (but not the teleport flag)
function clearFx(u){u.act=null;u.orc=null;u.tent=null;u.und=null;u.lite=null;u.dark=null;u.ward=null;u.kneel=false;u.after=null;u.mv=false;u.npc=null;u.def=null;u.ghost=null;u.spirit=null}
function toHome(u){u.fxs.forEach(hide);clearFx(u);u.tp=false;for(let i=demons.length-1;i>=0;i--)if(demons[i].owner===u.id)demons.splice(i,1);u.x=u.c*CELL+48;u.y=u.r*CELL+FY;u.path=[];u.st='idle';u.wait=1;u.al=1;u.sk=1;u.mood='ok';u.mt=0;u.gt=0;label(u)}
function freeHost(h){h.hosting=null;h.st='idle';h.wait=2;h.act=null;h.kneel=false;h.ward=null}
function detach(u){
 if(u.target){const h=U[u.target];if(h&&h.hosting===u.id)freeHost(h);u.target=null}
 if(u.hosting){const v=U[u.hosting];if(v){v.target=null;toHome(v)}u.hosting=null}
}
function relocate(id,r,c){
 const u=U[id],oid=at(r,c);detach(u);
 if(oid){const o=U[oid];detach(o);o.r=u.r;o.c=u.c;toHome(o)}
 u.r=r;u.c=c;toHome(u);
}
function removeUnit(id,quiet){const u=U[id];detach(u);for(let i=demons.length-1;i>=0;i--)if(demons[i].owner===id)demons.splice(i,1);if(!quiet)poof(u.c*CELL+48,u.r*CELL+48);u.lb.remove();delete U[id];ui()}
function poof(x,y,c){parts.push({x,y,t:0,life:.5,c:c||'#eadcb4'})}
function hearts(u){parts.push({x:u.x,y:u.y-44,t:0,life:1.3,k:'h'})}
function say(u,t){bubU={u,t:2.1};bub.textContent=t;bub.style.display='block'}
let toastT=0;function toast(m){const e=$('#toast');e.textContent=m;e.style.display='block';clearTimeout(toastT);toastT=setTimeout(()=>e.style.display='none',4000)}
// A short arm gesture (pose from POSE) for d seconds, used to liven up interactions
function gest(u,p,d){if(u){u.gp=p;u.gt=d}}
const home=u=>({x:u.c*CELL+16+Math.random()*64,y:u.r*CELL+FY});
// A character dies: their box is gone (back on the shelf). Anyone they were with goes home.
function kill(v){
 poof(v.x,v.y-20);
 if(v.target){const h=U[v.target];if(h&&h.hosting===v.id)freeHost(h)}
 if(v.hosting){const w=U[v.hosting];if(w&&w.target===v.id){const inRoom=w.st==='talk';clearFx(w);w.target=null;
  if(inRoom){w.st='back';w.path=route(w,v.r,v.c,w.r,w.c,home(w))}else toHome(w)}}
 for(let i=demons.length-1;i>=0;i--)if(demons[i].owner===v.id)demons.splice(i,1);
 v.lb.remove();delete U[v.id];
 // a fallen Priest may unlock the Necromancer (once)
 if(v.id==='priest'&&!S.un.necromancer&&Math.random()<ODDS.necro){S.un.necromancer=true;buildShelf();toast('Something dark stirs... a Necromancer box has appeared on the shelf.')}
 ui();save();
}
function mkBolt(s,t){const sx=s.x,sy=s.y-40,ex=t.x,ey=t.y-26,n=Math.max(3,Math.round((ey-sy)/10)),p=[[sx,sy]];
 for(let i=1;i<n;i++)p.push([sx+(ex-sx)*i/n+Math.random()*14-7,sy+(ey-sy)*i/n]);p.push([ex,ey]);
 return{p,t:0,cells:[[s.c*CELL,s.r*CELL],[t.c*CELL,t.r*CELL]]}}
const freeU=x=>x&&!x.hosting&&!x.target&&(x.st==='idle'||x.st==='walk');
const nbrs=u=>[[0,1],[0,-1],[1,0],[-1,0]].map(d=>U[at(u.r+d[0],u.c+d[1])]).filter(h=>freeU(h));

// ---------- idle activities (odds in ODDS, data.js) ----------
function beginAct(u,a){u.st='act';u.act=a;u.at=0;u.ev={};u.path=[];u.dur=a==='prac'?3.5+Math.random()*1.5:3}
function startAct(u){
 const r=Math.random();u.path=[];
 if(u.id==='wizard'){
  const W=ODDS.wizard,a=r<W.read?'read':r<W.read+W.magic?'magic':'demon';
  u.st='act';u.act=a;u.at=0;u.ev={};u.dur=a==='read'?4+Math.random()*2:a==='magic'?3.5+Math.random()*1.5:3;
  if(a==='demon'){const rc=u.c*CELL,dx=cl(u.x+(u.x<rc+48?30:-30),rc+16,rc+80);u.face=dx>u.x?1:-1;demons.push({x:dx,y:u.y,t:0,dir:dx>u.x?-1:1,owner:u.id})}
  return true}
 if(u.id==='priest'){const P=ODDS.priest,a=r<P.pray?'pray1':r<P.pray+P.farmer?'farmer':r<P.pray+P.farmer+P.tithe?'tithe':'exorcise';
  beginAct(u,a);u.dur={pray1:5,farmer:7.8,tithe:3,exorcise:8}[a];if(a==='farmer'||a==='exorcise')npcEnter(u,a==='exorcise');return true}
 if(u.id==='necromancer'){const N=ODDS.necromancer,a=r<N.spirits?'spirits':r<N.spirits+N.candles?'candles':r<N.spirits+N.candles+N.lightning?'lightning':'raise';
  if(a==='raise'&&startRaise(u))return true;
  const b=a==='raise'?'spirits':a;beginAct(u,b);u.dur={spirits:5,candles:5.5,lightning:4.5}[b];return true}
 if(u.id!=='knight')return false;
 // Eldritch Knight only: a black cat wanders across the back of the Wizard's room
 if(u.form==='eknight'&&U.wizard&&Math.random()<ODDS.eknightCat){cats.push({t:0,dir:pick([1,-1])});u.st='idle';u.wait=3;return true}
 const K=ODDS.knight;
 if(r>=K.prac&&r<K.prac+K.orc){const o=nbrs(u);if(o.length){visit(u,pick(o),'orc');return true}}
 // Horse: needs open space to the right (no box in the next cell)
 if(r>=K.prac+K.orc&&!at(u.r,u.c+1)){u.st='act';u.act='horse';u.at=0;u.ev={};u.dur=6.3;u.hx=u.c*CELL+46;return true}
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
 if(u.act==='sniff'){once('y',1,()=>{u.mood='hurt';u.mt=1.6});
  once('t',1.3,()=>{const bx=u.c*CELL,by=u.r*CELL;thrown.push({sx:u.x+u.face*10,sy:u.y-30,ex:bx+(u.face>0?80:16),ey:by+38,t:0})})}
 if(u.at>=u.dur){if(u.npcDoor)npcDoor(u,0);u.act=null;u.npc=null;u.kneel=false;u.ghost=null;u.spirit=null;u.st='idle';u.mv=false;u.wait=1.5+Math.random()*2.5}
}
// ---- farmer visiting the Priest: comes out of the back door, stands beside him, leaves the same way ----
function npcDoor(u,open){let f=u.npcDoor;
 if(open){if(!f||!u.fxs.includes(f)){f={type:'backdoor',x:u.c*CELL+EXIT.backdoor.x,y:u.r*CELL+EXIT.backdoor.y,open:0,want:1,a:1,vis:true,keep:true};u.fxs.push(f);u.npcDoor=f}f.want=1;f.closing=false;f.keep=true}
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
// ---- coins ----
function addCoins(n,x,y){S.coins=(S.coins||0)+n;showCoins();save();if(x!=null)parts.push({k:'txt',s:'+'+n,x,y,t:0,life:1.4})}
// ---- Necromancer raises a skeleton in another character's room. Fighters and Mages beat it; anyone else dies. ----
function startRaise(u){
 const tg=Object.values(U).filter(v=>v!==u&&freeU(v)&&cellX(v)===v.c&&cellY(v)===v.r);
 if(!tg.length)return false;
 const v=pick(tg);beginAct(u,'raise');u.dur=3.6;
 v.st='def';v.path=[];v.act=null;v.ev={};v.def={t:0,skel:{x:standBy(v,30),y:v.r*CELL+FY,blink:0},win:!!CLASS[v.id]};
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
function nscroll(u){if(!startRaise(u))poof(u.x,u.y-30,'#8a8a9a')}
function sniff(u){beginAct(u,'sniff');u.dur=2.6}
function cast(w,k){w.st='cast';w.tt=0;w.ev={};w.path=[];k.path=[];k.st='idle';k.wait=8;w.face=k.x>w.x?1:-1}
function casting(w,dt){
 const k=U.knight;if(!k||pairKind(w,k)!=='bolt'){w.st='idle';w.wait=1;return}
 w.tt+=dt;const once=(n,t,f)=>{if(!w.ev[n]&&w.tt>=t){w.ev[n]=1;f()}};
 once('c',.4,()=>{w.hop=.5;w.mood='happy';w.mt=2});
 once('x',1,()=>{bolts.push(mkBolt(w,k));k.blink=.8;k.mood='hurt';k.mt=2});
 once('y',1.7,()=>{kill(k);w.st='idle';w.wait=3});
}

// ---------- items (drag from the item tray onto a room; the room's owner must be home) ----------
const ITEM_FX={scroll:{wizard:fireball,knight:goldGlow,priest:banish,necromancer:nscroll},potion:{wizard:potionTeleport,knight:flex,priest:wings,necromancer:sniff}};
function useItem(kind,r,c){
 const u=U[at(r,c)],busy=['demon','fireball','flex','sip','horse','raise','banish','sniff','farmer','exorcise'];
 const home=u&&!u.target&&!u.hosting&&cellX(u)===u.c&&cellY(u)===u.r&&(u.st==='idle'||u.st==='walk'||(u.st==='act'&&!busy.includes(u.act)));
 const fx=u&&ITEM_FX[kind][u.id];
 if(!home||!fx){poof(c*CELL+48,r*CELL+48,'#8a8a9a');return} // nothing happens
 u.act=null;u.path=[];u.after=null;u.mv=false;u.st='idle';u.wait=2;
 fx(u);
}
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
function potionTeleport(u){
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
function route(u,r1,c1,r2,c2,fin){
 const ra=at(r1,c1)||u.id,rb=at(r2,c2)||u.id,dc=c2-c1,dr=r2-r1;
 const F=(type,x,y)=>{const f={type,x,y,open:0,want:0,a:0,vis:false,keep:true};u.fxs.push(f);return f};
 if(u.tp||Math.abs(dc)+Math.abs(dr)!==1){
  const ax=cl(u.x+(u.x-c1*CELL<48?22:-22),c1*CELL+20,c1*CELL+76),ay=r1*CELL+FY,bx=c2*CELL+24,by=r2*CELL+FY,f1=F('portal',ax,ay),f2=F('portal',bx,by);
  return [{k:'walk',x:ax,y:ay,on:f1},{k:'vanish',f:f1,m:'portal'},{k:'appear',x:bx,y:by,f:f2,m:'portal'},{k:'walk',x:fin.x,y:fin.y,close:f2,off:f2}];
 }
 if(dc){const ty=u.id==='wizard'?'portal':'door';
  if(ty==='door'){
   const ex=(dc>0?c1+1:c1)*CELL,yy=r1*CELL+FY,f=F('door',ex,yy);f.dir=dc;
   return [{k:'walk',x:ex-dc*28,y:yy,on:f},{k:'wait',f,w:.5},{k:'walk',x:ex+dc*28,y:yy,sp:40},{k:'walk',x:fin.x,y:fin.y,close:f}];
  }
  const A={x:c1*CELL+(dc>0?CELL-24:24),y:r1*CELL+FY},Bp={x:c2*CELL+(dc>0?24:CELL-24),y:r2*CELL+FY},f1=F(ty,A.x,A.y),f2=F(ty,Bp.x,Bp.y);
  return [{k:'walk',x:A.x,y:A.y,on:f1},{k:'vanish',f:f1,m:ty},{k:'appear',x:Bp.x,y:Bp.y,f:f2,m:ty},{k:'walk',x:fin.x,y:fin.y,close:f2,off:f2}];
 }
 const up=dr<0,out=TR[ra][up?'up':'down'],inn=TR[rb][up?'down':'up'],A=EXIT[out],Bx=EXIT[inn];
 const X1=c1*CELL+A.x,X2=c2*CELL+Bx.x,y1=r1*CELL,y2=r2*CELL,f1=F(out,X1,y1+A.y),f2=F(inn,X2,y2+Bx.y);
 return [{k:'walk',x:X1,y:y1+FY,on:f1},{k:'walk',x:X1,y:y1+A.ay,open:f1},{k:'vanish',f:f1,m:out},
  {k:'appear',x:X2,y:y2+Bx.ay,f:f2,m:inn},{k:'walk',x:X2,y:y2+FY,sp:34,close:f2},{k:'walk',x:fin.x,y:fin.y,off:f2}];
}
const isPair=(a,b)=>(a.id==='knight'&&b.id==='wizard')||(a.id==='wizard'&&b.id==='knight');
function decide(u){
 let P=(u.id==='knight'||u.id==='wizard')&&pairKind(U.wizard,U.knight)==='friend'?ODDS.visitFriend:ODDS.visit;
 if(u.id==='knight'&&pairKind(U.priest,u)==='zeal')P*=1+ODDS.zeal; // Priest above the Knight: he visits 60% more
 const rr=Math.random();
 if(rr>=P&&rr<P+ODDS.idle&&startAct(u))return;
 if(rr<P){
  const opts=nbrs(u);
  if(opts.length){
   const h=pick(opts),kd=pairKind(u,h);
   if(isPair(u,h)&&Math.random()<ODDS.spar){visit(u,h,'spar');return} // any arrangement
   const hang=Math.random()<ODDS.hangout;
   if(!hang&&kd&&kd!=='zeal'){
    if(kd==='bolt'){if(freeU(U.wizard)&&freeU(U.knight))cast(U.wizard,U.knight);else u.wait=1;return}
    // Eldritch Awakening: always the Knight who goes to the Wizard's room to read
    if(kd==='learn'){if(freeU(U.wizard)&&freeU(U.knight))visit(U.knight,U.wizard,'learn');else u.wait=1;return}
    // Priest left of Knight: sometimes tentacles attack the Priest and the Knight comes to help
    if(kd==='sermon'&&Math.random()<ODDS.tentacle){if(freeU(U.priest)&&freeU(U.knight))visit(U.knight,U.priest,'tentacle');else u.wait=1;return}
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
function arrive(u){
 if(u.st==='out'){u.st='talk';u.tt=0;u.ev={};u.kind=u.vk;u.sc2=null;return}
 u.tp=false;
 if(u.after){const a=u.after;u.after=null;beginAct(u,a);return}
 u.st='idle';u.wait=2+Math.random()*3;
}
const fin=u=>{u.path.shift();if(!u.path.length)arrive(u)};
const FIXED={backdoor:1,shelf:1}; // exits that are part of the room: they close instead of disappearing
function run(u,dt){
 const s=u.path[0];
 if(!s.b){s.b=1;s.t=0;if(s.on)show(s.on);if(s.open)s.open.want=1;if(s.close){s.close.want=0;s.close.closing=true}if(s.k==='wait'){show(s.f);s.f.want=1}
  if(s.k==='vanish')s.f.want=1;
  if(s.k==='appear'){u.x=s.x;u.y=s.y;u.al=0;show(s.f);s.f.want=1}
  if(s.k==='tele'){poof(u.x,u.y-20,'#c890ff');u.x=s.x;u.y=s.y;poof(u.x,u.y-20,'#c890ff')}}
 if(s.k==='tele')fin(u);
 else if(s.k==='wait'||s.k==='pause'){s.t+=dt;if(s.t>=s.w)fin(u)}
 else if(s.k==='vanish'){s.t+=dt;const p=cl((s.t-.25)/.35,0,1);u.al=1-p;u.sk=1-.4*p;
  if(s.t>=.65){u.al=0;s.f.want=0;if(FIXED[s.f.type])s.f.closing=true;else hide(s.f);fin(u)}}
 else if(s.k==='appear'){s.t+=dt;const p=cl((s.t-.25)/.35,0,1);u.al=p;u.sk=.6+.4*p;if(s.t>=.65){u.al=1;u.sk=1;fin(u)}}
 else{const dx=s.x-u.x,dy=s.y-u.y,d=Math.hypot(dx,dy),sp=(s.sp||(u.st==='walk'?20:34))*dt;
  if(Math.abs(dx)>.5)u.face=dx>0?1:-1;u.t+=dt;
  if(d<=sp){u.x=s.x;u.y=s.y;if(s.dust)poof(u.x,u.y-3);if(s.off)hide(s.off);fin(u)}else{u.x+=dx/d*sp;u.y+=dy/d*sp}}
}

// ---------- interactions (the visitor u runs the show in the host h's room) ----------
function talk(u,dt){
 const h=U[u.target];if(!h){toHome(u);return}
 u.tt+=dt;if(Math.abs(h.x-u.x)>2)u.face=h.x>u.x?1:-1; // only turn when clearly to one side (stops flip-flopping)
 const pp={[u.id]:u,[h.id]:h},K=pp.knight,Wz=pp.wizard,Pr=pp.priest;
 const need={friend:K&&Wz,learn:K&&Wz,chat:K&&Wz,spar:K&&Wz,study:Pr&&Wz,gossip:Pr&&Wz,undead:Pr&&Wz,light:Pr&&Wz,pray:Pr&&K,bless:Pr&&K,sermon:Pr&&K,tentacle:Pr&&K};
 const k=u.kind in need?(need[u.kind]?u.kind:null):u.kind,once=(n,t,f)=>{if(!u.ev[n]&&u.tt>=t){u.ev[n]=1;f()}};let end=3.4;
 const lines=(sc,who)=>{end=sc.length*2.3+.8;sc.forEach((l,i)=>once('l'+i,.6+i*2.3,()=>{const s=who||U[l[0]];if(s){say(s,who?l:l[1]);gest(s,'fwd',1.2)}}))};
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
 else{once('h1',.6,()=>{u.hop=.5;gest(u,'up',.6)});once('h2',1.4,()=>{h.hop=.5;gest(h,'up',.6)})}
 if(u.tt>end){clearFx(u);h.act=null;h.kneel=false;h.ward=null;h.hosting=null;h.st='idle';h.wait=2;u.target=null;u.st='back';u.path=route(u,h.r,h.c,u.r,u.c,home(u))}
}
function step(dt){
 for(const u of Object.values(U))u.fxs=u.fxs.filter(f=>{f.open+=(f.want-f.open)*Math.min(1,dt*8);if(f.closing&&f.open<.05){f.vis=false;f.keep=false}f.a=f.type==='door'?(f.vis?1:0):f.a+((f.vis?1:0)-f.a)*Math.min(1,dt*9);return f.keep||f.vis||f.a>.03||(FIXED[f.type]&&f.open>.03)});
 parts.forEach(p=>{p.t+=dt;if(p.k==='drop'){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=260*dt}});parts=parts.filter(p=>p.t<p.life);
 bolts.forEach(b=>b.t+=dt);bolts=bolts.filter(b=>b.t<.5);
 demons.forEach(d=>d.t+=dt);demons=demons.filter(d=>d.t<3.7);
 cats.forEach(k=>k.t+=dt);cats=cats.filter(k=>k.t<5.6&&U.wizard);
 fbs.forEach(f=>{f.t+=dt;if(f.t>=.55&&!f.done){f.done=1;explode(f)}});fbs=fbs.filter(f=>!f.done);
 flashes.forEach(f=>f.t+=dt);flashes=flashes.filter(f=>f.t<.6);
 thrown.forEach(p=>{p.t+=dt;if(p.t>=.35&&!p.done){p.done=1;poof(p.ex,p.ey,'#cfe8f0');poof(p.ex,p.ey,'#d03050');splats.push({x:p.ex,y:p.ey,t:0})}});thrown=thrown.filter(p=>!p.done);
 splats.forEach(s=>s.t+=dt);splats=splats.filter(s=>s.t<3);
 coinT+=dt;if(coinT>=COIN_EVERY){coinT-=COIN_EVERY;addCoins(1)} // coins slowly add up while the game is open
 if(bubU&&(bubU.t-=dt)<=0){bubU=null;bub.style.display='none'}
 for(const id in U){const u=U[id];
  if(u.mt>0&&(u.mt-=dt)<=0)u.mood='ok';
  if(u.hop>(u.hp||0)+1e-4)u.hd=u.hop;if(u.hop>0)u.hop-=dt;u.hp=u.hop;if(u.blink>0)u.blink-=dt;if(u.gt>0)u.gt-=dt;if(u.ward!=null)u.ward+=dt;if(u.wardHit>0)u.wardHit-=dt;
  if(u.glow>0)u.glow-=dt;if(u.drink>0)u.drink-=dt;if(u.lite!=null)u.lite+=dt;if(u.dark!=null)u.dark+=dt;
  if(u.und){u.und.t+=dt;if(u.und.blink>0)u.und.blink-=dt}
  if(u.tent){u.tent.t+=dt;if(u.tent.blink>0)u.tent.blink-=dt;if(u.tent.out!=null)u.tent.out+=dt}
  if(u.wings>0)u.wings-=dt;if(u.spirit){u.spirit.t+=dt;if(u.spirit.t>1.8)u.spirit=null}
  stepNpc(u,dt);
  if(u.act)u.at+=dt;if(u.orc&&u.orc.blink>0)u.orc.blink-=dt;
  if(u.st==='def'){defending(u,dt);continue}
  if(u.st==='talk'){talk(u,dt);continue}
  if(u.st==='cast'){casting(u,dt);continue}
  if(u.st==='act'){acting(u,dt);continue}
  if(u.hosting&&u.path.length){run(u,dt);continue} // a host can still be moved (e.g. the Priest backing away)
  if(u.hosting){const v=U[u.hosting];if(v){const tg=v.und&&v.st==='talk'&&v.tt>1.8?v.und:v;if(Math.abs(tg.x-u.x)>2)u.face=tg.x>u.x?1:-1}continue}
  if(u.path.length){run(u,dt);continue}
  if(u.st==='idle'&&(u.wait-=dt)<=0)decide(u);
 }
}

// ---------- render ----------
const scl=u=>{const ry=((u.y%CELL)+CELL)%CELL;return(ry>=66?1-.3*cl((84-ry)/14,0,1):1)*u.sk};
const poseNow=u=>u.kneel?'pray':u.gt>0?u.gp:poseOf(u.st==='cast'?'cast':u.act,u.st==='cast'?u.tt:u.at);
function render(){
 g.clearRect(0,0,W,H);
 for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){g.fillStyle=(r+c)%2?'#25214a':'#2a2650';g.fillRect(c*CELL,r*CELL,CELL,CELL)}
 const dm=drag&&drag.moved?drag.id:null,live=Object.values(U).filter(u=>u.id!==dm);
 for(const id in U){const u=U[id],x=u.c*CELL,y=u.r*CELL;
  if(id===dm){g.strokeStyle='#5a5590';g.lineWidth=2;g.setLineDash([4,4]);g.strokeRect(x+4,y+4,CELL-8,CELL-8);g.setLineDash([])}else box(g,id,x,y,u.weapon);
  u.lb.style.opacity=id===dm?0:1}
 Object.values(U).forEach(u=>u.fxs.forEach(f=>drawFx(f)));
 // background details behind the characters: horse, cat, tentacles through the Priest's window
 live.forEach(u=>{if(u.act==='horse')drawHorse(g,(u.c+1)*CELL,u.r*CELL+FY,u.at)});
 if(U.wizard&&dm!=='wizard')cats.forEach(k=>drawCat(g,U.wizard.c*CELL,U.wizard.r*CELL,k.t,k.dir));
 live.forEach(u=>{if(u.tent){const q=u.tent;drawTentacles(g,q.bx,q.by,cl(q.t/1,0,1)*(q.out!=null?1-cl(q.out/.6,0,1):1),T,q.blink)}});
 splats.forEach(s=>drawSplat(g,s.x,s.y,cl((3-s.t)/1,0,1)));
 live.forEach(u=>{if(u.act)drawActBack(g,u)}); // ceiling light, chalk circle
 // characters and visiting farmers, back to front
 const people=[...live,...live.filter(u=>u.npc).map(u=>({npcOf:u,y:u.npc.y}))].sort((a,b)=>a.y-b.y);
 people.forEach(u=>{
  if(u.npcOf){const n=u.npcOf.npc,nh=n.hop>0?-Math.sin((1-n.hop/.5)*Math.PI)*8:0;
   spr(g,n.id,n.mood,n.x+(n.shake?Math.round(Math.sin(T*40)):0),n.y,n.face,(n.walk?Math.sin(n.t*14)*1.5:0)+nh,n.al,scl({y:n.y,sk:1}),n.walk?'none':'none');return}
  const walking=(u.path.length&&u.path[0].k==='walk')||u.mv,hop=u.hop>0?-Math.sin((1-u.hop/u.hd)*Math.PI)*10*Math.min(1,u.hd/.5):0,bl=u.blink>0&&Math.floor(u.blink*14)%2?.2:1;
  const sink=u.act==='demon'?sinkOf(u.at):0,low=sink*46+(u.kneel?6:0);
  if(u.glow>0)drawGlow(g,u.x,u.y,T);
  if(u.wings>0)drawWings(g,u.x,u.y+low+hop,T);
  if(low>0){g.save();g.beginPath();g.rect(u.x-30,u.y-70,60,70);g.clip()} // sinking through the floor, or kneeling
  const args=[sid(u),u.mood,u.x+actDx(u),u.y+low,u.face,(walking?Math.sin(u.t*14)*1.5:0)+hop,u.al*bl,scl(u),poseNow(u)];
  spr(g,...args);
  if(u.glow>0){g.globalCompositeOperation='lighter';args[6]=u.al*bl*(.25+.15*Math.sin(T*4));spr(g,...args);g.globalCompositeOperation='source-over';glowSparkles(g,u.x,u.y,T)}
  if(low>0)g.restore()});
 live.forEach(u=>{
  if(u.orc){const o=u.orc,hit=o.blink>0,ob=hit&&Math.floor(o.blink*14)%2?.2:1;spr(g,'orc',hit?'hurt':'mad',o.x,o.y,u.x>o.x?1:-1,0,ob,1)}
  if(u.und){const d=u.und,rise=cl(d.t/.9,0,1),hit=d.blink>0;if(d.t<1.4)drawGreenCircle(g,d.x,d.y,cl(d.t/.4,0,1),T);
   g.save();g.beginPath();g.rect(d.x-24,d.y-60,48,60);g.clip();spr(g,'skeleton',hit?'hurt':'mad',d.x,d.y+(1-rise)*44,u.x>d.x?1:-1,0,hit&&Math.floor(d.blink*14)%2?.2:1,1);g.restore()}
  if(u.def&&u.def.skel){const d=u.def,s=d.skel,rise=cl((d.t-.2)/.9,0,1),hit=s.blink>0;if(d.t<1.4)drawGreenCircle(g,s.x,s.y,cl(d.t/.4,0,1),T);
   g.save();g.beginPath();g.rect(s.x-24,s.y-60,48,60);g.clip();spr(g,'skeleton',hit?'hurt':'mad',s.x,s.y+(1-rise)*44,u.x>s.x?1:-1,0,hit&&Math.floor(s.blink*14)%2?.2:1,1);g.restore()}
  if(u.spirit){const p=u.spirit;spr(g,'demon','mad',p.x,p.y-8-p.t*22,1,0,.65*cl(1-(p.t-.8)/1,0,1)*cl(p.t/.3,0,1),1)} // demon driven out of the farmer
  if(u.act){g.save();g.beginPath();g.rect(cellX(u)*CELL+4,cellY(u)*CELL,CELL-8,CELL);g.clip();drawAct(g,u);g.restore()} // weapons stay inside the room
  if(u.drink>0)drawItem(g,'potion',Math.round(u.x+u.face*9),Math.round(u.y-38),1);
  if(u.ward!=null)drawWard(g,u.x,u.y,u.ward,u.wardHit>0)});
 // holy light vs darkness (fills the host's room)
 live.forEach(u=>{if(u.lite==null)return;const h=U[u.target],Pr=U.priest,Wz=U.wizard;if(!h||!Pr||!Wz)return;
  const bx=h.c*CELL,by=h.r*CELL,la=cl(u.lite/.8,0,1)*(u.dark!=null?1-cl(u.dark/1.2,0,1):1);
  drawHolyLight(g,bx,by,Pr.x,Pr.y-40,la,T);
  if(u.dark!=null)drawDarkness(g,bx,by,Wz.x,Wz.y-30,8+40*cl(u.dark/1,0,1),cl(u.dark/.6,0,1)*(1-cl((u.dark-1.6)/.6,0,1)),T)});
 demons.forEach(d=>drawDemon(g,d));
 fbs.forEach(f=>drawFireball(g,f.sx,f.sy,f.ex,f.ey,cl(f.t/.55,0,1)));
 thrown.forEach(p=>{const k=cl(p.t/.35,0,1);drawItem(g,'potion',Math.round(lerp(p.sx,p.ex,k)),Math.round(lerp(p.sy,p.ey,k)-Math.sin(k*Math.PI)*12),1)});
 flashes.forEach(f=>{g.fillStyle='rgba(255,140,40,'+(.8*(1-f.t/.6))+')';g.fillRect(f.x,f.y,CELL,CELL)});
 parts.forEach(p=>{if(p.k==='h')heart(g,p.x,p.y-p.t*26);else if(p.k==='drop'){g.fillStyle='#8fd0ff';g.fillRect(Math.round(p.x),Math.round(p.y),2,3)}
  else if(p.k==='txt'){g.save();g.globalAlpha=cl((p.life-p.t)/.4,0,1);const y=Math.round(p.y-p.t*18);drawItem(g,'coin',Math.round(p.x-12),y-4,1);g.font='bold 13px "Pixelify Sans",monospace';g.lineWidth=3;g.strokeStyle=O;g.strokeText(p.s,Math.round(p.x-4),y);g.fillStyle='#f2c84a';g.fillText(p.s,Math.round(p.x-4),y);g.restore()}
  else{const k=p.t/p.life,s=Math.max(1,7*(1-k));g.fillStyle=p.c;for(let i=0;i<8;i++){const a=i*Math.PI/4;g.fillRect(p.x+Math.cos(a)*k*28-s/2,p.y+Math.sin(a)*k*28-s/2,s,s)}}});
 bolts.forEach(b=>{const a=1-b.t/.5;g.fillStyle='rgba(255,255,255,'+(a*.6)+')';b.cells.forEach(q=>g.fillRect(q[0],q[1],CELL,CELL));
  [['rgba(140,210,255,'+a+')',6],['#fff',2]].forEach(s=>{g.strokeStyle=s[0];g.lineWidth=s[1];g.beginPath();b.p.forEach((q,i)=>i?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1]));g.stroke()})});
 if(hover){g.strokeStyle='#f2a93b';g.lineWidth=3;g.strokeRect(hover[1]*CELL+3,hover[0]*CELL+3,CELL-6,CELL-6)}
 if(dm){const u=U[dm],x=drag.p.x-48,y=drag.p.y-48;g.globalAlpha=.9;box(g,dm,x,y,u.weapon);spr(g,sid(u),'ok',x+48,y+FY,1,0);g.globalAlpha=1}
 if(bubU){const u=bubU.u;bub.style.left=cl(u.x/W*100,18,82)+'%';bub.style.top=(u.y-50)/H*100+'%'}
}
let last=0;
function frame(ts){const dt=Math.min(.05,(ts-last)/1000||0);last=ts;T=ts/1000;step(dt);render();if(!tabRef.hidden)anim.forEach(f=>f(T));requestAnimationFrame(frame)}

// ---------- input ----------
const inRect=(el,e)=>{const R=el.getBoundingClientRect();return e.clientX>=R.left&&e.clientX<=R.right&&e.clientY>=R.top&&e.clientY<=R.bottom};
function pt(e){const R=cv.getBoundingClientRect(),s=W/R.width;return{x:(e.clientX-R.left)*s,y:(e.clientY-R.top)*s,inb:inRect(cv,e)}}
const cellOf=p=>[cl(Math.floor(p.y/CELL),0,ROWS-1),cl(Math.floor(p.x/CELL),0,COLS-1)];
cv.onpointerdown=e=>{const p=pt(e),[r,c]=cellOf(p),id=at(r,c);if(!id)return;drag={id,sx:e.clientX,sy:e.clientY,moved:false,p};cv.setPointerCapture(e.pointerId)};
cv.onpointermove=e=>{if(!drag)return;const p=pt(e);drag.p=p;
 if(Math.hypot(e.clientX-drag.sx,e.clientY-drag.sy)>8)drag.moved=true;
 hover=drag.moved&&p.inb?cellOf(p):null;tray.classList.toggle('over',drag.moved&&inRect(tray,e))};
cv.onpointerup=e=>{if(!drag)return;const d=drag,p=pt(e);drag=null;hover=null;tray.classList.remove('over');
 if(!d.moved){const u=U[d.id];if(u&&Math.hypot(p.x-u.x,p.y-(u.y-22))<30){u.hop=.5;u.mood='happy';u.mt=1;gest(u,'up',.6)}return}
 if(inRect(tray,e))removeUnit(d.id);
 else if(p.inb){const[r,c]=cellOf(p),u=U[d.id];if(r!==u.r||c!==u.c)relocate(d.id,r,c)}
 save()};
cv.onpointercancel=()=>{drag=null;hover=null;tray.classList.remove('over')};
const gh=$('#ghost'),gx=gh.getContext('2d');
function firstFree(){for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++)if(!at(r,c))return[r,c]}
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
 [...SHELF_CHARS,...(S.un.necromancer?['necromancer']:[])].forEach(id=>{
  const b=document.createElement('button');b.className='it';b.dataset.id=id;b.innerHTML='<canvas width="96" height="96"></canvas>'+CH[id].name+tagImg(id);
  const t=b.firstChild.getContext('2d');t.imageSmoothingEnabled=false;box(t,id,0,0,'longsword');spr(t,id,'ok',48,FY,1,0);
  const tap=()=>{const f=firstFree();if(f)addUnit(id,f[0],f[1],false,null,null,id==='wizard'?pick(WIZ_RANDOM):null)};
  draggable(b,()=>!U[id],(r,c)=>{if(!at(r,c))addUnit(id,r,c)},tap);
  b.onkeydown=e=>{if((e.key==='Enter'||e.key===' ')&&!U[id]){e.preventDefault();tap()}};
  tray.appendChild(b);
 });
 ui();
}
// Consumables: infinite use for now. Drag onto a room; its owner must be at home.
ITEMS.forEach(kind=>{
 const b=document.createElement('button');b.className='it item';b.dataset.item=kind;b.innerHTML='<canvas width="96" height="96"></canvas>'+NAMES[kind];
 const t=b.firstChild.getContext('2d');t.imageSmoothingEnabled=false;t.fillStyle='#221e3c';t.fillRect(0,0,96,96);drawItem(t,kind,48,48,5);
 draggable(b,()=>true,(r,c)=>useItem(kind,r,c));
 itemsEl.appendChild(b);
});
// Gold coins: shown in the item tray, they add up over time (to buy items in a later version)
const coinBox=document.createElement('div');coinBox.className='it coins';coinBox.innerHTML='<canvas width="96" height="96"></canvas><span></span>';
{const t=coinBox.firstChild.getContext('2d');t.imageSmoothingEnabled=false;t.fillStyle='#221e3c';t.fillRect(0,0,96,96);drawItem(t,'coin',48,48,6)}
itemsEl.appendChild(coinBox);
function showCoins(){coinBox.lastChild.textContent=(S.coins||0)+' coins'}
$('#clr').onclick=()=>{Object.keys(U).forEach(i=>removeUnit(i,true));save()};

// ---------- compendium ----------
const anim=[],tabRef=$('#tab-ref');
function mkc(w,h,title){const c=document.createElement('canvas');c.width=w;c.height=h;c.style.width=w*1.5+'px';c.title=title;c.setAttribute('role','img');c.setAttribute('aria-label',title);const x=c.getContext('2d');x.imageSmoothingEnabled=false;return[c,x]}
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
const PD={study:['wizard','right'],gossip:['wizard','left'],undead:['wizard','below'],light:['wizard','above'],zeal:['knight','above'],pray:['knight','right'],bless:['knight','below'],sermon:['knight','left'],tentacle:['knight','left']};
function pairDiagram(k){
 const[o,rl]=PD[k],v=rl==='above'||rl==='below',[c,x]=mkc(v?96:192,v?192:96,NAMES[k]);
 const P={left:[[0,0],[96,0]],right:[[96,0],[0,0]],above:[[0,0],[0,96]],below:[[0,96],[0,0]]}[rl],p=P[0],q=P[1],pf=v?1:(p[0]<q[0]?1:-1);
 box(x,'priest',p[0],p[1]);box(x,o,q[0],q[1],'longsword');
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
 const one=(id,pt,pose,m,face)=>{x.save();x.beginPath();x.rect(pt[0],pt[1],96,FY);x.clip();spr(x,id,m,pt[0]+48,pt[1]+FY+low,face,0,1,1,pose);x.restore()};
 one('priest',p,pp,pm,pf);one(o,q,op,om,-pf);
 if(k==='study'){drawAct(x,{act:'holy',at:.5,x:p[0]+48,y:p[1]+FY,face:pf});drawAct(x,{act:'read',at:.5,x:q[0]+48,y:q[1]+FY,face:-pf})}
 if(k==='light')drawHolyLight(x,p[0],p[1],p[0]+48,p[1]+FY-40,.7,0);
 if(k==='bless'){drawAct(x,{act:'sprinkle',at:0,x:p[0]+48,y:p[1]+FY,face:1});x.fillStyle='#8fd0ff';[[60,96],[54,90],[66,86],[58,80]].forEach(d=>x.fillRect(p[0]+d[0]-16,d[1]-40,2,3))}
 if(k==='zeal'){x.fillStyle='#f2d870';[[30,120],[66,128],[40,150],[60,110]].forEach(d=>x.fillRect(d[0],d[1],3,3))}
 return c}
// A puff of smoke for Compendium tiles (k goes 0 to 1)
function poofTile(c,x,y,k,col){const s=Math.max(1,7*(1-k));c.fillStyle=col||'#6a9a3a';for(let i=0;i<8;i++){const a=i*Math.PI/4;c.fillRect(x+Math.cos(a)*k*28-s/2,y+Math.sin(a)*k*28-s/2,s,s)}}
const flash=(on,tt)=>on&&Math.floor(tt*14)%2?.2:1;
function idleTile(kind,wp){
 const wide=kind==='fireball'||kind==='raise',[c,x]=mkc(wide?192:96,96,NAMES[kind]+(wp?' ('+wp+')':''));
 anim.push(t=>{x.clearRect(0,0,wide?192:96,96);
  if(kind==='read'||kind==='magic'){box(x,'wizard',0,0);spr(x,'wizard','ok',48,FY,1,0,1,1,poseOf(kind,t));drawAct(x,{act:kind,at:t,x:48,y:FY,face:1})}
  else if(kind==='demon'){const tt=t%4.6,sk=sinkOf(tt);box(x,'wizard',0,0);
   if(tt<2.9){x.save();x.beginPath();x.rect(0,0,96,FY);x.clip();spr(x,'wizard',tt>1.6?'hurt':'ok',32,FY+sk*46,1,0,flash(tt>1.6&&tt<2.1,tt),1,poseOf('demon',tt));x.restore()}
   drawDemon(x,{x:62,y:FY,t:tt,dir:-1})}
  else if(kind==='prac'){const u={act:'prac',at:t,x:48,y:FY,face:1,weapon:wp};box(x,'knight',0,0,wp);spr(x,'knight','ok',48+actDx(u),FY,1,0,1,1,'noR');x.save();x.beginPath();x.rect(4,0,88,96);x.clip();drawAct(x,u);x.restore()}
  else if(kind==='orc'){// orc appears first, then the knight walks in from the left and fights
   const tt=t%5.4,fight=tt>1.3&&tt<3.9,kx=tt<.8?null:Math.min(30,4+(tt-.8)*52),hurt=tt>2.4&&tt<2.9,u={act:'prac',at:tt-1.3,x:30,y:FY,face:1,weapon:'longsword'};box(x,'knight',0,0,'longsword');
   if(tt<3.9){const b=(tt>1.6&&tt<2.1)||(tt>3&&tt<3.5);spr(x,'orc',b?'hurt':'mad',68,FY,-1,0,flash(b,tt))}
   if(tt<.4)poofTile(x,68,FY-20,tt/.4);
   if(kx!=null)spr(x,'knight',hurt?'hurt':'ok',kx+(fight?actDx(u):0),FY,1,fight||kx>=30?0:Math.sin(tt*14)*1.5,flash(hurt,tt),1,fight?'noR':'none');
   if(fight)drawAct(x,u)}
  else if(kind==='horse'){const tt=t%7.2,on=tt<6.3,kx=on?lerp(30,46,cl(tt/1.2,0,1)):30,hop=tt>4.6&&tt<5.1?-Math.abs(Math.sin((tt-4.6)/.5*Math.PI))*8:0;
   box(x,'knight',0,0,'spear');if(on)drawHorse(x,96,FY,tt);
   spr(x,'knight',hop?'happy':'ok',kx,FY,1,(tt<1.2?Math.sin(tt*14)*1.5:0)+hop,1,1,on?poseOf('horse',tt):'none');
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
   if(tt>1.8){const k=tt-1.8;x.globalAlpha=cl((1.4-k)/.4,0,1);drawItem(x,'coin',38,Math.round(28-k*12),1);x.font='bold 13px "Pixelify Sans",monospace';x.lineWidth=3;x.strokeStyle=O;x.strokeText('+'+TITHE,46,Math.round(32-k*12));x.fillStyle='#f2c84a';x.fillText('+'+TITHE,46,Math.round(32-k*12));x.globalAlpha=1}}
  // ---- Necromancer idles ----
  else if(kind==='spirits'){const tt=t%5.6;box(x,'necromancer',0,0);spr(x,'necromancer','ok',48,FY,1,0,1,1,tt<5?'both':'none');if(tt<5)drawAct(x,{act:'spirits',at:tt,x:48,y:FY,face:1})}
  else if(kind==='candles'){const tt=t%6;box(x,'necromancer',0,0);if(tt<5.5)drawActBack(x,{act:'candles',at:tt,x:48,y:FY});spr(x,'necromancer','ok',48,FY,1,0,1,1,poseOf('candles',tt))}
  else if(kind==='lightning'){const tt=t%5;box(x,'necromancer',0,0);spr(x,'necromancer','ok',48,FY,1,0,1,1,tt<4.5?'hold':'none');if(tt<4.5)drawAct(x,{act:'lightning',at:tt,x:48,y:FY,face:1})}
  else if(kind==='raise'){// Necromancer raises a skeleton next door; the Knight (a Fighter) beats it
   const tt=t%5.2,d=tt-.4,u={act:'prac',at:d-1.4,x:144-22,y:FY,face:1,weapon:'longsword'},fight=d>1.4&&d<3.6;
   box(x,'necromancer',0,0);box(x,'knight',96,0,'longsword');spr(x,'necromancer','ok',48,FY,1,0,1,1,tt<3.6?'both':'none');if(tt<3.6)drawAct(x,{act:'raise',at:tt,x:48,y:FY,face:1});
   if(d>0&&d<3.6){const sx=166,rise=cl((d-.2)/.9,0,1),hit=(d>2.2&&d<2.6)||(d>3&&d<3.4);if(d<1.4)drawGreenCircle(x,sx,FY,cl(d/.4,0,1),t);x.save();x.beginPath();x.rect(sx-24,FY-60,48,60);x.clip();spr(x,'skeleton',hit?'hurt':'mad',sx,FY+(1-rise)*44,-1,0,flash(hit,tt),1);x.restore()}
   spr(x,'knight',d>.9&&d<1.6?'shock':d>3.6&&d<4.4?'happy':'ok',u.x+(fight?actDx(u):0),FY,1,0,1,1,fight?'noR':'none');if(fight){x.save();x.beginPath();x.rect(100,0,88,96);x.clip();drawAct(x,u);x.restore()}
   if(d>3.6&&d<4.1)poofTile(x,166,FY-14,(d-3.6)/.5,'#e8e4d0')}
  // ---- items on the Priest and Necromancer ----
  else if(kind==='banish'){const tt=t%4.4;box(x,'priest',0,0);spr(x,'priest',tt>3.6?'happy':'ok',58,FY,-1,0,1,1,poseOf('banish',tt));if(tt<3.6)drawAct(x,{act:'banish',at:tt,x:58,y:FY,face:-1,ghost:{x:24,y:FY}})}
  else if(kind==='wings'){const tt=t%6;box(x,'priest',0,0);if(tt>.8)drawWings(x,48,FY,t);spr(x,'priest',tt>.8?'happy':'ok',48,FY,1,0,1,1,tt<.8?'up':'none');if(tt<.8)drawItem(x,'potion',57,FY-38,1);if(tt>.8&&tt<1.3)poofTile(x,48,FY-24,(tt-.8)/.5,'#f2d870')}
  else if(kind==='sniff'){const tt=t%4,k=cl((tt-1.3)/.35,0,1);box(x,'necromancer',0,0);if(tt>1.65)drawSplat(x,80,38,cl((3.8-tt)/1,0,1));
   spr(x,'necromancer',tt>1&&tt<2.6?'hurt':'ok',40,FY,1,0,1,1,poseOf('sniff',tt));if(tt<1.1)drawItem(x,'potion',48,FY-36,1);else if(tt>1.3&&tt<1.65)drawItem(x,'potion',Math.round(lerp(50,80,k)),Math.round(lerp(54,38,k)-Math.sin(k*Math.PI)*12),1)}
 });
 return c}
function buildRef(){
 const b=$('#refs');b.innerHTML='';
 const sec=(t,items)=>{const h=document.createElement('h2');h.className='sec';h.textContent=t;const d=document.createElement('div');d.className='cg';items.forEach(i=>d.appendChild(i));b.append(h,d)};
 // Wrap a tile with its % chance (or a short label) in the top right corner
 const fmt=p=>{if(typeof p==='string')return p;const v=p*100;return(v<10&&Math.abs(v-Math.round(v))>.05?v.toFixed(1):Math.round(v))+'%'};
 const pc=(c,p)=>{const d=document.createElement('div');d.className='tile';const s=document.createElement('span');s.className='pct';s.textContent=fmt(p);d.append(c,s);return d};
 // Arrangements: chance per idle check that a character starts that interaction (visit x not sparring x not a plain hangout)
 const ev=(1-ODDS.spar)*(1-ODDS.hangout),arr=k=>(k==='friend'?ODDS.visitFriend:ODDS.visit)*ev,pv=ODDS.visit*(1-ODDS.hangout);
 sec('Arrangements: Wizard & Knight',[...['friend','learn','bolt','chat'].map(k=>pc(diagram(k),arr(k))),pc(idleTile('spar'),ODDS.visit*ODDS.spar)]);
 sec('Arrangements: Priest & Wizard',['study','gossip','undead','light'].map(k=>pc(pairDiagram(k),pv)));
 sec('Arrangements: Priest & Knight',[pc(pairDiagram('zeal'),'+60%'),pc(pairDiagram('pray'),pv),pc(pairDiagram('bless'),pv),pc(pairDiagram('sermon'),pv*(1-ODDS.tentacle)),pc(pairDiagram('tentacle'),pv*ODDS.tentacle)]);
 const W=ODDS.wizard,K=ODDS.knight;
 sec('Wizard idle',[pc(idleTile('read'),W.read),pc(idleTile('magic'),W.magic),pc(idleTile('demon'),W.demon)]);
 sec('Knight idle',[...WEAPONS.map(w=>pc(idleTile('prac',w),K.prac)),pc(idleTile('orc'),K.orc),pc(idleTile('horse'),K.horse),pc(idleTile('cat'),ODDS.eknightCat)]);
 const PR=ODDS.priest,NE=ODDS.necromancer;
 sec('Priest idle',[pc(idleTile('pray1'),PR.pray),pc(idleTile('farmer'),PR.farmer),pc(idleTile('tithe'),PR.tithe),pc(idleTile('exorcise'),PR.exorcise)]);
 sec('Necromancer idle',[pc(idleTile('spirits'),NE.spirits),pc(idleTile('candles'),NE.candles),pc(idleTile('lightning'),NE.lightning),pc(idleTile('raise'),NE.raise)]);
 sec('Items',[pc(idleTile('fireball'),'scroll'),pc(idleTile('glow'),'scroll'),pc(idleTile('banish'),'scroll'),pc(idleTile('raise'),'scroll'),pc(idleTile('teleport'),'potion'),pc(idleTile('flex'),'potion'),pc(idleTile('wings'),'potion'),pc(idleTile('sniff'),'potion')]);
}
document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>{
 document.querySelectorAll('.tab').forEach(x=>x.classList.toggle('on',x===b));
 $('#tab-board').hidden=b.dataset.t!=='board';tabRef.hidden=b.dataset.t!=='ref';
 if(b.dataset.t==='ref'&&!anim.length)buildRef()});

// ---------- state ----------
function ui(){document.querySelectorAll('.it[data-id]').forEach(b=>b.classList.toggle('used',!!U[b.dataset.id]))}
function save(){try{const b={};for(const i in U)b[i]=[U[i].r,U[i].c,U[i].weapon,U[i].form,U[i].color];localStorage.setItem(KEY,JSON.stringify({boxes:b,un:S.un,coins:S.coins||0}))}catch(e){}}
function load(){let d=null;try{d=JSON.parse(localStorage.getItem(KEY))}catch(e){}
 if(d){S.un=d.un||{};S.coins=d.coins||0}
 showCoins();
 buildShelf();
 if(d&&d.boxes){for(const i in d.boxes)if(CH[i]){const q=d.boxes[i];addUnit(i,q[0],q[1],true,q[2],q[3],q[4])}}
 else{addUnit('knight',1,1,true);addUnit('wizard',1,3,true)}
 save();ui()}
load();requestAnimationFrame(frame);
