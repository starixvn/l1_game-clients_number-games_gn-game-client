import React, { useEffect, useRef, useState } from "react";

import { numberWithCommas } from "../../../../_shared/helpers/number-helper";
import { Boundary, Position } from "../../../game-base/type";
import Styles from "./styles.module.scss";

type Props = {
    amount: number;
    betPosition?: Position;
    betOptionBoundary?: Boundary;
};

const AcceptBet: React.FC<Props> = ({ amount, betPosition, betOptionBoundary }) => {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const [customStyle, setCustomStyle] = useState<React.CSSProperties>({ position: "fixed", right: "auto" });

    useEffect(() => {
        if (wrapperRef.current) {
            const windowWidth = window.innerWidth;
            const wrapperWidth = wrapperRef.current.getBoundingClientRect().width;
            const newCustomStyle = { ...customStyle };

            newCustomStyle.top = betPosition?.y - 30;
            newCustomStyle.left = Math.min(
                windowWidth - wrapperWidth - 10,
                betPosition?.x - 15,
                (betOptionBoundary?.right || 2000) - wrapperWidth
            );
            newCustomStyle.left = Math.max(betOptionBoundary?.left || 10, newCustomStyle.left);

            setCustomStyle(newCustomStyle);
        }
    }, [wrapperRef]);

    return (
        <div ref={wrapperRef} style={betPosition ? customStyle : null} className={`${Styles["accepted-bet"]}`}>{`-${numberWithCommas(
            amount
        )}`}</div>
    );
};

export default AcceptBet;
