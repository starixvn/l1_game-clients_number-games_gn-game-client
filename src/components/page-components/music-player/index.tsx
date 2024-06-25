import { useEffect, useLayoutEffect, useState } from "react";
import { isMobile } from "react-device-detect";
import useSound from "use-sound";
import { formatVolume } from "../../../_shared/helpers";
import { useSettingContext } from "../../../_shared/react-contexts";
import { getRandomSong } from "../../../_shared/react-hooks";

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
        let lastInteractionTime = Date.now();

        const resetInteractionTimer = () => {
            lastInteractionTime = Date.now();
        }

        document.addEventListener('mousemove', resetInteractionTimer);
        document.addEventListener('keydown', resetInteractionTimer);
        document.addEventListener('touchstart', resetInteractionTimer);

        const intervalId = setInterval(() => {
            if (!isUserGesture) {
                const timeSinceLastInteraction = Date.now() - lastInteractionTime;
                if (timeSinceLastInteraction > 20000) {
                    global.Howler.ctx.close();
                }
            }
        }, 10000);

        return () => {
            ctx?.stop();
            ctx?.unload();
            document.removeEventListener('mousemove', resetInteractionTimer);
            document.removeEventListener('keydown', resetInteractionTimer);
            document.removeEventListener('touchstart', resetInteractionTimer);
            clearInterval(intervalId);
        }
    }, []);


    useEffect(() => {
        let delayResumeId = null;

        if (ctx && settingContext.enabledMusic) {
            const audioContext: AudioContext = (ctx as any)._sounds[0]._node.context;
            if (isUserGesture) {
                if (audioContext.state !== "running") {
                    delayResumeId = setTimeout(() => {
                        audioContext
                            .resume()
                            .then(() => {
                                if (settingContext.volumeMusic) {
                                    play();
                                }
                            })
                            .catch(() => {
                                if (settingContext.volumeMusic) {
                                    play();
                                }
                            });
                    }, 500);
                } else if (settingContext.volumeMusic) {
                    play();
                }
            } else if (audioContext.state !== "suspended") {
                clearTimeout(delayResumeId);
                audioContext
                    .suspend()
                    .then(() => {
                        pause();
                    })
                    .catch(() => {
                        pause();
                    });
            }
            else {
                clearTimeout(delayResumeId);
            }
        }

        return () => {
            clearTimeout(delayResumeId);
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
            if (settingContext.enabledMusic) {
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
            } else {
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
        }
    }, [settingContext.enabledMusic]);

    useEffect(() => {
        if (ctx) {
            const audioContext: AudioContext = (ctx as any)._sounds[0]._node.context;

            if (settingContext.volumeMusic) {
                audioContext.state !== "running" &&
                    audioContext
                        .resume()
                        .then(() => {
                            play();
                        })
                        .catch(() => {
                            play();
                        });
            } else {
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
            ctx?.volume(formatVolume(settingContext.volumeMusic));
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
