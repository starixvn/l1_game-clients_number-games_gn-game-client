import { useEffect, useState } from "react";
import useSound from "use-sound";
import { useSettingContext } from "../../../_shared/react-contexts";
import { getRandomSong } from "../../../_shared/react-hooks";

const MusicPlayer = ({ isUserGesture }) => {
    const settingContext = useSettingContext();

    const [song, setSong] = useState(getRandomSong(""));
    const [play, { stop, pause }] = useSound(song, {
        onend: () => {
            setSong(getRandomSong(song));
        },
    });
    useEffect(() => {
        if (isUserGesture) {
            settingContext.enabledMusic && play();
        } else {
            pause();
        }
    }, [isUserGesture]);

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

    return <div></div>;
};

export default MusicPlayer;
