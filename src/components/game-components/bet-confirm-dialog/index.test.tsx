import { render } from "@testing-library/react";
import BetConfirmDialog from ".";
import { usePlayerContext } from "../../../_shared/react-contexts";
import { usePlaceBetContext, usePlaceBetDispatch } from "../../../_shared/react-contexts/game-state-context/place-bet-context/place-bet-context";

const mockUsePlaceBetContext = usePlaceBetContext as jest.Mock;
const mockUsePlaceBetDispatch = usePlaceBetDispatch as jest.Mock;
const mockUsePlayerContext = usePlayerContext as jest.Mock;

jest.mock("../../../_shared/react-hooks", () => ({
    useTranslator: jest.fn().mockReturnValue({ t: (key: string) => key }),
    useSNTranslate: jest.fn().mockReturnValue({ t: (key: string) => key }),
    useClickSound: jest.fn(),
}));

jest.mock("../../../_shared/react-contexts/game-state-context/place-bet-context/place-bet-context", () => ({
    usePlaceBetContext: jest.fn(),
    usePlaceBetDispatch: jest.fn(),
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

const messageSnapShot = "should match the snapshot";

describe(BetConfirmDialog.name, () => {
    let mockPlaceBetContext;
    beforeEach(() => {
        mockPlaceBetContext = {
            showConfirmDialog: true,
            suggestBet: {
                currentBetChoice: "choice1",
                suggestBetAmount: "5",
                sendOutstandingBet: jest.fn(),
                isInsufficientFunds: true,
            },
        };

        mockUsePlaceBetDispatch.mockReturnValue(jest.fn());
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
            it(messageSnapShot, () => {
                // Arrange
                mockUsePlaceBetContext.mockReturnValue(mockPlaceBetContext);

                // Act
                const { container } = render(<BetConfirmDialog />);

                // Assert
                expect(container).toMatchSnapshot();
            });
        });

        describe("with reach max-bet", () => {
            it(messageSnapShot, () => {
                // Arrange
                mockPlaceBetContext.suggestBet.isInsufficientFunds = false;
                mockUsePlaceBetContext.mockReturnValue(mockPlaceBetContext);

                // Act
                const { container } = render(<BetConfirmDialog />);

                // Assert
                expect(container).toMatchSnapshot();
            });
        });

        describe("empty", () => {
            it(messageSnapShot, () => {
                // Arrange
                mockPlaceBetContext.showConfirmDialog = false;
                mockUsePlaceBetContext.mockReturnValue(mockPlaceBetContext);

                // Act
                const { container } = render(<BetConfirmDialog />);

                // Assert
                expect(container).toMatchSnapshot();
            });
        });
    });
});
