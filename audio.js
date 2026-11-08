// ---------- sound: layered chiptune music (every room on the board adds its own part) and simple sound effects ----------
// Made with the browser's sound synthesizer (Web Audio), no sound files. Browsers only allow sound after the player's first tap or click.
// Settings (music on/off, sounds on/off) are kept in localStorage 'sq-audio', separate from the save.
const SND={music:true,sfx:true};try{Object.assign(SND,JSON.parse(localStorage.getItem('sq-audio'))||{})}catch(e){}
let AC=null,master=null,musicBus=null,sfxBus=null,seqStep=0,nextT=0;const layerOn={},layerGain={};
const BPM=104,STEP=60/BPM/2; // one step = an eighth note; 32 steps = 4 bars
const CHORDS=[[57,60,64],[53,57,60],[48,52,55],[55,59,62]]; // A minor, F, C, G: one bar (8 steps) each
const mf=n=>440*Math.pow(2,(n-69)/12);
// Melodies (MIDI notes per step, null = rest)
const MEL=[76,null,72,null,74,76,null,72, 72,null,69,null,72,null,69,null, 67,null,72,null,76,null,74,72, 74,null,71,null,67,null,null,null];
const JIG=[81,79,76,79,81,null,76,null, 77,76,72,76,77,null,72,null, 76,74,72,74,76,null,79,null, 74,72,71,72,74,null,67,null];
const HARP=[69,72,76,null,72,69,null,null, 65,69,72,null,69,65,null,null, 64,67,72,null,67,64,null,null, 67,71,74,null,71,67,null,null];
const WHISTLE=[null,null,84,null,null,null,81,null, null,null,81,null,null,null,77,null, null,null,79,null,null,null,84,null, null,null,83,null,79,null,null,null];
function audioStart(){if(AC)return;try{AC=new(window.AudioContext||window.webkitAudioContext)()}catch(e){return}
 master=AC.createGain();master.gain.value=.5;master.connect(AC.destination);
 musicBus=AC.createGain();musicBus.gain.value=SND.music?.22:0;musicBus.connect(master);sfxBus=AC.createGain();sfxBus.gain.value=SND.sfx?.45:0;sfxBus.connect(master);
 nextT=AC.currentTime+.1;setInterval(schedule,50)}
addEventListener('pointerdown',()=>{audioStart();if(AC&&AC.state==='suspended')AC.resume()},{passive:true});
function tone(bus,type,f,t,d,v,f2){const o=AC.createOscillator(),gn=AC.createGain();o.type=type;o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+d);
 gn.gain.setValueAtTime(0,t);gn.gain.linearRampToValueAtTime(v,t+.008);gn.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(gn);gn.connect(bus);o.start(t);o.stop(t+d+.02)}
let NOISE=null;
function noise(bus,t,d,v,hp,lp){if(!NOISE){NOISE=AC.createBuffer(1,AC.sampleRate*.5,AC.sampleRate);const dd=NOISE.getChannelData(0);for(let i=0;i<dd.length;i++)dd[i]=Math.random()*2-1}
 const s=AC.createBufferSource(),gn=AC.createGain();s.buffer=NOISE;let n=s;
 if(hp){const f=AC.createBiquadFilter();f.type='highpass';f.frequency.value=hp;n.connect(f);n=f}if(lp){const f=AC.createBiquadFilter();f.type='lowpass';f.frequency.value=lp;n.connect(f);n=f}
 gn.gain.setValueAtTime(v,t);gn.gain.exponentialRampToValueAtTime(.0001,t+d);n.connect(gn);gn.connect(bus);s.start(t);s.stop(t+d+.02)}
// Each room's part: (step 0-31, the bar's chord, start time, its gain node)
const LAYERS={
 knight:(s,c,t,b)=>{if(s%4===0)tone(b,'sine',110,t,.2,.9,45);if(s%4===2)noise(b,t,.12,.35,1500)}, // drums
 wizard:(s,c,t,b)=>tone(b,'square',mf(c[s%3]+12),t,.11,.14), // arpeggio
 priest:(s,c,t,b)=>{if(s%8===0)c.forEach(n=>tone(b,'triangle',mf(n),t,STEP*7.6,.1))}, // soft pad
 necromancer:(s,c,t,b)=>{if(s%8===0||s%8===5)tone(b,'sawtooth',mf(c[0]-24),t,STEP*2.5,.1)}, // low drone
 merchant:(s,c,t,b)=>{if([0,3,4,6].includes(s%8))tone(b,'triangle',mf((s%8===4?c[2]:c[0])-12),t,.22,.38)}, // bouncy bass
 apothecary:(s,c,t,b)=>{if(MEL[s])tone(b,'sine',mf(MEL[s]),t,STEP*1.8,.2)}, // flute melody
 alchemist:(s,c,t,b)=>{if(s%8===1||s%8===6)tone(b,'square',mf(c[(s*7)%3]+24),t,.06,.08)}, // blips
 rogue:(s,c,t,b)=>{if(s%2===1)noise(b,t,.04,.22,6000)}, // hi-hats
 druid:(s,c,t,b)=>{if(HARP[s])tone(b,'triangle',mf(HARP[s]+12),t,.4,.18)}, // plucked harp
 blacksmith:(s,c,t,b)=>{if(s%16===0||s%16===12){noise(b,t,.08,.25,3000);tone(b,'square',1568,t,.06,.05)}}, // anvil clinks
 monarch:(s,c,t,b)=>{if(s%16===0)c.forEach(n=>tone(b,'square',mf(n+12),t,.45,.05))}, // fanfare
 traveler:(s,c,t,b)=>{if(s%2===1)c.forEach(n=>tone(b,'sawtooth',mf(n),t,.09,.03))}, // accordion
 farmer:(s,c,t,b)=>{if(WHISTLE[s])tone(b,'sine',mf(WHISTLE[s]),t,STEP*1.6,.12)}, // whistle
 well:(s,c,t,b)=>{if(s%16===7||s%16===13)tone(b,'sine',mf(c[1]+24),t,.18,.14,mf(c[1]+31))}, // water drips
 tavern:(s,c,t,b)=>{if(JIG[s])tone(b,'square',mf(JIG[s]),t,.1,.07)}}; // a jig
// Which parts play: one per room on the board (the three Farmers share one; a buried Druid is silent)
function activeLayers(){const on={};Object.values(U).forEach(u=>{if(u.dead)return;const k=isFarm(u.id)?'farmer':u.id;if(LAYERS[k])on[k]=1});return on}
function schedule(){if(!AC)return;const on=activeLayers();
 for(const k in LAYERS){if(!layerGain[k]){layerGain[k]=AC.createGain();layerGain[k].gain.value=0;layerGain[k].connect(musicBus)}
  if(!!on[k]!==!!layerOn[k]){layerOn[k]=!!on[k];const gg=layerGain[k].gain,t=AC.currentTime;gg.cancelScheduledValues(t);gg.setValueAtTime(gg.value,t);gg.linearRampToValueAtTime(on[k]?1:0,t+2)}} // fade a part in or out
 while(nextT<AC.currentTime+.15){const c=CHORDS[Math.floor(seqStep/8)%4];if(SND.music)for(const k in LAYERS)if(layerOn[k]||layerGain[k].gain.value>.01)LAYERS[k](seqStep,c,nextT,layerGain[k]);seqStep=(seqStep+1)%32;nextT+=STEP}}
// Sound effects
function sfx(kind){if(!AC||!SND.sfx||document.hidden)return;const t=AC.currentTime;
 if(kind==='step')noise(sfxBus,t,.035,.06,700,2400);
 if(kind==='open'){tone(sfxBus,'sawtooth',150,t,.28,.05,260);noise(sfxBus,t,.2,.05,300,1200)} // a creak
 if(kind==='close'){tone(sfxBus,'sine',110,t,.14,.35,60);noise(sfxBus,t,.08,.12,0,500)}} // a thud
// Footsteps: a soft step now and then while someone visible is walking (one sound for everyone, so it never gets noisy)
let stepAcc=0;function stepSounds(dt){const any=Object.values(U).some(u=>!isStruct(u)&&u.al>.5&&(u.mv||(u.path[0]&&u.path[0].k==='walk')));if(!any){stepAcc=0;return}if((stepAcc+=dt)>=.3){stepAcc=0;sfx('step')}}
// The Music and Sounds buttons (under the shelf)
function audioButtons(){const mb=$('#musicBtn'),sb=$('#sfxBtn');if(!mb||!sb)return;const show=()=>{mb.textContent='Music: '+(SND.music?'On':'Off');sb.textContent='Sounds: '+(SND.sfx?'On':'Off')};
 const keep=()=>{try{localStorage.setItem('sq-audio',JSON.stringify(SND))}catch(e){}show();if(AC){musicBus.gain.value=SND.music?.22:0;sfxBus.gain.value=SND.sfx?.45:0}};
 mb.onclick=()=>{audioStart();SND.music=!SND.music;keep()};sb.onclick=()=>{audioStart();SND.sfx=!SND.sfx;keep()};show()}
audioButtons();
