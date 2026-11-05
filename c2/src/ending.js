import {drawGoalLogo} from './logo.js';
import {rect,line,star,player,cast,hamashishi,bossPaw} from './art.js';

export const ENDING={duration:9000,skipAfter:1000};
export const isClear=g=>g.finished&&g.mode==='ROOF'&&g.roofAtMs!==null&&!g.invalidReason;
// Presentation clock never advances simulation, collision, score, or competition time.
export class Ending{
 constructor(){this.ms=0;this.done=false;}
 advance(ms){if(!this.done)this.ms=Math.min(ENDING.duration,this.ms+Math.max(0,ms));this.done=this.ms>=ENDING.duration;return this.done;}
 skip(){if(this.ms<ENDING.skipAfter)return false;this.ms=ENDING.duration;this.done=true;return true;}
}
const clamp=t=>Math.max(0,Math.min(1,t));
export function endingPose(ms){const t=Math.max(0,ms)/1000;return{t,light:clamp((t-1)/1),bow:t>=2&&t<3,celebrate:t>=3,banner:clamp((t-4)/1),thanks:t>=7};}
const FONT={
 A:['01110','10001','10001','11111','10001','10001','10001'],
 C:['01111','10000','10000','10000','10000','10000','01111'],
 D:['11110','10001','10001','10001','10001','10001','11110'],
 E:['11111','10000','10000','11110','10000','10000','11111'],
 G:['01111','10000','10000','10111','10001','10001','01111'],
 H:['10001','10001','10001','11111','10001','10001','10001'],
 L:['10000','10000','10000','10000','10000','10000','11111'],
 M:['10001','11011','10101','10101','10001','10001','10001'],
 N:['10001','11001','11001','10101','10011','10011','10001'],
 R:['11110','10001','10001','11110','10100','10010','10001'],
 ' ':['00000','00000','00000','00000','00000','00000','00000']
};
function pixelText(c,s,y,scale=2,color='yellow'){const x=(240-(s.length*6-1)*scale)/2;for(let i=0;i<s.length;i++)for(let r=0;r<7;r++)for(let col=0;col<5;col++)if(FONT[s[i]]?.[r][col]==='1')rect(c,x+i*6*scale+col*scale,y+r*scale,scale,scale,color);}
function label(c,s,y,color='#FFF0BE',size=7){c.fillStyle=color;c.font=size+'px "DotGothic16"';c.textAlign='center';c.fillText(s,120,y);}
export function drawEnding(canvas,ms,type=null){
 type?.clear();
 const c=canvas.getContext('2d'),h=canvas.height,p=endingPose(ms),t=p.t;
 c.save();c.imageSmoothingEnabled=false;rect(c,0,0,240,h,'night');
 const scale=Math.min(1,h/320);c.translate(Math.round((240-240*scale)/2),Math.round((h-320*scale)/2));c.scale(scale,scale);
 const label=(unused,s,y,color='#FFF0BE',size=9)=>{if(type)type.text(s,120,y*scale+Math.round((h-320*scale)/2),color,Math.max(9,size*scale),'center',y>=287||y===166);else{c.fillStyle=color;c.font=size+'px "DotGothic16"';c.textAlign='center';c.fillText(s,120,y);}};
 const colors=['yellow','cyan','pink'];
 for(let i=0;i<28;i++)rect(c,(i*67+13)%240,60+(i*31)%150,1,1,i%3?'cream':'cyan');
 for(let i=0;i<10;i++){const x=i*27-8,top=185+(i*19)%40;rect(c,x,top,19,135,'black');for(let j=0;j<5;j++)rect(c,x+5,top+10+j*16,2,3,p.light>0?'yellow':'shadow');}
 pixelText(c,'GAME CLEAR',10,3);label(c,'グランハマー 登頂祭',44,'#FFFFFF',10);
 pixelText(c,'GRAND HAMMER',57,2);
 // The rooftop star is switched on by the player's raised hand.
 const lit=p.light>=1;rect(c,117,147,6,58,'gold');drawGoalLogo(c,24,83);
 if(lit){for(const [dx,dy]of [[-102,0],[102,0],[-70,-38],[70,-38]]){const length=3+Math.floor(t*2)%2*2;rect(c,120+dx,112+dy,length,2,'yellow');}}
 if(p.celebrate)for(let k=0;k<2;k++){const a=(t-3+k*.6)%2,r=Math.round(a*17),x=[38,202][k],y=[109,100][k];if(a<1.7)for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1],[.7,.7],[-.7,.7],[.7,-.7],[-.7,-.7]])rect(c,x+Math.round(dx*r),y+Math.round(dy*r),2,2,colors[k]);}
 // A rising celebration banner belongs to this venue, not a rescue sequence.
 if(p.banner>0){const y=158+Math.round((1-p.banner)*12);rect(c,51,y,138,27,'gold');rect(c,54,y+3,132,21,'red');label(c,'大入・登頂達成',y+18,'#FFFFFF',14);}
 else label(c,lit?'ハマシシも祝福！':'屋上の星を灯そう！',166,'#FFF0BE',8);
 rect(c,22,236,196,84,'gold');for(let col=0;col<6;col++){const x=28+col*32;rect(c,x,248,23,34,'black');rect(c,x,248,23,3,lit?colors[col%3]:'blue');rect(c,x,283,23,3,'cream');rect(c,x-5,240,4,80,'yellow');cast(c,x+3,260,col%7,p.celebrate?Math.floor(t*3)%2:0);rect(c,x,298,23,22,'black');}
 rect(c,20,233,200,5,'cream');rect(c,20,287,200,10,'black');label(c,'食・ライブ・遊びの殿堂',295,'#FFFFFF',6);
 c.save();c.translate(57,214+(p.bow?5:0));c.scale(.5,p.bow?.42:.5);hamashishi(c,0,0,'REST');bossPaw(c,-43,p.celebrate?-12-Math.floor(t*2)%2*6:8);bossPaw(c,43,8);c.restore();
 cast(c,175,212,2,p.celebrate?Math.floor(t*3)%2:0);star(c,196,214,8,colors[Math.floor(t)%3]);
 // The climber stays at the summit to celebrate with the venue's cast.
 rect(c,105,230,30,3,'red');const py=207;player(c,112,py);line(c,117,py+10,110,py+(lit?0:5),'red',3);line(c,123,py+10,129,py,'red',3);rect(c,109,py+(lit?-2:3),4,4,'skin');rect(c,128,py-2,4,4,'skin');
 if(p.celebrate)for(let i=0;i<18;i++){const x=(i*43+11)%240;if(x>90&&x<150)continue;rect(c,x,130+((t-3)*22+i*17)%95,2,3,colors[i%3]);}
 label(c,p.thanks?'THANK YOU FOR PLAYING!':'登頂おめでとう！',313,'#FFFFFF',7);
 c.restore();
}
