import { describe, test, expect } from "vitest";
import { RenderResult, act, render, fireEvent } from "@testing-library/react";
import {
  Game,
  GameCellColor,
  GameCells,
  GameCellsDataTestID,
  GameConfig,
  GameConfigDataTestID,
  GameHeader,
  GameHeaderDataTestID,
  GamePieces,
  GameProviderWithGameBoard,
  UseGameType,
} from "./App";
import React from "react";

interface RenderedType
  extends RenderResult<
    typeof import("/Users/timoshiu/github/connect_four/node_modules/@testing-library/dom/types/queries"),
    HTMLElement,
    HTMLElement
  > {}

const gameHeaderElement = (rendered: RenderedType, dataTestID: string) => {
  const { findByTestId } = rendered;
  const testID = GameHeaderDataTestID(dataTestID);

  const dataTestIDElement = async (): Promise<HTMLElement> =>
    findByTestId(testID.dataTestID);
  const playerTurn = async (): Promise<HTMLButtonElement> =>
    findByTestId(testID.playerTurn) as Promise<HTMLButtonElement>;
  const configGame = async (): Promise<HTMLButtonElement> =>
    findByTestId(testID.configGame) as Promise<HTMLButtonElement>;
  const resetAll = async (): Promise<HTMLButtonElement> =>
    findByTestId(testID.resetAll) as Promise<HTMLButtonElement>;

  return {
    dataTestID: dataTestIDElement,
    playerTurn,
    configGame,
    resetAll,
  };
};

const gameConfigElement = (rendered: RenderedType, dataTestID: string) => {
  const { findByTestId } = rendered;
  const testID = GameConfigDataTestID(dataTestID);

  const root = async (): Promise<HTMLElement> =>
    findByTestId(testID.dataTestID);
  const column = async (): Promise<HTMLInputElement> =>
    findByTestId(testID.column) as Promise<HTMLInputElement>;
  const row = async (): Promise<HTMLInputElement> =>
    findByTestId(testID.row) as Promise<HTMLInputElement>;
  const count = async (): Promise<HTMLInputElement> =>
    findByTestId(testID.count) as Promise<HTMLInputElement>;
  const close = async (): Promise<HTMLButtonElement> =>
    findByTestId(testID.close) as Promise<HTMLButtonElement>;

  return {
    root,

    column,
    row,
    count,
    close,
  };
};

const gameCellsElement = (rendered: RenderedType, dataTestID: string) => {
  const { findByTestId, queryAllByTestId } = rendered;
  const testID = GameCellsDataTestID(dataTestID);
  const cell = async (props: {
    col: number;
    row?: number;
  }): Promise<HTMLElement> => findByTestId(testID.cell(props));
  const all = async (): Promise<HTMLElement[]> =>
    queryAllByTestId(new RegExp(`^${dataTestID}_\\d+_\\d+$`));

  const click = async (props: { col: number; row?: number }) => {
    const [col, row = 0] = [props.col, props.row];
    const element = await cell({ col, row });
    return fireEvent.click(element);
  };

  return {
    cell,
    all,
    click,
  };
};

const gamePiecesElement = (rendered: RenderedType, dataTestID: string) => {
  const { findByTestId, queryAllByTestId } = rendered;
  const testID = GameCellsDataTestID(dataTestID);

  const piece = async (props: {
    col: number;
    row: number;
  }): Promise<HTMLElement> => findByTestId(testID.cell(props));
  const all = async (): Promise<HTMLElement[]> =>
    queryAllByTestId(new RegExp(`^${dataTestID}_\\d+_\\d+$`));

  return {
    piece,
    all,
  };
};

const gameElement = (rendered: RenderedType, dataTestID: string) => {
  const { findAllByTestId } = rendered;

  const board = async (): Promise<HTMLElement[]> =>
    findAllByTestId(`${dataTestID}_BOARD`);
  const header = gameHeaderElement(rendered, `${dataTestID}_HEADER`);
  const config = gameConfigElement(rendered, `${dataTestID}_CONFIG`);
  const cells = gameCellsElement(rendered, `${dataTestID}_CELLS`);
  const pieces = gamePiecesElement(rendered, `${dataTestID}_PIECES`);

  return {
    dataTestID,
    board,
    header,
    config,
    cells,
    pieces,
  };
};

describe("check data-testid", () => {
  test("<GameHeader>", async () => {
    const init: Partial<UseGameType> = { column: 2, row: 2 };
    const rendered = render(<GameHeader dataTestID="GAME_HEADER" />, {
      wrapper: (props) => GameProviderWithGameBoard({ ...props, ...init }),
    });

    const gameHeader = gameHeaderElement(rendered, "GAME_HEADER");

    expect(await gameHeader.dataTestID()).toBeDefined();
    expect(await gameHeader.playerTurn()).toBeDefined();
    expect(await gameHeader.configGame()).toBeDefined();
    expect(await gameHeader.resetAll()).toBeDefined();
  });

  test("<GameConfig>", async () => {
    const init: Partial<UseGameType> = { column: 2, row: 2 };
    const rendered = render(<GameConfig dataTestID="GAME_CONFIG" />, {
      wrapper: (props) => GameProviderWithGameBoard({ ...props, ...init }),
    });

    const gameConfig = gameConfigElement(rendered, "GAME_CONFIG");

    expect(await gameConfig.root()).toBeDefined();
    expect(await gameConfig.column()).toBeDefined();
    expect(await gameConfig.row()).toBeDefined();
    expect(await gameConfig.count()).toBeDefined();
    expect(await gameConfig.close()).toBeDefined();
  });

  test("<GameCells>", async () => {
    const init: Partial<UseGameType> = { column: 2, row: 2 };
    const rendered = render(<GameCells dataTestID="GAME_CELLS" />, {
      wrapper: (props) => GameProviderWithGameBoard({ ...props, ...init }),
    });

    const cells = gameCellsElement(rendered, "GAME_CELLS");

    expect(await cells.all()).toHaveLength(4);
    expect(await cells.cell({ row: 0, col: 0 })).toBeDefined();
    expect(await cells.cell({ row: 0, col: 1 })).toBeDefined();
    expect(await cells.cell({ row: 1, col: 0 })).toBeDefined();
    expect(await cells.cell({ row: 1, col: 1 })).toBeDefined();
  });

  test("<GamePieces>", async () => {
    const init: Partial<UseGameType> = {
      column: 3,
      row: 3,
      pieces: [
        { col: 0, row: 0, color: GameCellColor.green },
        { col: 1, row: 1, color: GameCellColor.red },
        { col: 2, row: 2, color: GameCellColor.green },
      ],
    };
    const rendered = render(<GamePieces dataTestID="GAME_PIECES" />, {
      wrapper: (props) => GameProviderWithGameBoard({ ...props, ...init }),
    });

    const pieces = gamePiecesElement(rendered, "GAME_PIECES");

    expect(await pieces.all()).toHaveLength(3);
  });
});

describe("Game config board", () => {
  test("<Game> 3x3 board", async () => {
    const init: Partial<UseGameType> = { column: 3, row: 3 };
    const rendered = render(<Game dataTestID="GAME" />, {
      wrapper: (props) => GameProviderWithGameBoard({ ...props, ...init }),
    });

    const game = gameElement(rendered, "GAME");

    expect((await game.header.playerTurn()).textContent).toEqual("Green Turn");
    expect((await game.header.configGame()).textContent).toEqual("Config Game");
    expect((await game.header.resetAll()).textContent).toEqual("Reset All");

    expect(await game.cells.all()).toHaveLength(3 * 3);
    expect(await game.pieces.all()).toHaveLength(0);
  });

  test("<Game> 3x4 board", async () => {
    const init: Partial<UseGameType> = { column: 3, row: 4, count: 5 };
    const rendered = render(<Game dataTestID="GAME" />, {
      wrapper: (props) => GameProviderWithGameBoard({ ...props, ...init }),
    });

    const game = gameElement(rendered, "GAME");

    expect((await game.config.column()).getAttribute("value")).toEqual("3");
    expect((await game.config.row()).getAttribute("value")).toEqual("4");
    expect((await game.config.count()).getAttribute("value")).toEqual("5");

    expect(await game.cells.all()).toHaveLength(3 * 4);
  });

  test("<Game> 1x2 -> 5x8 board", async () => {
    const init: Partial<UseGameType> = { column: 1, row: 2, count: 1 };
    const rendered = render(<Game dataTestID="GAME" />, {
      wrapper: (props) => GameProviderWithGameBoard({ ...props, ...init }),
    });

    const game = gameElement(rendered, "GAME");

    expect((await game.config.column()).getAttribute("value")).toEqual("1");
    expect((await game.config.row()).getAttribute("value")).toEqual("2");
    expect((await game.config.count()).getAttribute("value")).toEqual("1");
    expect(await game.cells.all()).toHaveLength(1 * 2);

    fireEvent.change(await game.config.column(), { target: { value: "5" } });
    fireEvent.change(await game.config.row(), { target: { value: "8" } });
    fireEvent.change(await game.config.count(), { target: { value: "10" } });

    expect((await game.config.column()).getAttribute("value")).toEqual("5");
    expect((await game.config.row()).getAttribute("value")).toEqual("8");
    expect((await game.config.count()).getAttribute("value")).toEqual("10");

    expect(await game.cells.all()).toHaveLength(5 * 8);
  });

  test.skip("<Game> open config dialog", async () => {
    // TBD: wait for jsdom to add <dialog> support
    const init: Partial<UseGameType> = { column: 1, row: 1, count: 1 };
    const rendered = render(<Game dataTestID="GAME" />, {
      wrapper: (props) => GameProviderWithGameBoard({ ...props, ...init }),
    });

    const game = gameElement(rendered, "GAME");
    await act(async () => fireEvent.click(await game.header.configGame()));
    expect(await game.config.root()).toBeDefined();
    expect(await game.config.column()).toBeDefined();
    expect(await game.config.row()).toBeDefined();
    expect(await game.config.count()).toBeDefined();
    expect(await game.config.close()).toBeDefined();

    fireEvent.click(await game.config.close());

    // expect(await game.config.root()).v();
    // expect(await game.config.column()).not.toBeDefined();
    // expect(await game.config.row()).not.toBeDefined();
    // expect(await game.config.count()).not.toBeDefined();
    // expect(await game.config.close()).not.toBeDefined();
  });

  test.skip("<Game> change board from 4x4 to 5x5", async () => {
    // TBD: wait for jsdom to add <dialog> support
    const init: Partial<UseGameType> = { column: 4, row: 4 };
    const rendered = render(<Game dataTestID="GAME" />, {
      wrapper: (props) => GameProviderWithGameBoard({ ...props, ...init }),
    });

    const game = gameElement(rendered, "GAME");
    expect(await game.cells.all()).toHaveLength(4 * 4);

    await act(async () => fireEvent.click(await game.header.configGame()));
    expect((await game.header.configGame()).textContent).toEqual("Config Game");
    await act(async () => fireEvent.click(await game.config.column()));
    fireEvent.change(await game.config.column(), { target: { value: "5" } });
    fireEvent.change(await game.config.row(), { target: { value: "5" } });
    fireEvent.click(await game.config.close());

    expect(await game.cells.all()).toHaveLength(5 * 5);
  });

  test.skip("<Game> change board from 2x2 to 10x10", async () => {
    // TBD: wait for jsdom to add <dialog> support
    const init: Partial<UseGameType> = { column: 2, row: 2 };
    const rendered = render(<Game dataTestID="GAME" />, {
      wrapper: (props) => GameProviderWithGameBoard({ ...props, ...init }),
    });

    const game = gameElement(rendered, "GAME");
    expect(await game.cells.all()).toHaveLength(2 * 2);

    await act(async () => fireEvent.click(await game.config.column()));
    expect((await game.header.configGame()).textContent).toEqual("Config Game");
    await act(async () => fireEvent.click(await game.config.column()));
    fireEvent.change(await game.config.column(), { target: { value: "10" } });
    fireEvent.change(await game.config.row(), { target: { value: "10" } });
    fireEvent.click(await game.config.close());

    expect(await game.cells.all()).toHaveLength(10 * 10);
  });
});

describe("Game behavior", () => {
  test("<Game> just begin", async () => {
    //   0     1     2     3
    // 0
    // 1
    // 2
    // 3

    const init: Partial<UseGameType> = { column: 4, row: 4 };
    const rendered = render(<Game dataTestID="GAME" />, {
      wrapper: (props) => GameProviderWithGameBoard({ ...props, ...init }),
    });

    const game = gameElement(rendered, "GAME");

    expect(game.board).toBeDefined();
    expect(game.config).toBeDefined();
    expect(game.header).toBeDefined();

    expect((await game.header.playerTurn()).textContent).toEqual("Green Turn");
    expect((await game.header.configGame()).textContent).toEqual("Config Game");
    expect((await game.header.resetAll()).textContent).toEqual("Reset All");

    expect(await game.cells.all()).toHaveLength(4 * 4);
    expect(await game.pieces.all()).toHaveLength(0);
  });

  test("<Game> put a green piece at the bottom right", async () => {
    //   0     1     2     3
    // 0
    // 1
    // 2
    // 3                   G-3,3

    const init: Partial<UseGameType> = {
      column: 4,
      row: 4,
      pieces: [{ col: 3, row: 3, color: GameCellColor.green }],
    };
    const rendered = render(<Game dataTestID="GAME" />, {
      wrapper: (props) => GameProviderWithGameBoard({ ...props, ...init }),
    });

    const game = gameElement(rendered, "GAME");

    expect(game.board).toBeDefined();
    expect(game.config).toBeDefined();
    expect(game.header).toBeDefined();

    expect(await game.cells.all()).toHaveLength(4 * 4);
    expect(await game.pieces.all()).toHaveLength(1);
  });

  test("<Game> let player take turns", async () => {
    //   0     1     2     3
    // 0 R-0,0
    // 1 G-1,0
    // 2 R-2,0
    // 3 G-3,0

    const init: Partial<UseGameType> = { column: 4, row: 4 };
    const rendered = render(<Game dataTestID="GAME" />, {
      wrapper: (props) => GameProviderWithGameBoard({ ...props, ...init }),
    });

    const game = gameElement(rendered, "GAME");

    expect((await game.header.playerTurn()).textContent).toEqual("Green Turn");
    await act(async () => await game.cells.click({ col: 0 }));

    expect((await game.header.playerTurn()).textContent).toEqual("Red Turn");
    await act(async () => await game.cells.click({ col: 0 }));

    expect((await game.header.playerTurn()).textContent).toEqual("Green Turn");
    await act(async () => await game.cells.click({ col: 0 }));

    expect((await game.header.playerTurn()).textContent).toEqual("Red Turn");
    await act(async () => await game.cells.click({ col: 0 }));
  });

  test("<Game> green player won", async () => {
    //   0     1     2     3
    // 0
    // 1 G-1,0
    // 2 G-2,0
    // 3 G-3,0 R-3,1 R-3,2

    const init: Partial<UseGameType> = { column: 4, row: 4, count: 3 };
    const rendered = render(<Game dataTestID="GAME" />, {
      wrapper: (props) => GameProviderWithGameBoard({ ...props, ...init }),
    });

    const game = gameElement(rendered, "GAME");
    expect((await game.header.playerTurn()).textContent).toEqual("Green Turn");
    await act(async () => await game.cells.click({ col: 0 }));

    expect((await game.header.playerTurn()).textContent).toEqual("Red Turn");
    await act(async () => await game.cells.click({ col: 1 }));

    expect((await game.header.playerTurn()).textContent).toEqual("Green Turn");
    await act(async () => await game.cells.click({ col: 0 }));

    expect((await game.header.playerTurn()).textContent).toEqual("Red Turn");
    await act(async () => await game.cells.click({ col: 2 }));

    expect((await game.header.playerTurn()).textContent).toEqual("Green Turn");
    await act(async () => await game.cells.click({ col: 0 }));

    expect((await game.header.playerTurn()).textContent).toEqual("Green Won");
    expect((await game.header.resetAll()).textContent).toEqual("Play Again");
  });

  test("<Game> one", async () => {
    //   0     1     2     3
    // 0
    // 1
    // 2       R-2,1
    // 3 G-3,0 R-3,1 G-3,2

    const init: Partial<UseGameType> = { column: 4, row: 4 };
    const rendered = render(<Game dataTestID="GAME_ONE" />, {
      wrapper: (props) => GameProviderWithGameBoard({ ...props, ...init }),
    });

    const game = gameElement(rendered, "GAME_ONE");

    expect(await game.cells.all()).toHaveLength(4 * 4);
    expect(await game.pieces.all()).toHaveLength(0);

    await act(async () => await game.cells.click({ col: 0 }));
    expect(await game.pieces.all()).toHaveLength(1);

    await act(async () => await game.cells.click({ col: 1 }));
    expect(await game.pieces.all()).toHaveLength(2);

    await act(async () => await game.cells.click({ col: 1 }));
    expect(await game.pieces.all()).toHaveLength(3);

    await act(async () => await game.cells.click({ col: 2 }));
    expect(await game.pieces.all()).toHaveLength(4);

    expect(await game.pieces.all()).toMatchInlineSnapshot(`
      [
        <div
          data-testid="GAME_ONE_PIECES_3_0"
          style="grid-area: game_cell_3_0; background-color: green; border-radius: 50%; width: 4rem; height: 4rem;"
        />,
        <div
          data-testid="GAME_ONE_PIECES_3_1"
          style="grid-area: game_cell_3_1; background-color: red; border-radius: 50%; width: 4rem; height: 4rem;"
        />,
        <div
          data-testid="GAME_ONE_PIECES_2_1"
          style="grid-area: game_cell_2_1; background-color: green; border-radius: 50%; width: 4rem; height: 4rem;"
        />,
        <div
          data-testid="GAME_ONE_PIECES_3_2"
          style="grid-area: game_cell_3_2; background-color: red; border-radius: 50%; width: 4rem; height: 4rem;"
        />,
      ]
    `);
  });

  test("<Game> two", async () => {
    //   0     1     2     3
    // 0
    // 1 R-1,0
    // 2 R-2,0
    // 3 G-3,0 G-3,1 G-3-2

    const init: Partial<UseGameType> = { column: 4, row: 4, count: 3 };
    const rendered = render(<Game dataTestID="GAME_TWO" />, {
      wrapper: (props) => GameProviderWithGameBoard({ ...props, ...init }),
    });

    const game = gameElement(rendered, "GAME_TWO");

    expect(await game.cells.all()).toHaveLength(4 * 4);
    expect(await game.pieces.all()).toHaveLength(0);

    await act(async () => await game.cells.click({ col: 0 }));
    await act(async () => await game.cells.click({ col: 0 }));
    await act(async () => await game.cells.click({ col: 1 }));
    await act(async () => await game.cells.click({ col: 0 }));
    await act(async () => await game.cells.click({ col: 2 }));

    expect(await game.pieces.all()).toMatchInlineSnapshot(`
      [
        <div
          data-testid="GAME_TWO_PIECES_3_0"
          style="grid-area: game_cell_3_0; background-color: green; border-radius: 50%; width: 4rem; height: 4rem;"
        />,
        <div
          data-testid="GAME_TWO_PIECES_2_0"
          style="grid-area: game_cell_2_0; background-color: red; border-radius: 50%; width: 4rem; height: 4rem;"
        />,
        <div
          data-testid="GAME_TWO_PIECES_3_1"
          style="grid-area: game_cell_3_1; background-color: green; border-radius: 50%; width: 4rem; height: 4rem;"
        />,
        <div
          data-testid="GAME_TWO_PIECES_1_0"
          style="grid-area: game_cell_1_0; background-color: red; border-radius: 50%; width: 4rem; height: 4rem;"
        />,
        <div
          data-testid="GAME_TWO_PIECES_3_2"
          style="grid-area: game_cell_3_2; background-color: green; border-radius: 50%; width: 4rem; height: 4rem;"
        />,
      ]
    `);
  });
});
