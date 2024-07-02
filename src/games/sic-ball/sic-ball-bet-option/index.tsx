import { SicBallBetOptions, SicBallSideBetOdds } from "../sic-ball-constants";
import Style from "../sic-ball.module.scss";
import { sicBallChoicesMapper } from "../types";
import { SicBallMainOption, SicBallSubOptions, SideBetOdds } from "./sic-ball-bet-options-components";

const SicBallBetOptionsComponent = () => {
    return (
        <>
            <div className="flex justify-between">
                {
                    [SicBallBetOptions.BIG, SicBallBetOptions.SMALL].map((mainOption, index) => {
                        return (
                            <div key={index} className={Style["bet-option-row"]}>
                                <SicBallMainOption choice={mainOption} />
                            </div>)
                    })
                }
            </div>

            <div className={Style["sub-betting-container"]}>
                <div className={Style["side-bet-odds"]}>
                    {
                        [SicBallSideBetOdds.SINGLE, SicBallSideBetOdds.DOUBLE, SicBallSideBetOdds.TRIPLE].map((betOdd, index) => {
                            return <SideBetOdds key={index} sideBetOdds={betOdd} />
                        })
                    }
                </div>

                <div className={Style["sub-betting"]}>
                    {
                        Object.keys(sicBallChoicesMapper).map((subOption, index) => {
                            return <SicBallSubOptions key={index} choice={subOption} />
                        })
                    }
                </div>
            </div>
        </>
    );
};

export default SicBallBetOptionsComponent;
