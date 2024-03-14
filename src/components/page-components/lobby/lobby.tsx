import { useEffect, useState } from "react";
import { Banner } from "../banner";
import { GameIcon } from "../dashboard/game-icon";
import { initLobbySocket } from "./lobby-socket-connection";
import Styles from "./lobby.module.scss";
import { usePlayerContext } from "../../../_shared/react-contexts";
import { Socket } from "socket.io-client";
import { StorageHelper, localStorageKeys } from "../../../_shared/helpers";

export const Lobby: React.FC<any> = ({ openGame }) => {
    const [socket, setSocket] = useState<Socket>(null);
    const { session } = usePlayerContext();

    // TODO: get offerGames from user service
    const offerGameIds = [1001];

    useEffect(() => {
        const socketGateWay = initLobbySocket(session, offerGameIds);
        setSocket(socketGateWay);

        return () => {
            socketGateWay?.disconnect();
            setSocket(null);
        };
    }, []);
    return (
        socket && (
            <div className={Styles["lobby-container"]}>
                <div className="background-galaxy">
                    <img className="galaxy-2" src="/static/images/bg-galaxy.jpg" alt="galaxy" />
                    <img className="galaxy-1" src="/static/images/bg-galaxy.jpg" alt="galaxy" />
                </div>
                <div className="star-field">
                    <div className="layer"></div>
                    <div className="layer"></div>
                    <div className="layer"></div>
                </div>
                <Banner />
                <div className={Styles["game-board-detail"]} id="ico-bacball" onClick={() => openGame(1001)}>
                    <GameIcon gameName="Bac Ball" onlineUsers={15} />
                    <div className={Styles["detail"]}>
                        <div className={Styles["detail-top"]}>
                            <span className="icon-clock" />
                            Starting bet
                        </div>
                        <img src="/static/images/game-board-detail/scoreboard.svg" alt="scoreboard" />
                    </div>
                </div>
            </div>
        )
    );
};
