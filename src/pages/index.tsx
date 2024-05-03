import dynamic from "next/dynamic";
import { memo, useContext, useState } from "react";

import { useRouter } from "next/router";
import { AuthorizeResponse } from "sc-user-service-client/dist/auth";
import { URLContext, usePlayerContext } from "../_shared/react-contexts";
import { usePWAWoker } from "../_shared/react-hooks/use-pwa-worker";
import { tolgee } from "../_shared/tolgee";
import Dashboard from "../components/page-components/dashboard";
import Register from "../components/page-components/dashboard/register/register";
import { ILobbyConfigs } from "../components/page-components/dashboard/type";
import SplashScreen from "../components/page-components/splash-screen";
import { getLobbyConfigs } from "../services/auth-service";
import { updateSignInSMStatus } from "../services/user-setting-service";

const UMPage = dynamic(() => import("../components/page-components/um-page"));

const Home = () => {
    usePWAWoker();
    const router = useRouter();
    const { gameId, isDirectMode } = useContext(URLContext);
    const { session } = usePlayerContext();
    const shouldRenderDashboard = session?.isAuthenticated && !session?.isUM;
    const [isUm, setIsUm] = useState(session?.isUM);
    const [authorizeResponse, setAuthorizeResponse] = useState<AuthorizeResponse>(null);
    const [lobbyConfigs, setLobbyConfigs] = useState<ILobbyConfigs>(null);

    const toUMPage = (value) => setIsUm(value);

    const handleRegister = async (authorizeInfo: AuthorizeResponse) => {
        updateSignInSMStatus(session);
        authorizeInfo.user.isSignedInSM = true;

        const lobby = await getLobbyConfigs(session);
        lobby?.lobbyConfigs && setLobbyConfigs(lobby?.lobbyConfigs);

        setAuthorizeResponse(authorizeInfo);
    };

    if (!router?.isReady) {
        return <></>;
    }

    if (isUm) {
        return <UMPage />;
    }

    if (shouldRenderDashboard) {
        if (!authorizeResponse) {
            return <Register session={session} handleStateLogin={handleRegister} />;
        }

        document.body.classList.add("galaxy-bg");
        return (
            <Dashboard
                session={session}
                queryGame={gameId}
                setIsUm={toUMPage}
                directMode={isDirectMode}
                tolgee={tolgee}
                authorizeResponse={authorizeResponse}
                lobbyConfigs={lobbyConfigs}
            />
        );
    }
    
    return (
        <SplashScreen
            gameId={gameId}
            isDirectMode={isDirectMode}
            setAuthorizeResponse={setAuthorizeResponse}
            setLobbyConfigs={setLobbyConfigs}
        />
    );
};

export default memo(Home);
