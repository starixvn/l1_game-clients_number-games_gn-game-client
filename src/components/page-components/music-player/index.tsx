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
        return () => {
            ctx?.stop();
            ctx?.unload();
            global.Howler?.unload();
            global.Howler?.stop();
        }
    }, []);

    useEffect(() => {
        let delayResumeId = null;
        const audioContext: AudioContext = global.Howler?.ctx;
        if (audioContext && settingContext.enabledMusic) {
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
            const audioContext: AudioContext = global.Howler?.ctx;
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
            const audioContext: AudioContext = global.Howler?.ctx;

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
