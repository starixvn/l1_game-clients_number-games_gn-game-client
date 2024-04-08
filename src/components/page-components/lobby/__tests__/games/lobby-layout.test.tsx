import { render } from "@testing-library/react";
import { LobbyLayout } from "../../games/lobby-layout";
import { GameBoard } from "../../games/components/game-board";
import { getAppSettings } from "../../../../../_shared/app-settings";

jest.mock("../../../../../_shared/app-settings", () => ({
    getAppSettings: jest.fn(),
}));
jest.mock("../../../../../_shared/helpers", () => ({
    getLobbyGameIds: jest.fn().mockReturnValue([1001, 1002]),
    getOfferGamesIds: jest.fn().mockReturnValue([1000, 1001, 1002]),
}));
jest.mock("../../../../../_shared/react-contexts", () => ({
    usePlayerContext: jest.fn().mockReturnValue({}),
}));
jest.mock("../../games/components/game-board", () => ({
    GameBoard: jest.fn().mockReturnValue("GameBoard"),
}));

describe(LobbyLayout.name, () => {
    const gameSettings = {
        1001: { id: 1001, gameName: "game1" },
        1002: { id: 1002, gameName: "game2" },
        1003: { id: 1003, gameName: "game3" },
    };
    describe("render", () => {
        beforeAll(() => {
            (getAppSettings as jest.Mock).mockReturnValue({ gameSettings });
        });
        afterEach(() => {
            jest.clearAllMocks();
        });
        it("should render game board correctly", () => {
            // Arrange
            const socket = {} as any;
            const gameTransmitter = { 1001: { register: jest.fn() }, 1002: {} };

            // Act
            const { container } = render(
                <LobbyLayout gameTransmitters={gameTransmitter} lobbyConfigs={[] as any} openGame={null} socket={socket} />
            );

            // Assert
            expect(container).toMatchSnapshot();
            expect(GameBoard).toHaveBeenCalledTimes(2);
            expect(GameBoard).toHaveBeenCalledWith(
                {
                    gameSettings: gameSettings[1001],
                    socket,
                    openGame: null,
                    gameTransmitter: gameTransmitter[1001],
                },
                {}
            );
            expect(GameBoard).toHaveBeenCalledWith(
                {
                    gameSettings: gameSettings[1002],
                    socket,
                    openGame: null,
                    gameTransmitter: gameTransmitter[1002],
                },
                {}
            );
        });

        it("should return empty when not exist socket", () => {
            // Arrange
            const socket = null;
            const gameTransmitter = { 1001: { register: jest.fn() }, 1002: {} };

            // Act
            const { container } = render(
                <LobbyLayout gameTransmitters={[gameTransmitter]} lobbyConfigs={[] as any} openGame={null} socket={socket} />
            );

            // Assert
            expect(container.innerHTML).toEqual("");
        });
    });
});
