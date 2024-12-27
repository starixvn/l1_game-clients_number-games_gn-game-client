import { useEffect, useState } from "react";
import {
    ViewportDimensions,
    getViewportDimensions,
    calculateGameScale,
    calculateDimensions
} from "../helpers/device-helper";

const useDetectDevice = () => {
    // State management
    const [dimensions, setDimensions] = useState<ViewportDimensions>({ height: 0, width: 0 });
    const [scales, setScales] = useState({ cage: 0, game: 1 });
    const [heights, setHeights] = useState({
        result: 0,
        resultArea: 0,
        offset: 0,
    });

    // Setup resize listener
    useEffect(() => {
        let resizeTimeout: NodeJS.Timeout;

        const handleResize = () => {
            if (resizeTimeout) {
                clearTimeout(resizeTimeout);
            }

            resizeTimeout = setTimeout(() => {
                const newDimensions = getViewportDimensions();
                setDimensions((prev) => {
                    const offset = newDimensions.height - prev.height;

                    setHeights((height) => ({
                        ...height,
                        offset: height.offset === 0 && offset > 0 && offset !== newDimensions.height ? offset : height.offset,
                    }));
                    return newDimensions;
                });
            }, 100);
        };

        handleResize();

        window.visualViewport
            ? window.visualViewport.addEventListener("resize", handleResize)
            : window.addEventListener("resize", handleResize);

        return () => {
            window.visualViewport
                ? window.visualViewport.removeEventListener("resize", handleResize)
                : window.removeEventListener("resize", handleResize);

            if (resizeTimeout) {
                clearTimeout(resizeTimeout);
            }
        };
    }, []);

    // Update game scale
    useEffect(() => {
        const gameScale = calculateGameScale(dimensions);
        setScales((s) => ({ ...s, game: gameScale }));
    }, [dimensions]);

    // Update heights and cage scale
    useEffect(() => {
        const { cageScale, resultArea, result } = calculateDimensions(
            dimensions.height,
            scales.game,
            heights.offset
        );

        setScales((scale) => ({ ...scale, cage: cageScale }));
        setHeights((height) => ({ ...height, resultArea, result }));
    }, [scales.game, dimensions.height, heights.offset]);

    return {
        resultAreaHeight: heights.resultArea,
        resultHeight: heights.result,
        cageScale: scales.cage,
        gameScale: scales.game,
        offsetHeight: heights.offset,
        viewportWidth: dimensions.width,
        viewportHeight: dimensions.height,
    };
};

export default useDetectDevice;
