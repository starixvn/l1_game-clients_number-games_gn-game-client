import { useState } from "react";
import { useClickSound } from "../../../../../../_shared/react-hooks";

const VolumeSetting = ({ onChangeVolume, defaultValue }) => {
    const [volume, setVolume] = useState(defaultValue);
    const clickSound = useClickSound();

    return (
        <input
            type="range"
            min="0"
            max="100"
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
