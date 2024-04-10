import { render } from "@testing-library/react";
import { useGameBettingZoneContext } from "../../../_shared/react-contexts";
import { useGameStateContext } from "../../../_shared/react-contexts/game-state-context/game-state-context";
import { RoundState } from "../../game-base/type";
import TotalBet from "./total-bet";

jest.mock("../../../_shared/react-contexts", () => ({ useGameBettingZoneContext: jest.fn() }));
jest.mock("../../../_shared/react-contexts/game-state-context/game-state-context", () => ({ useGameStateContext: jest.fn() }));

describe(TotalBet.name, () => {
    const className = "custom-total-bet";
    const choice = "choice1";
    const tolgeeNamespace = "gameA";
    describe("when invalid data", () => {
        const expected = "";
        it("should render empty when totalBet = 0", () => {
            // arrange
            (useGameBettingZoneContext as jest.Mock).mockReturnValue({ totalBets: {} });
            (useGameStateContext as jest.Mock).mockReturnValue({ rate: 1, roundState: RoundState.InRound });

            // act
            const { container } = render(<TotalBet className={className} choice={choice} tolgeeNamespace={tolgeeNamespace} />);

            // assert
            expect(container.innerHTML).toBe(expected);
        });

        it("should render empty when rate = 0", () => {
            // arrange
            (useGameBettingZoneContext as jest.Mock).mockReturnValue({ totalBets: { [choice]: 20 } });
            (useGameStateContext as jest.Mock).mockReturnValue({ rate: 0, roundState: RoundState.InRound });

            // act
            const { container } = render(<TotalBet className={className} choice={choice} tolgeeNamespace={tolgeeNamespace} />);

            // assert
            expect(container.innerHTML).toBe(expected);
        });

        it("should render empty when switch round", () => {
            // arrange
            (useGameBettingZoneContext as jest.Mock).mockReturnValue({ totalBets: { [choice]: 20 } });
            (useGameStateContext as jest.Mock).mockReturnValue({ rate: 1, roundState: RoundState.SwitchRound });

            // act
            const { container } = render(<TotalBet className={className} choice={choice} tolgeeNamespace={tolgeeNamespace} />);

            // assert
            expect(container.innerHTML).toBe(expected);
        });
    });

    it("should render match the snapshots", () => {
        // arrange
        (useGameBettingZoneContext as jest.Mock).mockReturnValue({ totalBets: { [choice]: 20 } });
        (useGameStateContext as jest.Mock).mockReturnValue({ rate: 1, roundState: RoundState.InRound });

        // act
        const { container } = render(<TotalBet className={className} choice={choice} tolgeeNamespace={tolgeeNamespace} />);

        // assert
        expect(container).toMatchSnapshot();
    });

    describe("convertStakeToString", () => {
        beforeAll(() => {
            (useGameStateContext as jest.Mock).mockReturnValue({ rate: 0.5, roundState: RoundState.InRound });
        });
        const testCases = [
            { amount: 100.021, expected: "200.04" },
            { amount: 4_000.92, expected: "8,001.84" },
            { amount: 40_000.92, expected: "80K" },
            { amount: 400_000.92, expected: "800K" },
            { amount: 4_000_000.92, expected: "8,000K" },
            { amount: 40_000_000.92, expected: "80M" },
            { amount: 499_728_394.5, expected: "999.46M" },
        ];
        it.each(testCases)("should render expected", ({ amount, expected }) => {
            // arrange
            (useGameBettingZoneContext as jest.Mock).mockReturnValue({ totalBets: { [choice]: amount } });

            // act
            const { container } = render(<TotalBet className={className} choice={choice} tolgeeNamespace={tolgeeNamespace} />);

            // assert
            expect(container.textContent).toBe(expected);
        });
    });
});
