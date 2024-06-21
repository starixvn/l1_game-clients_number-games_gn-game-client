import { useEffect, useState } from "react";
import { downloadAndCacheImage, imageCache } from "../../../_shared/helpers/image-cache-controller";
import Image from "next/image";

type Props = {
    src: string;
    blurSrc: string;
    alt: string;
    width?: number;
    height?: number;
    priority?: boolean;
    className?: string;
};

export const CachedImage: React.FC<Props> = ({ src, blurSrc, alt, width, height, priority, className }) => {
    const [source, setSource] = useState(imageCache[src]);

    useEffect(() => {
        const loadImage = async () => {
            const result = await downloadAndCacheImage(src);
            setSource(result.imageBase64);
        };
        if (!source) {
            loadImage();
        }
    }, []);

    return <Image className={className} src={source || blurSrc} width={width} height={height} alt={alt} priority={priority} />;
};
