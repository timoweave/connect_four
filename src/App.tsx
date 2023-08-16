import { useState, useMemo, createContext, useContext } from "react";

export enum GamePlayer {
  green = "green",
  red = "red",
}

export enum GameCellColor {
  white = "white",
  green = "green",
  red = "red",
}

export interface GamePiece {
  color: GameCellColor;
  row: number;
  col: number;
}

export const useGame = (props: {
  size: number;
  column: number;
  row: number;
  count: number;
}) => {
  const [count, setCount] = useState<number>(props.count);
  const [size, setSize] = useState<number>(props.size);
  const [column, setColumn] = useState<number>(props.column);
  const [row, setRow] = useState<number>(props.row);
  const [winner, setWinner] = useState<GamePlayer | null>(null);
  const [player, setPlayer] = useState<GamePlayer>(GamePlayer.green);
  const [pieces, setPieces] = useState<GamePiece[]>([]);

  const columns = useMemo<number[]>(
    () => Array.from({ length: props.column }, (_, i) => i),
    [props.column]
  );
  const rows = useMemo<number[]>(
    () => Array.from({ length: props.row }, (_, i) => i),
    [props.row]
  );

  return {
    winner,
    setWinner,
    count,
    setCount,
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
  };
};

export type UseGameType = ReturnType<typeof useGame>;

const USE_GAME_DEFAULT: UseGameType = {
  winner: null,
  setWinner: () => {},
  count: 0,
  setCount: () => {},
  size: 0,
  setSize: () => {},
  column: 0,
  setColumn: () => {},
  columns: [],
  row: 0,
  setRow: () => {},
  rows: [],
  player: GamePlayer.green,
  setPlayer: () => {},
  pieces: [],
  setPieces: () => {},
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
  const { row, pieces } = game;

  const rows = pieces
    .filter((a) => a.col === col)
    .map((a) => a.row)
    .sort((a, b) => a - b);

  if (rows.length === row) {
    // throw new Error(`no more row in column ${col}`); // for toaster
    console.error(`no more row in column ${col}`);
    return null;
  }

  return (rows[0] ?? row) - 1;
};

export const addPiece = (game: UseGameType, col: number): void => {
  const { player, setPlayer, setPieces } = game;
  const color = gameGetCellColor(player);
  const row = gameFindNextRow(game, col);
  if (row == null) {
    return;
  }

  setPieces((p) => [...p, { color, row, col }]);
  setPlayer(gameTogglePlayer);
};

const gameCellGridArea = (props: { col: number; row: number }): string => {
  return `game_cell_${props.row}_${props.col}`;
};

const gamebuttonGridArea = (props: { col: number }): string => {
  return `game_button_${props.col}`;
};

const GameButtonStyle = (
  col: number,
  player: GamePlayer
): React.CSSProperties => ({
  gridArea: gamebuttonGridArea({ col }),
  color: "white",
  backgroundColor: gameGetCellColor(player),
  width: "100%",
});

const GameButtons = () => {
  const game = useGameFromContext();
  const { columns, player } = game;

  return (
    <>
      {columns.map((col) => (
        <button
          style={GameButtonStyle(col, player)}
          disabled={gameIsFullColumn(game, col)}
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
  console.log(gridTemplateAreas);
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
