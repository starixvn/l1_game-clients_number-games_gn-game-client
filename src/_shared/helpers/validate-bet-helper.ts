import { confirmBet } from "../constants";
import { MessageErrorCode } from "../constants/error-code-dictionary";
import { GameStateContextModel } from "../react-contexts/game-state-context/game-state-context-model";

export const validateHedgeBet = (hedgeBetGroup, ownBets, notConfirmOwnBets, betChoice, amount): boolean => {
    const betTracks = { ...ownBets, ...notConfirmOwnBets };
    betTracks[betChoice] = (betTracks[betChoice] ?? 0) + amount;

    const isInvalid =
        hedgeBetGroup &&
        Object.keys(betTracks).some(
            (betKey) => betTracks[betKey] && hedgeBetGroup.includes(betKey) && hedgeBetGroup.includes(betChoice) && betKey !== betChoice
        );

    return isInvalid;
};

export const getValidateMinMaxBetResult = (
    gameStateContext: GameStateContextModel<any, any>,
    betChoice: string,
    amount: number,
    totalBetAmount: number,
    accountBalance: number
): { errorCode: string; args?: any } => {
    const { gameConfigs, userStakeLevel, notConfirmOwnBets, ownBets } = gameStateContext;
    const maxBet = Math.min(userStakeLevel.maxBet, gameConfigs.maxBet);
    const minBet = Math.max(userStakeLevel.minBet, gameConfigs.minBet);
    const maxBetPerChoice = Math.min(userStakeLevel.maxBet, gameConfigs.maxBetPerChoices[betChoice]);

    let isReachMinBet = amount < minBet;
    if (betChoice === confirmBet) {
        isReachMinBet = totalBetAmount < minBet;
    }

    if (isReachMinBet) {
        return { errorCode: MessageErrorCode.minBetNotice, args: { minBet } };
    }
    const currentAmountOfChoice = (ownBets[betChoice] ?? 0) + (notConfirmOwnBets[betChoice] ?? 0);

    // if (amount > maxBetPerChoice || currentAmountOfChoice + amount > maxBetPerChoice) {
    //     return { errorCode: MessageErrorCode.maxBet, args: { maxBet: maxBetPerChoice } };
    // }

    if (
        amount > maxBetPerChoice ||
        currentAmountOfChoice + amount > maxBetPerChoice ||
        amount > maxBet ||
        totalBetAmount + amount > maxBet ||
        accountBalance < amount
    ) {
        const availableSuggestBet = getAvailableSuggestBetAmount(amount, accountBalance, gameStateContext, betChoice);
        if (availableSuggestBet?.isAvailable) {
            return { errorCode: MessageErrorCode.suggestBet, args: availableSuggestBet };
        }
    }

    // if (amount > maxBet || totalBetAmount + amount > maxBet) {
    //     return { errorCode: MessageErrorCode.roundMaxBet, args: { maxBet } };
    // }

    return { errorCode: MessageErrorCode.validBet };
};

export interface IAvailableSuggestBetAmount {
    amount: number;
    isInsufficientFunds: boolean;
    isAvailable: boolean;
}

const getAvailableSuggestBetAmount = (
    amount: number,
    accountBalance: number,
    { gameConfigs, userStakeLevel, notConfirmOwnBets, ownBets }: GameStateContextModel<unknown, unknown>,
    betChoice: string
): IAvailableSuggestBetAmount => {
    let isInsufficientFunds = false;

    const { minBet, maxBet, maxBetPerChoices } = gameConfigs;
    const { minBet: userMinBet, maxBet: userMaxBet } = userStakeLevel;

    const roundMaxBet = Math.min(userMaxBet, maxBet);
    const roundMinBet = Math.max(userMinBet, minBet);
    const maxBetPerChoice = Math.min(userMaxBet, maxBetPerChoices[betChoice] || Infinity);
    const currentAmountOfChoice = (ownBets[betChoice] || 0) + (notConfirmOwnBets[betChoice] || 0);
    const maxAvailableAmountOfChoice = maxBetPerChoice - currentAmountOfChoice;

    let suggestAmount = Math.min(accountBalance, maxAvailableAmountOfChoice);
    if (accountBalance < amount) {
        isInsufficientFunds = true;
    }

    if (suggestAmount + currentAmountOfChoice < roundMinBet || (suggestAmount + currentAmountOfChoice > roundMaxBet && suggestAmount > 0)) {
        return {
            amount: 0,
            isInsufficientFunds,
            isAvailable: false,
        };
    }

    return {
        amount: suggestAmount || 0,
        isInsufficientFunds,
        isAvailable: suggestAmount > 0,
    };
};

export const getTotalBetAmount = (gameStateContext: GameStateContextModel<any, any>) => {
    const notConfirmOwnBets = gameStateContext.notConfirmOwnBets;
    const ownBets = gameStateContext.ownBets;
    let totalAmount = 0;
    totalAmount += Object.values(notConfirmOwnBets).reduce((a, b) => a + b, 0);
    totalAmount += Object.values(ownBets).reduce((a, b) => a + b, 0);

    return totalAmount;
};
