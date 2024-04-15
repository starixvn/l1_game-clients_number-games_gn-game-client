import Image from "next/image";
import { useEffect, useState } from "react";
import { buildVersion } from "../constants";

const DEFAULT_PATH = "/static/images";

interface IInfoImage {
    src: string;
    width: number;
    height: number;
}

const PreloadResources = ({
    images = [
        { src: `${DEFAULT_PATH}/cage/ball-blue-1.png?v=${buildVersion}`, width: 1224, height: 612 },
        { src: `${DEFAULT_PATH}/cage/ball-blue-2.png?v=${buildVersion}`, width: 1224, height: 612 },
        { src: `${DEFAULT_PATH}/cage/ball-red-1.png?v=${buildVersion}`, width: 1224, height: 612 },
        { src: `${DEFAULT_PATH}/cage/ball-red-2.png?v=${buildVersion}`, width: 1224, height: 612 },
    ],
    setIsDonePreloadResource,
}: {
    images?: IInfoImage[];
    setIsDonePreloadResource: Function;
}) => {
    const [preloadImg, setPreloadImg] = useState(images);
    const [loadedImages, setLoadedImages] = useState<any>(new Set());
    const [startTime, setStartTime] = useState(null);

    useEffect(() => {
        setStartTime(performance.now());
    }, []);

    const handleOnLoadingComplete = (index: number) => {
        setLoadedImages((prevLoadedImages) => new Set([...prevLoadedImages, index]));
    };

    useEffect(() => {
        if (loadedImages.size === preloadImg.length) {
            const endTime = performance.now();
            const duration = endTime - startTime;
            console.log(`All images loaded in ${duration} milliseconds`);
            setIsDonePreloadResource(true);
        }
    }, [loadedImages]);

    return (
        <div>
            <div id="load-img" style={{ opacity: 0 }}>
                {preloadImg.length > 0 &&
                    preloadImg.map((image, index) => (
                        <Image
                            priority={true}
                            key={index}
                            src={image.src}
                            width={image.width}
                            height={image.height}
                            alt={"test"}
                            onLoadingComplete={() => handleOnLoadingComplete(index)}
                            className="lazy"
                            data-src={image}
                            unoptimized={true}
                            quality={100}
                        />
                    ))}
            </div>
        </div>
    );
};

export default PreloadResources;
