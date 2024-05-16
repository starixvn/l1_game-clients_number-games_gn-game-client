import { render } from "@testing-library/react";

import { Register } from "./register";

jest.mock("..", () => jest.fn().mockReturnValue("Dashboard"));

jest.mock("../../../../services/auth-service", () => ({
    createNickname: jest.fn(),
}));
jest.mock("../../../../_shared/react-hooks", () => ({
    useTranslator: jest.fn(),
}));
jest.mock("./name-generator", () => ({
    generateName: jest.fn().mockReturnValue("abc"),
    validateName: jest.fn().mockReturnValue(true),
}));

jest.mock("../../../../_shared/helpers/number-helper", () => ({
    randomInteger: jest.fn().mockReturnValue(1),
}));

jest.mock("../../../../_shared/helpers", () => ({
    AnalyticsHelper: { trackFunction: jest.fn() },
    TrackingFunction: jest.fn(),
    TrackingAction: jest.fn(),
}));

jest.mock("next/router", () => ({
    useRouter: jest.fn().mockReturnValue({
        query: {
            param1: "value1",
            param2: "value2",
        },
    }),
}));

describe(Register.name, () => {
    let component: Register;

    beforeEach(() => {
        component = new Register({
            isDirectMode: false,
            session: {} as any,
            t: jest.fn(),
            gameId: 1001,
        });

        component.setState = jest.fn();
    });

    describe("render", () => {
        it("should match snapshot", () => {
            // Act
            const { container } = render(<Register session={{} as any} t={jest.fn()} isDirectMode={false} gameId={1001} />);

            // Assert
            expect(container).toMatchSnapshot();
        });
    });

    describe("toggleAvatarGallery", () => {
        it("should update property isGalleryOpened in state", () => {
            // Act
            component.toggleAvatarGallery();

            // Assert
            expect(component.setState).toHaveBeenCalledWith({ isGalleryOpened: true });
        });
    });

    describe("setOrGenerateName", () => {
        describe("and the input is undefined", () => {
            it("should update property setOrGenerateName in state", () => {
                // Act
                component.setOrGenerateName();

                // Assert
                expect(component.setState).toHaveBeenCalledWith({ isValidUsername: true, name: "abc" });
            });
        });

        describe("and the input is normal", () => {
            it("should update property state as expected", () => {
                // Act
                component.setOrGenerateName("new name");

                // Assert
                expect(component.setState).toHaveBeenCalledWith({ name: "new name", isValidUsername: true });
            });
        });
    });

    describe("setAvatar", () => {
        it("should update property setAvatar in state", () => {
            // Act
            component.setAvatar(2);

            // Assert
            expect(component.setState).toHaveBeenCalledWith({ avatar: 2 });
        });
    });

    describe("toggleUsernameValidation", () => {
        it("should update property toggleUsernameValidation in state", () => {
            // Act
            component.toggleUsernameValidation();

            // Assert
            expect(component.setState).toHaveBeenCalledWith({ isValidUsername: false });
        });
    });
});
