import React from "react";
import { AuthorizeResponse, SSOResponse } from "sc-user-service-client/dist/auth";
import { locales } from "../../constants";

export type PlayerContextModel = {
    authorizeInfo?: AuthorizeResponse;
    session?: SSOResponse;
    locale?: string;
    signOut?: () => void;
    fractionalOddsFormat?: boolean;
};

export const PlayerContext = React.createContext<PlayerContextModel>({ locale: locales.vi });
PlayerContext.displayName = "AuthContext";

export const PlayerContextProvider = PlayerContext.Provider;
export const PlayerContextConsumer = PlayerContext.Consumer;
export const usePlayerContext = () => React.useContext(PlayerContext);
