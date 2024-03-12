import React, { useEffect, useState } from "react";
import useSound from "use-sound";
import { StorageHelper, localStorageKeys } from "../../../../../_shared/helpers";
import { useSystemContext } from "../../../../../_shared/react-contexts";
import { getRandomSong } from "../../../../../_shared/react-hooks";
import Styles from "./../menu.module.scss";

const dropdownItemClassName = "dropdown-item";

export const Music: React.FC = () => {
    const [enabledMusic, setEnabledMusic] = useState(StorageHelper.get(localStorageKeys.enableMusic) ?? false);
    const systemContext = useSystemContext();

    const [song, setSong] = useState(getRandomSong(""));
    const [play, { stop }] = useSound(song, {
        onend: () => {
            setSong(getRandomSong(song));
        },
    });

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

    const onToggleMusic = () => {
        StorageHelper.set(localStorageKeys.enableMusic, !enabledMusic);
        setEnabledMusic(!enabledMusic);
    };

    return (
        <div className={`${dropdownItemClassName} ${Styles[dropdownItemClassName]}`} id="music-settings" onClick={() => onToggleMusic()}>
            <span
                id={enabledMusic ? `icon-sound-on` : `icon-music-off`}
                className={enabledMusic ? `icon-music-on ${Styles["menu-icon"]}` : `icon-music-off ${Styles["menu-icon"]}`}
            ></span>
        </div>
    );
};
