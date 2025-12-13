// js/app.js
const boardEl = document.getElementById('board');
const difficultyEl = document.getElementById('difficulty');
const newBtn = document.getElementById('newBtn');
const flagsEl = document.getElementById('flags');
const timerEl = document.getElementById('timer');
const messageEl = document.getElementById('message');
const bestEasyEl = document.getElementById('bestEasy');
const bestMediumEl = document.getElementById('bestMedium');
const bestHardEl = document.getElementById('bestHard');

let cols = 16, rows = 16, minesCount = 40;
let grid = [], started = false, timer = null, seconds = 0, flagsLeft = 0, cellsLeft = 0, gameOver = false;

const BEST_KEY = 'minesweeper_best_times';

function loadBestTimes(){
  const raw = localStorage.getItem(BEST_KEY);
  return raw ? JSON.parse(raw) : {easy:null,medium:null,hard:null};
}
function saveBestTimes(obj){ localStorage.setItem(BEST_KEY, JSON.stringify(obj)); }
function updateBestUI(){
  const b = loadBestTimes();
  bestEasyEl.textContent = `Easy: ${b.easy ?? '—'}`;
  bestMediumEl.textContent = `Medium: ${b.medium ?? '—'}`;
  bestHardEl.textContent = `Hard: ${b.hard ?? '—'}`;
}

function setDifficulty(v){
  if(v==='easy'){cols=9;rows=9;minesCount=10}
  else if(v==='medium'){cols=16;rows=16;minesCount=40}
  else {cols=30;rows=16;minesCount=99}
}

function createBoard(){
  boardEl.innerHTML = '';
  boardEl.style.gridTemplateColumns = `repeat(${cols}, auto)`;
  grid = [];
  started = false; clearInterval(timer); timer = null; seconds = 0; timerEl.textContent = '0'; messageEl.textContent = '';
  flagsLeft = minesCount; flagsEl.textContent = flagsLeft;
  gameOver = false;

  for(let r=0;r<rows;r++){
    const row = [];
    for(let c=0;c<cols;c++){
      const cell = {r,c,mine:false,open:false,flag:false,adj:0,el:null};
      const el = document.createElement('div');
      el.className = 'cell';
      el.dataset.r = r; el.dataset.c = c;
      el.tabIndex = 0;
      el.addEventListener('click', onCellClick);
      el.addEventListener('contextmenu', onCellRightClick);
      el.addEventListener('keydown', onCellKeyDown);
      // mobile long press
      let pressTimer = null;
      el.addEventListener('touchstart', e => {
        pressTimer = setTimeout(()=>{ toggleFlag(cell); }, 600);
      }, {passive:true});
      el.addEventListener('touchend', e => { if(pressTimer) clearTimeout(pressTimer); }, {passive:true});
      cell.el = el;
      boardEl.appendChild(el);
      row.push(cell);
    }
    grid.push(row);
  }
  cellsLeft = cols*rows - minesCount;
}

function placeMines(firstR, firstC){
  const forbidden = new Set();
  for(let dr=-1;dr<=1;dr++) for(let dc=-1;dc<=1;dc++){
    const nr = firstR+dr, nc = firstC+dc;
    if(nr>=0 && nr<rows && nc>=0 && nc<cols) forbidden.add(nr+','+nc);
  }
  let placed = 0;
  while(placed < minesCount){
    const r = Math.floor(Math.random()*rows);
    const c = Math.floor(Math.random()*cols);
    const key = r+','+c;
    if(forbidden.has(key)) continue;
    const cell = grid[r][c];
    if(cell.mine) continue;
    cell.mine = true; placed++;
  }
  for(let r=0;r<rows;r++) for(let c=0;c<cols;c++){
    let count = 0;
    for(let dr=-1;dr<=1;dr++) for(let dc=-1;dc<=1;dc++){
      if(dr===0 && dc===0) continue;
      const nr=r+dr, nc=c+dc;
      if(nr>=0 && nr<rows && nc>=0 && nc<cols && grid[nr][nc].mine) count++;
    }
    grid[r][c].adj = count;
  }
}

function startTimer(){
  if(timer) return;
  timer = setInterval(()=>{ seconds++; timerEl.textContent = seconds; }, 1000);
}

function reveal(cell){
  if(cell.open || cell.flag || gameOver) return;
  cell.open = true;
  cell.el.classList.add('open');
  if(cell.mine){
    cell.el.classList.add('mine');
    cell.el.textContent = '💣';
    lose();
    return;
  }
  cellsLeft--;
  if(cell.adj>0){
    cell.el.textContent = cell.adj;
    cell.el.style.color = colorForNumber(cell.adj);
  } else {
    for(let dr=-1;dr<=1;dr++) for(let dc=-1;dc<=1;dc++){
      const nr = cell.r+dr, nc = cell.c+dc;
      if(nr>=0 && nr<rows && nc>=0 && nc<cols) reveal(grid[nr][nc]);
    }
  }
  checkWin();
}

function colorForNumber(n){
  const map = {1:'#0000ff',2:'#007700',3:'#ff0000',4:'#000088',5:'#880000',6:'#008888',7:'#000',8:'#888'};
  return map[n] || '#000';
}

function onCellClick(e){
  const r = +this.dataset.r, c = +this.dataset.c;
  const cell = grid[r][c];
  if(gameOver) return;
  if(!started){
    placeMines(r,c);
    started = true;
    startTimer();
  }
  reveal(cell);
}

function onCellRightClick(e){
  e.preventDefault();
  const r = +this.dataset.r, c = +this.dataset.c;
  const cell = grid[r][c];
  toggleFlag(cell);
}

function onCellKeyDown(e){
  const r = +this.dataset.r, c = +this.dataset.c;
  const cell = grid[r][c];
  if(e.key === 'Enter') reveal(cell);
  if(e.key.toLowerCase() === 'f') toggleFlag(cell);
  // arrow navigation
  const key = e.key;
  if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(key)){
    e.preventDefault();
    let nr = cell.r, nc = cell.c;
    if(key === 'ArrowUp') nr = Math.max(0, nr-1);
    if(key === 'ArrowDown') nr = Math.min(rows-1, nr+1);
    if(key === 'ArrowLeft') nc = Math.max(0, nc-1);
    if(key === 'ArrowRight') nc = Math.min(cols-1, nc+1);
    const next = grid[nr][nc];
    if(next && next.el) next.el.focus();
  }
}

function toggleFlag(cell){
  if(cell.open || gameOver) return;
  cell.flag = !cell.flag;
  if(cell.flag){
    cell.el.classList.add('flag');
    cell.el.textContent = '🚩';
    flagsLeft--;
  } else {
    cell.el.classList.remove('flag');
    cell.el.textContent = '';
    flagsLeft++;
  }
  flagsEl.textContent = flagsLeft;
}

function lose(){
  gameOver = true;
  clearInterval(timer); timer = null;
  messageEl.textContent = 'You Lose';
  for(let r=0;r<rows;r++) for(let c=0;c<cols;c++){
    const cell = grid[r][c];
    if(cell.mine && !cell.open){
      cell.el.classList.add('open','mine');
      cell.el.textContent = '💣';
    }
  }
}

function checkWin(){
  if(cellsLeft === 0 && !gameOver){
    gameOver = true;
    clearInterval(timer); timer = null;
    messageEl.textContent = 'You Win';
    markMines();
    saveBestIfNeeded();
  }
}

function markMines(){
  for(let r=0;r<rows;r++) for(let c=0;c<cols;c++){
    const cell = grid[r][c];
    if(cell.mine){
      cell.el.classList.add('flag');
      cell.el.textContent = '🚩';
    }
  }
}

function saveBestIfNeeded(){
  const diff = difficultyEl.value;
  const b = loadBestTimes();
  if(b[diff] === null || seconds < b[diff]){
    b[diff] = seconds;
    saveBestTimes(b);
    updateBestUI();
    messageEl.textContent = `New Best ${seconds}s`;
  }
}

newBtn.addEventListener('click', ()=> {
  setDifficulty(difficultyEl.value);
  createBoard();
});

difficultyEl.addEventListener('change', ()=> {
  setDifficulty(difficultyEl.value);
  createBoard();
});

// init
setDifficulty(difficultyEl.value);
createBoard();
updateBestUI();
