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
    [SicBallBetOptions.BIG]: [174, 104],
    [SicBallBetOptions.SMALL]: [174, 104],
    [SicBallBetOptions.SPECIFIC1]: [113, 60],
    [SicBallBetOptions.SPECIFIC2]: [113, 60],
    [SicBallBetOptions.SPECIFIC3]: [113, 60],
    [SicBallBetOptions.SPECIFIC4]: [113, 60],
    [SicBallBetOptions.SPECIFIC5]: [113, 60],
    [SicBallBetOptions.SPECIFIC6]: [113, 60],
};

const SicBallWinningAnimation: React.FC<Props> = ({ choice, resourceName, roundState, settlementResult, showResultInfo }) => {
    const winningHighLightResult = isHighLightWinningResult;
    const [width, height] = ChoiceWinningSize[choice];

    return (
        winningHighLightResult({ betChoice: choice, roundState, settlementResult, showResultInfo }) && (
            <div className="d-grid">
                <Spritesheet
                    className={`${Styles["winning-light-anim"]} ${Styles["anim-" + choice]}`}
                    image={`/static/images/se-ball/highlight-winning-${resourceName}.png?v=4`}
                    widthFrame={width}
                    isResponsive
                    heightFrame={height}
                    steps={10}
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
