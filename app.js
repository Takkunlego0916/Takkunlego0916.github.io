const boardEl=document.getElementById('board');
let grid=[...Array(16)].map(()=>0);
function render(){
  boardEl.innerHTML='';
  grid.forEach(v=>{
    const d=document.createElement('div'); d.textContent=v||''; boardEl.appendChild(d);
  });
}
function addRandom(){ const empty=grid.map((v,i)=>v?null:i).filter(n=>n!==null); if(!empty.length) return; grid[empty[Math.floor(Math.random()*empty.length)]]=Math.random()<0.9?2:4; }
addRandom(); addRandom(); render();
window.addEventListener('keydown',e=>{ if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)){ /* 移動ロジックを実装 */ render(); addRandom(); }});
