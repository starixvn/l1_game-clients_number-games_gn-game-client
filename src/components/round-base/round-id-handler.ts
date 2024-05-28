import { GameEventActionType } from "../../_shared/react-contexts/game-state-context/game-event-action";
import { TurnIdHandler } from "../turn-base/turn-id-handler";

export class RoundIdHandler extends TurnIdHandler {
    private isFirstRoundId = false;

    registerEvents(): void {
        this.isFirstRoundId = true;
        super.registerEvents();
    }

    handleRoundId = ({ roundId }) => {
        this.roundId = roundId;
        !this.isFirstRoundId &&
            this.props.dispatch({
                type: GameEventActionType.ROUND_ID,
                payload: { roundId },
            });
        this.isFirstRoundId = false;
    };
}
