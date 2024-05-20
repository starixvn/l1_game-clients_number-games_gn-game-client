import { DefaultParamType, TFnType, TranslationKey } from "@tolgee/react";
import { v4 as uuidv4 } from "uuid";

import { confirmBet } from "../../../_shared/constants";
import { NoticeErrorCode } from "../../../_shared/constants/error-code-dictionary";
import { getGlossaryTranslate, GetLocalizedErrorMessage, localStorageKeys, StorageHelper } from "../../../_shared/helpers";
import {
    findHedgeBetGroup,
    getAccountBalance,
    getCriteriaValidateBet,
    IAvailableSuggestBetAmount,
    isBalanceUnavailable,
    isHedgeBet,
    isInPhasePreventBet,
} from "../../../_shared/helpers/validate-bet-helper";
import { SystemContextModel } from "../../../_shared/react-contexts";
import { GameEventActionType } from "../../../_shared/react-contexts/game-state-context/game-event-action";
import { GameStateContextModel } from "../../../_shared/react-contexts/game-state-context/game-state-context-model";
import { Notice, RoundState, SuggestBet } from "../type";
import { GameMessageHandler, messageEventType } from "./";
import { getAppSettings } from "../../../_shared/app-settings";

export type PlaceBetHandlerProps = {
    tolgeeNamespace: string;
    gameName: string;
    dispatch: Function;
    gameMessageHandler: GameMessageHandler;
    translate: TFnType<DefaultParamType, string, TranslationKey>;
    playPlaceBetSound?: Function;
    hedgeBetGroups: string[][];
    getPlayerBalance: Function;
    gameId: number;
};

export class PlaceBetHandler {
    private retryInterval: NodeJS.Timeout;

    constructor(private readonly props: PlaceBetHandlerProps) { }

    registerEvents = (signOut: () => void, gameStateContext: GameStateContextModel) => {
        this.props.gameMessageHandler.register(messageEventType.END_BET, (gameMessage) => {
            this.handleEndBet(gameMessage, signOut, gameStateContext);
        });
    };

    handleBetFailed = ({ notice, kickedOut }, signOut: () => void) => {
        const { dispatch } = this.props;
        const isDisabledAccount = kickedOut?.isDisabledAccount;
        dispatch({
            type: GameEventActionType.DISPLAY_POPUP,
            payload: {
                notice: null,
            },
        });

        const noticePayload = this.getNoticePayloadBetFailed(notice, kickedOut);

        noticePayload.gameName = this.props.gameName;
        if (isDisabledAccount) {
            noticePayload.onClose = signOut;
            noticePayload.duration = 10;
            noticePayload.roundId = 0;
        } else {
            noticePayload.duration = 3;
            noticePayload.minBet = notice?.minBet;
            noticePayload.maxBet = notice?.maxBet;
            noticePayload.roundId = notice?.gameRoundId;
        }

        dispatch({ type: GameEventActionType.DISPLAY_POPUP, payload: { notice: noticePayload } });
    };

    getNoticePayloadBetFailed = (notice: Notice, kickedOut: any) => {
        const errorCode = kickedOut?.isDisabledAccount ? kickedOut.errorCode : notice.errorCode;

        const hedgeBetGroup = notice?.hedgeBetGroup;
        const betChoice = hedgeBetGroup ? hedgeBetGroup[0] : undefined;

        return this.getNotice(errorCode, betChoice, notice);
    };

    handleEndBet = ({ endBet, ownBets, notice, kickedOut, apiError }, signOut: () => void, gameStateContext: GameStateContextModel) => {
        const { playPlaceBetSound, dispatch, gameMessageHandler } = this.props;
        const enableSound = StorageHelper.get(localStorageKeys.enableSound) ?? true;
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

    playAcceptedBetAnimation = (amount: number, gameStateContext: GameStateContextModel) => {
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

    removeAcceptedBetQueue = (key: number, gameStateContext: GameStateContextModel) => {
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
        gameStateContext: GameStateContextModel,
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

        if (isBalanceUnavailable(getAccountBalance(this.props.getPlayerBalance()), amount, gameStateContext, enabledQuickBet)) {
            this.sendNotice(this.getNotice(NoticeErrorCode.notEnoughMoney));

            return;
        }

        if (isHedgeBet(findHedgeBetGroup(this.props?.hedgeBetGroups, betChoice), betChoice, amount, gameStateContext)) {
            this.sendNotice(this.getNotice(NoticeErrorCode.hedgeBet, betChoice));

            return;
        }

        this.handleBetValidation(gameStateContext, betChoice, amount, enabledQuickBet, systemContext);
    };

    handleProcessingBet = () => {
        this.sendNotice({ message: "Common.message_processing_action", duration: 2 });
    };

    handlePreventBet = (gameStateContext: GameStateContextModel) => {
        const isStartingRound = gameStateContext.roundState === RoundState.BeforePlaceBet;
        const { gameId } = this.props;
        const gameSettings = Object.values(getAppSettings().gameSettings)?.find((setting) => setting.id === +gameId);
        const totalTurns = gameSettings?.totalTurns;
        const notice = isStartingRound
            ? this.getNotice(NoticeErrorCode.cannotBet)
            : this.getNotice(totalTurns > 1 ? NoticeErrorCode.placeBetNextDraw : NoticeErrorCode.placeBetNextRound);

        this.sendNotice(notice);
    };

    protected handleBetValidation = (
        gameStateContext: GameStateContextModel,
        betChoice: string,
        amount: number,
        enabledQuickBet: boolean,
        systemContext: SystemContextModel
    ) => {
        const criteriaValidateBet = getCriteriaValidateBet(
            gameStateContext,
            betChoice,
            amount,
            getAccountBalance(this.props.getPlayerBalance()),
            enabledQuickBet
        );

        if (criteriaValidateBet?.errorCode === NoticeErrorCode.validBet) {
            this.handleValidBetChoice(enabledQuickBet, amount, betChoice, gameStateContext, systemContext);

            return;
        }

        if (criteriaValidateBet?.errorCode === NoticeErrorCode.suggestBet) {
            this.suggestBetAmount(betChoice, criteriaValidateBet?.args as IAvailableSuggestBetAmount);

            return;
        }

        this.sendNotice(this.getNotice(criteriaValidateBet?.errorCode, betChoice, criteriaValidateBet?.args));
    };

    protected handleValidBetChoice = (
        enabledQuickBet: boolean,
        amount: number,
        betChoice: string,
        gameStateContext: GameStateContextModel,
        systemContext: SystemContextModel
    ) => {
        if (enabledQuickBet) {
            this.updateNotConfirmedBetState(gameStateContext, betChoice, systemContext);
            this.handleEnabledQuickBet(amount, betChoice);
        } else {
            if (betChoice === confirmBet) {
                this.sendConfirmBet(gameStateContext);

                return;
            }

            const enableSound = StorageHelper.get(localStorageKeys.enableSound) ?? true;
            enableSound && this.props.playPlaceBetSound();

            this.showConfirmBet(gameStateContext);
            this.updateNotConfirmedBetState(gameStateContext, betChoice, systemContext);
        }
    };

    suggestBetAmount = (betChoice: string, availableSuggestBet: IAvailableSuggestBetAmount) => {
        this.showConfirmDialog();
        const suggestBet: SuggestBet = {
            currentBetChoice: betChoice,
            suggestBetAmount: availableSuggestBet?.suggestAmount,
            sendOutstandingBet: () => this.sendOutstandingBet(betChoice, availableSuggestBet?.suggestAmount),
            isInsufficientFunds: availableSuggestBet?.isInsufficientFunds,
        };

        this.props.dispatch({ type: GameEventActionType.SUGGEST_BET, payload: { suggestBet } });
    };

    showConfirmDialog = () => {
        this.props.dispatch({
            type: GameEventActionType.SHOW_CONFIRM_DIALOG,
            payload: {
                showConfirmDialog: true,
            },
        });
    };

    sendOutstandingBet(betChoice: string, suggestAmount: number) {
        this.sendBetMessage(betChoice, suggestAmount);
    }

    showConfirmBet(gameStateContext: GameStateContextModel) {
        !gameStateContext.showConfirmBet &&
            this.props.dispatch({
                type: GameEventActionType.SHOW_CONFIRM_BET,
                payload: {
                    showConfirmBet: true,
                },
            });
    }

    updateNotConfirmedBetState(gameStateContext: GameStateContextModel, betChoice: string, systemContext: SystemContextModel) {
        const notConfirmOwnBets = gameStateContext.notConfirmOwnBets;
        notConfirmOwnBets[betChoice] = (notConfirmOwnBets[betChoice] ?? 0) + systemContext.selectedChip;
        this.props.dispatch({
            type: GameEventActionType.NOT_CONFIRM_OWN_BETS,
            payload: { notConfirmOwnBets },
        });
    }

    handleEnabledQuickBet(amount: number, betChoice: string) {
        if (amount > 0) {
            this.setRetryInterval();
            this.sendBetMessage(betChoice, amount);
        }
    }

    sendNotice = (notice: Notice) =>
        this.props.dispatch({
            type: GameEventActionType.DISPLAY_POPUP,
            payload: {
                notice,
            },
        });

    protected getNotice = (errorCode: string, betChoice?: string, args?: object): Notice => {
        let betChoice1 = "";
        let betChoice2 = "";
        const hedgeBetGroup = this.props.hedgeBetGroups.find((group) => group.includes(betChoice));
        if (betChoice && hedgeBetGroup) {
            betChoice1 = this.props.translate(getGlossaryTranslate(this.props.tolgeeNamespace, hedgeBetGroup[0]));
            betChoice2 = this.props.translate(getGlossaryTranslate(this.props.tolgeeNamespace, hedgeBetGroup[1]));
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

    sendConfirmBet(gameStateContext: GameStateContextModel) {
        const notConfirmOwnBets = gameStateContext.notConfirmOwnBets;
        const betChoices = {};
        Object.entries(notConfirmOwnBets).forEach(([key, value]) => {
            betChoices[key] = value;
        });

        this.props.gameMessageHandler.broadcastGameEvent({
            [messageEventType.SEND_SOCKET_MESSAGE_WITH_CLIENT_SEED]: { event: "bet", data: { betChoices } },
        });
    }

    protected sendBetMessage(betChoice: string, amount: number) {
        const { dispatch, gameMessageHandler } = this.props;
        dispatch({
            type: GameEventActionType.BET_PROCESSING,
            payload: { notice: null },
        });

        gameMessageHandler.broadcastGameEvent({
            [messageEventType.SEND_SOCKET_MESSAGE_WITH_CLIENT_SEED]: {
                event: "bet",
                data: { betChoices: { [betChoice.toLowerCase()]: amount } },
            },
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
