import React, { useEffect, useMemo, useState } from "react";
import { isMobileOnly } from "react-device-detect";
import Slider from "react-slick";
import useSound from "use-sound";
import { StorageHelper, localStorageKeys } from "../../../_shared/helpers";
import { useGameStateContext } from "../../../_shared/react-contexts/game-state-context/game-state-context";
import Styles from "./chip-slider.module.scss";
import { Chip } from "./chip";
import { SystemEventActionType, useSystemContext, useSystemDispatch } from "../../../_shared/react-contexts";

const SlidingTimeInMillisecond = 100;
const slidesToShow = 5;
let isSwipe = true;

export const ChipSlider: React.FC<{}> = () => {
    const gameStateContext = useGameStateContext();
    const systemContext = useSystemContext();
    const dispatch = useSystemDispatch();
    const enabledSound = StorageHelper.get(localStorageKeys.playSound) ?? false;
    const { enabledQuickBet, gameConfigs, userStakeLevel } = gameStateContext;
    const { selectedChip } = systemContext;
    const [enabledPrevBtn, setEnabledPrevBtn] = useState(false);
    const [enabledNextBtn, setEnabledNextBtn] = useState(true);

    const [isSliding, setIsSliding] = useState(false);
    let sliderRef = null;
    const [playSound] = useSound("./static/sounds/chip-click.mp3");
    const chipValues = useMemo(() => {
        const maxBet = Math.min(userStakeLevel.maxBet, gameConfigs.maxBet);
        const minBet = Math.max(userStakeLevel.minBet, gameConfigs.minBet);
        return gameConfigs.chips?.map((chip) => +chip).filter((value) => value >= minBet && value <= maxBet) || [];
    }, [gameConfigs.maxBet, gameConfigs.minBet, gameConfigs.chips, userStakeLevel]);

    const onClickChip = (chipValue: number) => {
        if (!isMobileOnly) {
            const chipIndex = chipValues.indexOf(chipValue);
            const currentSlide = sliderRef.innerSlider.state.currentSlide;

            if (chipIndex + 1 - slidesToShow >= currentSlide) {
                disableSelectChipWhenSliding();
                isSwipe = false;
                sliderRef.slickGoTo(chipIndex + 2 - slidesToShow);
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
        if (selectedChip !== chipValue) {
            dispatch({
                type: SystemEventActionType.SELECT_CHIP,
                payload: {
                    selectedChip: chipValue,
                },
            });
            enabledSound && playSound();
        }
    };

    const updateArrowsByChipValue = (chipValue: number) => {
        const chipIndex = chipValues.indexOf(chipValue);

        chipIndex === 0 ? setEnabledPrevBtn(false) : setEnabledPrevBtn(true);
        chipIndex === chipValues.length - 1 ? setEnabledNextBtn(false) : setEnabledNextBtn(true);
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
            const chipIndex = chipValues.indexOf(selectedChip);
            const newSelectedChip = chipValues[chipIndex + 1];

            isSwipe = false;
            sliderRef.slickGoTo(chipIndex + 3 - slidesToShow);
            handleSelectChip(newSelectedChip);
            disableSelectChipWhenSliding();
        }
    };

    const onClickPrev = () => {
        if (enabledPrevBtn && !isSliding) {
            const chipIndex = chipValues.indexOf(selectedChip);
            const newSelectedChip = chipValues[chipIndex - 1];

            isSwipe = false;
            sliderRef.slickGoTo(chipIndex - 2);
            handleSelectChip(newSelectedChip);
            disableSelectChipWhenSliding();
        }
    };

    useEffect(() => {
        const chip = chipValues.find((chip) => chip === selectedChip) || chipValues?.[0];
        chip > 0 && onClickChip(chip);
        chipValues && updateArrowsByChipValue(selectedChip);
    }, [chipValues, selectedChip]);

    useEffect(() => {
        if (sliderRef) {
            isSwipe = false;
            const chipIndex = chipValues.indexOf(selectedChip);
            sliderRef.slickGoTo(chipIndex);
            updateArrowsByChipValue(selectedChip);
        }
    }, []);

    const SliderSetting = {
        speed: SlidingTimeInMillisecond,
        infinite: false,
        adaptiveHeight: true,
        swipeToSlide: true,
        slidesToShow,
        arrows: false,
        onSwipe: () => {
            isSwipe = true;
        },
        beforeChange: (oldIndex: number, newIndex: number) => {
            if (isSwipe) {
                oldIndex > newIndex && handleSelectChip(chipValues[newIndex + slidesToShow - 1]);
                oldIndex < newIndex && handleSelectChip(chipValues[newIndex]);
            }
        },
    };
    return chipValues?.length > 0 ? (
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
                {chipValues.map((value) => (
                    <Chip key={+value} value={+value} onClickChip={onClickChip} />
                ))}
            </Slider>
            <span
                className={`${Styles["icon-next"]} ${!enabledNextBtn && Styles["disabled"]} ${enabledQuickBet ? Styles["quick-bet"] : ""}`}
                onClick={onClickNext}
            ></span>
        </React.Fragment>
    ) : null;
};
