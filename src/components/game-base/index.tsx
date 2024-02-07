import React from "react";
import Auth from "sc-user-service-client/dist/auth";
import { Socket } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
import { LanguageLocaleMapper } from "../../_shared/constants";
import { initSocketIO } from "../../_shared/helpers";
import MessageTransmitter from "../../_shared/helpers/message-transmitter";
import { MessageTransmitterType } from "../../_shared/helpers/message-transmitter/type";
import { GetLocalizedErrorMessage } from "../../_shared/helpers/notice-helper";
import { AuthContext, GameActionsContextProvider, GameContextProvider } from "../../_shared/react-contexts";
import { CommonResourceKeys, GameResourceKeys } from "../../_shared/resources";
import DisabledModal from "../game-components/disabled-modal";
import { ConnectFailedMessage } from "../game-components/error-message";
import { ConnectFailedReasonKey } from "../game-components/error-message/type";
import GameContainer from "../game-components/game-container";
import GameLoading from "../game-components/game-loading";
import { Boundary, GameBaseProps, GameBaseState, GameState, PopupType, Position, ViewMode } from "./type";

abstract class GameBase<P extends GameBaseProps, S extends GameBaseState<any, any>> extends React.PureComponent<P, S> {
    private readonly animationTime = 3000;
    private readonly gameBaseContainerRef = React.createRef<HTMLDivElement>();
    protected betWin: number;
    protected isUMInFirstLoad = false;
    protected showResultInfoTimeout: NodeJS.Timeout;
    protected showWinningAnimationTimeout: NodeJS.Timeout;
    protected isProcessingBet = false;
    private retryInterval: NodeJS.Timeout;
    protected betPosition: Position;
    protected betOptionBoundary: Boundary;
    protected socket: Socket;
    protected interval: NodeJS.Timeout;
    protected roundTimeCounter: number;
    protected timeCounter: number;
    protected messageTransmitter: MessageTransmitterType;
    protected authService: Auth;
    protected turn: number;
    private isConnectFailed = false;
    private playPermissionListener: string;
    private userStakeLevelListener: string;
    private disconnectTimeout: NodeJS.Timeout;

    private readonly defaultGameConfig = { odds: {}, minBet: 0, maxBet: 0, maxBetPerChoices: {}, enableFreeBet: false };
    protected readonly defaultState = {
        signedIn: false,
        gameState: GameState.None,
        roundRemainingTime: 0,
        remainingTime: 0,
        gameConfigs: { ...this.defaultGameConfig },
        roundHistory: [],
        roundId: 0,
        drawId: 0,
        ownBets: {},
        displayPopup: null,
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
        rate: 1,
        disconnectReason: "",
    };

    constructor(props: P) {
        super(props);
        this.messageTransmitter = MessageTransmitter();
        this.openPopup = this.openPopup.bind(this);
        this.placeBet = this.placeBet.bind(this);
        this.openPlaceBetModal = this.openPlaceBetModal.bind(this);
        this.updateViewMode = this.updateViewMode.bind(this);
        this.playAcceptedBetAnimation = this.playAcceptedBetAnimation.bind(this);
        this.updateUserBalance = this.updateUserBalance.bind(this);
        this.setActiveScoreboardTab = this.setActiveScoreboardTab.bind(this);
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
        this.messageTransmitter.clearAllListener();
    }

    onStart() {
        const { registerGlobalMessageEvent } = this.props;

        this.isConnectFailed = false;
        this.isProcessingBet = false;
        this.playPermissionListener = registerGlobalMessageEvent("notPermittedToPlay", this.handleRestrictPermission.bind(this));
        this.userStakeLevelListener = registerGlobalMessageEvent("userStakeLevel", ({ userStakeLevel }) =>
            this.props.updateUserStakeLevel(userStakeLevel)
        );
        this.clearDisconnectTimeout();
        this.socket = this.createGameSocket();
        this.socket && this.socket.off(this.props.gameName).on(this.props.gameName, this.messageTransmitter.broadcast.bind(this));
    }

    protected createGameSocket() {
        const socket = initSocketIO(this.props.socketInfo);
        const { session } = this.context as any;
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
        this.messageTransmitter.register("ownBets", this.handleOwnBets.bind(this));
        this.messageTransmitter.register("endBet", this.handleEndBet.bind(this));
        this.messageTransmitter.register("apiError", this.handleApiError.bind(this));
        this.messageTransmitter.register("errorCode", this.handleError.bind(this));
        this.messageTransmitter.register("userStakeLevel", this.handleUserStakeLevel.bind(this));
        this.messageTransmitter.register("odds", this.handleOdds.bind(this));
        this.messageTransmitter.register("drawId", this.handleDrawId.bind(this));
    }

    handleOdds({ odds }) {
        const { values } = odds;
        const { gameConfigs } = this.state;
        const { minBet, maxBet, maxBetPerChoices, enableFreeBet } = gameConfigs;
        const newGameConfigs = {
            odds: values,
            minBet: minBet,
            maxBet: maxBet,
            maxBetPerChoices: maxBetPerChoices,
            enableFreeBet: enableFreeBet,
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

    handleOwnBets = ({ ownBets, gameConfigs }) => {
        gameConfigs && this.setState({ ownBets });
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
        if (um && remainingTime && remainingTime + 1 === durations.wholeTurn) {
            this.isUMInFirstLoad = true;
        } else {
            this.isUMInFirstLoad = false;
        }

        if (
            um &&
            (this.timeCounter <= durations.placingBets + durations.beforeStartRound + 1 || remainingTime + 1 === durations.wholeTurn)
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

    handleDrawId = ({ drawId }) => {
        this.setState({ drawId });
        const numberOfTurnsPerRound = 4;
        const turn = drawId % numberOfTurnsPerRound || numberOfTurnsPerRound;
        this.turn = turn;
    };

    handleRemainingTime({ remainingTime }) {
        const { gameState } = this.state;
        const { durations } = this.props;
        if (gameState === GameState.None || !this.isUMInFirstLoad) {
            this.setState({ roundRemainingTime: remainingTime });
            this.roundTimeCounter = remainingTime;
            const turnRemainingTime = remainingTime % durations.wholeTurn;
            this.runGame(turnRemainingTime === 0 ? durations.wholeTurn : turnRemainingTime);
        }
    }

    runGame(remainingTime: number) {
        const { durations } = this.props;
        const turnRemainingTime = remainingTime % durations.wholeTurn;
        this.timeCounter = turnRemainingTime === 0 ? durations.wholeTurn : turnRemainingTime;

        this.interval && clearInterval(this.interval);
        this.interval = setInterval(() => {
            if (this.timeCounter > 0) {
                this.timeCounter = this.timeCounter - 1;
                this.roundTimeCounter = this.roundTimeCounter - 1;
            }
            this.handleGamePlay(this.timeCounter);
        }, 1000);

        this.handleGamePlay(turnRemainingTime === 0 ? durations.wholeTurn : turnRemainingTime);
    }

    handleGamePlay(remainingTime: number) {
        // console.log(`---------------`);
        // console.log(`roundTimeCounter: ${this.roundTimeCounter}`);
        // console.log(`Turn RemainingTime: ${remainingTime}`);
        console.log(`Turn : ${this.turn}`);
        const newGameState = this.determineGameState(remainingTime);
        // console.log(`GameState: ${GameState[newGameState]}`);
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
                    showMD5ResultKey: false,
                },
            },
            {
                condition: durations.beforeStartRound ? nextGameState === GameState.BeforeStartRound : nextGameState === GameState.InRound,
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
        if (remainingTime > durations.wholeTurn) {
            return GameState.BalancingBet;
        }

        if (remainingTime >= durations.wholeTurn - durations.showResult) {
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
    }

    getFinishAnimationDuration() {
        return this.props.durations.resultAnimation * 1000;
    }

    handleFinish({ finish }) {
        const { roundHistory } = this.state;
        const { durations } = this.props;
        const roundHistoryClone = [...roundHistory];

        this.isProcessingBet = false;
        this.clearRetryInterval();
        //this.storeOwnBet(finish.roundId);
        roundHistoryClone.unshift(finish);
        roundHistoryClone.length > 100 && roundHistoryClone.pop();

        this.setState({
            playResultAnimation: true,
            result: finish.result,
            settlementResult: finish.settlementResult,
            roundId: finish.roundId,
        });

        const animationDuration = this.getFinishAnimationDuration();

        this.showResultInfoTimeout = setTimeout(() => {
            this.setState({
                showResultInfo: true,
                isShowBlink: false,
                roundHistory: roundHistoryClone,
                playResultAnimation: false,
            });
        }, animationDuration);

        this.showWinningAnimationTimeout = setTimeout(() => {
            this.setState({
                showWinningAnimation: true,
            });
            this.betWin > 0 && this.updateUserBalance();
        }, this.winningAnimationWaitingTimeInSecond);

        this.runGame(durations.wholeTurn);
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

    setActiveScoreboardTab = (activeScoreboardTab: number) => {
        this.setState({ activeScoreboardTab });
    };

    updateStatusShowResult = () => {
        if (this.state.gameState === GameState.DisplayResult) {
            this.setState({ playResultAnimation: false });
        }
    };

    getChoiceNameOnHedgeBetMessage(choiceKey) {
        return this.getGameTranslate(choiceKey);
    }

    getGameTranslate(key: string) {
        const { t, gameName } = this.props;

        return t(`${gameName.toLocaleLowerCase()}:${key}`);
    }

    getOddsByChoice(choice: string) {
        const { gameConfigs } = this.state;
        const odds = gameConfigs.odds;

        return odds[choice];
    }

    renderResultSection() {
        return null;
    }

    renderHeaderBlock() {
        return <></>;
    }

    renderMenuButtons() {
        return <></>;
    }

    renderResultBlock() {
        return <></>;
    }

    renderBettingBlock() {
        return <></>;
    }

    renderScoreboards() {
        return <></>;
    }

    renderSlidingChips() {
        return <></>;
    }

    renderStatistic() {
        return <></>;
    }

    getRenderTemplate() {
        return (
            <>
                {this.renderHeaderBlock()}
                {this.renderMenuButtons()}
                {this.renderResultBlock()}
                {this.renderBettingBlock()}
                {this.renderSlidingChips()}
                {this.renderStatistic()}
                {this.renderScoreboards()}
            </>
        );
    }

    renderGame() {
        const {
            remainingTime,
            roundRemainingTime,
            roundId,
            drawId,
            gameState,
            ownBets,
            gameConfigs,
            viewMode,
            playResultAnimation,
            isShowBlink,
            rate,
            result,
            settlementResult,
        } = this.state;

        const gameContext = {
            ownBets,
            gameSetting: this.props,
            roundId,
            drawId,
            gameConfigs,
            gameState,
            roundRemainingTime,
            remainingTime,
            viewMode,
            playResultAnimation,
            isShowBlink,
            rate,
            messageTransmitter: this.messageTransmitter,
            result,
            settlementResult,
        };

        const gameActionsContext = {
            placeBet: this.placeBet,
            openPopup: this.openPopup,
            openPlaceBetModal: this.openPlaceBetModal,
            updateViewMode: this.updateViewMode,
            playAcceptedBetAnimation: this.playAcceptedBetAnimation,
            setActiveScoreboardTab: this.setActiveScoreboardTab,
            updateStatusShowResult: this.updateStatusShowResult,
        };

        return (
            <GameContextProvider value={gameContext}>
                <GameActionsContextProvider value={gameActionsContext}>{this.getRenderTemplate()}</GameActionsContextProvider>
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
