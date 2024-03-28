import { fireEvent, render, screen } from "@testing-library/react";
import BetDetailBase from "../bet-detail-base";
import React from "react";
import { useGameStateContext, useGameStatesDispatch } from "../../../../_shared/react-contexts/game-state-context/game-state-context";
import { useClickSound } from "../../../../_shared/react-hooks";

const mockUseGameStateContext = useGameStateContext as jest.Mock;
const mockDispatch = useGameStatesDispatch as jest.Mock;
const mockSound = useClickSound as jest.Mock;

String.prototype.capitalizeFirstLetter = function () {
    return this;
};

jest.mock("../../../../_shared/react-contexts/game-state-context/game-state-context", () => ({
    useGameStateContext: jest.fn(),
    useGameStatesDispatch: jest.fn(),
}));

jest.mock("../../../../_shared/react-hooks", () => ({
    useClickSound: jest.fn(),
    useCommonTranslate: jest.fn().mockReturnValue({ t: (key: string) => key }),
    useTranslator: jest.fn().mockReturnValue({ t: (key: string) => key }),
    useSNTranslate: jest.fn().mockReturnValue({ t: (key: string) => key }),
}));

describe(BetDetailBase.name, () => {
    describe("render", () => {
        describe("have draw result", () => {
            test("should render bet log result", () => {
                const state: any = {
                    betDetailModalData: {
                        drawInfo: {
                            result: 1,
                        },
                        betLogDetails: [],
                    },
                };
                mockUseGameStateContext.mockReturnValue(state);
                const renderBetDetailResultBlock = jest.fn();

                render(<BetDetailBase renderBetDetailResultBlock={renderBetDetailResultBlock} produceDataBetDetailRow={jest.fn()} />);

                expect(renderBetDetailResultBlock).toHaveBeenCalled();
            });
        });
        describe("have no draw result", () => {
            test("should render bet log result", () => {
                const state: any = {
                    betDetailModalData: {
                        drawInfo: {},
                        betLogDetails: [],
                    },
                };
                mockUseGameStateContext.mockReturnValue(state);
                const renderBetDetailResultBlock = jest.fn();

                render(<BetDetailBase renderBetDetailResultBlock={renderBetDetailResultBlock} produceDataBetDetailRow={jest.fn()} />);

                expect(renderBetDetailResultBlock).toHaveBeenCalledTimes(0);
            });
        });
        describe("have bet log details", () => {
            describe("when highlight true", () => {
                test("cell win should highlight", () => {
                    const state: any = {
                        betDetailModalData: {
                            drawInfo: {},
                            betLogDetails: [1],
                        },
                    };
                    mockUseGameStateContext.mockReturnValue(state);
                    const produceDataBetDetailRow = jest.fn().mockReturnValue({
                        rawTime: new Date(),
                        amount: 1,
                        choice: "player",
                        odds: 1.96,
                        win: 2,
                        hightlight: true,
                    });

                    render(<BetDetailBase renderBetDetailResultBlock={jest.fn()} produceDataBetDetailRow={produceDataBetDetailRow} />);

                    expect(screen.getAllByText("2")[0].classList.contains("highlight")).toBe(true);
                });
            });
            describe("when highlight false", () => {
                test("cell win should not highlight", () => {
                    const state: any = {
                        betDetailModalData: {
                            drawInfo: {},
                            betLogDetails: [1],
                        },
                    };
                    mockUseGameStateContext.mockReturnValue(state);
                    const produceDataBetDetailRow = jest.fn().mockReturnValue({
                        rawTime: new Date(),
                        amount: 1,
                        choice: "player",
                        odds: 1.96,
                        win: 2,
                        hightlight: false,
                    });

                    render(<BetDetailBase renderBetDetailResultBlock={jest.fn()} produceDataBetDetailRow={produceDataBetDetailRow} />);

                    expect(screen.getAllByText("2")[0].classList.contains("highlight")).toBe(false);
                });
            });
        });
    });
    describe("click provably fair", () => {
        test("should call dispatch", () => {
            const state: any = {
                betDetailModalData: {
                    drawInfo: {},
                    betLogDetails: [],
                },
            };
            mockUseGameStateContext.mockReturnValueOnce(state);
            const dispatch = jest.fn();
            mockDispatch.mockReturnValue(dispatch);
            const clickSound = jest.fn();
            mockSound.mockReturnValue(clickSound);
            const renderBetDetailResultBlock = jest.fn();

            render(<BetDetailBase renderBetDetailResultBlock={renderBetDetailResultBlock} produceDataBetDetailRow={jest.fn()} />);

            const button = screen.getAllByRole("button")[0];
            fireEvent.click(button);

            expect(dispatch).toHaveBeenCalled();
            expect(clickSound).toHaveBeenCalled();
        });
    });
});
