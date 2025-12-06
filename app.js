const boardEl=document.getElementById('board');
const scoreEl=document.getElementById('score');
const bestEl=document.getElementById('best');
const newBtn=document.getElementById('new');

let grid=new Array(16).fill(0);
let score=0;
let best=0;

function render(){
  boardEl.innerHTML='';
  for(let i=0;i<16;i++){
    const c=document.createElement('div');
    c.className='cell';
    if(grid[i]){
      const t=document.createElement('div');
      t.className='tile tile-'+grid[i];
      t.textContent=grid[i];
      c.appendChild(t);
    }
    boardEl.appendChild(c);
  }
  scoreEl.textContent=score;
  bestEl.textContent=best;
}

function addRandom(){
  const empt=grid.map((v,i)=>v?null:i).filter(n=>n!==null);
  if(!empt.length)return;
  grid[empt[Math.floor(Math.random()*empt.length)]]=Math.random()<0.9?2:4;
}

function startGame(){
  grid=new Array(16).fill(0);
  score=0;
  addRandom(); 
  addRandom();
  render();
}

window.addEventListener('keydown', e => {
  if(e.key === 'ArrowLeft') move('left');
  if(e.key === 'ArrowRight') move('right');
  if(e.key === 'ArrowUp') move('up');
  if(e.key === 'ArrowDown') move('down');
});

let startX = 0, startY = 0;
boardEl.addEventListener('touchstart', e => {
  const t = e.touches[0];
  startX = t.clientX;
  startY = t.clientY;
}, { passive: true });

boardEl.addEventListener('touchend', e => {
  const t = e.changedTouches[0];
  const dx = t.clientX - startX;
  const dy = t.clientY - startY;
  if(Math.abs(dx) > Math.abs(dy)){
    if(dx > 30) move('right');
    else if(dx < -30) move('left');
  } else {
    if(dy > 30) move('down');
    else if(dy < -30) move('up');
  }
}, { passive: true });


newBtn.addEventListener('click',startGame);

startGame();
