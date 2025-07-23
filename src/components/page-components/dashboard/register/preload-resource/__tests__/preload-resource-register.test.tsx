import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import PreloadResourceRegister from "../index";
import { ILobbyConfigs } from "../../../../dashboard/type";

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
        name: "Test Lobby",
        currencyGroupIds: ["USD"],
        miniPanelGameIds: [1],
        categories: [{
            name: "Test Category",
            gameSettings: [{ gameId: 1, bigSize: false, newTag: false }]
        }],
        banners: [{ gameId: 1, displayTime: 5000 }],
        gameSettings: {
            1: { id: 1, name: "Game 1" }
        },
        roundTimerGame: 1,
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

describe("PreloadResourceRegister Component Tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    describe("handleAuthorizedAccess Scenarios", () => {
        it("should call updateStatePreloadResource when lobby configs are successfully loaded", async () => {
            // Arrange
            const mockGetLobbyConfigs = getLobbyConfigs as jest.MockedFunction<typeof getLobbyConfigs>;
            const mockLobbyConfigs = {
                lobbyConfigs: {
                    name: "Test Lobby",
                    currencyGroupIds: ["USD"],
                    miniPanelGameIds: [1001, 1002],
                    categories: [
                        {
                            name: "Test Category",
                            gameSettings: [
                                { gameId: 1001, bigSize: false, newTag: false },
                                { gameId: 1002, bigSize: false, newTag: false },
                            ],
                        },
                    ],
                    banners: [
                        { gameId: 1001, displayTime: 5000 },
                        { gameId: 1002, displayTime: 5000 },
                    ],
                    gameSettings: {
                        1001: { id: 1001, name: "Game 1" },
                        1002: { id: 1002, name: "Game 2" },
                    },
                    roundTimerGame: 1001,
                } as ILobbyConfigs
            };
            mockGetLobbyConfigs.mockResolvedValue(mockLobbyConfigs as any);

            const mockUpdateStatePreloadResource = jest.fn();
            const mockUpdateLobbyConfigs = jest.fn();
            const props = createProps({
                updateStatePreloadResource: mockUpdateStatePreloadResource,
                updateLobbyConfigs: mockUpdateLobbyConfigs,
            });

            // Act
            render(<PreloadResourceRegister {...props} />);

            // Assert
            await waitFor(() => {
                expect(mockGetLobbyConfigs).toHaveBeenCalledWith(MOCK_SESSION);
                expect(mockUpdateLobbyConfigs).toHaveBeenCalledWith(mockLobbyConfigs.lobbyConfigs);
                expect(mockUpdateStatePreloadResource).toHaveBeenCalled();
            });
        });

        it("should call updateStatePreloadResource when lobby configs are empty", async () => {
            // Arrange
            const mockGetLobbyConfigs = getLobbyConfigs as jest.MockedFunction<typeof getLobbyConfigs>;
            mockGetLobbyConfigs.mockResolvedValue({
                lobbyConfigs: {
                    name: "Test Lobby",
                    currencyGroupIds: ["USD"],
                    miniPanelGameIds: [],
                    categories: [],
                    banners: [],
                    gameSettings: {},
                    roundTimerGame: null,
                }
            } as any);

            const mockUpdateStatePreloadResource = jest.fn();
            const mockUpdateLobbyConfigs = jest.fn();
            const props = createProps({
                updateStatePreloadResource: mockUpdateStatePreloadResource,
                updateLobbyConfigs: mockUpdateLobbyConfigs,
            });

            // Act
            render(<PreloadResourceRegister {...props} />);

            // Assert
            await waitFor(() => {
                expect(mockUpdateStatePreloadResource).toHaveBeenCalled();
            });
        });

        it("should call updateStatePreloadResource when lobby configs fail to load", async () => {
            // Arrange
            const mockGetLobbyConfigs = getLobbyConfigs as jest.MockedFunction<typeof getLobbyConfigs>;
            mockGetLobbyConfigs.mockRejectedValue(new Error("Network error"));

            const mockUpdateStatePreloadResource = jest.fn();
            const mockUpdateLobbyConfigs = jest.fn();
            const props = createProps({
                updateStatePreloadResource: mockUpdateStatePreloadResource,
                updateLobbyConfigs: mockUpdateLobbyConfigs,
            });

            // Act
            render(<PreloadResourceRegister {...props} />);

            // Assert
            await waitFor(() => {
                expect(mockUpdateStatePreloadResource).toHaveBeenCalled();
                expect(mockUpdateLobbyConfigs).not.toHaveBeenCalled();
            });
        });
    });

    describe("Direct Mode Scenarios", () => {
        it("should render PreloadResources for direct mode with valid gameId", () => {
            // Arrange
            const props = createProps({ isDirectMode: true, gameId: 1001 });

            // Act
            render(<PreloadResourceRegister {...props} />);

            // Assert
            expect(screen.getByTestId("preload-resources")).toBeInTheDocument();
        });

        it("should render PreloadResources for direct mode with gameId = 0", () => {
            // Arrange
            const props = createProps({ isDirectMode: true, gameId: 0 });

            // Act
            render(<PreloadResourceRegister {...props} />);

            // Assert
            expect(screen.getByTestId("preload-resources")).toBeInTheDocument();
        });

        it("should call updateStatePreloadResource after lobby configs in direct mode", async () => {
            // Arrange
            const mockGetLobbyConfigs = getLobbyConfigs as jest.MockedFunction<typeof getLobbyConfigs>;
            mockGetLobbyConfigs.mockResolvedValue(MOCK_LOBBY_CONFIGS);

            const mockUpdateStatePreloadResource = jest.fn();
            const props = createProps({
                isDirectMode: true,
                updateStatePreloadResource: mockUpdateStatePreloadResource,
            });

            // Act
            render(<PreloadResourceRegister {...props} />);

            // Assert
            await waitFor(() => {
                expect(mockUpdateStatePreloadResource).toHaveBeenCalled();
            });
        });
    });

    describe("Non-Direct Mode Scenarios", () => {
        it("should render PreloadResources for non-direct mode with gameId > 0", () => {
            // Arrange
            const props = createProps({ isDirectMode: false, gameId: 1001 });

            // Act
            render(<PreloadResourceRegister {...props} />);

            // Assert
            expect(screen.getByTestId("preload-resources")).toBeInTheDocument();
        });

        it("should render empty fragment for non-direct mode with gameId = 0", () => {
            // Arrange
            const props = createProps({ isDirectMode: false, gameId: 0 });

            // Act
            const { container } = render(<PreloadResourceRegister {...props} />);

            // Assert
            // When gameId = 0 in non-direct mode, component should render empty fragment
            // This is the "lobby case" where no specific game is being loaded
            expect(container.firstChild).toBeNull();
            expect(screen.queryByTestId("preload-resources")).not.toBeInTheDocument();
        });

        it("should call updateStatePreloadResource after lobby configs in non-direct mode", async () => {
            // Arrange
            const mockGetLobbyConfigs = getLobbyConfigs as jest.MockedFunction<typeof getLobbyConfigs>;
            mockGetLobbyConfigs.mockResolvedValue(MOCK_LOBBY_CONFIGS);

            const mockUpdateStatePreloadResource = jest.fn();
            const props = createProps({
                isDirectMode: false,
                updateStatePreloadResource: mockUpdateStatePreloadResource,
            });

            // Act
            render(<PreloadResourceRegister {...props} />);

            // Assert
            await waitFor(() => {
                expect(mockUpdateStatePreloadResource).toHaveBeenCalled();
            });
        });
    });

    describe("Error Handling", () => {
        it("should handle malformed lobby configs gracefully", async () => {
            // Arrange
            const mockGetLobbyConfigs = getLobbyConfigs as jest.MockedFunction<typeof getLobbyConfigs>;
            const malformedConfigs = {
                lobbyConfigs: {
                    name: "Test Lobby",
                    currencyGroupIds: ["USD"],
                    miniPanelGameIds: [1001],
                    categories: [
                        {
                            name: "Test Category",
                            gameSettings: [
                                { gameId: 1, bigSize: false, newTag: false },
                            ],
                        },
                    ],
                    banners: [
                        { gameId: 1001, displayTime: 5000 },
                    ],
                    gameSettings: {
                        1001: { id: 1001, name: "Game 1" },
                    },
                    roundTimerGame: 1001,
                }
            } as any;
            mockGetLobbyConfigs.mockResolvedValue(malformedConfigs);

            const mockUpdateStatePreloadResource = jest.fn();
            const props = createProps({
                updateStatePreloadResource: mockUpdateStatePreloadResource,
            });

            // Act
            render(<PreloadResourceRegister {...props} />);

            // Assert
            await waitFor(() => {
                expect(mockUpdateStatePreloadResource).toHaveBeenCalled();
            });
        });
    });
}); 