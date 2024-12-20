import { buildVersion } from "../../_shared/constants";
import { isHighLightWinningResult } from "../../_shared/react-hooks/use-high-light";
import { RoundState } from "../../components/game-base/type";
import { Spritesheet } from "../../components/game-components/sprites-sheet";
import Styles from "./bac-ball.module.scss";

type Props = {
    choice: string;
    resourceName: string;
    className?: string;
    roundState: RoundState;
    settlementResult: any;
    showResultInfo: any;
};

export const BacBallWinningAnimation: React.FC<Props> = ({ choice, resourceName, roundState, settlementResult, showResultInfo }) => {
    const winningHighLightResult = isHighLightWinningResult;

    return (
        resourceName &&
        winningHighLightResult({ betChoice: choice, roundState, settlementResult, showResultInfo }) && (
            <div className={`d-grid`}>
                <Spritesheet
                    className={Styles[`winning-light-anim-${choice}`]}
                    imageData={`/static/images/bac-number/highlight-winning-${resourceName}.png?v=${buildVersion}`}
                    widthFrame={200}
                    isResponsive
                    heightFrame={210}
                    steps={9}
                    autoplay={true}
                    loop={true}
                    fps={22}
                />
                <div className={`highlight-winning-bg-anim ${Styles[`highlight-winning-${choice}`]}`}></div>
            </div>
        )
    );
};

export default BacBallWinningAnimation;
