import React, { useEffect, useRef, useState } from "react";
import { isMobileOnly } from "react-device-detect";
import useSound from "use-sound";
import { StorageHelper, localStorageKeys } from "../../../../_shared/helpers";
import { useSystemContext } from "../../../../_shared/react-contexts";
import { getRandomSong } from "../../../../_shared/react-hooks";
import { useSNTranslate } from "../../../../_shared/react-hooks/use-translator";
import { Tooltip } from "../../tooltip";
import Styles from "./menu.module.scss";
import { useGameStatesDispatch } from "../../../../_shared/react-contexts/game-state-context/game-state-context";
import { GameEventActionType } from "../../../../_shared/react-contexts/game-state-context/game-event-action";

const dropdownItemClassName = "dropdown-item";

export const Menu: React.FC = () => {
    const [enabledSound, setEnabledSound] = useState(StorageHelper.get(localStorageKeys.enableSound) ?? false);
    const [enabledMusic, setEnabledMusic] = useState(StorageHelper.get(localStorageKeys.enableMusic) ?? false);
    const systemContext = useSystemContext();
    const [song, setSong] = useState(getRandomSong(""));
    const [play, { stop }] = useSound(song, {
        onend: () => {
            setSong(getRandomSong(song));
        },
    });

    const toggle = () => {
        setEnabledMusic(!enabledMusic);
    };

    useEffect(() => {
        if (systemContext.isUserGesture) {
            enabledMusic && play();
        }
        return () => {
            stop();
        };
    }, [play]);

    useEffect(() => {
        if (enabledMusic) {
            play();
        } else {
            stop();
            setSong(getRandomSong(song));
        }
    }, [enabledMusic]);

    const { t } = useSNTranslate();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const toggleBtnRef = useRef<HTMLDivElement>(null);
    const specialClassByDevice = !isMobileOnly ? "desktop-style" : "";
    const dispatch = useGameStatesDispatch();

    const onToggleSound = () => {
        StorageHelper.set(localStorageKeys.enableSound, !enabledSound);
        setEnabledSound(!enabledSound);
    };
    const onToggleMusic = () => {
        StorageHelper.set(localStorageKeys.enableMusic, !enabledMusic);
        setEnabledMusic(!enabledMusic);
        toggle();
    };

    const openBetHistory = () => {
        dispatch({
            type: GameEventActionType.TOGGLE_BET_HISTORY,
            payload: {
                isShowBetHistory: true,
            },
        });
        setDropdownOpen(false);
    };

    const openGuide = () => {
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
                ref={toggleBtnRef}
                className={`${Styles["menu-toggle-btn"]}`}
                id="icon-menu"
                onClick={() => {
                    setDropdownOpen(!dropdownOpen);
                }}
            >
                <span className={`icon-menu ${Styles["icon-menu"]}`}></span>
                <Tooltip message={t("menu")} hoverWrapper={toggleBtnRef}></Tooltip>
            </div>
            <div className="dropdown">
                <div className={`dropdown-menu right ${Styles["dropdown-menu"]} ${dropdownOpen ? "show" : ""}`}>
                    <div
                        className={`${dropdownItemClassName} ${Styles[dropdownItemClassName]}`}
                        id="music-settings"
                        onClick={() => onToggleMusic()}
                    >
                        <span
                            id={enabledMusic ? `icon-sound-on` : `icon-music-off`}
                            className={enabledMusic ? `icon-music-on ${Styles["menu-icon"]}` : `icon-music-off ${Styles["menu-icon"]}`}
                        ></span>
                    </div>
                    <div
                        className={`${dropdownItemClassName} ${Styles[dropdownItemClassName]}`}
                        id="sound-settings"
                        onClick={() => onToggleSound()}
                    >
                        <span
                            id={enabledSound ? `icon-sound-on` : `icon-sound-off`}
                            className={enabledSound ? `icon-sound-on ${Styles["menu-icon"]}` : `icon-sound-off ${Styles["menu-icon"]}`}
                        ></span>
                    </div>

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
