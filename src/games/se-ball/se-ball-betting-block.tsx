import dynamic from "next/dynamic";
import { FC } from "react";
import Style from "./se-ball.module.scss";

const BettingBlock = dynamic(() => import("../../components/game-components/bet-option/betting-block"));
const SeBallBetOptionsComponent = dynamic(() => import("./se-ball-bet-options-component"));
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
