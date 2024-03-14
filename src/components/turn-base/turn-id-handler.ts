import { GameEventActionType } from "../../_shared/react-contexts/game-state-context/game-event-action";
import { GameStateContextModel } from "../../_shared/react-contexts/game-state-context/game-state-context-model";
import { GameDurations, RoundState } from "../game-base/type";
import { GameMessageHandler, messageEventType } from "../game-base/handlers/game-message-handler";
import { randomNumberSeries, writeDebugLog } from "../../_shared/helpers";

export type TurnIdHandlerProps = {
    dispatch: Function;
    gameStateContextModel(): GameStateContextModel<any, any>;
    gameMessageHandler: GameMessageHandler;
    totalTurns?: number;
    durations: GameDurations;
};

export class TurnIdHandler {
    private turnCounter = 0;
    private roundState: RoundState = RoundState.None;

    constructor(private props: TurnIdHandlerProps) {}

    registerEvents = () => {
        this.props.gameMessageHandler.register(messageEventType.DRAW_ID, this.handleDrawId.bind(this));
        this.props.gameMessageHandler.register(messageEventType.ROUND_STATE, this.handleRoundState.bind(this));
    };

    handleDrawId = ({ drawId }) => {
        const numberOfTurnsPerRound = this.props.totalTurns;

        this.props.dispatch({
            type: GameEventActionType.DRAW_ID,
            payload: { drawId },
        });

        const turnIndex = drawId % numberOfTurnsPerRound;
        this.turnCounter = turnIndex === 0 ? numberOfTurnsPerRound : turnIndex;

        const { roundState, remainingTime, pfSetting } = this.props.gameStateContextModel();
        const { showResult, wholeTurn, beforePlaceBet } = this.props.durations;

        if (pfSetting.drawId != drawId) {
            this.props.dispatch({
                type: GameEventActionType.UPDATE_PF_SETTING,
                payload: {
                    pfSetting: {
                        drawId,
                        randomClientSeed: randomNumberSeries(4),
                    },
                },
            });
        }

        writeDebugLog({
            name: "handleDrawId - turncounter",
            innerRoundState: RoundState[this.roundState],
            globalRoundState: RoundState[roundState],
            showResult,
            wholeTurn,
            remainingTime,
            drawId,
        });

        if (this.roundState === RoundState.None && remainingTime >= wholeTurn - (showResult + beforePlaceBet)) {
            if (this.turnCounter === 1) {
                this.turnCounter = numberOfTurnsPerRound;
            } else {
                this.turnCounter -= 1;
            }
            this.roundState = RoundState.DisplayResult;
            this.dispatchTurnCounter(true);
        } else if (this.roundState !== RoundState.DisplayResult && this.roundState !== RoundState.BeforePlaceBet) {
            this.dispatchTurnCounter(true);
        }
    };

    handleRoundState = ({ roundState }) => {
        if (
            roundState == RoundState.InRound &&
            (this.roundState === RoundState.DisplayResult || this.roundState === RoundState.BeforePlaceBet)
        ) {
            this.dispatchTurnCounter(false);
        }

        this.roundState = roundState;
    };

    dispatchTurnCounter = (fromDrawId) => {
        this.props.dispatch({
            type: GameEventActionType.TURN_COUNTER,
            payload: { turnCounter: this.turnCounter },
        });

        writeDebugLog({ name: "dispatch turnCounter", turnCounter: this.turnCounter, fromDrawId, roundState: RoundState[this.roundState] });
    };
}
