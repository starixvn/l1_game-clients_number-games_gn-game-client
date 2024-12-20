import { FC } from "react";

import { buildVersion } from "../../_shared/constants";
import Style from "./sic-ball.module.scss";
import { useMemoriedImage } from "../../_shared/react-hooks";
import { getDevicePixelRatio } from "../../_shared/constants/resource-image-mapping";

const SicBallCage: FC = () => {
    const { data: cage } = useMemoriedImage(`/static/images/sic-ball/${getDevicePixelRatio() > 1 ? "2" : "1"}x/cage.png?v=${buildVersion}`);

    const isLoaded = cage;
    if (!isLoaded) {
        return <></>;
    }

    return <div className={Style["cage"]} style={{ backgroundImage: `image-set(url('${cage}'))` }}></div>;
};

export default SicBallCage;
