import Image from "next/image";
import React, { memo, useCallback, useEffect, useState } from "react";

import { buildVersion } from "../../../_shared/constants";
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
    highlightBallSize: { width: number; height: number };
    initialBallDelayTime?: number;
    ballFPS?: number;
    highlightBallSteps?: number;
    showTotalCallback?: Function;
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
    highlightBallSize,
    highlightBallSteps,
    showTotalCallback,
}) => {
    const [showBalls, setShowBalls] = useState(false);
    const [totalPoint, setTotalPoint] = useState(0);
    const [needStartDrawAnim, setNeedStartDrawAnim] = useState(false);
    const [customCageClass, setCustomCageClass] = useState("");

    const showBallDelayTime = 1000;

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

    useEffect(() => {
        if (roundState === RoundState.InRound) {
            setShowBalls(false);
            setNeedStartDrawAnim(false);
        }

        if (roundState === RoundState.BeforePlaceBet) {
            setTotalPoint(0);
            setCustomCageClass("");
            showTotalCallback && showTotalCallback(false);
            setNeedStartDrawAnim(true);
        }
    }, [roundState]);

    const incrementTotalPoint = useCallback((point: number) => {
        showTotalCallback && showTotalCallback(!!point);
        setTotalPoint((currentTotalPoint) => currentTotalPoint + point);
        setCustomCageClass(`${playResultAnimation ? Styles["hide-ball"] : Styles["hide-ball-no-anim"]}`);
    }, []);

    return (
        <div
            className={`${CageStyles["cage-area"]} ${isSmall ? CageStyles["small"] : ""} ${CageStyles[position]} ${
                Styles[`type-${listResult?.length}`]
            }`}
        >
            <div className={`${Styles["ball"]} ${customCageClass}`}>
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
                        src={`/static/images/cage/cage-border-purple-blur.webp?v=${buildVersion}`}
                        alt="img-blur"
                    />
                )}
            </div>
            {showBalls && totalPoint > 0 && <div className={`${Styles["total-point"]} fade-in`}>{totalPoint}</div>}

            <div id="show-ball-anim" className={`${Styles["show-ball-anim"]} ${needStartDrawAnim ? "fade-out" : ""}`}>
                {showBalls && (
                    <ResultGroup
                        listResult={listResult}
                        playResultAnimation={playResultAnimation}
                        initialBallDelayTime={initialBallDelayTime}
                        incrementTotalPoint={incrementTotalPoint}
                    />
                )}

                {showBalls && playResultAnimation && (
                    <Spritesheet
                        className={`${Styles["ball-result"]}`}
                        image={`/static/images/${gameFolder}/result-ball/ball-highlight.webp?v=${buildVersion}`}
                        widthFrame={highlightBallSize.width}
                        isResponsive
                        heightFrame={highlightBallSize.height}
                        steps={highlightBallSteps ?? 6}
                        autoplay
                        fps={ballFPS ?? 32}
                    />
                )}
            </div>
        </div>
    );
};

export default memo(CageResultList);
