import { render } from "@testing-library/react";
import { LobbyLayout } from "../../games/lobby-layout";
import { GameBoard } from "../../games/components/game-board";
import { getAppSettings } from "../../../../../_shared/app-settings";
import { useLobbyConnectionContext } from "../../../../../_shared/react-contexts";

jest.mock("../../../../../_shared/app-settings", () => ({
    getAppSettings: jest.fn(),
}));
jest.mock("../../../../../_shared/helpers", () => ({
    getLobbyGameIds: jest.fn().mockReturnValue([1001, 1002]),
    getOfferGamesIds: jest.fn().mockReturnValue([1000, 1001, 1002]),
}));
jest.mock("../../../../../_shared/react-contexts", () => ({
    usePlayerContext: jest.fn().mockReturnValue({}),
    useLobbyConnectionContext: jest.fn(),
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
            const gameTransmitters = { 1001: { register: jest.fn() }, 1002: {} } as any;
            (useLobbyConnectionContext as jest.Mock).mockReturnValueOnce({ gameTransmitters });

            // Act
            const { container } = render(<LobbyLayout lobbyConfigs={[] as any} openGame={null} />);

            // Assert
            expect(container).toMatchSnapshot();
            expect(GameBoard).toHaveBeenCalledTimes(2);
            expect(GameBoard).toHaveBeenCalledWith(
                {
                    gameSettings: gameSettings[1001],
                    openGame: null,
                    gameTransmitter: gameTransmitters[1001],
                },
                {}
            );
            expect(GameBoard).toHaveBeenCalledWith(
                {
                    gameSettings: gameSettings[1002],
                    openGame: null,
                    gameTransmitter: gameTransmitters[1002],
                },
                {}
            );
        });

        it("should return empty when not exist gameTransmitters", () => {
            // Arrange
            (useLobbyConnectionContext as jest.Mock).mockReturnValueOnce({ gameTransmitters: null });

            // Act
            const { container } = render(<LobbyLayout lobbyConfigs={[] as any} openGame={null} />);

            // Assert
            expect(container.innerHTML).toEqual("");
        });
    });
});
