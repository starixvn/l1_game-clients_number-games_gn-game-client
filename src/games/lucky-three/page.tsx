import Link from "next/link";
import RoundResult from "../../components/shared/round-result";
import Ball from "../../components/shared/ball";
import PercentageCircle from "../../components/shared/percentage-circle";
import Style from "./lucky-three.module.scss";
import { BetOptionData, RoundResultData } from "../../common/constants";
import Dot from "../../components/shared/dot";

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
        betChoice: "red3",
        odds: 1.97,
    },
    {
        betChoice: "red2blue1",
        odds: 1.97,
    },
    {
        betChoice: "red1blue2",
        odds: 1.97,
    },
    {
        betChoice: "blue3",
        odds: 1.97,
    },
];

export default function LuckyThree() {
    return (
        <>
            <div className="round-id">#2345</div>
            <div className="countdown-timer">00:30</div>
            <div className={Style["result-container"]}>
                <div className="flex justify-center">
                    <img src="/images/next-ball/lottery.png" alt="arrow-bg" />
                </div>

                <div className="flex flex-col">
                    <div className={Style["sub-round"]}>
                        <div className={`${Style["sub-round-title"]}`}>1st</div>
                        <div className="mx-auto flex gap-2 justify-center">
                            <Ball number={12} color="blue" />
                            <Ball number={32} color="blue" />
                            <Ball number={21} color="red" />
                        </div>
                        <div className={Style["total-number"]}>38</div>
                    </div>

                    <div className={Style["sub-round"]}>
                        <div className={`${Style["sub-round-title"]}`}>2nd</div>
                        <div className="mx-auto flex gap-2 justify-center">
                            <Ball number={64} color="blue" />
                            <Ball number={59} color="blue" />
                            <Ball number={74} color="red" />
                        </div>
                        <div className={Style["total-number"]}>197</div>
                    </div>

                    <div className={Style["sub-round"]}>
                        <div className={`${Style["sub-round-title"]} ${Style["is-drawing"]}`}>3rd</div>
                        <div className="mx-auto flex gap-2 justify-center">
                            <Ball isLoading />
                            <Ball isLoading />
                            <Ball isLoading />
                        </div>
                        <div className={Style["total-number"]}></div>
                    </div>
                </div>
            </div>

            <div className={`${Style["betting-zone"]}`}>
                <div className={`${Style["odd"]} text-white relative`}>
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
                    <div className="bet-name text-center">OVER</div>
                    <div className="bet-odds text-center">1.97</div>
                    <div className="own-bet">
                        <span className="bet-value">10</span>
                    </div>
                </div>
                <div className={`${Style["even"]} text-white relative`}>
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
                    <div className="bet-name text-center">UNDER</div>
                    <div className="bet-odds text-center">1.97</div>
                    <div className="own-bet">
                        <span className="bet-value">100</span>
                    </div>
                </div>
            </div>

            <div className={Style["betting-zone"]}>
                {betChoiceData.map((item) => (
                    <div className={`${Style[item.betChoice]} ${Style["bet-choice"]}`} key={item.betChoice}>
                        <Dot choice={item.betChoice} />
                        <div className="bet-odds">{item.odds}</div>
                        <div className="own-bet">
                            <span className="bet-value">10</span>
                        </div>
                    </div>
                ))}
            </div>
            <RoundResult roundId={134} resultData={resultData} />
        </>
    );
}
