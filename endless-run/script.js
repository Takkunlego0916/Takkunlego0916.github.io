const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const scoreEl = document.getElementById('score');
const highEl = document.getElementById('highscore');
const startBtn = document.getElementById('start');
const overlay = document.getElementById('overlay');
const finalScoreEl = document.getElementById('final-score');
const finalHighEl = document.getElementById('final-high');
const restartBtn = document.getElementById('restart');

let running = false;
let score = 0;
let highScore = Number(localStorage.getItem('endless_high') || 0);

highEl.textContent = 'High: ' + highScore;

const player = {
  x: 60,
  y: 0,
  w: 40,
  h: 40,
  vy: 0,
  groundY: 300
};

let obstacles = [];
const gravity = 0.9;
let baseSpeed = 4;
let spawnTimer = 0;

startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);
canvas.addEventListener('click', jump);
window.addEventListener('keydown', (e) => {
  if (e.code === 'Space') jump();
});

function startGame() {
  running = true;
  score = 0;
  obstacles = [];
  player.y = player.groundY;
  player.vy = 0;
  baseSpeed = 4;
  spawnTimer = 0;

  overlay.classList.add('hidden');
  startBtn.style.display = 'none';
}

function jump() {
  if (!running) return;
  if (player.y >= player.groundY) {
    player.vy = -18;
  }
}

function spawnObstacle() {
  const h = 30 + Math.random() * 40;
  const w = 25 + Math.random() * 30;

  const y = player.groundY;

  obstacles.push({
    x: canvas.width + 20,
    y: y,
    w: w,
    h: h
  });
}

function isColliding(a, b) {
  return !(
    a.x + a.w < b.x ||
    a.x > b.x + b.w ||
    a.y + a.h < b.y ||
    a.y > b.y + b.h
  );
}

function update(dt) {
  if (!running) return;

  player.vy += gravity;
  player.y += player.vy;

  if (player.y > player.groundY) {
    player.y = player.groundY;
    player.vy = 0;
  }

  for (let o of obstacles) {
    o.x -= baseSpeed;
  }

  obstacles = obstacles.filter(o => o.x + o.w > -50);

  spawnTimer += dt;
  if (spawnTimer > 700 - Math.min(400, score * 2)) {
    spawnObstacle();
    spawnTimer = 0;
  }

  baseSpeed = 4 + Math.floor(score / 120);

  score += dt * 0.02;
  scoreEl.textContent = 'Score: ' + Math.floor(score);

  const playerRect = {
    x: player.x,
    y: player.y - player.h,
    w: player.w,
    h: player.h
  };

  for (let o of obstacles) {
    const obsRect = {
      x: o.x,
      y: o.y - o.h,
      w: o.w,
      h: o.h
    };

    if (isColliding(playerRect, obsRect)) {
      endGame();
      break;
    }
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#8b5a2b';
  ctx.fillRect(
    0,
    player.groundY,
    canvas.width,
    canvas.height - player.groundY
  );

  ctx.fillStyle = '#ff6347';
  ctx.fillRect(
    player.x,
    player.y - player.h,
    player.w,
    player.h
  );

  ctx.fillStyle = '#222';
  for (let o of obstacles) {
    ctx.fillRect(
      o.x,
      o.y - o.h,
      o.w,
      o.h
    );
  }
}

function endGame() {
  running = false;

  const final = Math.floor(score);
  if (final > highScore) {
    highScore = final;
    localStorage.setItem('endless_high', highScore);
  }

  finalScoreEl.textContent = 'Score: ' + final;
  finalHighEl.textContent = 'High Score: ' + highScore;
  highEl.textContent = 'High: ' + highScore;

  overlay.classList.remove('hidden');
  startBtn.style.display = 'inline-block';
}

let last = performance.now();

function loop(now) {
  const dt = now - last;
  last = now;

  update(dt);
  draw();

  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);

player.y = player.groundY;
