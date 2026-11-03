import {rect,line,star} from './art.js';
// Fixed eight-pixel upper arm + eight-pixel forearm, on a 32-pixel figure.
// The presentation torso follows reachable hand positions; simulation is untouched.
export const LIMB={upper:8,fore:8,shoulderHalf:8};
export function climberPose(g){
 const x=(g.hands.L.x+g.hands.R.x)/2,reach=LIMB.upper+LIMB.fore;
 let low=-Infinity,high=Infinity;
 for(const [hand,side] of [['L',-1],['R',1]]){const p=g.hands[hand],dx=p.x-(x+side*LIMB.shoulderHalf),vertical=Math.sqrt(Math.max(0,reach*reach-dx*dx));low=Math.max(low,p.y-vertical);high=Math.min(high,p.y+vertical);}
 const reaching=g.action?.kind==='hand'||g.action?.kind==='recoverHand';
 const desired=reaching?(g.hands.L.y+g.hands.R.y)/2-9:g.body.y+3;
 const shoulderY=Math.max(low,Math.min(high,desired)),arms={};
 for(const [hand,side] of [['L',-1],['R',1]]){const wrist={...g.hands[hand]},shoulder={x:x+side*LIMB.shoulderHalf,y:shoulderY},dx=wrist.x-shoulder.x,dy=wrist.y-shoulder.y,d=Math.hypot(dx,dy),half=d/2,bend=Math.sqrt(Math.max(0,LIMB.upper**2-half**2));
  const nx=d?-dy/d:side,ny=d?dx/d:0,sign=nx?Math.sign(nx)*side:ny>0?-1:1;
  const elbow={x:(shoulder.x+wrist.x)/2+nx*bend*sign,y:(shoulder.y+wrist.y)/2+ny*bend*sign};arms[hand]={shoulder,elbow,wrist};
 }
 return{x,y:shoulderY-3,arms};
}
export function drawClimber(c,g,sy){
 const p=climberPose(g),bx=Math.round(p.x),by=sy(p.y),a=g.action,braced=g.state==='BRACE';
 for(const hand of ['L','R']){const {shoulder:s,elbow:e,wrist:w}=p.arms[hand];line(c,s.x-1,sy(s.y)-1,e.x-1,sy(e.y)-1,'black',4);line(c,e.x-1,sy(e.y)-1,w.x-1,sy(w.y)-1,'black',4);line(c,s.x,sy(s.y),e.x,sy(e.y),'red',2);line(c,e.x,sy(e.y),w.x,sy(w.y),'skin',2);rect(c,w.x-2,sy(w.y)-1,4,3,'skin');if(!w.free){rect(c,w.x-2,sy(w.y)+1,4,1,'white');if(braced)rect(c,w.x-3,sy(w.y)+3,6,1,'cyan');}}
 // Proportional head, broad shoulders, happi, bent knees and shoes.
 rect(c,bx-5,by-14,10,10,'black');rect(c,bx-6,by-12,12,2,'white');rect(c,bx-3,by-9,7,5,'skin');
 rect(c,bx-8,by-5,16,15,'black');rect(c,bx-7,by-4,14,12,'red');star(c,bx-4,by-2,8,'yellow');rect(c,bx-7,by+7,14,3,'blue');
 const step=a?.kind==='hand'?Math.round(Math.sin(a.age/a.duration*Math.PI)*3):0,lead=a?.hand==='L'?-1:1;
 for(const side of [-1,1]){const knee=side===lead?step:0;line(c,bx+side*4,by+10,bx+side*5,by+14-knee,'blue',3);rect(c,bx+side*5-2,by+16-knee,6,2,'white');}
 return p;
}
