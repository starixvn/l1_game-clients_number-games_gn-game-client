import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "next-i18next";
import { CommonResourceKeys, ResourceTypes } from "../../../../_shared/resources";
import { Tooltip } from "../../tooltip";
import { isMobileOnly } from "react-device-detect";
import Styles from "./menu.module.scss";

const dropdownItemClassName = "dropdown-item";

export const Menu: React.FC<{
    handleToggleGuideModal: Function;
    enabledSound: boolean;
    onToggleSound: Function;
}> = ({ handleToggleGuideModal, enabledSound, onToggleSound }) => {
    const { t } = useTranslation([ResourceTypes.COMMON]);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const toggleBtnRef = useRef<HTMLDivElement>(null);
    const toggleSoundBtnRef = useRef<HTMLDivElement>(null);
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
                        <span id="icon-music-on" className={`icon-music-on ${Styles["menu-icon"]}`}></span>
                    </div>
                    <div
                        className={`${dropdownItemClassName} ${Styles[dropdownItemClassName]}`}
                        ref={toggleSoundBtnRef}
                        id="sound-settings"
                        onClick={() => onToggleSound()}
                    >
                        <span
                            id={enabledSound ? `icon-sound-on` : `icon-sound-off`}
                            className={enabledSound ? `icon-sound-on ${Styles["menu-icon"]}` : `icon-sound-off ${Styles["menu-icon"]}`}
                        ></span>
                    </div>

                    <div className={`${dropdownItemClassName} ${Styles[dropdownItemClassName]}`}>
                        <span id="icon-history" className={`icon-history ${Styles["menu-icon"]}`}></span>
                    </div>
                    <div className={`${dropdownItemClassName} ${Styles[dropdownItemClassName]}`} onClick={openGuide}>
                        <span id="icon-guide" className={`icon-guide ${Styles["menu-icon"]}`}></span>
                    </div>
                </div>
            </div>
        </div>
    );
};
