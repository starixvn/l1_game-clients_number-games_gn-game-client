import { DashboardHandler } from '../dash-board-handler';
import { getAppSettings } from '../../../../../_shared/app-settings';
import { getLobbyGameIds, getOfferGamesIds, StorageHelper, localStorageKeys } from '../../../../../_shared/helpers';
import { loadURLContext } from '../../../../../_shared/react-contexts';
import { TolgeeInstance } from '@tolgee/core';
import { SSOResponse, AuthorizeResponse } from 'sc-user-service-client/dist/auth';
import { ILobbyConfigs } from '../../type';

// Mock LobbySocketConnection
jest.mock('../../../lobby/lobby-socket-connection', () => ({
    LobbySocketConnection: jest.fn().mockImplementation(() => ({
        initLobbySocket: jest.fn(),
        getSocket: jest.fn(),
        getTransmitters: jest.fn(),
        unsubscribeGame: jest.fn(),
        signInGame: jest.fn(),
        initGameTransmitter: jest.fn(),
        closeSocket: jest.fn(),
    }))
}));

// Mock dependencies
jest.mock('../../../../../_shared/app-settings', () => ({
    getAppSettings: jest.fn().mockReturnValue({
        appType: 'test',
        gameSettings: {
            1001: { id: 1001, name: 'Game 1' },
            1002: { id: 1002, name: 'Game 2' },
            1003: { id: 1003, name: 'Game 3' }
        }
    })
}));
jest.mock('../../../../../_shared/helpers', () => ({
    getLobbyGameIds: jest.fn().mockReturnValue([1001, 1002]),
    getOfferGamesIds: jest.fn().mockReturnValue([1001, 1002]),
    StorageHelper: {
        get: jest.fn(),
        set: jest.fn()
    },
    localStorageKeys: {
        url: 'url',
        latestGameId: 'latestGameId'
    }
}));
jest.mock('../../../../../_shared/react-contexts', () => ({
    loadURLContext: jest.fn().mockReturnValue({
        gameId: 0,
        isDirectMode: false
    })
}));

const mockGetAppSettings = getAppSettings as jest.MockedFunction<typeof getAppSettings>;
const mockGetLobbyGameIds = getLobbyGameIds as jest.MockedFunction<typeof getLobbyGameIds>;
const mockGetOfferGamesIds = getOfferGamesIds as jest.MockedFunction<typeof getOfferGamesIds>;

// Set up the mock implementation
mockGetAppSettings.mockReturnValue({
    appType: 1,
    serverDomainMapper: [],
    socketGatewayPath: '',
    proxy: { ssl: '', subDomain: '', path: '' },
    sentry: {
        dsn: 'test-dsn',
        environment: 'test'
    },
    gameSettings: {
        1001: { id: 1001, gameName: 'Game 1', gameResourceConfigs: { path: 'test' } },
        1002: { id: 1002, gameName: 'Game 2', gameResourceConfigs: { path: 'test' } },
        1003: { id: 1003, gameName: 'Game 3', gameResourceConfigs: { path: 'test' } }
    },
    subGuideDomain: '',
    googleAnalyticId: '',
    enableMsgpackParser: false,
    system: '',
    useTolgeeStatic: false,
    enableDebugLogs: false,
    gamePath: ''
});
const mockStorageHelper = StorageHelper as jest.Mocked<typeof StorageHelper>;
const mockLoadURLContext = loadURLContext as jest.MockedFunction<typeof loadURLContext>;
const MockLobbySocketConnection = jest.fn().mockImplementation(() => ({
    initLobbySocket: jest.fn(),
    getSocket: jest.fn(),
    getTransmitters: jest.fn(),
    unsubscribeGame: jest.fn(),
    signInGame: jest.fn(),
    initGameTransmitter: jest.fn(),
    closeSocket: jest.fn(),
}));

describe('DashboardHandler', () => {
    // Arrange: Common test setup
    const defaultProps = {
        router: {
            push: jest.fn(),
            query: {},
            route: "/",
            pathname: "/",
            asPath: "/",
            basePath: "",
            isLocaleDomain: false,
            isReady: true,
            isPreview: false,
            isFallback: false,
            defaultLocale: "en",
            domainLocales: [],
            locale: "en",
            locales: ["en"],
            events: {
                on: jest.fn(),
                off: jest.fn(),
                emit: jest.fn(),
            },
            beforePopState: jest.fn(),
            prefetch: jest.fn(),
            reload: jest.fn(),
            back: jest.fn(),
            forward: jest.fn(),
            replace: jest.fn(),
        },
        session: {
            isAuthenticated: true,
            username: 'testuser',
            language: 'en',
            ss: 'test-session-token',
            memberName: 'testuser',
            isUM: false,
            umInfo: null,
            system: 1
        } as SSOResponse,
        queryGame: 1001,
        directMode: false,
        setIsUm: jest.fn(),
        tolgee: {} as TolgeeInstance,
        authorizeResponse: {
            authorized: true,
            user: {
                UID: 1,
                id: 1,
                username: 'testuser',
                avatarId: 1,
                currency: 'USD',
                name: 'Test User',
                red: 1000,
                settings: { theme: 'light' },
                isSignedInSM: true,
                isDisplayPlayerCurrency: true,
                offerGames: [
                    { gameId: 1001, minBet: 1, maxBet: 1000, maxBetPerChoices: {} },
                    { gameId: 1002, minBet: 1, maxBet: 1000, maxBetPerChoices: {} }
                ],
                balance: 1000,
                fractionalOddsFormat: false,
                enableQuickBet: true,
                enabledGameIds: [1001, 1002],
                availSpins: 0,
                scoins: 0,
            },
            errorCode: null,
            umInfo: null,
            isUM: false
        } as AuthorizeResponse,
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

    beforeEach(() => {
        jest.clearAllMocks();
        mockGetAppSettings.mockReturnValue({
            appType: 1,
            serverDomainMapper: [],
            socketGatewayPath: '',
            proxy: { ssl: '', subDomain: '', path: '' },
            sentry: {
                dsn: 'test-dsn',
                environment: 'test'
            },
            gameSettings: {
                1001: { id: 1001, gameName: 'Game 1', gameResourceConfigs: { path: 'test' } },
                1002: { id: 1002, gameName: 'Game 2', gameResourceConfigs: { path: 'test' } },
                1003: { id: 1003, gameName: 'Game 3', gameResourceConfigs: { path: 'test' } }
            },
            subGuideDomain: '',
            googleAnalyticId: '',
            enableMsgpackParser: false,
            system: '',
            useTolgeeStatic: false,
            enableDebugLogs: false,
            gamePath: ''
        });
        mockGetLobbyGameIds.mockReturnValue([1001, 1002]);
        mockGetOfferGamesIds.mockReturnValue([1001, 1002]);
        mockLoadURLContext.mockReturnValue({
            gameId: 1001,
            isDirectMode: false,
            isSabaPlay: false,
            token: 'test-token',
            language: 'en',
            firstSSOToLobby: false,
        });
    });

    describe('Constructor', () => {
        it('should initialize with valid props', () => {
            // Act
            const handler = new DashboardHandler(defaultProps, jest.fn());

            // Assert
            expect(handler).toBeInstanceOf(DashboardHandler);
            expect(handler.lobbyConnection).toBeDefined();
        });

        it('should accept existing lobby connection', () => {
            // Arrange
            const existingConnection = new MockLobbySocketConnection();

            // Act
            const handler = new DashboardHandler(defaultProps, jest.fn(), existingConnection);

            // Assert
            expect(handler.lobbyConnection).toBe(existingConnection);
        });
    });

    describe('checkIsNotOfferGame', () => {
        it('should return true for direct mode when game is not in offer games', () => {
            // Arrange
            const props = { ...defaultProps, directMode: true, queryGame: 9999 };
            const handler = new DashboardHandler(props, jest.fn());

            // Act
            const result = handler.checkIsNotOfferGame();

            // Assert
            expect(result).toBe(true);
        });

        it('should return false for direct mode when game is in offer games', () => {
            // Arrange
            const props = { ...defaultProps, directMode: true, queryGame: 1001 };
            const handler = new DashboardHandler(props, jest.fn());

            // Act
            const result = handler.checkIsNotOfferGame();

            // Assert
            expect(result).toBe(false);
        });

        it('should return false for direct mode when queryGame is 0 (lobby)', () => {
            // Arrange
            const props = { ...defaultProps, directMode: true, queryGame: 0 };
            const handler = new DashboardHandler(props, jest.fn());

            // Act
            const result = handler.checkIsNotOfferGame();

            // Assert
            expect(result).toBe(false);
        });

        it('should return true for non-direct mode when no offer games', () => {
            // Arrange
            const props = {
                ...defaultProps,
                directMode: false,
                authorizeResponse: {
                    ...defaultProps.authorizeResponse,
                    user: { ...defaultProps.authorizeResponse.user, offerGames: [] }
                }
            };
            const handler = new DashboardHandler(props, jest.fn());

            // Act
            const result = handler.checkIsNotOfferGame();

            // Assert
            expect(result).toBe(true);
        });

        it('should return true for non-direct mode when no lobby games', () => {
            // Arrange
            mockGetLobbyGameIds.mockReturnValue([]);
            const handler = new DashboardHandler(defaultProps, jest.fn());

            // Act
            const result = handler.checkIsNotOfferGame();

            // Assert
            expect(result).toBe(true);
        });

        it('should return false for non-direct mode when offer games and lobby games exist', () => {
            // Arrange
            const handler = new DashboardHandler(defaultProps, jest.fn());

            // Act
            const result = handler.checkIsNotOfferGame();

            // Assert
            expect(result).toBe(false);
        });
    });

    describe('shouldRenderGames', () => {
        it('should return false when openGameId is 0', () => {
            // Arrange
            const handler = new DashboardHandler(defaultProps, jest.fn());

            // Act
            const result = handler.shouldRenderGames([1001, 1002], 0);

            // Assert
            expect(result).toBe(false);
        });

        it('should return false when openGameId is null', () => {
            // Arrange
            const handler = new DashboardHandler(defaultProps, jest.fn());

            // Act
            const result = handler.shouldRenderGames([1001, 1002], null);

            // Assert
            expect(result).toBe(false);
        });

        it('should return true when game is in offer games and not back to lobby', () => {
            // Arrange
            const handler = new DashboardHandler(defaultProps, jest.fn());

            // Act
            const result = handler.shouldRenderGames([1001, 1002], 1001);

            // Assert
            expect(result).toBe(true);
        });

        it('should return false when game is in offer games but back to lobby is true', () => {
            // Arrange
            mockStorageHelper.get.mockReturnValue({
                backToLobby: true,
                gameId: 0
            });
            const handler = new DashboardHandler(defaultProps, jest.fn());

            // Act
            const result = handler.shouldRenderGames([1001, 1002], 1001);

            // Assert
            expect(result).toBe(false);
        });

        it('should return true when ssoRedirectGameId is greater than 0', () => {
            // Arrange
            mockStorageHelper.get.mockReturnValue({
                backToLobby: false,
                gameId: 1001
            });
            const handler = new DashboardHandler(defaultProps, jest.fn());

            // Act
            const result = handler.shouldRenderGames([1001, 1002], 0);

            // Assert
            expect(result).toBe(true);
        });
    });

    describe('getLobbyGamesIds', () => {
        it('should return filtered lobby game IDs', () => {
            // Arrange
            const handler = new DashboardHandler(defaultProps, jest.fn());

            // Act
            const result = handler.getLobbyGamesIds();

            // Assert
            expect(result).toEqual([1001, 1002]);
            expect(mockGetOfferGamesIds).toHaveBeenCalledWith(defaultProps.authorizeResponse);
            expect(mockGetLobbyGameIds).toHaveBeenCalledWith(defaultProps.lobbyConfigs);
        });

        it('should return empty array when no matching games', () => {
            // Arrange
            mockGetOfferGamesIds.mockReturnValue([9999]);
            const handler = new DashboardHandler(defaultProps, jest.fn());

            // Act
            const result = handler.getLobbyGamesIds();

            // Assert
            expect(result).toEqual([]);
        });
    });

    describe('getOfferGamesIds', () => {
        it('should return offer games IDs from authorize response', () => {
            // Arrange
            const handler = new DashboardHandler(defaultProps, jest.fn());

            // Act
            const result = handler.getOfferGamesIds();

            // Assert
            expect(result).toEqual([1001, 1002]);
            expect(mockGetOfferGamesIds).toHaveBeenCalledWith(defaultProps.authorizeResponse);
        });
    });

    describe('buildLobbyConnectionContextValue', () => {
        it('should return lobby connection context value', () => {
            // Arrange
            const handler = new DashboardHandler(defaultProps, jest.fn());
            const mockSocket = {};
            const mockTransmitters = { game1: {} };
            handler.lobbyConnection.getSocket = jest.fn().mockReturnValue(mockSocket);
            handler.lobbyConnection.getTransmitters = jest.fn().mockReturnValue(mockTransmitters);

            // Act
            const result = handler.buildLobbyConnectionContextValue();

            // Assert
            expect(result).toEqual({
                socket: mockSocket,
                gameTransmitters: mockTransmitters,
                removeGameTransmitter: handler.removeGameTransmitter,
                reconnectGameTransmitter: handler.reconnectGameTransmitter,
            });
        });
    });

    describe('removeGameTransmitter', () => {
        it('should unsubscribe from game', () => {
            // Arrange
            const handler = new DashboardHandler(defaultProps, jest.fn());
            handler.lobbyConnection.unsubscribeGame = jest.fn();

            // Act
            handler.removeGameTransmitter(1001);

            // Assert
            expect(handler.lobbyConnection.unsubscribeGame).toHaveBeenCalledWith(1001);
        });
    });

    describe('reconnectGameTransmitter', () => {
        it('should reconnect to game', () => {
            // Arrange
            const handler = new DashboardHandler(defaultProps, jest.fn());
            handler.lobbyConnection.signInGame = jest.fn();
            handler.lobbyConnection.initGameTransmitter = jest.fn().mockReturnValue({});

            // Act
            const result = handler.reconnectGameTransmitter(1001);

            // Assert
            expect(handler.lobbyConnection.signInGame).toHaveBeenCalledWith(defaultProps.session, 1001);
            expect(handler.lobbyConnection.initGameTransmitter).toHaveBeenCalledWith(1001);
            expect(result).toEqual({});
        });
    });

    describe('reset', () => {
        it('should close socket connection', () => {
            // Arrange
            const handler = new DashboardHandler(defaultProps, jest.fn());
            handler.lobbyConnection.closeSocket = jest.fn();

            // Act
            handler.reset();

            // Assert
            expect(handler.lobbyConnection.closeSocket).toHaveBeenCalled();
        });
    });

    describe('Edge Cases', () => {
        it('should handle undefined authorizeResponse', () => {
            // Arrange
            const props = { ...defaultProps, authorizeResponse: undefined };
            mockGetOfferGamesIds.mockReturnValue([]);
            const handler = new DashboardHandler(props, jest.fn());

            // Act
            const result = handler.getOfferGamesIds();

            // Assert
            expect(result).toEqual([]);
        });

        it('should handle undefined lobbyConfigs', () => {
            // Arrange
            const props = { ...defaultProps, lobbyConfigs: undefined };
            mockGetLobbyGameIds.mockReturnValue([]);
            const handler = new DashboardHandler(props, jest.fn());

            // Act
            const result = handler.getLobbyGamesIds();

            // Assert
            expect(result).toEqual([]);
        });

        it('should handle empty offer games array', () => {
            // Arrange
            mockGetOfferGamesIds.mockReturnValue([]);
            const handler = new DashboardHandler(defaultProps, jest.fn());

            // Act
            const result = handler.getOfferGamesIds();

            // Assert
            expect(result).toEqual([]);
        });
    });
}); 