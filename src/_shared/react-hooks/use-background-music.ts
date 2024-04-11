import { path as soundsPath } from "./use-sound";

const path = `${soundsPath}bg-music/`;

const initSongs = (n): number[] => {
    const songs: number[] = [];
    for (let i = 1; i <= n; i++) {
        songs.push(i);
    }
    return songs;
};

// export const songList = initSongs(1).map((x) => `${path}song${x}.mp3`);
export const songList = ["./static/sounds/bg-music/song2.mp3"];

export const getRandomSong = (currentSong: string) => {
    const newSongList = songList.filter((s) => s !== currentSong);
    const randomSongIndex = Math.floor(Math.random() * newSongList.length);
    return newSongList[randomSongIndex];
};
