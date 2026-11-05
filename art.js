// ---------- art: room backgrounds and drawing ----------
const WALL={rogue:['#3a3440','#26222a'],alchemist:['#44384c','#2c2232'],farmer:['#8ab8e0','#6a4a24'],apothecary:['#3e4a3a','#2a3226'],merchant:['#5a4430','#3a2a1c'],knight:['#3c4058','#2a2c40'],wizard:['#33295c','#211a40'],priest:['#4a4458','#30293c'],necromancer:['#26262c','#18181c']};
// Priest's stained glass window (frame 16..44 x 12..52, center x 30, y 32). Tentacles can smash through it.
const WINDOW=[[16,12,28,40,'#2a2434'],[18,16,7,10,'#c04040'],[26,16,8,10,'#3a6ad0'],[35,16,7,10,'#d0b030'],[18,27,7,10,'#40a060'],[26,27,8,10,'#c890ff'],[35,27,7,10,'#c04040'],[18,38,7,12,'#3a6ad0'],[26,38,8,12,'#d0b030'],[35,38,7,12,'#40a060'],[29,19,2,8,'#f2e8a0'],[27,21,6,2,'#f2e8a0'],[20,12,20,2,'#3a3448']].map(r=>[r[0],r[1]+12,r[2],r[3],r[4]]); // moved down, clear of the name label
const WIN_C={x:30,y:44};
// Knight's back-wall door (hides the stairs). Center x 72, bottom at the floor line (y 66).
const BACKDOOR=[[61,31,22,35,'#1e2030'],[63,33,18,33,'#6a4420'],[69,33,1,33,'#5a3a1e'],[75,33,1,33,'#5a3a1e'],[63,38,18,2,'#3a2a1a'],[63,58,18,2,'#3a2a1a'],[65,49,2,2,'#f2c84a']];
const BACKDOOR_L=BACKDOOR.map(r=>[r[0]-48,r[1],r[2],r[3],r[4]]); // same door, on the left side of the room (Apothecary)
// Wizard's second bookshelf (slides aside to reveal the spiral staircase). Center x 68, bottom y 66.
const SHELF2=[[56,30,24,36,'#6a4a2a'],[58,32,20,32,'#3a2410'],[58,47,20,2,'#6a4a2a'],[59,35,4,12,'#c04040'],[64,37,3,10,'#40a0c0'],[68,35,4,12,'#d0b030'],[73,36,4,11,'#40c070'],[59,51,3,13,'#8a5ae0'],[63,52,5,12,'#c04040'],[69,50,3,14,'#40a0c0'],[73,53,4,11,'#d0b030']];
// Room backgrounds. The top-left corner (about y < 24) is kept clear so the name label never covers the decor.
const down=(list,dy)=>list.map(r=>[r[0],r[1]+dy,r[2],r[3],r[4]]);
function bg(id,w){
 // Farmer: open sky, sun (top right, clear of the label) and a fence; no doors at all (crops drawn by drawField)
 if(id==='farmer')return [[74,10,10,10,'#f8e070'],[72,12,14,6,'#f8e070'],[6,52,84,2,'#a07840'],[10,48,2,18,'#a07840'],[30,48,2,18,'#a07840'],[50,48,2,18,'#a07840'],[70,48,2,18,'#a07840'],[88,48,2,18,'#a07840']];
 // Apothecary: a window to the blue sky, herbs growing in planters, potions on display shelves, back door on the LEFT
 if(id==='apothecary')return [...BACKDOOR_L,
  [37,24,24,18,'#5a4024'],[39,26,20,14,'#8ac8f0'],[39,34,20,6,'#a8d8f8'],[44,29,7,3,'#ffffff'],[42,30,4,2,'#ffffff'],[48,33,2,7,'#5a4024'],[39,32,20,2,'#5a4024'],
  [38,56,22,10,'#8a5a2a'],[38,56,22,2,'#6a4420'],[40,46,2,10,'#4a9a3a'],[39,44,4,4,'#6aba4a'],[45,48,2,8,'#3a8a3a'],[44,46,4,3,'#d8e070'],[50,44,2,12,'#4a9a3a'],[48,42,6,4,'#6aba4a'],[55,49,2,7,'#3a8a3a'],[54,47,4,3,'#c890ff'],
  ...down([[62,22,30,2,'#6a4a2a'],[62,40,30,2,'#6a4a2a'],[64,13,4,9,'#d03050'],[70,15,4,7,'#4fb0ff'],[76,12,5,10,'#7aff7a'],[83,15,4,7,'#f2c84a'],[64,32,5,8,'#c890ff'],[71,30,4,10,'#f08a20'],[77,33,4,7,'#4fb0ff'],[83,31,5,9,'#d03050'],[65,14,2,2,'#ffffff'],[77,13,2,2,'#ffffff'],[72,31,2,2,'#ffffff']],10),
  [64,58,26,8,'#7a4a22'],[64,58,26,2,'#5a3418'],[68,53,3,5,'#7aff7a'],[74,52,3,6,'#d03050'],[80,53,3,5,'#4fb0ff']];
 // Rogue: a wall of disguises on pegs (wizard hat, helmet, red cap, mask, cloak), ninja stars stuck in the wall, a dagger target,
 // a hatch in the ceiling (the rope comes down from it) and a trapdoor in the floor. No back door.
 if(id==='rogue')return [...down([[8,26,44,2,'#5a3a1e'],[12,24,2,4,'#8a6a3a'],[26,24,2,4,'#8a6a3a'],[40,24,2,4,'#8a6a3a'],
  [9,28,9,3,'#5a3ca8'],[11,22,5,6,'#5a3ca8'],[13,19,2,3,'#5a3ca8'],[23,28,9,8,'#aab4c8'],[23,28,9,2,'#c03030'],[37,28,8,3,'#c04040'],[36,30,10,1,'#a02a2a'],
  [10,40,8,8,'#e8e4d0'],[11,42,2,2,O],[15,42,2,2,O],[12,46,4,1,O],[24,38,10,20,'#2e3a2e'],[26,38,6,4,'#3e4a3e']],6),
  [74,30,16,16,'#e8e4d0'],[76,32,12,12,'#c03030'],[78,34,8,8,'#e8e4d0'],[80,36,4,4,'#c03030'],[81,46,2,20,'#5a3a1e'],
  [56,30,5,1,'#aab4c8'],[58,28,1,5,'#aab4c8'],[62,44,5,1,'#aab4c8'],[64,42,1,5,'#aab4c8'],[50,52,5,1,'#aab4c8'],[52,50,1,5,'#aab4c8'],
  [64,4,20,4,'#3a2414'],[65,5,18,2,'#5a3a1e'],[19,80,24,8,'#3a2414'],[20,81,22,6,'#6a4420'],[27,81,1,6,'#4a2e14'],[35,81,1,6,'#4a2e14'],[30,83,3,2,'#aab4c8']];
 // Alchemist: back door on the LEFT, potions on shelves, a long table with a brewing setup (flask and flame animated in drawRoomLife)
 if(id==='alchemist')return [...BACKDOOR_L,
  [56,30,36,2,'#6a4a2a'],[56,44,36,2,'#6a4a2a'],[58,22,4,8,'#d03050'],[64,24,4,6,'#7aff7a'],[70,21,5,9,'#4fb0ff'],[77,23,4,7,'#f2c84a'],[84,22,5,8,'#c890ff'],
  [59,37,5,7,'#f08a20'],[66,36,4,8,'#c890ff'],[72,38,5,6,'#d03050'],[79,36,4,8,'#7aff7a'],[85,37,5,7,'#4fb0ff'],[59,22,1,2,'#ffffff'],[71,22,1,2,'#ffffff'],[67,37,1,2,'#ffffff'],
  [38,56,54,3,'#7a4a22'],[38,59,54,1,'#5a3418'],[41,59,3,7,'#5a3418'],[86,59,3,7,'#5a3418'],
  [53,53,7,3,'#4a4a52'],[61,43,2,2,'#cfe8f0'],[63,41,8,2,'#cfe8f0'],[71,41,2,6,'#cfe8f0'],[71,47,4,2,'#cfe8f0'],
  [76,47,7,9,'#cfe8f0'],[77,51,5,4,'#c890ff'],[78,45,3,2,'#8a5a2a'],[42,50,8,6,'#8a6a4a'],[43,48,6,2,'#a8884a']];
 // Fruit Merchant: striped banner just below the name label, crates of fruit
 if(id==='merchant')return [[6,24,84,6,'#c04040'],[6,24,12,6,'#f0e8d8'],[30,24,12,6,'#f0e8d8'],[54,24,12,6,'#f0e8d8'],[78,24,12,6,'#f0e8d8'],[8,46,22,18,'#8a5a2a'],[8,46,22,2,'#6a4420'],[11,42,4,4,'#d03030'],[16,41,4,4,'#e04040'],[21,42,4,4,'#c02828'],[13,38,4,4,'#d83838'],[32,50,20,14,'#8a5a2a'],[32,50,20,2,'#6a4420'],[34,46,4,4,'#f08a20'],[39,45,4,4,'#f8a030'],[44,46,4,4,'#e88018'],[48,38,3,8,'#f2d040'],[51,37,3,8,'#e8c830'],[54,38,3,8,'#f2d040'],...BACKDOOR];
 if(id==='priest')return [...WINDOW,[48,52,4,14,'#d8d0b0'],[47,50,6,2,'#a08a50'],[49,47,2,3,'#ffd060'],...BACKDOOR];
 if(id==='necromancer')return [...down([[10,22,40,3,'#3a3028'],[10,42,40,3,'#3a3028'],[14,14,7,8,'#e8e4d0'],[15,16,2,2,O],[18,16,2,2,O],[30,15,6,7,'#e8e4d0'],[31,17,2,2,O],[33,17,2,2,O],[40,16,3,6,'#2a2a2a'],[40,13,3,3,'#7aff7a'],[16,34,4,8,'#2a2a2a'],[16,31,4,3,'#7aff7a'],[26,36,10,6,'#4a3a5a'],[38,33,6,9,'#e8e4d0'],[39,35,2,2,O],[41,35,2,2,O]],10),...BACKDOOR];
 if(id==='wizard')return [...down([[10,14,38,42,'#6a4a2a'],[12,18,5,14,'#c04040'],[18,18,5,14,'#40a0c0'],[24,18,5,14,'#d0b030'],[30,18,5,14,'#8a5ae0'],[36,18,5,14,'#40c070'],[10,34,38,3,'#3a2410'],[12,38,5,14,'#d0b030'],[18,38,8,14,'#c04040'],[28,38,5,14,'#40a0c0'],[34,38,6,14,'#8a5ae0']],10),...SHELF2];
 // Knight: armor stand, back door, and a shorter wall weapon (kept below the label)
 const a=[[12,64,22,3,'#4a4e5a'],[16,60,5,5,'#8a94a8'],[25,60,5,5,'#8a94a8'],[14,44,16,16,'#8a94a8'],[24,44,6,16,'#667088'],[10,44,4,10,'#aab4c8'],[30,44,4,10,'#aab4c8'],[16,28,12,16,'#aab4c8'],[18,34,8,2,O],[21,24,2,4,'#c03030'],...BACKDOOR];
 const m={shield:[[41,40,14,17,'#3a5aa8'],[43,42,10,13,'#2a4488'],[46,45,4,7,'#f2c84a']],
  spear:[[47,32,2,34,'#8a5a2a'],[45,25,6,8,'#cfd6e0'],[47,23,2,3,'#fff']],
  glaive:[[47,34,2,32,'#8a5a2a'],[47,26,8,10,'#cfd6e0'],[49,28,4,6,'#8a94a8']],
  longsword:[[46,32,4,22,'#cfd6e0'],[41,54,14,3,'#c0a030'],[46,57,4,7,'#6a4420'],[45,64,6,2,'#c0a030']]};
 return a.concat(m[w||'longsword']);
}
// Fill a list of [x,y,w,h,color] rects offset by (ox,oy); with outline=true, a 2px dark outline goes behind
function rects(c,list,ox,oy,outline){
 if(outline){c.fillStyle=O;list.forEach(r=>c.fillRect(ox+r[0]-2,oy+r[1]-2,r[2]+4,r[3]+4))}
 list.forEach(r=>{c.fillStyle=r[4];c.fillRect(ox+r[0],oy+r[1],r[2],r[3])});
}

// ---------- characters ----------
// Moods: ok, happy, mad (red eyes, only for real anger), hurt (eyes squeezed shut, taking damage), shock (wide eyes, surprise)
// Small class symbol image (data URL) for name labels, from TAG_ICON in data.js
const TAGURL={};
function tagURL(cls){if(!TAGURL[cls]){const c=document.createElement('canvas');c.width=7;c.height=7;const x=c.getContext('2d');TAG_ICON[cls].forEach(r=>{x.fillStyle=r[4];x.fillRect(r[0],r[1],r[2],r[3])});TAGURL[cls]=c.toDataURL()}return TAGURL[cls]}
// leg = walking step (0 standing, 1 or 2 = the two steps): legs and boots slide apart and the back foot lifts
function stepLegs(p,leg){if(!leg)return p;const s=leg===1?1:-1;
 return p.map(r=>{if(r[1]<15)return r;const L=r[0]<8,dx=L?-s:s,lift=(L?s<0:s>0)&&r[1]>=19?1:0;return[r[0]+dx,r[1]-lift,r[2],r[3],r[4],r[5]]})}
function drawSprite(c,id,mood,pose,leg){
 const x=c.getContext('2d'),ch=CH[id],f=(a,b,w,h,k)=>{x.fillStyle=k;x.fillRect(a,b,w,h)};
 const A=ch.a?POSE[pose||'none'](ch.a):[],R=[...A.filter(r=>!r[5]),...stepLegs(ch.p,leg),...A.filter(r=>r[5])]; // front-of-body arm pieces last
 R.forEach(p=>f(p[0]-1,p[1]-1,p[2]+2,p[3]+2,O));R.forEach(p=>f(p[0],p[1],p[2],p[3],p[4]));
 if(mood==='hurt'){f(5,6,2,1,O);f(9,6,2,1,O);f(7,8,2,1,'#a22');return}
 if(mood==='sleep'){f(5,6,2,1,O);f(9,6,2,1,O);f(7,8,2,1,'#8a4a4a');return} // eyes closed, calm
 if(mood==='shock'){f(5,4,2,3,'#ffffff');f(9,4,2,3,'#ffffff');f(6,5,1,2,ch.eye);f(9,5,1,2,ch.eye);f(7,8,2,2,'#5a2a2a');return} // wide eyes, open mouth (surprise)
 const e=mood==='mad'?'#e03030':ch.eye;f(6,5,1,2,e);f(9,5,1,2,e);
 if(mood==='happy'){f(7,8,2,1,'#7a2a2a');f(5,7,1,1,'#f08080');f(10,7,1,1,'#f08080')}
 else if(mood==='mad'){f(6,4,2,1,O);f(9,4,2,1,O);f(7,8,2,1,'#a22')}else f(7,8,2,1,'#8a4a4a');
}
const SP={};
function sprite(id,m,pose,leg){const k=id+m+(pose||'')+(leg||'');if(!SP[k]){const c=document.createElement('canvas');c.width=16;c.height=22;drawSprite(c,id,m,pose,leg);SP[k]=c}return SP[k]}
function spr(c,id,m,cx,fy,face,bob,al,sc,pose,leg){c.save();c.globalAlpha=al==null?1:al;sc=sc||1;c.translate(Math.round(cx),Math.round(fy+bob));c.scale(face<0?-sc:sc,sc);c.drawImage(sprite(id,m,pose,leg),-16,-44,32,44);c.restore()}
// Walking step for time t (alternates 1, 2); eyes blink now and then (a short 'sleep' face), different timing per name
const stepOf=t=>1+Math.floor(t*7)%2;
const blinkMood=(m,seed,t)=>m==='ok'&&((t+seed*1.37)%4.3)<.13?'sleep':m;
const seedOf=s=>{let h=0;for(const ch of String(s))h=(h*31+ch.charCodeAt(0))%997;return h};
// Sprite name for a unit: Eldritch form, wizard outfit color, or plain id; plus its skin tone (e.g. priest_f~2)
const sid=u=>{if(u.asSprite&&!u.form)return u.asSprite; // a disguised Rogue looks like the character he copies
 const b=u.form||(u.color?u.id+'_'+u.color:u.id);return u.skin&&CH[b+'~'+u.skin]?b+'~'+u.skin:b};
// Which arm pose to show for an activity (act) that has run for `at` seconds
function poseOf(act,at){
 if(act==='read'||act==='tome'||act==='holy')return 'hold';
 if(act==='magic')return Math.floor(at*3)%2?'up':'fwd';
 if(act==='sprinkle')return Math.floor(at*4)%2?'up':'fwd';     // shaking holy water
 if(act==='smite')return 'both';
 if(act==='fireball')return at<1.3?'up':'none';
 if(act==='sip')return at<.8?'up':'none';
 if(act==='flex')return at<.7?'up':Math.floor(at*2.5)%2?'flex2':'flex';
 // Priest
 if(act==='farmer')return at>4.4&&at<5.6?(Math.floor(at*4)%2?'up':'fwd'):at>2.2&&at<4.4?'fwd':'none';
 if(act==='tithe'||act==='spirits'||act==='raise')return 'both';
 if(act==='exorcise')return at>2.2&&at<4.6?'both':'none';
 if(act==='banish')return at>1.2&&at<3.2?'both':'none';
 // Necromancer
 if(act==='candles')return at<1.6?'fwd':at<3.2?'up':'none';
 if(act==='lightning'||act==='nread')return 'hold';
 if(act==='sleepc'||act==='swapc'||act==='darkorb')return 'both';
 if(act==='frost')return 'up';
 if(act==='sniff')return at<1.1?'up':at<1.5?'fwd':'none';
 if(act==='brew')return Math.floor(at*2)%2?'fwd':'up';
 if(act==='fruitdrop')return Math.floor(at*2.5)%2?'up':'fwd';
 if(act==='curse'||act==='growb')return 'both';
 if(act==='abrew')return Math.floor(at*2)%2?'fwd':'up';
 if(act==='herbs')return at>1.2?'fwd':'none';
 if(act==='harvest')return Math.floor(at*3)%2?'fwd':'up';
 if(act==='tend')return 'fwd';
 if(act==='hoe')return (at*1.6)%1<.45?'up':'fwd';   // Farmer: hoe raised, then down into the soil
 if(act==='fork')return 'none';                     // Farmer carrying a pitchfork
 if(act==='wave')return Math.floor(at*5)%2?'wave':'up';
 if(act==='goldmix'||act==='cobrew')return Math.floor(at*2)%2?'fwd':'up';
 // Alchemist and Rogue
 if(act==='alcbrew')return at<1.2?'none':Math.floor(at*2)%2?'fwd':'up';
 if(act==='research')return 'hold';
 if(act==='smoke')return at<1?'fwd':at<3.4?'both':'none';
 if(act==='tear'||act==='conjure')return 'both';
 if(act==='retire')return at<1?'up':'both';
 if(act==='daggers')return at<.8?'none':(at%1)<.3?'up':'fwd';
 if(act==='count')return Math.floor(at*3)%2?'fwd':'hold';
 if(act==='chant'||act==='sacrifice'||act==='nrot')return 'both';
 if(act==='eatbanana')return 'up';
 if(act==='advert')return Math.floor(at*1.5)%2?'both':'up';
 if(act==='write')return 'fwd';
 if(act==='mob')return at>1.5&&at<5?'both':'none';
 if(act==='relic')return at<2.6?'up':'none';
 if(act==='prac')return 'noR';
 if(act==='learn'||act==='cast')return 'up';
 if(act==='demon')return at<1.6?'both':'up';
 if(act==='horse')return at>=1&&at<4.6?'fwd':'none';
 return 'none';
}
function box(c,id,x,y,w){
 const k=WALL[id];c.fillStyle=k[0];c.fillRect(x,y,CELL,CELL);c.fillStyle=k[1];c.fillRect(x,y+66,CELL,30);c.fillStyle='rgba(0,0,0,.3)';c.fillRect(x,y+66,CELL,2);
 bg(id,w).forEach(d=>{c.fillStyle=d[4];c.fillRect(x+d[0],y+d[1],d[2],d[3])});if(id==='alchemist')drawAlembic(c,x,y,0);
 c.strokeStyle='#000';c.lineWidth=2;c.strokeRect(x+1,y+1,CELL-2,CELL-2); // thin frame; boxFrame() thickens the outside edges
}
// Extra 2px of frame on the sides of a box that have no neighbor box, so every edge on the board looks the same thickness
// (two boxes side by side each draw their 2px, making 4px; a lone edge gets 2 + 2 = 4px too). sides = {t,b,l,r} true = add.
function boxFrame(c,x,y,s){c.fillStyle='#000';if(s.t)c.fillRect(x,y+2,CELL,2);if(s.b)c.fillRect(x,y+CELL-4,CELL,2);if(s.l)c.fillRect(x+2,y,2,CELL);if(s.r)c.fillRect(x+CELL-4,y,2,CELL)}

// ---------- ways between rooms (drawn behind the characters) ----------
// backdoor and shelf are always part of the room, so only their open state is drawn here.
function drawFx(f){
 const x=f.x,y=f.y,o=f.open,t=f.type==='backdoorL'?'backdoor':f.type,fixed=t==='backdoor'||t==='shelf'||t==='rope'||t==='trapdoor';
 if(t==='rope'&&o>.02){const by=Math.floor((y-1)/CELL)*CELL;g.fillStyle='#000';g.fillRect(x-9,by+4,18,4); // open ceiling hatch, rope dropping down
  const len=Math.round(o*(y-by-10));g.fillStyle=O;g.fillRect(x-2,by+7,4,len+1);g.fillStyle='#b8946a';g.fillRect(x-1,by+7,2,len);g.fillStyle='#8a6a44';for(let k=by+10;k<by+7+len;k+=4)g.fillRect(x-1,k,2,1);return}
 if(t==='trapdoor'&&o>.02){g.fillStyle='#000';g.fillRect(x-11,y-4,22,8);g.fillStyle=O;g.fillRect(x-12,y-4-Math.round(o*14),3,Math.round(o*14)+1); // open hole, lid standing up
  g.fillStyle='#6a4420';g.fillRect(x-11,y-3-Math.round(o*14),1,Math.round(o*14));return}
 g.save();g.globalAlpha=fixed?1:f.a;
 if(t==='door'){
  // The door sits in the wall line between two rooms, so we only see its edge.
  // Closed = flat against the line (invisible). Opening, it swings out toward the viewer
  // into the next room (f.dir), so it shows as a narrow panel seen from the side.
  if(o>.03){const d=f.dir||1,sn=Math.sin(o*1.1),w=Math.max(3,Math.round(22*sn)),fx=x+d*w,top=y-58,grow=Math.round(3*sn);
   g.beginPath();g.moveTo(x,top);g.lineTo(fx,top-grow);g.lineTo(fx,y+grow);g.lineTo(x,y);g.closePath();g.fillStyle='#9a6a34';g.fill();g.lineWidth=2;g.strokeStyle=O;g.stroke();
   g.fillStyle='#7a5226';for(const k of [.33,.66]){const py=top+58*k;g.beginPath();g.moveTo(x,py);g.lineTo(fx,py-grow*(1-2*k));g.lineTo(fx,py-grow*(1-2*k)+2);g.lineTo(x,py+2);g.closePath();g.fill()}
   g.fillStyle='#5a3a1e';g.fillRect(d>0?fx-2:fx,top-grow,2,58+grow*2); // the door's outer edge
   if(w>8){g.fillStyle='#f2c84a';g.fillRect(fx-d*5-1,y-30,3,3)}}}
 else if(t==='portal'){const h=58,w=36,c=Math.floor(T*8)%2?'#8fe0ff':'#c890ff';
  g.fillStyle='#6a4cc2';g.fillRect(x-w/2,y-h,w,h);g.fillStyle=c;g.fillRect(x-w/2+2,y-h+2,w-4,h-4);g.fillStyle='#fff';g.fillRect(x-w/2+5,y-h+6,w-10,h-12)}
 else if(t==='backdoor'&&o>.02){
  // black doorway, door panel swinging toward the viewer on its left hinge
  g.fillStyle='#000000';g.fillRect(x-9,y-33,18,33);
  const pw=Math.max(2,Math.round(18*Math.cos(o*1.35))),gr=Math.round(3*Math.sin(o*1.35));
  g.fillStyle=O;g.fillRect(x-10,y-34-gr,pw+2,35+gr*2);g.fillStyle='#6a4420';g.fillRect(x-9,y-33-gr,pw,33+gr*2);
  g.fillStyle='#3a2a1a';g.fillRect(x-9,y-28-gr,pw,2);g.fillRect(x-9,y-8+gr,pw,2)}
 else if(t==='shelf'&&o>.02){
  // black opening; the bookshelf slides right into the wall
  const bl=Math.floor(x/CELL)*CELL,top=y-66;
  g.fillStyle='#000000';g.fillRect(x-12,y-36,24,36);
  g.beginPath();g.rect(bl+4,top,88,70);g.clip();rects(g,SHELF2,bl+Math.round(o*22),top)}
 g.restore();
}
function heart(c,x,y){c.fillStyle='#e04060';c.fillRect(x-4,y,3,3);c.fillRect(x+1,y,3,3);c.fillRect(x-4,y+2,8,2);c.fillRect(x-2,y+4,4,2);c.fillRect(x-1,y+6,2,1)}

// ---------- weapon practice: the arm swings with the weapon ----------
const ease=e=>e*e*(3-2*e),lerp=(a,b,e)=>a+(b-a)*e;
// Arm angle th (0 = hanging down, bigger = rotated forward and up) and body lean dx, for a weapon at time t
function swing(t,P,rest,up,hit,lean){const p=(t%P)/P;let e;
 if(p<.45){e=ease(p/.45);return{th:lerp(rest,up,e),dx:lerp(0,-1,e)}}        // wind up overhead
 if(p<.58){e=(p-.45)/.13;return{th:lerp(up,hit,e),dx:lerp(-1,lean,e)}}      // fast strike down
 e=ease((p-.58)/.42);return{th:lerp(hit,rest,e),dx:lerp(lean,0,e)}}          // recover
function thrust(t,P,rest,back,out,lean){const p=(t%P)/P;let e;
 if(p<.4){e=ease(p/.4);return{th:lerp(rest,back,e),dx:lerp(0,-2,e)}}
 if(p<.52){e=(p-.4)/.12;return{th:lerp(back,out,e),dx:lerp(-2,lean,e)}}
 e=ease((p-.52)/.48);return{th:lerp(out,rest,e),dx:lerp(lean,0,e)}}
function pracAnim(w,t){
 if(w==='glaive')return swing(t,1.4,.6,3.9,1.3,4);
 if(w==='spear')return thrust(t,.9,1.35,1.2,1.6,4);
 if(w==='shield'){const p=(t%1),bump=p>.45&&p<.65?Math.sin((p-.45)/.2*Math.PI):0;return{th:.35+.15*bump,dx:-bump*2}} // braced behind the shield, pushed back a little by each hit
 return swing(t,1,.5,3.5,1.1,3); // longsword and the Eldritch Knight's magic sword
}
const weaponOf=u=>u.form==='eknight'?'magic':(u.weapon||'longsword');
// How far the body leans while practicing (so the sprite and the swinging arm move together)
const actDx=u=>u.act==='prac'?Math.round(pracAnim(weaponOf(u),u.at).dx)*u.face:0;

// Swirling sparkles around a character: pur = 0 blue, 1 purple (eldritch), 2 gold (holy); k = how strong (0..1)
const SWIRL=[['#2a6af0','#4fb0ff','#bfe8ff'],['#c890ff','#e8d0ff','#8a5ae0'],['#f2c84a','#fff0a0','#d8a030'],['#3ac85a','#7aff7a','#1a8a3a'],['#bfe8ff','#ffffff','#7ac8ff']]; // 3 = necromantic green, 4 = frost
function swirl(c,x,y,t,pur,k){const K=SWIRL[pur||0],n=Math.round(14*k);
 for(let i=0;i<n;i++){const an=t*(pur?3:4)+i*Math.PI*2/14,r=13+5*Math.sin(t*3+i),px=x+Math.cos(an)*r*1.2,py=y-24+Math.sin(an)*r*.8-(i%7)*2.5+8,s=i%3===2?2:3;
  c.fillStyle=K[i%3];c.fillRect(Math.round(px-s/2),Math.round(py-s/2),s,s)}}
// Magic shield bubble around a character (sparring). t = time since raised, hit = flashes brighter when struck
function drawWard(c,x,y,t,hit){const a=cl(t/.4,0,1);if(a<=0)return;
 c.save();c.globalAlpha=a;c.fillStyle=hit?'rgba(170,230,255,.4)':'rgba(120,200,255,.14)';c.beginPath();c.ellipse(x,y-22,18,26,0,0,Math.PI*2);c.fill();
 for(let i=0;i<24;i++){const an=i/24*Math.PI*2+t*1.2,px=Math.round(x+Math.cos(an)*18),py=Math.round(y-22+Math.sin(an)*26);c.fillStyle=(i+Math.floor(t*6))%3?'#4fb0ff':'#bfe8ff';c.fillRect(px-1,py-1,hit?3:2,hit?3:2)}
 c.restore()}
// Activity overlays drawn in front of the character. u needs: act, at (seconds), x, y (feet), face, and for the knight weapon/form.
function drawAct(c,u){
 const f=u.face,a=u.act,t=u.at,x=u.x,y=u.y;
 if(a==='lightning')drawRedLightning(c,x,y,t);
 if(a==='smoke'&&t>1){const bx=Math.floor(x/CELL)*CELL,by=Math.floor((y-1)/CELL)*CELL,k=cl((t-1)/.8,0,1)*cl((5-t)/1.2,0,1);
  c.fillStyle='rgba(140,140,150,'+(.75*k)+')';c.fillRect(bx,by,CELL,CELL);for(let i=0;i<7;i++){c.fillStyle='rgba(200,200,210,'+(.6*k)+')';c.fillRect(Math.round(bx+10+((i*29+t*14)%76)),Math.round(by+20+((i*17)%50)+Math.sin(t*2+i)*4),10,7)}}
 if(a==='read'||a==='tome'||a==='holy'||a==='lightning'||a==='nread'||a==='research'){
  // Held up and open toward the reader: we see the covers and spine, page tops, and pages turning over the top.
  // tome = the Wizard's eldritch spellbook; holy = the Priest's white book with a gold cross; lightning = the Necromancer's black book with red runes
  const tm=a==='tome',hb=a==='holy',nb=a==='lightning'||a==='nread',bx=Math.round(x+f*2),by=Math.round(y-20),pf=(t*.9)%1;
  if(tm)swirl(c,x,y,t,1,cl(t/1.5,0,1));
  c.fillStyle=O;c.fillRect(bx-8,by-7,16,13);
  c.fillStyle='#f2ead0';c.fillRect(bx-7,by-6,14,2);
  c.fillStyle=tm?'#3a1a5a':hb?'#f0f0f8':nb?'#24222a':'#7a4a22';c.fillRect(bx-7,by-4,7,9);c.fillStyle=tm?'#2e1448':hb?'#d4d4e0':nb?'#18161c':'#6a3e1c';c.fillRect(bx,by-4,7,9);
  c.fillStyle=tm?'#1a0a2a':hb?'#b0b0c0':nb?'#0a090c':'#4a2a12';c.fillRect(bx-1,by-4,2,9);
  if(hb){c.fillStyle='#f2c84a';c.fillRect(bx-5,by-3,1,6);c.fillRect(bx-6,by-1,3,1);c.fillRect(bx+4,by-3,1,6);c.fillRect(bx+3,by-1,3,1)}
  else{c.fillStyle=tm?(Math.floor(t*6)%2?'#c890ff':'#e8d0ff'):nb?(Math.floor(t*6)%2?'#ff3030':'#ff9090'):'#f2c84a';c.fillRect(bx-5,by-1,2,2);c.fillRect(bx+3,by-1,2,2)}
  if(pf<.35){const k=pf/.35,px=Math.round(bx+f*(6-12*k)),py=Math.round(by-6-Math.sin(k*Math.PI)*6);c.fillStyle='#fff';c.fillRect(px-1,py,2,by-5-py)}}
 else if(a==='smite'||a==='tithe'){swirl(c,x,y,t,2,1)} // priest's holy power (gold)
 else if(a==='raise'){swirl(c,x,y,t,3,1)} // necromancer raising the dead (green)
 else if(a==='sleepc'){swirl(c,x,y,t,1,1)}
 else if(a==='swapc'){swirl(c,x,y,t,u.id==='necromancer'?3:1,1)}
 else if(a==='frost'){const bx=Math.floor(x/CELL)*CELL,by=Math.floor((y-1)/CELL)*CELL;swirl(c,x,y,t,4,1);drawSnow(c,bx,by,t)}
 else if(a==='darkorb'){const r=Math.round(2+cl(t/1.5,0,1)*7),ox=Math.round(x+f*2),oy=Math.round(y-50);c.fillStyle='rgba(40,10,60,.85)';c.beginPath();c.arc(ox,oy,r+3,0,Math.PI*2);c.fill();c.fillStyle='#0a0410';c.beginPath();c.arc(ox,oy,r,0,Math.PI*2);c.fill();c.fillStyle='#c890ff';for(let i=0;i<6;i++){const an=t*4+i;c.fillRect(Math.round(ox+Math.cos(an)*(r+4)),Math.round(oy+Math.sin(an)*(r+4)),2,2)}}
 else if(a==='exorcise'&&t>2.2&&t<4.6){swirl(c,x,y,t,2,1)}
 else if(a==='farmer'&&t>4.4&&t<5.6){const up=Math.floor(t*4)%2,hx=Math.round(x+f*(up?11:16)),hy=Math.round(y-(up?36:22));
  c.fillStyle=O;c.fillRect(hx-3,hy-7,6,9);c.fillStyle='#a8d8ff';c.fillRect(hx-2,hy-4,4,5);c.fillStyle='#e8f6ff';c.fillRect(hx-2,hy-6,4,2);c.fillStyle='#8a5a2a';c.fillRect(hx-1,hy-7,2,1)}
 else if(a==='spirits'){const bx=Math.floor(x/CELL)*CELL,by=Math.floor((y-1)/CELL)*CELL;drawWisps(c,bx,by,t,cl(t/.8,0,1)*cl((5-t)/.6,0,1))}
 else if(a==='banish'&&u.ghost){ // a ghost appears; the priest drives it off with holy light
  const gh=u.ghost,ga=t<.8?t/.8:t<2?1:cl(1-(t-2)/1.2,0,1);
  if(t>1.2&&t<3.2){const la=cl((t-1.2)/.4,0,1)*cl((3.2-t)/.4,0,1);c.save();c.globalAlpha=la;c.strokeStyle='rgba(255,236,150,.9)';c.lineWidth=5;c.beginPath();c.moveTo(x+f*6,y-36);c.lineTo(gh.x,gh.y-26);c.stroke();
   c.fillStyle='rgba(255,250,210,.6)';c.beginPath();c.arc(x,y-38,10,0,Math.PI*2);c.fill();c.restore()}
  if(ga>0)spr(c,'ghost',t>2?'hurt':'ok',gh.x,gh.y-6-Math.sin(t*3)*3-(t>2?(t-2)*14:0),gh.x>x?-1:1,0,.75*ga,1)}
 else if(a==='curse'){swirl(c,x,y,t,3,1);swirl(c,x,y,t+.7,1,.6)}
 else if(a==='growb'){swirl(c,x,y,t,2,1)}
 else if(a==='eatbanana'){drawItem(c,'banana',Math.round(x+f*9),Math.round(y-38),1)}
 else if(a==='abrew'){drawCauldron(c,Math.round(x+f*18),Math.round(y),t);if(t>3.2)drawItem(c,'potion',Math.round(x+f*18),Math.round(y-20-(t-3.2)*10),1)}
 else if(a==='herbs'&&t>1.2&&t<3.4){const hx=Math.round(x+f*14),hy=Math.round(y-22);c.fillStyle=O;c.fillRect(hx-4,hy-4,9,7);c.fillStyle='#8a94a8';c.fillRect(hx-3,hy-3,7,5);c.fillRect(hx+f*4,hy-5,2,2);c.fillStyle='#8fd0ff';for(let i=0;i<3;i++)c.fillRect(Math.round(hx+f*(6+i*2)),Math.round(hy+((t*20+i*5)%16)),1,2)}
 else if(a==='herbs'&&t>=3.4){c.fillStyle='#6aba4a';c.fillRect(Math.round(x+f*12),Math.round(y-26),3,4);c.fillRect(Math.round(x+f*15),Math.round(y-24),2,3)}
 else if(a==='brew'){drawCauldron(c,Math.round(x+f*18),Math.round(y),t);if(t>3)drawItem(c,'potion',Math.round(x+f*18),Math.round(y-20-(t-3)*12),1)}
 else if(a==='relic'&&t<2.6){drawItem(c,'artifact',Math.round(x+f*9),Math.round(y-40),1);c.fillStyle='rgba(255,240,170,'+(.35+.25*Math.sin(t*10))+')';c.beginPath();c.arc(x+f*9,y-40,9,0,Math.PI*2);c.fill()}
 else if(a==='sniff'&&t<1.1){drawItem(c,'potion',Math.round(x+f*8),Math.round(y-36),1)}
 else if(a==='sprinkle'){ // a little flask of holy water in the hand
  const up=Math.floor(t*4)%2,hx=Math.round(x+f*(up?11:16)),hy=Math.round(y-(up?36:22));
  c.fillStyle=O;c.fillRect(hx-3,hy-7,6,9);c.fillStyle='#a8d8ff';c.fillRect(hx-2,hy-4,4,5);c.fillStyle='#e8f6ff';c.fillRect(hx-2,hy-6,4,2);c.fillStyle='#8a5a2a';c.fillRect(hx-1,hy-7,2,1)}
 else if(a==='fireball'&&t<1.3){ // the staff orb glows orange while the fireball charges
  const gx=Math.round(x-f*14),gy=Math.round(y-38),s=2+Math.round(cl(t/.7,0,1)*3);c.fillStyle='#ff8020';c.fillRect(gx-s,gy-s,s*2+1,s*2+1);c.fillStyle='#ffe080';c.fillRect(gx-1,gy-1,3,3)}
 else if((a==='flex'||a==='sip')&&t<.8){drawItem(c,'potion',Math.round(x+f*9),Math.round(y-38),1)} // drinking
 else if(a==='flex'){ // shine on the muscles
  if(Math.floor(t*5)%2){c.fillStyle='#fff8c0';c.fillRect(Math.round(x-14),Math.round(y-30),2,2);c.fillRect(Math.round(x+13),Math.round(y-30),2,2)}}
 else if(a==='magic'){swirl(c,x,y,t,0,1);
  // glow on the staff orb (red for the black-robed wizard)
  const red=u.color==='black',gx=Math.round(x-f*14),gy=Math.round(y-38);c.fillStyle=red?'#ff6060':'#4fb0ff';c.fillRect(gx-2,gy-2,5,5);c.fillStyle=red?'#ffd0d0':'#bfe8ff';c.fillRect(gx-1,gy-1,3,3)}
 else if(a==='prac'){
  const w=weaponOf(u),A=pracAnim(w,t),col=CH[u.form||'knight'].a,sx=Math.round(x+f*(10+Math.round(A.dx))),sy=Math.round(y-23);
  c.save();c.translate(sx,sy);c.scale(f,1);c.rotate(-A.th); // from here +y runs down the arm from the shoulder
  if(w==='longsword'||w==='magic'||w==='wood'){c.fillStyle='#6a4420';c.fillRect(-1,9,2,6);c.fillStyle='#c0a030';c.fillRect(-5,13,10,2);
   c.fillStyle=w==='magic'?'#b080ff':w==='wood'?'#a8784a':'#cfd6e0';c.fillRect(-2,15,3,22);c.fillStyle=w==='wood'?'#c89a68':'#fff';c.fillRect(-1,w==='magic'?16:33,1,w==='magic'?20:3)}
  else if(w==='glaive'){c.fillStyle='#8a5a2a';c.fillRect(-1,-10,2,44);c.fillStyle='#cfd6e0';c.fillRect(-1,32,7,12);c.fillStyle='#8a94a8';c.fillRect(1,34,4,8)}
  else if(w==='spear'){c.fillStyle='#8a5a2a';c.fillRect(-1,-14,2,46);c.fillStyle='#cfd6e0';c.fillRect(-3,32,6,8);c.fillStyle='#fff';c.fillRect(-1,40,2,3)}
  c.fillStyle=O;c.fillRect(-3,-2,6,15);c.fillStyle=col.bodyD;c.fillRect(-2,-1,4,10);c.fillStyle=col.skin;c.fillRect(-2,9,4,3);
  c.restore();
  if(w==='shield'){const hx=Math.round(x+f*(5+A.dx)),hy=Math.round(y-21); // shield held close in front of the body
   c.save();c.translate(hx,hy);c.scale(f,1);c.fillStyle=O;c.fillRect(-1,-13,12,25);c.fillStyle='#3a5aa8';c.fillRect(0,-12,10,23);c.fillStyle='#2a4488';c.fillRect(5,-12,5,23);c.fillStyle='#f2c84a';c.fillRect(3,-4,3,6);c.restore()}}
 else if(a==='hoe'){ // Farmer's hoe: raised over the shoulder, then chopped into the soil
  const up=(t*1.6)%1<.45,hx=Math.round(x+f*(up?8:14)),hy=Math.round(y-(up?34:24)),ex=Math.round(x+f*(up?2:26)),ey=Math.round(y-(up?50:2));
  stick(c,hx,hy,ex,ey,'#8a5a2a');c.fillStyle=O;c.fillRect(ex-3,ey-2,7,5);c.fillStyle='#8a94a8';c.fillRect(ex-2,ey-1,5,3);
  if(!up&&(t*1.6)%1<.6){c.fillStyle='#6a4a24';c.fillRect(ex+f*4,ey-3,2,2);c.fillRect(ex-f*3,ey-5,2,2)}}
 else if(a==='fork'){ // Farmer carrying a pitchfork upright
  const hx=Math.round(x+f*9);stick(c,hx,Math.round(y-2),hx,Math.round(y-44),'#8a5a2a');c.fillStyle=O;c.fillRect(hx-5,Math.round(y-46),11,3);c.fillRect(hx-5,Math.round(y-52),3,7);c.fillRect(hx-1,Math.round(y-53),3,8);c.fillRect(hx+3,Math.round(y-52),3,7);
  c.fillStyle='#cfd6e0';c.fillRect(hx-4,Math.round(y-45),9,1);c.fillRect(hx-4,Math.round(y-51),1,6);c.fillRect(hx,Math.round(y-52),1,7);c.fillRect(hx+4,Math.round(y-51),1,6)}
 else if(a==='goldmix'){swirl(c,x,y,t,2,1)} // Apothecary and Merchant brewing golden apples
 else if(a==='cobrew'){drawCauldron(c,Math.round(x+f*18),Math.round(y),t)} // brewing together with the Wizard
 else if(a==='alcbrew'&&t>1.2){const bx=Math.floor(x/CELL)*CELL,by=Math.floor((y-1)/CELL)*CELL,col=['#7aff7a','#c890ff','#f2c84a','#4fb0ff'][Math.floor(t*2)%4];
  for(let i=0;i<3;i++){const k=((t*1.5+i*.33)%1);c.fillStyle=col;c.fillRect(Math.round(bx+56+Math.sin(t*4+i)*3),Math.round(by+40-k*16),2,2)}}
 else if(a==='tear'){for(let i=0;i<6;i++){const k=((t*1.3+i*.17)%1);c.fillStyle=i%2?'#eadcb4':'#c8b890';c.fillRect(Math.round(x+(i-3)*5+Math.sin(t*5+i)*3),Math.round(y-34+k*34),3,2)}if(t<.7)drawItem(c,'scroll',Math.round(x+f*6),Math.round(y-38),1)}
 else if(a==='retire'){if(t<1)drawItem(c,'artifact',Math.round(x+f*9),Math.round(y-38),1);else{c.fillStyle='rgba(255,240,170,'+(.4*cl((t-1)/.5,0,1))+')';c.beginPath();c.arc(x,y-22,18,0,Math.PI*2);c.fill();glowSparkles(c,x,y,t)}}
 else if(a==='conjure'){swirl(c,x,y,t,1,1);if(t>1.6)drawItem(c,'artifact',Math.round(x+f*10),Math.round(y-40-(t-1.6)*8),1)}
 else if(a==='daggers'&&t>.8){const bx=Math.floor(x/CELL)*CELL,by=Math.floor((y-1)/CELL)*CELL,k=(t%1);
  if(k>=.3&&k<.6){const q=(k-.3)/.3;c.fillStyle='#cfd6e0';c.fillRect(Math.round(lerp(x+f*12,bx+82,q)),Math.round(lerp(y-30,by+38,q)),5,1)}
  const hits=Math.min(3,Math.floor(t-.5));c.fillStyle='#cfd6e0';for(let i=0;i<hits;i++)c.fillRect(bx+77+i*3,by+35+(i%2)*4,4,1)}
 else if(a==='count'){c.fillStyle=O;c.fillRect(Math.round(x+f*12)-5,Math.round(y-7),11,7);for(let i=0;i<3;i++)drawItem(c,'coin',Math.round(x+f*12),Math.round(y-4-i*3),1);
  if(Math.floor(t*3)%2)drawItem(c,'coin',Math.round(x+f*7),Math.round(y-22-Math.abs(Math.sin(t*6))*6),1)}
 else if(a==='chant'){swirl(c,x,y,t,3,1)}
 else if(a==='sacrifice'||a==='nrot'){swirl(c,x,y,t,3,1);swirl(c,x,y,t+.5,a==='sacrifice'?2:1,.6)}
 else if(a==='horse'&&t>=1&&t<4.6){
  // a bundle of hay in the outstretched hand, shrinking as the horse eats
  const hs=1-cl((t-1.8)/2.8,0,1),w=Math.round(8*hs)+2,hx=Math.round(x+f*17),hy=Math.round(y-22);
  c.fillStyle=O;c.fillRect(hx-w/2-1,hy-4,w+2,7);c.fillStyle='#e8c860';c.fillRect(hx-w/2,hy-3,w,5);
  c.fillStyle='#b8963a';c.fillRect(hx-w/2+1,hy-2,1,3);if(w>5)c.fillRect(hx+1,hy-1,1,3)}
}
// A 2px-wide pixel stick (tool handle) from (x1,y1) to (x2,y2), with a dark outline
function stick(c,x1,y1,x2,y2,col){const n=Math.max(Math.abs(x2-x1),Math.abs(y2-y1))||1;
 c.fillStyle=O;for(let i=0;i<=n;i++)c.fillRect(Math.round(lerp(x1,x2,i/n))-2,Math.round(lerp(y1,y2,i/n))-2,4,4);
 c.fillStyle=col;for(let i=0;i<=n;i++)c.fillRect(Math.round(lerp(x1,x2,i/n))-1,Math.round(lerp(y1,y2,i/n))-1,2,2)}
// Music note (the Farmer whistling)
function drawNote(c,x,y,a){c.save();c.globalAlpha=a;c.fillStyle=O;c.fillRect(x-1,y-1,4,4);c.fillRect(x+1,y-7,3,8);c.fillRect(x+1,y-8,5,3);c.fillStyle='#f2e8a0';c.fillRect(x,y,2,2);c.fillRect(x+2,y-6,1,7);c.fillRect(x+2,y-7,3,1);c.restore()}
// Locked board space: dark, with a padlock and its price
function drawLocked(c,x,y,price,can){c.fillStyle='#15122a';c.fillRect(x+1,y+1,CELL-2,CELL-2);c.strokeStyle='#2c2850';c.lineWidth=2;c.setLineDash([4,4]);c.strokeRect(x+6,y+6,CELL-12,CELL-12);c.setLineDash([]);
 const lx=x+48,ly=y+40;c.fillStyle=O;c.fillRect(lx-9,ly-14,18,8);c.fillRect(lx-11,ly-7,22,18);c.fillStyle='#8a8070';c.fillRect(lx-7,ly-12,3,6);c.fillRect(lx+4,ly-12,3,6);c.fillRect(lx-7,ly-13,14,2);
 c.fillStyle=can?'#d8a030':'#6a6060';c.fillRect(lx-10,ly-6,20,16);c.fillStyle=O;c.fillRect(lx-1,ly-2,3,6);
 drawItem(c,'coin',x+34,y+68,1);c.font='600 15px '+GAME_FONT;c.fillStyle=can?'#f2c84a':'#9a8f7a';c.fillText(String(price),x+42,y+73)}
// Coin button in the bottom-right of a shop room: tap it to buy
// (tucked into the bottom-right corner, just inside the black border)
function drawShopCoin(c,x,y){const cx=x+84,cy=y+84;c.fillStyle='rgba(10,8,20,.75)';c.fillRect(cx-8,cy-8,16,16);c.strokeStyle='#f2c84a';c.lineWidth=1;c.strokeRect(cx-7.5,cy-7.5,15,15);drawItem(c,'coin',cx,cy,1)}
// Bats (Necromancer above the Apothecary) and a bee swarm (Knight left of the Apothecary)
function drawBat(c,x,y,t){const up=Math.floor(t*10)%2;x=Math.round(x);y=Math.round(y);c.fillStyle=O;c.fillRect(x-2,y-1,4,3);
 if(up){c.fillRect(x-6,y-4,4,3);c.fillRect(x+2,y-4,4,3)}else{c.fillRect(x-6,y,4,2);c.fillRect(x+2,y,4,2)}c.fillStyle='#ff4040';c.fillRect(x-1,y,1,1);c.fillRect(x+1,y,1,1)}
function drawBees(c,bx,by,t,a){c.save();c.globalAlpha=a;for(let i=0;i<14;i++){const x=Math.round(bx+48+Math.sin(t*3.1+i*1.7)*30+Math.sin(t*9+i)*4),y=Math.round(by+44+Math.cos(t*2.3+i*2.1)*20+Math.cos(t*11+i)*3);
 c.fillStyle=O;c.fillRect(x-1,y-1,4,3);c.fillStyle='#f2c84a';c.fillRect(x,y,2,1);c.fillStyle='#ffffff';c.fillRect(x,y-2,2,1)}c.restore()}
// Alchemist's table: a flask over a little flame, a coiled glass tube and a collecting bottle (bx,by = room's top-left)
function drawAlembic(c,bx,by,t){const x=bx+56,y=by+52,fl=Math.floor(t*8)%3;c.fillStyle='#f08a20';c.fillRect(x-1,y+1-fl,3,2+fl);
 c.fillStyle=O;c.fillRect(x-5,y-10,11,10);c.fillStyle='#8fe0ff';c.fillRect(x-4,y-9,9,8);c.fillStyle='#7aff7a';c.fillRect(x-4,y-5,9,4);
 if(Math.floor(t*3)%2){c.fillStyle='#ffffff';c.fillRect(x-1+Math.floor(t*2)%3,y-7,1,1)}}
// Carnivorous plant growing out of a pot (Priest left of the Apothecary); grows over its first second, snaps its jaws
function drawPlant(c,x,y,t,hit){x=Math.round(x);const g2=cl(t/1,0,1),h=Math.round(10+g2*26),snap=Math.floor(t*4)%2,top=y-12-h;
 c.fillStyle=O;c.fillRect(x-7,y-12,14,12);c.fillStyle='#8a5a2a';c.fillRect(x-6,y-11,12,10);
 c.fillStyle=O;c.fillRect(x-3,top,6,h+1);c.fillStyle='#3a8a3a';c.fillRect(x-2,top,4,h);c.fillStyle='#4aaa3a';c.fillRect(x-8,y-22,6,3);c.fillRect(x+2,y-28,6,3);
 const jw=snap?6:2;c.fillStyle=O;c.fillRect(x-9,top-10-jw,18,20+jw);c.fillStyle=hit?'#ff9090':'#4aaa3a';c.fillRect(x-8,top-9-jw,16,8);c.fillRect(x-8,top+1,16,8);
 c.fillStyle='#c02040';c.fillRect(x-6,top-1-jw,12,jw+2);c.fillStyle='#ffffff';for(let i=-6;i<6;i+=3){c.fillRect(x+i,top-1-jw,1,2);c.fillRect(x+i+1,top,1,2)}}
// Gravestone for the Priest's funeral (bx,by = room's top-left)
// (it stands beside the kneeling Priest, who is in the middle, in front of the door)
function drawGrave(c,bx,by){const x=bx+74,y=by+70;c.fillStyle=O;c.fillRect(x-9,y-24,18,25);c.fillRect(x-7,y-26,14,2);c.fillStyle='#8a8f9a';c.fillRect(x-8,y-23,16,23);c.fillRect(x-6,y-25,12,2);
 c.fillStyle='#5a5f6a';c.fillRect(x-1,y-20,2,10);c.fillRect(x-4,y-17,8,2);c.fillStyle='#d03050';c.fillRect(x-10,y-2,4,3);c.fillRect(x+6,y-3,4,3)}
// Dark ritual (Necromancer below the Apothecary): the room goes dark, candles in a circle light it (a = how dark, 0..1)
function drawRitualRoom(c,bx,by,t,a){if(a<=0)return;c.fillStyle='rgba(6,4,14,'+(.7*a)+')';c.fillRect(bx,by,CELL,CELL);
 for(let i=0;i<6;i++){const ang=i/6*Math.PI*2,x=Math.round(bx+48+Math.cos(ang)*32),y=Math.round(by+80+Math.sin(ang)*8),fl=Math.floor(t*8+i)%3;
  c.fillStyle='rgba(255,180,80,'+(.18*a)+')';c.beginPath();c.arc(x,y-8,8,0,Math.PI*2);c.fill();c.fillStyle='#e8e4d0';c.fillRect(x-1,y-6,3,6);c.fillStyle='#ffd060';c.fillRect(x,y-8-fl,1,2+fl)}}
// Golden board space (philosopher's stone): a soft gold tint and a slow sparkle
function drawGoldCell(c,bx,by,t){c.fillStyle='rgba(255,210,60,.16)';c.fillRect(bx+2,by+2,CELL-4,CELL-4);if(Math.floor(t*2)%3===0){c.fillStyle='#fff6c0';c.fillRect(bx+10+Math.floor(t*7)%76,by+10+Math.floor(t*5)%70,2,2)}}
// Golden apples on the Fruit Merchant's crates (Apothecary above him)
function drawGold(c,bx,by,t){c.fillStyle='#f2c84a';[[11,42,4,4],[16,41,4,4],[21,42,4,4],[13,38,4,4]].forEach(r=>c.fillRect(bx+r[0],by+r[1],r[2],r[3]));c.fillStyle='#fff6c0';[[12,42],[17,41],[22,42],[14,38]].forEach(q=>c.fillRect(bx+q[0],by+q[1],1,1));
 if(Math.floor(t*3)%2){c.fillStyle='#fffbe0';c.fillRect(bx+10+Math.floor(t*3)%14,by+36,2,2)}}
// Little bits of life in the rooms: flickering candle flames, a cloud drifting past the Apothecary's window
function drawRoomLife(c,id,bx,by,t){const fl=(k)=>Math.floor(t*8+k)%3;
 if(id==='priest'){const h=2+fl(0);c.fillStyle='#4a4458';c.fillRect(bx+48,by+44,4,6);c.fillStyle='#ffd060';c.fillRect(bx+49,by+50-h,2,h);c.fillStyle='#fff6c0';c.fillRect(bx+49,by+49,1,1)}
 if(id==='necromancer'){[[40,23],[16,41]].forEach((q,i)=>{const h=2+fl(i*2);c.fillStyle='#26262c';c.fillRect(bx+q[0],by+q[1]-2,3,3);c.fillStyle='#7aff7a';c.fillRect(bx+q[0],by+q[1]+3-h,3,h)})}
 if(id==='apothecary'){c.save();c.beginPath();c.rect(bx+39,by+26,20,6);c.clip();c.fillStyle='#8ac8f0';c.fillRect(bx+39,by+26,20,6);const cx=bx+39+((t*4)%34)-8;c.fillStyle='#ffffff';c.fillRect(Math.round(cx),by+28,7,3);c.fillRect(Math.round(cx)+2,by+27,4,1);c.restore()}
 if(id==='alchemist')drawAlembic(c,bx,by,t);
 if(id==='wizard'&&Math.floor(t*2)%5===0){c.fillStyle='#e8d0ff';c.fillRect(bx+14+Math.floor(t*2)%30,by+26,1,1)}}
// Horse head and neck poking in from the right edge of the knight's room. ex = room's right edge, fy = floor y, t = activity time
function drawHorse(c,ex,fy,t){
 const e=t<5.2?34*ease(cl(t/1.2,0,1)):34*(1-ease(cl((t-5.2)/1,0,1))),eat=t>1.8&&t<4.6,hb=eat?Math.round(4+2*Math.sin(t*9)):0,x0=Math.round(ex-e);
 if(e<1)return;
 c.save();c.beginPath();c.rect(ex-92,fy-84,88,96);c.clip();
 rects(c,[[x0+10,-46,40,20,'#7a4a2a'],[x0+12,-50,38,5,'#3a2414']],0,fy,true);
 rects(c,[[x0,-50+hb,16,13,'#7a4a2a'],[x0-4,-40+hb,12,9,'#9a6a44'],[x0+10,-56+hb,4,6,'#6a3e1e']],0,fy,true);
 rects(c,[[x0+12,-50,4,6,'#3a2414'],[x0+6,-46+hb,2,2,O],[x0-2,-36+hb,2,2,'#3a2414']],0,fy);
 c.restore();
}
// Small black cat walking along the back of a room. bx,by = room's top-left, t = time, dir = 1 right / -1 left
function drawCat(c,bx,by,t,dir){
 const x=Math.round(dir>0?bx+4+t*16:bx+92-t*16),y=by+70,lg=Math.floor(t*8)%2,k='#0c0a10';
 c.save();c.beginPath();c.rect(bx+4,by,88,96);c.clip();c.translate(x,y);c.scale(dir,1);
 c.fillStyle=k;c.fillRect(-6,-8,12,5);c.fillRect(5,-12,6,6);c.fillRect(5,-14,2,2);c.fillRect(9,-14,2,2);c.fillRect(-9,-15,2,9);c.fillRect(-9,-15,4,2);
 if(lg){c.fillRect(-5,-3,2,3);c.fillRect(3,-3,2,3)}else{c.fillRect(-3,-3,2,3);c.fillRect(1,-3,2,3)}
 c.fillStyle='#ffd34e';c.fillRect(7,-10,1,1);c.fillRect(9,-10,1,1);
 c.restore();
}
// Demon: summoning circle, rises, grabs the wizard (lunge), then both sink into the floor.
function drawDemon(c,d){
 const t=d.t,fade=t>2.9?cl(1-(t-2.9)/.8,0,1):1,gr=cl(t/.8,0,1),col=Math.floor(T*10)%2?'#ff5050':'#a02020',
  rise=cl((t-.6)/.9,0,1),sink=cl((t-1.9)/1,0,1),lg=Math.round(cl((t-1.5)/.4,0,1)*14)*d.dir;
 c.save();c.globalAlpha=fade;
 for(let i=0;i<20;i++){const a=i/20*Math.PI*2+t*1.5;c.fillStyle=i%2?col:'#ffb0b0';c.fillRect(Math.round(d.x+lg/2+Math.cos(a)*24*gr-1),Math.round(d.y-3+Math.sin(a)*6*gr-1),3,3)}
 c.beginPath();c.rect(d.x-40,d.y-90,80,90);c.clip();
 if(rise>0&&sink<1)spr(c,'demon',t>1.5?'mad':'ok',d.x+lg,d.y+(1-rise)*48+sink*48,d.dir,0,1,1);
 c.restore();
}
// How far a wizard being dragged down by a demon has sunk (0..1), from the demon activity time
const sinkOf=at=>cl((at-1.9)/1,0,1);

// ---------- items (consumables) ----------
// Icon centered at (x,y); s = pixel size (1 on the board, bigger on the shelf)
function drawItem(c,kind,x,y,s){
 const R=kind==='scroll'
  ?[[-6,-3,12,6,'#eadcb4'],[-7,-4,2,8,'#c8b890'],[5,-4,2,8,'#c8b890'],[-4,-1,6,1,'#9a8a68'],[-1,1,3,3,'#c03030']]
  :kind==='artifact'?[[-2,-6,4,1,'#f2c84a'],[-3,-5,6,2,'#f2c84a'],[-4,-3,8,6,'#d8a030'],[-2,-2,4,4,'#7ae0ff'],[-1,-1,1,1,'#ffffff'],[-1,3,2,2,'#d8a030'],[-3,5,6,1,'#f2c84a']]
  :kind==='banana'?[[-4,-1,2,3,'#f2d040'],[-3,1,6,2,'#f2d040'],[2,-2,2,3,'#f2d040'],[3,-3,1,1,'#6a4420'],[-2,2,4,1,'#c8a020']]
  :kind==='starfruit'?[[-1,-4,2,8,'#f8d840'],[-4,-1,8,2,'#f8d840'],[-2,-2,4,4,'#ffe868'],[-3,2,2,2,'#f8d840'],[1,2,2,2,'#f8d840']]
  :kind==='durian'?[[-3,-3,6,6,'#8a9a3a'],[-4,-1,1,2,'#6a7a2a'],[3,-1,1,2,'#6a7a2a'],[-1,-4,2,1,'#6a7a2a'],[-1,3,2,1,'#6a7a2a'],[-2,-2,1,1,'#aaba5a'],[1,0,1,1,'#aaba5a']]
  :kind==='bloodorange'?[[-3,-2,6,5,'#f06a20'],[-2,-3,4,1,'#f06a20'],[-1,-1,3,3,'#a01828'],[0,-4,1,1,'#4a9a3a'],[-2,-1,1,1,'#ffc080']]
  :kind==='bone'?[[-5,-1,10,2,'#e8e4d0'],[-6,-2,2,2,'#e8e4d0'],[-6,0,2,2,'#e8e4d0'],[4,-2,2,2,'#e8e4d0'],[4,0,2,2,'#e8e4d0']]
  :kind==='blackpotion'?[[-1,-6,2,1,'#8a5a2a'],[-1,-5,2,2,'#cfe8f0'],[-3,-3,6,6,'#cfe8f0'],[-2,-1,4,3,'#1a1226'],[-2,-2,1,1,'#ffffff'],[1,0,1,1,'#7aff7a']]
  :kind==='greenapple'?[[-3,-2,6,5,'#7ac840'],[-2,-3,4,1,'#7ac840'],[0,-5,1,2,'#6a4420'],[1,-5,2,1,'#4a9a3a'],[-2,-1,1,1,'#d8f8a0']]
  :kind==='blood'?[[-1,-6,2,1,'#8a5a2a'],[-1,-5,2,2,'#cfe8f0'],[-2,-3,4,7,'#cfe8f0'],[-1,-1,2,4,'#a01818']]
  :kind==='purplepotion'?[[-1,-6,2,1,'#8a5a2a'],[-1,-5,2,2,'#cfe8f0'],[-3,-3,6,6,'#cfe8f0'],[-2,-1,4,3,'#a050e0'],[-2,-2,1,1,'#ffffff']]
  :kind==='goldapple'?[[-3,-2,6,5,'#f2c84a'],[-2,-3,4,1,'#f2c84a'],[0,-5,1,2,'#6a4420'],[1,-5,2,1,'#4a9a3a'],[-2,-1,1,1,'#fff6c0'],[1,1,2,2,'#d8a030']]
  :kind==='apple'?[[-3,-2,6,5,'#d83030'],[-2,-3,4,1,'#d83030'],[0,-5,1,2,'#6a4420'],[1,-5,2,1,'#4a9a3a'],[-2,-1,1,1,'#ff9090']]
  :kind==='orange'?[[-3,-2,6,5,'#f08a20'],[-2,-3,4,1,'#f08a20'],[0,-4,1,1,'#4a9a3a'],[-2,-1,1,1,'#ffc080']]
  :kind==='coin'?[[-2,-4,5,1,'#f2c84a'],[-3,-3,7,7,'#f2c84a'],[-2,4,5,1,'#f2c84a'],[-4,-2,1,5,'#f2c84a'],[4,-2,1,5,'#f2c84a'],[0,-2,1,5,'#b8862a'],[-2,-2,1,1,'#fff6c0']]
  :[[-1,-6,2,1,'#8a5a2a'],[-1,-5,2,2,'#cfe8f0'],[-3,-3,6,6,'#cfe8f0'],[-2,-1,4,3,'#d03050'],[-2,-2,1,1,'#ffffff']];
 c.fillStyle=O;R.forEach(r=>c.fillRect(Math.round(x+(r[0]-1)*s),Math.round(y+(r[1]-1)*s),(r[2]+2)*s,(r[3]+2)*s));
 R.forEach(r=>{c.fillStyle=r[4];c.fillRect(Math.round(x+r[0]*s),Math.round(y+r[1]*s),r[2]*s,r[3]*s)});
}
// Fireball flying from (sx,sy) to (ex,ey); k = 0..1 progress
function drawFireball(c,sx,sy,ex,ey,k){
 const x=lerp(sx,ex,k),y=lerp(sy,ey,k)-Math.sin(k*Math.PI)*16;
 for(let i=1;i<5;i++){const q=Math.max(0,k-i*.05),tx=lerp(sx,ex,q),ty=lerp(sy,ey,q)-Math.sin(q*Math.PI)*16;c.fillStyle=i%2?'#ff6020':'#c03020';c.fillRect(Math.round(tx-4+i),Math.round(ty-4+i),8-i*2,8-i*2)}
 c.fillStyle='#ff8020';c.fillRect(Math.round(x-6),Math.round(y-6),12,12);c.fillStyle='#ffd040';c.fillRect(Math.round(x-4),Math.round(y-4),8,8);c.fillStyle='#fff8d0';c.fillRect(Math.round(x-2),Math.round(y-2),4,4);
}
// Golden glow (spell scroll on the Knight): soft aura behind him. t = time, used for the pulse
function drawGlow(c,x,y,t){
 const p=.6+.4*Math.sin(t*4),gr=c.createRadialGradient(x,y-22,4,x,y-22,30);
 gr.addColorStop(0,'rgba(255,220,100,'+(.55*p)+')');gr.addColorStop(1,'rgba(255,200,60,0)');
 c.fillStyle=gr;c.fillRect(x-32,y-54,64,62);
}
function glowSparkles(c,x,y,t){for(let i=0;i<5;i++){if((Math.floor(t*6)+i)%3)continue;const a=i*1.3+t,px=Math.round(x+Math.cos(a)*10),py=Math.round(y-24+Math.sin(a*1.7)*12);c.fillStyle='#fff6c0';c.fillRect(px,py,2,2)}}
// Holy light filling a room (bx,by = room top-left) from (x,y) = priest's head; a = strength 0..1
function drawHolyLight(c,bx,by,x,y,a,t){
 if(a<=0)return;c.save();c.beginPath();c.rect(bx,by,CELL,CELL);c.clip();
 c.fillStyle='rgba(255,246,200,'+(.5*a)+')';c.fillRect(bx,by,CELL,CELL);
 c.strokeStyle='rgba(255,230,120,'+(.7*a)+')';c.lineWidth=3;
 for(let i=0;i<10;i++){const an=i/10*Math.PI*2+t*.8;c.beginPath();c.moveTo(x,y);c.lineTo(x+Math.cos(an)*70,y+Math.sin(an)*70);c.stroke()}
 c.fillStyle='rgba(255,255,240,'+a+')';c.beginPath();c.arc(x,y,6+4*a,0,Math.PI*2);c.fill();c.restore();
}
// Darkness spell: a spreading black-purple cloud; r = radius, a = strength 0..1
function drawDarkness(c,bx,by,x,y,r,a,t){
 if(a<=0)return;c.save();c.beginPath();c.rect(bx,by,CELL,CELL);c.clip();
 c.fillStyle='rgba(16,8,26,'+(.88*a)+')';c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();
 c.fillStyle='rgba(140,90,200,'+a+')';for(let i=0;i<12;i++){const an=i*2.1+t*2,d=r*(.4+.5*((i*37)%10)/10);c.fillRect(Math.round(x+Math.cos(an)*d),Math.round(y+Math.sin(an)*d),2,2)}
 c.restore();
}
// Green summoning circle on the floor (undead), k = size 0..1
function drawGreenCircle(c,x,y,k,t){for(let i=0;i<18;i++){const a=i/18*Math.PI*2+t*1.5;c.fillStyle=i%2?'#7aff7a':'#2a8a3a';c.fillRect(Math.round(x+Math.cos(a)*20*k-1),Math.round(y-3+Math.sin(a)*5*k-1),3,3)}}
// Priest's stained glass smashed open, with eldritch tentacles reaching into the room.
// bx,by = room top-left; e = how far out (0..1); t = time; blink = flashing when hit
function drawTentacles(c,bx,by,e,t,blink){
 c.save();c.beginPath();c.rect(bx+4,by+4,88,88);c.clip();
 const wx=bx+WIN_C.x,wy=by+WIN_C.y;
 c.fillStyle='#0a0610';c.fillRect(bx+18,by+26,24,36); // broken window: dark hole with leftover shards
 c.fillStyle='#c04040';c.fillRect(bx+18,by+26,4,5);c.fillStyle='#3a6ad0';c.fillRect(bx+38,by+26,4,4);c.fillStyle='#40a060';c.fillRect(bx+18,by+56,3,6);c.fillStyle='#d0b030';c.fillRect(bx+37,by+57,5,5);
 if(e>0&&!(blink>0&&Math.floor(blink*14)%2)){
  const ends=[[bx+60,by+70],[bx+44,by+80],[bx+70,by+50]];
  ends.forEach((q,k)=>{const n=12;for(let i=n;i>=0;i--){const s=i/n*e,px=lerp(wx,q[0],s)+Math.sin(t*4+i*.7+k*2)*5*s,py=lerp(wy,q[1],s)+Math.cos(t*3+i*.6+k)*3*s,w=Math.max(2,Math.round(8-i*.45));
   c.fillStyle=O;c.fillRect(Math.round(px-w/2-1),Math.round(py-w/2-1),w+2,w+2);c.fillStyle=i%2?'#5a2a6a':'#4a1a5a';c.fillRect(Math.round(px-w/2),Math.round(py-w/2),w,w);
   if(i%3===1){c.fillStyle='#c890ff';c.fillRect(Math.round(px-1),Math.round(py+w/2-2),2,2)}}});
 }
 c.restore();
}

// ---------- Priest and Necromancer effects ----------
// Things drawn BEHIND the character for some activities (floor and ceiling effects)
function drawActBack(c,u){
 const a=u.act,t=u.at,bx=Math.floor(u.x/CELL)*CELL,by=Math.floor((u.y-1)/CELL)*CELL;
 if(a==='pray1')drawCeilingLight(c,bx,by,cl((t-.3)/1,0,1)*cl((5-t)/.8,0,1),t);
 if(a==='candles')drawRitual(c,u.x,u.y,t,cl((5.5-t)/.6,0,1));
}
// Soft golden light across the ceiling of a room (the Priest praying)
function drawCeilingLight(c,bx,by,a,t){
 if(a<=0)return;c.save();c.beginPath();c.rect(bx+4,by+4,88,88);c.clip();
 const gr=c.createLinearGradient(0,by,0,by+46);gr.addColorStop(0,'rgba(255,226,130,'+(.55*a)+')');gr.addColorStop(1,'rgba(255,226,130,0)');
 c.fillStyle=gr;c.fillRect(bx,by,CELL,46);
 c.fillStyle='rgba(255,246,200,'+a+')';for(let i=0;i<7;i++){const px=bx+10+i*12+Math.round(Math.sin(t*1.5+i)*3),py=by+8+((t*8+i*9)%28);c.fillRect(px,Math.round(py),2,2)}
 c.restore();
}
// Blue wisps of the dead swirling around a room (the Necromancer communing)
function drawWisps(c,bx,by,t,a){
 if(a<=0)return;c.save();c.globalAlpha=a;const cx=bx+48,cy=by+44;
 for(let i=0;i<7;i++){for(let j=4;j>=0;j--){const tt=t-j*.06,an=tt*(1+i*.12)+i*.9,px=cx+Math.cos(an)*(30+6*Math.sin(tt*2+i)),py=cy+Math.sin(an)*(18+4*Math.cos(tt*1.7+i));
  c.fillStyle=j?'rgba(79,176,255,'+(.7-j*.13)+')':'#d8f2ff';const s=j?2:3;c.fillRect(Math.round(px-s/2),Math.round(py-s/2),s,s)}}
 c.restore();
}
// Chalk ritual circle on the floor around (x,y), drawn over time, then five candles light one by one
function drawRitual(c,x,y,t,a){
 if(a<=0)return;c.save();c.globalAlpha=a;const k=cl(t/1.5,0,1),rx=26,ry=7,cy=y-1;
 c.strokeStyle='#e8e8e0';c.lineWidth=1.5;c.beginPath();c.ellipse(x,cy,rx,ry,0,0,Math.PI*2*k);c.stroke();
 const P=[0,1,2,3,4].map(i=>{const an=-Math.PI/2+i*Math.PI*2/5;return[x+Math.cos(an)*rx*.85,cy+Math.sin(an)*ry*.85]});
 if(t>1.5){c.beginPath();[0,2,4,1,3,0].forEach((q,i)=>i?c.lineTo(P[q][0],P[q][1]):c.moveTo(P[q][0],P[q][1]));c.stroke()}
 P.forEach((q,i)=>{if(t<1.2)return;const px=Math.round(q[0]),py=Math.round(q[1]);c.fillStyle=O;c.fillRect(px-2,py-7,5,7);c.fillStyle='#e8e4d0';c.fillRect(px-1,py-6,3,6);
  if(t>1.8+i*.25){c.fillStyle=Math.floor(t*10+i)%2?'#ffb030':'#ffe080';c.fillRect(px,py-10,1,3);c.fillStyle='#ffe080';c.fillRect(px,py-8,1,1)}});
 c.restore();
}
// Red lightning crackling around the Necromancer while he reads his black book
function drawRedLightning(c,x,y,t){
 const k=Math.floor(t*6);if(k%2)return;
 for(let b=0;b<2;b++){const s=k*7+b*13,ang=Math.sin(s)*Math.PI,r0=10,r1=30;let px=x+Math.cos(ang)*r0,py=y-24+Math.sin(ang)*r0*.8;
  c.beginPath();c.moveTo(px,py);for(let i=1;i<=4;i++){const rr=r0+(r1-r0)*i/4;px=x+Math.cos(ang+Math.sin(s+i)*.4)*rr;py=y-24+Math.sin(ang+Math.sin(s+i)*.4)*rr*.8+Math.cos(s*i)*3;c.lineTo(px,py)}
  c.strokeStyle='#ff2020';c.lineWidth=3;c.stroke();c.strokeStyle='#ffb0b0';c.lineWidth=1;c.stroke()}
}
// Glowing angel wings behind a character (potion on the Priest). t = time, for the gentle flap
function drawWings(c,x,y,t){
 const fl=Math.round(Math.sin(t*3)*2),gr=c.createRadialGradient(x,y-30,4,x,y-30,34);gr.addColorStop(0,'rgba(255,240,180,.45)');gr.addColorStop(1,'rgba(255,240,180,0)');
 c.fillStyle=gr;c.fillRect(x-36,y-64,72,64);
 const W=[[4,-8,6,3],[6,-5,12,3],[6,-2,15,3],[6,1,13,3],[6,4,9,3],[6,7,5,2]];
 [-1,1].forEach(s=>{W.forEach((r,i)=>{const yy=y-30+r[1]-(i<2?fl:0),xx=s>0?x+r[0]:x-r[0]-r[2];c.fillStyle=O;c.fillRect(xx-1,yy-1,r[2]+2,r[3]+2)});
  W.forEach((r,i)=>{const yy=y-30+r[1]-(i<2?fl:0),xx=s>0?x+r[0]:x-r[0]-r[2];c.fillStyle=i%2?'#e8eef8':'#ffffff';c.fillRect(xx,yy,r[2],r[3]);c.fillStyle='#f2d870';c.fillRect(s>0?xx+r[2]-2:xx,yy,2,r[3])})});
}
// Smashed potion splat on the back wall (fades out). a = 0..1
function drawSplat(c,x,y,a){c.save();c.globalAlpha=a;c.fillStyle='#d03050';[[-6,-2,12,4],[-3,-6,6,12],[-8,2,3,3],[6,-5,3,3],[-1,6,2,6],[4,4,2,5]].forEach(r=>c.fillRect(x+r[0],y+r[1],r[2],r[3]));c.fillStyle='#cfe8f0';[[-9,-6,2,2],[8,1,2,2],[2,-9,2,2]].forEach(r=>c.fillRect(x+r[0],y+r[1],r[2],r[3]));c.restore()}

// ---------- Necromancer interaction effects ----------
// Floating "Z" while asleep
function drawZ(c,x,y,a){c.save();c.globalAlpha=a;const Zr=[[0,0,4,1],[2,1,1,1],[1,2,1,1],[0,3,4,1]];c.fillStyle=O;Zr.forEach(r=>c.fillRect(x+r[0]*2-1,y+r[1]*2-1,r[2]*2+2,r[3]*2+2));c.fillStyle='#d8c8ff';Zr.forEach(r=>c.fillRect(x+r[0]*2,y+r[1]*2,r[2]*2,r[3]*2));c.restore()}
// A summoned creature: m = {id:'skeleton'|'zombie'|'ghost'|'golem', x, y (feet), t, blink, face, al, gone}
function drawMob(c,m){
 if(m.al!=null&&m.al<=0)return;const hit=m.blink>0,fl=hit&&Math.floor(m.blink*14)%2?.2:1,face=m.face||-1;
 if(m.id==='ghost'){spr(c,'ghost',hit?'hurt':'ok',m.x,m.y-8-Math.sin(m.t*3+m.x)*3,face,0,.75*fl*(m.al==null?cl(m.t/.5,0,1):m.al),1);return}
 if(m.id==='plant'){c.save();c.globalAlpha=fl*(m.al==null?1:m.al);drawPlant(c,m.x,m.y,m.t,hit);c.restore();return}
 if(m.id==='imp'){spr(c,'demon',hit?'hurt':'mad',m.x,m.y-Math.abs(Math.sin(m.t*6))*3,face,0,fl*(m.al==null?cl(m.t/.4,0,1):m.al),.6);return} // a small hopping demon
 if(m.id==='golem'){spr(c,'golem','ok',m.x,m.y,face,0,(m.al==null?1:m.al)*cl(m.t/.6,0,1),m.sc||1.35);return}
 const rise=cl(m.t/.9,0,1);if(m.t<1.3)drawGreenCircle(c,m.x,m.y,cl(m.t/.4,0,1),m.t);
 c.save();c.beginPath();c.rect(m.x-26,m.y-64,52,64);c.clip();spr(c,m.id,hit?'hurt':'mad',m.x,m.y+(1-rise)*44,face,0,fl*(m.al==null?1:m.al),1,m.id==='zombie'?'fwd':undefined);c.restore();
}
// Lightning bolt between two points (duel). blk = the Necromancer's black lightning, otherwise the Wizard's blue
function drawZap(c,z){
 const a=cl(1-z.t/.35,0,1);if(a<=0)return;c.save();c.globalAlpha=a;c.beginPath();z.p.forEach((q,i)=>i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1]));
 c.strokeStyle=z.blk?'#100818':'#4fb0ff';c.lineWidth=5;c.stroke();c.strokeStyle=z.blk?'#a070e0':'#ffffff';c.lineWidth=1.5;c.stroke();c.restore();
}
// Sleep spell: a lavender mist wave rolling right along a row
function drawSleepWave(c,w){const fx=w.x0+w.t*240,y=w.r*CELL;c.save();const gr=c.createLinearGradient(fx-60,0,fx,0);gr.addColorStop(0,'rgba(200,170,255,0)');gr.addColorStop(1,'rgba(200,170,255,.45)');c.fillStyle=gr;c.fillRect(Math.max(w.x0,fx-60),y+8,Math.min(60,fx-w.x0),CELL-12);
 c.fillStyle='#e8d8ff';for(let i=0;i<6;i++)c.fillRect(Math.round(fx-4-i*9),Math.round(y+20+((i*29+w.t*60)%60)),2,2);c.restore()}
// Hole smashed in a back wall by the escaping golem; fades as it is repaired. a = 0..1
function drawHole(c,x,y,a){c.save();c.globalAlpha=a;c.fillStyle='#0a0610';[[-12,-14,24,26],[-15,-8,30,16],[-8,-18,16,6]].forEach(r=>c.fillRect(x+r[0],y+r[1],r[2],r[3]));c.fillStyle='#8a5a34';[[-16,-16,4,4],[13,-10,4,3],[-14,10,5,3],[10,9,4,4]].forEach(r=>c.fillRect(x+r[0],y+r[1],r[2],r[3]));c.restore()}
// Snow falling in a room (frost spell)
function drawSnow(c,bx,by,t){c.save();c.beginPath();c.rect(bx+4,by+4,88,88);c.clip();c.fillStyle='#ffffff';for(let i=0;i<14;i++){const px=bx+8+((i*37)%80)+Math.sin(t*2+i)*3,py=by+4+((t*22+i*13)%84);c.fillRect(Math.round(px),Math.round(py),2,2)}c.restore()}

// ---------- easter eggs and brewing ----------
// Skulls littering the floor of the Necromancer's room while it's on the bottom row
function drawSkulls(c,bx,by){[[14,84],[30,90],[66,86],[82,91]].forEach((q,i)=>{const x=bx+q[0],y=by+q[1];c.fillStyle=O;c.fillRect(x-4,y-5,9,7);c.fillStyle='#e8e4d0';c.fillRect(x-3,y-4,7,5);c.fillStyle=O;c.fillRect(x-2,y-3,2,2);c.fillRect(x+1,y-3,2,2);if(i%2){c.fillStyle='#d8d4c0';c.fillRect(x+6,y-1,8,2);c.fillRect(x+5,y-2,2,4);c.fillRect(x+13,y-2,2,4)}})}
// A small cauldron with bubbles (Wizard brewing a potion)
function drawCauldron(c,x,y,t){c.fillStyle=O;c.fillRect(x-9,y-12,18,12);c.fillStyle='#3a3a44';c.fillRect(x-8,y-11,16,10);c.fillStyle='#2a2a30';c.fillRect(x-10,y-13,20,3);c.fillStyle='#d03050';c.fillRect(x-7,y-12,14,2);
 c.fillStyle='#ff8090';for(let i=0;i<3;i++){const k=(t*1.5+i/3)%1;c.fillRect(Math.round(x-5+i*5),Math.round(y-14-k*10),2,2)}c.fillStyle='#ff8020';c.fillRect(x-4,y,8,2)}

// ---------- feast table and writing desk ----------
// Feast table with food (x = center, y = floor line in front)
function drawTable(c,x,y,a){c.save();c.globalAlpha=a;c.fillStyle=O;c.fillRect(x-22,y-14,44,4);c.fillStyle='#8a5a2a';c.fillRect(x-21,y-13,42,3);c.fillStyle='#6a4420';c.fillRect(x-19,y-10,3,10);c.fillRect(x+16,y-10,3,10);
 c.fillStyle='#e8e4d0';c.fillRect(x-16,y-16,8,2);c.fillRect(x+6,y-16,8,2);c.fillStyle='#c87a3a';c.fillRect(x-14,y-19,5,3);c.fillStyle='#d83030';c.fillRect(x-2,y-17,3,3);c.fillStyle='#f08a20';c.fillRect(x+2,y-17,3,3);c.fillStyle='#f2d040';c.fillRect(x+8,y-19,2,3);c.fillStyle='#a03050';c.fillRect(x-6,y-20,2,4);c.restore()}
// Writing desk that appears in the Wizard's room when a Merchant and another Mage are his neighbors
function drawDesk(c,bx,by){const x=bx+14,y=by+66;c.fillStyle=O;c.fillRect(x-1,y-15,32,4);c.fillStyle='#7a4a22';c.fillRect(x,y-14,30,3);c.fillStyle='#5a3418';c.fillRect(x+2,y-11,3,11);c.fillRect(x+25,y-11,3,11);
 c.fillStyle='#eadcb4';c.fillRect(x+4,y-17,10,3);c.fillStyle='#c03030';c.fillRect(x+8,y-17,2,3);c.fillStyle='#eadcb4';c.fillRect(x+16,y-16,8,2);c.fillStyle='#1a1226';c.fillRect(x+26,y-18,3,4);c.fillStyle='#ffffff';c.fillRect(x+27,y-25,1,7)}

// ---------- Fruit Merchant effects ----------
// Rotten fruit in the Merchant's crates while cursed (with buzzing flies)
function drawRot(c,bx,by,t,worms){c.fillStyle='#5a4a1e';[[11,42,4,4],[16,41,4,4],[21,42,4,4],[13,38,4,4],[34,46,4,4],[39,45,4,4],[44,46,4,4],[48,38,3,8],[51,37,3,8],[54,38,3,8]].forEach(r=>c.fillRect(bx+r[0],by+r[1],r[2],r[3]));
 c.fillStyle='#3a6a1a';[[12,40,2,2],[22,43,2,1],[36,47,2,2],[46,47,1,2],[52,40,1,3]].forEach(r=>c.fillRect(bx+r[0],by+r[1],r[2],r[3]));
 c.fillStyle='#1a1a1a';for(let i=0;i<4;i++)c.fillRect(Math.round(bx+20+i*9+Math.sin(t*9+i)*5),Math.round(by+32+Math.cos(t*7+i*2)*4),2,1);
 if(worms){c.fillStyle='#e8a0a8';[[14,44],[24,42],[38,48],[50,42]].forEach((q,i)=>{const w=Math.round(Math.sin(t*4+i)*2);c.fillRect(bx+q[0]+w,by+q[1],3,1);c.fillRect(bx+q[0]+w+2,by+q[1]-1,2,1)})}}
// Soft holy glow over a whole room (the great prayer)
function drawRoomGlow(c,bx,by,a,t){if(a<=0)return;drawCeilingLight(c,bx,by,a,t);c.fillStyle='rgba(255,244,200,'+(.16*a)+')';c.fillRect(bx+4,by+4,88,88)}

// ---------- the Farmer's field ----------
// kind = 'wheat' or 'apple', g = growth 0..1 (grows over the Farmer's 3 minutes)
function drawField(c,bx,by,kind,g,t){
 c.fillStyle='#5a3a1a';for(let i=0;i<4;i++)c.fillRect(bx+8,by+70+i*6,80,2); // furrows
 if(kind==='wheat'){for(let i=0;i<11;i++){const x=bx+10+i*7,h=Math.round(4+g*22),sway=Math.round(Math.sin(t*2+i)*1);c.fillStyle='#8aa040';c.fillRect(x+sway,by+66-h,2,h);if(g>.5){c.fillStyle=g>.9?'#e8c050':'#c8b850';c.fillRect(x-1+sway,by+66-h,4,Math.round(3+g*3))}}}
 else{for(let i=0;i<3;i++){const x=bx+18+i*28,h=Math.round(6+g*22);c.fillStyle='#6a4420';c.fillRect(x-1,by+66-h,3,h);if(g>.2){const r=Math.round(3+g*8);c.fillStyle='#4a8a3a';c.fillRect(x-r,by+66-h-r,r*2+1,r+2);if(g>.6){c.fillStyle='#d83030';c.fillRect(x-3,by+66-h-r+3,2,2);c.fillRect(x+2,by+66-h-r+5,2,2);c.fillRect(x-1,by+66-h-2,2,2)}}}}
}
