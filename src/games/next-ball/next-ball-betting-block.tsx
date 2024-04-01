import dynamic from "next/dynamic";
import { FC } from "react";
import Style from "./next-ball.module.scss";

const BettingBlock = dynamic(() => import("../../components/game-components/bet-option/betting-block"));
const NextBallBetOptionsComponent = dynamic(() => import("./next-ball-options"));
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
