import { useEffect, useLayoutEffect, useState } from "react";
import { isMobile } from "react-device-detect";
import useSound from "use-sound";
import { formatVolume } from "../../../_shared/helpers";
import { useSettingContext } from "../../../_shared/react-contexts";
import { getRandomSong } from "../../../_shared/react-hooks";

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
        if (!sound) {
            return;
        }

        const audioContext: AudioContext = global.Howler.ctx;

        if (isUserGesture) {
            if (settingContext.enabledMusic) {
                audioContext.state !== "running" &&
                    audioContext
                        .resume()
                        .then(() => {
                            settingContext.volumeMusic && play();
                        })
                        .catch(() => {
                            settingContext.volumeMusic && play();
                        });
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
    }, [isUserGesture]);

    useEffect(() => {
        settingContext.enabledMusic && settingContext.volumeMusic && play();
        sound?.volume(formatVolume(settingContext.volumeMusic));
        return () => {
            stop();
        };
    }, [play]);

    useEffect(() => {
        if (sound) {
            const audioContext: AudioContext = global.Howler.ctx;
            if (settingContext.enabledMusic) {
                if (settingContext.volumeMusic) {
                    sound.volume(formatVolume(settingContext.volumeMusic));
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
    }, [settingContext.volumeMusic, settingContext.enabledMusic]);
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
