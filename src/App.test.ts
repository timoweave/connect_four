import { describe, test, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import {
  useGame,
  gameTogglePlayer,
  UseGameType,
  GamePlayer,
  gameAddPiece,
  gameReset,
  GameCellColor,
} from "./App";

describe("useGame, about basic", () => {
  test("initialization", ({ expect }) => {
    const rendered = renderHook(() =>
      useGame({ size: 10, count: 5, column: 5, row: 5 })
    );
    const game = () => rendered.result.current;

    expect(game().columns).toHaveLength(5);
    expect(game().counts).toHaveLength(5);
    expect(game().rows).toHaveLength(5);
  });

  test("initial red player", () => {
    const rendered = renderHook(() => useGame({ player: GamePlayer.red }));
    const game = () => rendered.result.current;

    expect(game().player).toEqual(GamePlayer.red);
  });

  test("toggle player", () => {
    const rendered = renderHook(() =>
      useGame({ size: 10, count: 5, column: 5, row: 5 })
    );
    const game = (): UseGameType => rendered.result.current;
    act(() => gameTogglePlayer(game()));
    expect(game().player).toEqual(GamePlayer.red);

    act(() => gameTogglePlayer(game()));
    act(() => gameTogglePlayer(game()));
    expect(game().player).toEqual(GamePlayer.red);
  });

  test("reset game", () => {
    const rendered = renderHook(() =>
      useGame({ size: 10, count: 2, column: 5, row: 5 })
    );
    const game = (): UseGameType => rendered.result.current;

    act(() => {
      game().setIsPlayerToggleable(false);
      gameAddPiece({ game: game(), col: 0 });
      gameAddPiece({ game: game(), col: 1 });
    });
    expect(game().hasWinner).toBeTruthy();
    expect(game().winner).toEqual(GamePlayer.green);
    act(() => {
      gameReset(game());
    });
    expect(game().hasWinner).toBeFalsy();
    expect(game().winner).toBeNull();
  });

  test("init game state with pieces", () => {
    //   0    1     2     3     4     5     6
    // 0
    // 1      G-1,1       G-1,3       G-1,5
    // 2            G-2,2 G-2,3 G-2,4
    // 3      G-3,1 G-3,2  add  G-3,4 G-3,5
    // 4            G-4,2 G-4,3 G-4,4
    // 5      G-5,1       G-5,3       G-5,5
    // 6
    const rendered = renderHook(() =>
      useGame({
        count: 5,
        column: 7,
        row: 7,
        pieces: [
          { row: 3, col: 2, color: GameCellColor.green },
          { row: 3, col: 1, color: GameCellColor.green },
          { row: 3, col: 4, color: GameCellColor.green },
          { row: 3, col: 5, color: GameCellColor.green },

          { row: 2, col: 3, color: GameCellColor.green },
          { row: 1, col: 3, color: GameCellColor.green },
          { row: 4, col: 3, color: GameCellColor.green },
          { row: 5, col: 3, color: GameCellColor.green },

          { row: 1, col: 1, color: GameCellColor.green },
          { row: 2, col: 2, color: GameCellColor.green },
          { row: 4, col: 4, color: GameCellColor.green },
          { row: 5, col: 5, color: GameCellColor.green },

          { row: 5, col: 1, color: GameCellColor.green },
          { row: 4, col: 2, color: GameCellColor.green },
          { row: 2, col: 4, color: GameCellColor.green },
          { row: 1, col: 5, color: GameCellColor.green },
        ],
      })
    );
    const game = () => rendered.result.current;
    expect(game().pieces).toHaveLength(16);
    expect(game()).toContain({ hasWinner: false, column: 7, row: 7, count: 5 });
    expect(game().pieceLocation.current).toMatchInlineSnapshot(`
      Map {
        "3_2" => "green",
        "3_1" => "green",
        "3_4" => "green",
        "3_5" => "green",
        "2_3" => "green",
        "1_3" => "green",
        "4_3" => "green",
        "5_3" => "green",
        "1_1" => "green",
        "2_2" => "green",
        "4_4" => "green",
        "5_5" => "green",
        "5_1" => "green",
        "4_2" => "green",
        "2_4" => "green",
        "1_5" => "green",
      }
    `);

    act(() => gameAddPiece({ game: game(), col: 3, row: 3 }));
    expect(game().pieces).toHaveLength(17);
    expect(game().pieceLocation.current).toMatchInlineSnapshot(`
      Map {
        "3_2" => "green",
        "3_1" => "green",
        "3_4" => "green",
        "3_5" => "green",
        "2_3" => "green",
        "1_3" => "green",
        "4_3" => "green",
        "5_3" => "green",
        "1_1" => "green",
        "2_2" => "green",
        "4_4" => "green",
        "5_5" => "green",
        "5_1" => "green",
        "4_2" => "green",
        "2_4" => "green",
        "1_5" => "green",
        "3_3" => "green",
      }
    `);
    expect(game().hasWinner).toBeTruthy();
    expect(game().winner).toEqual(GamePlayer.green);
  });
});

describe("useGame, about pieces", () => {
  test("add no more than 2 piece once has a winner", () => {
    const rendered = renderHook(() =>
      useGame({ size: 10, count: 2, column: 5, row: 5 })
    );
    const game = (): UseGameType => rendered.result.current;

    act(() => game().setIsPlayerToggleable(false));
    act(() => gameAddPiece({ game: game(), col: 0 }));
    act(() => gameAddPiece({ game: game(), col: 1 }));
    act(() => gameAddPiece({ game: game(), col: 2 }));
    act(() => gameAddPiece({ game: game(), col: 3 }));
    act(() => gameAddPiece({ game: game(), col: 4 }));
    act(() => gameAddPiece({ game: game(), col: 5 }));
    expect(game().hasWinner).toBeTruthy();
    expect(game().winner).toEqual(GamePlayer.green);
    expect(game().pieces).toHaveLength(2);
    expect(game().pieceLocation.current.size).toEqual(2);
    expect(game().pieceLocation.current).toMatchInlineSnapshot(`
      Map {
        "4_0" => "green",
        "4_1" => "green",
      }
    `);
  });

  test("add no more than 3 piece once has a winner", () => {
    //   0     1     2     3     4
    // 0
    // 1
    // 2
    // 3
    // 4 R-4,0 R-4,1 R-4,2 x     x      x

    const rendered = renderHook(() =>
      useGame({ size: 10, count: 3, column: 5, row: 5 })
    );
    const game = (): UseGameType => rendered.result.current;

    act(() => game().setPlayer(GamePlayer.red));
    act(() => game().setIsPlayerToggleable(false));
    act(() => gameAddPiece({ game: game(), col: 0 }));
    act(() => gameAddPiece({ game: game(), col: 1 }));
    act(() => gameAddPiece({ game: game(), col: 2 }));
    act(() => gameAddPiece({ game: game(), col: 3 }));
    act(() => gameAddPiece({ game: game(), col: 4 }));
    act(() => gameAddPiece({ game: game(), col: 5 }));
    expect(game().hasWinner).toBeTruthy();
    expect(game().winner).toEqual(GamePlayer.red);
    expect(game().pieces).toHaveLength(3);
    expect(game().pieceLocation.current.size).toEqual(3);
    expect(game().pieceLocation.current).toMatchInlineSnapshot(`
      Map {
        "4_0" => "red",
        "4_1" => "red",
        "4_2" => "red",
      }
    `);
  });

  test("cannot add piece out the board", () => {
    const rendered = renderHook(() =>
      useGame({ size: 10, count: 2, column: 2, row: 2 })
    );
    const game = (): UseGameType => rendered.result.current;

    act(() => gameAddPiece({ game: game(), col: 3 }));
    expect(game().player).toEqual(GamePlayer.green);
    expect(game().pieceLocation.current).toMatchInlineSnapshot("Map {}");

    act(() => gameAddPiece({ game: game(), col: 10, row: 20 }));
    expect(game().player).toEqual(GamePlayer.green);
    expect(game().pieceLocation.current).toMatchInlineSnapshot("Map {}");

    act(() => gameAddPiece({ game: game(), col: 10, row: 20 }));
    expect(game().player).toEqual(GamePlayer.green);
    expect(game().pieceLocation.current).toMatchInlineSnapshot("Map {}");
  });

  test("add 3 horizontal pieces and find winner", () => {
    //   0     1     2     3     4
    // 0
    // 1
    // 2
    // 3
    // 4 G-4,0 G-4,1 G-4,2

    const rendered = renderHook(() =>
      useGame({ size: 10, count: 3, column: 5, row: 5 })
    );
    const game = (): UseGameType => rendered.result.current;

    act(() => game().setIsPlayerToggleable(false));
    act(() => gameAddPiece({ game: game(), col: 0 }));
    act(() => gameAddPiece({ game: game(), col: 1 }));
    act(() => gameAddPiece({ game: game(), col: 2 }));

    expect(game().pieceLocation.current).toMatchInlineSnapshot(`
      Map {
        "4_0" => "green",
        "4_1" => "green",
        "4_2" => "green",
      }
    `);
    expect(game().hasWinner).toBeTruthy();
    expect(game().winner).toEqual(GamePlayer.green);
  });
});

describe("useGame, about player", () => {
  test("player takes turn", () => {
    const rendered = renderHook(() =>
      useGame({ size: 10, count: 10, column: 1, row: 10 })
    );
    const game = (): UseGameType => rendered.result.current;

    expect(game().player).toEqual(GamePlayer.green);

    act(() => gameAddPiece({ game: game(), col: 0 }));
    expect(game().player).toEqual(GamePlayer.red);

    act(() => gameAddPiece({ game: game(), col: 0 }));
    expect(game().player).toEqual(GamePlayer.green);

    act(() => gameAddPiece({ game: game(), col: 0 }));
    expect(game().player).toEqual(GamePlayer.red);

    act(() => gameAddPiece({ game: game(), col: 0 }));
    expect(game().player).toEqual(GamePlayer.green);

    act(() => gameAddPiece({ game: game(), col: 0 }));
    expect(game().player).toEqual(GamePlayer.red);

    act(() => gameAddPiece({ game: game(), col: 0 }));
    expect(game().player).toEqual(GamePlayer.green);

    act(() => gameAddPiece({ game: game(), col: 0 }));
    expect(game().player).toEqual(GamePlayer.red);

    act(() => gameAddPiece({ game: game(), col: 0 }));
    expect(game().player).toEqual(GamePlayer.green);
  });

  test("player can be skipped, and fixed on player red", () => {
    const rendered = renderHook(() =>
      useGame({ size: 10, count: 10, column: 1, row: 12 })
    );
    const game = (): UseGameType => rendered.result.current;

    expect(game().player).toEqual(GamePlayer.green);

    act(() => gameAddPiece({ game: game(), col: 0 }));
    expect(game().player).toEqual(GamePlayer.red);

    act(() => game().setIsPlayerToggleable(false));
    act(() => gameAddPiece({ game: game(), col: 0 }));
    expect(game().player).toEqual(GamePlayer.red);

    act(() => gameAddPiece({ game: game(), col: 0 }));
    expect(game().player).toEqual(GamePlayer.red);

    act(() => gameAddPiece({ game: game(), col: 0 }));
    expect(game().player).toEqual(GamePlayer.red);

    act(() => gameAddPiece({ game: game(), col: 0 }));
    expect(game().player).toEqual(GamePlayer.red);

    act(() => gameAddPiece({ game: game(), col: 0 }));
    expect(game().player).toEqual(GamePlayer.red);

    act(() => gameAddPiece({ game: game(), col: 0 }));
    expect(game().player).toEqual(GamePlayer.red);
  });

  test("player can be skipped, and resumed", () => {
    const rendered = renderHook(() =>
      useGame({ size: 10, count: 10, column: 1, row: 12 })
    );
    const game = (): UseGameType => rendered.result.current;

    expect(game().player).toEqual(GamePlayer.green);

    act(() => gameAddPiece({ game: game(), col: 0 }));
    expect(game().player).toEqual(GamePlayer.red);

    act(() => game().setIsPlayerToggleable(false));
    act(() => gameAddPiece({ game: game(), col: 0 }));
    expect(game().player).toEqual(GamePlayer.red);

    act(() => gameAddPiece({ game: game(), col: 0 }));
    expect(game().player).toEqual(GamePlayer.red);

    act(() => gameAddPiece({ game: game(), col: 0 }));
    expect(game().player).toEqual(GamePlayer.red);

    act(() => gameAddPiece({ game: game(), col: 0 }));
    expect(game().player).toEqual(GamePlayer.red);

    act(() => game().setIsPlayerToggleable(true));
    act(() => gameAddPiece({ game: game(), col: 0 }));
    expect(game().player).toEqual(GamePlayer.green);

    act(() => gameAddPiece({ game: game(), col: 0 }));
    expect(game().player).toEqual(GamePlayer.red);

    act(() => gameAddPiece({ game: game(), col: 0 }));
    expect(game().player).toEqual(GamePlayer.green);

    act(() => gameAddPiece({ game: game(), col: 0 }));
    expect(game().player).toEqual(GamePlayer.red);

    act(() => gameAddPiece({ game: game(), col: 0 }));
    expect(game().player).toEqual(GamePlayer.green);
  });
});

describe("useGame, vertical winner check", () => {
  test("has 3 vertical (up/down) winner", () => {
    //   0     1     2     3     4
    // 0 G-0,0
    // 1 G-1,0
    // 2 G-2,0
    // 3 G-3,0
    // 4 G-4,0

    const rendered = renderHook(() =>
      useGame({ size: 10, count: 3, column: 5, row: 5 })
    );
    const game = (): UseGameType => rendered.result.current;

    act(() => game().setIsPlayerToggleable(false));
    act(() => gameAddPiece({ game: game(), col: 0, row: 4 }));
    act(() => gameAddPiece({ game: game(), col: 0, row: 3 }));
    act(() => gameAddPiece({ game: game(), col: 0, row: 2 }));
    act(() => gameAddPiece({ game: game(), col: 0, row: 1 }));
    act(() => gameAddPiece({ game: game(), col: 0, row: 0 }));

    expect(game().pieceLocation.current).toMatchInlineSnapshot(`
      Map {
        "4_0" => "green",
        "3_0" => "green",
        "2_0" => "green",
      }
    `);
    expect(game().hasWinner).toBeTruthy();
    expect(game().winner).toEqual(GamePlayer.green);
  });

  test("has 4 vertical (up/down) winner", () => {
    //   0     1     2     3     4
    // 0       G-0,1
    // 1       G-1,1
    // 2       G-2,1
    // 3       G-3,1
    // 4       G-4,1

    const rendered = renderHook(() =>
      useGame({ size: 10, count: 4, column: 5, row: 5 })
    );
    const game = (): UseGameType => rendered.result.current;

    act(() => game().setIsPlayerToggleable(false));
    act(() => gameAddPiece({ game: game(), col: 1, row: 4 }));
    act(() => gameAddPiece({ game: game(), col: 1, row: 3 }));
    act(() => gameAddPiece({ game: game(), col: 1, row: 2 }));
    act(() => gameAddPiece({ game: game(), col: 1, row: 1 }));
    act(() => gameAddPiece({ game: game(), col: 1, row: 0 }));

    expect(game().pieceLocation.current).toMatchInlineSnapshot(`
        Map {
          "4_1" => "green",
          "3_1" => "green",
          "2_1" => "green",
          "1_1" => "green",
        }
      `);
    expect(game().hasWinner).toBeTruthy();
    expect(game().winner).toEqual(GamePlayer.green);
  });

  test("has 5 vertical (up/down) winner", () => {
    //   0     1     2     3     4
    // 0             G-0,2
    // 1             G-1,2
    // 2             G-2,2
    // 3             G-3,2
    // 4             G-4,2

    const rendered = renderHook(() =>
      useGame({ size: 10, count: 5, column: 5, row: 5 })
    );
    const game = (): UseGameType => rendered.result.current;

    act(() => game().setIsPlayerToggleable(false));
    act(() => gameAddPiece({ game: game(), col: 2, row: 4 }));
    act(() => gameAddPiece({ game: game(), col: 2, row: 3 }));
    act(() => gameAddPiece({ game: game(), col: 2, row: 2 }));
    act(() => gameAddPiece({ game: game(), col: 2, row: 1 }));
    act(() => gameAddPiece({ game: game(), col: 2, row: 0 }));

    expect(game().pieceLocation.current).toMatchInlineSnapshot(`
      Map {
        "4_2" => "green",
        "3_2" => "green",
        "2_2" => "green",
        "1_2" => "green",
        "0_2" => "green",
      }
    `);
    expect(game().hasWinner).toBeTruthy();
    expect(game().winner).toEqual(GamePlayer.green);
  });
});

describe("useGame, horizontal winner check", () => {
  test("has 3 horizontal (left/right) winner", () => {
    //   0     1     2     3     4
    // 0
    // 1
    // 2
    // 3
    // 4 G-4,0 G-4,1 G-4,2 G-4,3 G-4,4

    const rendered = renderHook(() =>
      useGame({ size: 10, count: 3, column: 5, row: 5 })
    );
    const game = (): UseGameType => rendered.result.current;

    act(() => game().setIsPlayerToggleable(false));
    act(() => gameAddPiece({ game: game(), col: 0, row: 4 }));
    act(() => gameAddPiece({ game: game(), col: 1, row: 4 }));
    act(() => gameAddPiece({ game: game(), col: 2, row: 4 }));
    act(() => gameAddPiece({ game: game(), col: 3, row: 4 }));
    act(() => gameAddPiece({ game: game(), col: 4, row: 4 }));

    expect(game().pieceLocation.current).toMatchInlineSnapshot(`
      Map {
        "4_0" => "green",
        "4_1" => "green",
        "4_2" => "green",
      }
    `);
    expect(game().hasWinner).toBeTruthy();
    expect(game().winner).toEqual(GamePlayer.green);
  });

  test("has 4 horizontal (left/right) winner", () => {
    //   0     1     2     3     4
    // 0       G-0,1
    // 1       G-1,1
    // 2       G-2,1
    // 3       G-3,1
    // 4       G-4,1

    const rendered = renderHook(() =>
      useGame({ size: 10, count: 4, column: 5, row: 5 })
    );
    const game = (): UseGameType => rendered.result.current;

    act(() => game().setIsPlayerToggleable(false));
    act(() => gameAddPiece({ game: game(), col: 1, row: 0 }));
    act(() => gameAddPiece({ game: game(), col: 1, row: 1 }));
    act(() => gameAddPiece({ game: game(), col: 1, row: 2 }));
    act(() => gameAddPiece({ game: game(), col: 1, row: 3 }));
    act(() => gameAddPiece({ game: game(), col: 1, row: 4 }));

    expect(game().pieceLocation.current).toMatchInlineSnapshot(`
      Map {
        "0_1" => "green",
        "1_1" => "green",
        "2_1" => "green",
        "3_1" => "green",
      }
    `);
    expect(game().hasWinner).toBeTruthy();
    expect(game().winner).toEqual(GamePlayer.green);
  });

  test("has 5 horizontal (left/right) winner", () => {
    //   0     1     2     3     4
    // 0       G-0,1
    // 1       G-1,1
    // 2       G-2,1
    // 3       G-3,1
    // 4       G-4,1

    const rendered = renderHook(() =>
      useGame({ size: 10, count: 5, column: 5, row: 5 })
    );
    const game = (): UseGameType => rendered.result.current;

    act(() => game().setIsPlayerToggleable(false));
    act(() => gameAddPiece({ game: game(), col: 1, row: 0 }));
    act(() => gameAddPiece({ game: game(), col: 1, row: 1 }));
    act(() => gameAddPiece({ game: game(), col: 1, row: 2 }));
    act(() => gameAddPiece({ game: game(), col: 1, row: 3 }));
    act(() => gameAddPiece({ game: game(), col: 1, row: 4 }));

    expect(game().pieceLocation.current).toMatchInlineSnapshot(`
      Map {
        "0_1" => "green",
        "1_1" => "green",
        "2_1" => "green",
        "3_1" => "green",
        "4_1" => "green",
      }
    `);
    expect(game().hasWinner).toBeTruthy();
    expect(game().winner).toEqual(GamePlayer.green);
  });
});

describe("useGame, rise diagonal winner check", () => {
  test("has 3 rise diagonal (down-left/up-right) winner", () => {
    //   0     1     2     3     4
    // 0                         R-0,4
    // 1                   R-1,3
    // 2             R-2,2
    // 3       R-1,3
    // 4 R-0,4

    const rendered = renderHook(() =>
      useGame({ size: 10, count: 3, column: 5, row: 5 })
    );
    const game = (): UseGameType => rendered.result.current;

    act(() => game().setPlayer(GamePlayer.red));
    act(() => game().setIsPlayerToggleable(false));

    act(() => gameAddPiece({ game: game(), col: 4, row: 0 }));
    act(() => gameAddPiece({ game: game(), col: 3, row: 1 }));
    act(() => gameAddPiece({ game: game(), col: 2, row: 2 }));
    act(() => gameAddPiece({ game: game(), col: 1, row: 3 }));
    act(() => gameAddPiece({ game: game(), col: 0, row: 4 }));

    expect(game().pieceLocation.current).toMatchInlineSnapshot(`
      Map {
        "0_4" => "red",
        "1_3" => "red",
        "2_2" => "red",
      }
    `);
    expect(game().pieces).toHaveLength(3);
    expect(game().hasWinner).toBeTruthy();
    expect(game().winner).toEqual(GamePlayer.red);
  });

  test("has 4 rise diagonal (down-left/up-right) winner", () => {
    //   0     1     2     3     4
    // 0                         R-0,4
    // 1                   R-1,3
    // 2             R-2,2
    // 3       R-1,3
    // 4 R-0,4

    const rendered = renderHook(() =>
      useGame({ size: 10, count: 4, column: 5, row: 5 })
    );
    const game = (): UseGameType => rendered.result.current;

    act(() => game().setPlayer(GamePlayer.red));
    act(() => game().setIsPlayerToggleable(false));

    act(() => gameAddPiece({ game: game(), col: 4, row: 0 }));
    act(() => gameAddPiece({ game: game(), col: 3, row: 1 }));
    act(() => gameAddPiece({ game: game(), col: 2, row: 2 }));
    act(() => gameAddPiece({ game: game(), col: 1, row: 3 }));
    act(() => gameAddPiece({ game: game(), col: 0, row: 4 }));

    expect(game().pieceLocation.current).toMatchInlineSnapshot(`
      Map {
        "0_4" => "red",
        "1_3" => "red",
        "2_2" => "red",
        "3_1" => "red",
      }
    `);
    expect(game().pieces).toHaveLength(4);
    expect(game().hasWinner).toBeTruthy();
    expect(game().winner).toEqual(GamePlayer.red);
  });

  test("has 5 rise diagonal (down-left/up-right) winner", () => {
    //   0     1     2     3     4
    // 0                         R-0,4
    // 1                   R-1,3
    // 2             R-2,2
    // 3       R-1,3
    // 4 R-0,4

    const rendered = renderHook(() =>
      useGame({ size: 10, count: 5, column: 5, row: 5 })
    );
    const game = (): UseGameType => rendered.result.current;

    act(() => game().setPlayer(GamePlayer.red));
    act(() => game().setIsPlayerToggleable(false));

    act(() => gameAddPiece({ game: game(), col: 4, row: 0 }));
    act(() => gameAddPiece({ game: game(), col: 3, row: 1 }));
    act(() => gameAddPiece({ game: game(), col: 2, row: 2 }));
    act(() => gameAddPiece({ game: game(), col: 1, row: 3 }));
    act(() => gameAddPiece({ game: game(), col: 0, row: 4 }));

    expect(game().pieceLocation.current).toMatchInlineSnapshot(`
      Map {
        "0_4" => "red",
        "1_3" => "red",
        "2_2" => "red",
        "3_1" => "red",
        "4_0" => "red",
      }
    `);
    expect(game().pieces).toHaveLength(5);
    expect(game().hasWinner).toBeTruthy();
    expect(game().winner).toEqual(GamePlayer.red);
  });
});

describe("useGame, fall diagonal winner check", () => {
  test("has 3 fall diagonal (up-left/down-right) winner", () => {
    //   0     1     2     3     4
    // 0 R-0,0
    // 1       R-1,1
    // 2             R-2,2
    // 3                   R-3,3
    // 4                         R-4,4

    const rendered = renderHook(() =>
      useGame({ size: 10, count: 3, column: 5, row: 5 })
    );
    const game = (): UseGameType => rendered.result.current;

    act(() => game().setPlayer(GamePlayer.red));
    act(() => game().setIsPlayerToggleable(false));

    act(() => gameAddPiece({ game: game(), col: 0, row: 0 }));
    act(() => gameAddPiece({ game: game(), col: 1, row: 1 }));
    act(() => gameAddPiece({ game: game(), col: 2, row: 2 }));
    act(() => gameAddPiece({ game: game(), col: 3, row: 3 }));
    act(() => gameAddPiece({ game: game(), col: 4, row: 4 }));

    expect(game().pieceLocation.current).toMatchInlineSnapshot(`
      Map {
        "0_0" => "red",
        "1_1" => "red",
        "2_2" => "red",
      }
    `);
    expect(game().pieces).toHaveLength(3);
    expect(game().hasWinner).toBeTruthy();
    expect(game().winner).toEqual(GamePlayer.red);
  });

  test("has 4 fall diagonal (up-left/down-right) winner", () => {
    //   0     1     2     3     4
    // 0 R-0,0
    // 1       R-1,1
    // 2             R-2,2
    // 3                   R-3,3
    // 4                         R-4,4

    const rendered = renderHook(() =>
      useGame({ size: 10, count: 4, column: 5, row: 5 })
    );
    const game = (): UseGameType => rendered.result.current;

    act(() => game().setPlayer(GamePlayer.red));
    act(() => game().setIsPlayerToggleable(false));

    act(() => gameAddPiece({ game: game(), col: 0, row: 0 }));
    act(() => gameAddPiece({ game: game(), col: 1, row: 1 }));
    act(() => gameAddPiece({ game: game(), col: 2, row: 2 }));
    act(() => gameAddPiece({ game: game(), col: 3, row: 3 }));
    act(() => gameAddPiece({ game: game(), col: 4, row: 4 }));

    expect(game().pieceLocation.current).toMatchInlineSnapshot(`
      Map {
        "0_0" => "red",
        "1_1" => "red",
        "2_2" => "red",
        "3_3" => "red",
      }
    `);
    expect(game().pieces).toHaveLength(4);
    expect(game().hasWinner).toBeTruthy();
    expect(game().winner).toEqual(GamePlayer.red);
  });

  test("has 5 fall diagonal (up-left/down-right) winner", () => {
    //   0     1     2     3     4
    // 0 R-0,0
    // 1       R-1,1
    // 2             R-2,2
    // 3                   R-3,3
    // 4                         R-4,4

    const rendered = renderHook(() =>
      useGame({ size: 10, count: 5, column: 5, row: 5 })
    );
    const game = (): UseGameType => rendered.result.current;

    act(() => game().setPlayer(GamePlayer.red));
    act(() => game().setIsPlayerToggleable(false));

    act(() => gameAddPiece({ game: game(), col: 0, row: 0 }));
    act(() => gameAddPiece({ game: game(), col: 1, row: 1 }));
    act(() => gameAddPiece({ game: game(), col: 2, row: 2 }));
    act(() => gameAddPiece({ game: game(), col: 3, row: 3 }));
    act(() => gameAddPiece({ game: game(), col: 4, row: 4 }));

    expect(game().pieceLocation.current).toMatchInlineSnapshot(`
      Map {
        "0_0" => "red",
        "1_1" => "red",
        "2_2" => "red",
        "3_3" => "red",
        "4_4" => "red",
      }
    `);
    expect(game().pieces).toHaveLength(5);
    expect(game().hasWinner).toBeTruthy();
    expect(game().winner).toEqual(GamePlayer.red);
  });
});

describe("game execrise", () => {
  test("vertical stack of green and red pieces", () => {
    //   0     1     2     3     4
    // 0
    // 1
    // 2 G-2,0
    // 3 G-3,0       R-3,2
    // 4 G-4,0       R-4,2

    const rendered = renderHook(() => useGame({ count: 3, column: 5, row: 5 }));
    const game = (): UseGameType => rendered.result.current;

    [0, 2, 0, 2, 0, 2].map((col) =>
      act(() => gameAddPiece({ game: game(), col }))
    );

    expect(game().pieceLocation.current).toMatchInlineSnapshot(`
      Map {
        "4_0" => "green",
        "4_2" => "red",
        "3_0" => "green",
        "3_2" => "red",
        "2_0" => "green",
      }
    `);
    expect(game().hasWinner).toBeTruthy();
    expect(game().winner).toEqual(GamePlayer.green);
  });

  test("horizontal line of green and red pieces", () => {
    //   0     1     2     3     4
    // 0
    // 1
    // 2
    // 3 R-3,0 R-3,1
    // 4 G-4,0 G-4,1 G-42

    const rendered = renderHook(() => useGame({ count: 3, column: 5, row: 5 }));
    const game = (): UseGameType => rendered.result.current;

    [0, 0, 1, 1, 2, 2].map((col) =>
      act(() => gameAddPiece({ game: game(), col }))
    );

    expect(game().pieceLocation.current).toMatchInlineSnapshot(`
      Map {
        "4_0" => "green",
        "3_0" => "red",
        "4_1" => "green",
        "3_1" => "red",
        "4_2" => "green",
      }
    `);
    expect(game().hasWinner).toBeTruthy();
    expect(game().pieces).toHaveLength(5);
    expect(game().winner).toEqual(GamePlayer.green);
  });

  test("horizontal line of green and red pieces", () => {
    //   0     1     2     3     4
    // 0
    // 1             R-1,2
    // 2 G-2,0 R-2,1 R-2,2
    // 3 R-3,0 G-3,1 G-3,2
    // 4 G-4,0 G-4,1 R-4,2

    const rendered = renderHook(() => useGame({ count: 3, column: 5, row: 5 }));
    const game = (): UseGameType => rendered.result.current;

    [0, 0, 1, 2, 1, 1, 2, 2, 0, 2].map((col) =>
      act(() => gameAddPiece({ game: game(), col }))
    );

    expect(game().pieceLocation.current).toMatchInlineSnapshot(`
      Map {
        "4_0" => "green",
        "3_0" => "red",
        "4_1" => "green",
        "4_2" => "red",
        "3_1" => "green",
        "2_1" => "red",
        "3_2" => "green",
        "2_2" => "red",
        "2_0" => "green",
        "1_2" => "red",
      }
    `);
    expect(game().pieces).toHaveLength(10);
    expect(game().hasWinner).toBeTruthy();
    expect(game().winner).toEqual(GamePlayer.red);
  });
});
