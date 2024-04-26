import {
    SuggestBet,
} from "../../../../components/game-base/type";

export interface PlaceBetContextModel {
    ownBets: any;
    isProcessingBet?: boolean;
    acceptedBetQueue: {
        [key: number]: {
            amount: number;
        };
    };
    suggestBet: SuggestBet
}

export const initialPlaceBetContext = () => {
    return {
        ownBets: {},
        acceptedBetQueue: {},
        suggestBet: {
            currentBetChoice: "",
            sendOutstandingBet: null,
            suggestBetAmount: 0,
            isInsufficientFunds: null,
        },
    };
};
