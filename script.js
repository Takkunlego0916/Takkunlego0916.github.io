const display = document.getElementById('display');
let current = '';
let lastResult = null;

document.querySelector('.keys').addEventListener('click', e=>{
  if(!e.target.matches('button')) return;
  const v = e.target.textContent;
  const action = e.target.dataset.action;

  if(action==='clear'){ current=''; display.textContent='0'; return; }
  if(action==='back'){ current = current.slice(0,-1); display.textContent = current||'0'; return; }
  if(action==='equals'){ try{ const res = eval(current.replace(/%/g,'/100')); display.textContent = res; lastResult = res; current = String(res); }catch{ display.textContent='Error'; current=''; } return; }
  if(action==='operator'){ current += v; display.textContent = current; return; }

  // number or dot or percent
  current += v;
  display.textContent = current;
});
