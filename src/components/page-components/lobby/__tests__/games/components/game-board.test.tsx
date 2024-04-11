import CountdownTimer from "../../../games/components/countdown-timer";
import DisabledGameBlock from "../../../games/components/disable-game-block";
import { GameBoard } from "../../../games/components/game-board";
import { GameIcon } from "../../../games/components/game-icon";
import LobbyScoreboard from "../../../games/components/scoreboard";
import MessageTransmitter from "../../../../../../_shared/helpers/message-transmitter";
import { render } from "@testing-library/react";
import * as LobbyConnection from "../../../lobby-socket-connection";
import { act } from "react-dom/test-utils";

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
        const { container } = render(<GameBoard gameSettings={gameSettings} gameTransmitter={transmitter} openGame={openGame} />);

        // assert
        expect(container).toMatchSnapshot();
        expect(GameIcon).toHaveBeenCalledWith({ gameSettings, transmitter }, {});
        expect(DisabledGameBlock).toHaveBeenCalledWith({ transmitter, gameSettings }, {});
        expect(CountdownTimer).toHaveBeenCalledWith({ transmitter, gameSettings }, {});
        expect(LobbyScoreboard).toHaveBeenCalledWith({ gameSettings, transmitter }, {});
    });

    it("should not render countdown timer & scoreboard when showData = false", () => {
        // arrange
        const { container } = render(<GameBoard gameSettings={gameSettings} gameTransmitter={transmitter} openGame={openGame} />);

        // act
        act(() => {
            transmitter.broadcast({ showData: false });
        });

        // assert
        expect(container).toMatchSnapshot();
    });

    it("should call getLobbyData when sign in successfully", () => {
        // arrange
        render(<GameBoard gameSettings={gameSettings} gameTransmitter={transmitter} openGame={openGame} />);

        // act
        act(() => {
            transmitter.broadcast({ signedIn: true });
        });

        // assert
        expect(LobbyConnection.getLobbyData).toHaveBeenCalled();
    });
});
