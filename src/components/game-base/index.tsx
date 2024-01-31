import React from "react";
import { isMobileOnly } from "react-device-detect";
import Auth from "sc-user-service-client/dist/auth";
import { io, Socket } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
import MsgpackParser from "socket.io-msgpack-parser";
import { getAppSettings } from "../../_shared/app-settings";
import { LanguageLocaleMapper } from "../../_shared/constants";
import * as LocalStorageManager from "../../_shared/local-storage";
import { CommonResourceKeys, GameResourceKeys } from "../../_shared/resources";
import { AuthContext } from "../../_shared/contexts/auth";
import { GameActionsContextProvider } from "../../_shared/contexts/game-actions-context";
import { GameContextProvider } from "../../_shared/contexts/game-context/game-context";
import { GetLocalizedErrorMessage } from "../../_shared/helpers/notice-helper";
import CountdownTimer from "../game-components/countdown-timer/countdown-timer";
import GameContainer from "../game-components/game-container";
import ScoreboardRoundHistory from "../game-components/round-history/scoreboard";
import WinningBet from "../game-components/animations/winning-bet";
import BaseDialog from "../game-components/base-dialog";
import { ModalType } from "../game-components/base-dialog/type";
import BaseResult from "../game-components/base-result";
import BetContainer from "../game-components/bet-container";
import DisabledModal from "../game-components/disabled-modal";
import { ConnectFailedMessage, ErrorMessage } from "../game-components/error-message";
import { ConnectFailedReasonKey } from "../game-components/error-message/type";
import GameHeader from "../game-components/game-header";
import GameLoading from "../game-components/game-loading";
import { Notice } from "../game-components/notice";
import OverlayMaskWhite from "../game-components/overlay-mask-white";
import PlaceBetModal from "../game-components/place-bet-modal/place-bet-modal";
import Rebet from "../game-components/rebet";
import ResultDetail from "../game-components/result-detail";
import SectionResultContainer from "../game-components/section-result-container";
import Styles from "./game-base.module.scss";
import MessageTransmitter from "../../_shared/helpers/message-transmitter";
import { MessageTransmitterType } from "../../_shared/helpers/message-transmitter/type";
import {
    Boundary,
    GameBaseProps,
    GameBaseState,
    GameState,
    PopupType,
    Position,
    RebetStorageModel,
    ViewMode,
    WinStreakCollectorModel,
} from "./type";
import { buildServerUrl } from "../../_shared/helpers/url-helper";

const { rebet: reBetStorageKey } = LocalStorageManager.localStorageKeys;

abstract class GameBase<P extends GameBaseProps, S extends GameBaseState<any, any>> extends React.PureComponent<P, S> {
    private readonly animationTime = 3000;
    private readonly gameBaseContainerRef = React.createRef<HTMLDivElement>();
    protected betWin: number;
    protected isUMInFirstLoad = false;
    protected showResultInfoTimeout: NodeJS.Timeout;
    protected showWinningAnimationTimeout: NodeJS.Timeout;
    protected isProcessingBet = false;
    private winStreakCollector: WinStreakCollectorModel;
    private retryInterval: NodeJS.Timeout;
    protected betPosition: Position;
    protected betOptionBoundary: Boundary;
    protected socket: Socket;
    protected interval: NodeJS.Timeout;
    protected timeCounter: number;
    protected reBetStorageKey: string;
    protected messageTransmitter: MessageTransmitterType;
    protected authService: Auth;
    private isConnectFailed = false;
    private playPermissionListener: string;
    private userStakeLevelListener: string;
    private disconnectTimeout: NodeJS.Timeout;

    private readonly defaultGameConfig = { odds: {}, minBet: 0, maxBet: 0, maxBetPerChoices: {}, enableFreeBet: false, boostedChoices: [] };
    protected readonly defaultState = {
        signedIn: false,
        gameState: GameState.None,
        remainingTime: 0,
        gameConfigs: { ...this.defaultGameConfig },
        roundHistory: [],
        roundId: 0,
        ownBets: {},
        totalBets: {},
        displayPopup: null,
        betPercentage: {},
        viewMode: this.props.viewMode,
        showResultInfo: false,
        acceptedBetQueue: {},
        showWinningAnimation: false,
        playResultAnimation: false,
        isShowBlink: false,
        notice: null,
        removeBetChoiceFocus: null,
        betOptionElement: null,
        betChoiceElement: null,
        activeScoreboardTab: 0,
        md5: "",
        md5ResultKey: "",
        rate: 1,
        disconnectReason: "",
    };

    constructor(props: P) {
        super(props);

        this.messageTransmitter = MessageTransmitter();
        this.initWinStreakCollector();

        this.closePopup = this.closePopup.bind(this);
        this.openPopup = this.openPopup.bind(this);
        this.placeBet = this.placeBet.bind(this);
        this.openPlaceBetModal = this.openPlaceBetModal.bind(this);
        this.updateViewMode = this.updateViewMode.bind(this);
        this.playAcceptedBetAnimation = this.playAcceptedBetAnimation.bind(this);
        this.closeNotice = this.closeNotice.bind(this);
        this.renderSettlementInfo = this.renderSettlementInfo.bind(this);
        this.updateUserBalance = this.updateUserBalance.bind(this);
        this.setActiveScoreboardTab = this.setActiveScoreboardTab.bind(this);
        this.copyToClipboard = this.copyToClipboard.bind(this);
    }

    componentDidMount() {
        this.registerMessageHandler();
        document.addEventListener("visibilitychange", this.onVisibilityChange);
        this.onStart();
    }

    componentWillUnmount() {
        this.onDestroy();
        this.messageTransmitter.clearAllListener();
        document.removeEventListener("visibilitychange", this.onVisibilityChange);
    }

    onDestroy() {
        this.setState({ gameState: GameState.None, signedIn: false });
        this.props.unsubscribeGlobalMessageEvent(this.playPermissionListener);
        this.props.unsubscribeGlobalMessageEvent(this.userStakeLevelListener);
        this.interval && clearInterval(this.interval);
        this.showResultInfoTimeout && clearTimeout(this.showResultInfoTimeout);
        this.showWinningAnimationTimeout && clearTimeout(this.showWinningAnimationTimeout);
        this.clearRetryInterval();
        this.clearDisconnectTimeout();
    }

    onStart() {
        const { registerGlobalMessageEvent } = this.props;

        this.isConnectFailed = false;
        this.isProcessingBet = false;
        this.initWinStreakCollector();
        this.playPermissionListener = registerGlobalMessageEvent("notPermittedToPlay", this.handleRestrictPermission.bind(this));
        this.userStakeLevelListener = registerGlobalMessageEvent("userStakeLevel", ({ userStakeLevel }) =>
            this.props.updateUserStakeLevel(userStakeLevel)
        );
        this.clearDisconnectTimeout();
        this.socket = this.initSocket();
        this.socket && this.socket.off(this.props.gameName).on(this.props.gameName, this.messageTransmitter.broadcast.bind(this));
    }

    protected initSocket() {
        const { socketInfo } = this.props;
        const { session } = this.context as any;
        const { proxy, enableMsgpackParser } = getAppSettings();
        const socketUri = buildServerUrl(socketInfo.namespace);
        const socket = io(socketUri, {
            transports: ["websocket"],
            upgrade: false,
            path: `${proxy.path}/${socketInfo.path}/socket.io`,
            parser: enableMsgpackParser ? MsgpackParser : undefined,
        });

        socket.on("connect", () => {
            this.clearDisconnectTimeout();
            document.visibilityState !== "hidden" && socket.emit("signin", session);
        });
        socket.on("signedIn", () => {
            this.clearDisconnectTimeout();
            this.setState({ signedIn: true });
            this.socket.emit("inGame");
        });
        socket.on("connect_error", this.onConnectFailed.bind(this));
        socket.on("disconnect", () => {
            this.setState({ gameState: GameState.None, disconnectReason: ConnectFailedReasonKey.lostConnection });
        });

        return socket;
    }

    onVisibilityChange = () => {
        const visibleState = document.visibilityState;
        visibleState === "hidden" ? this.onDestroy() : this.onStart();
    };

    onConnectFailed() {
        this.onDestroy();
        this.setState({ gameState: GameState.ConnectFailed, signedIn: false, disconnectReason: ConnectFailedReasonKey.lostConnection });
    }

    registerMessageHandler() {
        this.messageTransmitter.register("signedIn", this.handleSignedIn.bind(this));
        this.messageTransmitter.register("um", this.handleUM.bind(this));
        this.messageTransmitter.register("remainingTime", this.handleRemainingTime.bind(this));
        this.messageTransmitter.register("gameConfigs", this.handleGameConfigs.bind(this));
        this.messageTransmitter.register("roundHistory", this.handleRoundHistory.bind(this));
        this.messageTransmitter.register("finish", this.handleFinish.bind(this));
        this.messageTransmitter.register("status", this.handleStatus.bind(this));
        this.messageTransmitter.register("user", this.handleUserData.bind(this));
        this.messageTransmitter.register("totalBets", this.handleTotalBet.bind(this));
        this.messageTransmitter.register("ownBets", this.handleOwnBets.bind(this));
        this.messageTransmitter.register("betPercentage", this.handlePercentageBets.bind(this));
        this.messageTransmitter.register("endBet", this.handleEndBet.bind(this));
        this.messageTransmitter.register("apiError", this.handleApiError.bind(this));
        this.messageTransmitter.register("errorCode", this.handleError.bind(this));
        this.messageTransmitter.register("md5", this.handleMD5.bind(this));
        this.messageTransmitter.register("userStakeLevel", this.handleUserStakeLevel.bind(this));
        this.messageTransmitter.register("resultHash", this.handleResultHash.bind(this));
        this.messageTransmitter.register("odds", this.handleOdds.bind(this));
    }

    handleOdds({ odds }) {
        const { values, boostedChoices } = odds;
        const { gameConfigs } = this.state;
        const { minBet, maxBet, maxBetPerChoices, enableFreeBet } = gameConfigs;
        const newGameConfigs = {
            odds: values,
            minBet: minBet,
            maxBet: maxBet,
            maxBetPerChoices: maxBetPerChoices,
            enableFreeBet: enableFreeBet,
            boostedChoices: boostedChoices,
        };

        this.setState({
            gameConfigs: { ...newGameConfigs },
        });
    }

    handleError = ({ errorCode }) => {
        if (errorCode === "SB0010" && document.visibilityState !== "hidden") {
            const time = this.state.signedIn ? 1000 : 5000;
            this.disconnectTimeout = setTimeout(() => {
                this.isConnectFailed = true;
                this.setState({
                    gameState: GameState.ConnectFailed,
                    signedIn: false,
                    disconnectReason: ConnectFailedReasonKey.lostConnection,
                });
            }, time);
        }
    };

    protected handleSignedIn({ signedIn }) {
        if (signedIn) {
            this.clearDisconnectTimeout();
            this.setState({ signedIn: true });
            this.socket.emit("inGame", this.props.gameName);
        }
    }

    handleUserStakeLevel({ userStakeLevel }) {
        this.props.updateUserStakeLevel(userStakeLevel);

        this.setState({ notice: { message: this.props.t(`common:${CommonResourceKeys.USER_STAKE_LEVEL_UPDATE}`), duration: 2 } });
    }

    protected handleStatus = ({ status }) => {
        const { win, bet } = status;
        if (win) {
            this.betWin = bet;
        }
    };

    get winningAnimationWaitingTimeInSecond() {
        return this.props.durations.showResult * 1000;
    }

    get defaultResult() {
        return null;
    }

    get defaultSettlementResult() {
        return null;
    }

    handleApiError = ({ apiError }) => {
        const isPlaceBet = apiError.isPlaceBetFailed ? apiError.isPlaceBetFailed : false;
        const errorCode = apiError.errorCode;
        this.handleKickOut(errorCode.toString());

        const message = GetLocalizedErrorMessage(errorCode, isPlaceBet);
        const gameName = this.props.t(`${this.props.gameName.toLowerCase()}:${GameResourceKeys.GAME_NAME}`);

        const { displayPopup } = this.state;
        displayPopup !== PopupType.Rebet &&
            this.setState({
                notice: {
                    gameName: gameName,
                    roundId: apiError?.gameRoundId,
                    message: message,
                    duration: 3,
                    minBet: apiError?.minBet,
                    maxBet: apiError?.maxBet,
                    errorCode: errorCode,
                },
            });
    };

    handleKickOut(errorCode: string) {
        (errorCode === "1001" || errorCode === "1002") &&
            setTimeout(() => {
                // this.context.signOut();
            }, 10000);
    }

    handleBetFailed = ({ notice, kickedOut }) => {
        const { displayPopup } = this.state;
        const { i18n } = this.props;
        displayPopup !== PopupType.Rebet && this.setState({ notice: null });
        const gameName = this.props.t(`${this.props.gameName.toLowerCase()}:${GameResourceKeys.GAME_NAME}`);
        if (kickedOut?.isDisabledAccount) {
            this.setState({
                notice: {
                    gameName: gameName,
                    message: GetLocalizedErrorMessage(kickedOut.errorCode),
                    duration: 2,
                    errorCode: kickedOut.errorCode,
                    roundId: kickedOut?.gameRoundId,
                },
            });

            const { router } = this.props;
            setTimeout(() => {
                router.push("/timeout", "/timeout", { locale: i18n.language });
            }, 10000);
        } else {
            const isPlaceBet = notice.isPlaceBetFailed ? notice.isPlaceBetFailed : false;

            displayPopup !== PopupType.Rebet &&
                this.setState({
                    notice: {
                        gameName: gameName,
                        message: GetLocalizedErrorMessage(notice.errorCode, isPlaceBet),
                        duration: 2,
                        minBet: notice?.minBet,
                        maxBet: notice?.maxBet,
                        errorCode: notice.errorCode,
                        roundId: notice?.gameRoundId,
                        betChoice1: notice?.hedgeBetGroup ? this.getChoiceNameOnHedgeBetMessage(notice.hedgeBetGroup[0]) : "",
                        betChoice2: notice?.hedgeBetGroup ? this.getChoiceNameOnHedgeBetMessage(notice.hedgeBetGroup[1]) : "",
                    },
                });
        }
    };

    handleEndBet = ({ endBet, betChoice, notice, kickedOut, apiError }) => {
        const { playPlaceBetSound } = this.props;
        const { displayPopup, ownBets } = this.state;
        this.isProcessingBet = false;
        this.clearRetryInterval();
        this.setState({ notice: null });

        if (endBet === -1) {
            !apiError && this.handleBetFailed({ notice, kickedOut });
        } else {
            displayPopup !== PopupType.Rebet && this.playAcceptedBetAnimation(endBet, this.betPosition);
            playPlaceBetSound();
            ownBets[betChoice] = ownBets[betChoice] ? ownBets[betChoice] + endBet : endBet;
            this.setState({ ownBets: { ...ownBets } });
            this.updateUserBalance();
        }
    };

    playAcceptedBetAnimation(amount: number, betPosition?: Position) {
        const { acceptedBetQueue } = this.state;
        const key = uuidv4();
        acceptedBetQueue[key] = {
            amount,
            betPosition: betPosition ? { ...betPosition } : null,
            betOptionBoundary: this.betOptionBoundary,
        };

        this.setState({ acceptedBetQueue: { ...acceptedBetQueue } });
        setTimeout(() => {
            this.removeAcceptedBetQueue(key);
        }, this.animationTime);
    }

    removeAcceptedBetQueue(key: number) {
        const { acceptedBetQueue } = this.state;
        delete acceptedBetQueue[key];
        this.setState({ acceptedBetQueue });
    }

    handleTotalBet = ({ totalBets }) => {
        this.setState({ totalBets });
    };

    handleOwnBets = ({ ownBets, gameConfigs }) => {
        gameConfigs && this.setState({ ownBets });
    };

    handlePercentageBets = ({ betPercentage }) => {
        this.setState({ betPercentage });
    };

    handleUserData({ user, gameConfigs }) {
        //this.context.setBalance(user.red);
        gameConfigs && this.setState({ rate: user.rate });
    }

    handleRestrictPermission({ notPermittedToPlay, gameId, userStakeLevel }) {
        if (notPermittedToPlay && gameId === this.props.id) {
            this.onDestroy();
            this.setState({
                gameState: GameState.ConnectFailed,
                disconnectReason: ConnectFailedReasonKey.restrictPlayPermission,
            });
        }
        if (userStakeLevel) {
            this.props.updateUserStakeLevel(userStakeLevel);
        }
    }

    handleUM({ um, um_message, remainingTime }) {
        const { durations, i18n } = this.props;
        if (um && remainingTime && remainingTime + 1 === durations.wholeRound) {
            this.isUMInFirstLoad = true;
        } else {
            this.isUMInFirstLoad = false;
        }

        if (
            um &&
            (this.timeCounter <= durations.placingBets + durations.beforeStartRound + 1 || remainingTime + 1 === durations.wholeRound)
        ) {
            this.interval && clearInterval(this.interval);
            this.showResultInfoTimeout && clearTimeout(this.showResultInfoTimeout);
            this.showWinningAnimationTimeout && clearTimeout(this.showWinningAnimationTimeout);
            this.setState({
                gameState: GameState.Disabled,
                disabledMessage: um_message[LanguageLocaleMapper[i18n.language]],
                showResultInfo: false,
            });
        }
    }

    handleRemainingTime({ remainingTime }) {
        const { gameState } = this.state;

        if (gameState === GameState.None || !this.isUMInFirstLoad) {
            this.runGame(remainingTime);
        }
    }

    runGame(remainingTime: number) {
        this.timeCounter = remainingTime;

        this.interval && clearInterval(this.interval);
        this.interval = setInterval(() => {
            if (this.timeCounter > 0) {
                this.timeCounter = this.timeCounter - 1;
            }
            this.handleGamePlay(this.timeCounter);
        }, 1000);

        this.handleGamePlay(remainingTime);
    }

    handleGamePlay(remainingTime: number) {
        const newGameState = this.determineGameState(remainingTime);

        if (this.state.gameState !== newGameState && !this.isConnectFailed) {
            const newState = {
                gameState: newGameState,
                ...this.getStateByNextGameState(newGameState),
            };

            this.setState(newState);
        }
    }

    getStateByNextGameState(nextGameState: any): any {
        const { roundId, displayPopup, notice, removeBetChoiceFocus, result, settlementResult } = this.state;
        const { durations } = this.props;
        const timeCounter = this.getTimeCounter(this.timeCounter, nextGameState);

        if (nextGameState === GameState.InRound) {
            this.betWin = 0;
        }

        if (nextGameState === GameState.LockingBet) {
            removeBetChoiceFocus && removeBetChoiceFocus();
        }

        const newStateDetector = [
            {
                condition: [GameState.BeforeStartRound, GameState.InRound].includes(nextGameState),
                state: {
                    ownBets: {},
                    totalBets: {},
                    showWinningAnimation: false,
                    isShowBlink: false,
                    playResultAnimation: false,
                    showResultInfo: false,
                    betPercentage: {},
                    showMD5ResultKey: false,
                },
            },
            {
                condition: durations.beforeStartRound ? nextGameState === GameState.BeforeStartRound : nextGameState === GameState.InRound,
                state: {
                    roundId: roundId + 1,
                },
            },
            {
                condition: nextGameState === GameState.LockingBet,
                state: {
                    isShowBlink: true,
                    displayPopup: [PopupType.Rebet, PopupType.PlaceBet].includes(displayPopup) ? null : displayPopup,
                    notice: [PopupType.Rebet, PopupType.PlaceBet].includes(displayPopup) ? null : notice,
                    result: this.defaultResult ?? result,
                    settlementResult: this.defaultSettlementResult ?? settlementResult,
                },
            },
        ];

        return newStateDetector.reduce(
            (newState, stateDetector) => {
                if (stateDetector.condition) {
                    newState = Object.assign(newState, stateDetector.state);
                }

                return newState;
            },
            { remainingTime: timeCounter }
        );
    }

    async updateUserBalance() {
        // const balanceResponse = await getBalance(this.context.session);
        // if (balanceResponse.isSuccessful) {
        //     this.context.setBalance(balanceResponse.balance);
        // } else {
        //     this.props.setApiErrorMessage(balanceResponse.errorCode);
        // }
    }

    handleGameConfigs({ gameConfigs }) {
        this.setState({ gameConfigs });
    }

    determineGameState(remainingTime: number): any {
        const { durations } = this.props;
        if (durations.balancingBet && remainingTime > durations.wholeRound - durations.balancingBet) {
            return GameState.BalancingBet;
        }

        if (remainingTime >= durations.wholeRound - durations.showResult - (durations.balancingBet ?? 0)) {
            return GameState.DisplayResult;
        }

        if (durations.beforeStartRound && remainingTime > durations.placingBets) {
            return GameState.BeforeStartRound;
        }

        if (remainingTime <= durations.placingBets && remainingTime > durations.lockingBet) {
            return GameState.InRound;
        }

        if (remainingTime <= durations.lockingBet && remainingTime >= 0) {
            return GameState.LockingBet;
        }

        return GameState.None;
    }

    getTimeCounter(remainingTime: number, gameState: GameState) {
        const { durations } = this.props;

        switch (gameState) {
            case GameState.InRound:
            case GameState.LockingBet:
                return remainingTime;
            case GameState.BeforeStartRound:
                return durations.beforeStartRound;
            default:
                return 0;
        }
    }

    handleRoundHistory({ roundHistory, roundId }) {
        const { gameState } = this.state;

        this.setState({
            roundHistory: roundHistory,
            roundId: [GameState.DisplayResult, GameState.BalancingBet].includes(gameState) || this.isUMInFirstLoad ? roundId - 1 : roundId,
            result: gameState === GameState.LockingBet ? this.defaultResult : roundHistory[0]?.result,
            settlementResult: gameState === GameState.LockingBet ? this.defaultSettlementResult : roundHistory[0]?.settlementResult,
            playResultAnimation: [GameState.DisplayResult].includes(gameState) || this.isUMInFirstLoad ? false : true,
            showResultInfo: [GameState.DisplayResult].includes(gameState) || this.isUMInFirstLoad ? true : false,
        });

        this.setWinStreakByRoundHistory(roundHistory);
    }

    getFinishAnimationDuration() {
        const { durations } = this.props;
        return (durations.resultAnimation + (durations.balancingBet ?? 0)) * 1000;
    }

    handleFinish({ finish }) {
        const { roundHistory } = this.state;
        const { durations } = this.props;
        const roundHistoryClone = [...roundHistory];

        this.isProcessingBet = false;
        this.clearRetryInterval();
        this.storeOwnBet(finish.roundId);
        roundHistoryClone.unshift(finish);
        roundHistoryClone.length > 100 && roundHistoryClone.pop();

        this.setState({
            playResultAnimation: true,
            result: finish.result,
            settlementResult: finish.settlementResult,
            roundId: finish.roundId,
        });
        finish.resultKey && this.setState({ md5ResultKey: finish.resultKey });

        const animationDuration = this.getFinishAnimationDuration();

        this.showResultInfoTimeout = setTimeout(() => {
            this.setState({
                showResultInfo: true,
                isShowBlink: false,
                roundHistory: roundHistoryClone,
                playResultAnimation: false,
                showMD5ResultKey: true,
            });
            this.notifyWinStreakByLatestSettlementResult(finish.settlementResult);
        }, animationDuration);

        this.showWinningAnimationTimeout = setTimeout(() => {
            this.setState({
                showWinningAnimation: true,
            });
            this.betWin > 0 && this.updateUserBalance();
        }, this.winningAnimationWaitingTimeInSecond);

        this.runGame(durations.wholeRound);
    }

    storeOwnBet(roundId: number) {
        const { ownBets } = this.state;
        const gameId = this.props.id;
        const rebetStorage = LocalStorageManager.getLocalStorageItem<RebetStorageModel>(reBetStorageKey) || {};

        rebetStorage[gameId] = {
            roundId,
            betInfo: Object.keys(ownBets).length > 0 ? ownBets : undefined,
        };

        LocalStorageManager.storeLocalStorageItem(reBetStorageKey, rebetStorage);
    }

    openPlaceBetModal(betChoice: string, removeBetChoiceFocus: Function, betOptionElement: HTMLElement, betChoiceElement: HTMLElement) {
        this.setState({
            displayPopup: PopupType.PlaceBet,
            selectedBetChoice: betChoice,
            removeBetChoiceFocus,
            betOptionElement,
            betChoiceElement,
        });
    }

    placeBet(betChoice: string, amount: number, betPosition?: Position, betOptionBoundary?: Boundary) {
        const { displayPopup } = this.state;

        if (this.isProcessingBet && displayPopup !== PopupType.Rebet) {
            this.setState({ notice: { message: this.props.t("messages:betProcessing"), duration: 2 } });
        } else {
            if (amount > 0) {
                this.betPosition = betPosition;
                this.betOptionBoundary = betOptionBoundary;
                this.isProcessingBet = true;
                this.setRetryInterval();
                this.sendBetMessage(betChoice, amount);
            }
        }
    }

    protected sendBetMessage(betChoice: string, amount: number) {
        this.socket.emit("bet", { betChoice, amount });
    }

    setRetryInterval() {
        this.clearRetryInterval();

        this.retryInterval = setInterval(() => {
            this.socket.emit("retry");
        }, 3 * 1000);
    }

    clearRetryInterval() {
        this.retryInterval && clearInterval(this.retryInterval);
    }

    clearDisconnectTimeout() {
        this.disconnectTimeout && clearTimeout(this.disconnectTimeout);
    }

    openPopup(popupType: PopupType) {
        this.setState({ displayPopup: popupType });
    }

    updateViewMode(mode: ViewMode) {
        this.setState({ viewMode: mode });
    }

    renderErrorMessage() {
        return (
            <BaseDialog type={ModalType.Center} isOpen={this.state.displayPopup === PopupType.Error} onCloseModal={this.closePopup}>
                <ErrorMessage message={this.state.errorMessage} closeModal={this.closePopup}></ErrorMessage>
            </BaseDialog>
        );
    }

    checkRenderRebet() {
        const { roundId } = this.state;
        const gameId = this.props.id;
        const rebetStorageKey = LocalStorageManager.localStorageKeys.rebet;
        const rebetStorage = LocalStorageManager.getLocalStorageItem<RebetStorageModel>(rebetStorageKey) || {};
        const rebetInfo = rebetStorage[gameId];

        return rebetInfo?.betInfo !== undefined && rebetInfo?.roundId + 1 === roundId ? true : false;
    }

    renderReBet() {
        const getBetContainerPosition = () => {
            const betContainerRef = this.gameBaseContainerRef;
            const domRect = betContainerRef.current?.getBoundingClientRect();
            return domRect?.y ?? 0;
        };

        return (
            <BaseDialog
                betContainerPosition={isMobileOnly ? getBetContainerPosition() : null}
                type={ModalType.Rebet}
                isOpen={this.state.displayPopup === PopupType.Rebet}
                onCloseModal={this.closePopup}
            >
                <Rebet getOddsByChoice={this.getOddsByChoice.bind(this)} gameId={this.props.id} onCloseModal={this.closePopup} />
            </BaseDialog>
        );
    }

    renderPlaceBet() {
        const { displayPopup, selectedBetChoice, roundId, removeBetChoiceFocus, betOptionElement, betChoiceElement } = this.state;
        const { gameName } = this.props;

        return (
            <PlaceBetModal
                isOpen={displayPopup === PopupType.PlaceBet}
                onCloseModal={this.closePopup}
                onPlaceBet={this.placeBet}
                gameBaseContainerRef={this.gameBaseContainerRef}
                betOptionElement={betOptionElement}
                betChoiceElement={betChoiceElement}
                removeBetChoiceFocus={removeBetChoiceFocus}
                betChoiceInfo={{
                    betChoice: selectedBetChoice,
                    gameName: gameName,
                    roundId: roundId,
                    odd: this.getOddsByChoice(selectedBetChoice),
                }}
            />
        );
    }

    setActiveScoreboardTab = (activeScoreboardTab: number) => {
        this.setState({ activeScoreboardTab });
    };

    updateStatusShowResult = () => {
        if (this.state.gameState === GameState.DisplayResult) {
            this.setState({ playResultAnimation: false });
            this.setState({ showResultInfo: true, showMD5ResultKey: true });
        }
    };

    abstract renderBetOptions(): React.ReactElement;

    abstract renderRoundHistory(): React.ReactElement;

    abstract renderStatistic(): React.ReactElement;

    abstract renderBoard(): React.ReactElement;

    abstract renderResult(): React.ReactElement;

    abstract renderResultCollapse(): React.ReactElement;

    abstract getMainOptions(): string[];

    abstract renderSettlementInfo(): JSX.Element;

    getChoiceNameOnHedgeBetMessage(choiceKey) {
        return this.getGameTranslate(choiceKey);
    }

    getGameTranslate(key: string) {
        const { t, gameName } = this.props;

        return t(`${gameName.toLocaleLowerCase()}:${key}`);
    }

    setWinStreakByRoundHistory(roundHistory) {
        const history = roundHistory.sort((a, b) => a.roundId < b.roundId);
        const mainOptions = this.getMainOptions();
        this.initWinStreakCollector();

        for (const round of history) {
            mainOptions.forEach((option) => {
                if (round.settlementResult[option] && !this.winStreakCollector[option].isStopStreak) {
                    this.winStreakCollector[option].streak += 1;
                } else {
                    this.winStreakCollector[option].isStopStreak = true;
                }
            });

            if (!mainOptions.some((option) => this.winStreakCollector[option].isStopStreak === false)) {
                break;
            }
        }
    }

    initWinStreakCollector() {
        const mainOptions = this.getMainOptions();

        this.winStreakCollector = mainOptions.reduce((result, option) => {
            result[option] = {
                streak: 0,
                isStopStreak: false,
            };

            return result;
        }, {});
    }

    getWinningStreakByOptions = ({ options }) => {
        return Math.max(...options.map((option) => this.winStreakCollector[option]?.streak ?? 0));
    };

    getOptionalWinStreakByOptions({ option }) {
        return "";
    }

    notifyWinStreakByLatestSettlementResult(settlementResult) {
        const { notifyWinStreak, gameName } = this.props;
        const mainOptions = this.getMainOptions();

        mainOptions.forEach((option) => {
            const winStreak = this.winStreakCollector[option];

            if (settlementResult[option]) {
                winStreak.streak += 1;

                if (winStreak.streak > 3) {
                    notifyWinStreak({
                        key: uuidv4(),
                        gameName: gameName,
                        choice: option,
                        streak: winStreak.streak,
                        optional: this.getOptionalWinStreakByOptions({ option }),
                    });
                }
            } else {
                winStreak.streak = 0;
            }
        });
    }

    getOddsByChoice(choice: string) {
        const { gameConfigs } = this.state;
        const odds = gameConfigs.odds;

        return odds[choice];
    }

    renderStartRoundAnimation() {
        return null;
    }

    renderPopup(popupType: PopupType) {
        switch (popupType) {
            case PopupType.Rebet:
                return this.checkRenderRebet() && this.renderReBet();
            case PopupType.Error:
                return this.renderErrorMessage();
            case PopupType.PlaceBet:
                return this.renderPlaceBet();
            default:
                return null;
        }
    }

    closePopup() {
        this.setState({ displayPopup: null });
    }

    renderNotice() {
        const { gameName, message, roundId, duration, minBet, maxBet, errorCode, isWarning, betChoice1, betChoice2 } = this.state.notice;
        return (
            <Notice
                gameName={gameName}
                roundId={roundId}
                message={message}
                duration={duration}
                minBet={minBet}
                maxBet={maxBet}
                errorCode={errorCode}
                onClose={this.closeNotice}
                isWarning={isWarning}
                betChoice1={betChoice1}
                betChoice2={betChoice2}
            />
        );
    }

    closeNotice() {
        this.setState({ notice: null });
    }

    get isShowStartRoundAnimation() {
        return false;
    }

    getRoundHistoryTabStyles() {
        return "";
    }

    renderGameHeader() {
        const { gameState } = this.state;

        const gameHeaderProps = {
            isShowCollapse: [GameState.DisplayResult, GameState.BeforeStartRound].includes(gameState),
            isUpdateDisableRebet: gameState !== GameState.InRound,
            countdownTimerComponent: <CountdownTimer key={gameState} />,
        };

        return <GameHeader {...gameHeaderProps} />;
    }

    get isShowInlineResult() {
        return false;
    }

    renderResultSection() {
        return null;
    }

    copyToClipboard(event: any) {
        event.preventDefault();
        const { md5, md5ResultKey, showMD5ResultKey } = this.state;
        const md5Message = this.props.t(`common:${showMD5ResultKey ? "copyMD5Result" : "copyMD5Key"}`);
        this.setState({ notice: { message: md5Message, duration: 2, isWarning: false } });
        navigator.clipboard.writeText(showMD5ResultKey ? md5ResultKey : md5);
    }

    handleMD5({ md5 }) {
        this.setState({
            md5,
        });
    }

    handleResultHash({ resultHash }) {
        const { hashValue, rawValue } = resultHash;
        hashValue && this.setState({ md5: hashValue });
        rawValue && this.setState({ md5ResultKey: rawValue });
    }

    renderRawValueMD5() {
        const { md5ResultKey } = this.state;
        const arrayResult = md5ResultKey.split("_");
        const totalScores = arrayResult[0].slice(1, arrayResult[0].length - 1).split(";");

        return (
            <>
                <strong>{this.props.t("common:md5Result")}</strong>
                {`: {`}
                <span className={Styles["blue"]}>{totalScores[0]}</span>;<span className={Styles["red"]}>{totalScores[1]}</span>
                {`}_`}
                <span>{arrayResult[1]}</span>
            </>
        );
    }

    renderMD5() {
        const { md5, md5ResultKey, showMD5ResultKey } = this.state;

        let md5Text = (
                <div>
                    <strong>{this.props.t("common:md5Key")}:</strong> {md5}
                </div>
            ),
            md5ClassName = "md5-key";
        if ((showMD5ResultKey || !md5) && md5ResultKey) {
            md5Text = this.renderRawValueMD5();
            md5ClassName = "md5-result";
        }

        return (
            <div className={Styles["md5-section"]}>
                <span className={`${Styles["text"]} ${Styles[md5ClassName]}`}>{md5Text}</span>
                <div className={Styles["copy-box"]} onClick={this.copyToClipboard}>
                    <span className={Styles["copy-text"]}>{this.props.t("common:copy")}</span>
                </div>
            </div>
        );
    }

    renderGame() {
        const { durations, supportMD5, gameName } = this.props;

        const {
            remainingTime,
            roundId,
            gameState,
            totalBets,
            ownBets,
            gameConfigs,
            viewMode,
            playResultAnimation,
            isShowBlink,
            displayPopup,
            activeScoreboardTab,
            rate,
        } = this.state;

        const gameContext = {
            totalBets,
            ownBets,
            gameSetting: this.props,
            roundId,
            gameConfigs,
            gameState,
            remainingTime,
            viewMode,
            playResultAnimation,
            isShowBlink,
            supportMD5,
            rate,
        };

        const gameActionsContext = {
            placeBet: this.placeBet,
            openPopup: this.openPopup,
            closePopup: this.closePopup,
            registerMessageHandler: this.messageTransmitter.register,
            unsubscribeMessageHandler: this.messageTransmitter.unsubscribe,
            openPlaceBetModal: this.openPlaceBetModal,
            updateViewMode: this.updateViewMode,
            playAcceptedBetAnimation: this.playAcceptedBetAnimation,
            finishProcessingBet: () => {
                this.isProcessingBet = false;
                this.clearRetryInterval();
            },
            renderResultCollapse: this.renderResultCollapse.bind(this),
            setActiveScoreboardTab: this.setActiveScoreboardTab,
            updateStatusShowResult: this.updateStatusShowResult,
        };

        const animationDuration = this.getFinishAnimationDuration() / 1000;
        const betOptionFollowGameName = `bet-options-${gameName.toLowerCase()}`;
        const betOptionsContainerClasses = `${Styles["bet-options"]} ${Styles[betOptionFollowGameName]}`;
        return (
            <GameContextProvider value={gameContext}>
                <GameActionsContextProvider value={gameActionsContext}>
                    {this.renderGameHeader()}
                    {viewMode !== ViewMode.collapse && (
                        <>
                            {this.isShowInlineResult && (
                                <SectionResultContainer gameName={gameName}>{this.renderResultSection()}</SectionResultContainer>
                            )}
                            {supportMD5 && this.renderMD5()}
                            <BetContainer gameState={gameState}>
                                <div ref={this.gameBaseContainerRef} className={betOptionsContainerClasses}>
                                    {this.renderBetOptions()}
                                </div>

                                {this.isShowStartRoundAnimation && this.renderStartRoundAnimation()}
                                {this.state.gameState === GameState.DisplayResult && (
                                    <BaseResult showResultTimeInSecond={durations.showResult}>{this.renderResult()}</BaseResult>
                                )}
                                {this.state.showResultInfo && this.state.gameState === GameState.DisplayResult && (
                                    <ResultDetail
                                        renderSettlementInfo={this.renderSettlementInfo}
                                        timeToShowInSecond={durations.showResult + (durations.balancingBet ?? 0) - animationDuration}
                                    />
                                )}
                                {this.state.gameState === GameState.BalancingBet && <OverlayMaskWhite />}
                                {this.state.notice && this.renderNotice()}
                                {(this.state.showResultInfo || this.state.showWinningAnimation) && this.betWin > 0 && (
                                    <WinningBet amount={this.betWin} />
                                )}
                            </BetContainer>
                            <div className={`${Styles["mini-round-history"]} ${this.getRoundHistoryTabStyles()}`}>
                                {this.state.roundHistory.length > 0 ? this.renderRoundHistory() : <></>}
                            </div>
                            {viewMode === ViewMode.full && (
                                <>
                                    <div className={`${Styles["statistic"]}`}>
                                        {this.state.roundHistory.length > 0 ? this.renderStatistic() : <></>}
                                    </div>
                                    <ScoreboardRoundHistory activeScoreboardTab={activeScoreboardTab}>
                                        {this.state.roundHistory.length > 0 ? this.renderBoard() : <></>}
                                    </ScoreboardRoundHistory>
                                </>
                            )}
                        </>
                    )}
                    {this.renderPopup(displayPopup)}
                </GameActionsContextProvider>
            </GameContextProvider>
        );
    }

    protected retryConnect() {
        this.onStart();
    }

    render() {
        const { signedIn, gameState, disabledMessage, viewMode, disconnectReason } = this.state;
        return (
            <GameContainer>
                {signedIn ? this.renderGame() : <GameLoading />}
                {gameState === GameState.Disabled && <DisabledModal disabledMessage={disabledMessage} viewMode={viewMode} />}
                {gameState === GameState.ConnectFailed && (
                    <ConnectFailedMessage
                        gameName={this.props.t(`${this.props.gameName.toLowerCase()}:${GameResourceKeys.GAME_NAME}`)}
                        onSubmit={
                            ConnectFailedReasonKey.restrictPlayPermission === disconnectReason
                                ? () => window.location.reload()
                                : this.retryConnect.bind(this)
                        }
                        reason={disconnectReason}
                    />
                )}
            </GameContainer>
        );
    }
}

GameBase.contextType = AuthContext;

export default GameBase;
