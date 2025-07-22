import { DashboardHandler } from '../dash-board-handler';
import { StorageHelper, localStorageKeys } from '../../../../../_shared/helpers';

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
    getOfferGamesIds: jest.fn(),
    getLobbyGameIds: jest.fn()
}));

const mockStorageHelper = StorageHelper as jest.Mocked<typeof StorageHelper>;

describe('DashboardHandler Integration - Direct Mode Scenario', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        console.log = jest.fn();
    });

    describe('shouldRenderGames with null openGameId', () => {
        it('should handle the specific scenario from the logs correctly', () => {
            // Arrange: Simulate the exact scenario from the logs
            const props = {
                router: {},
                session: { isAuthenticated: true, username: 'testuser' },
                queryGame: 0, // This is the key issue - queryGame is 0
                directMode: true,
                setIsUm: jest.fn(),
                tolgee: {},
                authorizeResponse: {
                    authorized: true,
                    user: {
                        id: 1,
                        username: 'testuser',
                        offerGames: [1001, 1002, 1003, 1004, 1005, 1006, 1007]
                    }
                },
                lobbyConfigs: {
                    1001: { id: 1001, name: 'Game 1' },
                    1002: { id: 1002, name: 'Game 2' }
                }
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
            expect(console.log).toHaveBeenCalledWith(
                '[DashboardHandler] shouldRenderGames - openGameId is 0/null/undefined, returning false'
            );
        });

        it('should handle undefined openGameId correctly', () => {
            // Arrange
            const props = {
                router: {},
                session: { isAuthenticated: true, username: 'testuser' },
                queryGame: 0,
                directMode: true,
                setIsUm: jest.fn(),
                tolgee: {},
                authorizeResponse: {
                    authorized: true,
                    user: {
                        id: 1,
                        username: 'testuser',
                        offerGames: [1001, 1002, 1003]
                    }
                },
                lobbyConfigs: {
                    1001: { id: 1001, name: 'Game 1' }
                }
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
            expect(console.log).toHaveBeenCalledWith(
                '[DashboardHandler] shouldRenderGames - openGameId is 0/null/undefined, returning false'
            );
        });

        it('should handle 0 openGameId correctly', () => {
            // Arrange
            const props = {
                router: {},
                session: { isAuthenticated: true, username: 'testuser' },
                queryGame: 0,
                directMode: true,
                setIsUm: jest.fn(),
                tolgee: {},
                authorizeResponse: {
                    authorized: true,
                    user: {
                        id: 1,
                        username: 'testuser',
                        offerGames: [1001, 1002, 1003]
                    }
                },
                lobbyConfigs: {
                    1001: { id: 1001, name: 'Game 1' }
                }
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
            expect(console.log).toHaveBeenCalledWith(
                '[DashboardHandler] shouldRenderGames - openGameId is 0/null/undefined, returning false'
            );
        });

        it('should return true when openGameId is valid and in offer games', () => {
            // Arrange
            const props = {
                router: {},
                session: { isAuthenticated: true, username: 'testuser' },
                queryGame: 1001,
                directMode: true,
                setIsUm: jest.fn(),
                tolgee: {},
                authorizeResponse: {
                    authorized: true,
                    user: {
                        id: 1,
                        username: 'testuser',
                        offerGames: [1001, 1002, 1003]
                    }
                },
                lobbyConfigs: {
                    1001: { id: 1001, name: 'Game 1' }
                }
            };

            mockStorageHelper.get.mockReturnValue({
                backToLobby: false,
                gameId: 0
            });

            const handler = new DashboardHandler(props, jest.fn());

            // Act
            const result = handler.shouldRenderGames([1001, 1002, 1003], 1001);

            // Assert
            expect(result).toBe(true);
            expect(console.log).toHaveBeenCalledWith(
                '[DashboardHandler] shouldRenderGames - Final result:',
                true
            );
        });

        it('should return true when ssoRedirectGameId is greater than 0', () => {
            // Arrange
            const props = {
                router: {},
                session: { isAuthenticated: true, username: 'testuser' },
                queryGame: 0,
                directMode: true,
                setIsUm: jest.fn(),
                tolgee: {},
                authorizeResponse: {
                    authorized: true,
                    user: {
                        id: 1,
                        username: 'testuser',
                        offerGames: [1001, 1002, 1003]
                    }
                },
                lobbyConfigs: {
                    1001: { id: 1001, name: 'Game 1' }
                }
            };

            // Mock URL context with a valid gameId
            mockStorageHelper.get.mockReturnValue({
                backToLobby: false,
                gameId: 1001 // This should make shouldRenderGames return true
            });

            const handler = new DashboardHandler(props, jest.fn());

            // Act
            const result = handler.shouldRenderGames([1001, 1002, 1003], 0);

            // Assert
            expect(result).toBe(true);
            expect(console.log).toHaveBeenCalledWith(
                '[DashboardHandler] shouldRenderGames - Final result:',
                true
            );
        });

        it('should return false when backToLobby is true', () => {
            // Arrange
            const props = {
                router: {},
                session: { isAuthenticated: true, username: 'testuser' },
                queryGame: 1001,
                directMode: true,
                setIsUm: jest.fn(),
                tolgee: {},
                authorizeResponse: {
                    authorized: true,
                    user: {
                        id: 1,
                        username: 'testuser',
                        offerGames: [1001, 1002, 1003]
                    }
                },
                lobbyConfigs: {
                    1001: { id: 1001, name: 'Game 1' }
                }
            };

            // Mock URL context with backToLobby true
            mockStorageHelper.get.mockReturnValue({
                backToLobby: true,
                gameId: 0
            });

            const handler = new DashboardHandler(props, jest.fn());

            // Act
            const result = handler.shouldRenderGames([1001, 1002, 1003], 1001);

            // Assert
            expect(result).toBe(false);
            expect(console.log).toHaveBeenCalledWith(
                '[DashboardHandler] shouldRenderGames - Final result:',
                false
            );
        });
    });

    describe('checkIsNotOfferGame in direct mode', () => {
        it('should return true when queryGame is not in offer games', () => {
            // Arrange
            const props = {
                router: {},
                session: { isAuthenticated: true, username: 'testuser' },
                queryGame: 9999, // Not in offer games
                directMode: true,
                setIsUm: jest.fn(),
                tolgee: {},
                authorizeResponse: {
                    authorized: true,
                    user: {
                        id: 1,
                        username: 'testuser',
                        offerGames: [1001, 1002, 1003]
                    }
                },
                lobbyConfigs: {
                    1001: { id: 1001, name: 'Game 1' }
                }
            };

            const handler = new DashboardHandler(props, jest.fn());

            // Act
            const result = handler.checkIsNotOfferGame();

            // Assert
            expect(result).toBe(true);
            expect(console.log).toHaveBeenCalledWith(
                '[DashboardHandler] checkIsNotOfferGame - Direct mode result:',
                true
            );
        });

        it('should return false when queryGame is in offer games', () => {
            // Arrange
            const props = {
                router: {},
                session: { isAuthenticated: true, username: 'testuser' },
                queryGame: 1001, // In offer games
                directMode: true,
                setIsUm: jest.fn(),
                tolgee: {},
                authorizeResponse: {
                    authorized: true,
                    user: {
                        id: 1,
                        username: 'testuser',
                        offerGames: [1001, 1002, 1003]
                    }
                },
                lobbyConfigs: {
                    1001: { id: 1001, name: 'Game 1' }
                }
            };

            const handler = new DashboardHandler(props, jest.fn());

            // Act
            const result = handler.checkIsNotOfferGame();

            // Assert
            expect(result).toBe(false);
            expect(console.log).toHaveBeenCalledWith(
                '[DashboardHandler] checkIsNotOfferGame - Direct mode result:',
                false
            );
        });
    });
}); 