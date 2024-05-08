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

    if (!router?.isReady) {
        return <></>;
    }

    if (isUm) {
        return <UMPage />;
    }

    if (shouldRenderDashboard) {
        document.body.classList.add("galaxy-bg");
        if (!authorizeResponse) {
            return <Register session={session} setAuthorizeResponse={setAuthorizeResponse} setLobbyConfigs={setLobbyConfigs} />;
        }

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
