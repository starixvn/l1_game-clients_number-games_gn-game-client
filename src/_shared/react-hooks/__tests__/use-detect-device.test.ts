import { act, renderHook } from "@testing-library/react";

import { calculateDimensions, calculateGameScale, getViewportDimensions, VIEWPORT } from "../../helpers/device-helper";
import useDetectDevice from "../use-detect-device";

// Mock the helper functions
jest.mock("../../helpers/device-helper", () => ({
    ...jest.requireActual("../../helpers/device-helper"),
    getViewportDimensions: jest.fn(),
    calculateGameScale: jest.fn(),
    calculateDimensions: jest.fn(),
    VIEWPORT: {
        MIN_HEIGHT: 739,
        MAX_HEIGHT: 821,
        MAX_WIDTH: 430,
    },
}));

describe("useDetectDevice", () => {
    beforeEach(() => {
        jest.clearAllMocks();

        // Default mock implementations
        (getViewportDimensions as jest.Mock).mockReturnValue({
            height: VIEWPORT.MIN_HEIGHT,
            width: VIEWPORT.MAX_WIDTH,
        });
        (calculateGameScale as jest.Mock).mockReturnValue(1);
        (calculateDimensions as jest.Mock).mockReturnValue({
            cageScale: 0.5,
            resultArea: 120,
            result: 70,
        });
    });

    it("should initialize with default values", () => {
        // Act
        const { result } = renderHook(() => useDetectDevice());

        // Assert
        expect(result.current).toEqual({
            resultAreaHeight: 120,
            resultHeight: 70,
            cageScale: 0.5,
            gameScale: 1,
            viewportWidth: 430,
            viewportHeight: 739,
        });
    });

    it("should update dimensions on mount", () => {
        // Act
        const { result } = renderHook(() => useDetectDevice());

        // Assert
        expect(getViewportDimensions).toHaveBeenCalled();
        expect(result.current.viewportHeight).toBe(VIEWPORT.MIN_HEIGHT);
        expect(result.current.viewportWidth).toBe(VIEWPORT.MAX_WIDTH);
    });

    it("should handle resize events with visualViewport", () => {
        // Arrange
        const mockAddEventListener = jest.fn();
        const mockRemoveEventListener = jest.fn();
        window.visualViewport = {
            addEventListener: mockAddEventListener,
            removeEventListener: mockRemoveEventListener,
        } as unknown as VisualViewport;

        // Act
        const { unmount } = renderHook(() => useDetectDevice());

        // Assert
        expect(mockAddEventListener).toHaveBeenCalledWith("resize", expect.any(Function));

        // Test resize handler
        const resizeHandler = mockAddEventListener.mock.calls[0][1];
        act(() => {
            resizeHandler();
        });
        expect(getViewportDimensions).toHaveBeenCalled();

        // Cleanup
        unmount();
        expect(mockRemoveEventListener).toHaveBeenCalledWith("resize", expect.any(Function));
    });

    it("should handle resize events without visualViewport", () => {
        // Arrange
        window.visualViewport = undefined;
        const addEventListenerSpy = jest.spyOn(window, "addEventListener");
        const removeEventListenerSpy = jest.spyOn(window, "removeEventListener");

        // Act
        const { unmount } = renderHook(() => useDetectDevice());

        // Assert
        expect(addEventListenerSpy).toHaveBeenCalledWith("resize", expect.any(Function));

        // Test resize handler
        act(() => {
            window.dispatchEvent(new Event("resize"));
        });
        expect(getViewportDimensions).toHaveBeenCalled();

        // Cleanup
        unmount();
        expect(removeEventListenerSpy).toHaveBeenCalledWith("resize", expect.any(Function));
    });

    it("should update game scale when dimensions change", () => {
        // Arrange
        const { result } = renderHook(() => useDetectDevice());
        (calculateGameScale as jest.Mock).mockReturnValue(0.8);

        // Act
        act(() => {
            (getViewportDimensions as jest.Mock).mockReturnValue({
                height: 800,
                width: 400,
            });
            window.dispatchEvent(new Event("resize"));
        });

        // Assert
        expect(calculateGameScale).toHaveBeenCalledWith({ height: 800, width: 400 });
        expect(result.current.gameScale).toBe(0.8);
    });

    it("should update heights and cage scale when game scale or height changes", () => {
        // Arrange
        const { result } = renderHook(() => useDetectDevice());
        (calculateDimensions as jest.Mock).mockReturnValue({
            cageScale: 0.6,
            resultArea: 150,
            result: 80,
        });

        // Act
        act(() => {
            (getViewportDimensions as jest.Mock).mockReturnValue({
                height: 800,
                width: 400,
            });
            window.dispatchEvent(new Event("resize"));
        });

        // Assert
        expect(calculateDimensions).toHaveBeenCalledWith(800, 1);
        expect(result.current).toEqual(
            expect.objectContaining({
                cageScale: 0.6,
                resultAreaHeight: 150,
                resultHeight: 80,
            })
        );
    });

    it("should cleanup event listeners on unmount", () => {
        // Arrange
        const removeEventListenerSpy = jest.spyOn(window, "removeEventListener");
        window.visualViewport = undefined;

        // Act
        const { unmount } = renderHook(() => useDetectDevice());
        unmount();

        // Assert
        expect(removeEventListenerSpy).toHaveBeenCalledWith("resize", expect.any(Function));
    });
});
