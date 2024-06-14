import dynamic from "next/dynamic";
import { FC } from "react";

import BettingBlock from "../../components/game-components/bet-option/betting-block";
import NextBallBetOptionsComponent from "./next-ball-options";
import Style from "./next-ball.module.scss";

const WinningResultEffect = dynamic(() => import("../../components/game-components/winning-result-effect"));

const NextBallBettingBlock: FC = () => {
    return (
        <BettingBlock>
            <div className={`${Style["betting-zone"]}`}>
                <NextBallBetOptionsComponent />
                <WinningResultEffect />
            </div>
        </BettingBlock>
    );
};

export default NextBallBettingBlock;
