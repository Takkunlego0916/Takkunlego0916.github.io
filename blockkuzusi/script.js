const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const restartBtn = document.getElementById('restart');
const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlay-title');
const finalScore = document.getElementById('final-score');
const playAgainBtn = document.getElementById('play-again');

let x, y, dx, dy;
const ballRadius = 8;
const paddleHeight = 10, paddleWidth = 75;
let paddleX;

let rightPressed=false, leftPressed=false;
let score=0;

let animationId = null;
let isRunning = false;

const brickRowCount=5, brickColumnCount=7;
const brickWidth=55, brickHeight=15, brickPadding=10, brickOffsetTop=30, brickOffsetLeft=30;
let bricks=[];

function initBricks(){
  bricks=[];
  for(let c=0;c<brickColumnCount;c++){
    bricks[c]=[];
    for(let r=0;r<brickRowCount;r++){
      bricks[c][r]={x:0,y:0,status:1};
    }
  }
}

function resetState(){
  x = canvas.width/2;
  y = canvas.height-30;
  dx = 2;
  dy = -2;
  paddleX = (canvas.width-paddleWidth)/2;
  score = 0;
  scoreEl.textContent = 'Score: 0';
  initBricks();
}

resetState();

document.addEventListener("keydown",e=>{
  if(e.key==='Right' || e.key==='ArrowRight') rightPressed=true;
  if(e.key==='Left' || e.key==='ArrowLeft') leftPressed=true;
});
document.addEventListener("keyup",e=>{
  if(e.key==='Right' || e.key==='ArrowRight') rightPressed=false;
  if(e.key==='Left' || e.key==='ArrowLeft') leftPressed=false;
});

canvas.addEventListener("mousemove",e=>{
  const rect=canvas.getBoundingClientRect();
  paddleX = e.clientX - rect.left - paddleWidth/2;
});

let ongoingTouchId = null;

canvas.addEventListener("touchstart", e => {
  startGame();

  const touch = e.changedTouches[0];
  ongoingTouchId = touch.identifier;
  const rect = canvas.getBoundingClientRect();
  paddleX = touch.clientX - rect.left - paddleWidth/2;

  e.preventDefault();
}, {passive:false});

canvas.addEventListener("touchmove", e => {
  for (let i = 0; i < e.changedTouches.length; i++) {
    const touch = e.changedTouches[i];
    if (touch.identifier === ongoingTouchId) {
      const rect = canvas.getBoundingClientRect();
      paddleX = touch.clientX - rect.left - paddleWidth/2;
      if (paddleX < 0) paddleX = 0;
      if (paddleX > canvas.width - paddleWidth) paddleX = canvas.width - paddleWidth;
      break;
    }
  }
  e.preventDefault();
}, {passive:false});

canvas.addEventListener("touchend", () => {
  ongoingTouchId = null;
}, {passive:false});

canvas.addEventListener("click", () => {
  startGame();
});

restartBtn.addEventListener('click', resetGame);
restartBtn.addEventListener('touchstart', resetGame);

function startGame(){
  if (!isRunning){
    isRunning = true;
    draw();
  }
}

function stopGame(){
  isRunning = false;
  if (animationId) cancelAnimationFrame(animationId);
}

function resetGame(){
  stopGame();
  resetState();
  startGame();
}

function collisionDetection(){
  for(let c=0;c<brickColumnCount;c++){
    for(let r=0;r<brickRowCount;r++){
      const b=bricks[c][r];
      if(b.status){
        if(x > b.x && x < b.x+brickWidth && y > b.y && y < b.y+brickHeight){
          dy = -dy;
          b.status=0;
          score++;
          scoreEl.textContent = 'Score: ' + score;

          if(score === brickRowCount*brickColumnCount){
            if(score === brickRowCount*brickColumnCount){
              showGameOver("You Win!");
            }
            stopGame();
          }
        }
      }
    }
  }
}

function drawBall(){
  ctx.beginPath();
  ctx.arc(x,y,ballRadius,0,Math.PI*2);
  ctx.fillStyle="#ffdd57";
  ctx.fill();
  ctx.closePath();
}

function drawPaddle(){
  ctx.beginPath();
  ctx.rect(paddleX, canvas.height-paddleHeight, paddleWidth, paddleHeight);
  ctx.fillStyle="#4caf50";
  ctx.fill();
  ctx.closePath();
}

function drawBricks(){
  for(let c=0;c<brickColumnCount;c++){
    for(let r=0;r<brickRowCount;r++){
      if(bricks[c][r].status){
        const brickX = (c*(brickWidth+brickPadding))+brickOffsetLeft;
        const brickY = (r*(brickHeight+brickPadding))+brickOffsetTop;
        bricks[c][r].x = brickX;
        bricks[c][r].y = brickY;

        ctx.beginPath();
        ctx.rect(brickX, brickY, brickWidth, brickHeight);
        ctx.fillStyle = `hsl(${(r/brickRowCount)*60 + c*10},70%,50%)`;
        ctx.fill();
        ctx.closePath();
      }
    }
  }
}

function draw(){
  if (!isRunning) return;

  ctx.clearRect(0,0,canvas.width,canvas.height);

  drawBricks();
  drawBall();
  drawPaddle();
  collisionDetection();

  if(x + dx > canvas.width-ballRadius || x + dx < ballRadius) dx = -dx;
  if(y + dy < ballRadius) dy = -dy;
  else if(y + dy > canvas.height-ballRadius){
    if(x > paddleX && x < paddleX + paddleWidth){
      dy = -dy;
    } else {
      showGameOver("Game Over");
      return;
      stopGame();
      return;
    }
  }

  if(rightPressed && paddleX < canvas.width - paddleWidth) paddleX += 7;
  if(leftPressed && paddleX > 0) paddleX -= 7;

  if (paddleX < 0) paddleX = 0;
  if (paddleX > canvas.width - paddleWidth) paddleX = canvas.width - paddleWidth;

  x += dx;
  y += dy;

  animationId = requestAnimationFrame(draw);
}

function showGameOver(title){
  stopGame();
  overlayTitle.textContent = title;
  finalScore.textContent = "Score: " + score;
  overlay.classList.remove("hidden");
}

function hideOverlay(){
  overlay.classList.add("hidden");
}

playAgainBtn.addEventListener("click", () => {
  hideOverlay();
  resetGame();
});

playAgainBtn.addEventListener("touchstart", () => {
  hideOverlay();
  resetGame();
});
