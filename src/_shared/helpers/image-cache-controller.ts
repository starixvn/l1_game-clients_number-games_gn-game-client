import axios from "axios";
import "./string-helper";

export const imageCache: Record<string, string> = {};

const fetchImageBase64 = async (imageUrl: string) => {
    try {
        imageUrl = imageUrl.appendBuildVersion();
        const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
        const image = btoa(new Uint8Array(response.data).reduce((data, byte) => data + String.fromCharCode(byte), ""));
        return `data:${response.headers["content-type"].toLowerCase()};base64,${image}`;
    } catch (error) {
        throw new Error("Error fetching image data: " + error);
    }
};

export const downloadAndCacheImage = async (path: string): Promise<{ path: string; valid: boolean; imageBase64: string }> => {
    let imageBase64: string;
    path = path.removeBuildVersion();

    if (imageCache[path]) {
        imageBase64 = imageCache[path];
    } else {
        imageBase64 = await fetchImageBase64(path);
        imageCache[path] = imageBase64;
    }

    return { path, imageBase64, valid: true };
};
