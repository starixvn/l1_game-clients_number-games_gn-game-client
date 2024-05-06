import {
    SuggestBet,
} from "../../../../components/game-base/type";

export interface PlaceBetContextModel {
    ownBets: object;
    isProcessingBet?: boolean;
    acceptedBetQueue: {
        [key: number]: {
            amount: number;
        };
    };
    suggestBet: SuggestBet,
    notConfirmOwnBets: object;
    showConfirmBet: boolean;
    showConfirmDialog: boolean;
}

export const initialPlaceBetContext = () => {
    return {
        ownBets: {},
        acceptedBetQueue: {},
        notConfirmOwnBets: {},
        showConfirmBet: false,
        showConfirmDialog: false,
        suggestBet: {
            currentBetChoice: "",
            sendOutstandingBet: null,
            suggestBetAmount: 0,
            isInsufficientFunds: null,
        },
    };
};
