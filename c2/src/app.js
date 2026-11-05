import {initLanguage} from './i18n.js';
import {drawFrontLogo,drawFrontScene} from './front.js';
import {logoReady} from './logo.js';
import {Typography} from './typography.js';
import {Ending,isClear,drawEnding} from './ending.js';
import {C,FLOORS,floorAt,multiplier} from './map.js';
import {Game} from './core.js';import {Renderer} from './render.js';import {bindInput} from './input.js';import {AudioDirector} from './audio.js';import {LocalSessionAdapter} from './session.js';
initLanguage();
const $=id=>document.getElementById(id),canvas=$('canvas'),overlay=$('overlay'),type=new Typography($('textCanvas')),renderer=new Renderer(canvas,type),audio=new AudioDirector();let adapter;try{adapter=new LocalSessionAdapter();}catch{adapter=new LocalSessionAdapter(null);}
let game=new Game({practice:true,hazards:false}),phase='TITLE',start=0,last=performance.now(),readyAt=0,eventIndex=0,session=null,tutorialStep=0,practiceLast=last,lagSince=0,qaAuto=false,resultAt=0,lastCount=0,recording=null,recorder=null;
let ending=null,endingPreview=false;
const canPlay=()=>phase==='PLAY'||phase==='TUTORIAL'||phase==='BOSS_PRACTICE';
const controls=bindInput({L:$('left'),R:$('right')},(type,data)=>game.enqueue(type,data,phase==='PLAY'?Math.max(game.tick+1,Math.ceil((performance.now()-start)*.06)):game.tick+1),canPlay,()=>audio.unlock());
$('sound').onclick=()=>{$('sound').textContent=audio.toggle()?'音 ON':'音 OFF';};$('sound').textContent=audio.muted?'音 OFF':'音 ON';
function panel(html){overlay.innerHTML='<div class="panel">'+html+'</div>';}
function practiceBoss(){$('game').classList.remove('title-screen');audio.unlock();audio.stop();controls.clear();game=new Game({practice:true,hazards:true,collectibles:false});game.setRows(42,2);game.high=42;game.tick=400;game.pose();phase='BOSS_PRACTICE';eventIndex=0;practiceLast=performance.now();renderer.camera=game.body.y-80;overlay.innerHTML='';$('skip')?.remove();const b=document.createElement('button');b.id='skip';b.textContent='本番へ';b.setAttribute('aria-label','ボス練習を終えて本番へ');$('area').append(b);b.onclick=()=>{b.remove();ready();};}
function title(){ending=null;endingPreview=false;$('endingNext')?.remove();$('skip')?.remove();$('game').classList.remove('ending');$('game').classList.add('title-screen');phase='TITLE';audio.stop();controls.clear();game=new Game({practice:true,hazards:false});eventIndex=0;renderer.camera=-60;
 overlay.innerHTML='<div class="front-panel tower-front"><h1>登頂大作戦</h1><p class="front-catch">新橋のエンタメビルを登りきれ。</p><div class="tower-scene"><canvas id="frontScene" width="240" height="292" aria-label="屋上のグランハマーロゴから1階の入口まで、全8階のビルと登る主人公"></canvas></div><button id="start" class="front-start">ゲームスタート</button><button id="howto" class="front-how">遊び方を見る</button><div class="front-credit">GameBull <span>v2.22</span></div></div>';
 drawFrontScene($('frontScene'));$('start').onclick=()=>{qaAuto=false;ready();};$('howto').onclick=howto;
}
function howto(){phase='HOWTO';controls.clear();overlay.innerHTML='<div class="front-panel how-panel"><div class="front-kicker">HOW TO PLAY</div><h1>遊び方</h1><div class="how-row"><span class="how-icon">L R</span><div><b>交互にタップ</b><p>左・右を交互にタップ。<br>手で窓をつかんで登る。</p></div></div><div class="how-row"><span class="how-icon">← →</span><div><b>横スワイプで移動</b><p>どちらのボタンでもOK。<br>左右になぞって移動。</p></div></div><div class="how-row"><span class="how-icon">L+R</span><div><b>両押しで踏ん張る</b><p>両ボタンを長押し。<br>小物を防いで踏ん張る。<br>大きな星やボスは横へ。</p></div></div><div class="how-row"><span class="how-icon">↑</span><div><b>光る窓で上スワイプ</b><p>光る窓をつかんだら、<br>上になぞって3段上へ。</p></div></div><p class="how-note">窓が閉じると手の支持を失う。<br>片手になったら横へ移るか、離れた手でつかみ直す。</p><p class="how-note">残り10秒で警告音が鳴ります。</p><button id="howStart" class="front-start">ゲームスタート</button><button id="howBack" class="front-how">タイトルへ戻る</button></div>';$('howStart').onclick=()=>{qaAuto=false;ready();};$('howBack').onclick=title;}
function ready(){$('game').classList.remove('title-screen');$('hint').textContent='';ending=null;endingPreview=false;$('endingNext')?.remove();$('skip')?.remove();$('game').classList.remove('ending');audio.unlock();audio.stop();controls.clear();game=new Game();session=adapter.startSession();phase='READY';readyAt=performance.now();lastCount=0;eventIndex=0;renderer.camera=-60;overlay.innerHTML='';$('countdown').hidden=false;}
function practice(){$('game').classList.remove('title-screen');audio.unlock();controls.clear();game=new Game({practice:true,hazards:false,collectibles:false});phase='TUTORIAL';tutorialStep=0;eventIndex=0;practiceLast=performance.now();overlay.innerHTML='';renderer.camera=-60;const b=document.createElement('button');b.id='skip';b.textContent='本番へ';b.setAttribute('aria-label','練習を終えて本番へ');$('area').append(b);b.onclick=()=>{b.remove();ready();};}
function tutorial(){if(tutorialStep===-1)return '動作検証：左右交互の引き上げ';let hint=['① 左右交互に4回タップ','② 左手か右手ボタン上で横スワイプ','③ 両方のボタンを同時に長押し','④ 光る窓で左右どちらかのボタンを上スワイプ'][tutorialStep];if(tutorialStep===0&&game.row>=2){tutorialStep=1;game.tutorialCol=game.col;}if(tutorialStep===1&&game.col!==game.tutorialCol&&!game.action)tutorialStep=2;if(tutorialStep===2&&game.state==='BRACE'){tutorialStep=3;game.guard=false;game.state='HOLD';game.setRows(16,2);game.high=16;game.pose();renderer.camera=game.body.y-80;}if(tutorialStep===3&&game.row>=19){$('skip')?.remove();ready();}return hint;}
function startEnding(preview=false){$('game').classList.remove('title-screen');
 ending=new Ending();endingPreview=preview;phase='ENDING';controls.clear();audio.stop();eventIndex=game.events.length;overlay.innerHTML='';$('skip')?.remove();$('game').classList.add('ending');$('countdown').hidden=true;
 canvas.setAttribute('aria-label','GAME CLEAR！ 屋上の星が点灯、ハマシシと仲間の登頂祭');
 $('hint').textContent='GAME CLEAR！ 登頂おめでとう！';
 const b=document.createElement('button');b.id='endingNext';b.className='primary';b.textContent=preview?'タイトルへ':'結果を見る';b.disabled=true;document.querySelector('footer').append(b);
 b.onclick=()=>{if(ending?.skip())finishEnding();};
 audio.start(()=>ending.ms/1000,false,true);
}
function finishEnding(){if(phase!=='ENDING')return;$('endingNext')?.remove();$('game').classList.remove('ending');audio.stop();if(endingPreview){title();return;}resultAt=performance.now();result();}
function previewEnding(){audio.unlock();qaAuto=false;game=new Game({practice:true,hazards:false,collectibles:false});game.setRows(47,2);game.rowL=48;game.high=47;game.tick=2700;game.pose();game.enqueue('tap',{hand:'R'});for(let i=0;i<C.handTicks;i++)game.update();startEnding(true);}
function result(){if(phase==='RESULT')return;phase='RESULT';$('hint').textContent=isClear(game)?'登頂成功！':game.invalidReason?'中断・記録対象外':'TIME UP';$('game').classList.remove('ending');controls.clear();audio.start(()=>Math.max(0,(performance.now()-resultAt)/1000),true);const snapshot=game.snapshot();adapter.submitResult({...snapshot,...session,checksum:game.checksum(),inputLog:game.inputLog});const f=floorAt(game.high),labels=['1F 食','2F 食','SHOW','CAFE','GAME','文化','RELAX','茶菓'];const totals={};for(const e of game.ledger)totals[e.category]=(totals[e.category]||0)+e.amount;
 const scoreRows=[['登る・コンボ',totals.height||0],['アイテム',(totals.card||0)+(totals.star||0)+(totals.collection||0)],['回避・ジャンプ',(totals.avoid||0)+(totals.jump||0)],['ミス '+game.misses+'回',(totals.penalty||0)+(totals.smallPenalty||0)],['登頂ボーナス',totals.roof||0],['残り時間ボーナス',totals.timeBonus||0]];const summary='<table class="score-breakdown" aria-label="得点内訳">'+scoreRows.map(([label,value])=>'<tr><th scope="row">'+label+'</th><td>'+(value>0?'+':'')+value+'</td></tr>').join('')+'</table>';
 panel('<div class="eyebrow">'+(game.roofAtMs!==null?'GAME CLEAR! · 登頂成功':game.invalidReason?'中断 · 記録対象外':'TIME UP · 60秒チャレンジ終了')+'</div><div class="score">'+game.score.toString().padStart(5,'0')+'</div>'+summary+'<p><b>'+game.high+'段 · '+f.name+'</b><br>'+(game.roofAtMs!==null?'登頂 '+(game.roofAtMs/1000).toFixed(3)+'秒':'次は、もう一段上へ！')+'</p><div class="tags">'+labels.map((l,i)=>(game.categories.has(i)?'●':'○')+l).join(' ')+'</div>'+(game.invalidReason?'<p>中断されたため記録対象外<br>'+game.invalidReason+'</p>':'')+'<button id="retry" class="primary">もう一度</button><a id="floorLink" href="https://grandhammer.jp/floor-guide/'+f.url+'/" target="_blank" rel="noopener noreferrer">フロアを見る ↗</a><p class="tiny">'+f.description+'</p><details><summary>得点内訳・プレイ記録</summary><table>'+Object.entries(totals).map(([k,v])=>'<tr><td>'+({height:'新段・コンボ',card:'カード',star:'小星',collection:'全カテゴリ',jump:'ジャンプ',roof:'屋上',avoid:'回避・ガード',penalty:'大ミス',smallPenalty:'小ミス',timeBonus:'残り時間ボーナス'}[k]||k)+'</td><td>'+v+'</td></tr>').join('')+'<tr><td>合計</td><td>'+game.ledger.reduce((n,e)=>n+e.amount,0)+'</td></tr></table></details><button id="home" class="secondary">タイトルへ</button>');$('retry').onclick=ready;$('home').onclick=title;if(recorder?.state==='recording')setTimeout(()=>recorder.stop(),1000);}
function download(data,name,mime){const url=URL.createObjectURL(data instanceof Blob?data:new Blob([data],{type:mime}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);}
function automatic(){if(!qaAuto||game.action||game.state==='RECOVERY'||game.mode==='ROOF'||game.finished)return;const bossAttack=game.boss?.attack;if(bossAttack&&bossAttack.col===game.col&&game.boss.phase==='WARNING'){game.enqueue('guard',{on:false});game.enqueue('shift',{direction:game.col<3?1:-1});return;}const threat=game.objects.find(o=>o.kind!=='curtain'&&o.kind!=='star'&&o.col===game.col&&!o.passed&&o.y>game.body.y-20);if(threat){game.enqueue('guard',{on:false});const dirs=game.col<3?[1,-1]:[-1,1];const d=dirs.find(d=>game.window(game.row,game.col+d));if(d)game.enqueue('shift',{direction:d});return;}if(game.jumpPad()){game.enqueue('jump');return;}const hand=game.rowL<=game.rowR?'L':'R';if(game.window(game['row'+hand]+1,game.col))game.enqueue('tap',{hand});else{const d=[-1,1].find(d=>game.window(game.row,game.col+d));if(d)game.enqueue('shift',{direction:d});}}
function frame(now){const elapsedMs=Math.max(0,now-last),dt=Math.min(.1,elapsedMs/1000);last=now;controls.g.hold(now);if(phase==='READY'){const elapsed=(now-readyAt)/1000,n=3-Math.floor(elapsed);if(n>0){$('countdown').textContent=n;if(n!==lastCount){audio.event('count');lastCount=n;}}else{$('countdown').hidden=true;phase='PLAY';start=readyAt+3000;lagSince=0;audio.start(()=>Math.max(0,(performance.now()-start)/1000));}}
 if(phase==='PLAY'){const target=Math.min(3600,Math.floor((now-start)*.06)),behind=target-game.tick;if(behind>15){lagSince||=now;if(now-lagSince>250)game.interrupt('処理遅延が継続しました');}else lagSince=0;for(let n=0;game.tick<target&&!game.finished&&n<120;n++){automatic();game.update();}if(game.finished){if(isClear(game))startEnding();else{resultAt=now;phase='TIMEUP';audio.stop();controls.clear();$('hint').textContent='TIME UP';}} }
 else if(phase==='TUTORIAL'||phase==='BOSS_PRACTICE'){const practiceHz=phase==='TUTORIAL'&&tutorialStep===-1?12:60;const n=Math.min(8,Math.floor((now-practiceLast)*practiceHz/1000));for(let i=0;i<n;i++){if(tutorialStep===-1&&phase==='TUTORIAL'){automatic();}game.update();}practiceLast+=n*1000/practiceHz;$('hint').textContent=phase==='TUTORIAL'?tutorial():game.finished?'練習クリア！ 本番に挑戦しよう':'ボス練習';}
 if(phase==='ENDING'){if(!document.hidden)ending.advance(elapsedMs);$('endingNext').disabled=ending.ms<1000;$('hint').textContent=ending.ms>=4000?'大入・登頂達成！ おめでとう！':ending.ms>=2000?'ハマシシと仲間が祝福！':ending.ms>=1000?'屋上の星を点灯！':'GAME CLEAR！ 登頂おめでとう！';if(ending.done)finishEnding();}
 if(phase==='TIMEUP'&&now-resultAt>=2000)result();
 for(;eventIndex<game.events.length;eventIndex++)audio.event(game.events[eventIndex].type);
 audio.pendingFloor=FLOORS.indexOf(floorAt(game.row));if(phase==='PLAY'){const remaining=60-game.tick/60;const sec=Math.ceil(remaining);const next=game.rowL>game.rowR?'R':game.rowR>game.rowL?'L':null;for(const h of ['L','R'])$(h==='L'?'left':'right').classList.toggle('next',next===h);$('hint').textContent=game.lost.size?'片手！':game.state==='BRACE'?'踏ん張り中':game.tick<game.safeUntil?'SAFE':'';}
 $('time').textContent=String(game.practice?60:Math.max(0,Math.ceil((3600-game.tick)/60))).padStart(2,'0');$('score').textContent=String(game.score).padStart(5,'0');$('height').innerHTML=game.high+'<small>段</small>';$('floor').textContent=game.encore?'ENCORE · LED SHOW':floorAt(game.row).short;$('multiplier').textContent='×'+multiplier(game.combo).toFixed(2);$('game').classList.toggle('last10',phase==='PLAY'&&!game.practice&&game.tick>=3000);if(phase==='ENDING'||phase==='RESULT'&&isClear(game))drawEnding(canvas,ending?.ms??9000,type);else{canvas.setAttribute('aria-label','左右の手で窓を登るゲーム');renderer.draw(game,dt);}requestAnimationFrame(frame);}
function resize(){const box=$('play').getBoundingClientRect();canvas.height=Math.max(120,Math.round(box.height/(box.width/240)));type.resize(box.width,box.height,canvas.height,window.devicePixelRatio||1);}new ResizeObserver(resize).observe($('play'));
document.addEventListener('visibilitychange',()=>{if(document.hidden){controls.clear();if(phase==='PLAY')game.interrupt('タブが非表示になりました');audio.stop();}else if(phase==='ENDING'){last=performance.now();audio.start(()=>ending.ms/1000,false,true);}else if(phase==='TUTORIAL'||phase==='BOSS_PRACTICE')practiceLast=performance.now();});window.addEventListener('blur',()=>controls.clear());
if(new URLSearchParams(location.search).has('qa')){const q=document.createElement('aside');q.id='qa';q.innerHTML='<button id="qaToggle" aria-label="検証パネル開閉">閉</button>開発検証（自動入力）<button id="auto">60秒自動実演</button><button id="record">録画して自動実演</button><button id="debug">支持点表示</button><button id="endingPreview">エンディング検証</button><button id="finishTest">登頂→結果の検証</button><button id="timeTest">時間切れ検証</button><button id="interruptTest">中断画面検証</button><button id="armTest">腕の動作検証</button><button id="alertTest">残り10秒の警告音検証</button><a id="video"></a>';document.body.append(q);$('qaToggle').onclick=()=>{q.classList.toggle('folded');$('qaToggle').textContent=q.classList.contains('folded')?'検':'閉';};$('auto').onclick=()=>{qaAuto=true;ready();};$('record').onclick=()=>{const chunks=[];recorder=new MediaRecorder(canvas.captureStream(30));recorder.ondataavailable=e=>chunks.push(e.data);recorder.onstop=()=>{recording=new Blob(chunks,{type:recorder.mimeType});const a=$('video');a.href=URL.createObjectURL(recording);a.download='grandhammer-v2-demo.webm';a.textContent='録画を保存';};recorder.start();qaAuto=true;ready();};$('endingPreview').onclick=previewEnding;$('finishTest').onclick=()=>{audio.unlock();adapter=new LocalSessionAdapter(null);session=adapter.startSession();game=new Game({hazards:false,collectibles:false});game.setRows(47,2);game.rowL=48;game.high=47;game.tick=2700;game.pose();eventIndex=0;phase='PLAY';qaAuto=true;endingPreview=false;ending=null;last=performance.now();start=last-45000;lagSince=0;overlay.innerHTML='';$('countdown').hidden=true;$('endingNext')?.remove();$('game').classList.remove('ending');};$('timeTest').onclick=()=>{adapter=new LocalSessionAdapter(null);ready();game.tick=3599;$('countdown').hidden=true;phase='PLAY';start=performance.now()-60000;last=performance.now();qaAuto=false;};$('interruptTest').onclick=()=>{adapter=new LocalSessionAdapter(null);ready();game.interrupt('タブが非表示になりました');$('countdown').hidden=true;resultAt=performance.now();result();};$('armTest').onclick=()=>{practice();tutorialStep=-1;qaAuto=true;game.setRows(5,2);game.high=5;game.pose();renderer.camera=game.body.y-80;};$('alertTest').onclick=()=>{audio.unlock();audio.stop();adapter=new LocalSessionAdapter(null);ready();game=new Game({hazards:false,collectibles:false});game.tick=2940;game.setRows(10);game.high=10;game.pose();phase='PLAY';qaAuto=false;last=performance.now();start=last-49000;lagSince=0;eventIndex=0;$('countdown').hidden=true;audio.start(()=>Math.max(0,(performance.now()-start)/1000));};$('debug').onclick=()=>renderer.debug=!renderer.debug;window.GH_QA={get game(){return game;},get phase(){return phase;},get recording(){return recording;}};}
Promise.all([document.fonts.load('16px "DotGothic16"'),logoReady]).then(()=>{title();resize();document.body.classList.add('pixel-ready');requestAnimationFrame(frame);});

// GameBull hooks into the client's game. Appended at build time to the end of THEIR src/app.js (the build writes
// their file + this file as the shipped src/app.js; every other client file ships byte for byte), so this code
// shares their module scope: their top-level lets (game, phase, start, qaAuto, resultAt...) and their function
// declarations (title, ready, result, frame...) are reachable here, and a function declaration is a mutable binding,
// so `frame = function(){...}` wraps theirs. Everything sits in one block so no name of theirs is redeclared.
// The GameBull shell (main.tsx, a module) talks only to window.GHClient below.
//
// A GameBull run (tournament / Score Challenge / solo / room), the client's design kept:
//  - their own start: ready() = their ゲームスタート (their fixed course HAMADON_60 and seed, their 3-2-1, their 60 s,
//    their music). The course is the same for every player (their design); the GameBull seed is only logged;
//  - a challenge time limit shorter than their 60 s starts their clock with the difference already used (their tick
//    counter, time display, time bonus and music offset all follow);
//  - their own end paths, unchanged: 60 s up (their TIME UP and sound), the roof (their GAME CLEAR ending, then the
//    board), and their own interruption (the tab hidden, or the device too slow: their 中断・記録対象外). GameBull adds
//    only the challenge target: the run locks when their score reaches it, board 0.9 s later;
//  - their result screen and their local TOP10 (adapter.submitResult) are replaced by the GameBull board;
//  - score = their game.score = the sum of their ledger (their 0 floor), board rows = their own result rows.
import { getLanguage as __ghLanguage } from './i18n.js';
{
  const hooks = { onLock: null, onZero: null, onPlaying: null, onEnd: null, onLang: null };   // set by the shell
  const RUN = C.totalTicks / C.hz;   // their 60 s (map.js totalTicks 3600 at 60 Hz)
  let R = null;                      // the current GameBull run, null under the lobby
  let lastFacts = null;              // the last run's facts
  const log = s => console.log('[GH-GB] ' + s);

  // ---- their functions, wrapped ----
  // Their frame loop (requestAnimationFrame(frame) looks the binding up on every frame, so this wrapper is the loop).
  const clientFrame = frame;
  frame = function (now) {
    const before = phase;
    clientFrame(now);
    if (!R || R.ended) return;
    // Their 3-2-1 is over: their PLAY phase starts here. A shorter challenge limit = the difference used up front.
    if (before === 'READY' && phase === 'PLAY' && R.startedAt < 0) {
      if (R.offsetTicks > 0) { start -= R.offsetTicks * 1000 / C.hz; game.tick = R.offsetTicks; audio.start(() => Math.max(0, (performance.now() - start) / 1000)); }
      R.startedAt = performance.now();
      log('Their 3-2-1 is over: the run is live, ' + Math.ceil((C.totalTicks - game.tick) / C.hz) + ' s on their clock' + (R.offsetTicks ? ' (' + R.offsetTicks / C.hz + ' s of their 60 s used up front).' : '.'));
      hooks.onPlaying && hooks.onPlaying();
    }
    if (R.locked) return;
    if (phase === 'PLAY' && R.target > 0 && game.score >= R.target) {
      // Challenge target: freeze the climb where it is (nothing scores after this), board 0.9 s later.
      R.locked = true; R.lockTick = game.tick;
      game.finished = true; game.action = null; game.guard = false; game.queue = [];
      phase = 'GB_LOCKED'; audio.stop(); controls.clear(); $('hint').textContent = '';
      log('Challenge target ' + R.target + ' reached at ' + game.score + ' (tick ' + game.tick + '); ending in 0.9 s.');
      hooks.onLock && hooks.onLock('target');
      setTimeout(() => end('target'), 900);
    } else if (phase === 'ENDING') {
      // Their roof: GAME CLEAR. Their ending (lit star, Hamashishi festival, fanfare) plays, then their result() call.
      R.locked = true; R.lockTick = game.tick;
      log('Their roof reached at ' + (game.roofAtMs / 1000).toFixed(3) + ' s: their GAME CLEAR ending plays, then the board.');
      hooks.onLock && hooks.onLock('clear');
    } else if (phase === 'TIMEUP') {
      R.locked = true; R.lockTick = game.tick;
      if (game.invalidReason) {
        // Their own interruption (tab hidden / processing lag): their run ends at once; their score so far is shown.
        log('Their run was interrupted (' + game.invalidReason + ') at ' + game.score + ': board now (their own rule: 中断).');
        hooks.onLock && hooks.onLock('interrupt');
        end('interrupt');
      } else {
        log('Their clock is at 0: run locked at ' + game.score + ' (their TIME UP).');
        hooks.onLock && hooks.onLock('clock');
        const after = () => end('time');
        if (hooks.onZero) hooks.onZero(after); else setTimeout(after, 700);
      }
    }
  };
  // Their result screen (and their local TOP10 save) is replaced by the GameBull board during a run. Their ending's
  // 結果を見る button / its own end calls this: that is the end of a cleared run.
  const clientResult = result;
  result = function () {
    if (!R) return clientResult();
    phase = 'RESULT';   // their own state after result(): their frame loop stops asking for it (their ending's button is gone)
    $('hint').textContent = '';
    if (!R.ended) end(game.roofAtMs !== null ? 'clear' : game.invalidReason ? 'interrupt' : 'time');
  };
  // Their title screen is only ever their state under the lobby: never re-entered while a run is on.
  const clientTitle = title;
  title = function () { if (R) return; return clientTitle(); };

  // Their own deterministic replay (tests/replay.test.mjs: a fresh Game fed the same input log), run before the
  // score goes to GameBull: logged, never blocking.
  function replay() {
    try {
      const g = new Game();
      g.tick = R.offsetTicks;
      for (const i of game.inputLog) g.enqueue(i.type, i, i.tick);
      while (!g.finished && g.tick < R.lockTick) g.update();
      return g.score === game.score ? 'replay ok (score ' + g.score + ')' : 'replay MISMATCH: live ' + game.score + ', replay ' + g.score;
    } catch (e) { return 'replay failed: ' + e.message; }
  }

  function end(reason) {
    if (!R || R.ended) return;
    R.ended = true; R.locked = true;
    if (R.lockTick < 0) R.lockTick = game.tick;
    audio.stop(); controls.clear();
    // Their result() breakdown: the same ledger categories, the same six rows.
    const totals = {}, counts = {};
    for (const e of game.ledger) { totals[e.category] = (totals[e.category] || 0) + e.amount; counts[e.category] = (counts[e.category] || 0) + 1; }
    const t = k => totals[k] || 0, n = k => counts[k] || 0;
    const f = {
      reason, total: game.score, high: game.high, floor: floorAt(game.high).name,
      climb: t('height'), items: t('card') + t('star') + t('collection'), dodge: t('avoid') + t('jump'),
      miss: t('penalty') + t('smallPenalty'), roof: t('roof'), timeBonus: t('timeBonus'),
      cards: n('card'), stars: n('star'), allCategories: n('collection') > 0, avoids: n('avoid'), jumps: n('jump'),
      misses: game.misses, roofAtMs: game.roofAtMs, timeLeftMs: game.roofAtMs !== null ? Math.round(t('timeBonus') * 1000 / C.hz) : 0,
      invalidReason: game.invalidReason, ledgerSum: game.ledger.reduce((a, e) => a + e.amount, 0),
      checksum: game.checksum(), playMs: R.startedAt > 0 ? Math.round(performance.now() - R.startedAt) : 0,
    };
    lastFacts = f;
    const check = reason === 'interrupt' ? 'replay skipped (interrupted run)' : replay();
    log('Run end \'' + reason + '\': climb ' + f.climb + ' (' + f.high + ' rows, ' + f.floor + '), items ' + f.items + ' (' + f.cards + ' cards, ' + f.stars + ' stars' + (f.allCategories ? ', all 8 categories' : '') +
      '), dodge/boost ' + f.dodge + ', misses ' + f.miss + ' (' + f.misses + '), roof ' + f.roof + ', time bonus ' + f.timeBonus + '; their score ' + f.total +
      (f.ledgerSum === f.total ? ' (= ledger sum)' : ' != ledger sum ' + f.ledgerSum) + '; checksum ' + f.checksum + '; ' + check + '.');
    hooks.onEnd && hooks.onEnd(f);
  }

  // ---- sound ----
  // The GameBull mute = their own sound button (#sound: their AudioDirector mute, saved under gh-v2-muted; their
  // default is ON). It is clicked, never doubled.
  // iPhone / Safari: Web Audio starts only inside a tap, and Safari does not count an earlier tap once a server call
  // has run. Their own unlock runs on their pad taps; here it also runs on every tap in the GameBull screens (the
  // lobby's Join, the challenge's Start), so their context is already running when their 3-2-1 plays. One silent
  // sample primes iOS; the audio session is "playback" (iOS 16.4+), so the silent switch does not mute the game.
  try { if (navigator.audioSession) { navigator.audioSession.type = 'playback'; log('Audio session set to playback.'); } } catch (e) { /* n/a */ }
  let primedFor = null, unlocked = false;
  function unlockTap() {
    if (audio.muted) return;
    try {
      audio.unlock();                       // their own: creates their context, resume() inside the tap
      const c = audio.ctx; if (!c) return;
      if (primedFor !== c) { primedFor = c; const b = c.createBufferSource(); b.buffer = c.createBuffer(1, 1, 22050); b.connect(c.destination); b.start(0); }
      const ok = () => { if (!unlocked && c.state === 'running') { unlocked = true; log('Game sound unlocked by a tap (Web Audio running).'); } };
      if (c.state === 'running') ok(); else c.resume().then(ok).catch(() => {});
    } catch (e) { /* no Web Audio */ }
  }
  for (const t of ['touchend', 'pointerup', 'click', 'keydown']) document.addEventListener(t, unlockTap, { capture: true, passive: true });

  // ---- language ----
  // Their own EN / 日本語 button (#language, i18n.js, saved under gh-language) switches their whole page. It is the
  // GameBull EN | JP switch too: the shell clicks it to follow the GameBull language, and hears it when it is clicked.
  const langBtn = $('language'), clientLangClick = langBtn.onclick;
  langBtn.onclick = function (e) { clientLangClick.call(this, e); hooks.onLang && hooks.onLang(__ghLanguage()); };

  window.GHClient = {
    hooks,
    // Under the lobby: their own title state (their title(): sounds stopped, a practice game, no run); their title
    // panel is never shown (gamebull.css).
    park() { R = null; qaAuto = false; clientTitle(); },
    // A run = their own start (ready(), as their ゲームスタート does). opt.seconds = run length (their 60 s, or a
    // shorter challenge limit / ?devSeconds); opt.target = challenge target (0 = none); opt.auto = their own QA autoplay
    // (automatic(), localhost ?devAuto=1 only).
    start(opt = {}) {
      const secs = opt.seconds > 0 ? Math.min(RUN, opt.seconds) : RUN;
      if (opt.seconds > RUN) log('Run length ' + opt.seconds + ' s is longer than their 60 s clock; their 60 s is kept.');
      R = { seconds: secs, offsetTicks: Math.round((RUN - secs) * C.hz), target: opt.target || 0, locked: false, ended: false, startedAt: -1, lockTick: -1 };
      lastFacts = null;
      qaAuto = !!opt.auto;
      ready();
      log('Their run is set up: course ' + C.courseId + ', seed ' + C.seed + ', ' + secs + ' s, rules ' + C.ruleVersion + (R.target ? ', challenge target ' + R.target : '') + (qaAuto ? ', their QA autoplay on' : '') + '.');
    },
    score: () => (R && !R.ended ? game.score : lastFacts ? lastFacts.total : 0),
    remaining: () => (R && !R.ended && phase === 'PLAY' ? Math.max(0, (C.totalTicks - game.tick) / C.hz) : 0),
    isRunning: () => !!R && !R.locked && phase === 'PLAY',
    muted: () => !!audio.muted,
    setMuted(v) { if (!!audio.muted !== !!v) $('sound').click(); },
    lang: () => __ghLanguage(),
    setLang(v) { if (__ghLanguage() !== v) langBtn.click(); },
  };
  window.dispatchEvent(new Event('ghclient-ready'));
}
