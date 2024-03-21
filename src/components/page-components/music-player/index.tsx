import React, { useState, useEffect } from "react";
import { getRandomSong } from "../../../_shared/react-hooks";
import useSound from "use-sound";

const MusicPlayer = ({ children, enabledMusic }) => {
    const [song, setSong] = useState(getRandomSong(""));
    const [play, { stop }] = useSound(song, {
        onend: () => {
            setSong(getRandomSong(song));
        },
    });

    useEffect(() => {
        enabledMusic && play();

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

    return <div>{children}</div>;
};

export default MusicPlayer;
