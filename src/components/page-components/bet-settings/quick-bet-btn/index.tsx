import { useEffect, useRef, useState } from "react";
import { isIOS, isMobileOnly } from "react-device-detect";
import { StorageHelper, localStorageKeys } from "../../../../_shared/helpers";
import { useAuthContext } from "../../../../_shared/react-contexts";
import { useGameStateContext } from "../../../../_shared/react-contexts/game-state-context/game-state-context";
import { useClickSound, useSNTranslate } from "../../../../_shared/react-hooks";
import { updateUserQuickBetSetting } from "../../../../services/user-setting-service";
import BaseDialog from "../../../game-components/base-dialog";
import { ModalType } from "../../../game-components/base-dialog/type";
import QuickBetHint from "../quick-bet-hint";
import Styles from "./quick-bet-btn.module.scss";

export const QuickBetBtn = () => {
    const { showConfirmBet } = useGameStateContext();
    const authContext = useAuthContext();
    const enabledQuickBet = authContext.authorizeInfo?.user?.settings?.quickBet;
    const isShowToolbarGuide = StorageHelper.get(localStorageKeys.toolbarGuide) ?? true;

    const [isShowModalConfirm, setIsShowModalConfirm] = useState(false);
    const [isShowTooltip, setIsShowTooltip] = useState(false);
    const tooltipRef = useRef<HTMLDivElement>(null);
    let deviceClass = "";
    if (isMobileOnly) {
        deviceClass = isIOS ? Styles["ios-device"] : Styles["android-device"];
    }
    const { t } = useSNTranslate();
    const clickSound = useClickSound();

    const confirmQuickBet = () => {
        clickSound();
        setIsShowTooltip(false);
        closeModal();
        updateUserQuickBetSetting(authContext.session, true);
        authContext.authorizeInfo.user.settings.quickBet = true;
    };

    const closeModal = () => {
        clickSound();
        setIsShowModalConfirm(false);
    };

    useEffect(() => {
        function handleClickOutside(event) {
            if (isShowToolbarGuide) {
                return;
            }
            if (isShowTooltip && tooltipRef && tooltipRef.current && !tooltipRef.current.contains(event.target)) {
                setIsShowTooltip(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [tooltipRef, isShowToolbarGuide]);

    const onClickQuickBet = () => {
        clickSound();
        if (!enabledQuickBet) {
            setIsShowModalConfirm(true);
        } else {
            updateUserQuickBetSetting(authContext.session, false);
            authContext.authorizeInfo.user.settings.quickBet = false;
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
            {enabledQuickBet === undefined && isShowTooltip && quickBetPopup}
        </div>
    );
};
