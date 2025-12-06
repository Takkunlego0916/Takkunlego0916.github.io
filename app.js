const boardEl=document.getElementById('board');
const scoreEl=document.getElementById('score');
const bestEl=document.getElementById('best');
const newBtn=document.getElementById('new');
const overlay=document.getElementById('overlay');
const ovTitle=document.getElementById('ov-title');
const ovMsg=document.getElementById('ov-msg');
const ovContinue=document.getElementById('ov-continue');
const ovNew=document.getElementById('ov-new');

let grid=new Array(16).fill(0);
let score=0;
let best=Number(localStorage.getItem('2048_best')||0);

function save(){localStorage.setItem('2048_grid',JSON.stringify(grid));localStorage.setItem('2048_score',score);localStorage.setItem('2048_best',best);}
function load(){const g=JSON.parse(localStorage.getItem('2048_grid')||'null');if(g)grid=g;score=Number(localStorage.getItem('2048_score')||0);best=Number(localStorage.getItem('2048_best')||best);}

function render(){
  boardEl.innerHTML='';
  for(let i=0;i<16;i++){
    const c=document.createElement('div');c.className='cell';
    if(grid[i]){
      const t=document.createElement('div');t.className='tile tile-'+grid[i];t.textContent=grid[i];
      c.appendChild(t);
    }
    boardEl.appendChild(c);
  }
  scoreEl.textContent=score;bestEl.textContent=best;save();
}

function addRandom(){const empt=grid.map((v,i)=>v?null:i).filter(n=>n!==null);if(!empt.length)return;grid[empt[Math.floor(Math.random()*empt.length)]]=Math.random()<0.9?2:4;}

function slide(row){
  const arr=row.filter(v=>v),res=[];
  for(let i=0;i<arr.length;i++){
    if(arr[i]===arr[i+1]){res.push(arr[i]*2);score+=arr[i]*2;if(score>best)best=score;i++;}else res.push(arr[i]);
  }
  while(res.length<4)res.push(0);
  return res;
}

function move(dir){
  let moved=false;const old=grid.slice();
  for(let r=0;r<4;r++){
    let line=[];
    for(let c=0;c<4;c++){
      const idx=dir==='left'?r*4+c:dir==='right'?r*4+(3-c):dir==='up'?c*4+r:(3-c)*4+r;
      line.push(grid[idx]);
    }
    const out=slide(line);
    for(let c=0;c<4;c++){
      const idx=dir==='
