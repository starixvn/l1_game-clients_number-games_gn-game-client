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
): { errorCode: string; args?: any } => {
    const gameConfigs = gameStateContext.gameConfigs;
    const userStakeLevel = gameStateContext.userStakeLevel;
    const notConfirmOwnBets = gameStateContext.notConfirmOwnBets;
    const ownBets = gameStateContext.ownBets;

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
    const currentAmountOfChoice = (ownBets[betChoice] ?? 0) + (notConfirmOwnBets[betChoice] ?? 0);
    if (amount > maxBetPerChoice || currentAmountOfChoice + amount > maxBetPerChoice) {
        return { errorCode: "SB1910", args: { maxBet: maxBetPerChoice } };
    }

    if (amount > maxBet || totalAmount + amount > maxBet) {
        return { errorCode: "SB1911", args: { maxBet } };
    }
    return { errorCode: "0" };
};

export const getAvailableSuggestBetAmount = (availableUseToBetBalance, gameStateContext: GameStateContextModel<any, any>, betChoice) => {
    const gameConfigs = gameStateContext.gameConfigs;
    const userStakeLevel = gameStateContext.userStakeLevel;

    const roundMaxBet = Math.min(userStakeLevel.maxBet, gameConfigs.maxBet);
    const roundMinBet = Math.max(userStakeLevel.minBet, gameConfigs.minBet);
    const notConfirmOwnBets = gameStateContext.notConfirmOwnBets;
    const ownBets = gameStateContext.ownBets;

    const maxBetPerChoice = Math.min(userStakeLevel.maxBet, gameConfigs.maxBetPerChoices[betChoice]);
    const currentAmountOfChoice = (ownBets[betChoice] ?? 0) + (notConfirmOwnBets[betChoice] ?? 0);
    const maxAvailableAmountOfChoice = maxBetPerChoice - currentAmountOfChoice;

    let suggestAmount = Math.min(availableUseToBetBalance, maxAvailableAmountOfChoice);
    if (roundMinBet < suggestAmount + currentAmountOfChoice && suggestAmount + currentAmountOfChoice > roundMaxBet) {
        return 0;
    }
    return suggestAmount;
};

export const getTotalBetAmount = (gameStateContext: GameStateContextModel<any, any>) => {
    const notConfirmOwnBets = gameStateContext.notConfirmOwnBets;
    const ownBets = gameStateContext.ownBets;
    let totalAmount = 0;
    totalAmount += Object.values(notConfirmOwnBets).reduce((a, b) => a + b, 0);
    totalAmount += Object.values(ownBets).reduce((a, b) => a + b, 0);

    return totalAmount;
};
