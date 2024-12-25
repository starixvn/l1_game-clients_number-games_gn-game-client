import { renderHook, act } from '@testing-library/react';
import useDetectDevice from '../use-detect-device';

describe('useDetectDevice', () => {
    const originalVisualViewport = window.visualViewport;
    let mockVisualViewport: any;

    beforeEach(() => {
        mockVisualViewport = {
            height: 800,
            width: 400,
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
            dispatchEvent: jest.fn(),
        };
        window.visualViewport = mockVisualViewport;
    });

    afterEach(() => {
        window.visualViewport = originalVisualViewport;
        jest.clearAllMocks();
    });

    it('should initialize with default values', () => {
        const { result } = renderHook(() => useDetectDevice());

        expect(result.current).toEqual({
            resultAreaHeight: expect.any(Number),
            resultHeight: expect.any(Number),
            cageScale: expect.any(Number),
            gameScale: expect.any(Number),
            offsetHeight: 0,
        });
    });

    it('should handle viewport equal to MIN_HEIGHT_VIEW_PORT', () => {
        mockVisualViewport.height = 739; // MIN_HEIGHT_VIEW_PORT
        mockVisualViewport.width = 430; // MAX_WIDTH_VIEW_PORT

        const { result } = renderHook(() => useDetectDevice());

        expect(result.current).toEqual({
            resultAreaHeight: 120, // DEFAULT_RESULT_AREA_HEIGHT
            resultHeight: 90, // DEFAULT_RESULT_HEIGHT
            cageScale: 0.5, // DEFAULT_MIN_CAGE_SCALE
            gameScale: 1,
            offsetHeight: 0,
        });
    });

    it('should handle viewport smaller than MIN_HEIGHT_VIEW_PORT', () => {
        mockVisualViewport.height = 600;
        mockVisualViewport.width = 400;

        const { result } = renderHook(() => useDetectDevice());

        expect(result.current.cageScale).toBeLessThan(0.5);
        expect(result.current.gameScale).toBeLessThan(1);
    });

    it('should handle viewport larger than MIN_HEIGHT_VIEW_PORT', () => {
        mockVisualViewport.height = 900;
        mockVisualViewport.width = 500;

        const { result } = renderHook(() => useDetectDevice());

        expect(result.current.cageScale).toBeGreaterThan(0.5);
        expect(result.current.gameScale).toBeGreaterThan(1);
    });

    it('should handle resize events', () => {
        const { result } = renderHook(() => useDetectDevice());

        act(() => {
            mockVisualViewport.height = 800;
            mockVisualViewport.width = 400;
            const resizeHandler = mockVisualViewport.addEventListener.mock.calls[0][1];
            resizeHandler();
        });

        expect(mockVisualViewport.addEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
    });

    it('should handle offset height calculation', () => {
        mockVisualViewport.height = 800;
        const { result } = renderHook(() => useDetectDevice());

        act(() => {
            mockVisualViewport.height = 900;
            const resizeHandler = mockVisualViewport.addEventListener.mock.calls[0][1];
            resizeHandler();
        });

        expect(result.current.offsetHeight).toBeGreaterThan(0);
    });

    it('should handle fallback to window.innerHeight when visualViewport is not available', () => {
        window.visualViewport = undefined;
        const originalInnerHeight = window.innerHeight;
        const originalInnerWidth = window.innerWidth;

        Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true });
        Object.defineProperty(window, 'innerWidth', { value: 400, configurable: true });

        const { result } = renderHook(() => useDetectDevice());

        expect(result.current).toEqual({
            resultAreaHeight: expect.any(Number),
            resultHeight: expect.any(Number),
            cageScale: expect.any(Number),
            gameScale: expect.any(Number),
            offsetHeight: 0,
        });

        // Restore original values
        Object.defineProperty(window, 'innerHeight', { value: originalInnerHeight });
        Object.defineProperty(window, 'innerWidth', { value: originalInnerWidth });
    });

    it('should cleanup event listeners on unmount', () => {
        const { unmount } = renderHook(() => useDetectDevice());

        unmount();

        expect(mockVisualViewport.removeEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
    });

    it('should handle gameScale calculation for different viewport widths', () => {
        // Test for width less than MAX_WIDTH_VIEW_PORT
        mockVisualViewport.width = 300;
        const { result: result1 } = renderHook(() => useDetectDevice());
        expect(result1.current.gameScale).toBe(300 / 430);

        // Test for width equal to MAX_WIDTH_VIEW_PORT
        mockVisualViewport.width = 430;
        const { result: result2 } = renderHook(() => useDetectDevice());
        expect(result2.current.gameScale).toBe(1);

        // Test for width greater than MAX_WIDTH_VIEW_PORT
        mockVisualViewport.width = 500;
        const { result: result3 } = renderHook(() => useDetectDevice());
        expect(result3.current.gameScale).toBeGreaterThan(1);
    });
}); 