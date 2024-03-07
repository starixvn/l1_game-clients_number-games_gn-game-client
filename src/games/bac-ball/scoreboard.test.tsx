import { Scoreboard } from "./scoreboard";

describe(Scoreboard.name, () => {
    describe("onSwitchBigRoad", () => {
        it("should modify class name", () => {
            // Arrange
            const component = new Scoreboard({ roundHistory: [], isShowBlink: false });

            // Act
            const actual = component.onSwitchBigRoad({ className: "old" });

            // Assert
            expect(actual).toStrictEqual({ className: "old scoreboard-expand" });
        });
    });
});
