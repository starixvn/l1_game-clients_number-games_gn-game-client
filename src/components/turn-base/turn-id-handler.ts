import { GameEventActionType } from "../../_shared/react-contexts/game-state-context/game-event-action";
import { GameStateContextModel } from "../../_shared/react-contexts/game-state-context/game-state-context-model";
import { RoundState } from "../game-base/type";
import { GameMessageHandler, messageEventType } from "../game-base/handlers/game-message-handler";

export type TurnIdHandlerProps = {
    dispatch: Function;
    gameStateContextModel(): GameStateContextModel<any, any>;
    gameMessageHandler: GameMessageHandler;
    totalTurns?: number;
};

export class TurnIdHandler {
    private turnCounter = 0;
    private roundState: RoundState = RoundState.None;

    constructor(private props: TurnIdHandlerProps) {}

    registerEvents = () => {
        this.props.gameMessageHandler.register(messageEventType.DRAW_ID, this.handleDrawId);
        this.props.gameMessageHandler.register(messageEventType.ROUND_STATE, this.handleRoundState);
    };

    handleDrawId = ({ drawId }) => {
        const numberOfTurnsPerRound = this.props.totalTurns;

        this.props.dispatch({
            type: GameEventActionType.DRAW_ID,
            payload: { drawId },
        });

        this.turnCounter = drawId % numberOfTurnsPerRound === 0 ? numberOfTurnsPerRound : drawId % numberOfTurnsPerRound;

        const roundState = this.props.gameStateContextModel().roundState;
        if (roundState !== RoundState.DisplayResult) {
            this.dispatchTurnCounter(true);
            this.roundState = roundState;
        }
    };

    handleRoundState = ({ roundState }) => {
        if (roundState == RoundState.InRound && this.roundState === RoundState.DisplayResult) {
            this.dispatchTurnCounter(false);
        }

        this.roundState = roundState;
    };

    dispatchTurnCounter = (fromDrawId) => {
        this.props.dispatch({
            type: GameEventActionType.TURN_COUNTER,
            payload: { turnCounter: this.turnCounter },
        });
    };
}
