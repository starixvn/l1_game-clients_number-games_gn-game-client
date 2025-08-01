import { act, fireEvent } from "@testing-library/react";
import { useGameStateContext } from "../../../../_shared/react-contexts/game-state-context/game-state-context";
import { ButtonPFGuide } from "../pf-guide";
import helpers from "./helpers";
const renderModal = helpers.renderModal;

const mockGameState = useGameStateContext as jest.Mock;
jest.useFakeTimers();

// Mock app-settings
jest.mock("../../../../_shared/app-settings", () => ({
    getAppSettings: jest.fn().mockReturnValue({
        gameSettings: {
            456: {
                tolgeeNamespace: "TestNamespace",
                gamePath: "/test-game"
            }
        },
        system: "gn"
    })
}));

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

jest.mock("../../game-loading/loading-spinner", () => {
    const LoadingSpinner = () => <div data-testid="loading-spinner">LoadingSpinner</div>;
    return { LoadingSpinner };
});

jest.mock("../../../../_shared/constants", () => ({
    buildVersion: jest.fn().mockReturnValue("123"),
    Themes: {
        numberGame: "dark",
    },
    locales: { en: "en", vi: "vi", th: "th", id: "id", zh_cn: "zh_cn", zh_tw: "zh_tw", ja: "ja" },
}));

jest.mock("../../../../_shared/react-hooks", () => ({
    useClickSound: jest.fn().mockReturnValue(jest.fn()),
    useCommonTranslate: jest.fn().mockReturnValue({ t: (key: string) => key }),
}));

jest.mock("../../../../_shared/helpers", () => ({
    buildGameGuideUrl: jest.fn().mockReturnValue("url"),
    AnalyticsHelper: {
        trackFunction: jest.fn(),
    },
    TrackingFunction: {
        PFGuide: 1,
    },
    TrackingAction: {
        Open: 1,
    },
}));

jest.mock("../../../../_shared/react-contexts/game-state-context/game-state-context", () => ({
    useGameStateContext: jest.fn(),
}));

const defineMock = (state?: Object) => {
    const defaultState = {
        gameConfigs: {
            gameId: 456,
        },
    };

    mockGameState.mockReturnValue({ ...defaultState, ...state });
};


describe("PFGuide", () => {
    afterEach(() => {
        jest.clearAllTimers();
        jest.clearAllMocks();
    });

    afterAll(() => {
        jest.useRealTimers();
    });

    describe("click button pf guide", () => {
        it("should render pf guide", () => {
            defineMock();

            const { renderResult } = renderModal(<ButtonPFGuide />);
            fireEvent.click(renderResult.container.querySelector(".btn-pf-guide"));

            expect(renderResult.getByTestId("modal-container")).toBeInTheDocument();
        });
        test.each([
            [false, true],
            [true, false],
        ])("if iframe loaded is %s then show loader is %s", (iframeLoaded, expected) => {
            defineMock();

            const { renderResult } = renderModal(<ButtonPFGuide />);
            fireEvent.click(renderResult.container.querySelector(".btn-pf-guide"));

            if (iframeLoaded) {
                fireEvent.load(renderResult.container.querySelector("iframe"));
                act(() => {
                    jest.runAllTimers();
                });
            }

            expect(renderResult.queryAllByTestId("loading-spinner").length > 0).toBe(expected);
        });
    });
    describe("click close button", () => {
        it("should close modal", () => {
            defineMock();

            const { renderResult } = renderModal(<ButtonPFGuide />);
            fireEvent.click(renderResult.container.querySelector(".btn-pf-guide"));
            fireEvent.click(renderResult.getByTestId("close-modal"));

            expect(renderResult.queryAllByTestId("modal-container").length).toBe(0);
        });
    });
});
