import dynamic from "next/dynamic";
import { FC } from "react";
import Style from "./se-ball.module.scss";

const BettingBlock = dynamic(() => import("../../components/game-components/bet-option/betting-block"));
const LuckyThreeBetOptionsComponent = dynamic(() => import("./lucky-three-bet-options-component"));
const WinningResultEffect = dynamic(() => import("../../components/game-components/winning-result-effect"));

const LuckyThreeBettingBlock: FC = () => {
    return (
        <BettingBlock>
            <div className={`${Style["betting-zone"]}`}>
                <LuckyThreeBetOptionsComponent />
                <WinningResultEffect />
            </div>
        </BettingBlock>
    );
};

export default LuckyThreeBettingBlock;
