import { act, render, waitFor } from "@testing-library/react";
import { stub } from "jest-auto-stub";
import { useContext } from "react";
import { usePlayerContext, useSettingDispatch } from "../_shared/react-contexts";
import Games from "./games";
import { Props } from "./type";

jest.mock("react", () => ({
    ...jest.requireActual("react"),
    useContext: jest.fn(),
}));

jest.mock("../_shared/react-contexts", () => ({
    usePlayerContext: jest.fn(),
    useSettingDispatch: jest.fn(),
}));

jest.mock("../components/page-components/preload-images", () => {
    const MockPreloadImages = () => <div data-testid="preload-images" />;
    MockPreloadImages.displayName = "MockPreloadImages";
    return MockPreloadImages;
});

jest.mock("../components/page-components/preload-images", () => {
    const mockGetCagePaths = jest.fn(() => ["/path/to/image1.webp", "/path/to/image2.webp"]);
    return {
        DEFAULT_PATH_IMAGE: "/static/images",
        getCagePaths: mockGetCagePaths,
        default: () => <div data-testid="preload-images" />,
    };
});

jest.mock("../services/user-setting-service", () => ({
    getChipSettings: jest.fn(() => Promise.resolve({ chips: ["chip1", "chip2"] })),
}));

jest.mock("next-themes", () => ({
    useTheme: jest.fn(() => ({ theme: "light" })),
}));

jest.mock("../_shared/helpers", () => ({
    StorageHelper: {
        get: jest.fn(),
        set: jest.fn(),
    },
    localStorageKeys: {
        url: "url",
    },
    objectMap: jest.fn(),
    getGlossaryTranslate: jest.fn(),
}));

jest.mock("../_shared/react-hooks", () => ({
    useBlockBetSound: jest.fn(),
    usePlaceBetSound: jest.fn(),
    useStartDrawSound: jest.fn(),
    useStartRoundSound: jest.fn(),
}));

jest.mock("../_shared/react-contexts", () => ({
    SettingEventActionType: {
        UPDATE_CHIPS: "UPDATE_CHIPS",
    },
}));

describe("Games", () => {
    const mockProps = stub<Props>({
        lobbyGamesIds: [1001],
        openGameId: 1001,
        directMode: true,
    });

    const mockUseContext = useContext as jest.Mock;
    const mockUsePlayerContext = usePlayerContext as jest.Mock;
    const mockUseSettingDispatch = useSettingDispatch as jest.Mock;

    beforeEach(() => {
        jest.useFakeTimers();

        mockUseContext.mockReturnValue({
            backToRedirectUrl: "",
            isDirectMode: true,
            redirectUrl: "test-url",
        });

        mockUsePlayerContext.mockReturnValue({
            session: null,
        });

        mockUseSettingDispatch.mockReturnValue(jest.fn());
    });

    afterEach(() => {
        jest.useRealTimers();
        jest.clearAllMocks();
    });

    it("should trigger PreloadImages after 5 seconds", async () => {
        // Act
        const { queryByTestId } = render(<Games {...mockProps} />);
        act(() => {
            jest.advanceTimersByTime(5000);
        });

        // Assert
        await waitFor(() => {
            expect(queryByTestId("preload-images")).toBeInTheDocument();
        });
    });
});
