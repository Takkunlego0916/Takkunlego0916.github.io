const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const restartBtn = document.getElementById('restart');

let x = canvas.width/2, y = canvas.height-30;
let dx = 2, dy = -2;
const ballRadius = 8;
const paddleHeight = 10, paddleWidth = 75;
let paddleX = (canvas.width-paddleWidth)/2;
let rightPressed=false, leftPressed=false;
let score=0;

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
initBricks();

document.addEventListener("keydown",e=>{ if(e.key==='Right' || e.key==='ArrowRight') rightPressed=true; if(e.key==='Left' || e.key==='ArrowLeft') leftPressed=true; });
document.addEventListener("keyup",e=>{ if(e.key==='Right' || e.key==='ArrowRight') rightPressed=false; if(e.key==='Left' || e.key==='ArrowLeft') leftPressed=false; });
canvas.addEventListener("mousemove",e=>{ const rect=canvas.getBoundingClientRect(); paddleX = e.clientX - rect.left - paddleWidth/2; });

restartBtn.addEventListener('click',resetGame);

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
          if(score === brickRowCount*brickColumnCount) { alert('You win!'); resetGame(); }
        }
      }
    }
  }
}

function drawBall(){ ctx.beginPath(); ctx.arc(x,y,ballRadius,0,Math.PI*2); ctx.fillStyle="#ffdd57"; ctx.fill(); ctx.closePath(); }
function drawPaddle(){ ctx.beginPath(); ctx.rect(paddleX, canvas.height-paddleHeight, paddleWidth, paddleHeight); ctx.fillStyle="#4caf50"; ctx.fill(); ctx.closePath(); }
function drawBricks(){
  for(let c=0;c<brickColumnCount;c++){
    for(let r=0;r<brickRowCount;r++){
      if(bricks[c][r].status){
        const brickX = (c*(brickWidth+brickPadding))+brickOffsetLeft;
        const brickY = (r*(brickHeight+brickPadding))+brickOffsetTop;
        bricks[c][r].x = brickX; bricks[c][r].y = brickY;
        ctx.beginPath();
        ctx.rect(brickX, brickY, brickWidth, brickHeight);
        ctx.fillStyle = `hsl(${(r/brickRowCount)*60 + c*10},70%,50%)`;
        ctx.fill(); ctx.closePath();
      }
    }
  }
}

function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  drawBricks(); drawBall(); drawPaddle(); collisionDetection();

  if(x + dx > canvas.width-ballRadius || x + dx < ballRadius) dx = -dx;
  if(y + dy < ballRadius) dy = -dy;
  else if(y + dy > canvas.height-ballRadius){
    if(x > paddleX && x < paddleX + paddleWidth) dy = -dy;
    else { alert('Game Over'); resetGame(); return; }
  }

  if(rightPressed && paddleX < canvas.width - paddleWidth) paddleX += 7;
  if(leftPressed && paddleX > 0) paddleX -= 7;

  x += dx; y += dy;
  requestAnimationFrame(draw);
}

function resetGame(){
  x = canvas.width/2; y = canvas.height-30; dx = 2; dy = -2; paddleX = (canvas.width-paddleWidth)/2; score=0; scoreEl.textContent='Score: 0'; initBricks();
}

draw();
