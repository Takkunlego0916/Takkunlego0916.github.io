// app.js
// UI とイベントハンドラ
document.addEventListener('DOMContentLoaded', ()=>{
  const boardEl = document.getElementById('board');
  const statusEl = document.getElementById('status');
  const newBtn = document.getElementById('newBtn');
  const solveBtn = document.getElementById('solveBtn');
  const checkBtn = document.getElementById('checkBtn');
  const clearBtn = document.getElementById('clearBtn');
  const difficultyEl = document.getElementById('difficulty');

  let puzzle = null;
  let solution = null;
  let fixed = Array.from({length:9},()=>Array(9).fill(false));

  // ボードを作る
  function buildBoard(){
    boardEl.innerHTML = '';
    for(let r=0;r<9;r++){
      for(let c=0;c<9;c++){
        const cell = document.createElement('div');
        cell.className = 'cell';
        // 太線の調整
        if(c%3===2) cell.classList.add('thick-right');
        if(r%3===2) cell.classList.add('thick-bottom');
        if(c%3===0) cell.classList.add('thick-left');
        if(r%3===0) cell.classList.add('thick-top');

        const input = document.createElement('input');
        input.type = 'text';
        input.inputMode = 'numeric';
        input.maxLength = 1;
        input.dataset.r = r;
        input.dataset.c = c;

        input.addEventListener('input', onInput);
        input.addEventListener('keydown', onKeyDown);

        cell.appendChild(input);
        boardEl.appendChild(cell);
      }
    }
  }

  function onKeyDown(e){
    const allowed = ['Backspace','Delete','ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Tab'];
    if(allowed.includes(e.key)) return;
    if(!/^[1-9]$/.test(e.key)) e.preventDefault();
  }

  function onInput(e){
    const el = e.target;
    const v = el.value.replace(/[^1-9]/g,'');
    el.value = v;
    const r = +el.dataset.r;
    const c = +el.dataset.c;
    if(v === '') puzzle[r][c] = 0;
    else puzzle[r][c] = Number(v);
    // 自動で次へ移動
    if(v !== ''){
      const next = getCell(r,c+1) || getCell(r+1,0);
      if(next) next.focus();
    }
  }

  function getCell(r,c){
    if(r<0||r>8||c<0||c>8) return null;
    const idx = r*9 + c;
    return boardEl.children[idx].querySelector('input');
  }

  // パズルを表示
  function render(puz, sol=null){
    puzzle = Sudoku.cloneGrid(puz);
    solution = sol ? Sudoku.cloneGrid(sol) : null;
    fixed = Array.from({length:9},()=>Array(9).fill(false));
    for(let r=0;r<9;r++){
      for(let c=0;c<9;c++){
        const input = getCell(r,c);
        const val = puzzle[r][c];
        input.value = val === 0 ? '' : String(val);
        input.disabled = false;
        input.parentElement.classList.remove('fixed','error');
        if(val !== 0){
          input.disabled = true;
          input.parentElement.classList.add('fixed');
          fixed[r][c] = true;
        }
      }
    }
    statusEl.textContent = '';
  }

  // 新しいパズル生成
  function newPuzzle(){
    const diff = difficultyEl.value;
    const res = Sudoku.makePuzzle(diff);
    render(res.puzzle, res.solution);
  }

  // 解く（解答を表示）
  function solvePuzzle(){
    if(!solution){
      // コピーして解く
      const copy = Sudoku.cloneGrid(puzzle);
      if(Sudoku.solve(copy)){
        render(copy, copy);
      } else {
        statusEl.textContent = '解けませんでした';
      }
    } else {
      render(solution, solution);
    }
  }

  // チェック（矛盾を赤表示）
  function checkPuzzle(){
    // まず全てのエラー表示をクリア
    for(let r=0;r<9;r++) for(let c=0;c<9;c++) getCell(r,c).parentElement.classList.remove('error');

    let ok = true;
    for(let r=0;r<9;r++){
      for(let c=0;c<9;c++){
        const v = puzzle[r][c];
        if(v === 0) { ok = false; continue; }
        // 一時的に消してチェック
        puzzle[r][c] = 0;
        if(!Sudoku.isSafe(puzzle, r, c, v)){
          getCell(r,c).parentElement.classList.add('error');
          ok = false;
        }
        puzzle[r][c] = v;
      }
    }
    statusEl.textContent = ok ? '今のところ矛盾はありません' : '矛盾があります（赤）';
  }

  // クリア（固定以外を消す）
  function clearPuzzle(){
    for(let r=0;r<9;r++){
      for(let c=0;c<9;c++){
        if(!fixed[r][c]){
          puzzle[r][c] = 0;
          getCell(r,c).value = '';
          getCell(r,c).parentElement.classList.remove('error');
        }
      }
    }
    statusEl.textContent = '';
  }

  // 初期化
  buildBoard();
  newPuzzle();

  // イベント
  newBtn.addEventListener('click', newPuzzle);
  solveBtn.addEventListener('click', solvePuzzle);
  checkBtn.addEventListener('click', checkPuzzle);
  clearBtn.addEventListener('click', clearPuzzle);

  // キーボードで数字入力後に自動チェック（任意）
  boardEl.addEventListener('input', ()=>{
    // 自動で解答と比較して完全一致なら成功表示
    if(!solution) return;
    let complete = true;
    for(let r=0;r<9;r++){
      for(let c=0;c<9;c++){
        if(puzzle[r][c] === 0 || puzzle[r][c] !== solution[r][c]) { complete = false; break; }
      }
      if(!complete) break;
    }
    if(complete) statusEl.textContent = '完成！おめでとうございます';
  });
});
