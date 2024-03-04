import useSound from "use-sound";
import { StorageHelper, localStorageKeys } from "../helpers";
export const resourceMp3 = {
    placeBet: "./static/sounds/place-bet.mp3",
    clickChip: "./static/sounds/chip-click.mp3",
};

export const usePlaySound = (resource: string) => {
    const enable = StorageHelper.get(localStorageKeys.enableSound) ?? false;
    const [playSound] = useSound(resource, {});
    return enable ? playSound : () => {};
};

export const useChipClickSound = () => {
    return usePlaySound(resourceMp3.clickChip);
};
