import { render } from "@testing-library/react";
import React, { useState as useStateMock } from "react";
import { getAppSettings } from "../../../../../_shared/app-settings";
import { ComingSoonGameBoard } from "../../games/components/coming-soon-game-board";
import { GameBoard } from "../../games/components/game-board";
import { LobbyLayout } from "../../games/lobby-layout";

jest.mock("../../../../../_shared/app-settings", () => ({
    getAppSettings: jest.fn(),
}));
jest.mock("../../../../../_shared/helpers", () => ({
    getLobbyGameIds: jest.fn().mockReturnValue([1001, 1002]),
    getOfferGamesIds: jest.fn().mockReturnValue([1000, 1001, 1002]),
    getRenderGameSettings: jest.fn().mockReturnValue([
        { id: 1001, gameName: "game1" },
        { id: 1002, gameName: "game2" },
    ]),
}));
jest.mock("../../../../../_shared/react-contexts", () => ({
    usePlayerContext: jest.fn().mockReturnValue({}),
}));
jest.mock("../../games/components/game-board", () => {
    return {
        GameBoard: jest.fn().mockReturnValue("GameBoard"),
    };
});
jest.mock("../../games/components/coming-soon-game-board", () => ({
    ComingSoonGameBoard: jest.fn().mockReturnValue("ComingSoonGameBoard"),
}));

jest.mock("react", () => ({
    ...jest.requireActual("react"),
    useState: jest.fn(),
}));

describe(LobbyLayout.name, () => {
    const gameSettings = {
        1001: { id: 1001, gameName: "game1" },
        1002: { id: 1002, gameName: "game2" },
        1003: { id: 1003, gameName: "game3" },
        1004: { id: 1004, gameName: "game4", isComingSoon: true },
    };
    describe("render", () => {
        const lastClickedGameId = 1;
        const setState = jest.fn();
        beforeAll(() => {
            (getAppSettings as jest.Mock).mockReturnValue({ gameSettings });

            (useStateMock as any).mockImplementation((init) => [init, setState]);
        });
        afterEach(() => {
            jest.clearAllMocks();
        });
        it("should render game board correctly", () => {
            // Arrange
            const gameTransmitters = { 1001: { register: jest.fn() }, 1002: {} } as any;
            jest.spyOn(React, "useState").mockImplementation(() => [lastClickedGameId, setState]);

            // Act
            const { container } = render(<LobbyLayout lobbyConfigs={[] as any} openGame={null} gameTransmitters={gameTransmitters} />);

            // Assert
            expect(container).toMatchSnapshot();
            expect(GameBoard).toHaveBeenCalledTimes(2);
            expect(GameBoard).toHaveBeenCalledWith(
                {
                    gameSettings: gameSettings[1001],
                    openGame: null,
                    gameTransmitter: gameTransmitters[1001],
                    lastClickedGameId,
                    setLastClickedGameId: setState,
                },
                {}
            );
            expect(GameBoard).toHaveBeenCalledWith(
                {
                    gameSettings: gameSettings[1002],
                    openGame: null,
                    gameTransmitter: gameTransmitters[1002],
                    lastClickedGameId,
                    setLastClickedGameId: setState,
                },
                {}
            );
            expect(ComingSoonGameBoard).toHaveBeenCalledWith({ gameSettings: gameSettings[1004] }, {});
        });

        it("should return empty when not exist gameTransmitters", () => {
            // Arrange
            const mockGameTransmitters = null;

            // Act
            const { container } = render(<LobbyLayout lobbyConfigs={[] as any} openGame={null} gameTransmitters={mockGameTransmitters} />);

            // Assert
            expect(container.innerHTML).toEqual("");
        });
    });
});
