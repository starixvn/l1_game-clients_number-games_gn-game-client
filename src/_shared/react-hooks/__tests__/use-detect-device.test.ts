import { renderHook, act } from '@testing-library/react';
import useDetectDevice from '../use-detect-device';
import { deviceInfo } from '../../helpers/device-detect-wrapper';
import {
    getViewportDimensions,
    calculateGameScale,
    calculateDimensions
} from '../../helpers/device-helper';

// Mock the helper functions and device info
jest.mock('../../helpers/device-helper');
jest.mock('../../helpers/device-detect-wrapper', () => ({
    deviceInfo: {
        isAndroid: false,
        isIOS: false
    }
}));

describe('useDetectDevice', () => {
    // Mock timer for debounce testing
    jest.useFakeTimers();

    beforeEach(() => {
        // Reset all mocks before each test
        jest.clearAllMocks();

        // Reset window properties
        Object.defineProperty(window, 'visualViewport', {
            value: undefined,
            configurable: true
        });

        // Default mock implementations
        (getViewportDimensions as jest.Mock).mockReturnValue({ width: 1024, height: 768 });
        (calculateGameScale as jest.Mock).mockReturnValue(1);
        (calculateDimensions as jest.Mock).mockReturnValue({
            cageScale: 1,
            resultArea: 100,
            result: 50
        });
    });

    it('should initialize with correct default values', () => {
        // Arrange
        (getViewportDimensions as jest.Mock).mockReturnValue({ width: 400, height: 800 });
        (calculateGameScale as jest.Mock).mockReturnValue(1);
        (calculateDimensions as jest.Mock).mockReturnValue({
            cageScale: 0.5,
            resultArea: 120,
            result: 80
        });

        // Act
        const { result } = renderHook(() => useDetectDevice());

        act(() => {
            jest.runAllTimers();
        });

        // Assert
        expect(result.current).toEqual({
            resultAreaHeight: 120,
            resultHeight: 80,
            cageScale: 0.5,
            gameScale: 1,
            offsetHeight: 0,
            viewportWidth: 400,
            viewportHeight: 800
        });
    });

    it('should update dimensions on mount', () => {
        const { result } = renderHook(() => useDetectDevice());

        act(() => {
            jest.runAllTimers();
        });

        expect(result.current.viewportWidth).toBe(1024);
        expect(result.current.viewportHeight).toBe(768);
    });
    it('should handle resize events with visualViewport', () => {
        // Mock viewport dimensions for initial and resize values
        (getViewportDimensions as jest.Mock)
            .mockReturnValueOnce({ width: 400, height: 800 })
            .mockReturnValueOnce({ width: 400, height: 800 });

        const addEventListenerSpy = jest.spyOn(window, 'addEventListener');
        const { result } = renderHook(() => useDetectDevice());

        // Initial render
        act(() => {
            jest.runAllTimers();
        });

        // Verify event listener was added
        expect(addEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));

        // Simulate resize event
        act(() => {
            window.dispatchEvent(new Event('resize'));
            jest.runAllTimers();
        });

        // Verify dimensions were updated
        expect(result.current.viewportHeight).toBe(800);
        expect(result.current.viewportWidth).toBe(400);

        // Cleanup
        addEventListenerSpy.mockRestore();
    });

    it('should handle resize events without visualViewport', () => {
        // Remove visualViewport
        Object.defineProperty(window, 'visualViewport', {
            value: null,
            configurable: true
        });

        const addEventListenerSpy = jest.spyOn(window, 'addEventListener');
        const { result } = renderHook(() => useDetectDevice());

        // Run timers to allow hook initialization
        act(() => {
            window.dispatchEvent(new Event('resize'));
            jest.runAllTimers();
        });

        expect(addEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));

        // Cleanup
        addEventListenerSpy.mockRestore();
    });

    it('should calculate offset height on resize', async () => {
        // Arrange
        (getViewportDimensions as jest.Mock)
            .mockReturnValueOnce({ width: 1024, height: 768 })
            .mockReturnValueOnce({ width: 1024, height: 868 });

        const { result } = renderHook(() => useDetectDevice());

        // Initial render
        act(() => {
            jest.runAllTimers();
        });

        // Act - Trigger resize and wait for debounce
        act(() => {
            window.dispatchEvent(new Event('resize'));
            jest.runAllTimers();
        });

        // Assert
        expect(result.current.offsetHeight).toBe(100); // Should be height difference
    });

    it('should update scales and heights when dimensions change', () => {
        // Arrange
        (getViewportDimensions as jest.Mock)
            .mockReturnValue({ width: 1024, height: 868 });
        (calculateGameScale as jest.Mock).mockReturnValue(1.5);
        (calculateDimensions as jest.Mock).mockReturnValue({
            cageScale: 0.8,
            resultArea: 200,
            result: 100
        });

        // Act
        const { result } = renderHook(() => useDetectDevice());

        act(() => {
            jest.runAllTimers();
        });

        // Assert
        expect(calculateGameScale).toHaveBeenCalledWith({ width: 1024, height: 868 });
        expect(calculateDimensions).toHaveBeenCalledWith(868, 1.5, 0);
        expect(result.current).toEqual({
            resultAreaHeight: 200,
            resultHeight: 100,
            cageScale: 0.8,
            gameScale: 1.5,
            offsetHeight: 0,
            viewportWidth: 1024,
            viewportHeight: 868
        });
    });

    it('should debounce resize events', () => {
        // Arrange
        const { result } = renderHook(() => useDetectDevice());

        // Clear initial call
        jest.clearAllMocks();

        // Act - trigger multiple resize events in quick succession
        act(() => {
            window.dispatchEvent(new Event('resize'));
            window.dispatchEvent(new Event('resize'));
            window.dispatchEvent(new Event('resize'));
            jest.advanceTimersByTime(50); // Not enough time to trigger debounce
        });

        // Assert - no calls yet due to debounce
        expect(getViewportDimensions).not.toHaveBeenCalled();

        // Act - wait for debounce timeout
        act(() => {
            jest.advanceTimersByTime(100); // Debounce timeout (100ms)
        });

        // Assert - only one call after debounce period
        expect(getViewportDimensions).toHaveBeenCalledTimes(1);
    });

    it('should handle visualViewport resize events', () => {
        // Arrange
        Object.defineProperty(window, 'visualViewport', {
            value: {
                height: 800,
                width: 400,
                addEventListener: jest.fn((event, handler) => handler()),
                removeEventListener: jest.fn()
            },
            writable: true
        });

        (getViewportDimensions as jest.Mock).mockReturnValue({
            height: 800,
            width: 400
        });

        // Act
        const { result } = renderHook(() => useDetectDevice());

        act(() => {
            // The handler is automatically called when addEventListener is invoked
            window.visualViewport?.addEventListener('resize', () => { });
            jest.runAllTimers();
        });

        // Assert
        expect(getViewportDimensions).toHaveBeenCalled();
        expect(result.current).toEqual({
            resultAreaHeight: 100,
            resultHeight: 50,
            cageScale: 1,
            gameScale: 1,
            offsetHeight: 0,
            viewportWidth: 400,
            viewportHeight: 800
        });
    });

    it('should not update offset height when height difference is 0', () => {
        // Arrange
        (getViewportDimensions as jest.Mock)
            .mockReturnValueOnce({ height: 800, width: 400 })
            .mockReturnValueOnce({ height: 800, width: 400 }); // Same height

        // Act
        const { result } = renderHook(() => useDetectDevice());

        act(() => {
            window.dispatchEvent(new Event('resize'));
            jest.runAllTimers();
        });

        // Assert
        expect(result.current.offsetHeight).toBe(0);
    });

    it('should not update offset height when height difference equals new height', () => {
        // Arrange
        (getViewportDimensions as jest.Mock)
            .mockReturnValueOnce({ height: 0, width: 400 })
            .mockReturnValueOnce({ height: 800, width: 400 });

        // Act
        const { result } = renderHook(() => useDetectDevice());

        act(() => {
            window.dispatchEvent(new Event('resize'));
            jest.runAllTimers();
        });

        // Assert
        expect(result.current.offsetHeight).toBe(0);
    });
    it('should cleanup listeners and timeouts on unmount', () => {
        // Arrange
        let resizeHandler: Function | undefined;
        const mockAddEventListener = jest.fn((event, handler) => {
            resizeHandler = handler;
        });
        const mockRemoveEventListener = jest.fn();
        const originalAddEventListener = window.addEventListener;
        const originalRemoveEventListener = window.removeEventListener;
        window.addEventListener = mockAddEventListener;
        window.removeEventListener = mockRemoveEventListener;

        // Act
        const { unmount } = renderHook(() => useDetectDevice());

        // Ensure handler was assigned and run timers
        act(() => {
            if (resizeHandler) {
                resizeHandler();
                jest.runAllTimers();
            }
        });

        unmount();

        // Assert
        expect(mockRemoveEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
        expect(jest.getTimerCount()).toBe(0);

        // Cleanup
        window.addEventListener = originalAddEventListener;
        window.removeEventListener = originalRemoveEventListener;
    });
});