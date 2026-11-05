// ---------- art: room backgrounds and drawing ----------
const WALL={knight:['#3c4058','#2a2c40'],wizard:['#33295c','#211a40']};
function bg(id,w){
 if(id==='wizard')return [[10,14,38,42,'#6a4a2a'],[12,18,5,14,'#c04040'],[18,18,5,14,'#40a0c0'],[24,18,5,14,'#d0b030'],[30,18,5,14,'#8a5ae0'],[36,18,5,14,'#40c070'],[10,34,38,3,'#3a2410'],[12,38,5,14,'#d0b030'],[18,38,8,14,'#c04040'],[28,38,5,14,'#40a0c0'],[34,38,6,14,'#8a5ae0']];
 const a=[[12,64,22,3,'#4a4e5a'],[16,60,5,5,'#8a94a8'],[25,60,5,5,'#8a94a8'],[14,44,16,16,'#8a94a8'],[24,44,6,16,'#667088'],[10,44,4,10,'#aab4c8'],[30,44,4,10,'#aab4c8'],[16,28,12,16,'#aab4c8'],[18,34,8,2,O],[21,23,2,5,'#c03030']];
 const m={shield:[[40,36,16,20,'#3a5aa8'],[42,38,12,16,'#2a4488'],[46,42,4,8,'#f2c84a']],spear:[[47,14,2,52,'#8a5a2a'],[45,6,6,10,'#cfd6e0'],[47,4,2,4,'#fff']],glaive:[[47,18,2,48,'#8a5a2a'],[47,8,8,12,'#cfd6e0'],[49,10,4,8,'#8a94a8']],longsword:[[46,16,4,36,'#cfd6e0'],[40,52,16,3,'#c0a030'],[46,55,4,9,'#6a4420'],[45,64,6,2,'#c0a030']]};
 return a.concat(m[w||'longsword']);
}

// ---------- art ----------
function drawSprite(c,id,mood){
 const x=c.getContext('2d'),ch=CH[id],f=(a,b,w,h,k)=>{x.fillStyle=k;x.fillRect(a,b,w,h)};
 ch.p.forEach(p=>f(p[0]-1,p[1]-1,p[2]+2,p[3]+2,O));ch.p.forEach(p=>f(p[0],p[1],p[2],p[3],p[4]));
 const e=mood==='mad'?'#e03030':ch.eye;f(6,5,1,2,e);f(9,5,1,2,e);
 if(mood==='happy'){f(7,8,2,1,'#7a2a2a');f(5,7,1,1,'#f08080');f(10,7,1,1,'#f08080')}
 else if(mood==='mad'){f(6,4,2,1,O);f(9,4,2,1,O);f(7,8,2,1,'#a22')}else f(7,8,2,1,'#8a4a4a');
}
const SP={};
function sprite(id,m){const k=id+m;if(!SP[k]){const c=document.createElement('canvas');c.width=16;c.height=22;drawSprite(c,id,m);SP[k]=c}return SP[k]}
function spr(c,id,m,cx,fy,face,bob,al,sc){c.save();c.globalAlpha=al==null?1:al;sc=sc||1;c.translate(Math.round(cx),Math.round(fy+bob));c.scale(face<0?-sc:sc,sc);c.drawImage(sprite(id,m),-16,-44,32,44);c.restore()}
function box(c,id,x,y,w){
 const k=WALL[id];c.fillStyle=k[0];c.fillRect(x,y,CELL,CELL);c.fillStyle=k[1];c.fillRect(x,y+66,CELL,30);c.fillStyle='rgba(0,0,0,.3)';c.fillRect(x,y+66,CELL,2);
 bg(id,w).forEach(d=>{c.fillStyle=d[4];c.fillRect(x+d[0],y+d[1],d[2],d[3])});
 c.strokeStyle='#000';c.lineWidth=4;c.strokeRect(x+2,y+2,CELL-4,CELL-4);
}
function drawFx(f,pass){
 if(f.type!=='door'&&pass===1)return;
 g.save();g.globalAlpha=f.a;const x=f.x,y=f.y,o=f.open,t=f.type;
 if(t==='door'){
  if(o>.03){
   if(pass===1){const th=o*1.3,hx=x-20,fx=hx+40*Math.cos(th),sn=Math.sin(th),sc=1+.3*sn,cy=y-29+4*sn,ft=cy-29*sc,fb=cy+29*sc;
    g.beginPath();g.moveTo(hx,y-58);g.lineTo(fx,ft);g.lineTo(fx,fb);g.lineTo(hx,y);g.closePath();g.fillStyle='#9a6a34';g.fill();g.lineWidth=2;g.strokeStyle=O;g.stroke();
    g.fillStyle='#7a5226';g.beginPath();g.moveTo(hx,y-30);g.lineTo(fx,(ft+fb)/2-1);g.lineTo(fx,(ft+fb)/2+1);g.lineTo(hx,y-28);g.closePath();g.fill();
    g.fillStyle='#f2c84a';g.fillRect(fx-4,(ft+fb)/2-3,3,3)}
   else{g.fillStyle=O;g.fillRect(x-25,y-63,50,63);g.fillStyle='#0b0a14';g.fillRect(x-20,y-58,40,58);g.fillStyle='#5a3a1e';g.fillRect(x-23,y-61,3,61);g.fillRect(x+20,y-61,3,61);g.fillRect(x-23,y-61,46,3)}}}
 else if(t==='portal'){const s=.3+.7*o,h=Math.round(58*s),w=Math.round(36*s),c=Math.floor(T*8)%2?'#8fe0ff':'#c890ff';
  g.fillStyle='#6a4cc2';g.fillRect(x-w/2,y-h,w,h);g.fillStyle=c;g.fillRect(x-w/2+2,y-h+2,Math.max(0,w-4),Math.max(0,h-4));g.fillStyle='#fff';g.fillRect(x-w/2+5,y-h+6,Math.max(0,w-10),Math.max(0,h-12))}
 else if(t==='spiral'||t==='stone'){
  g.fillStyle='#0e0a18';g.fillRect(x-13,y-40,26,40);g.fillStyle='#000';g.fillRect(x-13,y-40,26,2);
  if(t==='spiral'){g.fillStyle='#5a5a6a';g.fillRect(x-1,y-38,3,38);for(let i=0;i<6;i++){g.fillStyle=i%2?'#b8a070':'#9a8a5c';g.fillRect(x+Math.round(Math.sin(i*1.2)*7)-5,y-6-i*6,10,3)}}
  else for(let i=0;i<5;i++){g.fillStyle=i%2?'#7a7f8c':'#8a8f9a';g.fillRect(x-12+i*5,y-7*(i+1),24-5*i,7*(i+1));g.fillStyle='#b8bcc8';g.fillRect(x-12+i*5,y-7*(i+1),24-5*i,1)}}
 else if(t==='trap'){g.fillStyle='#050308';g.fillRect(x-10,y-3,20,4);g.fillStyle='#6a4420';g.fillRect(x-11,y-5-o*9,22,4);g.fillStyle='#3a2410';g.fillRect(x-11,y-2-o*9,22,1);g.fillStyle='#f2c84a';g.fillRect(x-1,y-4-o*9,2,2)}
 else if(t==='hatch'){g.fillStyle='#050308';g.fillRect(x-10,y,20,5);g.fillStyle='#6a4420';if(o>.4)g.fillRect(x-11,y+5,22,3);else g.fillRect(x-11,y,22,5)}
 g.restore();
}
function heart(c,x,y){c.fillStyle='#e04060';c.fillRect(x-4,y,3,3);c.fillRect(x+1,y,3,3);c.fillRect(x-4,y+2,8,2);c.fillRect(x-2,y+4,4,2);c.fillRect(x-1,y+6,2,1)}
// Idle/activity overlays. u needs: act, at (seconds), x, y (feet), face, and for the knight weapon/form.
function drawAct(c,u){
 const f=u.face,a=u.act,t=u.at,x=u.x,y=u.y;
 if(a==='read'){const bx=Math.round(x),by=Math.round(y-20),pf=(t*1.1)%1;
  c.fillStyle=O;c.fillRect(bx-8,by-5,16,11);c.fillStyle='#7a4a22';c.fillRect(bx-7,by-4,14,9);
  c.fillStyle='#f2ead0';c.fillRect(bx-6,by-3,6,7);c.fillRect(bx+1,by-3,6,7);c.fillStyle='#b8a878';c.fillRect(bx,by-3,1,7);
  if(pf<.3){const w=Math.round(Math.sin(pf/.3*Math.PI)*6);c.fillStyle='#fff';c.fillRect(bx+1-w,by-4,w+1,7)}
  else{c.fillStyle='#9a8a68';c.fillRect(bx-4,by-1,3,1);c.fillRect(bx+2,by-1,4,1);c.fillRect(bx-4,by+1,3,1);c.fillRect(bx+2,by+1,3,1)}}
 else if(a==='magic'||a==='learn'){const pur=a==='learn',K=pur?['#c890ff','#e8d0ff','#8a5ae0']:['#2a6af0','#4fb0ff','#bfe8ff'];
  for(let i=0;i<14;i++){const an=t*(pur?3:4)+i*Math.PI*2/14,r=13+5*Math.sin(t*3+i),px=x+Math.cos(an)*r*1.2,py=y-24+Math.sin(an)*r*.8-(i%7)*2.5+8,s=i%3===2?2:3;
   c.fillStyle=K[i%3];c.fillRect(Math.round(px-s/2),Math.round(py-s/2),s,s)}
  if(!pur){const gx=Math.round(x-f*14),gy=Math.round(y-38);c.fillStyle=K[1];c.fillRect(gx-2,gy-2,5,5);c.fillStyle=K[2];c.fillRect(gx-1,gy-1,3,3)}}
 else if(a==='prac'){const w=u.form==='eknight'?'magic':(u.weapon||'longsword'),s=Math.sin(t*8),th=Math.max(0,Math.sin(t*6));
  c.save();c.translate(Math.round(x+f*10),Math.round(y-20));c.scale(f,1);
  if(w==='longsword'||w==='magic'){c.rotate(-.6+s*.9);c.fillStyle=w==='magic'?'#c890ff':'#cfd6e0';c.fillRect(-2,-22,3,22);if(w==='magic'){c.fillStyle='#fff';c.fillRect(-1,-20,1,16)}c.fillStyle='#c0a030';c.fillRect(-5,-2,9,2);c.fillStyle='#6a4420';c.fillRect(-1,0,2,4)}
  else if(w==='glaive'){c.rotate(-.5+s*.9);c.fillStyle='#8a5a2a';c.fillRect(-1,-26,2,36);c.fillStyle='#cfd6e0';c.fillRect(-1,-36,6,11);c.fillStyle='#8a94a8';c.fillRect(1,-34,3,7)}
  else if(w==='spear'){c.translate(th*10,0);c.fillStyle='#8a5a2a';c.fillRect(-6,-1,30,2);c.fillStyle='#cfd6e0';c.fillRect(24,-3,8,6);c.fillStyle='#fff';c.fillRect(28,-1,4,2)}
  else{c.translate(th*8,0);c.fillStyle=O;c.fillRect(1,-14,14,26);c.fillStyle='#3a5aa8';c.fillRect(2,-13,12,24);c.fillStyle='#2a4488';c.fillRect(8,-13,6,24);c.fillStyle='#f2c84a';c.fillRect(6,-5,3,8)}
  c.restore()}
}
function drawDemon(c,d){
 const t=d.t,fade=t>3.2?cl(1-(t-3.2)/.8,0,1):1,gr=cl(t/.8,0,1),col=Math.floor(T*10)%2?'#ff5050':'#a02020',rise=cl((t-.6)/.9,0,1)*fade,lg=Math.sin(cl((t-1.5)/.8,0,1)*Math.PI)*12*d.dir;
 c.save();c.globalAlpha=fade;
 for(let i=0;i<20;i++){const a=i/20*Math.PI*2+t*1.5;c.fillStyle=i%2?col:'#ffb0b0';c.fillRect(Math.round(d.x+Math.cos(a)*22*gr-1),Math.round(d.y-3+Math.sin(a)*6*gr-1),3,3)}
 c.beginPath();c.rect(d.x-34,d.y-90,68,90);c.clip();
 if(rise>0)spr(c,'demon',t>1.5?'mad':'ok',d.x+lg,d.y+(1-rise)*48,d.dir,0,fade,1);
 c.restore();
}
