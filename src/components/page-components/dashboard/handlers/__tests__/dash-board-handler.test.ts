import { DashboardHandler } from "../dash-board-handler";
import { StorageHelper, localStorageKeys } from "../../../../../_shared/helpers";
import { URLContextModel } from "../../../../../_shared/react-contexts";

// Mock the dependencies
jest.mock("../../../../../_shared/helpers", () => ({
    StorageHelper: {
        get: jest.fn(),
    },
    localStorageKeys: {
        url: "url",
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

    beforeEach(() => {
        const { loadURLContext } = require("../../../../../_shared/react-contexts");
        (loadURLContext as jest.Mock).mockReturnValue({ gameId: 0, isDirectMode: false });
        const { getAppSettings } = require("../../../../../_shared/app-settings");
        (getAppSettings as jest.Mock).mockReturnValue({ gameSettings: {} });
        mockProps = {
            authorizeResponse: {
                user: {
                    offerGames: [1001, 1002, 1003],
                },
            },
            queryGame: 1001,
            directMode: false,
            lobbyConfigs: {},
            session: {},
        };

        dashboardHandler = new DashboardHandler(mockProps, jest.fn());
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
    });
}); 