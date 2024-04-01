import { render } from "@testing-library/react";
import React from "react";
import ChangeAvatar from ".";

jest.mock("../../../../_shared/react-hooks", () => ({
    useSettingContext: jest.fn(),
    useClickSound: jest.fn(),
    usePlayerContext: jest.fn(),
    useTranslator: jest.fn().mockReturnValue({ t: (key: string) => key }),
}));

describe(ChangeAvatar.name, () => {
    let mockSettingContext, mockSettingContextSpy, mockUseState, mockUseStateSpy;

    beforeEach(() => {
        mockSettingContext = {
            isShowAvatarGallery: true,
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
        };

        mockUseState = jest.fn();
        mockUseState.mockReturnValue([0, jest.fn()]);
        mockSettingContextSpy = jest.spyOn(React, "useContext");
        mockUseStateSpy = jest.spyOn(React, "useState");
        mockUseStateSpy.mockImplementation(mockUseState);
    });
    describe("render", () => {
        describe("With normal ChangeAvatar", () => {
            it("should match the snapshot", () => {
                // Arrange
                mockSettingContextSpy.mockReturnValue(mockSettingContext);
                mockUseState.mockReturnValue([1, jest.fn()]);

                // Act
                const [avatarId, _] = mockUseState();
                const { container } = render(<ChangeAvatar />);
                const avatarSelectedElement = container.querySelector(".avatar-selected");

                // Assert
                expect(avatarId).toBe(1);
                expect(container).toMatchSnapshot();
                expect(avatarSelectedElement).toBeInTheDocument();
            });
        });

        describe("Not render ChangeAvatar", () => {
            it("should match the snapshot", () => {
                // Arrange
                mockSettingContext.isShowAvatarGallery = false;
                mockSettingContextSpy.mockReturnValue(mockSettingContext);

                // Act
                const { container } = render(<ChangeAvatar />);

                // Assert
                expect(container).toMatchSnapshot();
            });
        });
    });
});
