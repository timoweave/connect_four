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

export interface UseGameType {
  error: Error | null;
  setError: React.Dispatch<React.SetStateAction<Error | null>>;
  hasWinner: boolean;
  winner: GamePlayer | null;
  setWinner: React.Dispatch<React.SetStateAction<GamePlayer | null>>;
  count: number;
  setCount: React.Dispatch<React.SetStateAction<number>>;
  counts: number[];
  size: number;
  setSize: React.Dispatch<React.SetStateAction<number>>;
  column: number;
  setColumn: React.Dispatch<React.SetStateAction<number>>;
  columns: number[];
  row: number;
  setRow: React.Dispatch<React.SetStateAction<number>>;
  rows: number[];
  player: GamePlayer;
  setPlayer: React.Dispatch<React.SetStateAction<GamePlayer>>;
  pieces: GamePiece[];
  setPieces: React.Dispatch<React.SetStateAction<GamePiece[]>>;
  pieceLocation: React.MutableRefObject<Map<string, GamePlayer>>;
  dialogRef: React.RefObject<HTMLDialogElement>;
  isPlayerToggleable: boolean;
  setIsPlayerToggleable: React.Dispatch<React.SetStateAction<boolean>>;
  width: number;
}

export const useGame = (props?: Partial<UseGameType>): UseGameType => {
  const [error, setError] = useState<Error | null>(props?.error ?? null);
  const [count, setCount] = useState<number>(props?.count ?? 4);
  const [size, setSize] = useState<number>(props?.size ?? 4);
  const [column, setColumn] = useState<number>(props?.column ?? 8);
  const [row, setRow] = useState<number>(props?.row ?? 8);
  const [winner, setWinner] = useState<GamePlayer | null>(
    props?.winner ?? null
  );
  const [player, setPlayer] = useState<GamePlayer>(
    props?.player ?? GamePlayer.green
  );
  const [isPlayerToggleable, setIsPlayerToggleable] = useState<boolean>(
    props?.isPlayerToggleable ?? true
  );
  const [pieces, setPieces] = useState<GamePiece[]>(props?.pieces ?? []);
  const pieceLocation = useRef<Map<string, GamePlayer>>(
    props?.pieceLocation?.current ??
      new Map<string, GamePlayer>(
        pieces.map((piece) => [
          `${piece.row}_${piece.col}`,
          gameGetGamePlayer(piece.color),
        ])
      )
  );
  const dialogRef = useRef<HTMLDialogElement>(
    props?.dialogRef?.current ?? null
  );

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
  const width = useMemo<number>(
    () => (column + 2) /* gap */ * size,
    [column, size]
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
    width,
  };
};

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
  width: 0,
};

const GameContext = createContext<UseGameType>(USE_GAME_DEFAULT);

const useGameFromContext = () => useContext(GameContext);

export const gameGetCellColor = (player: GamePlayer): GameCellColor => {
  return player === GamePlayer.green ? GameCellColor.green : GameCellColor.red;
};

export const gameGetGamePlayer = (color: GameCellColor): GamePlayer => {
  return color === GameCellColor.green ? GamePlayer.green : GamePlayer.red;
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
  if (hasWinner || winner || col >= game.column) {
    return;
  }

  const color = gameGetCellColor(player);
  const row = props.row ?? gameFindNextRow(game, col);
  if (row == null || row >= game.row) {
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

interface GameProps {
  style?: React.CSSProperties;
  dataTestID?: string;
}

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
  const { columns, rows, width } = game;
  /* grid templae area:
     game_header    game_header    game_header    ... game_header
     game_cell_0_0  game_cell_0_1  game_cell_0_2  ... game_cell_0_C
     game_cell_1_0  game_cell_1_1  game_cell_1_2  ... game_cell_1_C
     game_cell_2_0  game_cell_2_1  game_cell_2_2  ... game_cell_2_C
     ...
     game_cell_R_0  game_cell_R_1  game_cell_R_2  ... game_cell_R_C
  */

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
    width: `${width}rem`,
  };
};

export interface GameCellsProps extends GameProps {}

export const GameCells = (props?: GameCellsProps) => {
  const game = useGameFromContext();
  const { columns, rows, size } = game;
  const color = GameCellColor.white;
  const outlined = true;

  console.log({ props });

  return (
    <>
      {columns.map((col) =>
        rows.map((row) => (
          <div
            data-testid={`${props?.dataTestID}_${row}_${col}`}
            key={gameCellGridArea({ col, row })}
            style={GameCellStyle({ row, col, color, size, outlined })}
            onClick={() => gameAddPiece({ game, col })}
          ></div>
        ))
      )}
    </>
  );
};

export interface GamePiecesProps extends GameProps {}

export const GamePieces = (props?: GamePiecesProps) => {
  const game = useGameFromContext();
  const { pieces, size } = game;

  return (
    <>
      {pieces.map(({ color, row, col }) => (
        <div
          data-testid={`${props?.dataTestID}_${row}_${col}`}
          key={gameCellGridArea({ col, row })}
          style={GameCellStyle({ color, col, row, size })}
        ></div>
      ))}
    </>
  );
};

export interface GameBoardProps extends GameProps {
  children: React.ReactNode;
}

export const GameBoard = (props: GameBoardProps) => {
  const game = useGameFromContext();
  const { children } = props;

  return (
    <div
      data-testid={props?.dataTestID}
      style={{ ...GameBoardStyle(game), ...props?.style }}
    >
      {children}
    </div>
  );
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
  "config_row    config_row_input"
  "config_count  config_count_input"
  "empty         config_close"
  `,
  margin: "1rem 5rem",
};

export interface GameConfigProps extends GameProps {}

export const GameConfig = (props?: GameConfigProps) => {
  const game = useGameFromContext();
  const { dialogRef, column, setColumn, row, setRow, count, setCount } = game;

  return (
    <dialog
      data-testid={props?.dataTestID}
      ref={dialogRef}
      style={{ ...GameConfigDialogStyle, ...props?.style }}
    >
      <div style={GameConfigStyle}>
        <h3 style={{ gridArea: "config_header" }}>Game Configuration</h3>
        <label style={{ gridArea: "config_column" }}>Column</label>
        <input
          data-testid={`${props?.dataTestID}_COLUMN_INPUT`}
          style={{ gridArea: "config_column_input" }}
          type="number"
          value={column}
          onChange={(e) => setColumn(parseInt(e.target.value, 10))}
        />
        <label style={{ gridArea: "config_row" }}>Row</label>
        <input
          data-testid={`${props?.dataTestID}_ROW_INPUT`}
          style={{ gridArea: "config_row_input" }}
          type="number"
          value={row}
          onChange={(e) => setRow(parseInt(e.target.value, 10))}
        />
        <label style={{ gridArea: "config_count" }}>Count</label>
        <input
          data-testid={`${props?.dataTestID}_COUNT_INPUT`}
          style={{ gridArea: "config_count_input" }}
          type="number"
          value={count}
          onChange={(e) => setCount(parseInt(e.target.value, 10))}
        />
        <button
          data-testid={`${props?.dataTestID}_CLOSE_BUTTON`}
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

export interface GameHeaderProps extends GameProps {}

export const GameHeader = (props?: GameHeaderProps) => {
  const game = useGameFromContext();
  const { pieces, hasWinner, player } = game;

  return (
    <div
      data-testid={props?.dataTestID}
      style={{ ...GameHeaderStyle, ...props?.style }}
    >
      <button
        data-testid={"GAME_HEADER_PLAYER_TURN_BUTTON"}
        style={GameHeaderPlayerStyle(player)}
        onClick={() => gameTogglePlayer(game)}
      >
        {player === GamePlayer.green ? "Green" : "Red"}{" "}
        {hasWinner === true ? "Winner" : "Turn"}
      </button>
      <button
        data-testid={"GAME_HEADER_CONFIG_GAME_BUTTON"}
        style={{ width: "100%" }}
        onClick={() => gameOpenConfigDialog(game)}
        disabled={pieces.length !== 0}
      >
        Config Game
      </button>
      <button
        data-testid={"GAME_HEADER_RESET_ALL_BUTTON"}
        style={{ width: "100%" }}
        onClick={() => gameReset(game)}
        disabled={pieces.length === 0}
      >
        {hasWinner ? "Play Again" : "Reset All"}
      </button>
    </div>
  );
};

export const GameStyle: React.CSSProperties = {
  display: "grid",
  placeItems: "center",
};

export const Game = (props?: GameProps) => {
  const dataTestID = props?.dataTestID;

  return (
    <div data-testid={dataTestID} style={{ ...GameStyle, ...props?.style }}>
      <GameBoard dataTestID={`${dataTestID}_BOARD`}>
        <GameHeader dataTestID={`${dataTestID}_HEADER`} />
        <GameCells dataTestID={`${dataTestID}_CELLS`} />
        <GamePieces dataTestID={`${dataTestID}_PIECES`} />
        <GameConfig dataTestID={`${dataTestID}_CONFIG`} />
      </GameBoard>
    </div>
  );
};

interface GameProviderProps extends GameProps {
  children: React.ReactNode;
}

export const GameProvider = (props: GameProviderProps) => {
  const { children } = props;
  const value = useGame();

  return (
    <GameContext.Provider value={value}>
      <div data-testid={props?.dataTestID}>{children}</div>
    </GameContext.Provider>
  );
};

export const App = () => {
  return (
    <GameProvider dataTestID="GAME_PROVIDER">
      <Game dataTestID="GAME" />
    </GameProvider>
  );
};

