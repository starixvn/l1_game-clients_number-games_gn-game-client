import { GameEventActionType } from "../../../_shared/react-contexts/game-state-context/game-event-action";
import { useGameStateContext, useGameStatesDispatch } from "../../../_shared/react-contexts/game-state-context/game-state-context";
import { useTranslator } from "../../../_shared/react-hooks";
import ConfirmDialog from "../confirm-dialog";

const BetConfirmDialog = () => {
    const dispatch = useGameStatesDispatch();
    const suggestBet = 500;
    const { t } = useTranslator();

    const gameActionContext = useGameStateContext();
    if (!gameActionContext.showConfirmDialog) {
        return null;
    }

    return (
        <ConfirmDialog
            title={<>{t("message_insufficient_fund")}</>}
            content={<>{t("message_balance", { outstandingBalance: suggestBet })}</>}
            subContent={<>{t("message_confirm_bet")}?</>}
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
