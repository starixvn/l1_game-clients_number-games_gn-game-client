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



    const handleAuthorizedAccess = async () => {
        try {
            const lobby = await getLobbyConfigs(session);

            if (!lobby || Object.keys(lobby.lobbyConfigs).length === 0) {
                updateStatePreloadResource();
            } else {
                if (lobby?.lobbyConfigs) {
                    updateLobbyConfigs(lobby?.lobbyConfigs);
                    getAndHandleBannerOffer(authorizeResponse, lobby?.lobbyConfigs, setBannerId);
                    getAndHandleGameOfferIds(authorizeResponse, lobby?.lobbyConfigs, setGameOfferIds);
                    // Fix: Call updateStatePreloadResource when lobby configs are successfully loaded
                    updateStatePreloadResource();
                }
            }
        } catch (error) {
            // Fix: Call updateStatePreloadResource even on error to prevent getting stuck
            updateStatePreloadResource();
        }
    };

    useEffect(() => {
        handleAuthorizedAccess();
    }, []);

    useEffect(() => {
        if (!isDirectMode && gameId === 0) {
            const timer = setTimeout(() => {
                updateStatePreloadResource();
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [gameId, isDirectMode, updateStatePreloadResource]);

    const renderResult = useMemo(() => {
        if (!isDirectMode && gameId > 0) {
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

        return <></>;
    }, [gameId]);

    return renderResult;
};

export default PreloadResourceRegister;
