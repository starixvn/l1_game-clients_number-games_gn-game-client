import { useEffect, useState } from "react";
import useSound from "use-sound";
import { useSettingContext } from "../../../_shared/react-contexts";
import { getRandomSong } from "../../../_shared/react-hooks";

const MusicPlayer = ({ isUserGesture }) => {
    const settingContext = useSettingContext();

    const [song, setSong] = useState(getRandomSong(""));
    const [play, { stop, pause, sound: ctx }] = useSound(song, {
        interrupt: false,

        onend: () => {
            setSong(getRandomSong(song));
        },
    });
    useEffect(() => {
        if (!ctx) {
            return;
        }

        //Work around handle iOS lost sound with Audio Context using use-sound lib
        //https://github.com/joshwcomeau/use-sound/issues/15
        //https://github.com/goldfire/howler.js/issues/1234
        const audioContext: AudioContext = ctx._sounds[0]._node.context;

        if (isUserGesture) {
            audioContext
                .resume()
                .then(() => {
                    settingContext.enabledMusic && play();
                })
                .catch(() => {
                    settingContext.enabledMusic && play();
                });
        } else {
            audioContext
                .suspend()
                .then(() => {
                    pause();
                })
                .catch(() => {
                    pause();
                });
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
    return <></>;
};
export default MusicPlayer;
