import React from "react";
import Styles from "./item.module.scss";

type Props = {
    type: number;
    isSmall?: boolean;
};

const listIconName = ["fpc-nai", "fpc-bau", "fpc-ga", "fpc-ca", "fpc-cua", "fpc-tom"];
const ChoiceIcon: React.FunctionComponent<Props> = ({ type, isSmall }) => {
    return isSmall ? (
        <div className={Styles["icon-mini"]}>
            <img src={`/static/images/${listIconName[type]}.svg`} className="img-fluid" width="28" height="28" alt="symbol" />
        </div>
    ) : (
        <div className={Styles["score-board-item"]}>
            <div className={Styles["symbol-size"]}>
                <img src={`/static/images/${listIconName[type]}.svg`} className="img-fluid" width="29" height="29" alt="symbol" />
            </div>
        </div>
    );
};

export const ChoiceIconHistory: React.FunctionComponent<Props> = ({ type }) => {
    return (
        <div className={`${Styles["icon-bet-history"]}`}>
            <img src={`/static/images/${listIconName[type]}.svg`} className="img-fluid" width="20" height="20" alt="symbol" />
        </div>
    );
};

export default ChoiceIcon;
