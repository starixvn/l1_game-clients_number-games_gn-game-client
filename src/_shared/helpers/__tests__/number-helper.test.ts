import { roundToTwoDecimals } from "../number-helper";

describe("roundToTwoDecimals", () => {
    test("should round numbers to 2 decimal places", () => {
        expect(roundToTwoDecimals(1.234)).toBe(1.23);
        expect(roundToTwoDecimals(1.235)).toBe(1.24);
        expect(roundToTwoDecimals(10.556)).toBe(10.56);
    });

    test("should handle whole numbers", () => {
        expect(roundToTwoDecimals(100)).toBe(100);
        expect(roundToTwoDecimals(0)).toBe(0);
    });

    test("should handle null and undefined", () => {
        expect(roundToTwoDecimals(null as any)).toBe(0);
        expect(roundToTwoDecimals(undefined as any)).toBe(0);
    });

    test("should handle negative numbers", () => {
        expect(roundToTwoDecimals(-1.234)).toBe(-1.23);
        expect(roundToTwoDecimals(-1.235)).toBe(-1.24);
    });
}); 