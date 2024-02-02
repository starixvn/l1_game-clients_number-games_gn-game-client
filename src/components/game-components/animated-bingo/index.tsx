import { AnimatedSprite, Container, Stage } from "@pixi/react";
import { Assets, Resource, Spritesheet, Texture } from "pixi.js";
import React, { useEffect } from "react";

import Styles from "./animated-bingo.module.scss";

const AnimatedBingo = () => {
    const [cageLoopFrames, setCageLoopFrames] = React.useState<Texture<Resource>[]>([]);

    useEffect(() => {
        const loadAndSetFrames = async (url: string, animationKey: string, setFramesCallback) => {
            const sprite = await Assets.load<Spritesheet>(url);
            setFramesCallback(sprite.animations[animationKey]);
        };

        const loadCageLoopsJson = () => {
            loadAndSetFrames("/static/images/animated-bingo/cage-balls.json", "loop", setCageLoopFrames);
        };

        loadCageLoopsJson();
    }, []);

    if (cageLoopFrames && cageLoopFrames.length > 0) {
        return (
            <div className={`${Styles["cage-area"]}`}>
                <div className={Styles["cage-bg"]}></div>
                <div className={Styles["cage-balls"]}>
                    <Stage width={130} height={130} options={{ backgroundAlpha: 0 }}>
                        <Container position={[65, 65]}>
                            <AnimatedSprite
                                anchor={0.5}
                                textures={cageLoopFrames}
                                autoUpdate
                                isPlaying={true}
                                initialFrame={0}
                                animationSpeed={0.6}
                                loop={true}
                            />
                        </Container>
                    </Stage>
                </div>
                <div className={Styles["cage-cover"]}></div>
                <div className={`${Styles["cage-border"]} ${Styles["purple"]}`}></div>
            </div>
        );
    } else {
        return null;
    }
};

export default AnimatedBingo;
