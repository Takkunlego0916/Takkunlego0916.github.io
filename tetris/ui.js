let cur={pos:{x:3,y:0},mat:TETROMINOES[rnd()],id:COLORS['T']};
function newPiece(){const k=rnd();cur.mat=TETROMINOES[k];cur.id=COLORS[k];cur.pos={x:3,y:0}; if(collide(cur.pos,cur.mat)){alert('Game Over');location.reload();}}
let dropInterval=800,last=0,score=0,lines=0,level=1;
function update(t=0){if(t-last>dropInterval){cur.pos.y++; if(collide(cur.pos,cur.mat)){cur.pos.y--; merge(cur.pos,cur.mat,cur.id); let c=clearLines(); if(c){lines+=c;score+=c*100;} newPiece();} last=t;} draw(); requestAnimationFrame(update);}
document.addEventListener('keydown',e=>{const k=KEYS[e.keyCode]; if(k==='left'){cur.pos.x--; if(collide(cur.pos,cur.mat))cur.pos.x++;} if(k==='right'){cur.pos.x++; if(collide(cur.pos,cur.mat))cur.pos.x--;} if(k==='down'){cur.pos.y++; if(collide(cur.pos,cur.mat))cur.pos.y--;} if(k==='rotate'){const r=rotate(cur.mat); if(!collide(cur.pos,r))cur.mat=r;} if(k==='drop'){while(!collide(cur.pos,cur.mat))cur.pos.y++;cur.pos.y--; merge(cur.pos,cur.mat,cur.id); let c=clearLines(); if(c){lines+=c;score+=c*100;} newPiece();}});

newPiece();requestAnimationFrame(update);
