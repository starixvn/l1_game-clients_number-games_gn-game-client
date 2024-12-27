import { describe, it, expect, beforeEach } from '@jest/globals';
import { deviceInfo } from '../device-detect-wrapper';
import {
    VIEWPORT,
    GAME_DEFAULTS,
    getViewportDimensions,
    calculateGameScale,
    calculateDimensions,
    ViewportDimensions
} from '../device-helper';

jest.mock('../device-detect-wrapper', () => ({
    deviceInfo: {
        isAndroid: false,
        isIOS: false
    }
}));

describe('device-helper', () => {
    describe('getViewportDimensions', () => {
        beforeEach(() => {
            Object.defineProperty(window, 'visualViewport', {
                value: undefined,
                writable: true
            });
            Object.defineProperty(window, 'innerHeight', {
                value: 800,
                writable: true
            });
            Object.defineProperty(window, 'innerWidth', {
                value: 400,
                writable: true
            });
        });

        it('should use visualViewport when available', () => {
            Object.defineProperty(window, 'visualViewport', {
                value: {
                    height: 750,
                    width: 375
                },
                writable: true
            });

            const dimensions = getViewportDimensions();
            expect(dimensions).toEqual({ height: 750, width: 375 });
        });

        it('should fallback to innerHeight/innerWidth when visualViewport is not available', () => {
            const dimensions = getViewportDimensions();
            expect(dimensions).toEqual({ height: 800, width: 400 });
        });
    });

    describe('calculateGameScale', () => {
        const testCases = [
            {
                description: 'should calculate scale when width/height ratio >= SPECIAL_ASPECT_RATIO',
                dimensions: { width: 414, height: 622 }, // ratio = 0.66
                expected: 414 / VIEWPORT.MAX_WIDTH - (414 / 622 - VIEWPORT.MAX_WIDTH / VIEWPORT.MIN_HEIGHT) * 2
            },
            {
                description: 'should return width/MAX_WIDTH when width < MAX_WIDTH',
                dimensions: { width: 375, height: 800 },
                expected: 375 / VIEWPORT.MAX_WIDTH
            },
            {
                description: 'should return width/MAX_WIDTH when width > MAX_WIDTH',
                dimensions: { width: 500, height: 800 },
                expected: 500 / VIEWPORT.MAX_WIDTH
            },
            {
                description: 'should return 1 when width equals MAX_WIDTH',
                dimensions: { width: VIEWPORT.MAX_WIDTH, height: 800 },
                expected: 1
            }
        ];

        testCases.forEach(({ dimensions, expected, description }) => {
            it(description, () => {
                const result = calculateGameScale(dimensions);
                expect(result).toBeCloseTo(expected, 5);
            });
        });
    });

    describe('calculateDimensions', () => {
        describe('when viewportHeight equals MIN_HEIGHT', () => {
            it('should return default values', () => {
                const result = calculateDimensions(VIEWPORT.MIN_HEIGHT, 1, 0);
                expect(result).toEqual({
                    cageScale: GAME_DEFAULTS.MIN_CAGE_SCALE,
                    resultArea: GAME_DEFAULTS.MIN_RESULT_AREA_HEIGHT,
                    result: GAME_DEFAULTS.MIN_RESULT_HEIGHT
                });
            });
        });

        describe('when viewportHeight < MIN_HEIGHT', () => {
            it('should calculate scaled values with gameScale < cageScale', () => {
                const viewportHeight = VIEWPORT.MIN_HEIGHT - 100;
                const gameScale = 0.3;
                const result = calculateDimensions(viewportHeight, gameScale, 0);

                const expectedCageScale = (viewportHeight * GAME_DEFAULTS.MIN_CAGE_SCALE) / VIEWPORT.MIN_HEIGHT;
                const scale = Math.min(gameScale, expectedCageScale);

                expect(result).toEqual({
                    cageScale: expectedCageScale,
                    resultArea: (GAME_DEFAULTS.MIN_RESULT_AREA_HEIGHT * scale) / GAME_DEFAULTS.MIN_CAGE_SCALE,
                    result: (GAME_DEFAULTS.MIN_RESULT_HEIGHT * scale) / GAME_DEFAULTS.MIN_CAGE_SCALE
                });
            });

            it('should calculate scaled values with gameScale > cageScale', () => {
                const viewportHeight = VIEWPORT.MIN_HEIGHT - 100;
                const gameScale = 0.8;
                const result = calculateDimensions(viewportHeight, gameScale, 0);

                const expectedCageScale = (viewportHeight * GAME_DEFAULTS.MIN_CAGE_SCALE) / VIEWPORT.MIN_HEIGHT;
                const scale = Math.min(gameScale, expectedCageScale);

                expect(result).toEqual({
                    cageScale: expectedCageScale,
                    resultArea: (GAME_DEFAULTS.MIN_RESULT_AREA_HEIGHT * scale) / GAME_DEFAULTS.MIN_CAGE_SCALE,
                    result: (GAME_DEFAULTS.MIN_RESULT_HEIGHT * scale) / GAME_DEFAULTS.MIN_CAGE_SCALE
                });
            });
        });

        describe('when viewportHeight > MIN_HEIGHT', () => {
            const viewportHeight = VIEWPORT.MIN_HEIGHT + 100;
            const gameScale = 0.9;
            const offset = 50;

            it('should calculate dimensions with gameScale < cageScale', () => {
                const smallGameScale = 0.5;
                const result = calculateDimensions(viewportHeight, smallGameScale, offset);

                const expectedCageScale = (viewportHeight * GAME_DEFAULTS.MAX_CAGE_SCALE) / VIEWPORT.MAX_HEIGHT;
                const scale = Math.max(smallGameScale, expectedCageScale);

                expect(result).toEqual({
                    cageScale: expectedCageScale,
                    resultArea: GAME_DEFAULTS.MIN_RESULT_AREA_HEIGHT * scale + offset,
                    result: GAME_DEFAULTS.MIN_RESULT_HEIGHT * scale + offset
                });
            });

            it('should calculate dimensions with gameScale > cageScale', () => {
                const largeGameScale = 1.2;
                const result = calculateDimensions(viewportHeight, largeGameScale, offset);

                const expectedCageScale = (viewportHeight * GAME_DEFAULTS.MAX_CAGE_SCALE) / VIEWPORT.MAX_HEIGHT;
                const scale = Math.max(largeGameScale, expectedCageScale);

                expect(result).toEqual({
                    cageScale: expectedCageScale,
                    resultArea: GAME_DEFAULTS.MIN_RESULT_AREA_HEIGHT * scale + offset,
                    result: GAME_DEFAULTS.MIN_RESULT_HEIGHT * scale + offset
                });
            });

            it('should calculate dimensions with zero offset', () => {
                const result = calculateDimensions(viewportHeight, gameScale, 0);

                const expectedCageScale = (viewportHeight * GAME_DEFAULTS.MAX_CAGE_SCALE) / VIEWPORT.MAX_HEIGHT;
                const scale = Math.max(gameScale, expectedCageScale);

                expect(result).toEqual({
                    cageScale: expectedCageScale,
                    resultArea: GAME_DEFAULTS.MIN_RESULT_AREA_HEIGHT * scale,
                    result: GAME_DEFAULTS.MIN_RESULT_HEIGHT * scale
                });
            });
        });
    });
});