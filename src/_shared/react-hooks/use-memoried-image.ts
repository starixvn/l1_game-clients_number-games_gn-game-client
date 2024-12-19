import { useEffect, useState } from "react";
import { downloadAndCacheImage } from "../helpers/image-cache-controller";

export const useMemoriedImage = (path: string) => {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const isLoaded = !isLoading && data;

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const { imageBase64, valid } = await downloadAndCacheImage(path);
                if (!valid) {
                    throw new Error("Network response was not ok");
                }
                setData(imageBase64);
            } catch (error) {
                setError(error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
        return () => {};
    }, [path]);

    return { data, isLoading, error, isLoaded };
};
