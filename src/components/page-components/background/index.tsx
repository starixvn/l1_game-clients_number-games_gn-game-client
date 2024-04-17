import Image from "next/image";

import { buildVersion, GameIds } from "../../../_shared/constants";

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

export const BackgroundGalaxy: React.FC<Props> = ({ gameId }) => {
    const gameName = getGameName(gameId);
    const imageUrls = `/static/images/bg-galaxy/bg-${gameName.toLowerCase()}.webp?v=${buildVersion}`;

    return (
        <>
            <div className="background-galaxy">
                <Image className="galaxy-2" width={580} height={800} src={imageUrls} alt="galaxy" priority={true} />

                <div className="galaxy-1-container">
                    <Image className="galaxy-1" width={580} height={800} src={imageUrls} alt="galaxy" />
                </div>
            </div>
            <div className="star-field">
                <div className="layer"></div>
                <div className="layer"></div>
                <div className="layer"></div>
            </div>
        </>
    );
};

export default BackgroundGalaxy;
