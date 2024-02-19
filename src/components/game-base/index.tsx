import React from "react";
import Auth from "sc-user-service-client/dist/auth";
import { Socket } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
import { InitSocketIO } from "../../_shared/helpers";
import { MessageTransmitterType } from "../../_shared/helpers/message-transmitter/type";
import { GetLocalizedErrorMessage } from "../../_shared/helpers/notice-helper";
import { AuthContext, GameActionsContextProvider, GameContextProvider } from "../../_shared/react-contexts";
import { GameResourceKeys } from "../../_shared/resources";
import DisabledModal from "../game-components/disabled-modal";
import { ConnectFailedMessage } from "../game-components/error-message";
import { ConnectFailedReasonKey } from "../game-components/error-message/type";
import GameContainer from "../game-components/game-container";
import GameLoading from "../game-components/game-loading";
import { Notice } from "../game-components/notice";
import { Boundary, GameBaseProps, GameState, PopupType, Position, ViewMode } from "./type";
import { GameEventActionType } from "../../_shared/react-contexts/game-state-context/game-event-action";

abstract class GameBase<P extends GameBaseProps> extends React.PureComponent<P> {
    private readonly animationTime = 3000;
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

    constructor(props: P) {
        super(props);

        this.openPopup = this.openPopup.bind(this);
        this.placeBet = this.placeBet.bind(this);
        this.openPlaceBetModal = this.openPlaceBetModal.bind(this);
        this.updateViewMode = this.updateViewMode.bind(this);
        this.playAcceptedBetAnimation = this.playAcceptedBetAnimation.bind(this);
        this.updateUserBalance = this.updateUserBalance.bind(this);
        this.setActiveScoreboardTab = this.setActiveScoreboardTab.bind(this);
    }

    componentDidMount() {
        document.addEventListener("visibilitychange", this.onVisibilityChange);
        this.onStart();
    }

    componentWillUnmount() {
        this.onDestroy();
        this.messageTransmitter.clearAllListener();
        document.removeEventListener("visibilitychange", this.onVisibilityChange);
    }

    onDestroy() {
        this.props.dispatch({
            type: GameEventActionType.SIGN_IN,
            payload: {
                gameState: GameState.None,
                signedIn: false,
            },
        });

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
        const { socket, messageTransmitter } = this.createGameSocket();
        this.socket = socket;
        this.messageTransmitter = messageTransmitter;
    }

    protected createGameSocket() {
        const { session } = this.context as any;

        const { socket, messageTransmitter } = InitSocketIO(
            this.props.socketInfo,
            session,
            this.props.dispatch,
            this.clearDisconnectTimeout,
            this.props.gameName,
            this.isUMInFirstLoad,
            this.defaultResult,
            this.defaultSettlementResult,
            this.props.gameStateContextModel
        );

        socket.on("connect", () => {
            this.clearDisconnectTimeout();
            this.registerMessageHandler();
            // document.visibilityState !== "hidden" && socket.emit("signin", session);
        });

        socket.on("connect_error", this.onConnectFailed.bind(this));

        return { socket, messageTransmitter };
    }

    onVisibilityChange = () => {
        const visibleState = document.visibilityState;
        visibleState === "hidden" ? this.onDestroy() : this.onStart();
    };

    onConnectFailed() {
        this.onDestroy();
        this.props.dispatch({
            type: GameEventActionType.ERROR_CODE,
            payload: {
                disconnectReason: ConnectFailedReasonKey.lostConnection,
            },
        });
    }

    registerMessageHandler() {
        // this.messageTransmitter.register("signedIn", this.handleSignedIn.bind(this));
        this.messageTransmitter.register("um", this.handleUM.bind(this));
        this.messageTransmitter.register("remainingTime", this.handleRemainingTime.bind(this));
        // this.messageTransmitter.register("gameConfigs", this.handleGameConfigs.bind(this));
        // this.messageTransmitter.register("roundHistory", this.handleRoundHistory.bind(this));
        this.messageTransmitter.register("finish", this.handleFinish.bind(this));
        this.messageTransmitter.register("status", this.handleStatus.bind(this));
        this.messageTransmitter.register("user", this.handleUserData.bind(this));
        this.messageTransmitter.register("ownBets", this.handleOwnBets.bind(this));
        this.messageTransmitter.register("endBet", this.handleEndBet.bind(this));
        this.messageTransmitter.register("apiError", this.handleApiError.bind(this));
        this.messageTransmitter.register("errorCode", this.handleError.bind(this));
        this.messageTransmitter.register("userStakeLevel", this.handleUserStakeLevel.bind(this));
        this.messageTransmitter.register("drawId", this.handleDrawId.bind(this));
    }

    handleError = ({ errorCode }) => {
        if (errorCode === "SB0010" && document.visibilityState !== "hidden") {
            const time = this.props.gameStateContextModel.signedIn ? 1000 : 5000;
            this.disconnectTimeout = setTimeout(() => {
                this.isConnectFailed = true;

                this.props.dispatch({
                    type: GameEventActionType.ERROR_CODE,
                    payload: {
                        disconnectReason: ConnectFailedReasonKey.lostConnection,
                    },
                });
            }, time);
        }
    };

    handleUserStakeLevel({ userStakeLevel }) {
        this.props.updateUserStakeLevel(userStakeLevel);

        this.props.dispatch({
            type: GameEventActionType.USER_STAKE_LEVEL,
            payload: {},
        });
    }

    protected handleStatus = ({ status }) => {
        this.props.dispatch({
            type: GameEventActionType.STATUS,
            payload: { status },
        });
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
        // const gameName = this.props.t(`${this.props.gameName.toLowerCase()}:${GameResourceKeys.GAME_NAME}`);
        const gameName = `${this.props.gameName.toLowerCase()}:${GameResourceKeys.GAME_NAME}`;

        const { displayPopup } = this.props.gameStateContextModel;

        displayPopup !== PopupType.Rebet &&
            this.props.dispatch({
                type: GameEventActionType.DISPLAY_POPUP,
                payload: {
                    notice: {
                        gameName: gameName,
                        roundId: apiError?.gameRoundId,
                        message: message,
                        duration: 3,
                        minBet: apiError?.minBet,
                        maxBet: apiError?.maxBet,
                        errorCode: errorCode,
                    },
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
        const { displayPopup } = this.props.gameStateContextModel;

        displayPopup !== PopupType.Rebet &&
            this.props.dispatch({
                type: GameEventActionType.DISPLAY_POPUP,
                payload: {
                    notice: null,
                },
            });
        const gameName = `${this.props.gameName.toLowerCase()}:${GameResourceKeys.GAME_NAME}`;
        if (kickedOut?.isDisabledAccount) {
            this.props.dispatch({
                type: GameEventActionType.KICK_OUT,
                payload: {
                    notice,
                    kickedOut,
                },
            });

            const { router } = this.props;
            setTimeout(() => {
                // router.push("/timeout", "/timeout", { locale: i18n.language });
                router.push("/timeout", "/timeout", { locale: "i18n.language" });
            }, 10000);
        } else {
            const isPlaceBet = notice.isPlaceBetFailed ? notice.isPlaceBetFailed : false;

            displayPopup !== PopupType.Rebet &&
                this.props.dispatch({
                    type: GameEventActionType.DISPLAY_POPUP,
                    payload: {
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
                    },
                });
        }
    };

    handleEndBet = ({ endBet, betChoice, notice, kickedOut, apiError }) => {
        const { playPlaceBetSound } = this.props;
        const { displayPopup, ownBets } = this.props.gameStateContextModel;
        this.isProcessingBet = false;
        this.clearRetryInterval();
        this.props.dispatch({
            type: GameEventActionType.DISPLAY_POPUP,
            payload: { notice: null },
        });

        if (endBet === -1) {
            !apiError && this.handleBetFailed({ notice, kickedOut });
        } else {
            this.playAcceptedBetAnimation(endBet, this.betPosition);
            playPlaceBetSound();
            ownBets[betChoice] = ownBets[betChoice] ? ownBets[betChoice] + endBet : endBet;
            this.props.dispatch({
                type: GameEventActionType.OWN_BETS,
                payload: { ownBetsData: { ownBets: { ...ownBets } } },
            });
            this.updateUserBalance();
        }
    };

    playAcceptedBetAnimation(amount: number, betPosition?: Position) {
        const { acceptedBetQueue } = this.props.gameStateContextModel;
        const key = uuidv4();
        acceptedBetQueue[key] = {
            amount,
            betPosition: betPosition ? { ...betPosition } : null,
            betOptionBoundary: this.betOptionBoundary,
        };

        this.props.dispatch({
            type: GameEventActionType.ACCEPTED_BET_QUEUE,
            payload: { acceptedBetQueue: { ...acceptedBetQueue } },
        });
        setTimeout(() => {
            this.removeAcceptedBetQueue(key);
        }, this.animationTime);
    }

    removeAcceptedBetQueue(key: number) {
        const { acceptedBetQueue } = this.props.gameStateContextModel;
        delete acceptedBetQueue[key];
        this.props.dispatch({
            type: GameEventActionType.ACCEPTED_BET_QUEUE,
            payload: { acceptedBetQueue },
        });
    }

    handleOwnBets = ({ ownBets, gameConfigs }) => {
        gameConfigs &&
            this.props.dispatch({
                type: GameEventActionType.OWN_BETS,
                payload: { ownBetsData: { ownBets } },
            });
    };

    handleUserData({ user, gameConfigs }) {
        //this.context.setBalance(user.red);
        this.props.dispatch({
            type: GameEventActionType.USER,
            payload: { userData: { user, gameConfigs } },
        });
    }

    handleRestrictPermission({ notPermittedToPlay, gameId, userStakeLevel }) {
        if (notPermittedToPlay && gameId === this.props.id) {
            this.onDestroy();
            this.props.dispatch({
                type: GameEventActionType.ERROR_CODE,
                payload: { disconnectReason: ConnectFailedReasonKey.restrictPlayPermission },
            });
        }
        if (userStakeLevel) {
            this.props.updateUserStakeLevel(userStakeLevel);
        }
    }

    handleUM({ um, um_message, remainingTime }) {
        const { durations } = this.props;
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
            this.props.dispatch({
                type: GameEventActionType.UM,
                payload: {
                    um_message,
                },
            });
        }
    }

    handleDrawId = ({ drawId }) => {
        const numberOfTurnsPerRound = 4;
        const turn = drawId % numberOfTurnsPerRound || numberOfTurnsPerRound;
        this.turn = turn;

        this.props.dispatch({
            type: GameEventActionType.DRAW_ID,
            payload: { drawId },
        });
    };

    handleRemainingTime({ remainingTime }) {
        const { gameState } = this.props.gameStateContextModel;
        const { durations } = this.props;
        if (gameState === GameState.None || !this.isUMInFirstLoad) {
            this.props.dispatch({
                type: GameEventActionType.REMAINING_TIME,
                payload: { remainingTime },
            });
            this.props.dispatch({
                type: GameEventActionType.DRAW_ID,
                payload: { roundRemainingTime: remainingTime },
            });
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
        // console.log(`Turn : ${this.turn}`);
        const newGameState = this.props.determineGameState({ remainingTime, durations: this.props.durations });
        // console.log(`GameState: ${GameState[newGameState]}`);
        if (this.props.gameStateContextModel.gameState !== newGameState && !this.isConnectFailed) {
            const newState = {
                gameState: newGameState,
                ...this.props.getStateByNextGameState({
                    nextGameState: newGameState,
                    gameStateContextModel: this.props.gameStateContextModel,
                    durations: this.props.durations,
                    defaultResult: this.defaultResult,
                    defaultSettlementResult: this.defaultSettlementResult,
                    remainingTime: this.timeCounter,
                }),
            };

            this.props.dispatch({
                type: GameEventActionType.SET_NEW_STATE,
                payload: { newState },
            });
        }
    }

    async updateUserBalance() {
        // const balanceResponse = await getBalance(this.context.session);
        // if (balanceResponse.isSuccessful) {
        //     this.context.setBalance(balanceResponse.balance);
        // } else {
        //     this.props.setApiErrorMessage(balanceResponse.errorCode);
        // }
    }

    getFinishAnimationDuration() {
        return this.props.durations.resultAnimation * 1000;
    }

    handleFinish({ finish }) {
        this.props.dispatch({
            type: GameEventActionType.FINISH,
            payload: {},
        });
        const { roundHistory } = this.props.gameStateContextModel;
        const { durations } = this.props;
        const roundHistoryClone = [...roundHistory];

        this.isProcessingBet = false;
        this.clearRetryInterval();
        //this.storeOwnBet(finish.roundId);
        roundHistoryClone.unshift(finish);
        roundHistoryClone.length > 100 && roundHistoryClone.pop();

        this.props.dispatch({
            type: GameEventActionType.FINISH,
            payload: {
                playResultAnimation: true,
                result: finish.result,
                settlementResult: finish.settlementResult,
                roundId: finish.roundId,
            },
        });

        const animationDuration = this.getFinishAnimationDuration();

        this.showResultInfoTimeout = setTimeout(() => {
            this.props.dispatch({
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
            this.props.dispatch({
                type: GameEventActionType.SHOW_WINNING_ANIMATION,
                payload: {
                    showWinningAnimation: true,
                },
            });

            this.props.gameStateContextModel.betWin > 0 && this.updateUserBalance();
        }, this.winningAnimationWaitingTimeInSecond);

        this.runGame(durations.wholeTurn);
    }

    openPlaceBetModal(betChoice: string, removeBetChoiceFocus: Function, betOptionElement: HTMLElement, betChoiceElement: HTMLElement) {
        this.props.dispatch({
            type: GameEventActionType.PLACE_BET_POPUP,
            payload: {
                selectedBetChoice: betChoice,
                removeBetChoiceFocus,
                betOptionElement,
                betChoiceElement,
            },
        });
    }

    placeBet(betChoice: string, amount: number, betPosition?: Position, betOptionBoundary?: Boundary) {
        const { displayPopup } = this.props.gameStateContextModel;
        if (this.isProcessingBet && displayPopup !== PopupType.Rebet) {
            this.props.dispatch({
                type: GameEventActionType.BET_PROCESSING,
                payload: {},
            });
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
        this.socket.emit("bet", { betChoices: { [betChoice.toLowerCase()]: amount } });
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
        this.props.dispatch({
            type: GameEventActionType.OPEN_POPUP,
            payload: { displayPopup: popupType },
        });
    }

    updateViewMode(mode: ViewMode) {
        this.props.dispatch({
            type: GameEventActionType.OPEN_POPUP,
            payload: { viewMode: mode },
        });
    }

    setActiveScoreboardTab = (activeScoreboardTab: number) => {
        this.props.dispatch({
            type: GameEventActionType.ACTIVE_SCORE_BOARD,
            payload: { activeScoreboardTab },
        });
    };

    updateStatusShowResult = () => {
        if (this.props.gameStateContextModel.gameState === GameState.DisplayResult) {
            this.props.dispatch({
                type: GameEventActionType.PLAY_RESULT_ANIMATION,
                payload: { playResultAnimation: false },
            });
        }
    };

    getChoiceNameOnHedgeBetMessage(choiceKey) {
        return this.getGameTranslate(choiceKey);
    }

    getGameTranslate(key: string) {
        const { gameName } = this.props;
        return `${gameName.toLocaleLowerCase()}:${key}`;
    }

    renderNotice() {
        const { gameName, message, roundId, duration, minBet, maxBet, errorCode, isWarning, betChoice1, betChoice2 } =
            this.props.gameStateContextModel.notice;
        return (
            <Notice
                gameName={gameName}
                roundId={roundId}
                message={message}
                duration={duration}
                minBet={minBet}
                maxBet={maxBet}
                errorCode={errorCode}
                onClose={() => this.closeNotice()}
                isWarning={isWarning}
                betChoice1={betChoice1}
                betChoice2={betChoice2}
            />
        );
    }

    closeNotice() {
        this.setState({ notice: null });
    }

    getOddsByChoice(choice: string) {
        const { gameConfigs } = this.props.gameStateContextModel;
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
                {this.props.gameStateContextModel.notice && this.renderNotice()}
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
        } = this.props.gameStateContextModel;

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
            supportMD5: false,
            rate,
            messageTransmitter: this.messageTransmitter,
        };

        const gameActionsContext = {
            placeBet: this.placeBet,
            openPopup: this.openPopup,
            openPlaceBetModal: this.openPlaceBetModal,
            updateViewMode: this.updateViewMode,
            playAcceptedBetAnimation: this.playAcceptedBetAnimation,
            finishProcessingBet: () => {
                this.isProcessingBet = false;
                this.clearRetryInterval();
            },
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
        const { signedIn, gameState, disabledMessage, viewMode, disconnectReason } = this.props.gameStateContextModel;
        return (
            <GameContainer>
                {signedIn ? this.renderGame() : <GameLoading />}
                {gameState === GameState.Disabled && (
                    <DisabledModal
                        disableMessage={disabledMessage}
                        onSubmit={
                            //TODO: redirect to Saba play lobby
                            () => window.location.reload()
                        }
                    />
                )}
                {gameState === GameState.ConnectFailed && (
                    <ConnectFailedMessage
                        gameName={`${this.props.gameName.toLowerCase()}:${GameResourceKeys.GAME_NAME}`}
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
