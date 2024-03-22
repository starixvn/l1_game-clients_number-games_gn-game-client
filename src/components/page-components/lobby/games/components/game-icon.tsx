import Styles from "../../lobby.module.scss";
import { LobbyGameTransmitter } from "./game-board";
import { OnlinePlayer } from "./online-player";
import { useTranslator } from "../../../../../_shared/react-hooks";
import { GameSettings } from "../../../../game-base/type";

type Props = {
    gameSettings: GameSettings;
    lobbyGameTransmitter: LobbyGameTransmitter;
};

export const GameIcon: React.FC<Props> = ({ gameSettings, lobbyGameTransmitter }) => {
    const { tolgeeNamespace, gameName, id } = gameSettings;
    const { t } = useTranslator([tolgeeNamespace]);

    return (
        <div className={`${Styles["icon-game"]}`}>
            <img src={`/static/images/lobby/game-board-detail/icon-${gameName.toLowerCase()}.png`} alt="icon-game-1" />
            <span className={`${Styles["game-name"]}`}>{t(`game_icon_name_${id}`)}</span>
            <OnlinePlayer lobbyGameTransmitter={lobbyGameTransmitter} />
        </div>
    );
};
