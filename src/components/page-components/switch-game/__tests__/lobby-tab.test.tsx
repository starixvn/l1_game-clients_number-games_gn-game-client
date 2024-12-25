import { ILobbyConfigs } from '../../dashboard/type';
import { buildFilteredLobbyConfigs } from '../lobby-tab';
import { describe, it, expect } from '@jest/globals';
import gameSettings from '../../../../../game-settings.json';
import { getAppSettings } from '../../../../_shared/app-settings';

// Mock getAppSettings
jest.mock('../../../../_shared/app-settings', () => ({
    getAppSettings: () => ({
        serverDomainMapper: ['domain1', 'domain2'],
        socketGatewayPath: '/socket',
        proxy: {
            ssl: 'https',
            subDomain: 'api',
            path: '/v1'
        },
        sentry: {
            dsn: 'test-dsn',
            environment: 'test'
        },
        gameSettings: {
            1001: {
                id: 1001,
                gameGroup: "Bac Ball",
                gameName: "BacBall1",
                tolgeeNamespace: "BacBall",
                socketInfo: {
                    namespace: "bacball1",
                    path: "bacball1"
                }
            },
            1002: {
                id: 1002,
                gameGroup: "Bac Ball",
                gameName: "BacBall2",
                tolgeeNamespace: "BacBall",
                socketInfo: {
                    namespace: "bacball2",
                    path: "bacball2"
                }
            },
            1003: {
                id: 1003,
                gameGroup: "Lucky Next",
                gameName: "LuckyNext1",
                tolgeeNamespace: "NextBall",
                socketInfo: {
                    namespace: "luckynext1",
                    path: "luckynext1"
                }
            },
            1004: {
                id: 1004,
                gameGroup: "Lucky Next",
                gameName: "LuckyNext2",
                tolgeeNamespace: "NextBall",
                socketInfo: {
                    namespace: "luckynext2",
                    path: "luckynext2"
                }
            },
            1005: {
                id: 1005,
                gameGroup: "Se Ball",
                gameName: "SeBall1",
                tolgeeNamespace: "SeBall",
                socketInfo: {
                    namespace: "seball1",
                    path: "seball1"
                }
            },
            1006: {
                id: 1006,
                gameGroup: "Lucky Three",
                gameName: "LuckyThree",
                tolgeeNamespace: "LuckyThree",
                socketInfo: {
                    namespace: "luckythree",
                    path: "luckythree"
                }
            },
            1007: {
                id: 1007,
                gameGroup: "Sic Ball",
                gameName: "SicBall",
                tolgeeNamespace: "SicBall",
                socketInfo: {
                    namespace: "sicball",
                    path: "sicball"
                }
            }
        },
        subGuideDomain: 'guide.test.com',
        googleAnalyticId: 'UA-TEST',
        enableMsgpackParser: true,
        system: 'test',
        appType: 1,
        useTolgeeStatic: true,
        enableDebugLogs: true,
        gamePath: '/games',
        enablePreloadResource: true
    })
}));

describe('buildFilteredLobbyConfigs', () => {
    const mockLobbyConfigs: ILobbyConfigs = {
        name: "Lobby",
        currencyGroupIds: [
            "61b953ad815d6c000196a14c",
            "61b96c3d815d6c000196a15d"
        ],
        miniPanelGameIds: [1001],
        categories: [
            {
                name: {
                    "en-US": "Games",
                    "vi-VN": "Games",
                    "id-ID": "Games",
                    "th-TH": "Games",
                    "zh-CN": "Games",
                    "zh-TW": "Games"
                },
                gameSettings: [
                    { gameId: 1007, bigSize: false, newTag: false },
                    { gameId: 1006, bigSize: false, newTag: false },
                    { gameId: 1005, bigSize: false, newTag: false },
                    { gameId: 1001, bigSize: false, newTag: false },
                    { gameId: 1002, bigSize: false, newTag: false },
                    { gameId: 1003, bigSize: false, newTag: false },
                    { gameId: 1004, bigSize: false, newTag: false }
                ]
            }
        ],
        banners: [
            { gameId: 1001, displayTime: 3 },
            { gameId: 1007, displayTime: 15 },
            { gameId: 1005, displayTime: 10 },
            { gameId: 1003, displayTime: 10 }
        ]
    };

    test('should return unfiltered configs when selectedCategory is 0', () => {
        const result = buildFilteredLobbyConfigs(mockLobbyConfigs, 0);
        expect(result).toBe(mockLobbyConfigs);
    });

    test('should filter Bac Ball games when selectedCategory is 1', () => {
        const result = buildFilteredLobbyConfigs(mockLobbyConfigs, 1);
        const bacBallGames = result.categories[0].gameSettings
            .map(g => g.gameId)
            .sort();
        expect(bacBallGames).toEqual([1001, 1002]);
    });

    test('should filter Lucky Next games when selectedCategory is 2', () => {
        const result = buildFilteredLobbyConfigs(mockLobbyConfigs, 2);
        const luckyNextGames = result.categories[0].gameSettings
            .map(g => g.gameId)
            .sort();
        expect(luckyNextGames).toEqual([1003, 1004]);
    });

    test('should filter Se Ball games when selectedCategory is 3', () => {
        const result = buildFilteredLobbyConfigs(mockLobbyConfigs, 3);
        const seBallGames = result.categories[0].gameSettings
            .map(g => g.gameId);
        expect(seBallGames).toEqual([1005]);
    });

    test('should preserve banner and miniPanel configurations', () => {
        const result = buildFilteredLobbyConfigs(mockLobbyConfigs, 1);
        expect(result.banners).toEqual(mockLobbyConfigs.banners);
        expect(result.miniPanelGameIds).toEqual(mockLobbyConfigs.miniPanelGameIds);
    });

    test('should handle empty categories gracefully', () => {
        const emptyConfigs: ILobbyConfigs = {
            ...mockLobbyConfigs,
            categories: []
        };

        const result = buildFilteredLobbyConfigs(emptyConfigs, 1);
        expect(result.categories).toHaveLength(0);
    });
}); 