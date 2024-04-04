import { FC } from "react";
import { useBallColor } from "../../../_shared/helpers";
import Styles from "./history.module.scss";

const BetLogResultCell: FC<{ result: { ball: number } }> = ({ result: { ball } }) => {
    const ballColor = useBallColor;
    return (
        <div className={Styles["result-container"]}>
            <div className={`${Styles["ball"]} ${Styles[ballColor({ number: ball })]}`}>{ball}</div>
        </div>
    );
};

export default BetLogResultCell;
