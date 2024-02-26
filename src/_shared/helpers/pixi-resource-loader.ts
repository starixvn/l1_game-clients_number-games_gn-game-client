import { Assets, Spritesheet } from "pixi.js";

const cachedAnimations = [];

export const loadPixiAnimations = async (spriteUrl: string, onLoaded: (sprite: Spritesheet) => void) => {
    if (cachedAnimations[spriteUrl] == null) {
        const sprite = await Assets.load<Spritesheet>(spriteUrl);

        cachedAnimations[spriteUrl] = sprite;
        console.log(spriteUrl);
    }

    onLoaded(cachedAnimations[spriteUrl]);

    return cachedAnimations[spriteUrl];
};
