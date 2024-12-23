import dynamic from "next/dynamic";
import { buildVersion } from "../../../../../_shared/constants";
import { GameSettings } from "../../../../game-base/type";
import { LobbyGameTransmitter } from "../../lobby-socket-connection";
import Styles from "../../lobby.module.scss";
import { LobbyImagesData } from "./lobby-constant";
import { CachedImage } from "../../../../game-components/cached-image";

const OnlinePlayer = dynamic(() => import("./online-player"));

type Props = {
    gameSettings: GameSettings;
    transmitter?: LobbyGameTransmitter;
};

export const GameIcon: React.FC<Props> = ({ gameSettings, transmitter }) => {
    const { gameName, id } = gameSettings;

    return (
        <div className={Styles["icon-game"]} key={id}>
            <CachedImage
                src={`/static/images/lobby/game-board-detail/${id}/icon-${gameName.toLowerCase()}.png`}
                blurSrc={LobbyImagesData[id]}
                width={130}
                height={138}
                alt={`icon-${gameName.toLowerCase()}`}
                priority={true}
            />
            <OnlinePlayer transmitter={transmitter} />
        </div>
    );
};

export default GameIcon;
