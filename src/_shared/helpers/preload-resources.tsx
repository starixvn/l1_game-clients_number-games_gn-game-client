import axios from "axios";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { getPathImageGameId, pathImageMapping } from "../constants/resource-image-mapping";

const PreloadResources: React.FC<{ setIsDonePreloadResource: Function; gameId: number; isDirectMode: boolean }> = ({
    setIsDonePreloadResource,
    gameId,
}) => {
    const router = useRouter();
    const [loadedImages, setLoadedImages] = useState<any>(new Set());
    const [startTime, setStartTime] = useState(null);
    const [images, setImages] = useState<string[]>([]);

    useEffect(() => {
        const getPathsImg = () => {
            if (+gameId === 0) {
                return pathImageMapping.lobby;
            }

            if (+gameId > 0) {
                return [...pathImageMapping.game, ...getPathImageGameId(+gameId)];
            }

            return [];
        };
        const fetchImages = async () => {
            const paths = getPathsImg();
            try {
                const response = await axios.get("/api/preload-images", {
                    params: {
                        paths: JSON.stringify(paths),
                    },
                });

                const imagesPath = response?.data || [];
                setImages(imagesPath);
            } catch (error) {
                console.error("Error fetching images:", error);
            }
        };

        setStartTime(performance.now());
        fetchImages();
    }, [router.isReady]);

    const handleOnLoadingComplete = (index: number) => {
        setLoadedImages((prevLoadedImages) => new Set([...prevLoadedImages, index]));
    };

    useEffect(() => {
        if (loadedImages.size === images.length) {
            const endTime = performance.now();
            const duration = endTime - startTime;
            console.log(`All images loaded in ${duration} milliseconds`);
            setIsDonePreloadResource && setIsDonePreloadResource(true);
            router.push("/", undefined, { shallow: true });
        }
    }, [loadedImages]);

    return useMemo(() => {
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
                                unoptimized={true}
                                quality={100}
                                onLoad={() => handleOnLoadingComplete(index)}
                            />
                        ))}
                </div>
            </div>
        );
    }, [images, gameId]);
};

export default PreloadResources;
