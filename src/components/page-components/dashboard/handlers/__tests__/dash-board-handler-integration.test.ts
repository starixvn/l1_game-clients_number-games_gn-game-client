import { DashboardHandler } from '../dash-board-handler';
import { StorageHelper, localStorageKeys } from '../../../../../_shared/helpers';
import { SSOResponse, AuthorizeResponse } from 'sc-user-service-client/dist/auth';
import { ILobbyConfigs } from '../../type';
import { TolgeeInstance } from '@tolgee/core';
import { NextRouter } from 'next/router';

// Mock dependencies
jest.mock('../../../../../_shared/helpers', () => ({
    StorageHelper: {
        get: jest.fn(),
        set: jest.fn()
    },
    localStorageKeys: {
        url: 'url',
        latestGameId: 'latestGameId'
    },
    getOfferGamesIds: jest.fn((authorizeInfo) => {
        return authorizeInfo?.user?.offerGames?.map((game: any) => +game?.gameId) || [];
    }),
    getLobbyGameIds: jest.fn((lobbyConfigs) => {
        return lobbyConfigs?.categories?.[0]?.gameSettings?.map((setting: any) => setting.gameId);
    })
}));

const mockStorageHelper = StorageHelper as jest.Mocked<typeof StorageHelper>;

// Mock router
const mockRouter: NextRouter = {
    route: '/',
    pathname: '/',
    query: {},
    asPath: '/',
    basePath: '',
    isLocaleDomain: false,
    isReady: true,
    isPreview: false,
    isFallback: false,
    defaultLocale: 'en',
    domainLocales: [],
    locale: 'en',
    locales: ['en'],
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
    push: jest.fn(),
} as NextRouter;

describe('DashboardHandler Integration - Direct Mode Scenario', () => {
    beforeEach(() => {
        jest.clearAllMocks();

    });

    describe('shouldRenderGames with null openGameId', () => {
        it('should handle the specific scenario from the logs correctly', () => {
            // Arrange: Simulate the exact scenario from the logs
            const props = {
                router: mockRouter,
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
                queryGame: 0, // This is the key issue - queryGame is 0
                directMode: true,
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
                            { gameId: 1002, minBet: 1, maxBet: 1000, maxBetPerChoices: {} },
                            { gameId: 1003, minBet: 1, maxBet: 1000, maxBetPerChoices: {} },
                            { gameId: 1004, minBet: 1, maxBet: 1000, maxBetPerChoices: {} },
                            { gameId: 1005, minBet: 1, maxBet: 1000, maxBetPerChoices: {} },
                            { gameId: 1006, minBet: 1, maxBet: 1000, maxBetPerChoices: {} },
                            { gameId: 1007, minBet: 1, maxBet: 1000, maxBetPerChoices: {} },
                        ],
                        balance: 1000,
                        fractionalOddsFormat: false,
                        enableQuickBet: true,
                        enabledGameIds: [1001, 1002, 1003, 1004, 1005, 1006, 1007],
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
                    miniPanelGameIds: [1001, 1002, 1003, 1004, 1005, 1006, 1007],
                    categories: [
                        {
                            name: "Test Category",
                            gameSettings: [
                                { gameId: 1001, bigSize: false, newTag: false },
                                { gameId: 1002, bigSize: false, newTag: false },
                                { gameId: 1003, bigSize: false, newTag: false },
                                { gameId: 1004, bigSize: false, newTag: false },
                                { gameId: 1005, bigSize: false, newTag: false },
                                { gameId: 1006, bigSize: false, newTag: false },
                                { gameId: 1007, bigSize: false, newTag: false },
                            ],
                        },
                    ],
                    banners: [
                        { gameId: 1001, displayTime: 5000 },
                        { gameId: 1002, displayTime: 5000 },
                        { gameId: 1003, displayTime: 5000 },
                        { gameId: 1004, displayTime: 5000 },
                        { gameId: 1005, displayTime: 5000 },
                        { gameId: 1006, displayTime: 5000 },
                        { gameId: 1007, displayTime: 5000 },
                    ],
                    gameSettings: {
                        1001: { id: 1001, name: 'Game 1' },
                        1002: { id: 1002, name: 'Game 2' },
                        1003: { id: 1003, name: 'Game 3' },
                        1004: { id: 1004, name: 'Game 4' },
                        1005: { id: 1005, name: 'Game 5' },
                        1006: { id: 1006, name: 'Game 6' },
                        1007: { id: 1007, name: 'Game 7' },
                    },
                    roundTimerGame: 1001,
                } as ILobbyConfigs
            };

            // Mock the URL context to match the logs
            mockStorageHelper.get.mockReturnValue({
                backToLobby: false,
                gameId: 0
            });

            const handler = new DashboardHandler(props, jest.fn());

            // Act: Call shouldRenderGames with null openGameId (as seen in logs)
            const result = handler.shouldRenderGames([1001, 1002, 1003, 1004, 1005, 1006, 1007], null);

            // Assert: Should return false because openGameId is null
            expect(result).toBe(false);
        });

        it('should handle undefined openGameId correctly', () => {
            // Arrange
            const props = {
                router: mockRouter,
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
                queryGame: 0,
                directMode: true,
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
                            { gameId: 1002, minBet: 1, maxBet: 1000, maxBetPerChoices: {} },
                            { gameId: 1003, minBet: 1, maxBet: 1000, maxBetPerChoices: {} },
                        ],
                        balance: 1000,
                        fractionalOddsFormat: false,
                        enableQuickBet: true,
                        enabledGameIds: [1001, 1002, 1003],
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
                    miniPanelGameIds: [1001, 1002, 1003],
                    categories: [
                        {
                            name: "Test Category",
                            gameSettings: [
                                { gameId: 1001, bigSize: false, newTag: false },
                                { gameId: 1002, bigSize: false, newTag: false },
                                { gameId: 1003, bigSize: false, newTag: false },
                            ],
                        },
                    ],
                    banners: [
                        { gameId: 1001, displayTime: 5000 },
                        { gameId: 1002, displayTime: 5000 },
                        { gameId: 1003, displayTime: 5000 },
                    ],
                    gameSettings: {
                        1001: { id: 1001, name: 'Game 1' },
                        1002: { id: 1002, name: 'Game 2' },
                        1003: { id: 1003, name: 'Game 3' },
                    },
                    roundTimerGame: 1001,
                } as ILobbyConfigs
            };

            mockStorageHelper.get.mockReturnValue({
                backToLobby: false,
                gameId: 0
            });

            const handler = new DashboardHandler(props, jest.fn());

            // Act
            const result = handler.shouldRenderGames([1001, 1002, 1003], undefined);

            // Assert
            expect(result).toBe(false);
        });

        it('should handle zero openGameId correctly', () => {
            // Arrange
            const props = {
                router: mockRouter,
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
                queryGame: 0,
                directMode: true,
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
                            { gameId: 1002, minBet: 1, maxBet: 1000, maxBetPerChoices: {} },
                            { gameId: 1003, minBet: 1, maxBet: 1000, maxBetPerChoices: {} },
                        ],
                        balance: 1000,
                        fractionalOddsFormat: false,
                        enableQuickBet: true,
                        enabledGameIds: [1001, 1002, 1003],
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
                    miniPanelGameIds: [1001, 1002, 1003],
                    categories: [
                        {
                            name: "Test Category",
                            gameSettings: [
                                { gameId: 1001, bigSize: false, newTag: false },
                                { gameId: 1002, bigSize: false, newTag: false },
                                { gameId: 1003, bigSize: false, newTag: false },
                            ],
                        },
                    ],
                    banners: [
                        { gameId: 1001, displayTime: 5000 },
                        { gameId: 1002, displayTime: 5000 },
                        { gameId: 1003, displayTime: 5000 },
                    ],
                    gameSettings: {
                        1001: { id: 1001, name: 'Game 1' },
                        1002: { id: 1002, name: 'Game 2' },
                        1003: { id: 1003, name: 'Game 3' },
                    },
                    roundTimerGame: 1001,
                } as ILobbyConfigs
            };

            mockStorageHelper.get.mockReturnValue({
                backToLobby: false,
                gameId: 0
            });

            const handler = new DashboardHandler(props, jest.fn());

            // Act
            const result = handler.shouldRenderGames([1001, 1002, 1003], 0);

            // Assert
            expect(result).toBe(false);
        });
    });

    describe('checkIsNotOfferGame in direct mode', () => {
        it('should return false when queryGame is 0 (lobby)', () => {
            // Arrange
            const props = {
                router: mockRouter,
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
                queryGame: 0,
                directMode: true,
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
                            { gameId: 1002, minBet: 1, maxBet: 1000, maxBetPerChoices: {} },
                            { gameId: 1003, minBet: 1, maxBet: 1000, maxBetPerChoices: {} },
                        ],
                        balance: 1000,
                        fractionalOddsFormat: false,
                        enableQuickBet: true,
                        enabledGameIds: [1001, 1002, 1003],
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
                    miniPanelGameIds: [1001, 1002, 1003],
                    categories: [
                        {
                            name: "Test Category",
                            gameSettings: [
                                { gameId: 1001, bigSize: false, newTag: false },
                                { gameId: 1002, bigSize: false, newTag: false },
                                { gameId: 1003, bigSize: false, newTag: false },
                            ],
                        },
                    ],
                    banners: [
                        { gameId: 1001, displayTime: 5000 },
                        { gameId: 1002, displayTime: 5000 },
                        { gameId: 1003, displayTime: 5000 },
                    ],
                    gameSettings: {
                        1001: { id: 1001, name: 'Game 1' },
                        1002: { id: 1002, name: 'Game 2' },
                        1003: { id: 1003, name: 'Game 3' },
                    },
                    roundTimerGame: 1001,
                } as ILobbyConfigs
            };

            const handler = new DashboardHandler(props, jest.fn());

            // Act
            const result = handler.checkIsNotOfferGame();

            // Assert
            expect(result).toBe(false);
        });

        it('should return false when queryGame is in offer games', () => {
            // Arrange
            const props = {
                router: mockRouter,
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
                directMode: true,
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
                            { gameId: 1002, minBet: 1, maxBet: 1000, maxBetPerChoices: {} },
                            { gameId: 1003, minBet: 1, maxBet: 1000, maxBetPerChoices: {} },
                        ],
                        balance: 1000,
                        fractionalOddsFormat: false,
                        enableQuickBet: true,
                        enabledGameIds: [1001, 1002, 1003],
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
                    miniPanelGameIds: [1001, 1002, 1003],
                    categories: [
                        {
                            name: "Test Category",
                            gameSettings: [
                                { gameId: 1001, bigSize: false, newTag: false },
                                { gameId: 1002, bigSize: false, newTag: false },
                                { gameId: 1003, bigSize: false, newTag: false },
                            ],
                        },
                    ],
                    banners: [
                        { gameId: 1001, displayTime: 5000 },
                        { gameId: 1002, displayTime: 5000 },
                        { gameId: 1003, displayTime: 5000 },
                    ],
                    gameSettings: {
                        1001: { id: 1001, name: 'Game 1' },
                        1002: { id: 1002, name: 'Game 2' },
                        1003: { id: 1003, name: 'Game 3' },
                    },
                    roundTimerGame: 1001,
                } as ILobbyConfigs
            };

            const handler = new DashboardHandler(props, jest.fn());

            // Act
            const result = handler.checkIsNotOfferGame();

            // Assert
            // When queryGame (1001) is in offer games, checkIsNotOfferGame should return false
            expect(result).toBe(false);
        });

        it('should return true when queryGame is not in offer games', () => {
            // Arrange
            const props = {
                router: mockRouter,
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
                queryGame: 9999,
                directMode: true,
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
                            { gameId: 1002, minBet: 1, maxBet: 1000, maxBetPerChoices: {} },
                            { gameId: 1003, minBet: 1, maxBet: 1000, maxBetPerChoices: {} },
                        ],
                        balance: 1000,
                        fractionalOddsFormat: false,
                        enableQuickBet: true,
                        enabledGameIds: [1001, 1002, 1003],
                        availSpins: 0,
                        scoins: 0,
                    },
                    errorCode: null,
                    umInfo: null,
                    isUM: false,
                } as AuthorizeResponse,
                lobbyConfigs: {
                    name: "Test Lobby",
                    currencyGroupIds: ["USD"],
                    miniPanelGameIds: [1001, 1002, 1003],
                    categories: [
                        {
                            name: "Test Category",
                            gameSettings: [
                                { gameId: 1001, bigSize: false, newTag: false },
                                { gameId: 1002, bigSize: false, newTag: false },
                                { gameId: 1003, bigSize: false, newTag: false },
                            ],
                        },
                    ],
                    banners: [
                        { gameId: 1001, displayTime: 5000 },
                        { gameId: 1002, displayTime: 5000 },
                        { gameId: 1003, displayTime: 5000 },
                    ],
                    gameSettings: {
                        1001: { id: 1001, name: 'Game 1' },
                        1002: { id: 1002, name: 'Game 2' },
                        1003: { id: 1003, name: 'Game 3' },
                    },
                    roundTimerGame: 1001,
                } as ILobbyConfigs
            };

            const handler = new DashboardHandler(props, jest.fn());

            // Act
            const result = handler.checkIsNotOfferGame();

            // Assert
            expect(result).toBe(true);
        });
    });
}); 