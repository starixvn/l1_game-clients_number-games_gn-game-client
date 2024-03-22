import { FC } from "react";
import { BettingBlock } from "../../components/game-components/bet-option/betting-block";
import WinningResultEffect from "../../components/game-components/winning-result-effect";
import { NextBallBetOptionsComponent } from "./next-ball-options";
import Style from "./next-ball.module.scss";

export const NextBallBettingBlock: FC = () => {
    return (
        <BettingBlock>
            <div className={`${Style["betting-zone"]}`}>
                <NextBallBetOptionsComponent />
                <WinningResultEffect />
            </div>
        </BettingBlock>
    );
};
