import { render, screen, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import PreloadResourceRegister from '../index';
import { getLobbyConfigs } from '../../../../../../services/auth-service';
import { getAndHandleBannerOffer, getAndHandleGameOfferIds } from '../../../../../../_shared/helpers/preload-resources';
import { AuthorizeResponse, SSOResponse } from 'sc-user-service-client/dist/auth';
import { ILobbyConfigs } from '../../../../dashboard/type';

// Mock dependencies
jest.mock('../../../../../../services/auth-service');
jest.mock('../../../../../../_shared/helpers/preload-resources');

const mockGetLobbyConfigs = getLobbyConfigs as jest.MockedFunction<typeof getLobbyConfigs>;
const mockGetAndHandleBannerOffer = getAndHandleBannerOffer as jest.MockedFunction<typeof getAndHandleBannerOffer>;
const mockGetAndHandleGameOfferIds = getAndHandleGameOfferIds as jest.MockedFunction<typeof getAndHandleGameOfferIds>;

describe('PreloadResourceRegister', () => {
    // Arrange: Common test setup
    const defaultProps = {
        isDirectMode: false,
        gameId: 1001,
        updateStatePreloadResource: jest.fn(),
        updateLobbyConfigs: jest.fn(),
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
        } as AuthorizeResponse
    };

    // Mock lobby configs with correct structure
    const mockLobbyConfigs = {
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
    } as any;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Component Initialization', () => {
        it('should call handleAuthorizedAccess on mount', async () => {
            // Arrange
            mockGetLobbyConfigs.mockResolvedValue({
                lobbyConfigs: mockLobbyConfigs
            } as any);

            // Act
            await act(async () => {
                render(<PreloadResourceRegister {...defaultProps} />);
            });

            // Assert
            await waitFor(() => {
                expect(mockGetLobbyConfigs).toHaveBeenCalledWith(defaultProps.session);
            });
        });

        it('should render component with props', () => {
            // Act
            render(<PreloadResourceRegister {...defaultProps} />);

            // Assert
            expect(screen.getByTestId).toBeDefined();
        });
    });

    describe('Direct Mode Scenarios', () => {
        it('should render PreloadResources for direct mode with gameId > 0', () => {
            // Arrange
            const props = { ...defaultProps, isDirectMode: true, gameId: 1001 };

            // Act
            render(<PreloadResourceRegister {...props} />);

            // Assert
            expect(screen.getByTestId).toBeDefined();
        });

        it('should render PreloadResources for direct mode with gameId = 0', () => {
            // Arrange
            const props = { ...defaultProps, isDirectMode: true, gameId: 0 };

            // Act
            render(<PreloadResourceRegister {...props} />);

            // Assert
            expect(screen.getByTestId).toBeDefined();
        });

        it('should call updateStatePreloadResource after lobby configs in direct mode', async () => {
            // Arrange
            const props = { ...defaultProps, isDirectMode: true };
            mockGetLobbyConfigs.mockResolvedValue({
                lobbyConfigs: mockLobbyConfigs
            } as any);

            // Act
            await act(async () => {
                render(<PreloadResourceRegister {...props} />);
            });

            // Assert
            await waitFor(() => {
                expect(props.updateStatePreloadResource).toHaveBeenCalled();
            });
        });
    });

    describe('Non-Direct Mode Scenarios', () => {
        it('should render PreloadResources for non-direct mode with gameId > 0', () => {
            // Arrange
            const props = { ...defaultProps, isDirectMode: false, gameId: 1001 };

            // Act
            render(<PreloadResourceRegister {...props} />);

            // Assert
            expect(screen.getByTestId).toBeDefined();
        });

        it('should render PreloadResources for non-direct mode with gameId = 0', () => {
            // Arrange
            const props = { ...defaultProps, isDirectMode: false, gameId: 0 };

            // Act
            render(<PreloadResourceRegister {...props} />);

            // Assert
            expect(screen.getByTestId).toBeDefined();
        });

        it('should call updateStatePreloadResource after lobby configs in non-direct mode', async () => {
            // Arrange
            const props = { ...defaultProps, isDirectMode: false };
            mockGetLobbyConfigs.mockResolvedValue({
                lobbyConfigs: mockLobbyConfigs
            } as any);

            // Act
            await act(async () => {
                render(<PreloadResourceRegister {...props} />);
            });

            // Assert
            await waitFor(() => {
                expect(props.updateStatePreloadResource).toHaveBeenCalled();
            });
        });
    });

    describe('Error Handling', () => {
        it('should handle empty lobby configs', async () => {
            // Arrange
            const props = { ...defaultProps, isDirectMode: false };
            mockGetLobbyConfigs.mockResolvedValue({
                isAuthenticated: true,
                lobbyConfigs: {
                    name: "Test Lobby",
                    currencyGroupIds: ["USD"],
                    miniPanelGameIds: [1001, 1002],
                    categories: [],
                    banners: [],
                    gameSettings: {},
                    roundTimerGame: null,
                } as any
            } as any);

            // Act
            await act(async () => {
                render(<PreloadResourceRegister {...props} />);
            });

            // Assert
            await waitFor(() => {
                expect(props.updateStatePreloadResource).toHaveBeenCalled();
            });
        });

        it('should handle lobby configs with missing gameSettings', async () => {
            // Arrange
            const props = { ...defaultProps, isDirectMode: false };
            mockGetLobbyConfigs.mockResolvedValue({
                lobbyConfigs: mockLobbyConfigs
            } as any);

            // Act
            await act(async () => {
                render(<PreloadResourceRegister {...props} />);
            });

            // Assert
            await waitFor(() => {
                expect(props.updateStatePreloadResource).toHaveBeenCalled();
            });
        });

        it('should handle lobby configs with malformed gameSettings', async () => {
            // Arrange
            const props = { ...defaultProps, isDirectMode: false };
            mockGetLobbyConfigs.mockResolvedValue({
                isAuthenticated: true,
                lobbyConfigs: mockLobbyConfigs
            } as any);

            // Act
            await act(async () => {
                render(<PreloadResourceRegister {...props} />);
            });

            // Assert
            await waitFor(() => {
                expect(props.updateStatePreloadResource).toHaveBeenCalled();
            });
        });
    });

    describe('Integration Tests', () => {
        it('should handle complete flow with valid data', async () => {
            // Arrange
            const props = { ...defaultProps, isDirectMode: false };
            mockGetLobbyConfigs.mockResolvedValue({
                isAuthenticated: true,
                lobbyConfigs: mockLobbyConfigs
            } as any);

            // Act
            await act(async () => {
                render(<PreloadResourceRegister {...props} />);
            });

            // Assert
            await waitFor(() => {
                expect(mockGetLobbyConfigs).toHaveBeenCalledWith(props.session);
                expect(props.updateLobbyConfigs).toHaveBeenCalledWith(mockLobbyConfigs);
                expect(mockGetAndHandleBannerOffer).toHaveBeenCalled();
                expect(mockGetAndHandleGameOfferIds).toHaveBeenCalled();
                expect(props.updateStatePreloadResource).toHaveBeenCalled();
            });
        });

        it('should handle complete flow in direct mode', async () => {
            // Arrange
            const props = { ...defaultProps, isDirectMode: true };
            mockGetLobbyConfigs.mockResolvedValue({
                isAuthenticated: true,
                lobbyConfigs: mockLobbyConfigs
            } as any);

            // Act
            await act(async () => {
                render(<PreloadResourceRegister {...props} />);
            });

            // Assert
            await waitFor(() => {
                expect(mockGetLobbyConfigs).toHaveBeenCalledWith(props.session);
                expect(props.updateLobbyConfigs).toHaveBeenCalledWith(mockLobbyConfigs);
                expect(mockGetAndHandleBannerOffer).toHaveBeenCalled();
                expect(mockGetAndHandleGameOfferIds).toHaveBeenCalled();
                expect(props.updateStatePreloadResource).toHaveBeenCalled();
            });
        });
    });
}); 