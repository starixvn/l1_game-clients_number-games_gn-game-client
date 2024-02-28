
import React from "react";
import { GameEventActionType } from "../../../_shared/react-contexts/game-state-context/game-event-action";
import { useGameStateContext, useGameStatesDispatch } from "../../../_shared/react-contexts/game-state-context/game-state-context";
import ConfirmDialog from "../confirm-dialog";

const BetConfirmDialog = () => {
    const dispatch = useGameStatesDispatch();
    const gameActionContext = useGameStateContext();
    if (!gameActionContext.showConfirmDialog) {
        return null;
    }

    return (
        <ConfirmDialog
            title={<>Insufficient Funds</>}
            content={<>Outstanding Balance: 500</>}
            subContent={<>Want to Bet?</>}
            onCloseModal={() => {
                dispatch({
                    type: GameEventActionType.SHOW_CONFIRM_DIALOG,
                    payload: {
                        showConfirmDialog: false,
                    },
                });

                console.log("close");
            }}
            onSubmit={() => {
                dispatch({
                    type: GameEventActionType.SHOW_CONFIRM_DIALOG,
                    payload: {
                        showConfirmDialog: false,
                    },
                });

                console.log("yes");
            }}
        />
    );
};

export default BetConfirmDialog;
