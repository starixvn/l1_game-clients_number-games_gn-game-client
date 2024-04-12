import { GameIds, buildVersion } from "../../../_shared/constants";

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
    const imageUrls = `/static/images/bg-galaxy/bg-${gameName.toLowerCase()}.jpg?v=${buildVersion}`;

    return (
        <>
            <div className="background-galaxy">
                <img className="galaxy-2" src={imageUrls} alt="galaxy" />

                <div className="galaxy-1-container">
                    <img className="galaxy-1" src={imageUrls} alt="galaxy" />
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
