"use client";

import RoundResult from "../../components/shared/round-result";
import Style from "./happy-wheel.module.scss";
import { BetOptionData, RoundResultData } from "../../common/constants";

const resultData: RoundResultData[] = [
    {
        betChoiceShort: "O",
        color: "red",
        count: 25,
    },
    {
        betChoiceShort: "E",
        color: "blue",
        count: 23,
    },
];

const betChoiceData: BetOptionData[] = [
    {
        betChoice: "one",
        odds: 1.2,
    },
    {
        betChoice: "three",
        odds: 1.2,
    },
    {
        betChoice: "six",
        odds: 1.2,
    },
    {
        betChoice: "twelve",
        odds: 1.2,
    },
    {
        betChoice: "twenty-five",
        odds: 1.26,
    },
    {
        betChoice: "lucky",
        odds: 1.51,
    },
    {
        betChoice: "special",
        odds: 1.51,
    },
];

export default function HappyWheel() {
    return (
        <>
            <div className="round-id">#2345</div>
            <div className="countdown-timer">00:30</div>
            <div className={`relative flex pt-4 justify-around ${Style["result-container"]}`}>
                <img className={Style.wheel} src="/images/happy-wheel/wheel.png" alt="wheel" />
                <img className={Style["border-active"]} src="/images/happy-wheel/active-border.svg" alt="wheel" width={61} />
            </div>

            <div className={Style["sub-betting-items"]}>
                {betChoiceData.map((item) => (
                    <div className={`${Style[item.betChoice]} ${Style["sub-bet-choice"]}`} key={item.betChoice}>
                        <img src={`/images/happy-wheel/option-${item.betChoice}.svg`} alt="bet-choice" />
                        <div className={Style.odds}>{item.odds}</div>
                        <div className={`own-bet ${Style["own-bet"]}`}>
                            <span className="bet-value">100</span>
                        </div>
                    </div>
                ))}
            </div>
            <RoundResult roundId={134} resultData={resultData} />
        </>
    );
}
