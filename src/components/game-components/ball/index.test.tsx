import { render } from "@testing-library/react";
import React, { useState as useStateMock } from "react";

import Ball from ".";

jest.mock("react", () => ({
    ...jest.requireActual("react"),
    useState: jest.fn(),
}));

describe(Ball.name, () => {
    const ballNumber = 2;
    const setState = jest.fn();
    beforeEach(() => {
        (useStateMock as any).mockImplementation((init) => [init, setState]);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("render", () => {
        describe("when delayShowResult equal to false", () => {
            test("should show a empty ball", () => {
                // Act
                const { container } = render(<Ball number={ballNumber} />);

                // Assert
                expect(container).toMatchSnapshot();
                expect(container.textContent).not.toBe(ballNumber);
            });
        });

        describe("when number is less than or equal to 0", () => {
            test("should show a empty ball", () => {
                // Act
                const { container } = render(<Ball number={0} />);

                // Assert
                expect(container).toMatchSnapshot();
                expect(container.textContent).not.toBe(0);
            });
        });

        describe("when delayShowResult equal to true and number is greater than 0", () => {
            test("should show a ball with number", () => {
                // Arrange
                jest.spyOn(React, "useState").mockImplementation(() => [true, setState]);

                // Act
                const { container } = render(<Ball number={ballNumber} />);

                // Assert
                expect(container).toMatchSnapshot();
                expect(container.textContent).toBe(`${ballNumber}`);
            });
        });
    });
});
