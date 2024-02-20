import { useTranslate } from "@tolgee/react";
import React, { useEffect } from "react";
import { confirmBetChoice } from "../../../_shared/constants";
import { useGameActionContext } from "../../../_shared/react-contexts";
import { GameEventActionType } from "../../../_shared/react-contexts/game-state-context/game-event-action";
import { useGameStatesDispatch } from "../../../_shared/react-contexts/game-state-context/game-state-context";
import Styles from "./confirm-bet.module.scss";

export type Props = {};

const ConfirmBet: React.FC<Props> = ({}: Props) => {
    const dispatch = useGameStatesDispatch();
    const gameActionContext = useGameActionContext();

    const { t } = useTranslate(["SabaNumber"]);
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
        dispatch({
            type: GameEventActionType.SHOW_CONFIRM_BET,
            payload: {
                showConfirmBet: false,
            },
        });

        gameActionContext.placeBet(confirmBetChoice, 0);
    };

    return (
        <div className={Styles["confirm-bet-container"]}>
            <div className={Styles["back-ground"]}>
                <button className={`btn-red ${Styles["btn-cancel"]}`} onClick={() => onCancel()} type="button" data-testid="btn-cancel-bet">
                    {t({ key: "cancel" })}
                </button>
                <button
                    className={`btn-red ${Styles["btn-confirm"]}`}
                    onClick={() => onConfirm()}
                    type="button"
                    data-testid="btn-confirm-bet"
                >
                    {t({ key: "confirm" })}
                </button>
            </div>
        </div>
    );
};

export default ConfirmBet;
