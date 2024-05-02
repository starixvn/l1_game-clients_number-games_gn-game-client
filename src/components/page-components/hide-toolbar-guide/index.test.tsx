import { fireEvent, render } from "@testing-library/react";
import * as reactDeviceDetect from "react-device-detect";
import ToolbarGuide from ".";
import { ResourceTypes } from "../../../_shared/resources";

jest.mock("../../../_shared/helpers", () => ({
    StorageHelper: {
        get: jest.fn(),
        set: jest.fn(),
    },
    localStorageKeys: {
        hideToolbarGuide: "hideToolbarGuide",
        currentSessionHideToolbarGuide: "currentSessionHideToolbarGuide",
        url: "url",
    },
}));

jest.mock("../../../_shared/react-hooks/use-translator", () => ({
    useTranslator: jest.fn().mockReturnValue({ t: (key: string) => key }),
}));

jest.mock("../../../_shared/react-hooks/use-sound", () => ({
    useClickSound: jest.fn().mockReturnValue(() => {}),
}));

global.window.innerHeight = 500;

describe("ToolbarGuide component", () => {
    describe("mobile + safari", () => {
        beforeEach(() => {
            Object.defineProperty(reactDeviceDetect, "isMobileOnly", { get: () => true });
            Object.defineProperty(reactDeviceDetect, "isSafari", { get: () => true });
        });

        afterAll(() => {
            jest.clearAllMocks();
        });

        test("renders correctly when enabled and on mobile", () => {
            // Act
            const { getByText } = render(<ToolbarGuide />);
            const closeButton = getByText(`${ResourceTypes.SABA_NUMBER}.button_close`);
            const doNotShowAgainButton = getByText(`${ResourceTypes.SABA_NUMBER}.button_donot_show`);

            // Assert
            expect(closeButton).toBeInTheDocument();
            expect(doNotShowAgainButton).toBeInTheDocument();
        });

        test("closes toolbar guide when close button is clicked", () => {
            // Act
            const { getByText, queryByText } = render(<ToolbarGuide />);
            const closeButton = getByText(`${ResourceTypes.SABA_NUMBER}.button_close`);
            fireEvent.click(closeButton);

            // Assert
            expect(queryByText(`${ResourceTypes.SABA_NUMBER}.button_close`)).toBeNull();
        });

        test('hides toolbar guide when "Do Not Show Again" button is clicked', () => {
            // Act
            const { getByText, queryByText } = render(<ToolbarGuide />);
            const doNotShowAgainButton = getByText(`${ResourceTypes.SABA_NUMBER}.button_donot_show`);
            fireEvent.click(doNotShowAgainButton);
            // Assert
            expect(queryByText(`${ResourceTypes.SABA_NUMBER}.button_donot_show`)).toBeNull();
        });

        test("should match the snapshot", () => {
            // Act
            const { container } = render(<ToolbarGuide />);

            // Assert
            expect(container).toMatchSnapshot();
        });
    });

    describe("Not mobile + safari", () => {
        afterAll(() => {
            jest.clearAllMocks();
        });

        test("should match the snapshot", () => {
            // Act
            const { container } = render(<ToolbarGuide />);

            // Assert
            expect(container).toMatchSnapshot();
        });
    });
});
