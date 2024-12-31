export interface ViewportDimensions {
    height: number;
    width: number;
}

export interface Heights {
    result: number;
    resultArea: number;
    offset: number;
}

export interface Scales {
    cage: number;
    game: number;
}

// Constants
export const VIEWPORT = {
    MIN_HEIGHT: 739, // iPhone 14 Pro Max
    MAX_HEIGHT: 821,
    MAX_WIDTH: 430,
    SPECIAL_ASPECT_RATIO: 0.66, // 414 / 622 (Iphone 8 Plus)
} as const;

export const GAME_DEFAULTS = {
    MIN_CAGE_SCALE: 0.48, // iPhone 14 Pro Max
    MAX_CAGE_SCALE: 0.84,
    CAGE_SIZE: 130,
    MIN_RESULT_AREA_HEIGHT: 120,
    MAX_RESULT_AREA_HEIGHT: 212,
    MIN_RESULT_HEIGHT: 70,
    MAX_RESULT_HEIGHT: 173,
    GAME_SCALE: 1,
    HEIGHTS: {
        HEADER: 32,
        COUNT_DOWN_TIMER: 50,
        BET_ZONE_CHIP_SCORE_BOARD: 455,
        BOTTOM_AREA: 85,
    },
} as const;

// Helper functions
const getTotalGameComponentsHeight = (gameScale: number): number => {
    const { HEIGHTS } = GAME_DEFAULTS;
    return HEIGHTS.HEADER + HEIGHTS.COUNT_DOWN_TIMER + HEIGHTS.BOTTOM_AREA + HEIGHTS.BET_ZONE_CHIP_SCORE_BOARD * gameScale;
};

export const getViewportDimensions = (): ViewportDimensions => ({
    height: window.visualViewport?.height ?? window.innerHeight,
    width: window.visualViewport?.width ?? window.innerWidth,
});

export const calculateGameScale = (dimensions: ViewportDimensions): number => {
    const { height, width } = dimensions;
    const aspectRatio = width / height;

    if (aspectRatio >= VIEWPORT.SPECIAL_ASPECT_RATIO) {
        const normalizedAspectRatio = aspectRatio - VIEWPORT.MAX_WIDTH / VIEWPORT.MIN_HEIGHT;
        return width / VIEWPORT.MAX_WIDTH - normalizedAspectRatio * 2;
    }

    return width !== VIEWPORT.MAX_WIDTH ? width / VIEWPORT.MAX_WIDTH : GAME_DEFAULTS.GAME_SCALE;
};

interface DimensionCalculation {
    cageScale: number;
    resultArea: number;
    result: number;
}

const calculateResultArea = (viewportHeight: number, gameScale: number): number => {
    return viewportHeight - getTotalGameComponentsHeight(gameScale);
};

const calculateCageScale = (viewportHeight: number, isSmallViewport: boolean): number => {
    const baseHeight = isSmallViewport ? VIEWPORT.MIN_HEIGHT : VIEWPORT.MAX_HEIGHT;
    const baseScale = isSmallViewport ? GAME_DEFAULTS.MIN_CAGE_SCALE : GAME_DEFAULTS.MAX_CAGE_SCALE;
    return (viewportHeight * baseScale) / baseHeight;
};

const calculateResultHeight = (cageScale: number, isSmallViewport: boolean): number => {
    if (isSmallViewport) {
        return (GAME_DEFAULTS.MIN_RESULT_HEIGHT * cageScale) / GAME_DEFAULTS.MIN_CAGE_SCALE;
    }
    return GAME_DEFAULTS.MAX_RESULT_HEIGHT * cageScale;
};

export const calculateDimensions = (viewportHeight: number, gameScale: number): DimensionCalculation => {
    if (viewportHeight === VIEWPORT.MIN_HEIGHT) {
        return {
            cageScale: GAME_DEFAULTS.MIN_CAGE_SCALE,
            resultArea: GAME_DEFAULTS.MIN_RESULT_AREA_HEIGHT,
            result: GAME_DEFAULTS.MIN_RESULT_HEIGHT,
        };
    }

    const isSmallViewport = viewportHeight < VIEWPORT.MIN_HEIGHT;
    const cageScale = calculateCageScale(viewportHeight, isSmallViewport);
    const resultArea = calculateResultArea(viewportHeight, gameScale);
    const result = calculateResultHeight(cageScale, isSmallViewport);

    return {
        cageScale,
        resultArea,
        result,
    };
};
