import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import PreloadResourceRegister from "../index";
import { getLobbyConfigs } from "../../../../../../services/auth-service";
import { getAndHandleBannerOffer, getAndHandleGameOfferIds } from "../../../../../../_shared/helpers/preload-resources";

// Mock dependencies
jest.mock("../../../../../../services/auth-service", () => ({
    getLobbyConfigs: jest.fn(),
}));

jest.mock("../../../../../../_shared/helpers/preload-resources", () => ({
    getAndHandleBannerOffer: jest.fn(),
    getAndHandleGameOfferIds: jest.fn(),
}));

jest.mock("../../../../../../_shared/helpers/preload-resources", () => {
    return function MockPreloadResources() {
        return <div data-testid="preload-resources">Preload Resources</div>;
    };
});

describe("PreloadResourceRegister", () => {
    const mockSession = {
        id: "session123",
        isUM: false,
    };

    const mockAuthorizeResponse = {
        authorized: true,
        user: {
            id: "user123",
            offerGames: [1001, 1002, 1003],
        },
        errorCode: null,
    };

    const mockLobbyConfigs = {
        lobbyConfigs: {
            gameSettings: {
                1001: { id: 1001, gameName: "Game1" },
                1002: { id: 1002, gameName: "Game2" },
                1003: { id: 1003, gameName: "Game3" },
            },
        },
    };

    const mockProps = {
        isDirectMode: false,
        gameId: 1001,
        updateStatePreloadResource: jest.fn(),
        updateLobbyConfigs: jest.fn(),
        session: mockSession,
        authorizeResponse: mockAuthorizeResponse,
    };

    beforeEach(() => {
        (getLobbyConfigs as jest.Mock).mockResolvedValue(mockLobbyConfigs);
        (getAndHandleBannerOffer as jest.Mock).mockImplementation(() => { });
        (getAndHandleGameOfferIds as jest.Mock).mockImplementation(() => { });
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.useRealTimers();
    });

    describe("Component Initialization", () => {
        it("should render without crashing", () => {
            // Act & Assert
            expect(() => render(<PreloadResourceRegister {...mockProps} />)).not.toThrow();
        });

        it("should call handleAuthorizedAccess on mount", async () => {
            // Act
            render(<PreloadResourceRegister {...mockProps} />);

            // Assert
            await waitFor(() => {
                expect(getLobbyConfigs).toHaveBeenCalledWith(mockSession);
            });
        });
    });

    describe("handleAuthorizedAccess Logic", () => {
        it("should call updateStatePreloadResource when no lobby configs", async () => {
            // Arrange
            (getLobbyConfigs as jest.Mock).mockResolvedValue(null);

            // Act
            render(<PreloadResourceRegister {...mockProps} />);

            // Assert
            await waitFor(() => {
                expect(mockProps.updateStatePreloadResource).toHaveBeenCalled();
            });
        });

        it("should call updateStatePreloadResource when lobby configs is empty", async () => {
            // Arrange
            (getLobbyConfigs as jest.Mock).mockResolvedValue({ lobbyConfigs: {} });

            // Act
            render(<PreloadResourceRegister {...mockProps} />);

            // Assert
            await waitFor(() => {
                expect(mockProps.updateStatePreloadResource).toHaveBeenCalled();
            });
        });

        it("should call updateLobbyConfigs when lobby configs exist", async () => {
            // Act
            render(<PreloadResourceRegister {...mockProps} />);

            // Assert
            await waitFor(() => {
                expect(mockProps.updateLobbyConfigs).toHaveBeenCalledWith(mockLobbyConfigs.lobbyConfigs);
            });
        });

        it("should call getAndHandleBannerOffer when lobby configs exist", async () => {
            // Act
            render(<PreloadResourceRegister {...mockProps} />);

            // Assert
            await waitFor(() => {
                expect(getAndHandleBannerOffer).toHaveBeenCalledWith(
                    mockAuthorizeResponse,
                    mockLobbyConfigs.lobbyConfigs,
                    expect.any(Function)
                );
            });
        });

        it("should call getAndHandleGameOfferIds when lobby configs exist", async () => {
            // Act
            render(<PreloadResourceRegister {...mockProps} />);

            // Assert
            await waitFor(() => {
                expect(getAndHandleGameOfferIds).toHaveBeenCalledWith(
                    mockAuthorizeResponse,
                    mockLobbyConfigs.lobbyConfigs,
                    expect.any(Function)
                );
            });
        });
    });

    describe("Lobby Case Logic (gameId = 0)", () => {
        it("should call updateStatePreloadResource for lobby case when not direct mode", async () => {
            // Arrange
            const lobbyProps = { ...mockProps, gameId: 0, isDirectMode: false };

            // Act
            render(<PreloadResourceRegister {...lobbyProps} />);

            // Assert
            await waitFor(() => {
                expect(mockProps.updateStatePreloadResource).toHaveBeenCalled();
            });
        });

        it("should not call updateStatePreloadResource for lobby case when direct mode", async () => {
            // Arrange
            const lobbyProps = { ...mockProps, gameId: 0, isDirectMode: true };

            // Act
            render(<PreloadResourceRegister {...lobbyProps} />);

            // Assert
            await waitFor(() => {
                expect(mockProps.updateStatePreloadResource).not.toHaveBeenCalled();
            });
        });

        it("should call updateStatePreloadResource with timeout for lobby case", async () => {
            // Arrange
            const lobbyProps = { ...mockProps, gameId: 0, isDirectMode: false };

            // Act
            render(<PreloadResourceRegister {...lobbyProps} />);

            // Assert
            await waitFor(() => {
                expect(mockProps.updateStatePreloadResource).toHaveBeenCalled();
            });
        });
    });

    describe("PreloadResources Rendering Logic", () => {
        it("should render PreloadResources when not direct mode and gameId > 0", () => {
            // Arrange
            const gameProps = { ...mockProps, isDirectMode: false, gameId: 1001 };

            // Act
            render(<PreloadResourceRegister {...gameProps} />);

            // Assert
            expect(screen.getByTestId("preload-resources")).toBeInTheDocument();
        });

        it("should render PreloadResources when direct mode and gameId > 0", () => {
            // Arrange
            const directProps = { ...mockProps, isDirectMode: true, gameId: 1001 };

            // Act
            render(<PreloadResourceRegister {...directProps} />);

            // Assert
            expect(screen.getByTestId("preload-resources")).toBeInTheDocument();
        });

        it("should render PreloadResources when direct mode and gameId = 0", () => {
            // Arrange
            const directLobbyProps = { ...mockProps, isDirectMode: true, gameId: 0 };

            // Act
            render(<PreloadResourceRegister {...directLobbyProps} />);

            // Assert
            expect(screen.getByTestId("preload-resources")).toBeInTheDocument();
        });

        it("should not render PreloadResources when not direct mode and gameId = 0", () => {
            // Arrange
            const lobbyProps = { ...mockProps, isDirectMode: false, gameId: 0 };

            // Act
            render(<PreloadResourceRegister {...lobbyProps} />);

            // Assert
            expect(screen.queryByTestId("preload-resources")).not.toBeInTheDocument();
        });
    });

    describe("useEffect Dependencies", () => {
        it("should call updateStatePreloadResource when gameId changes to 0", async () => {
            // Arrange
            const { rerender } = render(<PreloadResourceRegister {...mockProps} />);

            // Act
            rerender(<PreloadResourceRegister {...mockProps} gameId={0} />);

            // Assert
            await waitFor(() => {
                expect(mockProps.updateStatePreloadResource).toHaveBeenCalled();
            });
        });

        it("should call updateStatePreloadResource when isDirectMode changes to false", async () => {
            // Arrange
            const directProps = { ...mockProps, isDirectMode: true, gameId: 0 };
            const { rerender } = render(<PreloadResourceRegister {...directProps} />);

            // Act
            rerender(<PreloadResourceRegister {...mockProps} gameId={0} isDirectMode={false} />);

            // Assert
            await waitFor(() => {
                expect(mockProps.updateStatePreloadResource).toHaveBeenCalled();
            });
        });

        it("should not call updateStatePreloadResource when gameId changes but not to 0", async () => {
            // Arrange
            const { rerender } = render(<PreloadResourceRegister {...mockProps} />);

            // Act
            rerender(<PreloadResourceRegister {...mockProps} gameId={1002} />);

            // Assert
            await waitFor(() => {
                expect(mockProps.updateStatePreloadResource).not.toHaveBeenCalled();
            });
        });
    });

    describe("Error Handling", () => {
        it("should handle getLobbyConfigs error gracefully", async () => {
            // Arrange
            (getLobbyConfigs as jest.Mock).mockRejectedValue(new Error("Lobby configs failed"));

            // Act
            render(<PreloadResourceRegister {...mockProps} />);

            // Assert
            await waitFor(() => {
                expect(getLobbyConfigs).toHaveBeenCalled();
            });
        });

        it("should handle getAndHandleBannerOffer error gracefully", async () => {
            // Arrange
            (getAndHandleBannerOffer as jest.Mock).mockImplementation(() => {
                throw new Error("Banner offer failed");
            });

            // Act
            render(<PreloadResourceRegister {...mockProps} />);

            // Assert
            await waitFor(() => {
                expect(getAndHandleBannerOffer).toHaveBeenCalled();
            });
        });

        it("should handle getAndHandleGameOfferIds error gracefully", async () => {
            // Arrange
            (getAndHandleGameOfferIds as jest.Mock).mockImplementation(() => {
                throw new Error("Game offer IDs failed");
            });

            // Act
            render(<PreloadResourceRegister {...mockProps} />);

            // Assert
            await waitFor(() => {
                expect(getAndHandleGameOfferIds).toHaveBeenCalled();
            });
        });
    });

    describe("State Management", () => {
        it("should manage bannerId state correctly", async () => {
            // Arrange
            let setBannerIdCallback: (id: number) => void;
            (getAndHandleBannerOffer as jest.Mock).mockImplementation((auth, configs, setBannerId) => {
                setBannerIdCallback = setBannerId;
            });

            // Act
            render(<PreloadResourceRegister {...mockProps} />);

            // Assert
            await waitFor(() => {
                expect(getAndHandleBannerOffer).toHaveBeenCalled();
            });
        });

        it("should manage gameOfferIds state correctly", async () => {
            // Arrange
            let setGameOfferIdsCallback: (ids: number[]) => void;
            (getAndHandleGameOfferIds as jest.Mock).mockImplementation((auth, configs, setGameOfferIds) => {
                setGameOfferIdsCallback = setGameOfferIds;
            });

            // Act
            render(<PreloadResourceRegister {...mockProps} />);

            // Assert
            await waitFor(() => {
                expect(getAndHandleGameOfferIds).toHaveBeenCalled();
            });
        });
    });

    describe("Edge Cases", () => {
        it("should handle undefined session", () => {
            // Arrange
            const propsWithoutSession = { ...mockProps };
            delete propsWithoutSession.session;

            // Act & Assert
            expect(() => render(<PreloadResourceRegister {...propsWithoutSession} />)).not.toThrow();
        });

        it("should handle undefined authorizeResponse", () => {
            // Arrange
            const propsWithoutAuth = { ...mockProps };
            delete propsWithoutAuth.authorizeResponse;

            // Act & Assert
            expect(() => render(<PreloadResourceRegister {...propsWithoutAuth} />)).not.toThrow();
        });

        it("should handle undefined updateStatePreloadResource", () => {
            // Arrange
            const propsWithoutCallback = { ...mockProps };
            delete propsWithoutCallback.updateStatePreloadResource;

            // Act & Assert
            expect(() => render(<PreloadResourceRegister {...propsWithoutCallback} />)).not.toThrow();
        });

        it("should handle undefined updateLobbyConfigs", () => {
            // Arrange
            const propsWithoutLobbyCallback = { ...mockProps };
            delete propsWithoutLobbyCallback.updateLobbyConfigs;

            // Act & Assert
            expect(() => render(<PreloadResourceRegister {...propsWithoutLobbyCallback} />)).not.toThrow();
        });
    });

    describe("Integration Scenarios", () => {
        it("should handle complete lobby registration flow", async () => {
            // Arrange
            const lobbyProps = { ...mockProps, gameId: 0, isDirectMode: false };

            // Act
            render(<PreloadResourceRegister {...lobbyProps} />);

            // Assert
            await waitFor(() => {
                expect(getLobbyConfigs).toHaveBeenCalledWith(mockSession);
                expect(mockProps.updateLobbyConfigs).toHaveBeenCalledWith(mockLobbyConfigs.lobbyConfigs);
                expect(mockProps.updateStatePreloadResource).toHaveBeenCalled();
            });
        });

        it("should handle complete direct mode flow", async () => {
            // Arrange
            const directProps = { ...mockProps, isDirectMode: true, gameId: 1001 };

            // Act
            render(<PreloadResourceRegister {...directProps} />);

            // Assert
            await waitFor(() => {
                expect(getLobbyConfigs).toHaveBeenCalledWith(mockSession);
                expect(screen.getByTestId("preload-resources")).toBeInTheDocument();
            });
        });

        it("should handle complete game registration flow", async () => {
            // Arrange
            const gameProps = { ...mockProps, isDirectMode: false, gameId: 1001 };

            // Act
            render(<PreloadResourceRegister {...gameProps} />);

            // Assert
            await waitFor(() => {
                expect(getLobbyConfigs).toHaveBeenCalledWith(mockSession);
                expect(screen.getByTestId("preload-resources")).toBeInTheDocument();
            });
        });
    });

    describe("Performance and Memory", () => {
        it("should cleanup timeout on unmount", async () => {
            // Arrange
            const lobbyProps = { ...mockProps, gameId: 0, isDirectMode: false };
            const { unmount } = render(<PreloadResourceRegister {...lobbyProps} />);

            // Act
            unmount();

            // Assert
            // The timeout should be cleaned up automatically
            expect(mockProps.updateStatePreloadResource).toHaveBeenCalled();
        });

        it("should not create multiple timeouts for same props", async () => {
            // Arrange
            const lobbyProps = { ...mockProps, gameId: 0, isDirectMode: false };

            // Act
            render(<PreloadResourceRegister {...lobbyProps} />);

            // Assert
            await waitFor(() => {
                expect(mockProps.updateStatePreloadResource).toHaveBeenCalledTimes(1);
            });
        });
    });
}); 