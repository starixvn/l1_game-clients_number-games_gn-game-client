import { DefaultParamType, TFnType, TranslationKey } from "@tolgee/react";
import { v4 as uuidv4 } from "uuid";
import { confirmBet } from "../../../_shared/constants";
import { GetLocalizedErrorMessage } from "../../../_shared/helpers";
import { getValidateMinMaxBetResult, validateHedgeBet } from "../../../_shared/helpers/validate-bet-helper";
import { SystemContextModel } from "../../../_shared/react-contexts";
import { GameEventActionType } from "../../../_shared/react-contexts/game-state-context/game-event-action";
import { GameStateContextModel } from "../../../_shared/react-contexts/game-state-context/game-state-context-model";
import { GameResourceKeys } from "../../../_shared/resources";
import { Notice as NoticeData, RoundState } from "../type";
import { GameMessageHandler, messageEventType } from "./";

export type PlaceBetHandlerProps = {
    gameName: string;
    dispatch: Function;
    gameMessageHandler: GameMessageHandler;
    translate: TFnType<DefaultParamType, string, TranslationKey>;
    playPlaceBetSound?: Function;
    hedgeBetGroups: [string[]];
    getPlayerBalance: Function;
};

export class PlaceBetHandler {
    private retryInterval: NodeJS.Timeout;
    private isProcessingBet: boolean;

    constructor(private props: PlaceBetHandlerProps) {}

    registerEvents = (signOut: Function, gameStateContext: GameStateContextModel<any, any>) => {
        this.props.gameMessageHandler.register(messageEventType.END_BET, (gameMessage) => {
            this.handleEndBet(gameMessage, signOut, gameStateContext);
        });
    };

    handleBetFailed = ({ notice, kickedOut }, signOut: Function) => {
        const { dispatch, gameName } = this.props;

        this.props.dispatch({
            type: GameEventActionType.DISPLAY_POPUP,
            payload: {
                notice: null,
            },
        });

        if (kickedOut?.isDisabledAccount) {
            dispatch({
                type: GameEventActionType.DISPLAY_POPUP,
                payload: {
                    notice: {
                        gameName: this.props.gameName,
                        message: GetLocalizedErrorMessage(kickedOut.errorCode),
                        duration: 10,
                        errorCode: kickedOut.errorCode,
                        roundId: 0,
                        onClose: signOut,
                    },
                },
            });
        } else {
            dispatch({
                type: GameEventActionType.DISPLAY_POPUP,
                payload: {
                    notice: {
                        gameName: `${gameName.toLowerCase()}:${GameResourceKeys.GAME_NAME}`,
                        message: GetLocalizedErrorMessage(notice.errorCode),
                        duration: 3,
                        minBet: notice?.minBet,
                        maxBet: notice?.maxBet,
                        errorCode: notice.errorCode,
                        roundId: notice?.gameRoundId,
                        betChoice1: notice?.hedgeBetGroup ? this.props.translate(notice.hedgeBetGroup[0]) : "",
                        betChoice2: notice?.hedgeBetGroup ? this.props.translate(notice.hedgeBetGroup[1]) : "",
                    },
                },
            });
        }
    };

    handleEndBet = (
        { endBet, ownBets, betChoice, notice, kickedOut, apiError },
        signOut: Function,
        gameStateContext: GameStateContextModel<any, any>
    ) => {
        const { playPlaceBetSound } = this.props;
        this.props.dispatch({ type: GameEventActionType.END_BET_PROCESSING, payload: {} });
        this.clearRetryInterval();
        this.props.dispatch({
            type: GameEventActionType.DISPLAY_POPUP,
            payload: { notice: null },
        });

        if (endBet === -1) {
            !apiError && this.handleBetFailed({ notice, kickedOut }, signOut);
        } else {
            this.playAcceptedBetAnimation(endBet, gameStateContext);
            playPlaceBetSound();
            this.props.dispatch({
                type: GameEventActionType.OWN_BETS,
                payload: { ownBets },
            });
            this.props.gameMessageHandler.broadcastGameEvent(messageEventType.UPDATE_PLAYER_BALANCE);
        }

        this.props.dispatch({
            type: GameEventActionType.NOT_CONFIRM_OWN_BETS,
            payload: { notConfirmOwnBets: {} },
        });
    };

    playAcceptedBetAnimation = (amount: number, gameStateContext: GameStateContextModel<any, any>) => {
        const { acceptedBetQueue } = gameStateContext;
        const key = uuidv4();
        acceptedBetQueue[key] = {
            amount,
        };

        this.props.dispatch({
            type: GameEventActionType.ACCEPTED_BET_QUEUE,
            payload: { acceptedBetQueue: { ...acceptedBetQueue } },
        });

        const animationTime = 3000;
        setTimeout(() => {
            this.removeAcceptedBetQueue(key, gameStateContext);
        }, animationTime);
    };

    removeAcceptedBetQueue = (key: number, gameStateContext: GameStateContextModel<any, any>) => {
        const { acceptedBetQueue } = gameStateContext;
        delete acceptedBetQueue[key];
        this.props.dispatch({
            type: GameEventActionType.ACCEPTED_BET_QUEUE,
            payload: { acceptedBetQueue },
        });
    };

    placeBet = (
        betChoice: string,
        amount: number,
        gameStateContext: GameStateContextModel<any, any>,
        systemContext: SystemContextModel
    ) => {
        if (gameStateContext.enabledQuickBet) {
            if (gameStateContext.isProcessingBet) {
                this.props.dispatch({
                    type: GameEventActionType.BET_PROCESSING,
                    payload: { notice: { message: "messages:betProcessing", duration: 2 } },
                });
            } else {
                if (amount > 0) {
                    this.props.dispatch({
                        type: GameEventActionType.BET_PROCESSING,
                        payload: { notice: null },
                    });
                    this.setRetryInterval();
                    this.sendBetMessage(betChoice, amount);
                }
            }

            return;
        }
        const validate = this.validateNotConfirmBet(betChoice, amount, gameStateContext);
        if (!validate) {
            console.log("fail");
            return;
        }

        if (betChoice == confirmBet) {
            this.sendConfirmBet(gameStateContext);
            return;
        }

        !gameStateContext.showConfirmBet &&
            this.props.dispatch({
                type: GameEventActionType.SHOW_CONFIRM_BET,
                payload: {
                    showConfirmBet: true,
                },
            });

        const notConfirmOwnBets = gameStateContext.notConfirmOwnBets;

        notConfirmOwnBets[betChoice] = (notConfirmOwnBets[betChoice] ?? 0) + systemContext.selectedChip;

        this.props.dispatch({
            type: GameEventActionType.NOT_CONFIRM_OWN_BETS,
            payload: { notConfirmOwnBets },
        });
    };

    private validateNotConfirmBet(betChoice: string, amount: number, gameStateContext: GameStateContextModel<any, any>): boolean {
        const notConfirmOwnBets = gameStateContext.notConfirmOwnBets;
        const hedgeBetGroup = this.props.hedgeBetGroups.find((group) => group.includes(betChoice));

        const ownBets = gameStateContext.ownBets;
        const sendNotice = (notice) =>
            this.props.dispatch({
                type: GameEventActionType.DISPLAY_POPUP,
                payload: {
                    notice,
                },
            });

        const getNotice = (errorCode: string, args?): NoticeData => {
            return {
                gameName: this.props.gameName,
                message: GetLocalizedErrorMessage(errorCode),
                duration: 2,
                errorCode: errorCode,
                betChoice1: this.props.translate(hedgeBetGroup[0]),
                betChoice2: this.props.translate(hedgeBetGroup[1]),
                ...args,
            };
        };

        if (gameStateContext.roundState != RoundState.InRound) {
            sendNotice(getNotice("SB1905"));
            return false;
        }

        if (validateHedgeBet(hedgeBetGroup, ownBets, notConfirmOwnBets, betChoice, amount)) {
            sendNotice(getNotice("SB1939"));
            return false;
        }
        const balance = this.props.getPlayerBalance();
        let totalAmount = 0;
        totalAmount += Object.values(notConfirmOwnBets).reduce((a, b) => a + b, 0);
        totalAmount += Object.values(ownBets).reduce((a, b) => a + b, 0);

        if (balance < totalAmount + amount) {
            this.props.dispatch({
                type: GameEventActionType.SHOW_CONFIRM_DIALOG,
                payload: {
                    showConfirmDialog: true,
                },
            });

            return false;
        }

        const { errorCode, args } = getValidateMinMaxBetResult(
            gameStateContext.gameConfigs,
            gameStateContext.userStakeLevel,
            notConfirmOwnBets,
            betChoice,
            amount,
            totalAmount
        );
        if (errorCode == "0") {
            return true;
        }
        sendNotice(getNotice(errorCode, args));
        return false;
    }

    private sendConfirmBet(gameStateContext: GameStateContextModel<any, any>) {
        const notConfirmOwnBets = gameStateContext.notConfirmOwnBets;
        const betChoices = {};
        Object.entries(notConfirmOwnBets).forEach(([key, value]) => {
            betChoices[key] = value;
        });

        this.props.gameMessageHandler.broadcastGameEvent({
            [messageEventType.SEND_SOCKET_MESSAGE]: { event: "bet", data: { betChoices } },
        });
    }

    protected sendBetMessage(betChoice: string, amount: number) {
        this.props.gameMessageHandler.broadcastGameEvent({
            [messageEventType.SEND_SOCKET_MESSAGE]: { event: "bet", data: { betChoices: { [betChoice.toLowerCase()]: amount } } },
        });
    }

    setRetryInterval = () => {
        this.clearRetryInterval();

        this.retryInterval = setInterval(() => {
            this.props.gameMessageHandler.broadcastGameEvent({ [messageEventType.SEND_SOCKET_MESSAGE]: { event: "retry" } });
        }, 3 * 1000);
    };

    clearRetryInterval = () => {
        clearInterval(this.retryInterval);
    };
}
