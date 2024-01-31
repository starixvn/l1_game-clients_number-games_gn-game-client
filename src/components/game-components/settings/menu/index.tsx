import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "next-i18next";
import { CommonResourceKeys, ResourceTypes } from "../../../../_shared/resources";
import { Tooltip } from "../../tooltip";
import { isMobileOnly } from "react-device-detect";
import Styles from "./menu.module.scss";

const dropdownItemClassName = "dropdown-item";

export const Menu: React.FC<{
    handleToggleNotification: Function;
    enabledNotification: boolean;
    handleToggleGuideModal: Function;
}> = ({ handleToggleNotification, enabledNotification, handleToggleGuideModal }) => {
    const { t } = useTranslation([ResourceTypes.COMMON]);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const toggleBtnRef = useRef<HTMLDivElement>(null);
    const specialClassByDevice = !isMobileOnly ? "desktop-style" : "";

    const openGuide = () => {
        handleToggleGuideModal();
        setDropdownOpen(false);
    };

    const handleClickOutside = (event) => {
        if (wrapperRef && wrapperRef.current && !wrapperRef.current.contains(event.target)) {
            setDropdownOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);

    return (
        <div ref={wrapperRef} className={`${Styles["game-menu"]} ${Styles[specialClassByDevice]}`}>
            <div
                ref={toggleBtnRef}
                className={`${Styles["menu-toggle-btn"]}`}
                onClick={() => {
                    setDropdownOpen(!dropdownOpen);
                }}
            >
                <span className={`icon-menu ${Styles["icon-menu"]}`}></span>
                <Tooltip message={t("menu")} hoverWrapper={toggleBtnRef}></Tooltip>
            </div>
            <div className="dropdown">
                <div className={`dropdown-menu right ${Styles["dropdown-menu"]} ${dropdownOpen ? "show" : ""}`}>
                    <div className={`${dropdownItemClassName} ${Styles[dropdownItemClassName]}`}>
                        <div className={Styles["label"]}>{t("winningStreakNotification")}</div>
                        <div className={Styles["toggle-button"]}>
                            <input
                                id="toggle-notification"
                                className={Styles["toggle-checkbox"]}
                                type={"checkbox"}
                                onChange={() => handleToggleNotification()}
                                checked={enabledNotification}
                            />
                            <label className={Styles["toggle-btn"]} htmlFor="toggle-notification"></label>
                        </div>
                    </div>
                    <div className={`${dropdownItemClassName} ${Styles[dropdownItemClassName]}`} onClick={openGuide}>
                        {t(CommonResourceKeys.GUIDE_POPUP_TITLE)}
                    </div>
                </div>
            </div>
        </div>
    );
};
