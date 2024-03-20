import React, { useState, useEffect } from "react";
import { getRandomSong } from "../../../_shared/react-hooks";
import useSound from "use-sound";

const MusicPlayer = ({ children, enabledMusic }) => {
    console.log("enable music in player", enabledMusic);

    const [song, setSong] = useState(getRandomSong(""));
    const [play, { stop }] = useSound(song, {
        onend: () => {
            setSong(getRandomSong(song));
        },
    });

    useEffect(() => {
        console.log("affect 2");
        //if (systemContext.isUserGesture) {
        enabledMusic && play();
        //}
        return () => {
            console.log("stop");
            stop();
        };
    }, [play]);

    useEffect(() => {
        console.log("affect 1");
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
