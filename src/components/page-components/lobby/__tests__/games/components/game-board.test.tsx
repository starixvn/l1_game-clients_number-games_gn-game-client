import { CountdownTimer } from "../../../games/components/countdown-timer";
import { DisabledGameBlock } from "../../../games/components/disable-game-block";
import { GameBoard } from "../../../games/components/game-board";
import { GameIcon } from "../../../games/components/game-icon";
import { LobbyScoreboard } from "../../../games/components/scoreboard";
import MessageTransmitter from "../../../../../../_shared/helpers/message-transmitter";
import { render } from "@testing-library/react";
import { getLobbyData } from "../../../lobby-socket-connection";
import { act } from "react-dom/test-utils";

jest.mock("../../../games/components/countdown-timer", () => ({ CountdownTimer: jest.fn().mockReturnValue("CountdownTimer") }));
jest.mock("../../../games/components/disable-game-block", () => ({ DisabledGameBlock: jest.fn().mockReturnValue("DisabledGameBlock") }));
jest.mock("../../../games/components/game-icon", () => ({ GameIcon: jest.fn().mockReturnValue("GameIcon") }));
jest.mock("../../../games/components/scoreboard", () => ({ LobbyScoreboard: jest.fn().mockReturnValue("LobbyScoreboard") }));
jest.mock("../../../../../../_shared/react-contexts", () => ({
    useLobbyConnectionContext: jest.fn().mockReturnValue({ reconnectGameTransmitter: jest.fn() }),
}));
jest.mock("../../../lobby-socket-connection", () => ({ getLobbyData: jest.fn() }));

describe(GameBoard.name, () => {
    const transmitter = MessageTransmitter();
    const socket = {} as any;
    const gameSettings = { id: 1, gameName: "gameA" } as any;
    const openGame = jest.fn();
    afterEach(() => {
        jest.clearAllMocks();
    });
    it("should render match the snapshot", () => {
        // act
        const { container } = render(
            <GameBoard gameSettings={gameSettings} gameTransmitter={transmitter} socket={socket} openGame={openGame} />
        );

        // assert
        expect(container).toMatchSnapshot();
        expect(GameIcon).toHaveBeenCalledWith({ gameSettings, transmitter }, {});
        expect(DisabledGameBlock).toHaveBeenCalledWith({ socket, transmitter, gameSettings }, {});
        expect(CountdownTimer).toHaveBeenCalledWith({ transmitter, gameSettings }, {});
        expect(LobbyScoreboard).toHaveBeenCalledWith({ gameSettings, transmitter }, {});
    });

    it("should not render countdown timer & scoreboard when showData = false", () => {
        // arrange
        const { container } = render(
            <GameBoard gameSettings={gameSettings} gameTransmitter={transmitter} socket={socket} openGame={openGame} />
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
        render(<GameBoard gameSettings={gameSettings} gameTransmitter={transmitter} socket={socket} openGame={openGame} />);

        // act
        act(() => {
            transmitter.broadcast({ signedIn: true });
        });

        // assert
        expect(getLobbyData).toHaveBeenCalled();
    });
});
