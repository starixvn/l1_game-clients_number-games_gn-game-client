import React from "react";
import { systemName } from "../../../_shared/constants";
import { usePlayerContext, useSystemContext } from "../../../_shared/react-contexts";
import Styles from "./chip-slider.module.scss";

export const Chip: React.FC<{ value: number; onClickChip: Function; text: string; image: string }> = ({
    value,
    onClickChip,
    text,
    image,
}) => {
    const systemContext = useSystemContext();

    const enabledQuickBet = usePlayerContext().authorizeInfo?.user?.settings?.quickBet;

    const { selectedChip } = systemContext;

    const getChipClassName = () => {
        let className = `${Styles["chip-container"]} ${Styles[systemName]}`;
        selectedChip === value && (className += ` ${Styles["selected"]}`);
        enabledQuickBet && (className += ` ${Styles["enabled-quick-bet"]}`);
        return className;
    };

    const getDefaultChipText = () => {
        return value < 1000 ? value.toString() : `${value / 1000}K`;
    };

    return (
        <div id={`chip-${value}`} key={value} className={getChipClassName()} onClick={() => onClickChip(value)}>
            {image && (
                <img
                    src={`/static/images/chips/${systemName}/${image.replace("#", "")}.svg`}
                    className={`img-fluid ${Styles["chip"]}`}
                    alt="Chip"
                />
            )}
            <span className={Styles["value"]}>{text || getDefaultChipText()}</span>
        </div>
    );
};
