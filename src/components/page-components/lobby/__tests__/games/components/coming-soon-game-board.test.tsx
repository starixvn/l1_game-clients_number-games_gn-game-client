import { render } from "@testing-library/react";
import { ComingSoonGameBoard } from "../../../games/components/coming-soon-game-board";
import { GameIcon } from "../../../games/components/game-icon";
jest.mock("../../../../../../_shared/react-hooks/use-translator", () => ({
    useTranslator: jest.fn().mockReturnValue({ t: jest.fn((key) => key) }),
}));
jest.mock("../../../../../../_shared/resources", () => ({
    ResourceTypes: { SABA_NUMBER: "SabaNumber" },
}));
jest.mock("../../../games/components/game-icon", () => ({ GameIcon: jest.fn().mockReturnValue("") }));

describe(ComingSoonGameBoard.name, () => {
    it("should render match snapshot", () => {
        // arrange
        const gameSettings = { gameName: "gameA" } as any;

        // act
        const { container } = render(<ComingSoonGameBoard gameSettings={gameSettings} />);

        // assert
        expect(container).toMatchSnapshot();
        expect(GameIcon).toHaveBeenCalledWith({ gameSettings }, {});
        expect(container.textContent).toBe("SabaNumber.lobby_game_icon");
    });
});
