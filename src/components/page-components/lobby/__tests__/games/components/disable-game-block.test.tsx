import { useLobbyConnectionContext } from "../../../../../../_shared/react-contexts";
import { DisabledGameBlock } from "../../../games/components/disable-game-block";
import MessageTransmitter from "../../../../../../_shared/helpers/message-transmitter";
import { render } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import * as LobbyConnection from "../../../lobby-socket-connection";

jest.mock("@tolgee/react", () => ({ useTolgee: jest.fn().mockReturnValue({ getLanguage: jest.fn().mockReturnValue("en") }) }));
jest.mock("../../../../../../_shared/react-contexts", () => ({
    useLobbyConnectionContext: jest.fn().mockReturnValue({
        removeGameTransmitter: jest.fn(),
        reconnectGameTransmitter: jest.fn(),
        socket: { socketId: 123 },
    }),
}));
jest.mock("../../../../../../_shared/react-hooks", () => ({ useTranslator: jest.fn().mockReturnValue({ t: jest.fn((key) => key) }) }));
describe(DisabledGameBlock.name, () => {
    const transmitter = MessageTransmitter();
    const gameSettings = { id: 1 } as any;
    beforeAll(() => {
        // @ts-ignore
        LobbyConnection.getLobbyData = jest.fn();
    });
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should not render anything when enabled game", () => {
        // act
        const { container } = render(<DisabledGameBlock gameSettings={gameSettings} transmitter={transmitter} />);

        // assert
        expect(container.innerHTML).toBe("");
    });

    describe("when game is disabled", () => {
        const payload = { um: true, um_message: { en: "disabled game" } };
        it("should render match the snapshot ", () => {
            // arrange
            const { container } = render(<DisabledGameBlock gameSettings={gameSettings} transmitter={transmitter} />);

            // act
            act(() => {
                transmitter.broadcast(payload);
            });

            // assert
            expect(container).toMatchSnapshot();
        });

        it("should not render when game is enabled again", () => {
            // arrange
            const enabledPayload = { snr: true };
            const { container } = render(<DisabledGameBlock gameSettings={gameSettings} transmitter={transmitter} />);

            // act
            act(() => {
                transmitter.broadcast(payload);
                transmitter.broadcast(enabledPayload);
            });

            // assert
            expect(container.innerHTML).toBe("");
            expect(LobbyConnection.getLobbyData).toHaveBeenCalledWith({ socketId: 123 }, gameSettings.id);
        });
    });

    describe("when disconnected service", () => {
        const payload = { errorCode: "SB0010" };
        it("should render match the snapshot", () => {
            // arrange
            const { container } = render(<DisabledGameBlock gameSettings={gameSettings} transmitter={transmitter} />);

            // act
            act(() => {
                transmitter.broadcast(payload);
            });

            // assert
            expect(container).toMatchSnapshot();
            expect(useLobbyConnectionContext().removeGameTransmitter).toHaveBeenCalledWith(gameSettings.id);
        });

        it("should not render anything after reconnect successfully", () => {
            // arrange
            const { container, getByRole } = render(<DisabledGameBlock gameSettings={gameSettings} transmitter={transmitter} />);
            (useLobbyConnectionContext().reconnectGameTransmitter as jest.Mock).mockImplementation(() => {
                act(actionReconnect);
            });
            const actionReconnect = () => {
                transmitter.broadcast({ signedIn: true });
            };
            act(() => {
                transmitter.broadcast(payload);
            });

            // act
            getByRole("button").click();

            // assert
            expect(container.innerHTML).toBe("");
        });
    });
});
