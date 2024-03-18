import { memo, useMemo } from "react";
import { isIOS, isMobileOnly } from "react-device-detect";
import { GameConfigs, UserStakeLevel } from "../../game-base/type";
import { ChipSlider } from "../../game-components/chip-slider";
import Styles from "./bet-setting.module.scss";
import { QuickBetBtn } from "./quick-bet-btn";

const BetSettings = (props: { gameConfigs: GameConfigs; userStakeLevel: UserStakeLevel }) => {
    const { gameConfigs, userStakeLevel } = props;

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
                                <ChipSlider gameConfigs={gameConfigs} userStakeLevel={userStakeLevel} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }, [gameConfigs, userStakeLevel]);
};

export default memo(BetSettings);
