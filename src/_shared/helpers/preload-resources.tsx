import axios from "axios";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { v4 as uuidv4 } from "uuid";

const DELAY_TIME = 1000;
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
    isDirectMode: boolean;
    bannerId: number;
    locale: string;
    gameIdsIcon: number[];
    enablePreloadResource?: boolean;
}> = ({ setIsDonePreloadResource, gameId, bannerId, gameIdsIcon, locale, enablePreloadResource = true }) => {
    const router = useRouter();
    const [loadedImages, setLoadedImages] = useState<any>(new Set());
    const [startTime, setStartTime] = useState(null);
    const [images, setImages] = useState<string[]>([]);

    useEffect(() => {
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

        if (router?.isReady) {
            if (enablePreloadResource) {
                setStartTime(performance.now());
                fetchImages();
            } else {
                updateProgressBar(100);
            }
        }
    }, [router?.isReady]);

    const handleOnLoadingComplete = (index: number) => {
        setLoadedImages((prevLoadedImages) => new Set([...prevLoadedImages, index]));
    };

    useEffect(() => {
        let timeout: NodeJS.Timeout;
        const percentage = (loadedImages.size / images.length) * 100;
        updateProgressBar(percentage);

        if (loadedImages.size === images.length) {
            const endTime = performance.now();
            const duration = endTime - startTime;
            timeout = setTimeout(
                () => {
                    console.log("setIsDonePreloadResource");
                    setIsDonePreloadResource?.(true);
                },
                duration < MAX_DELAY_TIME ? DELAY_TIME : 0
            );
        }

        return () => {
            timeout && clearTimeout(timeout);
        };
    }, [loadedImages]);

    return useMemo(() => {
        if (!enablePreloadResource) {
            return <></>;
        }

        return (
            <div>
                <div id="load-img" style={{ opacity: 0 }}>
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
    }, [images.length > 0, enablePreloadResource]);
};

export default PreloadResources;
