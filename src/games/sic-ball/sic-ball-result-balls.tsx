import { FC } from "react";

import { getBallColor } from "../../_shared/helpers";
import { RoundState } from "../../components/game-base/type";
import BallRotation from "../../components/game-components/cage-result-list/ball-rotation";
import Style from "./sic-ball.module.scss";

const SicBallResultBalls: FC<{ roundState: RoundState; playResultAnimation: boolean; results: any }> = ({
    roundState,
    playResultAnimation,
    results,
}) => {
    return (
        <div className={Style["result-balls"]}>
            {results?.map((result, index) => {
                const delayTime = playResultAnimation ? 800 * index : 0;

                return (
                    <BallRotation
                        key={index}
                        ballPos={1}
                        number={result}
                        playResultAnimation={playResultAnimation}
                        delayTime={delayTime}
                        color={getBallColor(result)}
                        incrementTotalPoint={() => {}}
                        customClassName={`${Style["ball-rotation"]} ${playResultAnimation ? Style["has-anim"] : ""}`}
                    />
                );
            })}
        </div>
    );
};

export default SicBallResultBalls;
