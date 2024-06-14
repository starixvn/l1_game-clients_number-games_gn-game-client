import dynamic from "next/dynamic";
import { FC } from "react";

import BettingBlock from "../../components/game-components/bet-option/betting-block";
import SeBallBetOptionsComponent from "./se-ball-bet-options-component";
import Style from "./se-ball.module.scss";

const WinningResultEffect = dynamic(() => import("../../components/game-components/winning-result-effect"));

const SeBallBettingBlock: FC = () => {
    return (
        <BettingBlock>
            <div className={`${Style["betting-zone"]}`}>
                <SeBallBetOptionsComponent />
                <WinningResultEffect />
            </div>
        </BettingBlock>
    );
};

export default SeBallBettingBlock;
