// 2048 完全実装（日本語UIに合わせ、初期タイルを左下に配置）
const boardEl = document.getElementById('board');
const scoreEl = document.getElementById('score');
const bestEl = document.getElementById('best');
const newBtn = document.getElementById('new');

let grid = new Array(16).fill(0);
let score = 0;
let best = Number(localStorage.getItem('2048_best') || 0);

// 保存と読み込み
function saveState(){
  localStorage.setItem('2048_grid', JSON.stringify(grid));
  localStorage.setItem('2048_score', String(score));
  localStorage.setItem('2048_best', String(best));
}
function loadState(){
  const g = JSON.parse(localStorage.getItem('2048_grid') || 'null');
  if(Array.isArray(g) && g.length===16) grid = g;
  score = Number(localStorage.getItem('2048_score') || 0);
  best = Number(localStorage.getItem('2048_best') || best);
}

// レンダリング
function renderWithAnimation(){
  boardEl.innerHTML = '';
  for(let i=0;i<16;i++){
    const cell = document.createElement('div');
    cell.className = 'cell';
    const val = grid[i];
    if(val){
      const tile = document.createElement('div');
      tile.className = 'tile tile-' + val;
      tile.textContent = val;
      cell.appendChild(tile);
    }
    boardEl.appendChild(cell);
  }
  scoreEl.textContent = score;
  bestEl.textContent = best;
  saveState();
}

// 初期タイルの配置を「左下」にする補助
// インデックスは 0..15 で左上が 0、右下が 15。左下はインデックス 12,13,14,15 のうち左側（12, 8...）
// 左下に2つ置くため、まず左下列（インデックス 12,8,4,0）を優先して空きを選ぶ
function addRandomPreferBottomLeft(){
  // 優先リスト：左下から上へ、次に左から右の順でボードを走査して左下寄せにする
  const order = [
    12,8,4,0,
    13,9,5,1,
    14,10,6,2,
    15,11,7,3
  ];
  const empt = order.filter(i=>grid[i]===0);
  if(!empt.length) return;
  const idx = empt[Math.floor(Math.random()*empt.length)];
  grid[idx] = Math.random() < 0.9 ? 2 : 4;
}

// 通常のランダム追加（補助としても使う）
function addRandomWithPop(){
  const empt = grid.map((v,i)=>v===0?i:null).filter(v=>v!==null);
  if(!empt.length) return;
  const idx = empt[Math.floor(Math.random()*empt.length)];
  grid[idx] = Math.random() < 0.9 ? 2 : 4;
}

// スライドとマージ（1行分）
function slideAndMerge(row){
  const arr = row.filter(v=>v!==0);
  const res = [];
  let i = 0;
  while(i < arr.length){
    if(i+1 < arr.length && arr[i] === arr[i+1]){
      const merged = arr[i]*2;
      res.push(merged);
      score += merged;
      if(score > best) best = score;
      i += 2;
    } else {
      res.push(arr[i]);
      i += 1;
    }
  }
  while(res.length < 4) res.push(0);
  return res;
}

// 移動処理
function move(direction){
  // direction: 'left','right','up','down'
  let moved = false;
  const old = grid.slice();

  for(let r=0;r<4;r++){
    // 1行分を取り出す（directionにより順序を変える）
    const line = [];
    for(let c=0;c<4;c++){
      let idx;
      if(direction === 'left') idx = r*4 + c;
      else if(direction === 'right') idx = r*4 + (3-c);
      else if(direction === 'up') idx = c*4 + r;
      else idx = (3-c)*4 + r; // down
      line.push(grid[idx]);
    }

    const out = slideAndMerge(line);

    for(let c=0;c<4;c++){
      let idx;
      if(direction === 'left') idx = r*4 + c;
      else if(direction === 'right') idx = r*4 + (3-c);
      else if(direction === 'up') idx = c*4 + r;
      else idx = (3-c)*4 + r;
      if(grid[idx] !== out[c]){
        grid[idx] = out[c];
        moved = true;
      }
    }
  }

  if(moved){
    // 新しいタイルは通常ランダムだが、初期数手は左下寄せの雰囲気を保つために
    addRandom();
    render();
    checkEnd();
  }
}

// 終了判定と勝利判定
function checkEnd(){
  if(grid.includes(2048)){
    setTimeout(()=>{ alert('You win! 2048 を達成しました'); }, 50);
    // 続けることも可能。ここでは通知のみ。
  }
  // 空きがあれば続行
  if(grid.includes(0)) return;
  // 横に同じがあれば続行
  for(let r=0;r<4;r++){
    for(let c=0;c<3;c++){
      if(grid[r*4+c] === grid[r*4+c+1]) return;
    }
  }
  // 縦に同じがあれば続行
  for(let c=0;c<4;c++){
    for(let r=0;r<3;r++){
      if(grid[r*4+c] === grid[(r+1)*4+c]) return;
    }
  }
  setTimeout(()=>{ alert('Game Over'); }, 50);
}

// キーボード操作
window.addEventListener('keydown', e=>{
  if(e.key.startsWith('Arrow')){
    e.preventDefault();
    if(e.key === 'ArrowLeft') move('left');
    if(e.key === 'ArrowRight') move('right');
    if(e.key === 'ArrowUp') move('up');
    if(e.key === 'ArrowDown') move('down');
  }
});

// タッチスワイプ操作
let startX = 0, startY = 0;
boardEl.addEventListener('touchstart', e=>{
  const t = e.touches[0];
  startX = t.clientX; startY = t.clientY;
}, {passive:true});
boardEl.addEventListener('touchend', e=>{
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
}, {passive:true});

// New Game
newBtn.addEventListener('click', ()=>{
  grid = new Array(16).fill(0);
  score = 0;
  // 初期は左下に寄せて2つ配置
  addRandomPreferBottomLeft();
  addRandomPreferBottomLeft();
  render();
});

// 初期化
loadState();
if(!grid.some(v=>v!==0)){
  // 新規ゲーム：左下に2つ
  addRandomPreferBottomLeft();
  addRandomPreferBottomLeft();
}
render();
// render() 内で新規タイルに pop クラスを付与する例
function render(newTiles=[]){
  boardEl.innerHTML='';
  for(let i=0;i<16;i++){
    const cell=document.createElement('div'); cell.className='cell';
    const val=grid[i];
    if(val){
      const tile=document.createElement('div');
      tile.className='tile tile-'+val;
      tile.textContent=val;
      if(newTiles.includes(i)) tile.classList.add('pop');
      cell.appendChild(tile);
    }
    boardEl.appendChild(cell);
  }
  scoreEl.textContent=score; bestEl.textContent=best; saveState();
}

// addRandom を newTiles を返すようにして render に渡す
function addRandomPreferBottomLeft(){
  const order=[12,8,4,0,13,9,5,1,14,10,6,2,15,11,7,3];
  const empt=order.filter(i=>grid[i]===0);
  if(!empt.length) return [];
  const idx=empt[Math.floor(Math.random()*empt.length)];
  grid[idx]=Math.random()<0.9?2:4;
  return [idx];
}

// move() の最後で新タイル位置を受け取り render(newTiles)
if(moved){
  const newTiles = addRandom();
  render(Array.isArray(newTiles)?newTiles:[]);
  checkEnd();
}

// オーバーレイ制御
const overlay=document.createElement('div'); overlay.className='overlay';
overlay.innerHTML=`<div class="panel"><h2 id="ov-title"></h2><div id="ov-msg"></div><button id="ov-new">New Game</button></div>`;
document.body.appendChild(overlay);
document.getElementById('ov-new').addEventListener('click', ()=>{ overlay.classList.remove('show'); newBtn.click(); });

function showOverlay(title,msg){ document.getElementById('ov-title').textContent=title; document.getElementById('ov-msg').textContent=msg; overlay.classList.add('show'); }

// checkEnd() 内で alert の代わりに showOverlay を呼ぶ
if(grid.includes(2048)) showOverlay('You win!','2048 を達成しました');
if(gameOver) showOverlay('Game Over','これ以上動けません');

/* --- アニメ用ヘルパー --- */

// タイル DOM を管理するマップ: index -> element
const tileEls = {}; // key: uniqueId (生成), value: {el, index, value}
let tileUid = 1;

// セルの左上座標を取得（board 内での相対位置）
function getCellRect(boardEl) {
  const rect = boardEl.getBoundingClientRect();
  const gap = 10; // 既存の gap に合わせる（必要なら調整）
  const size = (rect.width - gap * 5) / 4; // gap が 10px の想定
  return { size, gap, boardLeft: rect.left, boardTop: rect.top };
}

// 指定インデックス(0..15)に対応する translate 値を返す
function indexToTranslate(index) {
  const { size, gap } = getCellRect(boardEl);
  const row = Math.floor(index / 4);
  const col = index % 4;
  const x = gap + col * (size + gap);
  const y = gap + row * (size + gap);
  return { x, y, size };
}

// 新しいタイル要素を作る（アニメ用）
function createTileElement(index, value, pop = true) {
  const uid = tileUid++;
  const tile = document.createElement('div');
  tile.className = 'tile tile-' + value + (pop ? ' pop' : '');
  tile.textContent = value;
  tile.style.position = 'absolute';
  const pos = indexToTranslate(index);
  tile.style.width = pos.size + 'px';
  tile.style.height = pos.size + 'px';
  tile.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
  boardEl.appendChild(tile);
  tileEls[uid] = { el: tile, index, value };
  // remove pop class after animation
  if(pop) tile.addEventListener('animationend', ()=> tile.classList.remove('pop'), { once: true });
  return uid;
}

// 既存のセル内にあるテキスト要素をタイル化（初回レンダリング用）
function convertCellsToTiles() {
  // 既存の board がセル div を持っている前提。grid 配列に従ってタイルを作る
  // まず既存の tileEls を消す
  Object.values(tileEls).forEach(t => { if(t.el.parentNode) t.el.parentNode.removeChild(t.el); });
  Object.keys(tileEls).forEach(k => delete tileEls[k]);
  tileUid = 1;
  for(let i=0;i<16;i++){
    if(grid[i]){
      createTileElement(i, grid[i], true);
    }
  }
}

// タイルを index -> index に移動（transform で滑らかに）
function moveTileUidTo(uid, toIndex) {
  const t = tileEls[uid];
  if(!t) return Promise.resolve();
  const pos = indexToTranslate(toIndex);
  // update size in case of resize
  t.el.style.width = pos.size + 'px';
  t.el.style.height = pos.size + 'px';
  return new Promise(resolve => {
    const onEnd = (ev) => {
      if(ev.propertyName !== 'transform') return;
      t.el.removeEventListener('transitionend', onEnd);
      t.index = toIndex;
      resolve();
    };
    t.el.addEventListener('transitionend', onEnd);
    // trigger transform
    requestAnimationFrame(()=> t.el.style.transform = `translate(${pos.x}px, ${pos.y}px)`);
  });
}

// 指定 uid を削除（フェードアウト）
function removeTileUid(uid) {
  const t = tileEls[uid];
  if(!t) return;
  t.el.style.opacity = '0';
  t.el.addEventListener('transitionend', function fn(){
    t.el.removeEventListener('transitionend', fn);
    if(t.el.parentNode) t.el.parentNode.removeChild(t.el);
  }, { once: true });
  delete tileEls[uid];
}
