import { useEffect, useState } from "react";
import { isMobile } from "react-device-detect";
import useSound from "use-sound";
import { formatVolume } from "../../../_shared/helpers";
import { useSettingContext } from "../../../_shared/react-contexts";
import { getRandomSong } from "../../../_shared/react-hooks";
import * as Sentry from "@sentry/nextjs";

const MusicPlayer = () => {
    const settingContext = useSettingContext();
    const [song, setSong] = useState(getRandomSong(""));
    const [play, { stop, pause, sound: ctx }] = useSound(song, {
        interrupt: false,
        onend: () => {
            setSong(getRandomSong(song));
        },
    });

    const [isUserGesture, setIsUserGesture] = useState(null);

    useEffect(() => {
        const playMusic = ({ audioContext, play }) => {
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
                }, 1000)

            } else {
                play();
            }
        }
        const pauseMusic = ({ audioContext, pause }) => {
            if (typeof pause == 'function') {
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
        }

        // Sentry.captureMessage((isUserGesture ? " by user gesture" : "") + " --- Music: " + (settingContext?.enabledMusic ? "Enabled" : "Disabled" +
        //     (settingContext?.volumeMusic ? "--- with volume " + settingContext?.volumeMusic : "") +
        //     (ctx ? "--- with sound" : "--- no sound") + " Date: " + Date.now()));


        if (ctx) {
            const audioContext: AudioContext = (ctx as any)._sounds[0]._node.context;
            isUserGesture && settingContext.enabledMusic
                && settingContext.volumeMusic && audioContext
                ? playMusic({ audioContext, play })
                : pauseMusic({ audioContext, pause });
            ctx.volume(formatVolume(settingContext.volumeMusic));
        }

        return () => {
            stop();
        };
    }, [ctx, isUserGesture, settingContext?.enabledMusic, settingContext?.volumeMusic, play]);


    useEffect(() => {

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

        handleUserGesture();
        const onVisibilityChange = () => {
            setIsUserGesture(!document.hidden);
        };

        document.addEventListener("visibilitychange", onVisibilityChange);
        return () => {
            isMobile
                ? document.removeEventListener("touchstart", onVisibilityChange)
                : document.removeEventListener("click", onVisibilityChange);
        };
    }, []);

    return <></>;
};

export default MusicPlayer;
