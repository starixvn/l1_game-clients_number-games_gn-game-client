import { render } from "@testing-library/react";
import { Avatar } from "./avatar";

describe(Avatar.name, () => {
    describe("render", () => {
        describe("with selected avatar", () => {
            it("should match the snapshot", () => {
                // Act
                const { container } = render(<Avatar selected={1} id={1} onClick={jest.fn()} />);

                // Assert
                expect(container).toMatchSnapshot();
            });
        });

        describe("with normal avatar", () => {
            it("should match the snapshot", () => {
                // Act
                const { container } = render(<Avatar selected={2} id={1} onClick={jest.fn()} />);

                // Assert
                expect(container).toMatchSnapshot();
            });
        });
    });
});
