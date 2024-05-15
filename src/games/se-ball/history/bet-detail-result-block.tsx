import { FC } from "react";
import { useGameContext } from "../../../_shared/react-contexts";
import { useCommonTranslate, useSNTranslate, useTranslator } from "../../../_shared/react-hooks";
import Styles from "./history.module.scss";
import SmallBall from "../../../components/game-components/small-ball";
import { DrawInfo, PFResult } from "../../../components/game-base/type";

export interface DrawInfoSeBall extends DrawInfo {
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

export const BetDetailResultBlock: FC<{ drawInfo: DrawInfoSeBall }> = ({ drawInfo }) => {
    const { t: translateCommon } = useCommonTranslate();
    const { drawId, result } = drawInfo;
    let totalPoint = 0;

    return (
        <div className={Styles["draw-info"]}>
            <div className={`${Styles["info-item"]} font-weight-500`}>
                {translateCommon("round").capitalizeFirstLetter()}: <span>{drawId}</span>
            </div>
            <div className={Styles["info-item"]}>
                {
                    result.balls.map((ball, index) => {
                        totalPoint += ball;
                        return <SmallBall key={index} number={ball} />
                    })
                }
                <div className={Styles["bet-detail-total"]}> - {totalPoint}</div>
            </div>
        </div>
    );
};

const calculateWin = (isWin: boolean, amount: number, odds: number) => {
    return isWin ? amount * odds : 0;
};

export const produceDataBetDetailRow = (item: any, drawInfo: DrawInfoSeBall) => {
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
    return <span className="font-text">{translateSeBall(`glossary_${choice}`)}</span>;
};
