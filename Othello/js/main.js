// js/main.js
import { createInitialBoard, BLACK, WHITE, legalMoves, applyMove, nextTurn, isGameOver } from './game.js';
import { renderBoard, updateLegend, bindBoardClicks } from './ui.js';
import { chooseMove } from './ai.js';

const els = {
  board: document.getElementById('board'),
  scoreB: document.getElementById('scoreB'),
  scoreW: document.getElementById('scoreW'),
  turnLabel: document.getElementById('turnLabel'),
  status: document.getElementById('status'),
  newGameBtn: document.getElementById('newGameBtn'),
  undoBtn: document.getElementById('undoBtn'),
  hintBtn: document.getElementById('hintBtn'),
  humanColorSel: document.getElementById('humanColor'),
  difficultySel: document.getElementById('difficulty'),
};

let state = {
  board: createInitialBoard(),
  turn: BLACK,
  humanColor: BLACK,
  aiColor: WHITE,
  difficulty: 3,
  history: [],
  hintsOn: false,
  aiThinking: false,
};

function startNewGame() {
  state = {
    board: createInitialBoard(),
    turn: BLACK,
    humanColor: els.humanColorSel.value === 'B' ? BLACK : WHITE,
    aiColor: els.humanColorSel.value === 'B' ? WHITE : BLACK,
    difficulty: Number(els.difficultySel.value),
    history: [],
    hintsOn: false,
    aiThinking: false,
  };
  draw();
  maybeAIMove();
}

function draw() {
  const hints = state.hintsOn ? legalMoves(state.board, state.turn) : [];
  renderBoard(els.board, state.board, hints);
  updateLegend({
    board: state.board,
    turnLabelEl: els.turnLabel,
    scoreBEl: els.scoreB,
    scoreWEl: els.scoreW,
    statusEl: els.status,
    turn: state.turn,
  });
}

function handleHumanClick(r, c) {
  if (isGameOver(state.board) || state.aiThinking) return;
  if (state.turn !== state.humanColor) return;
  const moves = legalMoves(state.board, state.turn);
  if (!moves.some(([mr, mc]) => mr === r && mc === c)) return;

  state.history.push({ board: state.board, turn: state.turn });
  state.board = applyMove(state.board, r, c, state.turn);
  state.turn = nextTurn(state.board, state.turn);
  draw();
  maybeAIMove();
}

function maybeAIMove() {
  if (isGameOver(state.board)) return;
  if (state.turn !== state.aiColor) return;
  const moves = legalMoves(state.board, state.turn);
  if (moves.length === 0) {
    state.turn = nextTurn(state.board, state.turn);
    draw();
    return;
  }

  state.aiThinking = true;
  els.status.textContent = 'AI思考中…';

  // 思考を少し遅らせてUI更新
  setTimeout(() => {
    const move = chooseMove(state.board, state.aiColor, state.difficulty);
    state.aiThinking = false;
    if (!move) {
      state.turn = nextTurn(state.board, state.turn);
      draw();
      return;
    }
    const [r, c] = move;
    state.history.push({ board: state.board, turn: state.turn });
    state.board = applyMove(state.board, r, c, state.turn);
    state.turn = nextTurn(state.board, state.turn);
    draw();
  }, 120);
}

function undo() {
  if (!state.history.length || state.aiThinking) return;
  const last = state.history.pop();
  state.board = last.board;
  state.turn = last.turn;
  draw();
}

function toggleHints() {
  state.hintsOn = !state.hintsOn;
  draw();
}

function bindUI() {
  bindBoardClicks(els.board, handleHumanClick);
  els.newGameBtn.addEventListener('click', startNewGame);
  els.undoBtn.addEventListener('click', undo);
  els.hintBtn.addEventListener('click', toggleHints);
  els.humanColorSel.addEventListener('change', () => {
    state.humanColor = els.humanColorSel.value === 'B' ? BLACK : WHITE;
    state.aiColor = state.humanColor === BLACK ? WHITE : BLACK;
    startNewGame();
  });
  els.difficultySel.addEventListener('change', () => {
    state.difficulty = Number(els.difficultySel.value);
  });
}

function init() {
  bindUI();
  draw();
  maybeAIMove();
}

init();
