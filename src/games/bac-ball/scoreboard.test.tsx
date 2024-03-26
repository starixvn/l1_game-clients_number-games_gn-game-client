import { Scoreboard } from "./scoreboard";

jest.mock("../../components/page-components/translator", () => ({
    loadURLContext: jest.fn(),
    withTranslator: jest.fn(),
}));

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
