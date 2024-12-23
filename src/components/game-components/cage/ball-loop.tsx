import { memo, useEffect, useState } from "react";

import { useLowPerformanceDevice, useMemoriedImage } from "../../../_shared/react-hooks";
import { Spritesheet } from "../sprites-sheet";
import Styles from "./cage.module.scss";

const BallLoops: React.FC<{ isPlayStartRoundAnimation?: boolean }> = ({ isPlayStartRoundAnimation }) => {
    const isLowPerformanceDevice = useLowPerformanceDevice();
    const [showIdleBalls, setShowIdleBalls] = useState(false);
    const { data } = useMemoriedImage(`/static/images/cage/cage-loop-anim.webp`);

    useEffect(() => {
        let timeOut: NodeJS.Timeout;

        if (isPlayStartRoundAnimation) {
            setShowIdleBalls(true);
            timeOut = setTimeout(() => {
                setShowIdleBalls(false);
            }, 1300);
        }

        return () => {
            clearTimeout(timeOut);
        };
    }, [isPlayStartRoundAnimation]);

    if (!data) {
        return <></>;
    }

    const renderBalls = () => {
        return (
            <Spritesheet
                className={`fade-in ${Styles["balls-loop"]}`}
                imageData={data}
                widthFrame={130}
                isResponsive
                heightFrame={130}
                steps={11}
                autoplay
                loop
                fps={isLowPerformanceDevice ? 30 : 40}
            />
        );
    };

    return (
        <div id="cage-balls" className={Styles["cage-balls"]}>
            {showIdleBalls ? <div className={Styles["idle-balls"]} /> : renderBalls()}
        </div>
    );
};

export default memo(BallLoops);
