import { FC } from "react";
import Styles from "./history.module.scss";
import SmallBall from "../../../components/game-components/small-ball";

const BetLogResultCell: FC<{ result: { ball: number } }> = ({ result: { ball } }) => {
    return (
        <div className={Styles["result-container"]}>
            <SmallBall number={ball} />
        </div>
    );
};

export default BetLogResultCell;
