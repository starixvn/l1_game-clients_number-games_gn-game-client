import { useEffect } from "react";
import { buildVersion } from "../../_shared/constants";

export const DEFAULT_PATH_IMAGE = "/static/images";

const NUMBERS = 75;

export const getCagePaths = () => {
    const buildVersionQuery = `?v=${buildVersion}`;
    const cageColors = ["ball-red-1", "ball-red-2", "ball-blue-1", "ball-blue-2"];
    const cageColorPaths = cageColors.map((color) => `${DEFAULT_PATH_IMAGE}/cage/${color}.webp${buildVersionQuery}`);

    const cageNumberPaths = [];
    for (let i = 0; i < NUMBERS; i++) {
        cageNumberPaths.push(`${DEFAULT_PATH_IMAGE}/cage/number/${i + 1}.webp${buildVersionQuery}`);
    }

    return [...cageColorPaths, ...cageNumberPaths];
};

const PreloadImages: React.FC<{ pathImages?: string[] }> = ({ pathImages = [] }) => {
    const preloadImages = () => {
        const images = Array.isArray(pathImages) ? pathImages : [];
        const requests = images.map((url) => new Request(url, { mode: "no-cors" }));

        Promise.all(requests.map((request) => fetch(request)))
            .then(() => {})
            .catch((error) => {
                console.error("Error preloading images:", error);
            });
    };

    useEffect(() => {
        preloadImages();
    }, []);

    return <div className="preloads"></div>;
};

export default PreloadImages;
