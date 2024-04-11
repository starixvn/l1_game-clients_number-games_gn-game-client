import { buildVersion } from "../constants";
import { objectMap } from "../helpers";
import { path as soundsPath, usePlaySound } from "./use-sound";
const path = `${soundsPath}betting/`;

const mp3File = {
    startBetting: `start-betting`,
    stopBetting: `stop-betting`,
};

const resourceMp3 = objectMap(mp3File, (v) => `${path}${v}`);

export const useStartBettingSound = (locale: string) => {
    const fileName = `${resourceMp3.startBetting}_${locale}.mp3?v=${buildVersion}`;
    return usePlaySound(fileName);
};

export const useStopBettingSound = (locale: string) => {
    const fileName = `${resourceMp3.stopBetting}_${locale}.mp3?v=${buildVersion}`;
    return usePlaySound(fileName);
};
