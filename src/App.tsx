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
  playerTurnLabel: string;
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

  const playerTurnLabel = useMemo(() => {
    const prefix = player === GamePlayer.green ? "Green" : "Red";
    const suffix = hasWinner === true ? "Winner" : "Turn";
    return `${prefix} ${suffix}`;
  }, [player, hasWinner]);

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
    playerTurnLabel,
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
  playerTurnLabel: "",
};

const GameContext = createContext<UseGameType>(USE_GAME_DEFAULT);

const useGameContext = () => useContext(GameContext);

const useGameDataTestID = (dataTestID: string) => {
  const game = useMemo(() => GameDataTestID(dataTestID), [dataTestID]);
  const header = useMemo(() => GameHeaderDataTestID(dataTestID), [dataTestID]);
  const config = useMemo(() => GameConfigDataTestID(dataTestID), [dataTestID]);
  const cells = useMemo(() => GameCellsDataTestID(dataTestID), [dataTestID]);
  const pieces = useMemo(() => GamePiecesDataTestID(dataTestID), [dataTestID]);

  return {
    dataTestID,
    game,
    header,
    config,
    cells,
    pieces,
  };
};

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

export const gameHasWiningPieces = (
  game: UseGameType,
  piece: GamePiece
): boolean => {
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
  const hasWon = gameHasWiningPieces(game, piece);
  const nextPlayer = hasWon ? player : gameTogglePlayer(game);

  setPlayer(nextPlayer);
  setPieces((p) => [...p, piece]);
  setWinner(() => (hasWon === false ? null : player));
};

export const gameOpenConfigDialog = (game: UseGameType) => {
  const { dialogRef } = game;
  console.log({ hello: 1 });
  const showModal = dialogRef?.current?.showModal;
  if (showModal != null) {
    showModal();
  }
};

export const gameCloseConfigDialog = (game: UseGameType) => {
  const { dialogRef } = game;
  const close = dialogRef.current?.close;
  if (close != null) {
    close();
  }
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

export interface GameProps {
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

export const GameCellsDataTestID = (dataTestID: string) => {
  return {
    dataTestID,
    cell: (props: { row?: number; col: number }) =>
      `${dataTestID}_${props.row ?? 0}_${props.col}`,
  };
};

export interface GameCellsProps extends GameProps {}

export const GameCells = (props?: GameCellsProps) => {
  const game = useGameContext();
  const { cells } = useGameDataTestID(props?.dataTestID ?? "GAME_CELL");
  const { columns, rows, size } = game;
  const color = GameCellColor.white;

  return (
    <>
      {columns.map((col) =>
        rows.map((row) => (
          <div
            data-testid={cells.cell({ col, row })}
            key={gameCellGridArea({ col, row })}
            style={GameCellStyle({ row, col, color, size, outlined: true })}
            onClick={() => gameAddPiece({ game, col })}
          ></div>
        ))
      )}
    </>
  );
};

export const GamePiecesDataTestID = GameCellsDataTestID;
export interface GamePiecesProps extends GameProps {}

export const GamePieces = (props?: GamePiecesProps) => {
  const game = useGameContext();
  const { pieces: dataTestID } = useGameDataTestID(
    props?.dataTestID ?? "GAME_PIECE"
  );
  const { pieces, size } = game;

  return (
    <>
      {pieces.map(({ color, row, col }) => (
        <div
          data-testid={dataTestID.cell({ col, row })}
          key={gameCellGridArea({ col, row })}
          style={GameCellStyle({ color, col, row, size })}
        ></div>
      ))}
    </>
  );
};

export interface GameBoardProps extends GameProps, React.PropsWithChildren {}

export const GameBoard = (props: GameBoardProps) => {
  const game = useGameContext();
  const { children } = props;
  const style = useMemo<React.CSSProperties>(
    () => ({ ...GameBoardStyle(game), ...props?.style }),
    [props?.style, game]
  );

  return (
    <div data-testid={props?.dataTestID} style={style}>
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
  "config_header       config_header"
  "config_column_label config_column"
  "config_row_label    config_row"
  "config_count_label  config_count"
  "empty               config_close"
  `,
  margin: "1rem 5rem",
};

export const GameConfigDataTestID = (dataTestID: string) => {
  return {
    dataTestID,
    columnLabel: `${dataTestID}_COLUMN_LABEL`,
    rowLabel: `${dataTestID}_ROW_LABEL`,
    countLabel: `${dataTestID}_COUNT_LABEL`,
    column: `${dataTestID}_COLUMN`,
    row: `${dataTestID}_ROW`,
    count: `${dataTestID}_COUNT`,
    close: `${dataTestID}_CLOSE`,
  };
};

export interface GameConfigProps extends GameProps {}

export const GameConfig = (props?: GameConfigProps) => {
  const game = useGameContext();
  const { config } = useGameDataTestID(props?.dataTestID ?? "GAME_CONFIG");
  const { dialogRef, column, setColumn, row, setRow, count, setCount } = game;
  const style = useMemo<React.CSSProperties>(
    () => ({ ...GameConfigDialogStyle, ...props?.style }),
    [props?.style]
  );

  return (
    <dialog data-testid={config.dataTestID} ref={dialogRef} style={style}>
      <div style={GameConfigStyle}>
        <h3 style={{ gridArea: "config_header" }}>Game Configuration</h3>
        <label
          data-testid={config.columnLabel}
          style={{ gridArea: "config_column_label" }}
        >
          Column
        </label>
        <input
          data-testid={config.column}
          style={{ gridArea: "config_column" }}
          type="number"
          value={column}
          onChange={(e) => setColumn(parseInt(e.target.value, 10))}
        />
        <label
          data-testid={config.rowLabel}
          style={{ gridArea: "config_row_label" }}
        >
          Row
        </label>
        <input
          data-testid={config.row}
          style={{ gridArea: "config_row" }}
          type="number"
          value={row}
          onChange={(e) => setRow(parseInt(e.target.value, 10))}
        />
        <label
          data-testid={config.countLabel}
          style={{ gridArea: "config_count_label" }}
        >
          Count
        </label>
        <input
          data-testid={config.count}
          style={{ gridArea: "config_count" }}
          type="number"
          value={count}
          onChange={(e) => setCount(parseInt(e.target.value, 10))}
        />
        <button
          data-testid={config.close}
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

export const GameHeaderDataTestID = (dataTestID: string) => {
  return {
    dataTestID,
    playerTurn: `${dataTestID}_PLAYER_TURN`,
    configGame: `${dataTestID}_CONFIG_GAME`,
    resetAll: `${dataTestID}_RESET_ALL`,
  };
};

export const GameHeader = (props?: GameHeaderProps) => {
  const game = useGameContext();
  const { header } = useGameDataTestID(props?.dataTestID ?? "GAME_HEADER");
  const { pieces, hasWinner, player, playerTurnLabel } = game;
  const style = useMemo<React.CSSProperties>(
    () => ({ ...GameHeaderStyle, ...props?.style }),
    [props?.style]
  );
  return (
    <div data-testid={header.dataTestID} style={style}>
      <button
        data-testid={header.playerTurn}
        style={GameHeaderPlayerStyle(player)}
        onClick={() => gameTogglePlayer(game)}
      >
        {playerTurnLabel}
      </button>
      <button
        data-testid={header.configGame}
        style={{ width: "100%" }}
        onClick={() => gameOpenConfigDialog(game)}
        disabled={pieces.length !== 0 || true /*TBD */}
      >
        Config Game
      </button>
      <button
        data-testid={header.resetAll}
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

export const GameDataTestID = (dataTestID: string) => {
  return {
    dataTestID,
    board: `${dataTestID}_BOARD`,
    header: `${dataTestID}_HEADER`,
    cells: `${dataTestID}_CELLS`,
    pieces: `${dataTestID}_PIECES`,
    config: `${dataTestID}_CONFIG`,
  };
};

export const Game = (props?: GameProps): JSX.Element => {
  const { game } = useGameDataTestID(props?.dataTestID ?? "GAME");
  const style = useMemo<React.CSSProperties>(
    () => ({ ...GameStyle, ...props?.style }),
    [props?.style]
  );

  return (
    <div data-testid={game.dataTestID} style={style}>
      <GameBoard dataTestID={game.board}>
        <GameHeader dataTestID={game.header} />
        <GameCells dataTestID={game.cells} />
        <GamePieces dataTestID={game.pieces} />
        <GameConfig dataTestID={game.config} />
      </GameBoard>
    </div>
  );
};

export interface GameProviderProps
  extends GameProps,
    Partial<UseGameType>,
    React.PropsWithChildren {}

export const GameProvider = (props: GameProviderProps) => {
  const { children, ...others } = props;
  const value = useGame(others);

  return (
    <GameContext.Provider value={value}>
      <div data-testid={props?.dataTestID}>{children}</div>
    </GameContext.Provider>
  );
};

export interface GameProviderWithGameBoard
  extends GameProps,
    Partial<UseGameType>,
    React.PropsWithChildren {}

export const GameProviderWithGameBoard = (
  props: GameProviderWithGameBoard
): JSX.Element => {
  const { children, ...others } = props;

  return (
    <GameProvider {...others}>
      <GameBoard>
        <>{children}</>
      </GameBoard>
    </GameProvider>
  );
};

export const App = () => {
  return (
    <GameProvider dataTestID="GAME_PROVIDER">
      <Game dataTestID="GAME" />
    </GameProvider>
  );
};

