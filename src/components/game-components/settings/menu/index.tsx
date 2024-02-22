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
                        <span className="icon-music"></span>
                    </div>
                    <div
                        className={`${dropdownItemClassName} ${Styles[dropdownItemClassName]}`}
                        ref={toggleSoundBtnRef}
                        id="sound-settings"
                        onClick={() => onToggleSound()}
                    >
                        <span
                            className={
                                enabledSound ? `icon-sound-on ${Styles["icon-sound-on"]}` : `icon-sound-off ${Styles["icon-sound-off"]}`
                            }
                        ></span>

                        <Tooltip message={`${t("sound")}: ${enabledSound ? t("on") : t("off")}`} hoverWrapper={toggleSoundBtnRef} />
                    </div>

                    <div className={`${dropdownItemClassName} ${Styles[dropdownItemClassName]}`}>
                        <span className="icon-history"></span>
                    </div>
                    <div className={`${dropdownItemClassName} ${Styles[dropdownItemClassName]}`} onClick={openGuide}>
                        <span className="icon-guide"></span>
                    </div>
                </div>
            </div>
        </div>
    );
};
