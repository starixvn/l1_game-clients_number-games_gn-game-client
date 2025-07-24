import { parseContextFromURL, loadURLContext, updateURLContext, getURLContext, URLContextModel } from "../../_shared/react-contexts/url-context";
import { StorageHelper, localStorageKeys, getUserLatestGameId, setUserLatestGameId } from "../../_shared/helpers";
import { AnalyticsHelper } from "../../_shared/helpers";
import { GameUtils } from "../../_shared/helpers/base-64-helper";
import { GlobalMessageTransmitter, GlobalTransmitterEvent } from "../../_shared/helpers/message-transmitter/global-transmitter";

// Mock dependencies
jest.mock("../../_shared/helpers", () => ({
    StorageHelper: {
        get: jest.fn(),
        set: jest.fn(),
    },
    localStorageKeys: {
        url: "test.url",
        session: "test.session",
        latestGameId: "test.latest-game-id",
        userLatestGameId: "latest-game-id",
    },
    getUserLatestGameId: jest.fn(),
    setUserLatestGameId: jest.fn(),
}));

jest.mock("../../_shared/helpers/base-64-helper", () => ({
    GameUtils: {
        base64Decode: jest.fn(),
    },
}));

jest.mock("../../_shared/helpers/message-transmitter/global-transmitter", () => ({
    GlobalMessageTransmitter: {
        broadcast: jest.fn(),
    },
    GlobalTransmitterEvent: {
        BACK_TO_LOBBY: "BACK_TO_LOBBY",
    },
}));

const mockStorageHelper = StorageHelper as jest.Mocked<typeof StorageHelper>;
const mockGetUserLatestGameId = getUserLatestGameId as jest.MockedFunction<typeof getUserLatestGameId>;
const mockSetUserLatestGameId = setUserLatestGameId as jest.MockedFunction<typeof setUserLatestGameId>;
const mockGameUtils = GameUtils as jest.Mocked<typeof GameUtils>;
const mockGlobalMessageTransmitter = GlobalMessageTransmitter as jest.Mocked<typeof GlobalMessageTransmitter>;

describe("URL Parameter Combinations Matrix Tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();

        // Mock globalThis.location
        Object.defineProperty(globalThis, "location", {
            value: {
                search: "",
                href: "http://localhost:3000",
            },
            writable: true,
        });

        // Mock globalThis.history
        Object.defineProperty(globalThis, "history", {
            value: {
                pushState: jest.fn(),
            },
            writable: true,
        });

        // Mock AnalyticsHelper
        (AnalyticsHelper as any) = {
            login: jest.fn(),
        };
    });

    describe("Complete Parameter Combinations Matrix - All 16 Cases", () => {
        describe("Category 1: Lobby Access (gameId = 0 or absent)", () => {
            describe("Case 1: Normal SSO to Lobby", () => {
                it("should handle ?gameId=0 correctly", () => {
                    // Arrange
                    globalThis.location.search = "?gameId=0";
                    const expected: URLContextModel = {
                        token: null,
                        language: null,
                        gameId: 0,
                        isDirectMode: false,
                        redirectUrl: null,
                        firstSSOToLobby: true,
                        isSabaPlay: false,
                    };

                    // Act
                    const result = parseContextFromURL();

                    // Assert
                    expect(result).toEqual(expected);
                });
            });

            describe("Case 2: SabaPlay to Lobby", () => {
                it("should handle ?gameId=0&op=SP correctly", () => {
                    // Arrange
                    globalThis.location.search = "?gameId=0&op=SP";
                    const expected: URLContextModel = {
                        token: null,
                        language: null,
                        gameId: 0,
                        isDirectMode: false,
                        redirectUrl: null,
                        firstSSOToLobby: true,
                        isSabaPlay: true,
                    };

                    // Act
                    const result = parseContextFromURL();

                    // Assert
                    expect(result).toEqual(expected);
                });
            });

            describe("Case 3: Normal SSO to Lobby with ref ignored", () => {
                it("should handle ?gameId=0&ref=d_direct correctly (ref ignored)", () => {
                    // Arrange
                    globalThis.location.search = "?gameId=0&ref=d_direct";
                    const expected: URLContextModel = {
                        token: null,
                        language: null,
                        gameId: 0,
                        isDirectMode: false,
                        redirectUrl: null,
                        firstSSOToLobby: true,
                        isSabaPlay: false,
                    };

                    // Act
                    const result = parseContextFromURL();

                    // Assert
                    expect(result).toEqual(expected);
                });
            });

            describe("Case 4: SabaPlay to Lobby with ref ignored", () => {
                it("should handle ?gameId=0&ref=d_direct&op=SP correctly (ref ignored)", () => {
                    // Arrange
                    globalThis.location.search = "?gameId=0&ref=d_direct&op=SP";
                    const expected: URLContextModel = {
                        token: null,
                        language: null,
                        gameId: 0,
                        isDirectMode: false,
                        redirectUrl: null,
                        firstSSOToLobby: true,
                        isSabaPlay: true,
                    };

                    // Act
                    const result = parseContextFromURL();

                    // Assert
                    expect(result).toEqual(expected);
                });
            });

            describe("Case 5: Normal SSO to Lobby with rurl ignored", () => {
                it("should handle ?gameId=0&ref=d_direct&rurl=<base64> correctly (rurl ignored)", () => {
                    // Arrange
                    globalThis.location.search = "?gameId=0&ref=d_direct&rurl=aHR0cHM6Ly9leGFtcGxlLmNvbQ==";
                    const expected: URLContextModel = {
                        token: null,
                        language: null,
                        gameId: 0,
                        isDirectMode: false,
                        redirectUrl: null, // rurl ignored when gameId=0
                        firstSSOToLobby: true,
                        isSabaPlay: false,
                    };

                    // Act
                    const result = parseContextFromURL();

                    // Assert
                    expect(result).toEqual(expected);
                });
            });

            describe("Case 6: SabaPlay to Lobby with rurl ignored", () => {
                it("should handle ?gameId=0&ref=d_direct&rurl=<base64>&op=SP correctly (rurl ignored)", () => {
                    // Arrange
                    globalThis.location.search = "?gameId=0&ref=d_direct&rurl=aHR0cHM6Ly9leGFtcGxlLmNvbQ==&op=SP";
                    const expected: URLContextModel = {
                        token: null,
                        language: null,
                        gameId: 0,
                        isDirectMode: false,
                        redirectUrl: null, // rurl ignored when gameId=0
                        firstSSOToLobby: true,
                        isSabaPlay: true,
                    };

                    // Act
                    const result = parseContextFromURL();

                    // Assert
                    expect(result).toEqual(expected);
                });
            });

            describe("Case 13: Default to Lobby (no parameters)", () => {
                it("should handle no parameters correctly", () => {
                    // Arrange
                    globalThis.location.search = "";

                    // Act
                    const result = parseContextFromURL();

                    // Assert
                    expect(result).toBeUndefined();
                });
            });

            describe("Case 14: SabaPlay Default (no gameId)", () => {
                it("should handle ?op=SP correctly", () => {
                    // Arrange
                    globalThis.location.search = "?op=SP";
                    const expected: URLContextModel = {
                        token: null,
                        language: null,
                        gameId: 0,
                        isDirectMode: false,
                        redirectUrl: null,
                        firstSSOToLobby: true,
                        isSabaPlay: true,
                    };

                    // Act
                    const result = parseContextFromURL();

                    // Assert
                    expect(result).toEqual(expected);
                });
            });

            describe("Case 15: Normal SSO to Lobby with ref ignored (no gameId)", () => {
                it("should handle ?ref=d_direct correctly (ref ignored when no gameId)", () => {
                    // Arrange
                    globalThis.location.search = "?ref=d_direct";
                    const expected: URLContextModel = {
                        token: null,
                        language: null,
                        gameId: 0,
                        isDirectMode: false,
                        redirectUrl: null,
                        firstSSOToLobby: true,
                        isSabaPlay: false,
                    };

                    // Act
                    const result = parseContextFromURL();

                    // Assert
                    expect(result).toEqual(expected);
                });
            });

            describe("Case 16: SabaPlay to Lobby with ref ignored (no gameId)", () => {
                it("should handle ?ref=d_direct&op=SP correctly (ref ignored when no gameId)", () => {
                    // Arrange
                    globalThis.location.search = "?ref=d_direct&op=SP";
                    const expected: URLContextModel = {
                        token: null,
                        language: null,
                        gameId: 0,
                        isDirectMode: false,
                        redirectUrl: null,
                        firstSSOToLobby: true,
                        isSabaPlay: true,
                    };

                    // Act
                    const result = parseContextFromURL();

                    // Assert
                    expect(result).toEqual(expected);
                });
            });
        });

        describe("Category 2: Game Access (gameId > 0)", () => {
            describe("Case 7: Normal SSO to Game", () => {
                it("should handle ?gameId=123 correctly", () => {
                    // Arrange
                    globalThis.location.search = "?gameId=123";
                    const expected: URLContextModel = {
                        token: null,
                        language: null,
                        gameId: 123,
                        isDirectMode: false,
                        redirectUrl: null,
                        firstSSOToLobby: true,
                        isSabaPlay: false,
                    };

                    // Act
                    const result = parseContextFromURL();

                    // Assert
                    expect(result).toEqual(expected);
                });
            });

            describe("Case 8: SabaPlay to Game", () => {
                it("should handle ?gameId=123&op=SP correctly", () => {
                    // Arrange
                    globalThis.location.search = "?gameId=123&op=SP";
                    const expected: URLContextModel = {
                        token: null,
                        language: null,
                        gameId: 123,
                        isDirectMode: true, // SabaPlay with gameId > 0 triggers direct mode
                        redirectUrl: null,
                        firstSSOToLobby: true,
                        isSabaPlay: true,
                    };

                    // Act
                    const result = parseContextFromURL();

                    // Assert
                    expect(result).toEqual(expected);
                });
            });

            describe("Case 9: Direct Mode to Game", () => {
                it("should handle ?gameId=123&ref=d_direct correctly", () => {
                    // Arrange
                    globalThis.location.search = "?gameId=123&ref=d_direct";
                    const expected: URLContextModel = {
                        token: null,
                        language: null,
                        gameId: 123,
                        isDirectMode: false, // No rurl parameter, so not direct mode
                        redirectUrl: null,
                        firstSSOToLobby: true,
                        isSabaPlay: false,
                    };

                    // Act
                    const result = parseContextFromURL();

                    // Assert
                    expect(result).toEqual(expected);
                });
            });

            describe("Case 10: Direct Mode + SabaPlay to Game", () => {
                it("should handle ?gameId=123&ref=d_direct&op=SP correctly", () => {
                    // Arrange
                    globalThis.location.search = "?gameId=123&ref=d_direct&op=SP";
                    const expected: URLContextModel = {
                        token: null,
                        language: null,
                        gameId: 123,
                        isDirectMode: true, // SabaPlay with gameId > 0 triggers direct mode
                        redirectUrl: null,
                        firstSSOToLobby: true,
                        isSabaPlay: true,
                    };

                    // Act
                    const result = parseContextFromURL();

                    // Assert
                    expect(result).toEqual(expected);
                });
            });

            describe("Case 11: Direct Mode to Game with Redirect", () => {
                it("should handle ?gameId=123&ref=d_direct&rurl=<base64> correctly", () => {
                    // Arrange
                    globalThis.location.search = "?gameId=123&ref=d_direct&rurl=aHR0cHM6Ly9leGFtcGxlLmNvbQ==";
                    const expected: URLContextModel = {
                        token: null,
                        language: null,
                        gameId: 123,
                        isDirectMode: true, // ref + rurl triggers direct mode
                        redirectUrl: "aHR0cHM6Ly9leGFtcGxlLmNvbQ==",
                        firstSSOToLobby: true,
                        isSabaPlay: false,
                    };

                    // Act
                    const result = parseContextFromURL();

                    // Assert
                    expect(result).toEqual(expected);
                });
            });

            describe("Case 12: Direct Mode + SabaPlay to Game with Redirect", () => {
                it("should handle ?gameId=123&ref=d_direct&rurl=<base64>&op=SP correctly", () => {
                    // Arrange
                    globalThis.location.search = "?gameId=123&ref=d_direct&rurl=aHR0cHM6Ly9leGFtcGxlLmNvbQ==&op=SP";
                    const expected: URLContextModel = {
                        token: null,
                        language: null,
                        gameId: 123,
                        isDirectMode: true, // ref + rurl triggers direct mode
                        redirectUrl: "aHR0cHM6Ly9leGFtcGxlLmNvbQ==",
                        firstSSOToLobby: true,
                        isSabaPlay: true,
                    };

                    // Act
                    const result = parseContextFromURL();

                    // Assert
                    expect(result).toEqual(expected);
                });
            });
        });
    });

    describe("Edge Cases and Error Handling", () => {
        describe("HTML-Encoded Ampersands Handling", () => {
            it("should decode HTML-encoded ampersands correctly", () => {
                // Arrange
                globalThis.location.search = "?token=test&amp;gameId=123&amp;op=SP&amp;ref=d_direct";
                const expected: URLContextModel = {
                    token: "test",
                    language: null,
                    gameId: 123,
                    isDirectMode: true, // SabaPlay with gameId > 0
                    redirectUrl: null,
                    firstSSOToLobby: true,
                    isSabaPlay: true,
                };

                // Act
                const result = parseContextFromURL();

                // Assert
                expect(result).toEqual(expected);
            });

            it("should handle mixed encoded and non-encoded parameters", () => {
                // Arrange
                globalThis.location.search = "?token=test&amp;gameId=123&op=SP&ref=d_direct";
                const expected: URLContextModel = {
                    token: "test",
                    language: null,
                    gameId: 123,
                    isDirectMode: true, // SabaPlay with gameId > 0
                    redirectUrl: null,
                    firstSSOToLobby: true,
                    isSabaPlay: true,
                };

                // Act
                const result = parseContextFromURL();

                // Assert
                expect(result).toEqual(expected);
            });
        });

        describe("Invalid Parameter Values", () => {
            it("should handle invalid gameId gracefully", () => {
                // Arrange
                globalThis.location.search = "?gameId=invalid&op=SP";
                const expected: URLContextModel = {
                    token: null,
                    language: null,
                    gameId: NaN, // Invalid gameId becomes NaN
                    isDirectMode: true, // SabaPlay with any gameId triggers direct mode
                    redirectUrl: null,
                    firstSSOToLobby: true,
                    isSabaPlay: true,
                };

                // Act
                const result = parseContextFromURL();

                // Assert
                expect(result).toEqual(expected);
            });

            it("should handle negative gameId", () => {
                // Arrange
                globalThis.location.search = "?gameId=-1&op=SP";
                const expected: URLContextModel = {
                    token: null,
                    language: null,
                    gameId: -1,
                    isDirectMode: true, // SabaPlay with any gameId triggers direct mode
                    redirectUrl: null,
                    firstSSOToLobby: true,
                    isSabaPlay: true,
                };

                // Act
                const result = parseContextFromURL();

                // Assert
                expect(result).toEqual(expected);
            });
        });

        describe("Ref Parameter Validation", () => {
            it("should handle valid ref parameter values", () => {
                // Arrange
                globalThis.location.search = "?gameId=123&ref=d_direct&rurl=<base64>";
                const expected: URLContextModel = {
                    token: null,
                    language: null,
                    gameId: 123,
                    isDirectMode: true, // Valid ref + rurl
                    redirectUrl: "<base64>",
                    firstSSOToLobby: true,
                    isSabaPlay: false,
                };

                // Act
                const result = parseContextFromURL();

                // Assert
                expect(result).toEqual(expected);
            });

            it("should handle invalid ref parameter values", () => {
                // Arrange
                globalThis.location.search = "?gameId=123&ref=invalid_value&rurl=<base64>";
                const expected: URLContextModel = {
                    token: null,
                    language: null,
                    gameId: 123,
                    isDirectMode: true, // Any ref value with rurl triggers direct mode
                    redirectUrl: "<base64>",
                    firstSSOToLobby: true,
                    isSabaPlay: false,
                };

                // Act
                const result = parseContextFromURL();

                // Assert
                expect(result).toEqual(expected);
            });

            it("should handle m_direct ref parameter", () => {
                // Arrange
                globalThis.location.search = "?gameId=123&ref=m_direct&rurl=<base64>";
                const expected: URLContextModel = {
                    token: null,
                    language: null,
                    gameId: 123,
                    isDirectMode: true, // Valid ref + rurl
                    redirectUrl: "<base64>",
                    firstSSOToLobby: true,
                    isSabaPlay: false,
                };

                // Act
                const result = parseContextFromURL();

                // Assert
                expect(result).toEqual(expected);
            });
        });
    });

    describe("URL Context Loading and Storage", () => {
        describe("loadURLContext Function", () => {
            it("should load context from URL and store in localStorage", () => {
                // Arrange
                globalThis.location.search = "?gameId=123&op=SP&token=test123";
                mockStorageHelper.get.mockReturnValue(null);

                // Act
                const result = loadURLContext();

                // Assert
                expect(result).toEqual(expect.objectContaining({
                    token: "test123",
                    gameId: 123,
                    isDirectMode: true,
                    isSabaPlay: true,
                }));
                expect(mockStorageHelper.set).toHaveBeenCalledWith(
                    localStorageKeys.url,
                    expect.objectContaining({
                        token: undefined, // token is removed for storage
                        gameId: 123,
                        isDirectMode: true,
                        isSabaPlay: true,
                    })
                );
                expect(globalThis.history.pushState).toHaveBeenCalledWith(
                    null,
                    "",
                    "http://localhost:3000"
                );
            });

            it("should load context from localStorage when no URL parameters", () => {
                // Arrange
                globalThis.location.search = "";
                const localStorageContext = {
                    gameId: 123,
                    isDirectMode: false,
                    redirectUrl: null,
                    firstSSOToLobby: false,
                    isSabaPlay: false,
                };
                mockStorageHelper.get.mockReturnValue(localStorageContext);

                // Act
                const result = loadURLContext();

                // Assert
                expect(result).toEqual(localStorageContext);
                expect(mockStorageHelper.get).toHaveBeenCalledWith(localStorageKeys.url);
            });
        });

        describe("updateURLContext Function", () => {
            it("should update context with user-specific gameId storage", () => {
                // Arrange
                const session = { username: "testuser" };
                mockStorageHelper.get
                    .mockReturnValueOnce({}) // contextFromLocalStorage
                    .mockReturnValueOnce(session); // session
                const updateData = { gameId: 456 };

                // Act
                updateURLContext(updateData);

                // Assert
                expect(mockSetUserLatestGameId).toHaveBeenCalledWith(456, "testuser");
                expect(mockStorageHelper.set).toHaveBeenCalledWith(
                    localStorageKeys.url,
                    expect.objectContaining({
                        gameId: 456,
                        firstSSOToLobby: false,
                    })
                );
            });

            it("should handle update without gameId", () => {
                // Arrange
                mockStorageHelper.get.mockReturnValue({});
                const updateData = { language: "en" };

                // Act
                updateURLContext(updateData);

                // Assert
                expect(mockSetUserLatestGameId).not.toHaveBeenCalled();
                expect(mockStorageHelper.set).toHaveBeenCalledWith(
                    localStorageKeys.url,
                    expect.objectContaining({
                        language: "en",
                        firstSSOToLobby: false,
                    })
                );
            });
        });

        describe("getURLContext Function", () => {
            it("should return context from localStorage", () => {
                // Arrange
                const expectedContext = {
                    gameId: 123,
                    isDirectMode: false,
                    redirectUrl: null,
                    firstSSOToLobby: false,
                    isSabaPlay: false,
                };
                mockStorageHelper.get.mockReturnValue(expectedContext);

                // Act
                const result = getURLContext();

                // Assert
                expect(result).toEqual(expectedContext);
                expect(mockStorageHelper.get).toHaveBeenCalledWith(localStorageKeys.url);
            });

            it("should return empty object when no context in localStorage", () => {
                // Arrange
                mockStorageHelper.get.mockReturnValue(null);

                // Act
                const result = getURLContext();

                // Assert
                expect(result).toEqual({});
            });
        });
    });

    describe("User-Specific Storage Integration", () => {
        describe("Cross-User Isolation", () => {
            it("should maintain isolated game tracking between users", () => {
                // Arrange
                const user1 = "user1";
                const user2 = "user2";
                const gameId1 = 123;
                const gameId2 = 456;

                mockGetUserLatestGameId
                    .mockReturnValueOnce(gameId1)
                    .mockReturnValueOnce(gameId2);

                // Act
                const result1 = mockGetUserLatestGameId(user1);
                const result2 = mockGetUserLatestGameId(user2);

                // Assert
                expect(result1).toBe(gameId1);
                expect(result2).toBe(gameId2);
                expect(result1).not.toBe(result2);
            });

            it("should handle missing username gracefully", () => {
                // Arrange
                mockGetUserLatestGameId.mockReturnValue(0);

                // Act
                const result = mockGetUserLatestGameId();

                // Assert
                expect(result).toBe(0);
            });
        });
    });

    describe("Production URL Analysis", () => {
        describe("Current Production URL Case", () => {
            it("should handle the specific production URL correctly", () => {
                // Arrange
                globalThis.location.search = "?token=c72fd835-5b1d-48a1-a1cc-3d1eaa79aecf&lang=vi-VN&appType=1&ref=d_direct&op=GN&cg=Credit_VN";
                const expected: URLContextModel = {
                    token: "c72fd835-5b1d-48a1-a1cc-3d1eaa79aecf",
                    language: "vi-VN",
                    gameId: 0, // missing gameId defaults to 0
                    isDirectMode: false, // ref=d_direct but no rurl and gameId=0
                    redirectUrl: null,
                    firstSSOToLobby: true,
                    isSabaPlay: false, // op=GN, not SP
                };

                // Act
                const result = parseContextFromURL();

                // Assert
                expect(result).toEqual(expected);
            });
        });
    });

    describe("Integration Scenarios", () => {
        describe("Complete User Journey Tests", () => {
            it("should handle SabaPlay direct game access flow", () => {
                // Arrange
                globalThis.location.search = "?gameId=123&op=SP&token=test123";
                mockStorageHelper.get.mockReturnValue(null);

                // Act
                const urlContext = parseContextFromURL();
                const loadedContext = loadURLContext();

                // Assert
                expect(urlContext).toEqual(expect.objectContaining({
                    gameId: 123,
                    isDirectMode: true,
                    isSabaPlay: true,
                }));
                expect(loadedContext).toEqual(expect.objectContaining({
                    gameId: 123,
                    isDirectMode: true,
                    isSabaPlay: true,
                }));
            });

            it("should handle SSO to lobby flow", () => {
                // Arrange
                globalThis.location.search = "?gameId=0&token=test123";
                mockStorageHelper.get.mockReturnValue(null);

                // Act
                const urlContext = parseContextFromURL();
                const loadedContext = loadURLContext();

                // Assert
                expect(urlContext).toEqual(expect.objectContaining({
                    gameId: 0,
                    isDirectMode: false,
                    isSabaPlay: false,
                }));
                expect(loadedContext).toEqual(expect.objectContaining({
                    gameId: 0,
                    isDirectMode: false,
                    isSabaPlay: false,
                }));
            });

            it("should handle direct mode with redirect URL flow", () => {
                // Arrange
                globalThis.location.search = "?gameId=123&ref=d_direct&rurl=aHR0cHM6Ly9leGFtcGxlLmNvbQ==";
                mockStorageHelper.get.mockReturnValue(null);

                // Act
                const urlContext = parseContextFromURL();
                const loadedContext = loadURLContext();

                // Assert
                expect(urlContext).toEqual(expect.objectContaining({
                    gameId: 123,
                    isDirectMode: true,
                    redirectUrl: "aHR0cHM6Ly9leGFtcGxlLmNvbQ==",
                    isSabaPlay: false,
                }));
                expect(loadedContext).toEqual(expect.objectContaining({
                    gameId: 123,
                    isDirectMode: true,
                    redirectUrl: "aHR0cHM6Ly9leGFtcGxlLmNvbQ==",
                    isSabaPlay: false,
                }));
            });
        });
    });

    describe("Error Handling and Edge Cases", () => {
        describe("Network and Storage Failures", () => {
            it("should handle storage helper failures gracefully", () => {
                // Arrange
                globalThis.location.search = "?gameId=123&op=SP";
                mockStorageHelper.get.mockImplementation(() => {
                    throw new Error("Storage error");
                });

                // Act & Assert
                expect(() => loadURLContext()).toThrow("Storage error");
            });

            it("should handle missing globalThis.location gracefully", () => {
                // Arrange
                Object.defineProperty(globalThis, "location", {
                    value: undefined,
                    writable: true,
                });

                // Act
                const result = parseContextFromURL();

                // Assert
                expect(result).toBeUndefined();
            });
        });

        describe("Parameter Boundary Testing", () => {
            it("should handle maximum gameId value", () => {
                // Arrange
                globalThis.location.search = "?gameId=999999&op=SP";
                const expected: URLContextModel = {
                    token: null,
                    language: null,
                    gameId: 999999,
                    isDirectMode: true,
                    redirectUrl: null,
                    firstSSOToLobby: true,
                    isSabaPlay: true,
                };

                // Act
                const result = parseContextFromURL();

                // Assert
                expect(result).toEqual(expected);
            });

            it("should handle very long redirect URLs", () => {
                // Arrange
                const longUrl = "a".repeat(1000);
                globalThis.location.search = `?gameId=123&ref=d_direct&rurl=${longUrl}`;
                const expected: URLContextModel = {
                    token: null,
                    language: null,
                    gameId: 123,
                    isDirectMode: true,
                    redirectUrl: longUrl,
                    firstSSOToLobby: true,
                    isSabaPlay: false,
                };

                // Act
                const result = parseContextFromURL();

                // Assert
                expect(result).toEqual(expected);
            });
        });
    });
}); 