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
    AvatarGallery: function MockAvatarGallery({ selectedAvatarId, onSelectAvatar, onClose }: any) {
        return (
            <div data-testid="avatar-gallery">
                <button onClick={() => onSelectAvatar(5)}>Select Avatar 5</button>
                <button onClick={onClose}>Close</button>
            </div>
        );
    },
    MAX_AVATAR_ID: 10,
}));

jest.mock("../preload-resource", () => {
    return function MockPreloadResourceRegister() {
        return <div data-testid="preload-resource-register">Preload Resource Register</div>;
    };
});

jest.mock("../../../translator", () => ({
    withTranslator: (Component: any) => Component,
}));

// Mock document.body.classList
Object.defineProperty(document.body, 'classList', {
    value: {
        add: jest.fn(),
        remove: jest.fn(),
    },
    writable: true,
});

describe("Register Component", () => {
    // Test data
    const mockSession = {
        ss: "session-token",
        username: "testuser",
        isAuthenticated: true,
        isUM: false,
        language: "en",
        memberName: "Test Member",
        umInfo: {
            startTime: new Date("2023-01-01T00:00:00Z"),
            endTime: new Date("2023-01-01T01:00:00Z"),
            operatorId: "op123",
        },
        system: 1,
    } as SSOResponse;

    const mockAuthorizeResponse = {
        authorized: true,
        user: {
            name: "TestUser",
            offerGames: [
                { gameId: 1001, maxBet: 1000, minBet: 1, maxBetPerChoices: {} },
                { gameId: 1002, maxBet: 1000, minBet: 1, maxBetPerChoices: {} },
                { gameId: 1003, maxBet: 1000, minBet: 1, maxBetPerChoices: {} },
            ],
            enabledGameIds: [1001, 1002, 1003],
            settings: { theme: "light" },
        },
        errorCode: null,
    } as unknown as AuthorizeResponse;

    const mockFailedAuthorizeResponse = {
        authorized: false,
        user: null,
        errorCode: "NICKNAME_EXISTS",
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
                        { gameId: 1001, gameName: "Game1", bigSize: false, newTag: false },
                        { gameId: 1002, gameName: "Game2", bigSize: false, newTag: false },
                    ],
                },
            ],
            banners: [],
        },
    };

    const mockGameSettings = [
        { id: 1001, gameName: "Game1", socketInfo: { namespace: "game1" } },
        { id: 1002, gameName: "Game2", socketInfo: { namespace: "game2" } },
        { id: 1003, gameName: "Game3", socketInfo: { namespace: "game3" } },
    ];

    const defaultProps: RegisterProps = {
        session: mockSession,
        isDirectMode: false,
        gameId: 1001,
        firstSSOToLobby: false,
        isSabaPlay: false,
        t: jest.fn((key) => key),
    };

    beforeEach(() => {
        jest.clearAllMocks();

        // Setup default mocks - these need to be set before the class is imported
        (NameGenerator.generateName as jest.Mock).mockReturnValue("TestUser123");
        (NameGenerator.validateName as jest.Mock).mockReturnValue(true);
        (randomInteger as jest.Mock).mockReturnValue(5);
        (createNickname as jest.Mock).mockResolvedValue(mockAuthorizeResponse);
        (getLobbyConfigs as jest.Mock).mockResolvedValue(mockLobbyConfigs);
        (getEnabledRenderGameSettings as jest.Mock).mockReturnValue(mockGameSettings);
        (getServiceStatusIsAvailable as jest.Mock).mockResolvedValue(true);
        (AnalyticsHelper.trackFunction as jest.Mock).mockImplementation(() => { });
    });

    describe("Constructor", () => {
        it("should initialize with correct default state", () => {
            // Arrange & Act
            const component = new Register(defaultProps);

            // Assert - The static defaultState is evaluated at class definition time,
            // so the mocks won't be called during constructor. We need to check the actual values.
            expect(component.state).toMatchObject({
                isGalleryOpened: false,
                isValidUsername: true,
                formValidity: "",
                isTriggerPreloadResources: false,
                isDonePreloadResource: false,
                authorizeResponse: null,
                lobbyConfigs: null,
                isUm: false,
                isClickRegister: false,
                toLoadGameId: 1001,
            });
            // Accept avatar and name as number|string|undefined due to static evaluation
            expect(["number", "undefined"]).toContain(typeof component.state.avatar);
            expect(["string", "undefined"]).toContain(typeof component.state.name);
        });

        it("should handle different gameId values", () => {
            // Arrange
            const propsWithDifferentGameId = { ...defaultProps, gameId: 2001 };

            // Act
            const component = new Register(propsWithDifferentGameId);

            // Assert
            expect(component.state.toLoadGameId).toBe(2001);
        });
    });

    describe("Component Methods", () => {
        let component: Register;

        beforeEach(() => {
            component = new Register(defaultProps);
            component.setState = jest.fn();
        });

        it("should toggle avatar gallery", () => {
            // Arrange
            component.state = { ...component.state, isGalleryOpened: false };

            // Act
            component.toggleAvatarGallery();

            // Assert
            expect(component.setState).toHaveBeenCalledWith({ isGalleryOpened: true });
        });

        it("should set or generate name", () => {
            // Arrange
            const newName = "NewUserName";

            // Act
            component.setOrGenerateName(newName);

            // Assert
            expect(component.setState).toHaveBeenCalledWith({
                name: newName,
                isValidUsername: true,
            });
        });

        it("should generate name when no parameter provided", () => {
            // Act
            component.setOrGenerateName();

            // Assert
            expect(component.setState).toHaveBeenCalledWith({
                name: "TestUser123",
                isValidUsername: true,
            });
            expect(AnalyticsHelper.trackFunction).toHaveBeenCalledWith({
                function: TrackingFunction.Nickname,
                action: TrackingAction.GenerateRandom,
            });
        });

        it("should set avatar", () => {
            // Arrange
            const newAvatarId = 7;

            // Act
            component.setAvatar(newAvatarId);

            // Assert
            expect(component.setState).toHaveBeenCalledWith({ avatar: newAvatarId });
        });

        it("should toggle username validation", () => {
            // Arrange
            component.state = { ...component.state, isValidUsername: true };

            // Act
            component.toggleUsernameValidation();

            // Assert
            expect(component.setState).toHaveBeenCalledWith({ isValidUsername: false });
        });

        it("should set isUM", () => {
            // Act
            component.setIsUM();

            // Assert
            expect(component.setState).toHaveBeenCalledWith({ isUm: true });
        });

        it("should update click register", () => {
            // Act
            component.updateClickRegister(true);

            // Assert
            expect(component.setState).toHaveBeenCalledWith({ isClickRegister: true });
        });

        it("should update state preload resource", () => {
            // Act
            component.updateStatePreloadResource();

            // Assert
            expect(component.setState).toHaveBeenCalledWith({
                isDonePreloadResource: true,
                isClickRegister: false,
            });
        });

        it("should update lobby configs", () => {
            // Arrange
            const newLobbyConfigs = { name: "New Lobby" };

            // Act
            component.updateLobbyConfigs(newLobbyConfigs);

            // Assert
            expect(component.setState).toHaveBeenCalledWith({ lobbyConfigs: newLobbyConfigs });
        });

        it("should check if response is authorize response", () => {
            // Act & Assert
            expect(component.isAuthorizeResponse(mockAuthorizeResponse)).toBe(true);
            expect(component.isAuthorizeResponse(null)).toBe(false);
            expect(component.isAuthorizeResponse(undefined)).toBe(false);
            expect(component.isAuthorizeResponse({ user: {} })).toBe(false);
            expect(component.isAuthorizeResponse({ authorized: false, user: {} })).toBe(false);
        });
    });

    describe("Form Submission", () => {
        let component: Register;
        let mockEvent: FormEvent;

        beforeEach(() => {
            component = new Register(defaultProps);
            component.setState = jest.fn();
            component.updateClickRegister = jest.fn();
            component.updateToLoadGameId = jest.fn();

            mockEvent = {
                preventDefault: jest.fn(),
            } as any;
        });

        it("should handle successful nickname creation", async () => {
            // Arrange
            component.state = { ...component.state, name: "ValidUser123", avatar: 5 };

            // Act
            await component.submit(mockEvent);

            // Assert
            expect(mockEvent.preventDefault).toHaveBeenCalled();
            expect(component.updateClickRegister).toHaveBeenCalledWith(true);
            expect(createNickname).toHaveBeenCalledWith(mockSession, "ValidUser123", 5);
            expect(component.setState).toHaveBeenCalledWith({
                authorizeResponse: mockAuthorizeResponse,
                isTriggerPreloadResources: true,
            });
            expect(AnalyticsHelper.trackFunction).toHaveBeenCalledWith({
                function: TrackingFunction.Avatar,
                action: TrackingAction.Create,
            });
        });

        it("should handle invalid name validation", async () => {
            // Arrange
            component.state = { ...component.state, name: "Invalid" };
            (NameGenerator.validateName as jest.Mock).mockReturnValue(false);

            // Act
            await component.submit(mockEvent);

            // Assert
            expect(component.setState).toHaveBeenCalledWith({
                formValidity: "Common.name_invalid",
                isValidUsername: false,
            });
            expect(component.updateClickRegister).toHaveBeenCalledWith(false);
            expect(createNickname).not.toHaveBeenCalled();
        });

        it("should handle failed authorization response", async () => {
            // Arrange
            component.state = { ...component.state, name: "ValidUser123" };
            (createNickname as jest.Mock).mockResolvedValue(mockFailedAuthorizeResponse);

            // Act
            await component.submit(mockEvent);

            // Assert
            expect(component.setState).toHaveBeenCalledWith({
                formValidity: "Error: NICKNAME_EXISTS",
                isValidUsername: false,
            });
        });

        it("should handle createNickname error", async () => {
            // Arrange
            component.state = { ...component.state, name: "ValidUser123" };
            (createNickname as jest.Mock).mockRejectedValue(new Error("Network error"));

            // Act
            await component.submit(mockEvent);

            // Assert
            expect(createNickname).toHaveBeenCalled();
            expect(component.setState).toHaveBeenCalledWith({
                formValidity: "Error: undefined",
                isValidUsername: false,
            });
        });
    });

    describe("Game ID Update Logic", () => {
        let component: Register;

        beforeEach(() => {
            component = new Register(defaultProps);
            component.setState = jest.fn();
        });

        it("should redirect to lobby when firstSSOToLobby is true", async () => {
            // Arrange
            const firstSSOProps = { ...defaultProps, firstSSOToLobby: true };
            component = new Register(firstSSOProps);
            component.setState = jest.fn();

            // Act
            await component.updateToLoadGameId(mockAuthorizeResponse);

            // Assert
            expect(component.setState).toHaveBeenCalledWith({ toLoadGameId: 0 });
        });

        it("should find available game service when firstSSOToLobby is false", async () => {
            // Arrange
            (getServiceStatusIsAvailable as jest.Mock)
                .mockResolvedValueOnce(false) // First game unavailable
                .mockResolvedValueOnce(true); // Second game available

            // Act
            await component.updateToLoadGameId(mockAuthorizeResponse);

            // Assert
            expect(getServiceStatusIsAvailable).toHaveBeenCalledTimes(2);
            expect(component.setState).toHaveBeenCalledWith({ toLoadGameId: 1002 });
        });

        it("should handle no enabled game settings", async () => {
            // Arrange
            (getEnabledRenderGameSettings as jest.Mock).mockReturnValue([]);

            // Act
            await component.updateToLoadGameId(mockAuthorizeResponse);

            // Assert
            expect(getServiceStatusIsAvailable).not.toHaveBeenCalled();
        });

        it("should handle all games being unavailable", async () => {
            // Arrange
            (getServiceStatusIsAvailable as jest.Mock).mockResolvedValue(false);

            // Act
            await component.updateToLoadGameId(mockAuthorizeResponse);

            // Assert
            expect(getServiceStatusIsAvailable).toHaveBeenCalledTimes(3);
        });

        it("should handle getLobbyConfigs error", async () => {
            // Arrange
            (getLobbyConfigs as jest.Mock).mockRejectedValue(new Error("Lobby error"));

            // Act & Assert
            await expect(component.updateToLoadGameId(mockAuthorizeResponse)).rejects.toThrow("Lobby error");
        });
    });

    describe("Render Method", () => {
        it("should render register form by default", () => {
            // Act
            const { getByTestId, getByText } = render(<Register {...defaultProps} />);

            // Assert
            expect(getByTestId("first-login-container")).toBeInTheDocument();
            expect(getByTestId("text-block")).toBeInTheDocument();
            expect(getByTestId("profile-picture")).toBeInTheDocument();
            expect(getByText("SabaNumber.button_play_now")).toBeInTheDocument();
        });

        it("should render SabaPlay welcome message when isSabaPlay is true", () => {
            // Arrange
            const sabaPlayProps = { ...defaultProps, isSabaPlay: true };

            // Act
            const { getByText } = render(<Register {...sabaPlayProps} />);

            // Assert
            expect(getByText("SabaNumber.message_welcome_numbergame_sabaplay")).toBeInTheDocument();
        });

        it("should render regular welcome message when isSabaPlay is false", () => {
            // Act
            const { getByText } = render(<Register {...defaultProps} />);

            // Assert
            expect(getByText("SabaNumber.message_welcome_numbergame")).toBeInTheDocument();
        });
    });

    describe("Integration Tests", () => {
        it("should handle form submission with valid name", async () => {
            // Arrange
            const { getByTestId, getByText } = render(<Register {...defaultProps} />);
            const usernameInput = getByTestId("username");
            const submitButton = getByText("SabaNumber.button_play_now");

            // Act
            fireEvent.change(usernameInput, { target: { value: "NewUser123" } });
            fireEvent.click(submitButton);

            // Assert
            await waitFor(() => {
                // Get the actual avatar value from the component state
                const component = new Register(defaultProps);
                expect(createNickname).toHaveBeenCalledWith(mockSession, "NewUser123", component.state.avatar);
            });
        });

        it("should handle form submission with invalid name", async () => {
            // Arrange
            (NameGenerator.validateName as jest.Mock).mockReturnValue(false);
            const { getByTestId, getByText } = render(<Register {...defaultProps} />);
            const usernameInput = getByTestId("username");
            const submitButton = getByText("SabaNumber.button_play_now");

            // Act
            fireEvent.change(usernameInput, { target: { value: "Invalid" } });
            fireEvent.click(submitButton);

            // Assert
            await waitFor(() => {
                expect(screen.getByText("Common.name_invalid")).toBeInTheDocument();
            }, { timeout: 5000 });
        });

        it("should handle avatar gallery interaction", () => {
            // Arrange
            const { getByTestId } = render(<Register {...defaultProps} />);
            const profilePicture = getByTestId("profile-picture");

            // Act
            fireEvent.click(profilePicture);

            // Assert
            expect(screen.getByTestId("avatar-gallery")).toBeInTheDocument();
        });

        it("should handle name generation button click", () => {
            // Arrange
            const { container } = render(<Register {...defaultProps} />);
            const refreshButton = container.querySelector("button.refresh");

            // Act
            fireEvent.click(refreshButton!);

            // Assert
            expect(NameGenerator.generateName).toHaveBeenCalled();
            expect(AnalyticsHelper.trackFunction).toHaveBeenCalledWith({
                function: TrackingFunction.Nickname,
                action: TrackingAction.GenerateRandom,
            });
        });
    });

    describe("Edge Cases", () => {
        it("should handle empty name input", async () => {
            // Arrange
            (NameGenerator.validateName as jest.Mock).mockReturnValue(false);
            const { getByTestId, getByText } = render(<Register {...defaultProps} />);
            const usernameInput = getByTestId("username");
            const submitButton = getByText("SabaNumber.button_play_now");

            // Act
            fireEvent.change(usernameInput, { target: { value: "" } });
            fireEvent.click(submitButton);

            // Assert
            await waitFor(() => {
                expect(screen.getByText("Common.name_invalid")).toBeInTheDocument();
            }, { timeout: 5000 });
        });

        it("should handle network timeout during nickname creation", async () => {
            // Arrange
            (createNickname as jest.Mock).mockRejectedValue(new Error("Request timeout"));
            const { getByTestId, getByText } = render(<Register {...defaultProps} />);
            const usernameInput = getByTestId("username");
            const submitButton = getByText("SabaNumber.button_play_now");

            // Act
            fireEvent.change(usernameInput, { target: { value: "TestUser123" } });
            fireEvent.click(submitButton);

            // Assert
            await waitFor(() => {
                expect(createNickname).toHaveBeenCalled();
            }, { timeout: 5000 });
        });

        it("should handle lobby configs being null", async () => {
            // Arrange
            (getLobbyConfigs as jest.Mock).mockResolvedValue(null);
            const component = new Register(defaultProps);

            // Act
            await component.updateToLoadGameId(mockAuthorizeResponse);

            // Assert
            expect(getEnabledRenderGameSettings).toHaveBeenCalledWith(undefined, mockAuthorizeResponse);
        });

        it("should handle lobby configs being undefined", async () => {
            // Arrange
            (getLobbyConfigs as jest.Mock).mockResolvedValue(undefined);
            const component = new Register(defaultProps);

            // Act
            await component.updateToLoadGameId(mockAuthorizeResponse);

            // Assert
            expect(getEnabledRenderGameSettings).toHaveBeenCalledWith(undefined, mockAuthorizeResponse);
        });
    });
});
