import React from "react";
import { TFunction } from "next-i18next";
import { BetLogs } from "./bet-history";
import { Odd } from "../fish-prawn-crab";
import { OddNames, ResultBet } from "../index";
import { ChoiceIconHistory } from "../choice-icon";
import Styles from "./bet-history.module.scss";
import { numberWithCommas } from "../../../helpers/number-helper";
import BetHistoryContainer, { FormatNumber } from "../../../components/dashboard/history/bet-history";

const renderResult = (bet: BetLogs) => {
    if (bet.result) {
        const itemValues = Object.values(bet.result);
        return (
            <div className={Styles["w-result"]}>
                {itemValues.map((value: number, index) => {
                    return <ChoiceIconHistory key={index} type={value}></ChoiceIconHistory>;
                })}
            </div>
        );
    }
    return <></>;
};

const renderOdd = (choice: string, countsAppearDice: object, odds: Odd, fractionalOddsFormat = false) => {
    let classCount = `${odds[OddNames.single]}`;
    Object.keys(countsAppearDice).forEach((number) => {
        if (+ResultBet[choice] === +number) {
            if (+countsAppearDice[number] === 2) {
                classCount = `${odds[OddNames.double]}`;
                return;
            }

            if (+countsAppearDice[number] === 3) {
                classCount = `${odds[OddNames.triple]}`;
                return;
            }
        }
    });

    return fractionalOddsFormat ? numberWithCommas(+classCount - 1) : classCount;
};

const renderBet = (bet: BetLogs, t: TFunction, mainOdds: Odd, gameName: string, fractionalOddsFormat = false) => {
    if (bet.settlementResult && bet.result) {
        const keysChoices = bet.settlementResult ? Object.keys(bet.settlementResult) : [];
        const odds = bet.odds ? bet.odds : mainOdds;
        const countsAppearDice = {};
        Object.values(bet.result).forEach((value) => {
            countsAppearDice[+value] = (countsAppearDice[+value] || 0) + 1;
        });
        return (
            <div className={Styles["list-choice"]}>
                {keysChoices.map((choice, index) => {
                    const classHighLight = bet.settlementResult[choice] ? "font-weight-medium" : "";
                    if (bet[choice] > 0) {
                        return (
                            <div key={index} className={classHighLight}>
                                {t(`${gameName}:${choice}`)}@
                                <FormatNumber>{renderOdd(choice, countsAppearDice, odds, fractionalOddsFormat)}</FormatNumber>
                            </div>
                        );
                    }
                    return "";
                })}
            </div>
        );
    }

    return <></>;
};

const FishPrawnCrabBetHistory: React.FunctionComponent<{ gameId: number; fractionalOddsFormat: boolean | undefined }> = ({
    gameId,
    fractionalOddsFormat,
}) => {
    return (
        <BetHistoryContainer
            gameId={gameId}
            isRefund={false}
            renderResult={(bet: BetLogs) => renderResult(bet)}
            renderBet={(bet: BetLogs, t: TFunction, mainOdds: Odd, gameName: string) =>
                renderBet(bet, t, mainOdds, gameName, fractionalOddsFormat)
            }
        ></BetHistoryContainer>
    );
};

export default FishPrawnCrabBetHistory;
