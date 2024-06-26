import { useEffect, useLayoutEffect, useState } from "react";
import { isMobile } from "react-device-detect";
import useSound from "use-sound";
import { formatVolume } from "../../../_shared/helpers";
import { useSettingContext } from "../../../_shared/react-contexts";
import { getRandomSong } from "../../../_shared/react-hooks";

const playMusic = ({ audioContext, play }) => {
    if (audioContext.state !== "running") {
        audioContext
            .resume()
            .then(() => {
                play();
            })
            .catch(() => {
                play();
            });
    } else {
        play();
    }
}

const suspendMusic = ({ audioContext, pause }) => {
    audioContext.state !== "suspended" &&
        audioContext
            .suspend()
            .then(() => {
                pause();
            })
            .catch(() => {
                pause();
            });
}

const BGMPlayer = ({ isUserGesture }) => {
    const settingContext = useSettingContext();
    const [song, setSong] = useState(getRandomSong(""));
    const [play, { stop, pause, sound: ctx }] = useSound(song, {
        interrupt: false,
        onend: () => {
            setSong(getRandomSong(song));
        },
    });

    useEffect(() => {
        if (ctx && settingContext.enabledMusic) {
            const audioContext: AudioContext = (ctx as any)._sounds[0]._node.context;
            isUserGesture ? playMusic({ audioContext, play }) : suspendMusic({ audioContext, pause });
        }
    }, [isUserGesture]);

    useEffect(() => {
        settingContext.enabledMusic && settingContext.volumeMusic && play();
        ctx?.volume(formatVolume(settingContext.volumeMusic));
        return () => {
            stop();
        };
    }, [play]);

    useEffect(() => {
        if (ctx) {
            const audioContext: AudioContext = (ctx as any)._sounds[0]._node.context;
            settingContext.enabledMusic ? playMusic({ audioContext, play }) : suspendMusic({ audioContext, pause });
        }
    }, [settingContext.enabledMusic]);

    useEffect(() => {
        if (ctx) {
            const audioContext: AudioContext = (ctx as any)._sounds[0]._node.context;
            settingContext.volumeMusic ? playMusic({ audioContext, play }) : suspendMusic({ audioContext, pause });
            ctx.volume(formatVolume(settingContext.volumeMusic));
        }
    }, [settingContext.volumeMusic]);

    return <></>;
};

const MusicPlayer = () => {
    const [isUserGesture, setIsUserGesture] = useState(null);

    const onVisibilityChange = () => {
        setIsUserGesture(!document.hidden);
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
