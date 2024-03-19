import { render } from "@testing-library/react";
import { AvatarGallery, Avatars } from "./avatar-gallery";

jest.mock("../../../../_shared/react-hooks", () => ({
    useTranslator: () => ({ t: jest.fn().mockReturnValue("translated") }),
    useClickSound: jest.fn(),
}));

describe(Avatars.name, () => {
    describe("render", () => {
        it("should match the snapshot", () => {
            // Act
            const { container } = render(<Avatars onSelect={jest.fn()} selected={1} />);

            // Assert
            expect(container).toMatchSnapshot();
        });
    });
});

describe(AvatarGallery.name, () => {
    describe("render", () => {
        it("should match the snapshot", () => {
            // Act
            const { container } = render(<AvatarGallery onClose={jest.fn()} onSelectAvatar={jest.fn()} selectedAvatarId={1} />);

            // Assert
            expect(container).toMatchSnapshot();
        });
    });
});
