import React from "react";

import { numberWithCommas } from "../../../../_shared/helpers/number-helper";
import Styles from "./styles.module.scss";

const WinningBet: React.FC<{ amount: number }> = ({ amount }) => {
    return (
        <div className={Styles["winning-bet"]}>
            <span className={Styles["number"]} data-testid="number">{`+${numberWithCommas(amount)}`}</span>
        </div>
    );
};

export default WinningBet;
