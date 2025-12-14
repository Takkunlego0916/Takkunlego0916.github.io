const canvas=document.getElementById('game'),ctx=canvas.getContext('2d');
let running=false,score=0,player={x:50,y:300,w:40,h:40,vy:0,ground:340},obstacles=[];
const gravity=0.8,speed=4;
document.getElementById('start').onclick=()=>{reset();running=true;};
canvas.onclick=()=>{ if(player.y>=player.ground) player.vy=-14; };
function reset(){score=0;obstacles=[];player.y=player.ground;player.vy=0;}
function spawn(){ if(Math.random()<0.02) obstacles.push({x:canvas.width,y:player.ground+10,w:30,h:30}); }
function update(){
  if(!running) return;
  player.vy+=gravity; player.y+=player.vy;
  if(player.y>player.ground) player.y=player.ground,player.vy=0;
  obstacles.forEach(o=>o.x-=speed);
  obstacles=obstacles.filter(o=>o.x+o.w>0);
  spawn();
  score+=0.02;
  obstacles.forEach(o=>{ if(collide(player,o)){ running=false; }});
  document.getElementById('score').textContent='Score: '+Math.floor(score);
}
function collide(a,b){ return a.x<a.x+b.w && a.x+a.w>b.x && a.y<a.y+b.h && a.y+a.h>b.y; }
function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle='#654321'; ctx.fillRect(0,player.ground+40,canvas.width,60);
  ctx.fillStyle='#ff6347'; ctx.fillRect(player.x,player.y-player.h,player.w,player.h);
  ctx.fillStyle='#222'; obstacles.forEach(o=>ctx.fillRect(o.x,o.y-o.h,o.w,o.h));
}
function loop(){ update(); draw(); requestAnimationFrame(loop); }
loop();
