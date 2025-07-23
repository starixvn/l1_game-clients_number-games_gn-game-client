import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { FormEvent } from "react";
import { AuthorizeResponse, SSOResponse } from "sc-user-service-client/dist/auth";

import { Register, RegisterProps } from "../register";
import { createNickname, getLobbyConfigs } from "../../../../../services/auth-service";
import {
    AnalyticsHelper,
    TrackingAction,
    TrackingFunction,
    getEnabledRenderGameSettings,
    getServiceStatusIsAvailable
} from "../../../../../_shared/helpers";
import { GetLocalizedErrorMessage } from "../../../../../_shared/helpers/notice-helper";
import { randomInteger } from "../../../../../_shared/helpers/number-helper";
import { Themes } from "../../../../../_shared/constants";
import NameGenerator from "../name-generator";

// Mock all external dependencies
jest.mock("../../../../../services/auth-service", () => ({
    createNickname: jest.fn(),
    getLobbyConfigs: jest.fn(),
}));

jest.mock("../../../../../_shared/helpers", () => ({
    AnalyticsHelper: {
        trackFunction: jest.fn(),
    },
    TrackingAction: {
        GenerateRandom: "GenerateRandom",
        Create: "Create",
    },
    TrackingFunction: {
        Nickname: "Nickname",
        Avatar: "Avatar",
    },
    getEnabledRenderGameSettings: jest.fn(),
    getServiceStatusIsAvailable: jest.fn(),
    objectMap: jest.fn((obj, fn) => {
        const result: any = {};
        Object.keys(obj).forEach(key => {
            result[key] = fn(obj[key], key, 0);
        });
        return result;
    }),
}));

jest.mock("../../../../../_shared/helpers/notice-helper", () => ({
    GetLocalizedErrorMessage: jest.fn((code) => `Error: ${code}`),
}));

jest.mock("../../../../../_shared/helpers/number-helper", () => ({
    randomInteger: jest.fn(),
}));

jest.mock("../name-generator", () => ({
    generateName: jest.fn(),
    validateName: jest.fn(),
}));

jest.mock("../../../../../_shared/constants", () => ({
    Themes: {
        light: "light",
    },
    locales: {
        en: "en",
        vi: "vi",
        th: "th",
        id: "id",
        zh_cn: "zh_cn",
        zh_tw: "zh_tw"
    },
    buildVersion: "1.0.0",
}));

// Mock use-sound to prevent runtime errors
jest.mock("use-sound", () => {
    return jest.fn(() => [
        jest.fn(),
        { sound: { volume: jest.fn() } }
    ]);
});

// Mock setting context
jest.mock("../../../../../_shared/react-contexts", () => ({
    useSettingContext: jest.fn(() => ({
        volumeSFX: 0.5,
    })),
}));

// Mock dynamic imports
jest.mock("next/dynamic", () => ({
    __esModule: true,
    default: (importFn: () => Promise<any>) => {
        const Component = () => <div data-testid="dynamic-component">Dynamic Component</div>;
        Component.displayName = "DynamicComponent";
        return Component;
    },
}));

// Mock child components
jest.mock("../../../../game-components/base-dialog", () => {
    return function MockBaseDialog({ children, isOpen }: any) {
        return isOpen ? <div data-testid="base-dialog">{children}</div> : null;
    };
});

jest.mock("../../../../page-components/dashboard/container", () => {
    return function MockFirstLoginContainer({ children }: any) {
        return <div data-testid="first-login-container">{children}</div>;
    };
});

jest.mock("../../../../page-components/dashboard/text-block", () => {
    return function MockTextBlock({ children }: any) {
        return <div data-testid="text-block">{children}</div>;
    };
});

jest.mock("../../../../page-components/profile-picture", () => {
    return function MockProfilePicture({ avatarId, isEditable, onClick }: any) {
        return (
            <div data-testid="profile-picture" onClick={onClick}>
                Avatar {avatarId} {isEditable ? "Editable" : "Not Editable"}
            </div>
        );
    };
});

jest.mock("../avatar-gallery", () => ({
    __esModule: true,
    default: function MockAvatarGallery({ onSelect }: any) {
        return (
            <div data-testid="avatar-gallery">
                <button onClick={() => onSelect(1)}>Avatar 1</button>
                <button onClick={() => onSelect(2)}>Avatar 2</button>
            </div>
        );
    },
}));

jest.mock("../preload-resource", () => ({
    __esModule: true,
    default: function MockPreloadResourceRegister() {
        return <div data-testid="preload-resource-register">Preload Resource Register</div>;
    },
}));

describe("Register Component Tests", () => {
    const defaultProps: RegisterProps = {
        session: {
            isAuthenticated: true,
            username: "testUser",
            language: "en",
            ss: "test-ss-token",
            memberName: "testUser",
            isUM: false,
            umInfo: null,
            system: null
        } as SSOResponse,
        isDirectMode: false,
        gameId: 0,
        firstSSOToLobby: false,
        isSabaPlay: false,
        t: jest.fn((key: string) => key), // Mock translation function
    };

    const mockLobbyConfigs = {
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
        },
    } as any;

    beforeEach(() => {
        jest.clearAllMocks();
        (getLobbyConfigs as jest.Mock).mockResolvedValue(mockLobbyConfigs);
        (getEnabledRenderGameSettings as jest.Mock).mockReturnValue([
            { id: 1001, name: "Game 1" },
            { id: 1002, name: "Game 2" },
        ]);
        (randomInteger as jest.Mock).mockReturnValue(1);
        (NameGenerator.generateName as jest.Mock).mockReturnValue("TestUser123");
        (NameGenerator.validateName as jest.Mock).mockReturnValue(true);
    });

    describe("First SSO to Lobby Scenarios", () => {
        it("should redirect to lobby when firstSSOToLobby is true", async () => {
            // Arrange
            const props = {
                ...defaultProps,
                firstSSOToLobby: true,
            };

            const mockAuthorizeResponse = { authorized: true };
            (createNickname as jest.Mock).mockResolvedValue(mockAuthorizeResponse);

            // Act
            render(<Register {...props} />);

            const nameInput = screen.getByPlaceholderText("Common.enter_your_name");
            const submitButton = screen.getByText("SabaNumber.button_play_now");

            fireEvent.change(nameInput, { target: { value: "TestUser123" } });
            fireEvent.click(submitButton);

            // Assert
            await waitFor(() => {
                expect(screen.getByTestId("dashboard-component")).toBeInTheDocument();
            });
        });

        it("should keep original gameId when isDirectMode is true", async () => {
            // Arrange
            const props = {
                ...defaultProps,
                isDirectMode: true,
                gameId: 123,
                firstSSOToLobby: false,
            };

            const mockAuthorizeResponse = { authorized: true };
            (createNickname as jest.Mock).mockResolvedValue(mockAuthorizeResponse);

            // Act
            render(<Register {...props} />);

            const nameInput = screen.getByPlaceholderText("Common.enter_your_name");
            const submitButton = screen.getByText("SabaNumber.button_play_now");

            fireEvent.change(nameInput, { target: { value: "TestUser123" } });
            fireEvent.click(submitButton);

            // Assert
            await waitFor(() => {
                expect(screen.getByTestId("dashboard-component")).toBeInTheDocument();
            });
        });

        it("should handle firstSSOToLobby with SabaPlay integration", async () => {
            // Arrange
            const props = {
                ...defaultProps,
                firstSSOToLobby: true,
                isSabaPlay: true,
            };

            const mockAuthorizeResponse = { authorized: true };
            (createNickname as jest.Mock).mockResolvedValue(mockAuthorizeResponse);

            // Act
            render(<Register {...props} />);

            const nameInput = screen.getByPlaceholderText("Common.enter_your_name");
            const submitButton = screen.getByText("SabaNumber.button_play_now");

            fireEvent.change(nameInput, { target: { value: "TestUser123" } });
            fireEvent.click(submitButton);

            // Assert
            await waitFor(() => {
                expect(screen.getByTestId("dashboard-component")).toBeInTheDocument();
            });
        });
    });

    describe("Direct Mode Scenarios", () => {
        it("should handle direct mode registration", async () => {
            // Arrange
            const props = {
                ...defaultProps,
                isDirectMode: true,
                gameId: 123,
            };

            const mockAuthorizeResponse = { authorized: true };
            (createNickname as jest.Mock).mockResolvedValue(mockAuthorizeResponse);

            // Act
            render(<Register {...props} />);

            const nameInput = screen.getByPlaceholderText("Common.enter_your_name");
            const submitButton = screen.getByText("SabaNumber.button_play_now");

            fireEvent.change(nameInput, { target: { value: "TestUser123" } });
            fireEvent.click(submitButton);

            // Assert
            await waitFor(() => {
                expect(screen.getByTestId("dashboard-component")).toBeInTheDocument();
            });
        });

        it("should handle direct mode with lobby access", async () => {
            // Arrange
            const props = {
                ...defaultProps,
                isDirectMode: true,
                gameId: 0,
            };

            const mockAuthorizeResponse = { authorized: true };
            (createNickname as jest.Mock).mockResolvedValue(mockAuthorizeResponse);

            // Act
            render(<Register {...props} />);

            const nameInput = screen.getByPlaceholderText("Common.enter_your_name");
            const submitButton = screen.getByText("SabaNumber.button_play_now");

            fireEvent.change(nameInput, { target: { value: "TestUser123" } });
            fireEvent.click(submitButton);

            // Assert
            await waitFor(() => {
                expect(screen.getByTestId("dashboard-component")).toBeInTheDocument();
            });
        });
    });

    describe("SabaPlay Integration Scenarios", () => {
        it("should handle SabaPlay registration", async () => {
            // Arrange
            const props = {
                ...defaultProps,
                isSabaPlay: true,
                gameId: 1003,
            };

            const mockAuthorizeResponse = { authorized: true };
            (createNickname as jest.Mock).mockResolvedValue(mockAuthorizeResponse);

            // Act
            render(<Register {...props} />);

            const nameInput = screen.getByPlaceholderText("Common.enter_your_name");
            const submitButton = screen.getByText("SabaNumber.button_play_now");

            fireEvent.change(nameInput, { target: { value: "TestUser123" } });
            fireEvent.click(submitButton);

            // Assert
            await waitFor(() => {
                expect(screen.getByTestId("dashboard-component")).toBeInTheDocument();
            });
        });

        it("should handle SabaPlay with auto nickname creation", async () => {
            // Arrange
            const props = {
                ...defaultProps,
                isSabaPlay: true,
                gameId: 1003,
            };

            const mockAuthorizeResponse = { authorized: true };
            (createNickname as jest.Mock).mockResolvedValue(mockAuthorizeResponse);

            // Act
            render(<Register {...props} />);

            const generateButton = screen.getByText("Generate Random");
            fireEvent.click(generateButton);

            // Assert
            expect(NameGenerator.generateName).toHaveBeenCalled();
        });
    });

    describe("User-Specific Storage Scenarios", () => {
        it("should handle user-specific game tracking during registration", async () => {
            // Arrange
            const props = {
                ...defaultProps,
                session: { ...defaultProps.session, username: "user1" },
                gameId: 123,
            };

            const mockAuthorizeResponse = { authorized: true };
            (createNickname as jest.Mock).mockResolvedValue(mockAuthorizeResponse);

            // Act
            render(<Register {...props} />);

            const nameInput = screen.getByPlaceholderText("Common.enter_your_name");
            const submitButton = screen.getByText("SabaNumber.button_play_now");

            fireEvent.change(nameInput, { target: { value: "TestUser123" } });
            fireEvent.click(submitButton);

            // Assert
            await waitFor(() => {
                expect(screen.getByTestId("dashboard-component")).toBeInTheDocument();
            });
        });

        it("should handle multiple users with isolated game tracking", async () => {
            // Arrange
            const user1Props = {
                ...defaultProps,
                session: { ...defaultProps.session, username: "user1" },
                gameId: 123,
            };

            const user2Props = {
                ...defaultProps,
                session: { ...defaultProps.session, username: "user2" },
                gameId: 456,
            };

            const mockAuthorizeResponse = { authorized: true };
            (createNickname as jest.Mock).mockResolvedValue(mockAuthorizeResponse);

            // Act - First user
            const { unmount } = render(<Register {...user1Props} />);
            const nameInput1 = screen.getByPlaceholderText("Common.enter_your_name");
            const submitButton1 = screen.getByText("SabaNumber.button_play_now");

            fireEvent.change(nameInput1, { target: { value: "TestUser123" } });
            fireEvent.click(submitButton1);

            await waitFor(() => {
                expect(screen.getByTestId("dashboard-component")).toBeInTheDocument();
            });

            unmount();

            // Act - Second user
            render(<Register {...user2Props} />);
            const nameInput2 = screen.getByPlaceholderText("Common.enter_your_name");
            const submitButton2 = screen.getByText("SabaNumber.button_play_now");

            fireEvent.change(nameInput2, { target: { value: "TestUser456" } });
            fireEvent.click(submitButton2);

            // Assert
            await waitFor(() => {
                expect(screen.getByTestId("dashboard-component")).toBeInTheDocument();
            });
        });
    });

    describe("Error Handling Scenarios", () => {
        it("should handle nickname creation failure", async () => {
            // Arrange
            const props = {
                ...defaultProps,
                gameId: 123,
            };

            const mockAuthorizeResponse = { authorized: false, errorCode: "NICKNAME_FAILED" };
            (createNickname as jest.Mock).mockResolvedValue(mockAuthorizeResponse);

            // Act
            render(<Register {...props} />);

            const nameInput = screen.getByPlaceholderText("Common.enter_your_name");
            const submitButton = screen.getByText("SabaNumber.button_play_now");

            fireEvent.change(nameInput, { target: { value: "TestUser123" } });
            fireEvent.click(submitButton);

            // Assert
            await waitFor(() => {
                expect(GetLocalizedErrorMessage).toHaveBeenCalledWith("NICKNAME_FAILED");
            });
        });

        it("should handle network errors during registration", async () => {
            // Arrange
            const props = {
                ...defaultProps,
                gameId: 123,
            };

            (createNickname as jest.Mock).mockRejectedValue(new Error("Network error"));

            // Act
            render(<Register {...props} />);

            const nameInput = screen.getByPlaceholderText("Common.enter_your_name");
            const submitButton = screen.getByText("SabaNumber.button_play_now");

            fireEvent.change(nameInput, { target: { value: "TestUser123" } });
            fireEvent.click(submitButton);

            // Assert
            await waitFor(() => {
                expect(GetLocalizedErrorMessage).toHaveBeenCalled();
            });
        });

        it("should handle invalid nickname validation", async () => {
            // Arrange
            const props = {
                ...defaultProps,
                gameId: 123,
            };

            (NameGenerator.validateName as jest.Mock).mockReturnValue(false);

            // Act
            render(<Register {...props} />);

            const nameInput = screen.getByPlaceholderText("Common.enter_your_name");
            const submitButton = screen.getByText("SabaNumber.button_play_now");

            fireEvent.change(nameInput, { target: { value: "Invalid" } });
            fireEvent.click(submitButton);

            // Assert
            expect(GetLocalizedErrorMessage).toHaveBeenCalled();
        });
    });

    describe("PreloadResourceRegister Integration", () => {
        it("should handle successful lobby configs loading", async () => {
            // Arrange
            const props = {
                ...defaultProps,
                gameId: 0,
            };

            const mockLobbyConfigs = {
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
                },
            } as any;
            (getLobbyConfigs as jest.Mock).mockResolvedValue(mockLobbyConfigs);

            // Act
            render(<Register {...props} />);

            // Assert
            await waitFor(() => {
                expect(getLobbyConfigs).toHaveBeenCalledWith(props.session);
            });
        });

        it("should handle network errors during lobby config loading", async () => {
            // Arrange
            const props = {
                ...defaultProps,
                gameId: 0,
            };

            (getLobbyConfigs as jest.Mock).mockRejectedValue(new Error("Network timeout"));

            // Act
            render(<Register {...props} />);

            // Assert
            await waitFor(() => {
                expect(getLobbyConfigs).toHaveBeenCalledWith(props.session);
            });
        });

        it("should handle empty lobby configs", async () => {
            // Arrange
            const props = {
                ...defaultProps,
                gameId: 0,
            };

            const emptyLobbyConfigs = { lobbyConfigs: {} };
            (getLobbyConfigs as jest.Mock).mockResolvedValue(emptyLobbyConfigs);

            // Act
            render(<Register {...props} />);

            // Assert
            await waitFor(() => {
                expect(getLobbyConfigs).toHaveBeenCalledWith(props.session);
            });
        });

        it("should handle null lobby configs", async () => {
            // Arrange
            const props = {
                ...defaultProps,
                gameId: 0,
            };

            (getLobbyConfigs as jest.Mock).mockResolvedValue(null);

            // Act
            render(<Register {...props} />);

            // Assert
            await waitFor(() => {
                expect(getLobbyConfigs).toHaveBeenCalledWith(props.session);
            });
        });
    });

    describe("updateToLoadGameId Scenarios", () => {
        it("should set toLoadGameId to 0 when no enabled games are available", async () => {
            // Arrange
            const props = {
                ...defaultProps,
                gameId: 0,
            };

            (getEnabledRenderGameSettings as jest.Mock).mockReturnValue([]); // No enabled games

            // Act
            render(<Register {...props} />);

            // Assert
            await waitFor(() => {
                expect(getEnabledRenderGameSettings).toHaveBeenCalled();
            });
        });

        it("should handle null lobby configs gracefully", async () => {
            // Arrange
            const props = {
                ...defaultProps,
                gameId: 0,
            };

            (getLobbyConfigs as jest.Mock).mockResolvedValue(null);
            (getEnabledRenderGameSettings as jest.Mock).mockReturnValue([]);

            // Act
            render(<Register {...props} />);

            // Assert
            await waitFor(() => {
                expect(getEnabledRenderGameSettings).toHaveBeenCalled();
            });
        });
    });

    describe("Integration Flow Scenarios", () => {
        it("should handle complete registration flow with missing gameId", async () => {
            // Arrange
            const props = {
                ...defaultProps,
                gameId: 0,
            };

            const mockAuthorizeResponse = { authorized: true };
            (createNickname as jest.Mock).mockResolvedValue(mockAuthorizeResponse);
            (getEnabledRenderGameSettings as jest.Mock).mockReturnValue([]); // No enabled games

            // Act
            render(<Register {...props} />);

            const nameInput = screen.getByPlaceholderText("Common.enter_your_name");
            const submitButton = screen.getByText("SabaNumber.button_play_now");

            fireEvent.change(nameInput, { target: { value: "TestUser123" } });
            fireEvent.click(submitButton);

            // Assert
            await waitFor(() => {
                expect(screen.getByTestId("dashboard-component")).toBeInTheDocument();
            });
        });

        it("should handle complete SabaPlay registration flow", async () => {
            // Arrange
            const props = {
                ...defaultProps,
                isSabaPlay: true,
                gameId: 1003,
                firstSSOToLobby: true,
            };

            const mockAuthorizeResponse = { authorized: true };
            (createNickname as jest.Mock).mockResolvedValue(mockAuthorizeResponse);

            // Act
            render(<Register {...props} />);

            const nameInput = screen.getByPlaceholderText("Common.enter_your_name");
            const submitButton = screen.getByText("SabaNumber.button_play_now");

            fireEvent.change(nameInput, { target: { value: "TestUser123" } });
            fireEvent.click(submitButton);

            // Assert
            await waitFor(() => {
                expect(screen.getByTestId("dashboard-component")).toBeInTheDocument();
            });
        });
    });

    describe("Edge Cases", () => {
        it("should handle missing session", () => {
            // Arrange
            const props = {
                ...defaultProps,
                session: null,
            };

            // Act
            render(<Register {...props} />);

            // Assert
            expect(screen.getByTestId("first-login-container")).toBeInTheDocument();
        });

        it("should handle empty nickname", async () => {
            // Arrange
            const props = {
                ...defaultProps,
                gameId: 123,
            };

            // Act
            render(<Register {...props} />);

            const submitButton = screen.getByText("SabaNumber.button_play_now");
            fireEvent.click(submitButton);

            // Assert
            expect(GetLocalizedErrorMessage).toHaveBeenCalled();
        });

        it("should handle special characters in nickname", async () => {
            // Arrange
            const props = {
                ...defaultProps,
                gameId: 123,
            };

            (NameGenerator.validateName as jest.Mock).mockReturnValue(false);

            // Act
            render(<Register {...props} />);

            const nameInput = screen.getByPlaceholderText("Common.enter_your_name");
            const submitButton = screen.getByText("SabaNumber.button_play_now");

            fireEvent.change(nameInput, { target: { value: "Test@User#123" } });
            fireEvent.click(submitButton);

            // Assert
            expect(GetLocalizedErrorMessage).toHaveBeenCalled();
        });
    });

    describe("Performance Tests", () => {
        it("should render within performance budget", () => {
            // Arrange
            const startTime = performance.now();
            const props = {
                ...defaultProps,
                gameId: 123,
            };

            // Act
            render(<Register {...props} />);
            const endTime = performance.now();

            // Assert
            expect(endTime - startTime).toBeLessThan(100); // Should complete within 100ms
            expect(screen.getByTestId("first-login-container")).toBeInTheDocument();
        });
    });
});
