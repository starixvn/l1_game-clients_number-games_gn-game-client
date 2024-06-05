import { useEffect, useLayoutEffect, useState } from "react";
import { isMobile } from "react-device-detect";
import useSound from "use-sound";
import { useSettingContext } from "../../../_shared/react-contexts";
import { getRandomSong } from "../../../_shared/react-hooks";
// import * as Sentry from "@sentry/nextjs";
// import { Howl, HowlCallback, HowlErrorCallback, HowlOptions } from "howler";

const BGMPlayer = ({ isUserGesture }) => {
    const settingContext = useSettingContext();
    const [song, setSong] = useState(getRandomSong(""));
    const [play, { stop, pause, sound }] = useSound(song, {
        interrupt: false,

        onend: () => {
            setSong(getRandomSong(song));
        },
    });


    useEffect(() => {
        return () => {
            global.Howler && global.Howler.unload();
        }
    }, []);

    useEffect(() => {
        if (!sound) {
            return;
        }

        //Work around handle iOS lost sound with Audio Context using use-sound lib
        //https://github.com/joshwcomeau/use-sound/issues/15
        //https://github.com/goldfire/howler.js/issues/1234
        const audioContext: AudioContext = global.Howler.ctx;

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

const MusicPlayer = () => {
    const [isUserGesture, setIsUserGesture] = useState(null);

    const onVisibilityChange = () => {
        (setIsUserGesture(!document.hidden));
    };

    useEffect(() => {
        handleUserGesture();
        return () => {
            isMobile
                ? document.removeEventListener("touchstart", onVisibilityChange)
                : document.removeEventListener("click", onVisibilityChange);
        };
    }, []);

    const handleUserGesture = () => {
        const timeoutId = setTimeout(() => {
            !isUserGesture && setIsUserGesture(true);
        }, 10 * 1000);

        isMobile
            ? window.addEventListener("touchstart", () => enableUserGesture(timeoutId))
            : window.addEventListener("click", () => enableUserGesture(timeoutId));
    };

    const enableUserGesture = (timeoutId: NodeJS.Timeout) => {
        if (!isUserGesture) {
            setIsUserGesture(true);
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        }
    };

    useLayoutEffect(() => {
        document.addEventListener("visibilitychange", onVisibilityChange);
        return () => document.removeEventListener("visibilitychange", onVisibilityChange);
    }, []);

    return isUserGesture !== null ? <BGMPlayer isUserGesture={isUserGesture} /> : <></>;
};

export default MusicPlayer;
