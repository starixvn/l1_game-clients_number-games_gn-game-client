import { FC } from "react";

import WinningResultEffect from "../../components/game-components/winning-result-effect";
import { BacBallBetOptionsComponent } from "./bac-ball-options";
import Style from "./bac-ball.module.scss";

export const BacBallBettingBlock: FC = () => {
    return (
        <div className={`${Style["betting-zone"]}`}>
            <BacBallBetOptionsComponent />
            <WinningResultEffect />
        </div>
    );
};
