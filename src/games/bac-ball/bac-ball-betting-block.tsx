import dynamic from "next/dynamic";
import { FC } from "react";

import BettingBlock from "../../components/game-components/bet-option/betting-block";
import BacBallBetOptionsComponent from "./bac-ball-options";
import Style from "./bac-ball.module.scss";

const WinningResultEffect = dynamic(() => import("../../components/game-components/winning-result-effect"));

const BacBallBettingBlock: FC = () => {
    return (
        <BettingBlock>
            <div className={`${Style["betting-zone"]}`}>
                <BacBallBetOptionsComponent />
                <WinningResultEffect />
            </div>
        </BettingBlock>
    );
};

export default BacBallBettingBlock;
