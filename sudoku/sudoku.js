const Sudoku = (function(){
  function emptyGrid(){
    return Array.from({length:9},()=>Array(9).fill(0));
  }

  function isSafe(grid, row, col, num){
    for(let i=0;i<9;i++){
      if(grid[row][i] === num) return false;
      if(grid[i][col] === num) return false;
    }
    const sr = Math.floor(row/3)*3;
    const sc = Math.floor(col/3)*3;
    for(let r=sr;r<sr+3;r++){
      for(let c=sc;c<sc+3;c++){
        if(grid[r][c] === num) return false;
      }
    }
    return true;
  }

  function findEmpty(grid){
    for(let r=0;r<9;r++){
      for(let c=0;c<9;c++){
        if(grid[r][c] === 0) return [r,c];
      }
    }
    return null;
  }

  function solve(grid){
    const pos = findEmpty(grid);
    if(!pos) return true;
    const [r,c] = pos;
    for(let n=1;n<=9;n++){
      if(isSafe(grid,r,c,n)){
        grid[r][c] = n;
        if(solve(grid)) return true;
        grid[r][c] = 0;
      }
    }
    return false;
  }

  function generateFull(){
    const grid = emptyGrid();
    const nums = [1,2,3,4,5,6,7,8,9];
    function shuffle(a){
      for(let i=a.length-1;i>0;i--){
        const j = Math.floor(Math.random()*(i+1));
        [a[i],a[j]] = [a[j],a[i]];
      }
      return a;
    }
    function fill(){
      const pos = findEmpty(grid);
      if(!pos) return true;
      const [r,c] = pos;
      const order = shuffle(nums.slice());
      for(const n of order){
        if(isSafe(grid,r,c,n)){
          grid[r][c] = n;
          if(fill()) return true;
          grid[r][c] = 0;
        }
      }
      return false;
    }
    fill();
    return grid;
  }

  function makePuzzle(difficulty = 'medium'){
    const full = generateFull();
    const puzzle = full.map(row=>row.slice());
    let removals;
    if(difficulty === 'easy') removals = 36;
    else if(difficulty === 'hard') removals = 54;
    else removals = 46;
    const cells = [];
    for(let r=0;r<9;r++) for(let c=0;c<9;c++) cells.push([r,c]);
    for(let i=0;i<removals;i++){
      if(cells.length===0) break;
      const idx = Math.floor(Math.random()*cells.length);
      const [r,c] = cells.splice(idx,1)[0];
      puzzle[r][c] = 0;
    }
    return {puzzle, solution: full};
  }

  function cloneGrid(g){
    return g.map(row=>row.slice());
  }

  return {emptyGrid, isSafe, solve, generateFull, makePuzzle, cloneGrid};
})();
