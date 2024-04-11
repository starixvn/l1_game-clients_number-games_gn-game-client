import { CountdownTimer } from "../../../games/components/countdown-timer";
import MessageTransmitter from "../../../../../../_shared/helpers/message-transmitter";
import { render } from "@testing-library/react";
import { act } from "react-dom/test-utils";

jest.mock("../../../../../../_shared/react-hooks", () => ({ useTranslator: jest.fn().mockReturnValue({ t: jest.fn((key) => key) }) }));
jest.useFakeTimers();
jest.spyOn(global, "setInterval");
jest.mock("../../../lobby-socket-connection", () => ({
    LobbyMessageEvents: { REMAINING_TIME: "remainingTime", START_PLACE_BET: "spb", FINISH: "finish" },
}));
describe(CountdownTimer.name, () => {
    const transmitter = MessageTransmitter();
    const gameSettings = { totalTurns: 4, durations: { placingBets: 20, lockingBet: 3, wholeTurn: 30 } } as any;

    it("should render correctly when placing bet", () => {
        // arrange
        const payload = { remainingTime: 19 };
        const { container } = render(<CountdownTimer transmitter={transmitter} gameSettings={gameSettings} />);

        // act
        act(() => {
            transmitter.broadcast(payload);
        });

        // assert
        expect(container).toMatchSnapshot();
        expect(container.textContent).toBe("19");
    });

    it("should render correctly when locking bet", () => {
        // arrange
        const payload = { remainingTime: 2 };
        const { container } = render(<CountdownTimer transmitter={transmitter} gameSettings={gameSettings} />);

        // act
        act(() => {
            transmitter.broadcast(payload);
        });

        // assert
        expect(container).toMatchSnapshot();
        expect(container.textContent).toBe("02");
    });

    it("should render correctly when showing result", () => {
        // arrange
        const payload = { remainingTime: 25 };
        const { container } = render(<CountdownTimer transmitter={transmitter} gameSettings={gameSettings} />);

        // act
        act(() => {
            transmitter.broadcast(payload);
        });

        // assert
        expect(container).toMatchSnapshot();
        expect(container.textContent).toBe("status_result");
    });

    it("should render correctly when there is finish", () => {
        // arrange
        const payload = { remainingTime: 1 };
        const { container } = render(<CountdownTimer transmitter={transmitter} gameSettings={gameSettings} />);

        // act
        act(() => {
            transmitter.broadcast(payload);
        });
        expect(container.textContent).toBe("01");

        // assert
        act(() => {
            transmitter.broadcast({ finish: {} });
        });
        expect(container.textContent).toBe("status_result");
    });

    it("should reset time when there is spb", () => {
        // arrange
        const payload = { remainingTime: 20 };
        const { container } = render(<CountdownTimer transmitter={transmitter} gameSettings={gameSettings} />);

        // act
        act(() => {
            transmitter.broadcast(payload);
            transmitter.broadcast({ spb: true });
        });

        // assert
        expect(container.textContent).toBe("status_result");
    });
});
