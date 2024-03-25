import Styles from "../../lobby.module.scss";
import { OnlinePlayer } from "./online-player";
import { useTranslator } from "../../../../../_shared/react-hooks";
import { GameSettings } from "../../../../game-base/type";
import { LobbyGameTransmitter } from "../../lobby-socket-connection";

type Props = {
    gameSettings: GameSettings;
    transmitter: LobbyGameTransmitter;
};

export const GameIcon: React.FC<Props> = ({ gameSettings, transmitter }) => {
    const { tolgeeNamespace, gameName, id } = gameSettings;
    const { t } = useTranslator([tolgeeNamespace]);

    return (
        <div className={`${Styles["icon-game"]}`}>
            <img src={`/static/images/lobby/game-board-detail/icon-${gameName.toLowerCase()}.png`} alt="icon-game-1" />
            <span className={`${Styles["game-name"]}`}>{t(`game_icon_name_${id}`)}</span>
            <OnlinePlayer transmitter={transmitter} />
        </div>
    );
};
