import { memo, useMemo } from "react";
import { isIOS, isMobileOnly } from "react-device-detect";
import { StorageHelper, localStorageKeys } from "../../../_shared/helpers";
import { usePlayerContext } from "../../../_shared/react-contexts";
import { ChipSlider } from "../../game-components/chip-slider";
import Styles from "./bet-setting.module.scss";
import { QuickBetBtn } from "./quick-bet-btn";

const BetSettings = () => {
    const enabledQuickBet = usePlayerContext().authorizeInfo?.user?.settings?.quickBet;

    const isShowToolbarGuide = StorageHelper.get(localStorageKeys.toolbarGuide) ?? true;

    return useMemo(() => {
        let deviceClass = "";
        if (isMobileOnly) {
            deviceClass = isIOS ? Styles["ios-device"] : Styles["android-device"];
        }
        return (
            <div className={`${Styles["bet-settings"]} ${deviceClass}`}>
                <div className={`${Styles["settings-container"]}`}>
                    <div className={`game-container ${Styles["container"]}`}>
                        <div className={Styles["wrapper-chips"]}>
                            <QuickBetBtn />
                            <div className={Styles["chips-container"]}>
                                <ChipSlider />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }, [isShowToolbarGuide, enabledQuickBet]);
};

export default memo(BetSettings);
