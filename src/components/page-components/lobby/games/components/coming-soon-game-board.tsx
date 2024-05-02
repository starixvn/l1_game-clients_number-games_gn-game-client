import Image from "next/image";
import { useTranslator } from "../../../../../_shared/react-hooks/use-translator";
import { ResourceTypes } from "../../../../../_shared/resources";
import { GameSettings } from "../../../../game-base/type";
import Styles from "../../lobby.module.scss";
import { GameIcon } from "./game-icon";

type Props = {
    gameSettings: GameSettings;
};

export const ComingSoonGameBoard: React.FC<Props> = ({ gameSettings }) => {
    const { t } = useTranslator();
    return (
        <div className={Styles["game-board-detail"]} id={`icon-${gameSettings.gameName.toLowerCase()}`}>
            <GameIcon gameSettings={gameSettings} />
            <Image
                className={Styles["scoreboard-comingsoon"]}
                src={`/static/images/lobby/game-board-detail/scoreboard.svg`}
                width={209}
                height={92}
                alt={`scoreboard`}
            />
            <div className={Styles["coming-soon-text"]}>{t(`${ResourceTypes.SABA_NUMBER}.lobby_game_icon`)}</div>
        </div>
    );
};
