import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import { LobbyGameId } from "../../../../../_shared/constants";
import PreloadResources from "../../../../../_shared/helpers/preload-resources";
import { useLobbyConnectionContext } from "../../../../../_shared/react-contexts";
import { GameSettings } from "../../../../game-base/type";
import { LoadingSpinner } from "../../../../game-components/game-loading/loading-spinner";
import { getLobbyData, LobbyGameTransmitter, LobbyMessageEvents } from "../../lobby-socket-connection";
import Styles from "../../lobby.module.scss";
import { GameIcon } from "./game-icon";
import { LobbyImagesData } from "./lobby-constant";
import { CachedImage } from "../../../../game-components/cached-image";
import styles from "./game-board.module.scss";
import { useTranslator } from "../../../../../_shared/react-hooks";

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
    const { t } = useTranslator([gameSettings.tolgeeNamespace]);

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
        <div className={styles.gameCard} id={`icon-${gameSettings.gameName.toLowerCase()}`}>
            <CachedImage
                src={`/static/images/lobby/game-board-detail/bg-game-board-2x.webp`}
                blurSrc={LobbyImagesData["game-block"]}
                className={styles.backgroundImage}
                width={360}
                height={139}
                alt="game-board-detail"
                priority={true}
            />

            <div className={styles.gameContent} >
                <div className={styles.gameHeader}>
                    <div className={styles.gameInfo}>
                        <h2>{t(`${gameSettings.tolgeeNamespace}.game_name_${gameSettings.id}`).toUpperCase()}</h2>
                    </div>
                    {isLoading ? (
                        <LoadingSpinner />
                    ) : (
                        isShow && (
                            <div className={styles.timerContainer}>
                                <CountdownTimer transmitter={transmitter} gameSettings={gameSettings} />
                            </div>
                        )
                    )}
                </div>

                <div className={styles.gameBody}>
                    {isShow && transmitter && (
                        <div className={styles.scoreboardContainer}>
                            <LobbyScoreboard gameSettings={gameSettings} transmitter={transmitter} />
                        </div>
                    )}
                </div>

                <div className={styles.gameFooter}>
                    <div className={styles.info}>
                        {/* <span className={styles.betRange}>
                            {gameSettings.betRange?.min || 1} - {gameSettings.betRange?.max || 100}
                        </span>
                        <span className={styles.rtp}>
                            RTP 24h: {gameSettings.rtp || 96}%
                        </span> */}
                    </div>
                    <button
                        className={styles.playButton}
                        onClick={() => handleClickGameBoard()}
                    >
                        PLAY
                    </button>
                </div>
            </div>

            {clickGameId > 0 && (
                <PreloadResources
                    gameId={clickGameId}
                    setIsDonePreload={() => setIsDonePreloadResources(true)}
                    cancelPreload={cancelPreloadResource}
                />
            )}

            <DisabledGameBlock transmitter={transmitter} gameSettings={gameSettings} />
        </div>
    );
};
