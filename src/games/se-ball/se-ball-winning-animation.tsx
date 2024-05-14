import { isHighLightWinningResult } from "../../_shared/react-hooks/use-high-light";
import { RoundState } from "../../components/game-base/type";
import { Spritesheet } from "../../components/game-components/sprites-sheet";
import { SeBallBetOptions } from "./se-ball-constants";
import Styles from "./se-ball.module.scss";

type Props = {
    choice: string;
    resourceName: string;
    className?: string;
    roundState: RoundState;
    settlementResult: any;
    showResultInfo: any;
};

const ChoiceWinningSize = {
    [SeBallBetOptions.ODD]: [186, 104],
    [SeBallBetOptions.EVEN]: [186, 104],
    [SeBallBetOptions.BLUE3]: [146, 74],
    [SeBallBetOptions.RED3]: [146, 74],
    [SeBallBetOptions.BLUE4]: [146, 74],
    [SeBallBetOptions.RED4]: [146, 74],
    [SeBallBetOptions.RED2]: [87, 158],
};

const SeBallWinningAnimation: React.FC<Props> = ({ choice, resourceName, roundState, settlementResult, showResultInfo }) => {
    const winningHighLightResult = isHighLightWinningResult;
    const [width, height] = ChoiceWinningSize[choice];

    return (
        winningHighLightResult({ betChoice: choice, roundState, settlementResult, showResultInfo }) && (
            <div className="d-grid">
                <Spritesheet
                    className={`${Styles[`winning-light-anim`]} ${Styles[`anim-${choice}`]}`}
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

                <div className={`highlight-winning-bg-anim ${Styles[`highlight-winning-bg-${choice}`]}`}></div>
            </div>
        )
    );
};

export default SeBallWinningAnimation;
