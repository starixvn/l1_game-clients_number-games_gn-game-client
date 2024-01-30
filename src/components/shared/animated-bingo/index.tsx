import { AnimatedSprite, Container, Stage } from "@pixi/react";
import { Assets, Resource, Spritesheet, Texture } from "pixi.js";
import React, { useEffect } from "react";

import Styles from "./animated-bingo.module.scss";

const AnimatedBingo = () => {
    const [playAnim, setPlayAnim] = React.useState(false);
    console.log(playAnim);
    const [cageLoopFrames, setCageLoopFrames] = React.useState<Texture<Resource>[]>([]);
    const [ballFrames, setBallFrames] = React.useState<Texture<Resource>[]>([]);
    const [drumNumberFrames, setDrumNumberFrames] = React.useState<Texture<Resource>[]>([]);

    useEffect(() => {
        const loadAndSetFrames = async (url: string, animationKey: string, setFramesCallback) => {
            const sprite = await Assets.load<Spritesheet>(url);
            setFramesCallback(sprite.animations[animationKey]);
        };

        const loadCageLoopsJson = () => {
            loadAndSetFrames("/images/animated-bingo/cage-balls.json", "loop", setCageLoopFrames);
        };

        const loadDrumBallJson = () => {
            loadAndSetFrames("/images/animated-bingo/ball.json", "blue", setBallFrames);
        };

        loadCageLoopsJson();
        loadDrumBallJson();

        // const loadDrumNumberJson = async () => {
        //   const sprite = await Assets.load<Spritesheet>(
        //     "/images/animated-bingo/drum-ball-numbers.json"
        //   );
        //   setDrumNumberFrames(sprite.animations["16"]);
        // };
        // loadDrumNumberJson();
    }, []);

    const renderButtonPlay = () => {
        return (
            <button className={Styles["button"]} onClick={() => setPlayAnim(!playAnim)}>
                {!playAnim ? "Play result" : "Reset result"}
            </button>
        );
    };

    if (cageLoopFrames.length > 0 && ballFrames.length > 0) {
        return (
            <div className={Styles["result-area"]}>
                <div className={Styles["cage"]}></div>
                <div className={Styles["cage-balls"]}>
                    {playAnim && (
                        <Stage width={130} height={130} options={{ backgroundAlpha: 0 }}>
                            <Container position={[65, 65]}>
                                <AnimatedSprite
                                    anchor={0.5}
                                    textures={cageLoopFrames}
                                    autoUpdate
                                    isPlaying={true}
                                    initialFrame={0}
                                    animationSpeed={0.6}
                                    loop={false}
                                />
                            </Container>
                        </Stage>
                    )}
                </div>
                <div className={Styles["cage-cover"]}></div>
                <div className={Styles["cage-border"]}>
                    <div className={Styles.ball}>
                        {playAnim && (
                            <Stage width={153} height={153} options={{ backgroundAlpha: 0 }}>
                                <Container position={[73, 75]}>
                                    <AnimatedSprite
                                        anchor={0.5}
                                        textures={ballFrames}
                                        autoUpdate
                                        isPlaying={true}
                                        initialFrame={0}
                                        animationSpeed={0.3}
                                        loop={false}
                                    />
                                </Container>
                            </Stage>
                        )}
                    </div>
                </div>
                {playAnim && (
                    <div className={`${Styles["number"]} ${playAnim ? Styles["show"] : Styles["hide"]}}`}>
                        {/* <Stage width={352} height={350} options={{ backgroundAlpha: 0 }}>
                            <Container position={[250, 205]}>
                                <AnimatedSprite
                                    anchor={0.5}
                                    textures={drumNumberFrames}
                                    autoUpdate
                                    isPlaying={true}
                                    initialFrame={0}
                                    animationSpeed={0.1}
                                    loop={true}
                                />
                            </Container>
                        </Stage> */}
                        <div className={Styles["number-text"]}>38</div>
                    </div>
                )}

                {renderButtonPlay()}
            </div>
        );
    } else {
        return null;
    }
};

export default AnimatedBingo;
