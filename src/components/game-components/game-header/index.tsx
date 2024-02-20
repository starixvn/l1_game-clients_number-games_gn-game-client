import { useTranslation } from "next-i18next";
import React, { useEffect, useMemo, useState } from "react";
import { isMobileOnly } from "react-device-detect";

import { StorageHelper, localStorageKeys } from "../../../_shared/helpers/storage-helper";
import { useGameActionContext, useGameContext, useSystemContext } from "../../../_shared/react-contexts";
import { CommonResourceKeys } from "../../../_shared/resources";
import { GameResourceKeys } from "../../../_shared/resources/game-resource-keys";
import { RebetStorageModel, ViewMode } from "../../game-base/type";
import { favoriteGameIdIgnore } from "../../page-components/game-category/constants";
import Styles from "./game-header.module.scss";
import { useGameStateContext } from "../../../_shared/react-contexts/game-state-context/game-state-context";

export type GameHeaderProps = {
    isShowCollapse: boolean;
    isUpdateDisableRebet: boolean;
    countdownTimerComponent: any;
};

export const GameHeader: React.FunctionComponent<GameHeaderProps> = ({ isShowCollapse, isUpdateDisableRebet, countdownTimerComponent }) => {
    const { roundId } = useGameStateContext();
    const { favoriteGames, setFavorite } = useSystemContext();
    const { updateViewMode, renderResultCollapse, updateStatusShowResult } = useGameActionContext();

    const { id: gameId, gameName } = useGameContext();
    const [isFavorite, updateFavorite] = useState<boolean>(favoriteGames.includes(gameId));
    const { t } = useTranslation([gameName.toLowerCase()]);

    useEffect(() => {
        updateFavorite(favoriteGames.includes(gameId));
    }, [favoriteGames]);

    return useMemo(() => {
        const favoriteClickHandle = (e: React.MouseEvent) => {
            e.stopPropagation();
            setFavorite(gameId, !isFavorite);
            updateFavorite(!isFavorite);
        };

        const onHeaderClick = (e: React.MouseEvent) => {
            e.stopPropagation();
            if (isMobileOnly) {
                const mode = ViewMode.full;
                updateViewMode(mode);
                updateStatusShowResult();
            }
        };

        const showCollapseResult = false;

        return (
            <div data-testid="header" className={`${Styles.header}`} onClick={onHeaderClick}>
                <div className={Styles["header-left"]}>
                    <div className={Styles["header-overlay"]}></div>
                    {!favoriteGameIdIgnore.includes(gameId) ? (
                        <div className={Styles["favorite-btn"]} onClick={favoriteClickHandle} data-testid="favorite-btn">
                            <span
                                className={
                                    isFavorite
                                        ? `icon-favorite ${Styles["icon-favorite"]}`
                                        : `icon-favorite-normal ${Styles["icon-favorite-normal"]}`
                                }
                            ></span>
                        </div>
                    ) : (
                        <div className={Styles["zone-none-favorite"]}></div>
                    )}

                    <div className={Styles["title-roundID"]}>
                        <div className={Styles.title}>{t(GameResourceKeys.GAME_NAME)}</div>
                        <div key={roundId} className={Styles.round}>
                            #{roundId}
                        </div>
                    </div>
                </div>
                {!showCollapseResult && countdownTimerComponent}
                <HeaderRight isUpdateDisableRebet={isUpdateDisableRebet} />
                {showCollapseResult && <div className={Styles["header-result"]}>{renderResultCollapse()}</div>}
            </div>
        );
    }, [roundId, isFavorite]);
};

const HeaderRight = ({ isUpdateDisableRebet }) => {
    const { roundId, ownBets } = useGameStateContext();
    const { id: gameId } = useGameContext();
    const [disabledRebet, updateDisableRebet] = useState<boolean>(false);
    const { t } = useTranslation();

    const rebetStorageKey = localStorageKeys.rebet;
    const rebetStorage = StorageHelper.get<RebetStorageModel>(rebetStorageKey) || {};
    const rebetInfo = rebetStorage[gameId];

    const rebetClickHandle = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    useEffect(() => {
        isUpdateDisableRebet && updateDisableRebet(true);
    }, []);

    useEffect(() => {
        updateDisableRebet(rebetInfo?.betInfo === undefined || rebetInfo?.roundId + 1 !== roundId);
    }, [roundId]);

    return (
        <div className={Styles["header-right"]}>
            {
                <button
                    className={Styles.rebet}
                    disabled={disabledRebet || Object.keys(ownBets).length !== 0}
                    onClick={rebetClickHandle}
                    data-testid="rebet-btn"
                >
                    {t(CommonResourceKeys.REBET)}
                </button>
            }
        </div>
    );
};

export default GameHeader;
