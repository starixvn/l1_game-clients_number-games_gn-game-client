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
    GameErrorHandler,
    GameMessageHandler,
    messageEventType,
    PlayerHandler,
    PlaceBetHandler,
    GameFinishHandler,
    GameMessageDummyHandler,
} from "./handlers";
import { GameBaseProps, RoundState } from "./type";
import { IGameStateHandler } from "./handlers/game-state-handler";

abstract class GameBase<P extends GameBaseProps> extends React.PureComponent<P> {
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
    private placeBetHandler: PlaceBetHandler;
    private gameFishishHandler?: GameFinishHandler;

    constructor(
        props: P,
        roundStateHandler: IRoundStateHandler,
        gameStateHandler: IGameStateHandler,
        gameMessageHandler: GameMessageHandler,
        gameErrorHandler?: GameErrorHandler,
        playerHandler?: PlayerHandler,
        placeBetHandler?: PlaceBetHandler,
        gameFishishHandler?: GameFinishHandler
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

        this.placeBetHandler =
            placeBetHandler ??
            new PlaceBetHandler({
                dispatch: props.dispatch,
                gameMessageHandler: this.gameMessageHandler,
                gameName: this.props.gameName,
                getPlayerBalance: this.getPlayerBalance,
                hedgeBetGroup: this.hedgeBetGroup,
                translate: props.translate,
                playPlaceBetSound: props.playPlaceBetSound,
            });

        this.gameFishishHandler =
            gameFishishHandler ??
            new GameFinishHandler({
                dispatch: props.dispatch,
                gameMessageHandler: this.gameMessageHandler,
                gameName: this.props.gameName,
            });

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

        clearInterval(this.interval);
        this.gameFishishHandler.clearTimeout();
        this.placeBetHandler.clearRetryInterval();
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
        this.placeBetHandler.registerEvents((this.context as AuthContextModel)?.signOut, this.props.gameStateContextModel);
        this.gameMessageHandler.register(messageEventType.GAME_DESTROY, this.onDestroy.bind(this));
        this.gameMessageHandler.register(messageEventType.SEND_SOCKET_MESSAGE, this.sendSocketMessage.bind(this));
        this.gameMessageHandler.register(messageEventType.UPDATE_PLAYER_BALANCE, this.updateUserBalance.bind(this));
        this.playerHandler.registerEvents((this.context as AuthContextModel)?.setBalance);
        this.gameErrorHandler.registerEvents((this.context as AuthContextModel)?.signOut);
    }

    emitSocketEvent = ({ key, data }) => {
        this.socket?.emit(key, data);
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

    sendSocketMessage = (message) => {
        const { event, data } = message[messageEventType.SEND_SOCKET_MESSAGE];
        this.socket.emit(event, data);
    };

    handleUM({ um, um_message, remainingTime }) {
        const { durations, gameStateContextModel } = this.props;
        const wholeRound = this.roundStateHandler.getWholeRoundDuration({ durations });

        this.props.dispatch({
            type: GameEventActionType.SET_UM_FIRST_LOADING,
            payload: { umFirstLoading: um && remainingTime && remainingTime + 1 === wholeRound },
        });

        if (
            um &&
            (this.timeCounter <= durations.placingBets + durations.beforeStartRound + 1 ||
                remainingTime + 1 === wholeRound ||
                gameStateContextModel.roundState === RoundState.None)
        ) {
            this.interval && clearInterval(this.interval);
            this.gameFishishHandler.clearTimeout();
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
        this.placeBetHandler.placeBet(betChoice, amount, this.props.gameStateContextModel, this.props.systemContextModel);
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
        if (!this.props.gameStateContextModel.showConfirmBet) return null;
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
                {<GameMessageDummyHandler gameMessageHandler={this.gameMessageHandler} />}
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
