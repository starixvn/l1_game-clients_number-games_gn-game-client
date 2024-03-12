import { DefaultParamType, TFnType, TranslationKey } from "@tolgee/react";
import { v4 as uuidv4 } from "uuid";
import { confirmBet } from "../../../_shared/constants";
import { NoticeErrorCode } from "../../../_shared/constants/error-code-dictionary";
import { GetLocalizedErrorMessage, StorageHelper, localStorageKeys } from "../../../_shared/helpers";
import {
    IAvailableSuggestBetAmount,
    findHedgeBetGroup,
    getCriteriaValidateBet,
    isBalanceUnavailable,
    isHedgeBet,
    isInPhasePreventBet,
} from "../../../_shared/helpers/validate-bet-helper";
import { SystemContextModel } from "../../../_shared/react-contexts";
import { GameEventActionType } from "../../../_shared/react-contexts/game-state-context/game-event-action";
import { GameStateContextModel } from "../../../_shared/react-contexts/game-state-context/game-state-context-model";
import { GameResourceKeys } from "../../../_shared/resources";
import { Notice, RoundState, SuggestBet } from "../type";
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

    constructor(private props: PlaceBetHandlerProps) {}

    registerEvents = (signOut: Function, gameStateContext: GameStateContextModel<unknown, unknown>) => {
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
        { endBet, ownBets, notice, kickedOut, apiError },
        signOut: Function,
        gameStateContext: GameStateContextModel<unknown, unknown>
    ) => {
        const { playPlaceBetSound, dispatch, gameMessageHandler } = this.props;
        const enableSound = StorageHelper.get(localStorageKeys.enableSound) ?? false;
        dispatch({ type: GameEventActionType.END_BET_PROCESSING, payload: {} });
        this.clearRetryInterval();
        dispatch({
            type: GameEventActionType.DISPLAY_POPUP,
            payload: { notice: null },
        });

        if (endBet === -1) {
            !apiError && this.handleBetFailed({ notice, kickedOut }, signOut);
        } else {
            this.playAcceptedBetAnimation(endBet, gameStateContext);
            enableSound && playPlaceBetSound();
            dispatch({
                type: GameEventActionType.OWN_BETS,
                payload: { ownBets },
            });
            gameMessageHandler.broadcastGameEvent({ [messageEventType.UPDATE_PLAYER_BALANCE]: {} });
        }
        dispatch({
            type: GameEventActionType.SHOW_CONFIRM_BET,
            payload: {
                showConfirmBet: false,
            },
        });

        dispatch({
            type: GameEventActionType.NOT_CONFIRM_OWN_BETS,
            payload: { notConfirmOwnBets: {} },
        });
    };

    playAcceptedBetAnimation = (amount: number, gameStateContext: GameStateContextModel<unknown, unknown>) => {
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

    removeAcceptedBetQueue = (key: number, gameStateContext: GameStateContextModel<unknown, unknown>) => {
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
        enabledQuickBet: boolean,
        gameStateContext: GameStateContextModel<unknown, unknown>,
        systemContext: SystemContextModel
    ) => {
        if (isInPhasePreventBet(gameStateContext)) {
            this.handlePreventBet(gameStateContext);

            return;
        }

        if (gameStateContext.isProcessingBet) {
            this.handleProcessingBet();

            return;
        }

        if (isBalanceUnavailable(this.props.getPlayerBalance(), amount, gameStateContext)) {
            this.sendNotice(this.getNotice(NoticeErrorCode.notEnoughMoney));

            return;
        }

        if (isHedgeBet(findHedgeBetGroup(this.props?.hedgeBetGroups, betChoice), betChoice, amount, gameStateContext)) {
            this.sendNotice(this.getNotice(NoticeErrorCode.hedgeBet, betChoice));

            return;
        }

        this.handleValidateBet(gameStateContext, betChoice, amount, enabledQuickBet, systemContext);
    };

    protected handleProcessingBet = () => {
        this.props.dispatch({
            type: GameEventActionType.BET_PROCESSING,
            payload: { notice: { message: this.props.translate("message_processing_action"), duration: 2 } },
        });
    };

    protected handlePreventBet = (gameStateContext: GameStateContextModel<unknown, unknown>) => {
        const isStartingRound = gameStateContext.roundState === RoundState.BeforePlaceBet;
        const notice = isStartingRound ? this.getNotice(NoticeErrorCode.cannotBet) : this.getNotice(NoticeErrorCode.placeBetNextRound);

        this.sendNotice(notice);
    };

    protected handleValidateBet = (
        gameStateContext: GameStateContextModel<unknown, unknown>,
        betChoice: string,
        amount: number,
        enabledQuickBet: boolean,
        systemContext: SystemContextModel
    ) => {
        const criteriaValidateBet = getCriteriaValidateBet(
            gameStateContext,
            betChoice,
            amount,
            this.getAccountBalance(),
            this.suggestBetAmount
        );

        if (criteriaValidateBet?.errorCode === NoticeErrorCode.validBet) {
            this.handleValidBetChoice(enabledQuickBet, amount, betChoice, gameStateContext, systemContext);

            return;
        }

        this.sendNotice(this.getNotice(criteriaValidateBet?.errorCode, betChoice, criteriaValidateBet?.args));
    };

    protected handleValidBetChoice = (
        enabledQuickBet: boolean,
        amount: number,
        betChoice: string,
        gameStateContext: GameStateContextModel<unknown, unknown>,
        systemContext: SystemContextModel
    ) => {
        if (enabledQuickBet) {
            this.handleEnabledQuickBet(amount, betChoice);
        } else {
            if (betChoice === confirmBet) {
                this.sendConfirmBet(gameStateContext);

                return;
            }

            const enableSound = StorageHelper.get(localStorageKeys.enableSound) ?? false;
            enableSound && this.props.playPlaceBetSound();
            this.updateNotConfirmedBetState(gameStateContext, betChoice, systemContext);
        }
    };

    protected getAccountBalance = () => {
        const balance = this.props.getPlayerBalance();
        return Math.trunc(balance);
    };

    protected suggestBetAmount = (betChoice: string, availableSuggestBet: IAvailableSuggestBetAmount) => {
        this.props.dispatch({
            type: GameEventActionType.SHOW_CONFIRM_DIALOG,
            payload: {
                showConfirmDialog: true,
            },
        });
        const sendOutstandingBet = () => this.sendBetMessage(betChoice, availableSuggestBet?.suggestAmount);
        const suggestBet: SuggestBet = {
            currentBetChoice: betChoice,
            suggestBetAmount: availableSuggestBet?.suggestAmount,
            sendOutstandingBet,
            isInsufficientFunds: availableSuggestBet?.isInsufficientFunds,
        };

        this.props.dispatch({ type: GameEventActionType.SUGGEST_BET, payload: { suggestBet } });
    };

    private updateNotConfirmedBetState(
        gameStateContext: GameStateContextModel<unknown, unknown>,
        betChoice: string,
        systemContext: SystemContextModel
    ) {
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
    }

    private handleEnabledQuickBet(amount: number, betChoice: string) {
        if (amount > 0) {
            this.setRetryInterval();
            this.sendBetMessage(betChoice, amount);
        }
    }
    private sendNotice = (notice: Notice) =>
        this.props.dispatch({
            type: GameEventActionType.DISPLAY_POPUP,
            payload: {
                notice,
            },
        });

    private getNotice = (errorCode: string, betChoice?: string, args?: object): Notice => {
        let betChoice1 = "";
        let betChoice2 = "";
        const hedgeBetGroup = this.props.hedgeBetGroups.find((group) => group.includes(betChoice));

        if (betChoice && hedgeBetGroup) {
            betChoice1 = this.props.translate(hedgeBetGroup[0]);
            betChoice2 = this.props.translate(hedgeBetGroup[1]);
        }

        return {
            gameName: this.props.gameName,
            message: GetLocalizedErrorMessage(errorCode),
            duration: 2,
            errorCode: errorCode,
            betChoice1,
            betChoice2,
            ...args,
        };
    };

    private sendConfirmBet(gameStateContext: GameStateContextModel<unknown, unknown>) {
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
        const { dispatch, gameMessageHandler } = this.props;
        dispatch({
            type: GameEventActionType.BET_PROCESSING,
            payload: { notice: null },
        });

        gameMessageHandler.broadcastGameEvent({
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
