const cv=$('#cv'),g=cv.getContext('2d'),W=COLS*CELL,H=ROWS*CELL,tray=$('#tray'),bub=$('#bub');cv.width=W;cv.height=H;g.imageSmoothingEnabled=false;
const U={};let S={un:{}},drag=null,td=null,hover=null,parts=[],bolts=[],demons=[],bubU=null,T=0;

// ---------- units ----------
const at=(r,c)=>Object.keys(U).find(i=>U[i].r===r&&U[i].c===c);
const show=f=>{f.vis=true},hide=f=>{f.vis=false;f.keep=false};
function kindOf(){const k=U.knight,w=U.wizard;if(!k||!w)return null;const dr=w.r-k.r,dc=w.c-k.c;
 return dr===0&&dc===-1?'friend':dr===0&&dc===1?'learn':dc===0&&dr===-1?'bolt':dc===0&&dr===1?'chat':null}
function label(u){u.lb.style.left=(u.c*CELL+6)/W*100+'%';u.lb.style.top=(u.r*CELL+6)/H*100+'%'}
function addUnit(id,r,c,quiet,weapon,form){
 const lb=document.createElement('div');lb.className='lb';lb.textContent=CH[id].name;$('#labels').appendChild(lb);
 U[id]={id,r,c,lb,weapon:id==='knight'?(weapon||pick(WEAPONS)):null,form:form||null,act:null,at:0,orc:null,dur:0,x:c*CELL+48,y:r*CELL+FY,face:1,st:'idle',wait:1.5+Math.random()*2,path:[],fxs:[],al:1,sk:1,hop:0,blink:0,mood:'ok',mt:0,hosting:null,target:null,t:0,tt:0,ev:{}};
 if(form==='eknight')lb.textContent='Eldritch Knight';
 label(U[id]);if(!quiet){poof(c*CELL+48,r*CELL+FY-16);save()}ui();
}
function toHome(u){u.fxs.forEach(hide);u.act=null;u.orc=null;for(let i=demons.length-1;i>=0;i--)if(demons[i].owner===u.id)demons.splice(i,1);u.x=u.c*CELL+48;u.y=u.r*CELL+FY;u.path=[];u.st='idle';u.wait=1;u.al=1;u.sk=1;u.mood='ok';u.mt=0;label(u)}
function detach(u){
 if(u.target){const h=U[u.target];if(h&&h.hosting===u.id){h.hosting=null;h.st='idle';h.wait=1;h.act=null}u.target=null}
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
const home=u=>({x:u.c*CELL+16+Math.random()*64,y:u.r*CELL+FY});
function kill(v){
 poof(v.x,v.y-20);
 if(v.st==='talk'){const h=U[v.target];if(h){h.hosting=null;h.st='idle';h.wait=2}}
 else if(v.hosting){const w=U[v.hosting];if(w){w.target=null;w.st='back';w.path=route(w,v.r,v.c,w.r,w.c,home(w))}}
 v.lb.remove();delete U[v.id];ui();save();
}
function mkBolt(s,t){const sx=s.x,sy=s.y-40,ex=t.x,ey=t.y-26,n=Math.max(3,Math.round((ey-sy)/10)),p=[[sx,sy]];
 for(let i=1;i<n;i++)p.push([sx+(ex-sx)*i/n+Math.random()*14-7,sy+(ey-sy)*i/n]);p.push([ex,ey]);
 return{p,t:0,cells:[[s.c*CELL,s.r*CELL],[t.c*CELL,t.r*CELL]]}}
const freeU=x=>x&&!x.hosting&&(x.st==='idle'||x.st==='walk');
const nbrs=u=>[[0,1],[0,-1],[1,0],[-1,0]].map(d=>U[at(u.r+d[0],u.c+d[1])]).filter(h=>freeU(h));
// Idle activities; odds are in ODDS (data.js).
function startAct(u){
 const r=Math.random();u.path=[];
 if(u.id==='wizard'){
  const W=ODDS.wizard,a=r<W.read?'read':r<W.read+W.magic?'magic':'demon';
  u.st='act';u.act=a;u.at=0;u.ev={};u.dur=a==='read'?4+Math.random()*2:a==='magic'?3.5+Math.random()*1.5:2.6;
  if(a==='demon'){const rc=u.c*CELL,dx=cl(u.x+(u.x<rc+48?30:-30),rc+16,rc+80);u.face=dx>u.x?1:-1;demons.push({x:dx,y:u.y,t:0,dir:dx>u.x?-1:1,owner:u.id})}
  return true}
 if(r>=ODDS.knight.prac){const o=nbrs(u);if(o.length){visit(u,pick(o),'orc');return true}}
 u.st='act';u.act='prac';u.at=0;u.ev={};u.dur=3.5+Math.random()*1.5;return true;
}
function acting(u,dt){
 if(u.act==='demon'){
  if(u.at>=1.6&&!u.ev.b){u.ev.b=1;u.blink=.5;u.mood='mad';u.mt=.6}
  if(u.at>=2.1){kill(u);return}}
 if(u.at>=u.dur){u.act=null;u.st='idle';u.wait=1.5+Math.random()*2.5}
}
function cast(w,k){w.st='cast';w.tt=0;w.ev={};w.path=[];k.path=[];k.st='idle';k.wait=8;w.face=k.x>w.x?1:-1}
function casting(w,dt){
 const k=U.knight;if(!k||kindOf()!=='bolt'){w.st='idle';w.wait=1;return}
 w.tt+=dt;const once=(n,t,f)=>{if(!w.ev[n]&&w.tt>=t){w.ev[n]=1;f()}};
 once('c',.4,()=>{w.hop=.5;w.mood='happy';w.mt=2});
 once('x',1,()=>{bolts.push(mkBolt(w,k));k.blink=.8;k.mood='mad'});
 once('y',1.7,()=>{kill(k);w.st='idle';w.wait=3});
}

// Route between rooms; the transition type depends on class and direction
function route(u,r1,c1,r2,c2,fin){
 const t=TR[u.id],dc=c2-c1,dr=r2-r1,ty=dc?t.h:dr<0?t.u:t.d;
 const F=(type,x,y)=>{const f={type,x,y,open:0,want:0,a:0,vis:false,keep:true};u.fxs.push(f);return f};
 if(dc&&ty==='door'){
  const ex=(dc>0?c1+1:c1)*CELL,yy=r1*CELL+FY,f=F('door',ex,yy);f.dir=dc;
  return [{k:'walk',x:ex-dc*28,y:yy,on:f},{k:'wait',f,w:.5},{k:'walk',x:ex+dc*28,y:yy,sp:40},{k:'walk',x:fin.x,y:fin.y,close:f}];
 }
 if(dc){
  const A={x:c1*CELL+(dc>0?CELL-24:24),y:r1*CELL+FY},Bp={x:c2*CELL+(dc>0?24:CELL-24),y:r2*CELL+FY},f1=F(ty,A.x,A.y),f2=F(ty,Bp.x,Bp.y);
  return [{k:'walk',x:A.x,y:A.y,on:f1},{k:'vanish',f:f1,m:ty},{k:'appear',x:Bp.x,y:Bp.y,f:f2,m:ty},{k:'walk',x:fin.x,y:fin.y,close:f2,off:f2}];
 }
 const X1=c1*CELL+64,X2=c2*CELL+64,y1=r1*CELL,y2=r2*CELL,tr=ty==='trap',f1=F(ty,X1,y1+(tr?74:68)),f2=F(tr?'hatch':ty,X2,tr?y2+6:y2+68);
 return [{k:'walk',x:X1,y:y1+FY,on:f1},{k:'walk',x:X1,y:y1+70},{k:'vanish',f:f1,m:ty},{k:'appear',x:X2,y:tr?y2+22:y2+70,f:f2,m:ty},
  {k:'walk',x:X2,y:y2+FY,sp:tr?110:34,close:f2,dust:tr},{k:'walk',x:fin.x,y:fin.y,off:f2}];
}
function decide(u){
 const kd=kindOf(),P=kd==='friend'?ODDS.visitFriend:ODDS.visit,rr=Math.random();
 if(rr>=P&&rr<P+ODDS.idle&&startAct(u))return;
 if(rr<P){
  const opts=nbrs(u);
  if(opts.length){
   const hang=Math.random()<ODDS.hangout;
   if(kd==='bolt'&&!hang&&freeU(U.wizard)&&freeU(U.knight)){cast(U.wizard,U.knight);return}
   if(kd!=='bolt'||hang){visit(u,pick(opts),hang||kd==='bolt'?null:kd);return}
  }
 }
 u.st='walk';u.path=[{k:'walk',x:u.c*CELL+16+Math.random()*64,y:u.r*CELL+FY}];
}
function visit(u,h,vk){
 const hx=h.c*CELL,dc=h.c-u.c;let dest=cl(h.x+(dc!==0?-dc*26:pick([-26,26])),hx+16,hx+80),ox=0;
 // Orc fight: the orc appears on the far side of the room from the host; the knight stands between them
 if(vk==='orc'){const left=h.x<hx+48;ox=left?hx+82:hx+14;dest=ox+(left?-28:28)}
 u.vk=vk;u.path=route(u,u.r,u.c,h.r,h.c,{x:dest,y:h.r*CELL+FY});u.st='out';u.target=h.id;h.hosting=u.id;h.path=[];h.st='idle';
 if(vk==='orc'){// the orc shows up first; the knight notices, then heads over
  u.orc={x:ox,y:h.r*CELL+FY,blink:0};poof(ox,u.orc.y-20,'#6a9a3a');
  u.mood='mad';u.mt=.8;u.face=h.c>u.c?1:h.c<u.c?-1:u.face;u.path.unshift({k:'pause',w:.9})}
}
function arrive(u){if(u.st==='out'){u.st='talk';u.tt=0;u.ev={};u.kind=u.vk;u.sc2=null}else{u.st='idle';u.wait=2+Math.random()*3}}
const fin=u=>{u.path.shift();if(!u.path.length)arrive(u)};
function run(u,dt){
 const s=u.path[0];
 if(!s.b){s.b=1;s.t=0;if(s.on)show(s.on);if(s.close){s.close.want=0;s.close.closing=true}if(s.k==='wait'){show(s.f);s.f.want=1}
  if(s.k==='vanish')s.f.want=1;
  if(s.k==='appear'){u.x=s.x;u.y=s.y;u.al=0;show(s.f);s.f.want=1}}
 if(s.k==='wait'||s.k==='pause'){s.t+=dt;if(s.t>=s.w)fin(u)}
 else if(s.k==='vanish'){s.t+=dt;const p=cl((s.t-.25)/.35,0,1);u.al=1-p;u.sk=1-.4*p;if(s.m==='trap')u.y+=dt*14;if(s.t>=.65){u.al=0;s.f.want=0;hide(s.f);fin(u)}}
 else if(s.k==='appear'){s.t+=dt;const p=cl((s.t-.25)/.35,0,1);u.al=p;u.sk=s.m==='trap'?1:.6+.4*p;if(s.t>=.65){u.al=1;u.sk=1;fin(u)}}
 else{const dx=s.x-u.x,dy=s.y-u.y,d=Math.hypot(dx,dy),sp=(s.sp||(u.st==='walk'?20:34))*dt;
  if(Math.abs(dx)>.5)u.face=dx>0?1:-1;u.t+=dt;
  if(d<=sp){u.x=s.x;u.y=s.y;if(s.dust)poof(u.x,u.y-3);if(s.off)hide(s.off);fin(u)}else{u.x+=dx/d*sp;u.y+=dy/d*sp}}
}
function talk(u,dt){
 const h=U[u.target];if(!h){toHome(u);return}
 u.tt+=dt;u.face=h.x>u.x?1:-1;
 const K=U.knight,Wz=U.wizard,k=u.kind==='learn'&&!(K&&Wz)?null:u.kind,once=(n,t,f)=>{if(!u.ev[n]&&u.tt>=t){u.ev[n]=1;f()}};let end=3.4;
 if(k==='friend'){once('a',.4,()=>{u.mood=h.mood='happy';u.mt=h.mt=3;hearts(u);hearts(h)});once('b',1.5,()=>{hearts(u);hearts(h)})}
 else if(k==='chat'){const sc=u.sc2||(u.sc2=pick(TALK));end=sc.length*2.3+.8;sc.forEach((l,i)=>once('l'+i,.6+i*2.3,()=>{if(U[l[0]])say(U[l[0]],l[1])}))}
 else if(k==='learn'){end=3.8;
  once('a',.4,()=>{Wz.hop=.5;Wz.mood='happy';Wz.mt=2;K.act='learn';K.at=0});
  once('z',2,()=>{K.form='eknight';K.lb.textContent='Eldritch Knight';K.mood='happy';K.mt=2;poof(K.x,K.y-20,'#c890ff');save()});
  once('y',3,()=>{K.act=null})}
 else if(k==='orc'){end=4.6;if(u.orc)u.face=u.orc.x>u.x?1:-1;
  once('o2',.5,()=>{u.act='prac';u.at=0});
  once('o3',1.2,()=>{if(u.orc)u.orc.blink=.5});
  once('o4',2,()=>{u.blink=.5;u.mood='mad';u.mt=.7});
  once('o5',2.6,()=>{if(u.orc)u.orc.blink=.5});
  once('o6',3.5,()=>{if(u.orc){poof(u.orc.x,u.y-20,'#6a9a3a');u.orc=null}u.act=null;u.mood='happy';u.mt=1.5;h.hop=.5;h.mood='happy';h.mt=1.5})}
 else{once('h1',.6,()=>{u.hop=.5});once('h2',1.4,()=>{h.hop=.5})}
 if(u.tt>end){u.act=null;u.orc=null;h.act=null;h.hosting=null;h.st='idle';h.wait=2;u.target=null;u.st='back';u.path=route(u,h.r,h.c,u.r,u.c,home(u))}
}
function step(dt){
 for(const u of Object.values(U))u.fxs=u.fxs.filter(f=>{f.open+=(f.want-f.open)*Math.min(1,dt*8);if(f.closing&&f.open<.05){f.vis=false;f.keep=false}f.a=f.type==='door'?(f.vis?1:0):f.a+((f.vis?1:0)-f.a)*Math.min(1,dt*9);return f.keep||f.vis||f.a>.03});
 parts.forEach(p=>p.t+=dt);parts=parts.filter(p=>p.t<p.life);bolts.forEach(b=>b.t+=dt);bolts=bolts.filter(b=>b.t<.5);
 demons.forEach(d=>d.t+=dt);for(let i=demons.length-1;i>=0;i--)if(demons[i].t>=4){poof(demons[i].x,demons[i].y-20,'#ff6060');demons.splice(i,1)}
 if(bubU&&(bubU.t-=dt)<=0){bubU=null;bub.style.display='none'}
 for(const id in U){const u=U[id];
  if(u.mt>0&&(u.mt-=dt)<=0)u.mood='ok';
  if(u.hop>0)u.hop-=dt;if(u.blink>0)u.blink-=dt;
  if(u.act)u.at+=dt;if(u.orc&&u.orc.blink>0)u.orc.blink-=dt;
  if(u.st==='talk'){talk(u,dt);continue}
  if(u.st==='cast'){casting(u,dt);continue}
  if(u.st==='act'){acting(u,dt);continue}
  if(u.hosting){const v=U[u.hosting];if(v)u.face=v.x>u.x?1:-1;continue}
  if(u.path.length){run(u,dt);continue}
  if(u.st==='idle'&&(u.wait-=dt)<=0)decide(u);
 }
}

// ---------- render ----------
const scl=u=>{const ry=((u.y%CELL)+CELL)%CELL;return(ry>=66?1-.3*cl((84-ry)/14,0,1):1)*u.sk};
function render(){
 g.clearRect(0,0,W,H);
 for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){g.fillStyle=(r+c)%2?'#25214a':'#2a2650';g.fillRect(c*CELL,r*CELL,CELL,CELL)}
 const dm=drag&&drag.moved?drag.id:null;
 for(const id in U){const u=U[id],x=u.c*CELL,y=u.r*CELL;
  if(id===dm){g.strokeStyle='#5a5590';g.lineWidth=2;g.setLineDash([4,4]);g.strokeRect(x+4,y+4,CELL-8,CELL-8);g.setLineDash([])}else box(g,id,x,y,u.weapon);
  u.lb.style.opacity=id===dm?0:1}
 Object.values(U).forEach(u=>u.fxs.forEach(f=>drawFx(f)));
 Object.values(U).filter(u=>u.id!==dm).sort((a,b)=>a.y-b.y).forEach(u=>{
  const walking=u.path.length&&u.path[0].k==='walk',hop=u.hop>0?-Math.abs(Math.sin(u.hop/.5*Math.PI))*10:0,bl=u.blink>0&&Math.floor(u.blink*14)%2?.2:1;
  spr(g,u.form||u.id,u.mood,u.x,u.y,u.face,(walking?Math.sin(u.t*14)*1.5:0)+hop,u.al*bl,scl(u),poseOf(u.st==='cast'?'cast':u.act,u.st==='cast'?u.tt:u.at))});
 Object.values(U).forEach(u=>{if(u.id===dm)return;
  if(u.orc){const o=u.orc,ob=o.blink>0&&Math.floor(o.blink*14)%2?.2:1;spr(g,'orc','mad',o.x,o.y,u.x>o.x?1:-1,0,ob,1)}
  if(u.act)drawAct(g,u)});
 demons.forEach(d=>drawDemon(g,d));
 parts.forEach(p=>{if(p.k==='h')heart(g,p.x,p.y-p.t*26);else{const k=p.t/p.life,s=Math.max(1,7*(1-k));g.fillStyle=p.c;for(let i=0;i<8;i++){const a=i*Math.PI/4;g.fillRect(p.x+Math.cos(a)*k*28-s/2,p.y+Math.sin(a)*k*28-s/2,s,s)}}});
 bolts.forEach(b=>{const a=1-b.t/.5;g.fillStyle='rgba(255,255,255,'+(a*.6)+')';b.cells.forEach(q=>g.fillRect(q[0],q[1],CELL,CELL));
  [['rgba(140,210,255,'+a+')',6],['#fff',2]].forEach(s=>{g.strokeStyle=s[0];g.lineWidth=s[1];g.beginPath();b.p.forEach((q,i)=>i?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1]));g.stroke()})});
 if(hover){g.strokeStyle='#f2a93b';g.lineWidth=3;g.strokeRect(hover[1]*CELL+3,hover[0]*CELL+3,CELL-6,CELL-6)}
 if(dm){const u=U[dm],x=drag.p.x-48,y=drag.p.y-48;g.globalAlpha=.9;box(g,dm,x,y,u.weapon);spr(g,u.form||dm,'ok',x+48,y+FY,1,0);g.globalAlpha=1}
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
 if(!d.moved){const u=U[d.id];if(u&&Math.hypot(p.x-u.x,p.y-(u.y-22))<30){u.hop=.5;u.mood='happy';u.mt=1}return}
 if(inRect(tray,e))removeUnit(d.id);
 else if(p.inb){const[r,c]=cellOf(p),u=U[d.id];if(r!==u.r||c!==u.c)relocate(d.id,r,c)}
 save()};
cv.onpointercancel=()=>{drag=null;hover=null;tray.classList.remove('over')};
const gh=$('#ghost'),gx=gh.getContext('2d');
function firstFree(){for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++)if(!at(r,c))return[r,c]}
['knight','wizard'].forEach(id=>{
 const b=document.createElement('button');b.className='it';b.dataset.id=id;b.innerHTML='<canvas width="96" height="96"></canvas>'+CH[id].name;
 const t=b.firstChild.getContext('2d');t.imageSmoothingEnabled=false;box(t,id,0,0,'longsword');spr(t,id,'ok',48,FY,1,0);
 b.onpointerdown=e=>{if(U[id])return;b.setPointerCapture(e.pointerId);td={id,sx:e.clientX,sy:e.clientY,moved:false}};
 b.onpointermove=e=>{if(!td)return;
  if(!td.moved&&Math.hypot(e.clientX-td.sx,e.clientY-td.sy)>8){td.moved=true;gx.clearRect(0,0,96,96);gx.drawImage(b.firstChild,0,0);gh.style.display='block'}
  if(td.moved){gh.style.left=e.clientX-42+'px';gh.style.top=e.clientY-42+'px';const p=pt(e);hover=p.inb?cellOf(p):null}};
 b.onpointerup=e=>{if(!td)return;const k=td;td=null;gh.style.display='none';hover=null;
  if(!k.moved){const f=firstFree();if(f)addUnit(id,f[0],f[1])}
  else{const p=pt(e);if(p.inb){const[r,c]=cellOf(p);if(!at(r,c))addUnit(id,r,c)}}};
 b.onpointercancel=()=>{td=null;gh.style.display='none';hover=null};
 b.onkeydown=e=>{if((e.key==='Enter'||e.key===' ')&&!U[id]){e.preventDefault();const f=firstFree();if(f)addUnit(id,f[0],f[1])}};
 tray.appendChild(b);
});
$('#clr').onclick=()=>{Object.keys(U).forEach(i=>removeUnit(i,true));save()};

// ---------- compendium ----------
const anim=[],tabRef=$('#tab-ref');
function mkc(w,h,title){const c=document.createElement('canvas');c.width=w;c.height=h;c.style.width=w*1.5+'px';c.title=title;c.setAttribute('role','img');c.setAttribute('aria-label',title);const x=c.getContext('2d');x.imageSmoothingEnabled=false;return[c,x]}
function diagram(k){
 const v=k==='bolt'||k==='chat',[c,x]=mkc(v?96:192,v?192:96,NAMES[k]);
 const [w,n]={friend:[[0,0],[96,0]],learn:[[96,0],[0,0]],bolt:[[0,0],[0,96]],chat:[[0,96],[0,0]]}[k];
 box(x,'wizard',w[0],w[1]);box(x,'knight',n[0],n[1],'longsword');
 spr(x,'wizard','ok',w[0]+48,w[1]+FY,1,0);spr(x,k==='learn'?'eknight':'knight','ok',n[0]+48,n[1]+FY,1,0);
 if(k==='friend'){heart(x,96,30);heart(x,84,20)}
 if(k==='learn'){x.fillStyle='#c890ff';[[20,24],[70,30],[30,52],[62,18]].forEach(q=>x.fillRect(n[0]+q[0],n[1]+q[1],3,3))}
 if(k==='bolt'){x.strokeStyle='#fff';x.lineWidth=2;x.beginPath();x.moveTo(52,44);[[44,64],[56,84],[46,106],[48,128]].forEach(q=>x.lineTo(q[0],q[1]));x.stroke()}
 if(k==='chat'){x.fillStyle='#eadcb4';[[40,40],[48,40],[56,40]].forEach(q=>x.fillRect(n[0]+q[0],n[1]+q[1],4,4))}
 return c}
// A puff of green smoke for Compendium tiles (k goes 0 to 1)
function poofTile(c,x,y,k){const s=Math.max(1,7*(1-k));c.fillStyle='#6a9a3a';for(let i=0;i<8;i++){const a=i*Math.PI/4;c.fillRect(x+Math.cos(a)*k*28-s/2,y+Math.sin(a)*k*28-s/2,s,s)}}
function idleTile(kind,wp){
 const[c,x]=mkc(96,96,NAMES[kind]+(wp?' ('+wp+')':''));
 anim.push(t=>{x.clearRect(0,0,96,96);
  if(kind==='read'||kind==='magic'){box(x,'wizard',0,0);spr(x,'wizard','ok',48,FY,1,0,1,1,poseOf(kind,t));drawAct(x,{act:kind,at:t,x:48,y:FY,face:1})}
  else if(kind==='demon'){const tt=t%4.8;box(x,'wizard',0,0);
   if(tt<2.1)spr(x,'wizard',tt>1.6?'mad':'ok',32,FY,1,0,tt>1.6&&Math.floor(tt*14)%2?.2:1,1,poseOf('demon',tt));
   drawDemon(x,{x:66,y:FY,t:tt,dir:-1})}
  else if(kind==='prac'){box(x,'knight',0,0,wp);spr(x,'knight','ok',48,FY,1,0,1,1,'grip');drawAct(x,{act:'prac',at:t,x:48,y:FY,face:1,weapon:wp})}
  else{// orc appears first, then the knight walks in from the left and fights
   const tt=t%5.4,fight=tt>1.3&&tt<3.9,kx=tt<.8?null:Math.min(30,4+(tt-.8)*52),mad=tt>2.4&&tt<2.9;box(x,'knight',0,0,'longsword');
   if(tt<3.9){const b=(tt>1.6&&tt<2.1)||(tt>3&&tt<3.5);spr(x,'orc','mad',68,FY,-1,0,b&&Math.floor(tt*14)%2?.2:1)}
   if(tt<.4)poofTile(x,68,FY-20,tt/.4);
   if(kx!=null)spr(x,'knight',mad?'mad':'ok',kx,FY,1,fight||kx>=30?0:Math.sin(tt*14)*1.5,mad&&Math.floor(tt*14)%2?.2:1,1,fight?'grip':'none');
   if(fight)drawAct(x,{act:'prac',at:tt-1.3,x:30,y:FY,face:1,weapon:'longsword'})}
 });
 return c}
function buildRef(){
 const b=$('#refs');b.innerHTML='';
 const sec=(t,items)=>{const h=document.createElement('h2');h.className='sec';h.textContent=t;const d=document.createElement('div');d.className='cg';items.forEach(i=>d.appendChild(i));b.append(h,d)};
 // Wrap a tile with its % chance in the top right corner
 const pc=(c,p)=>{const d=document.createElement('div');d.className='tile';const s=document.createElement('span');s.className='pct';s.textContent=Math.round(p*100)+'%';d.append(c,s);return d};
 // Arrangements: chance per idle check that a character starts that interaction (visit chance x not a plain hangout)
 const ev=1-ODDS.hangout,arr=k=>(k==='friend'?ODDS.visitFriend:ODDS.visit)*ev;
 sec('Arrangements',['friend','learn','bolt','chat'].map(k=>pc(diagram(k),arr(k))));
 const W=ODDS.wizard,K=ODDS.knight;
 sec('Wizard idle',[pc(idleTile('read'),W.read),pc(idleTile('magic'),W.magic),pc(idleTile('demon'),W.demon)]);
 sec('Knight idle',[...WEAPONS.map(w=>pc(idleTile('prac',w),K.prac)),pc(idleTile('orc'),K.orc)]);
}
document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>{
 document.querySelectorAll('.tab').forEach(x=>x.classList.toggle('on',x===b));
 $('#tab-board').hidden=b.dataset.t!=='board';tabRef.hidden=b.dataset.t!=='ref';
 if(b.dataset.t==='ref'&&!anim.length)buildRef()});

// ---------- state ----------
function ui(){document.querySelectorAll('.it').forEach(b=>b.classList.toggle('used',!!U[b.dataset.id]))}
function save(){try{const b={};for(const i in U)b[i]=[U[i].r,U[i].c,U[i].weapon,U[i].form];localStorage.setItem(KEY,JSON.stringify({boxes:b,un:S.un}))}catch(e){}}
function load(){let d=null;try{d=JSON.parse(localStorage.getItem(KEY))}catch(e){}
 if(d&&d.boxes){S.un=d.un||{};for(const i in d.boxes)if(CH[i])addUnit(i,d.boxes[i][0],d.boxes[i][1],true,d.boxes[i][2],d.boxes[i][3])}
 else{addUnit('knight',1,1,true);addUnit('wizard',1,3,true)}
 ui()}
load();requestAnimationFrame(frame);
