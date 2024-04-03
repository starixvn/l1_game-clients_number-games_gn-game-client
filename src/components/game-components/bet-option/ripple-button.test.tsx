import { fireEvent, render, screen } from "@testing-library/react";
import { buildVersion } from "../../../_shared/constants";
import { useGameActionContext, useSystemContext } from "../../../_shared/react-contexts";
import { useGameStateContext } from "../../../_shared/react-contexts/game-state-context/game-state-context";
import { RoundState } from "../../game-base/type";
import RippleButton, { DEFAULT_CHIP_CURSOR_PATH } from "./ripple-button";

const mockUseGameStateContext = useGameStateContext as jest.Mock;
const mockUseSystemContext = useSystemContext as jest.Mock;
const mockUseGameActionContext = useGameActionContext as jest.Mock;
jest.mock("../../../_shared/react-contexts/game-state-context/game-state-context", () => ({
    useGameStateContext: jest.fn(),
    useGameStatesDispatch: jest.fn(),
}));

jest.mock("../../../_shared/react-contexts", () => ({
    useSystemContext: jest.fn(),
    useGameActionContext: jest.fn(),
}));

jest.mock("../../../_shared/constants", () => ({
    buildVersion: 123,
}));

describe("RippleButton", () => {
    const mockPlaceBet = jest.fn();
    const mockSelectedChip = 1;
    const defaultProps = {
        choice: "player",
        className: "btn-class",
        id: "btn-id",
    };

    beforeEach(() => {
        mockPlaceBet.mockClear();
        mockUseGameStateContext.mockReturnValue({ roundState: RoundState.InRound });
        mockUseSystemContext.mockReturnValue({ selectedChip: mockSelectedChip });
        mockUseGameActionContext.mockReturnValue({ placeBet: mockPlaceBet });
    });

    test("renders button with correct props", () => {
        // Act
        render(<RippleButton {...defaultProps} />);
        const button = screen.getByRole("button");

        // Assert
        expect(button).toBeInTheDocument();
        expect(button).toHaveClass("btn-ripple btn-class");
        expect(button).toHaveAttribute("id", "btn-id");
    });

    test("calls onClickBet when button is clicked", () => {
        // Act
        render(<RippleButton {...defaultProps} />);
        const button = screen.getByRole("button");
        fireEvent.click(button);

        // Assert
        expect(mockPlaceBet).toHaveBeenCalledTimes(1);
        expect(mockPlaceBet).toHaveBeenCalledWith("player", mockSelectedChip);
    });

    test("updates cursor style based on round state = InRound", () => {
        // Arrange
        const selectedChip = 10;
        mockUseSystemContext.mockReturnValue({ selectedChip });

        // Act
        render(<RippleButton {...defaultProps} />);
        const button = screen.getByRole("button");
        const expectedPath = `${DEFAULT_CHIP_CURSOR_PATH}/cursor-chip-${selectedChip}.svg?v=${buildVersion}`;

        // Assert
        expect(button).toHaveStyle({ cursor: `url(${expectedPath}), auto` });
    });

    test("updates cursor style based on round state != InRound", () => {
        // Arrange
        mockUseGameStateContext.mockReturnValue({ roundState: RoundState.LockingBet });

        // Act
        render(<RippleButton {...defaultProps} />);
        const button = screen.getByRole("button");

        // Assert
        expect(button).toHaveStyle({ cursor: "not-allowed" });
    });

    test("should match the snapshot", () => {
        // Act
        const { container } = render(<RippleButton {...defaultProps} />);

        // Assert
        expect(container).toMatchSnapshot();
    });
});
