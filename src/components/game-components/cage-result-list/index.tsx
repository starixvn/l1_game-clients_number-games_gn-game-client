import Image from "next/image";
import React, { memo, useCallback, useEffect, useMemo, useState } from "react";

import { GameStateContextModel } from "../../../_shared/react-contexts/game-state-context/game-state-context-model";
import { RoundState } from "../../game-base/type";
import BallLoops from "../cage/ball-loop";
import CageStyles from "../cage/cage.module.scss";
import { Spritesheet } from "../sprites-sheet";
import Styles from "./cage-result-list.module.scss";
import ResultGroup from "./result-group";

export type CageResultListProps = {
    color: string;
    isSmall: boolean;
    position: string;
    isPlayStartRoundAnimation?: boolean;
    listResult: number[];
    gameFolder: string;
    listBallAnimSize: number[];
    initialBallDelayTime?: number;
    ballFPS?: number;
} & Partial<GameStateContextModel>;

const CageResultList: React.FC<CageResultListProps> = ({
    position,
    isSmall,
    color,
    playResultAnimation,
    ballFPS,
    isPlayStartRoundAnimation,
    listResult,
    roundState,
    initialBallDelayTime,
    gameFolder,
    listBallAnimSize,
}) => {
    const [showBalls, setShowBalls] = useState(false);
    const [totalPoint, setTotalPoint] = useState(0);

    const showBallDelayTime = 1200;

    useEffect(() => {
        let timeOut: NodeJS.Timeout;

        if (!showBalls && roundState === RoundState.DisplayResult) {
            timeOut = setTimeout(
                () => {
                    setShowBalls(true);
                },
                playResultAnimation ? showBallDelayTime : 0
            );
        }

        return () => {
            clearTimeout(timeOut);
        };
    });

    const incrementTotalPoint = useCallback((point: number, pos: number) => {
        setTotalPoint((currentTotalPoint) => currentTotalPoint + point);
    }, []);

    return (
        <div
            className={`${CageStyles["cage-area"]} ${isSmall ? CageStyles["small"] : ""} ${CageStyles[position]} ${
                Styles[`type-${listResult?.length}`]
            }`}
        >
            <div className={`${Styles["ball"]} ${totalPoint > 0 ? Styles["hide-ball"] : ""}`}>
                <div id="cage-bg" className={CageStyles["cage-bg"]}></div>
                <BallLoops isPlayStartRoundAnimation={isPlayStartRoundAnimation} />
                <div id="cage-cover" className={CageStyles["cage-cover"]}></div>
                <div id="cage-border" className={`${CageStyles["cage-border"]} ${CageStyles[color]}`}>
                    {!playResultAnimation && <div id="cage-lid" className={CageStyles["cage-lid"]} />}
                </div>

                {playResultAnimation && (
                    <Image
                        width={140}
                        height={140}
                        className={`${CageStyles["ball-blur"]} ${Styles["ball-blur"]}`}
                        src={`/static/images/cage/cage-border-purple-blur.webp?v=2`}
                        alt="img-blur"
                    />
                )}
            </div>
            {showBalls && totalPoint > 0 && <div className={`${Styles["total-point"]} `}>{totalPoint}</div>}

            <div id="show-ball-anim" className={Styles["show-ball-anim"]}>
                {showBalls && (
                    <ResultGroup
                        listResult={listResult}
                        playResultAnimation={playResultAnimation}
                        initialBallDelayTime={initialBallDelayTime}
                        fps={ballFPS}
                        incrementTotalPoint={incrementTotalPoint}
                    />
                )}

                {playResultAnimation && (
                    <Spritesheet
                        className={`${Styles["ball-result"]}`}
                        image={`/static/images/${gameFolder}/result-ball/ball-highlight.webp?v=1`}
                        widthFrame={listBallAnimSize[0]}
                        isResponsive
                        heightFrame={listBallAnimSize[1]}
                        steps={6}
                        autoplay
                        fps={ballFPS ?? 40}
                    />
                )}
            </div>
        </div>
    );
};

export default memo(CageResultList);
