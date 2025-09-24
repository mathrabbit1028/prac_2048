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

function slideAndMergeRow(row: number[]): { row: number[]; scoreGained: number } {
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
  return { row: newRow, scoreGained: score };
}

function moveLeft(grid: Grid): { grid: Grid; moved: boolean; score: number } {
  let moved = false;
  let score = 0;
  const newGrid: Grid = grid.map((row) => {
    const { row: newRow, scoreGained } = slideAndMergeRow(row);
    if (!moved && newRow.some((v, i) => v !== row[i])) moved = true;
    score += scoreGained;
    return newRow;
  });
  return { grid: newGrid, moved, score };
}

function moveRight(grid: Grid): { grid: Grid; moved: boolean; score: number } {
  const reversed = reverseRows(grid);
  const { grid: movedGrid, moved, score } = moveLeft(reversed);
  return { grid: reverseRows(movedGrid), moved, score };
}

function moveUp(grid: Grid): { grid: Grid; moved: boolean; score: number } {
  const transposed = transpose(grid);
  const { grid: movedGrid, moved, score } = moveLeft(transposed);
  return { grid: transpose(movedGrid), moved, score };
}

function moveDown(grid: Grid): { grid: Grid; moved: boolean; score: number } {
  const transposed = transpose(grid);
  const { grid: movedGrid, moved, score } = moveRight(transposed);
  return { grid: transpose(movedGrid), moved, score };
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

function tileClasses(val: number): string {
  const base = "w-20 h-20 rounded-xl flex items-center justify-center font-bold text-xl shadow-inner";
  if (val === 0) return `${base} bg-transparent`;
  const text = val <= 4 ? "text-gray-800" : "text-white";
  return `${base} ${text} bg-[rgba(0,0,0,0.15)]`;
}

const App: React.FC = () => {
  const [grid, setGrid] = useState<Grid>(() => initGrid());
  const [score, setScore] = useState<number>(0);
  const [best, setBest] = useState<number>(() => Number(localStorage.getItem("best2048") || 0));
  const [history, setHistory] = useState<{ grid: Grid; score: number }[]>([]);
  const [gameOver, setGameOver] = useState<boolean>(false);

  const pushHistory = useCallback((g: Grid, s: number) => {
    setHistory((h) => [...h.slice(-9), { grid: cloneGrid(g), score: s }]);
  }, []);

  const applyMove = useCallback(
    (fn: (g: Grid) => { grid: Grid; moved: boolean; score: number }) => {
      setGrid((oldGrid) => {
        const { grid: newGrid, moved, score: gained } = fn(oldGrid);
        if (!moved) return oldGrid;
        const withTile = addRandomTile(cloneGrid(newGrid));
        setScore((oldScore) => {
          const ns = oldScore + gained;
          if (ns > best) {
            setBest(ns);
            localStorage.setItem("best2048", String(ns));
          }
          return ns;
        });
        pushHistory(oldGrid, score);
        return withTile;
      });
    },
    [best, pushHistory, score]
  );

  useEffect(() => {
    setGameOver(!canMove(grid));
  }, [grid]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (gameOver) return;
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
  }, [applyMove, gameOver]);

  const restart = () => {
    setGrid(initGrid());
    setScore(0);
    setHistory([]);
    setGameOver(false);
  };

  const undo = () => {
    setHistory((h) => {
      if (h.length === 0) return h;
      const last = h[h.length - 1];
      setGrid(cloneGrid(last.grid));
      setScore(last.score);
      return h.slice(0, -1);
    });
    setGameOver(false);
  };

  return (
    <div className="app">
      <div className="header">
        <h1>2048</h1>
        <div className="score-board">
          <div className="score-box">
            <div>Score</div>
            <div>{score}</div>
          </div>
          <div className="score-box">
            <div>Best</div>
            <div>{best}</div>
          </div>
          <button onClick={restart}>Restart</button>
          <button onClick={undo}>Undo</button>
        </div>
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
          <div>Press Restart to try again.</div>
        </div>
      ) : (
        <div className="info">Use arrow keys or WASD to move tiles.</div>
      )}
    </div>
  );
};

export default App;
