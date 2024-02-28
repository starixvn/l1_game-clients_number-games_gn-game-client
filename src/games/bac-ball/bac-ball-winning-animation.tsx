import { AnimatedSprite, Container, Stage } from "@pixi/react";
import { Resource, Texture } from "pixi.js";
import { useEffect, useState } from "react";

import { loadPixiAnimations } from "../../_shared/helpers/pixi-resource-loader";
import { useWinningHighLightResult } from "../../_shared/react-hooks/use-high-light";

type Props = {
    choice: string;
    resourceName: string;
    width: number;
    height: number;
    position: [number, number];
};

export const BacBallWinningAnimation: React.FC<Props> = ({ choice, resourceName, width, height, position }) => {
    const [winningFrames, setWinningFrames] = useState<Texture<Resource>[]>([]);
    const winningHighLightResult = useWinningHighLightResult;

    useEffect(() => {
        if (winningFrames?.length === 0) {
            const handleLoadResource = async () => {
                await loadPixiAnimations(`/static/images/bac-number/highlight-winning-${resourceName}.json`, (sprite) => {
                    setWinningFrames((playerFrames) => (playerFrames = sprite.animations[`highlight-winning-${resourceName}`]));
                });
            };

            handleLoadResource();
        }
    }, [resourceName]);

    return (
        winningHighLightResult({ betChoice: choice }) &&
        winningFrames?.length > 0 && (
            <Stage width={width} height={height} options={{ backgroundAlpha: 0 }}>
                <Container position={position}>
                    <AnimatedSprite
                        anchor={0.5}
                        textures={winningFrames}
                        autoUpdate
                        isPlaying={true}
                        initialFrame={0}
                        animationSpeed={0.3}
                        loop={true}
                    />
                </Container>
            </Stage>
        )
    );
};
