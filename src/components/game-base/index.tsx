import React from "react";
import { createPortal } from "react-dom";
import Auth from "sc-user-service-client/dist/auth";
import { Socket } from "socket.io-client";

import { InitSocketIO, localStorageKeys, StorageHelper, writeDebugLog } from "../../_shared/helpers";
import { AnalyticsHelper } from "../../_shared/helpers/analytic-helper";
import {
    GameActionsContextProvider,
    GameContextProvider,
    PlayerContext,
    PlayerContextModel,
    SystemEventActionType,
} from "../../_shared/react-contexts";
import { GameEventActionType } from "../../_shared/react-contexts/game-state-context/game-event-action";
import { GameResourceKeys } from "../../_shared/resources";
import { getBalance } from "../../services/auth-service";
import BetConfirmDialog from "../game-components/bet-confirm-dialog";
import ConfirmBet from "../game-components/confirm-bet";
import CountdownTimer from "../game-components/countdown-timer/countdown-timer";
import DisabledModal from "../game-components/disabled-modal";
import { ConnectFailedMessage } from "../game-components/error-message";
import { ConnectFailedReasonKey } from "../game-components/error-message/type";
import Footer from "../game-components/footer";
import GameContainer from "../game-components/game-container";
import GameGuideModal from "../game-components/game-guide";
import GameLoading from "../game-components/game-loading";
import { LoadingSpinner } from "../game-components/game-loading/loading-spinner";
import NewRoundTransition from "../game-components/new-round-transition";
import { Notice } from "../game-components/notice";
import { PFSettingModal } from "../game-components/provably-fair";
import { Settings } from "../game-components/settings";
import BetSettings from "../page-components/bet-settings";
import { IRoundStateHandler } from "../round-base/round-state-handler";
import {
    GameDisableHandler,
    GameErrorHandler,
    GameFinishHandler,
    GameMessageHandler,
    GameRoundHistoryHandler,
    messageEventType,
    PlaceBetHandler,
    PlayerHandler,
} from "./handlers";
import { GameRoundDataHandler } from "./handlers/game-round-data-handler";
import { GameSoundHandler } from "./handlers/game-sound-handler";
import { IGameStateHandler } from "./handlers/game-state-handler";
import { GameBaseProps, PFClientSeedSetting, RoundState } from "./type";
import { SwiperNoSwiping } from "../../_shared/constants";
import BackgroundGalaxy from "../page-components/background";

abstract class GameBase<P extends GameBaseProps> extends React.PureComponent<P> {
    protected socket: Socket;
    protected gameCronInterval: NodeJS.Timeout;
    protected roundTimeCounter: number;
    protected timeCounter: number;
    protected authService: Auth;
    private disconnectTimeout: NodeJS.Timeout;
    private readonly gameMessageHandler: GameMessageHandler;
    private readonly roundStateHandler: IRoundStateHandler;
    private readonly gameStateHandler: IGameStateHandler;
    private readonly gameErrorHandler: GameErrorHandler;
    private readonly playerHandler: PlayerHandler;
    private readonly placeBetHandler: PlaceBetHandler;
    private readonly gameFinishHandler?: GameFinishHandler;
    private readonly gameDisabledHandler?: GameDisableHandler;
    private readonly gameRoundHistoryHandler?: GameRoundHistoryHandler;
    private readonly gameSoundHandler?: GameSoundHandler;
    private readonly gameRoundDatatHandler?: GameRoundDataHandler;

    constructor(
        props: P,
        roundStateHandler: IRoundStateHandler,
        gameStateHandler: IGameStateHandler,
        gameMessageHandler: GameMessageHandler,
        gameRoundDatatHandler: GameRoundDataHandler,
        gameErrorHandler?: GameErrorHandler,
        playerHandler?: PlayerHandler,
        placeBetHandler?: PlaceBetHandler,
        gameFinishHandler?: GameFinishHandler,
        gameDisabledHandler?: GameDisableHandler,
        gameRoundHistoryHandler?: GameRoundHistoryHandler,
        gameSoundHandler?: GameSoundHandler
    ) {
        super(props);

        const { dispatch } = this.props;
        const gamName = this.props.translate(`${GameResourceKeys.GAME_NAME}_${this.props.id}`);
        this.roundStateHandler = roundStateHandler;
        this.gameStateHandler = gameStateHandler;
        this.gameMessageHandler = gameMessageHandler;
        this.gameRoundDatatHandler = gameRoundDatatHandler ?? new GameRoundDataHandler();
        this.gameErrorHandler =
            gameErrorHandler ??
            new GameErrorHandler({
                dispatch,
                gameMessageHandler: this.gameMessageHandler,
                gamName,
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
                tolgeeNamespace: this.props.tolgeeNamespace,
                dispatch,
                gameMessageHandler: this.gameMessageHandler,
                gameName: gamName,
                getPlayerBalance: this.getPlayerBalance,
                hedgeBetGroups: this.props.hedgeBetGroups,
                translate: props.translate,
                playPlaceBetSound: () => {
                    this.props.gameSound.playPlaceBetSound();
                },
                gameId: this.props.id,
            });

        this.gameFinishHandler =
            gameFinishHandler ??
            new GameFinishHandler({
                dispatch,
                gameMessageHandler: this.gameMessageHandler,
                placeBetHandler: this.placeBetHandler,
                durations: this.props.durations,
                roundStateHandler: this.roundStateHandler,
                runGame: (remainingTime: number) => this.runGame(remainingTime),
                gameId: this.props.id,
                gameStateContextModel: this.getGameStateContext.bind(this),
                gameRoundDatatHandler: this.gameRoundDatatHandler,
            });

        this.gameDisabledHandler =
            gameDisabledHandler ??
            new GameDisableHandler({
                dispatch,
                gameMessageHandler: this.gameMessageHandler,
                durations: this.props.durations,
                gameStateContextModel: this.getGameStateContext.bind(this),
                roundStateHandler: roundStateHandler,
            });

        this.gameRoundHistoryHandler =
            gameRoundHistoryHandler ??
            new GameRoundHistoryHandler({ dispatch, gameStateContextModel: this.getGameStateContext.bind(this) });

        this.gameSoundHandler =
            gameSoundHandler ??
            new GameSoundHandler({
                gameSound: this.getGameSound.bind(this),
            });

        this.placeBet = this.placeBet.bind(this);
        this.updateUserBalance = this.updateUserBalance.bind(this);
        this.setActiveScoreboardTab = this.setActiveScoreboardTab.bind(this);
        this.syncPFSetting = this.syncPFSetting.bind(this);

        AnalyticsHelper.trackPage({ page_title: this.props.gameName });
    }

    getGameStateContext = () => {
        return this.props.gameStateContextModel;
    };

    getGameSound = () => {
        return this.props.gameSound;
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
        return (this.context as PlayerContextModel).authorizeInfo.user.red;
    };

    onDestroy() {
        this.props.dispatch({
            type: GameEventActionType.SIGN_OUT,
            payload: { roundState: RoundState.None },
        });
        this.socket?.disconnect();

        this.clearGameTimeoutAndInterval();
        this.clearDisconnectTimeout();
    }

    clearGameTimeoutAndInterval = () => {
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
        this.loadAuthorizeUserSetting();
        this.connectToGameService();
        this.gameStateHandler.setReturnToGameState(this.props.dispatch);
        this.cancelConfirmBetAndResetBets();
    }

    protected async connectToGameService() {
        const { session } = this.context as PlayerContextModel;
        const { socketInfo, gameName } = this.props;
        const { socket } = InitSocketIO(socketInfo, session, gameName, this.gameMessageHandler);

        this.socket = socket;
    }

    cancelConfirmBetAndResetBets = () => {
        const { dispatch } = this.props;
        dispatch({
            type: GameEventActionType.NOT_CONFIRM_OWN_BETS,
            payload: {
                notConfirmOwnBets: {},
            },
        });
        dispatch({
            type: GameEventActionType.SHOW_CONFIRM_BET,
            payload: {
                showConfirmBet: false,
            },
        });
    };

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
        const signOut = (this.context as PlayerContextModel)?.signOut;

        this.gameMessageHandler.register(messageEventType.SOCKET_CONNECTED, this.onGameServiceConnected.bind(this));
        this.gameMessageHandler.register(messageEventType.SOCKET_CONNECT_ERROR, this.onConnectFailed.bind(this));
        this.gameMessageHandler.register(messageEventType.SOCKET_DISCONNECTED, this.onSocketDisconnect.bind(this));
        this.gameMessageHandler.register(messageEventType.UNDER_MAINTENANCE, this.handleUM.bind(this));
        this.gameMessageHandler.register(messageEventType.REMAINING_TIME, this.handleRemainingTime.bind(this));
        this.gameFinishHandler.registerEvents();
        this.placeBetHandler.registerEvents(signOut, this.props.gameStateContextModel);
        this.gameMessageHandler.register(messageEventType.GAME_DESTROY, this.onDestroy.bind(this));
        this.gameMessageHandler.register(messageEventType.CLEAR_GAME_TIMEOUT_AND_INTERVAL, this.clearGameTimeoutAndInterval.bind(this));
        this.gameMessageHandler.register(messageEventType.SEND_SOCKET_MESSAGE, this.sendSocketMessage.bind(this));
        this.gameMessageHandler.register(messageEventType.UPDATE_PLAYER_BALANCE, this.updateUserBalance.bind(this));
        this.gameMessageHandler.register(
            messageEventType.SEND_SOCKET_MESSAGE_WITH_CLIENT_SEED,
            this.sendSocketMessageWithClientSeed.bind(this)
        );
        this.playerHandler.registerEvents();
        this.gameErrorHandler.registerEvents(signOut);
        this.gameMessageHandler.register(messageEventType.ROUND_HISTORY, this.handleRoundHistory.bind(this));
        this.gameMessageHandler.register(messageEventType.SAVE_PF_SETTING, this.handleSavePFSetting.bind(this));
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
        const { pfClientSeedSetting } = this.props.gameStateContextModel;
        const clientSeed = pfClientSeedSetting?.useManualClientSeed
            ? pfClientSeedSetting?.manualClientSeed
            : pfClientSeedSetting?.randomClientSeed;
        const clientSeedDetail = {
            randomClientSeed: pfClientSeedSetting?.randomClientSeed,
            manualClientSeed: pfClientSeedSetting?.manualClientSeed,
            useManualClientSeed: pfClientSeedSetting?.useManualClientSeed,
        };

        this.socket.emit(event, { ...data, clientSeed, clientSeedDetail });
    };

    loadQuickBetSetting() {
        const isEnableQuickBet = (this.context as PlayerContextModel).authorizeInfo?.user?.settings.quickBet;
        this.props.systemDispatch({
            type: SystemEventActionType.SET_QUICK_BET,
            payload: {
                isEnableQuickBet,
            },
        });
    }

    loadAuthorizeUserSetting() {
        this.loadQuickBetSetting();
        this.loadPFSetting();
    }

    loadPFSetting() {
        const uid = (this.context as PlayerContextModel).authorizeInfo?.user?.UID;
        const pfClientSeedSetting = StorageHelper.get<PFClientSeedSetting>(`${localStorageKeys.pfSetting}-${uid}-${this.props.id}`);
        if (pfClientSeedSetting) {
            this.props.dispatch({
                type: GameEventActionType.UPDATE_PF_CLIENT_SEED_SETTING,
                payload: {
                    pfClientSeedSetting: {
                        ...pfClientSeedSetting,
                        manualClientSeed:
                            pfClientSeedSetting?.manualClientSeed?.length <= 0 && pfClientSeedSetting?.useManualClientSeed
                                ? pfClientSeedSetting?.randomClientSeed
                                : pfClientSeedSetting?.manualClientSeed,
                    },
                },
            });
        }
    }

    handleSavePFSetting(message) {
        const { pfClientSeedSetting } = message[messageEventType.SAVE_PF_SETTING];
        this.syncPFSetting(pfClientSeedSetting);
        this.props.dispatch({ type: GameEventActionType.UPDATE_PF_CLIENT_SEED_SETTING, payload: { pfClientSeedSetting } });
    }

    syncPFSetting(pfClientSeedSetting) {
        const uid = (this.context as PlayerContextModel).authorizeInfo?.user?.UID;
        const { pfClientSeedSetting: oldPFClientSeedSetting } = this.props.gameStateContextModel;
        const dataPFSettingSave = {
            ...oldPFClientSeedSetting,
            ...pfClientSeedSetting,
        };
        StorageHelper.set(`${localStorageKeys.pfSetting}-${uid}-${this.props.id}`, dataPFSettingSave);
    }

    handleUM(gameMessage) {
        this.gameDisabledHandler.handleUM(gameMessage, this.timeCounter);
    }

    handleRoundHistory(gameMessage) {
        this.gameRoundHistoryHandler.handleRoundHistory(gameMessage);
    }

    handleRemainingTime({ remainingTime }) {
        const { durations, gameStateContextModel } = this.props;
        const { roundState, isUMInFirstLoad } = gameStateContextModel;

        if (roundState === RoundState.None || !isUMInFirstLoad) {
            this.roundTimeCounter = remainingTime;
            const clientRemainingTime = this.roundStateHandler.getRemainingTime({ remainingTime, durations });
            this.broadcastClientRemainingTime(clientRemainingTime);
            this.runGame(clientRemainingTime);
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

        this.broadcastClientRemainingTime(remainingTime);

        const newRoundState = this.roundStateHandler.determineRoundBaseState({
            roundRemainingTime: this.roundTimeCounter,
            wholeRound: durations.wholeRound,
            remainingTime,
            durations,
        });

        this.gameMessageHandler.broadcastGameEvent({ [messageEventType.ROUND_STATE]: newRoundState });

        if (gameStateContextModel.roundState !== newRoundState) {
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

            writeDebugLog({
                name: "change-round-state",
                currentRoundState: RoundState[gameStateContextModel.roundState],
                newRoundState: RoundState[newRoundState],
                ...newGameState,
            });

            dispatch({
                type: GameEventActionType.SET_NEW_GAME_STATE,
                payload: { newGameState },
            });
            this.gameSoundHandler.handleSound(gameStateContextModel.roundState);
        }
    }

    broadcastClientRemainingTime = (clientRemainingTime: number) => {
        this.gameMessageHandler.broadcastGameEvent({ [messageEventType.CLIENT_REMAINING_TIME]: clientRemainingTime });
    };

    async updateUserBalance() {
        const authContext = this.context as PlayerContextModel;
        const balanceResponse = await getBalance(authContext?.session);
        if (balanceResponse.isSuccessful) {
            authContext?.setBalance(balanceResponse.balance);
        } else {
            this.props.setApiErrorMessage(balanceResponse.errorCode);
        }
    }

    placeBet(betChoice: string, amount: number) {
        const enabledQuickBet = (this.context as PlayerContextModel).authorizeInfo?.user?.settings?.quickBet;

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
            <div className="game-header">
                {this.renderRoundIdSection()}
                <div id="countdown-timer" className="countdown-timer">
                    <CountdownTimer />
                </div>

                <Settings />
            </div>
        );
    }

    renderPFSettingModal() {
        return createPortal(<PFSettingModal />, document.getElementById("dashboard"));
    }

    renderBetHistoryModal() {
        return <></>;
    }

    renderGameGuideModal() {
        return createPortal(<GameGuideModal />, document.getElementById("dashboard"));
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
        const { gameConfigs, userStakeLevel } = this.props.gameStateContextModel;
        return <BetSettings gameConfigs={gameConfigs} userStakeLevel={userStakeLevel} />;
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
                <BackgroundGalaxy gameId={this.props.id} />
                <>
                    <div className="game-area">
                        <div>{this.renderHeaderBlock()}</div>
                        <div>{this.renderResultBlock()}</div>
                        <div>{this.renderBettingBlock()}</div>
                        <div className={SwiperNoSwiping}> {this.renderSlidingChips()}</div>
                        <div>{this.renderStatistic()}</div>
                        <div className={SwiperNoSwiping}>  {this.renderScoreboards()}</div>
                        <Footer />
                    </div>
                    {this.renderGameGuideModal()}
                    {this.renderMenuButtons()}
                    {this.renderPFSettingModal()}
                    {this.renderBetHistoryModal()}
                    {this.renderNewRoundTransition()}
                    {this.renderNotice()}
                    {this.renderConfirmDialog()}
                    {this.renderConfirmBet()}
                </>
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
                {roundState === RoundState.None && <LoadingSpinner />}
                {this.renderDisableGamePopup(roundState, disabledMessage)}
                {this.renderConnectFailed(roundState, disconnectReason)}
            </GameContainer>
        );
    }

    private renderConnectFailed(roundState: RoundState, disconnectReason: string): React.ReactNode {
        const { tolgeeNamespace, id } = this.props;

        return (
            roundState === RoundState.ConnectFailed && (
                <ConnectFailedMessage
                    tolgeeNamespace={tolgeeNamespace}
                    id={id}
                    onReconnect={this.retryConnect.bind(this)}
                    reason={disconnectReason}
                    enableBackdrop={true}
                />
            )
        );
    }

    private renderDisableGamePopup(roundState: RoundState, disabledMessage: string): React.ReactNode {
        return roundState === RoundState.Disabled && <DisabledModal disableMessage={disabledMessage} />;
    }
}

GameBase.contextType = PlayerContext;

export default GameBase;
