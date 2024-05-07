import { isHighLightWinningResult } from "../../_shared/react-hooks/use-high-light";
import { RoundState } from "../../components/game-base/type";
import { Spritesheet } from "../../components/game-components/sprites-sheet";
import Styles from "./se-ball.module.scss";

type Props = {
    choice: string;
    resourceName: string;
    className?: string;
    roundState: RoundState;
    settlementResult: any;
    showResultInfo: any;
};

const SeBallWinningAnimation: React.FC<Props> = ({ choice, resourceName, roundState, settlementResult, showResultInfo }) => {
    const winningHighLightResult = isHighLightWinningResult;

    return (
        winningHighLightResult({ betChoice: choice, roundState, settlementResult, showResultInfo }) && (
            <div className="d-grid">
                <Spritesheet
                    className={`${Styles[`winning-light-anim`]} ${Styles[`anim-${choice}`]}`}
                    image={`/static/images/se-ball/highlight-winning-${resourceName}.png?v=3`}
                    widthFrame={186}
                    isResponsive
                    heightFrame={104}
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
