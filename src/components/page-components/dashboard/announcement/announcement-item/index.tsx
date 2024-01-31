import React from "react";
import { useTranslation } from "next-i18next";
import { Props } from "./types";
import Styles from "../announcement.module.scss";

const AnnouncementItem: React.FunctionComponent<Props> = ({ title, content, isActive, gameId, onCloseAnnouncement, openGame }) => {
    const { t } = useTranslation();
    const onClickJoinGame = () => {
        if (!isActive) {
            return;
        }
        onCloseAnnouncement();
        openGame(gameId);
    };
    return (
        <>
            <img src={`/static/images/promotion-badge.svg`} className={Styles[`img-fluid`]} height="46" width="36" alt="Promotion" />
            <div className={Styles["content"]} onClick={onClickJoinGame}>
                <span className={Styles["title"]}>{title}</span>
                <p className={Styles["text"]}>{content}</p>
                <div className={Styles["bottom"]}>
                    <button className={`btn-red ${Styles["btn"]}`} disabled={!isActive}>
                        {t("joinGame")}
                    </button>
                </div>
            </div>
        </>
    );
};

export default AnnouncementItem;
