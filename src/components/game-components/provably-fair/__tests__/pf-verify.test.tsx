import { fireEvent } from "@testing-library/react";
import { usePFContext, usePFDispatch } from "../../../../_shared/react-contexts/game-state-context/pf/pf-context";

import PFVerifyModal from "../pf-verify";
import helpers from "./helpers";
const renderModal = helpers.renderModal;

const mockGameState = usePFContext as jest.Mock;
const mockGameStateDispatch = usePFDispatch as jest.Mock;

String.prototype.capitalizeFirstLetter = function () {
    return this;
};
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

jest.mock("../../../../_shared/react-hooks", () => ({
    useClickSound: jest.fn().mockReturnValue(jest.fn()),
    useCommonTranslate: jest.fn().mockReturnValue({ t: (key: string) => key }),
    useSNTranslate: jest.fn().mockReturnValue({ t: (key: string) => key }),
    useTranslator: jest.fn().mockReturnValue({ t: (key: string) => key }),
}));

jest.mock("../../../../_shared/helpers", () => ({
    buildGameGuideUrl: jest.fn().mockReturnValue("url"),
    AnalyticsHelper: {
        trackFunction: jest.fn(),
    },
    TrackingFunction: {
        PFVerify: 1,
    },
    TrackingAction: {
        Click: 1,
    },
}));

jest.mock("../../../../_shared/react-contexts/game-state-context/pf/pf-context", () => ({
    usePFContext: jest.fn(),
    usePFDispatch: jest.fn(),
}));

const defineMock = (state?: Object) => {
    const defaultState = {
        isShowPFVerify: true,
        pfVerifyModalData: {},
    };

    mockGameState.mockReturnValue({ ...defaultState, ...state });
    const mockDispatch = jest.fn();
    mockGameStateDispatch.mockReturnValue(mockDispatch);

    return { mockDispatch };
};

describe(PFVerifyModal.name, () => {
    describe("render", () => {
        test.each([
            [true, true],
            [true, true],
        ])("if state show pf verify modal is %s then show modal is %s", (state, expected) => {
            defineMock({ isShowPFVerify: state });

            const { renderResult } = renderModal(<PFVerifyModal renderResultBlock={jest.fn()} />);

            expect(renderResult.queryAllByTestId("modal-container").length > 0).toBe(expected);
        });
    });
    describe("click close button", () => {
        it("should call dispatch close modal", () => {
            const { mockDispatch } = defineMock({ isShowPFVerify: true });
            const { renderResult } = renderModal(<PFVerifyModal renderResultBlock={jest.fn()} />);
            fireEvent.click(renderResult.getByTestId("close-modal"));
            expect(mockDispatch).toHaveBeenCalled();
        });
    });
    describe("click tooltip", () => {
        it("should show tooltip", () => {
            defineMock({ isShowPFVerify: true });

            const { renderResult } = renderModal(<PFVerifyModal renderResultBlock={jest.fn()} />);

            fireEvent.click(renderResult.container.querySelector(".btn-pf-intro"));

            expect(renderResult.container.querySelector(".pf-tooltip:not(.hide)")).toBeInTheDocument();
        });
    });
    describe("blur tooltip", () => {
        it("should hide tooltip", () => {
            defineMock({ isShowPFVerify: true });

            const { renderResult } = renderModal(<PFVerifyModal renderResultBlock={jest.fn()} />);

            const element = renderResult.container.querySelector(".btn-pf-intro");

            fireEvent.click(element);
            fireEvent.click(document.body);

            expect(renderResult.container.querySelector(".pf-tooltip:not(.hide)")).not.toBeInTheDocument();
        });
    });

    describe("click details", () => {
        it("should call dispatch open client seed detail", () => {
            const { mockDispatch } = defineMock({ isShowPFVerify: true });

            const { renderResult } = renderModal(<PFVerifyModal renderResultBlock={jest.fn()} />);

            fireEvent.click(renderResult.container.querySelector(".link-detail"));

            expect(mockDispatch).toHaveBeenCalledWith({ type: "TOGGLE_PF_CLIENT_SEED_INFO", payload: { isShowPFClientSeedInfo: true } });
        });
    });

    describe("click verify", () => {
        it("should call dispatch open client seed detail", () => {
            const { mockDispatch } = defineMock({ isShowPFVerify: true });

            const { renderResult } = renderModal(<PFVerifyModal renderResultBlock={jest.fn()} />);

            fireEvent.click(renderResult.container.querySelector(".btn-verify"));

            expect(mockDispatch).toHaveBeenCalledWith({ type: "TOGGLE_PF_VERIFICATION", payload: { isShowPFVerification: true } });
        });
    });
});
