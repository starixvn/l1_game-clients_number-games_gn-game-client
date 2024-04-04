import { render } from "@testing-library/react";
import { useGameStatesDispatch } from "../../../../_shared/react-contexts/game-state-context/game-state-context";
import BetHistoryBase from "../bet-history-base";
import { numberWithCommas, separateDateTime, sortedCollectionByTime } from "../../../../_shared/helpers";
import { useGameContext } from "../../../../_shared/react-contexts";

const mockDispatch = useGameStatesDispatch as jest.Mock;
const mockSortedCollectionByTime = sortedCollectionByTime as jest.Mock;
const mockNumberWithCommas = numberWithCommas as jest.Mock;
const mockSeparateDateTime = separateDateTime as jest.Mock;
const mockGameContext = useGameContext as jest.Mock;

String.prototype.capitalizeFirstLetter = function () {
    return this;
};

jest.mock("../../../../_shared/react-contexts", () => ({
    useGameContext: jest.fn(),
}));

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
        describe("when init", () => {
            it("should call broadcastGameEvent", () => {
                mockDispatch.mockReturnValue(jest.fn());
                const gameMessageHandler = {
                    broadcastGameEvent: jest.fn(),
                    register: jest.fn(),
                    removeHandler: jest.fn(),
                };
                mockGameContext.mockReturnValue({ gameMessageHandler });

                render(<BetHistoryBase renderBetLogResult={jest.fn()} />);

                expect(gameMessageHandler.broadcastGameEvent).toHaveBeenCalled();
            });
        });
    });
});
