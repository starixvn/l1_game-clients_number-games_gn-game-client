import { render } from "@testing-library/react";

import { GameIcon } from "../../../games/components/game-icon";
import OnlinePlayer from "../../../games/components/online-player";

jest.mock("../../../games/components/online-player", () => jest.fn().mockReturnValue("OnlinePlayer"));
jest.mock("../../../../../../_shared/constants", () => ({ buildVersion: 1 }));
jest.mock("../../../games/components/lobby-constant", () => ({ LobbyImagesData: { 1001: "abc" } }));
describe(GameIcon.name, () => {
    const gameSettings = { gameName: "gameA" } as any;
    const transmitter = {} as any;

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should render match with snapshot", () => {
        // act
        const { container } = render(<GameIcon gameSettings={gameSettings} transmitter={transmitter} />);

        // assert
        expect(container).toMatchSnapshot();
    });

    it("should call OnlinePlayer component with expected props", () => {
        // act
        render(<GameIcon gameSettings={gameSettings} transmitter={transmitter} />);

        // assert
        expect(OnlinePlayer).toHaveBeenCalledWith({ transmitter }, {});
    });
});
