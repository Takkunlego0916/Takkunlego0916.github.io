const COLS=9,ROWS=20,cell=24;
const board=Array.from({length:ROWS},()=>Array(COLS).fill(0));
const bctx=document.getElementById('board').getContext('2d');bctx.scale(cell,cell);
const nctx=document.getElementById('next').getContext('2d');nctx.scale(24/24,24/24);
let score=0,lines=0,level=1,dropInterval=800,lastTime=0;
function rnd(){const k=Object.keys(TETROMINOES);return k[Math.floor(Math.random()*k.length)];}
function rotate(m){return m[0].map((_,i)=>m.map(r=>r[i]).reverse());}
function collide(pos,mat){for(let y=0;y<mat.length;y++)for(let x=0;x<mat[y].length;x++)if(mat[y][x]&&(board[pos.y+y]&&board[pos.y+y][pos.x+x]))return true;return false}
function merge(pos,mat,color){for(let y=0;y<mat.length;y++)for(let x=0;x<mat[y].length;x++)if(mat[y][x])board[pos.y+y][pos.x+x]=color}
function clearLines(){let c=0;for(let y=ROWS-1;y>=0;y--){if(board[y].every(v=>v)){board.splice(y,1);board.unshift(Array(COLS).fill(0));c++;y++}} if(c){lines+=c;score+=c*100;document.getElementById('lines').textContent=lines;document.getElementById('score').textContent=score}}
function draw(){bctx.clearRect(0,0,COLS,ROWS);for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++)if(board[y][x]){bctx.fillStyle=board[y][x];bctx.fillRect(x,y,1,1);bctx.strokeStyle='#000';bctx.strokeRect(x,y,1,1)} if(cur){for(let y=0;y<cur.mat.length;y++)for(let x=0;x<cur.mat[y].length;x++)if(cur.mat[y][x]){bctx.fillStyle=cur.color;bctx.fillRect(cur.pos.x+x,cur.pos.y+y,1,1);bctx.strokeStyle='#000';bctx.strokeRect(cur.pos.x+x,cur.pos.y+y,1,1)}}}
let cur=null,nextKey=rnd();
function newPiece(){const k=nextKey;nextKey=rnd();cur={mat:TETROMINOES[k].map(r=>r.slice()),pos:{x:Math.floor((COLS-Math.max(...TETROMINOES[k].map(r=>r.length)))/2),y:0},color:COLORS[k]}; if(collide(cur.pos,cur.mat)){alert('Game Over');reset()}}
function reset(){for(let y=0;y<ROWS;y++)board[y].fill(0);score=0;lines=0;level=1;document.getElementById('level').textContent=level;document.getElementById('lines').textContent=lines;document.getElementById('score').textContent=score;nextKey=rnd();newPiece()}
function drawNext(){nctx.clearRect(0,0,3,3);const mat=TETROMINOES[nextKey];for(let y=0;y<mat.length;y++)for(let x=0;x<mat[y].length;x++)if(mat[y][x]){nctx.fillStyle=COLORS[nextKey];nctx.fillRect(x,y,1,1);nctx.strokeStyle='#000';nctx.strokeRect(x,y,1,1)}}
function update(t=0){const delta=t-lastTime;if(delta>dropInterval){cur.pos.y++; if(collide(cur.pos,cur.mat)){cur.pos.y--; merge(cur.pos,cur.mat,cur.color); clearLines(); newPiece()} lastTime=t} draw(); drawNext(); requestAnimationFrame(update)}
reset();requestAnimationFrame(update);
