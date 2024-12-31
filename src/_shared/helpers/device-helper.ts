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

// Constants moved from use-detect-device.ts
export const VIEWPORT = {
    MIN_HEIGHT: 739, // iPhone 14 Pro Max
    MAX_HEIGHT: 821,
    MAX_WIDTH: 430,
    SPECIAL_ASPECT_RATIO: 0.66, // 414 / 622 (Iphone 8 Plus)
} as const;

export const GAME_DEFAULTS = {
    MIN_CAGE_SCALE: 0.5, // iPhone 14 Pro Max
    MAX_CAGE_SCALE: 0.84,
    CAGE_SIZE: 130,
    MIN_RESULT_AREA_HEIGHT: 120,
    MAX_RESULT_AREA_HEIGHT: 212,
    MIN_RESULT_HEIGHT: 80,
    MAX_RESULT_HEIGHT: 173,
    GAME_SCALE: 1,
    GAME_HEADER_HEIGHT: 32,
    GAME_COUNT_DOWN_TIMER_HEIGHT: 50,
    GAME_BET_ZONE_CHIP_SCORE_BOARD_HEIGHT: 432,
    GAME_BOTTOM_AREA_HEIGHT: 85,
} as const;

export const getViewportDimensions = (): ViewportDimensions => ({
    height: window.visualViewport?.height ?? window.innerHeight,
    width: window.visualViewport?.width ?? window.innerWidth,
});

export const calculateGameScale = (dimensions: ViewportDimensions): number => {
    const { height, width } = dimensions;

    if (width / height >= VIEWPORT.SPECIAL_ASPECT_RATIO) {
        return width / VIEWPORT.MAX_WIDTH - (width / height - VIEWPORT.MAX_WIDTH / VIEWPORT.MIN_HEIGHT) * 2;
    }

    return width < VIEWPORT.MAX_WIDTH || width > VIEWPORT.MAX_WIDTH ? width / VIEWPORT.MAX_WIDTH : 1;
};

const getDefaultDimensions = () => ({
    cageScale: GAME_DEFAULTS.MIN_CAGE_SCALE,
    resultArea: GAME_DEFAULTS.MIN_RESULT_AREA_HEIGHT,
    result: GAME_DEFAULTS.MIN_RESULT_HEIGHT,
});

const calculateSmallViewportDimensions = (viewportHeight: number, gameScale: number) => {
    const cageScale = (viewportHeight * GAME_DEFAULTS.MIN_CAGE_SCALE) / VIEWPORT.MIN_HEIGHT;
    const scale = Math.min(gameScale, cageScale);
    const resultArea =
        viewportHeight -
        GAME_DEFAULTS.GAME_HEADER_HEIGHT -
        GAME_DEFAULTS.GAME_COUNT_DOWN_TIMER_HEIGHT -
        GAME_DEFAULTS.GAME_BOTTOM_AREA_HEIGHT -
        GAME_DEFAULTS.GAME_BET_ZONE_CHIP_SCORE_BOARD_HEIGHT * gameScale;

    const result = resultArea * cageScale;

    return {
        cageScale,
        resultArea,
        result,
    };

    // return {
    //     cageScale,
    //     resultArea: (GAME_DEFAULTS.MIN_RESULT_AREA_HEIGHT * scale) / GAME_DEFAULTS.MIN_CAGE_SCALE,
    //     result: (GAME_DEFAULTS.MIN_RESULT_HEIGHT * scale) / GAME_DEFAULTS.MIN_CAGE_SCALE,
    // };
};

const calculateLargeViewportDimensions = (viewportHeight: number, gameScale: number, currentOffset: number) => {
    const cageScale = (viewportHeight * GAME_DEFAULTS.MAX_CAGE_SCALE) / VIEWPORT.MAX_HEIGHT;
    const scale = Math.max(gameScale, cageScale);
    // const resultArea = GAME_DEFAULTS.MIN_RESULT_AREA_HEIGHT * scale + currentOffset;
    // const result = GAME_DEFAULTS.MIN_RESULT_HEIGHT * scale + currentOffset;

    const resultArea =
        viewportHeight -
        GAME_DEFAULTS.GAME_HEADER_HEIGHT -
        GAME_DEFAULTS.GAME_COUNT_DOWN_TIMER_HEIGHT -
        GAME_DEFAULTS.GAME_BOTTOM_AREA_HEIGHT -
        GAME_DEFAULTS.GAME_BET_ZONE_CHIP_SCORE_BOARD_HEIGHT * gameScale;
    const result = Math.min(resultArea * scale, GAME_DEFAULTS.CAGE_SIZE);

    return {
        cageScale,
        resultArea,
        result,
    };
};

export const calculateDimensions = (
    viewportHeight: number,
    gameScale: number,
    currentOffset: number
): { cageScale: number; resultArea: number; result: number } => {
    if (viewportHeight === VIEWPORT.MIN_HEIGHT) {
        return getDefaultDimensions();
    }

    if (viewportHeight < VIEWPORT.MIN_HEIGHT) {
        return calculateSmallViewportDimensions(viewportHeight, gameScale);
    }

    return calculateLargeViewportDimensions(viewportHeight, gameScale, currentOffset);
};
