import { Dispatch, createContext, useContext, useReducer } from "react";
import { PlaceBetEventAction, PlaceBetEventActionType } from "./place-bet-action";
import { PlaceBetContextModel, initialPlaceBetContext } from "./place-bet-context-model";

export const PlaceBetContext = createContext({ isProcessingBet: false } as PlaceBetContextModel);
const PlaceBetDispatchContext = createContext({} as Dispatch<PlaceBetEventAction>);

export function PlaceBetProvider({ children }) {
    const [placeBetContextModel, dispatch] = useReducer(placeBetReducer, initialPlaceBetContext());

    return (
        <PlaceBetContext.Provider value={placeBetContextModel}>
            <PlaceBetDispatchContext.Provider value={dispatch}>{children}</PlaceBetDispatchContext.Provider>
        </PlaceBetContext.Provider>
    );
}

export const usePlaceBetContext = () => {
    return useContext(PlaceBetContext);
};

export function usePlaceBetDispatch() {
    return useContext(PlaceBetDispatchContext);
}

function placeBetReducer(state: PlaceBetContextModel, action: PlaceBetEventAction) {
    const { type, payload } = action;
    const { ownBets, acceptedBetQueue, suggestBet, notConfirmOwnBets, showConfirmBet, showConfirmDialog } = payload;

    switch (type) {
        case PlaceBetEventActionType.OWN_BETS: {
            return {
                ...state,
                ownBets,
            };
        }

        case PlaceBetEventActionType.ACCEPTED_BET_QUEUE: {
            return {
                ...state,
                acceptedBetQueue,
            };
        }

        case PlaceBetEventActionType.BET_PROCESSING: {
            return {
                ...state,
                isProcessingBet: true,
            };
        }

        case PlaceBetEventActionType.END_BET_PROCESSING: {
            return {
                ...state,
                isProcessingBet: false,
            };
        }

        case PlaceBetEventActionType.SUGGEST_BET: {
            return {
                ...state,
                suggestBet,
            };
        }

        case PlaceBetEventActionType.SET_NEW_GAME_STATE: {
            return {
                ...state,
                ownBets: {},
                suggestBet: {},
            };
        }

        case PlaceBetEventActionType.NOT_CONFIRM_OWN_BETS: {
            return {
                ...state,
                notConfirmOwnBets,
            };
        }

        case PlaceBetEventActionType.SHOW_CONFIRM_BET: {
            return {
                ...state,
                showConfirmBet,
            };
        }

        case PlaceBetEventActionType.SHOW_CONFIRM_DIALOG: {
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
