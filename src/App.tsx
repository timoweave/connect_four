"use strict";

/* eslint-disable react-refresh/only-export-components */
import { useState, useMemo, createContext, useContext, useRef } from "react";

export enum GamePlayer {
  green = "green",
  red = "red",
}

export enum GameCellColor {
  white = "white",
  green = "green",
  red = "red",
}

export interface GameCellCoord {
  row: number;
  col: number;
}

export interface GamePiece extends GameCellCoord {
  color: GameCellColor;
}

export const useGame = (props: {
  size: number;
  column: number;
  row: number;
  count: number;
}) => {
  const [error, setError] = useState<Error | null>(null);
  const [count, setCount] = useState<number>(props.count);
  const [size, setSize] = useState<number>(props.size);
  const [column, setColumn] = useState<number>(props.column);
  const [row, setRow] = useState<number>(props.row);
  const [winner, setWinner] = useState<GamePlayer | null>(null);
  const [player, setPlayer] = useState<GamePlayer>(GamePlayer.green);
  const [pieces, setPieces] = useState<GamePiece[]>([]);
  const pieceLocation = useRef<Map<string, GamePlayer>>(
    new Map<string, GamePlayer>()
  );

  const hasWinner = useMemo<boolean>(() => winner != null, [winner]);

  const counts = useMemo<number[]>(
    () => Array.from({ length: count }, (_, i) => i),
    [count]
  );

  const columns = useMemo<number[]>(
    () => Array.from({ length: props.column }, (_, i) => i),
    [props.column]
  );
  const rows = useMemo<number[]>(
    () => Array.from({ length: props.row }, (_, i) => i),
    [props.row]
  );

  return {
    error,
    setError,
    hasWinner,
    winner,
    setWinner,
    count,
    setCount,
    counts,
    size,
    setSize,
    column,
    setColumn,
    columns,
    row,
    setRow,
    rows,
    player,
    setPlayer,
    pieces,
    setPieces,
    pieceLocation,
  };
};

export type UseGameType = ReturnType<typeof useGame>;

const emptyFunction = () => {};

const USE_GAME_DEFAULT: UseGameType = {
  error: null,
  setError: emptyFunction,
  hasWinner: false,
  winner: null,
  setWinner: emptyFunction,
  count: 0,
  setCount: emptyFunction,
  counts: [],
  size: 0,
  setSize: emptyFunction,
  column: 0,
  setColumn: emptyFunction,
  columns: [],
  row: 0,
  setRow: emptyFunction,
  rows: [],
  player: GamePlayer.green,
  setPlayer: emptyFunction,
  pieces: [],
  setPieces: emptyFunction,
  pieceLocation: { current: new Map<string, GamePlayer>() },
};

const GameContext = createContext<UseGameType>(USE_GAME_DEFAULT);

const useGameFromContext = () => useContext(GameContext);

export const gameGetCellColor = (player: GamePlayer): GameCellColor => {
  return player === GamePlayer.green ? GameCellColor.green : GameCellColor.red;
};

export const gameTogglePlayer = (player: GamePlayer): GamePlayer => {
  return player === GamePlayer.green ? GamePlayer.red : GamePlayer.green;
};

export const gameIsFullColumn = (game: UseGameType, col: number): boolean => {
  const { row, pieces } = game;
  return row === pieces.filter((a) => a.col === col).length;
};

export const gameFindNextRow = (
  game: UseGameType,
  col: number
): number | null => {
  const { row, pieces, setError } = game;

  const rows = pieces
    .filter((a) => a.col === col)
    .map((a) => a.row)
    .sort((a, b) => a - b);

  if (rows.length === row) {
    const error = new Error(`no more row in column ${col}`);
    setError(error);
    console.error(error.message);
    return null;
  }

  return (rows[0] ?? row) - 1;
};

export interface GamePlayerPieceCount {
  player: GamePlayer;
  sum: number;
  done: boolean;
}

export const gameHasWiningPiecesInThisDirection = (
  game: UseGameType,
  forwardDirection: (i: number) => GameCellCoord,
  backwardDirection: (i: number) => GameCellCoord
): boolean => {
  const { pieceLocation, player, count, counts, column, row } = game;
  const init: GamePlayerPieceCount = { player, sum: 0, done: false };

  const forwardCoords = counts
    .map(forwardDirection)
    .filter((a) => a.col >= 0 && a.row >= 0 && a.col < column && a.row < row);
  const backwardCoords = counts
    .map(backwardDirection)
    .filter((a) => a.col >= 0 && a.row >= 0 && a.col < column && a.row < row);

  const [forward, backward] = [forwardCoords, backwardCoords].map((direction) =>
    direction.reduce((ans: GamePlayerPieceCount, coord: GameCellCoord) => {
      if (ans.done) {
        return ans;
      }

      const locationKey = `${coord.row}_${coord.col}`;
      if (pieceLocation.current.get(locationKey) !== player) {
        return { ...ans, done: true };
      }
      return { ...ans, sum: ans.sum + 1 };
    }, init)
  );

  const total = forward.sum + backward.sum;
  return total >= count - 1;
};

export const gameHasWinner = (game: UseGameType, piece: GamePiece): boolean => {
  const { pieceLocation, player } = game;
  const { row, col } = piece;

  pieceLocation.current.set(`${row}_${col}`, player);

  return (
    gameHasWiningPiecesInThisDirection(
      game,
      (i) => ({ col: col, row: row - i - 1 }), // up
      (i) => ({ col: col, row: row + i + 1 }) // down
    ) ||
    gameHasWiningPiecesInThisDirection(
      game,
      (i) => ({ col: col - i - 1, row }), // left
      (i) => ({ col: col + i + 1, row: row }) // right
    ) ||
    gameHasWiningPiecesInThisDirection(
      game,
      (i) => ({ col: col - i - 1, row: row + i + 1 }), // down-left
      (i) => ({ col: col + i + 1, row: row - i - 1 }) // up-right
    ) ||
    gameHasWiningPiecesInThisDirection(
      game,
      (i) => ({ col: col - i - 1, row: -i - 1 }), // up-left
      (i) => ({ col: col + i + 1, row: row + i + 1 }) // down-right
    )
  );
};

export const addPiece = (game: UseGameType, col: number): void => {
  const { player, setPlayer, setPieces, setWinner } = game;
  const color = gameGetCellColor(player);
  const row = gameFindNextRow(game, col);
  if (row == null) {
    return;
  }

  const piece: GamePiece = { color, row, col };
  const isWon = gameHasWinner(game, piece);

  setPlayer(gameTogglePlayer);
  setPieces((p) => [...p, piece]);
  setWinner((prevWinner) => (isWon === false ? prevWinner : player));
};

const gameCellGridArea = (props: { col: number; row: number }): string => {
  return `game_cell_${props.row}_${props.col}`;
};

const gamebuttonGridArea = (props: { col: number }): string => {
  return `game_button_${props.col}`;
};

const GameButtonStyle = (
  col: number,
  player: GamePlayer,
  isDisabled: boolean
): React.CSSProperties => ({
  gridArea: gamebuttonGridArea({ col }),
  color: "white",
  backgroundColor: isDisabled ? "grey" : gameGetCellColor(player),
  width: "100%",
});

const GameButtons = () => {
  const game = useGameFromContext();
  const { hasWinner, columns, player } = game;

  return (
    <>
      {columns.map((col) => (
        <button
          style={GameButtonStyle(col, player, hasWinner)}
          disabled={gameIsFullColumn(game, col) || hasWinner}
          key={col}
          onClick={() => {
            addPiece(game, col);
          }}
        >
          {col}
        </button>
      ))}
    </>
  );
};

const GameCellStyle = (props: {
  row: number;
  col: number;
  color: GameCellColor;
  size: number;
  outlined?: boolean;
}): React.CSSProperties => {
  const { row, col, color, size, outlined = false } = props;
  return {
    gridArea: gameCellGridArea({ col, row }),
    backgroundColor: color as string,
    borderRadius: "50%",
    width: `${size}rem`,
    height: `${size}rem`,
    border: outlined === true ? "1px solid lightgrey" : undefined,
  };
};

const GameBoardStyle = (game: UseGameType): React.CSSProperties => {
  const { columns, rows, size } = game;
  const gridTemplateAreas = [
    `"${columns.map((col) => gamebuttonGridArea({ col })).join(" ")}"`,
    rows
      .map(
        (row) =>
          `"${columns.map((col) => gameCellGridArea({ col, row })).join(" ")}"`
      )
      .join(" "),
  ].join(" ");

  return {
    display: "grid",
    borderRadius: "50%",
    gap: "1rem",
    width: `${size}rem`,
    height: `${size}rem`,
    gridTemplateAreas,
  };
};

const GameCells = () => {
  const game = useGameFromContext();
  const { columns, rows, size } = game;
  const color = GameCellColor.white;
  const outlined = true;

  return (
    <>
      {columns.map((col) =>
        rows.map((row) => (
          <div
            key={gameCellGridArea({ col, row })}
            style={GameCellStyle({ row, col, color, size, outlined })}
          ></div>
        ))
      )}
    </>
  );
};

const GamePieces = () => {
  const game = useGameFromContext();
  const { pieces, size } = game;

  return (
    <>
      {pieces.map(({ color, row, col }) => (
        <div
          key={gameCellGridArea({ col, row })}
          style={GameCellStyle({ color, col, row, size })}
        ></div>
      ))}
    </>
  );
};

const GameBoard = (props: { children: React.ReactNode }) => {
  const game = useGameFromContext();
  const { children } = props;

  return <div style={GameBoardStyle(game)}>{children}</div>;
};

const Game = () => {
  return (
    <GameBoard>
      <GameButtons />
      <GameCells />
      <GamePieces />
    </GameBoard>
  );
};

const App = () => {
  const value = useGame({ column: 5, row: 5, size: 5, count: 4 });

  return (
    <GameContext.Provider value={value}>
      <Game />
    </GameContext.Provider>
  );
};

export default App;
