import { Assets, Spritesheet } from "pixi.js";
import { buildVersion } from "../constants";

const cachedAnimations = [];

export const loadPixiAnimations = async (spriteUrl: string, onLoaded: (sprite: Spritesheet) => void) => {
    if (cachedAnimations[spriteUrl] == null) {
        const sprite = await Assets.load<Spritesheet>(`${spriteUrl}?${buildVersion}`);

        cachedAnimations[spriteUrl] = sprite;
    }

    onLoaded(cachedAnimations[spriteUrl]);

    return cachedAnimations[spriteUrl];
};
