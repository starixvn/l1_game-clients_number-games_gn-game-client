import { render } from "@testing-library/react";
import React, { useState as useStateMock } from "react";
import { formatOdds } from "../../../_shared/helpers";
import { usePlayerContext } from "../../../_shared/react-contexts";
import Odds from "./odds";

const mockUsePlayerContext = usePlayerContext as jest.Mock;

jest.mock("../../../_shared/react-contexts", () => ({
    useGameStateContext: jest.fn(),
    usePlayerContext: jest.fn(),
}));

jest.mock("../../../_shared/helpers", () => ({
    formatOdds: jest.fn(),
}));

jest.mock("react", () => ({
    ...jest.requireActual("react"),
    useState: jest.fn(),
}));

describe("Odds Component", () => {
    const setState = jest.fn();
    const props = {
        tolgeeNamespace: "namespace",
        choice: "choice",
        className: "custom-class",
        animationDuration: 2,
        turnCounter: 1,
    };
    const mockOdd = "1";
    beforeEach(() => {
        (useStateMock as any).mockImplementation((init) => [init, setState]);
        mockUsePlayerContext.mockReturnValue({ fractionalOddsFormat: {} });

        jest.spyOn(React, "useState")
            .mockImplementationOnce(() => [true, setState])
            .mockImplementationOnce(() => [true, setState])
            .mockImplementationOnce(() => [10, setState]);

        (formatOdds as jest.MockedFunction<typeof formatOdds>).mockReturnValue(mockOdd);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("renders with initial props", () => {
        // Act
        const { getByText } = render(<Odds {...props} />);

        // Assert
        expect(getByText(mockOdd)).toBeInTheDocument();
    });

    test("should match the snapshot", () => {
        // Act
        const { container } = render(<Odds {...props} />);

        // Assert
        expect(container).toMatchSnapshot();
    });
});
