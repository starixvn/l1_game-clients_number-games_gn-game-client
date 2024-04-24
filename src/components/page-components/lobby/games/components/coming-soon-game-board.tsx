import { GameSettings } from "../../../../game-base/type";
import Styles from "../../lobby.module.scss";
import { GameIcon } from "./game-icon";

type Props = {
    gameSettings: GameSettings;
};

export const ComingSoonGameBoard: React.FC<Props> = ({ gameSettings }) => {
    return (
        <div className={Styles["game-board-detail"]} id={`icon-${gameSettings.gameName.toLowerCase()}`}>
            <GameIcon gameSettings={gameSettings} />
            <div className={Styles["detail"]}>coming soon</div>
        </div>
    );
};
