const boardEl = document.getElementById('board');
const scoreEl = document.getElementById('score');
const bestEl = document.getElementById('best');
const newBtn = document.getElementById('new');

const overlay = document.getElementById('overlay');
const ovTitle = document.getElementById('ov-title');
const ovMsg = document.getElementById('ov-msg');
const retryBtn = document.getElementById('retry');

let grid = new Array(16).fill(0);
let score = 0;
let best = 0;
let gameOver = false;
let gameClear = false;

function render(popIndex = []) {
  boardEl.innerHTML = '';

  for (let i = 0; i < 16; i++) {
    const cell = document.createElement('div');
    cell.className = 'cell';

    if (grid[i]) {
      const tile = document.createElement('div');
      tile.className = 'tile tile-' + grid[i];
      tile.textContent = grid[i];


      if (popIndex.includes(i)) {
        tile.classList.add('pop');
      }

      cell.appendChild(tile);
    }

    boardEl.appendChild(cell);
  }

  scoreEl.textContent = score;
  bestEl.textContent = best;
}

function addRandom() {
  const empties = grid.map((v, i) => v ? null : i).filter(v => v !== null);
  if (!empties.length) return null;

  const idx = empties[Math.floor(Math.random() * empties.length)];
  grid[idx] = Math.random() < 0.9 ? 2 : 4;
  return idx;
}

function slide(row) {
  let arr = row.filter(v => v !== 0);
  let result = [];
  let mergedIndex = [];

  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === arr[i + 1]) {
      const merged = arr[i] * 2;
      result.push(merged);
      score += merged;
      best = Math.max(best, score);
      i++;
      mergedIndex.push(result.length - 1);
    } else {
      result.push(arr[i]);
    }
  }

  while (result.length < 4) result.push(0);

  return { result, mergedIndex };
}

function move(dir) {
  if (gameOver) return;

  let moved = false;
  let popList = [];

  for (let r = 0; r < 4; r++) {
    let line = [];

    for (let c = 0; c < 4; c++) {
      const idx =
        dir === 'left' ? r * 4 + c :
        dir === 'right' ? r * 4 + (3 - c) :
        dir === 'up' ? c * 4 + r :
        (3 - c) * 4 + r;

      line.push(grid[idx]);
    }

    const { result, mergedIndex } = slide(line);

    for (let c = 0; c < 4; c++) {
      const idx =
        dir === 'left' ? r * 4 + c :
        dir === 'right' ? r * 4 + (3 - c) :
        dir === 'up' ? c * 4 + r :
        (3 - c) * 4 + r;

      if (grid[idx] !== result[c]) {
        grid[idx] = result[c];
        moved = true;
      }

      if (mergedIndex.includes(c)) {
        popList.push(idx);
      }
    }
  }

  if (moved) {
    const newTileIndex = addRandom();
    if (newTileIndex !== null) popList.push(newTileIndex);

    render(popList);
    checkGameState();
  }
}

function checkGameState() {
  if (grid.includes(2048) && !gameClear) {
    gameClear = true;
    showOverlay("ゲームクリア！", "2048達成！");
    return;
  }

  if (grid.includes(0)) return;

  for (let i = 0; i < 16; i++) {
    const v = grid[i];
    if (i % 4 !== 3 && v === grid[i + 1]) return;
    if (i < 12 && v === grid[i + 4]) return;
  }

  gameOver = true;
  showOverlay("ゲームオーバー", "もう動かせません");
}

function showOverlay(title, msg) {
  ovTitle.textContent = title;
  ovMsg.textContent = msg;
  overlay.classList.add('show');
}

function startGame() {
  grid = new Array(16).fill(0);
  score = 0;
  gameOver = false;
  gameClear = false;

  overlay.classList.remove('show');

  addRandom();
  addRandom();
  render();
}

window.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft') move('left');
  if (e.key === 'ArrowRight') move('right');
  if (e.key === 'ArrowUp') move('up');
  if (e.key === 'ArrowDown') move('down');
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

  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 30) move('right');
    else if (dx < -30) move('left');
  } else {
    if (dy > 30) move('down');
    else if (dy < -30) move('up');
  }
}, { passive: true });

newBtn.addEventListener('click', startGame);
retryBtn.addEventListener('click', startGame);

startGame();
