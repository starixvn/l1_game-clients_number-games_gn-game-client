import { render } from "@testing-library/react";
import { ConfirmDialog } from ".";

jest.mock("../../../_shared/react-hooks", () => ({
    useTranslator: jest.fn().mockReturnValue({ t: (key: string) => key }),
    useSNTranslate: jest.fn().mockReturnValue({ t: (key: string) => key }),
    useClickSound: jest.fn(),
}));

describe(ConfirmDialog.name, () => {
    describe("render", () => {
        describe("with normal case", () => {
            it("should match the snapshot", () => {
                // Act
                const { container, getByTestId } = render(<ConfirmDialog title={"title"} content={"content"} subContent={"sub content"} />);
                const yesButton = getByTestId("btn-yes-summit-dialog");
                const noButton = getByTestId("btn-no-summit-dialog");

                // Assert
                expect(container).toMatchSnapshot();
                expect(noButton).toBeInTheDocument();
                expect(yesButton).toBeInTheDocument();
            });
        });
    });
});
