import dynamic from "next/dynamic";
import { FC } from "react";
import Style from "./sic-ball.module.scss";
import BettingBlock from "../../components/game-components/bet-option/betting-block";
import SicBallBetOptionsComponent from "./sic-ball-bet-option";

const WinningResultEffect = dynamic(() => import("../../components/game-components/winning-result-effect"));

const SicBallBettingBlock: FC = () => {
    return (
        <BettingBlock>
            <div className={`${Style["betting-zone"]}`}>
                <SicBallBetOptionsComponent />
                <WinningResultEffect />
            </div>
        </BettingBlock>
    );
};

export default SicBallBettingBlock;
