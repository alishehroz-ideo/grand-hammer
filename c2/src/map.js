export const C={gameId:'grandhammer-climb60',ruleVersion:'2.20.0',courseId:'HAMADON_60',seed:19801101,hz:60,totalTicks:3600,handTicks:17,sideTicks:24,jumpTicks:45,roofRow:48,rowPitch:24,colPitch:32,tapMaxMs:180,tapTravel:12,swipeMin:28,axisRatio:1.5,holdMs:160,chordMs:80,bufferTicks:7,guardQueue:15,singleGrace:36,smallTicks:24,largeTicks:72,safeTicks:60,roofTicks:60,ribbonWarning:90,plushWarning:120,ribbonSpeed:2,plushSpeed:2.4,curtainWarning:54,curtainClosing:18,curtainClosed:90,curtainOpening:18,hazardInterval:210,hazardMax:3,windowInterval:240,windowLead:66,windowPeriod:240,windowCycles:2,bossRow:42,bossFloor:39,bossIntro:30,bossWarning:120,bossStrike:12,bossRest:120,bossMaxAttacks:4,rowScore:100,cardScore:100,starScore:30,jumpScore:150,roofScore:3000,timeScorePerTick:1,smallPenalty:50,allScore:400,avoidScore:20,avoidCap:200,penalty:100,bpm:120,bars:30};
export const JUMPS=[{row:16,col:2},{row:28,col:3},{row:40,col:2}];
export const CARDS=[[3,2,0],[6,3,0],[9,3,1],[12,1,1],[17,4,2],[20,2,2],[23,1,3],[25,4,3],[27,2,4],[32,4,4],[35,1,5],[38,3,5],[41,3,6],[43,1,6],[45,4,7],[47,2,7]].map(([row,col,category],i)=>({row,col,category,id:'card-'+i}));
export const FLOORS=[{row:0,name:'1F 武将',short:'1F シンバシ横丁',url:3250,description:'全国各地の食を楽しむ横丁'}, {row:8,name:'2F 亜細亜',short:'2F ASIA',url:2277,description:'アジアの料理と屋台の活気'},{row:14,name:'3F 座・グラン東京',short:'3F 座・グラン東京',url:2046,description:'食事とライブショーを楽しむ舞台'},{row:22,name:'4F グランカフェラウンジ',short:'4F CAFE LOUNGE',url:2155,description:'ショーの空気を感じるラウンジ'},{row:26,name:'5F HAMACLUB',short:'5F HAMACLUB',url:2197,description:'音楽とゲームを楽しむアミューズメントBAR'},{row:34,name:'6F 紅艶・蜜柑・HAMACOM',short:'6F 紅艶・蜜柑・HAMACOM',url:1616,description:'舞踊・会話・歌が重なるフロア'},{row:40,name:'7F O2プラージュ',short:'7F O2プラージュ',url:2083,description:'くつろぎの空間'},{row:44,name:'8F TATAMI',short:'8F TATAMI',url:2237,description:'和モダンな茶菓と酒の空間'},{row:48,name:'屋上／RF レインボースター',short:'RF RAINBOW STAR',url:1952,description:'夜景とDJを楽しむ屋上'}];
export const floorAt=row=>FLOORS.findLast(f=>row>=f.row)||FLOORS[0];
export const center=col=>40+32*col;
export const anchor=(hand,row,col)=>({row,col,x:center(col)+(hand==='L'?-8:8),y:row*24});
export const BASE=[[4,'ribbon',2],[8,'curtain',2,10],[11,'ribbon',3],[15,'curtain',1,17],[18,'ribbon',4],[27,'plush',3],[30,'curtain',4,32],[32,'plush',1],[35,'ribbon',3],[38,'curtain',4,40],[43,'ribbon',1],[46,'curtain',2,47],[6,'ribbon',4],[9,'curtain',1,11],[12,'ribbon',0],[14,'ribbon',5],[17,'curtain',3,19],[20,'ribbon',2],[26,'ribbon',5],[29,'curtain',0,31],[31,'ribbon',4],[34,'ribbon',0],[41,'curtain',1,43],[45,'ribbon',3]].sort((a,b)=>a[0]-b[0]);
export function makeCourse(seed=C.seed){return BASE.map(([triggerRow,kind,col,row],i)=>({id:'hazard-'+i,triggerRow,kind,col:seed===C.seed?col:kind==='curtain'?col:(col+(seed%3))%6,row,status:'pending'}));}
export function multiplier(combo){return combo>=13?1.5:combo>=9?1.25:combo>=5?1.1:1;}
export function hash(value){let h=2166136261;for(const c of JSON.stringify(value)){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return(h>>>0).toString(16);}







