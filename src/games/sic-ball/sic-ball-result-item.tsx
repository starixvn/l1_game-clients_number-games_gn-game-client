import { FC } from "react";

import { buildVersion } from "../../_shared/constants";
import { BallColor } from "../../components/game-base/type";
import BallRotation from "../../components/game-components/cage-result-list/ball-rotation";
import { Spritesheet } from "../../components/game-components/sprites-sheet";
import Style from "./sic-ball.module.scss";

const SicBallResultItem: FC<{ showBallDelayTime: number; ballNumber: number }> = ({ showBallDelayTime, ballNumber }) => {
    return (
        <div className={Style["cage-container"]}>
            <Spritesheet
                className={"bottom-effect"}
                image={`/static/images/sic-ball/hub-interface.webp?v=${buildVersion}`}
                widthFrame={124}
                isResponsive
                heightFrame={155}
                steps={20}
                autoplay={true}
                loop={true}
                fps={20}
                startAt={2}
            />
            <div className={Style["cage"]}></div>
            <Spritesheet
                className={Style["ball-loop"]}
                image={`/static/images/cage/six-balls-loop.webp?v=${buildVersion}`}
                widthFrame={65}
                isResponsive
                heightFrame={65}
                steps={38}
                autoplay={true}
                loop={true}
                fps={20}
            />
            <BallRotation
                ballPos={1}
                number={ballNumber}
                playResultAnimation={true}
                delayTime={showBallDelayTime}
                color={BallColor.BLUE}
                incrementTotalPoint={() => {}}
                customClassName={Style["ball-rotation"]}
            />
        </div>
    );
};

export default SicBallResultItem;
