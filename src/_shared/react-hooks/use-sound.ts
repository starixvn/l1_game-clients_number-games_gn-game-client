import useSound from "use-sound";
import { StorageHelper, localStorageKeys, objectMap } from "../helpers";
export const path = "./static/sounds/";

const mp3File = {
    placeBet: `place-bet`,
    click: `click`,
    startingRound: `starting-round`,
    receiveFinish: `receive-finish`,
};

const resourceMp3 = objectMap(mp3File, (v) => `${path}${v}.mp3`);

export const usePlaySound = (resource: string) => {
    const [playSound] = useSound(resource, {});
    return () => {
        const enable = StorageHelper.get(localStorageKeys.enableSound) ?? false;
        enable && playSound();
    };
};

export const useClickSound = () => {
    return usePlaySound(resourceMp3.click);
};

export const usePlaceBetSound = () => {
    return usePlaySound(resourceMp3.placeBet);
};

export const useStartRoundSound = () => {
    return usePlaySound(resourceMp3.startingRound);
};

export const useReceiveFinishSound = () => {
    return usePlaySound(resourceMp3.receiveFinish);
};
