import { useEffect, useState } from "react";

import { calculateDimensions, calculateGameScale, getViewportDimensions, ViewportDimensions } from "../helpers/device-helper";

const useDetectDevice = () => {
    // State management
    const [dimensions, setDimensions] = useState<ViewportDimensions>({ height: 0, width: 0 });
    const [scales, setScales] = useState({ cage: 0, game: 1 });
    const [heights, setHeights] = useState({
        result: 0,
        resultArea: 0,
    });

    // Setup resize listener
    useEffect(() => {
        const handleResize = () => {
            setDimensions(getViewportDimensions());
        };

        handleResize();

        window.visualViewport
            ? window.visualViewport.addEventListener("resize", handleResize)
            : window.addEventListener("resize", handleResize);

        return () => {
            window.visualViewport
                ? window.visualViewport.removeEventListener("resize", handleResize)
                : window.removeEventListener("resize", handleResize);
        };
    }, []);

    // Update game scale
    useEffect(() => {
        const gameScale = calculateGameScale(dimensions);
        setScales((s) => ({ ...s, game: gameScale }));
    }, [dimensions]);

    // Update heights and cage scale
    useEffect(() => {
        const { cageScale, resultArea, result } = calculateDimensions(dimensions.height, scales.game);

        setScales((scale) => ({ ...scale, cage: cageScale }));
        setHeights((height) => ({ ...height, resultArea, result }));
    }, [scales.game, dimensions.height]);

    return {
        resultAreaHeight: heights.resultArea,
        resultHeight: heights.result,
        cageScale: scales.cage,
        gameScale: scales.game,
        viewportWidth: dimensions.width,
        viewportHeight: dimensions.height,
    };
};

export default useDetectDevice;
