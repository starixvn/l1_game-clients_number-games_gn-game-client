import { FC } from "react";

import { useGameStateContext } from "../../../_shared/react-contexts/game-state-context/game-state-context";
import Styles from "./winning-result-effect.module.scss";

const WinningResultEffect: FC = () => {
    const { betWin, showResultInfo } = useGameStateContext();

    if (!betWin || !showResultInfo) {
        return <></>;
    }

    return (
        <div className={Styles["winning-result-container"]}>
            <div className={Styles["winning-result"]}>{`+${betWin}`}</div>
        </div>
    );
};

export default WinningResultEffect;
