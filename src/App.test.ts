import { describe, test, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import {
  useGame,
  gameTogglePlayer,
  UseGameType,
  GamePlayer,
  gameAddPiece,
  gameReset,
} from "./App";

describe("useGame hook", () => {
  test("initialization", () => {
    const rendered = renderHook(() =>
      useGame({ size: 10, count: 5, column: 5, row: 5 })
    );
    const game = () => rendered.result.current;

    expect(game().columns).toHaveLength(5);
    expect(game().counts).toHaveLength(5);
    expect(game().rows).toHaveLength(5);
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
  });

  test("add 3 horizontal pieces and find winner", () => {
    const rendered = renderHook(() =>
      useGame({ size: 10, count: 3, column: 5, row: 5 })
    );
    const game = (): UseGameType => rendered.result.current;

    act(() => game().setIsPlayerToggleable(false));
    act(() => gameAddPiece({ game: game(), col: 0 }));
    act(() => gameAddPiece({ game: game(), col: 1 }));
    act(() => gameAddPiece({ game: game(), col: 2 }));

    expect(game().pieceLocation).toMatchInlineSnapshot(`
      {
        "current": Map {
          "4_0" => "green",
          "4_1" => "green",
          "4_2" => "green",
        },
      }
    `);
    expect(game().hasWinner).toBeTruthy();
    expect(game().winner).toEqual(GamePlayer.green);
  });

  test("has 3 vertical (up/down) winner", () => {
    //   0    1    2    3    4
    // 0 (0,0)
    // 1 (1,0)
    // 2 (2,0)
    // 3 (3,0)
    // 4 (4,0)

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

    expect(game().pieceLocation).toMatchInlineSnapshot(`
      {
        "current": Map {
          "4_0" => "green",
          "3_0" => "green",
          "2_0" => "green",
        },
      }
    `);
    expect(game().hasWinner).toBeTruthy();
    expect(game().winner).toEqual(GamePlayer.green);
  });

  test("has 4 vertical (up/down) winner", () => {
    //   0    1    2    3    4
    // 0      (0,1)
    // 1      (1,1)
    // 2      (2,1)
    // 3      (3,1)
    // 4      (4,1)

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

    expect(game().pieceLocation).toMatchInlineSnapshot(`
      {
        "current": Map {
          "4_1" => "green",
          "3_1" => "green",
          "2_1" => "green",
          "1_1" => "green",
        },
      }
    `);
    expect(game().hasWinner).toBeTruthy();
    expect(game().winner).toEqual(GamePlayer.green);
  });

  test("has 5 vertical (up/down) winner", () => {
    //   0    1    2    3    4
    // 0           (0,2)
    // 1           (1,2)
    // 2           (2,2)
    // 3           (3,2)
    // 4           (4,2)

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

    expect(game().pieceLocation).toMatchInlineSnapshot(`
      {
        "current": Map {
          "4_2" => "green",
          "3_2" => "green",
          "2_2" => "green",
          "1_2" => "green",
          "0_2" => "green",
        },
      }
    `);
    expect(game().hasWinner).toBeTruthy();
    expect(game().winner).toEqual(GamePlayer.green);
  });

  test("has 3 horizontal (left/right) winner", () => {
    //   0    1    2    3    4
    // 0
    // 1
    // 2
    // 3
    // 4 (4,0)(4,1)(4,2)(4,3)(4,4)

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

    expect(game().pieceLocation).toMatchInlineSnapshot(`
      {
        "current": Map {
          "4_0" => "green",
          "4_1" => "green",
          "4_2" => "green",
        },
      }
    `);
    expect(game().hasWinner).toBeTruthy();
    expect(game().winner).toEqual(GamePlayer.green);
  });

  test("has 4 horizontal (left/right) winner", () => {
    //   0    1    2    3    4
    // 0      (0,1)
    // 1      (1,1)
    // 2      (2,1)
    // 3      (3,1)
    // 4      (4,1)

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

    expect(game().pieceLocation).toMatchInlineSnapshot(`
      {
        "current": Map {
          "0_1" => "green",
          "1_1" => "green",
          "2_1" => "green",
          "3_1" => "green",
        },
      }
    `);
    expect(game().hasWinner).toBeTruthy();
    expect(game().winner).toEqual(GamePlayer.green);
  });

  test("has 5 horizontal (left/right) winner", () => {
    //   0    1    2    3    4
    // 0      (0,1)
    // 1      (1,1)
    // 2      (2,1)
    // 3      (3,1)
    // 4      (4,1)

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

    expect(game().pieceLocation).toMatchInlineSnapshot(`
      {
        "current": Map {
          "0_1" => "green",
          "1_1" => "green",
          "2_1" => "green",
          "3_1" => "green",
          "4_1" => "green",
        },
      }
    `);
    expect(game().hasWinner).toBeTruthy();
    expect(game().winner).toEqual(GamePlayer.green);
  });

  test("has 3 dialog rise (down-left/up-right) winner", () => {
    //   0    1    2    3    4
    // 0                     (0,4)
    // 1                (1,3)
    // 2           (2,2)
    // 3      (1,3)
    // 4 (0,4)

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

    expect(game().pieceLocation).toMatchInlineSnapshot(`
      {
        "current": Map {
          "0_4" => "red",
          "1_3" => "red",
          "2_2" => "red",
        },
      }
    `);
    expect(game().pieces).toHaveLength(3);
    expect(game().hasWinner).toBeTruthy();
    expect(game().winner).toEqual(GamePlayer.red);
  });

  test("has 4 dialog rise (down-left/up-right) winner", () => {
    //   0    1    2    3    4
    // 0                     (0,4)
    // 1                (1,3)
    // 2           (2,2)
    // 3      (1,3)
    // 4 (0,4)

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

    expect(game().pieceLocation).toMatchInlineSnapshot(`
      {
        "current": Map {
          "0_4" => "red",
          "1_3" => "red",
          "2_2" => "red",
          "3_1" => "red",
        },
      }
    `);
    expect(game().pieces).toHaveLength(4);
    expect(game().hasWinner).toBeTruthy();
    expect(game().winner).toEqual(GamePlayer.red);
  });

  test("has 5 dialog rise (down-left/up-right) winner", () => {
    //   0    1    2    3    4
    // 0                     (0,4)
    // 1                (1,3)
    // 2           (2,2)
    // 3      (1,3)
    // 4 (0,4)

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

    expect(game().pieceLocation).toMatchInlineSnapshot(`
      {
        "current": Map {
          "0_4" => "red",
          "1_3" => "red",
          "2_2" => "red",
          "3_1" => "red",
          "4_0" => "red",
        },
      }
    `);
    expect(game().pieces).toHaveLength(5);
    expect(game().hasWinner).toBeTruthy();
    expect(game().winner).toEqual(GamePlayer.red);
  });

  test("has 3 dialog fall (up-left/down-right) winner", () => {
    //   0    1    2    3    4
    // 0 (0,0)
    // 1      (1,1)
    // 2           (2,2)
    // 3                (3,3)
    // 4                     (4,4)

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

    expect(game().pieceLocation).toMatchInlineSnapshot(`
      {
        "current": Map {
          "0_0" => "red",
          "1_1" => "red",
          "2_2" => "red",
        },
      }
    `);
    expect(game().pieces).toHaveLength(3);
    expect(game().hasWinner).toBeTruthy();
    expect(game().winner).toEqual(GamePlayer.red);
  });

  test("has 4 dialog fall (up-left/down-right) winner", () => {
    //   0    1    2    3    4
    // 0 (0,0)
    // 1      (1,1)
    // 2           (2,2)
    // 3                (3,3)
    // 4                     (4,4)

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

    expect(game().pieceLocation).toMatchInlineSnapshot(`
      {
        "current": Map {
          "0_0" => "red",
          "1_1" => "red",
          "2_2" => "red",
          "3_3" => "red",
        },
      }
    `);
    expect(game().pieces).toHaveLength(4);
    expect(game().hasWinner).toBeTruthy();
    expect(game().winner).toEqual(GamePlayer.red);
  });

  test("has 5 dialog fall (up-left/down-right) winner", () => {
    //   0    1    2    3    4
    // 0 (0,0)
    // 1      (1,1)
    // 2           (2,2)
    // 3                (3,3)
    // 4                     (4,4)

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

    expect(game().pieceLocation).toMatchInlineSnapshot(`
      {
        "current": Map {
          "0_0" => "red",
          "1_1" => "red",
          "2_2" => "red",
          "3_3" => "red",
          "4_4" => "red",
        },
      }
    `);
    expect(game().pieces).toHaveLength(5);
    expect(game().hasWinner).toBeTruthy();
    expect(game().winner).toEqual(GamePlayer.red);
  });

});
