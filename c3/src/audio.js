// Final ten seconds: alternating chip warning, double pulses in the last three.
export function alarmNotesAt(step){
 if(step<200||step>=240)return [];
 const fast=step>=228,note=step%2?84:76;
 return [{note,duration:fast?.10:.20,wave:'square',gain:.16,delay:0},...(fast?[{note:note+7,duration:.10,wave:'square',gain:.13,delay:.125}]:[])];
}
// Original nine-second chip fanfare. No sampled or transcribed arcade music.
export function endingNotesAt(step){
 if(step<0||step>=36)return [];
 const tune=[72,0,76,79,84,0,79,76,77,81,84,0,86,84,81,0,79,83,86,0,88,86,84,83,84,0,79,0,76,79,84,0,84,0,0,0];
 const n=tune[step],root=[48,53,55,48][Math.min(3,Math.floor(step/8))],out=[];
 if(n)out.push({note:n,duration:step===32?.9:.21,wave:'square',gain:.17});
 if(step%2===0&&step<=32)out.push({note:root+(step%4===2?12:0),duration:step===32?.9:.21,wave:'triangle',gain:.24});
 return out;
}
export const melody=[[72,76,79,81,79,null,76,0],[74,77,81,79,76,74,72,null],[76,79,84,83,81,null,79,76],[74,79,83,86,83,79,77,74],[72,76,79,84,81,79,76,0],[74,77,81,84,81,77,74,0],[77,81,84,81,79,83,86,83],[84,null,79,76,74,76,72,null]];
export const frequency=n=>440*2**((n-69)/12);
export function notesAt(step,floor=0,result=false){const bar=Math.floor(step/8),beat=step%8,m=melody[bar%8],n=m[beat],notes=[];const end=bar>=24;const lead=n&&n+(end&&bar%2?12:0);if(lead)notes.push({note:lead,duration:m[beat+1]===null?.46:.21,wave:'square',gain:.16});const roots=[48,53,57,55,48,50,53,48],root=roots[bar%8];if(beat%2===0||bar>=16)notes.push({note:root+(beat===4?12:0),duration:.21,wave:'triangle',gain:.23});if(floor!==6&&(bar>=8||floor>=2)&&beat%2===1)notes.push({note:root+24+[0,4,7,12][beat%4],duration:.09,wave:'square',gain:.07});if(beat%2===0)notes.push({note:beat%4===2?66:45,duration:.055,wave:'noise',gain:floor===4?.11:.07});return notes;}
export const SFX={bossEnter:[[48,.1],[55,.1],[60,.2]],bossWarn:[[48,.12],[60,.12],[48,.12]],gripL:[[84,.04]],gripR:[[88,.04]],card:[[76,.05],[79,.05],[84,.05]],star:[[91,.06]],warnSmall:[[81,.055],[81,.055]],warnLarge:[[48,.1],[60,.12]],brace:[[43,.08]],guardHit:[[60,.09]],jump:[[60,.06],[67,.06],[76,.06],[88,.07]],land:[[67,.05],[72,.05]],smallHit:[[67,.06],[60,.06]],largeHit:[[72,.055],[67,.055],[60,.055],[48,.055]],roofLight:[[72,.16],[76,.16],[79,.16],[84,.42]],count:[[76,.08]],timeup:[[79,.15],[76,.15],[72,.4]],reject:[[45,.025]],encore:[[84,.08],[88,.08],[91,.16]]};
export function pcmNote(note,duration,wave='square',rate=22050){const out=new Float32Array(Math.ceil(duration*rate));let rand=0x1234;const f=frequency(note);for(let i=0;i<out.length;i++){const t=i/rate,p=t*f%1,env=Math.min(1,t/.004,(duration-t)/.015);rand^=rand<<13;rand^=rand>>>17;rand^=rand<<5;const v=wave==='noise'?(rand>>>0)/2147483648-1:wave==='triangle'?1-4*Math.abs(p-.5):p<.5?.65:-.65;out[i]=v*Math.max(0,env);}return out;}
export class AudioDirector{
 constructor(){try{this.muted=localStorage.getItem('gh-v2-muted')==='true';}catch{this.muted=false;}this.cache=new Map();this.voices=[];this.step=-1;this.floor=0;this.pendingFloor=0;this.phase=null;}
 async unlock(){try{if(!this.ctx){const AC=globalThis.AudioContext||globalThis.webkitAudioContext;if(!AC)return;this.ctx=new AC();this.master=this.ctx.createGain();this.bgm=this.ctx.createGain();this.sfx=this.ctx.createGain();this.master.gain.value=this.muted?0:.5;this.bgm.gain.value=.35;this.sfx.gain.value=.55;this.bgm.connect(this.master);this.sfx.connect(this.master);this.master.connect(this.ctx.destination);this.timer=setInterval(()=>this.schedule(),25);}await this.ctx.resume();}catch{}}
 toggle(){this.muted=!this.muted;try{localStorage.setItem('gh-v2-muted',String(this.muted));}catch{}if(this.master)this.master.gain.setValueAtTime(this.muted?0:.5,this.ctx.currentTime);this.unlock();return !this.muted;}
 buffer(n,d,wave){const key=[n,d,wave].join(':');if(!this.cache.has(key)){const a=pcmNote(n,d,wave,this.ctx.sampleRate),b=this.ctx.createBuffer(1,a.length,this.ctx.sampleRate);b.copyToChannel(a,0);this.cache.set(key,b);}return this.cache.get(key);}
 play(n,d,wave,gain,when,bus){if(!this.ctx)return;const source=this.ctx.createBufferSource(),vol=this.ctx.createGain();source.buffer=this.buffer(n,d,wave);vol.gain.value=gain;source.connect(vol);vol.connect(bus);source.start(when);source.onended=()=>{source.disconnect();vol.disconnect();};return source;}
 start(phase,result=false,ending=false){this.stop();this.phase=phase;this.result=result;this.ending=ending;this.step=Math.floor(phase()/.25)-1;this.schedule();}
 stop(){this.phase=null;this.step=-1;for(const s of this.music||[])try{s.stop();}catch{}this.music=[];}
 schedule(){if(!this.ctx||!this.phase||this.ctx.state!=='running')return;const elapsed=this.phase(),phase=this.result?elapsed%8:elapsed;if(this.ending&&elapsed>=9||!this.result&&!this.ending&&elapsed>=60)return;const current=Math.floor(elapsed/.25);if(this.step<current-1)this.step=current-1;while((this.step+1)*.25<elapsed+.12){const index=++this.step,at=index*.25;if(at<elapsed-.03)continue;const s=this.result?index%32:index;if(s>=240&&!this.result)break;if(s%8===0)this.floor=this.pendingFloor;const when=this.ctx.currentTime+Math.max(0,at-elapsed);this.music??=[];this.music=this.music.filter(v=>v.end>this.ctx.currentTime);const alarm=!this.ending&&!this.result&&s>=200;for(const n of (this.ending?endingNotesAt(index):alarm?alarmNotesAt(s):notesAt(s,this.floor,this.result))){const onset=when+(n.delay||0);const source=this.play(n.note,n.duration,n.wave,n.gain,onset,alarm?this.sfx:this.bgm);source.end=onset+n.duration;this.music.push(source);}}}
 event(type){if(!this.ctx||!SFX[type])return;const now=this.ctx.currentTime;this.voices=this.voices.filter(v=>v.end>now);if(this.voices.length>=2)return;let time=now;for(const [n,d]of SFX[type]){this.play(n,d,'square',.22,time,this.sfx);time+=d;}this.voices.push({end:time});if(type.startsWith('warn')){this.bgm.gain.cancelScheduledValues(now);this.bgm.gain.setValueAtTime(.25,now);this.bgm.gain.linearRampToValueAtTime(.35,now+.25);}}
}

