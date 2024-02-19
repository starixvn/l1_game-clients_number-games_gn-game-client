import { createContext, useContext, useReducer } from 'react';
import { GameState, PopupType } from '../../../components/game-base/type';
import { SocketEventAction, SocketEventActionTypes } from './socket-event-action';
import { ConnectFailedReasonKey } from '../../../components/game-components/error-message/type';
import { LanguageLocaleMapper } from '../../constants';
import { GetLocalizedErrorMessage } from '../../helpers/notice-helper';
import { GameStateContextModel, initialGameStateContextModel } from './game-state-context-model';

const GameStateContext = createContext(null);

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

function gameStateReducer(state: GameStateContextModel<{}, {}>, action: SocketEventAction) {
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
    isShowBlink

  } = payload;

  // console.log("payload: ", JSON.stringify(payload));
  const { gameState, isUMInFirstLoad } = state;

  if (type !== SocketEventActionTypes.TOTAL_BET && type !== SocketEventActionTypes.SET_NEW_STATE) {
    console.log(`\x1B[31m SocketEventActionTypes : ${type}`);
  }

  switch (type) {
    case SocketEventActionTypes.CONNECT: {

      return {
        ...state,
        isConnect: true,
      };
    }

    case SocketEventActionTypes.CONNECT_ERROR: {
      return {
        ...state,
      };
    }
    case SocketEventActionTypes.SIGN_IN: {
      return {
        ...state,
        signedIn,
      };
    }

    case SocketEventActionTypes.DISCONNECT: {
      return {
        ...state,
        isConnect: false,
        gameState: GameState.None,
        disconnectReason: ConnectFailedReasonKey.lostConnection,
      };
    }

    case SocketEventActionTypes.UM: {

      return {
        ...state,
        gameState: GameState.Disabled,
        disabledMessage: um_message[LanguageLocaleMapper["en"]], // TO DO: remove hard code
        showResultInfo: false,
      };
    }

    case SocketEventActionTypes.REMAINING_TIME: {
      return {
        ...state,
        roundRemainingTime: remainingTime,
        remainingTime
      };
    }

    case SocketEventActionTypes.GAME_CONFIGS: {
      // console.log(`\x1B[31m SocketEventActionTypes : ${type}`);
      return {
        ...state,
        gameConfigs: gameConfigs,
      };
    }

    case SocketEventActionTypes.ROUND_HISTORY: {
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

    case SocketEventActionTypes.FINISH: {
      return {
        ...state,
        playResultAnimation,
        result,
        settlementResult,
        roundId,
      };
    }

    case SocketEventActionTypes.STATUS: {
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

    case SocketEventActionTypes.USER: {
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

    case SocketEventActionTypes.OWN_BETS: {
      return {
        ...state,
        ownBets: ownBetsData.ownBets,
      };
    }

    case SocketEventActionTypes.BET_PERCENTAGE: {
      return {
        ...state,
        betPercentage: betPercentage,
      };
    }

    case SocketEventActionTypes.END_BET: {
      return {
        ...state,
        notice: null,
      };
    }

    case SocketEventActionTypes.API_ERROR: {
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

    case SocketEventActionTypes.ERROR_CODE: {
      return {
        ...state,
        gameState: GameState.ConnectFailed,
        signedIn: false,
        disconnectReason,
      };
    }

    case SocketEventActionTypes.USER_STAKE_LEVEL: {
      return {
        ...state,
        notice: { message: "CommonResourceKeys.USER_STAKE_LEVEL_UPDATE" },
      };
    }

    case SocketEventActionTypes.ODDS: {
      return {
        ...state,
        gameConfigs,
      };
    }

    case SocketEventActionTypes.DRAW_ID: {
      return {
        ...state,
        drawId: drawId,
      };
    }

    case SocketEventActionTypes.TOTAL_BET: {
      return {
        ...state,
        totalBets: totalBets,
      };
    }

    case SocketEventActionTypes.KICK_OUT: {
      return {
        ...state,
        notice: {
          gameName: 'gameName',
          message: GetLocalizedErrorMessage(kickedOut.errorCode),
          duration: 2,
          errorCode: kickedOut.errorCode,
          roundId: kickedOut?.gameRoundId,
        },
      };
    }

    case SocketEventActionTypes.DISPLAY_POPUP: {
      return {
        ...state,
        notice,
      };
    }

    case SocketEventActionTypes.ACCEPTED_BET_QUEUE: {
      return {
        ...state,
        acceptedBetQueue,
      };
    }

    case SocketEventActionTypes.SET_NEW_STATE: {
      return {
        ...state,
        ...newState
      };
    }

    case SocketEventActionTypes.SHOW_WINNING_ANIMATION: {
      return {
        ...state,
        showWinningAnimation,
      };
    }

    case SocketEventActionTypes.PLACE_BET_POPUP: {
      return {
        ...state,
        displayPopup: PopupType.PlaceBet,
        selectedBetChoice,
        removeBetChoiceFocus,
        betOptionElement,
        betChoiceElement,
      };
    }

    case SocketEventActionTypes.BET_PROCESSING: {
      return {
        ...state,
        notice: { message: "messages:betProcessing", duration: 2 }
      };
    }
    case SocketEventActionTypes.OPEN_POPUP: {
      return {
        ...state,
        displayPopup
      };
    }

    case SocketEventActionTypes.VIEW_MODE: {
      return {
        ...state,
        viewMode
      };
    }

    case SocketEventActionTypes.ACTIVE_SCORE_BOARD: {
      return {
        ...state,
        activeScoreboardTab
      };
    }

    case SocketEventActionTypes.PLAY_RESULT_ANIMATION: {
      return {
        ...state,
        playResultAnimation
      };
    }

    case SocketEventActionTypes.SHOW_RESULT_INFO_TIME_OUT: {
      return {
        ...state,
        showResultInfo,
        isShowBlink,
        roundHistory,
        playResultAnimation,
      };
    }


    default: {
      throw Error('Unknown action: ' + action.type);
    }
  }
}
