import { DefaultParamType, TFnType, TranslationKey } from "@tolgee/react";
import { v4 as uuidv4 } from "uuid";

import { NoticeErrorCode } from "../../../_shared/constants/error-code-dictionary";
import { getGlossaryTranslate, GetLocalizedErrorMessage, localStorageKeys, StorageHelper } from "../../../_shared/helpers";
import {
    isInPhasePreventBet,
} from "../../../_shared/helpers/validate-bet-helper";
import { SystemContextModel } from "../../../_shared/react-contexts";
import { GameEventActionType } from "../../../_shared/react-contexts/game-state-context/game-event-action";
import { GameStateContextModel } from "../../../_shared/react-contexts/game-state-context/game-state-context-model";
import { Notice, RoundState } from "../type";
import { GameMessageHandler, messageEventType } from "./";
import { getAppSettings } from "../../../_shared/app-settings";
import { PlaceBetEventActionType } from "../../../_shared/react-contexts/game-state-context/place-bet-context/place-bet-action";
import { PlaceBetContextModel } from "../../../_shared/react-contexts/game-state-context/place-bet-context/place-bet-context-model";

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
    signOut?:Function;
    renderBettingBlock?: Function;
};

export class PlaceBetHandler {
    private retryInterval: NodeJS.Timeout;

    private placeBetDispatchTmp: Function;

    constructor(public readonly props: PlaceBetHandlerProps) {}

    setPlaceBetDispatchTmp =(placeBetDispatchTmp) =>{
        this.placeBetDispatchTmp = placeBetDispatchTmp;
    }

    registerEvents = (signOut: () => void, gameStateContext: PlaceBetContextModel) => {
        this.props.gameMessageHandler.register(messageEventType.END_BET, (gameMessage) => {
            this.handleEndBet(gameMessage, signOut, gameStateContext);
        });
        this.props.gameMessageHandler.register(messageEventType.OWN_BETS, this.handleOwnBets);
    };


    handleOwnBets = ({ ownBets }) => {
        this.placeBetDispatchTmp({
            type: PlaceBetEventActionType.OWN_BETS,
            payload: {
                ownBets,
            },
        });
    };

    handleBetFailed = ({ notice, kickedOut }, signOut: () => void) => {
        const { dispatch } = this.props;
        const isDisabledAccount = kickedOut?.isDisabledAccount;
        // dispatch({
        //     type: GameEventActionType.DISPLAY_POPUP,
        //     payload: {
        //         notice: null,
        //     },
        // });

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

        // dispatch({ type: GameEventActionType.DISPLAY_POPUP, payload: { notice: noticePayload } });
    };

    getNoticePayloadBetFailed = (notice: Notice, kickedOut: any) => {
        const errorCode = kickedOut?.isDisabledAccount ? kickedOut.errorCode : notice.errorCode;

        const hedgeBetGroup = notice?.hedgeBetGroup;
        const betChoice = hedgeBetGroup ? hedgeBetGroup[0] : undefined;

        return this.getNotice(errorCode, betChoice, notice);
    };

    handleEndBet = ({ endBet, ownBets, notice, kickedOut, apiError }, signOut: () => void, gameStateContext: PlaceBetContextModel) => {
        const { playPlaceBetSound, dispatch, gameMessageHandler } = this.props;
        const enableSound = StorageHelper.get(localStorageKeys.enableSound) ?? true;
        this.placeBetDispatchTmp({ type: PlaceBetEventActionType.END_BET_PROCESSING, payload: {} });
        this.clearRetryInterval();
        // dispatch({
        //     type: GameEventActionType.DISPLAY_POPUP,
        //     payload: { notice: null },
        // });

        if (endBet === -1) {
            !apiError && this.handleBetFailed({ notice, kickedOut }, signOut);
        } else {
            this.playAcceptedBetAnimation(endBet, gameStateContext);
            enableSound && playPlaceBetSound();
            this.placeBetDispatchTmp({
                type: PlaceBetEventActionType.OWN_BETS,
                payload: { ownBets },
            });
            gameMessageHandler.broadcastGameEvent({ [messageEventType.UPDATE_PLAYER_BALANCE]: {} });
        }
    };

    playAcceptedBetAnimation = (amount: number, gameStateContext: PlaceBetContextModel) => {
        const { acceptedBetQueue } = gameStateContext;
        const key = uuidv4();
        acceptedBetQueue[key] = {
            amount,
        };

        this.placeBetDispatchTmp({
            type: PlaceBetEventActionType.ACCEPTED_BET_QUEUE,
            payload: { acceptedBetQueue: { ...acceptedBetQueue } },
        });

        const animationTime = 3000;
        setTimeout(() => {
            this.removeAcceptedBetQueue(key, gameStateContext);
        }, animationTime);
    };

    removeAcceptedBetQueue = (key: number, gameStateContext: PlaceBetContextModel) => {
        const { acceptedBetQueue } = gameStateContext;
        delete acceptedBetQueue[key];
        this.placeBetDispatchTmp({
            type: PlaceBetEventActionType.ACCEPTED_BET_QUEUE,
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

        if (enabledQuickBet) {
            this.handleEnabledQuickBet(amount, betChoice);
        } 
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

    handleEnabledQuickBet(amount: number, betChoice: string) {
        if (amount > 0) {
            this.setRetryInterval();
            this.sendBetMessage(betChoice, amount);
        }
    }

    sendNotice = (notice: Notice) =>{
        // this.props.dispatch({
        //     type: GameEventActionType.DISPLAY_POPUP,
        //     payload: {
        //         notice,
        //     },
        // });
    }

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
    protected sendBetMessage(betChoice: string, amount: number) {
        const { gameMessageHandler } = this.props;
        this.placeBetDispatchTmp({
            type: PlaceBetEventActionType.BET_PROCESSING,
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
