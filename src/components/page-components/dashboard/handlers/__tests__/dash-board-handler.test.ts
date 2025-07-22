import { DashboardHandler } from '../dash-board-handler';
import { getAppSettings } from '../../../../../_shared/app-settings';
import { getLobbyGameIds, getOfferGamesIds, StorageHelper, localStorageKeys } from '../../../../../_shared/helpers';
import { loadURLContext } from '../../../../../_shared/react-contexts';
import { TolgeeInstance } from '@tolgee/core';
import { SSOResponse, AuthorizeResponse } from 'sc-user-service-client/dist/auth';
import { ILobbyConfigs } from '../../type';

// Mock LobbySocketConnection since it might not exist
jest.mock('../../lobby/lobby-socket-connection', () => ({
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
jest.mock('../../../../../_shared/app-settings');
jest.mock('../../../../../_shared/helpers');
jest.mock('../../../../../_shared/react-contexts');
jest.mock('../../lobby/lobby-socket-connection');

const mockGetAppSettings = getAppSettings as jest.MockedFunction<typeof getAppSettings>;
const mockGetLobbyGameIds = getLobbyGameIds as jest.MockedFunction<typeof getLobbyGameIds>;
const mockGetOfferGamesIds = getOfferGamesIds as jest.MockedFunction<typeof getOfferGamesIds>;
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
        router: {},
        session: {
            isAuthenticated: true,
            username: 'testuser'
        } as SSOResponse,
        queryGame: 1001,
        directMode: false,
        setIsUm: jest.fn(),
        tolgee: {} as TolgeeInstance,
        authorizeResponse: {
            authorized: true,
            user: {
                id: 1,
                username: 'testuser',
                offerGames: [1001, 1002, 1003]
            }
        } as AuthorizeResponse,
        lobbyConfigs: {
            1001: { id: 1001, name: 'Game 1' },
            1002: { id: 1002, name: 'Game 2' },
            1003: { id: 1003, name: 'Game 3' }
        } as ILobbyConfigs
    };

    const mockUpdateGameTransmitters = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        console.log = jest.fn();

        // Default mock implementations
        mockGetOfferGamesIds.mockReturnValue([1001, 1002, 1003]);
        mockGetLobbyGameIds.mockReturnValue([1001, 1002, 1003]);
        mockGetAppSettings.mockReturnValue({
            gameSettings: {
                1001: { id: 1001, enabled: true },
                1002: { id: 1002, enabled: true },
                1003: { id: 1003, enabled: true }
            }
        } as any);
        mockLoadURLContext.mockReturnValue({
            gameId: 0,
            isDirectMode: false
        });
        mockStorageHelper.get.mockReturnValue({
            backToLobby: false,
            gameId: 0
        });
    });

    describe('Constructor', () => {
        it('should initialize with default props', () => {
            // Act
            const handler = new DashboardHandler(defaultProps, mockUpdateGameTransmitters);

            // Assert
            expect(handler.lobbyConnection).toBeInstanceOf(MockLobbySocketConnection);
            expect(console.log).toHaveBeenCalledWith(
                '[DashboardHandler] constructor - Props:',
                defaultProps
            );
        });

        it('should accept existing lobby connection', () => {
            // Arrange
            const existingConnection = new MockLobbySocketConnection();

            // Act
            const handler = new DashboardHandler(defaultProps, mockUpdateGameTransmitters, existingConnection);

            // Assert
            expect(handler.lobbyConnection).toBe(existingConnection);
        });
    });

    describe('checkIsNotOfferGame', () => {
        it('should return true for direct mode when game is not in offer games', () => {
            // Arrange
            const props = { ...defaultProps, directMode: true, queryGame: 9999 };
            const handler = new DashboardHandler(props, mockUpdateGameTransmitters);

            // Act
            const result = handler.checkIsNotOfferGame();

            // Assert
            expect(result).toBe(true);
            expect(console.log).toHaveBeenCalledWith(
                '[DashboardHandler] checkIsNotOfferGame - Direct mode result:',
                true
            );
        });

        it('should return false for direct mode when game is in offer games', () => {
            // Arrange
            const props = { ...defaultProps, directMode: true, queryGame: 1001 };
            const handler = new DashboardHandler(props, mockUpdateGameTransmitters);

            // Act
            const result = handler.checkIsNotOfferGame();

            // Assert
            expect(result).toBe(false);
            expect(console.log).toHaveBeenCalledWith(
                '[DashboardHandler] checkIsNotOfferGame - Direct mode result:',
                false
            );
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
            const handler = new DashboardHandler(props, mockUpdateGameTransmitters);

            // Act
            const result = handler.checkIsNotOfferGame();

            // Assert
            expect(result).toBe(true);
            expect(console.log).toHaveBeenCalledWith(
                '[DashboardHandler] checkIsNotOfferGame - Non-direct mode result:',
                true
            );
        });

        it('should return true for non-direct mode when no lobby games', () => {
            // Arrange
            mockGetLobbyGameIds.mockReturnValue([]);
            const handler = new DashboardHandler(defaultProps, mockUpdateGameTransmitters);

            // Act
            const result = handler.checkIsNotOfferGame();

            // Assert
            expect(result).toBe(true);
        });

        it('should return false for non-direct mode when offer games and lobby games exist', () => {
            // Arrange
            const handler = new DashboardHandler(defaultProps, mockUpdateGameTransmitters);

            // Act
            const result = handler.checkIsNotOfferGame();

            // Assert
            expect(result).toBe(false);
        });
    });

    describe('shouldRenderGames', () => {
        it('should return false when openGameId is 0', () => {
            // Arrange
            const handler = new DashboardHandler(defaultProps, mockUpdateGameTransmitters);

            // Act
            const result = handler.shouldRenderGames([1001, 1002, 1003], 0);

            // Assert
            expect(result).toBe(false);
            expect(console.log).toHaveBeenCalledWith(
                '[DashboardHandler] shouldRenderGames - openGameId is 0, returning false'
            );
        });

        it('should return false when openGameId is null', () => {
            // Arrange
            const handler = new DashboardHandler(defaultProps, mockUpdateGameTransmitters);

            // Act
            const result = handler.shouldRenderGames([1001, 1002, 1003], null);

            // Assert
            expect(result).toBe(false);
            expect(console.log).toHaveBeenCalledWith(
                '[DashboardHandler] shouldRenderGames - openGameId is 0, returning false'
            );
        });

        it('should return true when game is in offer games and not back to lobby', () => {
            // Arrange
            const handler = new DashboardHandler(defaultProps, mockUpdateGameTransmitters);

            // Act
            const result = handler.shouldRenderGames([1001, 1002, 1003], 1001);

            // Assert
            expect(result).toBe(true);
            expect(console.log).toHaveBeenCalledWith(
                '[DashboardHandler] shouldRenderGames - Final result:',
                true
            );
        });

        it('should return false when game is in offer games but back to lobby is true', () => {
            // Arrange
            mockStorageHelper.get.mockReturnValue({
                backToLobby: true,
                gameId: 0
            });
            const handler = new DashboardHandler(defaultProps, mockUpdateGameTransmitters);

            // Act
            const result = handler.shouldRenderGames([1001, 1002, 1003], 1001);

            // Assert
            expect(result).toBe(false);
            expect(console.log).toHaveBeenCalledWith(
                '[DashboardHandler] shouldRenderGames - Final result:',
                false
            );
        });

        it('should return true when ssoRedirectGameId is greater than 0', () => {
            // Arrange
            mockStorageHelper.get.mockReturnValue({
                backToLobby: false,
                gameId: 1001
            });
            const handler = new DashboardHandler(defaultProps, mockUpdateGameTransmitters);

            // Act
            const result = handler.shouldRenderGames([1001, 1002, 1003], 0);

            // Assert
            expect(result).toBe(true);
            expect(console.log).toHaveBeenCalledWith(
                '[DashboardHandler] shouldRenderGames - Final result:',
                true
            );
        });

        it('should return false when game is not in offer games and ssoRedirectGameId is 0', () => {
            // Arrange
            const handler = new DashboardHandler(defaultProps, mockUpdateGameTransmitters);

            // Act
            const result = handler.shouldRenderGames([1001, 1002, 1003], 9999);

            // Assert
            expect(result).toBe(false);
            expect(console.log).toHaveBeenCalledWith(
                '[DashboardHandler] shouldRenderGames - Final result:',
                false
            );
        });

        it('should handle the specific scenario from the logs', () => {
            // Arrange
            mockStorageHelper.get.mockReturnValue({
                backToLobby: false,
                gameId: 0
            });
            const handler = new DashboardHandler(defaultProps, mockUpdateGameTransmitters);

            // Act
            const result = handler.shouldRenderGames([1001, 1002, 1003, 1004, 1005, 1006, 1007], null);

            // Assert
            expect(result).toBe(false);
            expect(console.log).toHaveBeenCalledWith(
                '[DashboardHandler] shouldRenderGames - Input:',
                { offerGames: [1001, 1002, 1003, 1004, 1005, 1006, 1007], openGameId: null }
            );
            expect(console.log).toHaveBeenCalledWith(
                '[DashboardHandler] shouldRenderGames - URL context:',
                { backToLobby: false, ssoRedirectGameId: 0 }
            );
            expect(console.log).toHaveBeenCalledWith(
                '[DashboardHandler] shouldRenderGames - Final result:',
                false
            );
        });
    });

    describe('getLobbyGamesIds', () => {
        it('should return filtered lobby game IDs', () => {
            // Arrange
            const handler = new DashboardHandler(defaultProps, mockUpdateGameTransmitters);

            // Act
            const result = handler.getLobbyGamesIds();

            // Assert
            expect(result).toEqual([1001, 1002, 1003]);
            expect(mockGetOfferGamesIds).toHaveBeenCalledWith(defaultProps.authorizeResponse);
            expect(mockGetLobbyGameIds).toHaveBeenCalledWith(defaultProps.lobbyConfigs);
        });

        it('should return empty array when no matching games', () => {
            // Arrange
            mockGetOfferGamesIds.mockReturnValue([9999]);
            const handler = new DashboardHandler(defaultProps, mockUpdateGameTransmitters);

            // Act
            const result = handler.getLobbyGamesIds();

            // Assert
            expect(result).toEqual([]);
        });
    });

    describe('getOfferGamesIds', () => {
        it('should return offer games IDs from authorize response', () => {
            // Arrange
            const handler = new DashboardHandler(defaultProps, mockUpdateGameTransmitters);

            // Act
            const result = handler.getOfferGamesIds();

            // Assert
            expect(result).toEqual([1001, 1002, 1003]);
            expect(mockGetOfferGamesIds).toHaveBeenCalledWith(defaultProps.authorizeResponse);
        });
    });

    describe('buildLobbyConnectionContextValue', () => {
        it('should return lobby connection context value', () => {
            // Arrange
            const handler = new DashboardHandler(defaultProps, mockUpdateGameTransmitters);
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

    describe('connectLobbySocket', () => {
        it('should not connect when in direct mode', async () => {
            // Arrange
            const props = { ...defaultProps, directMode: true };
            const handler = new DashboardHandler(props, mockUpdateGameTransmitters);

            // Act
            await handler.connectLobbySocket();

            // Assert
            expect(handler.lobbyConnection.initLobbySocket).not.toHaveBeenCalled();
        });

        it('should connect when not in direct mode and games are available', async () => {
            // Arrange
            const handler = new DashboardHandler(defaultProps, mockUpdateGameTransmitters);
            handler.lobbyConnection.initLobbySocket = jest.fn().mockResolvedValue(undefined);
            handler.lobbyConnection.getTransmitters = jest.fn().mockReturnValue({});

            // Act
            await handler.connectLobbySocket();

            // Assert
            expect(handler.lobbyConnection.initLobbySocket).toHaveBeenCalledWith(
                defaultProps.session,
                [1002, 1003] // Excluding gameId from URL context (0)
            );
            expect(mockUpdateGameTransmitters).toHaveBeenCalledWith({});
        });

        it('should not connect when no lobby games are available', async () => {
            // Arrange
            mockGetLobbyGameIds.mockReturnValue([]);
            const handler = new DashboardHandler(defaultProps, mockUpdateGameTransmitters);

            // Act
            await handler.connectLobbySocket();

            // Assert
            expect(handler.lobbyConnection.initLobbySocket).not.toHaveBeenCalled();
        });
    });

    describe('removeGameTransmitter', () => {
        it('should unsubscribe from game', () => {
            // Arrange
            const handler = new DashboardHandler(defaultProps, mockUpdateGameTransmitters);
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
            const handler = new DashboardHandler(defaultProps, mockUpdateGameTransmitters);
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
            const handler = new DashboardHandler(defaultProps, mockUpdateGameTransmitters);
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
            const handler = new DashboardHandler(props, mockUpdateGameTransmitters);

            // Act
            const result = handler.getOfferGamesIds();

            // Assert
            expect(result).toEqual([]);
        });

        it('should handle undefined lobbyConfigs', () => {
            // Arrange
            const props = { ...defaultProps, lobbyConfigs: undefined };
            const handler = new DashboardHandler(props, mockUpdateGameTransmitters);

            // Act
            const result = handler.getLobbyGamesIds();

            // Assert
            expect(result).toEqual([]);
        });

        it('should handle empty offer games array', () => {
            // Arrange
            mockGetOfferGamesIds.mockReturnValue([]);
            const handler = new DashboardHandler(defaultProps, mockUpdateGameTransmitters);

            // Act
            const result = handler.getOfferGamesIds();

            // Assert
            expect(result).toEqual([]);
        });

        it('should handle null openGameId in shouldRenderGames', () => {
            // Arrange
            const handler = new DashboardHandler(defaultProps, mockUpdateGameTransmitters);

            // Act
            const result = handler.shouldRenderGames([1001, 1002, 1003], null);

            // Assert
            expect(result).toBe(false);
        });

        it('should handle undefined openGameId in shouldRenderGames', () => {
            // Arrange
            const handler = new DashboardHandler(defaultProps, mockUpdateGameTransmitters);

            // Act
            const result = handler.shouldRenderGames([1001, 1002, 1003], undefined);

            // Assert
            expect(result).toBe(false);
        });
    });

    describe('Integration Scenarios', () => {
        it('should handle the complete flow from the logs', async () => {
            // Arrange
            mockLoadURLContext.mockReturnValue({
                gameId: 0,
                isDirectMode: true
            });
            mockStorageHelper.get.mockReturnValue({
                backToLobby: false,
                gameId: 0
            });
            const props = { ...defaultProps, directMode: true, queryGame: 0 };
            const handler = new DashboardHandler(props, mockUpdateGameTransmitters);

            // Act
            const checkResult = handler.checkIsNotOfferGame();
            const renderResult = handler.shouldRenderGames([1001, 1002, 1003, 1004, 1005, 1006, 1007], null);
            await handler.connectLobbySocket();

            // Assert
            expect(checkResult).toBe(true);
            expect(renderResult).toBe(false);
            expect(handler.lobbyConnection.initLobbySocket).not.toHaveBeenCalled();
        });

        it('should handle direct mode with valid game ID', () => {
            // Arrange
            const props = { ...defaultProps, directMode: true, queryGame: 1001 };
            const handler = new DashboardHandler(props, mockUpdateGameTransmitters);

            // Act
            const checkResult = handler.checkIsNotOfferGame();
            const renderResult = handler.shouldRenderGames([1001, 1002, 1003], 1001);

            // Assert
            expect(checkResult).toBe(false);
            expect(renderResult).toBe(true);
        });
    });
}); 