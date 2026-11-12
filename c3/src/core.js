import {bossTick} from './boss.js';
import {C,JUMPS,CARDS,FLOORS,floorAt,center,anchor,makeCourse,multiplier,hash} from './map.js';
export class Game{
 constructor({seed=C.seed,practice=false,hazards=true,collectibles=true}={}){this.seed=seed;this.practice=practice;this.hazards=hazards;this.collectibles=collectibles;this.tick=0;this.mode='CLIMB';this.state='HOLD';this.rowL=this.rowR=0;this.col=2;this.high=0;this.combo=0;this.score=0;this.ledger=[];this.events=[];this.queue=[];this.inputLog=[];this.action=null;this.buffer=null;this.guard=false;this.safeUntil=0;this.ids=new Set();this.categories=new Set();this.course=makeCourse(seed);this.objects=[];this.lastHazard=-999;this.reserved=new Map();this.lost=new Set();this.graceUntil=0;this.roofAtMs=null;this.avoidTotal=0;this.misses=0;this.showerQueue=[];this.lastStar=-999;this.finished=false;this.invalidReason=null;this.message='左右交互に、屋上の星へ！';this.lastWindow=-999;this.hazardSerial=0;this.residentFloors=new Set();this.pose();}
 get row(){return Math.min(this.rowL,this.rowR);}
 get encore(){return this.mode==='ENCORE';}
 emit(type,data={}){this.events.push({tick:this.tick,type,...data});}
 award(amount,category,id){if(this.finished||!this.practice&&this.tick>=C.totalTicks||id&&this.ids.has(id))return false;if(id)this.ids.add(id);amount=Math.max(-this.score,amount);this.score+=amount;this.ledger.push({tick:this.tick,category,amount,id});this.emit(category,{amount});return true;}
 window(row,col,existing=false,at=this.tick){if(col<0||col>5||row<(this.encore?48:0))return false;if((this.reserved.get(row+':'+col)??-1)>=at)return true;for(const o of this.objects)if(o.kind==='curtain'&&o.row===row&&o.col===col){const a=o.cycles?(at-o.start)%C.windowPeriod:at-o.start;return a<(existing?72:54)||a>=180;}return true;}
 setRows(row,col=this.col){this.rowL=this.rowR=row;this.col=col;this.lost.clear();}
 enqueue(type,data={},tick=this.tick+1){if(!this.finished&&!this.invalidReason)this.queue.push({tick,type,...data});}
 reject(message){this.message=message;this.emit('reject');}
 jumpPad(){return !this.encore&&this.rowL===this.rowR&&JUMPS.find(p=>p.row===this.row&&p.col===this.col&&!this.ids.has('jump-'+p.row));}
 intent(i){if(i.type==='guard'){this.guard=i.on;this.guardExpires=this.tick+C.guardQueue;if(!i.on&&this.state==='BRACE')this.state='HOLD';return;}
  if(this.state==='RECOVERY'||this.mode==='ROOF')return;
  if(this.action){if(this.action.duration-this.action.age<=C.bufferTicks&&!this.buffer)this.buffer=i;return;}
  if(this.guard||this.state==='BRACE')return;
  const row=this.row;
  if(i.type==='tap'){const h=i.hand;if(!['L','R'].includes(h))return;if(this.lost.has(h)){const target=this.rowL===this.rowR?row-1:row; if(!this.window(target,this.col))return this.reject('横へ避けよう');this.start('recoverHand',24,{hand:h,target});return;}
   if(this['row'+h]>this[h==='L'?'rowR':'rowL'])return this.reject('次は反対の手');if(!this.window(this['row'+h]+1,this.col))return this.reject('窓が開くまで待とう');this.start('hand',C.handTicks,{hand:h,target:this['row'+h]+1});}
  else if(i.type==='shift'){const dest=this.col+i.direction;if(!this.window(row,dest)||this.objects.some(o=>o.kind!=='curtain'&&o.col===dest&&o.age<o.warning&&Math.abs(o.y-(row*24-12))<48))return this.reject('× その窓へは移れない');this.start('shift',C.sideTicks,{dest,target:row,direction:i.direction});}
  else if(i.type==='jump'){const p=this.jumpPad();if(!p)return this.reject('光る窓で上にスワイプ');this.reserved.set((p.row+3)+':'+p.col,this.tick+75);this.start('jump',C.jumpTicks,{target:p.row+3,id:'jump-'+p.row});this.emit('jump');}
 }
 start(kind,duration,extra={}){this.action={kind,duration,age:0,fromL:this.rowL,fromR:this.rowR,fromCol:this.col,...extra};this.state=kind==='brace'?'ALIGN_BRACE':kind.toUpperCase();}
 resolveRows(jump=false){for(let r=this.high+1;r<=this.row;r++){this.high=r;if(!jump)this.combo++;this.award(jump?100:Math.round(100*multiplier(this.combo)),'height','row-'+r);}if(this.row>=48&&this.roofAtMs===null){this.roofAtMs=this.tick/60*1000;this.award(C.roofScore,'roof','roof');this.award((C.totalTicks-this.tick)*C.timeScorePerTick,'timeBonus','timeBonus');this.mode='ROOF';this.roofTick=this.tick;this.action=null;this.state='ROOF';this.finished=true;this.queue=[];this.buffer=null;this.guard=false;this.emit('roofLight');}}
 hit(large=false){if(this.finished||this.tick<this.safeUntil||this.state==='RECOVERY'||this.action?.kind==='jump'&&this.action.age>=6||this.mode==='ROOF')return false;this.misses++;this.combo=0;this.guard=false;this.buffer=null;this.action=null;const row=Math.max(this.encore?48:0,this.row-(large?3:1));let col=this.col;const order=[0,1,2,3,4,5].sort((a,b)=>Math.abs(a-col)-Math.abs(b-col)||a-b);col=order.find(c=>this.window(row,c))??col;this.reserved.set(row+':'+col,this.tick+(large?72:24)+60);this.start('recovery',large?72:24,{target:row,dest:col});this.state='RECOVERY';this.award(-(large?C.penalty:C.smallPenalty),large?'penalty':'smallPenalty');this.emit(large?'largeHit':'smallHit');return true;}
 avoid(o){if(this.avoidTotal>=C.avoidCap||this.ids.has('avoid-'+o.id))return;const n=Math.min(20,C.avoidCap-this.avoidTotal);if(this.award(n,'avoid','avoid-'+o.id))this.avoidTotal+=n;}
 advanceAction(){const a=this.action;if(!a)return null;a.age++;
  if(a.kind==='hand'&&a.age===Math.round(a.duration/2)){if(!this.window(a.target,this.col)){a.failed=true;this.reject('窓が閉じた！');}else this.emit(a.hand==='L'?'gripL':'gripR');}
  if(a.age<a.duration)return null;this.action=null;this.state='HOLD';let completion=null;
  if(a.kind==='hand'&&!a.failed&&this.window(a.target,this.col,true)){this['row'+a.hand]=a.target;completion='normal';}
  if(a.kind==='recoverHand'){if(this.window(a.target,this.col)){this['row'+a.hand]=a.target;this.lost.delete(a.hand);if(!this.lost.size){this.avoid({id:this.lostHazard});this.graceUntil=0;}}}
  if(a.kind==='shift'){if(this.window(a.target,a.dest)){this.setRows(a.target,a.dest);this.graceUntil=0;for(const o of this.objects)if(o.threatened)o.moved=true;}else this.hit(true);}
  if(a.kind==='brace'){this.setRows(a.target);this.state=this.guard?'BRACE':'HOLD';if(this.guard)this.emit('brace');}
  if(a.kind==='jump'){this.setRows(a.target);this.safeUntil=this.tick+30;completion=a;this.emit('land');}
  if(a.kind==='recovery'){this.setRows(a.target,a.dest);this.safeUntil=this.tick+60;}
  return completion;
 }
 pose(){const a=this.action;let l=anchor('L',this.rowL,this.col),r=anchor('R',this.rowR,this.col),bodyY=(l.y+r.y)/2-12,bodyX=center(this.col);if(a){const age=a.age,t=age/a.duration;
  if(a.kind==='hand'||a.kind==='recoverHand'){const h=a.hand==='L'?l:r;const from=a.hand==='L'?a.fromL:a.fromR;const phaseAge=age/a.duration*24;let p=Math.max(0,Math.min(1,(phaseAge-5)/7));if(a.failed)p=Math.max(0,1-(phaseAge-12)/12);h.y=(from+(a.target-from)*p)*24;const pull=Math.max(0,(phaseAge-12)/12);bodyY=((a.fromL+a.fromR)*12-12)+(a.failed?0:(a.target-from)*12*pull);h.free=phaseAge<12||a.failed;}
  if(a.kind==='shift'){const align=Math.min(1,age/6);l.y=(a.fromL+(a.target-a.fromL)*align)*24;r.y=(a.fromR+(a.target-a.fromR)*align)*24;const p1=Math.max(0,Math.min(1,(age-6)/9)),p2=Math.max(0,Math.min(1,(age-15)/9));const leading=a.direction>0?r:l,trailing=a.direction>0?l:r;leading.x+=32*a.direction*p1;trailing.x+=32*a.direction*p2;leading.free=age>=6&&age<15;trailing.free=age>=15&&age<24;bodyX=(l.x+r.x)/2;bodyY=(l.y+r.y)/2-12;}
  if(a.kind==='brace'){l.y=(a.fromL+(a.target-a.fromL)*t)*24;r.y=(a.fromR+(a.target-a.fromR)*t)*24;bodyY=(l.y+r.y)/2-12;}
  if(a.kind==='jump'){const p=Math.max(0,Math.min(1,(age-6)/30));bodyY=a.fromL*24-12+72*p+Math.sin(p*Math.PI)*18;l.y=r.y=bodyY+17;l.free=r.free=true;if(age>36){l.y=r.y=a.target*24;bodyY=a.target*24-12+Math.sin((age-36)/9*Math.PI)*3;}}
  if(a.kind==='recovery'){bodyY=(a.fromL+a.fromR)*12-12+((a.target*24-12)-((a.fromL+a.fromR)*12-12))*Math.min(1,t*1.6);bodyX=center(a.fromCol)+(center(a.dest)-center(a.fromCol))*t;l.y=r.y=bodyY+12;l.x=bodyX-8;r.x=bodyX+8;l.free=r.free=true;}
 }for(const h of this.lost){const v=h==='L'?l:r;v.y=bodyY-3;v.free=true;}this.hands={L:l,R:r};this.body={x:bodyX,y:bodyY};}
 routeSafe(event){ // time-expanded lateral escape: 24-tick edges, both departure and arrival windows checked.
  const warning=event.kind==='plush'?C.plushWarning:event.kind==='ribbon'?C.ribbonWarning:C.curtainWarning;const frontier=[{col:this.col,t:0}];const seen=new Set();while(frontier.length){const n=frontier.shift();if(n.col!==event.col&&this.window(this.row,n.col,false,this.tick+n.t))return true;for(const d of [-1,1]){const c=n.col+d,t=n.t+24,key=c+':'+t;if(t>warning||seen.has(key))continue;let safe=true;for(let dt=0;dt<=24;dt++){if(!this.window(this.row,c,false,this.tick+n.t+dt)||dt<15&&!this.window(this.row,n.col,true,this.tick+n.t+dt))safe=false;}if(!safe)continue;seen.add(key);frontier.push({col:c,t});}}return false;
 }
 direct(){
  if(!this.hazards||this.mode==='ROOF'||this.tick<300||this.tick<this.safeUntil||this.state==='RECOVERY'||this.action?.kind==='jump'||this.jumpPad())return;
  const live=this.objects.filter(o=>o.kind!=='star'&&!o.dead&&!o.fadeAt),fi=FLOORS.indexOf(floorAt(this.row));
  // Boss attacks and residents take turns. No new window trap during the boss fight.
  const bossRest=this.boss&&this.boss.phase==='REST'&&!this.boss.attack;
  if(this.boss&&!bossRest)return;
  if(live.length>=C.hazardMax)return;
  if(!this.boss&&this.tick-this.lastWindow>=C.windowInterval&&live.filter(o=>o.kind==='curtain').length<2){
   const row=Math.max(this.rowL,this.rowR)+1,col=this.hazardSerial%3===2?Math.max(0,Math.min(5,this.col+(this.col<3?1:-1))):this.col;
   if(!JUMPS.some(p=>p.row===row&&p.col===col)&&!live.some(o=>o.kind==='curtain'&&o.row===row&&o.col===col)&&this.routeSafe({kind:'curtain',col})){
    const id='window-'+(++this.hazardSerial);this.objects.push({id,kind:'curtain',row,col,start:this.tick+C.windowLead,age:-C.windowLead,cycles:C.windowCycles,warning:C.curtainWarning});this.lastWindow=this.tick;this.emit('windowWarn');return;
   }
  }
  if(this.tick-this.lastHazard<C.hazardInterval||live.some(o=>o.kind!=='curtain')||this.boss&&this.residentFloors.has(fi))return;
  const col=this.hazardSerial%3===0?this.col:Math.max(0,Math.min(5,this.col+(this.col<3?1:-1))),kind=this.hazardSerial%7===6?'plush':'ribbon';if(!this.routeSafe({kind,col}))return;
  const end=FLOORS[fi+1]?.row??49,sourceRow=Math.min(end-1,this.row+4),y=sourceRow*24-4;
  if(y<this.body.y+24||!this.window(sourceRow,col))return;
  const id='resident-'+(++this.hazardSerial);this.objects.push({id,kind,col,sourceRow,residentFloor:fi,resident:true,start:this.tick,age:0,y,prevY:y,warning:kind==='plush'?C.plushWarning:C.ribbonWarning,threatened:col===this.col,moved:false});this.lastHazard=this.tick;this.residentFloors.add(fi);this.emit(kind==='plush'?'warnLarge':'warnSmall');
 }
 hazardsTick(){let miss=false;for(const o of this.objects){o.age=this.tick-o.start;if(o.fadeAt&&this.tick>=o.fadeAt){o.dead=true;continue;}if(o.kind==='curtain'){if(o.age>=(o.cycles?C.windowPeriod*o.cycles:180)||o.cycles&&o.row<this.row-3){o.dead=true;continue;}if((o.cycles?o.age%C.windowPeriod:o.age)===72&&this.tick>=this.safeUntil&&this.action?.kind!=='jump'&&this.state!=='RECOVERY')for(const h of ['L','R'])if(this['row'+h]===o.row&&this.col===o.col){this.lost.add(h);this.lostHazard=o.id;this.graceUntil=this.tick+36;}continue;}if(o.resident&&o.age<o.warning&&!this.window(o.sourceRow,o.col)){o.dead=true;continue;}if(o.age<o.warning)continue;o.prevY=o.y;o.y-=o.kind==='star'?1.2:o.kind==='plush'?2.4:2;}
  if(this.lost.size===2||this.lost.size&&this.tick>=this.graceUntil){miss=this.hit(true);this.lost.clear();}
  const b=this.body;for(const o of [...this.objects].sort((a,b)=>(b.kind==='plush')-(a.kind==='plush'))){if(o.dead||o.kind==='curtain'||o.kind==='star'||o.age<o.warning||o.fadeAt)continue;const half=o.kind==='plush'?9:4;const overlap=Math.abs(center(o.col)-b.x)<=half+5&&o.y-half<=b.y+12&&o.prevY+half>=b.y-12;
   if(overlap&&this.tick>=this.safeUntil&&!(this.action?.kind==='jump'&&this.action.age>=6)&&this.mode!=='ROOF'&&this.state!=='RECOVERY'){o.dead=true;if(o.kind==='ribbon'&&this.state==='BRACE'){this.avoid(o);this.emit('guardHit');}else miss=this.hit(o.kind==='plush')||miss;}
   if(!o.dead&&!o.passed&&o.y+half<b.y-12){o.passed=true;if(o.threatened&&o.moved&&this.tick>=this.safeUntil&&this.action?.kind!=='jump'&&this.state!=='RECOVERY')this.avoid(o);}if(o.y<b.y-260)o.dead=true;
  }this.objects=this.objects.filter(o=>!o.dead);return miss;
 }
 collect(){if(!this.collectibles||this.state==='RECOVERY'||this.action?.kind==='jump'||this.mode==='ROOF')return;let cards=CARDS;if(this.encore){const block=Math.floor((this.row-48)/24);cards=[6,12,18].map((n,i)=>({id:'encoreCard-'+block+'-'+n,row:48+block*24+n,col:[2,3,1][i],category:8}));}
  for(const c of cards)if(!this.ids.has(c.id)&&Math.hypot(center(c.col)-this.body.x,c.row*24-12-this.body.y)<=10){this.award(100,'card',c.id);if(c.category<8)this.categories.add(c.category);if(this.categories.size===8)this.award(400,'collection','allCategories');}
  for(const o of this.objects)if(o.kind==='star'&&o.age>=o.warning&&Math.hypot(center(o.col)-this.body.x,o.y-this.body.y)<=8){this.award(30,'star',o.id);o.dead=true;}
 }
 showers(){for(const row of [20,32])if(!this.encore&&this.row>=row&&!this.ids.has('shower-'+row)){this.ids.add('shower-'+row);if(this.row<=row+2)this.showerQueue.push({row,id:'shower-'+row,count:0,at:this.tick});}
  const s=this.showerQueue[0];if(!s)return;if(this.row>s.row+5||this.tick-s.at>240){this.showerQueue.shift();return;}if(this.objects.some(o=>o.kind!=='star')||this.tick-this.lastStar<30)return;this.lastStar=this.tick;this.objects.push({id:s.id+'-'+s.count,kind:'star',col:[2,3,2][s.count],y:this.body.y+120,prevY:this.body.y+120,start:this.tick,age:0,warning:0});if(++s.count>=3)this.showerQueue.shift();}
 update(){if(this.finished||this.invalidReason)return;this.tick++;if(!this.practice&&this.tick>=C.totalTicks){this.finished=true;this.mode='RESULT';this.action=null;this.guard=false;this.emit('timeup');return;}
  const due=this.queue.filter(i=>i.tick<=this.tick);this.queue=this.queue.filter(i=>i.tick>this.tick);const sw=due.find(i=>i.type==='jump'||i.type==='shift');const taps=due.filter(i=>i.type==='tap');for(const i of due){this.inputLog.push(i);const accept=i.type==='guard'||(sw?i===sw:!(taps.length>1&&new Set(taps.map(v=>v.hand)).size>1));if(accept)this.intent(i);}
  const completed=this.advanceAction();this.pose();const bossMiss=bossTick(this);this.direct();const ordinaryMiss=this.hazards?this.hazardsTick():false;const miss=bossMiss||ordinaryMiss;
  if(!miss){this.collect();if(completed==='normal')this.resolveRows();else if(completed?.kind==='jump'){this.resolveRows(true);this.award(150,'jump',completed.id);}}
  if(this.finished){this.pose();return;}
  if(this.guard&&!this.action&&this.state!=='RECOVERY'&&this.mode!=='ROOF'&&!this.lost.size){if(this.rowL!==this.rowR)this.start('brace',6,{target:this.row});else if(this.state!=='BRACE'){this.state='BRACE';this.emit('brace');}}
  if(this.guard&&this.action?.kind==='shift'&&this.tick>this.guardExpires)this.guard=false;
  if(!this.action&&this.buffer){const i=this.buffer;this.buffer=null;this.intent(i);}if(this.hazards)this.showers();this.pose();
 }
 snapshot(){return{ruleVersion:C.ruleVersion,courseId:C.courseId,seed:this.seed,tick:this.tick,rowL:this.rowL,rowR:this.rowR,col:this.col,high:this.high,score:this.score,combo:this.combo,mode:this.mode,state:this.state,roofAtMs:this.roofAtMs,ledger:this.ledger,categories:[...this.categories],misses:this.misses,boss:this.boss?structuredClone(this.boss):null,invalidReason:this.invalidReason};}
 checksum(){return hash(this.snapshot());}
 interrupt(reason){this.invalidReason=reason;this.finished=true;this.mode='RESULT';this.action=null;this.guard=false;}
}





