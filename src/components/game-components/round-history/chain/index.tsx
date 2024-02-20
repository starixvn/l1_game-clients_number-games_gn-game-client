import { useTranslation } from "next-i18next";
import React, { useEffect, useMemo, useState } from "react";

import { useGameContext } from "../../../../_shared/react-contexts";
import { RoundState, Round } from "../../../game-base/type";
import { ContainerToolTip } from "../dot-tool-tip";
import { MiniItemNext } from "../dot-next";
import Styles from "./styles.module.scss";
import { Props, PropsDot } from "./types";
import { useGameStateContext } from "../../../../_shared/react-contexts/game-state-context/game-state-context";

const RoundDotWrapper = <R, S>({ children, renderRoundDetail, targetName, roundState }: PropsDot<R, S>) => {
    const [isOpenTooltip, setIsOpenTooltip] = useState(false);
    const toggleTooltip = () => setIsOpenTooltip(!isOpenTooltip);
    useEffect(() => {
        if (roundState === RoundState.LockingBet) {
            setIsOpenTooltip(false);
        }
    }, [roundState]);

    return (
        <div className={`${Styles["dot-wrapper"]}`} onClick={toggleTooltip} data-testid="dot-wrapper">
            <div id={targetName}>{children}</div>
            {isOpenTooltip && (
                <ContainerToolTip isOpen={true} onClose={toggleTooltip}>
                    <div className={Styles.tooltip}>{renderRoundDetail}</div>
                </ContainerToolTip>
            )}
        </div>
    );
};

const ChainRoundHistory = <R, S>(props: Props<R, S>) => {
    const { roundState, roundHistory, renderRoundDetail, renderGameDot } = props;
    const { gameName } = useGameContext();
    const { isShowBlink } = useGameStateContext();
    const { t } = useTranslation(gameName.toLowerCase());

    return useMemo(() => {
        const numberOfItems = isShowBlink ? 19 : 20;
        const rounds = roundHistory.slice(0, numberOfItems).reverse();
        return (
            <div className={Styles["round-dot-wrapper"]}>
                {rounds.map((round: Round<R, S>, index: number) => (
                    <RoundDotWrapper
                        key={round.roundId}
                        renderRoundDetail={renderRoundDetail(round, t)}
                        targetName={`${gameName}-${round.roundId}`}
                        roundState={roundState}
                    >
                        {renderGameDot(round, isShowBlink, index, numberOfItems)}
                    </RoundDotWrapper>
                ))}
                {isShowBlink && <MiniItemNext></MiniItemNext>}
            </div>
        );
    }, [roundHistory, isShowBlink]);
};

export default ChainRoundHistory;
