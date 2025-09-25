import React, { useEffect, useState, useCallback } from "react";
import './app.css';

const SIZE = 4;
const START_TILES = 2;

type Grid = number[][];

function newEmptyGrid(): Grid {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
}

function cloneGrid(grid: Grid): Grid {
  return grid.map((row) => row.slice());
}

function addRandomTile(grid: Grid): Grid {
  const empties: [number, number][] = [];
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (grid[r][c] === 0) empties.push([r, c]);
    }
  }
  if (empties.length === 0) return grid;
  const [r, c] = empties[Math.floor(Math.random() * empties.length)];
  grid[r][c] = Math.random() < 0.9 ? 2 : 4;
  return grid;
}

function transpose(grid: Grid): Grid {
  const res = newEmptyGrid();
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) res[r][c] = grid[c][r];
  }
  return res;
}

function reverseRows(grid: Grid): Grid {
  return grid.map((row) => row.slice().reverse());
}

function slideAndMergeRow(row: number[]): { row: number[] } {
  const filtered = row.filter((v) => v !== 0);
  const newRow: number[] = [];
  let score = 0;
  for (let i = 0; i < filtered.length; i++) {
    if (filtered[i] === filtered[i + 1]) {
      const merged = filtered[i] * 2;
      newRow.push(merged);
      score += merged;
      i++;
    } else {
      newRow.push(filtered[i]);
    }
  }
  while (newRow.length < SIZE) newRow.push(0);
  return { row: newRow };
}

function moveLeft(grid: Grid): { grid: Grid; moved: boolean } {
  let moved = false;
  const newGrid: Grid = grid.map((row) => {
    const { row: newRow } = slideAndMergeRow(row);
    if (!moved && newRow.some((v, i) => v !== row[i])) moved = true;
    return newRow;
  });
  return { grid: newGrid, moved };
}

function moveRight(grid: Grid): { grid: Grid; moved: boolean } {
  const reversed = reverseRows(grid);
  const { grid: movedGrid, moved } = moveLeft(reversed);
  return { grid: reverseRows(movedGrid), moved };
}

function moveUp(grid: Grid): { grid: Grid; moved: boolean } {
  const transposed = transpose(grid);
  const { grid: movedGrid, moved } = moveLeft(transposed);
  return { grid: transpose(movedGrid), moved };
}

function moveDown(grid: Grid): { grid: Grid; moved: boolean } {
  const transposed = transpose(grid);
  const { grid: movedGrid, moved } = moveRight(transposed);
  return { grid: transpose(movedGrid), moved };
}

function canMove(grid: Grid): boolean {
  for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) if (grid[r][c] === 0) return true;
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const v = grid[r][c];
      if ((c < SIZE - 1 && grid[r][c + 1] === v) || (r < SIZE - 1 && grid[r + 1][c] === v)) return true;
    }
  }
  return false;
}

function initGrid(): Grid {
  let g = newEmptyGrid();
  for (let i = 0; i < START_TILES; i++) g = addRandomTile(g);
  return g;
}

const App: React.FC = () => {
  const [grid, setGrid] = useState<Grid>(() => initGrid());
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [gameWin, setGameWin] = useState<boolean>(false);

  const applyMove = useCallback(
    (fn: (g: Grid) => { grid: Grid; moved: boolean }) => {
      setGrid((oldGrid) => {
        const { grid: newGrid, moved } = fn(oldGrid);
        if (!moved) return oldGrid;
        const withTile = addRandomTile(cloneGrid(newGrid));
        return withTile;
      });
    },
    []
  );

  useEffect(() => {
    setGameOver(!canMove(grid));
  }, [grid]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (gameOver) return;
      if (gameWin) return;
      switch (e.key) {
        case "ArrowLeft":
        case "a":
        case "A":
          applyMove(moveLeft);
          break;
        case "ArrowRight":
        case "d":
        case "D":
          applyMove(moveRight);
          break;
        case "ArrowUp":
        case "w":
        case "W":
          applyMove(moveUp);
          break;
        case "ArrowDown":
        case "s":
        case "S":
          applyMove(moveDown);
          break;
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [applyMove, gameOver, gameWin]);

  useEffect(() => {
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (grid[r][c] === 128) {
          setGameWin(true);
          return;
        }
      }
    }
  }, [grid]);

  return (
    <div className="app">
      <div className="header">
        <h1>2048</h1>
      </div>

      <div className="board">
        {grid.flat().map((val, idx) => (
          <div key={idx} className={`tile tile-${val}`}>
            {val !== 0 ? val : ""}
          </div>
        ))}
      </div>

      {gameOver ? (
        <div className="game-over">
          <div>Game Over</div>
        </div>
      ) : gameWin ? (
        <div className="game-win">
          <div>You Win!</div>
        </div>
      ) : null}
    </div>
  );
};

export default App;
