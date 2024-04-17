import { render } from "@testing-library/react";
import { useSystemContext } from "../../../../_shared/react-contexts";
import { Chip } from "../chip";

jest.mock("../../../../_shared/react-contexts", () => ({ useSystemContext: jest.fn() }));

describe(Chip.name, () => {
    beforeAll(() => {
        (useSystemContext as jest.Mock).mockReturnValue({ selectedChip: 100 });
    });

    it("should render match the snapshot when chip < 1000", () => {
        // arrange
        const value = 100;
        const text = "100";
        const image = "#000123";

        // act
        const { container } = render(<Chip image={image} onClickChip={null} text={text} value={value} />);

        // assert
        expect(container).toMatchSnapshot();
        expect(container.textContent).toBe(text);
    });

    it("should render match the snapshot when chip > 1000 & text is empty", () => {
        // arrange
        const value = 2000;
        const text = "";
        const image = "#000123";

        // act
        const { container } = render(<Chip image={image} onClickChip={null} text={text} value={value} />);

        // assert
        expect(container).toMatchSnapshot();
        expect(container.textContent).toBe("2K");
    });

    it("should call onClickChip when click on chip", () => {
        // arrange
        const value = 100;
        const text = "100";
        const image = "#000123";
        const onClickChip = jest.fn();
        const { container } = render(<Chip image={image} onClickChip={onClickChip} text={text} value={value} />);

        // act
        (container.children[0] as any).click();

        // assert
        expect(onClickChip).toHaveBeenCalled();
    });
});
