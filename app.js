// app.js - スライドアニメーション対応の完全版
// 既存の index.html / style.css と組み合わせて動作します。
// board 要素を相対配置にし、タイルを絶対配置で transform による滑らかな移動を行います。

const boardEl = document.getElementById('board');
const scoreEl = document.getElementById('score');
const bestEl = document.getElementById('best');
const newBtn = document.getElementById('new');
const overlay = document.getElementById('overlay');
const ovTitle = document.getElementById('ov-title');
const ovMsg = document.getElementById('ov-msg');
const ovContinue = document.getElementById('ov-continue');
const ovNew = document.getElementById('ov-new');

let grid = new Array(16).fill(0);
let score = 0;
let best = Number(localStorage.getItem('2048_best') || 0);

// タイル管理：id -> { id, value, index, el }
let tiles = {};
let nextTileId = 1;

// レイアウト情報（動的に計算）
const layout = { padding: 12, gap: 12, cellSize: 72 };

// board を相対配置にする（CSS に無ければここで補う）
if (getComputedStyle(boardEl).position === 'static') {
  boardEl.style.position = 'relative';
}

/* ---------- 保存 / 読み込み ---------- */
function saveState() {
  localStorage.setItem('2048_grid', JSON.stringify(grid));
  localStorage.setItem('2048_score', String(score));
  localStorage.setItem('2048_best', String(best));
}
function loadState() {
  const g = JSON.parse(localStorage.getItem('2048_grid') || 'null');
  if (Array.isArray(g) && g.length === 16) grid = g.slice();
  score = Number(localStorage.getItem('2048_score') || 0);
  best = Number(localStorage.getItem('2048_best') || best);
}

/* ---------- レイアウト計算 ---------- */
function computeLayout() {
  const style = getComputedStyle(boardEl);
  const paddingLeft = parseFloat(style.paddingLeft) || layout.padding;
  const paddingRight = parseFloat(style.paddingRight) || layout.padding;
  const gap = parseFloat(style.gap) || layout.gap; // CSS gap may be supported
  const boardWidth = boardEl.clientWidth;
  // 4 cells, 3 gaps between them, padding left/right
  const cellSize = (boardWidth - paddingLeft - paddingRight - gap * 3) / 4;
  layout.padding = paddingLeft;
  layout.gap = gap;
  layout.cellSize = Math.max(24, Math.floor(cellSize)); // 最低サイズ確保
}

/* インデックス -> translate(x,y) を返す */
function indexToXY(index) {
  const row = Math.floor(index / 4);
  const col = index % 4;
  const x = layout.padding + col * (layout.cellSize + layout.gap);
  const y = layout.padding + row * (layout.cellSize + layout.gap);
  return { x, y };
}

/* ---------- タイル DOM 操作 ---------- */
function createTileAt(index, value, opts = { pop: true }) {
  const id = nextTileId++;
  const el = document.createElement('div');
  el.className = `tile tile-${value}`;
  el.textContent = value;
  el.style.position = 'absolute';
  el.style.width = `${layout.cellSize}px`;
  el.style.height = `${layout.cellSize}px`;
  el.style.lineHeight = `${layout.cellSize}px`;
  el.style.zIndex = 20;
  const pos = indexToXY(index);
  el.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
  if (opts.pop) el.classList.add('pop');
  boardEl.appendChild(el);
  if (opts.pop) {
    el.addEventListener('animationend', () => el.classList.remove('pop'), { once: true });
  }
  tiles[id] = { id, value, index, el };
  return id;
}

function setTilePositionByEl(el, index) {
  const pos = indexToXY(index);
  el.style.width = `${layout.cellSize}px`;
  el.style.height = `${layout.cellSize}px`;
  el.style.lineHeight = `${layout.cellSize}px`;
  el.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
}

function updateTileValue(id, newValue) {
  const t = tiles[id];
  if (!t) return;
  t.value = newValue;
  t.el.textContent = newValue;
  // update class for color
  t.el.className = `tile tile-${newValue}`;
}

/* フェードアウトして削除 */
function removeTile(id) {
  const t = tiles[id];
  if (!t) return;
  t.el.style.opacity = '0';
  t.el.addEventListener('transitionend', function fn() {
    t.el.removeEventListener('transitionend', fn);
    if (t.el.parentNode) t.el.parentNode.removeChild(t.el);
  }, { once: true });
  delete tiles[id];
}

/* ---------- 背景セル（見た目）描画 ---------- */
function drawBackgroundCells() {
  // 背景セルは既存の grid レンダリングと併用するため、ここでは何もしない
  // ただしレイアウトは再計算
  computeLayout();
}

/* ---------- 初期レンダリング（タイルを DOM に作る） ---------- */
function initialRenderTiles() {
  // 既存の tile DOM をクリア
  Object.values(tiles).forEach(t => { if (t.el.parentNode) t.el.parentNode.removeChild(t.el); });
  tiles = {}; nextTileId = 1;
  // create tiles for non-zero grid
  for (let i = 0; i < 16; i++) {
    if (grid[i]) createTileAt(i, grid[i], { pop: true });
  }
  scoreEl.textContent = score;
  bestEl.textContent = best;
  saveState();
}

/* ---------- スライド / マージの論理処理 ---------- */
function slideRow(arr) {
  const original = arr.slice();
  const filtered = arr.filter(v => v !== 0);
  const out = [];
  const mergedFlags = [];
  let i = 0;
  while (i < filtered.length) {
    if (i + 1 < filtered.length && filtered[i] === filtered[i + 1]) {
      out.push(filtered[i] * 2);
      mergedFlags.push(true);
      i += 2;
    } else {
      out.push(filtered[i]);
      mergedFlags.push(false);
      i += 1;
    }
  }
  while (out.length < 4) out.push(0);
  return { out, mergedFlags, changed: !arraysEqual(out, original) };
}
function arraysEqual(a, b) { return a.length === b.length && a.every((v, i) => v === b[i]); }

/* ---------- 移動処理（アニメーション付き） ---------- */
async function move(dir) {
  // dir: 'left','right','up','down'
  const oldGrid = grid.slice();
  // build posToTileId map (index -> tileId)
  const posToId = {};
  for (const id in tiles) {
    const t = tiles[id];
    posToId[t.index] = Number(id);
  }

  // compute new grid and moves/merges
  const newGrid = new Array(16).fill(0);
  const moves = []; // { id, fromIndex, toIndex }
  const merges = []; // { toIndex, value, sourceIds: [idA,idB] }

  for (let r = 0; r < 4; r++) {
    // collect line and indices in traversal order
    const line = [];
    const indices = [];
    for (let c = 0; c < 4; c++) {
      let idx;
      if (dir === 'left') idx = r * 4 + c;
      else if (dir === 'right') idx = r * 4 + (3 - c);
      else if (dir === 'up') idx = c * 4 + r;
      else idx = (3 - c) * 4 + r; // down
      line.push(grid[idx]);
      indices.push(idx);
    }
    const { out, mergedFlags } = slideRow(line);
    // place out into newGrid with same mapping
    for (let i = 0; i < 4; i++) {
      let idx;
      if (dir === 'left') idx = r * 4 + i;
      else if (dir === 'right') idx = r * 4 + (3 - i);
      else if (dir === 'up') idx = i * 4 + r;
      else idx = (3 - i) * 4 + r;
      newGrid[idx] = out[i];
    }

    // map sources -> targets for animation
    const sources = [];
    for (let i = 0; i < 4; i++) {
      if (line[i] !== 0) sources.push(indices[i]);
    }
    let sIdx = 0;
    for (let i = 0; i < 4; i++) {
      if (out[i] !== 0) {
        const targetIdx = (dir === 'left') ? r * 4 + i
          : (dir === 'right') ? r * 4 + (3 - i)
          : (dir === 'up') ? i * 4 + r
          : (3 - i) * 4 + r;
        if (mergedFlags[i]) {
          const srcA = sources[sIdx];
          const srcB = sources[sIdx + 1];
          const idA = posToId[srcA];
          const idB = posToId[srcB];
          // move one of them to target (prefer idA if exists)
          if (idA !== undefined) moves.push({ id: idA, fromIndex: srcA, toIndex: targetIdx });
          else if (idB !== undefined) moves.push({ id: idB, fromIndex: srcB, toIndex: targetIdx });
          merges.push({ toIndex: targetIdx, value: out[i], sourceIds: [idA, idB] });
          sIdx += 2;
        } else {
          const src = sources[sIdx];
          const id = posToId[src];
          if (id !== undefined) moves.push({ id, fromIndex: src, toIndex: targetIdx });
          sIdx += 1;
        }
      }
    }
  }

  // if no change, do nothing
  if (arraysEqual(oldGrid, newGrid)) return;

  // apply logical grid immediately
  grid = newGrid.slice();

  // animate moves (simultaneous)
  const anims = moves.map(m => {
    const t = tiles[m.id];
    if (!t) {
      // create a temporary tile at fromIndex with value from oldGrid
      const val = oldGrid[m.fromIndex];
      const tempId = createTileAt(m.fromIndex, val, { pop: false });
      m.id = tempId;
      return animateMove(tempId, m.toIndex);
    } else {
      return animateMove(m.id, m.toIndex);
    }
  });

  await Promise.all(anims);

  // handle merges
  for (const mg of merges) {
    const to = mg.toIndex;
    const newVal = mg.value;
    const [idA, idB] = mg.sourceIds;
    // find tile currently at 'to'
    let survivor = null;
    for (const id in tiles) {
      const t = tiles[id];
      if (t.index === to) { survivor = Number(id); break; }
    }
    if (!survivor) survivor = idA || idB;
    if (survivor && tiles[survivor]) {
      updateTileValue(survivor, newVal);
      tiles[survivor].el.classList.add('merge');
      setTimeout(() => tiles[survivor] && tiles[survivor].el.classList.remove('merge'), 160);
      // remove other source tiles
      [idA, idB].forEach(sid => {
        if (sid && sid !== survivor && tiles[sid]) removeTile(sid);
      });
      tiles[survivor].index = to;
    } else {
      // create new tile at to
      const nid = createTileAt(to, newVal, { pop: true });
      // remove sources
      [idA, idB].forEach(sid => { if (sid && tiles[sid]) removeTile(sid); });
      tiles[nid].index = to;
    }
    score += newVal;
    if (score > best) best = score;
  }

  // spawn new random tile (where oldGrid had 0 and new grid has value)
  const newIdx = findNewTileIndex(oldGrid, grid);
  if (newIdx !== null) {
    createTileAt(newIdx, grid[newIdx], { pop: true });
  }

  // cleanup: remove any tiles that no longer correspond to grid (safety)
  cleanupOrphanTiles();

  // update UI and save
  scoreEl.textContent = score;
  bestEl.textContent = best;
  saveState();

  // check end/win
  checkEnd();
}

/* アニメーションで移動（Promise） */
function animateMove(id, toIndex) {
  return new Promise(resolve => {
    const t = tiles[id];
    if (!t) { resolve(); return; }
    const onEnd = (ev) => {
      if (ev.propertyName !== 'transform') return;
      t.el.removeEventListener('transitionend', onEnd);
      t.index = toIndex;
      resolve();
    };
    t.el.addEventListener('transitionend', onEnd);
    // update size/position (in case of resize)
    t.el.style.width = `${layout.cellSize}px`;
    t.el.style.height = `${layout.cellSize}px`;
    setTimeout(() => { // ensure transition triggers
      setTilePositionByEl(t.el, toIndex);
    }, 0);
  });
}

/* 新しく追加されたタイルのインデックスを探す */
function findNewTileIndex(oldG, newG) {
  for (let i = 0; i < 16; i++) {
    if (oldG[i] === 0 && newG[i] !== 0) return i;
  }
  return null;
}

/* 孤立タイルの削除（grid と一致しないもの） */
function cleanupOrphanTiles() {
  // build set of indices that should have tiles
  const should = {};
  for (let i = 0; i < 16; i++) if (grid[i]) should[i] = grid[i];
  // for each tile, if its index not in should or value mismatch, remove it
  for (const id in tiles) {
    const t = tiles[id];
    if (!should.hasOwnProperty(t.index) || should[t.index] !== t.value) {
      // if value mismatch but index exists, prefer updating value instead of removing
      if (should.hasOwnProperty(t.index) && should[t.index] !== t.value) {
        updateTileValue(Number(id), should[t.index]);
      } else {
        // remove
        if (t.el.parentNode) t.el.parentNode.removeChild(t.el);
        delete tiles[id];
      }
    }
  }
}

/* ---------- ゲーム終了 / 勝利判定 ---------- */
function checkEnd() {
  if (grid.includes(2048)) {
    showOverlay('You win!', '2048 を達成しました。続けますか？', { showContinue: true });
    return;
  }
  if (grid.includes(0)) return;
  // check horizontal
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 3; c++) {
      if (grid[r * 4 + c] === grid[r * 4 + c + 1]) return;
    }
  }
  // check vertical
  for (let c = 0; c < 4; c++) {
    for (let r = 0; r < 3; r++) {
      if (grid[r * 4 + c] === grid[(r + 1) * 4 + c]) return;
    }
  }
  showOverlay('Game Over', 'これ以上動けません', { showContinue: false });
}

/* ---------- オーバーレイ制御 ---------- */
function showOverlay(title, msg, opts = { showContinue: false }) {
  if (!overlay) return;
  ovTitle.textContent = title;
  ovMsg.textContent = msg;
  ovContinue.style.display = opts.showContinue ? 'inline-block' : 'none';
  overlay.classList.add('show');
  overlay.setAttribute('aria-hidden', 'false');
}
function hideOverlay() {
  if (!overlay) return;
  overlay.classList.remove('show');
  overlay.setAttribute('aria-hidden', 'true');
}
if (ovNew) ovNew.addEventListener('click', () => { startNewGame(); hideOverlay(); });
if (ovContinue) ovContinue.addEventListener('click', () => { hideOverlay(); });

/* ---------- 入力（キーボード / タッチ） ---------- */
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

/* ---------- 新規ゲーム / 初期化 ---------- */
function addRandomInitialPreferBottomLeft() {
  const order = [12, 8, 4, 0, 13, 9, 5, 1, 14, 10, 6, 2, 15, 11, 7, 3];
  const empt = order.filter(i => grid[i] === 0);
  if (!empt.length) return null;
  const idx = empt[Math.floor(Math.random() * empt.length)];
  grid[idx] = Math.random() < 0.9 ? 2 : 4;
  return idx;
}

function addRandomNormal() {
  const empt = grid.map((v, i) => v === 0 ? i : null).filter(v => v !== null);
  if (!empt.length) return null;
  const idx = empt[Math.floor(Math.random() * empt.length)];
  grid[idx] = Math.random() < 0.9 ? 2 : 4;
  return idx;
}

function startNewGame() {
  grid = new Array(16).fill(0);
  score = 0;
  // 初期は左下寄せで2つ
  addRandomInitialPreferBottomLeft();
  addRandomInitialPreferBottomLeft();
  computeLayout();
  initialRenderTiles();
}

newBtn.addEventListener('click', startNewGame);

/* ---------- 初期化 ---------- */
function init() {
  loadState();
  computeLayout();
  // if grid empty, start new
  if (!grid.some(v => v !== 0)) {
    addRandomInitialPreferBottomLeft();
    addRandomInitialPreferBottomLeft();
  }
  initialRenderTiles();
  // resize 時にレイアウト再計算してタイルを再配置
  window.addEventListener('resize', () => {
    computeLayout();
    // update tile sizes and positions
    for (const id in tiles) {
      const t = tiles[id];
      setTilePositionByEl(t.el, t.index);
    }
  });
}

init();

