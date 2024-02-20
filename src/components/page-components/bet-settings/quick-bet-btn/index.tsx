import { Trans, useTranslation } from "next-i18next";
import { useEffect, useRef, useState } from "react";
import { isIOS, isMobileOnly } from "react-device-detect";
import { StorageHelper, localStorageKeys } from "../../../../_shared/helpers";
import { useAuthContext } from "../../../../_shared/react-contexts";
import { GameEventActionType } from "../../../../_shared/react-contexts/game-state-context/game-event-action";
import { useGameStateContext, useGameStatesDispatch } from "../../../../_shared/react-contexts/game-state-context/game-state-context";
import { updateUserQuickBetSetting } from "../../../../services/user-setting-service";
import BaseDialog from "../../../game-components/base-dialog";
import { ModalType } from "../../../game-components/base-dialog/type";
import ConfirmMessage from "../confirm-message";
import Styles from "./quick-bet-btn.module.scss";

export const QuickBetBtn = () => {
    const gameStateContext = useGameStateContext();
    const dispatch = useGameStatesDispatch();
    const { enabledQuickBet, showConfirmBet } = gameStateContext;
    const isShowToolbarGuide = StorageHelper.get(localStorageKeys.toolbarGuide) ?? true;
    const updateEnabledQuickBet = (value) =>
        dispatch({
            type: GameEventActionType.TOGLE_QUICK_BET,
            payload: {
                enabledQuickBet: value,
            },
        });

    const [isShowModalConfirm, setIsShowModalConfirm] = useState(false);
    const [isShowTooltip, setIsShowTooltip] = useState(true);
    const tooltipRef = useRef<HTMLDivElement>(null);
    let deviceClass = "";
    if (isMobileOnly) {
        deviceClass = isIOS ? Styles["ios-device"] : Styles["android-device"];
    }
    const authContext = useAuthContext();
    const { t } = useTranslation();

    const confirmQuickBet = () => {
        setIsShowTooltip(false);
        closeModal();
        updateEnabledQuickBet(true);
        updateUserQuickBetSetting(authContext.session, true);
    };

    const closeModal = () => {
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
        if (!enabledQuickBet) {
            setIsShowModalConfirm(true);
        } else {
            updateEnabledQuickBet(false);
            updateUserQuickBetSetting(authContext.session, false);
        }
    };

    const handleTurnOn = () => {
        setIsShowTooltip(false);
        confirmQuickBet();
    };

    const closeHintTooltip = () => {
        setIsShowTooltip(false);
        updateUserQuickBetSetting(authContext.session, false);
    };

    const toolTipPositionClass = isMobileOnly ? `bottom ${Styles["isMobile"]}` : "top",
        toolTipClass = `popover-custom ${toolTipPositionClass} ${Styles["hint-one-click-bet"]} `;

    return showConfirmBet ? (
        <></>
    ) : (
        <div className={`${Styles["toggle"]} ${Styles["bet-setting"]} ${deviceClass}`}>
            <div className={Styles["one-click-bet"]} onClick={onClickQuickBet}>
                {t("common:oneClickTitle")}
            </div>
            <div>
                {!enabledQuickBet && <div className={Styles["ripple-animation"]}></div>}
                <input
                    className={Styles["toggle-checkbox"]}
                    id="toggle-quickbet"
                    type={"checkbox"}
                    value={"Quick Bet"}
                    checked={!!enabledQuickBet}
                    onChange={onClickQuickBet}
                />
                <label className={Styles["toggle-btn"]} htmlFor="toggle-quickbet">
                    <div className={Styles["quick-bet-icon"]}></div>
                </label>
            </div>
            {isShowModalConfirm && !!enabledQuickBet === false && (
                <div className={Styles["modalConfirm"]}>
                    <div className={`${Styles["bg-opacity"]}`}></div>
                    <BaseDialog type={ModalType.Message} isOpen={isShowModalConfirm} onCloseModal={closeModal}>
                        <ConfirmMessage closeModal={closeModal} confirmQuickBet={confirmQuickBet} />
                    </BaseDialog>
                </div>
            )}
            {enabledQuickBet === undefined && isShowTooltip && (
                <div ref={tooltipRef} className={toolTipClass}>
                    <div className={Styles.content}>
                        <Trans t={t}>{t("common:oneClickHintMsg")}</Trans>
                    </div>
                    <div className={Styles.action}>
                        <button className={`btn-grey ${Styles["btn"]}`} onClick={closeHintTooltip}>
                            {t("common:dismiss")}
                        </button>
                        <button className={`btn-red ${Styles["btn"]}`} onClick={handleTurnOn}>
                            {t("common:turnOn")}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
