import { FC } from "react";

import { buildVersion } from "../../_shared/constants";
import { Spritesheet } from "../../components/game-components/sprites-sheet";
import Style from "./sic-ball.module.scss";

const SicBallResultCage: FC<any> = () => {
    return (
        <div className={Style["cage-container"]}>
            <Spritesheet
                className={Style["cage-effect"]}
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
                image={`/static/images//sic-ball/six-balls-loop.webp?v=${buildVersion}`}
                widthFrame={65}
                isResponsive
                heightFrame={65}
                steps={38}
                autoplay={true}
                loop={true}
                fps={20}
            />
        </div>
    );
};

export default SicBallResultCage;
