import { useEffect, useRef, useState } from "react";

import { useClickSound } from "../../../../../../_shared/react-hooks";
import Style from "./volume-setting.module.scss";

const VolumeSetting = ({ onChangeVolume, defaultValue, isTurnOn }) => {
    const [volume, setVolume] = useState(defaultValue);
    const clickSound = useClickSound();
    const volumeRef = useRef(null);
    const minValue = 0;
    const maxValue = 100;
    const enableColor = "rgb(96, 218, 0)";
    const disabledColor = "rgb(108, 125, 113)";

    useEffect(() => {
        const progress = (volume / maxValue) * 100;
        volumeRef.current.style.background = `linear-gradient(to right, ${
            isTurnOn ? enableColor : disabledColor
        } ${progress}%, rgb(108, 125, 113) ${progress}%)`;
    }, [volume, isTurnOn]);

    return (
        <input
            ref={volumeRef}
            className={`${volume > 0 && isTurnOn ? Style["range-input"] : Style["range-input-disabled"]}`}
            type="range"
            min={minValue}
            max={maxValue}
            value={volume}
            step="1"
            onChange={(event) => {
                setVolume(+event.target.value);
                onChangeVolume(event.target.value);
            }}
            onClick={clickSound}
        />
    );
};

export default VolumeSetting;
