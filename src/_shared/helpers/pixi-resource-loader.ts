import { Assets, Spritesheet } from "pixi.js";
import getConfig from "next/config";

const cachedAnimations = [];

export const loadPixiAnimations = async (spriteUrl: string, onLoaded: (sprite: Spritesheet) => void) => {
    const { publicRuntimeConfig } = getConfig();

    if (cachedAnimations[spriteUrl] == null) {
        const sprite = await Assets.load<Spritesheet>(spriteUrl + `?${publicRuntimeConfig.versionParam}`);

        cachedAnimations[spriteUrl] = sprite;
    }

    onLoaded(cachedAnimations[spriteUrl]);

    return cachedAnimations[spriteUrl];
};
