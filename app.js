const boardEl=document.getElementById('board'),scoreEl=document.getElementById('score'),newBtn=document.getElementById('new');
let grid=new Array(16).fill(0),score=0;
function save(){localStorage.setItem('2048_grid',JSON.stringify(grid));localStorage.setItem('2048_score',score)}
function load(){const g=JSON.parse(localStorage.getItem('2048_grid')||'null'); if(g)grid=g; score=Number(localStorage.getItem('2048_score')||0)}
function rnd(){const empt=grid.map((v,i)=>v?null:i).filter(n=>n!==null); if(!empt.length) return; grid[empt[Math.floor(Math.random()*empt.length)]]=Math.random()<0.9?2:4}
function render(){
  boardEl.innerHTML=''; for(let i=0;i<16;i++){const c=document.createElement('div');c.className='cell'; if(grid[i]){const t=document.createElement('div');t.className='tile';t.textContent=grid[i]; c.appendChild(t)} boardEl.appendChild(c)}
  scoreEl.textContent=score;
  save();
}
function slide(row){
  const arr=row.filter(v=>v),res=[],merged=[];
  for(let i=0;i<arr.length;i++){
    if(arr[i]===arr[i+1] && !merged[i]){
      res.push(arr[i]*2); score+=arr[i]*2; merged[i+1]=true; i++;
    } else res.push(arr[i]);
  }
  while(res.length<4) res.push(0);
  return res;
}
function move(dir){
  let moved=false;
  for(let r=0;r<4;r++){
    let line=[];
    for(let c=0;c<4;c++){
      const idx = dir==='left'? r*4+c : dir==='right'? r*4+(3-c) : dir==='up'? c*4+r : (3-c)*4+r;
      line.push(grid[idx]);
    }
    const out=slide(line);
    for(let c=0;c<4;c++){
      const idx = dir==='left'? r*4+c : dir==='right'? r*4+(3-c) : dir==='up'? c*4+r : (3-c)*4+r;
      if(grid[idx]!==out[c]) {grid[idx]=out[c]; moved=true}
    }
  }
  if(moved){ rnd(); render(); checkEnd(); }
}
function checkEnd(){
  if(grid.includes(2048)) alert('You win!');
  if(!grid.includes(0)){
    for(let r=0;r<4;r++) for(let c=0;c<3;c++) if(grid[r*4+c]===grid[r*4+c+1]) return;
    for(let c=0;c<4;c++) for(let r=0;r<3;r++) if(grid[r*4+c]===grid[(r+1)*4+c]) return;
    alert('Game Over');
  }
}
window.addEventListener('keydown',e=>{
  if(e.key.includes('Arrow')){ e.preventDefault();
    if(e.key==='ArrowLeft') move('left');
    if(e.key==='ArrowRight') move('right');
    if(e.key==='ArrowUp') move('up');
    if(e.key==='ArrowDown') move('down');
  }
});
let startX, startY;
boardEl.addEventListener('touchstart',e=>{startX=e.touches[0].clientX; startY=e.touches[0].clientY});
boardEl.addEventListener('touchend',e=>{
  const dx=(e.changedTouches[0].clientX-startX), dy=(e.changedTouches[0].clientY-startY);
  if(Math.abs(dx)>Math.abs(dy)){ if(dx>30) move('right'); else if(dx<-30) move('left'); }
  else{ if(dy>30) move('down'); else if(dy<-30) move('up'); }
});
newBtn.addEventListener('click',()=>{grid=new Array(16).fill(0);score=0;rnd();rnd();render()});
load(); if(!grid.some(v=>v)) {rnd(); rnd()} render();
