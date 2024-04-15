import dynamic from "next/dynamic";
import { GameSettings } from "../../../../game-base/type";
import { LobbyGameTransmitter } from "../../lobby-socket-connection";
import Image from "next/image";
import Styles from "../../lobby.module.scss";

const OnlinePlayer = dynamic(() => import("./online-player"));

type Props = {
    gameSettings: GameSettings;
    transmitter: LobbyGameTransmitter;
};

export const GameIcon: React.FC<Props> = ({ gameSettings, transmitter }) => {
    const { gameName } = gameSettings;

    return (
        <div className={`${Styles["icon-game"]} ${Styles[gameName.toLowerCase()]}`}>
            <Image
                src={`/static/images/lobby/game-board-detail/icon-${gameName.toLowerCase()}.png`}
                width={130}
                height={138}
                alt={`icon-${gameName.toLowerCase()}`}
            />

            <OnlinePlayer transmitter={transmitter} />
        </div>
    );
};

export default GameIcon;
