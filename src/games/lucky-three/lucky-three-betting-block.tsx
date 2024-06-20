import dynamic from "next/dynamic";
import { FC } from "react";
import Style from "./lucky-three.module.scss";
import BettingBlock from "../../components/game-components/bet-option/betting-block";
import LuckyThreeBetOptionsComponent from "./lucky-three-bet-options-component";

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
