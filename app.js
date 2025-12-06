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
  addRandom(); addRandom();
  render();
}

newBtn.addEventListener('click',startGame);

// 初期化
startGame();
