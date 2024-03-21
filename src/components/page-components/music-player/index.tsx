import React, { useState, useEffect } from "react";
import { getRandomSong } from "../../../_shared/react-hooks";
import useSound from "use-sound";
import { useSettingContext } from "../../../_shared/react-contexts";

const MusicPlayer = ({}) => {
    const settingContext = useSettingContext();

    const [song, setSong] = useState(getRandomSong(""));
    const [play, { stop }] = useSound(song, {
        onend: () => {
            setSong(getRandomSong(song));
        },
    });

    useEffect(() => {
        settingContext.enabledMusic && play();

        return () => {
            stop();
        };
    }, [play]);

    useEffect(() => {
        if (settingContext.enabledMusic) {
            play();
        } else {
            stop();
            setSong(getRandomSong(song));
        }
    }, [settingContext.enabledMusic]);

    return <div>&nbsp;</div>;
};

export default MusicPlayer;
