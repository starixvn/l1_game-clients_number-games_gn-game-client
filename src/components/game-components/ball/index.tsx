import React, { useEffect, useState } from "react";

import { useBallColor } from "../../../_shared/helpers/ball-color-helper";
import Styles from "./ball.module.scss";

const Ball = (props: any) => {
    const { number, isLoading, delayTime, joinGame } = props;

    const color = useBallColor({ number });
    const [isDelayShowResult, setIsDelayShowResult] = useState<boolean>(false);
    const ballStyleName = `${Styles["ball-bg"]} ${Styles[color]} ${joinGame ? Styles["display-right-now"] : ""}`;

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
        <div className={`${Styles.ball} ${delayTime > 0 ? Styles["delay"] : ""}`}>
            {props.number != null && isDelayShowResult && (
                <div className={ballStyleName}>{number > 0 && <span className={Styles["ball-number"]}>{number}</span>}</div>
            )}

            {isLoading && (
                <div className={Styles.loading}>
                    <svg className={Styles["circle-ring"]}>
                        <circle id="after" cx="50%" cy="50%" r="47.2%" strokeDasharray="90.12870025634766" strokeLinecap="butt"></circle>
                    </svg>
                    <div className={Styles["circle-outer"]}></div>
                </div>
            )}
        </div>
    );
};

export default Ball;
