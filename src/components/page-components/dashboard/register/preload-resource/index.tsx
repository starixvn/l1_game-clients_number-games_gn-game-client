import { useEffect, useMemo, useState } from "react";
import { AuthorizeResponse, SSOResponse } from "sc-user-service-client/dist/auth";
import PreloadResources, { getAndHandleBannerOffer, getAndHandleGameOfferIds } from "../../../../../_shared/helpers/preload-resources";
import { getLobbyConfigs } from "../../../../../services/auth-service";

const PreloadResourceRegister: React.FC<{
    isDirectMode?: boolean;
    gameId: number;
    updateStatePreloadResource: Function;
    updateLobbyConfigs: Function;
    session: SSOResponse;
    authorizeResponse: AuthorizeResponse;
}> = ({ isDirectMode, gameId, updateStatePreloadResource, updateLobbyConfigs, session, authorizeResponse }) => {
    const [bannerId, setBannerId] = useState<number>(0);
    const [gameOfferIds, setGameOfferIds] = useState<number[]>([]);

    console.log("[PreloadResourceRegister] Component props:", { isDirectMode, gameId, session, authorizeResponse });

    const handleAuthorizedAccess = async () => {
        console.log("[PreloadResourceRegister] handleAuthorizedAccess - Starting");
        try {
            const lobby = await getLobbyConfigs(session);
            console.log("[PreloadResourceRegister] handleAuthorizedAccess - Lobby configs result:", lobby);

            if (!lobby || Object.keys(lobby.lobbyConfigs).length === 0) {
                console.log("[PreloadResourceRegister] handleAuthorizedAccess - No lobby configs, calling updateStatePreloadResource");
                updateStatePreloadResource();
            } else {
                if (lobby?.lobbyConfigs) {
                    console.log("[PreloadResourceRegister] handleAuthorizedAccess - Lobby configs found, updating");
                    updateLobbyConfigs(lobby?.lobbyConfigs);
                    getAndHandleBannerOffer(authorizeResponse, lobby?.lobbyConfigs, setBannerId);
                    getAndHandleGameOfferIds(authorizeResponse, lobby?.lobbyConfigs, setGameOfferIds);
                    // Fix: Call updateStatePreloadResource when lobby configs are successfully loaded
                    console.log("[PreloadResourceRegister] handleAuthorizedAccess - Calling updateStatePreloadResource after lobby configs");
                    updateStatePreloadResource();
                }
            }
        } catch (error) {
            console.error("[PreloadResourceRegister] handleAuthorizedAccess - Error:", error);
            // Fix: Call updateStatePreloadResource even on error to prevent getting stuck
            updateStatePreloadResource();
        }
    };

    useEffect(() => {
        console.log("[PreloadResourceRegister] useEffect - Component mounted, calling handleAuthorizedAccess");
        handleAuthorizedAccess();
    }, []);

    useEffect(() => {
        console.log("[PreloadResourceRegister] useEffect - gameId or isDirectMode changed:", { gameId, isDirectMode });
        if (!isDirectMode && gameId === 0) {
            console.log("[PreloadResourceRegister] useEffect - Lobby case (gameId = 0), calling updateStatePreloadResource");
            const timer = setTimeout(() => {
                updateStatePreloadResource();
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [gameId, isDirectMode, updateStatePreloadResource]);

    const renderResult = useMemo(() => {
        console.log("[PreloadResourceRegister] useMemo - Calculating render result:", { isDirectMode, gameId });

        if (!isDirectMode && gameId > 0) {
            console.log("[PreloadResourceRegister] useMemo - Rendering PreloadResources for non-direct mode with gameId > 0");
            return (
                <PreloadResources
                    gameId={gameId}
                    setIsDonePreload={updateStatePreloadResource}
                    bannerId={bannerId}
                    gameIdsIcon={gameOfferIds}
                    progressBarId="register-progress-bar"
                />
            );
        }

        if (isDirectMode) {
            console.log("[PreloadResourceRegister] useMemo - Rendering PreloadResources for direct mode");
            return (
                <PreloadResources
                    gameId={gameId}
                    setIsDonePreload={updateStatePreloadResource}
                    bannerId={bannerId}
                    gameIdsIcon={gameOfferIds}
                    progressBarId="register-progress-bar"
                />
            );
        }

        console.log("[PreloadResourceRegister] useMemo - Rendering empty fragment");
        return <></>;
    }, [gameId]);

    return renderResult;
};

export default PreloadResourceRegister;
