import React from 'react';
import { render, screen } from '@testing-library/react';
import { useGameStateContext } from '../../../../_shared/react-contexts/game-state-context/game-state-context';
import { RoundState } from '../../../game-base/type';
import CountdownTimer, { GameStatus, SimpleTimer } from '../countdown-timer';
import { GameStateContextModel } from '../../../../_shared/react-contexts/game-state-context/game-state-context-model';

const mockUseGameStateContext = useGameStateContext as jest.Mock;

jest.mock('../../../../_shared/react-contexts/game-state-context/game-state-context', () => ({
    useGameStateContext: jest.fn()
}));

jest.mock('../../../../_shared/react-hooks/use-translator', () => ({
    useSNTranslate: jest.fn().mockReturnValue({ t: (key: string) => key })
}));

describe('CountdownTimer', () => {
    const MockSimpleTimer = () => <div className="simple-timer"></div>;
    const MockGameStatus = () => <div className="game-status"></div>;

    test('renders SimpleTimer and GameStatus for InRound state', () => {
        mockUseGameStateContext.mockReturnValue({ roundState: RoundState.InRound } as GameStateContextModel);

        const { container } = render(<CountdownTimer SimpleTimerProp={MockSimpleTimer} GameStatusProp={MockGameStatus} />);

        expect(container.querySelector('.simple-timer')).toBeInTheDocument();
        expect(container.querySelector('.start-betting')).toBeInTheDocument();
        expect(container.querySelector('.status_stop_bet')).not.toBeInTheDocument();
        expect(container.querySelector('.status_result')).not.toBeInTheDocument();
        expect(container.querySelector('.loader-show-result')).not.toBeInTheDocument();
        expect(container.querySelector('.game-status')).toBeInTheDocument();
    });

    test('only renders loading show result and GameStatus for DisplayResult state', () => {
        mockUseGameStateContext.mockReturnValue({ roundState: RoundState.DisplayResult } as GameStateContextModel);

        const { container } = render(<CountdownTimer SimpleTimerProp={MockSimpleTimer} GameStatusProp={MockGameStatus} />);

        expect(container.querySelector('.simple-timer')).not.toBeInTheDocument();
        expect(container.querySelector('.start-betting')).not.toBeInTheDocument();
        expect(container.querySelector('.status_stop_bet')).not.toBeInTheDocument();
        expect(container.querySelector('.status_result')).not.toBeInTheDocument();
        expect(container.querySelector('.loader-show-result')).toBeInTheDocument();
        expect(container.querySelector('.game-status')).toBeInTheDocument();
    });

    test('only renders loading show result for None state', () => {
        mockUseGameStateContext.mockReturnValue({ roundState: RoundState.None } as GameStateContextModel);

        const { container } = render(<CountdownTimer SimpleTimerProp={MockSimpleTimer} GameStatusProp={MockGameStatus} />);

        expect(container.querySelector('.simple-timer')).not.toBeInTheDocument();
        expect(container.querySelector('.start-betting')).not.toBeInTheDocument();
        expect(container.querySelector('.status_stop_bet')).not.toBeInTheDocument();
        expect(container.querySelector('.status_result')).not.toBeInTheDocument();
        expect(container.querySelector('.loader-show-result')).toBeInTheDocument();
        expect(container.querySelector('.game-status')).not.toBeInTheDocument();
    });


    test.each([RoundState.BeforePlaceBet, RoundState.SwitchRound, RoundState.ConnectFailed, RoundState.Disabled])
        ("renders nothing for BeforePlaceBet or SwitchRound or ConnectFailed or Disabled state", (roundState) => {

            mockUseGameStateContext.mockReturnValue({ roundState } as GameStateContextModel);

            const { container } = render(<CountdownTimer SimpleTimerProp={MockSimpleTimer} />);

            expect(container.querySelector('.simple-timer')).not.toBeInTheDocument();
            expect(container.querySelector('.start-betting')).not.toBeInTheDocument();
            expect(container.querySelector('.status_stop_bet')).not.toBeInTheDocument();
            expect(container.querySelector('.status_result')).not.toBeInTheDocument();
            expect(container.querySelector('.loader-show-result')).not.toBeInTheDocument();
            expect(container.querySelector('.game-status')).not.toBeInTheDocument();
        });

});

describe('SimpleTimer', () => {
    test('renders nothing when remainingTime is 0 or less', () => {
        mockUseGameStateContext.mockReturnValue({ roundState: RoundState.BeforePlaceBet, remainingTime: 0 } as GameStateContextModel)

        const { container } = render(<SimpleTimer />);

        expect(container.querySelector('.countdown-timer')).not.toBeInTheDocument();
    });

    test.each([[RoundState.InRound, 4, 0, '04'], [RoundState.LockingBet, 3, 1, '03']])
        ("renders timer with correct classes and formatted time when remainingTime > 0", (
            roundState, remainingTime, expectedLockBetClassLength, expectedTextContent) => {
            mockUseGameStateContext.mockReturnValue({ roundState, remainingTime } as GameStateContextModel);

            const { container } = render(<SimpleTimer />);

            expect(container.querySelector('.timer')).toBeInTheDocument();
            expect(container.querySelector('.countdown-timer')).toBeInTheDocument();
            // expect(container.querySelectorAll('.lock-bet').length).toBe(expectedLockBetClassLength);
            expect(container.querySelector('.countdown-timer').textContent).toBe(expectedTextContent);
        });
});

describe('GameStatus', () => {
    const MockGameStatusChildren = () => <div>test</div>;
    test('displays the turn counter text when turnCounter is greater than 0', () => {
        mockUseGameStateContext.mockReturnValue({ turnCounter: 1 } as GameStateContextModel)

        const screen = render(<GameStatus><MockGameStatusChildren /></GameStatus>);

        expect(screen.getByText('draw_1')).toBeInTheDocument();
    });

    test('does not display the turn counter text when turnCounter is 0', () => {
        mockUseGameStateContext.mockReturnValue({ turnCounter: 0 } as GameStateContextModel)

        const screen = render(<GameStatus><MockGameStatusChildren /></GameStatus>);

        expect(screen.queryByText(/draw_/)).not.toBeInTheDocument();
    });

    test('renders children content', () => {
        const childContent = 'Test Child Content';
        render(<GameStatus>{childContent}</GameStatus>);
        expect(screen.getByText(childContent)).toBeInTheDocument();
    });
});
