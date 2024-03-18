import Styles from "./game-icon.module.scss";
import { LobbyGameTransmitter } from "./game-board";
import { OnlinePlayer } from "./online-player";

type Props = {
    gameName: string;
    lobbyGameTransmitter: LobbyGameTransmitter;
};

export const GameIcon: React.FC<Props> = (props) => {
    const gameIconName = props.gameName.replace(/\s+/g, "").toLowerCase();
    return (
        <div className={`${Styles["icon-game"]}`}>
            <img src={`/static/images/game-board-detail/icon-${gameIconName}.png`} alt="icon-game-1" />
            <span className={`${Styles["game-name"]}`}>{props.gameName}</span>
            <OnlinePlayer lobbyGameTransmitter={props.lobbyGameTransmitter} />
        </div>
    );
};
