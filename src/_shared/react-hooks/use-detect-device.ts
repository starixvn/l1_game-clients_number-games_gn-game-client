import { useEffect, useState } from "react";

// Constants
const VIEWPORT = {
    MIN_HEIGHT: 739, // iPhone 14 Pro Max
    MAX_HEIGHT: 821,
    MAX_WIDTH: 430,
} as const;

const DEFAULTS = {
    MIN_CAGE_SCALE: 0.5,
    MAX_CAGE_SCALE: 0.84,
    RESULT_AREA_HEIGHT: 125,
    RESULT_HEIGHT: 90,
} as const;

interface ViewportDimensions {
    height: number;
    width: number;
}

const useDetectDevice = () => {
    // State management
    const [dimensions, setDimensions] = useState<ViewportDimensions>({ height: 0, width: 0 });
    const [scales, setScales] = useState({ cage: 0, game: 1 });
    const [heights, setHeights] = useState({
        result: 0,
        resultArea: 0,
        offset: 0,
    });

    // Get viewport dimensions
    const getViewportDimensions = (): ViewportDimensions => ({
        height: window.visualViewport?.height ?? window.innerHeight,
        width: window.visualViewport?.width ?? window.innerWidth,
    });

    // Setup resize listener
    useEffect(() => {
        const handleResize = () => {
            const newDimensions = getViewportDimensions();

            setDimensions((prev) => {
                const offset = newDimensions.height - prev.height;
                setHeights((height) => ({
                    ...height,
                    offset: offset > 0 && offset !== newDimensions.height ? offset : 0,
                }));
                return newDimensions;
            });
        };

        handleResize();
        window.visualViewport?.addEventListener("resize", handleResize);
        return () => window.visualViewport?.removeEventListener("resize", handleResize);
    }, []);

    // Calculate game scale
    const calculateGameScale = (width: number): number => {
        return width < VIEWPORT.MAX_WIDTH || width > VIEWPORT.MAX_WIDTH ? width / VIEWPORT.MAX_WIDTH : 1;
    };

    // Update game scale
    useEffect(() => {
        const gameScale = calculateGameScale(dimensions.width);
        setScales((s) => ({ ...s, game: gameScale }));
    }, [dimensions.width]);

    // Update heights and cage scale
    useEffect(() => {
        const calculateDimensions = (viewportHeight: number, gameScale: number) => {
            if (viewportHeight === VIEWPORT.MIN_HEIGHT) {
                return {
                    cageScale: DEFAULTS.MIN_CAGE_SCALE,
                    resultArea: DEFAULTS.RESULT_AREA_HEIGHT,
                    result: DEFAULTS.RESULT_HEIGHT,
                };
            }

            if (viewportHeight < VIEWPORT.MIN_HEIGHT) {
                const cageScale = (viewportHeight * DEFAULTS.MIN_CAGE_SCALE) / VIEWPORT.MIN_HEIGHT;
                const scale = Math.min(gameScale, cageScale);
                return {
                    cageScale,
                    resultArea: (DEFAULTS.RESULT_AREA_HEIGHT * scale) / DEFAULTS.MIN_CAGE_SCALE,
                    result: (DEFAULTS.RESULT_HEIGHT * scale) / DEFAULTS.MIN_CAGE_SCALE,
                };
            }

            const cageScale = (viewportHeight * DEFAULTS.MAX_CAGE_SCALE) / VIEWPORT.MAX_HEIGHT;
            const scale = Math.max(gameScale, cageScale);
            return {
                cageScale,
                resultArea: DEFAULTS.RESULT_AREA_HEIGHT * scale + heights.offset,
                result: DEFAULTS.RESULT_HEIGHT * scale + heights.offset,
            };
        };

        const { cageScale, resultArea, result } = calculateDimensions(dimensions.height, scales.game);
        setScales((scale) => ({ ...scale, cage: cageScale }));
        setHeights((height) => ({ ...height, resultArea, result }));
    }, [scales.game, dimensions.height, heights.offset]);

    return {
        resultAreaHeight: heights.resultArea,
        resultHeight: heights.result,
        cageScale: scales.cage,
        gameScale: scales.game,
        offsetHeight: heights.offset,
    };
};

export default useDetectDevice;
