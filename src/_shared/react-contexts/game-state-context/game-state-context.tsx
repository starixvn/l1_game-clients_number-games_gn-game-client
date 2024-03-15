import { useTranslate } from "@tolgee/react";
import { createContext, useContext, useReducer } from "react";
import { RoundState } from "../../../components/game-base/type";
import { LanguageLocaleMapper } from "../../constants";
import { GetLocalizedErrorMessage } from "../../helpers/notice-helper";
import { GameEventAction, GameEventActionType } from "./game-event-action";
import { GameStateContextModel, initialGameStateContextModel } from "./game-state-context-model";
import { tolgee } from "../../tolgee";
import { randomNumberSeries } from "../../helpers";

export const GameStateContext = createContext({ rate: 1 } as GameStateContextModel);
const GameStateDispatchContext = createContext(null);
const GameTranslateContext = createContext(null);

export function GameStateProvider({ children }) {
    const [gameStateContextModel, dispatch] = useReducer(
        gameStateReducer,
        initialGameStateContextModel()
    );
    return (
        <GameStateContext.Provider value={gameStateContextModel}>
            <GameStateDispatchContext.Provider value={dispatch}>
                <GameTranslateContext.Provider value={useTranslate}>{children}</GameTranslateContext.Provider>
            </GameStateDispatchContext.Provider>
        </GameStateContext.Provider>
    );
}

export const useGameStateContext = () => {
    return useContext(GameStateContext);
}

export function useGameStatesDispatch() {
    return useContext(GameStateDispatchContext);
}

export function useGameTranslateContext() {
    return useContext(GameTranslateContext);
}

function gameStateReducer(state: GameStateContextModel, action: GameEventAction) {
    const { type, payload } = action;
    const {
        remainingTime,
        um_message,
        gameConfigs,
        roundData,
        roundHistory,
        roundId,
        result,
        settlementResult,
        status,
        userData,
        ownBets,
        betPercentage,
        playerBetCount,
        apiError,
        userStakeLevel,
        odds,
        drawId,
        totalBets,
        notice,
        acceptedBetQueue,
        disconnectReason,
        showWinningAnimation,
        activeScoreboardTab,
        playResultAnimation,
        newGameState,
        showResultInfo,
        isShowBlink,
        showConfirmBet,
        showConfirmDialog,
        turnCounter,
        notConfirmOwnBets,
        isUMInFirstLoad,
        isShowBetHistory,
        isShowGameGuide,
        isShowPFSetting,
        suggestBet,
        pfSetting,
    } = payload;

    // console.log("payload: ", JSON.stringify(payload));

    // if (type !== GameEventActionType.TOTAL_BET && type !== GameEventActionType.SET_NEW_GAME_STATE) {
    //     console.log(`\x1B[31mGameEventActionType: ${type}`);
    // }

    switch (type) {
        case GameEventActionType.CONNECT: {
            return {
                ...state,
                isConnect: true,
            };
        }

        case GameEventActionType.DISCONNECT: {
            return {
                ...state,
                isConnect: false,
            };
        }

        case GameEventActionType.SIGN_IN: {
            return {
                ...state,
                signedIn: true,
            };
        }

        case GameEventActionType.SIGN_OUT: {
            return {
                ...state,
                signedIn: false,
            };
        }

        case GameEventActionType.UM: {
            return {
                ...state,
                roundState: RoundState.Disabled,
                disabledMessage: um_message[LanguageLocaleMapper[tolgee.getLanguage() || "en"]], // TO DO: remove hard code
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

        case GameEventActionType.ROUND_DATA: {
            if (roundData.drawId != state.pfSetting.drawId) {
                return {
                    ...state,
                    roundData,
                    pfSetting: {
                        ...state.pfSetting,
                        drawId: roundData.drawId,
                        randomClientSeed: randomNumberSeries(4),
                    },
                };
            }

            return {
                ...state,
                roundData,
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
                drawId,
            };
        }

        case GameEventActionType.WIN_STATUS: {
            return {
                ...state,
                betWin: status.bet,
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
            return {
                ...state,
                ownBets,
            };
        }

        case GameEventActionType.BET_PERCENTAGE: {
            return {
                ...state,
                betPercentage: betPercentage,
            };
        }

        case GameEventActionType.PLAYER_BET_COUNT: {
            return {
                ...state,
                playerBetCount: playerBetCount,
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

        case GameEventActionType.DISCONNECT_ERROR: {
            return {
                ...state,
                roundState: RoundState.ConnectFailed,
                signedIn: false,
                disconnectReason,
            };
        }

        case GameEventActionType.USER_STAKE_LEVEL: {
            return {
                ...state,
                userStakeLevel,
            };
        }

        case GameEventActionType.NOTICE_USER_STAKE_LEVEL: {
            return {
                ...state,
                notice: { message: "Common.message_bet_limit_change" },
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
            };
        }

        case GameEventActionType.TURN_COUNTER: {
            return {
                ...state,
                turnCounter,
            };
        }

        case GameEventActionType.TOTAL_BET: {
            return {
                ...state,
                totalBets,
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

        case GameEventActionType.SET_NEW_GAME_STATE: {
            return {
                ...state,
                ...newGameState,
            };
        }

        case GameEventActionType.SHOW_WINNING_ANIMATION: {
            return {
                ...state,
                showWinningAnimation,
            };
        }

        case GameEventActionType.BET_PROCESSING: {
            return {
                ...state,
                isProcessingBet: true,
                notice,
            };
        }

        case GameEventActionType.END_BET_PROCESSING: {
            return {
                ...state,
                isProcessingBet: false,
                notice: null,
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

        case GameEventActionType.NOT_CONFIRM_OWN_BETS: {
            return {
                ...state,
                notConfirmOwnBets,
            };
        }

        case GameEventActionType.SET_UM_FIRST_LOADING: {
            return {
                ...state,
                isUMInFirstLoad,
            };
        }

        case GameEventActionType.TOGGLE_BET_HISTORY: {
            return {
                ...state,
                isShowBetHistory,
            };
        }

        case GameEventActionType.TOGGLE_GAME_GUIDE: {
            return {
                ...state,
                isShowGameGuide,
            };
        }

        case GameEventActionType.TOGGLE_PF_SETTING: {
            return {
                ...state,
                isShowPFSetting,
            };
        }

        case GameEventActionType.SUGGEST_BET: {
            return {
                ...state,
                suggestBet,
            };
        }

        case GameEventActionType.UPDATE_PF_SETTING: {
            return {
                ...state,
                pfSetting: {
                    ...state.pfSetting,
                    ...pfSetting,
                },
            };
        }

        default: {
            throw Error("Unknown action: " + action.type);
        }
    }
}
