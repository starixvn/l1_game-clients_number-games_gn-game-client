import { useEffect } from "react";
import { buildVersion } from "../../_shared/constants";

export const DEFAULT_PATH_IMAGE = "/static/images";

const NUMBERS = 75;

export const getCagePaths = () => {
    const cageColors = ["red", "blue"];
    const cageNumberPaths = Array.from({ length: NUMBERS }, (_, i) => `${DEFAULT_PATH_IMAGE}/cage/number/${i + 1}.png?v=${buildVersion}`);
    const paths = cageColors.map((color) => `${DEFAULT_PATH_IMAGE}/cage/${color}.webp?v=${buildVersion}`).concat(cageNumberPaths);

    return paths;
};

const PreloadImages: React.FC<{ pathImages?: string[] }> = ({ pathImages = [] }) => {
    const preloadImages = () => {
        const images = Array.isArray(pathImages) ? pathImages : [];
        const requests = images.map((url) => new Request(url, { mode: "no-cors" }));
        const startTime = performance.now();

        Promise.all(requests.map((request) => fetch(request)))
            .then(() => {
                const endTime = performance.now();
                const totalTime = endTime - startTime;
                console.log(`Preloaded images in ${totalTime.toFixed(2)} ms`);
            })
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
