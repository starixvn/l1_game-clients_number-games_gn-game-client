import { render } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import MessageTransmitter from "../../../../../../_shared/helpers/message-transmitter";
import CountdownTimer from "../../../games/components/countdown-timer";
import DisabledGameBlock from "../../../games/components/disable-game-block";
import { GameBoard } from "../../../games/components/game-board";
import { GameIcon } from "../../../games/components/game-icon";
import LobbyScoreboard from "../../../games/components/scoreboard";
import * as LobbyConnection from "../../../lobby-socket-connection";

jest.mock("../../../games/components/countdown-timer", () => jest.fn().mockReturnValue("CountdownTimer"));
jest.mock("../../../games/components/disable-game-block", () => jest.fn().mockReturnValue("DisabledGameBlock"));
jest.mock("../../../games/components/game-icon", () => ({ GameIcon: jest.fn().mockReturnValue("GameIcon") }));
jest.mock("../../../games/components/scoreboard", () => jest.fn().mockReturnValue("LobbyScoreboard"));
jest.mock("../../../../../../_shared/react-contexts", () => ({
    useLobbyConnectionContext: jest.fn().mockReturnValue({ reconnectGameTransmitter: jest.fn(), socket: {} }),
}));

describe(GameBoard.name, () => {
    const transmitter = MessageTransmitter();
    const gameSettings = { id: 1, gameName: "gameA" } as any;
    const lastClickedGameId = gameSettings.id;
    const setLastClickedGameId = jest.fn();
    const openGame = jest.fn();

    beforeAll(() => {
        // @ts-ignore
        LobbyConnection.getLobbyData = jest.fn();
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    it("should render match the snapshot", () => {
        // act
        const { container } = render(
            <GameBoard
                gameSettings={gameSettings}
                gameTransmitter={transmitter}
                openGame={openGame}
                lastClickedGameId={lastClickedGameId}
                setLastClickedGameId={setLastClickedGameId}
            />
        );

        // assert
        expect(container).toMatchSnapshot();
        expect(GameIcon).toHaveBeenCalledWith({ gameSettings, transmitter }, {});
        expect(DisabledGameBlock).toHaveBeenCalledWith({ transmitter, gameSettings }, {});
        expect(CountdownTimer).toHaveBeenCalledWith({ transmitter, gameSettings }, {});
        expect(LobbyScoreboard).toHaveBeenCalledWith({ gameSettings, transmitter }, {});
        expect(setLastClickedGameId).not.toHaveBeenCalled();
    });

    it("should not render countdown timer & scoreboard when showData = false", () => {
        // arrange
        const { container } = render(
            <GameBoard
                gameSettings={gameSettings}
                gameTransmitter={transmitter}
                openGame={openGame}
                lastClickedGameId={lastClickedGameId}
                setLastClickedGameId={setLastClickedGameId}
            />
        );

        // act
        act(() => {
            transmitter.broadcast({ showData: false });
        });

        // assert
        expect(container).toMatchSnapshot();
    });

    it("should call getLobbyData when sign in successfully", () => {
        // arrange
        render(
            <GameBoard
                gameSettings={gameSettings}
                gameTransmitter={transmitter}
                openGame={openGame}
                lastClickedGameId={lastClickedGameId}
                setLastClickedGameId={setLastClickedGameId}
            />
        );

        // act
        act(() => {
            transmitter.broadcast({ signedIn: true });
        });

        // assert
        expect(LobbyConnection.getLobbyData).toHaveBeenCalled();
    });
});
