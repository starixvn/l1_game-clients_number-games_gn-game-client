import { useEffect, useLayoutEffect, useState } from "react";
import { isMobile } from "react-device-detect";
import useSound from "use-sound";
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
        let isPageHidden = false;

        function resetInteractionTimer() {
            lastInteractionTime = Date.now();
        }

        function handleVisibilityChange() {
            if (document.visibilityState === 'hidden') {
                isPageHidden = true;
                console.log('Page is hidden');
            } else {
                isPageHidden = false;
                const timeSinceLastInteraction = Date.now() - lastInteractionTime;
                console.log('Page is visible again');

                if (timeSinceLastInteraction > 60000) {
                    console.log('Possibly autosleep due to inactivity');
                } else {
                    console.log('Possibly manual sleep');
                }
            }
        }

        document.addEventListener('mousemove', resetInteractionTimer);
        document.addEventListener('keydown', resetInteractionTimer);
        document.addEventListener('touchstart', resetInteractionTimer);
        document.addEventListener('visibilitychange', handleVisibilityChange);


        setInterval(() => {
            if (isPageHidden) {
                const timeSinceLastInteraction = Date.now() - lastInteractionTime;
                if (timeSinceLastInteraction > 50000) {

                    const audioContext: AudioContext = ctx._sounds[0]._node.context;
                    audioContext.close();
                    stop();
                    console.log('Page is hidden for a while with no interaction, possibly autosleep');
                }
            }
        }, 10000);

        return () => {
            document.removeEventListener('mousemove', resetInteractionTimer);
            document.removeEventListener('keydown', resetInteractionTimer);
            document.removeEventListener('touchstart', resetInteractionTimer);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        }
    }, []);

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
