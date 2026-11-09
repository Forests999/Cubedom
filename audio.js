// ---------- music: layered chiptune, every room on the board adds its own part ----------
// Made with the browser's sound synthesizer (Web Audio), no sound files. Off by default; the Music button turns it on (browsers only
// allow sound after a tap or click) and the Volume dial sets how loud. Settings are kept in localStorage 'sq-music', separate from the save.
const SND={music:false,vol:60};try{Object.assign(SND,JSON.parse(localStorage.getItem('sq-music'))||{})}catch(e){}
let AC=null,musicBus=null,seqStep=0,nextT=0,timer=null;const layerOn={},layerGain={};
const BPM=104,STEP=60/BPM/2; // one step = an eighth note; 32 steps = 4 bars
const CHORDS=[[57,60,64],[53,57,60],[48,52,55],[55,59,62]]; // A minor, F, C, G: one bar (8 steps) each
const mf=n=>440*Math.pow(2,(n-69)/12);
// Melodies (MIDI notes per step, null = rest)
const MEL=[76,null,72,null,74,76,null,72, 72,null,69,null,72,null,69,null, 67,null,72,null,76,null,74,72, 74,null,71,null,67,null,null,null];
const JIG=[81,79,76,79,81,null,76,null, 77,76,72,76,77,null,72,null, 76,74,72,74,76,null,79,null, 74,72,71,72,74,null,67,null];
const HARP=[69,72,76,null,72,69,null,null, 65,69,72,null,69,65,null,null, 64,67,72,null,67,64,null,null, 67,71,74,null,71,67,null,null];
const WHISTLE=[null,null,84,null,null,null,81,null, null,null,81,null,null,null,77,null, null,null,79,null,null,null,84,null, null,null,83,null,79,null,null,null];
const FANFARE=[72,null,null,76,79,null,null,null, 77,null,null,72,77,null,null,null, 76,null,null,79,84,null,null,null, 79,null,77,null,74,null,null,null];
const volGain=()=>SND.music?(SND.vol/100)*.55:0;
function audioStart(){if(AC)return;try{AC=new(window.AudioContext||window.webkitAudioContext)()}catch(e){return}
 musicBus=AC.createGain();musicBus.gain.value=volGain();musicBus.connect(AC.destination);
 roomBus=AC.createGain();roomBus.connect(musicBus);themeBus=AC.createGain();themeBus.gain.value=0;themeBus.connect(musicBus); // the room parts / a group event's theme
 nextT=AC.currentTime+.1;timer=setInterval(schedule,50)}
function tone(bus,type,f,t,d,v,f2){const o=AC.createOscillator(),gn=AC.createGain();o.type=type;o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+d);
 gn.gain.setValueAtTime(0,t);gn.gain.linearRampToValueAtTime(v,t+.008);gn.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(gn);gn.connect(bus);o.start(t);o.stop(t+d+.02)}
let NOISE=null;
function noise(bus,t,d,v,hp){if(!NOISE){NOISE=AC.createBuffer(1,AC.sampleRate*.5,AC.sampleRate);const dd=NOISE.getChannelData(0);for(let i=0;i<dd.length;i++)dd[i]=Math.random()*2-1}
 const s=AC.createBufferSource(),gn=AC.createGain();s.buffer=NOISE;let n=s;if(hp){const f=AC.createBiquadFilter();f.type='highpass';f.frequency.value=hp;n.connect(f);n=f}
 gn.gain.setValueAtTime(v,t);gn.gain.exponentialRampToValueAtTime(.0001,t+d);n.connect(gn);gn.connect(bus);s.start(t);s.stop(t+d+.02)}
// Each room's part: [play(step 0-31, the bar's chord, time, its gain node), stereo position -1 left .. 1 right].
// Every part has its own pitch range and rhythm, and similar loudness, so each room you add can be heard.
const LAYERS={
 knight:[(s,c,t,b)=>{if(s%4===0)tone(b,'sine',140,t,.22,1,40);if(s%8===4)noise(b,t,.16,.5,1200)},0], // drums: kick and snare
 rogue:[(s,c,t,b)=>{noise(b,t,s%2?.03:.06,s%2?.18:.3,7000)},.3], // hi-hats on every step
 merchant:[(s,c,t,b)=>{if([0,3,4,6].includes(s%8))tone(b,'triangle',mf((s%8===4?c[2]:c[0])-12),t,.24,.55)},0], // bouncy bass
 necromancer:[(s,c,t,b)=>{if(s%8===0)tone(b,'sawtooth',mf(c[0]-24),t,STEP*7,.22)},-.2], // low drone, one long note a bar
 priest:[(s,c,t,b)=>{if(s%8===0)c.forEach(n=>tone(b,'triangle',mf(n),t,STEP*7.6,.2))},-.3], // soft chords
 wizard:[(s,c,t,b)=>tone(b,'square',mf(c[s%3]+12),t,.1,.16),.4], // fast arpeggio
 apothecary:[(s,c,t,b)=>{if(MEL[s])tone(b,'sine',mf(MEL[s]),t,STEP*1.8,.38)},-.4], // flute melody
 alchemist:[(s,c,t,b)=>{if(s%4===1)tone(b,'square',mf(c[(s>>2)%3]+24),t,.07,.22,mf(c[(s>>2)%3]+31))},.6], // bubbling blips
 druid:[(s,c,t,b)=>{if(HARP[s])tone(b,'triangle',mf(HARP[s]+12),t,.45,.35)},-.6], // harp
 blacksmith:[(s,c,t,b)=>{if(s%8===0||s%8===3){noise(b,t,.1,.4,2500);tone(b,'square',1568,t,.08,.12)}},.5], // anvil clinks
 monarch:[(s,c,t,b)=>{if(FANFARE[s])tone(b,'square',mf(FANFARE[s]),t,STEP*2.4,.16)},.2], // trumpet fanfare
 traveler:[(s,c,t,b)=>{if(s%2===1)c.forEach(n=>tone(b,'sawtooth',mf(n),t,.1,.07))},-.5], // accordion off-beats
 farmer:[(s,c,t,b)=>{if(WHISTLE[s])tone(b,'sine',mf(WHISTLE[s]),t,STEP*1.6,.3)},.7], // whistling
 well:[(s,c,t,b)=>{if(s%16===6)tone(b,'sine',mf(c[1]+12),t,.25,.2,mf(c[1]+14))},-.7], // one soft, low water drip every two bars
 tavern:[(s,c,t,b)=>{if(JIG[s])tone(b,'square',mf(JIG[s]),t,.11,.17)},.1]}; // a jig
// Mixing levels: each part's loudness evened out (measured), so every room you add is clearly heard
const MIX={knight:.42,rogue:2,merchant:.85,necromancer:1.5,priest:.8,wizard:.85,apothecary:.65,alchemist:2,druid:.85,blacksmith:2,monarch:1.2,traveler:4,farmer:1.35,well:.45,tavern:1.5}; // (the Well is kept quiet on purpose)
// ---------- group event themes: while a group event runs, the room parts fade down and the event plays its own tune ----------
// Each theme has its own chords (one bar each) and parts; it starts and stops at the beginning of a bar. Levels in THEME_MIX (measured).
const THEMES={
 market:{chords:[[60,64,67],[53,57,60],[55,59,62],[60,64,67]], // C, F, G, C: a bouncy town tune
  mel:[72,null,76,79,76,null,72,null, 77,null,81,null,77,76,74,null, 74,null,79,null,77,76,74,72, 72,76,79,76,72,null,null,null],
  play:(s,c,t,b,m)=>{if(s%4===0)tone(b,'triangle',mf(c[0]-12),t,.2,.5);if(s%4===2)c.forEach(n=>tone(b,'square',mf(n),t,.08,.05));if(m[s])tone(b,'square',mf(m[s]),t,STEP*1.4,.13)}}, // oom-pah bass, chord stabs, melody
 feast:{chords:[[62,66,69],[59,62,67],[57,61,64],[62,66,69]], // D, G, A, D: a grand hall
  mel:[74,null,78,null,81,null,78,null, 79,null,83,null,81,null,79,null, 76,null,78,79,81,null,76,null, 78,null,74,null,74,null,null,null],
  play:(s,c,t,b,m)=>{if(s%8===0)c.forEach(n=>tone(b,'triangle',mf(n),t,STEP*7.5,.12));if(s%8===0||s%8===5)tone(b,'sine',110,t,.25,.8,45);if(s%2===1)noise(b,t,.05,.12,6000);if(m[s])tone(b,'triangle',mf(m[s]+12),t,.4,.3)}}, // chords, drum, tambourine, bells
 wellchat:{chords:[[53,57,60],[57,60,64],[58,62,65],[55,60,64]], // F, Am, Bb, C: calm and chatty
  mel:[77,null,null,null,76,null,74,null, 72,null,null,null,null,null,null,null, 74,null,null,null,72,null,70,null, 72,null,null,null,null,null,null,null],
  play:(s,c,t,b,m)=>{if(s%2===0)tone(b,'triangle',mf(c[(s>>1)%3]+24),t,.3,.1);if(m[s])tone(b,'sine',mf(m[s]),t,STEP*3,.3)}}, // music box and a soft tune
 classic:{chords:[[62,65,69],[58,62,65],[60,64,67],[57,61,64]], // D minor, Bb, C, A: a heroic tune for the old adventuring party
  mel:[74,null,74,77,81,null,79,77, 77,null,74,null,70,null,null,null, 72,null,72,76,79,null,77,76, 76,null,null,null,73,null,null,null],
  play:(s,c,t,b,m)=>{if([0,3,4,6].includes(s%8))tone(b,'triangle',mf(c[0]-24),t,.18,.5);if(s%4===0)tone(b,'sine',130,t,.2,.7,40);if(s%8===4)noise(b,t,.14,.35,1500);if(m[s])tone(b,'square',mf(m[s]),t,STEP*1.6,.13)}}}; // galloping bass, drums, melody
const THEME_MIX={market:2.1,feast:1.1,wellchat:1.45,classic:1.3}; // (about as loud as a full board; the calm Well chat a little softer)
let themeK=null,themeBus=null,roomBus=null;
// Which parts play: one per room on the board (the three Farmers share one; a buried Druid is silent)
function activeLayers(){const on={};Object.values(U).forEach(u=>{if(u.dead)return;const k=isFarm(u.id)?'farmer':u.id;if(LAYERS[k])on[k]=1});return on}
function schedule(){if(!AC)return;const on=activeLayers();
 for(const k in LAYERS){if(!layerGain[k]){const p=AC.createStereoPanner?AC.createStereoPanner():null;layerGain[k]=AC.createGain();layerGain[k].gain.value=0;if(p){p.pan.value=LAYERS[k][1];layerGain[k].connect(p);p.connect(roomBus)}else layerGain[k].connect(roomBus)}
  if(!!on[k]!==!!layerOn[k]){layerOn[k]=!!on[k];const gg=layerGain[k].gain,t=AC.currentTime;gg.cancelScheduledValues(t);gg.setValueAtTime(gg.value,t);gg.linearRampToValueAtTime(on[k]?(MIX[k]||1):0,t+(on[k]?.8:1.5))}} // a part rises quickly when its room arrives
 while(nextT<AC.currentTime+.15){if(seqStep%8===0)themeCheck(nextT);const th=THEMES[themeK],c=(th?th.chords:CHORDS)[Math.floor(seqStep/8)%4];
  if(SND.music){for(const k in LAYERS)if(layerOn[k]||layerGain[k].gain.value>.01)LAYERS[k][0](seqStep,c,nextT,layerGain[k]);if(th)th.play(seqStep,c,nextT,themeBus,th.mel)}
  seqStep=(seqStep+1)%32;nextT+=STEP}}
// At the start of each bar: a group event running (grp, game.js) with a theme? The room parts fade down to a quarter and the theme comes in.
function themeCheck(t){const want=typeof grp!=='undefined'&&grp&&THEMES[grp.kind]?grp.kind:null;if(want===themeK)return;themeK=want;
 const fade=(g,v)=>{g.gain.cancelScheduledValues(t);g.gain.setValueAtTime(g.gain.value,t);g.gain.linearRampToValueAtTime(v,t+.6)};fade(roomBus,want?.25:1);fade(themeBus,want?THEME_MIX[want]:0)}
// The Music button and the Volume dial (on the Settings tab)
function musicControls(){const mb=$('#musicBtn'),vd=$('#musicVol');if(!mb)return;
 const keep=()=>{try{localStorage.setItem('sq-music',JSON.stringify(SND))}catch(e){}mb.textContent='Music: '+(SND.music?'On':'Off');if(musicBus)musicBus.gain.setTargetAtTime(volGain(),AC.currentTime,.05)};
 mb.onclick=()=>{SND.music=!SND.music;if(SND.music){audioStart();if(AC.state==='suspended')AC.resume()}keep()};
 if(vd){vd.value=SND.vol;vd.oninput=()=>{SND.vol=+vd.value;keep()}}
 keep()}
musicControls();
// (music that was left on starts again at the first tap or click, as browsers require)
addEventListener('pointerdown',()=>{if(SND.music){audioStart();if(AC&&AC.state==='suspended')AC.resume()}},{passive:true});
// Music plays only while you are in the game: it pauses when the tab is hidden (another tab, minimized, phone locked or the app in the
// background) or the window loses focus, and picks up where it left off when you come back
const musicAway=()=>document.hidden||!document.hasFocus();
function musicPresence(){if(!AC)return;if(musicAway()){if(AC.state==='running')AC.suspend()}else if(SND.music&&AC.state==='suspended')AC.resume()}
document.addEventListener('visibilitychange',musicPresence);addEventListener('blur',musicPresence);addEventListener('focus',musicPresence);addEventListener('pagehide',()=>{if(AC)AC.suspend()});addEventListener('pageshow',musicPresence);
