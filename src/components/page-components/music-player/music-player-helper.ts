export const controlMusic = (ctx: Howl, isPlaying: boolean, play: Function, pause: Function) => {
    const playMusic = (audioContext: AudioContext) => {
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
                }, 100)

            } else {
                play();
            }
        }
    }

    const pauseMusic = (audioContext: AudioContext) => {
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

    if (ctx) {
        const audioContext: AudioContext = (ctx as any)._sounds[0]._node.context;
        isPlaying ? playMusic(audioContext) : pauseMusic(audioContext);
    }
}