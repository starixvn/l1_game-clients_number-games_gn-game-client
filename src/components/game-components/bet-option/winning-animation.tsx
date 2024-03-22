import { AnimatedSprite, Container, Stage } from "@pixi/react";
import { Resource, Texture } from "pixi.js";
import { useEffect, useState } from "react";
import Styles from "./main-bet-option.module.scss";
import { useWinningHighLightResult } from "../../../_shared/react-hooks/use-high-light";

type Props = {
    choice: string;
    resourceName: string;
    width: number;
    height: number;
    position: [number, number];
    className?: string;
};

export const WinningAnimation: React.FC<Props> = ({ choice, resourceName, width, height, position, className }) => {
    const [winningFrames, setWinningFrames] = useState<Texture<Resource>[]>([]);
    const winningHighLightResult = useWinningHighLightResult;

    useEffect(() => {
        if (winningFrames?.length === 0) {
            const handleLoadResource = async () => {
                // await loadPixiAnimations(`/static/images/bac-number/highlight-winning-${resourceName}.json`, (sprite) => {
                //     setWinningFrames((playerFrames) => (playerFrames = sprite.animations[`highlight-winning-${resourceName}`]));
                // });
            };

            handleLoadResource();
        }
    }, [resourceName]);

    return (
        winningHighLightResult({ betChoice: choice }) &&
        winningFrames?.length > 0 && (
            <div className="d-grid">
                <Stage
                    width={width}
                    height={height}
                    options={{ backgroundAlpha: 0, antialias: false, powerPreference: "low-power" }}
                    className={className}
                >
                    <Container position={position}>
                        <AnimatedSprite
                            anchor={0.5}
                            textures={winningFrames}
                            autoUpdate
                            isPlaying={true}
                            initialFrame={0}
                            animationSpeed={0.29}
                            loop={true}
                        />
                    </Container>
                </Stage>

                <div className={Styles[`winning-${choice}`]}></div>
            </div>
        )
    );
};
