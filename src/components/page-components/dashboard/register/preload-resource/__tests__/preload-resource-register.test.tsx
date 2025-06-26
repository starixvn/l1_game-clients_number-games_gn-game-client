import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import PreloadResourceRegister from "../index";

// Mock dependencies
jest.mock("../../../../../../_shared/helpers/preload-resources", () => ({
    __esModule: true,
    default: jest.fn(({ gameId, setIsDonePreload, bannerId, gameIdsIcon, progressBarId }) => (
        <div data-testid="preload-resources">
            PreloadResources - GameId: {gameId}, BannerId: {bannerId}, GameIdsIcon: {JSON.stringify(gameIdsIcon)}, ProgressBarId: {progressBarId}
        </div>
    )),
    getAndHandleBannerOffer: jest.fn(),
    getAndHandleGameOfferIds: jest.fn(),
}));

jest.mock("../../../../../../services/auth-service", () => ({
    getLobbyConfigs: jest.fn(),
}));

import { getAndHandleBannerOffer, getAndHandleGameOfferIds } from "../../../../../../_shared/helpers/preload-resources";
import { getLobbyConfigs } from "../../../../../../services/auth-service";

// Test data
const MOCK_SESSION = {
    ss: "mock-session",
    username: "testuser",
    isAuthenticated: true,
    language: "en",
    memberName: "testuser",
    isUM: false,
    umInfo: null,
    system: "test"
} as any;

const MOCK_AUTHORIZE_RESPONSE = {
    authorized: true,
    user: {
        offerGames: [{ gameId: 1 }],
        enabledGameIds: [1]
    }
} as any;

const MOCK_LOBBY_CONFIGS = {
    lobbyConfigs: {
        banners: [{ gameId: 1 }],
        categories: [{ gameSettings: [{ gameId: 1 }] }]
    }
} as any;

const createProps = (overrides = {}) => ({
    isDirectMode: false,
    gameId: 1,
    updateStatePreloadResource: jest.fn(),
    updateLobbyConfigs: jest.fn(),
    session: MOCK_SESSION,
    authorizeResponse: MOCK_AUTHORIZE_RESPONSE,
    ...overrides,
});

describe("PreloadResourceRegister", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    describe("Component Initialization", () => {
        it("should initialize with default state values", async () => {
            const mockGetLobbyConfigs = getLobbyConfigs as jest.MockedFunction<typeof getLobbyConfigs>;
            mockGetLobbyConfigs.mockResolvedValue(MOCK_LOBBY_CONFIGS);

            const props = createProps();

            render(<PreloadResourceRegister {...props} />);

            await waitFor(() => {
                expect(mockGetLobbyConfigs).toHaveBeenCalledWith(MOCK_SESSION);
            });
        });
    });

    describe("handleAuthorizedAccess - Happy Path", () => {
        it("should handle successful lobby configs retrieval", async () => {
            const mockGetLobbyConfigs = getLobbyConfigs as jest.MockedFunction<typeof getLobbyConfigs>;
            const mockGetAndHandleBannerOffer = getAndHandleBannerOffer as jest.MockedFunction<typeof getAndHandleBannerOffer>;
            const mockGetAndHandleGameOfferIds = getAndHandleGameOfferIds as jest.MockedFunction<typeof getAndHandleGameOfferIds>;

            mockGetLobbyConfigs.mockResolvedValue(MOCK_LOBBY_CONFIGS);
            mockGetAndHandleBannerOffer.mockImplementation((auth, configs, callback) => {
                act(() => callback(1));
            });
            mockGetAndHandleGameOfferIds.mockImplementation((auth, configs, callback) => {
                act(() => callback([1, 2]));
            });

            const props = createProps();

            render(<PreloadResourceRegister {...props} />);

            await waitFor(() => {
                expect(mockGetLobbyConfigs).toHaveBeenCalledWith(MOCK_SESSION);
                expect(props.updateLobbyConfigs).toHaveBeenCalledWith(MOCK_LOBBY_CONFIGS.lobbyConfigs);
                expect(mockGetAndHandleBannerOffer).toHaveBeenCalled();
                expect(mockGetAndHandleGameOfferIds).toHaveBeenCalled();
            });
        });
    });

    describe("handleAuthorizedAccess - Edge Cases", () => {
        it("should handle null lobby configs", async () => {
            const mockGetLobbyConfigs = getLobbyConfigs as jest.MockedFunction<typeof getLobbyConfigs>;
            mockGetLobbyConfigs.mockResolvedValue(null);

            const props = createProps();

            render(<PreloadResourceRegister {...props} />);

            await waitFor(() => {
                expect(props.updateStatePreloadResource).toHaveBeenCalled();
            });
        });

        it("should handle empty lobby configs", async () => {
            const mockGetLobbyConfigs = getLobbyConfigs as jest.MockedFunction<typeof getLobbyConfigs>;
            mockGetLobbyConfigs.mockResolvedValue({ lobbyConfigs: {} } as any);

            const props = createProps();

            render(<PreloadResourceRegister {...props} />);

            await waitFor(() => {
                expect(props.updateStatePreloadResource).toHaveBeenCalled();
            });
        });
    });

    describe("Lobby Case useEffect", () => {
        it("should handle lobby case when gameId is 0 and not direct mode", async () => {
            const mockGetLobbyConfigs = getLobbyConfigs as jest.MockedFunction<typeof getLobbyConfigs>;
            mockGetLobbyConfigs.mockResolvedValue(MOCK_LOBBY_CONFIGS);

            const props = createProps({ isDirectMode: false, gameId: 0 });

            render(<PreloadResourceRegister {...props} />);

            act(() => {
                jest.advanceTimersByTime(100);
            });

            await waitFor(() => {
                expect(props.updateStatePreloadResource).toHaveBeenCalled();
            });
        });

        it("should not handle lobby case when isDirectMode is true", async () => {
            const mockGetLobbyConfigs = getLobbyConfigs as jest.MockedFunction<typeof getLobbyConfigs>;
            mockGetLobbyConfigs.mockResolvedValue(MOCK_LOBBY_CONFIGS);

            const props = createProps({ isDirectMode: true, gameId: 0 });

            render(<PreloadResourceRegister {...props} />);

            act(() => {
                jest.advanceTimersByTime(100);
            });

            expect(props.updateStatePreloadResource).not.toHaveBeenCalled();
        });
    });

    describe("Rendering Logic", () => {
        it("should render PreloadResources when not direct mode and gameId > 0", async () => {
            const mockGetLobbyConfigs = getLobbyConfigs as jest.MockedFunction<typeof getLobbyConfigs>;
            mockGetLobbyConfigs.mockResolvedValue(MOCK_LOBBY_CONFIGS);

            const props = createProps({ isDirectMode: false, gameId: 5 });

            render(<PreloadResourceRegister {...props} />);

            await waitFor(() => {
                const preloadElement = screen.getByTestId("preload-resources");
                expect(preloadElement).toBeInTheDocument();
                expect(preloadElement).toHaveTextContent("GameId: 5");
            });
        });

        it("should render PreloadResources when isDirectMode is true", async () => {
            const mockGetLobbyConfigs = getLobbyConfigs as jest.MockedFunction<typeof getLobbyConfigs>;
            mockGetLobbyConfigs.mockResolvedValue(MOCK_LOBBY_CONFIGS);

            const props = createProps({ isDirectMode: true, gameId: 3 });

            render(<PreloadResourceRegister {...props} />);

            await waitFor(() => {
                const preloadElement = screen.getByTestId("preload-resources");
                expect(preloadElement).toBeInTheDocument();
                expect(preloadElement).toHaveTextContent("GameId: 3");
            });
        });

        it("should render empty fragment when not direct mode and gameId is 0", async () => {
            const mockGetLobbyConfigs = getLobbyConfigs as jest.MockedFunction<typeof getLobbyConfigs>;
            mockGetLobbyConfigs.mockResolvedValue(MOCK_LOBBY_CONFIGS);

            const props = createProps({ isDirectMode: false, gameId: 0 });

            const { container } = render(<PreloadResourceRegister {...props} />);

            await waitFor(() => {
                expect(screen.queryByTestId("preload-resources")).not.toBeInTheDocument();
                expect(container.firstChild).toBeNull();
            });
        });
    });

    describe("Error Handling", () => {
        it("should handle getLobbyConfigs throwing an error", async () => {
            const mockGetLobbyConfigs = getLobbyConfigs as jest.MockedFunction<typeof getLobbyConfigs>;
            const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => { });
            mockGetLobbyConfigs.mockRejectedValue(new Error("Network error"));

            const props = createProps();

            // The component should not throw when getLobbyConfigs fails
            expect(() => {
                render(<PreloadResourceRegister {...props} />);
            }).not.toThrow();

            // Wait for the async operation to complete
            await waitFor(() => {
                expect(mockGetLobbyConfigs).toHaveBeenCalled();
            });

            consoleSpy.mockRestore();
        });

        it("should handle undefined props gracefully", async () => {
            const mockGetLobbyConfigs = getLobbyConfigs as jest.MockedFunction<typeof getLobbyConfigs>;
            mockGetLobbyConfigs.mockResolvedValue(MOCK_LOBBY_CONFIGS);

            const props = {
                isDirectMode: undefined,
                gameId: undefined,
                updateStatePreloadResource: jest.fn(), // Provide mock function
                updateLobbyConfigs: jest.fn(), // Provide mock function
                session: undefined,
                authorizeResponse: undefined,
            };

            expect(() => {
                render(<PreloadResourceRegister {...props} />);
            }).not.toThrow();
        });
    });
}); 