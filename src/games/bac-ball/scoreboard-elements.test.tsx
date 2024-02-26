import { render } from "@testing-library/react";
import { BacBallBeadRoadCharacterElement, BacBallBeadRoadValueElement } from "./scoreboard-elements";

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
    });
});
