"use client";

import RoundResult from "../../components/game-components/round-result";
import PercentageCircle from "../../components/game-components/percentage-circle";
import Style from "./sic-balls.module.scss";
import { BetOptionData, RoundResultData } from "../../_shared/constants";

import Lottie from "lottie-react";

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
        betChoice: "ballOne",
        odds: 1.97,
    },
    {
        betChoice: "ballTwo",
        odds: 1.97,
    },
    {
        betChoice: "ballThree",
        odds: 1.97,
    },
    {
        betChoice: "ballFour",
        odds: 1.97,
    },
    {
        betChoice: "ballFive",
        odds: 1.97,
    },
    {
        betChoice: "ballSix",
        odds: 1.97,
    },
];

export default function SicBalls() {
    return (
        <>
            <div className="round-id">#2345</div>
            <div className="countdown-timer">00:30</div>
            <div className={`relative flex pt-4 justify-around ${Style["result-container"]}`}>
                <div className="relative">
                    <img src="/static/images/sic-balls/bg-light.png" width={120} alt="arrow-bg" />

                    <div className={Style["result"]}>
                        <img src="/static/images/sic-balls/ballOne.png" width={48} alt="arrow-bg" />
                    </div>
                </div>
                <div className="relative">
                    <img src="/static/images/sic-balls/bg-light.png" width={120} alt="arrow-bg" />
                    <div className={Style["result"]}>
                        <img src="/static/images/sic-balls/ballOne.png" width={48} alt="arrow-bg" />
                    </div>
                </div>
                <div className="relative">
                    <img src="/static/images/sic-balls/bg-light.png" width={120} alt="arrow-bg" />
                    <div className={Style["result"]}>
                        <img src="/static/images/sic-balls/balls.svg" alt="arrow-bg" />
                    </div>
                </div>
            </div>

            <div className={`${Style["betting-zone"]} mt-3 mb-2`}>
                <div className={`${Style["big"]} text-white p-2 relative`}>
                    <div className={`flex justify-between`}>
                        <div className={Style.percent}>
                            <PercentageCircle percentage={55} />
                        </div>
                        <div className={Style.stake}>
                            <div className={`flex items-center ${Style["total-stakes"]} gap-1`}>
                                <span className="icon-coin"></span>
                                <span>24368</span>
                            </div>
                            <div className="flex items-center players gap-1 justify-end">
                                <span className="icon-user"></span>
                                <span>547</span>
                            </div>
                        </div>
                    </div>
                    <div className={`${Style["bet-info"]} text-center`}>[137-267]</div>
                    <div className="bet-name text-center">BIG</div>
                    <div className="bet-odds text-center">1.97</div>
                    <div className="own-bet">
                        <span className="bet-value">10</span>
                    </div>
                </div>
                <div className={`${Style["small"]} text-white p-2 relative`}>
                    <div className={`flex justify-between`}>
                        <div className={Style.stake}>
                            <div className={`flex items-center ${Style["total-stakes"]} gap-1`}>
                                <span className="icon-coin"></span>
                                <span>24368</span>
                            </div>
                            <div className="flex items-center players gap-1">
                                <span className="icon-user"></span>
                                <span>547</span>
                            </div>
                        </div>
                        <div className={Style.percent}>
                            <PercentageCircle percentage={45} />
                        </div>
                    </div>
                    <div className={`${Style["bet-info"]} text-center`}>[6-136]</div>
                    <div className="bet-name text-center">SMALL</div>
                    <div className="bet-odds text-center">1.97</div>
                    <div className="own-bet">
                        <span className="bet-value">100</span>
                    </div>
                </div>
            </div>

            <div className={Style["sub-betting-zone"]}>
                <div className="flex justify-center w-full gap-5">
                    <div className="flex gap-1">
                        <div className={Style["odds-title"]}>Single</div>
                        <div className={Style["odds-value"]}>1:2</div>
                    </div>
                    <div className="flex gap-1">
                        <div className={Style["odds-title"]}>Double</div>
                        <div className={Style["odds-value"]}>1:4</div>
                    </div>
                    <div className="flex gap-1">
                        <div className={Style["odds-title"]}>Triple</div>
                        <div className={Style["odds-value"]}>1:6</div>
                    </div>
                </div>
                <div className={Style["sub-betting-items"]}>
                    {betChoiceData.map((item) => (
                        <div className={`${Style[item.betChoice]} ${Style["sub-bet-choice"]}`} key={item.betChoice}>
                            <img src={`/static/images/sic-balls/${item.betChoice}.png`} alt="ball" width={32} />
                            <div className={Style.odds}>{item.odds}</div>
                            <div className={`own-bet ${Style["own-bet"]}`}>
                                <span className="bet-value">100</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            {/* <RoundResult results={resultData} /> */}
        </>
    );
}
