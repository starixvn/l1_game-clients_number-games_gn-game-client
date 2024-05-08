import axios from "axios";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { v4 as uuidv4 } from "uuid";

const MAX_DELAY_TIME = 5000;
export const DURATION_HOLD_SPLASH_SCREEN = 1000;

export const updateProgressBar = (percentage: number) => {
    const progressBars = document.querySelectorAll("#progress-bar");
    progressBars.forEach((progressBar) => {
        if (progressBar instanceof HTMLElement) {
            progressBar.style.width = `${percentage}%`;
        }
    });
};

const PreloadResources: React.FC<{
    setIsDonePreload: Function;
    gameId: number;
    isDirectMode?: boolean;
    bannerId?: number;
    locale?: string;
    gameIdsIcon?: number[];
    cancelPreload?: boolean;
    durationDelayDonePreload?: number;
    enablePreload: boolean;
}> = ({
    setIsDonePreload,
    gameId,
    bannerId,
    gameIdsIcon,
    locale = "en",
    cancelPreload,
    durationDelayDonePreload = 0,
    enablePreload = true,
}) => {
    const router = useRouter();
    const [loadedImages, setLoadedImages] = useState<any>(new Set());
    const [startTime, setStartTime] = useState(null);
    const [images, setImages] = useState<string[]>([]);
    let timeoutWithoutPreloadResource: NodeJS.Timeout;

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
            if (enablePreload && gameId >= 0) {
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

        if (cancelPreload) {
            setLoadedImages(new Set());
            setImages([]);
            setIsDonePreload(false);
            timeout && clearTimeout(timeout);
        } else {
            const percentage = (loadedImages.size / images.length) * 100;
            updateProgressBar(percentage);

            if (loadedImages?.size > 0 && loadedImages?.size === images.length) {
                const endTime = performance.now();
                const duration = endTime - startTime;
                timeout && clearTimeout(timeout);
                timeout = setTimeout(
                    () => {
                        setIsDonePreload?.(true);
                    },
                    duration < MAX_DELAY_TIME ? durationDelayDonePreload : 0
                );
            }
        }

        return () => {
            timeout && clearTimeout(timeout);
        };
    }, [loadedImages, cancelPreload]);

    const handleStateWithoutPreloadResource = () => {
        timeoutWithoutPreloadResource && clearTimeout(timeoutWithoutPreloadResource);
        const endTime = performance.now();
        const duration = endTime - startTime;
        timeoutWithoutPreloadResource = setTimeout(
            () => {
                updateProgressBar(100);
                setIsDonePreload?.(true);
            },
            duration < MAX_DELAY_TIME ? durationDelayDonePreload : 0
        );
    };

    return useMemo(() => {
        if (!enablePreload || gameId < 0) {
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
    }, [images.length > 0, enablePreload, gameId]);
};

export default PreloadResources;
