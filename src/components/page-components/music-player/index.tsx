import { useEffect, useState } from "react";
import { isMobile } from "react-device-detect";
import useSound from "use-sound";
import { formatVolume } from "../../../_shared/helpers";
import { useSettingContext } from "../../../_shared/react-contexts";
import { getRandomSong } from "../../../_shared/react-hooks";
import * as Sentry from "@sentry/nextjs";
import { controlMusic } from "./music-player-helper";

const MusicPlayer = () => {
    const [isUserGesture, setIsUserGesture] = useState(null);

    const settingContext = useSettingContext()
    const [song, setSong] = useState(getRandomSong(""));
    const [play, { stop, pause, sound: ctx }] = useSound(song, {
        interrupt: false,
        onend: () => {
            setSong(getRandomSong(song));
        },
    });

    useEffect(() => {
        controlMusic(ctx, isUserGesture, play, pause);
    }, [isUserGesture]);

    useEffect(() => {
        settingContext.enabledMusic && settingContext.volumeMusic && play();
        ctx?.volume(formatVolume(settingContext.volumeMusic));
        return () => {
            stop();
        };
    }, [play]);

    useEffect(() => {
        controlMusic(ctx, settingContext.enabledMusic, play, pause);
    }, [settingContext.enabledMusic]);

    useEffect(() => {
        controlMusic(ctx, settingContext.volumeMusic > 0, play, pause);
        ctx?.volume(formatVolume(settingContext.volumeMusic));
    }, [settingContext.volumeMusic]);

    const onChangeGesture = () => {
        setIsUserGesture(!document.hidden);
    };

    const onChangeGestureScroll = () => {
        Sentry.captureMessage("onChangeGestureScroll ---");
        setIsUserGesture(true);
    };

    useEffect(() => {
        document.addEventListener("scroll", onChangeGestureScroll);
        document.addEventListener("visibilitychange", onChangeGesture);

        isMobile
            ? document.addEventListener("touchstart", onChangeGestureScroll)
            : document.addEventListener("click", onChangeGestureScroll);

        return () => {
            document.removeEventListener("scroll", onChangeGestureScroll);
            document.removeEventListener("visibilitychange", onChangeGesture);

            isMobile
                ? document.removeEventListener("touchstart", onChangeGestureScroll)
                : document.removeEventListener("click", onChangeGestureScroll);
        };
    }, []);

    return <></>;
};

export default MusicPlayer;
