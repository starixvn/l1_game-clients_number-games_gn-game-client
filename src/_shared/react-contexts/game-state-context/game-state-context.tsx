import { createContext, useContext, useReducer } from "react";
import { GameState, PopupType } from "../../../components/game-base/type";
import { ConnectFailedReasonKey } from "../../../components/game-components/error-message/type";
import { LanguageLocaleMapper } from "../../constants";
import { GetLocalizedErrorMessage } from "../../helpers/notice-helper";
import { GameEventAction, GameEventActionType } from "./game-event-action";
import { GameStateContextModel, initialGameStateContextModel } from "./game-state-context-model";

const GameStateContext = createContext({ rate: 1 } as GameStateContextModel<any, any>);

const GameStateDispatchContext = createContext(null);

export function GameStateProvider({ children, defaultResult, defaultSettlementResult }) {
    const [gameStateContextModel, dispatch] = useReducer(
        gameStateReducer,
        initialGameStateContextModel({ defaultResult, defaultSettlementResult })
    );

    return (
        <GameStateContext.Provider value={gameStateContextModel}>
            <GameStateDispatchContext.Provider value={dispatch}>
                {/* {console.log(`gameStateContextModel: ${JSON.stringify(gameStateContextModel)}`)} */}
                {children}
            </GameStateDispatchContext.Provider>
        </GameStateContext.Provider>
    );
}

export function useGameStateContext() {
    return useContext(GameStateContext);
}

export function useGameStatesDispatch() {
    // console.log('useGameStatesDispatch');
    return useContext(GameStateDispatchContext);
}

function gameStateReducer(state: GameStateContextModel<{}, {}>, action: GameEventAction) {
    const { type, payload } = action;
    const {
        remainingTime,
        um_message,
        gameConfigs,
        roundHistory,
        roundId,
        defaultResult,
        defaultSettlementResult,
        result,
        settlementResult,
        status,
        userData,
        ownBetsData,
        betPercentage,
        endBetData,
        apiError,
        errorCode,
        userStakeLevel,
        odds,
        drawId,
        totalBets,
        kickedOut,
        notice,
        signedIn,
        acceptedBetQueue,
        disconnectReason,
        showWinningAnimation,
        selectedBetChoice,
        removeBetChoiceFocus,
        betOptionElement,
        betChoiceElement,
        displayPopup,
        viewMode,
        activeScoreboardTab,
        playResultAnimation,
        newState,
        showResultInfo,
        isShowBlink,
        enabledQuickBet,
        selectedChip,
        showConfirmBet,
        showConfirmDialog,
        turnCounter
    } = payload;

    // console.log("payload: ", JSON.stringify(payload));
    const { gameState, isUMInFirstLoad } = state;

    if (type !== GameEventActionType.TOTAL_BET && type !== GameEventActionType.SET_NEW_STATE) {
        console.log(`\x1B[31m SocketEventActionTypes : ${type}`);
    }

    switch (type) {
        case GameEventActionType.CONNECT: {
            return {
                ...state,
                isConnect: true,
            };
        }

        case GameEventActionType.CONNECT_ERROR: {
            return {
                ...state,
            };
        }
        case GameEventActionType.SIGN_IN: {
            return {
                ...state,
                signedIn,
            };
        }

        case GameEventActionType.DISCONNECT: {
            return {
                ...state,
                isConnect: false,
                gameState: GameState.None,
                disconnectReason: ConnectFailedReasonKey.lostConnection,
            };
        }

        case GameEventActionType.UM: {
            return {
                ...state,
                gameState: GameState.Disabled,
                disabledMessage: um_message[LanguageLocaleMapper["en"]], // TO DO: remove hard code
                showResultInfo: false,
            };
        }

        case GameEventActionType.REMAINING_TIME: {
            return {
                ...state,
                roundRemainingTime: remainingTime,
                remainingTime,
            };
        }

        case GameEventActionType.GAME_CONFIGS: {
            // console.log(`\x1B[31m SocketEventActionTypes : ${type}`);
            return {
                ...state,
                gameConfigs: gameConfigs,
            };
        }

        case GameEventActionType.ROUND_HISTORY: {
            return {
                ...state,
                roundHistory,
                roundId,
                result,
                settlementResult,
                playResultAnimation,
                showResultInfo,
            };
        }

        case GameEventActionType.FINISH: {
            return {
                ...state,
                playResultAnimation,
                result,
                settlementResult,
                roundId,
            };
        }

        case GameEventActionType.STATUS: {
            if (status.win) {
                return {
                    ...state,
                    betWin: status.bet,
                };
            }
            return {
                ...state,
            };
        }

        case GameEventActionType.USER: {
            //this.context.setBalance(user.red);
            if (userData.gameConfigs) {
                return {
                    ...state,
                    rate: userData.user.rate,
                };
            }

            return {
                ...state,
            };
        }

        case GameEventActionType.OWN_BETS: {
            if (ownBetsData) {
                return {
                    ...state,
                    ownBets: ownBetsData.ownBets,
                };
            }
            return {
                ...state,
            };
        }

        case GameEventActionType.BET_PERCENTAGE: {
            return {
                ...state,
                betPercentage: betPercentage,
            };
        }

        case GameEventActionType.END_BET: {
            return {
                ...state,
                notice: null,
            };
        }

        case GameEventActionType.API_ERROR: {
            const isPlaceBet = apiError.isPlaceBetFailed ? apiError.isPlaceBetFailed : false;
            const errorCode = apiError.errorCode;
            const message = GetLocalizedErrorMessage(errorCode, isPlaceBet);
            // const gameName = this.props.t(`${this.props.gameName.toLowerCase()}:${GameResourceKeys.GAME_NAME}`);
            return {
                ...state,
                notice: {
                    gameName: "gameName",
                    roundId: apiError?.gameRoundId,
                    message: message,
                    duration: 3,
                    minBet: apiError?.minBet,
                    maxBet: apiError?.maxBet,
                    errorCode: errorCode,
                },
            };
        }

        case GameEventActionType.ERROR_CODE: {
            return {
                ...state,
                gameState: GameState.ConnectFailed,
                signedIn: false,
                disconnectReason,
            };
        }

        case GameEventActionType.USER_STAKE_LEVEL: {
            return {
                ...state,
                notice: { message: "CommonResourceKeys.USER_STAKE_LEVEL_UPDATE" },
            };
        }

        case GameEventActionType.ODDS: {
            return {
                ...state,
                gameConfigs: {
                    ...state.gameConfigs,
                    odds,
                },
            };
        }

        case GameEventActionType.DRAW_ID: {
            return {
                ...state,
                drawId,
                turnCounter
            };
        }

        case GameEventActionType.TOTAL_BET: {
            return {
                ...state,
                totalBets,
            };
        }

        case GameEventActionType.KICK_OUT: {
            return {
                ...state,
                notice: {
                    gameName: "gameName",
                    message: GetLocalizedErrorMessage(kickedOut.errorCode),
                    duration: 2,
                    errorCode: kickedOut.errorCode,
                    roundId: kickedOut?.gameRoundId,
                },
            };
        }

        case GameEventActionType.DISPLAY_POPUP: {
            return {
                ...state,
                notice,
            };
        }

        case GameEventActionType.ACCEPTED_BET_QUEUE: {
            return {
                ...state,
                acceptedBetQueue,
            };
        }

        case GameEventActionType.SET_NEW_STATE: {
            return {
                ...state,
                ...newState,
            };
        }

        case GameEventActionType.SHOW_WINNING_ANIMATION: {
            return {
                ...state,
                showWinningAnimation,
            };
        }

        case GameEventActionType.PLACE_BET_POPUP: {
            return {
                ...state,
                displayPopup: PopupType.PlaceBet,
                selectedBetChoice,
                removeBetChoiceFocus,
                betOptionElement,
                betChoiceElement,
            };
        }

        case GameEventActionType.BET_PROCESSING: {
            return {
                ...state,
                notice: { message: "messages:betProcessing", duration: 2 },
            };
        }
        case GameEventActionType.OPEN_POPUP: {
            return {
                ...state,
                displayPopup,
            };
        }

        case GameEventActionType.VIEW_MODE: {
            return {
                ...state,
                viewMode,
            };
        }

        case GameEventActionType.ACTIVE_SCORE_BOARD: {
            return {
                ...state,
                activeScoreboardTab,
            };
        }

        case GameEventActionType.PLAY_RESULT_ANIMATION: {
            return {
                ...state,
                playResultAnimation,
            };
        }

        case GameEventActionType.SHOW_RESULT_INFO_TIME_OUT: {
            return {
                ...state,
                showResultInfo,
                isShowBlink,
                roundHistory,
                playResultAnimation,
            };
        }

        case GameEventActionType.SET_SELECT_CHIP: {
            return {
                ...state,
                selectedChip,
            };
        }

        case GameEventActionType.TOGLE_QUICK_BET: {
            return {
                ...state,
                enabledQuickBet,
            };
        }

        case GameEventActionType.SHOW_CONFIRM_BET: {
            return {
                ...state,
                showConfirmBet,
            };
        }

        case GameEventActionType.SHOW_CONFIRM_DIALOG: {
            return {
                ...state,
                showConfirmDialog,
            };
        }

        default: {
            throw Error("Unknown action: " + action.type);
        }
    }
}
