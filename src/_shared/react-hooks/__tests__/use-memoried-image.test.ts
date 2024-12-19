import { renderHook } from "@testing-library/react-hooks/dom";
import { useMemoriedImage } from "../use-memoried-image";
import { downloadAndCacheImage } from "../../helpers/image-cache-controller";
import { act } from "@testing-library/react";

// Mock the image cache controller
jest.mock("../../helpers/image-cache-controller");
const mockedDownloadAndCacheImage = downloadAndCacheImage as jest.MockedFunction<typeof downloadAndCacheImage>;

describe("useMemoriedImage", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("should handle successful image loading", async () => {
        // Arrange
        const imagePath = "https://example.com/test-image.jpg";
        const expectedBase64 = "base64EncodedImageData";
        mockedDownloadAndCacheImage.mockResolvedValueOnce({
            imageBase64: expectedBase64,
            valid: true,
            path: imagePath,
        });

        // Act
        const { result, waitForNextUpdate } = renderHook(() => useMemoriedImage(imagePath));

        // Assert initial state
        expect(result.current.isLoading).toBe(true);
        expect(result.current.data).toBe("");
        expect(result.current.error).toBeNull();

        // Wait for the async operation to complete
        await waitForNextUpdate();

        // Assert final state
        expect(result.current.isLoading).toBe(false);
        expect(result.current.data).toBe(expectedBase64);
        expect(result.current.error).toBeNull();
        expect(mockedDownloadAndCacheImage).toHaveBeenCalledWith(imagePath);
    });

    test("should handle invalid image response", async () => {
        // Arrange
        const imagePath = "https://example.com/invalid-image.jpg";
        mockedDownloadAndCacheImage.mockResolvedValueOnce({
            imageBase64: "",
            valid: false,
            path: imagePath,
        });

        // Act
        const { result, waitForNextUpdate } = renderHook(() => useMemoriedImage(imagePath));

        // Assert initial state
        expect(result.current.isLoading).toBe(true);
        expect(result.current.data).toBe("");
        expect(result.current.error).toBeNull();

        // Wait for the async operation to complete
        await waitForNextUpdate();

        // Assert final state
        expect(result.current.isLoading).toBe(false);
        expect(result.current.data).toBe("");
        expect(result.current.error).toBeInstanceOf(Error);
        expect(result.current.error.message).toBe("Network response was not ok");
    });

    test("should handle network error", async () => {
        // Arrange
        const imagePath = "https://example.com/error-image.jpg";
        const expectedError = new Error("Network error");
        mockedDownloadAndCacheImage.mockRejectedValueOnce(expectedError);

        // Act
        const { result, waitForNextUpdate } = renderHook(() => useMemoriedImage(imagePath));

        // Assert initial state
        expect(result.current.isLoading).toBe(true);
        expect(result.current.data).toBe("");
        expect(result.current.error).toBeNull();

        // Wait for the async operation to complete
        await waitForNextUpdate();

        // Assert final state
        expect(result.current.isLoading).toBe(false);
        expect(result.current.data).toBe("");
        expect(result.current.error).toBe(expectedError);
    });

    test("should update when path changes", async () => {
        // Arrange
        const initialPath = "https://example.com/initial-image.jpg";
        const newPath = "https://example.com/new-image.jpg";
        const initialBase64 = "initialBase64EncodedData";
        const newBase64 = "newBase64EncodedData";

        mockedDownloadAndCacheImage
            .mockResolvedValueOnce({
                imageBase64: initialBase64,
                valid: true,
                path: initialPath,
            })
            .mockResolvedValueOnce({
                imageBase64: newBase64,
                valid: true,
                path: newPath,
            });

        // Act
        const { result, waitForNextUpdate, rerender } = renderHook((props) => useMemoriedImage(props), { initialProps: initialPath });

        // Wait for first load
        await waitForNextUpdate();
        expect(result.current.data).toBe(initialBase64);

        // Change the path
        act(() => {
            rerender(newPath);
        });

        // Wait for second load
        await waitForNextUpdate();

        // Assert
        expect(result.current.data).toBe(newBase64);
        expect(mockedDownloadAndCacheImage).toHaveBeenCalledTimes(2);
        expect(mockedDownloadAndCacheImage).toHaveBeenCalledWith(initialPath);
        expect(mockedDownloadAndCacheImage).toHaveBeenCalledWith(newPath);
    });
});
