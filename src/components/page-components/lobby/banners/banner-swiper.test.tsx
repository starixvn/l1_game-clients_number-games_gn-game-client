import { render, screen } from "@testing-library/react";

import { IBanner } from "../../dashboard/type";
import { BannerSwiper } from "./banner-swiper";

jest.mock("../../../_shared/helpers", () => ({
    AnalyticsHelper: { trackFunction: jest.fn() },
    TrackingFunction: jest.fn(),
    TrackingAction: jest.fn(),
}));

describe(BannerSwiper.name, () => {
    let banners: IBanner[];

    describe("render", () => {
        describe("with normal banner", () => {
            it("should match the snapshot", () => {
                // Act
                banners = [
                    {
                        gameId: 1001,
                        displayTime: 10,
                        path: "/static/images/lobby/banners/1001/1001_en.webp",
                    },
                    {
                        gameId: 1002,
                        displayTime: 5,
                        path: "/static/images/lobby/banners/1002/1002_en.webp",
                    },
                ];
                const { container } = render(<BannerSwiper openGame={jest.fn()} banners={banners} />);
                const swiper = screen.getAllByTestId("swiper-testid");
                const slides = screen.getAllByTestId("swiper-slide-testid");

                // Assert
                expect(container).toMatchSnapshot();
                expect(swiper.length).toBe(1);
                expect(slides.length).toBe(2);
            });
        });

        describe("with banner empty", () => {
            it("should match the snapshot", () => {
                // Act
                banners = [];
                const { container, queryByTestId } = render(<BannerSwiper openGame={jest.fn()} banners={banners} />);
                const swiper = screen.getAllByTestId("swiper-testid");
                const element = queryByTestId("swiper-slide-testid");

                // Assert
                expect(container).toMatchSnapshot();
                expect(swiper.length).toBe(1);
                expect(element).toBeNull();
            });
        });
    });
});
