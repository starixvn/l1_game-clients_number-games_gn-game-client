import { useMemoriedImage } from "../../_shared/react-hooks";
import { isHighLightWinningResult } from "../../_shared/react-hooks/use-high-light";
import { RoundState } from "../../components/game-base/type";
import { Spritesheet } from "../../components/game-components/sprites-sheet";
import { LuckyThreeBetOptions } from "./lucky-three-constants";
import Styles from "./lucky-three.module.scss";

type Props = {
    choice: string;
    resourceName: string;
    className?: string;
    roundState: RoundState;
    settlementResult: any;
    showResultInfo: any;
};

const ChoiceWinningSize = {
    [LuckyThreeBetOptions.OVER]: [188, 114],
    [LuckyThreeBetOptions.UNDER]: [188, 114],
    [LuckyThreeBetOptions.BLUE2]: [94, 114],
    [LuckyThreeBetOptions.BLUE3]: [94, 114],
    [LuckyThreeBetOptions.RED2]: [94, 114],
    [LuckyThreeBetOptions.RED3]: [94, 114],
};

const LuckyThreeWinningAnimation: React.FC<Props> = ({ choice, resourceName, roundState, settlementResult, showResultInfo }) => {
    const winningHighLightResult = isHighLightWinningResult;
    const [width, height] = ChoiceWinningSize[choice];
    const { data } = useMemoriedImage(`/static/images/lucky-three/highlight-winning-${resourceName}.png`);

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
                    steps={15}
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

export default LuckyThreeWinningAnimation;
