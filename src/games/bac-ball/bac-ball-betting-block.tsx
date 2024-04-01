import dynamic from "next/dynamic";
import { FC } from "react";
import Style from "./bac-ball.module.scss";

const BettingBlock = dynamic(() => import("../../components/game-components/bet-option/betting-block"));
const BacBallBetOptionsComponent = dynamic(() => import("./bac-ball-options"));
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
