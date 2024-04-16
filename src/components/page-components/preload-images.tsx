import { useEffect } from "react";

const DEFAULT_PATH = "/static/images";

const PreloadImages: React.FC<{ additionalImages?: string[] }> = ({ additionalImages = [] }) => {
    const preloadImages = () => {
        const defaultImages = [`${DEFAULT_PATH}/bg-galaxy-small.webp`];

        const images = [...defaultImages, ...(Array.isArray(additionalImages) ? additionalImages : [])];
        const requests = images.map((url) => new Request(url, { mode: "no-cors" }));
        const startTime = performance.now();

        Promise.all(requests.map((request) => fetch(request)))
            .then(() => {
                const endTime = performance.now(); // Get the end time
                const totalTime = endTime - startTime; // Calculate the total time
                console.log(`Preloaded images in ${totalTime.toFixed(2)} ms`);
            })
            .catch((error) => {
                console.error("Error preloading images:", error);
            });
    };

    useEffect(() => {
        preloadImages();
    }, []);

    return <div id="preloads"></div>;
};

export default PreloadImages;
