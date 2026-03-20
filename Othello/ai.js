import { SIZE, EMPTY, BLACK, WHITE, opponent, legalMoves, applyMove, countScores, isGameOver } from './game.js';

const DIFFICULTIES = {
  1: { depth: 2, weighting: { corner: 40, edge: 6, mobility: 12, parity: 8, disc: 1 } },
  3: { depth: 4, weighting: { corner: 60, edge: 10, mobility: 16, parity: 10, disc: 1 } },
  5: { depth: 5, weighting: { corner: 90, edge: 14, mobility: 20, parity: 12, disc: 1 } },
};

const POSITION_WEIGHTS = (() => {
  const W = Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
  const corner = 25, nearCornerBad = -8, edge = 4, inner = 1;
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const isCorner = (r === 0 || r === SIZE-1) && (c === 0 || c === SIZE-1);
      const isEdge = r === 0 || r === SIZE-1 || c === 0 || c === SIZE-1;
      const isNearCorner =
        (r === 0 && c === 1) || (r === 1 && c === 0) ||
        (r === 0 && c === SIZE-2) || (r === 1 && c === SIZE-1) ||
        (r === SIZE-2 && c === 0) || (r === SIZE-1 && c === 1) ||
        (r === SIZE-2 && c === SIZE-1) || (r === SIZE-1 && c === SIZE-2);
      if (isCorner) W[r][c] = corner;
      else if (isNearCorner) W[r][c] = nearCornerBad;
      else if (isEdge) W[r][c] = edge;
      else W[r][c] = inner;
    }
  }
  return W;
})();

function evaluate(board, color, weighting) {
  const myMoves = legalMoves(board, color).length;
  const oppMoves = legalMoves(board, opponent(color)).length;
  const mobility = myMoves - oppMoves;

  let posScore = 0;
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (board[r][c] === color) posScore += POSITION_WEIGHTS[r][c];
      else if (board[r][c] === opponent(color)) posScore -= POSITION_WEIGHTS[r][c];
    }
  }

  const { b, w } = countScores(board);
  const discScore = (color === BLACK ? b - w : w - b);

  const empties = SIZE * SIZE - b - w;
  const parity = empties % 2 === 0 ? 1 : -1;

  const score =
    weighting.corner * posScore +
    weighting.edge * edgeControl(board, color) +
    weighting.mobility * mobility +
    weighting.parity * parity +
    weighting.disc * discScore;

  return score;
}

function edgeControl(board, color) {
  let s = 0;
  const addIf = (r, c) => {
    if (board[r][c] === color) s += 1;
    else if (board[r][c] === opponent(color)) s -= 1;
  };
  for (let i = 0; i < SIZE; i++) {
    addIf(0, i); addIf(SIZE-1, i); addIf(i, 0); addIf(i, SIZE-1);
  }
  return s;
}

function terminalScore(board, color) {
  const { b, w } = countScores(board);
  const diff = color === BLACK ? b - w : w - b;
  return diff * 10000;
}

function search(board, color, depth, alpha, beta, weighting) {
  if (depth <= 0 || isGameOver(board)) {
    if (isGameOver(board)) return { score: terminalScore(board, color), move: null };
    return { score: evaluate(board, color, weighting), move: null };
  }

  const moves = legalMoves(board, color);
  if (moves.length === 0) {
    const res = search(board, opponent(color), depth - 1, alpha, beta, weighting);
    return { score: -res.score, move: null };
  }

  moves.sort((a, b) => POSITION_WEIGHTS[b[0]][b[1]] - POSITION_WEIGHTS[a[0]][a[1]]);

  let bestMove = moves[0];
  for (const [r, c] of moves) {
    const child = applyMove(board, r, c, color);
    const res = search(child, opponent(color), depth - 1, -beta, -alpha, weighting);
    const score = -res.score;
    if (score > alpha) {
      alpha = score;
      bestMove = [r, c];
    }
    if (alpha >= beta) break;
  }
  return { score: alpha, move: bestMove };
}

export function chooseMove(board, aiColor, level = 3) {
  const cfg = DIFFICULTIES[level] || DIFFICULTIES[3];
  let depth = cfg.depth;

  const { b, w } = countScores(board);
  const empties = SIZE * SIZE - b - w;
  if (empties <= 12) depth += 1;
  if (empties <= 8) depth += 1;

  const res = search(board, aiColor, depth, -Infinity, Infinity, cfg.weighting);
  return res.move;
}
