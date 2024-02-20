import { useTranslation } from "next-i18next";
import React, { useEffect, useRef, useState } from "react";
import { isMobileOnly } from "react-device-detect";

import { GameResourceKeys } from "../../../_shared/resources";
import { useGameContext, useSystemContext } from "../../../_shared/react-contexts";
import { formatOdds, numberWithCommas } from "../../../_shared/helpers/number-helper";
import { adjustPopupPosition, BetFormCss } from "./place-bet-modal-helper";
import { PlaceBetModalProps } from "./place-bet-modal-type";
import Styles from "./place-bet-modal.module.scss";
import { useGameStateContext } from "../../../_shared/react-contexts/game-state-context/game-state-context";

const defaultCss: BetFormCss = {
    position: {
        top: "0px",
    },
    arrowStyle: "up",
};

const PlaceBetModal: React.FC<PlaceBetModalProps> = (props) => {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const { gameSetting } = useGameContext();
    const { roundId } = useGameStateContext();
    const { betValue, fractionalOddsFormat } = useSystemContext();
    const { t } = useTranslation([gameSetting.gameName.toLocaleLowerCase(), "common"]);
    const { betChoiceInfo } = props,
        { betChoice, odd, gameName } = betChoiceInfo;

    const [betFormCss, setBetFormCss] = useState<BetFormCss>(defaultCss);
    const [popupPositionUpdate, setPopupPositionUpdate] = useState(false);

    const title = t(GameResourceKeys.GAME_NAME);
    const subTitle = `#${roundId}`;
    const gameContainerRect = props.gameBaseContainerRef.current.parentElement.parentElement.getBoundingClientRect(),
        betOptionRect = props.betOptionElement.getBoundingClientRect();

    useEffect(() => {
        setBetFormCss({
            position: {
                top: `${betOptionRect.bottom - gameContainerRect.top}px`,
            },
            arrowStyle: "up",
        });

        setPopupPositionUpdate(true);
    }, []);

    useEffect(() => {
        if (popupPositionUpdate) {
            setBetFormCss(
                adjustPopupPosition(
                    isMobileOnly,
                    betFormCss,
                    gameContainerRect,
                    wrapperRef.current.getBoundingClientRect(),
                    betOptionRect,
                    props.betChoiceElement.getBoundingClientRect()
                )
            );
            setPopupPositionUpdate(false);
        }
    }, [popupPositionUpdate]);

    useEffect(() => {
        const handleClickOutside = (event: any) => {
            if (props.isOpen && wrapperRef && wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                closeModal && closeModal();
            }
        };

        window.addEventListener("mousedown", handleClickOutside);

        return () => {
            window.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);

    const closeModal = () => {
        props.removeBetChoiceFocus();
        props.onCloseModal();
    };

    const submitBet = (event: any) => {
        event.preventDefault();
        closeModal();

        const betOptionsRect = props.betOptionElement.getBoundingClientRect();
        props.onPlaceBet(props.betChoiceInfo.betChoice, betValue, {
            x: betOptionsRect.left + betOptionsRect.width / 2,
            y: betOptionsRect.top + 30,
        });
    };

    const bettypeName = `bettype-${betChoiceInfo.betChoice}`;
    const isShowBettype = t(bettypeName) !== bettypeName;

    return (
        <div
            style={{ ...betFormCss.position }}
            ref={wrapperRef}
            className={`${Styles["modal-placebetform"]} ${Styles[gameName.toLocaleLowerCase()]}`}
        >
            <div className={Styles["popup-closed-icon"]} id="bet-form-closed" onClick={() => closeModal()}>
                <span className={`icon-close {Styles["icon-close"]}`}></span>
            </div>

            {title && (
                <div className={Styles["popup-header"]}>
                    <h1 className={Styles["popup-title"]}>{t(title)}</h1>
                    {subTitle && <div className={Styles["popup-sub-title"]}>{t(subTitle)}</div>}
                </div>
            )}
            <div
                className={`${Styles["popup-content"]} ${subTitle ? Styles["has-subtitle"] : ""} ${
                    !title ? Styles["has-empty-title"] : ""
                }`}
            >
                <div className={Styles["place-bet-container"]}>
                    <div className={`w-100 ${Styles["general-info"]}`}>
                        <div className={Styles["left"]}>
                            {isShowBettype && <div className={Styles["font-weight-bold"]}> {t(bettypeName)}</div>}
                            <div className={`${Styles["font-weight-bold"]} ${Styles["choice"]}`}>{t(betChoice)}</div>
                            <div className={Styles["info"]}>@{formatOdds(odd, fractionalOddsFormat)}</div>
                        </div>
                        <span className={Styles["highlight"]}>{numberWithCommas(betValue)}</span>
                    </div>

                    <div className={Styles["payout"]}>
                        <label>{t("common:payout")}:</label> <span className={Styles["highlight"]}>{numberWithCommas(betValue * odd)}</span>
                    </div>
                    <p className={Styles["confirm-text"]}>{t("common:confirmBetAutomatic")}</p>
                    <div className={Styles["actions"]}>
                        <button onClick={closeModal} className={`btn-grey ${Styles["custom-button"]}`} disabled={betValue <= 0}>
                            {t("common:cancel")}
                        </button>
                        <button onClick={submitBet} className={`btn-red ${Styles["custom-button"]}`} disabled={betValue <= 0}>
                            {t("common:confirm")}
                        </button>
                    </div>
                </div>
            </div>
            <div className={`${Styles["modal-arrow"]} ${Styles[betFormCss.arrowStyle]}`} style={{ left: betFormCss.arrowStyleLeft }}></div>
        </div>
    );
};

export default PlaceBetModal;
