import { useState } from "react";
import { isIOS, isMobileOnly } from "react-device-detect";

import { SystemEventActionType, usePlayerContext, useSystemContext, useSystemDispatch } from "../../../../_shared/react-contexts";
import { useClickSound, useSNTranslate } from "../../../../_shared/react-hooks";
import { updateUserQuickBetSetting } from "../../../../services/user-setting-service";
import BaseDialog from "../../../game-components/base-dialog";
import { ModalType } from "../../../game-components/base-dialog/type";
import QuickBetHint from "../quick-bet-hint";
import Styles from "./quick-bet-btn.module.scss";
import { usePlaceBetContext } from "../../../../_shared/react-contexts/game-state-context/place-bet-context/place-bet-context";

export const QuickBetBtn = () => {
    const { showConfirmBet } = usePlaceBetContext();
    const authContext = usePlayerContext();
    const enabledQuickBet = useSystemContext().isEnableQuickBet;
    const systemDispatch = useSystemDispatch();

    const [isShowModalConfirm, setIsShowModalConfirm] = useState(false);

    let deviceClass = "";
    if (isMobileOnly) {
        deviceClass = isIOS ? Styles["ios-device"] : Styles["android-device"];
    }

    const { t } = useSNTranslate();
    const clickSound = useClickSound();

    const confirmQuickBet = () => {
        clickSound();
        closeModal();
        updateUserQuickBet(true);
    };

    const updateUserQuickBet = (isEnableQuickBet) => {
        updateUserQuickBetSetting(authContext.session, isEnableQuickBet);
        authContext.authorizeInfo.user.settings.quickBet = isEnableQuickBet;
        systemDispatch({
            type: SystemEventActionType.SET_QUICK_BET,
            payload: { isEnableQuickBet },
        });
    };

    const closeModal = () => {
        clickSound();
        setIsShowModalConfirm(false);
    };

    const onClickQuickBet = () => {
        clickSound();
        if (!enabledQuickBet) {
            setIsShowModalConfirm(true);
        } else {
            updateUserQuickBet(false);
        }
    };

    const quickBetPopup = (
        <div className={Styles["modalConfirm"]}>
            <div className={`${Styles["bg-opacity"]}`}></div>
            <BaseDialog type={ModalType.Center} isOpen={isShowModalConfirm} onCloseModal={closeModal}>
                <QuickBetHint closeModal={closeModal} confirmQuickBet={confirmQuickBet} />
            </BaseDialog>
        </div>
    );

    return showConfirmBet ? (
        <></>
    ) : (
        <div className={`${Styles["toggle"]} ${Styles["bet-setting"]} ${deviceClass}`}>
            <div className={`${Styles["one-click-bet"]} ${enabledQuickBet ? Styles["active"] : ""}`} onClick={onClickQuickBet}>
                {t("quick_bet")}
            </div>
            <div>
                <input
                    className={Styles["toggle-checkbox"]}
                    id="toggle-quickbet"
                    type={"checkbox"}
                    value={"Quick Bet"}
                    checked={!!enabledQuickBet}
                    onChange={onClickQuickBet}
                />
                <label id="icon-quickbet" className={Styles["toggle-btn"]} htmlFor="toggle-quickbet">
                    <div className={Styles["quick-bet-icon"]}></div>
                </label>
            </div>
            {isShowModalConfirm && !!enabledQuickBet === false && quickBetPopup}
        </div>
    );
};
