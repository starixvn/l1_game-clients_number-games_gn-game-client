import { render } from "@testing-library/react";
import BetConfirmDialog from ".";
import { usePlayerContext } from "../../../_shared/react-contexts";
import { useGameStateContext, useGameStatesDispatch } from "../../../_shared/react-contexts/game-state-context/game-state-context";

const mockUseGameStateContext = useGameStateContext as jest.Mock;
const mockUseGameStatesDispatch = useGameStatesDispatch as jest.Mock;
const mockUsePlayerContext = usePlayerContext as jest.Mock;

jest.mock("../../../_shared/react-hooks", () => ({
    useTranslator: jest.fn().mockReturnValue({ t: (key: string) => key }),
    useSNTranslate: jest.fn().mockReturnValue({ t: (key: string) => key }),
    useClickSound: jest.fn(),
}));

jest.mock("../../../_shared/react-contexts/game-state-context/game-state-context", () => ({
    useGameStatesDispatch: jest.fn(),
    useGameStateContext: jest.fn(),
}));

jest.mock("../../../_shared/react-contexts/auth", () => ({
    usePlayerContext: jest.fn(),
}));

jest.mock("../../../_shared/react-contexts/url-context", () => ({
    updateURLContext: jest.fn(),
}));

jest.mock("react", () => ({
    ...jest.requireActual("react"),
    useContext: jest.fn(),
}));

describe(BetConfirmDialog.name, () => {
    let mockGameStateContext;
    beforeEach(() => {
        mockGameStateContext = {
            showConfirmDialog: true,
            suggestBet: {
                currentBetChoice: "choice1",
                suggestBetAmount: "5",
                sendOutstandingBet: jest.fn(),
                isInsufficientFunds: true,
            },
        };

        mockUseGameStatesDispatch.mockImplementation(() => jest.fn());
        mockUsePlayerContext.mockReturnValue({
            authorizeInfo: {
                user: {
                    settings: {
                        quickBet: true,
                    },
                },
            },
        });
    });
    describe("render", () => {
        describe("with insufficient fund", () => {
            it("should match the snapshot", () => {
                // Arrange
                mockUseGameStateContext.mockReturnValue(mockGameStateContext);

                // Act
                const { container } = render(<BetConfirmDialog />);

                // Assert
                expect(container).toMatchSnapshot();
            });
        });

        describe("with reach max-bet", () => {
            it("should match the snapshot", () => {
                // Arrange
                mockGameStateContext.suggestBet.isInsufficientFunds = false;
                mockUseGameStateContext.mockReturnValue(mockGameStateContext);

                // Act
                const { container } = render(<BetConfirmDialog />);

                // Assert
                expect(container).toMatchSnapshot();
            });
        });

        describe("empty", () => {
            it("should match the snapshot", () => {
                // Arrange
                mockGameStateContext.showConfirmDialog = false;
                mockUseGameStateContext.mockReturnValue(mockGameStateContext);

                // Act
                const { container } = render(<BetConfirmDialog />);

                // Assert
                expect(container).toMatchSnapshot();
            });
        });
    });
});
