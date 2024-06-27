export const controlMusic = (audioContext: AudioContext, isPlaying: boolean, play: Function, pause: Function) => {
    const playMusic = () => {
        if (typeof play == 'function') {
            if (audioContext?.state !== "running") {
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
    }

    const pauseMusic = () => {
        if (typeof pause == 'function') {
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

    if (audioContext) {
        isPlaying ? playMusic() : pauseMusic();
    }
}