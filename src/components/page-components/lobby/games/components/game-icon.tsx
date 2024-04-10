import dynamic from "next/dynamic";
import { buildVersion } from "../../../../../_shared/constants";
import { GameSettings } from "../../../../game-base/type";
import { LobbyGameTransmitter } from "../../lobby-socket-connection";
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
            <img src={`/static/images/lobby/game-board-detail/icon-${gameName.toLowerCase()}.png?v=${buildVersion}`} alt="icon-game" />
            <OnlinePlayer transmitter={transmitter} />
        </div>
    );
};

export default GameIcon;
