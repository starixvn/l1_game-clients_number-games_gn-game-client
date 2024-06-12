import { FC, memo } from "react";

import { buildVersion } from "../../_shared/constants";
import { GameStateContextModel } from "../../_shared/react-contexts/game-state-context/game-state-context-model";
import useResult from "../../_shared/react-hooks/use-result";
import { RoundState } from "../../components/game-base/type";
import { Spritesheet } from "../../components/game-components/sprites-sheet";
import Style from "./sic-ball.module.scss";
import { SicBallResult } from "./types";

export type SicBallResultBlockProps = Partial<GameStateContextModel>;

const SicBallResultBlock: FC<SicBallResultBlockProps> = (props: SicBallResultBlockProps) => {
    const { result, roundState, roundHistory, playResultAnimation, isPlayStartRoundAnimation } = props;
    const currentResult = useResult<SicBallResult>({ result, roundState, roundHistory });

    if (roundState === RoundState.BeforePlaceBet && !isPlayStartRoundAnimation) {
        return <></>;
    }

    return (
        <div
            className={`${Style["result-container"]} ${
                roundState === RoundState.BeforePlaceBet && isPlayStartRoundAnimation ? "showResultContainer " : ""
            }`}
        >
            <div className={Style["cage-container"]}>
                <Spritesheet
                    className={"bottom-effect"}
                    image={`/static/images/sic-ball/hub-interface.webp?v=${buildVersion}`}
                    widthFrame={123}
                    isResponsive
                    heightFrame={155}
                    steps={24}
                    autoplay={true}
                    loop={true}
                    fps={20}
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
            </div>
            <div className={Style["cage-container"]}>
                <Spritesheet
                    className={"bottom-effect"}
                    image={`/static/images/sic-ball/hub-interface.webp?v=${buildVersion}`}
                    widthFrame={123}
                    isResponsive
                    heightFrame={155}
                    steps={24}
                    autoplay={true}
                    loop={true}
                    fps={20}
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
            </div>
            <div className={Style["cage-container"]}>
                <Spritesheet
                    className={"bottom-effect"}
                    image={`/static/images/sic-ball/hub-interface.webp?v=${buildVersion}`}
                    widthFrame={123}
                    isResponsive
                    heightFrame={155}
                    steps={24}
                    autoplay={true}
                    loop={true}
                    fps={20}
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
            </div>
        </div>
    );
};

export default memo(SicBallResultBlock);
