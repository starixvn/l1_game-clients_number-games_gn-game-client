import { createContext, useContext, useReducer } from "react";
import { PFContextModel, initialPFContextModel } from "./pf-context-model";
import { PFEventActionType, PFEventAction } from "./pf-action";

export const PFContext = createContext({} as PFContextModel);
const PFDispatchContext = createContext(null);

export function PFProvider({ children }) {
    const [pfContextModel, dispatch] = useReducer(pfReducer, initialPFContextModel() as PFContextModel);

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

export function usePFsDispatch() {
    return useContext(PFDispatchContext);
}


function pfReducer(state: PFContextModel, action: PFEventAction) {
    const { type, payload } = action;
    const {
        pfClientSeedSetting,
        isShowPFVerify,
        pfVerifyModalData,
        isShowPFClientSeedInfo,
        isShowPFVerification,
    } = payload;

    console.log(`PFReducer: ${JSON.stringify(action)} `);
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

        default: {
            console.warn(JSON.stringify(action));
            throw Error("Unknown action: " + action.type);
        }
    }
}
