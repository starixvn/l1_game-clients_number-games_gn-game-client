import { path as soundsPath } from "./use-sound";

const path = `${soundsPath}bg-music/`;

export const songList = [1, 2, 3, 4, 5, 6, 7].map((x) => `${path}song${x}.mp3`);

export const getRandomSong = (currentSong: string) => {
    const newSongList = songList.filter((s) => s != currentSong);
    const randomSongIndex = Math.floor(Math.random() * newSongList.length);
    return newSongList[randomSongIndex];
};
