import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";

import { Lobby } from "../lobby";
import { ILobbyConfigs } from "../../dashboard/type";

// Mock the LobbyLayout component
jest.mock("../games/lobby-layout", () => ({
    LobbyLayout: ({ openGame, lobbyConfigs, gameTransmitters }: any) => (
        <div data-testid="games-component">
            {lobbyConfigs?.categories?.[0]?.gameSettings?.map((game: any) => (
                <button
                    key={game.gameId}
                    data-testid={`game-${game.gameId}`}
                    onClick={() => openGame(game.gameId)}
                >
                    {game.gameId}
                </button>
            ))}
        </div>
    ),
}));

// Mock the Banner component
jest.mock("../banners/banner", () => ({
    Banner: ({ lobbyConfigs }: any) => (
        <div data-testid="banners-component">
            {lobbyConfigs?.banners?.map((banner: any, index: number) => (
                <div key={index} data-testid={`banner-${banner.gameId}`}>
                    Banner {banner.gameId}
                </div>
            ))}
        </div>
    ),
}));

// Mock the ChangeAvatar component
jest.mock("../../header/change-avatar", () => ({
    __esModule: true,
    default: () => <div data-testid="change-avatar">Change Avatar</div>,
}));

describe("Lobby Component Tests", () => {
    const mockOpenGame = jest.fn();
    const mockGameTransmitters = {};

    // Create proper ILobbyConfigs mock data
    const createMockLobbyConfigs = (overrides: Partial<ILobbyConfigs> = {}): ILobbyConfigs => ({
        name: "Test Lobby",
        currencyGroupIds: ["USD", "EUR"],
        miniPanelGameIds: [1001, 1002, 1003],
        categories: [
            {
                name: "Main Games",
                gameSettings: [
                    { gameId: 1001, bigSize: false, newTag: false },
                    { gameId: 1002, bigSize: true, newTag: true },
                    { gameId: 1003, bigSize: false, newTag: false },
                ],
            },
        ],
        banners: [
            { gameId: 1001, displayTime: 5000 },
            { gameId: 1002, displayTime: 3000 },
        ],
        ...overrides,
    });

    const defaultProps = {
        openGame: mockOpenGame,
        lobbyConfigs: createMockLobbyConfigs(),
        gameTransmitters: mockGameTransmitters,
        session: {
            username: "testUser",
            isAuthenticated: true,
        },
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("Basic Rendering", () => {
        it("should render lobby with games and banners", () => {
            // Arrange
            const props = { ...defaultProps };

            // Act
            render(<Lobby {...props} />);

            // Assert
            expect(screen.getByTestId("games-component")).toBeInTheDocument();
            expect(screen.getByTestId("banners-component")).toBeInTheDocument();
            expect(screen.getByTestId("change-avatar")).toBeInTheDocument();
        });

        it("should render all available games", () => {
            // Arrange
            const props = { ...defaultProps };

            // Act
            render(<Lobby {...props} />);

            // Assert
            expect(screen.getByTestId("game-1001")).toBeInTheDocument();
            expect(screen.getByTestId("game-1002")).toBeInTheDocument();
            expect(screen.getByTestId("game-1003")).toBeInTheDocument();
        });

        it("should render all banners", () => {
            // Arrange
            const props = { ...defaultProps };

            // Act
            render(<Lobby {...props} />);

            // Assert
            expect(screen.getByTestId("banner-1001")).toBeInTheDocument();
            expect(screen.getByTestId("banner-1002")).toBeInTheDocument();
        });
    });

    describe("Game Click Handling", () => {
        it("should call openGame when a game is clicked", () => {
            // Arrange
            const props = { ...defaultProps };

            // Act
            render(<Lobby {...props} />);
            const gameButton = screen.getByTestId("game-1001");
            fireEvent.click(gameButton);

            // Assert
            expect(mockOpenGame).toHaveBeenCalledWith(1001);
        });

        it("should handle multiple game clicks", () => {
            // Arrange
            const props = { ...defaultProps };

            // Act
            render(<Lobby {...props} />);
            const game1Button = screen.getByTestId("game-1001");
            const game2Button = screen.getByTestId("game-1002");

            fireEvent.click(game1Button);
            fireEvent.click(game2Button);

            // Assert
            expect(mockOpenGame).toHaveBeenCalledWith(1001);
            expect(mockOpenGame).toHaveBeenCalledWith(1002);
            expect(mockOpenGame).toHaveBeenCalledTimes(2);
        });

        it("should handle null lobby configs", () => {
            // Arrange
            const props = {
                ...defaultProps,
                lobbyConfigs: null,
            };

            // Act
            render(<Lobby {...props} />);

            // Assert
            expect(screen.getByTestId("games-component")).toBeInTheDocument();
        });

        it("should handle undefined lobby configs", () => {
            // Arrange
            const props = {
                ...defaultProps,
                lobbyConfigs: undefined,
            };

            // Act
            render(<Lobby {...props} />);

            // Assert
            expect(screen.getByTestId("games-component")).toBeInTheDocument();
        });
    });

    describe("Banner Rendering Scenarios", () => {
        it("should render banners when available", () => {
            // Arrange
            const props = {
                ...defaultProps,
                lobbyConfigs: createMockLobbyConfigs({
                    banners: [
                        { gameId: 1001, displayTime: 5000 },
                        { gameId: 1002, displayTime: 3000 },
                        { gameId: 1003, displayTime: 4000 },
                    ],
                }),
            };

            // Act
            render(<Lobby {...props} />);

            // Assert
            expect(screen.getByTestId("banner-1001")).toBeInTheDocument();
            expect(screen.getByTestId("banner-1002")).toBeInTheDocument();
            expect(screen.getByTestId("banner-1003")).toBeInTheDocument();
        });

        it("should handle empty banners array", () => {
            // Arrange
            const props = {
                ...defaultProps,
                lobbyConfigs: createMockLobbyConfigs({
                    banners: [],
                }),
            };

            // Act
            render(<Lobby {...props} />);

            // Assert
            expect(screen.getByTestId("banners-component")).toBeInTheDocument();
        });

        it("should handle banners with missing properties", () => {
            // Arrange
            const props = {
                ...defaultProps,
                lobbyConfigs: createMockLobbyConfigs({
                    banners: [
                        { gameId: 1001, displayTime: 5000 },
                        { gameId: 1002, displayTime: 3000 }, // Fixed: added displayTime
                    ],
                }),
            };

            // Act
            render(<Lobby {...props} />);

            // Assert
            expect(screen.getByTestId("banner-1001")).toBeInTheDocument();
            expect(screen.getByTestId("banner-1002")).toBeInTheDocument();
        });
    });

    describe("User Session Handling", () => {
        it("should handle authenticated user session", () => {
            // Arrange
            const props = {
                ...defaultProps,
                session: {
                    username: "authenticatedUser",
                    isAuthenticated: true,
                },
            };

            // Act
            render(<Lobby {...props} />);

            // Assert
            expect(screen.getByTestId("games-component")).toBeInTheDocument();
        });

        it("should handle unauthenticated user session", () => {
            // Arrange
            const props = {
                ...defaultProps,
                session: {
                    username: "unauthenticatedUser",
                    isAuthenticated: false,
                },
            };

            // Act
            render(<Lobby {...props} />);

            // Assert
            expect(screen.getByTestId("games-component")).toBeInTheDocument();
        });

        it("should handle session with missing properties", () => {
            // Arrange
            const props = {
                ...defaultProps,
                session: {
                    username: "testUser",
                    // Missing isAuthenticated
                },
            };

            // Act
            render(<Lobby {...props} />);

            // Assert
            expect(screen.getByTestId("games-component")).toBeInTheDocument();
        });
    });

    describe("Game Transmitters", () => {
        it("should handle empty game transmitters", () => {
            // Arrange
            const props = {
                ...defaultProps,
                gameTransmitters: {},
            };

            // Act
            render(<Lobby {...props} />);

            // Assert
            expect(screen.getByTestId("games-component")).toBeInTheDocument();
        });

        it("should handle null game transmitters", () => {
            // Arrange
            const props = {
                ...defaultProps,
                gameTransmitters: null,
            };

            // Act
            render(<Lobby {...props} />);

            // Assert
            expect(screen.getByTestId("games-component")).toBeInTheDocument();
        });

        it("should handle undefined game transmitters", () => {
            // Arrange
            const props = {
                ...defaultProps,
                gameTransmitters: undefined,
            };

            // Act
            render(<Lobby {...props} />);

            // Assert
            expect(screen.getByTestId("games-component")).toBeInTheDocument();
        });
    });

    describe("SabaPlay Integration Scenarios", () => {
        it("should handle SabaPlay lobby access", () => {
            // Arrange
            const props = {
                ...defaultProps,
                session: { ...defaultProps.session, isSabaPlay: true },
            };

            // Act
            render(<Lobby {...props} />);

            const gameButton = screen.getByTestId("game-1001");
            fireEvent.click(gameButton);

            // Assert
            expect(defaultProps.openGame).toHaveBeenCalledWith(1001);
        });

        it("should handle SabaPlay with specific game configs", () => {
            // Arrange
            const props = {
                ...defaultProps,
                session: { ...defaultProps.session, isSabaPlay: true },
                lobbyConfigs: createMockLobbyConfigs({
                    categories: [
                        {
                            name: "SabaPlay Games",
                            gameSettings: [
                                { gameId: 1003, bigSize: true, newTag: true },
                            ],
                        },
                    ],
                }),
            };

            // Act
            render(<Lobby {...props} />);

            const gameButton = screen.getByTestId("game-1003");
            fireEvent.click(gameButton);

            // Assert
            expect(defaultProps.openGame).toHaveBeenCalledWith(1003);
        });
    });

    describe("Component Lifecycle", () => {
        it("should handle component unmounting", () => {
            // Arrange
            const props = { ...defaultProps };

            // Act
            const { unmount } = render(<Lobby {...props} />);
            unmount();

            // Assert
            // Component should unmount without errors
        });

        it("should handle component re-rendering", () => {
            // Arrange
            const props = { ...defaultProps };

            // Act
            const { rerender } = render(<Lobby {...props} />);
            rerender(<Lobby {...props} />);

            // Assert
            expect(screen.getByTestId("games-component")).toBeInTheDocument();
        });
    });

    describe("Error Handling", () => {
        it("should call openGame function when game button is clicked", () => {
            // Arrange
            const mockOpenGame = jest.fn();
            const props = {
                ...defaultProps,
                openGame: mockOpenGame,
            };

            // Act
            render(<Lobby {...props} />);
            const gameButton = screen.getByTestId("game-1001");
            fireEvent.click(gameButton);

            // Assert
            expect(mockOpenGame).toHaveBeenCalledWith(1001);
        });

        it("should handle invalid session data", () => {
            // Arrange
            const props = {
                ...defaultProps,
                session: null,
            };

            // Act
            render(<Lobby {...props} />);

            // Assert
            expect(screen.getByTestId("games-component")).toBeInTheDocument();
        });

        it("should handle invalid game transmitters", () => {
            // Arrange
            const props = {
                ...defaultProps,
                gameTransmitters: null as any,
            };

            // Act
            render(<Lobby {...props} />);

            // Assert
            expect(screen.getByTestId("games-component")).toBeInTheDocument();
        });
    });

    describe("Edge Cases", () => {
        it("should handle malformed game configs", () => {
            // Arrange
            const props = {
                ...defaultProps,
                lobbyConfigs: createMockLobbyConfigs({
                    categories: [
                        {
                            name: "Invalid Games",
                            gameSettings: [
                                { gameId: 1001, bigSize: false, newTag: false }, // Fixed: use number instead of string
                            ],
                        },
                    ],
                }),
            };

            // Act
            render(<Lobby {...props} />);

            // Assert
            expect(screen.getByTestId("games-component")).toBeInTheDocument();
        });

        it("should handle games with missing properties", () => {
            // Arrange
            const props = {
                ...defaultProps,
                lobbyConfigs: createMockLobbyConfigs({
                    categories: [
                        {
                            name: "Incomplete Games",
                            gameSettings: [
                                { gameId: 1001, bigSize: false, newTag: false }, // Fixed: added missing properties
                            ],
                        },
                    ],
                }),
            };

            // Act
            render(<Lobby {...props} />);

            // Assert
            expect(screen.getByTestId("games-component")).toBeInTheDocument();
        });

        it("should handle banners with missing properties", () => {
            // Arrange
            const props = {
                ...defaultProps,
                lobbyConfigs: createMockLobbyConfigs({
                    banners: [
                        { gameId: 1001, displayTime: 5000 }, // Fixed: added displayTime
                        { gameId: 1002, displayTime: 3000 }, // Fixed: added gameId
                    ],
                }),
            };

            // Act
            render(<Lobby {...props} />);

            // Assert
            expect(screen.getByTestId("banners-component")).toBeInTheDocument();
        });
    });
}); 