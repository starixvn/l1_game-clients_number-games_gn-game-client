import React from "react";
import { render, screen, act, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";

// Mock object-helper at the very top to fix import issues
jest.mock("../../../../_shared/helpers/object-helper", () => ({
    objectMap: (obj: any, fn: any) => Object.fromEntries(Object.entries(obj).map(([k, v], i) => [k, fn(v, k, i)])),
}));

// Mock use-sound to prevent objectMap import issues
jest.mock("../../../../_shared/react-hooks/use-sound", () => ({
    usePlaySound: jest.fn(() => jest.fn()),
    useClickSound: jest.fn(() => jest.fn()),
    useSelectChipSound: jest.fn(() => jest.fn()),
    usePlaceBetSound: jest.fn(() => jest.fn()),
    useStartDrawSound: jest.fn(() => jest.fn()),
    useStartRoundSound: jest.fn(() => jest.fn()),
    useShowBallResultSound: jest.fn(() => jest.fn()),
    useBlockBetSound: jest.fn(() => jest.fn()),
}));

// Mock Next.js dynamic imports
jest.mock("next/dynamic", () => {
    const DynamicComponent = () => <div data-testid="dynamic-component">Dynamic Component</div>;
    DynamicComponent.displayName = "DynamicComponent";
    return () => DynamicComponent;
});

// Mock dynamic import for BaseDialog
jest.mock("../../../game-components/base-dialog", () => ({
    __esModule: true,
    default: ({ children, isOpen }: any) => isOpen ? <div data-testid="base-dialog">{children}</div> : null,
}));

// Mock Next.js router
jest.mock("next/router", () => ({
    withRouter: (Component: any) => (props: any) => {
        const router = {
            push: jest.fn(),
            route: "/",
            pathname: "/",
            query: {},
            asPath: "/",
        };
        return <Component {...props} router={router} />;
    },
}));

// Mock handlers
jest.mock("../handlers/dash-board-handler", () => ({
    DashboardHandler: jest.fn().mockImplementation(() => ({
        shouldRenderGames: jest.fn().mockReturnValue(false),
        checkIsNotOfferGame: jest.fn().mockReturnValue(false),
        getLobbyGamesIds: jest.fn().mockReturnValue([1001, 1002, 1003]),
        getOfferGamesIds: jest.fn().mockReturnValue([1001, 1002, 1003]),
        removeGameTransmitter: jest.fn(),
        buildLobbyConnectionContextValue: jest.fn().mockReturnValue({
            socket: null,
            gameTransmitters: {},
            removeGameTransmitter: jest.fn(),
            reconnectGameTransmitter: jest.fn(),
        }),
        reset: jest.fn(),
        updateGameTransmitters: jest.fn(),
    })),
}));

jest.mock("../handlers/notification-handler", () => ({
    NotificationHandler: jest.fn().mockImplementation(() => ({
        handleShowApiErrorMessage: jest.fn(),
        handleReCheckIn: jest.fn(),
        reset: jest.fn(),
        isKickOut: false,
    })),
}));

// Mock shared dependencies
jest.mock("../../../../_shared/constants/error-code-dictionary", () => ({
    ErrorNoGameOffer: "No game offer available",
}));

jest.mock("../../../../_shared/helpers", () => ({
    GetLocalizedErrorMessage: jest.fn((errorCode) => `Localized error: ${errorCode}`),
    localStorageKeys: { buildVersion: "buildVersion" },
    StorageHelper: {
        get: jest.fn().mockImplementation((key) => {
            if (key === "buildVersion") {
                return process.env.buildVersion || "1.0.0";
            }
            return "1.0.0";
        }),
        set: jest.fn(),
    },
}));

jest.mock("../../../../_shared/helpers/message-transmitter/global-transmitter", () => ({
    GlobalMessageTransmitter: {
        broadcast: jest.fn()
    },
    GlobalTransmitterEvent: {
        USER_INFO_RED: "USER_INFO_RED",
        BACK_TO_LOBBY: "BACK_TO_LOBBY",
        CLOSE_DIALOG: "CLOSE_DIALOG",
        NOTICE: "NOTICE",
    },
    registerGlobalMessageEvent: jest.fn().mockReturnValue("event-id"),
    unsubscribeGlobalMessageEvent: jest.fn(),
}));

jest.mock("../../../../_shared/react-contexts", () => ({
    loadURLContext: jest.fn().mockReturnValue({ gameId: 0 }),
    updateURLContext: jest.fn(),
    LobbyConnectionContextProvider: ({ children }: any) => <div data-testid="lobby-connection-provider">{children}</div>,
    PlayerContextProvider: ({ children }: any) => <div data-testid="player-context-provider">{children}</div>,
    SettingContextProvider: ({ children }: any) => <div data-testid="setting-context-provider">{children}</div>,
}));

// Mock components with display names
const MockGames = () => <div data-testid="games-component">Games Component</div>;
MockGames.displayName = "MockGames";

const MockLobby = () => <div data-testid="lobby-component">Lobby Component</div>;
MockLobby.displayName = "MockLobby";

const MockHeader = () => <div data-testid="header-component">Header Component</div>;
MockHeader.displayName = "MockHeader";

const MockFooter = () => <div data-testid="footer-component">Footer Component</div>;
MockFooter.displayName = "MockFooter";

const MockErrorApiText = () => <div data-testid="error-api-text">Error API Text</div>;
MockErrorApiText.displayName = "MockErrorApiText";

const MockLoadingSpinner = () => <div data-testid="loading-spinner">Loading Spinner</div>;
MockLoadingSpinner.displayName = "MockLoadingSpinner";

jest.mock("../../../../games/games", () => ({ __esModule: true, default: MockGames }));
jest.mock("../../lobby/lobby", () => ({ __esModule: true, default: MockLobby }));
jest.mock("../../header", () => ({ __esModule: true, default: MockHeader }));
jest.mock("../../../game-components/footer", () => ({ __esModule: true, default: MockFooter }));
jest.mock("../../../game-components/error-api-text", () => ({ __esModule: true, default: MockErrorApiText }));
jest.mock("../../../game-components/game-loading/loading-spinner", () => ({
    __esModule: true, LoadingSpinner: MockLoadingSpinner,
}));

// Mock other dependencies
jest.mock("react-device-detect", () => ({
    isDesktop: true,
    isMobile: false,
    isMobileOnly: false,
}));

jest.mock("swiper", () => ({ default: jest.fn() }));
jest.mock("../../../game-base/type", () => ({ UserStakeLevel: jest.fn() }));
jest.mock("../../../game-components/base-dialog/type", () => ({ ModalType: { Center: "center" } }));
jest.mock("../../../../games/scoreboards", () => ({}));

// Mock DOM methods
Object.defineProperty(window, 'innerHeight', { value: 800, writable: true });
Object.defineProperty(window, 'innerWidth', { value: 1200, writable: true });
Object.defineProperty(window, 'getComputedStyle', {
    value: () => ({ getPropertyValue: () => '1' }),
    writable: true
});
Object.defineProperty(window, 'history', { value: { pushState: jest.fn() }, writable: true });
Object.defineProperty(window, 'scrollTo', { value: jest.fn(), writable: true });
Object.defineProperty(window, 'location', {
    value: {
        reload: jest.fn(),
        href: 'http://localhost:3000'
    },
    writable: true
});

// Mock document.getElementById to return a proper element for the dashboard
const mockDashboardElement = {
    clientHeight: 800,
    classList: {
        add: jest.fn(),
        remove: jest.fn(),
    }
};
document.getElementById = jest.fn().mockImplementation((id) => {
    if (id === 'dashboard') {
        return mockDashboardElement;
    }
    return null;
});

import Dashboard from "..";

describe("Dashboard Component", () => {
    const mockProps: any = {
        authorizeResponse: {
            authorized: true,
            user: {
                id: "user123",
                red: 1000,
                offerGames: [1001, 1002, 1003],
                fractionalOddsFormat: false,
            },
            errorCode: null,
        },
        queryGame: 1001,
        directMode: false,
        lobbyConfigs: {
            name: "Test Lobby",
            currencyGroupIds: ["USD"],
            miniPanelGameIds: [1001, 1002, 1003],
            categories: [],
            banners: [],
            gameSettings: {
                1001: { id: 1001, gameName: "Game1" },
                1002: { id: 1002, gameName: "Game2" },
                1003: { id: 1003, gameName: "Game3" },
            },
        },
        session: {
            id: "session123",
            isUM: false,
            isAuthenticated: true,
            username: "testuser",
            language: "en",
            ss: "test-ss-token",
            memberName: "testuser",
            umInfo: null,
            system: null,
        },
        setIsUm: jest.fn(),
        tolgee: {
            getLanguage: jest.fn().mockReturnValue("en"),
        },
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("Basic Functionality", () => {
        it("should render without crashing", () => {
            // Arrange & Act
            const { container } = render(<Dashboard {...mockProps} />);

            // Assert
            expect(container).toBeInTheDocument();
        });

        it("should initialize DashboardHandler", () => {
            // Arrange
            const { DashboardHandler } = require("../handlers/dash-board-handler");

            // Act
            render(<Dashboard {...mockProps} />);

            // Assert
            expect(DashboardHandler).toHaveBeenCalled();
        });

        it("should initialize NotificationHandler", () => {
            // Arrange
            const { NotificationHandler } = require("../handlers/notification-handler");

            // Act
            render(<Dashboard {...mockProps} />);

            // Assert
            expect(NotificationHandler).toHaveBeenCalled();
        });
    });

    describe("Component Rendering", () => {
        it("should render header component", () => {
            // Arrange & Act
            render(<Dashboard {...mockProps} />);

            // Assert
            expect(screen.getByTestId("header-component")).toBeInTheDocument();
        });

        it("should render lobby component by default", () => {
            // Arrange & Act
            render(<Dashboard {...mockProps} />);

            // Assert
            expect(screen.getByTestId("lobby-component")).toBeInTheDocument();
        });

        it("should render footer component when not in games mode", () => {
            // Arrange & Act
            render(<Dashboard {...mockProps} />);

            // Assert
            expect(screen.getByTestId("footer-component")).toBeInTheDocument();
        });
    });
    describe("Lifecycle Methods", () => {
        it("should cleanup resources on unmount", () => {
            // Arrange
            const { DashboardHandler } = require("../handlers/dash-board-handler");
            const { NotificationHandler } = require("../handlers/notification-handler");
            const mockDashboardHandler = {
                shouldRenderGames: jest.fn().mockReturnValue(false),
                checkIsNotOfferGame: jest.fn().mockReturnValue(false),
                getLobbyGamesIds: jest.fn().mockReturnValue([1001, 1002, 1003]),
                getOfferGamesIds: jest.fn().mockReturnValue([1001, 1002, 1003]),
                removeGameTransmitter: jest.fn(),
                buildLobbyConnectionContextValue: jest.fn().mockReturnValue({
                    socket: null,
                    gameTransmitters: {},
                    removeGameTransmitter: jest.fn(),
                    reconnectGameTransmitter: jest.fn(),
                }),
                reset: jest.fn(),
                updateGameTransmitters: jest.fn(),
            };
            const mockNotificationHandler = {
                handleShowApiErrorMessage: jest.fn(),
                handleReCheckIn: jest.fn(),
                reset: jest.fn(),
                isKickOut: false,
            };
            (DashboardHandler as jest.Mock).mockImplementation(() => mockDashboardHandler);
            (NotificationHandler as jest.Mock).mockImplementation(() => mockNotificationHandler);

            // Act
            const { unmount } = render(<Dashboard {...mockProps} />);
            unmount();

            // Assert
            expect(mockDashboardHandler.reset).toHaveBeenCalled();
            expect(mockNotificationHandler.reset).toHaveBeenCalled();
        });
    });
}); 