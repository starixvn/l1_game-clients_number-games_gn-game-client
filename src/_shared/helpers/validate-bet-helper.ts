import { confirmBet } from "../constants";

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
    gameConfigs,
    userStakeLevel,
    notConfirmOwnBets,
    betChoice,
    amount,
    totalAmount
): { errorCode: string; args?: any } => {
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
        return { errorCode: "SB1910", args: { maxBet: maxBetPerChoice } };
    }

    if (amount > maxBet || totalAmount + amount > maxBet) {
        return { errorCode: "SB1911", args: { maxBet } };
    }
    return { errorCode: "0" };
};
