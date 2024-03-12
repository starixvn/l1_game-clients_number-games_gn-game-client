import React, { FC, useEffect, useState } from "react";

import { useBallColor } from "../../../_shared/helpers/ball-color-helper";
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
}

const Ball: FC<IBall> = (props) => {
    const { number, delayTime, status, index } = props;

    const color = useBallColor({ number });
    const ballStyleName = `${Styles["ball-bg"]} ${Styles[color]} ${status === BallStatus.SHOW ? Styles["display-right-now"] : ""}`;

    const delayStyle = delayTime > 0 ? Styles["delay"] : "";
    const blurStyle = status === BallStatus.NONE ? Styles.blur : Styles.active;

    const [isDelayShowResult, setIsDelayShowResult] = useState<boolean>(false);

    useEffect(() => {
        let timeOut: NodeJS.Timeout;
        if (!isDelayShowResult) {
            timeOut = setTimeout(() => setIsDelayShowResult(true), delayTime);
        }

        return () => {
            clearTimeout(timeOut);
        };
    }, [delayTime, isDelayShowResult]);

    return (
        <div className={`${Styles.ball} ${blurStyle} ${delayStyle}`}>
            {isDelayShowResult && number > 0 && (
                <div className={ballStyleName}>{<span className={`${Styles["ball-number"]} ball-index-${index + 1}`}>{number}</span>}</div>
            )}

            <div className={`${Styles.loading} ${isDelayShowResult && number > 0 ? Styles["hide"] : ""}`}>
                {status === BallStatus.LOADING && <div className={Styles["loading-icon"]}></div>}
            </div>
        </div>
    );
};

export default Ball;
