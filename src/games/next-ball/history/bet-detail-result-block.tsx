import { FC, useMemo } from "react";
import { DrawInfo, PFResult } from "../../../components/game-base/type";
import { useSNTranslate, useTranslator } from "../../../_shared/react-hooks";
import { useGameContext } from "../../../_shared/react-contexts";
import { useBallColor } from "../../../_shared/helpers";
import Styles from "./history.module.scss";

export interface DrawInfoNextBall extends DrawInfo {
    drawId: number;
    result: {
        ball: number;
    };
    odds: {
        over: number;
        under: number;
        odd: number;
        even: number;
    };
    settlementResult: {
        over: boolean;
        under: boolean;
        odd: boolean;
        even: boolean;
    };
    pfResult: PFResult;
}

export const BetDetailResultBlock: FC<{ drawInfo: DrawInfoNextBall }> = ({ drawInfo }) => {
    const { t: translateSNGames } = useSNTranslate();
    const { tolgeeNamespace } = useGameContext();
    const { t: translateNextBall } = useTranslator([tolgeeNamespace]);
    const ballColor = useBallColor;
    const { drawId, result, pfResult } = drawInfo;

    const order = useMemo(() => {
        const { roundResult } = pfResult;
        return roundResult.length;
    }, [pfResult]);

    return (
        <div className={Styles["draw-info"]}>
            <div className={`${Styles["info-item"]} font-weight-500`}>
                {translateSNGames("glossary_draw_id").capitalizeFirstLetter()}: <span>{drawId}</span>
            </div>
            <div className={Styles["info-item"]}>
                <span className="font-weight-medium">{translateNextBall(`ball_${order}`).toUpperCase()}</span>
                <span className={`${Styles["ball"]} ${Styles[ballColor({ number: result.ball })]}`}>{result.ball}</span>
            </div>
        </div>
    );
};

const calculateWin = (isWin: boolean, amount: number, odds: number) => {
    return isWin ? amount * odds : 0;
};

export const produceDataBetDetailRow = (item: any, drawInfo: DrawInfoNextBall) => {
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
