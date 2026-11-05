// ---------- data: constants, characters, rules data ----------
const CELL=96,COLS=5,ROWS=4,FY=84,KEY='cubehold-v4',O='#1a1226',S1='#f0c8a0',S2='#d8a880';
const B=o=>[[4,19,3,2,o.boot||'#3a2a1a'],[9,19,3,2,o.boot||'#3a2a1a'],[5,16,2,3,o.pants||'#4a4a5a'],[9,16,2,3,o.pants||'#4a4a5a'],[4,10,8,6,o.body],[10,10,2,6,o.bodyD],[4,14,8,1,o.belt||'#5a3a1e'],[2,10,2,5,o.body],[12,10,2,5,o.bodyD],[2,15,2,1,o.skin||S1],[12,15,2,1,o.skin||S1],[5,3,6,6,o.skin||S1],[9,3,2,6,o.skinD||S2]];
const CH={
 knight:{name:'Knight',eye:O,p:[...B({body:'#8a94a8',bodyD:'#667088',pants:'#4a5470',boot:'#2a2a3a',belt:'#a0782a'}),[4,1,8,3,'#aab4c8'],[4,4,1,4,'#8a94a8'],[11,4,1,4,'#667088'],[7,0,2,2,'#c03030'],[0,11,3,5,'#3a5aa8'],[1,12,1,3,'#f2c84a'],[14,7,1,9,'#cfd6e0'],[13,15,3,1,'#c0a030']]},
 eknight:{name:'Eldritch Knight',eye:'#c890ff',p:[...B({body:'#3a2f66',bodyD:'#2a2150',pants:'#2a2150',boot:'#1a1430',belt:'#6a4cc2'}),[4,1,8,3,'#4a3f7a'],[4,4,1,4,'#3a2f66'],[11,4,1,4,'#2a2150'],[3,0,2,3,'#8a5ae0'],[11,0,2,3,'#8a5ae0'],[1,9,3,2,'#6a4cc2'],[12,9,3,2,'#6a4cc2'],[13,2,2,12,'#b080ff'],[12,13,4,1,'#6a4cc2'],[13,1,2,1,'#fff']]},
 wizard:{name:'Wizard',eye:O,p:[...B({body:'#5a3ca8',bodyD:'#46308a'}),[4,10,8,9,'#5a3ca8'],[10,10,2,9,'#46308a'],[4,14,8,1,'#f2c84a'],[6,9,4,3,'#e8e8f0'],[3,3,10,2,'#6a4cc2'],[5,1,6,2,'#6a4cc2'],[7,0,3,1,'#6a4cc2'],[5,3,6,1,'#f2c84a'],[1,5,1,15,'#8a5a2a'],[0,3,3,3,'#7ff0ff']]},
 orc:{name:'Orc',eye:'#ffd34e',p:[...B({body:'#5a4a3a',bodyD:'#42362a',skin:'#6a9a3a',skinD:'#4a7a2a',pants:'#3a2a1a',boot:'#2a1a10',belt:'#2a1a10'}),[4,2,8,3,'#3a3a2a'],[5,8,1,2,'#f0ead0'],[10,8,1,2,'#f0ead0'],[13,3,2,13,'#6a4420'],[12,1,4,5,'#7a5a30']]},
 demon:{name:'Demon',eye:'#ffd34e',p:[[0,5,3,9,'#6a1a1a'],[13,5,3,9,'#6a1a1a'],[4,17,3,3,'#8a2020'],[9,17,3,3,'#8a2020'],[4,10,8,8,'#b82a2a'],[6,12,4,5,'#d86a4a'],[2,10,2,6,'#b82a2a'],[12,10,2,6,'#b82a2a'],[4,3,8,7,'#d03a3a'],[3,0,2,4,'#2a1a1a'],[11,0,2,4,'#2a1a1a'],[14,15,1,6,'#2a1a1a']]}
};
const TR={knight:{h:'door',u:'stone',d:'trap'},wizard:{h:'portal',u:'spiral',d:'spiral'}};
const WEAPONS=['shield','spear','glaive','longsword'];
const $=s=>document.querySelector(s),pick=a=>a[Math.floor(Math.random()*a.length)],cl=(v,a,b)=>Math.min(b,Math.max(a,v));

const TALK=[
 [['knight','Remember the dragon at Ashfell?'],['wizard','My beard still smells of smoke.'],['knight','You froze that bridge in a heartbeat.'],['wizard','And you held it alone until dawn.']],
 [['wizard','The Barrow Downs were your idea.'],['knight','And you woke the dead.'],['wizard','A small miscalculation!'],['knight','We still won the day, old friend.']]];
const NAMES={friend:'Old Friends',learn:'Eldritch Awakening',bolt:'Thunderstruck',chat:'Tales of Old',read:'Reading',magic:'Practicing magic',demon:'Summoning a demon',prac:'Weapon practice',orc:'Fighting an orc'};
