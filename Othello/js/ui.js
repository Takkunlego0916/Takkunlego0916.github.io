// js/ui.js
import { SIZE, EMPTY, BLACK, WHITE, legalMoves, applyMove, countScores, nextTurn, isGameOver } from './game.js';

export function renderBoard(container, board, hints = []) {
  container.innerHTML = '';
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const cell = document.createElement('button');
      cell.className = 'cell';
      cell.dataset.row = r;
      cell.dataset.col = c;
      if (board[r][c] !== EMPTY) {
        const disc = document.createElement('div');
        disc.className = 'disc ' + (board[r][c] === BLACK ? 'black' : 'white');
        cell.appendChild(disc);
      }
      if (hints.some(([hr, hc]) => hr === r && hc === c)) {
        const hint = document.createElement('div');
        hint.className = 'hint';
        cell.appendChild(hint);
      }
      container.appendChild(cell);
    }
  }
}

export function updateLegend({ board, turnLabelEl, scoreBEl, scoreWEl, statusEl, turn }) {
  const { b, w } = countScores(board);
  scoreBEl.textContent = b;
  scoreWEl.textContent = w;
  turnLabelEl.textContent = turn === BLACK ? '黒' : '白';

  if (isGameOver(board)) {
    if (b > w) statusEl.textContent = '勝者：黒';
    else if (w > b) statusEl.textContent = '勝者：白';
    else statusEl.textContent = '引き分け';
  } else {
    const moves = legalMoves(board, turn);
    statusEl.textContent = moves.length === 0 ? 'パス' : '';
  }
}

export function bindBoardClicks(container, onClick) {
  container.addEventListener('click', (e) => {
    const cell = e.target.closest('.cell');
    if (!cell) return;
    const r = Number(cell.dataset.row);
    const c = Number(cell.dataset.col);
    onClick(r, c);
  });
}
