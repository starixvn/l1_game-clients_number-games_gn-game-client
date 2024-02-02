import React from "react";
import { SSOResponse } from "sc-user-service-client/dist/auth";

type AuthContextModel = {
    session: SSOResponse;
    setBalance: (balance: number) => void;
    signOut: () => void
};

export const AuthContext = React.createContext<AuthContextModel>(null);
AuthContext.displayName = "AuthContext";

export const AuthContextProvider = AuthContext.Provider;
export const AuthContextConsumer = AuthContext.Consumer;
export const useAuthContext = () => React.useContext(AuthContext);
