import { render } from "@testing-library/react";
import { useGameBettingZoneContext } from "../../../_shared/react-contexts";
import { useGameStateContext } from "../../../_shared/react-contexts/game-state-context/game-state-context";
import { RoundState } from "../../game-base/type";
import PlayerBetCount from "./player-bet-count";

jest.mock("../../../_shared/react-contexts", () => ({ useGameBettingZoneContext: jest.fn() }));
jest.mock("../../../_shared/react-contexts/game-state-context/game-state-context", () => ({ useGameStateContext: jest.fn() }));

describe(PlayerBetCount.name, () => {
    const choice = "choice1";
    const ns = "gameA";
    const className = "custom-class";
    it("should render empty when playerBetCount is empty", () => {
        // arrange
        (useGameBettingZoneContext as jest.Mock).mockReturnValue({ playerBetCount: {} });
        (useGameStateContext as jest.Mock).mockReturnValue({ roundState: RoundState.InRound });

        // act
        const { container } = render(<PlayerBetCount choice={choice} tolgeeNamespace={ns} className={className} />);

        // assert
        expect(container.innerHTML).toBe("");
    });

    it("should render empty when switch round", () => {
        // arrange
        (useGameBettingZoneContext as jest.Mock).mockReturnValue({ playerBetCount: { [choice]: 10 } });
        (useGameStateContext as jest.Mock).mockReturnValue({ roundState: RoundState.SwitchRound });

        // act
        const { container } = render(<PlayerBetCount choice={choice} tolgeeNamespace={ns} className={className} />);

        // assert
        expect(container.innerHTML).toBe("");
    });

    it("should render match the snapshot when there are players bet", () => {
        // arrange
        (useGameBettingZoneContext as jest.Mock).mockReturnValue({ playerBetCount: { [choice]: 10 } });
        (useGameStateContext as jest.Mock).mockReturnValue({ roundState: RoundState.InRound });

        // act
        const { container } = render(<PlayerBetCount choice={choice} tolgeeNamespace={ns} className={className} />);

        // assert
        expect(container).toMatchSnapshot();
        expect(container.textContent).toBe("10");
    });
});
