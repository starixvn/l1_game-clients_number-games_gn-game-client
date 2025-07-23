import { URLContextModel, parseContextFromURL, loadURLContext, updateURLContext, getURLContext } from '../url-context';
import { StorageHelper, localStorageKeys, setUserLatestGameId } from '../../helpers';

// Mock dependencies
jest.mock('../../helpers', () => ({
    StorageHelper: {
        get: jest.fn(),
        set: jest.fn()
    },
    localStorageKeys: {
        url: 'url',
        latestGameId: 'latestGameId'
    },
    setUserLatestGameId: jest.fn()
}));

const mockStorageHelper = StorageHelper as jest.Mocked<typeof StorageHelper>;
const mockSetUserLatestGameId = setUserLatestGameId as jest.MockedFunction<typeof setUserLatestGameId>;

describe('URL Context', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Mock globalThis.location
        Object.defineProperty(globalThis, 'location', {
            value: {
                search: '',
                href: 'http://localhost:3000'
            },
            writable: true
        });
        // Mock globalThis.history
        Object.defineProperty(globalThis, 'history', {
            value: {
                pushState: jest.fn()
            },
            writable: true
        });
        console.log = jest.fn();
    });

    describe('parseContextFromURL', () => {
        it('should parse valid URL parameters correctly', () => {
            // Arrange
            globalThis.location.search = '?token=abc123&lang=en&gameId=1001&ref=d_direct&op=SP';
            const expected: URLContextModel = {
                token: 'abc123',
                language: 'en',
                gameId: 1001,
                isDirectMode: true,
                redirectUrl: null,
                firstSSOToLobby: true,
                isSabaPlay: true
            };

            // Act
            const result = parseContextFromURL();

            // Assert
            expect(result).toEqual(expected);
        });

        it('should return undefined when no URL parameters are present', () => {
            // Arrange
            globalThis.location.search = '';

            // Act
            const result = parseContextFromURL();

            // Assert
            expect(result).toBeUndefined();
            expect(console.log).toHaveBeenCalledWith(
                '[URLContext] parseContextFromURL - No URL parameters found, returning undefined'
            );
        });

        it('should handle missing optional parameters', () => {
            // Arrange
            globalThis.location.search = '?token=abc123&lang=en';
            const expected: URLContextModel = {
                token: 'abc123',
                language: 'en',
                gameId: 0,
                isDirectMode: false,
                redirectUrl: null,
                firstSSOToLobby: true,
                isSabaPlay: false
            };

            // Act
            const result = parseContextFromURL();

            // Assert
            expect(result).toEqual(expected);
        });

        it('should handle invalid gameId parameter', () => {
            // Arrange
            globalThis.location.search = '?token=abc123&gameId=invalid&ref=d_direct';
            const expected: URLContextModel = {
                token: 'abc123',
                language: null,
                gameId: NaN,
                isDirectMode: false,
                redirectUrl: null,
                firstSSOToLobby: true,
                isSabaPlay: false
            };

            // Act
            const result = parseContextFromURL();

            // Assert
            expect(result).toEqual(expected);
        });

        it('should set isDirectMode to false when ref is present and redirectUrl is not', () => {
            // Arrange
            globalThis.location.search = '?ref=d_direct&token=abc123';

            // Act
            const result = parseContextFromURL();

            // Assert
            expect(result?.isDirectMode).toBe(false);
        });

        it('should set isDirectMode to true when op=SP (SabaPlay)', () => {
            // Arrange
            globalThis.location.search = '?op=SP&token=abc123&gameId=1003';

            // Act
            const result = parseContextFromURL();

            // Assert
            expect(result?.isDirectMode).toBe(true);
        });

        it('should set isDirectMode to false when op=SP but gameId=0 (lobby)', () => {
            // Arrange
            globalThis.location.search = '?op=SP&token=abc123&gameId=0';

            // Act
            const result = parseContextFromURL();

            // Assert
            expect(result?.isDirectMode).toBe(false);
        });

        it('should set isDirectMode to true when ref and redirectUrl are both present', () => {
            // Arrange
            globalThis.location.search = '?ref=d_direct&rurl=redirect&token=abc123&gameId=1001';

            // Act
            const result = parseContextFromURL();

            // Assert
            expect(result?.isDirectMode).toBe(true);
        });

        it('should set isDirectMode to true when ref+redirectUrl and op=SP are present', () => {
            // Arrange
            globalThis.location.search = '?ref=d_direct&rurl=redirect&op=SP&token=abc123&gameId=1001';

            // Act
            const result = parseContextFromURL();

            // Assert
            expect(result?.isDirectMode).toBe(true);
        });

        it('should set isDirectMode to true when ref and redirectUrl are present but op=SP is also present', () => {
            // Arrange
            globalThis.location.search = '?ref=d_direct&rurl=redirect&op=SP&token=abc123&gameId=1001';

            // Act
            const result = parseContextFromURL();

            // Assert
            expect(result?.isDirectMode).toBe(true);
        });

        it('should set isDirectMode to true when both ref+redirectUrl and op=SP are present', () => {
            // Arrange
            globalThis.location.search = '?ref=d_direct&rurl=redirect&op=SP&token=abc123&gameId=1001';

            // Act
            const result = parseContextFromURL();

            // Assert
            expect(result?.isDirectMode).toBe(true);
        });

        it('should set isSabaPlay to true when op=SP', () => {
            // Arrange
            globalThis.location.search = '?op=SP&token=abc123';

            // Act
            const result = parseContextFromURL();

            // Assert
            expect(result?.isSabaPlay).toBe(true);
        });

        it('should set isSabaPlay to false when op is not SP', () => {
            // Arrange
            globalThis.location.search = '?op=GN&token=abc123';

            // Act
            const result = parseContextFromURL();

            // Assert
            expect(result?.isSabaPlay).toBe(false);
        });

        it('should handle multiple URL parameters correctly', () => {
            // Arrange
            globalThis.location.search = '?token=abc123&lang=vi-VN&gameId=1002&ref=d_direct&op=SP&cg=Credit_VN';
            const expected: URLContextModel = {
                token: 'abc123',
                language: 'vi-VN',
                gameId: 1002,
                isDirectMode: true,
                redirectUrl: null,
                firstSSOToLobby: true,
                isSabaPlay: true
            };

            // Act
            const result = parseContextFromURL();

            // Assert
            expect(result).toEqual(expected);
        });

        it('should handle HTML-encoded ampersands in URL parameters', () => {
            // Arrange
            globalThis.location.search = '?token=c2ee0ee1-5bd8-409a-944e-42d3f131d8d9&amp;lang=vi-VN&amp;appType=1&amp;gameId=1003&amp;op=SP&amp;cg=SabaPlay_VN';
            const expected: URLContextModel = {
                token: 'c2ee0ee1-5bd8-409a-944e-42d3f131d8d9',
                language: 'vi-VN',
                gameId: 1003,
                isDirectMode: true,
                redirectUrl: null,
                firstSSOToLobby: true,
                isSabaPlay: true
            };

            // Act
            const result = parseContextFromURL();

            // Assert
            expect(result).toEqual(expected);
        });
    });

    describe('loadURLContext', () => {
        it('should return context from URL when available', () => {
            // Arrange
            globalThis.location.search = '?token=abc123&lang=en&gameId=1001&ref=d_direct';
            const expectedContext = {
                language: 'en',
                gameId: 1001,
                isDirectMode: false,
                redirectUrl: null,
                firstSSOToLobby: true,
                isSabaPlay: false
            };

            // Act
            const result = loadURLContext();

            // Assert
            expect(result).toEqual(expect.objectContaining({
                token: 'abc123',
                ...expectedContext
            }));
            expect(mockStorageHelper.set).toHaveBeenCalledWith(
                localStorageKeys.url,
                expectedContext
            );
            expect(globalThis.history.pushState).toHaveBeenCalledWith(
                null,
                '',
                'http://localhost:3000'
            );
        });

        it('should return context from localStorage when URL context is not available', () => {
            // Arrange
            globalThis.location.search = '';
            const localStorageContext = {
                language: 'en',
                gameId: 1001,
                isDirectMode: false,
                redirectUrl: null,
                firstSSOToLobby: false,
                isSabaPlay: false
            };
            mockStorageHelper.get.mockReturnValue(localStorageContext);

            // Act
            const result = loadURLContext();

            // Assert
            expect(result).toEqual(localStorageContext);
            expect(mockStorageHelper.get).toHaveBeenCalledWith(localStorageKeys.url);
        });

        it('should return null when neither URL nor localStorage context is available', () => {
            // Arrange
            globalThis.location.search = '';
            mockStorageHelper.get.mockReturnValue(null);

            // Act
            const result = loadURLContext();

            // Assert
            expect(result).toBeNull();
        });

        it('should not store token in localStorage', () => {
            // Arrange
            globalThis.location.search = '?token=abc123&lang=en&gameId=1001';

            // Act
            loadURLContext();

            // Assert
            expect(mockStorageHelper.set).toHaveBeenCalledWith(
                localStorageKeys.url,
                expect.objectContaining({
                    token: undefined,
                    language: 'en',
                    gameId: 1001
                })
            );
        });
    });

    describe('updateURLContext', () => {
        it('should update context in localStorage', () => {
            // Arrange
            const existingContext = { language: 'en', gameId: 1001 };
            const newContext = { gameId: 1002, isDirectMode: true };
            mockStorageHelper.get.mockReturnValue(existingContext);

            // Act
            updateURLContext(newContext);

            // Assert
            expect(mockStorageHelper.get).toHaveBeenCalledWith(localStorageKeys.url);
            expect(mockStorageHelper.set).toHaveBeenCalledWith(
                localStorageKeys.url,
                {
                    ...existingContext,
                    ...newContext,
                    firstSSOToLobby: false
                }
            );
        });

        it('should store latestGameId when gameId is provided', () => {
            // Arrange
            const newContext = { gameId: 1002 };
            mockStorageHelper.get.mockReturnValue({});

            // Act
            updateURLContext(newContext);

            // Assert
            expect(mockStorageHelper.set).toHaveBeenCalledWith(
                localStorageKeys.url,
                expect.objectContaining({
                    gameId: 1002,
                    firstSSOToLobby: false
                })
            );
            expect(mockSetUserLatestGameId).toHaveBeenCalledWith(1002, undefined);
        });

        it('should not store latestGameId when gameId is not provided', () => {
            // Arrange
            const newContext = { isDirectMode: true };
            mockStorageHelper.get.mockReturnValue({});

            // Act
            updateURLContext(newContext);

            // Assert
            expect(mockStorageHelper.set).not.toHaveBeenCalledWith(
                localStorageKeys.latestGameId,
                expect.anything()
            );
        });

        it('should set firstSSOToLobby to false when updating context', () => {
            // Arrange
            const existingContext = { firstSSOToLobby: true };
            const newContext = { gameId: 1002 };
            mockStorageHelper.get.mockReturnValue(existingContext);

            // Act
            updateURLContext(newContext);

            // Assert
            expect(mockStorageHelper.set).toHaveBeenCalledWith(
                localStorageKeys.url,
                expect.objectContaining({
                    firstSSOToLobby: false
                })
            );
        });
    });

    describe('getURLContext', () => {
        it('should return context from localStorage', () => {
            // Arrange
            const expectedContext = { language: 'en', gameId: 1001 };
            mockStorageHelper.get.mockReturnValue(expectedContext);

            // Act
            const result = getURLContext();

            // Assert
            expect(result).toEqual(expectedContext);
            expect(mockStorageHelper.get).toHaveBeenCalledWith(localStorageKeys.url);
        });

        it('should return empty object when localStorage context is not available', () => {
            // Arrange
            mockStorageHelper.get.mockReturnValue(null);

            // Act
            const result = getURLContext();

            // Assert
            expect(result).toEqual({});
        });
    });

    describe('Edge Cases', () => {
        it('should handle undefined globalThis.location', () => {
            // Arrange
            Object.defineProperty(globalThis, 'location', {
                value: undefined,
                writable: true
            });

            // Act & Assert
            expect(() => parseContextFromURL()).not.toThrow();
        });

        it('should handle undefined globalThis.location.search', () => {
            // Arrange
            Object.defineProperty(globalThis, 'location', {
                value: { search: undefined },
                writable: true
            });

            // Act
            const result = parseContextFromURL();

            // Assert
            expect(result).toBeUndefined();
        });

        it('should handle malformed URL parameters', () => {
            // Arrange
            globalThis.location.search = '?invalid=param&token=abc123&gameId=1001';

            // Act
            const result = parseContextFromURL();

            // Assert
            expect(result).toEqual(expect.objectContaining({
                token: 'abc123',
                gameId: 1001
            }));
        });

        it('should handle very large gameId values', () => {
            // Arrange
            globalThis.location.search = '?gameId=999999999';

            // Act
            const result = parseContextFromURL();

            // Assert
            expect(result?.gameId).toBe(999999999);
        });

        it('should handle negative gameId values', () => {
            // Arrange
            globalThis.location.search = '?gameId=-1';

            // Act
            const result = parseContextFromURL();

            // Assert
            expect(result?.gameId).toBe(-1);
        });
    });

    describe('Integration Scenarios', () => {
        it('should handle the specific URL from the logs', () => {
            // Arrange
            globalThis.location.search = '?token=999d8dd3-94da-45b1-a945-40ba6594a99a&lang=vi-VN&appType=1&ref=d_direct&op=GN&cg=Credit_VN';
            const expected: URLContextModel = {
                token: '999d8dd3-94da-45b1-a945-40ba6594a99a',
                language: 'vi-VN',
                gameId: 0,
                isDirectMode: false,
                redirectUrl: null,
                firstSSOToLobby: true,
                isSabaPlay: false
            };

            // Act
            const result = parseContextFromURL();

            // Assert
            expect(result).toEqual(expected);
        });

        it('should handle URL context loading and storage flow', () => {
            // Arrange
            globalThis.location.search = '?token=abc123&lang=en&gameId=1001&ref=d_direct';
            mockStorageHelper.get.mockReturnValue(null);

            // Act
            const result = loadURLContext();

            // Assert
            expect(result).toEqual(expect.objectContaining({
                token: 'abc123',
                language: 'en',
                gameId: 1001,
                isDirectMode: false
            }));
            expect(mockStorageHelper.set).toHaveBeenCalledWith(
                localStorageKeys.url,
                expect.objectContaining({
                    token: undefined,
                    language: 'en',
                    gameId: 1001,
                    isDirectMode: false
                })
            );
        });
    });
}); 