document.addEventListener('keydown',e=>handle(KEYS[e.key]||e.key));
['left','right','down','rotate','drop','pause','new'].forEach(id=>document.getElementById(id).addEventListener('click',()=>handle(id)));
function handle(cmd){
 if(!cur) return;
 if(cmd==='left'){cur.pos.x--; if(collide(cur.pos,cur.mat))cur.pos.x++}
 if(cmd==='right'){cur.pos.x++; if(collide(cur.pos,cur.mat))cur.pos.x--}
 if(cmd==='down'){cur.pos.y++; if(collide(cur.pos,cur.mat))cur.pos.y--}
 if(cmd==='rotate'){const r=rotate(cur.mat); if(!collide(cur.pos,r))cur.mat=r}
 if(cmd==='drop'){while(!collide(cur.pos,cur.mat))cur.pos.y++;cur.pos.y--; merge(cur.pos,cur.mat,cur.color); clearLines(); newPiece()}
 if(cmd==='pause'){if(window._paused){window._paused=false;requestAnimationFrame(update)}else{window._paused=true;cancelAnimationFrame(update)}}
 if(cmd==='new'){reset()}
 document.getElementById('level').textContent=level
}
