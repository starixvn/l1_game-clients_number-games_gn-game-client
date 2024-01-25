import { useTranslation } from "next-i18next";
import React, { useMemo } from "react";
import { useGameContext } from "../../../contexts/game-context/game-context";
import { useSystemContext } from "../../../contexts/system";
import { formatOdds } from "../../../helpers/number-helper";
import Styles from "./odd.module.scss";

const OddItem = ({ name, number }) => {
    const { t } = useTranslation("fishprawncrab");
    const { fractionalOddsFormat } = useSystemContext();
    const oddsValue = formatOdds(number, fractionalOddsFormat);
    return (
        <div className={Styles["odd-item"]}>
            <span className={Styles.type}>{t(name)}</span>
            <span className={Styles.value}>{oddsValue}</span>
        </div>
    );
};

const OddComponent: React.FunctionComponent = () => {
    const { gameConfigs } = useGameContext();
    const { odds } = gameConfigs;
    return useMemo(() => {
        const oddsNames = ["single", "double", "triple"];
        return (
            <div className="d-flex">
                <div className={Styles["odd-container"]}>
                    {oddsNames.map((name) => {
                        return <OddItem key={name} name={name} number={odds[name]}></OddItem>;
                    })}
                </div>
            </div>
        );
    }, [odds]);
};

export default OddComponent;
