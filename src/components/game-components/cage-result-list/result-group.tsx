import { useMemo } from "react";
import { v4 as uuidv4 } from "uuid";

import { getBallColor } from "../../../_shared/helpers";
import BallRotation from "./ball-rotation";

const ResultGroup: React.FC<any> = ({ listResult, playResultAnimation, initialBallDelayTime, fps, incrementTotalPoint }) => {
    return useMemo(() => {
        if (!listResult) {
            return <></>;
        }

        return listResult.map((result, i) => {
            const ballRotationDelayTime = 80;
            const defaultBallDelayTime = 350;
            const ballPos = i + 1;
            const delayTime = playResultAnimation ? ballPos * (initialBallDelayTime ?? defaultBallDelayTime) + ballRotationDelayTime : 0;
            const color = getBallColor(result);

            return (
                <BallRotation
                    key={uuidv4()}
                    ballPos={ballPos}
                    isShowResultAnim={playResultAnimation}
                    fps={fps}
                    color={color}
                    number={result}
                    delayTime={delayTime}
                    incrementTotalPoint={incrementTotalPoint}
                />
            );
        });
    }, [listResult]);
};

export default ResultGroup;
