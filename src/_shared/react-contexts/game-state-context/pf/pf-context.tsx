import { createContext, useContext, useReducer } from "react";
import { PFContextModel, initialPFContextModel } from "./pf-context-model";
import { PFEventActionType, PFEventAction } from "./pf-action";

export const PFContext = createContext({} as PFContextModel);
const PFDispatchContext = createContext(null);

export function PFProvider({ children }) {
    const [pfContextModel, dispatch] = useReducer(pfReducer, initialPFContextModel());

    return (
        <PFContext.Provider value={pfContextModel}>
            <PFDispatchContext.Provider value={dispatch}>
                {children}
            </PFDispatchContext.Provider>
        </PFContext.Provider>
    );
}

export const usePFContext = () => {
    return useContext(PFContext);
};

export function usePFDispatch() {
    return useContext(PFDispatchContext);
}

function pfReducer(state: PFContextModel, action: PFEventAction) {
    const { type, payload } = action;
    const {
        pfClientSeedSetting,
        isShowPFVerify,
        isShowPFSetting,
        pfVerifyModalData,
        isShowPFClientSeedInfo,
        isShowPFVerification,
        ownBets
    } = payload;


    console.log(`pfReducer: ${JSON.stringify(payload)} `);
    switch (type) {
        case PFEventActionType.UPDATE_PF_CLIENT_SEED_SETTING: {
            return {
                ...state,
                pfClientSeedSetting: {
                    ...state.pfClientSeedSetting,
                    ...pfClientSeedSetting,
                },
            };
        }

        case PFEventActionType.TOGGLE_PF_VERIFY: {
            return {
                ...state,
                isShowPFVerify,
            };
        }

        case PFEventActionType.TOGGLE_PF_SETTING: {
            console.log(`PFReducer: ${JSON.stringify(action)} `);
            return {
                ...state,
                isShowPFSetting,
            };
        }

        case PFEventActionType.UPDATE_PF_VERIFY: {
            return {
                ...state,
                pfVerifyModalData,
            };
        }

        case PFEventActionType.TOGGLE_PF_CLIENT_SEED_INFO: {
            return {
                ...state,
                isShowPFClientSeedInfo,
            };
        }

        case PFEventActionType.TOGGLE_PF_VERIFICATION: {
            return {
                ...state,
                isShowPFVerification,
            };
        }

        case PFEventActionType.OWN_BETS: {
            return {
                ...state,
                ownBets,
            };
        }
        default: {
            console.warn(JSON.stringify(action));
            throw Error("Unknown action: " + action.type);
        }
    }
}
