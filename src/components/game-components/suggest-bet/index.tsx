import { useTranslate } from "@tolgee/react";
import { GameEventActionType } from "../../../_shared/react-contexts/game-state-context/game-event-action";
import { useGameStateContext, useGameStatesDispatch } from "../../../_shared/react-contexts/game-state-context/game-state-context";
import ConfirmDialog from "../submit-dialog";
import { useAuthContext } from "../../../_shared/react-contexts";

const SuggestBet = () => {
    const dispatch = useGameStatesDispatch();
    const { t } = useTranslate(["SabaNumber"]);
    const gameStateContext = useGameStateContext();
    const balance = useAuthContext().authorizeInfo.user.red;

    return (
        <ConfirmDialog
            title={<>Insufficient Funds</>}
            content={<>Outstanding Balance: {balance}</>}
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

export default SuggestBet;
