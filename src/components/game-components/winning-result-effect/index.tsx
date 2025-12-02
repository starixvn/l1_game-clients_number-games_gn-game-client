import { FC, useMemo } from "react";

import { numberWithCommas } from "../../../_shared/helpers";
import { useGameStateContext } from "../../../_shared/react-contexts/game-state-context/game-state-context";
import Styles from "./winning-result-effect.module.scss";

const WinningResultEffect: FC = () => {
    const { betWin, showResultInfo } = useGameStateContext();

    return useMemo(() => {
        if (betWin <= 0 || !showResultInfo) {
            return <></>;
        }

        return <div className={Styles["winning-result"]}>{`+${numberWithCommas(betWin, 4)}`}</div>;
    }, [betWin, showResultInfo]);
};

export default WinningResultEffect;
