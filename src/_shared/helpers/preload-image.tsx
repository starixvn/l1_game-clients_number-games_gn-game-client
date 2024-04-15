import { useEffect } from "react";
import { buildVersion } from "../constants";

const DEFAULT_PATH = "/static/images";

const PreloadImages: React.FC<{ preloadImages?: string[] }> = ({ preloadImages = [] }) => {
    const handlePreloadImages = () => {
        const defaultImages = [
            `${DEFAULT_PATH}/cage/ball-blue-1.png?v=${buildVersion}`,
            `${DEFAULT_PATH}/cage/ball-blue-2.png?v=${buildVersion}`,
            `${DEFAULT_PATH}/cage/ball-red-1.png?v=${buildVersion}`,
            `${DEFAULT_PATH}/cage/ball-red-2.png?v=${buildVersion}`,
        ];

        const images = preloadImages.length > 0 ? preloadImages : defaultImages;
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
        handlePreloadImages();
    }, []);

    return <div className="preloads"></div>;
};

export default PreloadImages;
