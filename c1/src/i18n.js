let language='ja';
try{if(globalThis.localStorage?.getItem('gh-language')==='en')language='en';}catch{}
export function setLanguage(value){language=value==='en'?'en':'ja';try{globalThis.localStorage?.setItem('gh-language',language);}catch{}}
export function getLanguage(){return language;}
const dictionary={
'グランハマー CLIMB 60':'GRAND HAMMER CLIMB 60','屋上のグランハマーロゴから1階の入口まで、全8階のビルと登る主人公':'Grand Hammer tower, rooftop sign, eight floors and a climber','GAME CLEAR！ 屋上の星が点灯、ハマシシと仲間の登頂祭':'GAME CLEAR! Rooftop star and Hamashishi celebration',
'登頂大作戦':'CLIMB TO THE TOP', '新橋のエンタメビルを登りきれ。':'Conquer the Shinbashi tower!',
'ゲームスタート':'START GAME','遊び方を見る':'HOW TO PLAY','遊び方':'HOW TO PLAY','タイトルへ戻る':'BACK TO TITLE','タイトルへ':'TITLE','もう一度':'PLAY AGAIN','結果を見る':'RESULTS',
'交互にタップ':'ALTERNATE TAPS','左・右を交互にタップ。':'Tap left, then right.','手で窓をつかんで登る。':'Grip windows to climb.',
'横スワイプで移動':'SWIPE TO MOVE','どちらのボタンでもOK。':'Use either pad.','左右になぞって移動。':'Swipe left or right.',
'両押しで踏ん張る':'HOLD BOTH PADS','両ボタンを長押し。':'Press and hold both pads.','小物を防いで踏ん張る。':'Brace against small objects.','大きな星やボスは横へ。':'Dodge big stars and the boss.',
'光る窓で上スワイプ':'SWIPE UP TO BOOST','光る窓をつかんだら、':'At a glowing window,','上になぞって3段上へ。':'swipe up to rise 3 rows.',
'窓が閉じると手の支持を失う。':'Closing windows break your grip.','片手になったら横へ移るか、離れた手でつかみ直す。':'With one hand left, move sideways or grip again.','残り10秒で警告音が鳴ります。':'An alarm sounds in the last 10 seconds.',
'登る・コンボ':'CLIMB / COMBO','新段・コンボ':'CLIMB / COMBO','アイテム':'ITEMS','回避・ジャンプ':'DODGE / BOOST','登頂ボーナス':'CLEAR BONUS','残り時間ボーナス':'TIME BONUS','得点内訳・プレイ記録':'SCORE DETAILS','得点内訳':'SCORE DETAILS','合計':'TOTAL','カード':'CARDS','小星':'STARS','全カテゴリ':'ALL CATEGORIES','回避・ガード':'DODGE / GUARD','ジャンプ':'BOOST','大ミス':'MAJOR HITS','小ミス':'MINOR HITS',
'TIME UP · 60秒チャレンジ終了':'TIME UP','GAME CLEAR! · 登頂成功':'GAME CLEAR!','登頂成功！':'TOP REACHED!','中断・記録対象外':'STOPPED - NO RECORD','中断 · 記録対象外':'STOPPED - NO RECORD','中断されたため記録対象外':'Stopped: score not recorded.','次は、もう一段上へ！':'Climb higher next time!','フロアを見る ↗':'FLOOR GUIDE ↗',
'処理遅延が継続しました':'Game paused due to performance issues.','タブが非表示になりました':'Game tab was hidden.',
'GAME CLEAR！ 登頂おめでとう！':'GAME CLEAR! WELL DONE!','大入・登頂達成！ おめでとう！':'TOP REACHED! WELL DONE!','ハマシシと仲間が祝福！':'HAMASHISHI CELEBRATES!','屋上の星を点灯！':'LIGHT THE ROOFTOP STAR!',
'グランハマー 登頂祭':'GRAND HAMMER FESTIVAL','大入・登頂達成':'TOP REACHED!','ハマシシも祝福！':'HAMASHISHI CHEERS!','屋上の星を灯そう！':'LIGHT THE STAR!','食・ライブ・遊びの殿堂':'FOOD / LIVE / PLAY','登頂おめでとう！':'CONGRATULATIONS!','星獅子 ハマシシ':'HAMASHISHI','肉球ドン！':'PAW SLAM!','片手！':'ONE HAND!','踏ん張り中':'BRACING',
'屋上／RF レインボースター':'RF RAINBOW STAR','1F シンバシ横丁':'1F SHINBASHI YOKOCHO','1F 武将':'1F BUSHO','2F 亜細亜':'2F ASIA','3F 座・グラン東京':'3F THE GRAND TOKYO','4F グランカフェラウンジ':'4F GRAND CAFE LOUNGE','6F 紅艶・蜜柑・HAMACOM':'6F BENITSUYA / MIKAN','7F O2プラージュ':'7F O2 PLAGE',
'全国各地の食を楽しむ横丁':'Regional Japanese food alleys.','アジアの料理と屋台の活気':'Asian food and lively stalls.','食事とライブショーを楽しむ舞台':'Dining and live shows.','ショーの空気を感じるラウンジ':'A lounge with a showtime mood.','音楽とゲームを楽しむアミューズメントBAR':'Music, games and drinks.','舞踊・会話・歌が重なるフロア':'Dance, conversation and song.','くつろぎの空間':'A place to relax.','和モダンな茶菓と酒の空間':'Japanese tea, sweets and sake.','夜景とDJを楽しむ屋上':'Rooftop views and DJ music.',
'音声切替':'Toggle sound','音 ON':'SOUND ON','音 OFF':'SOUND OFF','左手：タップでつかむ、左右スワイプで移動':'Left hand: tap to grip, swipe to move','右手：タップでつかむ、左右スワイプで移動':'Right hand: tap to grip, swipe to move','左右の手で窓を登るゲーム':'Climb windows with both hands','1F 食':'1F FOOD','2F 食':'2F FOOD','文化':'CULTURE','茶菓':'TEA','段':' ROWS','屋上':'ROOF'
};
const entries=Object.entries(dictionary).sort((a,b)=>b[0].length-a[0].length);
export function translate(value){let s=String(value);if(language==='ja')return s;for(const [ja,en] of entries)s=s.split(ja).join(en);return s.replace(/ミス (\d+)回/g,'HITS $1').replace(/登頂 ([\d.]+)秒/g,'TIME $1s');}
export function initLanguage(){
 const originals=new WeakMap(),attributes=new WeakMap();let observer;
 const excluded=n=>n.parentElement?.closest('script,style,svg,#language,#qa');
 function text(n){if(excluded(n))return;const old=originals.get(n);const source=old&&n.nodeValue===old.output?old.source:n.nodeValue;const output=translate(source);originals.set(n,{source,output});if(n.nodeValue!==output)n.nodeValue=output;}
 function apply(root){if(root.nodeType===3){text(root);return;}if(root.nodeType!==1)return;if(root.matches('script,style,svg,#language,#qa'))return;for(const el of [root,...root.querySelectorAll('[aria-label]')]){if(!el.hasAttribute('aria-label')||el.closest('#language,#qa'))continue;const old=attributes.get(el),now=el.getAttribute('aria-label'),source=old&&now===old.output?old.source:now,output=translate(source);attributes.set(el,{source,output});if(now!==output)el.setAttribute('aria-label',output);}const walk=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);while(walk.nextNode())text(walk.currentNode);}
 const watch=()=>observer.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['aria-label']});
 observer=new MutationObserver(records=>{observer.disconnect();for(const r of records){if(r.type==='childList'){for(const n of r.addedNodes)apply(n);}else{apply(r.target);}}watch();});
 const refresh=()=>{observer.disconnect();document.documentElement.lang=language;document.title=language==='en'?'GRAND HAMMER CLIMB 60':'グランハマー CLIMB 60';document.getElementById('language').textContent=language==='ja'?'EN':'日本語';document.getElementById('language').setAttribute('aria-label',language==='ja'?'Switch to English':'日本語に切り替える');apply(document.body);watch();};
 document.getElementById('language').onclick=()=>{setLanguage(language==='ja'?'en':'ja');refresh();};refresh();
}
