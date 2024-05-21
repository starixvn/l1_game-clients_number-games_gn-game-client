import { useEffect, useMemo, useState } from "react";
import { AuthorizeResponse, SSOResponse } from "sc-user-service-client/dist/auth";
import { getAppSettings } from "../../../../../_shared/app-settings";
import PreloadResources, { getAndHandleBannerOffer, getAndHandleGameOfferIds } from "../../../../../_shared/helpers/preload-resources";
import { getLobbyConfigs } from "../../../../../services/auth-service";

const PreloadResourceRegister: React.FC<{
    gameId: number;
    updateStatePreloadResource: Function;
    updateLobbyConfigs: Function;
    session: SSOResponse;
    authorizeResponse: AuthorizeResponse;
}> = ({ gameId, updateStatePreloadResource, updateLobbyConfigs, session, authorizeResponse }) => {
    const [bannerId, setBannerId] = useState<number>(0);
    const [gameOfferIds, setGameOfferIds] = useState<number[]>([]);

    const handleAuthorizedAccess = async () => {
        const lobby = await getLobbyConfigs(session);
        if (lobby?.lobbyConfigs) {
            updateLobbyConfigs(lobby?.lobbyConfigs);
            getAndHandleBannerOffer(authorizeResponse, lobby?.lobbyConfigs, setBannerId);
            getAndHandleGameOfferIds(authorizeResponse, lobby?.lobbyConfigs, setGameOfferIds);
        }
    };

    useEffect(() => {
        handleAuthorizedAccess();
    }, []);

    return useMemo(() => {
        return (
            <PreloadResources
                gameId={gameId}
                setIsDonePreload={updateStatePreloadResource}
                enablePreload={getAppSettings()?.enablePreloadResource || true}
                bannerId={bannerId}
                gameIdsIcon={gameOfferIds}
                progressBarId="register-progress-bar"
            />
        );
    }, [gameId]);
};

export default PreloadResourceRegister;
