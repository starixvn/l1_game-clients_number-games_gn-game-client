import { fireEvent, render } from "@testing-library/react";
import * as reactDeviceDetect from "react-device-detect";
import SwitchGamesGuide from ".";
import { ResourceTypes } from "../../../_shared/resources";

jest.mock("../../../_shared/helpers", () => ({
    StorageHelper: {
        get: jest.fn(),
        set: jest.fn(),
    },
    localStorageKeys: {
        hideSwitchGameGuide: "hideSwitchGameGuide",
        currentSessionSwitchGameGuide: "currentSessionSwitchGameGuide",
        url: "url",
    },
}));

jest.mock("../../../_shared/react-hooks/use-translator", () => ({
    useTranslator: jest.fn().mockReturnValue({ t: (key: string) => key }),
}));

jest.mock("../../../_shared/react-hooks/use-sound", () => ({
    useClickSound: jest.fn().mockReturnValue(() => {}),
}));

describe("SwitchGamesGuide component", () => {
    describe("mobile", () => {
        beforeEach(() => {
            Object.defineProperty(reactDeviceDetect, "isMobileOnly", { get: () => true });
        });

        afterAll(() => {
            jest.clearAllMocks();
        });

        test("renders correctly when enabled and on mobile", () => {
            // Act
            const { getByText } = render(<SwitchGamesGuide />);
            const closeButton = getByText(`${ResourceTypes.SABA_NUMBER}.button_close`);
            const doNotShowAgainButton = getByText(`${ResourceTypes.SABA_NUMBER}.button_donot_show`);

            // Assert
            expect(closeButton).toBeInTheDocument();
            expect(doNotShowAgainButton).toBeInTheDocument();
        });

        test("closes toolbar guide when close button is clicked", () => {
            // Act
            const { getByText, queryByText } = render(<SwitchGamesGuide />);
            const closeButton = getByText(`${ResourceTypes.SABA_NUMBER}.button_close`);
            fireEvent.click(closeButton);

            // Assert
            expect(queryByText(`${ResourceTypes.SABA_NUMBER}.button_close`)).toBeNull();
        });

        test('hides toolbar guide when "Do Not Show Again" button is clicked', () => {
            // Act
            const { getByText, queryByText } = render(<SwitchGamesGuide />);
            const doNotShowAgainButton = getByText(`${ResourceTypes.SABA_NUMBER}.button_donot_show`);
            fireEvent.click(doNotShowAgainButton);
            // Assert
            expect(queryByText(`${ResourceTypes.SABA_NUMBER}.button_donot_show`)).toBeNull();
        });

        test("should match the snapshot", () => {
            // Act
            const { container } = render(<SwitchGamesGuide />);

            // Assert
            expect(container).toMatchSnapshot();
        });
    });

    describe("Not mobile", () => {
        afterAll(() => {
            jest.clearAllMocks();
        });

        test("should match the snapshot", () => {
            // Act
            const { container } = render(<SwitchGamesGuide />);

            // Assert
            expect(container).toMatchSnapshot();
        });
    });
});
