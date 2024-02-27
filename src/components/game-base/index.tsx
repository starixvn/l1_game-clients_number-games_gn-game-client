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
import { getBalance } from "../../services/auth-service";
import ConfirmBet from "../game-components/confirm-bet";
import DisabledModal from "../game-components/disabled-modal";
import { ConnectFailedMessage } from "../game-components/error-message";
import { ConnectFailedReasonKey } from "../game-components/error-message/type";
import GameContainer from "../game-components/game-container";
import { GameHeader } from "../game-components/game-header";
import GameLoading from "../game-components/game-loading";
import { Notice } from "../game-components/notice";
import ConfirmDialog from "../game-components/submit-dialog";
import BetSettings from "../page-components/bet-settings";
import { IRoundStateHandler } from "../round-base/round-state-handler";
import { GameMessageHandler, messageEventType } from "./game-message-handler";
import { IGameStateHandler } from "./game-state-handler";
import { GameBaseProps, PopupType, RoundState } from "./type";
import { Settings } from "../game-components/settings";

abstract class GameBase<P extends GameBaseProps> extends React.PureComponent<P> {
    private readonly animationTime = 3000;
    protected showResultInfoTimeout: NodeJS.Timeout;
    protected showWinningAnimationTimeout: NodeJS.Timeout;
    protected isProcessingBet = false;
    private retryInterval: NodeJS.Timeout;
    protected socket: Socket;
    protected interval: NodeJS.Timeout;
    protected roundTimeCounter: number;
    protected timeCounter: number;
    protected authService: Auth;
    protected hedgeBetGroup: string[] = [];
    private isConnectFailed = false;
    private disconnectTimeout: NodeJS.Timeout;
    private gameMessageHandler: GameMessageHandler;
    private roundStateHandler: IRoundStateHandler;
    private gameStateHandler: IGameStateHandler;

    constructor(
        props: P,
        roundStateHandler: IRoundStateHandler,
        gameStateHandler: IGameStateHandler,
        gameMessageHandler: GameMessageHandler
    ) {
        super(props);

        this.roundStateHandler = roundStateHandler;
        this.gameStateHandler = gameStateHandler;
        this.gameMessageHandler = gameMessageHandler;

        this.openPopup = this.openPopup.bind(this);
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
            payload: {
                roundState: RoundState.None,
            },
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
        this.isConnectFailed = false;
        this.isProcessingBet = false;
        this.clearDisconnectTimeout();
        this.registerMessageHandler();
        this.connectToGameService();
    }

    protected connectToGameService() {
        const { session } = this.context as AuthContextModel;
        const { socketInfo, gameName } = this.props;

        const { socket } = InitSocketIO(socketInfo, session, gameName, this.gameMessageHandler);

        this.socket = socket;
    }

    onVisibilityChange = () => {
        const visibleState = document.visibilityState;
        visibleState === "hidden" ? this.onDestroy() : this.onStart();
    };

    onConnectFailed() {
        this.onDestroy();
        this.props.dispatch({
            type: GameEventActionType.DISCONNECT_ERROR,
            payload: {
                disconnectReason: ConnectFailedReasonKey.lostConnection,
            },
        });
    }

    onSocketDisconnect() {
        this.onDestroy();
        const time = this.props.gameStateContextModel.signedIn ? 1000 : 5000;

        this.disconnectTimeout = setTimeout(() => {
            this.isConnectFailed = true;
            if (!this.props.gameStateContextModel.signedIn) {
                this.props.dispatch({
                    type: GameEventActionType.DISCONNECT_ERROR,
                    payload: {
                        disconnectReason: ConnectFailedReasonKey.lostConnection,
                    },
                });
            }
        }, time);
    }

    onGameServiceConnected() {
        this.clearDisconnectTimeout();
        this.props.dispatch({
            type: GameEventActionType.CONNECT,
            payload: {
                isConnect: true,
            },
        });
    }

    registerMessageHandler() {
        this.gameMessageHandler.register(messageEventType.SOCKET_CONNECTED, this.onGameServiceConnected.bind(this));
        this.gameMessageHandler.register(messageEventType.SOCKET_CONNECT_ERROR, this.onConnectFailed.bind(this));
        this.gameMessageHandler.register(messageEventType.SOCKET_DISCONNECTED, this.onSocketDisconnect.bind(this));
        this.gameMessageHandler.register(messageEventType.UNDER_MAINTENANCE, this.handleUM.bind(this));
        this.gameMessageHandler.register(messageEventType.REMAINING_TIME, this.handleRemainingTime.bind(this));
        this.gameMessageHandler.register(messageEventType.FINISH, this.handleFinish.bind(this));
        this.gameMessageHandler.register(messageEventType.STATUS, this.handleStatus.bind(this));
        this.gameMessageHandler.register(messageEventType.USER, this.handleUserData.bind(this));
        this.gameMessageHandler.register(messageEventType.OWN_BETS, this.handleOwnBets.bind(this));
        this.gameMessageHandler.register(messageEventType.END_BET, this.handleEndBet.bind(this));
        this.gameMessageHandler.register(messageEventType.API_ERROR, this.handleApiError.bind(this));
        this.gameMessageHandler.register(messageEventType.USER_STAKE_LEVEL, this.handleUserStakeLevel.bind(this));
        this.gameMessageHandler.register(messageEventType.DRAW_ID, this.handleDrawId.bind(this));
        this.gameMessageHandler.register(messageEventType.ROUND_HISTORY, this.handleRoundHistory.bind(this));
        this.gameMessageHandler.register(messageEventType.NOT_PERMITTED_TO_PLAY, this.handleRestrictPermission.bind(this));
    }

    handleDrawId = ({ drawId }) => {
        const numberOfTurnsPerRound = 4;
        const turnCounter = drawId % numberOfTurnsPerRound === 0 ? numberOfTurnsPerRound : drawId % numberOfTurnsPerRound;

        this.props.dispatch({
            type: GameEventActionType.DRAW_ID,
            payload: { drawId, turnCounter },
        });
    };

    handleRoundHistory = ({ roundHistory, roundId }) => {
        const { dispatch, gameStateContextModel } = this.props;
        const { roundState, isUMInFirstLoad } = gameStateContextModel;

        dispatch({
            type: GameEventActionType.ROUND_HISTORY,
            payload: {
                roundHistory: roundHistory,
                roundId: [RoundState.DisplayResult].includes(roundState) || isUMInFirstLoad ? roundId - 1 : roundId,
                settlementResult: roundState === RoundState.LockingBet ? this.defaultSettlementResult : roundHistory[0]?.settlementResult,
                playResultAnimation: [RoundState.DisplayResult].includes(roundState) || isUMInFirstLoad ? false : true,
                showResultInfo: [RoundState.DisplayResult].includes(roundState) || isUMInFirstLoad ? true : false,
            },
        });
    };

    handleUserStakeLevel({ userStakeLevel, hasNotice = true }) {
        this.props.updateUserStakeLevel(userStakeLevel);

        this.props.dispatch({
            type: GameEventActionType.USER_STAKE_LEVEL,
            payload: { userStakeLevel },
        });

        hasNotice &&
            this.props.dispatch({
                type: GameEventActionType.NOTICE_USER_STAKE_LEVEL,
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
        const isKickOutError = this.isKickOutError(errorCode.toString());
        const onClose = isKickOutError ? (this.context as AuthContextModel)?.signOut : null;

        const message = GetLocalizedErrorMessage(errorCode, isPlaceBet);
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
                        duration: isKickOutError ? 10 : 3,
                        minBet: apiError?.minBet,
                        maxBet: apiError?.maxBet,
                        errorCode: errorCode,
                        onClose,
                    },
                },
            });
    };

    isKickOutError = (errorCode: string) => {
        return errorCode === "1001" || errorCode === "1002";
    };

    getNoticeKickedOut = (errorCode: string) => {
        return {
            gameName: "gameName",
            message: GetLocalizedErrorMessage(errorCode),
            duration: 10,
            errorCode: errorCode,
            roundId: 0,
            onClose: (this.context as AuthContextModel)?.signOut,
        };
    };

    handleBetFailed = ({ notice, kickedOut }) => {
        const { gameStateContextModel, dispatch, gameName } = this.props;
        const { displayPopup } = gameStateContextModel;

        displayPopup !== PopupType.Rebet &&
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
                    notice: this.getNoticeKickedOut(kickedOut.errorCode),
                },
            });
        } else {
            displayPopup !== PopupType.Rebet &&
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

    handleRestrictPermission = ({ notPermittedToPlay, userStakeLevel }) => {
        if (notPermittedToPlay) {
            this.onDestroy();
            this.props.dispatch({
                type: GameEventActionType.DISCONNECT_ERROR,
                payload: { disconnectReason: ConnectFailedReasonKey.restrictPlayPermission },
            });
        }
        if (userStakeLevel) {
            this.handleUserStakeLevel({ userStakeLevel });
        }
    };

    handleEndBet = ({ endBet, ownBets, betChoice, notice, kickedOut, apiError }) => {
        const { playPlaceBetSound } = this.props;
        this.isProcessingBet = false;
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
                payload: { ownBetsData: { ownBets } },
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
        (this.context as AuthContextModel)?.setBalance(user.red);
        this.props.dispatch({
            type: GameEventActionType.USER,
            payload: { userData: { user, gameConfigs } },
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

        if (gameStateContextModel.roundState === RoundState.None || !gameStateContextModel.isUMInFirstLoad) {
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

        if (gameStateContextModel.roundState !== newRoundState && !this.isConnectFailed) {
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

        this.isProcessingBet = false;
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

    async placeBet(betChoice: string, amount: number) {
        const gameStateContext = this.props.gameStateContextModel;
        const systemContext = this.props.systemContextModel;

        if (gameStateContext.enabledQuickBet) {
            const { displayPopup } = this.props.gameStateContextModel;

            if (this.isProcessingBet && displayPopup !== PopupType.Rebet) {
                this.props.dispatch({
                    type: GameEventActionType.BET_PROCESSING,
                    payload: {},
                });
            } else {
                if (amount > 0) {
                    this.isProcessingBet = true;
                    this.setRetryInterval();
                    this.sendBetMessage(betChoice, amount);
                }
            }
            return;
        }
        const validate = await this.validateNotConfirmBet(betChoice, amount);
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

    private async validateNotConfirmBet(betChoice: string, amount: number): Promise<boolean> {
        const gameStateContext = this.props.gameStateContextModel;
        const notConfirmOwnBets = gameStateContext.notConfirmOwnBets;
        let isValidateSuccess = true;
        //compose ValidationCriteria
        //1. Validate the betting time of a current sub-round
        if (gameStateContext.roundState != RoundState.InRound) {
            this.props.dispatch({
                type: GameEventActionType.DISPLAY_POPUP,
                payload: {
                    notice: {
                        gameName: this.props.gameName,
                        message: GetLocalizedErrorMessage("SB1905"),
                        duration: 2,
                        errorCode: "SB1905",
                    },
                },
            });

            return false;
        }
        //2.Validate hedge bet
        const hedgeBetGroup = this.hedgeBetGroup;

        const betTracks = { ...gameStateContext.ownBets, ...gameStateContext.notConfirmOwnBets };
        betTracks[betChoice] = (betTracks[betChoice] ?? 0) + amount;

        const isInvalid = Object.keys(betTracks).some(
            (betKey) => betTracks[betKey] && hedgeBetGroup.includes(betKey) && hedgeBetGroup.includes(betChoice) && betKey !== betChoice
        );

        if (isInvalid) {
            this.props.dispatch({
                type: GameEventActionType.DISPLAY_POPUP,
                payload: {
                    notice: {
                        gameName: this.props.gameName,
                        message: GetLocalizedErrorMessage("SB1939"),
                        duration: 2,
                        errorCode: "SB1939",
                        betChoice1: this.getChoiceNameOnHedgeBet(hedgeBetGroup[0]),
                        betChoice2: this.getChoiceNameOnHedgeBet(hedgeBetGroup[1]),
                    },
                },
            });

            return false;
        }

        //3. Check account balance thỏa bet
        const authContext = this.context as AuthContextModel;
        const balanceResponse = await getBalance(authContext?.session);
        if (balanceResponse.isSuccessful) {
            authContext?.setBalance(balanceResponse.balance);

            if (amount > balanceResponse.balance) {
                //TODO: handle special case Insufficient Funds
                return false;
            } else {
                console.log("get balance success");
            }
        } else {
            this.props.setApiErrorMessage(balanceResponse.errorCode);
            return false;
        }

        //4. Validate min/max bet per choice
        //5. Validate max bet per round

        const gameConfigs = gameStateContext.gameConfigs;
        const maxBet = Math.min(gameStateContext.userStakeLevel.maxBet, gameConfigs.maxBet);
        const minBet = Math.max(gameStateContext.userStakeLevel.minBet, gameConfigs.minBet);
        const maxBetPerChoice = Math.min(gameStateContext.userStakeLevel.maxBet, gameConfigs.maxBetPerChoices[betChoice]);
        let totalAmount = 0;
        Object.entries(notConfirmOwnBets).forEach(([key, value]) => {
            totalAmount += value;
        });
        Object.entries(gameStateContext.ownBets).forEach(([key, value]) => {
            totalAmount += value;
        });
        let isReachMinBet = amount < minBet;
        if (betChoice == confirmBet) {
            isReachMinBet = totalAmount < minBet;
        }

        if (isReachMinBet) {
            this.props.dispatch({
                type: GameEventActionType.DISPLAY_POPUP,
                payload: {
                    notice: {
                        gameName: this.props.gameName,
                        message: GetLocalizedErrorMessage("SB1909"),
                        duration: 2,
                        errorCode: "SB1909",
                        minBet,
                    },
                },
            });

            return false;
        }

        //TODO: handle special case: Reach max bet

        if (amount > maxBetPerChoice || notConfirmOwnBets[betChoice] + amount > maxBetPerChoice) {
            this.props.dispatch({
                type: GameEventActionType.DISPLAY_POPUP,
                payload: {
                    notice: {
                        gameName: this.props.gameName,
                        message: GetLocalizedErrorMessage("SB1910"),
                        duration: 2,
                        errorCode: "SB1910",
                        maxBet: maxBetPerChoice,
                    },
                },
            });
            return false;
        }

        if (amount > maxBet || totalAmount + amount > maxBet) {
            this.props.dispatch({
                type: GameEventActionType.DISPLAY_POPUP,
                payload: {
                    notice: {
                        gameName: this.props.gameName,
                        message: GetLocalizedErrorMessage("SB1911"),
                        duration: 2,
                        errorCode: "SB1911",
                        maxBet,
                    },
                },
            });

            return false;
        }

        return true;
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

    openPopup(popupType: PopupType) {
        this.props.dispatch({
            type: GameEventActionType.OPEN_POPUP,
            payload: { displayPopup: popupType },
        });
    }

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
        if (this.props?.gameStateContextModel?.notice == null) {
            return <></>;
        }

        const { gameName, message, roundId, duration, minBet, maxBet, errorCode, isWarning, betChoice1, betChoice2, onClose } =
            this.props.gameStateContextModel.notice;
        const onCloseNotice = onClose || (() => this.closeNotice());
        return (
            <Notice
                gameName={gameName}
                roundId={roundId}
                message={message}
                duration={duration}
                minBet={minBet}
                maxBet={maxBet}
                errorCode={errorCode}
                onClose={onCloseNotice}
                isWarning={isWarning}
                betChoice1={betChoice1}
                betChoice2={betChoice2}
            />
        );
    }

    closeNotice() {
        this.props.dispatch({
            type: GameEventActionType.DISPLAY_POPUP,
            payload: {
                notice: null,
            },
        });
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
                        console.log("toggleHistoryModal");
                    }}
                    toggleGuideModal={() => {
                        console.log("toggleGuideModal");
                    }}
                />
            </>
        );
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
        return <BetSettings></BetSettings>;
    }

    renderConfirmBet() {
        if (!this.props.gameStateContextModel.showConfirmBet) return null;
        return <ConfirmBet />;
    }

    renderConfirmDialog() {
        if (!this.props.gameStateContextModel.showConfirmDialog) {
            return null;
        }

        return (
            <ConfirmDialog
                title={<>Insufficient Funds</>}
                content={<>Outstanding Balance: 500</>}
                subContent={<>Want to Bet?</>}
                onCloseModal={() => {
                    this.props.dispatch({
                        type: GameEventActionType.SHOW_CONFIRM_DIALOG,
                        payload: {
                            showConfirmDialog: false,
                        },
                    });

                    console.log("close");
                }}
                onSubmit={() => {
                    this.props.dispatch({
                        type: GameEventActionType.SHOW_CONFIRM_DIALOG,
                        payload: {
                            showConfirmDialog: false,
                        },
                    });

                    console.log("yes");
                }}
            />
        );
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
                {this.renderNotice()}
                {this.renderBettingBlock()}
                {this.renderSlidingChips()}
                {this.renderConfirmBet()}
                {this.renderStatistic()}
                {this.renderScoreboards()}
            </>
        );
    }

    renderGame() {
        const gameActionsContext = {
            placeBet: this.placeBet,
            openPopup: this.openPopup,
            playAcceptedBetAnimation: this.playAcceptedBetAnimation,
            finishProcessingBet: () => {
                this.isProcessingBet = false;
                this.clearRetryInterval();
            },
            setActiveScoreboardTab: this.setActiveScoreboardTab,
            updateStatusShowResult: this.updateStatusShowResult,
        };

        return (
            <GameContextProvider value={this.props}>
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
