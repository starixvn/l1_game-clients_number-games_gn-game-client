import { useEffect, useLayoutEffect, useState } from "react";
import { isMobile } from "react-device-detect";
import useSound from "use-sound";
import { formatVolume } from "../../../_shared/helpers";
import { useSettingContext } from "../../../_shared/react-contexts";
import { getRandomSong } from "../../../_shared/react-hooks";
import * as Sentry from "@sentry/nextjs";

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
        const playMusic = (audioContext: AudioContext) => {
            if (audioContext?.state !== "running") {
                setTimeout(() => {
                    audioContext
                        .resume()
                        .then(() => {
                            play();
                        })
                        .catch(() => {
                            play();
                        });
                }, 100) // wait for update audio context state in Safari

            } else {
                play();
            }
        }

        const pauseMusic = (audioContext: AudioContext) => {
            audioContext?.state !== "suspended" &&
                audioContext
                    .suspend()
                    .then(() => {
                        pause();
                    })
                    .catch(() => {
                        pause();
                    });
        }

        // Sentry.captureMessage((isUserGesture ? " by user gesture" : "") + " --- Music: " + (settingContext?.enabledMusic ? "Enabled" : "Disabled" +
        //     (settingContext?.volumeMusic ? "--- with volume " + settingContext?.volumeMusic : "") +
        //     (ctx ? "--- with sound" : "--- no sound") + " Date: " + Date.now()));

        if (ctx) {
            const audioContext: AudioContext = (ctx as any)._sounds[0]._node.context;
            const isPlayMusic = audioContext && isUserGesture && settingContext.enabledMusic && settingContext.volumeMusic;

            isPlayMusic ? playMusic(audioContext) : pauseMusic(audioContext);
            ctx.volume(formatVolume(settingContext.volumeMusic));
        }

        return () => {
            stop();
        };
    }, [ctx, isUserGesture, settingContext?.enabledMusic, settingContext?.volumeMusic, play]);

    return <></>;
};

const MusicPlayer = () => {
    const [isUserGesture, setIsUserGesture] = useState(null);

    const onVisibilityChange = () => {
        setIsUserGesture(!document.hidden);
    };

    useEffect(() => {
        handleUserGesture();
        document.addEventListener("visibilitychange", onVisibilityChange);
        document.addEventListener("scroll", onVisibilityChange);

        return () => {
            document.removeEventListener("visibilitychange", onVisibilityChange);
            document.removeEventListener("scroll", onVisibilityChange);

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

    return isUserGesture !== null ? <BGMPlayer isUserGesture={isUserGesture} /> : <></>;
};

export default MusicPlayer;
