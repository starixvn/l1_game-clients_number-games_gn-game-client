import { render, act } from "@testing-library/react";
import MessageTransmitter from "../../../../../../_shared/helpers/message-transmitter";
import { OnlinePlayer } from "../../../games/components/online-player";

jest.mock("../../../lobby-socket-connection", () => ({
    LobbyMessageEvents: { SHOW_DATA: "showData", PLAYERS: "players", PLAYER: "player", OUTGAME: "outgame" },
}));

describe(OnlinePlayer.name, () => {
    const transmitter = MessageTransmitter();
    const players = { p1: {}, p2: {}, p3: {}, p4: {}, p5: {}, p6: {} };
    it("should render match the snapshot", () => {
        // arrange
        const { container } = render(<OnlinePlayer transmitter={transmitter} />);

        // act
        act(() => {
            transmitter.broadcast({ players });
        });

        // assert
        expect(container).toMatchSnapshot();
    });

    it("should render correctly online players", () => {
        // arrange
        const { container } = render(<OnlinePlayer transmitter={transmitter} />);

        // act
        act(() => {
            transmitter.broadcast({ players });
        });

        // assert
        expect(container.textContent).toBe("6");
    });

    it("should remove player when player out game", () => {
        // arrange
        const { container } = render(<OnlinePlayer transmitter={transmitter} />);

        // act
        act(() => {
            transmitter.broadcast({ players });
            transmitter.broadcast({ outgame: { playerId: "p1" } });
        });

        // assert
        expect(container.textContent).toBe("5");
    });

    it("should add player when player in game", () => {
        // arrange
        const { container } = render(<OnlinePlayer transmitter={transmitter} />);

        // act
        act(() => {
            transmitter.broadcast({ players });
            transmitter.broadcast({ player: { id: "p7" } });
        });

        // assert
        expect(container.textContent).toBe("7");
    });

    it("should not render anything when showData = false", () => {
        // arrange
        const { container } = render(<OnlinePlayer transmitter={transmitter} />);

        // act
        act(() => {
            transmitter.broadcast({ players });
            transmitter.broadcast({ showData: false });
        });

        // assert
        expect(container.innerHTML).toBe("");
    });
});
