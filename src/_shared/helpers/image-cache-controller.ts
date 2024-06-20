import axios from "axios";

export const imageCache = {};

function _arrayBufferToBase64(buffer) {
    var binary = "";
    var bytes = new Uint8Array(buffer);
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return `data:image/jpg;base64,${window.btoa(binary)}`;
}

const fetchImageBuffer = async (imageUrl: string) => {
    try {
        const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
        return response.data;
    } catch (error) {
        throw new Error("Error fetching image data: " + error);
    }
};

export const downloadAndCacheImage = async (path: string): Promise<{ path: string; valid: boolean; imageBase64: any }> => {
    let imageBase64;

    if (imageCache[path]) {
        imageBase64 = imageCache[path];
    } else {
        imageBase64 = _arrayBufferToBase64(await fetchImageBuffer(path));
        imageCache[path] = imageBase64;
    }

    return { path, imageBase64, valid: true };
};
