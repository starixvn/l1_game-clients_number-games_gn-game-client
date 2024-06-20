import dynamic from "next/dynamic";
import Image from "next/image";
import { useState } from "react";

import { buildVersion } from "../../../../../_shared/constants";
import { GameSettings } from "../../../../game-base/type";
import { LobbyGameTransmitter } from "../../lobby-socket-connection";
import Styles from "../../lobby.module.scss";
import { LobbyImagesData } from "./lobby-constant";

const OnlinePlayer = dynamic(() => import("./online-player"));

type Props = {
    gameSettings: GameSettings;
    transmitter?: LobbyGameTransmitter;
};

export const GameIcon: React.FC<Props> = ({ gameSettings, transmitter }) => {
    const { gameName, id } = gameSettings;

    const [isLoading, setIsLoading] = useState<boolean>(true);

    return (
        <div className={Styles["icon-game"]} key={id}>
            <Image
                src={
                    isLoading
                        ? LobbyImagesData[id]
                        : `/static/images/lobby/game-board-detail/${id}/icon-${gameName.toLowerCase()}.png?v=${buildVersion}`
                }
                width={130}
                height={138}
                alt={`icon-${gameName.toLowerCase()}`}
                onLoad={() => {
                    setIsLoading(false);
                }}
                priority={true}
            />

            <OnlinePlayer transmitter={transmitter} />
        </div>
    );
};

export default GameIcon;
