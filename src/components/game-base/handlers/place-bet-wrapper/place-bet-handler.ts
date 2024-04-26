import { DefaultParamType, TFnType, TranslationKey } from "@tolgee/react";
import { v4 as uuidv4 } from "uuid";
import { NoticeErrorCode } from "../../../../_shared/constants/error-code-dictionary";
import { getGlossaryTranslate, GetLocalizedErrorMessage, localStorageKeys, StorageHelper } from "../../../../_shared/helpers";
import { isInPhasePreventBet } from "../../../../_shared/helpers/validate-bet-helper";
import { SystemContextModel } from "../../../../_shared/react-contexts";
import { GameStateContextModel } from "../../../../_shared/react-contexts/game-state-context/game-state-context-model";
import { NoticeModel, RoundState } from "../../type";
import { GameMessageHandler, messageEventType } from "..";
import { getAppSettings } from "../../../../_shared/app-settings";
import { PlaceBetEventActionType } from "../../../../_shared/react-contexts/game-state-context/place-bet-context/place-bet-action";
import { PlaceBetContextModel } from "../../../../_shared/react-contexts/game-state-context/place-bet-context/place-bet-context-model";
import { GlobalMessageTransmitter } from "../../../../_shared/helpers/message-transmitter/global-transmitter";

export type PlaceBetHandlerProps = {
    tolgeeNamespace: string;
    gameName: string;
    gameMessageHandler: GameMessageHandler;
    translate: TFnType<DefaultParamType, string, TranslationKey>;
    playPlaceBetSound?: Function;
    hedgeBetGroups: string[][];
    getPlayerBalance: Function;
    gameId: number;
    signOut?: Function;
};

export class PlaceBetHandler {
    private retryInterval: NodeJS.Timeout;

    private placeBetDispatch: Function;

    constructor(public readonly props: PlaceBetHandlerProps) { }

    setPlaceBetDispatch = (dispatch) => {
        this.placeBetDispatch = dispatch;
    }

    getPlaceBetDispatch = () => {
        return this.placeBetDispatch;
    }

    registerEvents = (signOut: () => void, gameStateContext: PlaceBetContextModel) => {
        this.props.gameMessageHandler.register(messageEventType.END_BET, (gameMessage) => {
            this.handleEndBet(gameMessage, signOut, gameStateContext);
        });

        this.props.gameMessageHandler.register(messageEventType.OWN_BETS, this.handleOwnBets);
    };

    unRegisterEvents =()=>{
        this.props.gameMessageHandler.removeHandler(messageEventType.END_BET);
        this.props.gameMessageHandler.removeHandler(messageEventType.OWN_BETS);
    }

    broadcastNotice =(notice: object)=>{
        GlobalMessageTransmitter.broadcast({ notice });
    }

    clearNotice = () =>{
        this.broadcastNotice(null);
    }

    handleOwnBets = ({ ownBets }) => {
        this.placeBetDispatch({
            type: PlaceBetEventActionType.OWN_BETS,
            payload: { ownBets },
        });
        console.log(`broadcastGameEvent SYNC_OWN_BETS_TO_PF : ${JSON.stringify(ownBets)}`);
        this.props.gameMessageHandler.broadcastGameEvent({ [messageEventType.SYNC_OWN_BETS_TO_PF]: ownBets }); 
    };

    handleBetFailed = ({ notice, kickedOut }, signOut: () => void) => {
        const isDisabledAccount = kickedOut?.isDisabledAccount;
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

        GlobalMessageTransmitter.broadcast({ notice: noticePayload });
    };

    getNoticePayloadBetFailed = (notice: NoticeModel, kickedOut: any) => {
        const errorCode = kickedOut?.isDisabledAccount ? kickedOut.errorCode : notice.errorCode;

        const hedgeBetGroup = notice?.hedgeBetGroup;
        const betChoice = hedgeBetGroup ? hedgeBetGroup[0] : undefined;

        return this.getNotice(errorCode, betChoice, notice);
    };

    handleEndBet = ({ endBet, ownBets, notice, kickedOut, apiError }, signOut: () => void, gameStateContext: PlaceBetContextModel) => {
        const { playPlaceBetSound, gameMessageHandler } = this.props;
        const enableSound = StorageHelper.get(localStorageKeys.enableSound) ?? true;
        this.placeBetDispatch({ type: PlaceBetEventActionType.END_BET_PROCESSING, payload: {} });
        this.clearNotice();

        this.clearRetryInterval();

        if (endBet === -1) {
            !apiError && this.handleBetFailed({ notice, kickedOut }, signOut);
        } else {
            this.playAcceptedBetAnimation(endBet, gameStateContext);
            enableSound && playPlaceBetSound();
            this.placeBetDispatch({
                type: PlaceBetEventActionType.OWN_BETS,
                payload: { ownBets },
            });
            gameMessageHandler.broadcastGameEvent({ [messageEventType.UPDATE_PLAYER_BALANCE]: {} });
        }
    };

    playAcceptedBetAnimation = (amount: number, gameStateContext: PlaceBetContextModel) => {
        const { acceptedBetQueue } = gameStateContext;
        const key = uuidv4();
        acceptedBetQueue[key] = { amount };

        this.placeBetDispatch({
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
        this.placeBetDispatch({
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
        this.placeBetDispatch({ type: PlaceBetEventActionType.BET_PROCESSING, payload: {} });
        this.broadcastNotice({ message: "Common.message_processing_action", duration: 2 } );
    };

    handlePreventBet = (gameStateContext: GameStateContextModel) => {
        const isStartingRound = gameStateContext.roundState === RoundState.BeforePlaceBet;
        const { gameId } = this.props;
        const gameSettings = Object.values(getAppSettings().gameSettings)?.find((setting) => setting.id === +gameId);
        const totalTurns = gameSettings?.totalTurns;
        const notice = isStartingRound
            ? this.getNotice(NoticeErrorCode.cannotBet)
            : this.getNotice(totalTurns > 1 ? NoticeErrorCode.placeBetNextDraw : NoticeErrorCode.placeBetNextRound);

        this.broadcastNotice(notice);
    };

    handleEnabledQuickBet(amount: number, betChoice: string) {
        if (amount > 0) {
            this.setRetryInterval();
            this.sendBetMessage(betChoice, amount);
        }
    }

    protected getNotice = (errorCode: string, betChoice?: string, args?: object): NoticeModel => {
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
        this.props.gameMessageHandler.broadcastGameEvent({
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
