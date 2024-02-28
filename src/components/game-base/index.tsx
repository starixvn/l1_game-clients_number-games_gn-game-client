import React from "react";
import Auth from "sc-user-service-client/dist/auth";
import { Socket } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
import { confirmBet } from "../../_shared/constants";
import { InitSocketIO } from "../../_shared/helpers";
import { GetLocalizedErrorMessage } from "../../_shared/helpers/notice-helper";
import { AuthContext, AuthContextModel, GameActionsContextProvider, GameContextProvider } from "../../_shared/react-contexts";
import { GameEventActionType } from "../../_shared/react-contexts/game-state-context/game-event-action";
import { GameResourceKeys } from "../../_shared/resources";
import { Notice as NoticeData } from "../../components/game-base/type";
import { getBalance } from "../../services/auth-service";
import ConfirmBet from "../game-components/confirm-bet";
import DisabledModal from "../game-components/disabled-modal";
import { ConnectFailedMessage } from "../game-components/error-message";
import { ConnectFailedReasonKey } from "../game-components/error-message/type";
import GameContainer from "../game-components/game-container";
import { GameHeader } from "../game-components/game-header";
import GameLoading from "../game-components/game-loading";
import { Notice } from "../game-components/notice";
import { getValidateMinMaxBetResult, validateHedgeBet } from "../../_shared/helpers/validate-bet-helper";
import { Settings } from "../game-components/settings";
import BetSettings from "../page-components/bet-settings";
import { IRoundStateHandler } from "../round-base/round-state-handler";
import { DummyHandler, GameErrorHandler, GameMessageHandler, PlayerHandler, messageEventType } from "./handlers";
import { IGameStateHandler } from "./handlers/game-state-handler";
import { GameBaseProps, RoundState } from "./type";
import BetConfirmDialog from "../game-components/bet-confirm-dialog";

abstract class GameBase<P extends GameBaseProps> extends React.PureComponent<P> {
    protected showResultInfoTimeout: NodeJS.Timeout;
    protected showWinningAnimationTimeout: NodeJS.Timeout;
    private retryInterval: NodeJS.Timeout;
    protected socket: Socket;
    protected interval: NodeJS.Timeout;
    protected roundTimeCounter: number;
    protected timeCounter: number;
    protected authService: Auth;
    protected hedgeBetGroup: string[] = [];
    private disconnectTimeout: NodeJS.Timeout;
    private gameMessageHandler: GameMessageHandler;
    private roundStateHandler: IRoundStateHandler;
    private gameStateHandler: IGameStateHandler;
    private gameErrorHandler: GameErrorHandler;
    private playerHandler: PlayerHandler;

    constructor(
        props: P,
        roundStateHandler: IRoundStateHandler,
        gameStateHandler: IGameStateHandler,
        gameMessageHandler: GameMessageHandler,
        gameErrorHandler?: GameErrorHandler,
        playerHandler?: PlayerHandler
    ) {
        super(props);

        this.roundStateHandler = roundStateHandler;
        this.gameStateHandler = gameStateHandler;
        this.gameMessageHandler = gameMessageHandler;
        this.gameErrorHandler =
            gameErrorHandler ??
            new GameErrorHandler({
                dispatch: props.dispatch,
                gameMessageHandler: this.gameMessageHandler,
                gameName: this.props.gameName,
            });

        this.playerHandler =
            playerHandler ??
            new PlayerHandler({
                dispatch: props.dispatch,
                gameMessageHandler: this.gameMessageHandler,
                gameName: this.props.gameName,
            });

        this.placeBet = this.placeBet.bind(this);
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
        document.removeEventListener("visibilitychange", this.onVisibilityChange);
    }

    onDestroy() {
        this.props.dispatch({
            type: GameEventActionType.SIGN_OUT,
            payload: { roundState: RoundState.None },
        });

        clearInterval(this.interval);
        clearTimeout(this.showResultInfoTimeout);
        clearTimeout(this.showWinningAnimationTimeout);
        this.clearRetryInterval();
        this.clearDisconnectTimeout();
    }

    onStart() {
        this.socket?.disconnect();
        this.socket = null;
        this.gameMessageHandler.clearAllHandlers();
        this.props.dispatch({ type: GameEventActionType.DISCONNECT, payload: {} });
        this.props.dispatch({ type: GameEventActionType.END_BET_PROCESSING, payload: {} });
        this.clearDisconnectTimeout();
        this.registerHandlers();
        this.connectToGameService();
    }

    protected connectToGameService() {
        const { session } = this.context as AuthContextModel;
        const { socketInfo, gameName } = this.props;

        const { socket } = InitSocketIO(socketInfo, session, gameName, this.gameMessageHandler);
        this.socket = socket;
    }

    onVisibilityChange = () => {
        document.visibilityState === "hidden" ? this.onDestroy() : this.onStart();
    };

    onConnectFailed() {
        this.onDestroy();
        this.props.dispatch({
            type: GameEventActionType.DISCONNECT_ERROR,
            payload: { disconnectReason: ConnectFailedReasonKey.lostConnection },
        });
    }

    onSocketDisconnect() {
        this.onDestroy();
        const { dispatch } = this.props;
        this.disconnectTimeout = setTimeout(
            () => {
                dispatch({ type: GameEventActionType.DISCONNECT, payload: {} });
                if (!this.props.gameStateContextModel.signedIn) {
                    dispatch({
                        type: GameEventActionType.DISCONNECT_ERROR,
                        payload: { disconnectReason: ConnectFailedReasonKey.lostConnection },
                    });
                }
            },
            this.props.gameStateContextModel.signedIn ? 1000 : 5000
        );
    }

    onGameServiceConnected() {
        this.clearDisconnectTimeout();
        this.props.dispatch({
            type: GameEventActionType.CONNECT,
            payload: { isConnect: true },
        });
    }

    registerHandlers() {
        this.gameMessageHandler.register(messageEventType.SOCKET_CONNECTED, this.onGameServiceConnected.bind(this));
        this.gameMessageHandler.register(messageEventType.SOCKET_CONNECT_ERROR, this.onConnectFailed.bind(this));
        this.gameMessageHandler.register(messageEventType.SOCKET_DISCONNECTED, this.onSocketDisconnect.bind(this));
        this.gameMessageHandler.register(messageEventType.UNDER_MAINTENANCE, this.handleUM.bind(this));
        this.gameMessageHandler.register(messageEventType.REMAINING_TIME, this.handleRemainingTime.bind(this));
        this.gameMessageHandler.register(messageEventType.FINISH, this.handleFinish.bind(this));
        this.gameMessageHandler.register(messageEventType.END_BET, this.handleEndBet.bind(this));
        this.gameMessageHandler.register(messageEventType.GAME_DESTROY, this.onDestroy.bind(this));
        this.playerHandler.registerEvents((this.context as AuthContextModel)?.setBalance);
        this.gameErrorHandler.registerEvents((this.context as AuthContextModel)?.signOut);
    }

    get winningAnimationWaitingTimeInSecond() {
        return this.props.durations.showResult * 1000;
    }

    get defaultResult() {
        return null;
    }

    get defaultSettlementResult() {
        return null;
    }

    handleBetFailed = ({ notice, kickedOut }) => {
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
                        gameName: "gameName",
                        message: GetLocalizedErrorMessage(kickedOut.errorCode),
                        duration: 10,
                        errorCode: kickedOut.errorCode,
                        roundId: 0,
                        onClose: (this.context as AuthContextModel)?.signOut,
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
                        betChoice1: notice?.hedgeBetGroup ? this.getChoiceNameOnHedgeBet(notice.hedgeBetGroup[0]) : "",
                        betChoice2: notice?.hedgeBetGroup ? this.getChoiceNameOnHedgeBet(notice.hedgeBetGroup[1]) : "",
                    },
                },
            });
        }
    };

    handleEndBet = ({ endBet, ownBets, betChoice, notice, kickedOut, apiError }) => {
        const { playPlaceBetSound } = this.props;
        this.props.dispatch({ type: GameEventActionType.END_BET_PROCESSING, payload: {} });
        this.clearRetryInterval();
        this.props.dispatch({
            type: GameEventActionType.DISPLAY_POPUP,
            payload: { notice: null },
        });

        if (endBet === -1) {
            !apiError && this.handleBetFailed({ notice, kickedOut });
        } else {
            this.playAcceptedBetAnimation(endBet);
            playPlaceBetSound();
            this.props.dispatch({
                type: GameEventActionType.OWN_BETS,
                payload: { ownBets },
            });
            this.updateUserBalance();
        }

        this.props.dispatch({
            type: GameEventActionType.NOT_CONFIRM_OWN_BETS,
            payload: { notConfirmOwnBets: {} },
        });
    };

    playAcceptedBetAnimation(amount: number) {
        const { acceptedBetQueue } = this.props.gameStateContextModel;
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
            this.removeAcceptedBetQueue(key);
        }, animationTime);
    }

    removeAcceptedBetQueue(key: number) {
        const { acceptedBetQueue } = this.props.gameStateContextModel;
        delete acceptedBetQueue[key];
        this.props.dispatch({
            type: GameEventActionType.ACCEPTED_BET_QUEUE,
            payload: { acceptedBetQueue },
        });
    }

    handleUM({ um, um_message, remainingTime }) {
        const { durations } = this.props;
        const wholeRound = this.roundStateHandler.getWholeRoundDuration({ durations });

        this.props.dispatch({
            type: GameEventActionType.SET_UM_FIRST_LOADING,
            payload: { umFirstLoading: um && remainingTime && remainingTime + 1 === wholeRound },
        });

        if (um && (this.timeCounter <= durations.placingBets + durations.beforeStartRound + 1 || remainingTime + 1 === wholeRound)) {
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

    handleRemainingTime({ remainingTime }) {
        const { durations, gameStateContextModel } = this.props;
        const { roundState, isUMInFirstLoad } = gameStateContextModel;

        if (roundState === RoundState.None || !isUMInFirstLoad) {
            this.roundTimeCounter = remainingTime;
            this.runGame(this.roundStateHandler.getRemainingTime({ remainingTime, durations }));
        }
    }

    runGame(remainingTime: number) {
        this.timeCounter = remainingTime;
        const { durations } = this.props;
        const { wholeRound } = durations;

        this.interval && clearInterval(this.interval);
        this.interval = setInterval(() => {
            const newRoundState = this.roundStateHandler.determineRoundBaseState({
                roundRemainingTime: this.roundTimeCounter,
                wholeRound: wholeRound,
                remainingTime: this.timeCounter,
                durations,
            });

            this.roundTimeCounter = this.roundTimeCounter - 1;

            if (this.timeCounter > 0 && newRoundState !== RoundState.SwitchRound) {
                this.timeCounter = this.timeCounter - 1;
            }

            this.handleGamePlay(this.timeCounter);
        }, 1000);

        this.handleGamePlay(remainingTime);
    }

    handleGamePlay(remainingTime: number) {
        // console.log(`---------------`);
        // console.log(`roundTimeCounter: ${this.roundTimeCounter}`);
        // console.log(`Turn RemainingTime: ${remainingTime}`);

        const { durations, dispatch, gameStateContextModel } = this.props;

        dispatch({
            type: GameEventActionType.REMAINING_TIME,
            payload: { remainingTime },
        });

        const newRoundState = this.roundStateHandler.determineRoundBaseState({
            roundRemainingTime: this.roundTimeCounter,
            wholeRound: durations.wholeRound,
            remainingTime,
            durations,
        });

        if (gameStateContextModel.roundState !== newRoundState && gameStateContextModel.isConnect) {
            const newGameState = {
                roundState: newRoundState,
                ...this.gameStateHandler.getNextRoundState({
                    nextRoundState: newRoundState,
                    gameStateContextModel,
                    durations,
                    defaultResult: this.defaultResult,
                    defaultSettlementResult: this.defaultSettlementResult,
                    remainingTime,
                }),
            };

            dispatch({
                type: GameEventActionType.SET_NEW_GAME_STATE,
                payload: { newGameState },
            });
        }
    }

    async updateUserBalance() {
        const authContext = this.context as AuthContextModel;
        const balanceResponse = await getBalance(authContext?.session);
        if (balanceResponse.isSuccessful) {
            authContext?.setBalance(balanceResponse.balance);
        } else {
            this.props.setApiErrorMessage(balanceResponse.errorCode);
        }
    }

    getFinishAnimationDuration() {
        return this.props.durations.resultAnimation * 1000;
    }

    handleFinish({ finish }) {
        const { gameStateContextModel, durations, dispatch } = this.props;
        const { roundHistory } = gameStateContextModel;
        const roundHistoryClone = [...roundHistory];

        this.props.dispatch({ type: GameEventActionType.END_BET_PROCESSING, payload: {} });
        this.clearRetryInterval();
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
            },
        });

        const animationDuration = this.getFinishAnimationDuration();

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

            gameStateContextModel.betWin > 0 && this.updateUserBalance();
        }, this.winningAnimationWaitingTimeInSecond);

        this.runGame(this.roundStateHandler.getWholeRoundDuration({ durations }));
    }

    placeBet(betChoice: string, amount: number) {
        const gameStateContext = this.props.gameStateContextModel;
        const systemContext = this.props.systemContextModel;

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
        const validate = this.validateNotConfirmBet(betChoice, amount);
        if (!validate) {
            console.log("fail");
            return;
        }

        if (betChoice == confirmBet) {
            this.sendConfirmBet();
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
    }

    private validateNotConfirmBet(betChoice: string, amount: number): boolean {
        const gameStateContext = this.props.gameStateContextModel;
        const notConfirmOwnBets = gameStateContext.notConfirmOwnBets;

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
                betChoice1: this.getChoiceNameOnHedgeBet(this.hedgeBetGroup[0]),
                betChoice2: this.getChoiceNameOnHedgeBet(this.hedgeBetGroup[1]),
                ...args,
            };
        };

        if (gameStateContext.roundState != RoundState.InRound) {
            sendNotice(getNotice("SB1905"));
            return false;
        }

        if (validateHedgeBet(this.hedgeBetGroup, ownBets, notConfirmOwnBets, betChoice, amount)) {
            sendNotice(getNotice("SB1939"));
            return false;
        }
        const balance = (this.context as AuthContextModel).authorizeInfo.user.red;
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

    private sendConfirmBet() {
        const notConfirmOwnBets = this.props.gameStateContextModel.notConfirmOwnBets;
        const betChoices = {};
        Object.entries(notConfirmOwnBets).forEach(([key, value]) => {
            betChoices[key] = value;
        });

        this.socket.emit("bet", { betChoices });
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
        clearInterval(this.retryInterval);
    }

    clearDisconnectTimeout = () => {
        clearTimeout(this.disconnectTimeout);
    };

    setActiveScoreboardTab = (activeScoreboardTab: number) => {
        this.props.dispatch({
            type: GameEventActionType.ACTIVE_SCORE_BOARD,
            payload: { activeScoreboardTab },
        });
    };

    updateStatusShowResult = () => {
        if (this.props.gameStateContextModel.roundState === RoundState.DisplayResult) {
            this.props.dispatch({
                type: GameEventActionType.PLAY_RESULT_ANIMATION,
                payload: { playResultAnimation: false },
            });
        }
    };

    getChoiceNameOnHedgeBet(choiceKey) {
        return this.getGameTranslate(choiceKey);
    }

    getGameTranslate(key: string) {
        const t = this.props.translate;
        return `${t({ key })}`;
    }

    renderNotice() {
        return <Notice />;
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
        return (
            <>
                <GameHeader />
                <Settings
                    enabledSound={false}
                    onToggleSound={() => {
                        console.log("onToggleSound");
                    }}
                    toggleHistoryModal={() => {
                        this.props.dispatch({
                            type: GameEventActionType.TOGGLE_BET_HISTORY,
                            payload: {
                                isShowBetHistory: true,
                            },
                        });
                    }}
                    toggleGuideModal={() => {
                        console.log("toggleGuideModal");
                    }}
                />
            </>
        );
    }

    renderBetHistoryModal() {
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
        return <BetSettings />;
    }

    renderConfirmBet() {
        if (!this.props.gameStateContextModel.showConfirmBet) return null;
        return <ConfirmBet />;
    }

    renderConfirmDialog() {
        return <BetConfirmDialog />;
    }

    renderStatistic() {
        return <></>;
    }

    getRenderTemplate() {
        return (
            <>
                {this.renderHeaderBlock()}
                {this.renderMenuButtons()}
                {this.renderBetHistoryModal()}
                {this.renderResultBlock()}
                {this.renderNotice()}
                {this.renderBettingBlock()}
                {this.renderSlidingChips()}
                {this.renderConfirmDialog()}
                {this.renderConfirmBet()}
                {this.renderStatistic()}
                {this.renderScoreboards()}
                {<DummyHandler gameMessageHandler={this.gameMessageHandler} />}
            </>
        );
    }

    renderGame() {
        const gameActionsContext = {
            placeBet: this.placeBet,
            playAcceptedBetAnimation: this.playAcceptedBetAnimation,
            finishProcessingBet: () => {
                this.props.dispatch({ type: GameEventActionType.END_BET_PROCESSING, payload: {} });
                this.clearRetryInterval();
            },
            setActiveScoreboardTab: this.setActiveScoreboardTab,
            updateStatusShowResult: this.updateStatusShowResult,
        };

        return (
            <GameContextProvider value={{ ...this.props, gameMessageHandler: this.gameMessageHandler }}>
                <GameActionsContextProvider value={gameActionsContext}>{this.getRenderTemplate()}</GameActionsContextProvider>
            </GameContextProvider>
        );
    }

    protected retryConnect() {
        this.onStart();
    }

    render() {
        const { signedIn, roundState, disabledMessage, disconnectReason } = this.props.gameStateContextModel;
        return (
            <GameContainer>
                {signedIn ? this.renderGame() : <GameLoading />}
                {roundState === RoundState.Disabled && (
                    <DisabledModal
                        disableMessage={disabledMessage}
                        onSubmit={
                            //TODO: redirect to Saba play lobby
                            () => window.location.reload()
                        }
                    />
                )}
                {roundState === RoundState.ConnectFailed && (
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
