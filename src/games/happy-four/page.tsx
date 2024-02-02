import Ball from "../../components/game-components/ball";
import PercentageCircle from "../../components/game-components/percentage-circle";
import Style from "./happy-four.module.scss";
import Dot from "../../components/game-components/dot";
import RoundResult from "../../components/game-components/round-result";
import { BetOptionData, RoundResultData } from "../../_shared/constants";

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

const subChoiceData: BetOptionData[] = [
    {
        betChoice: "red3blue1",
        odds: 1.97,
    },
    {
        betChoice: "red4",
        odds: 1.97,
    },
    {
        betChoice: "red2blue2",
        odds: 1.97,
    },
    {
        betChoice: "red1blue3",
        odds: 1.97,
    },
    {
        betChoice: "blue4",
        odds: 1.97,
    },
];

export default function HappyFour() {
    return (
        <>
            <div className="round-id">#2345</div>
            <div className="countdown-timer">00:30</div>
            <div className="relative flex pt-4 justify-around">
                <div className="flex justify-center">
                    <img src="/static/images/next-ball/lottery.png" alt="arrow-bg" />
                </div>

                <div className="flex flex-col items-center justify-center">
                    <div className="mx-auto pt-3 flex gap-2 justify-center">
                        <Ball number={38} color="red" />
                        <Ball isLoading />
                        <Ball isEmpty />
                        <Ball isEmpty />
                    </div>
                    <div className={Style["total-number"]}>38</div>
                </div>
            </div>

            <div className={`${Style["betting-zone"]} mt-5`}>
                <div className={`${Style["odd"]} text-white p-2 relative`}>
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
                    <div className={`bet-name text-center mt-[-8px] ${Style["bet-name"]}`}>ODD</div>
                    <div className="bet-odds text-center">1.97</div>
                    <div className="own-bet">
                        <span className="bet-value">100</span>
                    </div>
                </div>
                <div className={`${Style["even"]} text-white p-2 relative`}>
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
                    <div className={`bet-name text-center mt-[-8px] ${Style["bet-name"]}`}>EVEN</div>
                    <div className="bet-odds text-center">1.97</div>
                    <div className="own-bet">
                        <span className="bet-value">100</span>
                    </div>
                </div>
            </div>

            <div className={Style["sub-betting-zone"]}>
                {subChoiceData.map((item) => (
                    <div className={`${Style[item.betChoice]} ${Style["bet-choice"]}`} key={item.betChoice}>
                        <Dot choice={item.betChoice} />
                        <div className="bet-odds">{item.odds}</div>
                        <div className="own-bet">
                            <span className="bet-value">100</span>
                        </div>
                    </div>
                ))}
            </div>
            <RoundResult roundId={134} resultData={resultData} />
        </>
    );
}
