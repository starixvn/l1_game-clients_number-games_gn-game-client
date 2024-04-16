import axios from "axios";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { buildVersion } from "../constants";

const DEFAULT_PATH = "/static/images/preload-resources";
const PreloadResources: React.FC<{ setIsDonePreloadResource: Function }> = ({ setIsDonePreloadResource }) => {
    const [loadedImages, setLoadedImages] = useState<any>(new Set());
    const [startTime, setStartTime] = useState(null);
    const [images, setImages] = useState<string[]>([]);
    const observer = useRef<IntersectionObserver | null>(null);

    useEffect(() => {
        const fetchImages = async () => {
            try {
                const response = await axios.get("/api/preload-images");
                const imageFiles = response?.data;
                const formattedImages = imageFiles.map((file: string) => `${DEFAULT_PATH}/${file}?v=${buildVersion}`);
                setImages(formattedImages);
            } catch (error) {
                console.error("Error fetching images:", error);
            }
        };

        setStartTime(performance.now());
        fetchImages();
    }, []);

    const handleImageLoad = useCallback(
        (index: number) => {
            setLoadedImages((prevLoadedImages) => new Set([...prevLoadedImages, index]));
        },
        [setLoadedImages]
    );

    useEffect(() => {
        if (loadedImages.size === images.length) {
            const endTime = performance.now();
            const duration = endTime - startTime;
            console.log(`All images loaded in ${duration} milliseconds`);
            setIsDonePreloadResource && setIsDonePreloadResource(true);
        }
    }, [loadedImages]);

    useEffect(() => {
        observer.current = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const img = entry.target as HTMLImageElement;
                        if (img.complete) {
                            const index = images.indexOf(img.dataset.src || "");
                            handleImageLoad(index);
                        } else {
                            img.onload = () => {
                                const index = images.indexOf(img.dataset.src || "");
                                handleImageLoad(index);
                            };
                        }
                    }
                });
            },
            { rootMargin: "0px 0px 0px 0px" }
        );
    }, [images, handleImageLoad]);

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
                            ref={(el) => {
                                if (el && observer.current) {
                                    observer.current.observe(el);
                                }
                            }}
                        />
                    ))}
            </div>
        </div>
    );
};

export default PreloadResources;
