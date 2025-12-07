// js/game.js
export const SIZE = 8;
export const EMPTY = 0;
export const BLACK = 1;
export const WHITE = 2;

export const DIRS = [
  [-1, -1], [-1, 0], [-1, 1],
  [ 0, -1],          [ 0, 1],
  [ 1, -1], [ 1, 0], [ 1, 1],
];

export function opponent(color) {
  return color === BLACK ? WHITE : BLACK;
}

export function createInitialBoard() {
  const board = Array.from({ length: SIZE }, () => Array(SIZE).fill(EMPTY));
  const mid = SIZE / 2;
  board[mid - 1][mid - 1] = WHITE;
  board[mid][mid] = WHITE;
  board[mid - 1][mid] = BLACK;
  board[mid][mid - 1] = BLACK;
  return board;
}

export function inBounds(r, c) {
  return r >= 0 && c >= 0 && r < SIZE && c < SIZE;
}

export function canFlip(board, r, c, color) {
  if (board[r][c] !== EMPTY) return false;
  const opp = opponent(color);
  for (const [dr, dc] of DIRS) {
    let i = r + dr, j = c + dc;
    let seenOpp = false;
    while (inBounds(i, j) && board[i][j] === opp) {
      seenOpp = true;
      i += dr; j += dc;
    }
    if (seenOpp && inBounds(i, j) && board[i][j] === color) {
      return true;
    }
  }
  return false;
}

export function legalMoves(board, color) {
  const moves = [];
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (canFlip(board, r, c, color)) moves.push([r, c]);
    }
  }
  return moves;
}

export function applyMove(board, r, c, color) {
  const newBoard = board.map(row => row.slice());
  newBoard[r][c] = color;
  const opp = opponent(color);
  for (const [dr, dc] of DIRS) {
    let i = r + dr, j = c + dc;
    const path = [];
    while (inBounds(i, j) && newBoard[i][j] === opp) {
      path.push([i, j]);
      i += dr; j += dc;
    }
    if (path.length && inBounds(i, j) && newBoard[i][j] === color) {
      for (const [pr, pc] of path) newBoard[pr][pc] = color;
    }
  }
  return newBoard;
}

export function countScores(board) {
  let b = 0, w = 0;
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (board[r][c] === BLACK) b++;
      else if (board[r][c] === WHITE) w++;
    }
  }
  return { b, w };
}

export function isGameOver(board) {
  return legalMoves(board, BLACK).length === 0 &&
         legalMoves(board, WHITE).length === 0;
}

export function nextTurn(board, currentColor) {
  const moves = legalMoves(board, opponent(currentColor));
  if (moves.length > 0) return opponent(currentColor);
  const myMoves = legalMoves(board, currentColor);
  if (myMoves.length > 0) return currentColor;
  return null; // no moves for both
}
