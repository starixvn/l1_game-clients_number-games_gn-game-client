import { confirmBet } from "../constants";
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
    betChoice,
    amount,
    totalAmount
): { errorCode: string; args?: any; suggestBetAmount?: number } => {
    const gameConfigs = gameStateContext.gameConfigs;
    const userStakeLevel = gameStateContext.userStakeLevel;
    const notConfirmOwnBets = gameStateContext.notConfirmOwnBets;

    const maxBet = Math.min(userStakeLevel.maxBet, gameConfigs.maxBet);
    const minBet = Math.max(userStakeLevel.minBet, gameConfigs.minBet);
    const maxBetPerChoice = Math.min(userStakeLevel.maxBet, gameConfigs.maxBetPerChoices[betChoice]);
    let isReachMinBet = amount < minBet;
    if (betChoice == confirmBet) {
        isReachMinBet = totalAmount < minBet;
    }

    if (isReachMinBet) {
        return { errorCode: "SB1909", args: { minBet } };
    }

    if (amount > maxBetPerChoice || notConfirmOwnBets[betChoice] + amount > maxBetPerChoice) {
        const suggestBetAmount = maxBetPerChoice - notConfirmOwnBets[betChoice];
        return { errorCode: "SB1910", args: { maxBet: maxBetPerChoice }, suggestBetAmount };
    }

    if (amount > maxBet || totalAmount + amount > maxBet) {
        const suggestBetAmount = maxBet - notConfirmOwnBets[betChoice];

        return { errorCode: "SB1911", args: { maxBet }, suggestBetAmount };
    }
    return { errorCode: "0" };
};

export const getSuggestBetAmount = (availableBalance, gameStateContext: GameStateContextModel<any, any>, betChoice) => {
    const gameConfigs = gameStateContext.gameConfigs;
    const userStakeLevel = gameStateContext.userStakeLevel;

    const roundMaxBet = Math.min(userStakeLevel.maxBet, gameConfigs.maxBet);
    const roundMinBet = Math.max(userStakeLevel.minBet, gameConfigs.minBet);

    const maxBetPerChoice = Math.min(userStakeLevel.maxBet, gameConfigs.maxBetPerChoices[betChoice]);
    const currentAmountOfChoice = gameStateContext.notConfirmOwnBets[betChoice] ?? 0;
    const maxAvailableAmountOfChoice = maxBetPerChoice - currentAmountOfChoice;

    const suggestAmount = Math.min(availableBalance, maxAvailableAmountOfChoice);

    if (suggestAmount + currentAmountOfChoice > roundMinBet && suggestAmount + currentAmountOfChoice < roundMaxBet) {
        return suggestAmount;
    }

    return 0;
};

export const getTotalBetAmount = (gameStateContext: GameStateContextModel<any, any>) => {
    const notConfirmOwnBets = gameStateContext.notConfirmOwnBets;
    const ownBets = gameStateContext.ownBets;
    let totalAmount = 0;
    totalAmount += Object.values(notConfirmOwnBets).reduce((a, b) => a + b, 0);
    totalAmount += Object.values(ownBets).reduce((a, b) => a + b, 0);

    return totalAmount;
};
