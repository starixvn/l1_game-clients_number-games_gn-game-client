import React from "react";
import Styles from "./ball.module.scss";
const Ball = (props: any) => {
    return (
        <div className={`${Styles.ball} ${props.isLoading || props.isEmpty ? Styles["ball-border-gray"] : Styles["ball-border-black"]}`}>
            {props.number != null && (
                <div className={`${Styles["ball-bg"]} ${Styles[props.color]}`}>
                    <span className={Styles["ball-number"]}>{props.number}</span>
                </div>
            )}

            {props.isLoading && (
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
