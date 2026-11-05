// ---------- art: room backgrounds and drawing ----------
const WALL={knight:['#3c4058','#2a2c40'],wizard:['#33295c','#211a40'],priest:['#4a4458','#30293c'],necromancer:['#26262c','#18181c']};
// Priest's stained glass window (frame 16..44 x 12..52, center x 30, y 32). Tentacles can smash through it.
const WINDOW=[[16,12,28,40,'#2a2434'],[18,16,7,10,'#c04040'],[26,16,8,10,'#3a6ad0'],[35,16,7,10,'#d0b030'],[18,27,7,10,'#40a060'],[26,27,8,10,'#c890ff'],[35,27,7,10,'#c04040'],[18,38,7,12,'#3a6ad0'],[26,38,8,12,'#d0b030'],[35,38,7,12,'#40a060'],[29,19,2,8,'#f2e8a0'],[27,21,6,2,'#f2e8a0'],[20,12,20,2,'#3a3448']];
const WIN_C={x:30,y:32};
// Knight's back-wall door (hides the stairs). Center x 72, bottom at the floor line (y 66).
const BACKDOOR=[[61,31,22,35,'#1e2030'],[63,33,18,33,'#6a4420'],[69,33,1,33,'#5a3a1e'],[75,33,1,33,'#5a3a1e'],[63,38,18,2,'#3a2a1a'],[63,58,18,2,'#3a2a1a'],[65,49,2,2,'#f2c84a']];
// Wizard's second bookshelf (slides aside to reveal the spiral staircase). Center x 68, bottom y 66.
const SHELF2=[[56,30,24,36,'#6a4a2a'],[58,32,20,32,'#3a2410'],[58,47,20,2,'#6a4a2a'],[59,35,4,12,'#c04040'],[64,37,3,10,'#40a0c0'],[68,35,4,12,'#d0b030'],[73,36,4,11,'#40c070'],[59,51,3,13,'#8a5ae0'],[63,52,5,12,'#c04040'],[69,50,3,14,'#40a0c0'],[73,53,4,11,'#d0b030']];
function bg(id,w){
 if(id==='priest')return [...WINDOW,[48,52,4,14,'#d8d0b0'],[47,50,6,2,'#a08a50'],[49,47,2,3,'#ffd060'],...BACKDOOR];
 if(id==='necromancer')return [[10,22,40,3,'#3a3028'],[10,42,40,3,'#3a3028'],[14,14,7,8,'#e8e4d0'],[15,16,2,2,O],[18,16,2,2,O],[30,15,6,7,'#e8e4d0'],[31,17,2,2,O],[33,17,2,2,O],[40,16,3,6,'#2a2a2a'],[40,13,3,3,'#7aff7a'],[16,34,4,8,'#2a2a2a'],[16,31,4,3,'#7aff7a'],[26,36,10,6,'#4a3a5a'],[38,33,6,9,'#e8e4d0'],[39,35,2,2,O],[41,35,2,2,O],...BACKDOOR];
 if(id==='wizard')return [[10,14,38,42,'#6a4a2a'],[12,18,5,14,'#c04040'],[18,18,5,14,'#40a0c0'],[24,18,5,14,'#d0b030'],[30,18,5,14,'#8a5ae0'],[36,18,5,14,'#40c070'],[10,34,38,3,'#3a2410'],[12,38,5,14,'#d0b030'],[18,38,8,14,'#c04040'],[28,38,5,14,'#40a0c0'],[34,38,6,14,'#8a5ae0'],...SHELF2];
 const a=[[12,64,22,3,'#4a4e5a'],[16,60,5,5,'#8a94a8'],[25,60,5,5,'#8a94a8'],[14,44,16,16,'#8a94a8'],[24,44,6,16,'#667088'],[10,44,4,10,'#aab4c8'],[30,44,4,10,'#aab4c8'],[16,28,12,16,'#aab4c8'],[18,34,8,2,O],[21,23,2,5,'#c03030'],...BACKDOOR];
 const m={shield:[[40,36,16,20,'#3a5aa8'],[42,38,12,16,'#2a4488'],[46,42,4,8,'#f2c84a']],spear:[[47,14,2,52,'#8a5a2a'],[45,6,6,10,'#cfd6e0'],[47,4,2,4,'#fff']],glaive:[[47,18,2,48,'#8a5a2a'],[47,8,8,12,'#cfd6e0'],[49,10,4,8,'#8a94a8']],longsword:[[46,16,4,36,'#cfd6e0'],[40,52,16,3,'#c0a030'],[46,55,4,9,'#6a4420'],[45,64,6,2,'#c0a030']]};
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
function drawSprite(c,id,mood,pose){
 const x=c.getContext('2d'),ch=CH[id],f=(a,b,w,h,k)=>{x.fillStyle=k;x.fillRect(a,b,w,h)};
 const A=ch.a?POSE[pose||'none'](ch.a):[],R=[...A.filter(r=>!r[5]),...ch.p,...A.filter(r=>r[5])]; // front-of-body arm pieces last
 R.forEach(p=>f(p[0]-1,p[1]-1,p[2]+2,p[3]+2,O));R.forEach(p=>f(p[0],p[1],p[2],p[3],p[4]));
 if(mood==='hurt'){f(5,6,2,1,O);f(9,6,2,1,O);f(7,8,2,1,'#a22');return}
 if(mood==='shock'){f(5,4,2,3,'#ffffff');f(9,4,2,3,'#ffffff');f(6,5,1,2,ch.eye);f(9,5,1,2,ch.eye);f(7,8,2,2,'#5a2a2a');return} // wide eyes, open mouth (surprise)
 const e=mood==='mad'?'#e03030':ch.eye;f(6,5,1,2,e);f(9,5,1,2,e);
 if(mood==='happy'){f(7,8,2,1,'#7a2a2a');f(5,7,1,1,'#f08080');f(10,7,1,1,'#f08080')}
 else if(mood==='mad'){f(6,4,2,1,O);f(9,4,2,1,O);f(7,8,2,1,'#a22')}else f(7,8,2,1,'#8a4a4a');
}
const SP={};
function sprite(id,m,pose){const k=id+m+(pose||'');if(!SP[k]){const c=document.createElement('canvas');c.width=16;c.height=22;drawSprite(c,id,m,pose);SP[k]=c}return SP[k]}
function spr(c,id,m,cx,fy,face,bob,al,sc,pose){c.save();c.globalAlpha=al==null?1:al;sc=sc||1;c.translate(Math.round(cx),Math.round(fy+bob));c.scale(face<0?-sc:sc,sc);c.drawImage(sprite(id,m,pose),-16,-44,32,44);c.restore()}
// Sprite name for a unit: Eldritch form, wizard outfit color, or plain id
const sid=u=>u.form||(u.color?u.id+'_'+u.color:u.id);
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
 if(act==='lightning')return 'hold';
 if(act==='sniff')return at<1.1?'up':at<1.5?'fwd':'none';
 if(act==='prac')return 'noR';
 if(act==='learn'||act==='cast')return 'up';
 if(act==='demon')return at<1.6?'both':'up';
 if(act==='horse')return at>=1&&at<4.6?'fwd':'none';
 return 'none';
}
function box(c,id,x,y,w){
 const k=WALL[id];c.fillStyle=k[0];c.fillRect(x,y,CELL,CELL);c.fillStyle=k[1];c.fillRect(x,y+66,CELL,30);c.fillStyle='rgba(0,0,0,.3)';c.fillRect(x,y+66,CELL,2);
 bg(id,w).forEach(d=>{c.fillStyle=d[4];c.fillRect(x+d[0],y+d[1],d[2],d[3])});
 c.strokeStyle='#000';c.lineWidth=4;c.strokeRect(x+2,y+2,CELL-4,CELL-4);
}

// ---------- ways between rooms (drawn behind the characters) ----------
// backdoor and shelf are always part of the room, so only their open state is drawn here.
function drawFx(f){
 const x=f.x,y=f.y,o=f.open,t=f.type,fixed=t==='backdoor'||t==='shelf';
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
  // dark doorway with stone stairs going up, door panel swinging toward the viewer on its left hinge
  g.fillStyle='#0b0a14';g.fillRect(x-9,y-33,18,33);
  for(let i=0;i<4;i++){g.fillStyle=i%2?'#7a7f8c':'#8a8f9a';g.fillRect(x-8+i*4,y-6*(i+1),17-i*4,6*(i+1));g.fillStyle='#b8bcc8';g.fillRect(x-8+i*4,y-6*(i+1),17-i*4,1)}
  const pw=Math.max(2,Math.round(18*Math.cos(o*1.35))),gr=Math.round(3*Math.sin(o*1.35));
  g.fillStyle=O;g.fillRect(x-10,y-34-gr,pw+2,35+gr*2);g.fillStyle='#6a4420';g.fillRect(x-9,y-33-gr,pw,33+gr*2);
  g.fillStyle='#3a2a1a';g.fillRect(x-9,y-28-gr,pw,2);g.fillRect(x-9,y-8+gr,pw,2)}
 else if(t==='shelf'&&o>.02){
  // dark opening with a spiral staircase; the bookshelf slides right into the wall
  const bl=Math.floor(x/CELL)*CELL,top=y-66;
  g.fillStyle='#0e0a18';g.fillRect(x-12,y-36,24,36);g.fillStyle='#5a5a6a';g.fillRect(x-1,y-34,3,34);
  for(let i=0;i<5;i++){g.fillStyle=i%2?'#b8a070':'#9a8a5c';g.fillRect(x+Math.round(Math.sin(i*1.2)*6)-5,y-5-i*6,10,3)}
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
 if(w==='shield')return thrust(t,1.2,.4,1.2,1.5,4);
 return swing(t,1,.5,3.5,1.1,3); // longsword and the Eldritch Knight's magic sword
}
const weaponOf=u=>u.form==='eknight'?'magic':(u.weapon||'longsword');
// How far the body leans while practicing (so the sprite and the swinging arm move together)
const actDx=u=>u.act==='prac'?Math.round(pracAnim(weaponOf(u),u.at).dx)*u.face:0;

// Swirling sparkles around a character: pur = 0 blue, 1 purple (eldritch), 2 gold (holy); k = how strong (0..1)
const SWIRL=[['#2a6af0','#4fb0ff','#bfe8ff'],['#c890ff','#e8d0ff','#8a5ae0'],['#f2c84a','#fff0a0','#d8a030'],['#3ac85a','#7aff7a','#1a8a3a']]; // 3 = necromantic green
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
 if(a==='read'||a==='tome'||a==='holy'||a==='lightning'){
  // Held up and open toward the reader: we see the covers and spine, page tops, and pages turning over the top.
  // tome = the Wizard's eldritch spellbook; holy = the Priest's white book with a gold cross; lightning = the Necromancer's black book with red runes
  const tm=a==='tome',hb=a==='holy',nb=a==='lightning',bx=Math.round(x+f*2),by=Math.round(y-20),pf=(t*.9)%1;
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
 else if(a==='exorcise'&&t>2.2&&t<4.6){swirl(c,x,y,t,2,1)}
 else if(a==='farmer'&&t>4.4&&t<5.6){const up=Math.floor(t*4)%2,hx=Math.round(x+f*(up?11:16)),hy=Math.round(y-(up?36:22));
  c.fillStyle=O;c.fillRect(hx-3,hy-7,6,9);c.fillStyle='#a8d8ff';c.fillRect(hx-2,hy-4,4,5);c.fillStyle='#e8f6ff';c.fillRect(hx-2,hy-6,4,2);c.fillStyle='#8a5a2a';c.fillRect(hx-1,hy-7,2,1)}
 else if(a==='spirits'){const bx=Math.floor(x/CELL)*CELL,by=Math.floor((y-1)/CELL)*CELL;drawWisps(c,bx,by,t,cl(t/.8,0,1)*cl((5-t)/.6,0,1))}
 else if(a==='banish'&&u.ghost){ // a ghost appears; the priest drives it off with holy light
  const gh=u.ghost,ga=t<.8?t/.8:t<2?1:cl(1-(t-2)/1.2,0,1);
  if(t>1.2&&t<3.2){const la=cl((t-1.2)/.4,0,1)*cl((3.2-t)/.4,0,1);c.save();c.globalAlpha=la;c.strokeStyle='rgba(255,236,150,.9)';c.lineWidth=5;c.beginPath();c.moveTo(x+f*6,y-36);c.lineTo(gh.x,gh.y-26);c.stroke();
   c.fillStyle='rgba(255,250,210,.6)';c.beginPath();c.arc(x,y-38,10,0,Math.PI*2);c.fill();c.restore()}
  if(ga>0)spr(c,'ghost',t>2?'hurt':'ok',gh.x,gh.y-6-Math.sin(t*3)*3-(t>2?(t-2)*14:0),gh.x>x?-1:1,0,.75*ga,1)}
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
  if(w==='longsword'||w==='magic'){c.fillStyle='#6a4420';c.fillRect(-1,9,2,6);c.fillStyle='#c0a030';c.fillRect(-5,13,10,2);
   c.fillStyle=w==='magic'?'#b080ff':'#cfd6e0';c.fillRect(-2,15,3,22);c.fillStyle='#fff';c.fillRect(-1,w==='magic'?16:33,1,w==='magic'?20:3)}
  else if(w==='glaive'){c.fillStyle='#8a5a2a';c.fillRect(-1,-10,2,44);c.fillStyle='#cfd6e0';c.fillRect(-1,32,7,12);c.fillStyle='#8a94a8';c.fillRect(1,34,4,8)}
  else if(w==='spear'){c.fillStyle='#8a5a2a';c.fillRect(-1,-14,2,46);c.fillStyle='#cfd6e0';c.fillRect(-3,32,6,8);c.fillStyle='#fff';c.fillRect(-1,40,2,3)}
  c.fillStyle=O;c.fillRect(-3,-2,6,15);c.fillStyle=col.bodyD;c.fillRect(-2,-1,4,10);c.fillStyle=col.skin;c.fillRect(-2,9,4,3);
  c.restore();
  if(w==='shield'){const hx=Math.round(sx+f*Math.sin(A.th)*10),hy=Math.round(sy+Math.cos(A.th)*10);
   c.save();c.translate(hx,hy);c.scale(f,1);c.fillStyle=O;c.fillRect(-1,-13,12,25);c.fillStyle='#3a5aa8';c.fillRect(0,-12,10,23);c.fillStyle='#2a4488';c.fillRect(5,-12,5,23);c.fillStyle='#f2c84a';c.fillRect(3,-4,3,6);c.restore()}}
 else if(a==='horse'&&t>=1&&t<4.6){
  // a bundle of hay in the outstretched hand, shrinking as the horse eats
  const hs=1-cl((t-1.8)/2.8,0,1),w=Math.round(8*hs)+2,hx=Math.round(x+f*17),hy=Math.round(y-22);
  c.fillStyle=O;c.fillRect(hx-w/2-1,hy-4,w+2,7);c.fillStyle='#e8c860';c.fillRect(hx-w/2,hy-3,w,5);
  c.fillStyle='#b8963a';c.fillRect(hx-w/2+1,hy-2,1,3);if(w>5)c.fillRect(hx+1,hy-1,1,3)}
}
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
 c.fillStyle='#0a0610';c.fillRect(bx+18,by+14,24,36); // broken window: dark hole with leftover shards
 c.fillStyle='#c04040';c.fillRect(bx+18,by+14,4,5);c.fillStyle='#3a6ad0';c.fillRect(bx+38,by+14,4,4);c.fillStyle='#40a060';c.fillRect(bx+18,by+44,3,6);c.fillStyle='#d0b030';c.fillRect(bx+37,by+45,5,5);
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
