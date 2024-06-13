import { FC } from "react";
import { useGameContext } from "../../../_shared/react-contexts";
import { useCommonTranslate, useTranslator } from "../../../_shared/react-hooks";
import Styles from "./history.module.scss";
import SmallBall from "../../../components/game-components/small-ball";
import { DrawInfo, PFResult } from "../../../components/game-base/type";
import { SicBallBetOptions, SicBallSideBetOdds } from "../sic-ball-constants";
import { Odd, sicBallChoicesMapper } from "../types";

export interface RoundInfoSeBall extends DrawInfo {
    drawId: number;
    result: {
        balls: Array<number>;
    };
    odds: {
        big: number;
        small: number;
        single: number;
        double: number;
        triple: number;
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


export const mainChoices = [SicBallBetOptions.BIG, SicBallBetOptions.SMALL];

export enum BetResult {
    specific1,
    specific2,
    specific3,
    specific4,
    specific5,
    specific6,
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


const calculateSubChoiceOdd = (choice: string, odds: Odd, balls: any) => {
    const subChoiceCounterArray = {};

    Object.values(balls).forEach((value) => {
        subChoiceCounterArray[+value] = (subChoiceCounterArray[+value] || 0) + 1;
    });

    Object.keys(subChoiceCounterArray).forEach((subChoice) => {
        if (+BetResult[choice] === +subChoice) {
            if (+subChoiceCounterArray[subChoice] === 2) {
                return odds[SicBallSideBetOdds.DOUBLE];
            }

            if (+subChoiceCounterArray[subChoice] === 3) {
                return odds[SicBallSideBetOdds.TRIPLE];
            }
        }
    });

    return odds[SicBallSideBetOdds.SINGLE];
};

export const produceDataBetDetailRow = (item: any, drawInfo: RoundInfoSeBall) => {
    const isMainChoice = mainChoices.includes(item.choice);
    const isWin = drawInfo.settlementResult?.[item.choice];

    const odd = isMainChoice ?
        drawInfo.odds[item.choice] :
        calculateSubChoiceOdd(item.choice, drawInfo.odds, drawInfo.result.balls);

    console.log({ item })
    console.log({ isMainChoice })
    return {
        rawTime: item.time,
        amount: item.amount,
        choice: isMainChoice ? item.choice : sicBallChoicesMapper[item.choice],
        odds: isWin ? odd : "-",
        win: isWin ? item.amount * odd : 0,
        hightlight: isWin,
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
                <div className={Styles["bet-detail-ball"]}><SmallBall number={parseInt(choice)} /></div>
            )}
        </span>
    );
};
