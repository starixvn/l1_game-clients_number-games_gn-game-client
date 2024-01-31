import React from "react";

import Styles from "./styles.module.scss";

const GameLoading: React.FC<{}> = () => {
    const classBorder = "border-radius";
    const classSkeletonItem = "skeleton-item";

    return (
        <div className={Styles.container} data-testid="game-loading">
            <div className={Styles.header}>
                <div className={Styles["header-left"]}>
                    <div className={`${Styles[classBorder]} ${Styles[classSkeletonItem]} ${Styles["game-name"]}`} />
                    <div className={`${Styles[classBorder]} ${Styles[classSkeletonItem]} ${Styles["round-id"]}`} />
                </div>
                <div className={`${Styles[classSkeletonItem]} ${Styles["countdown-timer"]}`} />
                <div className={Styles["header-right"]}>
                    <span className={`${Styles[classSkeletonItem]} ${Styles["rebet"]}`} />
                    <span className={`${Styles[classBorder]} ${Styles[classSkeletonItem]} ${Styles["menu"]}`} />
                </div>
            </div>
            <div className={Styles["bet-container"]}>
                <div className={`${Styles[classSkeletonItem]} ${Styles["full-size"]}`} />
            </div>
            <div className={Styles["mini-round-history"]}>
                <div className={`${Styles[classBorder]} ${Styles[classSkeletonItem]} ${Styles["skeleton-item-large"]}`} />
            </div>
            <div className={Styles["statistic"]}>
                <div className={`${Styles[classBorder]} ${Styles[classSkeletonItem]} ${Styles["skeleton-item-large"]}`} />
            </div>
            <div className={Styles.scoreboard}>
                <div className={`${Styles[classSkeletonItem]} ${Styles["score-board-line"]}`} />
                <div className={`${Styles[classSkeletonItem]} ${Styles["score-board-line1"]}`} />
                <div className={`${Styles[classSkeletonItem]} ${Styles["score-board-line2"]}`} />
                <div className={`${Styles[classSkeletonItem]} ${Styles["score-board-line3"]}`} />
            </div>
        </div>
    );
};

export default GameLoading;
