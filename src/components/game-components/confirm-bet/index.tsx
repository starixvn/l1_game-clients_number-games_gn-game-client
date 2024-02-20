import { useTranslate } from "@tolgee/react";
import React, { useEffect } from "react";
import { useSystemContext } from "../../../_shared/react-contexts";
import { GameEventActionType } from "../../../_shared/react-contexts/game-state-context/game-event-action";
import { useGameStatesDispatch } from "../../../_shared/react-contexts/game-state-context/game-state-context";
import Styles from "./confirm-bet.module.scss";

export type Props = {};

const ConfirmBet: React.FC<Props> = ({}: Props) => {
    const systemContext = useSystemContext();
    const dispatch = useGameStatesDispatch();

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
    };
    const onConfirm = () => {
        dispatch({
            type: GameEventActionType.SHOW_CONFIRM_BET,
            payload: {
                showConfirmBet: false,
            },
        });
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
