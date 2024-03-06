import React, { useEffect } from "react";
import { confirmBet } from "../../../_shared/constants";
import { useGameActionContext } from "../../../_shared/react-contexts";
import { GameEventActionType } from "../../../_shared/react-contexts/game-state-context/game-event-action";
import { useGameStateContext, useGameStatesDispatch } from "../../../_shared/react-contexts/game-state-context/game-state-context";
import { useSNTranslate } from "../../../_shared/react-hooks";
import Styles from "./confirm-bet.module.scss";

export type Props = {};

const ConfirmBet: React.FC<Props> = ({}: Props) => {
    const dispatch = useGameStatesDispatch();
    const gameActionContext = useGameActionContext();
    const gameStateConext = useGameStateContext();

    const { t } = useSNTranslate();
    useEffect(() => {
        return () => {};
    }, []);

    const onCancel = () => {
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
    };
    const onConfirm = () => {
        gameActionContext.placeBet(confirmBet, 0);
    };

    if (!gameStateConext.showConfirmBet) return <></>;

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
                    className={`btn-green ${Styles["btn-confirm-bet"]}`}
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
