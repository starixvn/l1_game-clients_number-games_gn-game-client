import React from 'react';
import { render } from '@testing-library/react';
import { useGameStateContext } from '../../../../_shared/react-contexts/game-state-context/game-state-context';
import { RoundState } from '../../../game-base/type';
import { SimpleTimer } from '../countdown-timer';
import { GameStateContextModel } from '../../../../_shared/react-contexts/game-state-context/game-state-context-model';
const mockUseGameStateContext = useGameStateContext as jest.Mock;

jest.mock('../../../../_shared/react-contexts/game-state-context/game-state-context', () => ({
    useGameStateContext: jest.fn(),
}));

describe('SimpleTimer', () => {
    test('renders nothing when remainingTime is 0 or less', () => {
        mockUseGameStateContext.mockReturnValue({ roundState: RoundState.BeforePlaceBet, remainingTime: 0 } as GameStateContextModel<any, any>)

        const { container } = render(<SimpleTimer />);

        expect(container.querySelector('.countdown-timer')).not.toBeInTheDocument();
    });

    test('renders timer with correct classes and formatted time when remainingTime > 0 and roundState is LockingBet', () => {
        mockUseGameStateContext.mockReturnValue({ roundState: RoundState.LockingBet, remainingTime: 3 } as GameStateContextModel<any, any>)

        const { container } = render(<SimpleTimer />);

        expect(container.querySelector('.timer')).toBeInTheDocument();
        expect(container.querySelector('.countdown-timer')).toBeInTheDocument();
        expect(container.querySelector('.lock-bet')).toBeInTheDocument();
        expect(container.querySelector('.countdown-timer').textContent).toBe('03');
    });
});