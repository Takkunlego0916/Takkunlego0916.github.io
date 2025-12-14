// Basic setup
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
  y: 0,        // bottom-based y will be converted when drawing
  w: 40,
  h: 40,
  vy: 0,
  groundY: 300 // y position of player's top when on ground (canvas coords)
};

let obstacles = [];
const gravity = 0.9;
let baseSpeed = 4;
let spawnTimer = 0;

// Controls
startBtn.addEventListener('click', () => startGame());
restartBtn.addEventListener('click', () => startGame());
canvas.addEventListener('click', () => jump());
window.addEventListener('keydown', (e) => { if (e.code === 'Space') jump(); });

// Start / Reset
function startGame() {
  running = true;
  score = 0;
  obstacles = [];
  player.y = player.groundY;
  player.vy = 0;
  baseSpeed = 4;
  overlay.classList.add('hidden');
  startBtn.style.display = 'none';
}

// Jump
function jump() {
  if (!running) return;
  if (player.y >= player.groundY) {
    player.vy = -16;
  }
}

// Spawn obstacles
function spawnObstacle() {
  // variable sizes and gaps
  const h = 20 + Math.random() * 40;
  const w = 20 + Math.random() * 30;
  const y = player.groundY + player.h - h; // align bottom to ground
  obstacles.push({ x: canvas.width + 10, y: y, w: w, h: h });
}

// Improved AABB collision detection
function isColliding(a, b) {
  // a and b are rectangles with x,y (top-left), w,h
  return !(a.x + a.w < b.x || a.x > b.x + b.w || a.y + a.h < b.y || a.y > b.y + b.h);
}

// Update loop
function update(dt) {
  if (!running) return;

  // physics
  player.vy += gravity;
  player.y += player.vy;
  if (player.y > player.groundY) {
    player.y = player.groundY;
    player.vy = 0;
  }

  // obstacles movement
  for (let o of obstacles) {
    o.x -= baseSpeed;
  }
  // remove off-screen
  obstacles = obstacles.filter(o => o.x + o.w > -50);

  // spawn logic
  spawnTimer += dt;
  if (spawnTimer > 800 - Math.min(500, score * 2)) { // spawn faster as score increases
    spawnObstacle();
    spawnTimer = 0;
  }

  // increase difficulty slowly
  baseSpeed = 4 + Math.floor(score / 100);

  // scoring
  score += dt * 0.02;
  scoreEl.textContent = 'Score: ' + Math.floor(score);

  // collision check using proper rectangles
  const playerRect = { x: player.x, y: player.y - player.h, w: player.w, h: player.h };
  for (let o of obstacles) {
    const obsRect = { x: o.x, y: o.y, w: o.w, h: o.h };
    if (isColliding(playerRect, obsRect)) {
      endGame();
      break;
    }
  }
}

// Draw loop
function draw() {
  // clear
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // sky background (already in CSS but keep canvas clear)
  // ground
  ctx.fillStyle = '#8b5a2b';
  ctx.fillRect(0, player.groundY + player.h, canvas.width, canvas.height - (player.groundY + player.h));

  // player (draw using top-left coords)
  ctx.fillStyle = '#ff6347';
  ctx.fillRect(player.x, player.y - player.h, player.w, player.h);

  // obstacles
  ctx.fillStyle = '#222';
  for (let o of obstacles) {
    ctx.fillRect(o.x, o.y, o.w, o.h);
  }
}

// Game over handling
function endGame() {
  running = false;
  // update high score
  const final = Math.floor(score);
  if (final > highScore) {
    highScore = final;
    localStorage.setItem('endless_high', highScore);
  }
  // show overlay
  finalScoreEl.textContent = 'Score: ' + final;
  finalHighEl.textContent = 'High Score: ' + highScore;
  highEl.textContent = 'High: ' + highScore;
  overlay.classList.remove('hidden');
  startBtn.style.display = 'inline-block';
}

// Main loop with delta time
let last = performance.now();
function loop(now) {
  const dt = now - last;
  last = now;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

// initialize player on load
player.y = player.groundY;
