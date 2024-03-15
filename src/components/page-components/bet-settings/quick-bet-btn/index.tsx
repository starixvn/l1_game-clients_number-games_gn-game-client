import { Markup } from "interweave";
import { useEffect, useRef, useState } from "react";
import { isIOS, isMobileOnly } from "react-device-detect";
import { StorageHelper, localStorageKeys } from "../../../../_shared/helpers";
import { usePlayerContext } from "../../../../_shared/react-contexts";
import { useGameStateContext } from "../../../../_shared/react-contexts/game-state-context/game-state-context";
import { useClickSound, useSNTranslate } from "../../../../_shared/react-hooks";
import { updateUserQuickBetSetting } from "../../../../services/user-setting-service";
import BaseDialog from "../../../game-components/base-dialog";
import { ModalType } from "../../../game-components/base-dialog/type";
import QuickBetHint from "../quick-bet-hint";
import Styles from "./quick-bet-btn.module.scss";

export const QuickBetBtn = () => {
    const { showConfirmBet } = useGameStateContext();
    const authContext = usePlayerContext();
    const enabledQuickBet = authContext.authorizeInfo?.user?.settings?.quickBet;
    const isShowToolbarGuide = StorageHelper.get(localStorageKeys.toolbarGuide) ?? true;

    const [isShowModalConfirm, setIsShowModalConfirm] = useState(false);
    const [isShowTooltip, setIsShowTooltip] = useState(true);
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

    const onEnableFirstLogin = () => {
        clickSound();
        setIsShowTooltip(false);

        updateUserQuickBetSetting(authContext.session, true);
        authContext.authorizeInfo.user.settings.quickBet = true;
    };

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

    const closeHintTooltip = () => {
        setIsShowTooltip(false);
        updateUserQuickBetSetting(authContext.session, false);
    };

    const toolTipPositionClass = isMobileOnly ? `bottom ${Styles["isMobile"]}` : "top",
        toolTipClass = `popover-custom ${toolTipPositionClass} ${Styles["hint-one-click-bet"]} `;

    const firstLoginQuickBetPopup = (
        <div ref={tooltipRef} className={toolTipClass}>
            <div className={Styles.content}>{<Markup content={t(`enable_quick_bet_hint`).replaceTolgeeFormat()}></Markup>}</div>
            <div className={Styles.action}>
                <button id="btn-cancel-quickbet" className={`btn-grey ${Styles["btn"]}`} onClick={closeHintTooltip}>
                    {t("button_cancel")}
                </button>
                <button id="btn-on-quickbet" className={`btn-red ${Styles["btn"]}`} onClick={onEnableFirstLogin}>
                    {t("button_enable_quickbet")}
                </button>
            </div>
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
            {enabledQuickBet === undefined && isShowTooltip && firstLoginQuickBetPopup}
        </div>
    );
};
