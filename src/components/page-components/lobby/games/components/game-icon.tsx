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
    console.log(gameName.toLowerCase());

    return (
        <div className={`${Styles["icon-game"]} ${Styles[gameName.toLowerCase()]}`}>
            {/* <img src={`/static/images/lobby/game-board-detail/icon-${gameName.toLowerCase()}.png`} alt="icon-game" /> */}
            <div className={Styles["video-wrapper"]} id="video-wrapper">
                <video
                    className={Styles["video"]}
                    playsInline
                    autoPlay
                    muted
                    loop
                    poster="/static/images/lobby/game-board-detail/icon-bacball1.png"
                >
                    <source src="/static/images/lobby/game-board-detail/icon-gif.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
            </div>
            <span className={`${Styles["game-name"]}`}>{t(`game_icon_name_${id}`)}</span>
            <OnlinePlayer transmitter={transmitter} />
        </div>
    );
};
