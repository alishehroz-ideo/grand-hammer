import {C} from './map.js';
export const compare=(a,b)=>b.score-a.score||b.high-a.high||(a.roofAtMs===null)-(b.roofAtMs===null)||(a.roofAtMs??Infinity)-(b.roofAtMs??Infinity)||0;
export class LocalSessionAdapter{
 constructor(storage=globalThis.localStorage){this.storage=storage;this.memory=[];}
 startSession({gameId=C.gameId,ruleVersion=C.ruleVersion}={}){return{sessionId:globalThis.crypto?.randomUUID?.()||Date.now()+'-'+(++LocalSessionAdapter.seq),seed:C.seed,courseId:C.courseId,serverStartedAt:null,gameId,ruleVersion,mock:true};}
 getLeaderboard(){try{return JSON.parse(this.storage.getItem('gh-v2-'+C.ruleVersion+'-'+C.courseId)||'[]');}catch{return this.memory;}}
 submitResult(result){const board=this.getLeaderboard();if(board.some(v=>v.sessionId===result.sessionId))return board;const cleared=result.mode==='ROOF'&&result.high===48&&result.rowL===48&&result.rowR===48&&result.tick>0&&result.tick<3600&&result.roofAtMs===result.tick/60*1000;if(result.invalidReason||(!cleared&&result.tick!==3600)||result.ruleVersion!==C.ruleVersion||result.courseId!==C.courseId)return board;const entry={sessionId:result.sessionId,score:result.score,high:result.high,roofAtMs:result.roofAtMs,at:new Date().toISOString()};board.push(entry);board.sort(compare);board.splice(10);this.memory=board;try{this.storage.setItem('gh-v2-'+C.ruleVersion+'-'+C.courseId,JSON.stringify(board));}catch{}return board;}
}LocalSessionAdapter.seq=0;

