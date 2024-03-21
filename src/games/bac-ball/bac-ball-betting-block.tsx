import { FC } from "react";
import { BettingBlock } from "../../components/game-components/bet-option/betting-block";
import WinningResultEffect from "../../components/game-components/winning-result-effect";
import { BacBallBetOptionsComponent } from "./bac-ball-options";
import Style from "./bac-ball.module.scss";

export const BacBallBettingBlock: FC = () => {
    return (
        <BettingBlock>
            <div className={`${Style["betting-zone"]}`}>
                <BacBallBetOptionsComponent />
                <WinningResultEffect />
            </div>
        </BettingBlock>
    );
};
