export const P={black:'#000000',night:'#07164B',blue:'#1539A6',cyan:'#00BCD4',yellow:'#FFE600',gold:'#E8B83E',shadow:'#9B682B',cream:'#FFF0BE',red:'#F02A28',deep:'#A80F38',pink:'#D933C4',purple:'#713CAD',skin:'#F2B880',white:'#FFFFFF',green:'#1D8B68',brown:'#6D3F27'};
// Original HAMASHISHI: integer-grid red lion, gold mane and forehead star.
export function hamashishi(c,x,y,phase,frame=0){
 // Silhouette and stepped mane. All marks use the existing game's palette.
 rect(c,x-20,y-30,40,6,'black');rect(c,x-30,y-24,60,48,'black');rect(c,x-36,y-14,72,30,'black');
 const mane=phase==='WARNING'&&frame%2?'cream':'yellow';rect(c,x-18,y-28,36,6,mane);rect(c,x-28,y-22,56,44,mane);rect(c,x-34,y-12,68,26,mane);
 for(const side of [-1,1]){rect(c,x+side*24-4,y-18,8,34,'red');rect(c,x+side*30-3,y-4,6,12,'red');rect(c,x+side*18-6,y-24,12,12,'black');rect(c,x+side*18-4,y-22,8,10,'red');rect(c,x+side*18-2,y-20,4,6,'cream');}
 rect(c,x-16,y-20,32,38,'red');rect(c,x-22,y-10,44,22,'red');
 star(c,x-9,y-24,18,'black');star(c,x-7,y-22,14,'yellow');
 rect(c,x-17,y-5,12,4,'black');rect(c,x+5,y-5,12,4,'black');
 rect(c,x-15,y-1,8,6,'white');rect(c,x+7,y-1,8,6,'white');rect(c,x-9,y,3,5,'cyan');rect(c,x+6,y,3,5,'cyan');
 rect(c,x-14,y+7,28,12,'black');rect(c,x-12,y+7,10,9,'cream');rect(c,x+2,y+7,10,9,'cream');rect(c,x-5,y+5,10,4,'black');
 rect(c,x-7,y+17,14,7,phase==='STRIKE'?'black':'cream');
 if(phase==='STRIKE'){rect(c,x-6,y+17,3,3,'white');rect(c,x+3,y+17,3,3,'white');rect(c,x-3,y+22,6,2,'red');}
 rect(c,x-16,y+24,32,6,'black');rect(c,x-12,y+24,24,4,'yellow');rect(c,x-8,y+28,16,4,'black');rect(c,x-5,y+28,10,2,'gold');
}
export function bossPaw(c,x,y){
 rect(c,x-12,y-9,24,18,'black');rect(c,x-10,y-11,20,22,'black');rect(c,x-10,y-7,20,14,'yellow');rect(c,x-8,y-9,16,18,'gold');
 for(const dx of [-7,0,7]){rect(c,x+dx-2,y-8,5,6,'cream');rect(c,x+dx-1,y-3,3,3,'black');}
 rect(c,x-5,y+2,10,5,'black');rect(c,x-3,y,6,7,'black');
}
export function rect(ctx,x,y,w,h,color){ctx.fillStyle=P[color]||color;ctx.fillRect(Math.round(x),Math.round(y),w,h);}
export function line(ctx,x,y,tx,ty,color,width=2){const n=Math.max(1,Math.ceil(Math.max(Math.abs(tx-x),Math.abs(ty-y))));for(let i=0;i<=n;i++)rect(ctx,x+(tx-x)*i/n,y+(ty-y)*i/n,width,width,color);}
export function star(ctx,x,y,size=8,color='yellow'){const p=size/8;for(const [a,b,w,h]of [[3,0,2,8],[0,3,8,2],[2,2,4,4],[1,6,2,1],[5,6,2,1]])rect(ctx,x+a*p,y+b*p,w*p,h*p,color);}
export function player(ctx,x,y,pose='idle',frame=0){const lift=pose==='climbL'?frame%3:pose==='climbR'?-(frame%3):pose==='jump'?3:0;rect(ctx,x+4,y,9,8,'black');rect(ctx,x+3,y+2,10,2,'white');rect(ctx,x+6,y+5,6,4,'skin');rect(ctx,x+4,y+8,9,9,'black');rect(ctx,x+3,y+9,10,7,'red');star(ctx,x+5,y+10,6,'yellow');rect(ctx,x+4,y+16,8,3,'blue');line(ctx,x+5,y+18,x+3,y+21-lift,'blue',3);line(ctx,x+10,y+18,x+11,y+21+Math.min(0,lift),'blue',3);rect(ctx,x+1,y+22-lift,5,2,'white');rect(ctx,x+10,y+22+Math.min(0,lift),5,2,'white');}
export function cast(ctx,x,y,kind=0,frame=0){rect(ctx,x+5,y+2,7,7,'skin');rect(ctx,x+4,y,8,3,kind===0?'white':'brown');rect(ctx,x+6,y+4,1,1,'black');rect(ctx,x+10,y+4,1,1,'black');rect(ctx,x+4,y+10,9,9,['white','red','cyan','purple','green','pink','cream'][kind%7]);line(ctx,x+4,y+11,x+1,y+12-frame%3,'skin',2);line(ctx,x+12,y+11,x+14,y+8-frame%3,'skin',2);if(kind===0){rect(ctx,x+3,y-1,10,3,'white');rect(ctx,x+1,y+15,14,3,'brown');}if(kind===1||kind===5)rect(ctx,x+13,y+7-frame%3,2,4,'black');if(kind===2){rect(ctx,x,y+17,18,4,'pink');rect(ctx,x+2,y+17,4,2,'yellow');rect(ctx,x+10,y+17,4,2,'blue');}if(kind===4){rect(ctx,x-1,y+7,6,5,'pink');}}
export function ribbon(ctx,x,y,frame=0){for(let i=0;i<4;i++){rect(ctx,x+(i%2?3:0),y+i*4,5,4,i%2?'white':'pink');}rect(ctx,x+frame%2,y+14,3,2,'pink');}
export function plush(ctx,x,y,frame=0){star(ctx,x,y,18,'white');star(ctx,x+2,y+2,14,'purple');rect(ctx,x+6,y+7,2,2,'black');rect(ctx,x+11,y+7,2,2,'black');rect(ctx,x+8,y+11+frame%2,3,1,'white');}
export function card(ctx,x,y,category=0){rect(ctx,x,y,12,12,'white');rect(ctx,x+1,y+1,10,10,'night');if(category===8){star(ctx,x+2,y+2,8);return;}const color=['red','gold','pink','cream','cyan','purple','cyan','green'][category];rect(ctx,x+3,y+4,6,5,color);if(category===0||category===1){rect(ctx,x+2,y+4,8,2,'cream');rect(ctx,x+4,y+2,1,2,'white');}else if(category===2)line(ctx,x+4,y+9,x+8,y+3,'white',2);else if(category===4){rect(ctx,x+2,y+5,8,3,'cyan');rect(ctx,x+4,y+4,1,5,'black');}else if(category===6){rect(ctx,x+3,y+3,3,3,'white');rect(ctx,x+7,y+7,2,2,'white');}}

export function pawStamp(c,x,y,color='gold'){rect(c,x-4,y+1,8,5,color);rect(c,x-2,y-1,4,7,color);for(const dx of [-6,-1,4])rect(c,x+dx,y-6,3,4,color);}
// Drawing-only articulation: anchors and collision geometry remain in core.js.
export function climbVisual(g){const a=g.action,pull=a?.kind==='hand'?Math.max(0,Math.min(1,(a.age/a.duration-.5)*2)):0;return{pull,sway:g.lost.size?Math.round(Math.sin(g.tick/5)):0,brace:g.state==='BRACE'};}

// Floor residents are decorative only. Every mark fits a 24 x 18 window.
export function floorCast(c,x,y,floor,frame=0,variant=0){
 const R=(a,b,w,h,color)=>rect(c,x+a,y+b,w,h,color),beat=frame%2;
 const coat=['white','red','deep','cream','cyan','purple','green','cream','cyan'][floor]||'white';
 // Head, hair, face, sleeves and torso; the sill hides the lower body.
 R(9,3,6,6,'skin');R(8,1,7,3,'brown');R(9,5,1,1,'black');R(13,5,1,1,'black');
 R(8,9,8,9,coat);R(6,10,2,5,coat);R(16,10,2,5,coat);R(6,14,3,2,'skin');R(15,14,3,2,'skin');
 if(floor===0){ // Yokochō: headband chef, skewers and serving counter.
  R(8,2,8,2,'white');R(10,10,4,7,'cream');R(2,13,5,1,'gold');R(3,10,1,6,'brown');R(5,10,1,6,'brown');R(2,11,5,2,'red');R(1,17,22,1,'brown');R(17,15,5,2,'cream');
 }else if(floor===1){ // Asian food stall: chef cap, wok, steam and lantern.
  R(8,0,8,3,'white');R(10,10,4,7,'gold');R(1,0,1,2,'gold');R(0,2,4,5,'red');R(1,3,2,3,'yellow');R(16,14,7,2,'shadow');R(17,16,5,2,'black');R(18,13,4,1,'green');R(19+beat,10,1,2,'cream');R(22,12,2,1,'brown');
 }else if(floor===2){ // Live theatre: singer, microphone, stage light, long dress.
  R(8,0,6,2,'brown');R(14,2,2,7,'brown');R(7,15,10,3,'deep');R(10,10,2,1,'yellow');R(17,8-beat,2,6,'skin');R(18,6-beat,2,4,'black');R(18,5-beat,2,2,'white');R(2,2,1,5,'yellow');R(3,2,3,1,'yellow');R(1,7,2,2,'yellow');
 }else if(floor===3){ // Cafe lounge: vest, bow tie, tray and coffee cup.
  R(9,9,2,7,'black');R(13,9,2,7,'black');R(11,9,2,1,'red');R(1,12,6,1,'gold');R(2,9,3,3,'white');R(5,10,1,1,'cream');R(3,7-beat,1,1,'cream');R(18,16,5,2,'brown');
 }else if(floor===4||floor===8){ // Music / games: headphones, decks or a game controller.
  R(7,1,1,7,'black');R(15,1,1,7,'black');R(8,0,7,1,'black');R(7,4,2,4,'cyan');R(14,4,2,4,'cyan');
  if(variant%2&&floor===4){R(7,13,10,4,'purple');R(9,14,1,2,'white');R(8,15,3,1,'white');R(14,14,1,1,'yellow');R(16,15,1,1,'pink');}
  else{R(1,14,22,4,'purple');R(3,15,5,2,'black');R(16,15,5,2,'black');R(5,15,1,1,'white');R(18,15,1,1,'white');R(10,15,3,1,beat?'yellow':'cyan');}
 }else if(floor===5){ // Performance and conversation: kimono, sash, folding fan.
  R(10,0,4,2,'black');R(7,9,3,6,'purple');R(15,9,3,6,'purple');R(9,10,2,2,'cream');R(11,12,2,2,'cream');R(8,14,8,2,'red');R(18,6-beat,1,6,'brown');R(15,4-beat,7,2,'pink');R(16,6-beat,5,2,'pink');R(17,8-beat,3,1,'gold');
 }else if(floor===6){ // Relaxation: towel, robe, softly closed eyes and cushion.
  R(8,1,8,3,'white');R(9,5,2,1,'brown');R(13,5,2,1,'brown');R(9,10,2,2,'cream');R(11,12,2,2,'cream');R(8,15,8,1,'cream');R(5,17,14,1,'cyan');R(19,11,3,5,'green');R(18,15,5,3,'brown');
 }else if(floor===7){ // Tatami: kimono host, tea tray and green tea.
  R(14,1,3,3,'black');R(9,10,2,2,'green');R(11,12,2,2,'green');R(8,14,8,2,'gold');R(1,15,7,1,'brown');R(2,12,4,3,'white');R(2,12,4,1,'green');R(19,15,4,2,'pink');R(18,17,6,1,'cream');
 }
}

// Small stage props thrown from each floor's resident window; same collision sizes as before.
export function residentProp(c,x,y,floor,large=false){if(large){plush(c,x-9,y-9);return;}const R=(a,b,w,h,k)=>rect(c,x+a,y+b,w,h,k);if(floor===0||floor===1){R(-4,-3,8,3,'cream');R(-3,0,6,3,floor?'red':'brown');R(-2,3,4,1,'gold');}else if(floor===2||floor===5){R(-4,-3,8,2,'pink');R(-3,-1,6,2,'purple');R(-1,1,2,4,'gold');}else if(floor===3||floor===7){R(-3,-4,6,7,'white');R(3,-2,2,4,'cream');R(-2,-4,4,1,floor===7?'green':'brown');}else if(floor===4){R(-4,-4,8,8,'purple');R(-3,-1,3,1,'white');R(-2,-2,1,3,'white');R(2,1,1,1,'yellow');}else{R(-4,-4,8,8,'cyan');R(-3,-3,6,6,'cream');R(-2,-2,4,4,'pink');}}
