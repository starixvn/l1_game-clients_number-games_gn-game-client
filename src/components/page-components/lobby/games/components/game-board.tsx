import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useState } from "react";

import { getAppSettings } from "../../../../../_shared/app-settings";
import { buildVersion, LobbyGameId } from "../../../../../_shared/constants";
import PreloadResources from "../../../../../_shared/helpers/preload-resources";
import { useLobbyConnectionContext } from "../../../../../_shared/react-contexts";
import { GameSettings } from "../../../../game-base/type";
import { LoadingSpinner } from "../../../../game-components/game-loading/loading-spinner";
import { getLobbyData, LobbyGameTransmitter, LobbyMessageEvents } from "../../lobby-socket-connection";
import Styles from "../../lobby.module.scss";
import { GameIcon } from "./game-icon";
import { LobbyImagesData } from "./lobby-constant";

const DisabledGameBlock = dynamic(() => import("./disable-game-block"));
const CountdownTimer = dynamic(() => import("./countdown-timer"));
const LobbyScoreboard = dynamic(() => import("./scoreboard"));

type Props = {
    gameSettings: GameSettings;
    openGame: Function;
    gameTransmitter: LobbyGameTransmitter;
    lastClickedGameId: number;
    setLastClickedGameId: Function;
};

export const GameBoard: React.FC<Props> = ({ gameSettings, openGame, gameTransmitter, lastClickedGameId, setLastClickedGameId }) => {
    const [isShow, setIsShow] = useState<boolean>(true);
    const [transmitter, setTransmitter] = useState<LobbyGameTransmitter>(null);
    const { reconnectGameTransmitter, socket } = useLobbyConnectionContext();
    const [isDonePreloadResources, setIsDonePreloadResources] = useState<boolean>(false);
    const [clickGameId, setClickGameId] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [cancelPreloadResource, setCancelPreloadResource] = useState<boolean>(false);
    const [loadingComplete, setLoadingComplete] = useState(false);

    useEffect(() => {
        document.addEventListener("visibilitychange", onVisibilityChange);
        return () => {
            document.removeEventListener("visibilitychange", onVisibilityChange);
            setClickGameId(0);
        };
    }, []);

    const onVisibilityChange = () => {
        !document["hidden"] && getLobbyData(socket, gameSettings.id);
    };

    useEffect(() => {
        if (gameTransmitter) {
            setTransmitter(gameTransmitter);
        } else {
            const newTransmitter = reconnectGameTransmitter(gameSettings.id);
            setTransmitter(newTransmitter);
        }
    }, [gameTransmitter]);

    useEffect(() => {
        const listenerIds: string[] = [];
        if (transmitter) {
            listenerIds.push(transmitter.register(LobbyMessageEvents.SIGNED_IN, handleSignedIn));
            listenerIds.push(transmitter.register(LobbyMessageEvents.SHOW_DATA, handleShowData));
            transmitter.signedIn && getLobbyData(socket, gameSettings.id);
        }

        return () => {
            listenerIds.forEach((listenerId) => transmitter?.unsubscribe(listenerId));
        };
    }, [transmitter]);

    const handleSignedIn = ({ signedIn }) => {
        signedIn && getLobbyData(socket, gameSettings.id);
    };

    const handleShowData = ({ showData }: { showData: boolean }) => {
        setIsShow(showData);
    };

    const handleClickGameBoard = () => {
        setClickGameId(gameSettings?.id);
        setIsLoading(true);
        setLastClickedGameId(gameSettings?.id);
    };

    useEffect(() => {
        if (isDonePreloadResources) {
            setIsLoading(false);
            isShow && openGame(gameSettings.id);
        }

        if (clickGameId !== lastClickedGameId) {
            setCancelPreloadResource(true);
        }
    }, [isDonePreloadResources, clickGameId, lastClickedGameId]);

    useEffect(() => {
        if (cancelPreloadResource) {
            setClickGameId(LobbyGameId);
            setIsLoading(false);
            setCancelPreloadResource(false);
        }
    }, [cancelPreloadResource]);

    return (
        <div
            className={`${Styles["game-board-detail"]} ${!isShow ? "" : Styles["pointer"]}`}
            id={`icon-${gameSettings.gameName.toLowerCase()}`}
        >
            <Image
                className={Styles["background"]}
                width={360}
                height={139}
                src={
                    loadingComplete
                        ? `/static/images/lobby/game-board-detail/bg-game-board-2x.webp?v=${buildVersion}`
                        : LobbyImagesData["game-block"]
                }
                onLoadingComplete={() => setLoadingComplete(true)}
                alt="game-board-detail"
                priority={true}
            />

            <div onClick={handleClickGameBoard} className="d-flex gap-2">
                <GameIcon gameSettings={gameSettings} transmitter={transmitter} />
                {isLoading && <LoadingSpinner />}
                {isShow && (
                    <div className={Styles["detail"]}>
                        <CountdownTimer transmitter={transmitter} gameSettings={gameSettings} />
                        {transmitter && <LobbyScoreboard gameSettings={gameSettings} transmitter={transmitter} />}
                    </div>
                )}
            </div>

            {clickGameId > 0 && (
                <PreloadResources
                    gameId={clickGameId}
                    setIsDonePreload={setIsDonePreloadResources}
                    enablePreload={getAppSettings()?.enablePreloadResource || true}
                    cancelPreload={cancelPreloadResource}
                />
            )}

            <DisabledGameBlock transmitter={transmitter} gameSettings={gameSettings} />
        </div>
    );
};
