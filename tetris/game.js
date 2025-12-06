const COLS=10,ROWS=20,cell=24;
const board=Array.from({length:ROWS},()=>Array(COLS).fill(0));
let ctx=document.getElementById('board').getContext('2d');
ctx.scale(cell,cell);
function rnd(){const k=Object.keys(TETROMINOES);return k[Math.floor(Math.random()*k.length)];}
function rotate(m){return m[0].map((_,i)=>m.map(r=>r[i]).reverse());}
function collide(pos,mat){for(let y=0;y<mat.length;y++)for(let x=0;x<mat[y].length;x++)if(mat[y][x]&& (board[pos.y+y]&&board[pos.y+y][pos.x+x])!==0) return true;return false;}
function merge(pos,mat,id){for(let y=0;y<mat.length;y++)for(let x=0;x<mat[y].length;x++)if(mat[y][x])board[pos.y+y][pos.x+x]=id;}
function clearLines(){
 let cleared=0;
 for(let y=ROWS-1;y>=0;y--){
  if(board[y].every(v=>v!==0)){board.splice(y,1);board.unshift(Array(COLS).fill(0));cleared++;y++;}
 }
 return cleared;
}
function draw(){
 ctx.clearRect(0,0,10,20);
 for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++)if(board[y][x]){ctx.fillStyle=board[y][x];ctx.fillRect(x,y,1,1);ctx.strokeStyle='#000';ctx.strokeRect(x,y,1,1);}
}
