import { FC } from "react";

import { buildVersion } from "../../_shared/constants";
import { Spritesheet } from "../../components/game-components/sprites-sheet";
import Style from "./sic-ball.module.scss";
import { useMemoriedImage } from "../../_shared/react-hooks";
import SicBallCage from "./sic-ball-cage";

const SicBallResultCage: FC<{ startFrame: number }> = ({ startFrame }) => {
    const { data: hubInterfaceData } = useMemoriedImage(`/static/images/sic-ball/hub-interface.webp`);

    const { data: sixBallsLoopData } = useMemoriedImage(`/static/images/sic-ball/six-balls-loop.webp`);

    const isLoaded = hubInterfaceData && sixBallsLoopData;
    if (!isLoaded) {
        return <></>;
    }

    return (
        <div className={Style["cage-container"]}>
            <Spritesheet
                className={Style["cage-effect"]}
                image={`/static/images/sic-ball/hub-interface.webp?v=${buildVersion}`}
                imageData={hubInterfaceData}
                widthFrame={162}
                isResponsive
                heightFrame={130}
                steps={16}
                autoplay={true}
                loop={true}
                fps={20}
                startAt={startFrame}
            />
            <SicBallCage />
            <Spritesheet
                className={Style["ball-loop"]}
                image={`/static/images/sic-ball/six-balls-loop.webp?v=${buildVersion}`}
                imageData={sixBallsLoopData}
                widthFrame={65}
                isResponsive
                heightFrame={65}
                steps={38}
                autoplay={true}
                loop={true}
                startAt={startFrame}
                fps={20}
            />
        </div>
    );
};

export default SicBallResultCage;
