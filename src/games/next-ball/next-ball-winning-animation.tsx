import { isHighLightWinningResult } from "../../_shared/react-hooks/use-high-light";
import { RoundState } from "../../components/game-base/type";
import { Spritesheet } from "../../components/game-components/sprites-sheet";
import Styles from "./next-ball.module.scss";

type Props = {
    choice: string;
    resourceName: string;
    width: number;
    height: number;
    position: [number, number];
    className?: string;
    roundState: RoundState;
    settlementResult: any;
    showResultInfo: any;
};

const NextBallWinningAnimation: React.FC<Props> = ({ choice, resourceName, roundState, settlementResult, showResultInfo }) => {
    const winningHighLightResult = isHighLightWinningResult;

    return (
        winningHighLightResult({ betChoice: choice, roundState, settlementResult, showResultInfo }) && (
            <div className="d-grid">
                <Spritesheet
                    className={Styles[`winning-light-anim-${choice}`]}
                    image={`/static/images/bac-number/highlight-winning-${resourceName}.png`}
                    widthFrame={200}
                    isResponsive
                    heightFrame={210}
                    steps={9}
                    autoplay={true}
                    loop={true}
                    fps={5}
                />

                <div className={Styles[`winning-${choice}`]}></div>
            </div>
        )
    );
};

export default NextBallWinningAnimation;
