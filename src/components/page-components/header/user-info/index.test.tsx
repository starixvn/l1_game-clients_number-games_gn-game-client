import { fireEvent, render } from "@testing-library/react";
import * as reactDeviceDetect from "react-device-detect";
import UserInfo from ".";
import { SettingEventActionType, usePlayerContext, useSettingDispatch } from "../../../../_shared/react-contexts";
import { useClickSound } from "../../../../_shared/react-hooks";

const mockUsePlayerContext = usePlayerContext as jest.Mock;
const mockSound = useClickSound as jest.Mock;
const mockUseSettingDispatch = useSettingDispatch as jest.Mock;

jest.mock("../../../../_shared/react-hooks", () => ({
    useClickSound: jest.fn(),
}));

jest.mock("../../../../_shared/react-contexts", () => ({
    useSettingDispatch: jest.fn(),
    usePlayerContext: jest.fn(),
    SettingEventActionType: {
        SHOW_AVATAR_GALLERY: "SHOW_AVATAR_GALLERY",
    },
}));

describe(UserInfo.name, () => {
    beforeEach(() => {
        mockUsePlayerContext.mockReturnValue({
            authorizeInfo: {
                user: {
                    UID: 1,
                    avatarId: 1,
                    currency: test,
                    name: test,
                    red: 1,
                    settings: {},
                    isSignedInSM: false,
                    offerGames: [],
                    availSpins: 0,
                    scoins: 1,
                    fractionalOddsFormat: false,
                    isDisplayPlayerCurrency: false,
                },
            },
        });
    });
    afterAll(() => {
        jest.clearAllMocks();
    });

    describe("render", () => {
        describe("With isLobby = false", () => {
            it("should match the snapshot", () => {
                // Act
                const { container } = render(<UserInfo isLobby={false} />);

                // Assert
                expect(container).toMatchSnapshot();
            });
        });

        describe("With isLobby = true", () => {
            it("should match the snapshot", () => {
                // Arrange

                // Act
                const { container } = render(<UserInfo isLobby={true} />);

                // Assert
                expect(container).toMatchSnapshot();
            });
        });

        describe("With isLobby = true and login on Phone", () => {
            it("should match the snapshot on device Android", () => {
                // Arrange
                Object.defineProperty(reactDeviceDetect, "isMobileOnly", { get: () => true });

                // Act
                const { container } = render(<UserInfo isLobby={true} />);

                // Assert
                expect(container).toMatchSnapshot();
            });

            it("should match the snapshot on device IOS", () => {
                // Arrange
                Object.defineProperty(reactDeviceDetect, "isMobileOnly", { get: () => true });
                Object.defineProperty(reactDeviceDetect, "isIOS", { get: () => true });

                // Act
                const { container } = render(<UserInfo isLobby={true} />);

                // Assert
                expect(container).toMatchSnapshot();
            });
        });

        it("With isLobby = true and click change avatar", () => {
            // Arrange
            const clickSound = jest.fn();
            const mockSettingDispatch = jest.fn();
            mockSound.mockReturnValue(clickSound);
            mockUseSettingDispatch.mockReturnValue(mockSettingDispatch);

            // Act
            const { getByTestId } = render(<UserInfo isLobby={true} />);
            const avatar = getByTestId("avatar");
            fireEvent.click(avatar);

            // Assert
            expect(clickSound).toHaveBeenCalled();
            expect(mockSettingDispatch).toHaveBeenCalledWith({
                type: SettingEventActionType.SHOW_AVATAR_GALLERY,
                payload: {
                    isShowAvatarGallery: true,
                },
            });
        });
    });
});
