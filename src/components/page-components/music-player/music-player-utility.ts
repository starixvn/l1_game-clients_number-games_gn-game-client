type ControlMusicMeta = { audioContext: AudioContext; isPlaying: boolean; play: Function; pause?: Function };
export const controlMusic = ({ audioContext, isPlaying, play, pause }: ControlMusicMeta) => {
    const playMusic = () => {
        if (typeof play == "function") {
            if (audioContext?.state === "suspended") {
                setTimeout(() => {
                    audioContext
                        .resume()
                        .then(() => {
                            play();
                        })
                        .catch(() => {
                            play();
                        });
                }, 100); // Wait a little bit to update audio context state on Safari
            } else {
                play();
            }
        }
    };

    const pauseMusic = () => {
        if (typeof pause == "function") {
            if (document.visibilityState === "visible") {
                pause();
            } else {
                audioContext?.state !== "suspended" &&
                    audioContext
                        .suspend()
                        .then(() => {
                            pause();
                        })
                        .catch(() => {
                            pause();
                        });
            }
        }
    };

    if (audioContext) {
        isPlaying ? playMusic() : pauseMusic();
    }
};