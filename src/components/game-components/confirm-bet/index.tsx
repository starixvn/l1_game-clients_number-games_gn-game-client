import React, { useEffect } from "react";

import { confirmBet } from "../../../_shared/constants";
import { PlayerContextModel, useGameActionContext, usePlayerContext } from "../../../_shared/react-contexts";
import { GameEventActionType } from "../../../_shared/react-contexts/game-state-context/game-event-action";
import { useGameStateContext, useGameStatesDispatch } from "../../../_shared/react-contexts/game-state-context/game-state-context";
import { useClickSound, useSNTranslate } from "../../../_shared/react-hooks";
import Styles from "./confirm-bet.module.scss";

const ConfirmBet: React.FC = () => {
    const dispatch = useGameStatesDispatch();
    const gameActionContext = useGameActionContext();
    const gameStateContext = useGameStateContext();
    const { authorizeInfo, enableQuickBet } = (usePlayerContext() as PlayerContextModel);
    const enabledQuickBet = authorizeInfo?.user?.settings.quickBet || enableQuickBet;
    const clickSound = useClickSound();
    const { t } = useSNTranslate();

    useEffect(() => {
        return () => { };
    }, []);

    const onCancel = () => {
        clickSound();
        dispatch({
            type: GameEventActionType.SHOW_CONFIRM_BET,
            payload: {
                showConfirmBet: false,
            },
        });

        dispatch({
            type: GameEventActionType.NOT_CONFIRM_OWN_BETS,
            payload: { notConfirmOwnBets: {} },
        });

        removeSuggestBet();
    };

    const removeSuggestBet = () => {
        dispatch({
            type: GameEventActionType.SUGGEST_BET,
            payload: {
                suggestBet: {
                    currentBetChoice: "",
                    sendOutstandingBet: null,
                },
            },
        });
    };

    const onConfirm = () => {
        if (enabledQuickBet) {
            gameStateContext.suggestBet.sendOutstandingBet();
            removeSuggestBet();

            return;
        }
        gameActionContext.placeBet(confirmBet, 0);
    };

    if (!gameStateContext.showConfirmBet) {
        return <></>;
    }

    return (
        <div className={Styles["confirm-bet-container"]}>
            <div className={Styles["back-ground"]}>
                <button
                    className={`btn-grey ${Styles["btn-cancel-bet"]}`}
                    onClick={() => onCancel()}
                    type="button"
                    data-testid="btn-cancel-bet"
                >
                    {t({ key: "button_cancel" })}
                </button>
                <button
                    className={`btn-green pulse ${Styles["btn-confirm-bet"]}`}
                    onClick={() => onConfirm()}
                    type="button"
                    data-testid="btn-confirm-bet"
                >
                    {t({ key: "button_confirm" })}
                </button>
            </div>
        </div>
    );
};

export default ConfirmBet;
