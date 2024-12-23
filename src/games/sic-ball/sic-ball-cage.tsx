import { FC } from "react";

import Style from "./sic-ball.module.scss";
import { useMemoriedImage } from "../../_shared/react-hooks";
import { getDevicePixelRatio } from "../../_shared/constants/resource-image-mapping";

const SicBallCage: FC = () => {
    const is2x = getDevicePixelRatio() > 1;
    const { data: cage } = useMemoriedImage(`/static/images/sic-ball/${is2x ? "2" : "1"}x/cage.png`);

    const isLoaded = cage;
    if (!isLoaded) {
        return <></>;
    }

    return <div className={Style["cage"]} style={{ backgroundImage: `image-set(url('${cage}') ${is2x ? "2x" : "1x"})` }}></div>;
};

export default SicBallCage;
