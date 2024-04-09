import { render } from "@testing-library/react";
import { useGameBettingZoneContext } from "../../../_shared/react-contexts";
import BetPercentage from "./bet-percentage";

const mockUseGameBettingZoneContext = useGameBettingZoneContext as jest.Mock;

jest.mock("../../../_shared/react-contexts", () => ({
    useGameBettingZoneContext: jest.fn(),
}));

describe("BetPercentage", () => {
    let choice;
    const mockPercentage = {
        tie: 50,
    };
    beforeEach(() => {
        choice = "tie";
        mockUseGameBettingZoneContext.mockReturnValue({
            betPercentage: mockPercentage,
        });
    });
    test("should match the snapshot", () => {
        // Act
        const { container, getByText } = render(
            <BetPercentage tolgeeNamespace="test" choice={choice} className="class" percentageColor="#ffffff" />
        );

        const classPer = getByText(mockPercentage.tie);

        // Assert
        expect(container).toMatchSnapshot();
        expect(classPer).toBeInTheDocument();
    });
});
