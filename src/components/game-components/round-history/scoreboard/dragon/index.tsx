import React, { useMemo } from "react";

import { ScoreboardItemNext } from "../../dot-next";
import { Props } from "./types";
import { v4 as uuidV4 } from "uuid";
import { useGameContext } from "../../../../../_shared/contexts/game-context/game-context";
import { GameBaseProps } from "../../../../game-base/type";
import { RoundDotGrid } from "../../../round-history/dot";
import { GetNameFromChoice, GetChoiceValueFromTranslate } from "./dragon.helper";
import Styles from "../round-history.module.scss";

const rowTotal = 7;
const conditionChangeDotDefault = ({ settlementResult, choices }) => {
    let value = 0;
    choices.forEach((name, index) => {
        if (settlementResult[name]) {
            value = index;
        }
    });

    return value;
};

const getDotNextDetails = (col: number, row: number) => {
    return <ScoreboardItemNext key={uuidV4()} col={col} row={row}></ScoreboardItemNext>;
};

const getScoreboardDotDetails: React.FC<{
    col: number;
    row: number;
    roundId: number;
    translateDotTextMapping: object;
    gameSetting: GameBaseProps;
    settlementResult: any;
    choices: [];
}> = ({ col, row, roundId, translateDotTextMapping, gameSetting, settlementResult, choices }) => {
    const choiceName = GetNameFromChoice({ settlementResult, choices });
    return (
        <RoundDotGrid
            key={`${roundId}_${gameSetting.id}_${choiceName}`}
            choice={choiceName}
            value={GetChoiceValueFromTranslate({ settlementResult, choices, translateDotTextMapping })}
            col={col}
            row={row}
            gameName={gameSetting.gameName.toLowerCase()}
        ></RoundDotGrid>
    );
};

const drawDragonTailHistory = <R, S>(
    roundHistory: any[],
    isShowBlink: boolean,
    getDotDetails: Function,
    conditionChangeDot: Function,
    translateDotTextMapping?: object,
    gameSetting?: GameBaseProps,
    listChoiceChangeDotDetails?: string[]
) => {
    let col = 1,
        row = 1;
    let nextCol = 1;
    let previousResult = undefined;
    const rowMax = {};
    let colMax = 0;
    const result = roundHistory.reduceRight((resultRound, round, index) => {
        const value = conditionChangeDot({ settlementResult: round?.settlementResult, choices: listChoiceChangeDotDetails });
        if (value === previousResult) {
            const max = rowMax.hasOwnProperty(col) ? rowMax[col] : rowTotal;

            if (row < max - 1) {
                row++;
            } else if (row === 0 && max === 1) {
                col = nextCol;
                nextCol++;
            } else {
                col++;
                rowMax[col] = row;
            }
        } else {
            row = 1;
            col = nextCol;
            nextCol++;
        }

        if (col > colMax) {
            colMax = col;
        }
        previousResult = value;
        resultRound[index] = getDotDetails({
            result: round?.result,
            col: col,
            row: row,
            roundId: round?.roundId,
            translateDotTextMapping: translateDotTextMapping,
            gameSetting: gameSetting,
            settlementResult: round?.settlementResult,
            choices: listChoiceChangeDotDetails,
        });

        return resultRound;
    }, []);

    isShowBlink && result.push(addDotNext(rowMax, row, col, nextCol, getDotNextDetails));
    return result;
};

const addDotNext = (rowMax: {}, row: number, col: number, nextCol: number, getDotNextDetails: Function) => {
    const max = rowMax.hasOwnProperty(col) ? rowMax[col] : rowTotal;
    if (row < max - 1) {
        row++;
    } else {
        row = 0;
        col = nextCol;
    }

    if (row === 1 && col === 0) {
        col = 1;
        row = 0;
    }

    return getDotNextDetails(col, row);
};

const ScoreboardDragon = <R, S>(props: Props<R, S>) => {
    const { roundHistory, dotDetails } = props;
    const translateDotTextMapping = dotDetails?.translateDotTextMapping ?? {};
    const getDotDetails = dotDetails?.getDotDetails ?? getScoreboardDotDetails;
    const conditionChangeDotDetails = dotDetails?.conditionChangeDot ?? conditionChangeDotDefault;

    const { isShowBlink, gameSetting } = useGameContext();
    const isShowDotBlink = props?.isShowBlink ?? isShowBlink;
    return useMemo(() => {
        return (
            <div className={Styles["score-board-dragon-container"]}>
                {drawDragonTailHistory(
                    roundHistory,
                    isShowDotBlink,
                    getDotDetails,
                    conditionChangeDotDetails,
                    translateDotTextMapping,
                    gameSetting,
                    dotDetails?.choice
                )}
            </div>
        );
    }, [roundHistory, props?.isShowBlink ?? isShowBlink, dotDetails?.choice]);
};

export default ScoreboardDragon;
