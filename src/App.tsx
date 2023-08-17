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
  const [isPlayerToggleable, setIsPlayerToggleable] = useState<boolean>(true);
  const [pieces, setPieces] = useState<GamePiece[]>([]);
  const pieceLocation = useRef<Map<string, GamePlayer>>(
    new Map<string, GamePlayer>()
  );
  const dialogRef = useRef<HTMLDialogElement>(null);

  const hasWinner = useMemo<boolean>(() => winner != null, [winner]);

  const counts = useMemo<number[]>(
    () => Array.from({ length: count }, (_, i) => i),
    [count]
  );

  const columns = useMemo<number[]>(
    () => Array.from({ length: column }, (_, i) => i),
    [column]
  );
  const rows = useMemo<number[]>(
    () => Array.from({ length: row }, (_, i) => i),
    [row]
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
    dialogRef,
    isPlayerToggleable,
    setIsPlayerToggleable,
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
  dialogRef: { current: null },
  isPlayerToggleable: true,
  setIsPlayerToggleable: emptyFunction,
};

const GameContext = createContext<UseGameType>(USE_GAME_DEFAULT);

const useGameFromContext = () => useContext(GameContext);

export const gameGetCellColor = (player: GamePlayer): GameCellColor => {
  return player === GamePlayer.green ? GameCellColor.green : GameCellColor.red;
};

export const gameTogglePlayer = (game: UseGameType): GamePlayer => {
  const { setPlayer, player, hasWinner, isPlayerToggleable } = game;
  if (hasWinner || !isPlayerToggleable) {
    return player;
  }

  const nextPlayer =
    player === GamePlayer.green ? GamePlayer.red : GamePlayer.green;
  setPlayer(nextPlayer);
  return nextPlayer;
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

export const gameHasWiningPiecesInThisDirection = (props: {
  game: UseGameType;
  forward: (i: number) => GameCellCoord;
  backward: (i: number) => GameCellCoord;
  direction?: string;
}): boolean => {
  const { game, forward, backward } = props;
  const { pieceLocation, player, count, counts, column, row } = game;
  const init: GamePlayerPieceCount = { player, sum: 0, done: false };

  const forwardCoords = counts
    .map(forward)
    .filter((a) => a.col >= 0 && a.row >= 0 && a.col < column && a.row < row);
  const backwardCoords = counts
    .map(backward)
    .filter((a) => a.col >= 0 && a.row >= 0 && a.col < column && a.row < row);

  const [forwardPieceCount, backwardPieceCount] = [
    forwardCoords,
    backwardCoords,
  ].map((directionCoords) =>
    directionCoords.reduce(
      (ans: GamePlayerPieceCount, coord: GameCellCoord) => {
        if (ans.done) {
          return ans;
        }

        const locationKey = `${coord.row}_${coord.col}`;
        if (pieceLocation.current.get(locationKey) !== player) {
          return { ...ans, done: true };
        }
        return { ...ans, sum: ans.sum + 1 };
      },
      init
    )
  );

  const total = forwardPieceCount.sum + backwardPieceCount.sum;
  return total >= count - 1;
};

export const gameHasWinner = (game: UseGameType, piece: GamePiece): boolean => {
  const { pieceLocation, player } = game;
  const { row, col } = piece;

  pieceLocation.current.set(`${row}_${col}`, player);

  return (
    gameHasWiningPiecesInThisDirection({
      game,
      forward: (i) => ({ col: col, row: row - i - 1 }), // up
      backward: (i) => ({ col: col, row: row + i + 1 }), // down
      direction: "vertical",
    }) ||
    gameHasWiningPiecesInThisDirection({
      game,
      forward: (i) => ({ col: col - i - 1, row }), // left
      backward: (i) => ({ col: col + i + 1, row: row }), // right
      direction: "horizontal",
    }) ||
    gameHasWiningPiecesInThisDirection({
      game,
      forward: (i) => ({ col: col - i - 1, row: row + i + 1 }), // down-left
      backward: (i) => ({ col: col + i + 1, row: row - i - 1 }), // up-right
      direction: "rise diagonal",
    }) ||
    gameHasWiningPiecesInThisDirection({
      game,
      forward: (i) => ({ col: col - i - 1, row: row - i - 1 }), // up-left
      backward: (i) => ({ col: col + i + 1, row: row + i + 1 }), // down-right
      direction: "fall diagonal",
    })
  );
};

export const gameAddPiece = (props: {
  game: UseGameType;
  col: number;
  row?: number;
}): void => {
  const { game, col } = props;
  const { hasWinner, player, setPlayer, setPieces, winner, setWinner } = game;
  if (hasWinner || winner) {
    return;
  }

  const color = gameGetCellColor(player);
  const row = props.row ?? gameFindNextRow(game, col);
  if (row == null) {
    return;
  }

  const piece: GamePiece = { color, row, col };
  const isWon = gameHasWinner(game, piece);
  const nextPlayer = isWon ? player : gameTogglePlayer(game);

  setPlayer(nextPlayer);
  setPieces((p) => [...p, piece]);
  setWinner(() => (isWon === false ? null : player));
};

export const gameOpenConfigDialog = (game: UseGameType) => {
  const { dialogRef } = game;
  dialogRef.current?.showModal();
};

export const gameCloseConfigDialog = (game: UseGameType) => {
  const { dialogRef } = game;
  dialogRef.current?.close();
};

export const gameReset = (game: UseGameType) => {
  const { setPieces, setPlayer, setWinner, pieceLocation } = game;
  setPieces([]);
  setPlayer(GamePlayer.green);
  setWinner(null);
  pieceLocation.current.clear();
};

export const gameCellGridArea = (props: {
  col: number;
  row: number;
}): string => {
  return `game_cell_${props.row}_${props.col}`;
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
    outline: outlined === true ? "1px solid lightgrey" : undefined,
  };
};

const GameBoardStyle = (game: UseGameType): React.CSSProperties => {
  const { columns, rows } = game;

  const gridTemplateAreas = [
    `"${columns.map(() => "game_header").join(" ")}"`,
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
    placeItems: "center",
    gridTemplateAreas,
  };
};

export const GameCells = () => {
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
            onClick={() => gameAddPiece({ game, col })}
          ></div>
        ))
      )}
    </>
  );
};

export const GamePieces = () => {
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

export const GameBoard = (props: { children: React.ReactNode }) => {
  const game = useGameFromContext();
  const { children } = props;

  return <div style={GameBoardStyle(game)}>{children}</div>;
};

const GameHeaderStyle: React.CSSProperties = {
  gridArea: "game_header",
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: "1rem",
  width: "100%",
  margin: "2rem 0rem",
};

const GameConfigDialogStyle: React.CSSProperties = {
  border: "none",
  borderRadius: "0.5rem",
};

const GameConfigStyle: React.CSSProperties = {
  display: "grid",
  gap: "1rem",
  gridTemplateAreas: `
  "config_header config_header"
  "config_column config_column_input"
  "config_row config_row_input"
  "config_count config_count_input"
  "_ config_close"
  `,
  margin: "1rem 5rem",
};

export const GameConfig = () => {
  const game = useGameFromContext();
  const { dialogRef, column, setColumn, row, setRow, count, setCount } = game;

  return (
    <dialog ref={dialogRef} style={GameConfigDialogStyle}>
      <div style={GameConfigStyle}>
        <h3 style={{ gridArea: "config_header" }}>Game Configuration</h3>
        <label style={{ gridArea: "config_column" }}>Column</label>
        <input
          style={{ gridArea: "config_column_input" }}
          type="number"
          value={column}
          onChange={(e) => setColumn(parseInt(e.target.value, 10))}
        />
        <label style={{ gridArea: "config_row" }}>Row</label>
        <input
          style={{ gridArea: "config_row_input" }}
          type="number"
          value={row}
          onChange={(e) => setRow(parseInt(e.target.value, 10))}
        />
        <label style={{ gridArea: "config_count" }}>Count</label>
        <input
          style={{ gridArea: "config_count_input" }}
          type="number"
          value={count}
          onChange={(e) => setCount(parseInt(e.target.value, 10))}
        />
        <button
          style={{ gridArea: "config_close" }}
          onClick={() => gameCloseConfigDialog(game)}
        >
          Close
        </button>
      </div>
    </dialog>
  );
};

export const GameHeaderPlayerStyle = (
  player: GamePlayer
): React.CSSProperties => {
  return {
    width: "100%",
    backgroundColor: player === GamePlayer.green ? "green" : "red",
  };
};

export const GameHeader = () => {
  const game = useGameFromContext();
  const { pieces, hasWinner, player } = game;

  return (
    <div style={GameHeaderStyle}>
      <button
        style={GameHeaderPlayerStyle(player)}
        onClick={() => gameTogglePlayer(game)}
      >
        {player === GamePlayer.green ? "Green" : "Red"}{" "}
        {hasWinner === true ? "Winner" : "Turn"}
      </button>
      <button
        style={{ width: "100%" }}
        onClick={() => gameOpenConfigDialog(game)}
        disabled={pieces.length !== 0}
      >
        Config Game
      </button>
      <button
        style={{ width: "100%" }}
        onClick={() => gameReset(game)}
        disabled={pieces.length === 0}
      >
        {hasWinner ? "Play Again" : "Reset All"}
      </button>
    </div>
  );
};

export const Game = () => {
  return (
    <GameBoard>
      <GameHeader />
      <GameCells />
      <GamePieces />
      <GameConfig />
    </GameBoard>
  );
};

export const GameProvider = (props: { children: React.ReactNode }) => {
  const { children } = props;
  const value = useGame({ column: 18, row: 10, size: 5, count: 4 });

  return (
    <GameContext.Provider value={value}>
      <>{children}</>
    </GameContext.Provider>
  );
};

export const App = () => {
  return (
    <GameProvider>
      <Game />
    </GameProvider>
  );
};

