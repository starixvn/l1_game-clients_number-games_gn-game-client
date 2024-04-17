import React from "react";
import { systemName } from "../../../_shared/constants";
import { useSystemContext } from "../../../_shared/react-contexts";
import Styles from "./chip-slider.module.scss";

export const Chip: React.FC<{ value: number; onClickChip: Function; text: string; image: string }> = ({
    value,
    onClickChip,
    text,
    image,
}) => {
    const systemContext = useSystemContext();

    const { selectedChip } = systemContext;

    const getChipClassName = () => {
        return `${Styles["chip-container"]} ${selectedChip === value ? Styles["selected"] : ""}`;
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
