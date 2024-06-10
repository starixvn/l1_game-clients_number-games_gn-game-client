import { FC } from "react";

import { useGameContext } from "../../../_shared/react-contexts";
import { useSNTranslate, useTranslator } from "../../../_shared/react-hooks";
import { DrawInfo, PFResult } from "../../../components/game-base/type";
import SmallBall from "../../../components/game-components/small-ball";
import { LuckyThreeBetOptions } from "../lucky-three-constants";
import Styles from "./history.module.scss";
import { calculateWinAmount } from "../../../_shared/helpers/number-helper";

export interface RoundInfoSeBall extends DrawInfo {
    drawId: number;
    result: {
        balls: Array<number>;
    };
    odds: {
        odd: number;
        even: number;
        red3: number;
        red4: number;
        blue3: number;
        blue4: number;
        red2: number;
    };
    settlementResult: {
        odd: boolean;
        even: boolean;
        red3: boolean;
        red4: boolean;
        blue3: boolean;
        blue4: boolean;
        red2: boolean;
    };
    pfResult: PFResult;
}

export const BetDetailResultBlock: FC<{ roundInfo: RoundInfoSeBall }> = ({ roundInfo: drawInfo }) => {
    const { t: translateSNGames } = useSNTranslate();
    const { drawId, result } = drawInfo;
    let totalPoint = 0;

    return (
        <div className={Styles["draw-info"]}>
            <div className={`${Styles["info-item"]} font-weight-500`}>
                {translateSNGames("glossary_draw_id").capitalizeFirstLetter()}: <span>{drawId}</span>
            </div>
            <div className={Styles["info-item"]}>
                {result.balls.map((ball, index) => {
                    totalPoint += ball;
                    return <SmallBall key={index} number={ball} />;
                })}
                <div className={Styles["bet-detail-total"]}> - {totalPoint}</div>
            </div>
        </div>
    );
};

export const produceDataBetDetailRow = (item: any, drawInfo: RoundInfoSeBall) => {
    const win = calculateWinAmount(drawInfo.settlementResult?.[item.choice], item.amount, drawInfo.odds[item.choice]);

    return {
        rawTime: item.time,
        amount: item.amount,
        choice: item.choice,
        odds: drawInfo.odds[item.choice],
        win: win,
        hightlight: drawInfo.settlementResult?.[item.choice],
    };
};

export const BetChoice: FC<{ choice: string }> = ({ choice }) => {
    const { tolgeeNamespace } = useGameContext();
    const { t: translateSeBall } = useTranslator([tolgeeNamespace]);

    return (
        <span className="font-text">
            {choice === LuckyThreeBetOptions.OVER || choice === LuckyThreeBetOptions.UNDER ? (
                translateSeBall(`glossary_${choice}`)
            ) : (
                <img src={`/static/images/lucky-three/bet-detail-${choice}.svg`} alt="" />
            )}
        </span>
    );
};
