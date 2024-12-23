import { FC } from "react";
import { getBallColor } from "../../../_shared/helpers";
import Styles from "./small-ball.module.scss";
import { useMemoriedImage } from "../../../_shared/react-hooks";

const SmallBall: FC<{ number: number; customClass?: string }> = ({ number, customClass }) => {
    const ballColor = getBallColor;
    const { data } = useMemoriedImage(`/static/images/ball/ball-${ballColor(number)}.png`);
    if (!data) {
        return <></>;
    }

    return (
        <div className={`${Styles["ball"]} ${customClass}`} style={{ backgroundImage: `url(${data})` }}>
            {number}
        </div>
    );
};

export default SmallBall;
