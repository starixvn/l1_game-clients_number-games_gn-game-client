import { parseContextFromURL, loadURLContext, updateURLContext, getURLContext, initialURLContextData } from "../url-context";
import { StorageHelper, localStorageKeys, AnalyticsHelper } from "../../helpers";
import { GlobalMessageTransmitter, GlobalTransmitterEvent } from "../../helpers/message-transmitter/global-transmitter";
import { GameUtils } from "../../helpers/base-64-helper";

// Mock dependencies
jest.mock("../../helpers", () => ({
    StorageHelper: {
        get: jest.fn(),
        set: jest.fn(),
    },
    localStorageKeys: {
        url: "url",
        latestGameId: "latestGameId",
    },
    AnalyticsHelper: {
        login: jest.fn(),
    },
}));

jest.mock("../../helpers/message-transmitter/global-transmitter", () => ({
    GlobalMessageTransmitter: {
        broadcast: jest.fn(),
    },
    GlobalTransmitterEvent: {
        BACK_TO_LOBBY: "BACK_TO_LOBBY",
    },
}));

jest.mock("../../helpers/base-64-helper", () => ({
    GameUtils: {
        base64Decode: jest.fn(),
    },
}));

// Mock global objects
const mockLocation = {
    search: "",
    href: "https://example.com",
};

const mockHistory = {
    pushState: jest.fn(),
};

Object.defineProperty(globalThis, "location", {
    value: mockLocation,
    writable: true,
});

Object.defineProperty(globalThis, "history", {
    value: mockHistory,
    writable: true,
});

describe("URL Context Functions", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockLocation.search = "";
        mockLocation.href = "https://example.com";
        // Reset StorageHelper mocks to default behavior
        (StorageHelper.get as jest.Mock).mockImplementation(() => null);
        (StorageHelper.set as jest.Mock).mockImplementation(() => { });
    });

    describe("parseContextFromURL", () => {
        it("should return undefined when no URL parameters are present", () => {
            // Arrange
            mockLocation.search = "";

            // Act
            const result = parseContextFromURL();

            // Assert
            expect(result).toBeUndefined();
        });

        it("should parse all URL parameters correctly", () => {
            // Arrange
            mockLocation.search = "?token=test-token&lang=en&gameId=1001&ref=true&rurl=redirect-url&op=SP";

            // Act
            const result = parseContextFromURL();

            // Assert
            expect(result).toEqual({
                token: "test-token",
                language: "en",
                gameId: 1001,
                isDirectMode: true,
                redirectUrl: "redirect-url",
                firstSSOToLobby: true,
                isSabaPlay: true,
            });
        });

        it("should parse gameId as number", () => {
            // Arrange
            mockLocation.search = "?gameId=1001";

            // Act
            const result = parseContextFromURL();

            // Assert
            expect(result?.gameId).toBe(1001);
        });

        it("should parse gameId as 0 when not provided", () => {
            // Arrange
            mockLocation.search = "?token=test-token";

            // Act
            const result = parseContextFromURL();

            // Assert
            expect(result?.gameId).toBe(0);
        });

        it("should set isDirectMode to true when ref parameter is present", () => {
            // Arrange
            mockLocation.search = "?ref=true";

            // Act
            const result = parseContextFromURL();

            // Assert
            expect(result?.isDirectMode).toBe(true);
        });

        it("should set isDirectMode to false when ref parameter is not present", () => {
            // Arrange
            mockLocation.search = "?token=test-token";

            // Act
            const result = parseContextFromURL();

            // Assert
            expect(result?.isDirectMode).toBe(false);
        });

        it("should set redirectUrl when in direct mode", () => {
            // Arrange
            mockLocation.search = "?ref=true&rurl=test-redirect";

            // Act
            const result = parseContextFromURL();

            // Assert
            expect(result?.redirectUrl).toBe("test-redirect");
        });

        it("should set redirectUrl to empty string when not in direct mode", () => {
            // Arrange
            mockLocation.search = "?rurl=test-redirect";

            // Act
            const result = parseContextFromURL();

            // Assert
            expect(result?.redirectUrl).toBe("");
        });

        it("should set isSabaPlay to true when op=SP", () => {
            // Arrange
            mockLocation.search = "?op=SP";

            // Act
            const result = parseContextFromURL();

            // Assert
            expect(result?.isSabaPlay).toBe(true);
        });

        it("should set isSabaPlay to false when op is not SP", () => {
            // Arrange
            mockLocation.search = "?op=OTHER";

            // Act
            const result = parseContextFromURL();

            // Assert
            expect(result?.isSabaPlay).toBe(false);
        });

        it("should set isSabaPlay to false when op parameter is not present", () => {
            // Arrange
            mockLocation.search = "?token=test-token";

            // Act
            const result = parseContextFromURL();

            // Assert
            expect(result?.isSabaPlay).toBe(false);
        });

        it("should set firstSSOToLobby to true", () => {
            // Arrange
            mockLocation.search = "?token=test-token";

            // Act
            const result = parseContextFromURL();

            // Assert
            expect(result?.firstSSOToLobby).toBe(true);
        });
    });

    describe("loadURLContext", () => {
        it("should return context from URL when present", () => {
            // Arrange
            mockLocation.search = "?token=test-token&gameId=1001&ref=true&rurl=redirect-url&op=SP";
            const contextFromURL = {
                token: "test-token",
                language: null,
                gameId: 1001,
                isDirectMode: true,
                redirectUrl: "redirect-url",
                isSabaPlay: true,
                firstSSOToLobby: true,
            };

            // Act
            const result = loadURLContext();

            // Assert
            expect(result).toEqual(contextFromURL);
            expect(StorageHelper.set).toHaveBeenCalledWith(localStorageKeys.url, {
                ...contextFromURL,
                token: undefined,
            });
            expect(AnalyticsHelper.login).toHaveBeenCalledWith(contextFromURL);
            expect(mockHistory.pushState).toHaveBeenCalledWith(null, "", "https://example.com");
        });

        it("should return context from localStorage when no URL parameters", () => {
            // Arrange
            mockLocation.search = "";
            const contextFromLocalStorage = {
                gameId: 1001,
                isDirectMode: false,
                isSabaPlay: false,
            };
            (StorageHelper.get as jest.Mock).mockReturnValue(contextFromLocalStorage);

            // Act
            const result = loadURLContext();

            // Assert
            expect(result).toEqual(contextFromLocalStorage);
            expect(StorageHelper.set).not.toHaveBeenCalled();
            expect(AnalyticsHelper.login).not.toHaveBeenCalled();
        });

        it("should handle null localStorage context", () => {
            // Arrange
            mockLocation.search = "";
            (StorageHelper.get as jest.Mock).mockReturnValue(null);

            // Act
            const result = loadURLContext();

            // Assert
            expect(result).toBeNull();
        });

        it("should handle undefined localStorage context", () => {
            // Arrange
            mockLocation.search = "";
            (StorageHelper.get as jest.Mock).mockReturnValue(undefined);

            // Act
            const result = loadURLContext();

            // Assert
            expect(result).toBeNull();
        });

        it("should prioritize URL context over localStorage context", () => {
            // Arrange
            mockLocation.search = "?gameId=1001&op=SP";
            const contextFromLocalStorage = {
                gameId: 1002,
                isSabaPlay: false,
            };
            (StorageHelper.get as jest.Mock).mockReturnValue(contextFromLocalStorage);

            // Act
            const result = loadURLContext();

            // Assert
            expect(result?.gameId).toBe(1001);
            expect(result?.isSabaPlay).toBe(true);
        });
    });

    describe("updateURLContext", () => {
        it("should update context with new values", () => {
            // Arrange
            const existingContext = {
                gameId: 1001,
                isDirectMode: false,
            };
            const newContext = {
                gameId: 1002,
                isSabaPlay: true,
            };
            (StorageHelper.get as jest.Mock).mockReturnValue(existingContext);

            // Act
            updateURLContext(newContext);

            // Assert
            expect(StorageHelper.set).toHaveBeenCalledWith(localStorageKeys.url, {
                ...existingContext,
                ...newContext,
                firstSSOToLobby: false,
            });
        });

        it("should update latestGameId when gameId is provided", () => {
            // Arrange
            const existingContext = { gameId: 1001 };
            const newContext = { gameId: 1002 };
            (StorageHelper.get as jest.Mock).mockReturnValue(existingContext);

            // Act
            updateURLContext(newContext);

            // Assert
            expect(StorageHelper.set).toHaveBeenCalledWith(localStorageKeys.latestGameId, 1002);
        });

        it("should not update latestGameId when gameId is not provided", () => {
            // Arrange
            const existingContext = { gameId: 1001 };
            const newContext = { isDirectMode: true };
            (StorageHelper.get as jest.Mock).mockReturnValue(existingContext);

            // Act
            updateURLContext(newContext);

            // Assert
            expect(StorageHelper.set).not.toHaveBeenCalledWith(localStorageKeys.latestGameId, expect.anything());
        });

        it("should handle empty existing context", () => {
            // Arrange
            (StorageHelper.get as jest.Mock).mockReturnValue({});
            const newContext = { gameId: 1001, isSabaPlay: true };

            // Act
            updateURLContext(newContext);

            // Assert
            expect(StorageHelper.set).toHaveBeenCalledWith(localStorageKeys.url, {
                ...newContext,
                firstSSOToLobby: false,
            });
        });

        it("should handle null existing context", () => {
            // Arrange
            (StorageHelper.get as jest.Mock).mockReturnValue(null);
            const newContext = { gameId: 1001 };

            // Act
            updateURLContext(newContext);

            // Assert
            expect(StorageHelper.set).toHaveBeenCalledWith(localStorageKeys.url, {
                ...newContext,
                firstSSOToLobby: false,
            });
        });
    });

    describe("getURLContext", () => {
        it("should return context from localStorage", () => {
            // Arrange
            const context = {
                gameId: 1001,
                isDirectMode: false,
                isSabaPlay: true,
            };
            (StorageHelper.get as jest.Mock).mockReturnValue(context);

            // Act
            const result = getURLContext();

            // Assert
            expect(result).toEqual(context);
            expect(StorageHelper.get).toHaveBeenCalledWith(localStorageKeys.url);
        });

        it("should return empty object when no context in localStorage", () => {
            // Arrange
            (StorageHelper.get as jest.Mock).mockReturnValue(null);

            // Act
            const result = getURLContext();

            // Assert
            expect(result).toEqual({});
        });

        it("should return empty object when context is undefined", () => {
            // Arrange
            (StorageHelper.get as jest.Mock).mockReturnValue(undefined);

            // Act
            const result = getURLContext();

            // Assert
            expect(result).toEqual({});
        });
    });

    describe("initialURLContextData", () => {
        it("should include backToRedirectUrl function", () => {
            // Act
            const result = initialURLContextData;

            // Assert
            expect(typeof result.backToRedirectUrl).toBe("function");
        });

        it("should call backToRedirectUrl with redirectUrl", () => {
            // Arrange
            const redirectUrl = "encoded-redirect-url";
            const decodedUrl = "https://example.com/redirect";
            (GameUtils.base64Decode as jest.Mock).mockReturnValue(decodedUrl);

            // Act
            initialURLContextData.backToRedirectUrl(redirectUrl);

            // Assert
            expect(GameUtils.base64Decode).toHaveBeenCalledWith(redirectUrl);
            expect(globalThis.location.href).toBe(decodedUrl);
        });

        it("should handle backToRedirectUrl with empty redirectUrl", () => {
            // Arrange
            const redirectUrl = "";
            const existingContext = { gameId: 1001 };
            (StorageHelper.get as jest.Mock).mockReturnValue(existingContext);

            // Act
            initialURLContextData.backToRedirectUrl(redirectUrl);

            // Assert
            expect(StorageHelper.set).toHaveBeenCalledWith(localStorageKeys.url, {
                ...existingContext,
                backToLobby: true,
                gameId: 0,
                firstSSOToLobby: false,
            });
            expect(StorageHelper.set).toHaveBeenCalledWith(localStorageKeys.latestGameId, 0);
            expect(GlobalMessageTransmitter.broadcast).toHaveBeenCalledWith({
                [GlobalTransmitterEvent.BACK_TO_LOBBY]: {},
            });
        });

        it("should handle backToRedirectUrl with undefined redirectUrl", () => {
            // Arrange
            const redirectUrl = undefined;
            const existingContext = { gameId: 1001 };
            (StorageHelper.get as jest.Mock).mockReturnValue(existingContext);

            // Act
            initialURLContextData.backToRedirectUrl(redirectUrl);

            // Assert
            expect(StorageHelper.set).toHaveBeenCalledWith(localStorageKeys.url, {
                ...existingContext,
                backToLobby: true,
                gameId: 0,
                firstSSOToLobby: false,
            });
            expect(StorageHelper.set).toHaveBeenCalledWith(localStorageKeys.latestGameId, 0);
            expect(GlobalMessageTransmitter.broadcast).toHaveBeenCalledWith({
                [GlobalTransmitterEvent.BACK_TO_LOBBY]: {},
            });
        });
    });

    describe("Edge Cases", () => {
        it("should handle malformed URL parameters", () => {
            // Arrange
            mockLocation.search = "?invalid=param&gameId=not-a-number";

            // Act
            const result = parseContextFromURL();

            // Assert
            expect(result?.gameId).toBe(NaN);
        });

        it("should handle missing globalThis.location", () => {
            // Arrange
            const originalLocation = globalThis.location;
            delete (globalThis as any).location;

            // Act & Assert
            expect(() => parseContextFromURL()).not.toThrow();

            // Cleanup
            (globalThis as any).location = originalLocation;
        });

        it("should handle missing globalThis.history", () => {
            // Arrange
            const originalHistory = globalThis.history;
            delete (globalThis as any).history;

            // Act & Assert
            expect(() => loadURLContext()).not.toThrow();

            // Cleanup
            (globalThis as any).history = originalHistory;
        });
    });

    describe("Error Handling", () => {
        beforeEach(() => {
            jest.clearAllMocks();
            // Reset to default behavior
            (StorageHelper.get as jest.Mock).mockImplementation(() => null);
            (StorageHelper.set as jest.Mock).mockImplementation(() => { });
            (AnalyticsHelper.login as jest.Mock).mockImplementation(() => { });
        });

        afterEach(() => {
            jest.clearAllMocks();
        });

        it("should handle StorageHelper errors gracefully", () => {
            // Arrange
            (StorageHelper.get as jest.Mock).mockImplementation(() => {
                throw new Error("Storage error");
            });

            // Act & Assert
            expect(() => getURLContext()).toThrow("Storage error");
        });

        it("should handle AnalyticsHelper errors gracefully", () => {
            // Arrange
            mockLocation.search = "?token=test-token";
            (AnalyticsHelper.login as jest.Mock).mockImplementation(() => {
                throw new Error("Analytics error");
            });

            // Act & Assert
            expect(() => loadURLContext()).toThrow("Analytics error");
        });

        it("should handle StorageHelper.set errors gracefully", () => {
            // Arrange
            mockLocation.search = "?token=test-token";
            (StorageHelper.set as jest.Mock).mockImplementation(() => {
                throw new Error("Storage set error");
            });

            // Act & Assert
            expect(() => loadURLContext()).toThrow("Storage set error");
        });
    });

    describe("Integration Scenarios", () => {
        beforeEach(() => {
            // Ensure mocks are properly reset for integration tests
            jest.clearAllMocks();
            mockLocation.search = "";
            mockLocation.href = "https://example.com";
            // Reset StorageHelper mocks to default behavior
            (StorageHelper.get as jest.Mock).mockImplementation(() => null);
            (StorageHelper.set as jest.Mock).mockImplementation(() => { });
            (AnalyticsHelper.login as jest.Mock).mockImplementation(() => { });
        });

        it("should handle complete SabaPlay URL flow", () => {
            // Arrange
            mockLocation.search = "?token=saba-token&gameId=1001&op=SP&ref=true&rurl=saba-redirect";

            // Act
            const result = loadURLContext();

            // Assert
            expect(result?.isSabaPlay).toBe(true);
            expect(result?.isDirectMode).toBe(true);
            expect(result?.gameId).toBe(1001);
            expect(result?.redirectUrl).toBe("saba-redirect");
        });

        it("should handle complete direct mode URL flow", () => {
            // Arrange
            mockLocation.search = "?token=direct-token&gameId=1002&ref=true&rurl=direct-redirect";

            // Act
            const result = loadURLContext();

            // Assert
            expect(result?.isSabaPlay).toBe(false);
            expect(result?.isDirectMode).toBe(true);
            expect(result?.gameId).toBe(1002);
            expect(result?.redirectUrl).toBe("direct-redirect");
        });

        it("should handle complete lobby URL flow", () => {
            // Arrange
            mockLocation.search = "?token=lobby-token&gameId=0";

            // Act
            const result = loadURLContext();

            // Assert
            expect(result?.isSabaPlay).toBe(false);
            expect(result?.isDirectMode).toBe(false);
            expect(result?.gameId).toBe(0);
            expect(result?.redirectUrl).toBe("");
        });

        it("should handle context update and retrieval flow", () => {
            // Arrange
            const initialContext = { gameId: 1001 };
            const updatedContext = { gameId: 1002, isSabaPlay: true };
            (StorageHelper.get as jest.Mock).mockReturnValue(initialContext);

            // Act
            updateURLContext(updatedContext);
            const retrievedContext = getURLContext();

            // Assert
            expect(StorageHelper.set).toHaveBeenCalledWith(localStorageKeys.url, {
                ...initialContext,
                ...updatedContext,
                firstSSOToLobby: false,
            });
            expect(retrievedContext).toEqual(initialContext);
        });
    });
}); 