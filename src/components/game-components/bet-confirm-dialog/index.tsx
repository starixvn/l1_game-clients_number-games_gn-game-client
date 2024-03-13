import { numberRoundDownWithCommas } from "../../../_shared/helpers";
import { usePlayerContext } from "../../../_shared/react-contexts";
import { GameEventActionType } from "../../../_shared/react-contexts/game-state-context/game-event-action";
import { useGameStateContext, useGameStatesDispatch } from "../../../_shared/react-contexts/game-state-context/game-state-context";
import { useTranslator } from "../../../_shared/react-hooks";
import ConfirmDialog from "../confirm-dialog";

const BetConfirmDialog = () => {
    const dispatch = useGameStatesDispatch();
    const gameStateContext = useGameStateContext();
    const enabledQuickBet = usePlayerContext().authorizeInfo?.user?.settings?.quickBet;

    const suggestBet = gameStateContext.suggestBet;
    const currentBetChoice = suggestBet.currentBetChoice;
    const outstandingBalance = suggestBet.suggestBetAmount;
    const isInsufficientFunds = suggestBet.isInsufficientFunds;

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
                    suggestBetAmount: null,
                    sendOutstandingBet: null,
                    isInsufficientFunds: false,
                },
            },
        });
    };

    const handleCloseModal = () => {
        dispatch({
            type: GameEventActionType.SHOW_CONFIRM_DIALOG,
            payload: {
                showConfirmDialog: false,
            },
        });

        enabledQuickBet && removeSuggestBet();
    };

    const handleSubmitBet = () => {
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
    };

    const getContent = () => {
        const formatValue = () => {
            return `<strong class="amount-color">${numberRoundDownWithCommas(outstandingBalance)}</strong>`;
        };

        const content = t("message_bet_available", { amount: formatValue() });

        return content;
    };

    const getTitle = () => {
        return isInsufficientFunds ? t("message_insufficient_fund") : t("message_reach_maxbet");
    };

    return (
        <ConfirmDialog
            title={getTitle()}
            content={getContent()}
            subContent={t("message_confirm_bet")}
            onCloseModal={handleCloseModal}
            onSubmit={handleSubmitBet}
        />
    );
};

export default BetConfirmDialog;
