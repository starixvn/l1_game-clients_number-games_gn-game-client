import { render } from "@testing-library/react";
import { useGameBettingZoneContext } from "../../../../_shared/react-contexts";
import { useGameStateContext } from "../../../../_shared/react-contexts/game-state-context/game-state-context";
import { RoundState } from "../../../game-base/type";
import PercentageCircle from "../../percentage-circle";
import BetPercentage from "../bet-percentage";

jest.mock("../../percentage-circle", () => jest.fn().mockReturnValue("PercentageCircle"));
jest.mock("../../../../_shared/react-contexts/game-state-context/game-state-context", () => ({ useGameStateContext: jest.fn() }));
jest.mock("../../../../_shared/react-contexts", () => ({ useGameBettingZoneContext: jest.fn() }));

describe(BetPercentage.name, () => {
    it("should render match the snapshot when there is bet percentage", () => {
        // arrange
        const betPercentage = { choice1: 100 };
        (useGameBettingZoneContext as jest.Mock).mockReturnValueOnce({ betPercentage });
        const roundState = RoundState.InRound;
        (useGameStateContext as jest.Mock).mockReturnValueOnce({ roundState });

        // act
        const { container } = render(<BetPercentage choice="choice1" percentageColor="black" className="bet-percentage" />);

        // assert
        expect(container).toMatchSnapshot();
        expect(PercentageCircle).toHaveBeenCalledWith({ percentage: betPercentage.choice1, color: "black" }, {});
    });

    it("should render empty when betPercentage is empty", () => {
        // arrange
        (useGameBettingZoneContext as jest.Mock).mockReturnValueOnce({ betPercentage: {} });
        const roundState = RoundState.InRound;
        (useGameStateContext as jest.Mock).mockReturnValueOnce({ roundState });

        // act
        const { container } = render(<BetPercentage choice="choice1" percentageColor="black" className="bet-percentage" />);

        // assert
        expect(container).toMatchSnapshot();
        expect(container.innerHTML).toBe(`<div class="bet-percentage"></div>`);
    });

    it("should render empty when switch round", () => {
        // arrange
        const betPercentage = { choice1: 100 };
        (useGameBettingZoneContext as jest.Mock).mockReturnValueOnce({ betPercentage });
        const roundState = RoundState.SwitchRound;
        (useGameStateContext as jest.Mock).mockReturnValueOnce({ roundState });

        // act
        const { container } = render(<BetPercentage choice="choice1" percentageColor="black" className="bet-percentage" />);

        // assert
        expect(container).toMatchSnapshot();
        expect(container.innerHTML).toBe(`<div class="bet-percentage"></div>`);
    });
});
