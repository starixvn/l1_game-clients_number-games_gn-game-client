import { FC } from "react";

import SmallBall from "../../../components/game-components/small-ball";
import Styles from "./history.module.scss";

const BetLogResultCell: FC<{ result: { balls: number[] } }> = ({ result: { balls } }) => {
    return (
        <div className={Styles["result-container"]}>
            {balls.map((ball, index) => {
                return <SmallBall number={ball} key={index} />;
            })}
        </div>
    );
};

export default BetLogResultCell;
