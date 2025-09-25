import React, { useEffect, useState } from "react";
import "./app.css";

const SIZE = 4;

type Tile = {
  id: number;
  value: number;
  row: number;
  col: number;
};

let nextId = 1;

function newEmptyBoard(): Tile[] {
  return [];
}

function getEmptyCells(tiles: Tile[]): [number, number][] {
  const occupied = new Set(tiles.map((t) => `${t.row},${t.col}`));
  const cells: [number, number][] = [];
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (!occupied.has(`${r},${c}`)) cells.push([r, c]);
    }
  }
  return cells;
}

function addRandomTile(tiles: Tile[]): Tile[] {
  const empties = getEmptyCells(tiles);
  if (empties.length === 0) return tiles;
  const [row, col] = empties[Math.floor(Math.random() * empties.length)];
  const value = Math.random() < 0.9 ? 2 : 4;
  return [...tiles, { id: nextId++, value, row, col }];
}

function canMove(tiles: Tile[]): boolean {
  if (tiles.length < SIZE * SIZE) return true;
  const grid: number[][] = Array.from({ length: SIZE }, () =>
    Array(SIZE).fill(0)
  );
  tiles.forEach((t) => (grid[t.row][t.col] = t.value));
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const v = grid[r][c];
      if ((c < SIZE - 1 && grid[r][c + 1] === v) || (r < SIZE - 1 && grid[r + 1][c] === v)) {
        return true;
      }
    }
  }
  return false;
}

function slideRow(row: (Tile | null)[]): { newRow: (Tile | null)[]; merged: boolean } {
  const vals = row.filter((t) => t !== null) as Tile[];
  const newRow: (Tile | null)[] = [];
  let merged = false;

  for (let i = 0; i < vals.length; i++) {
    if (i < vals.length - 1 && vals[i].value === vals[i + 1].value) {
      const mergedTile: Tile = {
        id: nextId++,
        value: vals[i].value * 2,
        row: 0,
        col: 0,
      };
      newRow.push(mergedTile);
      merged = true;
      i++;
    } else {
      newRow.push({ ...vals[i] });
    }
  }
  while (newRow.length < SIZE) newRow.push(null);
  return { newRow, merged };
}

function moveTiles(tiles: Tile[], dir: string): { tiles: Tile[]; moved: boolean } {
  let moved = false;
  let _merged = false;

  // grid 형태로 변환
  const grid: (Tile | null)[][] = Array.from({ length: SIZE }, () =>
    Array(SIZE).fill(null)
  );
  tiles.forEach((t) => {
    grid[t.row][t.col] = t;
  });

  if (dir === "ArrowLeft" || dir === "ArrowRight") {
    for (let r = 0; r < SIZE; r++) {
      let row = grid[r].slice();
      if (dir === "ArrowRight") row = row.reverse();
      const { newRow, merged: rowMerged } = slideRow(row);
      if (dir === "ArrowRight") newRow.reverse();
      for (let c = 0; c < SIZE; c++) {
        const old = grid[r][c];
        const nu = newRow[c];
        if (old?.id !== nu?.id) moved = true;
        if (nu) {
          nu.row = r;
          nu.col = c;
        }
      }
      grid[r] = newRow;
      if (rowMerged) _merged = true;
    }
  } else {
    for (let c = 0; c < SIZE; c++) {
      let col = grid.map((row) => row[c]);
      if (dir === "ArrowDown") col = col.reverse();
      const { newRow, merged: colMerged } = slideRow(col);
      if (dir === "ArrowDown") newRow.reverse();
      for (let r = 0; r < SIZE; r++) {
        const nu = newRow[r];
        if (nu) {
          nu.row = r;
          nu.col = c;
        }
      }
      for (let r = 0; r < SIZE; r++) {
        const old = grid[r][c];
        const nu = newRow[r];
        if (old?.id !== nu?.id) moved = true;
        grid[r][c] = nu;
      }
      if (colMerged) _merged = true;
    }
  }

  const newTiles = grid.flat().filter((t) => t !== null) as Tile[];
  return { tiles: newTiles, moved };
}

const App: React.FC = () => {
  const [tiles, setTiles] = useState<Tile[]>(() => {
    let init = newEmptyBoard();
    init = addRandomTile(init);
    init = addRandomTile(init);
    return init;
  });
  const [gameOver, setGameOver] = useState(false);
  const [gameWin, setGameWin] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (gameOver || gameWin) return;
      if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) {
        const { tiles: newTiles, moved } = moveTiles(tiles, e.key);
        if (moved) {
          const withNew = addRandomTile(newTiles);
          setTiles(withNew);
          if (!canMove(withNew)) setGameOver(true);
          if (withNew.some((t) => t.value >= 128)) setGameWin(true);
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [tiles, gameOver, gameWin]);

  function restart() {
    let init: Tile[] = [];
    init = addRandomTile(init);
    init = addRandomTile(init);
    setTiles(init);
    setGameOver(false);
    setGameWin(false);
  }

  return (
    <div className="app">
      <div className="header">
        <h1>2048</h1>
        <button onClick={restart}>Restart</button>
      </div>
      <div className="board">
        {tiles.map((tile) => (
          <div
            key={tile.id}
            className={`tile tile-${tile.value}`}
            style={{
              top: `${tile.row * 90 + 15}px`,
              left: `${tile.col * 90 + 15}px`,
            }}
          >
            {tile.value}
          </div>
        ))}
        {(gameOver || gameWin) && (
          <div className="overlay">
            {gameOver && <div className="message">Game Over</div>}
            {gameWin && <div className="message">You Win!</div>}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;

