import React from "react";
import Styles from "./game-icon.module.scss";
export const GameIcon = (props) => {
    const gameIconName = props.gameName.replace(/\s+/g, "").toLowerCase();
    return (
        <div className={`${Styles["icon-game"]}`}>
            <img src={`/static/images/game-board-detail/icon-${gameIconName}.png`} alt="icon-game-1" />
            <span className={`${Styles["game-name"]}`}>{props.gameName}</span>
            <div className={Styles["user-playing"]}>
                <span className={Styles["user-playing-icon"]}></span>
                <span className={Styles["user-playing-value"]}>{props.onlineUsers}</span> playing
            </div>
        </div>
    );
};
