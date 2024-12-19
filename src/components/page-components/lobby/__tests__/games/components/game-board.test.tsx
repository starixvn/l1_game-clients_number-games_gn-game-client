import { render } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import MessageTransmitter from "../../../../../../_shared/helpers/message-transmitter";
import CountdownTimer from "../../../games/components/countdown-timer";
import DisabledGameBlock from "../../../games/components/disable-game-block";
import { GameBoard } from "../../../games/components/game-board";
import { GameIcon } from "../../../games/components/game-icon";
import LobbyScoreboard from "../../../games/components/scoreboard";
import * as LobbyConnection from "../../../lobby-socket-connection";

// Mock all dependencies
jest.mock("../../../games/components/countdown-timer");
jest.mock("../../../games/components/disable-game-block");
jest.mock("../../../games/components/game-icon");
jest.mock("../../../games/components/scoreboard");
jest.mock("../../../../../../_shared/react-contexts");
jest.mock("../../../lobby-socket-connection");

// Add type definition
type GameSettings = {
    id: number;
    gameName: string;
    gameResourceConfigs: any;
};

describe.skip("GameBoard Component", () => {
    let mockTransmitter: ReturnType<typeof MessageTransmitter>;
    let mockGameSettings: GameSettings;
    let mockProps: {
        gameSettings: GameSettings;
        gameTransmitter: ReturnType<typeof MessageTransmitter>;
        openGame: jest.Mock;
        lastClickedGameId: number;
        setLastClickedGameId: jest.Mock;
    };

    beforeEach(() => {
        jest.clearAllMocks();

        mockTransmitter = MessageTransmitter();
        mockGameSettings = {
            id: 1,
            gameName: "gameA",
            gameResourceConfigs: {},
        };
        mockProps = {
            gameSettings: mockGameSettings,
            gameTransmitter: mockTransmitter,
            openGame: jest.fn(),
            lastClickedGameId: 1,
            setLastClickedGameId: jest.fn(),
        };

        // Setup mock implementations
        (CountdownTimer as unknown as jest.Mock).mockImplementation(() => "CountdownTimer");
        (DisabledGameBlock as unknown as jest.Mock).mockImplementation(() => "DisabledGameBlock");
        (GameIcon as unknown as jest.Mock).mockImplementation(() => "GameIcon");
        (LobbyScoreboard as unknown as jest.Mock).mockImplementation(() => "LobbyScoreboard");

        // Mock context
        jest.requireMock("../../../../../../_shared/react-contexts").useLobbyConnectionContext.mockReturnValue({
            reconnectGameTransmitter: jest.fn(),
            socket: {},
        });

        // Mock getLobbyData
        (LobbyConnection.getLobbyData as jest.Mock).mockResolvedValue(undefined);
    });

    afterEach(() => {
        jest.clearAllMocks();
        mockTransmitter.clearAllListener();
    });

    it("should render all game components initially", () => {
        const { container } = render(<GameBoard {...mockProps} />);

        expect(container).toMatchSnapshot();
        expect(GameIcon).toHaveBeenCalledWith(
            expect.objectContaining({
                gameSettings: mockGameSettings,
                transmitter: mockTransmitter,
            }),
            {}
        );
    });

    it("should hide countdown timer and scoreboard when showData is false", async () => {
        const { rerender } = render(<GameBoard {...mockProps} />);

        await act(async () => {
            mockTransmitter.broadcast({ showData: false });
        });

        rerender(<GameBoard {...mockProps} />);

        expect(CountdownTimer).toHaveBeenCalledTimes(1);
        expect(LobbyScoreboard).toHaveBeenCalledTimes(1);
    });

    it("should fetch lobby data when user signs in", async () => {
        render(<GameBoard {...mockProps} />);

        await act(async () => {
            mockTransmitter.broadcast({ signedIn: true });
        });

        expect(LobbyConnection.getLobbyData).toHaveBeenCalledTimes(1);
    });

    it("should handle error when fetching lobby data fails", async () => {
        const mockError = new Error("Failed to fetch lobby data");
        (LobbyConnection.getLobbyData as jest.Mock).mockRejectedValueOnce(mockError);

        render(<GameBoard {...mockProps} />);

        await act(async () => {
            mockTransmitter.broadcast({ signedIn: true });
        });

        expect(LobbyConnection.getLobbyData).toHaveBeenCalledTimes(1);
    });
});
