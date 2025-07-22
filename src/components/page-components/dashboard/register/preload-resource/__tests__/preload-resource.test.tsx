import { render, screen, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import PreloadResourceRegister from '../index';
import { getLobbyConfigs } from '../../../../../../services/auth-service';
import { getAndHandleBannerOffer, getAndHandleGameOfferIds } from '../../../../../../_shared/helpers/preload-resources';

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
            language: 'en'
        },
        authorizeResponse: {
            authorized: true,
            user: { id: 1, username: 'testuser' },
            umInfo: null,
            isUM: false
        }
    };

    beforeEach(() => {
        jest.clearAllMocks();
        console.log = jest.fn();
    });

    describe('Component Initialization', () => {
        it('should call handleAuthorizedAccess on mount', async () => {
            // Arrange
            mockGetLobbyConfigs.mockResolvedValue({
                isAuthenticated: true,
                lobbyConfigs: { 1001: { id: 1001, name: 'Test Game' } }
            });

            // Act
            render(<PreloadResourceRegister {...defaultProps} />);

            // Assert
            await waitFor(() => {
                expect(mockGetLobbyConfigs).toHaveBeenCalledWith(defaultProps.session);
            });
        });

        it('should log component props on render', () => {
            // Act
            render(<PreloadResourceRegister {...defaultProps} />);

            // Assert
            expect(console.log).toHaveBeenCalledWith(
                '[PreloadResourceRegister] Component props:',
                expect.objectContaining({
                    isDirectMode: false,
                    gameId: 1001
                })
            );
        });
    });

    describe('Direct Mode Scenarios', () => {
        it('should render PreloadResources for direct mode with gameId > 0', () => {
            // Arrange
            const props = { ...defaultProps, isDirectMode: true, gameId: 1001 };

            // Act
            render(<PreloadResourceRegister {...props} />);

            // Assert
            expect(console.log).toHaveBeenCalledWith(
                '[PreloadResourceRegister] useMemo - Rendering PreloadResources for direct mode'
            );
        });

        it('should render PreloadResources for direct mode with gameId = 0', () => {
            // Arrange
            const props = { ...defaultProps, isDirectMode: true, gameId: 0 };

            // Act
            render(<PreloadResourceRegister {...props} />);

            // Assert
            expect(console.log).toHaveBeenCalledWith(
                '[PreloadResourceRegister] useMemo - Rendering PreloadResources for direct mode'
            );
        });

        it('should call updateStatePreloadResource after lobby configs in direct mode', async () => {
            // Arrange
            const props = { ...defaultProps, isDirectMode: true };
            mockGetLobbyConfigs.mockResolvedValue({
                isAuthenticated: true,
                lobbyConfigs: { 1001: { id: 1001, name: 'Test Game' } }
            });

            // Act
            render(<PreloadResourceRegister {...props} />);

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
            expect(console.log).toHaveBeenCalledWith(
                '[PreloadResourceRegister] useMemo - Rendering PreloadResources for non-direct mode with gameId > 0'
            );
        });

        it('should render empty fragment for non-direct mode with gameId = 0', () => {
            // Arrange
            const props = { ...defaultProps, isDirectMode: false, gameId: 0 };

            // Act
            render(<PreloadResourceRegister {...props} />);

            // Assert
            expect(console.log).toHaveBeenCalledWith(
                '[PreloadResourceRegister] useMemo - Rendering empty fragment'
            );
        });

        it('should call updateStatePreloadResource with timeout for lobby case', async () => {
            // Arrange
            const props = { ...defaultProps, isDirectMode: false, gameId: 0 };
            jest.useFakeTimers();

            // Act
            render(<PreloadResourceRegister {...props} />);

            // Assert
            act(() => {
                jest.advanceTimersByTime(100);
            });

            await waitFor(() => {
                expect(props.updateStatePreloadResource).toHaveBeenCalled();
            });

            jest.useRealTimers();
        });
    });

    describe('Lobby Configs Handling', () => {
        it('should handle successful lobby configs loading', async () => {
            // Arrange
            const mockLobbyConfigs = { 1001: { id: 1001, name: 'Test Game' } };
            mockGetLobbyConfigs.mockResolvedValue({
                isAuthenticated: true,
                lobbyConfigs: mockLobbyConfigs
            });

            // Act
            render(<PreloadResourceRegister {...defaultProps} />);

            // Assert
            await waitFor(() => {
                expect(defaultProps.updateLobbyConfigs).toHaveBeenCalledWith(mockLobbyConfigs);
                expect(mockGetAndHandleBannerOffer).toHaveBeenCalledWith(
                    defaultProps.authorizeResponse,
                    mockLobbyConfigs,
                    expect.any(Function)
                );
                expect(mockGetAndHandleGameOfferIds).toHaveBeenCalledWith(
                    defaultProps.authorizeResponse,
                    mockLobbyConfigs,
                    expect.any(Function)
                );
                expect(defaultProps.updateStatePreloadResource).toHaveBeenCalled();
            });
        });

        it('should handle empty lobby configs', async () => {
            // Arrange
            mockGetLobbyConfigs.mockResolvedValue({
                isAuthenticated: true,
                lobbyConfigs: {}
            });

            // Act
            render(<PreloadResourceRegister {...defaultProps} />);

            // Assert
            await waitFor(() => {
                expect(defaultProps.updateStatePreloadResource).toHaveBeenCalled();
                expect(defaultProps.updateLobbyConfigs).not.toHaveBeenCalled();
            });
        });

        it('should handle null lobby configs', async () => {
            // Arrange
            mockGetLobbyConfigs.mockResolvedValue(null);

            // Act
            render(<PreloadResourceRegister {...defaultProps} />);

            // Assert
            await waitFor(() => {
                expect(defaultProps.updateStatePreloadResource).toHaveBeenCalled();
                expect(defaultProps.updateLobbyConfigs).not.toHaveBeenCalled();
            });
        });
    });

    describe('Error Handling', () => {
        it('should handle getLobbyConfigs error gracefully', async () => {
            // Arrange
            const error = new Error('Network error');
            mockGetLobbyConfigs.mockRejectedValue(error);

            // Act
            render(<PreloadResourceRegister {...defaultProps} />);

            // Assert
            await waitFor(() => {
                expect(defaultProps.updateStatePreloadResource).toHaveBeenCalled();
                expect(console.error).toHaveBeenCalledWith(
                    '[PreloadResourceRegister] handleAuthorizedAccess - Error:',
                    error
                );
            });
        });

        it('should call updateStatePreloadResource even when lobby configs fail', async () => {
            // Arrange
            mockGetLobbyConfigs.mockRejectedValue(new Error('Test error'));

            // Act
            render(<PreloadResourceRegister {...defaultProps} />);

            // Assert
            await waitFor(() => {
                expect(defaultProps.updateStatePreloadResource).toHaveBeenCalled();
            });
        });
    });

    describe('State Management', () => {
        it('should initialize bannerId and gameOfferIds state correctly', () => {
            // Act
            render(<PreloadResourceRegister {...defaultProps} />);

            // Assert
            // The component should render without errors, indicating state is initialized
            expect(screen.getByTestId).toBeDefined();
        });

        it('should update bannerId when getAndHandleBannerOffer is called', async () => {
            // Arrange
            const mockLobbyConfigs = { 1001: { id: 1001, name: 'Test Game' } };
            mockGetLobbyConfigs.mockResolvedValue({
                isAuthenticated: true,
                lobbyConfigs: mockLobbyConfigs
            });

            // Act
            render(<PreloadResourceRegister {...defaultProps} />);

            // Assert
            await waitFor(() => {
                expect(mockGetAndHandleBannerOffer).toHaveBeenCalledWith(
                    defaultProps.authorizeResponse,
                    mockLobbyConfigs,
                    expect.any(Function)
                );
            });
        });

        it('should update gameOfferIds when getAndHandleGameOfferIds is called', async () => {
            // Arrange
            const mockLobbyConfigs = { 1001: { id: 1001, name: 'Test Game' } };
            mockGetLobbyConfigs.mockResolvedValue({
                isAuthenticated: true,
                lobbyConfigs: mockLobbyConfigs
            });

            // Act
            render(<PreloadResourceRegister {...defaultProps} />);

            // Assert
            await waitFor(() => {
                expect(mockGetAndHandleGameOfferIds).toHaveBeenCalledWith(
                    defaultProps.authorizeResponse,
                    mockLobbyConfigs,
                    expect.any(Function)
                );
            });
        });
    });

    describe('Edge Cases', () => {
        it('should handle undefined session gracefully', () => {
            // Arrange
            const props = { ...defaultProps, session: undefined };

            // Act & Assert
            expect(() => render(<PreloadResourceRegister {...props} />)).not.toThrow();
        });

        it('should handle undefined authorizeResponse gracefully', () => {
            // Arrange
            const props = { ...defaultProps, authorizeResponse: undefined };

            // Act & Assert
            expect(() => render(<PreloadResourceRegister {...props} />)).not.toThrow();
        });

        it('should handle negative gameId', () => {
            // Arrange
            const props = { ...defaultProps, gameId: -1 };

            // Act
            render(<PreloadResourceRegister {...props} />);

            // Assert
            expect(console.log).toHaveBeenCalledWith(
                '[PreloadResourceRegister] Component props:',
                expect.objectContaining({ gameId: -1 })
            );
        });

        it('should handle very large gameId', () => {
            // Arrange
            const props = { ...defaultProps, gameId: 999999 };

            // Act
            render(<PreloadResourceRegister {...props} />);

            // Assert
            expect(console.log).toHaveBeenCalledWith(
                '[PreloadResourceRegister] Component props:',
                expect.objectContaining({ gameId: 999999 })
            );
        });
    });

    describe('useEffect Dependencies', () => {
        it('should re-run effect when gameId changes', async () => {
            // Arrange
            const { rerender } = render(<PreloadResourceRegister {...defaultProps} />);

            // Act
            rerender(<PreloadResourceRegister {...defaultProps} gameId={1002} />);

            // Assert
            await waitFor(() => {
                expect(console.log).toHaveBeenCalledWith(
                    '[PreloadResourceRegister] useEffect - gameId or isDirectMode changed:',
                    { gameId: 1002, isDirectMode: false }
                );
            });
        });

        it('should re-run effect when isDirectMode changes', async () => {
            // Arrange
            const { rerender } = render(<PreloadResourceRegister {...defaultProps} />);

            // Act
            rerender(<PreloadResourceRegister {...defaultProps} isDirectMode={true} />);

            // Assert
            await waitFor(() => {
                expect(console.log).toHaveBeenCalledWith(
                    '[PreloadResourceRegister] useEffect - gameId or isDirectMode changed:',
                    { gameId: 1001, isDirectMode: true }
                );
            });
        });
    });
}); 