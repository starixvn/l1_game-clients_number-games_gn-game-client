import { FC } from "react";

import { numberWithCommas } from "../../../_shared/helpers";
import { useGameStateContext } from "../../../_shared/react-contexts/game-state-context/game-state-context";
import Styles from "./winning-result-effect.module.scss";

const WinningResultEffect: FC = () => {
    const { betWin, showResultInfo } = useGameStateContext();

    if (betWin <= 0 || !showResultInfo) {
        return <></>;
    }

    return <div className={Styles["winning-result"]}>{`+${numberWithCommas(betWin, 1)}`}</div>;
};

export default WinningResultEffect;
