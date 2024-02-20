import React, { useEffect, useState } from "react";
import { isMobileOnly } from "react-device-detect";
import Slider from "react-slick";
import useSound from "use-sound";
import { ChipLabelMapper, ChipMapper, ChipValuesBySystem as ChipValues, systemName } from "../../../../_shared/constants";
import { StorageHelper, localStorageKeys } from "../../../../_shared/helpers";
import { GameEventActionType } from "../../../../_shared/react-contexts/game-state-context/game-event-action";
import { useGameStateContext, useGameStatesDispatch } from "../../../../_shared/react-contexts/game-state-context/game-state-context";
import Styles from "./chip-slider.module.scss";

const SlidingTimeInMillisecond = 100;
let isSwipe = true;

export const ChipSlider: React.FC<{}> = () => {
    const gameStateContext = useGameStateContext();
    const dispatch = useGameStatesDispatch();
    const enabledSound = StorageHelper.get(localStorageKeys.playSound) ?? false;
    const { enabledQuickBet } = gameStateContext;
    const [enabledPrevBtn, setEnabledPrevBtn] = useState(false);
    const [enabledNextBtn, setEnabledNextBtn] = useState(true);
    const [selectedChip, setSelectedChip] = useState(gameStateContext.selectedChip);
    const [isSliding, setIsSliding] = useState(false);
    let sliderRef = null;
    const [playSound] = useSound("./static/sounds/chip-click.mp3");

    const onClickChip = (chipValue: number) => {
        if (!isMobileOnly) {
            const chipIndex = ChipValues.indexOf(chipValue);
            const currentSlideToShow = getCurrentSlidesToShow();
            const currentSlide = sliderRef.innerSlider.state.currentSlide;

            if (chipIndex + 1 - currentSlideToShow >= currentSlide) {
                disableSelectChipWhenSliding();
                isSwipe = false;
                sliderRef.slickGoTo(chipIndex + 2 - currentSlideToShow);
            }

            if (chipIndex - 1 <= currentSlide) {
                disableSelectChipWhenSliding();
                isSwipe = false;
                sliderRef.slickGoTo(chipIndex - 1);
            }
        }

        handleSelectChip(chipValue);
    };

    const handleSelectChip = (chipValue: number) => {
        setSelectedChip(chipValue);
        updateArrowsByChipValue(chipValue);
        dispatch({
            type: GameEventActionType.SET_SELECT_CHIP,
            payload: {
                selectedChip: chipValue,
            },
        });
        enabledSound && playSound();
    };

    const getCurrentSlidesToShow = () => {
        const currentBreakPoint = sliderRef.state.breakpoint;
        const sliderResponsiveSettings = sliderRef.props.responsive;
        const currentResponsiveSettings = sliderResponsiveSettings.find((settings) => settings.breakpoint === currentBreakPoint);

        return currentResponsiveSettings?.settings?.slidesToShow ?? sliderRef.props.slidesToShow;
    };

    const updateArrowsByChipValue = (chipValue: number) => {
        const chipIndex = ChipValues.indexOf(chipValue);

        chipIndex === 0 ? setEnabledPrevBtn(false) : setEnabledPrevBtn(true);
        chipIndex === ChipValues.length - 1 ? setEnabledNextBtn(false) : setEnabledNextBtn(true);
    };

    const disableSelectChipWhenSliding = () => {
        setIsSliding(true);

        const slidingTimeOut = setTimeout(() => {
            setIsSliding(false);
            clearTimeout(slidingTimeOut);
        }, SlidingTimeInMillisecond);
    };

    const onClickNext = () => {
        if (enabledNextBtn && !isSliding) {
            const chipIndex = ChipValues.indexOf(selectedChip);
            const newSelectedChip = ChipValues[chipIndex + 1];
            const currentSlideToShow = getCurrentSlidesToShow();

            isSwipe = false;
            sliderRef.slickGoTo(chipIndex + 3 - currentSlideToShow);
            handleSelectChip(newSelectedChip);
            disableSelectChipWhenSliding();
        }
    };

    const onClickPrev = () => {
        if (enabledPrevBtn && !isSliding) {
            const chipIndex = ChipValues.indexOf(selectedChip);
            const newSelectedChip = ChipValues[chipIndex - 1];

            isSwipe = false;
            sliderRef.slickGoTo(chipIndex - 2);
            handleSelectChip(newSelectedChip);
            disableSelectChipWhenSliding();
        }
    };

    useEffect(() => {
        if (sliderRef) {
            isSwipe = false;
            const chipIndex = ChipValues.indexOf(selectedChip);
            sliderRef.slickGoTo(chipIndex);
            updateArrowsByChipValue(selectedChip);
        }
    }, []);

    const SliderSetting = {
        speed: SlidingTimeInMillisecond,
        infinite: false,
        adaptiveHeight: true,
        swipeToSlide: true,
        slidesToShow: 5,
        arrows: false,
        onSwipe: () => {
            isSwipe = true;
        },
        beforeChange: (oldIndex: number, newIndex: number) => {
            if (isSwipe) {
                const currentSlideToShow = getCurrentSlidesToShow();

                oldIndex > newIndex && handleSelectChip(ChipValues[newIndex + currentSlideToShow - 1]);
                oldIndex < newIndex && handleSelectChip(ChipValues[newIndex]);
            }
        },
        responsive: [
            {
                breakpoint: 1279,
                settings: {
                    slidesToShow: 5,
                },
            },
            {
                breakpoint: 1023,
                settings: {
                    slidesToShow: 5,
                },
            },
            {
                breakpoint: 767,
                settings: {
                    slidesToShow: 5,
                },
            },
        ],
    };

    return (
        <React.Fragment>
            <span
                className={`${Styles["icon-prev"]} ${!enabledPrevBtn && Styles["disabled"]} ${enabledQuickBet ? Styles["quick-bet"] : ""}`}
                onClick={onClickPrev}
            ></span>
            <Slider
                ref={(c) => {
                    sliderRef = c;
                }}
                {...SliderSetting}
            >
                {ChipValues.map((value) => (
                    <div
                        key={value}
                        className={`${Styles["chip-container"]} ${selectedChip === value ? Styles["selected"] : ""} ${
                            enabledQuickBet ? Styles["enabled-quick-bet"] : ""
                        } ${Styles[ChipMapper[systemName][value]]} ${Styles[systemName]}`}
                        onClick={() => onClickChip(value)}
                    >
                        <img
                            src={`/static/images/chips/${systemName}/${ChipMapper[systemName][value]}.svg`}
                            className={`img-fluid ${Styles["chip"]}`}
                            width="60"
                            height="62"
                            alt="Chip"
                        />
                        <span className={Styles["value"]}>{ChipLabelMapper[systemName][value]}</span>
                    </div>
                ))}
            </Slider>
            <span
                className={`${Styles["icon-next"]} ${!enabledNextBtn && Styles["disabled"]} ${enabledQuickBet ? Styles["quick-bet"] : ""}`}
                onClick={onClickNext}
            ></span>
        </React.Fragment>
    );
};
