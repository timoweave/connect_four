"use strict";

/* eslint-disable react-refresh/only-export-components */
import {
  useState,
  useEffect,
  useMemo,
  createContext,
  useContext,
  useRef,
} from "react";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

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
  configDialogRef: React.RefObject<HTMLDialogElement>;
  isPlayerToggleable: boolean;
  setIsPlayerToggleable: React.Dispatch<React.SetStateAction<boolean>>;
  width: number;
  playerTurnLabel: string;
  movingPiece: GamePiece | null;
  setMovingPiece: React.Dispatch<React.SetStateAction<GamePiece | null>>;
  winningPieces: GamePiece[];
  setWinningPieces: React.Dispatch<React.SetStateAction<GamePiece[]>>;
  hasMovingPiece: boolean;
  scoreDialogRef: React.RefObject<HTMLDialogElement>;
  intervalTime: number;
  setIntervalTime: React.Dispatch<React.SetStateAction<number>>;
  maxCount: number;
}

export const useGame = (props?: Partial<UseGameType>): UseGameType => {
  const [error, setError] = useState<Error | null>(props?.error ?? null);
  const [count, setCount] = useState<number>(props?.count ?? 4);
  const [size, setSize] = useState<number>(props?.size ?? 4);
  const [column, setColumn] = useState<number>(props?.column ?? 5);
  const [row, setRow] = useState<number>(props?.row ?? 5);
  const [intervalTime, setIntervalTime] = useState<number>(
    props?.intervalTime ?? 100,
  );
  const [winner, setWinner] = useState<GamePlayer | null>(
    props?.winner ?? null,
  );
  const [player, setPlayer] = useState<GamePlayer>(
    props?.player ?? GamePlayer.green,
  );
  const [isPlayerToggleable, setIsPlayerToggleable] = useState<boolean>(
    props?.isPlayerToggleable ?? true,
  );
  const [pieces, setPieces] = useState<GamePiece[]>(props?.pieces ?? []);
  const [winningPieces, setWinningPieces] = useState<GamePiece[]>(
    props?.winningPieces ?? [],
  );
  const pieceLocation = useRef<Map<string, GamePlayer>>(
    props?.pieceLocation?.current ??
      new Map<string, GamePlayer>(
        pieces.map((piece) => [
          `${piece.row}_${piece.col}`,
          gameGetGamePlayer(piece.color),
        ]),
      ),
  );
  const configDialogRef = useRef<HTMLDialogElement>(
    props?.configDialogRef?.current ?? null,
  );
  const scoreDialogRef = useRef<HTMLDialogElement>(
    props?.scoreDialogRef?.current ?? null,
  );
  const [movingPiece, setMovingPiece] = useState<GamePiece | null>(
    props?.movingPiece ?? null,
  );

  const hasWinner = useMemo<boolean>(() => winner != null, [winner]);

  const counts = useMemo<number[]>(
    () => Array.from({ length: count }, (_, i) => i),
    [count],
  );

  const columns = useMemo<number[]>(
    () => Array.from({ length: column }, (_, i) => i),
    [column],
  );

  const rows = useMemo<number[]>(
    () => Array.from({ length: row }, (_, i) => i),
    [row],
  );

  const width = useMemo<number>(
    () => (column + 2) /* gap = 2 */ * size,
    [column, size],
  );

  const playerTurnLabel = useMemo(() => {
    const prefix = player === GamePlayer.green ? "Green" : "Red";
    const suffix = hasWinner === true ? "Won" : "Turn";
    return `${prefix} ${suffix}`;
  }, [player, hasWinner]);

  const hasMovingPiece = useMemo(() => movingPiece != null, [movingPiece]);
  const maxCount = useMemo(
    () => Math.floor(Math.sqrt(Math.pow(row, 2) + Math.pow(column, 2))),
    [row, column],
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
    configDialogRef,
    isPlayerToggleable,
    setIsPlayerToggleable,
    width,
    playerTurnLabel,
    movingPiece,
    setMovingPiece,
    hasMovingPiece,
    scoreDialogRef,
    intervalTime,
    setIntervalTime,
    maxCount,
    winningPieces,
    setWinningPieces,
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
  configDialogRef: { current: null },
  isPlayerToggleable: true,
  setIsPlayerToggleable: emptyFunction,
  width: 0,
  playerTurnLabel: "",
  movingPiece: null,
  setMovingPiece: emptyFunction,
  hasMovingPiece: false,
  scoreDialogRef: { current: null },
  intervalTime: 1000,
  setIntervalTime: emptyFunction,
  maxCount: 0,
  winningPieces: [],
  setWinningPieces: emptyFunction,
};

const GameContext = createContext<UseGameType>(USE_GAME_DEFAULT);

const useGameContext = () => useContext(GameContext);

const useGameDataTestID = (dataTestID: string) => {
  const game = useMemo(() => GameDataTestID(dataTestID), [dataTestID]);
  const header = useMemo(() => GameHeaderDataTestID(dataTestID), [dataTestID]);
  const config = useMemo(() => GameConfigDataTestID(dataTestID), [dataTestID]);
  const cells = useMemo(() => GameCellsDataTestID(dataTestID), [dataTestID]);
  const pieces = useMemo(() => GamePiecesDataTestID(dataTestID), [dataTestID]);
  const movingPiece = useMemo(
    () => GameMovingPieceDataTestID(dataTestID),
    [dataTestID],
  );
  const winningPiece = useMemo(
    () => GameWinningPieceDataTestID(dataTestID),
    [dataTestID],
  );
  const score = useMemo(() => GameScoreDataTestID(dataTestID), [dataTestID]);

  return {
    root: dataTestID,
    game,
    header,
    config,
    cells,
    pieces,
    movingPiece,
    winningPiece,
    score,
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
  col: number,
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
  pieces: GamePiece[];
}

export const gameGetWinningPiecesInThisDirection = (props: {
  game: UseGameType;
  piece: GamePiece;
  forward: (i: number) => GameCellCoord;
  backward: (i: number) => GameCellCoord;
  direction?: string;
}): GamePiece[] | null => {
  const { game, forward, backward, piece } = props;
  const { pieceLocation, player, count, counts, column, row } = game;
  const init: GamePlayerPieceCount = {
    player,
    sum: 0,
    done: false,
    pieces: [],
  };

  const forwardCoords = counts
    .map(forward)
    .filter((a) => a.col >= 0 && a.row >= 0 && a.col < column && a.row < row);
  const backwardCoords = counts
    .map(backward)
    .filter((a) => a.col >= 0 && a.row >= 0 && a.col < column && a.row < row);
  const color = gameGetCellColor(player);
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
        const piece: GamePiece = { ...coord, color };
        return { ...ans, sum: ans.sum + 1, pieces: [...ans.pieces, piece] };
      },
      init,
    ),
  );

  const total = forwardPieceCount.sum + backwardPieceCount.sum;
  const directionPieces: GamePiece[] = [
    ...forwardPieceCount.pieces,
    ...backwardPieceCount.pieces,
    piece,
  ];
  if (total >= count - 1) {
    return directionPieces;
  } else {
    return null;
  }
};

export const gameGetWinningPieces = (
  game: UseGameType,
  piece: GamePiece,
): GamePiece[] | null => {
  const { pieceLocation, player } = game;
  const { row, col } = piece;

  pieceLocation.current.set(`${row}_${col}`, player);

  const verticalPieces = gameGetWinningPiecesInThisDirection({
    game,
    piece,
    forward: (i) => ({ col: col, row: row - i - 1 }), // up
    backward: (i) => ({ col: col, row: row + i + 1 }), // down
    direction: "vertical",
  });
  if (verticalPieces != null) {
    return verticalPieces;
  }
  const horizontalPieces = gameGetWinningPiecesInThisDirection({
    game,
    piece,
    forward: (i) => ({ col: col - i - 1, row }), // left
    backward: (i) => ({ col: col + i + 1, row: row }), // right
    direction: "horizontal",
  });
  if (horizontalPieces != null) {
    return horizontalPieces;
  }
  const riseDiagonalPieces = gameGetWinningPiecesInThisDirection({
    game,
    piece,
    forward: (i) => ({ col: col - i - 1, row: row + i + 1 }), // down-left
    backward: (i) => ({ col: col + i + 1, row: row - i - 1 }), // up-right
    direction: "rise diagonal",
  });
  if (riseDiagonalPieces != null) {
    return riseDiagonalPieces;
  }
  const fallDiagonalPieces = gameGetWinningPiecesInThisDirection({
    game,
    piece,
    forward: (i) => ({ col: col - i - 1, row: row - i - 1 }), // up-left
    backward: (i) => ({ col: col + i + 1, row: row + i + 1 }), // down-right
    direction: "fall diagonal",
  });
  if (fallDiagonalPieces != null) {
    return fallDiagonalPieces;
  }
  return null;
};

export const gameAddPiece = (props: {
  game: UseGameType;
  col: number;
  row?: number;
}): void => {
  const { game, col } = props;
  const { hasWinner, player, winner } = game;
  if (hasWinner || winner || col >= game.column) {
    return;
  }

  const color = gameGetCellColor(player);
  const row = props.row ?? gameFindNextRow(game, col);
  if (row == null || row >= game.row) {
    return;
  }

  const piece: GamePiece = { color, row, col };
  const winningPieces = gameGetWinningPieces(game, piece);
  const hasWon = winningPieces != null && winningPieces.length > 0;
  const nextPlayer = hasWon ? player : gameTogglePlayer(game);
  if (hasWon) {
    game.setWinningPieces(winningPieces);
  }
  game.setPlayer(nextPlayer);
  game.setPieces((p) => [...p, piece]);
  game.setWinner(() => (hasWon === false ? null : player));
};

export const gameAddMovingPiece = (props: {
  game: UseGameType;
  col: number;
  row: number;
}) => {
  const { col, row, game } = props;
  const { hasWinner, hasMovingPiece, player } = game;
  if (hasMovingPiece || hasWinner) {
    return;
  }

  const color = gameGetCellColor(player);
  const piece: GamePiece = { color, row, col };

  game.setMovingPiece(piece);
};

export const gameOpenConfigDialog = (game: UseGameType) => {
  const { configDialogRef } = game;
  configDialogRef.current?.showModal();
};

export const gameCloseConfigDialog = (game: UseGameType) => {
  const { configDialogRef } = game;
  configDialogRef.current?.close();
};

export const gameOpenScoreDialog = (game: UseGameType) => {
  const { scoreDialogRef } = game;
  scoreDialogRef.current?.showModal();
};

export const gameCloseScoreDialog = (game: UseGameType) => {
  const { scoreDialogRef } = game;
  scoreDialogRef.current?.close();
};

export const gameReset = (game: UseGameType) => {
  game.setPieces([]);
  game.setPlayer(GamePlayer.green);
  game.setWinner(null);
  game.setMovingPiece(null);
  game.setWinningPieces([]);
  game.pieceLocation.current.clear();
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
  /* grid-template-area: // where C = columns.length - 1, R = rows.length - 1
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
          `"${columns.map((col) => gameCellGridArea({ col, row })).join(" ")}"`,
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
    root: dataTestID,
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
            onClick={() => gameAddMovingPiece({ game, col, row })}
          ></div>
        )),
      )}
    </>
  );
};

export const GamePiecesDataTestID = GameCellsDataTestID;
export interface GamePiecesProps extends GameProps {}

export const GamePieces = (props?: GamePiecesProps) => {
  const game = useGameContext();
  const { pieces: dataTestID } = useGameDataTestID(
    props?.dataTestID ?? "GAME_PIECE",
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

export const useGamePieceMovingRow = (): number | null => {
  const game = useGameContext();
  const { movingPiece, setMovingPiece, intervalTime } = game;
  const [movingRow, setMovingRow] = useState<number | null>(
    movingPiece?.row ?? null,
  );

  useEffect(() => {
    if (movingPiece == null) {
      return;
    }
    const { col } = movingPiece;
    const rowBottom = gameFindNextRow(game, col);

    if (movingRow != null && movingRow === rowBottom) {
      gameAddPiece({ game, col, row: movingRow });
      setMovingRow(null);
      setMovingPiece(null);
    } else {
      setTimeout(() => {
        setMovingRow((prevRow) => {
          return (prevRow ?? movingPiece.row - 1) + 1;
        });
      }, intervalTime);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [movingRow, movingPiece, intervalTime]);

  return movingRow;
};

export const GameMovingPieceDataTestID = (dataTestID: string) => {
  return {
    piece: () => `${dataTestID}_MOVING_PIECE`,
  };
};

interface GameMovingPiece extends GameProps {}

export const GameMovingPiece = (props?: GameMovingPiece) => {
  const { size, movingPiece } = useGameContext();
  const row = useGamePieceMovingRow();
  const dataTestID = useGameDataTestID(
    props?.dataTestID ?? "GAME_MOVING_PIECE",
  );
  const { col, color } = movingPiece ?? {};

  if (row == null || col == null || color == null) {
    return null;
  }

  return (
    <div
      data-testid={dataTestID.movingPiece.piece()}
      style={GameCellStyle({ color, col, row, size })}
    ></div>
  );
};

export const GameWinningPieceDataTestID = (dataTestID: string) => {
  return {
    piece: (props: { row: number; col: number }) =>
      `${dataTestID}_WINNING_PIECE_${props.row}_${props.col}`,
  };
};

export const GameWinningPieceStyle = (props: {
  row: number;
  col: number;
  size: number;
}): React.CSSProperties => {
  const { row, col, size } = props;
  return {
    gridArea: gameCellGridArea({ col, row }),
    color: "#ecec00",
    borderRadius: "50%",
    width: `${size / 2}rem`,
    height: `${size / 2}rem`,
  };
};

interface GameWinningPiece extends GameProps {}
export const GameWinningPieces = (props?: GameWinningPiece) => {
  const dataTestID = useGameDataTestID(
    props?.dataTestID ?? "GAME_WINNING_PIECE",
  );
  const game = useGameContext();
  const { winningPieces, size } = game;

  return (
    <>
      {winningPieces.map(({ row, col }) => (
        <FontAwesomeIcon
          data-testid={dataTestID.winningPiece.piece({ row, col })}
          key={gameCellGridArea({ col, row })}
          icon={faStar}
          size="xs"
          style={GameWinningPieceStyle({ col, row, size })}
        />
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
    [props?.style, game],
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
  marginBottom: "1rem",
};

const GameConfigDialogStyle: React.CSSProperties = {
  border: "none",
  borderRadius: "0.5rem",
};

const GameConfigStyle: React.CSSProperties = {
  display: "grid",
  gap: "1rem",
  gridTemplateAreas: `
  "config_header                config_header"
  "config_column_label          config_column"
  "config_row_label             config_row"
  "config_count_label           config_count"
  "config_interval_time_label   config_interval_time"
  "config_player_label          config_player"
  "config_is_player_toggleable  config_is_player_toggleable_label"
  "empty                        config_close"
  `,
  margin: "1rem 5rem",
};

export const GameConfigDataTestID = (dataTestID: string) => {
  return {
    root: dataTestID,
    columnLabel: `${dataTestID}_COLUMN_LABEL`,
    rowLabel: `${dataTestID}_ROW_LABEL`,
    countLabel: `${dataTestID}_COUNT_LABEL`,
    column: `${dataTestID}_COLUMN`,
    row: `${dataTestID}_ROW`,
    count: `${dataTestID}_COUNT`,
    intervalTime: `${dataTestID}_INTERVAL_TIME`,
    close: `${dataTestID}_CLOSE`,
    isPlayerToggleableLabel: `${dataTestID}_IS_PLAYER_TOGGLEABLE_LABEL`,
    isPlayerToggleable: `${dataTestID}_IS_PLAYER_TOGGLEABLE`,
  };
};

export interface GameConfigProps extends GameProps {}

export const GameConfig = (props?: GameConfigProps) => {
  const game = useGameContext();
  const { config } = useGameDataTestID(props?.dataTestID ?? "GAME_CONFIG");
  const {
    configDialogRef,
    column,
    setColumn,
    row,
    setRow,
    count,
    setCount,
    isPlayerToggleable,
    setIsPlayerToggleable,
    intervalTime,
    setIntervalTime,
    setPlayer,
    maxCount,
  } = game;
  const style = useMemo<React.CSSProperties>(
    () => ({ ...GameConfigDialogStyle, ...props?.style }),
    [props?.style],
  );

  return (
    <dialog data-testid={config.root} ref={configDialogRef} style={style}>
      <div style={GameConfigStyle}>
        <h3 style={{ gridArea: "config_header" }}>Game Configuration</h3>
        <label
          data-testid={config.columnLabel}
          style={{ gridArea: "config_column_label" }}
        >
          Max Column
        </label>
        <input
          data-testid={config.column}
          style={{ gridArea: "config_column" }}
          type="number"
          value={column}
          min={1}
          onChange={(e) => setColumn(Math.max(1, parseInt(e.target.value, 10)))}
        />
        <label
          data-testid={config.rowLabel}
          style={{ gridArea: "config_row_label" }}
        >
          Max Row
        </label>
        <input
          data-testid={config.row}
          style={{ gridArea: "config_row" }}
          type="number"
          min={1}
          value={row}
          onChange={(e) => setRow(Math.max(1, parseInt(e.target.value, 10)))}
        />
        <label
          data-testid={config.countLabel}
          style={{ gridArea: "config_count_label" }}
        >
          Winning Count
        </label>
        <input
          data-testid={config.count}
          style={{ gridArea: "config_count" }}
          type="number"
          value={count}
          min={1}
          max={maxCount}
          onChange={(e) =>
            setCount(
              Math.min(
                maxCount,
                Math.max(1, parseInt(e.target.value ?? "1", 10)),
              ),
            )
          }
        />
        <label
          data-testid={"config_interval_time_label"}
          style={{ gridArea: "config_interval_time_label" }}
        >
          Interval Time
        </label>
        <input
          data-testid={"config_interval_time"}
          style={{ gridArea: "config_interval_time" }}
          type="number"
          value={intervalTime}
          min={1}
          onChange={(e) => setIntervalTime(parseInt(e.target.value, 10))}
        />

        <label
          data-testid={"config_player_label"}
          style={{ gridArea: "config_player_label" }}
        >
          First Player
        </label>
        <select
          data-testid={"config_player"}
          style={{ gridArea: "config_player" }}
          onChange={(e) => {
            setPlayer(e.currentTarget.value as GamePlayer);
          }}
        >
          <option value={GamePlayer.green}>Green</option>
          <option value={GamePlayer.red}>Red</option>
        </select>

        <input
          data-testid={config.isPlayerToggleableLabel}
          style={{ gridArea: "config_is_player_toggleable" }}
          type="checkbox"
          id={config.isPlayerToggleable}
          name={config.isPlayerToggleable}
          checked={isPlayerToggleable}
          onChange={() => {
            setIsPlayerToggleable((enabled) => !enabled);
          }}
        />
        <label
          data-testid={config.isPlayerToggleableLabel}
          htmlFor={config.isPlayerToggleable}
        >
          Green and Red Players Take Turn
        </label>
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

export const GameScoreDialogStyle = (
  game: UseGameType,
): React.CSSProperties => {
  const { hasWinner } = game;

  return {
    display: hasWinner ? "grid" : "none",
    placeItems: "center",
    minWidth: "10rem",
    minHeight: "120px",
  };
};

export const GameScoreDataTestID = (dataTestID: string) => {
  return {
    root: dataTestID,
    winner: `${dataTestID}_WINNER`,
    close: `${dataTestID}_CLOSE`,
  };
};

export interface GameScoreProps extends GameProps {}

export const GameScore = (props?: GameScoreProps) => {
  const game = useGameContext();
  const { score } = useGameDataTestID(props?.dataTestID ?? "GAME_SCORE");
  const { hasWinner, scoreDialogRef, playerTurnLabel, intervalTime, player } =
    game;

  useEffect(() => {
    setTimeout(() => {
      if (!hasWinner) {
        return;
      }

      gameOpenScoreDialog(game);
    }, 2 * intervalTime);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasWinner, intervalTime]);

  return (
    <dialog
      ref={scoreDialogRef}
      style={{ border: "none", borderRadius: "0.5rem" }}
      data-testid={score.root}
    >
      <div style={GameScoreDialogStyle(game)}>
        <h3 data-testid={score.winner}>{playerTurnLabel}</h3>
        <button
          data-testid={score.close}
          onClick={() => gameCloseScoreDialog(game)}
          style={{
            color: "white",
            backgroundColor: gameGetCellColor(player),
            border: "none",
          }}
        >
          Close
        </button>
      </div>
    </dialog>
  );
};

export const GameHeaderPlayerTurnStyle = (
  game: UseGameType,
): React.CSSProperties => {
  const { player, hasMovingPiece } = game;
  const style = { width: "100%" };

  if (hasMovingPiece) {
    return {
      ...style,
      color: "lightgrey",
    };
  }

  return {
    ...style,
    color: gameGetCellColor(player),
  };
};

export const GameHeaderResetAllStyle = (
  game: UseGameType,
): React.CSSProperties => {
  const { hasWinner, player } = game;
  const style = { width: "100%" };

  if (hasWinner) {
    return {
      ...style,
      color: "white",
      backgroundColor: gameGetCellColor(player),
    };
  }

  return style;
};

export interface GameHeaderProps extends GameProps {}

export const GameHeaderDataTestID = (dataTestID: string) => {
  return {
    root: dataTestID,
    playerTurn: `${dataTestID}_PLAYER_TURN`,
    configGame: `${dataTestID}_CONFIG_GAME`,
    resetAll: `${dataTestID}_RESET_ALL`,
  };
};

export const GameHeader = (props?: GameHeaderProps) => {
  const game = useGameContext();
  const { header } = useGameDataTestID(props?.dataTestID ?? "GAME_HEADER");
  const { pieces, hasWinner, playerTurnLabel, hasMovingPiece } = game;
  const style = useMemo<React.CSSProperties>(
    () => ({ ...GameHeaderStyle, ...props?.style }),
    [props?.style],
  );

  return (
    <div data-testid={header.root} style={style}>
      <button
        data-testid={header.configGame}
        style={{ width: "100%" }}
        onClick={() => gameOpenConfigDialog(game)}
        disabled={pieces.length !== 0}
      >
        Config Game
      </button>
      <button
        data-testid={header.playerTurn}
        style={GameHeaderPlayerTurnStyle(game)}
        disabled={hasMovingPiece}
      >
        {playerTurnLabel}
      </button>
      <button
        data-testid={header.resetAll}
        style={GameHeaderResetAllStyle(game)}
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
  width: "100%",
  height: "100vh",
};

export const GameDataTestID = (dataTestID: string) => {
  return {
    root: dataTestID,
    board: `${dataTestID}_BOARD`,
    header: `${dataTestID}_HEADER`,
    cells: `${dataTestID}_CELLS`,
    pieces: `${dataTestID}_PIECES`,
    config: `${dataTestID}_CONFIG`,
    movingPiece: `${dataTestID}_MOVING_PIECE`,
    winningPieces: `${dataTestID}_WINNING_PIECES`,
    score: `${dataTestID}_SCORE`,
  };
};

export const Game = (props?: GameProps): JSX.Element => {
  const { game } = useGameDataTestID(props?.dataTestID ?? "GAME");
  const style = useMemo<React.CSSProperties>(
    () => ({ ...GameStyle, ...props?.style }),
    [props?.style],
  );

  return (
    <div data-testid={game.root} style={style}>
      <GameBoard dataTestID={game.board}>
        <GameHeader dataTestID={game.header} />
        <GameCells dataTestID={game.cells} />
        <GamePieces dataTestID={game.pieces} />
        <GameWinningPieces dataTestID={game.winningPieces} />
        <GameMovingPiece dataTestID={game.movingPiece} />
        <GameConfig dataTestID={game.config} />
        <GameScore dataTestID={game.score} />
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

