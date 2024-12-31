import { calculateDimensions, calculateGameScale, GAME_DEFAULTS, getViewportDimensions, VIEWPORT } from "../device-helper";

describe("device-helper", () => {
    describe("getViewportDimensions", () => {
        const originalVisualViewport = window.visualViewport;
        const originalInnerHeight = window.innerHeight;
        const originalInnerWidth = window.innerWidth;

        beforeEach(() => {
            window.visualViewport = undefined;
            window.innerHeight = 800;
            window.innerWidth = 400;
        });

        afterEach(() => {
            window.visualViewport = originalVisualViewport;
            window.innerHeight = originalInnerHeight;
            window.innerWidth = originalInnerWidth;
        });

        it("should use visualViewport when available", () => {
            // Arrange
            window.visualViewport = {
                height: 900,
                width: 450,
            } as VisualViewport;

            // Act
            const dimensions = getViewportDimensions();

            // Assert
            expect(dimensions).toEqual({ height: 900, width: 450 });
        });

        it("should fallback to inner dimensions when visualViewport is not available", () => {
            // Act
            const dimensions = getViewportDimensions();

            // Assert
            expect(dimensions).toEqual({ height: 800, width: 400 });
        });
    });

    describe("calculateGameScale", () => {
        it("should handle special aspect ratio case", () => {
            // Arrange
            const dimensions = { width: 414, height: 622 }; // Special aspect ratio case

            // Act
            const scale = calculateGameScale(dimensions);

            // Assert
            const aspectRatio = dimensions.width / dimensions.height;
            const normalizedAspectRatio = aspectRatio - VIEWPORT.MAX_WIDTH / VIEWPORT.MIN_HEIGHT;
            const expected = dimensions.width / VIEWPORT.MAX_WIDTH - normalizedAspectRatio * 2;
            expect(scale).toBe(expected);
        });

        it("should return 1 when width equals MAX_WIDTH", () => {
            // Arrange
            const dimensions = { width: VIEWPORT.MAX_WIDTH, height: VIEWPORT.MIN_HEIGHT };

            // Act
            const scale = calculateGameScale(dimensions);

            // Assert
            expect(scale).toBe(GAME_DEFAULTS.GAME_SCALE);
        });

        it("should calculate scale for non-standard width", () => {
            // Arrange
            const dimensions = { width: VIEWPORT.MAX_WIDTH - 50, height: VIEWPORT.MIN_HEIGHT };

            // Act
            const scale = calculateGameScale(dimensions);

            // Assert
            expect(scale).toBe((VIEWPORT.MAX_WIDTH - 50) / VIEWPORT.MAX_WIDTH);
        });
    });

    describe("calculateDimensions", () => {
        it("should return default dimensions for MIN_HEIGHT", () => {
            // Arrange
            const viewportHeight = VIEWPORT.MIN_HEIGHT;
            const gameScale = 1;

            // Act
            const dimensions = calculateDimensions(viewportHeight, gameScale);

            // Assert
            expect(dimensions).toEqual({
                cageScale: GAME_DEFAULTS.MIN_CAGE_SCALE,
                resultArea: GAME_DEFAULTS.MIN_RESULT_AREA_HEIGHT,
                result: GAME_DEFAULTS.MIN_RESULT_HEIGHT,
            });
        });

        it("should calculate dimensions for small viewport", () => {
            // Arrange
            const viewportHeight = VIEWPORT.MIN_HEIGHT - 100;
            const gameScale = 1;

            // Act
            const dimensions = calculateDimensions(viewportHeight, gameScale);

            // Assert
            const expectedCageScale = (viewportHeight * GAME_DEFAULTS.MIN_CAGE_SCALE) / VIEWPORT.MIN_HEIGHT;
            const expectedResultArea =
                viewportHeight -
                (GAME_DEFAULTS.HEIGHTS.HEADER +
                    GAME_DEFAULTS.HEIGHTS.COUNT_DOWN_TIMER +
                    GAME_DEFAULTS.HEIGHTS.BOTTOM_AREA +
                    GAME_DEFAULTS.HEIGHTS.BET_ZONE_CHIP_SCORE_BOARD * gameScale);
            const expectedResult = (GAME_DEFAULTS.MIN_RESULT_HEIGHT * expectedCageScale) / GAME_DEFAULTS.MIN_CAGE_SCALE;

            expect(dimensions).toEqual({
                cageScale: expectedCageScale,
                resultArea: expectedResultArea,
                result: expectedResult,
            });
        });

        it("should calculate dimensions for large viewport", () => {
            // Arrange
            const viewportHeight = VIEWPORT.MAX_HEIGHT + 100;
            const gameScale = 1;

            // Act
            const dimensions = calculateDimensions(viewportHeight, gameScale);

            // Assert
            const expectedCageScale = (viewportHeight * GAME_DEFAULTS.MAX_CAGE_SCALE) / VIEWPORT.MAX_HEIGHT;
            const expectedResultArea =
                viewportHeight -
                (GAME_DEFAULTS.HEIGHTS.HEADER +
                    GAME_DEFAULTS.HEIGHTS.COUNT_DOWN_TIMER +
                    GAME_DEFAULTS.HEIGHTS.BOTTOM_AREA +
                    GAME_DEFAULTS.HEIGHTS.BET_ZONE_CHIP_SCORE_BOARD * gameScale);
            const expectedResult = GAME_DEFAULTS.MAX_RESULT_HEIGHT * expectedCageScale;

            expect(dimensions).toEqual({
                cageScale: expectedCageScale,
                resultArea: expectedResultArea,
                result: expectedResult,
            });
        });
    });
});
