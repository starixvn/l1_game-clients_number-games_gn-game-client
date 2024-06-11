import { FC } from "react";
import { useGameContext } from "../../../_shared/react-contexts";
import { useCommonTranslate, useTranslator } from "../../../_shared/react-hooks";
import Styles from "./history.module.scss";
import SmallBall from "../../../components/game-components/small-ball";
import { DrawInfo, PFResult } from "../../../components/game-base/type";
import { SicBallBetOptions } from "../sic-ball-constants";

export interface RoundInfoSeBall extends DrawInfo {
    drawId: number;
    result: {
        balls: Array<number>;
    };
    odds: {
        big: number;
        small: number;
        specific1: number;
        specific2: number;
        specific3: number;
        specific4: number;
        specific5: number;
        specific6: number;
    };
    settlementResult: {
        big: boolean;
        small: boolean;
        specific1: boolean;
        specific2: boolean;
        specific3: boolean;
        specific4: boolean;
        specific5: boolean;
        specific6: boolean;
    };
    pfResult: PFResult;
}

export const BetDetailResultBlock: FC<{ roundInfo: RoundInfoSeBall }> = ({ roundInfo: drawInfo }) => {
    const { t: translateCommon } = useCommonTranslate();
    const { drawId, result } = drawInfo;
    let totalPoint = 0;

    return (
        <div className={Styles["draw-info"]}>
            <div className={`${Styles["info-item"]} font-weight-500`}>
                {translateCommon("round").capitalizeFirstLetter()}: <span>{drawId}</span>
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

const calculateWin = (isWin: boolean, amount: number, odds: number) => {
    return isWin ? amount * odds : 0;
};

export const produceDataBetDetailRow = (item: any, drawInfo: RoundInfoSeBall) => {
    const win = calculateWin(drawInfo.settlementResult?.[item.choice], item.amount, drawInfo.odds[item.choice]);

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
            {choice === SicBallBetOptions.BIG || choice === SicBallBetOptions.SMALL ? (
                translateSeBall(`glossary_${choice}`)
            ) : (
                <img src={`/static/images/se-ball/bet-detail-${choice}.svg`} alt="" />
            )}
        </span>
    );
};
