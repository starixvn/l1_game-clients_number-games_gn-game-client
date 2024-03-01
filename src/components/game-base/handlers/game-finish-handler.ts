import { GameEventActionType } from "../../../_shared/react-contexts/game-state-context/game-event-action";
import { GameStateContextModel } from "../../../_shared/react-contexts/game-state-context/game-state-context-model";
import { GameDurations } from "../type";
import { GameMessageHandler, messageEventType } from "./";

export type GameFinishHandlerProps = {
    gameName: string;
    dispatch: Function;
    gameMessageHandler: GameMessageHandler;
};

export class GameFinishHandler {
    protected showResultInfoTimeout: NodeJS.Timeout;
    protected showWinningAnimationTimeout: NodeJS.Timeout;
    private betWin: number = 0;

    constructor(private props: GameFinishHandlerProps) {}

    registerEvents = () => {
        this.props.gameMessageHandler.register(messageEventType.STATUS, this.handleStatus);
    };

    handleStatus = ({ status }) => {
        const { win, bet } = status;
        win &&
            this.props.dispatch({
                type: GameEventActionType.WIN_STATUS,
                payload: { status },
            });

        this.betWin = win ? bet : 0;
    };

    handleFinish = ({ finish }, gameStateContext: GameStateContextModel<any, any>, durations?: GameDurations) => {
        const { dispatch, gameMessageHandler } = this.props;
        const { roundHistory } = gameStateContext;
        const roundHistoryClone = [...roundHistory];

        dispatch({ type: GameEventActionType.END_BET_PROCESSING, payload: {} });
        //this.storeOwnBet(finish.roundId);
        roundHistoryClone.unshift(finish);
        roundHistoryClone.length > 100 && roundHistoryClone.pop();

        dispatch({
            type: GameEventActionType.FINISH,
            payload: {
                playResultAnimation: true,
                result: finish.result,
                settlementResult: finish.settlementResult,
                roundId: finish.roundId,
                drawId: finish?.drawId,
            },
        });

        const animationDuration = durations.resultAnimation * 1000;

        this.showResultInfoTimeout = setTimeout(() => {
            dispatch({
                type: GameEventActionType.SHOW_RESULT_INFO_TIME_OUT,
                payload: {
                    showResultInfo: true,
                    isShowBlink: false,
                    roundHistory: roundHistoryClone,
                    playResultAnimation: false,
                },
            });
        }, animationDuration);

        this.showWinningAnimationTimeout = setTimeout(() => {
            dispatch({
                type: GameEventActionType.SHOW_WINNING_ANIMATION,
                payload: {
                    showWinningAnimation: true,
                },
            });

            this.betWin > 0 && gameMessageHandler.broadcastGameEvent({ [messageEventType.UPDATE_PLAYER_BALANCE]: true });
        }, durations.showResult * 1000);
    };

    clearTimeout = () => {
        this.showResultInfoTimeout && clearTimeout(this.showResultInfoTimeout);
        this.showWinningAnimationTimeout && clearTimeout(this.showWinningAnimationTimeout);
    };
}
