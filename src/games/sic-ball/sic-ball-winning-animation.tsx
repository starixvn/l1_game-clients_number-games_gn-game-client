import { useMemoriedImage } from "../../_shared/react-hooks";
import { isHighLightWinningResult } from "../../_shared/react-hooks/use-high-light";
import { RoundState } from "../../components/game-base/type";
import { Spritesheet } from "../../components/game-components/sprites-sheet";
import { SicBallBetOptions } from "./sic-ball-constants";
import Styles from "./sic-ball.module.scss";

type Props = {
    choice: string;
    resourceName: string;
    className?: string;
    roundState: RoundState;
    settlementResult: any;
    showResultInfo: any;
};

const ChoiceWinningSize = {
    [SicBallBetOptions.BIG]: [188, 118],
    [SicBallBetOptions.SMALL]: [188, 118],
    [SicBallBetOptions.SPECIFIC1]: [124, 72],
    [SicBallBetOptions.SPECIFIC2]: [124, 72],
    [SicBallBetOptions.SPECIFIC3]: [124, 72],
    [SicBallBetOptions.SPECIFIC4]: [124, 72],
    [SicBallBetOptions.SPECIFIC5]: [124, 72],
    [SicBallBetOptions.SPECIFIC6]: [124, 72],
};

const SicBallWinningAnimation: React.FC<Props> = ({ choice, resourceName, roundState, settlementResult, showResultInfo }) => {
    const winningHighLightResult = isHighLightWinningResult;
    const [width, height] = ChoiceWinningSize[choice];
    const { data } = useMemoriedImage(`/static/images/sic-ball/winning-effect-${resourceName}.png?v=4`);

    if (!data) {
        return <></>;
    }

    return (
        winningHighLightResult({ betChoice: choice, roundState, settlementResult, showResultInfo }) && (
            <div className="d-grid">
                <Spritesheet
                    className={`${Styles["winning-light-anim"]} ${Styles["anim-" + choice]}`}
                    imageData={data}
                    widthFrame={width}
                    isResponsive
                    heightFrame={height}
                    steps={resourceName === "small" ? 15 : 29}
                    autoplay={true}
                    loop={true}
                    fps={20}
                    startAt={0}
                    endAt={29}
                />

                <div className={`highlight-winning-bg-anim ${Styles["highlight-winning-bg-" + choice]}`}></div>
            </div>
        )
    );
};

export default SicBallWinningAnimation;
