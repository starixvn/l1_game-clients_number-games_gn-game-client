import React, { useEffect, useState } from "react";
import { buildVersion, ChipMapper, systemName } from "../../../_shared/constants";
import { useSystemContext } from "../../../_shared/react-contexts";
import { RoundState } from "./../../game-base/type";
import OverlayMaskWhite from "../overlay-mask-white";
import { Props } from "./bet-container";
import Styles from "./bet-container.module.scss";

const BetContainer: React.FC<Props> = (props) => {
    const systemContext = useSystemContext();
    const { betValue } = systemContext;
    const [customStyle, setCustomStyle] = useState<object>();
    const [cursorImage, setCursorImage] = useState<string>("");

    useEffect(() => {
        setCursorImage(`"/static/images/small-chips/${systemName}/small_${ChipMapper[systemName][betValue]}.png?v=${buildVersion}"`);
    }, [betValue]);

    useEffect(() => {
        if (props.roundState === RoundState.InRound) {
            setCustomStyle({ cursor: `url(${cursorImage}), auto` });
        } else {
            setCustomStyle({ cursor: "not-allowed" });
        }
    }, [props.roundState, cursorImage]);

    return (
        <div className={Styles["bet-container"]} style={customStyle}>
            {props.children}
            {RoundState.LockingBet === props.roundState && <OverlayMaskWhite />}
        </div>
    );
};

export default BetContainer;
