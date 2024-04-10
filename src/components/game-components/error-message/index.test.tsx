import React from "react";
import { ConnectFailedMessage } from ".";
import BaseDialog from "../base-dialog";
import { ConnectFailedReasonKey } from "./type";
import { render } from "@testing-library/react";
import "../../../_shared/helpers/string-helper";
import { updateURLContext } from "../../../_shared/react-contexts";

jest.mock("../base-dialog", () => jest.fn());
jest.mock("../../../_shared/react-hooks/use-translator", () => ({
    useTranslator: jest.fn().mockReturnValue({ t: jest.fn((key, op) => key) }),
}));
jest.mock("../../../_shared/react-contexts", () => ({ URLContext: null, updateURLContext: jest.fn() }));
let realUseContext;
let useContextMock: jest.Mock;
beforeEach(() => {
    realUseContext = React.useContext;
    useContextMock = React.useContext = jest.fn();
});
afterEach(() => {
    React.useContext = realUseContext;
});
const BaseDialogMock = ({ children }) => {
    return <div>{children}</div>;
};
describe(ConnectFailedMessage.name, () => {
    beforeAll(() => {
        (BaseDialog as jest.Mock).mockImplementation(BaseDialogMock);
    });
    const ns = "gameA";
    const gameId = 1;
    const enableBackdrop = false;
    const renderComponent = (reason) =>
        render(
            <ConnectFailedMessage enableBackdrop={enableBackdrop} id={gameId} onReconnect={null} reason={reason} tolgeeNamespace={ns} />
        );
    describe("when restrictPlayPermission", () => {
        const reason = ConnectFailedReasonKey.restrictPlayPermission;

        describe("when direct mode = false", () => {
            const original = window.location;

            beforeAll(() => {
                Object.defineProperty(window, "location", {
                    configurable: true,
                    value: { reload: jest.fn() },
                });
            });
            afterAll(() => {
                Object.defineProperty(window, "location", { configurable: true, value: original });
            });
            afterEach(() => {
                jest.clearAllMocks();
            });

            it("should render button ok", () => {
                // arrange
                useContextMock.mockReturnValue({ isDirectMode: false });

                // act
                const { container, getByRole } = renderComponent(reason);

                // assert
                expect(container).toMatchSnapshot();
                expect(getByRole("button").textContent).toBe("Common.ok");
            });

            it("should back to lobby & reload when click ok", () => {
                // arrange
                useContextMock.mockReturnValue({ isDirectMode: false });
                const { getByRole } = renderComponent(reason);

                // act
                getByRole("button").click();

                // assert
                expect(updateURLContext).toHaveBeenCalledWith({ backToLobby: true, gameId: 0 });
                expect(window.location.reload).toHaveBeenCalled();
            });
        });

        describe("when direct mode = true and returnURL has data", () => {
            afterEach(() => {
                jest.clearAllMocks();
            });
            it("should render button ok", () => {
                // arrange
                useContextMock.mockReturnValue({ isDirectMode: true, redirectUrl: "returnUrl" });

                // act
                const { container, getByRole } = renderComponent(reason);

                // assert
                expect(container).toMatchSnapshot();
                expect(getByRole("button").textContent).toBe("Common.ok");
            });

            it("should back to lobby & reload when click ok", () => {
                // arrange
                const backToRedirectUrl = jest.fn();
                useContextMock.mockReturnValue({ isDirectMode: true, redirectUrl: "returnUrl", backToRedirectUrl });
                const { getByRole } = renderComponent(reason);

                // act
                getByRole("button").click();

                // assert
                expect(updateURLContext).toHaveBeenCalledWith({ backToLobby: true, gameId: 0 });
                expect(backToRedirectUrl).toHaveBeenCalledWith("returnUrl");
            });
        });

        describe("when direct mode = true and returnURL not has data", () => {
            it("should not render button ok", () => {
                // act
                useContextMock.mockReturnValue({ isDirectMode: true });
                const { container, queryByRole } = renderComponent(reason);

                // assert
                expect(container).toMatchSnapshot();
                expect(queryByRole("button")).not.toBeInTheDocument();
            });
        });
    });

    describe("when disconnect game services", () => {
        const reason = ConnectFailedReasonKey.lostConnection;
        afterEach(() => {
            jest.clearAllMocks();
        });
        describe("when direct mode = false", () => {
            it("should render buttons back & reconnect", () => {
                // arrange
                useContextMock.mockReturnValue({ isDirectMode: false });

                // act
                const { container, getAllByRole } = renderComponent(reason);
                const buttons = getAllByRole("button");

                // assert
                expect(container).toMatchSnapshot();
                expect(buttons.length).toBe(2);
                expect(buttons[0].textContent).toBe("Common.back");
                expect(buttons[1].textContent).toBe("SabaNumber.button_reconnect");
            });

            it("should back to lobby when click back", () => {
                // arrange
                const backToRedirectUrl = jest.fn();
                useContextMock.mockReturnValue({ isDirectMode: false, backToRedirectUrl });
                const { getAllByRole } = renderComponent(reason);
                const backButton = getAllByRole("button")[0];

                // act
                backButton.click();

                // assert
                expect(updateURLContext).toHaveBeenCalledWith({ gameId: 0 });
                expect(backToRedirectUrl).toHaveBeenCalledWith(undefined);
            });

            it("should call reconnect when click reconnect", () => {
                // arrange
                useContextMock.mockReturnValue({ isDirectMode: false });
                const onReconnect = jest.fn();
                const { getAllByRole } = render(
                    <ConnectFailedMessage
                        enableBackdrop={enableBackdrop}
                        id={gameId}
                        onReconnect={onReconnect}
                        reason={reason}
                        tolgeeNamespace={ns}
                    />
                );
                const reconnectButton = getAllByRole("button")[1];

                // act
                reconnectButton.click();

                // assert
                expect(onReconnect).toHaveBeenCalled();
            });
        });

        describe("when direct mode = true and returnUrl has data", () => {
            it("should render buttons back & reconnect", () => {
                // arrange
                useContextMock.mockReturnValue({ isDirectMode: true, redirectUrl: "returnUrl" });

                // act
                const { container, getAllByRole } = renderComponent(reason);
                const buttons = getAllByRole("button");

                // assert
                expect(container).toMatchSnapshot();
                expect(buttons.length).toBe(2);
                expect(buttons[0].textContent).toBe("Common.back");
                expect(buttons[1].textContent).toBe("SabaNumber.button_reconnect");
            });
            it("should back to lobby when click back", () => {
                // arrange
                const backToRedirectUrl = jest.fn();
                useContextMock.mockReturnValue({ isDirectMode: true, redirectUrl: "returnUrl", backToRedirectUrl });
                const { getAllByRole } = renderComponent(reason);
                const backButton = getAllByRole("button")[0];

                // act
                backButton.click();

                // assert
                expect(updateURLContext).toHaveBeenCalledWith({ gameId: 0 });
                expect(backToRedirectUrl).toHaveBeenCalledWith("returnUrl");
            });

            it("should call reconnect when click reconnect", () => {
                // arrange
                useContextMock.mockReturnValue({ isDirectMode: true, redirectUrl: "returnUrl" });
                const onReconnect = jest.fn();
                const { getAllByRole } = render(
                    <ConnectFailedMessage
                        enableBackdrop={enableBackdrop}
                        id={gameId}
                        onReconnect={onReconnect}
                        reason={reason}
                        tolgeeNamespace={ns}
                    />
                );
                const reconnectButton = getAllByRole("button")[1];

                // act
                reconnectButton.click();

                // assert
                expect(onReconnect).toHaveBeenCalled();
            });
        });

        describe("when direct mode = true and returnURL not has data", () => {
            it("should render only reconnect button", () => {
                // arrange
                useContextMock.mockReturnValue({ isDirectMode: true });

                // act
                const { container, getAllByRole } = renderComponent(reason);
                const buttons = getAllByRole("button");

                // assert
                expect(container).toMatchSnapshot();
                expect(buttons.length).toBe(1);
                expect(buttons[0].textContent).toBe("SabaNumber.button_reconnect");
            });
            it("should call reconnect when click reconnect", () => {
                // arrange
                useContextMock.mockReturnValue({ isDirectMode: true });
                const onReconnect = jest.fn();
                const { getAllByRole } = render(
                    <ConnectFailedMessage
                        enableBackdrop={enableBackdrop}
                        id={gameId}
                        onReconnect={onReconnect}
                        reason={reason}
                        tolgeeNamespace={ns}
                    />
                );
                const reconnectButton = getAllByRole("button")[0];

                // act
                reconnectButton.click();

                // assert
                expect(onReconnect).toHaveBeenCalled();
            });
        });
    });
});
