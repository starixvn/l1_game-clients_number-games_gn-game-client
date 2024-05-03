import React, { FC, useEffect, useState } from "react";

import { getBallColor } from "../../../_shared/helpers/ball-color-helper";
import { RoundState } from "../../game-base/type";
import Styles from "./ball.module.scss";

export enum BallStatus {
    NONE = 0,
    LOADING,
    SHOW,
}
export interface IBall {
    number: number;
    status?: BallStatus;
    delayTime?: number;
    index?: number;
    isNormalRound?: boolean;
    roundState?: RoundState;
}

const Ball: FC<IBall> = (props) => {
    const { number, delayTime, status, index, isNormalRound, roundState } = props;

    const color = getBallColor(number);
    const ballStyleName = `${Styles["ball-bg"]} ${Styles[color]} ${status === BallStatus.SHOW ? Styles["display-right-now"] : ""}`;

    const delayStyle = delayTime > 0 ? Styles["delay"] : "";
    const blurStyle = status === BallStatus.NONE ? Styles.blur : Styles.active;

    const [isDelayShowResult, setIsDelayShowResult] = useState<boolean>(false);

    useEffect(() => {
        let timeOut: NodeJS.Timeout;

        if (!isDelayShowResult && (!isNormalRound || (isNormalRound && roundState === RoundState.DisplayResult))) {
            timeOut = setTimeout(() => setIsDelayShowResult(true), delayTime);
        }

        return () => {
            clearTimeout(timeOut);
        };
    }, [delayTime, isDelayShowResult]);

    useEffect(() => {
        if (isNormalRound && roundState === RoundState.None) {
            setIsDelayShowResult(false);
        }
    }, [roundState]);

    return (
        <div className={`${Styles.ball} ${blurStyle} ${isNormalRound ? "" : delayStyle}`}>
            {isDelayShowResult && number > 0 && (
                <div className={ballStyleName}>{<span className={`${Styles["ball-number"]} ball-index-${index + 1}`}>{number}</span>}</div>
            )}
        </div>
    );
};

export default Ball;
