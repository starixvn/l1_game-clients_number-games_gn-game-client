import React from "react";
import { ChipLabelMapper, ChipMapper, systemName } from "../../../_shared/constants";
import { useAuthContext, useSystemContext } from "../../../_shared/react-contexts";
import Styles from "./chip-slider.module.scss";

const defaultChip = "chip";

export const Chip: React.FC<{ value: number; onClickChip: Function }> = ({ value, onClickChip }) => {
    const systemContext = useSystemContext();

    const enabledQuickBet = useAuthContext().authorizeInfo?.user?.settings?.quickBet;

    const { selectedChip } = systemContext;

    const getChipClassName = () => {
        let className = `${Styles["chip-container"]} ${Styles[ChipMapper[systemName][value] || defaultChip]} ${Styles[systemName]}`;
        selectedChip === value && (className += ` ${Styles["selected"]}`);
        enabledQuickBet && (className += ` ${Styles["enabled-quick-bet"]}`);
        return className;
    };

    const getChipValueString = () => {
        if (ChipLabelMapper[systemName][value]) {
            return ChipLabelMapper[systemName][value];
        }
        console.log("chip value", value);
        return value < 1000 ? value.toString() : `${value / 1000}K`;
    };

    return (
        <div id={`chip-${value}`} key={value} className={getChipClassName()} onClick={() => onClickChip(value)}>
            <img
                src={`/static/images/chips/${systemName}/${ChipMapper[systemName][value] || defaultChip}.svg`}
                className={`img-fluid ${Styles["chip"]}`}
                width="60"
                height="62"
                alt="Chip"
            />
            <span className={Styles["value"]}>{getChipValueString()}</span>
        </div>
    );
};
