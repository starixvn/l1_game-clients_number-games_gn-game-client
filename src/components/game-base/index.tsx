import React from "react";
import Auth from "sc-user-service-client/dist/auth";
import { Socket } from "socket.io-client";
import { InitSocketIO } from "../../_shared/helpers";
import { AuthContext, AuthContextModel, GameActionsContextProvider, GameContextProvider } from "../../_shared/react-contexts";
import { GameEventActionType } from "../../_shared/react-contexts/game-state-context/game-event-action";
import { GameResourceKeys } from "../../_shared/resources";
import { getBalance } from "../../services/auth-service";
import BetConfirmDialog from "../game-components/bet-confirm-dialog";
import ConfirmBet from "../game-components/confirm-bet";
import DisabledModal from "../game-components/disabled-modal";
import { ConnectFailedMessage } from "../game-components/error-message";
import { ConnectFailedReasonKey } from "../game-components/error-message/type";
import GameContainer from "../game-components/game-container";
import { GameHeader } from "../game-components/game-header";
import GameLoading from "../game-components/game-loading";
import NewRoundTransition from "../game-components/new-round-transition";
import { Notice } from "../game-components/notice";
import { Settings } from "../game-components/settings";
import BetSettings from "../page-components/bet-settings";
import { IRoundStateHandler } from "../round-base/round-state-handler";
import {
    GameDisableHandler,
    GameErrorHandler,
    GameFinishHandler,
    GameMessageHandler,
    GameRoundHistoryHandler,
    PlaceBetHandler,
    PlayerHandler,
    messageEventType,
} from "./handlers";
import { IGameStateHandler } from "./handlers/game-state-handler";
import { GameBaseProps, RoundState } from "./type";

abstract class GameBase<P extends GameBaseProps> extends React.PureComponent<P> {
    protected socket: Socket;
    protected gameCronInterval: NodeJS.Timeout;
    protected roundTimeCounter: number;
    protected timeCounter: number;
    protected authService: Auth;
    private disconnectTimeout: NodeJS.Timeout;
    private gameMessageHandler: GameMessageHandler;
    private roundStateHandler: IRoundStateHandler;
    private gameStateHandler: IGameStateHandler;
    private gameErrorHandler: GameErrorHandler;
    private playerHandler: PlayerHandler;
    private placeBetHandler: PlaceBetHandler;
    private gameFishishHandler?: GameFinishHandler;
    private gameDisabledHandler?: GameDisableHandler;
    private gameRoundHistoryHandler?: GameRoundHistoryHandler;

    constructor(
        props: P,
        roundStateHandler: IRoundStateHandler,
        gameStateHandler: IGameStateHandler,
        gameMessageHandler: GameMessageHandler,
        gameErrorHandler?: GameErrorHandler,
        playerHandler?: PlayerHandler,
        placeBetHandler?: PlaceBetHandler,
        gameFishishHandler?: GameFinishHandler,
        gameDisabledHandler?: GameDisableHandler,
        gameRoundHistoryHandler?: GameRoundHistoryHandler
    ) {
        super(props);

        const { dispatch, gameStateContextModel } = this.props;

        this.roundStateHandler = roundStateHandler;
        this.gameStateHandler = gameStateHandler;
        this.gameMessageHandler = gameMessageHandler;
        this.gameErrorHandler =
            gameErrorHandler ??
            new GameErrorHandler({
                dispatch,
                gameMessageHandler: this.gameMessageHandler,
                gameName: this.props.gameName,
            });

        this.playerHandler =
            playerHandler ??
            new PlayerHandler({
                dispatch,
                gameMessageHandler: this.gameMessageHandler,
                gameName: this.props.gameName,
            });

        this.placeBetHandler =
            placeBetHandler ??
            new PlaceBetHandler({
                dispatch,
                gameMessageHandler: this.gameMessageHandler,
                gameName: this.props.gameName,
                getPlayerBalance: this.getPlayerBalance,
                hedgeBetGroups: this.props.hedgeBetGroups,
                translate: props.translate,
                playPlaceBetSound: props.playPlaceBetSound,
            });

        this.gameFishishHandler =
            gameFishishHandler ??
            new GameFinishHandler({
                dispatch,
                gameMessageHandler: this.gameMessageHandler,
                gameName: this.props.gameName,
            });

        this.gameDisabledHandler =
            gameDisabledHandler ??
            new GameDisableHandler({
                dispatch,
                gameMessageHandler: this.gameMessageHandler,
                gameName: this.props.gameName,
                durations: this.props.durations,
                gameStateContextModel,
                roundStateHandler: roundStateHandler,
            });

        this.gameRoundHistoryHandler =
            gameRoundHistoryHandler ??
            new GameRoundHistoryHandler({ dispatch, gameStateContextModel });

        this.placeBet = this.placeBet.bind(this);
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

    getPlayerBalance = () => {
        return (this.context as AuthContextModel).authorizeInfo.user.red;
    };

    onDestroy() {
        this.props.dispatch({
            type: GameEventActionType.SIGN_OUT,
            payload: { roundState: RoundState.None },
        });

        this.clearGameTimoutAndInterval();
        this.clearDisconnectTimeout();
    }

    clearGameTimoutAndInterval = () => {
        clearInterval(this.gameCronInterval);
        this.gameFishishHandler.clearTimeout();
        this.placeBetHandler.clearRetryInterval();
    };

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
        const signOut = (this.context as AuthContextModel)?.signOut;
        const setBalance = (this.context as AuthContextModel)?.setBalance;

        this.gameMessageHandler.register(messageEventType.SOCKET_CONNECTED, this.onGameServiceConnected.bind(this));
        this.gameMessageHandler.register(messageEventType.SOCKET_CONNECT_ERROR, this.onConnectFailed.bind(this));
        this.gameMessageHandler.register(messageEventType.SOCKET_DISCONNECTED, this.onSocketDisconnect.bind(this));
        this.gameMessageHandler.register(messageEventType.UNDER_MAINTENANCE, this.handleUM.bind(this));
        this.gameMessageHandler.register(messageEventType.REMAINING_TIME, this.handleRemainingTime.bind(this));
        this.gameMessageHandler.register(messageEventType.FINISH, this.handleFinish.bind(this));
        this.placeBetHandler.registerEvents(signOut, this.props.gameStateContextModel);
        this.gameMessageHandler.register(messageEventType.GAME_DESTROY, this.onDestroy.bind(this));
        this.gameMessageHandler.register(messageEventType.CLEAR_GAME_TIMEOUT_AND_INTERVAL, this.clearGameTimoutAndInterval.bind(this));
        this.gameMessageHandler.register(messageEventType.SEND_SOCKET_MESSAGE, this.sendSocketMessage.bind(this));
        this.gameMessageHandler.register(messageEventType.UPDATE_PLAYER_BALANCE, this.updateUserBalance.bind(this));
        this.playerHandler.registerEvents(setBalance);
        this.gameErrorHandler.registerEvents(signOut);
        this.gameFishishHandler.registerEvents();
        this.gameMessageHandler.register(messageEventType.ROUND_HISTORY, this.handlRoundHistory.bind(this));
    }

    emitSocketEvent = ({ key, data }) => {
        this.socket?.emit(key, data);
    };

    get defaultResult() {
        return null;
    }

    get defaultSettlementResult() {
        return null;
    }

    sendSocketMessage = (message) => {
        const { event, data } = message[messageEventType.SEND_SOCKET_MESSAGE];
        this.socket.emit(event, data);
    };

    handleUM(gameMessage) {
        this.gameDisabledHandler.handleUM(gameMessage, this.timeCounter);
    }

    handlRoundHistory(gameMessage) {
        this.gameRoundHistoryHandler.handleRoundHistory(gameMessage);
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

        this.gameCronInterval && clearInterval(this.gameCronInterval);
        this.gameCronInterval = setInterval(() => {
            const newRoundState = this.roundStateHandler.determineRoundBaseState({
                roundRemainingTime: this.roundTimeCounter,
                wholeRound: wholeRound,
                remainingTime: this.timeCounter,
                durations,
            });

            this.roundTimeCounter = this.roundTimeCounter - 1;

            if (this.timeCounter > 0 && this.roundStateHandler.shouldCountDownTimer({ newRoundState })) {
                this.timeCounter = this.timeCounter - 1;
            }

            this.handleGamePlay(this.timeCounter);
        }, 1000);

        this.handleGamePlay(remainingTime);
    }

    handleGamePlay(remainingTime: number) {
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

    handleFinish(finish) {
        this.placeBetHandler.clearRetryInterval();
        this.gameFishishHandler.handleFinish(finish, this.props.gameStateContextModel, this.props.durations);
        this.runGame(this.roundStateHandler.getWholeRoundDuration({ durations: this.props.durations }));
    }

    placeBet(betChoice: string, amount: number) {
        const enabledQuickBet = (this.context as AuthContextModel).authorizeInfo?.user?.settings?.quickBet;

        this.placeBetHandler.placeBet(betChoice, amount, enabledQuickBet, this.props.gameStateContextModel, this.props.systemContextModel);
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

    getGameTranslate(key: string) {
        const t = this.props.translate;
        return `${t({ key })}`;
    }

    renderNotice() {
        return <Notice />;
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
                        this.props.dispatch({
                            type: GameEventActionType.TOGGLE_GAME_GUIDE,
                            payload: {
                                isShowGameGuide: true,
                            },
                        });
                    }}
                />
            </>
        );
    }

    renderBetHistoryModal() {
        return <></>;
    }

    renderGameGuideModal() {
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
        return <ConfirmBet />;
    }

    renderConfirmDialog() {
        return <BetConfirmDialog />;
    }

    renderStatistic() {
        return <></>;
    }

    renderNewRoundTransition() {
        return <NewRoundTransition />;
    }

    getRenderTemplate() {
        return (
            <>
                {this.renderHeaderBlock()}
                {this.renderGameGuideModal()}
                {this.renderMenuButtons()}
                {this.renderBetHistoryModal()}
                {this.renderResultBlock()}
                {this.renderNewRoundTransition()}
                {this.renderNotice()}
                {this.renderBettingBlock()}
                {this.renderSlidingChips()}
                {this.renderConfirmDialog()}
                {this.renderConfirmBet()}
                {this.renderStatistic()}
                {this.renderScoreboards()}
            </>
        );
    }

    renderGame() {
        const gameActionsContext = {
            placeBet: this.placeBet,
            playAcceptedBetAnimation: this.placeBetHandler.playAcceptedBetAnimation,
            finishProcessingBet: () => {
                this.props.dispatch({ type: GameEventActionType.END_BET_PROCESSING, payload: {} });
                this.placeBetHandler.clearRetryInterval();
            },
            setActiveScoreboardTab: this.setActiveScoreboardTab,
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
                {this.renderDisableGamePopup(roundState, disabledMessage)}
                {this.renderConnectFailed(roundState, disconnectReason)}
            </GameContainer>
        );
    }

    private renderConnectFailed(roundState: RoundState, disconnectReason: string): React.ReactNode {
        return (
            roundState === RoundState.ConnectFailed && (
                <ConnectFailedMessage
                    gameName={`${this.props.gameName.toLowerCase()}:${GameResourceKeys.GAME_NAME}`}
                    onSubmit={
                        ConnectFailedReasonKey.restrictPlayPermission === disconnectReason
                            ? () => window.location.reload()
                            : this.retryConnect.bind(this)
                    }
                    reason={disconnectReason}
                />
            )
        );
    }

    private renderDisableGamePopup(roundState: RoundState, disabledMessage: string): React.ReactNode {
        return (
            roundState === RoundState.Disabled && (
                <DisabledModal
                    disableMessage={disabledMessage}
                    onSubmit={
                        //TODO: redirect to Saba play lobby
                        () => window.location.reload()
                    }
                />
            )
        );
    }
}

GameBase.contextType = AuthContext;

export default GameBase;
