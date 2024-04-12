import Head from "next/head";
import { useEffect } from "react";
import { buildVersion } from "../constants";

const path = "/static/images/cage";

const PreloadImages = () => {
    const preloadImages = () => {
        const images = [
            `${path}/ball-blue-1.png?v=${buildVersion}`,
            `${path}/ball-blue-2.png?v=${buildVersion}`,
            `${path}/ball-red-1.png?v=${buildVersion}`,
            `${path}/ball-red-2.png?v=${buildVersion}`,
        ];
        const requests = images.map((url) => new Request(url, { mode: "no-cors" }));

        Promise.all(requests.map((request) => fetch(request)))
            .then(() => {
                console.log("Preloaded images");
            })
            .catch((error) => {
                console.error("Error preloading images:", error);
            });
    };

    useEffect(() => {
        preloadImages();
    }, []);

    return (
        <Head>
            <link rel="preload" href={`${path}/ball-blue-1.png?v=${buildVersion}`} as="image" />
            <link rel="preload" href={`${path}/ball-blue-2.png?v=${buildVersion}`} as="image" />
            <link rel="preload" href={`${path}/ball-red-1.png?v=${buildVersion}`} as="image" />
            <link rel="preload" href={`${path}/ball-red-2.png?v=${buildVersion}`} as="image" />
        </Head>
    );
};

export default PreloadImages;
