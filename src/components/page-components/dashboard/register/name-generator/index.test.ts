import NameGenerator from ".";

describe(NameGenerator.name, () => {
    describe("validateName", () => {
        describe("when the name matches regex", () => {
            test.each([["123"], ["abc"], ["ABC"], ["01234567890123"]])("should return true", (name) => {
                // Act
                const actual = NameGenerator.validateName(name);

                // Assert
                expect(actual).toBeTruthy();
            });
        });

        describe("when the name doesn't matche regex", () => {
            test.each([[null], [undefined], ["12"], ["ab"], ["AB"], ["012345678901234"]])("should return false", (name) => {
                // Act
                const actual = NameGenerator.validateName(name);

                // Assert
                expect(actual).toBeFalsy();
            });
        });
    });

    describe("generateName", () => {
        it("should generate the valid name", () => {
            // Act
            const actual = NameGenerator.generateName();

            // Assert
            expect(NameGenerator.validateName(actual)).toBeTruthy();
        });
    });
});
