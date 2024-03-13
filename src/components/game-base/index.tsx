import React from "react";
import { createPortal } from "react-dom";
import Auth from "sc-user-service-client/dist/auth";
import { Socket } from "socket.io-client";
import { InitSocketIO, StorageHelper, localStorageKeys, writeDebugLog } from "../../_shared/helpers";
import {
    AuthContext,
    AuthContextModel,
    GameActionsContextProvider,
    GameContextProvider,
    SystemEventActionType,
} from "../../_shared/react-contexts";
import { GameEventActionType } from "../../_shared/react-contexts/game-state-context/game-event-action";
import { getBalance } from "../../services/auth-service";
import BetConfirmDialog from "../game-components/bet-confirm-dialog";
import ConfirmBet from "../game-components/confirm-bet";
import CountdownTimer from "../game-components/countdown-timer/countdown-timer";
import DisabledModal from "../game-components/disabled-modal";
import { ConnectFailedMessage } from "../game-components/error-message";
import { ConnectFailedReasonKey } from "../game-components/error-message/type";
import GameContainer from "../game-components/game-container";
import GameGuideModal from "../game-components/game-guide";
import GameLoading from "../game-components/game-loading";
import NewRoundTransition from "../game-components/new-round-transition";
import { Notice } from "../game-components/notice";
import PFSettingModal from "../game-components/pf-setting";
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
import { GameBaseProps, PFSettingData, RoundState } from "./type";

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
    private gameFinishHandler?: GameFinishHandler;
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
        gameFinishHandler?: GameFinishHandler,
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
        console.log(placeBetHandler);
        this.placeBetHandler =
            placeBetHandler ??
            new PlaceBetHandler({
                dispatch,
                gameMessageHandler: this.gameMessageHandler,
                gameName: this.props.gameName,
                getPlayerBalance: this.getPlayerBalance,
                hedgeBetGroups: this.props.hedgeBetGroups,
                translate: props.translate,
                playPlaceBetSound: () => {
                    this.props.gameSound.playPlaceBetSound();
                },
            });

        this.gameFinishHandler =
            gameFinishHandler ??
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
                gameStateContextModel: this.getGameStateContext.bind(this),
                roundStateHandler: roundStateHandler,
            });

        this.gameRoundHistoryHandler =
            gameRoundHistoryHandler ??
            new GameRoundHistoryHandler({ dispatch, gameStateContextModel: this.getGameStateContext.bind(this) });

        this.placeBet = this.placeBet.bind(this);
        this.updateUserBalance = this.updateUserBalance.bind(this);
        this.setActiveScoreboardTab = this.setActiveScoreboardTab.bind(this);
    }

    getGameStateContext = () => {
        return this.props.gameStateContextModel;
    };

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
        this.socket?.disconnect();
        this.savePFSetting();

        this.clearGameTimoutAndInterval();
        this.clearDisconnectTimeout();
    }

    clearGameTimoutAndInterval = () => {
        clearInterval(this.gameCronInterval);
        this.gameFinishHandler.clearTimeout();
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
        this.loadPFSetting();
        this.connectToGameService();
        !this.props.systemContextModel.isUserGesture &&
            this.props.systemDispatch({
                type: SystemEventActionType.SET_USER_GESTURE,
                payload: {
                    isUserGesture: true,
                },
            });
    }

    protected async connectToGameService() {
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
        this.gameMessageHandler.register(
            messageEventType.SEND_SOCKET_MESSAGE_WITH_CLIENT_SEED,
            this.sendSocketMessageWithClientSeed.bind(this)
        );
        this.playerHandler.registerEvents(setBalance);
        this.gameErrorHandler.registerEvents(signOut);
        this.gameFinishHandler.registerEvents();
        this.gameMessageHandler.register(messageEventType.ROUND_HISTORY, this.handleRoundHistory.bind(this));
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

    sendSocketMessageWithClientSeed = (message) => {
        const { event, data } = message[messageEventType.SEND_SOCKET_MESSAGE_WITH_CLIENT_SEED];
        const { pfSetting } = this.props.gameStateContextModel;
        const clientSeed = pfSetting?.useManualClientSeed ? pfSetting?.manualClientSeed : pfSetting?.randomClientSeed;

        this.socket.emit(event, { ...data, clientSeed });
    };

    loadPFSetting() {
        const uid = (this.context as AuthContextModel).authorizeInfo?.user?.UID;
        const pfSetting = StorageHelper.get<PFSettingData>(`${localStorageKeys.pfSetting}-${uid}`);
        this.props.dispatch({
            type: GameEventActionType.UPDATE_PF_SETTING,
            payload: {
                pfSetting: pfSetting,
            },
        });
    }

    savePFSetting() {
        const uid = (this.context as AuthContextModel).authorizeInfo?.user?.UID;
        const { pfSetting } = this.props.gameStateContextModel;
        StorageHelper.set(`${localStorageKeys.pfSetting}-${uid}`, pfSetting);
    }

    handleUM(gameMessage) {
        this.gameDisabledHandler.handleUM(gameMessage, this.timeCounter);
    }

    handleRoundHistory(gameMessage) {
        this.gameRoundHistoryHandler.handleRoundHistory(gameMessage);
    }

    handleRemainingTime({ remainingTime }) {
        writeDebugLog({ name: "recieve-remaining-time", remainingTime });
        const { durations, gameStateContextModel } = this.props;
        const { roundState, isUMInFirstLoad } = gameStateContextModel;

        if (roundState === RoundState.None || !isUMInFirstLoad) {
            this.roundTimeCounter = remainingTime;
            this.props.gameStateContextModel.remainingTime = this.roundStateHandler.getRemainingTime({ remainingTime, durations });
            this.runGame(this.props.gameStateContextModel.remainingTime);
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
        writeDebugLog({
            remainingTime,
            roundState: RoundState[gameStateContextModel.roundState],
            roundTimeCounter: this.roundTimeCounter,
            turnCounter: gameStateContextModel.turnCounter,
        });

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

        this.gameMessageHandler.broadcastGameEvent({ [messageEventType.ROUND_STATE]: newRoundState });

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
            const enableSound = StorageHelper.get(localStorageKeys.enableSound) ?? false;
            enableSound && this.playSound(gameStateContextModel.roundState);
        }
    }

    private playSound(roundState: RoundState) {
        const { stopBettingSound, receiveFinishSound, startRoundSound, startBettingSound } = this.props.gameSound;
        switch (roundState) {
            case RoundState.InRound:
                stopBettingSound();
                break;

            case RoundState.LockingBet:
                receiveFinishSound();
                break;

            case RoundState.DisplayResult:
                startRoundSound();
                startBettingSound();
                break;
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
        this.gameFinishHandler.handleFinish(finish, this.props.gameStateContextModel, this.props.durations);
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

    calculateOddsRange = (margin: any) => {
        return {};
    };

    renderNotice() {
        return <Notice />;
    }

    renderResultSection() {
        return null;
    }

    renderRoundIdSection() {
        return <></>;
    }
    renderHeaderBlock() {
        return (
            <>
                <div className="game-header">
                    {this.renderRoundIdSection()}
                    <div id="countdown-timer" className="countdown-timer">
                        <CountdownTimer />
                    </div>
                </div>
                <Settings />
            </>
        );
    }

    renderPFSettingModal() {
        return createPortal(<PFSettingModal />, document.getElementById("dashboard"));
    }

    renderBetHistoryModal() {
        return <></>;
    }

    renderGameGuideModal() {
        return createPortal(<GameGuideModal calculateOddsRange={this.calculateOddsRange} />, document.getElementById("dashboard"));
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
                {this.renderPFSettingModal()}
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
                    gameName={this.props.gameName}
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
