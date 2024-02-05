import React, { useMemo } from "react";
import { isMobileOnly, isIOS } from "react-device-detect";
import { useTranslation } from "next-i18next";
import { User } from "sc-user-service-client/dist/auth";
import { ChipSlider } from "./chip-slider";
import { QuickBetBtn } from "./quick-bet-btn";
import Styles from "./bet-setting.module.scss";

type Props = {
    updateBetValue: (betValue: number) => void;
    enabledQuickBet: boolean;
    updateEnabledQuickBet: (value: boolean) => void;
    enabledSound: boolean;
    user: User;
    toggleSlidingChip: () => void;
    isShowSlidingChip: boolean;
    toggleAnnouncementModal: () => void;
    betValue: number;
    isShowToolbarGuide: boolean;
};

const BetSettings: React.FC<Props> = ({
    updateBetValue,
    enabledQuickBet,
    updateEnabledQuickBet,
    enabledSound,
    user,
    toggleSlidingChip,
    isShowSlidingChip,
    betValue,
    isShowToolbarGuide,
}) => {
    const { i18n } = useTranslation();

    return useMemo(() => {
        let deviceClass = "";
        if (isMobileOnly) {
            deviceClass = isIOS ? Styles["ios-device"] : Styles["android-device"];
        }
        return (
            <div className={`${Styles["bet-settings"]} ${deviceClass}`}>
                <div
                    className={`${Styles["settings-container"]} ${
                        isShowSlidingChip ? Styles["open-animation"] : Styles["close-animation"]
                    }`}
                >
                    <div className={`game-container ${Styles["container"]}`}>
                        <div className={Styles["wrapper-chips"]}>
                            <QuickBetBtn
                                enabledQuickBet={enabledQuickBet}
                                updateEnabledQuickBet={updateEnabledQuickBet}
                                isHeaderSetting={false}
                                isShowToolbarGuide={isShowToolbarGuide}
                            />
                            <div className={Styles["chips-container"]}>
                                <ChipSlider
                                    updateBetValue={updateBetValue}
                                    enabledSound={enabledSound}
                                    enabledQuickBet={enabledQuickBet}
                                    toggleSlidingChip={toggleSlidingChip}
                                    betValue={betValue}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }, [user?.red, updateBetValue, enabledQuickBet, updateEnabledQuickBet, enabledSound, isShowSlidingChip, betValue, isShowToolbarGuide]);
};

export default BetSettings;
