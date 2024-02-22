import React from "react";
import Styles from "./chip-slider.module.scss";
import { useGameStateContext } from "../../../_shared/react-contexts/game-state-context/game-state-context";
import { ChipLabelMapper, ChipMapper, systemName } from "../../../_shared/constants";

const defaultChip = "chip-13";

export const Chip: React.FC<{ value: number; onClickChip: Function }> = ({ value, onClickChip }) => {
    const gameStateContext = useGameStateContext();
    const { selectedChip, enabledQuickBet } = gameStateContext;

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
        return value < 1000 ? value.toString() : `${value / 1000}K`;
    };

    return (
        <div key={value} className={getChipClassName()} onClick={() => onClickChip(value)}>
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
