import {rect,star,player,cast,hamashishi,bossPaw,line,floorCast} from './art.js';
import {drawGoalLogo} from './logo.js';
export function drawFrontLogo(canvas){const c=canvas.getContext('2d');c.imageSmoothingEnabled=false;drawGoalLogo(c,2,2);}
export function drawFrontScene(canvas){
 const c=canvas.getContext('2d');c.imageSmoothingEnabled=false;rect(c,0,0,240,292,'night');
 for(let i=0;i<40;i++)rect(c,(i*47+9)%240,(i*23+5)%250,1,1,i%3?'cream':'cyan');
 for(let i=0;i<10;i++){const x=i*29-10,y=120+i%4*24;rect(c,x,y,21,292-y,'black');for(let j=0;j<9;j++)rect(c,x+4,y+6+j*14,2,3,'yellow');}
 // Rooftop brand marquee is part of the tower silhouette, not a separate logo card.
 rect(c,47,57,4,33,'gold');rect(c,189,57,4,33,'gold');drawGoalLogo(c,24,4);
 rect(c,32,84,180,202,'gold');rect(c,29,80,186,5,'cream');
 for(let floor=0;floor<8;floor++){const y=88+floor*24;
  for(let col=0;col<6;col++){const x=38+col*28;rect(c,x,y,20,18,'black');rect(c,x,y,20,2,['cyan','blue','purple','pink','blue','purple','red','red'][floor]);rect(c,x,y+18,20,2,'cream');rect(c,x-5,y-4,4,24,'yellow');if(col===1||col===4){c.save();c.translate(x,y+1);c.scale(.83,.94);floorCast(c,0,0,7-floor,0,col===4?1:0);c.restore();}}
  c.font='16px "DotGothic16"';c.fillStyle='#fff0be';c.fillText((8-floor)+'F',5,y+15);
 }
 // Entrance, red lanterns, and a wide pavement anchor the building at street level.
 rect(c,29,280,186,4,'cream');rect(c,32,284,180,8,'black');rect(c,105,264,30,16,'deep');rect(c,109,266,10,14,'black');rect(c,121,266,10,14,'black');
 for(const x of [42,68,172,198]){rect(c,x,263,7,11,'red');rect(c,x+2,265,3,7,'cream');}
 c.save();c.translate(106,169);c.scale(2,2);player(c,0,0);line(c,4,11,1,2,'red',3);line(c,12,11,16,0,'red',3);rect(c,0,0,3,3,'skin');rect(c,16,-2,3,3,'skin');c.restore();
 c.save();c.translate(217,111);c.scale(.38,.38);hamashishi(c,0,0,'REST');bossPaw(c,-38,15);bossPaw(c,38,15);c.restore();rect(c,0,290,240,2,'gold');
}
