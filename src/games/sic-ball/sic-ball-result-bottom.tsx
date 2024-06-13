import { FC, useEffect, useState } from "react";

import Style from "./sic-ball.module.scss";

const SicBallResultBottom: FC<any> = () => {
    const [showTotalPoint, setShowTotalPoint] = useState(false);

    useEffect(() => {}, []);

    return (
        <div>
            <div className={Style["total-point-bg-blur"]}></div>
            <span className={Style["total-point"]}>10 - small</span>
        </div>
    );
};

export default SicBallResultBottom;
