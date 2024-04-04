import { FC } from "react";
import { getBallColor } from "../../../_shared/helpers";
import Styles from "./small-ball.module.scss";

const SmallBall: FC<{ number: number; customClass?: string }> = ({ number, customClass }) => {
    const ballColor = getBallColor;
    return <div className={`${Styles["ball"]} ${Styles[ballColor(number)]} ${customClass}`}>{number}</div>;
};

export default SmallBall;
