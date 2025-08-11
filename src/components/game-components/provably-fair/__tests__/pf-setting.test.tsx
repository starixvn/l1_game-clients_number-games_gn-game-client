import { act, fireEvent } from "@testing-library/react";
import { useGameContext } from "../../../../_shared/react-contexts";
import { useGameStateContext, useGameStatesDispatch } from "../../../../_shared/react-contexts/game-state-context/game-state-context";
import { PFEventActionType } from "../../../../_shared/react-contexts/game-state-context/pf/pf-action";
import { usePFContext, usePFDispatch } from "../../../../_shared/react-contexts/game-state-context/pf/pf-context";
import PFSettingModal from "../pf-setting";
import helpers from "./helpers";
const renderModal = helpers.renderModal;

const mockGameStateContext = useGameStateContext as jest.Mock;
const mockPFContext = usePFContext as jest.Mock;
const mockGameContext = useGameContext as jest.Mock;
const mockGameStateDispatch = useGameStatesDispatch as jest.Mock;
const mockPFDispatch = usePFDispatch as jest.Mock;

jest.useFakeTimers();

jest.mock("../../game-loading/loading-spinner", () => {
    const LoadingSpinner = () => <div data-testid="loading-spinner">LoadingSpinner</div>;
    return { LoadingSpinner };
});

jest.mock("../../../../_shared/react-contexts/game-state-context/game-state-context", () => ({
    useGameStateContext: jest.fn(),
    useGameStatesDispatch: jest.fn(),
}));

jest.mock("../../../../_shared/react-contexts/game-state-context/pf/pf-context", () => ({
    usePFContext: jest.fn(),
    usePFDispatch: jest.fn(),
}));

jest.mock("../../../../_shared/react-contexts", () => ({
    useGameContext: jest.fn(),
    usePlayerContext: jest.fn().mockReturnValue({ locale: "en" }),
}));

jest.mock("../../../../_shared/react-hooks", () => ({
    useSNTranslate: jest.fn().mockReturnValue({ t: jest.fn() }),
    useCommonTranslate: jest.fn().mockReturnValue({ t: jest.fn() }),
    useClickSound: jest.fn().mockReturnValue(jest.fn()),
}));

const PFResultMessage = "pfResult";
const PFPublishMessage = "pf";

jest.mock("../../modal-container", () => {
    const ModalContainer = ({ children, onCloseModal }) => {
        return (
            <>
                {children}
                <div data-testid="modal-container"></div>
                <button data-testid="close-modal" onClick={onCloseModal}></button>
            </>
        );
    };

    return ModalContainer;
});

const defineGameStateMock = (state?: Object, gameMessageHandler?: Object) => {
    const defaultState = {
        ownBets: {},
        drawId: 1,
    };

    const defaultGameMessageHandler = {
        broadcastGameEvent: jest.fn(),
        register: jest.fn(),
        removeHandler: jest.fn(),
    };

    mockGameStateContext.mockReturnValue({ ...defaultState, ...state });
    mockGameContext.mockReturnValue({
        gameMessageHandler: { ...defaultGameMessageHandler, ...gameMessageHandler },
    });
};

const definePFMock = (state?: Object, gameMessageHandler?: Object) => {
    const defaultState = {
        ownBets: {},
        isShowPFSetting: true,
        pfClientSeedSetting: {},
    };
    const defaultGameMessageHandler = {
        broadcastGameEvent: jest.fn(),
        register: jest.fn(),
        removeHandler: jest.fn(),
    };

    mockPFContext.mockReturnValue({ ...defaultState, ...state });
    mockGameContext.mockReturnValue({
        gameMessageHandler: { ...defaultGameMessageHandler, ...gameMessageHandler },
    });
};

const defineMockGameStateWithDispatch = (state?: Object, gameMessageHandler?: Object) => {
    defineGameStateMock(state, gameMessageHandler);
    const mockDispatch = jest.fn();
    mockGameStateDispatch.mockReturnValue(mockDispatch);

    return mockDispatch;
};

const defineMockPFWithDispatch = (state?: Object, gameMessageHandler?: Object) => {
    definePFMock(state, gameMessageHandler);
    const mockDispatch = jest.fn();
    mockPFDispatch.mockReturnValue(mockDispatch);

    return mockDispatch;
};

describe(PFSettingModal.name, () => {
    afterEach(() => {
        jest.clearAllTimers();
        jest.clearAllMocks();
    });

    afterAll(() => {
        jest.useRealTimers();
    });

    describe("render", () => {
        test.each([
            [0, 0],
            [123, 1],
        ])("if draw id is %s then broadcast game event is %s", (drawId, expected) => {
            const broadcastGameEvent = jest.fn();
            defineGameStateMock({ drawId }, { broadcastGameEvent });
            defineMockPFWithDispatch({ isShowPFSetting: true }, { broadcastGameEvent });

            renderModal(<PFSettingModal />);

            expect(broadcastGameEvent).toHaveBeenCalledTimes(expected);
        });
        test.each([
            [true, true],
            [false, false],
        ])("when show modal state is %s then show modal %s", (isShow, expected) => {
            defineMockPFWithDispatch({ isShowPFSetting: isShow });

            const { renderResult } = renderModal(<PFSettingModal />);

            expect(renderResult.queryAllByTestId("modal-container").length > 0).toBe(expected);
        });
        test.each([
            [false, true],
            [true, false],
        ])("when receive message socket is %s then show loader is %s", (isReceive, expected) => {
            let pfResultHandler = jest.fn();
            const gameMessageHandler = {
                register: (id, callback) => {
                    if (id === PFResultMessage) {
                        pfResultHandler = callback;
                    }
                },
            };
            defineMockPFWithDispatch({ isShowPFSetting: true }, gameMessageHandler);

            const { renderResult } = renderModal(<PFSettingModal />);

            if (isReceive) {
                act(() => {
                    pfResultHandler({
                        pfResult: {
                            drawId: 2,
                            serverSeedHash: "abcdef",
                        },
                    });
                });
            }

            expect(renderResult.queryAllByTestId("loading-spinner").length > 0).toBe(expected);
        });
        describe("when receive", () => {
            describe("pf result message", () => {
                it("should render pf result", () => {
                    let pfResultHandler = jest.fn();
                    const gameMessageHandler = {
                        register: (id, callback) => {
                            if (id === PFResultMessage) {
                                pfResultHandler = callback;
                            }
                        },
                    };
                    defineMockGameStateWithDispatch({}, gameMessageHandler);
                    defineMockPFWithDispatch({ isShowPFSetting: true }, gameMessageHandler);

                    const { renderResult } = renderModal(<PFSettingModal />);

                    act(() => {
                        pfResultHandler({
                            pfResult: {
                                drawId: 2,
                                serverSeedHash: "abcdef",
                            },
                        });
                    });

                    expect(renderResult.getByDisplayValue("abcdef")).toHaveValue("abcdef");
                });
            });
            describe("pf server seed hash message", () => {
                it("should render pf result", () => {
                    let pfResultHandler = jest.fn();
                    const gameMessageHandler = {
                        register: (id, callback) => {
                            if (id === PFPublishMessage) {
                                pfResultHandler = callback;
                            }
                        },
                    };

                    defineMockPFWithDispatch({ isShowPFSetting: true }, gameMessageHandler);

                    const { renderResult } = renderModal(<PFSettingModal />);

                    act(() => {
                        pfResultHandler({
                            pf: {
                                drawId: 2,
                                serverSeedHash: "abcdef",
                            },
                        });
                    });

                    expect(renderResult.getByDisplayValue("abcdef")).toHaveValue("abcdef");
                });
            });
        });
        test.each([
            [false, ""],
            [true, "123"],
        ])("when use manual client seed is %s then manual client seed should be %s", (useManualClientSeed, manualClientSeed) => {
            let pfResultHandler = jest.fn();
            const gameMessageHandler = {
                register: (id, callback) => {
                    if (id === PFResultMessage) {
                        pfResultHandler = callback;
                    }
                },
            };
            defineGameStateMock({}, gameMessageHandler);
            defineMockPFWithDispatch(
                {
                    pfClientSeedSetting: {
                        useManualClientSeed,
                        manualClientSeed: "123",
                        randomClientSeed: "456",
                    },
                },
                gameMessageHandler
            );

            const { renderResult } = renderModal(<PFSettingModal />);

            act(() => {
                pfResultHandler({
                    pfResult: {
                        drawId: 2,
                        serverSeedHash: "abcdef",
                    },
                });
            });

            expect(renderResult.container.querySelector("#manual-client-seed")).toHaveValue(manualClientSeed);
        });
        describe("when time out", () => {
            it("close loading", () => {
                defineMockPFWithDispatch({ isShowPFSetting: true });

                const { renderResult } = renderModal(<PFSettingModal />);

                act(() => {
                    jest.runAllTimers();
                });

                expect(renderResult.queryAllByTestId("loading-spinner").length > 0).toBe(false);
            });
        });
    });
    describe("click close button", () => {
        it("should call dispatch", () => {
            const mockDispatch = defineMockPFWithDispatch({ isShowPFSetting: true });

            const { renderResult } = renderModal(<PFSettingModal />);

            renderResult.queryByTestId("close-modal").click();

            expect(mockDispatch).toHaveBeenCalledWith({ type: PFEventActionType.TOGGLE_PF_SETTING, payload: { isShowPFSetting: false } });
        });
    });
    describe("input manual client seed", () => {
        test.each([
            ["a", false, 97],
            ["1", true, 49],
        ])("if input is %s then call default is %s", (key, expected, keyCode) => {
            let pfResultHandler = jest.fn();
            const gameMessageHandler = {
                register: (id, callback) => {
                    if (id === PFResultMessage) {
                        pfResultHandler = callback;
                    }
                },
            };
            definePFMock({}, gameMessageHandler);

            const { renderResult } = renderModal(<PFSettingModal />);

            act(() => {
                pfResultHandler({
                    pfResult: {
                        drawId: 2,
                        serverSeedHash: "abcdef",
                    },
                });
            });

            const event = {
                key: key,
                which: keyCode,
            };
            const isDefaultCall = fireEvent.keyDown(renderResult.container.querySelector("#manual-client-seed"), event);
            expect(isDefaultCall).toBe(expected);
        });

        test.each([
            ["123", true],
            ["12a", false],
            ["12345", false],
        ])("if paste value is %s then call default is %s", (key, expected) => {
            let pfResultHandler = jest.fn();
            const gameMessageHandler = {
                register: (id, callback) => {
                    if (id === PFResultMessage) {
                        pfResultHandler = callback;
                    }
                },
            };
            defineMockPFWithDispatch({}, gameMessageHandler);

            const { renderResult } = renderModal(<PFSettingModal />);

            act(() => {
                pfResultHandler({
                    pfResult: {
                        drawId: 2,
                        serverSeedHash: "abcdef",
                    },
                });
            });

            const event = {
                target: {
                    value: key,
                },
            };
            const isDefaultCall = fireEvent.paste(renderResult.container.querySelector("#manual-client-seed"), event);
            expect(isDefaultCall).toBe(expected);
        });

        test.each([
            ["123", false],
            ["", true],
        ])("if blur value is %s then manual client equal random client seed is %s", (manualClientSeed, expected) => {
            let pfResultHandler = jest.fn();
            const gameMessageHandler = {
                register: (id, callback) => {
                    if (id === PFResultMessage) {
                        pfResultHandler = callback;
                    }
                },
            };
            defineMockPFWithDispatch(
                {
                    pfClientSeedSetting: {
                        useManualClientSeed: true,
                        manualClientSeed: manualClientSeed,
                        randomClientSeed: "456",
                    },
                },
                gameMessageHandler
            );

            const { renderResult } = renderModal(<PFSettingModal />);

            act(() => {
                pfResultHandler({
                    pfResult: {
                        drawId: 2,
                        serverSeedHash: "abcdef",
                    },
                });
            });

            const event = {
                target: {
                    value: manualClientSeed,
                },
            };
            act(() => {
                fireEvent.blur(renderResult.container.querySelector("#manual-client-seed"), event);
            });

            expect(renderResult.container.querySelector("#manual-client-seed")["value"] == "456").toBe(expected);
        });

        test.each([
            ["random-seed", true],
            ["manual-seed", false],
        ])("if click radio %s dipatch data with use manual client seed is %s and manual client seed is %s", (mode, useManualClientSeed) => {
            let pfResultHandler = jest.fn();
            const broadcastGameEvent = jest.fn();
            const gameMessageHandler = {
                broadcastGameEvent,
                register: (id, callback) => {
                    if (id === PFResultMessage) {
                        pfResultHandler = callback;
                    }
                },
            };
            defineMockPFWithDispatch(
                {
                    pfClientSeedSetting: {
                        useManualClientSeed: useManualClientSeed,
                        manualClientSeed: "",
                        randomClientSeed: "456",
                    },
                },
                gameMessageHandler
            );

            const { renderResult } = renderModal(<PFSettingModal />);

            act(() => {
                pfResultHandler({
                    pfResult: {
                        drawId: 2,
                        serverSeedHash: "abcdef",
                    },
                });
            });

            act(() => {
                fireEvent.click(renderResult.container.querySelector(`#${mode}`));
            });

            expect(broadcastGameEvent).toHaveBeenCalledWith({
                ["savePFSetting"]: {
                    pfClientSeedSetting: {
                        useManualClientSeed: !useManualClientSeed,
                        manualClientSeed: useManualClientSeed ? undefined : "456",
                    },
                },
            });
        });

        describe("change manual seed", () => {
            it("should change manual client seed ui", () => {
                let pfResultHandler = jest.fn();

                const gameMessageHandler = {
                    register: (id, callback) => {
                        if (id === PFResultMessage) {
                            pfResultHandler = callback;
                        }
                    },
                };
                defineMockPFWithDispatch(
                    {
                        pfClientSeedSetting: {
                            useManualClientSeed: true,
                            manualClientSeed: "0",
                            randomClientSeed: "456",
                        },
                    },
                    gameMessageHandler
                );

                const { renderResult } = renderModal(<PFSettingModal />);

                act(() => {
                    pfResultHandler({
                        pfResult: {
                            drawId: 2,
                            serverSeedHash: "abcdef",
                        },
                    });
                });

                const event = {
                    target: {
                        value: "456",
                    },
                };
                act(() => {
                    fireEvent.change(renderResult.container.querySelector("#manual-client-seed"), event);
                });

                expect(renderResult.container.querySelector("#manual-client-seed")["value"]).toBe("456");
            });
        });
    });
});
