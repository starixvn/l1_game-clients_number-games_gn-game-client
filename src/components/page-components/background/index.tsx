import Image from "next/image";
import { memo } from "react";

import { buildVersion, GameIds } from "../../../_shared/constants";
import { memo } from "react";

type Props = {
    gameId: number;
};

const getGameName = (gameId) => {
    for (const gameName in GameIds) {
        if (GameIds[gameName] === gameId) {
            return gameName;
        }
    }
    return null;
};

const GamesNotPlayStarsAnimation = [GameIds.LuckyThree];

export const BackgroundGalaxy: React.FC<Props> = ({ gameId }) => {
    const isLowPerformanceDevice = useLowPerformanceDevice();
    const gameName = getGameName(gameId);
    const imageUrls = `/static/images/bg-galaxy/bg-${gameName.toLowerCase()}.webp?v=${buildVersion}`;

    const isShouldNotPlayStarsAnimation = () => {
        return GamesNotPlayStarsAnimation.find((id) => id === gameId) && isLowPerformanceDevice;
    };

    return (
        <>
            <div className="background-galaxy">
                <Image className="galaxy-2" width={580} height={850} src={imageUrls} alt="galaxy" />

                <div className="galaxy-1-container">
                    <Image className="galaxy-1" width={580} height={850} src={imageUrls} alt="galaxy" />
                </div>
            </div>
            {!isShouldNotPlayStarsAnimation() && (
                <div className="star-field">
                    <div className="layer"></div>
                    <div className="layer"></div>
                    <div className="layer"></div>
                </div>
            )}
        </>
    );
};

export default memo(BackgroundGalaxy);
