import { useAuthContext } from "../../../_shared/react-contexts";
import { GameEventActionType } from "../../../_shared/react-contexts/game-state-context/game-event-action";
import { useGameStateContext, useGameStatesDispatch } from "../../../_shared/react-contexts/game-state-context/game-state-context";
import { useTranslator } from "../../../_shared/react-hooks";
import ConfirmDialog from "../confirm-dialog";

const BetConfirmDialog = () => {
    const dispatch = useGameStatesDispatch();
    const gameStateContext = useGameStateContext();
    const enabledQuickBet = useAuthContext().authorizeInfo?.user?.settings?.quickBet;

    const currentBetChoice = gameStateContext.suggestBet.currentBetChoice;

    const outstandingBalance = gameStateContext.suggestBet.suggestBetAmount;
    const { t } = useTranslator();

    if (!gameStateContext.showConfirmDialog) {
        return null;
    }
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

    return (
        <ConfirmDialog
            title={<>{t("message_insufficient_fund")}</>}
            content={<>{t("message_balance", { outstandingBalance })}</>}
            subContent={<>{t("message_confirm_bet")}?</>}
            onCloseModal={() => {
                console.log("close");
                dispatch({
                    type: GameEventActionType.SHOW_CONFIRM_DIALOG,
                    payload: {
                        showConfirmDialog: false,
                    },
                });

                if (enabledQuickBet) {
                    removeSuggestBet();
                    return;
                }
            }}
            onSubmit={() => {
                console.log("yes");

                dispatch({
                    type: GameEventActionType.SHOW_CONFIRM_DIALOG,
                    payload: {
                        showConfirmDialog: false,
                    },
                });

                if (enabledQuickBet) {
                    gameStateContext.suggestBet.sendOutstandingBet();
                    removeSuggestBet();
                    return;
                }

                dispatch({
                    type: GameEventActionType.SHOW_CONFIRM_BET,
                    payload: {
                        showConfirmBet: true,
                    },
                });

                const notConfirmOwnBets = gameStateContext.notConfirmOwnBets;
                notConfirmOwnBets[currentBetChoice] = (notConfirmOwnBets[currentBetChoice] ?? 0) + outstandingBalance;

                dispatch({
                    type: GameEventActionType.NOT_CONFIRM_OWN_BETS,
                    payload: {
                        notConfirmOwnBets,
                    },
                });
            }}
        />
    );
};

export default BetConfirmDialog;
