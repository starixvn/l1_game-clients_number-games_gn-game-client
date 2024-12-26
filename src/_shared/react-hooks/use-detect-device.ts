import { useEffect, useState } from "react";
import { isAndroid } from "react-device-detect";

// Constants
export const VIEWPORT = {
    MIN_HEIGHT: 739, // iPhone 14 Pro Max
    MAX_HEIGHT: 821,
    MAX_WIDTH: 430,
} as const;

export const GAME_DEFAULTS = {
    MIN_CAGE_SCALE: 0.5,
    MAX_CAGE_SCALE: 0.84,
    MIN_RESULT_AREA_HEIGHT: 120,
    MAX_RESULT_AREA_HEIGHT: 212,
    MIN_RESULT_HEIGHT: 80,
    MAX_RESULT_HEIGHT: 173,
    GAME_SCALE: 1,
} as const;

interface ViewportDimensions {
    height: number;
    width: number;
}

const useDetectDevice = () => {
    // State management
    const [dimensions, setDimensions] = useState<ViewportDimensions>({ height: 0, width: 0 });
    const [prevDimensions, setPrevDimensions] = useState(0);
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
        let resizeTimeout: NodeJS.Timeout;

        const handleResize = () => {
            // Clear any existing timeout
            if (resizeTimeout) {
                clearTimeout(resizeTimeout);
            }

            // Set new timeout to update dimensions
            resizeTimeout = setTimeout(() => {
                const newDimensions = getViewportDimensions();
                setPrevDimensions(dimensions.height);
                setDimensions((prev) => {
                    const offset = newDimensions.height - prev.height;

                    // Only set offset if it's greater than 0 and hasn't been set before
                    setHeights((height) => ({
                        ...height,
                        offset: height.offset === 0 && offset > 0 && offset !== newDimensions.height ? offset : height.offset,
                    }));
                    return newDimensions;
                });
            }, 100); // 100ms delay to allow viewport to settle
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

    // Calculate game scale
    const calculateGameScale = (width: number): number => {
        return width < VIEWPORT.MAX_WIDTH || width > VIEWPORT.MAX_WIDTH ? width / VIEWPORT.MAX_WIDTH : 1;
    };

    // Update game scale
    useEffect(() => {
        const gameScale = calculateGameScale(dimensions.width);
        setScales((s) => ({ ...s, game: gameScale }));
    }, [dimensions?.width]);

    // Update heights and cage scale
    useEffect(() => {
        const calculateDimensions = (viewportHeight: number, gameScale: number) => {
            if (viewportHeight === VIEWPORT.MIN_HEIGHT) {
                return {
                    cageScale: GAME_DEFAULTS.MIN_CAGE_SCALE,
                    resultArea: GAME_DEFAULTS.MIN_RESULT_AREA_HEIGHT,
                    result: GAME_DEFAULTS.MIN_RESULT_HEIGHT,
                };
            }

            if (viewportHeight < VIEWPORT.MIN_HEIGHT) {
                const cageScale = (viewportHeight * GAME_DEFAULTS.MIN_CAGE_SCALE) / VIEWPORT.MIN_HEIGHT;
                const scale = Math.min(gameScale, cageScale);
                return {
                    cageScale,
                    resultArea: (GAME_DEFAULTS.MIN_RESULT_AREA_HEIGHT * scale) / GAME_DEFAULTS.MIN_CAGE_SCALE,
                    result: (GAME_DEFAULTS.MIN_RESULT_HEIGHT * scale) / GAME_DEFAULTS.MIN_CAGE_SCALE,
                };
            }

            const cageScale = (viewportHeight * GAME_DEFAULTS.MAX_CAGE_SCALE) / VIEWPORT.MAX_HEIGHT;
            const scale = Math.max(gameScale, cageScale);

            if (isAndroid) {
                if (viewportHeight > VIEWPORT.MIN_HEIGHT && viewportHeight < VIEWPORT.MAX_HEIGHT) {
                    setHeights((height) => ({
                        ...height,
                        offset: viewportHeight - VIEWPORT.MIN_HEIGHT + (VIEWPORT.MAX_HEIGHT - viewportHeight),
                    }));
                }

                const resultArea = GAME_DEFAULTS.MIN_RESULT_AREA_HEIGHT * scale + heights.offset;

                return {
                    cageScale,
                    resultArea: resultArea,
                    result: GAME_DEFAULTS.MIN_RESULT_HEIGHT * scale + heights.offset,
                };
            }

            const resultArea = GAME_DEFAULTS.MIN_RESULT_AREA_HEIGHT * scale + heights.offset;
            const result = GAME_DEFAULTS.MIN_RESULT_HEIGHT * scale + heights.offset;

            return {
                cageScale,
                resultArea: resultArea,
                result: result,
            };

            // return {
            //     cageScale,
            //     resultArea: resultArea > GAME_DEFAULTS.MAX_RESULT_AREA_HEIGHT ? GAME_DEFAULTS.MAX_RESULT_AREA_HEIGHT : resultArea,
            //     result: result > GAME_DEFAULTS.MAX_RESULT_HEIGHT ? GAME_DEFAULTS.MAX_RESULT_AREA_HEIGHT : result,
            // };
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
        height: dimensions.height,
        width: dimensions.width,
        prevHeight: prevDimensions,
    };
};

export default useDetectDevice;
