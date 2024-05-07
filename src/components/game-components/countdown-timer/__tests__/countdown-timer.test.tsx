import { render } from "@testing-library/react";

import { useGameStateContext } from "../../../../_shared/react-contexts/game-state-context/game-state-context";
import { GameStateContextModel } from "../../../../_shared/react-contexts/game-state-context/game-state-context-model";
import { useBlockBetSound } from "../../../../_shared/react-hooks";
import { RoundState } from "../../../game-base/type";
import CountdownTimer, { GameStatus, SimpleTimer } from "../countdown-timer";

const mockUseGameStateContext = useGameStateContext as jest.Mock;
const mockSoundBlockBetCountdown = useBlockBetSound as jest.Mock;

jest.mock("../../../../_shared/react-contexts/game-state-context/game-state-context", () => ({
    useGameStateContext: jest.fn(),
}));

jest.mock("../../../../_shared/react-hooks/use-translator", () => ({
    useSNTranslate: jest.fn().mockReturnValue({ t: (key: string) => key }),
}));

jest.mock("react", () => ({
    ...jest.requireActual("react"),
    useState: (initialValue) => [initialValue, jest.fn()],
}));

jest.mock("../../../../_shared/react-hooks", () => ({
    useBlockBetSound: jest.fn().mockReturnValue(jest.fn()),
}));

describe("CountdownTimer File", () => {
    let gameId;
    beforeEach(() => {
        gameId = 1001;
    });
    describe("CountdownTimer Component", () => {
        const MockSimpleTimer = () => <div className="simple-timer"></div>;
        const MockGameStatus = ({ children }) => <div className="game-status">{children}</div>;

        test("renders SimpleTimer and GameStatus for InRound state", () => {
            mockUseGameStateContext.mockReturnValue({ roundState: RoundState.InRound } as GameStateContextModel);

            const { container } = render(
                <CountdownTimer SimpleTimerProp={MockSimpleTimer} GameStatusProp={MockGameStatus} gameId={gameId} />
            );

            expect(container.querySelector(".simple-timer")).toBeInTheDocument();
            expect(container.querySelector(".start-betting")).toBeInTheDocument();
            expect(container.querySelector(".no-more-bets")).not.toBeInTheDocument();
            expect(container.querySelector(".status_result")).not.toBeInTheDocument();
            expect(container.querySelector(".loader-show-result")).not.toBeInTheDocument();
            expect(container.querySelector(".game-status")).toBeInTheDocument();
        });

        test("renders SimpleTimer and GameStatus for LockingBet state", () => {
            mockUseGameStateContext.mockReturnValue({ roundState: RoundState.LockingBet } as GameStateContextModel);

            const { container } = render(
                <CountdownTimer SimpleTimerProp={MockSimpleTimer} GameStatusProp={MockGameStatus} gameId={gameId} />
            );

            expect(container.querySelector(".simple-timer")).toBeInTheDocument();
            expect(container.querySelector(".start-betting")).not.toBeInTheDocument();
            expect(container.querySelector(".no-more-bets")).toBeInTheDocument();
            expect(container.querySelector(".status_result")).not.toBeInTheDocument();
            expect(container.querySelector(".loader-show-result")).not.toBeInTheDocument();
            expect(container.querySelector(".game-status")).toBeInTheDocument();
        });

        test("only renders loading show result and GameStatus for DisplayResult state", () => {
            mockUseGameStateContext.mockReturnValue({ roundState: RoundState.DisplayResult } as GameStateContextModel);

            const { container } = render(
                <CountdownTimer SimpleTimerProp={MockSimpleTimer} GameStatusProp={MockGameStatus} gameId={gameId} />
            );

            expect(container.querySelector(".simple-timer")).not.toBeInTheDocument();
            expect(container.querySelector(".start-betting")).not.toBeInTheDocument();
            expect(container.querySelector(".no-more-bets")).not.toBeInTheDocument();
            expect(container.querySelector(".status_result")).not.toBeInTheDocument();
            expect(container.querySelector(".loader-show-result")).toBeInTheDocument();
            expect(container.querySelector(".game-status")).toBeInTheDocument();
        });

        test("only renders loading show result for None state", () => {
            mockUseGameStateContext.mockReturnValue({ roundState: RoundState.None } as GameStateContextModel);

            const { container } = render(
                <CountdownTimer SimpleTimerProp={MockSimpleTimer} GameStatusProp={MockGameStatus} gameId={gameId} />
            );

            expect(container.querySelector(".simple-timer")).not.toBeInTheDocument();
            expect(container.querySelector(".start-betting")).not.toBeInTheDocument();
            expect(container.querySelector(".no-more-bets")).not.toBeInTheDocument();
            expect(container.querySelector(".status_result")).not.toBeInTheDocument();
            expect(container.querySelector(".loader-show-result")).toBeInTheDocument();
            expect(container.querySelector(".game-status")).not.toBeInTheDocument();
        });

        test.each([RoundState.BeforePlaceBet, RoundState.SwitchRound, RoundState.ConnectFailed, RoundState.Disabled, 9])(
            "renders nothing for BeforePlaceBet or SwitchRound or ConnectFailed or Disabled state or wrong state",
            (roundState) => {
                mockUseGameStateContext.mockReturnValue({ roundState } as GameStateContextModel);

                const { container } = render(<CountdownTimer SimpleTimerProp={MockSimpleTimer} gameId={gameId} />);

                expect(container.querySelector(".simple-timer")).not.toBeInTheDocument();
                expect(container.querySelector(".start-betting")).not.toBeInTheDocument();
                expect(container.querySelector(".no-more-bets")).not.toBeInTheDocument();
                expect(container.querySelector(".status_result")).not.toBeInTheDocument();
                expect(container.querySelector(".loader-show-result")).not.toBeInTheDocument();
                expect(container.querySelector(".game-status")).not.toBeInTheDocument();
            }
        );
    });

    describe("SimpleTimer Component", () => {
        test("renders nothing when remainingTime is 0 or less", () => {
            mockUseGameStateContext.mockReturnValue({ roundState: RoundState.BeforePlaceBet } as GameStateContextModel);

            const { container } = render(<SimpleTimer clientRemainingTime={0} gameId={gameId} />);

            expect(container.querySelector(".countdown-timer")).not.toBeInTheDocument();
        });

        test.each([
            [RoundState.InRound, 4, 0, "04"],
            [RoundState.LockingBet, 3, 1, "03"],
        ])(
            "renders timer with correct classes and formatted time when remainingTime > 0",
            (roundState, remainingTime, expectedLockBetClassLength, expectedTextContent) => {
                mockUseGameStateContext.mockReturnValue({ roundState } as GameStateContextModel);

                const simpleTimer = render(<SimpleTimer clientRemainingTime={remainingTime} gameId={gameId} />);

                expect(simpleTimer.container.querySelector(".timer")).toBeInTheDocument();
                expect(simpleTimer.container.querySelector(".countdown-timer")).toBeInTheDocument();
                expect(simpleTimer.container.querySelectorAll(".lock-bet").length).toBe(expectedLockBetClassLength);
                expect(simpleTimer.container.querySelector(".countdown-timer").textContent).toBe(expectedTextContent);
            }
        );

        test.each([
            [RoundState.LockingBet, 3],
            [RoundState.LockingBet, 2],
            [RoundState.LockingBet, 1],
        ])("play sound blockBet when RoundState is LockingBet", (roundState, remainingTime) => {
            // Arrange
            mockUseGameStateContext.mockReturnValue({ roundState } as GameStateContextModel);
            const soundBlockBetCountdown = jest.fn();
            mockSoundBlockBetCountdown.mockReturnValue(soundBlockBetCountdown);

            // Act
            const simpleTimer = render(<SimpleTimer clientRemainingTime={remainingTime} gameId={gameId} />);

            // Assert
            expect(simpleTimer.container.querySelector(".timer")).toBeInTheDocument();
            expect(simpleTimer.container.querySelector(".countdown-timer")).toBeInTheDocument();
            expect(soundBlockBetCountdown).toHaveBeenCalled();
        });
    });

    describe("GameStatus Component", () => {
        const MockGameStatusChildren = () => <div>test</div>;
        test("displays the turn counter text when turnCounter is greater than 0", () => {
            mockUseGameStateContext.mockReturnValue({ turnCounter: 1 } as GameStateContextModel);

            const screen = render(
                <GameStatus>
                    <MockGameStatusChildren />
                </GameStatus>
            );

            expect(screen.getByText("draw_1")).toBeInTheDocument();
        });

        test("does not display the turn counter text when turnCounter is 0", () => {
            mockUseGameStateContext.mockReturnValue({ turnCounter: 0 } as GameStateContextModel);

            const screen = render(
                <GameStatus>
                    <MockGameStatusChildren />
                </GameStatus>
            );

            expect(screen.queryByText(/draw_/)).not.toBeInTheDocument();
        });

        test("renders children content", () => {
            mockUseGameStateContext.mockReturnValue({ turnCounter: 1 } as GameStateContextModel);

            const childContent = "Test Child Content";
            const screen = render(<GameStatus>{childContent}</GameStatus>);
            expect(screen.getByText(childContent)).toBeInTheDocument();
        });
    });
});
