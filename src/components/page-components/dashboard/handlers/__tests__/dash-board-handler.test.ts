import { DashboardHandler } from "../dash-board-handler";
import { StorageHelper, localStorageKeys, getLobbyGameIds, getOfferGamesIds } from "../../../../../_shared/helpers";
import { URLContextModel } from "../../../../../_shared/react-contexts";

// Mock the dependencies
jest.mock("../../../../../_shared/helpers", () => ({
    StorageHelper: {
        get: jest.fn(),
        set: jest.fn(),
    },
    localStorageKeys: {
        url: "url",
        latestGameId: "latestGameId",
    },
    getLobbyGameIds: jest.fn(),
    getOfferGamesIds: jest.fn(),
}));

jest.mock("../../../../../_shared/react-contexts", () => ({
    URLContextModel: jest.fn(),
    loadURLContext: jest.fn(),
}));

jest.mock("../../../../../_shared/app-settings", () => ({
    getAppSettings: jest.fn(),
}));

jest.mock("../../../lobby/lobby-socket-connection", () => ({
    LobbySocketConnection: jest.fn().mockImplementation(() => ({
        initLobbySocket: jest.fn(),
        getSocket: jest.fn(),
        getTransmitters: jest.fn(),
        unsubscribeGame: jest.fn(),
        signInGame: jest.fn(),
        initGameTransmitter: jest.fn(),
        closeSocket: jest.fn(),
    })),
}));

describe("DashboardHandler", () => {
    let dashboardHandler: DashboardHandler;
    let mockProps: any;
    let mockUpdateGameTransmitters: jest.Mock;

    beforeEach(() => {
        // Mock loadURLContext
        const { loadURLContext } = require("../../../../../_shared/react-contexts");
        (loadURLContext as jest.Mock).mockReturnValue({
            gameId: 0,
            isDirectMode: false,
            isSabaPlay: false
        });

        // Mock getAppSettings
        const { getAppSettings } = require("../../../../../_shared/app-settings");
        (getAppSettings as jest.Mock).mockReturnValue({
            gameSettings: {
                1001: { gameName: "Game1" },
                1002: { gameName: "Game2" },
                1003: { gameName: "Game3" },
            }
        });

        // Mock helper functions
        (getOfferGamesIds as jest.Mock).mockReturnValue([1001, 1002, 1003]);
        (getLobbyGameIds as jest.Mock).mockReturnValue([1001, 1002, 1003]);

        mockUpdateGameTransmitters = jest.fn();
        mockProps = {
            authorizeResponse: {
                user: {
                    offerGames: [1001, 1002, 1003],
                },
            },
            queryGame: 1001,
            directMode: false,
            lobbyConfigs: {
                gameSettings: {
                    1001: { id: 1001, gameName: "Game1" },
                    1002: { id: 1002, gameName: "Game2" },
                    1003: { id: 1003, gameName: "Game3" },
                }
            },
            session: { id: "session123" },
        };

        dashboardHandler = new DashboardHandler(mockProps, mockUpdateGameTransmitters);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("shouldRenderGames", () => {
        it("should return false when openGameId is 0 (lobby case)", () => {
            // Arrange
            const offerGames = [1001, 1002, 1003];
            const openGameId = 0;

            // Act
            const result = dashboardHandler.shouldRenderGames(offerGames, openGameId);

            // Assert
            expect(result).toBe(false);
        });

        it("should return true when openGameId is in offerGames and not backToLobby", () => {
            // Arrange
            const offerGames = [1001, 1002, 1003];
            const openGameId = 1001;
            (StorageHelper.get as jest.Mock).mockReturnValue({
                backToLobby: false,
                gameId: 0,
            });

            // Act
            const result = dashboardHandler.shouldRenderGames(offerGames, openGameId);

            // Assert
            expect(result).toBe(true);
        });

        it("should return false when openGameId is in offerGames but backToLobby is true", () => {
            // Arrange
            const offerGames = [1001, 1002, 1003];
            const openGameId = 1001;
            (StorageHelper.get as jest.Mock).mockReturnValue({
                backToLobby: true,
                gameId: 0,
            });

            // Act
            const result = dashboardHandler.shouldRenderGames(offerGames, openGameId);

            // Assert
            expect(result).toBe(false);
        });

        it("should return true when ssoRedirectGameId > 0", () => {
            // Arrange
            const offerGames = [1001, 1002, 1003];
            const openGameId = 999; // Not in offerGames
            (StorageHelper.get as jest.Mock).mockReturnValue({
                backToLobby: false,
                gameId: 1001, // > 0
            });

            // Act
            const result = dashboardHandler.shouldRenderGames(offerGames, openGameId);

            // Assert
            expect(result).toBe(true);
        });

        it("should return false when openGameId is not in offerGames and ssoRedirectGameId is 0", () => {
            // Arrange
            const offerGames = [1001, 1002, 1003];
            const openGameId = 999; // Not in offerGames
            (StorageHelper.get as jest.Mock).mockReturnValue({
                backToLobby: false,
                gameId: 0,
            });

            // Act
            const result = dashboardHandler.shouldRenderGames(offerGames, openGameId);

            // Assert
            expect(result).toBe(false);
        });

        it("should handle undefined urlContextModel", () => {
            // Arrange
            const offerGames = [1001, 1002, 1003];
            const openGameId = 1001;
            (StorageHelper.get as jest.Mock).mockReturnValue(undefined);

            // Act
            const result = dashboardHandler.shouldRenderGames(offerGames, openGameId);

            // Assert
            expect(result).toBe(true);
        });
    });

    describe("checkIsNotOfferGame", () => {
        it("should return true when directMode and queryGame not in offerGames", () => {
            // Arrange
            mockProps.directMode = true;
            mockProps.queryGame = 999;
            dashboardHandler = new DashboardHandler(mockProps, mockUpdateGameTransmitters);

            // Act
            const result = dashboardHandler.checkIsNotOfferGame();

            // Assert
            expect(result).toBe(true);
        });

        it("should return false when directMode and queryGame in offerGames", () => {
            // Arrange
            mockProps.directMode = true;
            mockProps.queryGame = 1001;
            dashboardHandler = new DashboardHandler(mockProps, mockUpdateGameTransmitters);

            // Act
            const result = dashboardHandler.checkIsNotOfferGame();

            // Assert
            expect(result).toBe(false);
        });

        it("should return true when user has no offerGames", () => {
            // Arrange
            mockProps.authorizeResponse.user.offerGames = [];
            dashboardHandler = new DashboardHandler(mockProps, mockUpdateGameTransmitters);

            // Act
            const result = dashboardHandler.checkIsNotOfferGame();

            // Assert
            expect(result).toBe(true);
        });

        it("should return true when no lobby games available", () => {
            // Arrange
            (getLobbyGameIds as jest.Mock).mockReturnValue([]);
            dashboardHandler = new DashboardHandler(mockProps, mockUpdateGameTransmitters);

            // Act
            const result = dashboardHandler.checkIsNotOfferGame();

            // Assert
            expect(result).toBe(true);
        });

        it("should return false when user has offerGames and lobby games available", () => {
            // Arrange
            dashboardHandler = new DashboardHandler(mockProps, mockUpdateGameTransmitters);

            // Act
            const result = dashboardHandler.checkIsNotOfferGame();

            // Assert
            expect(result).toBe(false);
        });
    });

    describe("getLobbyGamesIds", () => {
        it("should return filtered lobby games that are in offerGames", () => {
            // Arrange
            (getOfferGamesIds as jest.Mock).mockReturnValue([1001, 1002]);
            (getLobbyGameIds as jest.Mock).mockReturnValue([1001, 1002, 1003]);

            // Act
            const result = dashboardHandler.getLobbyGamesIds();

            // Assert
            expect(result).toEqual([1001, 1002]);
        });

        it("should return empty array when no lobby games match offerGames", () => {
            // Arrange
            (getOfferGamesIds as jest.Mock).mockReturnValue([1001, 1002]);
            (getLobbyGameIds as jest.Mock).mockReturnValue([1003, 1004]);

            // Act
            const result = dashboardHandler.getLobbyGamesIds();

            // Assert
            expect(result).toEqual([]);
        });

        it("should handle undefined lobbyConfigs", () => {
            // Arrange
            mockProps.lobbyConfigs = undefined;
            (getLobbyGameIds as jest.Mock).mockReturnValue(undefined);
            dashboardHandler = new DashboardHandler(mockProps, mockUpdateGameTransmitters);

            // Act
            const result = dashboardHandler.getLobbyGamesIds();

            // Assert
            expect(result).toBeUndefined();
        });
    });

    describe("removeGameTransmitter", () => {
        it("should call unsubscribeGame on lobbyConnection", () => {
            // Arrange
            const gameId = 1001;

            // Act
            dashboardHandler.removeGameTransmitter(gameId);

            // Assert
            expect(dashboardHandler.lobbyConnection.unsubscribeGame).toHaveBeenCalledWith(gameId);
        });
    });

    describe("reconnectGameTransmitter", () => {
        it("should call signInGame and initGameTransmitter", () => {
            // Arrange
            const gameId = 1001;
            const mockTransmitter = { id: "transmitter1" };
            (dashboardHandler.lobbyConnection.signInGame as jest.Mock).mockReturnValue(undefined);
            (dashboardHandler.lobbyConnection.initGameTransmitter as jest.Mock).mockReturnValue(mockTransmitter);

            // Act
            const result = dashboardHandler.reconnectGameTransmitter(gameId);

            // Assert
            expect(dashboardHandler.lobbyConnection.signInGame).toHaveBeenCalledWith(mockProps.session, gameId);
            expect(dashboardHandler.lobbyConnection.initGameTransmitter).toHaveBeenCalledWith(gameId);
            expect(result).toBe(mockTransmitter);
        });
    });

    describe("getOfferGamesIds", () => {
        it("should return offer games from authorizeResponse", () => {
            // Act
            const result = dashboardHandler.getOfferGamesIds();

            // Assert
            expect(result).toEqual([1001, 1002, 1003]);
            expect(getOfferGamesIds).toHaveBeenCalledWith(mockProps.authorizeResponse);
        });
    });

    describe("buildLobbyConnectionContextValue", () => {
        it("should return correct context value", () => {
            // Arrange
            const mockSocket = { id: "socket1" };
            const mockTransmitters = { 1001: { id: "transmitter1" } };
            (dashboardHandler.lobbyConnection.getSocket as jest.Mock).mockReturnValue(mockSocket);
            (dashboardHandler.lobbyConnection.getTransmitters as jest.Mock).mockReturnValue(mockTransmitters);

            // Act
            const result = dashboardHandler.buildLobbyConnectionContextValue();

            // Assert
            expect(result).toEqual({
                socket: mockSocket,
                gameTransmitters: mockTransmitters,
                removeGameTransmitter: dashboardHandler.removeGameTransmitter,
                reconnectGameTransmitter: dashboardHandler.reconnectGameTransmitter,
            });
        });
    });

    describe("connectLobbySocket", () => {
        it("should not connect when isDirectMode is true", async () => {
            // Arrange
            const { loadURLContext } = require("../../../../../_shared/react-contexts");
            (loadURLContext as jest.Mock).mockReturnValue({
                gameId: 1001,
                isDirectMode: true
            });

            // Create a new instance with the updated mock
            const newDashboardHandler = new DashboardHandler(mockProps, mockUpdateGameTransmitters);

            // Act
            await newDashboardHandler.connectLobbySocket();

            // Assert
            expect(newDashboardHandler.lobbyConnection.initLobbySocket).not.toHaveBeenCalled();
        });

        it("should not connect when no lobby games available", async () => {
            // Arrange
            const { loadURLContext } = require("../../../../../_shared/react-contexts");
            (loadURLContext as jest.Mock).mockReturnValue({
                gameId: 1001,
                isDirectMode: false
            });

            // Mock getAppSettings to return empty gameSettings
            const { getAppSettings } = require("../../../../../_shared/app-settings");
            (getAppSettings as jest.Mock).mockReturnValue({
                gameSettings: {}
            });

            // Mock getLobbyGameIds to return empty array
            (getLobbyGameIds as jest.Mock).mockReturnValue([]);

            // Create a new instance with the updated mocks
            const newDashboardHandler = new DashboardHandler(mockProps, mockUpdateGameTransmitters);

            // Act
            await newDashboardHandler.connectLobbySocket();

            // Assert
            expect(newDashboardHandler.lobbyConnection.initLobbySocket).not.toHaveBeenCalled();
        });

        it("should connect when lobby games are available", async () => {
            // Arrange
            const { loadURLContext } = require("../../../../../_shared/react-contexts");
            (loadURLContext as jest.Mock).mockReturnValue({
                gameId: 1001,
                isDirectMode: false
            });

            // Mock getAppSettings to include game settings
            const { getAppSettings } = require("../../../../../_shared/app-settings");
            (getAppSettings as jest.Mock).mockReturnValue({
                gameSettings: {
                    1002: { gameName: "Game2" },
                    1003: { gameName: "Game3" },
                }
            });

            // Mock getLobbyGameIds to return available games
            (getLobbyGameIds as jest.Mock).mockReturnValue([1002, 1003]);

            // Create a new instance with the updated mocks
            const newDashboardHandler = new DashboardHandler(mockProps, mockUpdateGameTransmitters);

            // Act
            await newDashboardHandler.connectLobbySocket();

            // Assert
            expect(newDashboardHandler.lobbyConnection.initLobbySocket).toHaveBeenCalledWith(
                mockProps.session,
                [1002, 1003]
            );
            expect(mockUpdateGameTransmitters).toHaveBeenCalled();
        });
    });

    describe("reset", () => {
        it("should close lobby socket", () => {
            // Act
            dashboardHandler.reset();

            // Assert
            expect(dashboardHandler.lobbyConnection.closeSocket).toHaveBeenCalled();
        });
    });
}); 