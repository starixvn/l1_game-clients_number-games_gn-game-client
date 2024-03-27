import { render, screen } from "@testing-library/react";
import { IBanner } from "../../page-components/dashboard/type";
import { BannerSwiper } from "./banner-swiper";

jest.mock("swiper/modules", () => ({
    Navigation: (_) => null,
    Pagination: (_) => null,
}));

jest.mock("swiper/react", () => ({
    Swiper: ({ children }) => <div data-testid="swiper-testid">{children}</div>,
    SwiperSlide: ({ children }) => <div data-testid="swiper-slide-testid">{children}</div>,
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
                        path: "/static/images/lobby/banners/1001/1001_en.png",
                    },
                    {
                        gameId: 1002,
                        displayTime: 5,
                        path: "/static/images/lobby/banners/1002/1002_en.png",
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
