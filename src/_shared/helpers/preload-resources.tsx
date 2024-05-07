import axios from "axios";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { v4 as uuidv4 } from "uuid";

const MAX_DELAY_TIME = 5000;

export const updateProgressBar = (percentage: number) => {
    const progressBars = document.querySelectorAll("#progress-bar");
    progressBars.forEach((progressBar) => {
        if (progressBar instanceof HTMLElement) {
            progressBar.style.width = `${percentage}%`;
        }
    });
};

const PreloadResources: React.FC<{
    setIsDonePreloadResource: Function;
    gameId: number;
    isDirectMode?: boolean;
    bannerId?: number;
    locale?: string;
    gameIdsIcon?: number[];
    cancelPreloadResource?: boolean;
    durationDelayDonePreload?: number;
    enablePreloadResource: boolean;
}> = ({
    setIsDonePreloadResource,
    gameId,
    bannerId,
    gameIdsIcon,
    locale = "en",
    cancelPreloadResource,
    durationDelayDonePreload = 0,
    enablePreloadResource = true,
}) => {
    const router = useRouter();
    const [loadedImages, setLoadedImages] = useState<any>(new Set());
    const [startTime, setStartTime] = useState(null);
    const [images, setImages] = useState<string[]>([]);
    
    const fetchImages = async () => {
        try {
            const response = await axios.post("/api/preload-images", {
                gameId,
                locale,
                gameIdsIcon,
                bannerId,
            });

            const imagesPath = response?.data || [];

            setImages(imagesPath);
        } catch (error) {
            console.error("Error fetching images:", error);
        }
    };

    useEffect(() => {
        if (router?.isReady) {
            if (enablePreloadResource && gameId >= 0) {
                setStartTime(performance.now());
                fetchImages();
            }
        }
    }, [router?.isReady, gameId]);

    const handleOnLoadingComplete = (index: number) => {
        setLoadedImages((prevLoadedImages) => new Set([...prevLoadedImages, index]));
    };

    useEffect(() => {
        let timeout: NodeJS.Timeout;

        if (cancelPreloadResource) {
            setLoadedImages(new Set());
            setImages([]);
            setIsDonePreloadResource(false);
            clearTimeout(timeout);
            return;
        }

        const percentage = (loadedImages.size / images.length) * 100;
        updateProgressBar(percentage);

        if (loadedImages?.size > 0 && loadedImages?.size === images.length) {
            const endTime = performance.now();
            const duration = endTime - startTime;
            timeout = setTimeout(
                () => {
                    setIsDonePreloadResource?.(true);
                },
                duration < MAX_DELAY_TIME ? durationDelayDonePreload : 0
            );
        }

        return () => {
            timeout && clearTimeout(timeout);
        };
    }, [loadedImages, cancelPreloadResource]);

    const handleStateWithoutPreloadResource = () => {
        updateProgressBar(100);
        setIsDonePreloadResource?.(true);
    };

    return useMemo(() => {
        if (!enablePreloadResource || gameId < 0) {
            handleStateWithoutPreloadResource();

            return <></>;
        }

        return (
            <div>
                <div id="load-img" style={{ opacity: 0, position: "absolute" }}>
                    {images.length > 0 &&
                        images.map((image, index) => (
                            <Image
                                priority={true}
                                key={uuidv4()}
                                src={image}
                                width={1}
                                height={1}
                                alt={"preload-img"}
                                data-src={image}
                                unoptimized={image.includes("gif") ? false : true}
                                quality={100}
                                onLoad={() => handleOnLoadingComplete(index)}
                                onError={(e) => {
                                    console.log("Error preload image", image);
                                }}
                            />
                        ))}
                </div>
            </div>
        );
    }, [images.length > 0, enablePreloadResource, gameId]);
};

export default PreloadResources;
