import useSound from "use-sound";
import { StorageHelper, localStorageKeys } from "../helpers";
const path = "./static/sounds/";
const bgMusicPath = `${path}bg-music/`;

export const songList = [1, 2, 3, 4, 5, 6, 7].map((x) => `${bgMusicPath}song${x}.mp3`);

export const getRandomSong = (currentSong: string) => {
    const newSongList = songList.filter((s) => s != currentSong);
    const randomSongIndex = Math.floor(Math.random() * newSongList.length);
    return newSongList[randomSongIndex];
};

export const resourceMp3 = {
    placeBet: `${path}place-bet.mp3`,
    click: `${path}click.mp3`,
};

export const usePlaySound = (resource: string) => {
    const enable = StorageHelper.get(localStorageKeys.enableSound) ?? false;
    const [playSound] = useSound(resource, {});
    return enable ? playSound : () => {};
};

export const useClickSound = () => {
    return usePlaySound(resourceMp3.click);
};

export const usePlaceBetSound = () => {
    return usePlaySound(resourceMp3.placeBet);
};
