import { FC, useEffect, useState } from "react";

import { BallColor, RoundState } from "../../components/game-base/type";
import BallRotation from "../../components/game-components/cage-result-list/ball-rotation";
import Style from "./sic-ball.module.scss";

const SicBallResultTotalPoint: FC<{ roundState: RoundState; playResultAnimation: boolean; results: any }> = ({
    roundState,
    playResultAnimation,
    results,
}) => {
    const [showTotal, setShowTotal] = useState(false);
    console.log("results.balls", results);

    const totalPoint = results ? results.reduce((prevTotal, current) => prevTotal + current) : 0;

    useEffect(() => {
        const timeout = setTimeout(
            () => {
                setShowTotal(true);
            },
            playResultAnimation ? 2500 : 0
        );

        return () => {
            clearTimeout(timeout);
        };
    }, []);

    return (
        <div className={Style["result"]}>
            <div className={Style["balls-container"]}>
                {results?.map((result, index) => {
                    return (
                        <BallRotation
                            key={index}
                            ballPos={1}
                            number={result}
                            playResultAnimation={playResultAnimation}
                            delayTime={index * 800}
                            color={BallColor.BLUE}
                            incrementTotalPoint={() => {}}
                            customClassName={Style["ball-rotation"]}
                        />
                    );
                })}
            </div>

            {showTotal && (
                <div>
                    <div className={`fade-in ${Style["total-point-bg-blur"]}`}></div>
                    <span className={Style["total-point"]}>{totalPoint} - small</span>
                </div>
            )}
        </div>
    );
};

export default SicBallResultTotalPoint;
