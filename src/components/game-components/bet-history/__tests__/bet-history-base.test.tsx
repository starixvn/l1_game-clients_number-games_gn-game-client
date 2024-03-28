import { render, screen } from "@testing-library/react";
import { useGameStatesDispatch } from "../../../../_shared/react-contexts/game-state-context/game-state-context";
import { useClickSound } from "../../../../_shared/react-hooks";
import BetHistoryBase from "../bet-history-base";
import { numberWithCommas, separateDateTime, sortedCollectionByTime } from "../../../../_shared/helpers";

const mockDispatch = useGameStatesDispatch as jest.Mock;
const mockSound = useClickSound as jest.Mock;
const mockSortedCollectionByTime = sortedCollectionByTime as jest.Mock;
const mockNumberWithCommas = numberWithCommas as jest.Mock;
const mockSeparateDateTime = separateDateTime as jest.Mock;

String.prototype.capitalizeFirstLetter = function () {
    return this;
};

jest.mock("../../../../_shared/react-contexts/game-state-context/game-state-context", () => ({
    useGameStatesDispatch: jest.fn(),
    useGameStateContext: jest.fn(),
}));

jest.mock("../../../../_shared/react-hooks", () => ({
    useClickSound: jest.fn(),
    useCommonTranslate: jest.fn().mockReturnValue({ t: (key: string) => key }),
    useSNTranslate: jest.fn().mockReturnValue({ t: (key: string) => key }),
}));

jest.mock("../../../../_shared/helpers", () => ({
    numberWithCommas: jest.fn(),
    separateDateTime: jest.fn(),
    sortedCollectionByTime: jest.fn(),
}));

beforeAll(() => {
    mockNumberWithCommas.mockImplementation((x) => x);
    mockSeparateDateTime.mockImplementation((x) => x);
    mockSortedCollectionByTime.mockImplementation((x) => x);
});

describe(BetHistoryBase.name, () => {
    describe("render", () => {
        describe("highlight when win > 0", () => {
            test.each([
                [1, true],
                [0, false],
            ])("win is %p expect it highlight is %p", (win: number, expected: boolean) => {
                mockDispatch.mockReturnValue(jest.fn());

                render(
                    <BetHistoryBase
                        betLogs={[{ drawId: 3, result: { time: new Date() }, totalAmount: 2, betwin: win, time: new Date() }]}
                        handleScroll={jest.fn()}
                        isLoadMore={false}
                        renderBetLogResult={jest.fn()}
                    />
                );

                expect(screen.getAllByText(`${win}`)[0].classList.contains("highlight")).toBe(expected);
            });
        });
    });
});
