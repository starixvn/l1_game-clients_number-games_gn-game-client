import { render } from "@testing-library/react";
import {
    BacBallBeadRoadCharacterElement,
    BacBallBeadRoadValueElement,
    BacBallBigEyeElement,
    BacBallBigRoadConverter,
    BacBallBigRoadElement,
    BacBallCockroachPigElement,
    BacBallSmallRoadElement,
} from "./scoreboard-elements";

describe(BacBallBeadRoadCharacterElement.name, () => {
    describe("render", () => {
        ["tie", "banker", "player", null].forEach((result) => {
            describe(`when the round result is ${result}`, () => {
                it("should match the snapshot", () => {
                    // Arrange
                    const round: any = result
                        ? {
                              settlementResult: {
                                  player: result === "player",
                                  banker: result === "banker",
                                  tie: result === "tie",
                              },
                          }
                        : null;

                    // Act
                    const { container } = render(<BacBallBeadRoadCharacterElement round={round} />);

                    // Assert
                    expect(container).toMatchSnapshot();
                });
            });
        });

        describe(`when the round result is blink node`, () => {
            it("should match the snapshot", () => {
                // Act
                const { container } = render(<BacBallBeadRoadCharacterElement round={{} as any} />);

                // Assert
                expect(container).toMatchSnapshot();
            });
        });
    });
});

describe(BacBallBeadRoadValueElement.name, () => {
    describe("render", () => {
        ["tie", "banker", "player", null].forEach((result) => {
            describe(`when the round result is ${result}`, () => {
                it("should match the snapshot", () => {
                    // Arrange
                    const round: any = result
                        ? {
                              settlementResult: {
                                  player: result === "player",
                                  banker: result === "banker",
                                  tie: result === "tie",
                              },
                              result: {
                                  player: 1,
                                  banker: 2,
                                  tie: 3,
                              },
                          }
                        : null;

                    // Act
                    const { container } = render(<BacBallBeadRoadValueElement round={round} />);

                    // Assert
                    expect(container).toMatchSnapshot();
                });
            });
        });

        describe(`when the round result is blink node`, () => {
            it("should match the snapshot", () => {
                // Act
                const { container } = render(<BacBallBeadRoadCharacterElement round={{} as any} />);

                // Assert
                expect(container).toMatchSnapshot();
            });
        });
    });
});

describe(BacBallBigRoadConverter.name, () => {
    describe("positiveKey", () => {
        it("should return banker", () => {
            // Act
            const actual = BacBallBigRoadConverter.instance["positiveKey"]();

            // Assert
            expect(actual).toBe("banker");
        });
    });

    describe("specialKey", () => {
        it("should return tie", () => {
            // Act
            const actual = BacBallBigRoadConverter.instance["specialKey"]();

            // Assert
            expect(actual).toBe("tie");
        });
    });

    describe("static addBlinkNode", () => {
        it("should add new node to the array", () => {
            // Arrange
            const rounds = [{ banker: true, player: false, tie: false, drawId: 1 }];

            // Act
            BacBallBigRoadConverter.addBlinkNode(rounds);

            // Assert
            expect(rounds).toStrictEqual([
                { banker: false, player: undefined, tie: undefined, drawId: 0 },
                { banker: true, player: false, tie: false, drawId: 1 },
            ]);
        });
    });
});

describe(BacBallBigRoadElement.name, () => {
    describe("render", () => {
        [
            {
                name: "banker only",
                round: { data: [{ banker: true, player: false, tie: false, drawId: 1 }] },
            },
            {
                name: "banker with single tie",
                round: {
                    data: [
                        { banker: true, player: false, tie: false, drawId: 1 },
                        { banker: false, player: false, tie: true, drawId: 2 },
                    ],
                },
            },
            {
                name: "banker with more tie",
                round: {
                    data: [
                        { banker: true, player: false, tie: false, drawId: 1 },
                        { banker: false, player: false, tie: true, drawId: 2 },
                        { banker: false, player: false, tie: true, drawId: 3 },
                    ],
                },
            },
            {
                name: "player only",
                round: { data: [{ banker: false, player: true, tie: false, drawId: 1 }] },
            },
            {
                name: "player with single tie",
                round: {
                    data: [
                        { banker: false, player: true, tie: false, drawId: 1 },
                        { banker: false, player: false, tie: true, drawId: 2 },
                    ],
                },
            },
            {
                name: "player with more tie",
                round: {
                    data: [
                        { banker: false, player: true, tie: false, drawId: 1 },
                        { banker: false, player: false, tie: true, drawId: 2 },
                        { banker: false, player: false, tie: true, drawId: 3 },
                    ],
                },
            },
            {
                name: "tie only",
                round: { data: [{ banker: false, player: false, tie: true, drawId: 1 }] },
            },
            {
                name: "multiple tie",
                round: {
                    data: [
                        { banker: false, player: false, tie: true, drawId: 1 },
                        { banker: false, player: false, tie: true, drawId: 2 },
                    ],
                },
            },
            {
                name: "blink node",
                round: {
                    data: [{ banker: false, player: undefined, tie: undefined, drawId: 0 }],
                },
            },
        ].forEach(({ name, round }) => {
            describe(`when the round result is ${name}`, () => {
                it("should match the snapshot", () => {
                    // Act
                    const { container } = render(<BacBallBigRoadElement round={round} />);

                    // Assert
                    expect(container).toMatchSnapshot();
                });
            });
        });
    });
});

describe(BacBallBigEyeElement.name, () => {
    describe("render", () => {
        test.each([[{ status: true }], [{ status: false }]])("should match the snapshot", (round: any) => {
            // Act
            const { container } = render(<BacBallBigEyeElement round={round} />);

            // Assert
            expect(container).toMatchSnapshot();
        });
    });
});

describe(BacBallSmallRoadElement.name, () => {
    describe("render", () => {
        test.each([[{ status: true }], [{ status: false }]])("should match the snapshot", (round: any) => {
            // Act
            const { container } = render(<BacBallSmallRoadElement round={round} />);

            // Assert
            expect(container).toMatchSnapshot();
        });
    });
});

describe(BacBallCockroachPigElement.name, () => {
    describe("render", () => {
        test.each([[{ status: true }], [{ status: false }]])("should match the snapshot", (round: any) => {
            // Act
            const { container } = render(<BacBallCockroachPigElement round={round} />);

            // Assert
            expect(container).toMatchSnapshot();
        });
    });
});
