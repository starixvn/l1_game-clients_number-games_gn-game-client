import { render, waitFor } from "@testing-library/react";
import PreloadImages, { DEFAULT_PATH_IMAGE, getCagePaths } from "./preload-images";

global.Request = jest.fn();
global.fetch = jest.fn();

describe("PreloadImages", () => {
    const preloadImagesData = [
        "/static/images/cage/ball-red-1.webp?v=1.2.3",
        "/static/images/cage/ball-red-2.webp?v=1.2.3",
        "/static/images/cage/ball-blue-1.webp?v=1.2.3",
        "/static/images/cage/ball-blue-2.webp?v=1.2.3",
        "/static/images/cage/number/1.webp?v=1.2.3",
        "/static/images/cage/number/2.webp?v=1.2.3",
    ];

    beforeEach(() => {
        global.console.log = jest.fn();
        global.console.error = jest.fn();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("should preload images and log the preload time", async () => {
        render(<PreloadImages pathImages={preloadImagesData} />);

        await waitFor(() => {
            expect(console.log).toHaveBeenCalledWith("pathImages", preloadImagesData);
            expect(console.log).toHaveBeenCalledWith(expect.stringMatching(/Preloaded images in \d+\.\d+ ms/));
        });
    });

    it("should log an error if preloading fails", async () => {
        global.fetch = jest.fn().mockRejectedValueOnce("Error preloading images");

        render(<PreloadImages pathImages={preloadImagesData} />);

        await waitFor(() => {
            expect(console.error).toHaveBeenCalledWith("Error preloading images:", "Error preloading images");
        });
    });

    it("should render the preload div", () => {
        const { container } = render(<PreloadImages />);
        expect(container.querySelector(".preloads")).toBeInTheDocument();
    });
});

describe("getCagePaths", () => {
    test("returns an array of cage paths", () => {
        const paths = getCagePaths();
        expect(paths).toBeInstanceOf(Array);
        expect(paths.length).toBeGreaterThan(0);
        paths.forEach((path) => {
            expect(path.startsWith(DEFAULT_PATH_IMAGE)).toBe(true);
        });
    });
});
