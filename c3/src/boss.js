import {C,center} from './map.js';
// HAMASHISHI: original rooftop show mascot. One locked lane per attack; no homing.
export function bossTick(g){
 if(!g.hazards||g.finished)return false;
 if(!g.boss&&g.row>=C.bossRow){g.boss={phase:'INTRO',count:0,nextTick:g.tick+C.bossIntro,attack:null};g.emit('bossEnter');}
 const b=g.boss;if(!b)return false;
 // The final show replaces overlapping ordinary hazards, rather than stacking them.
 for(const o of g.objects)if(o.kind!=='star'&&!(o.resident&&b.phase==='REST'))o.fadeAt??=g.tick+11;
 if(!b.attack){
  if(g.objects.some(o=>o.resident&&!o.dead&&!o.fadeAt)||g.tick<b.nextTick||b.count>=C.bossMaxAttacks||g.row<C.bossFloor||g.state==='RECOVERY'||g.tick<g.safeUntil||g.action?.kind==='jump')return false;
  const col=Math.max(0,Math.min(5,Math.round((g.body.x-40)/32)));
  const options=[col-1,col+1].filter(c=>g.window(g.row,c)&&g.window(g.row,c,false,g.tick+C.bossWarning));
  if(!options.length){b.nextTick=g.tick+12;return false;}
  b.attack={id:'hamashishi-'+(++b.count),col,start:g.tick,age:0,y:49*24,prevY:49*24,hit:false,moved:false,threatened:Math.abs(g.body.x-center(col))<16};
  b.phase='WARNING';g.emit('bossWarn');
 }
 const a=b.attack;a.age=g.tick-a.start;
 if(g.col!==a.col&&!g.action)a.moved=true;
 if(a.age<C.bossWarning)return false;
 if(a.age<C.bossWarning+C.bossStrike){
  b.phase='STRIKE';a.prevY=a.y;a.y=49*24-(49-C.bossFloor)*24*Math.min(1,(a.age-C.bossWarning+1)/C.bossStrike);
  const contact=Math.abs(g.body.x-center(a.col))<=16&&a.y-11<=g.body.y+12&&a.prevY+11>=g.body.y-12;
  if(contact&&!a.hit&&g.hit(false)){a.hit=true;return true;}return false;
 }
 if(a.threatened&&a.moved&&!a.hit&&g.tick>=g.safeUntil&&g.state!=='RECOVERY'&&g.action?.kind!=='jump')g.avoid(a);
 b.attack=null;b.phase='REST';b.nextTick=g.tick+C.bossRest;
 return false;
}

