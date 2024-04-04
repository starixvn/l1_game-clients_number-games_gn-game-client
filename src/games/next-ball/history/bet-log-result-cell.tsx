import { FC } from "react";

import { getBallColor } from "../../../_shared/helpers";
import Styles from "./history.module.scss";

const BetLogResultCell: FC<{ result: { ball: number } }> = ({ result: { ball } }) => {
    const ballColor = getBallColor;
    return (
        <div className={Styles["result-container"]}>
            <div className={`${Styles["ball"]} ${Styles[ballColor(ball)]}`}>{ball}</div>
        </div>
    );
};

export default BetLogResultCell;
