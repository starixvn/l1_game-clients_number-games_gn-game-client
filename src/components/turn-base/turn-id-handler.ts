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
    private reloadHandler = false;
    private roundRemainingTime = 0;
    private drawId = 0;

    constructor(private props: TurnIdHandlerProps) {}

    registerEvents = () => {
        console.log("TurnIdHandler re-init");
        this.reloadHandler = true;
        this.roundRemainingTime = 0;
        this.props.gameMessageHandler.register(messageEventType.REMAINING_TIME, this.handleRemainingTime.bind(this));
        this.props.gameMessageHandler.register(messageEventType.DRAW_ID, this.handleDrawId.bind(this));
        this.props.gameMessageHandler.register(messageEventType.ROUND_STATE, this.handleRoundState.bind(this));
    };

    handleRemainingTime = ({ remainingTime }) => {
        if (this.reloadHandler) {
            this.roundRemainingTime = remainingTime;
            writeDebugLog({
                name: "TurnIdHandler - handleRemainingTime",
                remainingTime,
            });
        }
    };

    handleDrawId = ({ drawId }) => {
        this.drawId = drawId;
        const numberOfTurnsPerRound = this.props.totalTurns;
        const turnIndex = drawId % numberOfTurnsPerRound;
        this.turnCounter = turnIndex === 0 ? numberOfTurnsPerRound : turnIndex;
        const { showResult, wholeTurn, beforePlaceBet, switchRoundAnimation } = this.props.durations;

        writeDebugLog({
            name: "TurnIdHandler - handleDrawId",
            innerRoundState: RoundState[this.roundState],
            showResult,
            wholeTurn,
            remainingTime: this.roundRemainingTime,
            drawId,
        });

        if (this.reloadHandler) {
            const isInDisplayResultState = this.roundRemainingTime % wholeTurn > wholeTurn - (showResult + beforePlaceBet);
            const isInSwitchRoundState = this.roundRemainingTime <= switchRoundAnimation;
            const isInSwitchTurnState = this.roundRemainingTime % wholeTurn === 0;
            this.reloadHandler = false;

            if (isInDisplayResultState) {
                let publishTurnCounter = this.turnCounter === 1 ? numberOfTurnsPerRound : this.turnCounter - 1;
                this.dispatchTurnCounter(true, publishTurnCounter);
                this.dispatchDrawId(drawId - 1);

                return;
            } else if (isInSwitchRoundState || isInSwitchTurnState) {
                this.dispatchTurnCounter(true, this.turnCounter);
                this.dispatchDrawId(drawId);
                this.reloadHandler = false;

                return;
            }
        }

        if (!this.isInDisplayResultState()) {
            this.dispatchTurnCounter(true, this.turnCounter);
            this.dispatchDrawId(drawId);
        }
    };

    handleRoundState = ({ roundState }) => {
        if (roundState == RoundState.InRound && this.isInDisplayResultState()) {
            this.dispatchTurnCounter(false, this.turnCounter);
            this.dispatchDrawId(this.drawId);
        }

        this.roundState = roundState;
    };

    dispatchTurnCounter = (fromDrawId, turnCounter) => {
        this.props.dispatch({
            type: GameEventActionType.TURN_COUNTER,
            payload: { turnCounter },
        });

        writeDebugLog({
            name: "TurnIdHandler dispatch turnCounter",
            turnCounter,
            fromDrawId,
            roundState: RoundState[this.roundState],
        });
    };

    dispatchDrawId = (drawId) => {
        this.props.dispatch({
            type: GameEventActionType.DRAW_ID,
            payload: { drawId },
        });

        this.props.dispatch({
            type: GameEventActionType.UPDATE_PF_SETTING,
            payload: {
                pfSetting: {
                    drawId,
                    randomClientSeed: randomNumberSeries(4),
                },
            },
        });

        writeDebugLog({
            name: "TurnIdHandler dispatch drawId",
            drawId,
            roundState: RoundState[this.roundState],
        });
    };

    private isInDisplayResultState() {
        return this.roundState === RoundState.DisplayResult || this.roundState === RoundState.BeforePlaceBet;
    }
}
