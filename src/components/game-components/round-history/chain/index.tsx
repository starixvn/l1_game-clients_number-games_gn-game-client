import { useTranslation } from "next-i18next";
import React, { useEffect, useMemo, useState } from "react";

import { useGameContext } from "../../../../_shared/contexts/game-context/game-context";
import { Round } from "../../../types";
import { GameState } from "../../../game-base/type";
import { ContainerToolTip } from "../dot-tool-tip";
import { MiniItemNext } from "../dot-next";
import Styles from "./styles.module.scss";
import { Props, PropsDot } from "./types";

const RoundDotWrapper = <R, S>({ children, renderRoundDetail, targetName, gameState }: PropsDot<R, S>) => {
    const [isOpenTooltip, setIsOpenTooltip] = useState(false);
    const toggleTooltip = () => setIsOpenTooltip(!isOpenTooltip);
    useEffect(() => {
        if (gameState === GameState.LockingBet) {
            setIsOpenTooltip(false);
        }
    }, [gameState]);

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
    const { gameState, roundHistory, renderRoundDetail, renderGameDot } = props;
    const { gameSetting, isShowBlink } = useGameContext();
    const gameName = gameSetting.gameName.toLowerCase();
    const { t } = useTranslation(gameName);

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
                        gameState={gameState}
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
