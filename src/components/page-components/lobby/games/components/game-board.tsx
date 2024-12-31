import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import Image from "next/image";

import { LobbyGameId } from "../../../../../_shared/constants";
import PreloadResources from "../../../../../_shared/helpers/preload-resources";
import { useLobbyConnectionContext } from "../../../../../_shared/react-contexts";
import { GameSettings } from "../../../../game-base/type";
import { LoadingSpinner } from "../../../../game-components/game-loading/loading-spinner";
import { getLobbyData, LobbyGameTransmitter, LobbyMessageEvents } from "../../lobby-socket-connection";
import { GameIcon } from "./game-icon";
import { LobbyImagesData } from "./lobby-constant";
import { CachedImage } from "../../../../game-components/cached-image";
import styles from "./game-board.module.scss";
import { useTranslator } from "../../../../../_shared/react-hooks";
import { GameBoardHeader } from './game-board-header';
import { GameBoardFooter } from './game-board-footer';

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
    const [isPlayButtonDisabled, setIsPlayButtonDisabled] = useState<boolean>(false);

    useEffect(() => {
        const cleanup = () => {
            document.removeEventListener("visibilitychange", onVisibilityChange);
            setClickGameId(0);
        };

        document.addEventListener("visibilitychange", onVisibilityChange);
        return cleanup;
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

    const handlePlay = () => {
        if (isPlayButtonDisabled || isLoading) return;

        setIsPlayButtonDisabled(true);
        setClickGameId(gameSettings?.id);
        setIsLoading(true);
        setLastClickedGameId(gameSettings?.id);

        setTimeout(() => {
            setIsPlayButtonDisabled(false);
        }, 3000);
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

    const renderPlayButton = () => (
        <div
            className={`${styles.playButtonWrapper} ${(isPlayButtonDisabled || isLoading) ? styles.disabled : ''}`}
            role="button"
            tabIndex={0}
            aria-label="Play game"
        >
            {isLoading ? (
                <LoadingSpinner />
            ) : (
                <div className={styles.playButton} onClick={handlePlay}>
                    {t('play')}
                    <Image
                        src="/images/play-icon.png"
                        className={styles.playIcon}
                        width={24}
                        height={24}
                        alt="play-icon"
                        priority={true}
                    />
                </div>
            )}
        </div>
    );

    return (
        <div className={styles.gameCard} id={`icon-${gameSettings.gameName.toLowerCase()}`}>
            <Image
                src="/images/background-card-game.png"
                className={styles.backgroundImage}
                width={360}
                height={139}
                alt="game-board-background"
                priority={true}
            />

            <div className={styles.gameContent}>
                <GameBoardHeader
                    gameSettings={gameSettings}
                    isLoading={isLoading}
                    isShow={isShow}
                    transmitter={transmitter}
                />

                <div className={styles.gameBody}>
                    {isShow && transmitter && (
                        <div className={styles.scoreboardContainer}>
                            <LobbyScoreboard
                                gameSettings={gameSettings}
                                transmitter={transmitter}
                            />
                        </div>
                    )}
                </div>
            </div>

            {renderPlayButton()}

            {clickGameId > 0 && (
                <PreloadResources
                    gameId={clickGameId}
                    setIsDonePreload={() => {
                        setIsDonePreloadResources(true);
                        setIsPlayButtonDisabled(false);
                    }}
                    cancelPreload={cancelPreloadResource}
                />
            )}

            <DisabledGameBlock transmitter={transmitter} gameSettings={gameSettings} />
        </div>
    );
};
