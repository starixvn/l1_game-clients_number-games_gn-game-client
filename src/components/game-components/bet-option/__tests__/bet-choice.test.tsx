import { render } from "@testing-library/react";
import BetChoice from "../bet-choice";

jest.mock("../../../../_shared/helpers", () => ({ getGlossaryTranslate: jest.fn((ns, key) => `${ns}.glossary_${key}`) }));
jest.mock("../../../../_shared/react-hooks/use-translator", () => ({
    useTranslator: jest.fn().mockReturnValue({ t: jest.fn((key) => key) }),
}));

describe(BetChoice.name, () => {
    it("should render match the snapshot", () => {
        // act
        const { container } = render(<BetChoice tolgeeNamespace="gameA" className="bet-choice" choice="choice1" />);

        // assert
        expect(container).toMatchSnapshot();
        expect(container.textContent).toBe("gameA.glossary_choice1");
    });
});
