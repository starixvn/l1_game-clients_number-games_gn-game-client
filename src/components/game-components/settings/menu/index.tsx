import React, { useEffect, useRef, useState } from "react";
import { isMobileOnly } from "react-device-detect";
import { GameEventActionType } from "../../../../_shared/react-contexts/game-state-context/game-event-action";
import { useGameStatesDispatch } from "../../../../_shared/react-contexts/game-state-context/game-state-context";
import { useClickSound } from "../../../../_shared/react-hooks";
import { useSNTranslate } from "../../../../_shared/react-hooks/use-translator";
import Styles from "./menu.module.scss";
import { Music } from "./music";
import { Sound } from "./sound";

const dropdownItemClassName = "dropdown-item";

export const Menu: React.FC = () => {
    const { t } = useSNTranslate();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const specialClassByDevice = !isMobileOnly ? "desktop-style" : "";
    const dispatch = useGameStatesDispatch();
    const clickSound = useClickSound();

    const openBetHistory = () => {
        clickSound();
        dispatch({
            type: GameEventActionType.TOGGLE_BET_HISTORY,
            payload: {
                isShowBetHistory: true,
            },
        });
        setDropdownOpen(false);
    };

    const openGuide = () => {
        clickSound();
        dispatch({
            type: GameEventActionType.TOGGLE_GAME_GUIDE,
            payload: {
                isShowGameGuide: true,
            },
        });
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
                className={`${Styles["menu-toggle-btn"]}`}
                id="icon-menu"
                onClick={() => {
                    clickSound();
                    setDropdownOpen(!dropdownOpen);
                }}
            >
                <span className={`icon-menu ${Styles["icon-menu"]}`}></span>
            </div>
            <div className="dropdown">
                <div className={`dropdown-menu right ${Styles["dropdown-menu"]} ${dropdownOpen ? "show" : ""}`}>
                    <Music />
                    <Sound />
                    <div className={`${dropdownItemClassName} ${Styles[dropdownItemClassName]}`} onClick={openBetHistory}>
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
